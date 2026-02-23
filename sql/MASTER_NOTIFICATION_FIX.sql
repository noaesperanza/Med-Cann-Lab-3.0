-- =====================================================
-- 🚀 MASTER NOTIFICATION FIX: RPC + RLS + SCHEMA
-- =====================================================
-- Este script resolve:
-- 1. Falta da função RPC 'create_video_call_notification'
-- 2. Bloqueio de RLS para notificações entre usuários
-- 3. Inconsistência de colunas (read vs is_read)
-- Data: 19/02/2026
-- =====================================================

-- 1. 🔧 SANEAMENTO DE SCHEMA (read -> is_read)
DO $$
BEGIN
  -- Se ambas existem, remover 'read' (manter apenas 'is_read')
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'is_read') THEN
    UPDATE public.notifications SET is_read = COALESCE("read", false) WHERE is_read IS NULL OR (is_read = false AND "read" = true);
    ALTER TABLE public.notifications DROP COLUMN IF EXISTS "read";
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read') THEN
    ALTER TABLE public.notifications RENAME COLUMN "read" TO "is_read";
  END IF;

  -- Garantir colunas essenciais
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'metadata') THEN
    ALTER TABLE public.notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  ELSE
    ALTER TABLE public.notifications ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'is_read') THEN
    ALTER TABLE public.notifications ALTER COLUMN is_read SET DEFAULT false;
    ALTER TABLE public.notifications ALTER COLUMN is_read SET NOT NULL;
    UPDATE public.notifications SET is_read = false WHERE is_read IS NULL;
  END IF;
END $$;

-- 2. 🔧 RPC: Criar notificação (bypass RLS)
DROP FUNCTION IF EXISTS public.create_video_call_notification(uuid, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.create_video_call_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  v_notification_id := gen_random_uuid();
  
  INSERT INTO public.notifications (
    id, user_id, type, title, message, is_read, metadata
  ) VALUES (
    v_notification_id, p_user_id, 'video_call_request', p_title, p_message, false, p_metadata
  );
  
  RETURN v_notification_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_video_call_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_video_call_notification TO anon;

-- 3. 🔒 FIX RLS: Permissões para Videochamadas
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert video call notifications for others" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Usuários veem apenas suas notificações
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Usuários criam notificações para si mesmos
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PERMITIR que um usuário (Profissional) crie notificação para outro (Paciente) se for videochamada
CREATE POLICY "Users can insert video call notifications for others"
ON public.notifications FOR INSERT WITH CHECK (
  type = 'video_call_request' OR (metadata IS NOT NULL AND metadata ? 'request_id')
);

-- Usuários editam apenas suas notificações (marcar como lida)
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Status: ✅ MASTER FIX APLICADO
-- Instrução: Execute este script total no SQL Editor do Supabase.
