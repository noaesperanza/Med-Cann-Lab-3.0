-- =====================================================
-- 🔧 CORRIGIR TABELA USUARIOS
-- =====================================================

-- 1. INSERIR USUÁRIO NA TABELA USUARIOS SE NÃO EXISTIR
INSERT INTO usuarios (
    id,
    nome,
    nivel,
    permissoes,
    timestamp
) VALUES (
    '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
    'Administrador Principal',
    'admin',
    '{"admin": true, "moderacao": true, "analytics": true}'::jsonb,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    nivel = 'admin',
    nome = 'Administrador Principal',
    permissoes = '{"admin": true, "moderacao": true, "analytics": true}'::jsonb,
    timestamp = NOW();

-- 2. VERIFICAR SE FOI INSERIDO
SELECT 
    'USUÁRIO INSERIDO/ATUALIZADO' as status,
    id,
    nome,
    nivel,
    permissoes,
    timestamp
FROM usuarios 
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';
