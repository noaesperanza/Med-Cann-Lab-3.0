-- =====================================================
-- 🔍 VERIFICAR TABELAS ESPECÍFICAS NO SUPABASE
-- =====================================================
-- Execute este script para ver exatamente quais tabelas você tem

-- 1. LISTAR TODAS AS 14 TABELAS EXISTENTES
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. VERIFICAR TABELAS PRINCIPAIS (16 TABELAS ESPERADAS)
SELECT 
    'TABELAS PRINCIPAIS' as category,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN '✅ users'
        ELSE '❌ users'
    END as users_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'channels') THEN '✅ channels'
        ELSE '❌ channels'
    END as channels_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN '✅ messages'
        ELSE '❌ messages'
    END as messages_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'debates') THEN '✅ debates'
        ELSE '❌ debates'
    END as debates_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN '✅ documents'
        ELSE '❌ documents'
    END as documents_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friendships') THEN '✅ friendships'
        ELSE '❌ friendships'
    END as friendships_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'private_chats') THEN '✅ private_chats'
        ELSE '❌ private_chats'
    END as private_chats_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'private_messages') THEN '✅ private_messages'
        ELSE '❌ private_messages'
    END as private_messages_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'renal_monitoring') THEN '✅ renal_monitoring'
        ELSE '❌ renal_monitoring'
    END as renal_monitoring_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'renal_alerts') THEN '✅ renal_alerts'
        ELSE '❌ renal_alerts'
    END as renal_alerts_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN '✅ courses'
        ELSE '❌ courses'
    END as courses_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN '✅ course_enrollments'
        ELSE '❌ course_enrollments'
    END as course_enrollments_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinical_assessments') THEN '✅ clinical_assessments'
        ELSE '❌ clinical_assessments'
    END as clinical_assessments_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_sessions') THEN '✅ chat_sessions'
        ELSE '❌ chat_sessions'
    END as chat_sessions_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_interactions') THEN '✅ user_interactions'
        ELSE '❌ user_interactions'
    END as user_interactions_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'semantic_analysis') THEN '✅ semantic_analysis'
        ELSE '❌ semantic_analysis'
    END as semantic_analysis_table;

-- 3. VERIFICAR TABELAS IMRE (5 TABELAS ESPERADAS)
SELECT 
    'TABELAS IMRE' as category,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imre_assessments') THEN '✅ imre_assessments'
        ELSE '❌ imre_assessments'
    END as imre_assessments_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imre_semantic_blocks') THEN '✅ imre_semantic_blocks'
        ELSE '❌ imre_semantic_blocks'
    END as imre_semantic_blocks_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'imre_semantic_context') THEN '✅ imre_semantic_context'
        ELSE '❌ imre_semantic_context'
    END as imre_semantic_context_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'noa_interaction_logs') THEN '✅ noa_interaction_logs'
        ELSE '❌ noa_interaction_logs'
    END as noa_interaction_logs_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinical_integration') THEN '✅ clinical_integration'
        ELSE '❌ clinical_integration'
    END as clinical_integration_table;

-- 4. CONTAR TABELAS POR CATEGORIA
SELECT 
    'RESUMO' as category,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'channels', 'messages', 'debates', 'documents', 'friendships', 'private_chats', 'private_messages', 'renal_monitoring', 'renal_alerts', 'courses', 'course_enrollments', 'clinical_assessments', 'chat_sessions', 'user_interactions', 'semantic_analysis')) as main_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('imre_assessments', 'imre_semantic_blocks', 'imre_semantic_context', 'noa_interaction_logs', 'clinical_integration')) as imre_tables;
