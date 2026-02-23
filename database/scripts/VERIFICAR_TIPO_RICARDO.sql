-- VERIFICAR TIPO DO USUÁRIO RICARDO VALENÇA
-- Execute este script para ver o tipo atual do usuário

-- Verificar usuário por email
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_usuario,
    raw_user_meta_data->>'name' as nome_usuario,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email LIKE '%ricardo%' OR email LIKE '%rrvlenca%' OR email LIKE '%profrvalenca%'
ORDER BY created_at DESC;

-- Verificar todos os usuários com tipo admin
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_usuario,
    raw_user_meta_data->>'name' as nome_usuario,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' = 'admin'
ORDER BY created_at DESC;
