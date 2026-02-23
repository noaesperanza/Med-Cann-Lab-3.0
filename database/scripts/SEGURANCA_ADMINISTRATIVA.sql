-- =====================================================
-- 🔒 SEGURANÇA ADMINISTRATIVA - MEDCANLAB 3.0
-- =====================================================
-- Restringir acesso administrativo apenas aos emails autorizados
-- Data: $(date)
-- Responsável: Nôa Esperança - IA Residente

-- 1. REVOGAR PERMISSÕES ADMINISTRATIVAS DE TODOS OS USUÁRIOS
UPDATE auth.users 
SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'::jsonb),
    '{admin}', 'false'::jsonb
)
WHERE email NOT IN ('rrvalenca@gmail.com', 'iaianoaesperanza@gmail.com');

-- 2. CONFIRMAR APENAS OS EMAILS AUTORIZADOS COMO ADMIN
UPDATE auth.users 
SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'::jsonb),
    '{admin}', 'true'::jsonb
)
WHERE email IN ('rrvalenca@gmail.com', 'iaianoaesperanza@gmail.com');

-- 3. ATUALIZAR TABELA USUARIOS PARA REFLETIR MUDANÇAS
UPDATE usuarios 
SET nivel = 'professional',
    permissoes = jsonb_set(
        COALESCE(permissoes, '{}'::jsonb),
        '{admin}', 'false'::jsonb
    )
WHERE email NOT IN ('rrvalenca@gmail.com', 'iaianoaesperanza@gmail.com');

-- 4. CONFIRMAR ADMINISTRADORES AUTORIZADOS
UPDATE usuarios 
SET nivel = 'admin',
    permissoes = jsonb_set(
        COALESCE(permissoes, '{}'::jsonb),
        '{admin}', 'true'::jsonb
    )
WHERE email IN ('rrvalenca@gmail.com', 'iaianoaesperanza@gmail.com');

-- 5. VERIFICAR USUÁRIOS ADMINISTRATIVOS ATIVOS
SELECT 
    'ADMINS AUTORIZADOS' as status,
    id,
    email,
    nivel,
    permissoes->>'admin' as is_admin,
    timestamp
FROM usuarios 
WHERE nivel = 'admin'
ORDER BY timestamp DESC;

-- 6. VERIFICAR USUÁRIOS COM PERMISSÕES REVOGADAS
SELECT 
    'PERMISSÕES REVOGADAS' as status,
    id,
    email,
    nivel,
    permissoes->>'admin' as is_admin,
    timestamp
FROM usuarios 
WHERE email NOT IN ('rrvalenca@gmail.com', 'iaianoaesperanza@gmail.com')
AND permissoes->>'admin' = 'false'
ORDER BY timestamp DESC;

-- 7. RESUMO DE SEGURANÇA
SELECT 
    'SISTEMA SEGURO!' as title,
    (SELECT COUNT(*) FROM usuarios WHERE nivel = 'admin') as admins_autorizados,
    (SELECT COUNT(*) FROM usuarios WHERE email NOT IN ('rrvalenca@gmail.com', 'iaianoaesperanza@gmail.com') AND permissoes->>'admin' = 'false') as permissoes_revogadas,
    'Apenas rrvalenca@gmail.com e iaianoaesperanza@gmail.com têm acesso administrativo' as observacao;
