-- CORRIGIR TIPO DO USUÁRIO RICARDO VALENÇA PARA ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_atual,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email LIKE '%ricardo%' OR email LIKE '%rrvlenca%' OR email LIKE '%profrvalenca%'
ORDER BY created_at DESC;

-- 2. Corrigir tipo para 'admin' (assumindo que é o usuário mais recente)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{type}', 
    '"admin"'::jsonb
)
WHERE email LIKE '%ricardo%' OR email LIKE '%rrvlenca%' OR email LIKE '%profrvalenca%';

-- 3. Adicionar nome se não existir
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{name}', 
    '"Dr. Ricardo Valença"'::jsonb
)
WHERE email LIKE '%ricardo%' OR email LIKE '%rrvlenca%' OR email LIKE '%profrvalenca%';

-- 4. Verificar resultado
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_corrigido,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%ricardo%' OR email LIKE '%rrvlenca%' OR email LIKE '%profrvalenca%'
ORDER BY created_at DESC;
