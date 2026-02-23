-- =====================================================
-- VINCULAR DOCUMENTOS À IA RESIDENTE
-- Baseado na análise: 18 documentos, apenas 3 vinculados
-- =====================================================

-- 1. VERIFICAR STATUS ATUAL
SELECT 
    'Status Atual' AS verificacao,
    COUNT(*) AS total,
    COUNT(CASE WHEN "isLinkedToAI" = true THEN 1 END) AS vinculados,
    COUNT(CASE WHEN "isLinkedToAI" = false OR "isLinkedToAI" IS NULL THEN 1 END) AS nao_vinculados,
    COUNT(CASE WHEN "aiRelevance" > 0 THEN 1 END) AS com_relevancia
FROM documents;

-- 2. VINCULAR DOCUMENTOS POR CATEGORIA (Critérios para IA)
-- Documentos de categorias importantes para IA devem estar vinculados

UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = 0.9
WHERE (
    category IN ('ai-documents', 'ai-residente', 'protocols', 'research')
    OR tags && ARRAY['AEC', 'IMRE', 'Protocolo', 'IA', 'Cannabis', 'Nefrologia']
    OR title ILIKE '%IMRE%'
    OR title ILIKE '%AEC%'
    OR title ILIKE '%protocolo%'
    OR title ILIKE '%cannabis%'
    OR summary ILIKE '%protocolo IMRE%'
    OR summary ILIKE '%AEC%'
    OR summary ILIKE '%IA residente%'
)
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 3. VINCULAR DOCUMENTOS COM KEYWORDS ESPECÍFICOS
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = 0.85
WHERE (
    keywords && ARRAY['IMRE', 'AEC', 'Protocolo', 'IA', 'Cannabis Medicinal', 'Nefrologia']
    OR 'IMRE' = ANY(keywords)
    OR 'AEC' = ANY(keywords)
    OR 'Protocolo' = ANY(keywords)
)
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 4. DEFINIR RELEVÂNCIA BASEADA EM CATEGORIA
UPDATE documents
SET "aiRelevance" = CASE
    WHEN category = 'ai-documents' THEN 0.95
    WHEN category = 'protocols' THEN 0.90
    WHEN category = 'research' THEN 0.85
    WHEN category = 'cases' THEN 0.80
    WHEN category = 'multimedia' THEN 0.75
    ELSE 0.70
END
WHERE "isLinkedToAI" = TRUE 
AND ("aiRelevance" IS NULL OR "aiRelevance" = 0);

-- 5. VINCULAR DOCUMENTOS DE CATEGORIAS CLÍNICAS
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = 0.88
WHERE category IN ('protocols', 'research', 'cases')
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 6. DEFINIR RELEVÂNCIA BASEADA EM TAGS
UPDATE documents
SET "aiRelevance" = CASE
    WHEN 'AEC' = ANY(tags) OR 'Arte da Entrevista Clínica' = ANY(tags) THEN 0.95
    WHEN 'IMRE' = ANY(tags) THEN 0.92
    WHEN 'Protocolo' = ANY(tags) THEN 0.90
    WHEN 'Cannabis Medicinal' = ANY(tags) THEN 0.88
    WHEN 'Nefrologia' = ANY(tags) THEN 0.85
    ELSE "aiRelevance"
END
WHERE "isLinkedToAI" = TRUE
AND tags IS NOT NULL
AND array_length(tags, 1) > 0;

-- 7. VINCULAR TODOS OS DOCUMENTOS QUE TÊM CONTENT OU SUMMARY PREENCHIDO
-- (Assumindo que documentos com conteúdo são importantes para IA)
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = COALESCE("aiRelevance", 0.75)
WHERE (content IS NOT NULL AND content != '')
   OR (summary IS NOT NULL AND summary != '')
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 8. VERIFICAR RESULTADO FINAL
SELECT 
    'Status Após Vinculação' AS verificacao,
    COUNT(*) AS total_documentos,
    COUNT(CASE WHEN "isLinkedToAI" = true THEN 1 END) AS documentos_vinculados_ia,
    COUNT(CASE WHEN "aiRelevance" > 0 THEN 1 END) AS documentos_com_relevancia,
    ROUND(AVG("aiRelevance")::numeric, 2) AS relevancia_media,
    MIN("aiRelevance") AS relevancia_minima,
    MAX("aiRelevance") AS relevancia_maxima
FROM documents;

-- 9. LISTAR DOCUMENTOS VINCULADOS À IA (Para verificação)
SELECT 
    id,
    title,
    category,
    "isLinkedToAI",
    "aiRelevance",
    array_length(tags, 1) AS num_tags,
    array_length(keywords, 1) AS num_keywords,
    CASE 
        WHEN "aiRelevance" >= 0.9 THEN '⭐ Muito Alta'
        WHEN "aiRelevance" >= 0.8 THEN '⭐ Alta'
        WHEN "aiRelevance" >= 0.7 THEN '⭐ Média'
        ELSE '⭐ Baixa'
    END AS relevancia_nivel
FROM documents
WHERE "isLinkedToAI" = TRUE
ORDER BY "aiRelevance" DESC, title;


