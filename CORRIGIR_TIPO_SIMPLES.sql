-- CORREÇÃO SIMPLES - APENAS TIPO DO USUÁRIO
-- Execute este script no Supabase SQL Editor

-- Corrigir apenas o tipo do usuário profrvalenca@gmail.com
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{type}', 
    '"patient"'::jsonb
)
WHERE email = 'profrvalenca@gmail.com';

-- Verificar se foi corrigido
SELECT 
    email,
    raw_user_meta_data->>'type' as tipo_corrigido,
    raw_user_meta_data->>'name' as nome
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';
