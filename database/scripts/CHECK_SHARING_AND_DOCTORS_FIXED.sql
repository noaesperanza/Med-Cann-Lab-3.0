-- Verificar se a função existe
SELECT routines.routine_name
FROM information_schema.routines
WHERE routines.routine_name = 'share_report_with_doctors';

-- Listar médicos disponíveis (Ricardo e Eduardo) usando metadados
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'name' as name, 
    raw_user_meta_data->>'type' as type
FROM auth.users 
WHERE email IN ('eduardoscfaveret@gmail.com', 'profrvalenca@gmail.com', 'ricardo.valenca@medcannlab.com.br')
   OR raw_user_meta_data->>'type' IN ('profissional', 'admin', 'master');
