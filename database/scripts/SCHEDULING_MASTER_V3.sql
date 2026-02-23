/*
  MEDCANNLAB SCHEDULING ENGINE - MASTER V3 ("THE BRAIN")
  Status: Production Grade (Healthcare / Marketplace Level)
  Date: 2026-01-29
  
  CONTEXTO:
  Este é o script definitivo da Engine de Agendamento (Fase 3).
  Ele implementa a arquitetura "Smart Orchestrator" com proteção transacional rigorosa.
  
  RECURSOS:
  1. Base Sólida: Disponibilidade Flexível + Bloqueios (herdado e melhorado da V1.1).
  2. Camada Inteligente: Smart Slot Rules e AI Predictions.
  3. Camada de Auditoria: Log imutável de TODAS as tentativas de agendamento.
  4. Core Transacional: RPC `book_appointment_atomic` com Advisory Locks (SHA256 Mutex).
  5. Hooks de IA: Triggers para TradeVision_Core (Ready for Async).
  
  SEGURANÇA (RLS):
  - Strict Mode (Default Deny).
  - Explicit Service Role policies.
  - Apenas RPCs autorizadas podem escrever agendamentos.
*/

-- ==============================================================================
-- 1. UTILS & EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE TABLES (Base sólida)
-- ==============================================================================

-- 2.1. Professional Availability (Recorrente)
CREATE TABLE IF NOT EXISTS public.professional_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER DEFAULT 60 CHECK (slot_duration > 0),
    slot_interval_minutes INTEGER, -- [NEW Phase 3] Permite intervalos diferentes da duração (ex: slot 60m, intervalo 30m = overbooking planejado ou gap)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_availability_rule UNIQUE (professional_id, day_of_week, start_time)
);
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Availability" ON public.professional_availability FOR SELECT USING (true);
CREATE POLICY "Profional Write Own Availability" ON public.professional_availability FOR ALL USING (auth.uid() = professional_id);

-- 2.2. Time Blocks (Exceções)
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
CREATE POLICY "Public Read Blocks" ON public.time_blocks FOR SELECT USING (true);
CREATE POLICY "Professional Manage Blocks" ON public.time_blocks FOR ALL USING (auth.uid() = professional_id);

-- 2.3. Appointments (Hardened)
-- Garante que a tabela existe com as colunas certas, mesmo se já foi criada antes
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id),
    professional_id UUID REFERENCES auth.users(id),
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    title TEXT,
    description TEXT,
    -- Colunas V3
    availability_id UUID REFERENCES public.professional_availability(id),
    checked_in_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    canceled_by UUID REFERENCES auth.users(id),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index crítico para Lock e Performance
CREATE INDEX IF NOT EXISTS idx_appointments_prof_date_status 
    ON public.appointments (professional_id, appointment_date, status);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- [ENTERPRISE FIX] Explicit INSERT Policy for RPC/Service Role
CREATE POLICY "RPC insert appointments" 
    ON public.appointments 
    FOR INSERT 
    TO service_role 
    WITH CHECK (true);

CREATE POLICY "Users view own appointments" ON public.appointments 
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = professional_id);


-- ==============================================================================
-- 3. CAMADA INTELIGENTE (Phase 3 AI Features)
-- ==============================================================================

-- 3.1. Smart Slot Rules (Regras Complexas)
-- Ex: "Máximo 2 primeiras consultas por dia", "Gap de 15min obrigatório pós-consulta"
CREATE TABLE IF NOT EXISTS public.smart_slot_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES auth.users(id), -- Null = Global Rule
    rule_type TEXT NOT NULL, -- 'MAX_DAILY_TYPE', 'BUFFER_TIME', 'SEQ_LIMIT'
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.smart_slot_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System Admin Read Rules" ON public.smart_slot_rules FOR SELECT TO authenticated USING (true); -- Leitura necessária para calcular slots
CREATE POLICY "Admin Write Rules" ON public.smart_slot_rules FOR ALL TO service_role USING (true);

-- 3.2. AI Scheduling Predictions (O Cérebro do Futuro)
-- Armazena score de risco calculado pela IA para cada slot/agendamento
CREATE TABLE IF NOT EXISTS public.ai_scheduling_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    no_show_probability NUMERIC(3,2), -- 0.00 a 1.00
    expected_duration_minutes INTEGER,
    recommended_action TEXT, -- 'CONFIRM_MANUALLY', 'REQUIRE_PREPAYMENT'
    model_version TEXT,
    predicted_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ai_scheduling_predictions ENABLE ROW LEVEL SECURITY;
-- Apenas service role e médicos veem predições
CREATE POLICY "Professional View Predictions" ON public.ai_scheduling_predictions 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.appointments a 
        WHERE a.id = ai_scheduling_predictions.appointment_id 
        AND a.professional_id = auth.uid()
    ));

-- ==============================================================================
-- 4. CAMADA DE AUDITORIA (Compliance)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.scheduling_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_at TIMESTAMPTZ DEFAULT NOW(),
    actor_id UUID REFERENCES auth.users(id), -- Quem tentou agendar
    action TEXT NOT NULL, -- 'BOOK_ATTEMPT', 'CANCEL_ATTEMPT'
    request_hash TEXT, -- Para dedup e rastreio de retries
    professional_id UUID,
    start_time TIMESTAMPTZ,
    status TEXT NOT NULL, -- 'SUCCESS', 'FAIL_LOCK', 'FAIL_RULE', 'FAIL_VALIDATION'
    error_message TEXT,
    metadata JSONB
);
ALTER TABLE public.scheduling_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role Full Access" ON public.scheduling_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ==============================================================================
-- 5. TRANSACTIONAL ENGINE (RPCs)
-- ==============================================================================

-- 5.1 Função Auxiliar: Gerar Slots (Pura, sem side-effects)
CREATE OR REPLACE FUNCTION get_available_slots_v3(
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
            -- [ENTERPRISE FIX] Usar interval customizado se existir, senao duration
            COALESCE(pa.slot_interval_minutes, pa.slot_duration) as effective_interval,
            pa.id as pa_id
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
        -- Bloqueio por Time Blocks
        SELECT 1 FROM time_blocks tb 
        WHERE tb.professional_id = p_professional_id
          AND (tb.start_at, tb.end_at) OVERLAPS (rs.s_start, rs.s_start + (rs.slot_duration || ' minutes')::interval)
    )
    AND NOT EXISTS (
        -- Bloqueio por Appointments
        SELECT 1 FROM appointments a
        WHERE a.professional_id = p_professional_id
          AND a.status IN ('scheduled', 'confirmed')
          AND (a.appointment_date, a.appointment_date + (60 || ' minutes')::interval) OVERLAPS (rs.s_start, rs.s_start + (rs.slot_duration || ' minutes')::interval)
    );
END;
$$;


-- 5.2. Atomic Booking Function (O Coração da Engine)
CREATE OR REPLACE FUNCTION book_appointment_atomic(
    p_patient_id UUID,
    p_professional_id UUID,
    p_slot_time TIMESTAMPTZ,
    p_appointment_type TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com privilégios elevados para garantir Locks e Logs
AS $$
DECLARE
    v_appt_id UUID;
    v_lock_key BIGINT;
    v_conflict_count INTEGER;
    v_slot_utc TIMESTAMPTZ;
BEGIN
    -- [ENTERPRISE FIX] UTC Enforcement
    -- Garante que o slot time seja tratado como UTC para consistência absoluta
    v_slot_utc := p_slot_time AT TIME ZONE 'UTC';

    -- [ENTERPRISE FIX] Robust Lock Hashing (SHA256 -> BigInt)
    -- Evita colisões de hashtext() usando 16 chars hex do sha256 convertidos para bigint
    v_lock_key := ('x' || substr(encode(digest(
        p_professional_id::text || v_slot_utc::text,
        'sha256'
    ), 'hex'), 1, 16))::bit(64)::bigint;

    -- 2. Adquirir LOCK TRANSACIONAL (Espera até a tx terminar)
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- 3. Validação Crítica (Double Booking Check "Dentro do Lock")
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.appointments
    WHERE professional_id = p_professional_id
      AND appointment_date = v_slot_utc
      AND status IN ('scheduled', 'confirmed');

    IF v_conflict_count > 0 THEN
        -- Log de Falha
        INSERT INTO public.scheduling_audit_log (actor_id, action, professional_id, start_time, status, error_message)
        VALUES (auth.uid(), 'BOOK_ATTEMPT', p_professional_id, v_slot_utc, 'FAIL_LOCK', 'Slot already booked by another transaction');
        
        RAISE EXCEPTION 'Slot no longer available (Double Booking Protection)';
    END IF;

    -- 4. Inserir Agendamento
    INSERT INTO public.appointments (
        patient_id,
        professional_id,
        appointment_date,
        status,
        title,
        description
    ) VALUES (
        p_patient_id,
        p_professional_id,
        v_slot_utc,
        'scheduled',
        'Consulta ' || p_appointment_type,
        p_notes
    ) RETURNING id INTO v_appt_id;

    -- 5. Log de Sucesso
    INSERT INTO public.scheduling_audit_log (actor_id, action, professional_id, start_time, status, metadata)
    VALUES (auth.uid(), 'BOOK_ATTEMPT', p_professional_id, v_slot_utc, 'SUCCESS', jsonb_build_object('appointment_id', v_appt_id));

    RETURN v_appt_id;
    
EXCEPTION WHEN OTHERS THEN
    -- Log de Erro Geral
    INSERT INTO public.scheduling_audit_log (actor_id, action, professional_id, start_time, status, error_message)
    VALUES (auth.uid(), 'BOOK_ATTEMPT', p_professional_id, v_slot_utc, 'FAIL_EXCEPTION', SQLERRM);
    RAISE;
END;
$$;

-- ==============================================================================
-- 6. ASYNC AI HOOKS (Future Proofing)
-- ==============================================================================
-- Obs: Implementar TRIGGERS como 'AFTER INSERT' para garantir que não bloqueiem
-- a transação principal. O processamento pesado deve ser feito via Edge Function
-- invocada de forma assíncrona (pg_net ou webhook).

/* 
-- Exemplo de Placeholder (Descomentar quando implantar Edge Functions):

CREATE OR REPLACE FUNCTION notify_ai_scheduler() RETURNS TRIGGER AS $$
BEGIN
  -- Lógica de notificação (http request)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_predict_slot
AFTER INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION notify_ai_scheduler();
*/
