-- =====================================================
-- 🔍 VERIFICAÇÃO FINAL DO SISTEMA
-- =====================================================

-- 1. USUÁRIOS POR TIPO
SELECT 
    'USUÁRIOS POR TIPO' as categoria,
    nivel,
    COUNT(*) as total
FROM usuarios 
GROUP BY nivel
ORDER BY total DESC;

-- 2. ADMINS CONFIGURADOS
SELECT 
    'ADMINS ATIVOS' as status,
    id,
    nome,
    nivel,
    permissoes->>'admin' as is_admin,
    timestamp
FROM usuarios 
WHERE nivel = 'admin';

-- 3. PROFISSIONAIS DA SAÚDE
SELECT 
    'PROFISSIONAIS' as status,
    id,
    nome,
    nivel,
    permissoes->>'crm' as crm,
    permissoes->>'cro' as cro,
    timestamp
FROM usuarios 
WHERE nivel = 'professional';

-- 4. ALUNOS
SELECT 
    'ALUNOS' as status,
    id,
    nome,
    nivel,
    permissoes->>'curso' as curso,
    timestamp
FROM usuarios 
WHERE nivel = 'student';

-- 5. PACIENTES
SELECT 
    'PACIENTES' as status,
    id,
    nome,
    nivel,
    permissoes->>'diagnostico' as diagnostico,
    timestamp
FROM usuarios 
WHERE nivel = 'patient';

-- 6. RESUMO GERAL
SELECT 
    'SISTEMA 100% FUNCIONAL!' as title,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'admin') as admins,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'professional') as profissionais,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'student') as alunos,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'patient') as pacientes;
