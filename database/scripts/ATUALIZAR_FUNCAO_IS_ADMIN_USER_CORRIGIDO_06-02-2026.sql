-- =====================================================
-- 🔒 ATUALIZAR FUNÇÃO is_admin_user (VERSÃO CORRIGIDA)
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Atualizar função mantendo nome do parâmetro original
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR FUNÇÃO ATUAL (NOME DO PARÂMETRO)
-- =====================================================

SELECT 
    proname AS function_name,
    pg_get_function_arguments(oid) AS parameters,
    prosecdef AS is_security_definer,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname = 'is_admin_user'
    AND pronamespace = 'public'::regnamespace;

-- =====================================================
-- 2. ATUALIZAR FUNÇÃO (MANTENDO NOME DO PARÂMETRO ORIGINAL)
-- =====================================================

-- ✅ CORREÇÃO: Usar CREATE OR REPLACE mantendo nome do parâmetro original
-- Se a função usa _user_id, manteremos _user_id
-- Se a função usa user_id, manteremos user_id

-- Tentar com _user_id primeiro (mais comum)
DO $$
BEGIN
    -- Verificar qual nome de parâmetro a função atual usa
    IF EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'is_admin_user'
            AND pronamespace = 'public'::regnamespace
            AND pg_get_function_arguments(oid) LIKE '%_user_id%'
    ) THEN
        -- Função usa _user_id, atualizar mantendo esse nome
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
        RETURNS BOOLEAN
        LANGUAGE sql
        SECURITY INVOKER
        STABLE
        AS $func$
          SELECT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = _user_id
              AND type IN (''admin'', ''master'', ''gestor'')
          );
        $func$;';
        
        RAISE NOTICE '✅ Função atualizada mantendo parâmetro _user_id';
    ELSE
        -- Função usa user_id, atualizar mantendo esse nome
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
        RETURNS BOOLEAN
        LANGUAGE sql
        SECURITY INVOKER
        STABLE
        AS $func$
          SELECT EXISTS (
            SELECT 1 FROM public.users
            WHERE id = user_id
              AND type IN (''admin'', ''master'', ''gestor'')
          );
        $func$;';
        
        RAISE NOTICE '✅ Função atualizada mantendo parâmetro user_id';
    END IF;
END $$;

-- =====================================================
-- 3. CORRIGIR PERMISSÕES (SEGURANÇA)
-- =====================================================

-- ✅ Remover acesso de anon (se existir)
DO $$
BEGIN
    -- Tentar revogar de anon (pode não existir, então usar DO)
    BEGIN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_admin_user(UUID) FROM anon';
        RAISE NOTICE '✅ Acesso de anon removido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ anon já não tinha acesso ou função não existe';
    END;
END $$;

-- ✅ Garantir acesso apenas para authenticated
DO $$
BEGIN
    BEGIN
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated';
        RAISE NOTICE '✅ Acesso de authenticated garantido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao conceder acesso: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- 4. VERIFICAR RESULTADO
-- =====================================================

SELECT 
    proname AS function_name,
    pg_get_function_arguments(oid) AS parameters,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END AS security_type,
    '✅ ATUALIZADA' AS status
FROM pg_proc
WHERE proname = 'is_admin_user'
    AND pronamespace = 'public'::regnamespace;

-- Verificar permissões
SELECT 
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
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Função is_admin_user atualizada com sucesso!' AS status;
