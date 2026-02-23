-- 🔧 CORREÇÃO DOS USUÁRIOS EXISTENTES
-- Baseado nos dados encontrados no banco

-- 1. CORRIGIR USUÁRIO passosmir4@gmail.com (ID: df6cee2d-2697-47eb-9ae2-f4d439df711f)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"patient"'::jsonb
)
WHERE id = 'df6cee2d-2697-47eb-9ae2-f4d439df711f';

-- 2. CORRIGIR USUÁRIO phpg69@gmail.com (ID: 5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"admin"'::jsonb
)
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';

-- 3. CORRIGIR USUÁRIO rrvlenca@gmail.com (ID: 659ed341-74ac-413e-b708-332aff3e75bf)
-- Este parece ser o Dr. Ricardo Valença com email ligeiramente diferente
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE id = '659ed341-74ac-413e-b708-332aff3e75bf';

-- 4. VERIFICAR RESULTADO DAS CORREÇÕES
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_after_update,
    raw_user_meta_data->>'name' as name_after_update,
    raw_user_meta_data
FROM auth.users 
WHERE id IN (
    'df6cee2d-2697-47eb-9ae2-f4d439df711f',
    '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
    '659ed341-74ac-413e-b708-332aff3e75bf'
);

-- 5. VERIFICAR TODOS OS USUÁRIOS APÓS AS CORREÇÕES
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as user_type,
    raw_user_meta_data->>'name' as user_name,
    created_at
FROM auth.users 
ORDER BY created_at DESC;
