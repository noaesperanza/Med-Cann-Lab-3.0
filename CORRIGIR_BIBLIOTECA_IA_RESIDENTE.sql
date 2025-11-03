-- =====================================================
-- CORREÇÃO E COMPLEMENTAÇÃO: BIBLIOTECA E IA RESIDENTE
-- Adiciona colunas faltantes para integração completa
-- =====================================================

-- 1. ADICIONAR COLUNA downloads (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'downloads'
    ) THEN
        ALTER TABLE documents ADD COLUMN downloads INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Coluna downloads adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna downloads já existe';
    END IF;
END $$;

-- 2. ADICIONAR COLUNAS RELACIONADAS À IA RESIDENTE (se não existirem)

-- isLinkedToAI
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'isLinkedToAI'
    ) THEN
        ALTER TABLE documents ADD COLUMN "isLinkedToAI" BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Coluna isLinkedToAI adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna isLinkedToAI já existe';
    END IF;
END $$;

-- aiRelevance
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'aiRelevance'
    ) THEN
        ALTER TABLE documents ADD COLUMN "aiRelevance" DECIMAL(3,2) DEFAULT 0.0 
            CHECK ("aiRelevance" >= 0 AND "aiRelevance" <= 1);
        RAISE NOTICE '✅ Coluna aiRelevance adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna aiRelevance já existe';
    END IF;
END $$;

-- category (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE documents ADD COLUMN category TEXT;
        RAISE NOTICE '✅ Coluna category adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna category já existe';
    END IF;
END $$;

-- summary (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'summary'
    ) THEN
        ALTER TABLE documents ADD COLUMN summary TEXT;
        RAISE NOTICE '✅ Coluna summary adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna summary já existe';
    END IF;
END $$;

-- tags (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE documents ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE '✅ Coluna tags adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna tags já existe';
    END IF;
END $$;

-- keywords (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'keywords'
    ) THEN
        ALTER TABLE documents ADD COLUMN keywords TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE '✅ Coluna keywords adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna keywords já existe';
    END IF;
END $$;

-- target_audience (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'target_audience'
    ) THEN
        ALTER TABLE documents ADD COLUMN target_audience TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE '✅ Coluna target_audience adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna target_audience já existe';
    END IF;
END $$;

-- author (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'author'
    ) THEN
        ALTER TABLE documents ADD COLUMN author TEXT;
        RAISE NOTICE '✅ Coluna author adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna author já existe';
    END IF;
END $$;

-- file_url (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE documents ADD COLUMN file_url TEXT;
        RAISE NOTICE '✅ Coluna file_url adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna file_url já existe';
    END IF;
END $$;

-- file_type (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'file_type'
    ) THEN
        ALTER TABLE documents ADD COLUMN file_type TEXT;
        RAISE NOTICE '✅ Coluna file_type adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna file_type já existe';
    END IF;
END $$;

-- file_size (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'file_size'
    ) THEN
        ALTER TABLE documents ADD COLUMN file_size INTEGER;
        RAISE NOTICE '✅ Coluna file_size adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna file_size já existe';
    END IF;
END $$;

-- 3. VERIFICAR ESTRUTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name ILIKE '%ai%' OR column_name = 'isLinkedToAI' OR column_name = 'aiRelevance' THEN '🎯 IA Residente'
        WHEN column_name IN ('tags', 'keywords', 'summary', 'content', 'title') THEN '📚 Conteúdo'
        WHEN column_name IN ('category', 'target_audience', 'author') THEN '🏷️ Metadados'
        WHEN column_name IN ('file_url', 'file_type', 'file_size', 'downloads') THEN '📁 Arquivo'
        ELSE '📋 Geral'
    END AS categoria
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'documents'
ORDER BY 
    CASE categoria
        WHEN '🎯 IA Residente' THEN 1
        WHEN '📚 Conteúdo' THEN 2
        WHEN '🏷️ Metadados' THEN 3
        WHEN '📁 Arquivo' THEN 4
        ELSE 5
    END,
    column_name;

-- 4. ATUALIZAR DOCUMENTOS EXISTENTES SEM isLinkedToAI
UPDATE documents 
SET "isLinkedToAI" = FALSE 
WHERE "isLinkedToAI" IS NULL;

-- 5. ATUALIZAR DOCUMENTOS EXISTENTES SEM downloads
UPDATE documents 
SET downloads = 0 
WHERE downloads IS NULL;

-- 6. VERIFICAR STATUS FINAL
SELECT 
    'STATUS FINAL DA INTEGRAÇÃO' AS verificacao,
    (SELECT COUNT(*) FROM documents) AS total_documentos,
    (SELECT COUNT(*) FROM documents WHERE "isLinkedToAI" = true) AS vinculados_ia,
    (SELECT COUNT(*) FROM documents WHERE downloads IS NOT NULL) AS com_contador_downloads,
    (SELECT COUNT(*) FROM documents WHERE file_url IS NOT NULL) AS com_url_arquivo,
    (SELECT COUNT(*) FROM documents WHERE tags IS NOT NULL AND array_length(tags, 1) > 0) AS com_tags,
    (SELECT COUNT(*) FROM documents WHERE keywords IS NOT NULL AND array_length(keywords, 1) > 0) AS com_keywords;

