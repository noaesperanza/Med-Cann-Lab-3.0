-- SOLUÇÃO COMPLETA E SEGURA PARA O CHAT --
-- Versão corrigida com DROP FUNCTION explícito para evitar erro 42P13

-- 1. CORREÇÃO DA INBOX (get_my_rooms)
DROP FUNCTION IF EXISTS public.get_my_rooms(uuid);
DROP FUNCTION IF EXISTS public.get_my_rooms();

CREATE OR REPLACE FUNCTION public.get_my_rooms()
RETURNS TABLE (
    id uuid,
    name text,
    type text,
    last_message_at timestamptz,
    unread_count bigint
) AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

    RETURN QUERY
    WITH room_stats AS (
        SELECT 
            cm.room_id,
            MAX(cm.created_at) as max_created_at,
            COUNT(*) FILTER (WHERE cm.read_at IS NULL AND cm.sender_id != v_user_id) as unread
        FROM 
            public.chat_messages cm
        GROUP BY 
            cm.room_id
    )
    SELECT 
        cr.id,
        cr.name,
        cr.type,
        COALESCE(rs.max_created_at, cr.created_at) as last_message_at,
        COALESCE(rs.unread, 0) as unread_count
    FROM 
        public.chat_rooms cr
    LEFT JOIN 
        room_stats rs ON cr.id = rs.room_id
    WHERE 
        cr.created_by = v_user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.chat_messages msg WHERE msg.room_id = cr.id AND msg.sender_id = v_user_id
        )
    ORDER BY 
        COALESCE(rs.max_created_at, cr.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. CORREÇÃO DA LEITURA (mark_room_read)
-- Importante: DROP antes de recriar para evitar erro de tipo de retorno
DROP FUNCTION IF EXISTS public.mark_room_read(uuid);

CREATE OR REPLACE FUNCTION public.mark_room_read(p_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tenta atualizar usando sender_id (padrão atual)
  -- Se funcionar, ótimo. Se column sender_id not exist, o script falhará aqui.
  -- Mas já confirmamos que sender_id existe.
  UPDATE chat_messages
  SET read_at = now()
  WHERE room_id = p_room_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;

-- 3. GARANTIR PERMISSÕES
GRANT EXECUTE ON FUNCTION public.get_my_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_room_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_rooms() TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_room_read(uuid) TO service_role;
