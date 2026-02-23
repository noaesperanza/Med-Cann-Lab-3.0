-- Listar TODOS os profissionais e administradores para identificarmos os corretos
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'name' as name, 
    raw_user_meta_data->>'type' as type
FROM auth.users 
WHERE raw_user_meta_data->>'type' IN ('profissional', 'admin', 'master')
ORDER BY raw_user_meta_data->>'name';
