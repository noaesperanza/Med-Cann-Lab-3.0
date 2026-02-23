-- =====================================================
-- 🧪 TESTAR ENVIO DE MENSAGEM - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor para testar envio

-- 1. VERIFICAR USUÁRIO ATUAL
-- =====================================================
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- 2. VERIFICAR POLÍTICAS RLS ATIVAS
-- =====================================================
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;

-- 3. TESTAR INSERÇÃO COM USUÁRIO ATUAL
-- =====================================================
-- Esta inserção deve funcionar se RLS estiver correto
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
  auth.uid(),
  'Teste Debug',
  'TD',
  'Mensagem de teste - ' || NOW()::text,
  'general',
  'CRM123456',
  'Teste',
  'text',
  '{"heart": 0, "thumbs": 0, "reply": 0}',
  false,
  true
) RETURNING id, content, created_at;

-- 4. VERIFICAR SE MENSAGEM FOI INSERIDA
-- =====================================================
SELECT 
  id,
  user_name,
  content,
  channel,
  created_at
FROM chat_messages 
WHERE content LIKE 'Mensagem de teste%'
ORDER BY created_at DESC
LIMIT 3;

-- 5. LIMPAR MENSAGENS DE TESTE (OPCIONAL)
-- =====================================================
-- DELETE FROM chat_messages WHERE content LIKE 'Mensagem de teste%';

-- Status: ✅ Teste de Envio Concluído
-- - Verifica autenticação atual
-- - Testa políticas RLS
-- - Insere mensagem de teste
-- - Confirma inserção
