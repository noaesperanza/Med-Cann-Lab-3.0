-- ============================================================================
-- OTIMIZAÇÃO DE PERFORMANCE DO CHAT
-- Data: 2025-12-23
-- Descrição: Cria função RPC para buscar salas do usuário de forma eficiente,
-- evitando carregar todas as salas do banco (que causa travamento).
-- ============================================================================

CREATE OR REPLACE FUNCTION get_my_rooms()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.name,
    cr.type,
    cr.last_message_at,
    (
        SELECT COUNT(*)::BIGINT 
        FROM chat_messages cm 
        WHERE cm.room_id = cr.id 
        AND (cm.read_at IS NULL OR cm.read_at < cm.created_at)
        AND cm.sender_id != auth.uid() 
    ) as unread_count
  FROM chat_rooms cr
  WHERE EXISTS (
    SELECT 1 FROM chat_participants cp
    WHERE cp.room_id = cr.id
    AND cp.user_id = auth.uid()
  )
  ORDER BY cr.last_message_at DESC NULLS LAST, cr.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_rooms() TO anon;
