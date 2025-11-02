-- Script SIMPLIFICADO para alterar usuário profrvalenca@gmail.com para 'patient'
-- Execute apenas esta parte primeiro:

-- 1. Atualizar o tipo de usuário para 'patient'
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"user_type": "patient"}'::jsonb
WHERE email = 'profrvalenca@gmail.com';

-- 2. Verificar a alteração
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_type' as new_type,
    raw_user_meta_data->>'name' as name
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';
