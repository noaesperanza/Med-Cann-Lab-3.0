-- =====================================================
-- 🔒 SELAMENTO RLS — CHAT (ROOMS/PARTICIPANTS/MESSAGES)
-- =====================================================
-- Data: 03/02/2026
-- Objetivo:
-- - Garantir que o chat humano (paciente↔profissional, profissionais, SAC) seja
--   PRIVADO por participação de sala (LGPD/Hospital-grade).
-- - Remover policies permissivas do tipo "ALL true" / "auth.uid() IS NOT NULL".
-- - Preservar capacidade de:
--   - usuário requisitar/criar sala
--   - criador da sala adicionar participantes (ex.: profissional/SAC)
--   - participante enviar/ler mensagens
--
-- IMPORTANTE:
-- - Este script foi escrito para o schema atual do banco:
--   - chat_rooms(id uuid, created_by uuid, type text, ...)
--   - chat_participants(room_id uuid, user_id uuid, ...)
--   - chat_messages(id bigint, room_id uuid, sender_id uuid, message text, ...)
-- - Use "Run" no SQL Editor do Supabase.
-- - Seguro para reexecução (DROP POLICY IF EXISTS).

-- =====================================================
-- Helpers (Admin check)
-- =====================================================
-- NOTA: Mantemos o check inline para não depender de função custom.
-- Admin = users.flag_admin=true OR users.type in ('admin','master')

-- =====================================================
-- 0) Garantir RLS habilitado
-- =====================================================
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1) DROP policies permissivas conhecidas
-- =====================================================
-- chat_rooms
DROP POLICY IF EXISTS "Authenticated can manage chat_rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_insert_policy" ON public.chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_select_policy" ON public.chat_rooms;
DROP POLICY IF EXISTS "admin_view_all_rooms" ON public.chat_rooms;
-- (selamento v1) policies novas — remover para reexecução idempotente
DROP POLICY IF EXISTS "rooms_select_member_or_admin" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_insert_owner" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_update_owner_or_admin" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_delete_owner_or_admin" ON public.chat_rooms;

-- chat_participants
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.chat_participants;
DROP POLICY IF EXISTS "Chat access" ON public.chat_participants;
DROP POLICY IF EXISTS "admin_view_all_participants" ON public.chat_participants;
DROP POLICY IF EXISTS "chat_participants_insert_policy" ON public.chat_participants;
DROP POLICY IF EXISTS "chat_participants_select_policy" ON public.chat_participants;
DROP POLICY IF EXISTS "chat_participants_insert" ON public.chat_participants;
DROP POLICY IF EXISTS "chat_participants_select" ON public.chat_participants;
DROP POLICY IF EXISTS "chat_participants_update" ON public.chat_participants;
DROP POLICY IF EXISTS "chat_participants_delete" ON public.chat_participants;
-- (selamento v1) policies novas — remover para reexecução idempotente
DROP POLICY IF EXISTS "participants_select_room_member_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_insert_self_or_room_owner_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_update_self_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_delete_self_or_room_owner_or_admin" ON public.chat_participants;

-- chat_messages
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated can manage messages" ON public.chat_messages;
DROP POLICY IF EXISTS "admin_send_any_message" ON public.chat_messages;
DROP POLICY IF EXISTS "admin_view_all_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_select_policy" ON public.chat_messages;
-- (selamento v1) policies novas — remover para reexecução idempotente
DROP POLICY IF EXISTS "messages_select_room_member_or_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_insert_sender_is_member" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_update_sender_or_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_delete_sender_or_admin" ON public.chat_messages;
-- (selamento v1) policies opcionais — fórum/debate legado
DROP POLICY IF EXISTS "messages_select_forum_thread_non_patient" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_insert_forum_thread_non_patient" ON public.chat_messages;

-- =====================================================
-- 2) Policies SELADAS — chat_rooms
-- =====================================================
-- SELECT: usuário vê sala se for participante OU se for admin
CREATE POLICY "rooms_select_member_or_admin" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_participants p
      WHERE p.room_id = chat_rooms.id
        AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- INSERT: usuário autenticado pode criar sala, mas created_by deve ser ele mesmo
CREATE POLICY "rooms_insert_owner" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE: somente dono da sala OU admin
CREATE POLICY "rooms_update_owner_or_admin" ON public.chat_rooms
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- DELETE: somente dono da sala OU admin
CREATE POLICY "rooms_delete_owner_or_admin" ON public.chat_rooms
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- =====================================================
-- 3) Policies SELADAS — chat_participants
-- =====================================================
-- SELECT: participante vê participantes da própria sala; admin vê tudo
CREATE POLICY "participants_select_room_member_or_admin" ON public.chat_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_participants self
      WHERE self.room_id = chat_participants.room_id
        AND self.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- INSERT:
-- - usuário pode inserir a si mesmo como participante
-- - OU o criador da sala pode adicionar participantes (para viabilizar "requisitar sala com profissional/SAC")
-- - OU admin
CREATE POLICY "participants_insert_self_or_room_owner_or_admin" ON public.chat_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.chat_rooms r
      WHERE r.id = chat_participants.room_id
        AND r.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- UPDATE:
-- permitir apenas atualizar o próprio vínculo (ex.: last_seen_at),
-- ou admin.
CREATE POLICY "participants_update_self_or_admin" ON public.chat_participants
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- DELETE:
-- - usuário pode sair da sala (remover a si mesmo)
-- - criador da sala pode remover participantes (moderação básica)
-- - admin
CREATE POLICY "participants_delete_self_or_room_owner_or_admin" ON public.chat_participants
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.chat_rooms r
      WHERE r.id = chat_participants.room_id
        AND r.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- =====================================================
-- 4) Policies SELADAS — chat_messages
-- =====================================================
-- SELECT: apenas participantes da sala; admin vê tudo
CREATE POLICY "messages_select_room_member_or_admin" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_participants p
      WHERE p.room_id = chat_messages.room_id
        AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- INSERT: somente participante pode enviar; sender_id deve ser o próprio usuário
CREATE POLICY "messages_insert_sender_is_member" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.chat_participants p
      WHERE p.room_id = chat_messages.room_id
        AND p.user_id = auth.uid()
    )
  );

-- UPDATE: somente o autor da mensagem (sender_id) ou admin
-- OBS: se você quiser "imutabilidade de mensagem", troque UPDATE por FALSE.
CREATE POLICY "messages_update_sender_or_admin" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  )
  WITH CHECK (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- DELETE: somente o autor (sender) ou admin
CREATE POLICY "messages_delete_sender_or_admin" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- =====================================================
-- 4b) Compatibilidade opcional — "chat_id" (Fórum/Debate legado)
-- =====================================================
-- Alguns módulos antigos usam `chat_messages.chat_id` (thread) ao invés de `room_id`.
-- Para não quebrar o app caso essa coluna exista no banco, criamos policies adicionais
-- (somente NÃO-PACIENTES) condicionadas à existência da coluna.
DO $$
DECLARE
  has_chat_id boolean;
  has_forum_posts boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chat_messages'
      AND column_name = 'chat_id'
  ) INTO has_chat_id;

  SELECT to_regclass('public.forum_posts') IS NOT NULL INTO has_forum_posts;

  IF has_chat_id AND has_forum_posts THEN
    -- Policies extras (namespaced) para thread de fórum
    DROP POLICY IF EXISTS "messages_select_forum_thread_non_patient" ON public.chat_messages;
    DROP POLICY IF EXISTS "messages_insert_forum_thread_non_patient" ON public.chat_messages;

    EXECUTE $POL$
      CREATE POLICY "messages_select_forum_thread_non_patient" ON public.chat_messages
        FOR SELECT TO authenticated
        USING (
          -- Admin sempre pode
          EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
          OR (
            -- Não-paciente pode ler mensagens vinculadas a um post ativo
            EXISTS (
              SELECT 1
              FROM public.users u
              WHERE u.id = auth.uid()
                AND (u.type)::text NOT IN ('patient','paciente')
            )
            AND EXISTS (
              SELECT 1
              FROM public.forum_posts fp
              WHERE fp.id = chat_messages.chat_id
                AND fp.is_active = true
            )
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "messages_insert_forum_thread_non_patient" ON public.chat_messages
        FOR INSERT TO authenticated
        WITH CHECK (
          sender_id = auth.uid()
          AND EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.type)::text NOT IN ('patient','paciente')
          )
          AND EXISTS (
            SELECT 1
            FROM public.forum_posts fp
            WHERE fp.id = chat_messages.chat_id
              AND fp.is_active = true
          )
        )
    $POL$;
  END IF;
END $$;

-- =====================================================
-- 5) Observabilidade (opcional): listar policies aplicadas
-- =====================================================
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('chat_rooms','chat_participants','chat_messages')
-- ORDER BY tablename, policyname;

