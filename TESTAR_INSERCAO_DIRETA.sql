-- =====================================================
-- 🧪 TESTAR INSERÇÃO DIRETA - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor para testar inserção direta

-- 1. VERIFICAR USUÁRIO ATUAL
-- =====================================================
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 2. TESTAR INSERÇÃO DIRETA COM ID DO ADMIN
-- =====================================================
INSERT INTO chat_messages (
  user_id, 
  user_name, 
  user_avatar, 
  content, 
  channel, 
  crm, 
  specialty, 
  type, 
  reactions, 
  is_pinned, 
  is_online
) VALUES (
  '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
  'Administrador',
  'A',
  'Teste Inserção Direta - ' || NOW()::text,
  'general',
  'ADMIN',
  'Administrador',
  'text',
  '{"heart": 0, "thumbs": 0, "reply": 0}',
  false,
  true
) RETURNING id, content, created_at;

-- 3. VERIFICAR SE MENSAGEM FOI INSERIDA
-- =====================================================
SELECT 
  id,
  user_name,
  content,
  channel,
  created_at
FROM chat_messages 
WHERE user_id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8'
ORDER BY created_at DESC
LIMIT 3;

-- 4. VERIFICAR POLÍTICAS RLS
-- =====================================================
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;

-- Status: ✅ Teste Inserção Direta Concluído
-- - Testa inserção com ID específico do admin
-- - Verifica se RLS está bloqueando
-- - Confirma inserção
