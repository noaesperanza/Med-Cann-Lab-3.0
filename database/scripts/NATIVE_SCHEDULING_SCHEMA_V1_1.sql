/*
  MEDCANNLAB SCHEDULING ENGINE V1.1 - SCHEMA MIGRATION
  Status: Enterprise Safe
  Date: 2026-01-29
  
  Objetivos:
  1. Criar tabela de disponibilidade recorrente (professional_availability).
  2. Criar tabela de bloqueios/exceções (time_blocks).
  3. Fortalecer tabela de agendamentos (appointments) com auditoria e status rigoroso.
*/

-- ==============================================================================
-- 1. UTILS & ENUMS (Simulated via Checks for flexibility)
-- ==============================================================================

-- Garantir extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PROFESSIONAL AVAILABILITY (Regras Recorrentes em Fuso da Clínica - Sao_Paulo)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.professional_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 0=Domingo, 1=Segunda, ..., 6=Sábado
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    
    -- Horários (Armazenados como TIME, sem timezone implied, refere-se ao horário de parede da clínica)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Duração padrão do slot em minutos (ex: 60)
    slot_duration INTEGER DEFAULT 60 CHECK (slot_duration > 0),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Evitar regras sobrepostas para o mesmo dia e profissional (simplificado)
    -- Para uma validação perfeita de overlap de ranges seria necessário EXCLUDE constraint com range types,
    -- mas unique composto ajuda na gestão básica.
    CONSTRAINT unique_availability_rule UNIQUE (professional_id, day_of_week, start_time)
);

-- RLS
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profissionais veem sua propria disponibilidade" ON public.professional_availability
    FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Pacientes e sistema podem ler disponibilidade" ON public.professional_availability
    FOR SELECT USING (true); -- Public read para montar a agenda

-- ==============================================================================
-- 3. TIME BLOCKS (Exceções, Feriados, Bloqueios Manuais)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    
    reason TEXT NOT NULL DEFAULT 'blocked', -- 'vacation', 'holiday', 'personal', 'meeting'
    created_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT check_dates CHECK (end_at > start_at)
);

-- RLS
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profissionais gerenciam seus bloqueios" ON public.time_blocks
    FOR ALL USING (auth.uid() = professional_id);

CREATE POLICY "Publico visualiza bloqueios (anonimizado via query, mas permitido select)" ON public.time_blocks
    FOR SELECT USING (true);

-- ==============================================================================
-- 4. APPOINTMENTS HARDENING (Auditoria e Status)
-- ==============================================================================

-- Adicionando colunas de auditoria e controle se não existirem
ALTER TABLE public.appointments 
    ADD COLUMN IF NOT EXISTS availability_id UUID REFERENCES public.professional_availability(id),
    ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS canceled_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ; -- Para status 'completed' real

-- Atualizar/Reforçar Constraint de Status
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check; -- Em caso de nome gerado auto

ALTER TABLE public.appointments 
    ADD CONSTRAINT valid_status_enterprise 
    CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'));

-- Index para performance de busca de conflitos (Fundamental para o Lock)
CREATE INDEX IF NOT EXISTS idx_appointments_prof_time 
    ON public.appointments (professional_id, appointment_date, status);

-- Comentários de Documentação
COMMENT ON TABLE public.professional_availability IS 'Regras semanais recorrentes de atendimento.';
COMMENT ON TABLE public.time_blocks IS 'Bloqueios específicos que subtraem da disponibilidade (Férias, Feriados).';
COMMENT ON COLUMN public.appointments.appointment_date IS 'Sempre em UTC. O front converte para America/Sao_Paulo.';
