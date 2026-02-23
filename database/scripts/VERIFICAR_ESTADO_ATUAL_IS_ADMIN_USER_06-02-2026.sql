-- =====================================================
-- 🔍 VERIFICAR ESTADO ATUAL DA FUNÇÃO is_admin_user
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Ver exatamente como a função está definida hoje
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. DEFINIÇÃO COMPLETA DA FUNÇÃO
-- =====================================================

SELECT 
    proname AS function_name,
    pg_get_function_arguments(oid) AS parameters,
    pg_get_function_result(oid) AS return_type,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END AS security_type,
    proisstrict AS is_strict,
    provolatile AS volatility,
    pg_get_functiondef(oid) AS full_definition
FROM pg_proc
WHERE proname = 'is_admin_user'
    AND pronamespace = 'public'::regnamespace;

-- =====================================================
-- 2. PERMISSÕES ATUAIS
-- =====================================================

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
    AND routine_name = 'is_admin_user'
ORDER BY grantee;

-- =====================================================
-- 3. DEPENDÊNCIAS (POLICIES QUE USAM A FUNÇÃO)
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd AS operation,
    qual::text AS policy_condition
FROM pg_policies
WHERE qual::text LIKE '%is_admin_user%'
    OR with_check::text LIKE '%is_admin_user%'
ORDER BY tablename, policyname;

-- =====================================================
-- 4. TESTAR FUNÇÃO (SE POSSÍVEL)
-- =====================================================

-- Tentar chamar a função (pode falhar se não estiver autenticado)
SELECT 
    'Teste da função' AS teste,
    public.is_admin_user(auth.uid()) AS resultado,
    'Se retornar NULL ou erro, é normal (não autenticado no SQL Editor)' AS observacao;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Verificação concluída! Veja os resultados acima.' AS status;
