-- =====================================================
-- 🔍 DEBUG CHAT - VERIFICAR PROBLEMAS
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR POLÍTICAS RLS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'chat_messages';

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- 4. VERIFICAR DADOS EXISTENTES
-- =====================================================
SELECT 
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT channel) as unique_channels
FROM chat_messages;

-- 5. VERIFICAR PUBLICAÇÃO DE TEMPO REAL
-- =====================================================
SELECT 
  pubname,
  tablename
FROM pg_publication_tables 
WHERE tablename = 'chat_messages';

-- 6. TESTAR INSERÇÃO MANUAL (EXECUTAR COMO ADMIN)
-- =====================================================
-- INSERT INTO chat_messages (
--   user_id, 
--   user_name, 
--   user_avatar, 
--   content, 
--   channel, 
--   crm, 
--   specialty, 
--   type, 
--   reactions, 
--   is_pinned, 
--   is_online
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'Teste Debug',
--   'TD',
--   'Mensagem de teste para debug',
--   'general',
--   'CRM123456',
--   'Teste',
--   'text',
--   '{"heart": 0, "thumbs": 0, "reply": 0}',
--   false,
--   true
-- );

-- 7. VERIFICAR ÚLTIMAS MENSAGENS
-- =====================================================
SELECT 
  user_name,
  content,
  channel,
  created_at
FROM chat_messages 
ORDER BY created_at DESC 
LIMIT 5;
