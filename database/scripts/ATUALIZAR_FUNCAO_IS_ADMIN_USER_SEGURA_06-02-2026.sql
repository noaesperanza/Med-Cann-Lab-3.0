-- =====================================================
-- 🔒 ATUALIZAR FUNÇÃO is_admin_user (VERSÃO SEGURA)
-- =====================================================
-- Data: 06/02-2026
-- Objetivo: Atualizar função sem quebrar dependências
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR FUNÇÃO ATUAL
-- =====================================================

SELECT 
    proname AS function_name,
    prosecdef AS is_security_definer,
    proconfig AS config,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname = 'is_admin_user'
    AND pronamespace = 'public'::regnamespace;

-- =====================================================
-- 2. VERIFICAR DEPENDÊNCIAS
-- =====================================================

SELECT 
    dependent_ns.nspname AS schema_name,
    dependent_view.relname AS dependent_object,
    dependent_view.relkind AS object_type
FROM pg_depend
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class AS dependent_view ON pg_rewrite.ev_class = dependent_view.oid
JOIN pg_class AS source_table ON pg_depend.refobjid = source_table.oid
JOIN pg_namespace dependent_ns ON dependent_ns.oid = dependent_view.relnamespace
JOIN pg_namespace source_ns ON source_ns.oid = source_table.relnamespace
WHERE source_table.relname = 'users'
    AND dependent_view.relname IN (
        SELECT tablename FROM pg_policies
        WHERE qual::text LIKE '%is_admin_user%'
    )
UNION
SELECT 
    'public' AS schema_name,
    policyname AS dependent_object,
    'policy' AS object_type
FROM pg_policies
WHERE qual::text LIKE '%is_admin_user%'
ORDER BY dependent_object;

-- =====================================================
-- 3. ATUALIZAR FUNÇÃO (CREATE OR REPLACE - SEGURO)
-- =====================================================

-- ✅ CREATE OR REPLACE mantém dependências intactas
-- ✅ Mudança de SECURITY DEFINER para SECURITY INVOKER é permitida
-- ✅ CORREÇÃO: A função existente usa _user_id (com underscore)
-- PostgreSQL não permite mudar nome do parâmetro com CREATE OR REPLACE
-- Devemos manter o nome original: _user_id

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER  -- ✅ CORRIGIDO: Era SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = _user_id  -- ✅ CORRIGIDO: Usar _user_id (com underscore)
      AND type IN ('admin', 'master', 'gestor')
  );
$$;

-- =====================================================
-- 4. CORRIGIR PERMISSÕES (SEGURANÇA)
-- =====================================================

-- ✅ Remover acesso de anon (se existir)
REVOKE EXECUTE ON FUNCTION public.is_admin_user(UUID) FROM anon;

-- ✅ Garantir acesso apenas para authenticated
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

-- =====================================================
-- 5. VERIFICAR RESULTADO
-- =====================================================

SELECT 
    proname AS function_name,
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
-- 6. TESTAR FUNÇÃO (SIMULAÇÃO)
-- =====================================================

-- Testar se função funciona (deve retornar false para UUID inválido)
SELECT 
    public.is_admin_user('00000000-0000-0000-0000-000000000000'::UUID) AS test_result,
    'Função funcionando' AS status;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Função is_admin_user atualizada com sucesso!' AS status;
