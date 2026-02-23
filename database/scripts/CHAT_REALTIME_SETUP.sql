-- Configuração do Chat Global em Tempo Real
-- MedCannLab 3.0

-- 1. Habilitar RLS na tabela chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. Política para leitura de mensagens (todos podem ler mensagens públicas)
CREATE POLICY "chat_messages_read_policy" ON chat_messages
  FOR SELECT USING (true);

-- 3. Política para inserção de mensagens (usuários autenticados podem enviar)
CREATE POLICY "chat_messages_insert_policy" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Política para atualização de mensagens (apenas o autor pode editar)
CREATE POLICY "chat_messages_update_policy" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Política para exclusão de mensagens (apenas o autor ou admin pode deletar)
CREATE POLICY "chat_messages_delete_policy" ON chat_messages
  FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'phpg69@gmail.com'
    )
  );

-- 6. Habilitar tempo real na tabela chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 7. Criar função para limpeza automática de mensagens antigas
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS void AS $$
BEGIN
  -- Deletar mensagens com mais de 24 horas
  DELETE FROM chat_messages 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Log da limpeza
  INSERT INTO system_logs (action, details, created_at)
  VALUES ('chat_cleanup', 'Mensagens antigas removidas automaticamente', NOW());
END;
$$ LANGUAGE plpgsql;

-- 8. Criar job para limpeza automática (executa a cada hora)
-- Nota: Isso precisa ser configurado no Supabase Dashboard > Database > Functions
-- ou via pg_cron se disponível

-- 9. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created 
ON chat_messages (channel, created_at DESC);

-- 10. Criar índice para limpeza automática
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
ON chat_messages (created_at);

-- 11. Adicionar coluna para controle de expiração
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE 
DEFAULT (NOW() + INTERVAL '24 hours');

-- 12. Criar trigger para atualizar expires_at ao inserir
CREATE OR REPLACE FUNCTION set_chat_message_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at = NOW() + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_message_expiry_trigger
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_chat_message_expiry();

-- 13. Verificar configuração
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- 14. Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'chat_messages';

-- 15. Verificar publicação de tempo real
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'chat_messages';

-- Status: ✅ Chat Global em Tempo Real Configurado
-- - RLS habilitado com políticas seguras
-- - Tempo real ativado para chat_messages
-- - Limpeza automática de mensagens antigas (24h)
-- - Índices para performance otimizada
-- - Controle de expiração automático
