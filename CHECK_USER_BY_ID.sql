-- =====================================================
-- 🔍 VERIFICAR USUÁRIO POR ID
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE NA TABELA USUARIOS
SELECT 
    'USUÁRIO NA TABELA USUARIOS' as status,
    id,
    nome,
    nivel,
    permissoes,
    timestamp
FROM usuarios 
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';

-- 2. VERIFICAR TODOS OS USUÁRIOS
SELECT 
    'TODOS OS USUÁRIOS' as status,
    id,
    nome,
    nivel,
    timestamp
FROM usuarios 
ORDER BY timestamp;

-- 3. VERIFICAR SE O ID EXISTE NO AUTH
SELECT 
    'USUÁRIO NO AUTH' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';
