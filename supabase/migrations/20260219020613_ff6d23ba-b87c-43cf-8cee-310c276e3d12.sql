CREATE OR REPLACE FUNCTION public.get_my_rooms()
 RETURNS TABLE(id uuid, name text, type text, last_message_at timestamp with time zone, unread_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Usuário é participante direto na sala
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.room_id = cr.id AND cp.user_id = v_user_id
    )
  ORDER BY COALESCE(rs.max_created_at, cr.created_at) DESC;
END;
$function$;