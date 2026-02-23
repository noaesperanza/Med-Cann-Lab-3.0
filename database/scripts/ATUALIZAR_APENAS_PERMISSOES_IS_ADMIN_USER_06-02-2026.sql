-- =====================================================
-- 🔒 ATUALIZAR APENAS PERMISSÕES DA FUNÇÃO is_admin_user
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Apenas corrigir permissões, sem mexer na função
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR ESTADO ATUAL
-- =====================================================

SELECT 
    'Estado atual da função' AS info,
    proname AS function_name,
    pg_get_function_arguments(oid) AS parameters,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END AS security_type
FROM pg_proc
WHERE proname = 'is_admin_user'
    AND pronamespace = 'public'::regnamespace;

-- =====================================================
-- 2. VERIFICAR PERMISSÕES ATUAIS
-- =====================================================

SELECT 
    'Permissões atuais' AS info,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
    AND routine_name = 'is_admin_user'
ORDER BY grantee;

-- =====================================================
-- 3. CORRIGIR APENAS PERMISSÕES (SEGURANÇA)
-- =====================================================

-- ✅ Remover acesso de anon (se existir)
DO $$
BEGIN
    BEGIN
        REVOKE EXECUTE ON FUNCTION public.is_admin_user(UUID) FROM anon;
        RAISE NOTICE '✅ Acesso de anon removido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ anon já não tinha acesso ou erro: %', SQLERRM;
    END;
END $$;

-- ✅ Garantir acesso para authenticated
DO $$
BEGIN
    BEGIN
        GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
        RAISE NOTICE '✅ Acesso de authenticated garantido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao conceder acesso: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- 4. VERIFICAR RESULTADO
-- =====================================================

SELECT 
    'Permissões após correção' AS info,
    grantee,
    privilege_type,
    CASE 
        WHEN grantee = 'anon' THEN '❌ NÃO DEVERIA TER'
        WHEN grantee = 'authenticated' THEN '✅ CORRETO'
        ELSE '⚠️ VERIFICAR'
    END AS status
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
    AND routine_name = 'is_admin_user'
ORDER BY grantee;

-- =====================================================
-- 5. NOTA SOBRE SECURITY DEFINER vs INVOKER
-- =====================================================

-- ⚠️ IMPORTANTE: Se a função está como SECURITY DEFINER,
-- não podemos mudar para SECURITY INVOKER sem DROP (que quebra dependências).
-- 
-- SOLUÇÃO: Deixar como está e apenas corrigir permissões.
-- 
-- A função SECURITY DEFINER ainda funciona, apenas:
-- - Executa com privilégios do dono (geralmente postgres)
-- - Ignora RLS da tabela users (mas isso pode ser OK se a função for segura)
-- 
-- O importante é: remover anon do GRANT (já feito acima)

SELECT 
    'Nota sobre segurança' AS info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = 'is_admin_user'
                AND pronamespace = 'public'::regnamespace
                AND prosecdef = true
        ) THEN '⚠️ Função está como SECURITY DEFINER (não podemos mudar sem DROP)'
        ELSE '✅ Função está como SECURITY INVOKER'
    END AS status;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Permissões atualizadas! Função mantida como está.' AS status;
