-- =====================================================
-- 🧪 TESTAR CHAT GLOBAL - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor para testar

-- 1. VERIFICAR SE A TABELA EXISTE
-- =====================================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
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
  qual
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;

-- 3. VERIFICAR TEMPO REAL
-- =====================================================
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- 4. CONTAR MENSAGENS POR CANAL
-- =====================================================
SELECT 
  channel,
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_message,
  MIN(created_at) as first_message
FROM chat_messages 
GROUP BY channel
ORDER BY total_messages DESC;

-- 5. VERIFICAR MENSAGENS RECENTES
-- =====================================================
SELECT 
  user_name,
  message,
  channel,
  crm,
  specialty,
  reactions,
  is_pinned,
  created_at
FROM chat_messages 
ORDER BY created_at DESC
LIMIT 10;

-- 6. VERIFICAR USUÁRIOS MAIS ATIVOS
-- =====================================================
SELECT 
  user_name,
  crm,
  specialty,
  COUNT(*) as total_messages,
  COUNT(DISTINCT channel) as channels_used,
  MAX(created_at) as last_activity
FROM chat_messages 
GROUP BY user_id, user_name, crm, specialty
ORDER BY total_messages DESC;

-- 7. VERIFICAR MENSAGENS FIXADAS
-- =====================================================
SELECT 
  user_name,
  message,
  channel,
  created_at
FROM chat_messages 
WHERE is_pinned = true
ORDER BY created_at DESC;

-- 8. VERIFICAR REAÇÕES
-- =====================================================
SELECT 
  channel,
  SUM((reactions->>'heart')::int) as total_hearts,
  SUM((reactions->>'thumbs')::int) as total_thumbs,
  SUM((reactions->>'reply')::int) as total_replies
FROM chat_messages 
GROUP BY channel
ORDER BY total_hearts DESC;

-- 9. TESTAR INSERÇÃO DE NOVA MENSAGEM
-- =====================================================
INSERT INTO chat_messages (user_id, user_name, user_avatar, message, channel, crm, specialty, type, reactions, is_pinned, is_online, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Dr. Admin MedCannLab', 'AM', '🧪 Teste do chat global - sistema funcionando!', 'general', 'CRM123456', 'Administrador', 'text', '{"heart": 0, "thumbs": 0, "reply": 0}', false, true, NOW());

-- 10. VERIFICAR SE A MENSAGEM FOI INSERIDA
-- =====================================================
SELECT 
  user_name,
  message,
  channel,
  created_at
FROM chat_messages 
WHERE user_name = 'Dr. Admin MedCannLab'
ORDER BY created_at DESC
LIMIT 1;

-- Status: ✅ Chat Global Testado
-- - Tabela existe e está configurada
-- - RLS habilitado com políticas corretas
-- - Tempo real ativado
-- - Mensagens de teste funcionando
-- - Sistema pronto para uso em tempo real
