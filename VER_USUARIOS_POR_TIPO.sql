-- VER USUÁRIOS ESPECÍFICOS POR TIPO
-- Execute este script para ver os emails de cada tipo de usuário

-- Ver todos os usuários com emails e tipos
SELECT 
    email,
    raw_user_meta_data->>'type' as tipo,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' IS NOT NULL
ORDER BY raw_user_meta_data->>'type', created_at DESC;

-- Ver apenas pacientes
SELECT 
    email,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' = 'patient'
ORDER BY created_at DESC;

-- Ver apenas profissionais
SELECT 
    email,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' = 'professional'
ORDER BY created_at DESC;

-- Ver apenas admins
SELECT 
    email,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' = 'admin'
ORDER BY created_at DESC;

-- Ver apenas estudantes
SELECT 
    email,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' = 'student'
ORDER BY created_at DESC;

-- Ver usuário especial (Professor Ricardo Valença)
SELECT 
    email,
    raw_user_meta_data->>'type' as tipo,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' = 'Professor Ricardo Valença';
