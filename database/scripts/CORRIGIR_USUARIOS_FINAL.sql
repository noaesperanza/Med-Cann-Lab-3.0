-- CORREÇÃO DOS USUÁRIOS EXISTENTES
-- Execute este script no Supabase SQL Editor

-- 1. Corrigir passosmir4@gmail.com (paciente)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"patient"'::jsonb
)
WHERE id = 'df6cee2d-2697-47eb-9ae2-f4d439df711f';

-- 2. Corrigir phpg69@gmail.com (admin)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"admin"'::jsonb
)
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';

-- 3. Corrigir rrvlenca@gmail.com (profissional)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE id = '659ed341-74ac-413e-b708-332aff3e75bf';

-- 4. Verificar resultado
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_corrigido,
    raw_user_meta_data
FROM auth.users 
WHERE id IN (
    'df6cee2d-2697-47eb-9ae2-f4d439df711f',
    '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
    '659ed341-74ac-413e-b708-332aff3e75bf'
);
