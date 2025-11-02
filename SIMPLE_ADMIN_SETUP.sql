-- =====================================================
-- 👑 CONFIGURAÇÃO SIMPLES DO ADMIN
-- =====================================================

-- 1. VERIFICAR USUÁRIO NO AUTH
SELECT 
    'USUÁRIO NO AUTH' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'phpg69@gmail.com';

-- 2. INSERIR/ATUALIZAR USUÁRIO COMO ADMIN (usando UUID direto)
INSERT INTO usuarios (
    id,
    nome,
    nivel,
    permissoes,
    timestamp
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'phpg69@gmail.com')::text,
    'Administrador Principal',
    'admin',
    '{"admin": true, "moderacao": true, "analytics": true}'::jsonb,
    NOW()
);

-- 3. VERIFICAR SE FOI CRIADO
SELECT 
    'ADMIN CRIADO!' as status,
    id,
    nome,
    nivel,
    permissoes,
    timestamp
FROM usuarios 
WHERE id = (SELECT id FROM auth.users WHERE email = 'phpg69@gmail.com')::text;

-- 4. RESUMO FINAL
SELECT 
    'SISTEMA CONFIGURADO!' as title,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'admin') as total_admins,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios;
