-- Verificar estrutura da tabela documents
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela documents existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'documents';

-- 2. Listar todas as colunas da tabela documents
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'documents'
ORDER BY ordinal_position;

-- 3. Se a tabela não existir, criar com estrutura básica
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    type TEXT,
    size TEXT,
    author TEXT,
    upload_date DATE,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    tags TEXT[],
    is_linked_to_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verificar novamente a estrutura após criação
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'documents'
ORDER BY ordinal_position;
