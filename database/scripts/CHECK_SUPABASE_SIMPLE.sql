-- =====================================================
-- 🔍 VERIFICAR STATUS ATUAL DO SUPABASE (SIMPLES)
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

-- 3. VERIFICAR TABELAS PRINCIPAIS (SEM ACESSAR DADOS)
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

-- 5. VERIFICAR RLS (ROW LEVEL SECURITY)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. VERIFICAR ÍNDICES
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. VERIFICAR FUNÇÕES
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 8. RESUMO GERAL
SELECT 
    'STATUS ATUAL DO SUPABASE' as title,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables;
