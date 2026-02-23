-- =====================================================
-- VINCULAR TODOS OS DOCUMENTOS À IA RESIDENTE
-- Baseado nos resultados: 18 documentos, apenas 3 vinculados
-- Relevância média: 0.00 (nenhum com relevância)
-- =====================================================

-- 1. VERIFICAR STATUS ATUAL
SELECT 
    'Status Antes da Vinculação' AS verificacao,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE "isLinkedToAI" = true) AS vinculados,
    COUNT(*) FILTER (WHERE "isLinkedToAI" = false OR "isLinkedToAI" IS NULL) AS nao_vinculados,
    COUNT(*) FILTER (WHERE "aiRelevance" > 0) AS com_relevancia,
    ROUND(AVG("aiRelevance")::numeric, 2) AS relevancia_media
FROM documents;

-- 2. VINCULAR DOCUMENTOS POR CATEGORIA (Critérios para IA)
-- Documentos de categorias importantes para IA devem estar vinculados
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = CASE
        WHEN category IN ('ai-documents', 'ai-residente') THEN 0.95
        WHEN category = 'protocols' THEN 0.90
        WHEN category = 'research' THEN 0.85
        WHEN category = 'cases' THEN 0.80
        ELSE 0.75
    END
WHERE (
    category IN ('ai-documents', 'ai-residente', 'protocols', 'research', 'cases', 'ai-documents')
    OR tags && ARRAY['AEC', 'IMRE', 'Protocolo', 'IA', 'Cannabis', 'Nefrologia']
    OR 'IMRE' = ANY(tags)
    OR 'AEC' = ANY(tags)
    OR 'Protocolo' = ANY(tags)
    OR 'IA' = ANY(tags)
    OR 'Cannabis' = ANY(tags)
    OR 'Nefrologia' = ANY(tags)
)
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 3. VINCULAR DOCUMENTOS COM KEYWORDS ESPECÍFICOS
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = GREATEST("aiRelevance", 0.85)
WHERE (
    keywords && ARRAY['IMRE', 'AEC', 'Protocolo', 'IA', 'Cannabis Medicinal', 'Nefrologia']
    OR 'IMRE' = ANY(keywords)
    OR 'AEC' = ANY(keywords)
    OR 'Protocolo' = ANY(keywords)
    OR 'IA' = ANY(keywords)
    OR 'Cannabis' = ANY(keywords)
    OR 'Nefrologia' = ANY(keywords)
)
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 4. VINCULAR POR TÍTULO E SUMMARY (Busca textual)
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = GREATEST("aiRelevance", 0.80)
WHERE (
    title ILIKE '%IMRE%'
    OR title ILIKE '%AEC%'
    OR title ILIKE '%protocolo%'
    OR title ILIKE '%cannabis%'
    OR title ILIKE '%nefrologia%'
    OR title ILIKE '%IA residente%'
    OR summary ILIKE '%protocolo IMRE%'
    OR summary ILIKE '%AEC%'
    OR summary ILIKE '%IA residente%'
    OR summary ILIKE '%cannabis medicinal%'
)
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 5. VINCULAR TODOS OS DOCUMENTOS COM CONTENT OU SUMMARY PREENCHIDO
-- (Documentos com conteúdo são importantes para IA)
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = GREATEST("aiRelevance", 0.75)
WHERE (
    (content IS NOT NULL AND content != '')
    OR (summary IS NOT NULL AND summary != '')
)
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 6. DEFINIR RELEVÂNCIA BASEADA EM TAGS (Ajustar relevância existente)
UPDATE documents
SET "aiRelevance" = CASE
    WHEN 'AEC' = ANY(tags) OR 'Arte da Entrevista Clínica' = ANY(tags) THEN 0.95
    WHEN 'IMRE' = ANY(tags) THEN 0.92
    WHEN 'Protocolo' = ANY(tags) THEN 0.90
    WHEN 'Cannabis Medicinal' = ANY(tags) THEN 0.88
    WHEN 'Nefrologia' = ANY(tags) THEN 0.85
    WHEN 'IA' = ANY(tags) OR 'Inteligência Artificial' = ANY(tags) THEN 0.87
    ELSE GREATEST("aiRelevance", 0.70)
END
WHERE "isLinkedToAI" = TRUE
AND tags IS NOT NULL
AND array_length(tags, 1) > 0;

-- 7. VINCULAR DOCUMENTOS COM KEYWORDS (mesmo sem tags específicas)
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = GREATEST("aiRelevance", 0.70)
WHERE keywords IS NOT NULL 
AND array_length(keywords, 1) > 0
AND ("isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE);

-- 8. VINCULAR RESTANTE BASEADO EM CATEGORIA (fallback)
UPDATE documents
SET 
    "isLinkedToAI" = TRUE,
    "aiRelevance" = CASE
        WHEN category = 'ai-documents' THEN 0.90
        WHEN category = 'protocols' THEN 0.85
        WHEN category = 'research' THEN 0.80
        WHEN category = 'cases' THEN 0.75
        WHEN category = 'multimedia' THEN 0.70
        ELSE 0.65
    END
WHERE "isLinkedToAI" IS NULL OR "isLinkedToAI" = FALSE;

-- 9. VERIFICAR RESULTADO FINAL
SELECT 
    'Status Após Vinculação' AS verificacao,
    COUNT(*) AS total_documentos,
    COUNT(*) FILTER (WHERE "isLinkedToAI" = true) AS documentos_vinculados_ia,
    COUNT(*) FILTER (WHERE "aiRelevance" > 0) AS documentos_com_relevancia,
    ROUND(AVG("aiRelevance")::numeric, 2) AS relevancia_media,
    ROUND(MIN("aiRelevance")::numeric, 2) AS relevancia_minima,
    ROUND(MAX("aiRelevance")::numeric, 2) AS relevancia_maxima,
    COUNT(*) FILTER (WHERE "aiRelevance" >= 0.9) AS alta_relevancia,
    COUNT(*) FILTER (WHERE "aiRelevance" >= 0.8 AND "aiRelevance" < 0.9) AS media_alta_relevancia,
    COUNT(*) FILTER (WHERE "aiRelevance" >= 0.7 AND "aiRelevance" < 0.8) AS media_relevancia
FROM documents;

-- 10. LISTAR DOCUMENTOS VINCULADOS À IA (Para verificação)
SELECT 
    id,
    title,
    category,
    "isLinkedToAI",
    ROUND("aiRelevance"::numeric, 2) AS relevancia,
    array_length(tags, 1) AS num_tags,
    array_length(keywords, 1) AS num_keywords,
    CASE 
        WHEN "aiRelevance" >= 0.9 THEN '⭐ Muito Alta'
        WHEN "aiRelevance" >= 0.8 THEN '⭐ Alta'
        WHEN "aiRelevance" >= 0.7 THEN '⭐ Média'
        WHEN "aiRelevance" >= 0.6 THEN '⭐ Baixa'
        ELSE '❌ Sem Relevância'
    END AS nivel_relevancia
FROM documents
WHERE "isLinkedToAI" = TRUE
ORDER BY "aiRelevance" DESC, title
LIMIT 20;

-- 11. RESUMO POR CATEGORIA
SELECT 
    category,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE "isLinkedToAI" = true) AS vinculados,
    ROUND(AVG("aiRelevance")::numeric, 2) AS relevancia_media
FROM documents
GROUP BY category
ORDER BY relevancia_media DESC NULLS LAST;

