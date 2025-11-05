-- =====================================================
-- VERIFICAR E CORRIGIR RLS NA TABELA users
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script verifica se RLS está bloqueando a inserção do trigger

-- 1. Verificar se RLS está habilitado
SELECT 
    'RLS_STATUS' as verificacao,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users'
  AND schemaname = 'public';

-- 2. Verificar políticas RLS existentes
SELECT 
    'RLS_POLICIES' as verificacao,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public';

-- 3. Se RLS estiver habilitado, criar política para permitir inserção via trigger
-- IMPORTANTE: O trigger usa SECURITY DEFINER, então deve ter permissões adequadas
-- Mas vamos garantir que há uma política que permita inserção

-- Primeiro, verificar se há política de INSERT
DO $$
BEGIN
  -- Se não houver política de INSERT, criar uma temporária para permitir inserção via trigger
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'users' 
      AND schemaname = 'public'
      AND cmd = 'INSERT'
  ) THEN
    -- Criar política que permite inserção para usuários autenticados
    -- Mas o trigger usa SECURITY DEFINER, então deve funcionar mesmo sem política
    RAISE NOTICE '⚠️ Nenhuma política de INSERT encontrada. O trigger deve funcionar com SECURITY DEFINER.';
  ELSE
    RAISE NOTICE '✅ Política de INSERT encontrada.';
  END IF;
END $$;

-- 4. Verificar se a função handle_new_user tem permissões adequadas
SELECT 
    'FUNCAO_PERMISSOES' as verificacao,
    p.proname as function_name,
    p.prosecdef as security_definer,
    p.proacl as permissions
FROM pg_proc p
WHERE p.proname = 'handle_new_user'
  AND p.pronamespace = 'public'::regnamespace;

-- 5. Se necessário, desabilitar RLS temporariamente para testar
-- (NÃO RECOMENDADO EM PRODUÇÃO, mas pode ser necessário para debug)
-- Descomente a linha abaixo apenas para debug:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 6. Verificar se há constraints que podem estar bloqueando
SELECT 
    'CONSTRAINTS' as verificacao,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype IN ('c', 'f', 'u', 'p'); -- c=check, f=foreign key, u=unique, p=primary key

