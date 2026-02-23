-- =====================================================
-- 🔍 VERIFICAR POLICIES DE CHAT ATUAIS
-- =====================================================
-- Execute este script ANTES de rodar o FIX para ver
-- o estado atual das policies no banco.
-- Data: 06/02/2026

-- =====================================================
-- 1) Listar TODAS as policies de chat_rooms
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation, -- SELECT, INSERT, UPDATE, DELETE
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_rooms'
ORDER BY policyname;

-- =====================================================
-- 2) Listar TODAS as policies de chat_participants
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_participants'
ORDER BY policyname;

-- =====================================================
-- 3) Listar TODAS as policies de chat_messages
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_messages'
ORDER BY policyname;

-- =====================================================
-- 4) Verificar se RLS está habilitado
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('chat_rooms', 'chat_participants', 'chat_messages')
ORDER BY tablename;

-- =====================================================
-- 5) Verificar funções helper (se existem)
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_chat_room_member', 'is_admin_user')
ORDER BY routine_name;

-- =====================================================
-- 6) RESUMO: Contar policies por tabela
-- =====================================================
SELECT 
  tablename,
  COUNT(*) AS total_policies,
  COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) AS select_policies,
  COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) AS insert_policies,
  COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) AS update_policies,
  COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) AS delete_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('chat_rooms', 'chat_participants', 'chat_messages')
GROUP BY tablename
ORDER BY tablename;
