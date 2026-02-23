-- =====================================================
-- GRAVAÇÕES CLÍNICAS PONTUAIS (3-5 MINUTOS)
-- =====================================================
-- Versão SEGURA: Adiciona colunas se não existirem
-- Data: 06/02/2026

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.video_clinical_snippets (
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

-- Adicionar colunas se não existirem (para tabelas criadas anteriormente)
DO $$ 
BEGIN
  -- Adicionar started_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'started_at'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN started_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  -- Adicionar ended_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'ended_at'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN ended_at TIMESTAMPTZ;
  END IF;

  -- Adicionar duration_seconds se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 0 
    CHECK (duration_seconds <= 300);
  END IF;

  -- Adicionar purpose se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'purpose'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN purpose TEXT NOT NULL DEFAULT 'clinical_record';
  END IF;

  -- Adicionar consent_snapshot se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'consent_snapshot'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN consent_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  -- Adicionar storage_path se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN storage_path TEXT;
  END IF;

  -- Adicionar retention_policy se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'retention_policy'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN retention_policy TEXT DEFAULT 'medical_record';
  END IF;

  -- Adicionar created_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_clinical_snippets' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.video_clinical_snippets 
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

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
