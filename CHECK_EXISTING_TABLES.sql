-- Verificar tabelas existentes no Supabase
-- Execute este script no Supabase SQL Editor

-- 1. Listar todas as tabelas no schema public
SELECT 
  schemaname,
  tablename,
  tableowner,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar tabelas do sistema Supabase
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname IN ('auth', 'storage', 'realtime')
ORDER BY schemaname, tablename;

-- 3. Verificar se as tabelas que estamos tentando usar existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'usuarios' AND schemaname = 'public') 
    THEN 'usuarios: ✅ EXISTE'
    ELSE 'usuarios: ❌ NÃO EXISTE'
  END as usuarios_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') 
    THEN 'notifications: ✅ EXISTE'
    ELSE 'notifications: ❌ NÃO EXISTE'
  END as notifications_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_messages' AND schemaname = 'public') 
    THEN 'chat_messages: ✅ EXISTE'
    ELSE 'chat_messages: ❌ NÃO EXISTE'
  END as chat_messages_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') 
    THEN 'profiles: ✅ EXISTE'
    ELSE 'profiles: ❌ NÃO EXISTE'
  END as profiles_status;

-- 4. Verificar tabelas de autenticação
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'auth') 
    THEN 'auth.users: ✅ EXISTE'
    ELSE 'auth.users: ❌ NÃO EXISTE'
  END as auth_users_status;

-- 5. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verificar publicações de tempo real
SELECT 
  pubname,
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 7. Verificar se há dados nas tabelas existentes (sem tentar acessar tabelas que não existem)
SELECT 
  'usuarios' as tabela,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'usuarios' AND schemaname = 'public')
    THEN 'Tabela existe - verificar dados manualmente'
    ELSE 'Tabela não existe'
  END as status
UNION ALL
SELECT 
  'notifications' as tabela,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public')
    THEN 'Tabela existe - verificar dados manualmente'
    ELSE 'Tabela não existe'
  END as status
UNION ALL
SELECT 
  'chat_messages' as tabela,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_messages' AND schemaname = 'public')
    THEN 'Tabela existe - verificar dados manualmente'
    ELSE 'Tabela não existe'
  END as status;

-- Status: 🔍 Diagnóstico completo das tabelas
-- Execute este script para ver exatamente quais tabelas existem
-- e quais estão faltando no seu Supabase