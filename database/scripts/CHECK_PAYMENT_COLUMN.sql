
-- VERIFICACAO PROFUNDA DA TABELA USERS
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'users'
    AND column_name = 'payment_status';

-- CHECAR SE TEM DADOS
SELECT count(*) as total_users, 
       count(payment_status) as users_with_status 
FROM public.users;

-- CHECAR POLICIES (RLS)
select * from pg_policies where tablename = 'users';
