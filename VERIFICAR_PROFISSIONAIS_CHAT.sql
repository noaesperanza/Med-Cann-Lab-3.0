-- =====================================================
-- VERIFICAR PROFISSIONAIS PARA O CHAT
-- =====================================================
-- Este script verifica se os profissionais estão cadastrados
-- e podem ser encontrados pela busca do chat

-- 1. Verificar se os profissionais existem na tabela users
SELECT 
    id,
    email,
    name,
    type,
    created_at
FROM users
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
ORDER BY email;

-- 2. Verificar se há algum profissional com type='professional' ou type='admin'
SELECT 
    id,
    email,
    name,
    type,
    created_at
FROM users
WHERE type IN ('professional', 'admin')
ORDER BY type, email;

-- 3. Verificar todos os usuários para debug
SELECT 
    id,
    email,
    name,
    type,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;

-- 4. Verificar políticas RLS na tabela users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

