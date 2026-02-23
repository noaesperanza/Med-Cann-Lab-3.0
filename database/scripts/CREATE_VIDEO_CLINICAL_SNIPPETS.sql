-- =====================================================
-- GRAVAÇÕES CLÍNICAS PONTUAIS (3-5 MINUTOS)
-- =====================================================
-- Gravações sob demanda do médico, com consentimento explícito.
-- Finalidade assistencial, limite de 5 minutos.
-- Data: 06/02/2026
-- Baseado em: Gravação clínica pontual 05/02/2026

-- Drop table se existir (para recriar do zero)
DROP TABLE IF EXISTS public.video_clinical_snippets CASCADE;

-- Criar tabela
CREATE TABLE public.video_clinical_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 300), -- Máximo 5 minutos
  purpose TEXT NOT NULL DEFAULT 'clinical_record',
  consent_snapshot JSONB NOT NULL,
  storage_path TEXT, -- Opcional: caminho para arquivo criptografado (futuro)
  retention_policy TEXT DEFAULT 'medical_record', -- medical_record, research, etc
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_video_clinical_snippets_professional
  ON public.video_clinical_snippets(professional_id);
CREATE INDEX IF NOT EXISTS idx_video_clinical_snippets_patient
  ON public.video_clinical_snippets(patient_id);
CREATE INDEX IF NOT EXISTS idx_video_clinical_snippets_session
  ON public.video_clinical_snippets(session_id);
CREATE INDEX IF NOT EXISTS idx_video_clinical_snippets_started_at
  ON public.video_clinical_snippets(started_at);

-- Habilitar RLS
ALTER TABLE public.video_clinical_snippets ENABLE ROW LEVEL SECURITY;

-- Políticas idempotentes (DROP IF EXISTS antes de criar)
DROP POLICY IF EXISTS "Professional views own clinical snippets" ON public.video_clinical_snippets;
DROP POLICY IF EXISTS "Patient views own clinical snippets" ON public.video_clinical_snippets;
DROP POLICY IF EXISTS "Professional inserts own clinical snippets" ON public.video_clinical_snippets;

-- Profissional: vê e insere apenas seus trechos gravados
CREATE POLICY "Professional views own clinical snippets"
  ON public.video_clinical_snippets FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professional inserts own clinical snippets"
  ON public.video_clinical_snippets FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

-- Paciente: vê apenas trechos em que é o patient_id (registro clínico, transparência)
CREATE POLICY "Patient views own clinical snippets"
  ON public.video_clinical_snippets FOR SELECT
  USING (auth.uid() = patient_id);

-- Comentários
COMMENT ON TABLE public.video_clinical_snippets IS
  'Gravações clínicas pontuais (até 5 minutos) com consentimento explícito do paciente. Finalidade assistencial.';
COMMENT ON COLUMN public.video_clinical_snippets.consent_snapshot IS
  'Snapshot do consentimento específico para gravação (scope, maxDurationMinutes, automaticAnalysis, secondaryUse, etc)';
COMMENT ON COLUMN public.video_clinical_snippets.duration_seconds IS
  'Duração do trecho gravado (máximo 300 segundos = 5 minutos)';
COMMENT ON COLUMN public.video_clinical_snippets.retention_policy IS
  'Política de retenção: medical_record (5-20 anos), research (com novo consentimento), etc';
