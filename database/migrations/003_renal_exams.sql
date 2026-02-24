-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRAÇÃO: Tabela renal_exams
-- MedCannLab 3.0 — Módulo de Função Renal
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Executar no Supabase SQL Editor (https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new)
--
-- Esta migração:
--  1. Cria a tabela renal_exams (se não existir)
--  2. Adiciona colunas de albuminúria (acr, alb_stage) se ausentes
--  3. Habilita RLS
--  4. Cria políticas de segurança
--  5. Cria índices de performance
--  6. Cria view de tendência de eGFR
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. CRIAR TABELA RENAL_EXAMS
CREATE TABLE IF NOT EXISTS public.renal_exams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exam_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    creatinine      NUMERIC(5,2) NOT NULL,             -- mg/dL
    urea            NUMERIC(6,2) DEFAULT 0,             -- mg/dL
    egfr            NUMERIC(5,1) NOT NULL,             -- mL/min/1.73m²
    drc_stage       VARCHAR(5) NOT NULL,                -- G1, G2, G3a, G3b, G4, G5
    acr             NUMERIC(8,2) DEFAULT NULL,          -- mg/g (Albumin-to-Creatinine Ratio)
    alb_stage       VARCHAR(3) DEFAULT NULL,            -- A1, A2, A3
    proteinuria     NUMERIC(6,2) DEFAULT NULL,          -- mg/dL (complementar)
    ai_interpretation TEXT DEFAULT NULL,                 -- Interpretação gerada pela Nôa
    notes           TEXT DEFAULT NULL,                   -- Observações clínicas
    created_by      UUID DEFAULT NULL REFERENCES public.users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADICIONAR COLUNAS DE ALBUMINÚRIA (se tabela já existia sem elas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'renal_exams' AND column_name = 'acr') THEN
        ALTER TABLE public.renal_exams ADD COLUMN acr NUMERIC(8,2) DEFAULT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'renal_exams' AND column_name = 'alb_stage') THEN
        ALTER TABLE public.renal_exams ADD COLUMN alb_stage VARCHAR(3) DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'renal_exams' AND column_name = 'notes') THEN
        ALTER TABLE public.renal_exams ADD COLUMN notes TEXT DEFAULT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'renal_exams' AND column_name = 'ai_interpretation') THEN
        ALTER TABLE public.renal_exams ADD COLUMN ai_interpretation TEXT DEFAULT NULL;
    END IF;
END $$;

-- 3. HABILITAR RLS
ALTER TABLE public.renal_exams ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURANÇA
--    Profissionais podem ver/inserir/atualizar exames dos pacientes vinculados a eles (via owner_id)
--    Pacientes podem ver seus próprios exames

-- Política: Profissionais veem todos os exames (autenticados)
DROP POLICY IF EXISTS "professionals_read_renal_exams" ON public.renal_exams;
CREATE POLICY "professionals_read_renal_exams"
    ON public.renal_exams
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.type IN ('medico', 'profissional', 'admin')
        )
        OR patient_id = auth.uid()
    );

-- Política: Profissionais inserem exames
DROP POLICY IF EXISTS "professionals_insert_renal_exams" ON public.renal_exams;
CREATE POLICY "professionals_insert_renal_exams"
    ON public.renal_exams
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.type IN ('medico', 'profissional', 'admin')
        )
    );

-- Política: Profissionais atualizam exames
DROP POLICY IF EXISTS "professionals_update_renal_exams" ON public.renal_exams;
CREATE POLICY "professionals_update_renal_exams"
    ON public.renal_exams
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.type IN ('medico', 'profissional', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.type IN ('medico', 'profissional', 'admin')
        )
    );

-- 5. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_renal_exams_patient_id ON public.renal_exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_renal_exams_patient_date ON public.renal_exams(patient_id, exam_date DESC);
CREATE INDEX IF NOT EXISTS idx_renal_exams_drc_stage ON public.renal_exams(drc_stage);

-- 6. VIEW DE TENDÊNCIA DE eGFR
CREATE OR REPLACE VIEW public.v_renal_trend AS
SELECT
    re.patient_id,
    u.name AS patient_name,
    re.exam_date,
    re.creatinine,
    re.urea,
    re.egfr,
    re.drc_stage,
    re.acr,
    re.alb_stage,
    -- Cálculo de ΔeGFR em relação ao exame anterior
    re.egfr - LAG(re.egfr) OVER (PARTITION BY re.patient_id ORDER BY re.exam_date) AS delta_egfr,
    -- Intervalo em dias desde o último exame
    re.exam_date - LAG(re.exam_date) OVER (PARTITION BY re.patient_id ORDER BY re.exam_date) AS days_since_last,
    -- Número total de exames do paciente
    COUNT(*) OVER (PARTITION BY re.patient_id) AS total_exams,
    -- Último eGFR do paciente
    FIRST_VALUE(re.egfr) OVER (PARTITION BY re.patient_id ORDER BY re.exam_date DESC) AS latest_egfr,
    FIRST_VALUE(re.drc_stage) OVER (PARTITION BY re.patient_id ORDER BY re.exam_date DESC) AS latest_stage
FROM public.renal_exams re
LEFT JOIN public.users u ON u.id = re.patient_id
ORDER BY re.patient_id, re.exam_date DESC;

-- 7. GRANT para a view
GRANT SELECT ON public.v_renal_trend TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIM DA MIGRAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════════
