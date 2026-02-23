/*
  FIX_SCHEDULING_SYSTEM_FULL.sql
  ------------------------------
  Este script é uma SOLUÇÃO COMPLETA.
  Ele garante que:
  1. As Tabelas necessárias existem (se não existirem, serão criadas).
  2. As Funções V3 (get_available_slots, book_appointment) estão corretas.
  3. As Permissões de acesso estão liberadas.

  INSTRUÇÕES:
  1. Copie todo o código abaixo.
  2. Vá no SQL Editor do Supabase.
  3. Cole e clique em RUN.
  4. Teste o agendamento no chat/site.
*/

-- ==============================================================================
-- 1. EXTENSÕES & TABELAS (Garante que a estrutura existe)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: Disponibilidade do Profissional
CREATE TABLE IF NOT EXISTS public.professional_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER DEFAULT 60 CHECK (slot_duration > 0),
    slot_interval_minutes INTEGER, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_availability_rule UNIQUE (professional_id, day_of_week, start_time)
);
-- Habilita RLS se a tabela acabou de ser criada (ou já existe)
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Availability" ON public.professional_availability;
CREATE POLICY "Public Read Availability" ON public.professional_availability FOR SELECT USING (true);

-- Tabela: Bloqueios de Horário
CREATE TABLE IF NOT EXISTS public.time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    reason TEXT DEFAULT 'blocked',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (end_at > start_at)
);
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Blocks" ON public.time_blocks;
CREATE POLICY "Public Read Blocks" ON public.time_blocks FOR SELECT USING (true);

-- Tabela: Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id),
    professional_id UUID REFERENCES auth.users(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    title TEXT,
    description TEXT,
    availability_id UUID REFERENCES public.professional_availability(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appointments_prof_date_status ON public.appointments (professional_id, appointment_date, status);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Políticas para leitura (Paciente e Profissional veem seus próprios agendamentos)
DROP POLICY IF EXISTS "Users view own appointments" ON public.appointments;
CREATE POLICY "Users view own appointments" ON public.appointments 
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = professional_id);

-- Tabela: Log de Auditoria
CREATE TABLE IF NOT EXISTS public.scheduling_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_at TIMESTAMPTZ DEFAULT NOW(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    professional_id UUID,
    start_time TIMESTAMPTZ,
    status TEXT NOT NULL,
    error_message TEXT,
    metadata JSONB
);
ALTER TABLE public.scheduling_audit_log ENABLE ROW LEVEL SECURITY;
-- Permitir Service Role inserir logs
DROP POLICY IF EXISTS "Service Role Full Access" ON public.scheduling_audit_log;
CREATE POLICY "Service Role Full Access" ON public.scheduling_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ==============================================================================
-- 2. FUNÇÕES V3 (Lógica de Negócio)
-- ==============================================================================

-- Função: Buscar Slots Disponíveis
CREATE OR REPLACE FUNCTION public.get_available_slots_v3(
    p_professional_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    slot_start TIMESTAMPTZ,
    slot_end TIMESTAMPTZ,
    rule_id UUID,
    is_available BOOLEAN
) 
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH availability AS (
        SELECT 
            (d + pa.start_time)::TIMESTAMPTZ as base_start,
            (d + pa.end_time)::TIMESTAMPTZ as base_end,
            pa.slot_duration,
            COALESCE(pa.slot_interval_minutes, pa.slot_duration) as effective_interval
        FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d
        JOIN professional_availability pa ON pa.professional_id = p_professional_id
        WHERE pa.day_of_week = EXTRACT(DOW FROM d)::INTEGER 
          AND pa.is_active = true
    ),
    raw_slots AS (
        SELECT 
            generate_series(
                base_start, 
                base_end - (slot_duration || ' minutes')::interval, 
                (effective_interval || ' minutes')::interval
            ) as s_start,
            slot_duration
        FROM availability
    )
    SELECT 
        s_start,
        s_start + (slot_duration || ' minutes')::interval,
        NULL::UUID,
        TRUE
    FROM raw_slots rs
    WHERE NOT EXISTS (
        SELECT 1 FROM time_blocks tb 
        WHERE tb.professional_id = p_professional_id
          AND (tb.start_at, tb.end_at) OVERLAPS (rs.s_start, rs.s_start + (rs.slot_duration || ' minutes')::interval)
    )
    AND NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.professional_id = p_professional_id
          AND a.status IN ('scheduled', 'confirmed')
          AND (a.appointment_date, a.appointment_date + (60 || ' minutes')::interval) OVERLAPS (rs.s_start, rs.s_start + (rs.slot_duration || ' minutes')::interval)
    );
END;
$$;

-- Função: Agendar com Bloqueio (Atômica)
CREATE OR REPLACE FUNCTION public.book_appointment_atomic(
    p_patient_id UUID,
    p_professional_id UUID,
    p_slot_time TIMESTAMPTZ,
    p_appointment_type TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appt_id UUID;
    v_lock_key BIGINT;
    v_conflict_count INTEGER;
    v_slot_utc TIMESTAMPTZ;
BEGIN
    v_slot_utc := p_slot_time AT TIME ZONE 'UTC';
    
    -- Gera Lock Key baseada no ID do profissional e Slot Time (SHA256 -> BigInt)
    v_lock_key := ('x' || substr(encode(digest(p_professional_id::text || v_slot_utc::text, 'sha256'), 'hex'), 1, 16))::bit(64)::bigint;

    -- Tenta adquirir Lock Transacional
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Verifica conflito (Double Booking Check)
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.appointments
    WHERE professional_id = p_professional_id
      AND appointment_date = v_slot_utc
      AND status IN ('scheduled', 'confirmed');

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Slot no longer available (Double Booking Protection)';
    END IF;

    -- Insere Agendamento
    INSERT INTO public.appointments (
        patient_id, professional_id, appointment_date, status, title, description
    ) VALUES (
        p_patient_id, p_professional_id, v_slot_utc, 'scheduled', 'Consulta ' || p_appointment_type, p_notes
    ) RETURNING id INTO v_appt_id;

    -- Log de Auditoria
    INSERT INTO public.scheduling_audit_log (actor_id, action, professional_id, start_time, status)
    VALUES (auth.uid(), 'BOOK_ATTEMPT', p_professional_id, v_slot_utc, 'SUCCESS');

    RETURN v_appt_id;
END;
$$;

-- ==============================================================================
-- 3. PERMISSÕES DE ACESSO (O Pulo do Gato)
-- ==============================================================================

-- Concede permissão para usuários logados executarem as funções
GRANT EXECUTE ON FUNCTION public.get_available_slots_v3 TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_slots_v3 TO service_role;
GRANT EXECUTE ON FUNCTION public.get_available_slots_v3 TO anon;

GRANT EXECUTE ON FUNCTION public.book_appointment_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.book_appointment_atomic TO service_role;

-- Garante acesso básico às tabelas para ver horários
GRANT SELECT ON public.professional_availability TO authenticated;
GRANT SELECT ON public.professional_availability TO anon;
GRANT SELECT ON public.time_blocks TO authenticated;
GRANT SELECT ON public.time_blocks TO anon;
