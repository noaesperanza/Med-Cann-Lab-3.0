-- =====================================================
-- 🔍 DEBUG DO LOGIN
-- =====================================================

-- 1. VERIFICAR USUÁRIO NO AUTH
SELECT 
    'USUÁRIO NO AUTH' as status,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'phpg69@gmail.com';

-- 2. VERIFICAR USUÁRIO NA TABELA USUARIOS
SELECT 
    'USUÁRIO NA TABELA' as status,
    id,
    nome,
    nivel,
    permissoes,
    timestamp
FROM usuarios 
WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com');

-- 3. VERIFICAR SE EMAIL ESTÁ CONFIRMADO
SELECT 
    'STATUS DO EMAIL' as status,
    email,
    email_confirmed_at IS NOT NULL as email_confirmado,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'phpg69@gmail.com';
