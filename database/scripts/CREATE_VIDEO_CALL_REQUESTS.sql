-- Tabela para solicitações de videochamada em tempo real
-- Permite que um usuário solicite videochamada e o outro aceite/recuse
-- Data: 06/02/2026

CREATE TABLE IF NOT EXISTS public.video_call_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE, -- ID único da solicitação
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 seconds'), -- Timeout de 30 segundos
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB, -- Informações adicionais (patientId, roomId, etc)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_video_call_requests_requester ON public.video_call_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_video_call_requests_recipient ON public.video_call_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_video_call_requests_status ON public.video_call_requests(status);
CREATE INDEX IF NOT EXISTS idx_video_call_requests_expires_at ON public.video_call_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_video_call_requests_request_id ON public.video_call_requests(request_id);

-- Habilitar RLS
ALTER TABLE public.video_call_requests ENABLE ROW LEVEL SECURITY;

-- Políticas idempotentes
DROP POLICY IF EXISTS "Users can view own video call requests" ON public.video_call_requests;
DROP POLICY IF EXISTS "Users can create video call requests" ON public.video_call_requests;
DROP POLICY IF EXISTS "Users can update own video call requests" ON public.video_call_requests;
DROP POLICY IF EXISTS "Users can delete own video call requests" ON public.video_call_requests;

-- Usuários podem ver solicitações onde são requester ou recipient
CREATE POLICY "Users can view own video call requests"
  ON public.video_call_requests FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Usuários podem criar solicitações onde são o requester
CREATE POLICY "Users can create video call requests"
  ON public.video_call_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Usuários podem atualizar solicitações onde são requester ou recipient
-- (para aceitar/recusar/cancelar)
CREATE POLICY "Users can update own video call requests"
  ON public.video_call_requests FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Usuários podem deletar suas próprias solicitações
CREATE POLICY "Users can delete own video call requests"
  ON public.video_call_requests FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Função para expirar solicitações automaticamente
CREATE OR REPLACE FUNCTION expire_video_call_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.video_call_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now();
END;
$$;

-- Trigger para limpar solicitações expiradas (opcional, pode ser feito via cron)
-- Comentado porque pode ser feito manualmente ou via Edge Function
-- CREATE TRIGGER trigger_expire_video_call_requests
--   AFTER INSERT ON public.video_call_requests
--   FOR EACH ROW
--   EXECUTE FUNCTION expire_video_call_requests();

-- Comentários
COMMENT ON TABLE public.video_call_requests IS 'Solicitações de videochamada em tempo real com timeout automático';
COMMENT ON COLUMN public.video_call_requests.expires_at IS 'Tempo limite para aceitar a solicitação (padrão: 30 segundos)';
COMMENT ON COLUMN public.video_call_requests.metadata IS 'Metadados adicionais (patientId, roomId, etc)';
