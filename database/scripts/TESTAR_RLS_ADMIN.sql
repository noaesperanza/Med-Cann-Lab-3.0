-- =====================================================
-- 🧪 TESTAR RLS ADMIN - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor para testar RLS do admin

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

-- 3. TESTAR INSERÇÃO COM USUÁRIO ADMIN
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
  'Teste RLS Admin - ' || NOW()::text,
  'general',
  'ADMIN',
  'Administrador',
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
WHERE user_id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8'
ORDER BY created_at DESC
LIMIT 5;

-- 5. VERIFICAR PERMISSÕES DO USUÁRIO
-- =====================================================
SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN rowsecurity THEN 'HABILITADO' 
    ELSE 'DESABILITADO' 
  END as status
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- Status: ✅ Teste RLS Admin Concluído
-- - Verifica autenticação do admin
-- - Testa políticas RLS
-- - Insere mensagem como admin
-- - Confirma inserção
