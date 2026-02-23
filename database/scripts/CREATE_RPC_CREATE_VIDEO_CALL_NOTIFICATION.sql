-- =====================================================
-- 🔧 RPC: Criar notificação de videochamada (bypass RLS)
-- =====================================================
-- Cria uma função RPC com SECURITY DEFINER para criar notificações
-- de videochamada sem problemas de RLS
-- Data: 06/02/2026

-- Remover função existente se houver
DROP FUNCTION IF EXISTS public.create_video_call_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_metadata jsonb
);

-- Criar função RPC
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
  -- Gerar ID explicitamente para garantir que não seja null
  v_notification_id := gen_random_uuid();
  
  -- Inserir notificação (bypass RLS com SECURITY DEFINER)
  INSERT INTO public.notifications (
    id,
    user_id,
    type,
    title,
    message,
    is_read,
    metadata
  ) VALUES (
    v_notification_id,
    p_user_id,
    'video_call_request',
    p_title,
    p_message,
    false,
    p_metadata
  );
  
  RETURN v_notification_id;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.create_video_call_notification IS 
  'Cria uma notificação de videochamada para um usuário. Bypass RLS usando SECURITY DEFINER.';

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.create_video_call_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_video_call_notification TO anon;

-- Status: ✅ Função RPC criada
-- Uso: SELECT create_video_call_notification(user_id, title, message, metadata);
