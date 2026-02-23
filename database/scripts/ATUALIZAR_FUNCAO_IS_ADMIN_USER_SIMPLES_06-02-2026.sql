-- =====================================================
-- 🔒 ATUALIZAR FUNÇÃO is_admin_user (VERSÃO SIMPLES)
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Atualizar função mantendo nome do parâmetro original
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR FUNÇÃO ATUAL
-- =====================================================

SELECT 
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
-- 2. ATUALIZAR FUNÇÃO (MANTENDO _user_id)
-- =====================================================

-- ✅ A função existente usa _user_id (com underscore)
-- PostgreSQL não permite mudar nome do parâmetro
-- CREATE OR REPLACE mantém dependências intactas

CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER  -- ✅ CORRIGIDO: Era SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = _user_id
      AND type IN ('admin', 'master', 'gestor')
  );
$$;

-- =====================================================
-- 3. CORRIGIR PERMISSÕES (SEGURANÇA)
-- =====================================================

-- ✅ Remover acesso de anon (se existir)
DO $$
BEGIN
    BEGIN
        REVOKE EXECUTE ON FUNCTION public.is_admin_user(UUID) FROM anon;
        RAISE NOTICE '✅ Acesso de anon removido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ anon já não tinha acesso';
    END;
END $$;

-- ✅ Garantir acesso apenas para authenticated
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

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
