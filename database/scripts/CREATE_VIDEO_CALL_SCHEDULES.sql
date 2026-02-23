-- =====================================================
-- AGENDAMENTOS DE VIDEOCHAMADAS
-- =====================================================
-- Sistema de agendamento com notificações automáticas
-- Data: 06/02/2026

DROP TABLE IF EXISTS public.video_call_schedules CASCADE;

CREATE TABLE IF NOT EXISTS public.video_call_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE, -- Vinculado a video_call_sessions quando iniciar
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'missed')),
  requested_by TEXT NOT NULL CHECK (requested_by IN ('professional', 'patient')),
  request_message TEXT, -- Mensagem do paciente ao solicitar
  reminder_sent_30min BOOLEAN DEFAULT FALSE,
  reminder_sent_10min BOOLEAN DEFAULT FALSE,
  reminder_sent_1min BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_video_call_schedules_professional
  ON public.video_call_schedules(professional_id);
CREATE INDEX IF NOT EXISTS idx_video_call_schedules_patient
  ON public.video_call_schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_video_call_schedules_scheduled_at
  ON public.video_call_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_video_call_schedules_status
  ON public.video_call_schedules(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_video_call_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_call_schedules_updated_at
  BEFORE UPDATE ON public.video_call_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_video_call_schedules_updated_at();

-- Habilitar RLS
ALTER TABLE public.video_call_schedules ENABLE ROW LEVEL SECURITY;

-- Políticas idempotentes
DROP POLICY IF EXISTS "Professional views own schedules" ON public.video_call_schedules;
DROP POLICY IF EXISTS "Patient views own schedules" ON public.video_call_schedules;
DROP POLICY IF EXISTS "Professional creates schedules" ON public.video_call_schedules;
DROP POLICY IF EXISTS "Patient creates schedules" ON public.video_call_schedules;
DROP POLICY IF EXISTS "Professional updates own schedules" ON public.video_call_schedules;
DROP POLICY IF EXISTS "Patient updates own schedules" ON public.video_call_schedules;

-- Profissional: vê, cria e atualiza seus agendamentos
CREATE POLICY "Professional views own schedules"
  ON public.video_call_schedules FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professional creates schedules"
  ON public.video_call_schedules FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professional updates own schedules"
  ON public.video_call_schedules FOR UPDATE
  USING (auth.uid() = professional_id);

-- Paciente: vê, cria (solicita) e atualiza seus agendamentos
CREATE POLICY "Patient views own schedules"
  ON public.video_call_schedules FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patient creates schedules"
  ON public.video_call_schedules FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patient updates own schedules"
  ON public.video_call_schedules FOR UPDATE
  USING (auth.uid() = patient_id);

-- Comentários
COMMENT ON TABLE public.video_call_schedules IS
  'Agendamentos de videochamadas com sistema de notificações automáticas';
COMMENT ON COLUMN public.video_call_schedules.requested_by IS
  'Quem solicitou: professional (marcou) ou patient (solicitou)';
COMMENT ON COLUMN public.video_call_schedules.request_message IS
  'Mensagem do paciente ao solicitar videochamada (aparece na caixa de mensagens do profissional)';
