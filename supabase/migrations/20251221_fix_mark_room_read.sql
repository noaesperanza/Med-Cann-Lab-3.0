-- Função RPC para marcar mensagens como lidas
CREATE OR REPLACE FUNCTION public.mark_room_read(p_room_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualiza apenas mensagens que NÃO foram enviadas pelo usuário atual
  -- e que ainda não foram marcadas como lidas
  UPDATE chat_messages
  SET read_at = now()
  WHERE room_id = p_room_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;
