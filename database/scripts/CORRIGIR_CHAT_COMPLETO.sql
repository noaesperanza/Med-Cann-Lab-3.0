-- =====================================================
-- 🔧 CORREÇÃO COMPLETA DO CHAT - MEDCANLAB 5.0
-- =====================================================
-- Execute este script no Supabase SQL Editor para garantir que o chat funcione corretamente

-- 1. VERIFICAR E CRIAR TABELA CHAT_MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT DEFAULT 'U',
  message TEXT NOT NULL,
  channel TEXT DEFAULT 'general' NOT NULL,
  crm TEXT,
  specialty TEXT,
  type TEXT DEFAULT 'text',
  reactions JSONB DEFAULT '{"heart": 0, "thumbs": 0, "reply": 0}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADICIONAR COLUNAS FALTANTES (SE NECESSÁRIO)
-- =====================================================
DO $$
BEGIN
    -- Adicionar user_name se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'user_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN user_name TEXT NOT NULL DEFAULT 'Usuário';
    END IF;
    
    -- Adicionar user_avatar se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'user_avatar'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN user_avatar TEXT DEFAULT 'U';
    END IF;
    
    -- Adicionar message se não existir (pode estar como 'content')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'message'
        AND table_schema = 'public'
    ) THEN
        -- Verificar se existe 'content' e renomear
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chat_messages' 
            AND column_name = 'content'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE chat_messages RENAME COLUMN content TO message;
        ELSE
            ALTER TABLE chat_messages ADD COLUMN message TEXT NOT NULL DEFAULT '';
        END IF;
    END IF;
    
    -- Adicionar channel se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'channel'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN channel TEXT DEFAULT 'general' NOT NULL;
    END IF;
    
    -- Adicionar outras colunas se necessário
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'crm'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN crm TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'specialty'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN specialty TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN type TEXT DEFAULT 'text';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'reactions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN reactions JSONB DEFAULT '{"heart": 0, "thumbs": 0, "reply": 0}';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'is_pinned'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'is_online'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN is_online BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. HABILITAR RLS
-- =====================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON chat_messages;

-- 5. CRIAR POLÍTICAS RLS CORRETAS
-- =====================================================
-- Todos podem ver mensagens (chat público)
CREATE POLICY "Anyone can view chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Usuários autenticados podem inserir mensagens
CREATE POLICY "Authenticated users can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias mensagens (dentro de 5 minutos)
CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    AND created_at > NOW() - INTERVAL '5 minutes'
  );

-- Usuários podem deletar suas próprias mensagens
CREATE POLICY "Users can delete own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Admins podem deletar qualquer mensagem
CREATE POLICY "Admins can delete any message" ON chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'admin' OR auth.users.raw_user_meta_data->>'role' = 'admin')
    )
  );

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created ON chat_messages(channel, created_at DESC);

-- 7. HABILITAR TEMPO REAL
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

-- 8. CRIAR TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER trigger_update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_messages_updated_at();

-- 9. INSERIR MENSAGENS DE TESTE (APENAS SE HOUVER USUÁRIOS REAIS)
-- =====================================================
-- NOTA: As mensagens de teste só serão inseridas se existirem usuários reais no sistema
-- Para inserir mensagens de teste, você precisa ter usuários cadastrados primeiro

-- Opção 1: Inserir mensagens usando o primeiro usuário autenticado encontrado
-- (Descomente e ajuste conforme necessário)
/*
DO $$
DECLARE
  v_test_user_id UUID;
BEGIN
  -- Buscar primeiro usuário do tipo profissional ou admin
  SELECT id INTO v_test_user_id
  FROM auth.users
  WHERE (raw_user_meta_data->>'type' IN ('profissional', 'admin') 
         OR raw_user_meta_data->>'role' IN ('professional', 'admin'))
  LIMIT 1;
  
  -- Se encontrou usuário, inserir mensagens de teste
  IF v_test_user_id IS NOT NULL THEN
    INSERT INTO chat_messages (user_id, user_name, user_avatar, message, channel, crm, specialty, type, reactions, is_pinned, is_online, created_at)
    SELECT 
      v_test_user_id,
      COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = v_test_user_id), 'Usuário Teste'),
      COALESCE(SUBSTRING((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = v_test_user_id) FROM 1 FOR 2), 'UT'),
      'Bom dia pessoal! Bem-vindos ao chat global da plataforma MedCannLab.',
      'general',
      COALESCE((SELECT raw_user_meta_data->>'crm' FROM auth.users WHERE id = v_test_user_id), NULL),
      NULL,
      'text',
      '{"heart": 0, "thumbs": 0, "reply": 0}'::JSONB,
      false,
      true,
      NOW() - INTERVAL '1 hour'
    WHERE NOT EXISTS (
      SELECT 1 FROM chat_messages 
      WHERE channel = 'general' 
      AND user_id = v_test_user_id
      AND message = 'Bom dia pessoal! Bem-vindos ao chat global da plataforma MedCannLab.'
    );
  END IF;
END $$;
*/

-- Opção 2: Inserir mensagens usando usuário específico (substitua pelo UUID real)
-- (Descomente e substitua 'SEU_UUID_AQUI' pelo UUID real de um usuário)
/*
INSERT INTO chat_messages (user_id, user_name, user_avatar, message, channel, crm, specialty, type, reactions, is_pinned, is_online, created_at)
SELECT 
  'SEU_UUID_AQUI'::UUID,
  (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = 'SEU_UUID_AQUI'::UUID),
  SUBSTRING((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = 'SEU_UUID_AQUI'::UUID) FROM 1 FOR 2),
  'Bom dia pessoal! Bem-vindos ao chat global da plataforma MedCannLab.',
  'general',
  (SELECT raw_user_meta_data->>'crm' FROM auth.users WHERE id = 'SEU_UUID_AQUI'::UUID),
  NULL,
  'text',
  '{"heart": 0, "thumbs": 0, "reply": 0}'::JSONB,
  false,
  true,
  NOW() - INTERVAL '1 hour'
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE id = 'SEU_UUID_AQUI'::UUID
)
AND NOT EXISTS (
  SELECT 1 FROM chat_messages 
  WHERE channel = 'general' 
  AND user_id = 'SEU_UUID_AQUI'::UUID
  AND message = 'Bom dia pessoal! Bem-vindos ao chat global da plataforma MedCannLab.'
);
*/

-- 10. VERIFICAR ESTRUTURA FINAL
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

-- 11. VERIFICAR POLÍTICAS RLS
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

-- 12. VERIFICAR TEMPO REAL
-- =====================================================
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'chat_messages';

-- 13. CONTAR MENSAGENS POR CANAL
-- =====================================================
SELECT 
  channel,
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_message
FROM chat_messages 
GROUP BY channel
ORDER BY total_messages DESC;

-- Status: ✅ Chat Global Completamente Configurado
-- - Tabela chat_messages criada/atualizada
-- - Todas as colunas necessárias presentes
-- - RLS habilitado com políticas seguras
-- - Tempo real ativado
-- - Índices criados para performance
-- - Trigger para updated_at configurado
-- - Mensagens de teste: Comentadas (descomente e ajuste se necessário)
-- - Sistema pronto para uso em tempo real
--
-- ⚠️ IMPORTANTE: As mensagens de teste foram comentadas porque requerem usuários reais.
-- Para inserir mensagens de teste:
-- 1. Descomente a seção 9 acima
-- 2. Substitua 'SEU_UUID_AQUI' pelo UUID real de um usuário cadastrado
-- 3. Ou use a Opção 1 que busca automaticamente um usuário profissional/admin

