-- =====================================================
-- 🔍 VERIFICAR USUÁRIOS E CHAT (CORRIGIDO)
-- =====================================================
-- Execute este script para verificar se tudo está conectado

-- 1. VERIFICAR ESTRUTURA DA TABELA USUARIOS
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR USUÁRIOS DEFINIDOS
SELECT 
    'USUÁRIOS DEFINIDOS' as categoria,
    COUNT(*) as total_usuarios
FROM usuarios;

-- 3. VERIFICAR DADOS DOS USUÁRIOS (USANDO COLUNAS CORRETAS)
SELECT 
    id,
    nome,
    email,
    tipo,
    created_at
FROM usuarios
ORDER BY created_at;

-- 4. VERIFICAR PERFIS DOS USUÁRIOS
SELECT 
    'PERFIS DOS USUÁRIOS' as categoria,
    COUNT(*) as total_perfis
FROM profiles;

-- 5. VERIFICAR SE USUÁRIOS TÊM PERFIS
SELECT 
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.email as email_usuario,
    u.tipo as tipo_usuario,
    p.id as perfil_id,
    p.name as nome_perfil,
    p.type as tipo_perfil
FROM usuarios u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at;

-- 6. VERIFICAR CHAT FUNCIONANDO
SELECT 
    'CHAT MESSAGES' as categoria,
    COUNT(*) as total_mensagens
FROM chat_messages;

-- 7. VERIFICAR CANAIS DE CHAT
SELECT 
    'CANAIS DE CHAT' as categoria,
    COUNT(*) as total_canais
FROM channels;

-- 8. VERIFICAR MENSAGENS POR CANAL
SELECT 
    c.name as canal,
    COUNT(m.id) as total_mensagens
FROM channels c
LEFT JOIN messages m ON c.id = m.channel_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 9. VERIFICAR SISTEMA DE AMIZADES
SELECT 
    'SISTEMA DE AMIZADES' as categoria,
    COUNT(*) as total_amizades
FROM friendships;

-- 10. VERIFICAR CHATS PRIVADOS
SELECT 
    'CHATS PRIVADOS' as categoria,
    COUNT(*) as total_chats_privados
FROM private_chats;

-- 11. VERIFICAR CURSOS E INSCRIÇÕES
SELECT 
    'CURSOS DISPONÍVEIS' as categoria,
    COUNT(*) as total_cursos
FROM courses
UNION ALL
SELECT 
    'INSCRIÇÕES EM CURSOS' as categoria,
    COUNT(*) as total_inscricoes
FROM course_enrollments;

-- 12. VERIFICAR DOCUMENTOS
SELECT 
    'DOCUMENTOS' as categoria,
    COUNT(*) as total_documentos
FROM documents;

-- 13. VERIFICAR INTERAÇÕES IA
SELECT 
    'INTERAÇÕES IA' as categoria,
    COUNT(*) as total_interacoes
FROM user_interactions;

-- 14. RESUMO GERAL
SELECT 
    'RESUMO GERAL DO SISTEMA' as title,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM channels) as total_canais,
    (SELECT COUNT(*) FROM messages) as total_mensagens,
    (SELECT COUNT(*) FROM chat_messages) as total_chat_messages,
    (SELECT COUNT(*) FROM courses) as total_cursos,
    (SELECT COUNT(*) FROM documents) as total_documentos,
    (SELECT COUNT(*) FROM user_interactions) as total_interacoes_ia;
