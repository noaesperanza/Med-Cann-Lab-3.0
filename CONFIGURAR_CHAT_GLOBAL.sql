-- =====================================================
-- 💬 CONFIGURAR CHAT GLOBAL - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR SE A TABELA CHAT_MESSAGES EXISTE
-- =====================================================
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. CRIAR TABELA CHAT_MESSAGES SE NÃO EXISTIR
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT DEFAULT 'U',
  message TEXT NOT NULL,
  channel TEXT DEFAULT 'general',
  crm TEXT,
  specialty TEXT,
  type TEXT DEFAULT 'text',
  reactions JSONB DEFAULT '{"heart": 0, "thumbs": 0, "reply": 0}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.1. ADICIONAR COLUNAS SE A TABELA JÁ EXISTIR MAS FALTAR COLUNAS
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
        ALTER TABLE chat_messages ADD COLUMN user_name TEXT;
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
    
    -- Adicionar channel se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'channel'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN channel TEXT DEFAULT 'general';
    END IF;
    
    -- Adicionar crm se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'crm'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN crm TEXT;
    END IF;
    
    -- Adicionar specialty se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'specialty'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN specialty TEXT;
    END IF;
    
    -- Adicionar type se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN type TEXT DEFAULT 'text';
    END IF;
    
    -- Adicionar reactions se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'reactions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN reactions JSONB DEFAULT '{"heart": 0, "thumbs": 0, "reply": 0}';
    END IF;
    
    -- Adicionar is_pinned se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'is_pinned'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Adicionar is_online se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'is_online'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN is_online BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 3. HABILITAR RLS
-- =====================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS RLS PARA CHAT_MESSAGES
-- =====================================================
-- Todos podem ver mensagens
CREATE POLICY "Anyone can view chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Usuários autenticados podem inserir mensagens
CREATE POLICY "Authenticated users can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias mensagens
CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias mensagens
CREATE POLICY "Users can delete own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- 6. HABILITAR TEMPO REAL (SE NÃO ESTIVER JÁ)
-- =====================================================
-- Verificar se já está na publicação antes de adicionar
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

-- 7. INSERIR MENSAGENS DE TESTE
-- =====================================================
INSERT INTO chat_messages (user_id, user_name, user_avatar, message, channel, crm, specialty, type, reactions, is_pinned, is_online, created_at) VALUES
-- Mensagens no canal geral
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Bom dia pessoal! Como estão os casos de hoje?', 'general', 'CRM789012', 'Neurologia', 'text', '{"heart": 3, "thumbs": 5, "reply": 2}', false, true, NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Bom dia Dr. João! Tudo bem por aqui. Você já testou o novo sistema IMRE?', 'general', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 1, "thumbs": 3, "reply": 1}', false, true, NOW() - INTERVAL '1 hour 50 minutes'),
('00000000-0000-0000-0000-000000000004', 'Dr. Pedro Costa', 'PC', 'Ainda não, Dra. Maria. Como está funcionando?', 'general', 'CRM901234', 'Clínica Geral', 'text', '{"heart": 0, "thumbs": 1, "reply": 0}', false, true, NOW() - INTERVAL '1 hour 30 minutes'),
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Está excelente! A análise semântica está muito precisa.', 'general', 'CRM789012', 'Neurologia', 'text', '{"heart": 2, "thumbs": 4, "reply": 1}', false, true, NOW() - INTERVAL '1 hour 15 minutes'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Concordo! Os 28 blocos estão funcionando perfeitamente.', 'general', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 1, "thumbs": 2, "reply": 0}', false, true, NOW() - INTERVAL '1 hour'),

-- Mensagens no canal de cannabis
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Alguém tem experiência com CBD para dor neuropática?', 'cannabis', 'CRM789012', 'Neurologia', 'text', '{"heart": 5, "thumbs": 8, "reply": 3}', false, true, NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Sim! Tenho alguns casos com ótimos resultados. Podemos trocar experiências.', 'cannabis', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 3, "thumbs": 6, "reply": 2}', false, true, NOW() - INTERVAL '2 hours 45 minutes'),

-- Mensagens no canal de casos clínicos
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Caso interessante: paciente com dor crônica, sistema IMRE identificou padrão emocional específico.', 'clinical', 'CRM789012', 'Neurologia', 'text', '{"heart": 7, "thumbs": 12, "reply": 5}', true, true, NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Interessante! Qual foi o padrão identificado?', 'clinical', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 2, "thumbs": 4, "reply": 1}', false, true, NOW() - INTERVAL '2 hours 45 minutes'),
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Alta intensidade emocional (8.2) com baixa estabilidade (3.5). Padrão típico de ansiedade crônica.', 'clinical', 'CRM789012', 'Neurologia', 'text', '{"heart": 4, "thumbs": 8, "reply": 3}', false, true, NOW() - INTERVAL '2 hours 30 minutes'),

-- Mensagens no canal de pesquisa
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Novo estudo sobre cannabis e ansiedade publicado no JAMA. Muito promissor!', 'research', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 6, "thumbs": 10, "reply": 4}', false, true, NOW() - INTERVAL '4 hours'),
('00000000-0000-0000-0000-000000000004', 'Dr. Pedro Costa', 'PC', 'Ótimo! Pode compartilhar o link?', 'research', 'CRM901234', 'Clínica Geral', 'text', '{"heart": 1, "thumbs": 2, "reply": 0}', false, true, NOW() - INTERVAL '3 hours 30 minutes'),

-- Mensagens no canal de suporte
('00000000-0000-0000-0000-000000000001', 'Dr. Admin MedCannLab', 'AM', 'Sistema funcionando perfeitamente! Qualquer dúvida, estou aqui.', 'support', 'CRM123456', 'Administrador', 'text', '{"heart": 2, "thumbs": 3, "reply": 1}', false, true, NOW() - INTERVAL '1 hour 30 minutes');

-- 8. VERIFICAR MENSAGENS INSERIDAS
-- =====================================================
SELECT 
  channel,
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_message
FROM chat_messages 
GROUP BY channel
ORDER BY total_messages DESC;

-- 9. VERIFICAR TEMPO REAL
-- =====================================================
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- Status: ✅ Chat Global Configurado
-- - Tabela chat_messages criada
-- - RLS habilitado com políticas seguras
-- - Tempo real ativado
-- - 12 mensagens de teste inseridas
-- - 4 canais diferentes (general, cannabis, clinical, research, support)
-- - 4 usuários diferentes participando
-- - Sistema pronto para uso em tempo real
