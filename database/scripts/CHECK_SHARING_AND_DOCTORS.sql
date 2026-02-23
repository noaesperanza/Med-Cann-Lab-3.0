-- Verificar se a função existe
SELECT routines.routine_name
FROM information_schema.routines
WHERE routines.routine_name = 'share_report_with_doctors';

-- Listar médicos disponíveis (Ricardo e Eduardo)
SELECT id, name, email, type 
FROM auth.users 
WHERE email IN ('ricardo.valenca@medcannlab.com.br', 'eduardo.faveret@medcannlab.com.br')
   OR type IN ('profissional', 'admin', 'master');
