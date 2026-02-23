-- ============================================================================
-- SCRIPT DE LIMPEZA DE USUÁRIOS DE TESTE
-- Data: 2025-12-23
-- Descrição: Remove os usuários fictícios criados para testes de rotas estruturadas.
-- ATENÇÃO: Execute apenas se tiver certeza que deseja remover esses dados.
-- ============================================================================

DELETE FROM auth.users 
WHERE email IN (
    'aluno.ensino@medcannlab.com',
    'aluno.pesquisa@medcannlab.com',
    'paciente.clinica@medcannlab.com',
    'paciente.teste@medcannlab.com',
    'profissional.clinica@medcannlab.com',
    'profissional.ensino@medcannlab.com',
    'profissional.pesquisa@medcannlab.com',
    'estudante.teste@medcannlab.com'
);

-- O Supabase tem "Cascade Delete" configurado geralmente, então remover de auth.users
-- deve remover automaticamente os perfis associados na tabela public.users.
-- Caso contrário, remova também de public.users:

DELETE FROM public.users 
WHERE email IN (
    'aluno.ensino@medcannlab.com',
    'aluno.pesquisa@medcannlab.com',
    'paciente.clinica@medcannlab.com',
    'paciente.teste@medcannlab.com',
    'profissional.clinica@medcannlab.com',
    'profissional.ensino@medcannlab.com',
    'profissional.pesquisa@medcannlab.com',
    'estudante.teste@medcannlab.com'
);

SELECT 'Usuários de teste removidos com sucesso' as status;
