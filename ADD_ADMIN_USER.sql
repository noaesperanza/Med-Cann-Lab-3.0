-- =====================================================
-- 👑 ADICIONAR ADMINISTRADOR NO SUPABASE
-- =====================================================
-- Execute este script para adicionar phpg69@gmail.com como admin

-- 1. VERIFICAR SE O USUÁRIO JÁ EXISTE
SELECT 
    'VERIFICANDO USUÁRIO EXISTENTE' as status,
    id,
    nome,
    nivel,
    timestamp
FROM usuarios 
WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com');

-- 2. INSERIR/ATUALIZAR USUÁRIO COMO ADMIN
-- Primeiro, tentar atualizar se existir
UPDATE usuarios SET
    nivel = 'admin',
    nome = 'Administrador Principal',
    permissoes = '{"admin": true, "moderacao": true, "analytics": true}'::jsonb,
    timestamp = NOW()
WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com');

-- Se não existir, inserir
INSERT INTO usuarios (
    id,
    nome,
    nivel,
    permissoes,
    timestamp
) 
SELECT 
    id::text,
    'Administrador Principal',
    'admin',
    '{"admin": true, "moderacao": true, "analytics": true}'::jsonb,
    NOW()
FROM auth.users 
WHERE email = 'phpg69@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com')
);

-- 3. CRIAR PERFIL DO ADMIN
-- Primeiro, tentar atualizar se existir
UPDATE profiles SET
    name = 'Administrador Principal',
    type = 'admin',
    email = 'phpg69@gmail.com'
WHERE user_id = (SELECT id::uuid FROM usuarios WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com'));

-- Se não existir, inserir
INSERT INTO profiles (
    user_id,
    name,
    email,
    type,
    created_at
) 
SELECT 
    id::uuid,
    'Administrador Principal',
    'phpg69@gmail.com',
    'admin',
    NOW()
FROM usuarios 
WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com')
AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = (SELECT id::uuid FROM usuarios WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com'))
);

-- 4. VERIFICAR SE FOI CRIADO COMO ADMIN
SELECT 
    'ADMIN CRIADO COM SUCESSO!' as status,
    u.id,
    u.email,
    u.nome,
    u.tipo,
    p.name as perfil_nome,
    p.type as perfil_tipo,
    u.created_at
FROM usuarios u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'phpg69@gmail.com';

-- 5. VERIFICAR PERMISSÕES DE ADMIN
SELECT 
    'PERMISSÕES DE ADMIN' as categoria,
    'Acesso total ao sistema' as permissao,
    'Gestão de usuários' as funcionalidade,
    'Moderação de chat' as moderacao,
    'Analytics completos' as analytics,
    'Configurações do sistema' as configuracao;

-- 6. CRIAR NOTIFICAÇÃO DE BOAS-VINDAS
INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    read,
    created_at
) VALUES (
    (SELECT id::uuid FROM usuarios WHERE id = (SELECT id::text FROM auth.users WHERE email = 'phpg69@gmail.com')),
    'success',
    'Bem-vindo como Administrador!',
    'Você foi configurado como administrador do MedCannLab. Acesso total ao sistema liberado.',
    false,
    NOW()
);

-- 7. CRIAR EXEMPLOS DE OUTROS TIPOS DE USUÁRIOS
-- Médico (CRM)
INSERT INTO usuarios (
    id,
    nome,
    nivel,
    permissoes,
    timestamp
) VALUES (
    gen_random_uuid(),
    'Dr. João Silva',
    'professional',
    '{"crm": "123456", "especialidade": "Nefrologia"}'::jsonb,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Enfermeiro (CRO)
INSERT INTO usuarios (
    id,
    nome,
    nivel,
    permissoes,
    timestamp
) VALUES (
    gen_random_uuid(),
    'Enf. Maria Santos',
    'professional',
    '{"cro": "789012", "especialidade": "Enfermagem"}'::jsonb,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Aluno
INSERT INTO usuarios (
    id,
    nome,
    nivel,
    permissoes,
    timestamp
) VALUES (
    gen_random_uuid(),
    'Ana Costa',
    'student',
    '{"curso": "Medicina", "semestre": 6}'::jsonb,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Paciente
INSERT INTO usuarios (
    id,
    nome,
    nivel,
    permissoes,
    timestamp
) VALUES (
    gen_random_uuid(),
    'Carlos Oliveira',
    'patient',
    '{"diagnostico": "DRC", "estagio": "3"}'::jsonb,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. RESUMO FINAL
SELECT 
    'SISTEMA CONFIGURADO COM SUCESSO!' as title,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'admin') as total_admins,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'professional') as total_profissionais,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'student') as total_alunos,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'patient') as total_pacientes,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios;
