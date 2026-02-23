-- CORRIGIR TIPO DO USUÁRIO profrvalenca@gmail.com
-- Execute este script para corrigir o tipo do usuário

-- 1. Verificar o usuário atual
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_atual,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';

-- 2. Corrigir o tipo para 'patient' (já que foi criado como paciente)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{type}', 
    '"patient"'::jsonb
)
WHERE email = 'profrvalenca@gmail.com';

-- 3. Adicionar nome se não existir
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{name}', 
    '"Professor Ricardo Valença"'::jsonb
)
WHERE email = 'profrvalenca@gmail.com';

-- 4. Verificar resultado
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_corrigido,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';
