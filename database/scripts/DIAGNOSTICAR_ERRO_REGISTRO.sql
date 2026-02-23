-- =====================================================
-- DIAGNOSTICAR ERRO NO REGISTRO DE USUÁRIOS
-- =====================================================
-- Execute este script no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar estrutura da tabela users
SELECT 
    'ESTRUTURA_TABELA' as verificacao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela users
SELECT 
    'CONSTRAINTS' as verificacao,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- 3. Verificar políticas RLS na tabela users
SELECT 
    'RLS_POLICIES' as verificacao,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public';

-- 4. Verificar se RLS está habilitado
SELECT 
    'RLS_STATUS' as verificacao,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users'
  AND schemaname = 'public';

-- 5. Verificar trigger e função
SELECT 
    'TRIGGER_INFO' as verificacao,
    t.trigger_name,
    t.event_manipulation,
    t.action_statement,
    t.action_timing,
    p.proname as function_name,
    p.prosrc as function_source
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON p.proname = 'handle_new_user'
WHERE t.trigger_name = 'on_auth_user_created';

-- 6. Verificar se há algum erro nos logs recentes
-- (Nota: Logs do Supabase geralmente não são acessíveis via SQL, mas podemos verificar a função)
SELECT 
    'FUNCAO_VERIFICACAO' as verificacao,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- 7. Testar inserção manual (simulação)
-- Este teste ajuda a identificar se o problema é com a estrutura ou com o trigger
DO $$
DECLARE
  test_id UUID := gen_random_uuid();
  test_email TEXT := 'test_' || extract(epoch from now())::text || '@test.com';
  test_name TEXT := 'Test User';
  test_type TEXT := 'student';
BEGIN
  -- Tentar inserir diretamente na tabela users
  BEGIN
    INSERT INTO public.users (id, email, name, type)
    VALUES (test_id, test_email, test_name, test_type);
    
    RAISE NOTICE '✅ Inserção manual bem-sucedida!';
    
    -- Limpar teste
    DELETE FROM public.users WHERE id = test_id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro na inserção manual: %', SQLERRM;
  END;
END $$;

