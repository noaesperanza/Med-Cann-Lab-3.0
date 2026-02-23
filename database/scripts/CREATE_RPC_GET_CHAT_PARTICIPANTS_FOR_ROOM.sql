-- =====================================================
-- 🔧 CREATE: RPC Function get_chat_participants_for_room
-- =====================================================
-- Função para buscar participantes de uma sala de chat
-- Usada pelo AdminChat e PatientDoctorChat
-- Data: 06/02/2026

-- Remover função existente se houver (para permitir mudança de tipo de retorno)
DROP FUNCTION IF EXISTS public.get_chat_participants_for_room(uuid);

CREATE OR REPLACE FUNCTION public.get_chat_participants_for_room(p_room_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.name, au.raw_user_meta_data->>'name', au.email)::text as name,
    COALESCE(u.email, au.email)::text as email,
    cp.role::text
  FROM public.chat_participants cp
  INNER JOIN auth.users au ON au.id = cp.user_id
  LEFT JOIN public.users u ON u.id = cp.user_id
  WHERE cp.room_id = p_room_id
  ORDER BY cp.role, u.name NULLS LAST, au.email;
END;
$$;

-- Comentários
COMMENT ON FUNCTION public.get_chat_participants_for_room(uuid) IS 
'Retorna participantes de uma sala de chat com informações do usuário. Usa SECURITY DEFINER para bypass RLS.';
