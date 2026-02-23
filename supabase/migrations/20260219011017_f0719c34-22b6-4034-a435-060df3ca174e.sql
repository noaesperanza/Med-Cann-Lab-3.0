
-- Corrigir get_my_rooms para incluir salas onde o usuário é participante
-- (não apenas onde criou ou enviou mensagem)

CREATE OR REPLACE FUNCTION public.get_my_rooms()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  RETURN QUERY
  WITH room_stats AS (
    SELECT
      cm.room_id,
      MAX(cm.created_at) AS max_created_at,
      COUNT(*) FILTER (WHERE cm.read_at IS NULL AND cm.sender_id != v_user_id) AS unread
    FROM public.chat_messages cm
    GROUP BY cm.room_id
  )
  SELECT
    cr.id,
    cr.name::TEXT,
    cr.type::TEXT,
    COALESCE(rs.max_created_at, cr.created_at) AS last_message_at,
    COALESCE(rs.unread, 0)::BIGINT AS unread_count
  FROM public.chat_rooms cr
  LEFT JOIN room_stats rs ON cr.id = rs.room_id
  WHERE
    -- Usuário é participante direto (NOVO — garante que pacientes vêem salas do seu canal)
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.room_id = cr.id AND cp.user_id = v_user_id
    )
    OR
    -- Usuário criou a sala
    cr.created_by = v_user_id
    OR
    -- Usuário enviou mensagem na sala (legado)
    EXISTS (
      SELECT 1 FROM public.chat_messages msg
      WHERE msg.room_id = cr.id AND msg.sender_id = v_user_id
    )
  ORDER BY COALESCE(rs.max_created_at, cr.created_at) DESC;
END;
$$;
