-- =====================================================
-- AUDITORIA: SESSÕES DE VIDEOCHAMADA (SEM CONTEÚDO)
-- =====================================================
-- Selagem jurídica: quem, quando, duração, tipo.
-- Nenhum conteúdo de áudio/vídeo é armazenado.
-- Data: 06/02/2026
-- Baseado em: Checklist Videochamada 05/02/2026

-- Drop table se existir (para recriar do zero)
DROP TABLE IF EXISTS public.video_call_sessions CASCADE;

-- Criar tabela
CREATE TABLE public.video_call_sessions (
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
