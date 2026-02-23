-- =====================================================
-- 🔍 VERIFICAR STATUS ATUAL DO SISTEMA
-- =====================================================
-- Execute este script para ver o status atual do MedCannLab

-- 1. VERIFICAR USUÁRIOS DEFINIDOS
SELECT 
    'USUÁRIOS DEFINIDOS' as categoria,
    COUNT(*) as total_usuarios
FROM usuarios;

-- 2. VERIFICAR PERFIS DOS USUÁRIOS
SELECT 
    'PERFIS DOS USUÁRIOS' as categoria,
    COUNT(*) as total_perfis
FROM profiles;

-- 3. VERIFICAR CANAIS DE CHAT
SELECT 
    'CANAIS DE CHAT' as categoria,
    COUNT(*) as total_canais
FROM channels;

-- 4. VERIFICAR MENSAGENS DE CHAT
SELECT 
    'MENSAGENS DE CHAT' as categoria,
    COUNT(*) as total_mensagens
FROM chat_messages;

-- 5. VERIFICAR MENSAGENS POR CANAL
SELECT 
    'MENSAGENS POR CANAL' as categoria,
    COUNT(*) as total_mensagens
FROM messages;

-- 6. VERIFICAR CURSOS DISPONÍVEIS
SELECT 
    'CURSOS DISPONÍVEIS' as categoria,
    COUNT(*) as total_cursos
FROM courses;

-- 7. VERIFICAR INSCRIÇÕES EM CURSOS
SELECT 
    'INSCRIÇÕES EM CURSOS' as categoria,
    COUNT(*) as total_inscricoes
FROM course_enrollments;

-- 8. VERIFICAR DOCUMENTOS
SELECT 
    'DOCUMENTOS' as categoria,
    COUNT(*) as total_documentos
FROM documents;

-- 9. VERIFICAR INTERAÇÕES IA
SELECT 
    'INTERAÇÕES IA' as categoria,
    COUNT(*) as total_interacoes
FROM user_interactions;

-- 10. VERIFICAR ANÁLISE SEMÂNTICA
SELECT 
    'ANÁLISE SEMÂNTICA' as categoria,
    COUNT(*) as total_analises
FROM semantic_analysis;

-- 11. VERIFICAR SESSÕES DE CHAT
SELECT 
    'SESSÕES DE CHAT' as categoria,
    COUNT(*) as total_sessoes
FROM chat_sessions;

-- 12. VERIFICAR SISTEMA DE AMIZADES
SELECT 
    'SISTEMA DE AMIZADES' as categoria,
    COUNT(*) as total_amizades
FROM friendships;

-- 13. VERIFICAR CHATS PRIVADOS
SELECT 
    'CHATS PRIVADOS' as categoria,
    COUNT(*) as total_chats_privados
FROM private_chats;

-- 14. VERIFICAR MENSAGENS PRIVADAS
SELECT 
    'MENSAGENS PRIVADAS' as categoria,
    COUNT(*) as total_mensagens_privadas
FROM private_messages;

-- 15. VERIFICAR AVALIAÇÕES CLÍNICAS
SELECT 
    'AVALIAÇÕES CLÍNICAS' as categoria,
    COUNT(*) as total_avaliacoes
FROM clinical_assessments;

-- 16. VERIFICAR SOLICITAÇÕES DE MODERAÇÃO
SELECT 
    'SOLICITAÇÕES DE MODERAÇÃO' as categoria,
    COUNT(*) as total_solicitacoes
FROM moderator_requests;

-- 17. VERIFICAR USUÁRIOS SILENCIADOS
SELECT 
    'USUÁRIOS SILENCIADOS' as categoria,
    COUNT(*) as total_silenciados
FROM user_mutes;

-- 18. RESUMO GERAL
SELECT 
    'RESUMO GERAL DO SISTEMA' as title,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM channels) as total_canais,
    (SELECT COUNT(*) FROM messages) as total_mensagens,
    (SELECT COUNT(*) FROM chat_messages) as total_chat_messages,
    (SELECT COUNT(*) FROM courses) as total_cursos,
    (SELECT COUNT(*) FROM documents) as total_documentos,
    (SELECT COUNT(*) FROM user_interactions) as total_interacoes_ia,
    (SELECT COUNT(*) FROM semantic_analysis) as total_analises_semanticas,
    (SELECT COUNT(*) FROM chat_sessions) as total_sessoes_chat,
    (SELECT COUNT(*) FROM friendships) as total_amizades,
    (SELECT COUNT(*) FROM private_chats) as total_chats_privados,
    (SELECT COUNT(*) FROM clinical_assessments) as total_avaliacoes_clinicas;
