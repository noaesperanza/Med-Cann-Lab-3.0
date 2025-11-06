-- CORREÇÃO: chat_id deve ser UUID, não string
-- Este script cria uma função para gerar chat_id consistente baseado nos IDs dos participantes

-- 1. Criar função para gerar chat_id UUID consistente
CREATE OR REPLACE FUNCTION generate_chat_id(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  sorted_ids TEXT[];
  chat_id_str TEXT;
BEGIN
  -- Ordenar IDs para garantir consistência
  IF user1_id < user2_id THEN
    sorted_ids := ARRAY[user1_id::TEXT, user2_id::TEXT];
  ELSE
    sorted_ids := ARRAY[user2_id::TEXT, user1_id::TEXT];
  END IF;
  
  -- Criar string única
  chat_id_str := 'chat_' || array_to_string(sorted_ids, '_');
  
  -- Gerar UUID determinístico baseado na string
  RETURN md5(chat_id_str)::uuid;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Adicionar coluna temporária para migração se necessário
-- (Não necessário se a tabela já está correta)

-- 3. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_uuid ON chat_messages(chat_id);

-- 4. Comentário na função
COMMENT ON FUNCTION generate_chat_id IS 'Gera um UUID consistente para chat_id baseado nos IDs dos dois participantes';

