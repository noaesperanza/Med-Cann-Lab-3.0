-- =====================================================
-- 🔍 VERIFICAR EMAILS DUPLICADOS POR TIPO DE PERFIL
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Identificar emails que aparecem em múltiplos tipos de usuário
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. EMAILS QUE APARECEM EM MÚLTIPLOS TIPOS
-- =====================================================

SELECT 
    email,
    COUNT(DISTINCT type) AS total_tipos,
    STRING_AGG(DISTINCT type, ', ' ORDER BY type) AS tipos,
    STRING_AGG(DISTINCT name, ' | ' ORDER BY name) AS nomes,
    STRING_AGG(id::text, ', ' ORDER BY id) AS ids
FROM public.users
GROUP BY email
HAVING COUNT(DISTINCT type) > 1
ORDER BY total_tipos DESC, email;

-- =====================================================
-- 2. DETALHES COMPLETOS DOS EMAILS DUPLICADOS
-- =====================================================

SELECT 
    u1.email,
    u1.type AS tipo_1,
    u1.name AS nome_1,
    u1.id AS id_1,
    u1.created_at AS criado_em_1,
    u2.type AS tipo_2,
    u2.name AS nome_2,
    u2.id AS id_2,
    u2.created_at AS criado_em_2,
    CASE 
        WHEN u1.created_at < u2.created_at THEN u1.id
        ELSE u2.id
    END AS id_mais_antigo,
    CASE 
        WHEN u1.created_at < u2.created_at THEN u1.type
        ELSE u2.type
    END AS tipo_mais_antigo
FROM public.users u1
INNER JOIN public.users u2 ON u1.email = u2.email AND u1.id != u2.id
WHERE u1.type != u2.type
ORDER BY u1.email, u1.created_at;

-- =====================================================
-- 3. RESUMO: QUANTOS EMAILS DUPLICADOS EXISTEM
-- =====================================================

SELECT 
    '📊 RESUMO DE DUPLICAÇÕES' AS categoria,
    '' AS detalhe,
    '' AS valor
UNION ALL
SELECT 
    'Total de emails únicos' AS categoria,
    '' AS detalhe,
    COUNT(DISTINCT email)::text AS valor
FROM public.users
UNION ALL
SELECT 
    'Total de usuários' AS categoria,
    '' AS detalhe,
    COUNT(*)::text AS valor
FROM public.users
UNION ALL
SELECT 
    'Emails duplicados (mesmo tipo)' AS categoria,
    '' AS detalhe,
    (
        SELECT COUNT(*)::text
        FROM (
            SELECT email
            FROM public.users
            GROUP BY email
            HAVING COUNT(*) > 1
        ) AS dup
    ) AS valor
UNION ALL
SELECT 
    'Emails com múltiplos tipos' AS categoria,
    '' AS detalhe,
    (
        SELECT COUNT(DISTINCT email)::text
        FROM public.users
        GROUP BY email
        HAVING COUNT(DISTINCT type) > 1
    ) AS valor
UNION ALL
SELECT 
    'Usuários com email duplicado' AS categoria,
    '' AS detalhe,
    (
        SELECT COUNT(*)::text
        FROM public.users
        WHERE email IN (
            SELECT email
            FROM public.users
            GROUP BY email
            HAVING COUNT(*) > 1
        )
    ) AS valor;

-- =====================================================
-- 4. EMAILS DUPLICADOS (MESMO TIPO)
-- =====================================================

SELECT 
    email,
    type,
    COUNT(*) AS total_duplicados,
    STRING_AGG(name, ' | ' ORDER BY created_at) AS nomes,
    STRING_AGG(id::text, ', ' ORDER BY created_at) AS ids,
    STRING_AGG(created_at::text, ', ' ORDER BY created_at) AS datas_criacao
FROM public.users
GROUP BY email, type
HAVING COUNT(*) > 1
ORDER BY email, type;

-- =====================================================
-- 5. CASOS ESPECÍFICOS: EMAILS CONHECIDOS
-- =====================================================

-- Verificar emails específicos que podem estar duplicados
SELECT 
    email,
    type,
    name,
    id,
    created_at,
    CASE 
        WHEN email IN (
            SELECT email FROM public.users 
            GROUP BY email 
            HAVING COUNT(DISTINCT type) > 1
        ) THEN '⚠️ DUPLICADO EM MÚLTIPLOS TIPOS'
        WHEN email IN (
            SELECT email FROM public.users 
            GROUP BY email, type 
            HAVING COUNT(*) > 1
        ) THEN '⚠️ DUPLICADO NO MESMO TIPO'
        ELSE '✅ ÚNICO'
    END AS status
FROM public.users
WHERE email IN (
    'phpg69@gmail.com',
    'rrvalenca@gmail.com',
    'eduardoscfaveret@gmail.com',
    'cbdrcpremium@gmail.com',
    'iaianoaesperanza@gmail.com',
    'joao.vidal@gmail.com',
    'cbdrepremium@gmail.com',
    'jvbiocann@gmail.com'
)
ORDER BY email, type;

-- =====================================================
-- 6. RECOMENDAÇÕES: QUAIS MANTER E QUAIS REMOVER
-- =====================================================

-- Para cada email duplicado, sugerir qual manter (mais recente ou mais completo)
WITH duplicados AS (
    SELECT 
        email,
        type,
        id,
        name,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY email, type ORDER BY created_at DESC) AS rn
    FROM public.users
    WHERE email IN (
        SELECT email
        FROM public.users
        GROUP BY email
        HAVING COUNT(*) > 1
    )
)
SELECT 
    email,
    type,
    id AS id_manter,
    name AS nome_manter,
    created_at AS data_criacao,
    '✅ MANTER (mais recente)' AS acao
FROM duplicados
WHERE rn = 1
ORDER BY email, type;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Verificação de emails duplicados concluída!' AS status;
