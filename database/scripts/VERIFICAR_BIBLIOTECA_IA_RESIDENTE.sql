-- =====================================================
-- VERIFICAÇÃO COMPLETA: BIBLIOTECA E BASE DE CONHECIMENTO
-- Integração com IA Resident (Nôa Esperança)
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA documents (Biblioteca Principal)
SELECT 
    'documents' AS tabela,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'documents'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE A COLUNA downloads EXISTE
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'documents' 
            AND column_name = 'downloads'
        ) THEN '✅ Coluna downloads existe'
        ELSE '❌ Coluna downloads NÃO existe'
    END AS status_downloads;

-- 3. VERIFICAR COLUNAS RELACIONADAS À IA RESIDENTE
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name LIKE '%ai%' OR column_name LIKE '%AI%' THEN '🎯 IA'
        WHEN column_name LIKE '%link%' OR column_name LIKE '%Link%' THEN '🔗 Link'
        WHEN column_name IN ('tags', 'keywords', 'summary') THEN '📚 Conteúdo'
        WHEN column_name LIKE '%relevance%' OR column_name LIKE '%Relevance%' THEN '⭐ Relevância'
        ELSE '📋 Geral'
    END AS categoria
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'documents'
AND (
    column_name ILIKE '%ai%' OR
    column_name ILIKE '%link%' OR
    column_name IN ('tags', 'keywords', 'summary', 'content', 'title') OR
    column_name ILIKE '%relevance%'
)
ORDER BY categoria, column_name;

-- 4. VERIFICAR TABELA critical_documents (Se existir)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'critical_documents'
        ) THEN '✅ Tabela critical_documents existe'
        ELSE '❌ Tabela critical_documents NÃO existe'
    END AS status_critical_documents;

-- Se existir, listar colunas
SELECT 
    'critical_documents' AS tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'critical_documents'
ORDER BY ordinal_position;

-- 5. VERIFICAR DOCUMENTOS VINCULADOS À IA
SELECT 
    COUNT(*) AS total_documentos,
    COUNT(CASE WHEN "isLinkedToAI" = true THEN 1 END) AS vinculados_ia,
    COUNT(CASE WHEN "isLinkedToAI" = false OR "isLinkedToAI" IS NULL THEN 1 END) AS nao_vinculados,
    COUNT(CASE WHEN "aiRelevance" > 0 THEN 1 END) AS com_relevancia_ia
FROM documents;

-- 6. VERIFICAR CATEGORIAS E TAGS
SELECT 
    category,
    COUNT(*) AS quantidade,
    COUNT(CASE WHEN "isLinkedToAI" = true THEN 1 END) AS vinculados_ia
FROM documents
GROUP BY category
ORDER BY quantidade DESC;

-- 7. VERIFICAR COLUNAS ESPECÍFICAS NECESSÁRIAS PARA IA
SELECT 
    'Verificação de Colunas Essenciais' AS verificacao,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'title'
    ) THEN '✅' ELSE '❌' END AS title,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'content'
    ) THEN '✅' ELSE '❌' END AS content,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'summary'
    ) THEN '✅' ELSE '❌' END AS summary,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'keywords'
    ) THEN '✅' ELSE '❌' END AS keywords,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'tags'
    ) THEN '✅' ELSE '❌' END AS tags,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'isLinkedToAI'
    ) THEN '✅' ELSE '❌' END AS isLinkedToAI,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'aiRelevance'
    ) THEN '✅' ELSE '❌' END AS aiRelevance,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'category'
    ) THEN '✅' ELSE '❌' END AS category,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'target_audience'
    ) THEN '✅' ELSE '❌' END AS target_audience,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'file_url'
    ) THEN '✅' ELSE '❌' END AS file_url,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'downloads'
    ) THEN '✅' ELSE '❌' END AS downloads;

-- 8. VERIFICAR DOCUMENTOS COM PROBLEMAS (sem dados essenciais)
SELECT 
    id,
    title,
    CASE WHEN content IS NULL OR content = '' THEN '❌ Sem conteúdo' ELSE '✅' END AS status_content,
    CASE WHEN summary IS NULL OR summary = '' THEN '❌ Sem resumo' ELSE '✅' END AS status_summary,
    CASE WHEN "isLinkedToAI" IS NULL THEN '❌ Sem link IA' ELSE '✅' END AS status_ia_link,
    created_at
FROM documents
WHERE content IS NULL OR content = '' 
   OR summary IS NULL OR summary = ''
   OR "isLinkedToAI" IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 9. RESUMO COMPLETO PARA IA RESIDENTE
SELECT 
    'RESUMO INTEGRAÇÃO IA RESIDENTE' AS secao,
    (SELECT COUNT(*) FROM documents) AS total_documentos,
    (SELECT COUNT(*) FROM documents WHERE "isLinkedToAI" = true) AS documentos_vinculados_ia,
    (SELECT COUNT(*) FROM documents WHERE "aiRelevance" > 0) AS documentos_com_relevancia,
    (SELECT COUNT(DISTINCT category) FROM documents WHERE category IS NOT NULL) AS categorias_diferentes,
    (SELECT COUNT(*) FROM documents WHERE tags IS NOT NULL AND array_length(tags, 1) > 0) AS documentos_com_tags,
    (SELECT COUNT(*) FROM documents WHERE keywords IS NOT NULL AND array_length(keywords, 1) > 0) AS documentos_com_keywords;

