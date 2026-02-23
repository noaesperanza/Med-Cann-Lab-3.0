-- Adicionar colunas faltantes à tabela documents

-- Adicionar coluna category
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Adicionar coluna summary
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Adicionar coluna tags
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar coluna keywords
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar coluna target_audience
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Adicionar coluna author
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS author TEXT;

-- Adicionar coluna isLinkedToAI
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS "isLinkedToAI" BOOLEAN DEFAULT FALSE;

-- Adicionar coluna aiRelevance
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS "aiRelevance" INTEGER DEFAULT 0;

-- Adicionar coluna type (alias para file_type)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS type TEXT;

-- Copiar file_type para type se type estiver vazio
UPDATE documents SET type = file_type WHERE type IS NULL;

-- Verificar estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;
