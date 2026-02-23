-- remove policies if they exist (to avoid error 42710)
DROP POLICY IF EXISTS "admin_view_all_rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "admin_view_all_participants" ON public.chat_participants;
DROP POLICY IF EXISTS "admin_view_all_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "admin_send_any_message" ON public.chat_messages;

-- 1. CHAT ROOMS: Admin vê todas as salas
CREATE POLICY "admin_view_all_rooms"
ON public.chat_rooms FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND type IN ('admin', 'master')
  )
);

-- 2. CHAT PARTICIPANTS: Admin vê todos os participantes
CREATE POLICY "admin_view_all_participants"
ON public.chat_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND type IN ('admin', 'master')
  )
);

-- 3. CHAT MESSAGES: Admin vê todas as mensagens
CREATE POLICY "admin_view_all_messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND type IN ('admin', 'master')
  )
);

-- Permissão para enviar mensagem como Admin em qualquer sala (Opcional, mas útil)
CREATE POLICY "admin_send_any_message"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND type IN ('admin', 'master')
  )
);
