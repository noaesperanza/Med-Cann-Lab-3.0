-- Migration: Create Video Call Quality Logs
-- Description: Stores WebRTC metrics for quality monitoring and watchdog triggers

CREATE TABLE IF NOT EXISTS public.video_call_quality_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid NOT NULL,
  bitrate_kbps integer,
  packet_loss_percentage numeric(5,2),
  latency_ms integer,
  resolution text,
  connection_state text,
  is_watchdog_trigger boolean DEFAULT false,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT video_call_quality_logs_pkey PRIMARY KEY (id),
  CONSTRAINT video_call_quality_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE public.video_call_quality_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own quality logs" 
ON public.video_call_quality_logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own quality logs" 
ON public.video_call_quality_logs FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Gestoes admin podem ver todos os logs
CREATE POLICY "Admins can view all quality logs" 
ON public.video_call_quality_logs FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (type = 'admin' OR type = 'gestor')
  )
);
