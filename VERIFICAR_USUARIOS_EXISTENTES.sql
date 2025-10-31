-- VERIFICAR USUÁRIOS EXISTENTES NO BANCO
-- Execute este script para ver todos os usuários registrados

-- Ver todos os usuários com seus tipos
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_usuario,
    raw_user_meta_data->>'name' as nome_usuario,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Ver apenas usuários sem tipo definido
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' IS NULL 
   OR raw_user_meta_data->>'type' = ''
ORDER BY created_at DESC;

-- Contar usuários por tipo
SELECT 
    raw_user_meta_data->>'type' as tipo,
    COUNT(*) as quantidade
FROM auth.users 
WHERE raw_user_meta_data->>'type' IS NOT NULL
GROUP BY raw_user_meta_data->>'type'
ORDER BY quantidade DESC;
