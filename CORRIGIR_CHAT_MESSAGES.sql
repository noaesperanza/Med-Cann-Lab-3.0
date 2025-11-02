-- =====================================================
-- 🔧 CORRIGIR CHAT_MESSAGES - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
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

-- 2. ADICIONAR COLUNAS FALTANTES
-- =====================================================

-- Adicionar user_name se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'user_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN user_name TEXT;
        RAISE NOTICE 'Coluna user_name adicionada';
    ELSE
        RAISE NOTICE 'Coluna user_name já existe';
    END IF;
END $$;

-- Adicionar user_avatar se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'user_avatar'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN user_avatar TEXT DEFAULT 'U';
        RAISE NOTICE 'Coluna user_avatar adicionada';
    ELSE
        RAISE NOTICE 'Coluna user_avatar já existe';
    END IF;
END $$;

-- Adicionar channel se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'channel'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN channel TEXT DEFAULT 'general';
        RAISE NOTICE 'Coluna channel adicionada';
    ELSE
        RAISE NOTICE 'Coluna channel já existe';
    END IF;
END $$;

-- Adicionar crm se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'crm'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN crm TEXT;
        RAISE NOTICE 'Coluna crm adicionada';
    ELSE
        RAISE NOTICE 'Coluna crm já existe';
    END IF;
END $$;

-- Adicionar specialty se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'specialty'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN specialty TEXT;
        RAISE NOTICE 'Coluna specialty adicionada';
    ELSE
        RAISE NOTICE 'Coluna specialty já existe';
    END IF;
END $$;

-- Adicionar type se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN type TEXT DEFAULT 'text';
        RAISE NOTICE 'Coluna type adicionada';
    ELSE
        RAISE NOTICE 'Coluna type já existe';
    END IF;
END $$;

-- Adicionar reactions se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'reactions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN reactions JSONB DEFAULT '{"heart": 0, "thumbs": 0, "reply": 0}';
        RAISE NOTICE 'Coluna reactions adicionada';
    ELSE
        RAISE NOTICE 'Coluna reactions já existe';
    END IF;
END $$;

-- Adicionar is_pinned se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'is_pinned'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna is_pinned adicionada';
    ELSE
        RAISE NOTICE 'Coluna is_pinned já existe';
    END IF;
END $$;

-- Adicionar is_online se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'is_online'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN is_online BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna is_online adicionada';
    ELSE
        RAISE NOTICE 'Coluna is_online já existe';
    END IF;
END $$;

-- 3. VERIFICAR ESTRUTURA FINAL
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

-- 4. HABILITAR RLS SE NÃO ESTIVER HABILITADO
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'chat_messages' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para chat_messages';
    ELSE
        RAISE NOTICE 'RLS já está habilitado para chat_messages';
    END IF;
END $$;

-- 5. CRIAR POLÍTICAS RLS SE NÃO EXISTIREM
-- =====================================================

-- Política para visualizar mensagens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_messages' 
        AND policyname = 'Anyone can view chat messages'
    ) THEN
        CREATE POLICY "Anyone can view chat messages" ON chat_messages
          FOR SELECT USING (true);
        RAISE NOTICE 'Política de visualização criada';
    ELSE
        RAISE NOTICE 'Política de visualização já existe';
    END IF;
END $$;

-- Política para inserir mensagens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'chat_messages' 
        AND policyname = 'Authenticated users can insert messages'
    ) THEN
        CREATE POLICY "Authenticated users can insert messages" ON chat_messages
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política de inserção criada';
    ELSE
        RAISE NOTICE 'Política de inserção já existe';
    END IF;
END $$;

-- 6. HABILITAR TEMPO REAL SE NÃO ESTIVER
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
        RAISE NOTICE 'Tabela adicionada à publicação supabase_realtime';
    ELSE
        RAISE NOTICE 'Tabela já está na publicação supabase_realtime';
    END IF;
END $$;

-- Status: ✅ Chat Messages Corrigido
-- - Todas as colunas necessárias adicionadas
-- - RLS habilitado com políticas
-- - Tempo real ativado
-- - Tabela pronta para uso
