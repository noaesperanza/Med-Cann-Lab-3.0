-- SOLUÇÃO DIRETA: FORÇAR TIPO ADMIN PARA RICARDO
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os usuários com email relacionado ao Ricardo
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_atual,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email LIKE '%ricardo%' 
   OR email LIKE '%rrvlenca%' 
   OR email LIKE '%profrvalenca%'
   OR email LIKE '%valenca%'
ORDER BY created_at DESC;

-- 2. FORÇAR tipo admin para TODOS os usuários do Ricardo
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{type}', 
        '"admin"'::jsonb
    ),
    '{name}', 
    '"Dr. Ricardo Valença"'::jsonb
)
WHERE email LIKE '%ricardo%' 
   OR email LIKE '%rrvlenca%' 
   OR email LIKE '%profrvalenca%'
   OR email LIKE '%valenca%';

-- 3. Verificar resultado
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_corrigido,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%ricardo%' 
   OR email LIKE '%rrvlenca%' 
   OR email LIKE '%profrvalenca%'
   OR email LIKE '%valenca%'
ORDER BY created_at DESC;
