-- =====================================================
-- 🧹 LIMPAR DADOS DE TESTE
-- =====================================================

-- 1. VERIFICAR USUÁRIOS ANTES DA LIMPEZA
SELECT 
    'ANTES DA LIMPEZA' as status,
    id,
    nome,
    nivel,
    timestamp
FROM usuarios 
ORDER BY timestamp;

-- 2. REMOVER USUÁRIOS DE TESTE (manter apenas phpg69@gmail.com)
DELETE FROM usuarios 
WHERE id NOT IN (
    SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com'
);

-- 3. VERIFICAR USUÁRIOS APÓS A LIMPEZA
SELECT 
    'APÓS A LIMPEZA' as status,
    id,
    nome,
    nivel,
    timestamp
FROM usuarios 
ORDER BY timestamp;

-- 4. RESUMO FINAL
SELECT 
    'SISTEMA LIMPO!' as title,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'admin') as admins,
    (SELECT nome FROM usuarios WHERE nivel = 'admin' LIMIT 1) as admin_principal;
