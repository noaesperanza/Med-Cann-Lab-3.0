-- =====================================================
-- 🔍 VERIFICAR STATUS ATUAL DO SUPABASE
-- =====================================================
-- Execute este script primeiro para ver o que já temos

-- 1. VERIFICAR TODAS AS TABELAS EXISTENTES
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CONTAR TOTAL DE TABELAS
SELECT 
    COUNT(*) as total_tables,
    'Tabelas existentes no Supabase' as description
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 3. VERIFICAR TABELAS PRINCIPAIS
SELECT 
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
    END as documents_table;

-- 4. VERIFICAR TABELAS IMRE
SELECT 
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

-- 5. VERIFICAR DADOS NAS TABELAS PRINCIPAIS
SELECT 
    'users' as table_name,
    COUNT(*) as total_records
FROM users
UNION ALL
SELECT 
    'channels' as table_name,
    COUNT(*) as total_records
FROM channels
UNION ALL
SELECT 
    'messages' as table_name,
    COUNT(*) as total_records
FROM messages
UNION ALL
SELECT 
    'debates' as table_name,
    COUNT(*) as total_records
FROM debates
UNION ALL
SELECT 
    'documents' as table_name,
    COUNT(*) as total_records
FROM documents
UNION ALL
SELECT 
    'courses' as table_name,
    COUNT(*) as total_records
FROM courses
UNION ALL
SELECT 
    'clinical_assessments' as table_name,
    COUNT(*) as total_records
FROM clinical_assessments;

-- 6. VERIFICAR USUÁRIOS POR TIPO
SELECT 
    type,
    COUNT(*) as total_users
FROM users
GROUP BY type
ORDER BY type;

-- 7. VERIFICAR RLS (ROW LEVEL SECURITY)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 8. VERIFICAR ÍNDICES
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 9. VERIFICAR FUNÇÕES
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 10. RESUMO GERAL
SELECT 
    'STATUS ATUAL DO SUPABASE' as title,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM channels) as total_channels,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM debates) as total_debates,
    (SELECT COUNT(*) FROM documents) as total_documents,
    (SELECT COUNT(*) FROM courses) as total_courses;
