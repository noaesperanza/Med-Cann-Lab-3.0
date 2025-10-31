-- =====================================================
-- 🧹 LIMPAR POLÍTICAS RLS - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor para limpar políticas conflitantes

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON chat_messages;
DROP POLICY IF EXISTS "Permitir atualização de mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Permitir exclusão de mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Permitir inserção de mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Permitir visualização de mensagens" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_read_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update_policy" ON chat_messages;

-- 2. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
-- =====================================================

-- Política para visualização - todos podem ver
CREATE POLICY "chat_view_policy" ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para inserção - usuários autenticados podem inserir
CREATE POLICY "chat_insert_policy" ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para atualização - apenas o próprio usuário pode atualizar
CREATE POLICY "chat_update_policy" ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para exclusão - apenas o próprio usuário pode deletar
CREATE POLICY "chat_delete_policy" ON chat_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY policyname;

-- 4. TESTAR INSERÇÃO
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
  auth.uid(),
  'Teste Políticas',
  'T',
  'Teste após limpeza - ' || NOW()::text,
  'general',
  'ADMIN',
  'Teste',
  'text',
  '{"heart": 0, "thumbs": 0, "reply": 0}',
  false,
  true
) RETURNING id, content, created_at;

-- Status: ✅ Políticas RLS Limpas
-- - Removidas 10 políticas conflitantes
-- - Criadas 4 políticas simples e funcionais
-- - Teste de inserção incluído
