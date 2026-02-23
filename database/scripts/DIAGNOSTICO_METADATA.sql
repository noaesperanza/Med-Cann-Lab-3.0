-- DIAGNÓSTICO DE METADADOS DOS USUÁRIOS
-- Vamos ver exatamente o que tem gravado no JSON de cada um

SELECT 
    email, 
    created_at,
    raw_user_meta_data 
FROM auth.users
ORDER BY created_at DESC;
