-- 🔧 SCRIPT SIMPLIFICADO PARA CORRIGIR TIPOS DE USUÁRIO
-- Versão sem ON CONFLICT para evitar problemas de constraint

-- 1. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as current_type,
    raw_user_meta_data->>'name' as current_name,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. ATUALIZAR METADADOS DO DR. RICARDO VALENÇA
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE email = 'rrvalenca@gmail.com';

-- 3. ATUALIZAR METADADOS DO DR. EDUARDO FAVERET
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE email = 'eduardoscfaveret@gmail.com';

-- 4. ATUALIZAR METADADOS DO ADMIN
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"admin"'::jsonb
)
WHERE email = 'admin@medcannlab.com';

-- 5. VERIFICAR RESULTADO DAS ATUALIZAÇÕES
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_after_update,
    raw_user_meta_data->>'name' as name_after_update
FROM auth.users 
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com', 'admin@medcannlab.com');

-- 6. VERIFICAR TODOS OS USUÁRIOS APÓS AS CORREÇÕES
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as user_type,
    raw_user_meta_data->>'name' as user_name,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 7. VERIFICAR USUÁRIOS SEM TIPO DEFINIDO
SELECT 
    id,
    email,
    raw_user_meta_data
FROM auth.users 
WHERE raw_user_meta_data->>'type' IS NULL 
   OR raw_user_meta_data->>'type' = '';

-- 📝 INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique os resultados de cada consulta
-- 3. Para criar usuários de teste, use a interface de registro da aplicação
-- 4. Teste o login após executar as correções
