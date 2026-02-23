-- =====================================================
-- 👑 VERIFICAR QUEM SÃO OS ADMINS
-- =====================================================

-- 1. LISTAR TODOS OS ADMINS
SELECT 
    'ADMINS DO SISTEMA' as categoria,
    id,
    nome,
    nivel,
    permissoes,
    timestamp
FROM usuarios 
WHERE nivel = 'admin'
ORDER BY timestamp;

-- 2. VERIFICAR SE HÁ USUÁRIOS NO AUTH
SELECT 
    'USUÁRIOS NO AUTH' as categoria,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at;

-- 3. COMPARAR USUÁRIOS AUTH COM USUARIOS
SELECT 
    'COMPARAÇÃO' as categoria,
    au.id as auth_id,
    au.email,
    u.id as usuario_id,
    u.nome,
    u.nivel
FROM auth.users au
LEFT JOIN usuarios u ON au.id::text = u.id
ORDER BY au.created_at;
