-- LISTAR TODOS OS USUÁRIOS DO SISTEMA
-- Use este script para ver quem realmente existe no banco de dados.

SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data->>'type' as papel, -- admin, professional, paciente
    created_at as data_criacao,
    last_sign_in_at as ultimo_login
FROM auth.users 
ORDER BY created_at DESC;
