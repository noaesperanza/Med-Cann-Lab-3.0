-- =====================================================
-- 🛠️ FIX: Recursão infinita em RLS (chat_participants)
-- =====================================================
-- Erro observado no frontend:
--   code: 42P17  message: 'infinite recursion detected in policy for relation "chat_participants"'
--
-- Causa típica:
--   Policy de SELECT em public.chat_participants referencia a própria tabela
--   (ex.: EXISTS (SELECT ... FROM public.chat_participants self ...)),
--   o que dispara recursão no planejador.
--
-- Estratégia do fix:
--   - Criar função SECURITY DEFINER que verifica membership com row_security = off
--   - Recriar policies usando a função (sem auto-referência)
--
-- Seguro para reexecução (DROP IF EXISTS).
-- Data: 06/02/2026

set search_path = public;

-- =====================================================
-- 0) Garantir RLS habilitado (não muda nada se já estiver)
-- =====================================================
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1) Funções helper (SECURITY DEFINER)
-- =====================================================
-- Nota: usamos row_security=off para a função conseguir consultar a tabela
-- sem disparar RLS (evitando recursão).
CREATE OR REPLACE FUNCTION public.is_chat_room_member(_room_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants p
    WHERE p.room_id = _room_id
      AND p.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = _user_id
      AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
  );
$$;

-- =====================================================
-- 2) Recriar policies de chat_participants (sem recursão)
-- =====================================================
-- Remover policy problemática (nomes do selamento + hardening)
DROP POLICY IF EXISTS "participants_select_room_member_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_insert_self_or_room_owner_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_update_self_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_delete_self_or_room_owner_or_admin" ON public.chat_participants;

DROP POLICY IF EXISTS chat_participants_select ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_insert ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_update ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_delete ON public.chat_participants;

-- SELECT:
-- - usuário vê participantes de uma sala se ELE MESMO é membro daquela sala
-- - admin vê tudo
CREATE POLICY "participants_select_room_member_or_admin" ON public.chat_participants
  FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR public.is_chat_room_member(chat_participants.room_id, auth.uid())
  );

-- INSERT:
-- - usuário pode inserir a si mesmo
-- - ou o criador da sala pode adicionar participantes
-- - ou admin
CREATE POLICY "participants_insert_self_or_room_owner_or_admin" ON public.chat_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1
      FROM public.chat_rooms r
      WHERE r.id = chat_participants.room_id
        AND r.created_by = auth.uid()
    )
  );

-- UPDATE:
-- - apenas o próprio vínculo (ex.: last_seen_at)
-- - ou admin
CREATE POLICY "participants_update_self_or_admin" ON public.chat_participants
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin_user()
  );

-- DELETE:
-- - usuário pode remover a si mesmo (sair)
-- - criador da sala pode remover participantes
-- - admin
CREATE POLICY "participants_delete_self_or_room_owner_or_admin" ON public.chat_participants
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1
      FROM public.chat_rooms r
      WHERE r.id = chat_participants.room_id
        AND r.created_by = auth.uid()
    )
  );

-- =====================================================
-- 3) Ajustar policies de chat_rooms (completas)
-- =====================================================
-- SELECT: usuário vê sala se for participante OU se for admin
DROP POLICY IF EXISTS "rooms_select_member_or_admin" ON public.chat_rooms;
CREATE POLICY "rooms_select_member_or_admin" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR public.is_chat_room_member(chat_rooms.id, auth.uid())
  );

-- INSERT: usuário autenticado pode criar sala, mas created_by deve ser ele mesmo
DROP POLICY IF EXISTS "rooms_insert_owner" ON public.chat_rooms;
CREATE POLICY "rooms_insert_owner" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE: somente dono da sala OU admin
DROP POLICY IF EXISTS "rooms_update_owner_or_admin" ON public.chat_rooms;
CREATE POLICY "rooms_update_owner_or_admin" ON public.chat_rooms
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_admin_user()
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.is_admin_user()
  );

-- DELETE: somente dono da sala OU admin
DROP POLICY IF EXISTS "rooms_delete_owner_or_admin" ON public.chat_rooms;
CREATE POLICY "rooms_delete_owner_or_admin" ON public.chat_rooms
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_admin_user()
  );

-- =====================================================
-- 4) Ajustar policies de chat_messages (completas)
-- =====================================================
-- SELECT: apenas participantes da sala; admin vê tudo
DROP POLICY IF EXISTS "messages_select_room_member_or_admin" ON public.chat_messages;
CREATE POLICY "messages_select_room_member_or_admin" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR public.is_chat_room_member(chat_messages.room_id, auth.uid())
  );

-- INSERT: somente participante pode enviar; sender_id deve ser o próprio usuário
DROP POLICY IF EXISTS "messages_insert_sender_is_member" ON public.chat_messages;
CREATE POLICY "messages_insert_sender_is_member" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_chat_room_member(chat_messages.room_id, auth.uid())
  );

-- UPDATE: somente o autor da mensagem (sender_id) ou admin
DROP POLICY IF EXISTS "messages_update_sender_or_admin" ON public.chat_messages;
CREATE POLICY "messages_update_sender_or_admin" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (
    sender_id = auth.uid()
    OR public.is_admin_user()
  )
  WITH CHECK (
    sender_id = auth.uid()
    OR public.is_admin_user()
  );

-- DELETE: somente o autor (sender) ou admin
DROP POLICY IF EXISTS "messages_delete_sender_or_admin" ON public.chat_messages;
CREATE POLICY "messages_delete_sender_or_admin" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (
    sender_id = auth.uid()
    OR public.is_admin_user()
  );

