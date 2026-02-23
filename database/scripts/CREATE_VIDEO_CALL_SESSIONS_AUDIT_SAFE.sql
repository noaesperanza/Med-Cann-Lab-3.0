-- =====================================================
-- AUDITORIA: SESSÕES DE VIDEOCHAMADA (SEM CONTEÚDO)
-- =====================================================
-- Versão SEGURA: Adiciona colunas se não existirem
-- Data: 06/02/2026

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.video_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  consent_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas se não existirem (para tabelas criadas anteriormente)
DO $$ 
BEGIN
  -- Adicionar started_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_call_sessions' 
    AND column_name = 'started_at'
  ) THEN
    ALTER TABLE public.video_call_sessions 
    ADD COLUMN started_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  -- Adicionar ended_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_call_sessions' 
    AND column_name = 'ended_at'
  ) THEN
    ALTER TABLE public.video_call_sessions 
    ADD COLUMN ended_at TIMESTAMPTZ;
  END IF;

  -- Adicionar duration_seconds se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_call_sessions' 
    AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE public.video_call_sessions 
    ADD COLUMN duration_seconds INTEGER;
  END IF;

  -- Adicionar call_type se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_call_sessions' 
    AND column_name = 'call_type'
  ) THEN
    ALTER TABLE public.video_call_sessions 
    ADD COLUMN call_type TEXT NOT NULL DEFAULT 'video' 
    CHECK (call_type IN ('video', 'audio'));
  END IF;

  -- Adicionar consent_snapshot se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_call_sessions' 
    AND column_name = 'consent_snapshot'
  ) THEN
    ALTER TABLE public.video_call_sessions 
    ADD COLUMN consent_snapshot JSONB;
  END IF;

  -- Adicionar created_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'video_call_sessions' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.video_call_sessions 
    ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_video_call_sessions_professional
  ON public.video_call_sessions(professional_id);
CREATE INDEX IF NOT EXISTS idx_video_call_sessions_patient
  ON public.video_call_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_video_call_sessions_started_at
  ON public.video_call_sessions(started_at);

-- Habilitar RLS
ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas idempotentes (DROP IF EXISTS antes de criar)
DROP POLICY IF EXISTS "Professional views own video call sessions" ON public.video_call_sessions;
DROP POLICY IF EXISTS "Patient views own video call sessions" ON public.video_call_sessions;
DROP POLICY IF EXISTS "Professional inserts own video call sessions" ON public.video_call_sessions;
DROP POLICY IF EXISTS "Professional updates own video call sessions" ON public.video_call_sessions;

-- Profissional: vê e insere/atualiza apenas suas sessões
CREATE POLICY "Professional views own video call sessions"
  ON public.video_call_sessions FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professional inserts own video call sessions"
  ON public.video_call_sessions FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professional updates own video call sessions"
  ON public.video_call_sessions FOR UPDATE
  USING (auth.uid() = professional_id);

-- Paciente: vê apenas sessões em que é o patient_id (integração/transparência)
CREATE POLICY "Patient views own video call sessions"
  ON public.video_call_sessions FOR SELECT
  USING (auth.uid() = patient_id);

-- Comentários
COMMENT ON TABLE public.video_call_sessions IS
  'Auditoria de sessões de videochamada. Sem conteúdo; apenas metadados (quem, quando, duração, tipo).';
COMMENT ON COLUMN public.video_call_sessions.session_id IS
  'ID único da sessão (gerado pelo frontend ou Edge Function)';
COMMENT ON COLUMN public.video_call_sessions.consent_snapshot IS
  'Snapshot do consentimento do paciente em JSONB (scope, timestamp, etc)';
COMMENT ON COLUMN public.video_call_sessions.duration_seconds IS
  'Duração calculada ao encerrar a chamada (ended_at - started_at)';
