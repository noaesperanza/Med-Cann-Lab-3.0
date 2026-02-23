-- =====================================================
-- DELETAR USUÁRIO ALUNO DE TESTE
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script remove o usuário aluno.teste@medcannlab.com
-- Use apenas se precisar recriar o usuário via registro na aplicação

-- Deletar usuário
DELETE FROM auth.users 
WHERE email = 'aluno.teste@medcannlab.com';

-- Verificar se foi deletado
SELECT 
    email,
    'Usuário deletado com sucesso' as status
FROM auth.users 
WHERE email = 'aluno.teste@medcannlab.com';
-- Se retornar vazio, o usuário foi deletado
