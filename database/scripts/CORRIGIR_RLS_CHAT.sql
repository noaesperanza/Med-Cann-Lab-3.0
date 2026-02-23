-- =====================================================
-- 🔧 CORRIGIR RLS CHAT - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor para corrigir políticas RLS

-- 1. REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
-- =====================================================
DROP POLICY IF EXISTS "Permitir visualização de mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Permitir inserção de mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Permitir atualização de mensagens" ON chat_messages;
DROP POLICY IF EXISTS "Permitir exclusão de mensagens" ON chat_messages;

-- 2. CRIAR POLÍTICAS RLS CORRETAS
-- =====================================================

-- Política para visualização - todos os usuários autenticados podem ver
CREATE POLICY "Permitir visualização de mensagens" ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para inserção - todos os usuários autenticados podem inserir
CREATE POLICY "Permitir inserção de mensagens" ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para atualização - apenas o próprio usuário pode atualizar suas mensagens
CREATE POLICY "Permitir atualização de mensagens" ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para exclusão - apenas o próprio usuário pode deletar suas mensagens
CREATE POLICY "Permitir exclusão de mensagens" ON chat_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR SE TABELA ESTÁ NA PUBLICAÇÃO DE TEMPO REAL
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    END IF;
END $$;

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- 6. VERIFICAR CONFIGURAÇÃO FINAL
-- =====================================================
SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN rowsecurity THEN 'HABILITADO' 
    ELSE 'DESABILITADO' 
  END as status
FROM pg_tables 
WHERE tablename = 'chat_messages';

SELECT 
  'Políticas RLS' as check_type,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'chat_messages';

SELECT 
  'Tempo Real' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'chat_messages'
    ) THEN 'ATIVO' 
    ELSE 'INATIVO' 
  END as status;

-- Status: ✅ RLS Corrigido
-- - Políticas RLS criadas corretamente
-- - Visualização permitida para todos os autenticados
-- - Inserção permitida para todos os autenticados
-- - Atualização/exclusão apenas do próprio usuário
-- - Tempo real ativo
-- - Índices criados para performance
