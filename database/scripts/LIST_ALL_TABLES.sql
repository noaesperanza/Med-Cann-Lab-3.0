-- =====================================================
-- 🔍 LISTAR TODAS AS 14 TABELAS EXISTENTES
-- =====================================================
-- Execute este script para ver exatamente quais tabelas você tem

-- 1. LISTAR TODAS AS TABELAS COM DETALHES
SELECT 
    table_name,
    table_type,
    'Tabela existente' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CONTAR COLUNAS DE CADA TABELA
SELECT 
    table_name,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- 3. VERIFICAR SE SÃO TABELAS DO SUPABASE PADRÃO
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'auth.%' THEN 'Sistema de Autenticação'
        WHEN table_name LIKE 'storage.%' THEN 'Sistema de Storage'
        WHEN table_name LIKE 'realtime.%' THEN 'Sistema de Realtime'
        WHEN table_name LIKE 'extensions.%' THEN 'Extensões'
        WHEN table_name IN ('users', 'profiles', 'chat_messages', 'moderator_requests', 'user_mutes') THEN 'Tabelas do MedCannLab'
        ELSE 'Tabela Customizada'
    END as table_category
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. VERIFICAR TABELAS ESPECÍFICAS QUE PODEM ESTAR COM NOMES DIFERENTES
SELECT 
    'VERIFICAÇÃO DE TABELAS SIMILARES' as category,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN '✅ profiles'
        ELSE '❌ profiles'
    END as profiles_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN '✅ chat_messages'
        ELSE '❌ chat_messages'
    END as chat_messages_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'moderator_requests') THEN '✅ moderator_requests'
        ELSE '❌ moderator_requests'
    END as moderator_requests_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_mutes') THEN '✅ user_mutes'
        ELSE '❌ user_mutes'
    END as user_mutes_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_interactions') THEN '✅ user_interactions'
        ELSE '❌ user_interactions'
    END as user_interactions_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'semantic_analysis') THEN '✅ semantic_analysis'
        ELSE '❌ semantic_analysis'
    END as semantic_analysis_table;

-- 5. RESUMO FINAL
SELECT 
    'ANÁLISE COMPLETA' as title,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'auth.%') as auth_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'storage.%') as storage_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'realtime.%') as realtime_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'chat_messages', 'moderator_requests', 'user_mutes', 'user_interactions', 'semantic_analysis')) as medcannlab_tables;
