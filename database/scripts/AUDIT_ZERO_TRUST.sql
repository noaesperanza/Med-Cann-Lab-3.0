-- 🕵️ AUDITORIA ZERO-TRUST: ESTADO ATUAL DO BANCO
-- Listar todas as tabelas, se têm RLS ativo, e contagem aproximada
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = pg_tables.tablename) as policy_count
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Listar Functions (Edge Functions não aparecem aqui, mas RPCs sim)
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Verificar estrutura crítica de 'users' (auth vs public)
-- (Não podemos listar auth.users diretamente via SQL client simples as vezes, mas vamos tentar metadados)
SELECT count(*) as total_documents FROM public.documents;
SELECT count(*) as total_patients FROM public.patients;
SELECT count(*) as total_reports FROM public.clinical_reports;
