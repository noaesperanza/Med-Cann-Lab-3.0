-- =====================================================
-- 🔍 VERIFICAR ESTRUTURA COMPLETA DAS TABELAS
-- =====================================================
-- Execute este script para ver a estrutura correta das tabelas

-- 1. VERIFICAR ESTRUTURA DA TABELA USUARIOS
SELECT 
    'ESTRUTURA TABELA USUARIOS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    'ESTRUTURA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA CHANNELS
SELECT 
    'ESTRUTURA TABELA CHANNELS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'channels' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA MESSAGES
SELECT 
    'ESTRUTURA TABELA MESSAGES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. VERIFICAR ESTRUTURA DA TABELA COURSES
SELECT 
    'ESTRUTURA TABELA COURSES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. VERIFICAR ESTRUTURA DA TABELA DOCUMENTS
SELECT 
    'ESTRUTURA TABELA DOCUMENTS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. VERIFICAR ESTRUTURA DA TABELA USER_INTERACTIONS
SELECT 
    'ESTRUTURA TABELA USER_INTERACTIONS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_interactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. VERIFICAR ESTRUTURA DA TABELA CHAT_MESSAGES
SELECT 
    'ESTRUTURA TABELA CHAT_MESSAGES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. VERIFICAR ESTRUTURA DA TABELA CHAT_SESSIONS
SELECT 
    'ESTRUTURA TABELA CHAT_SESSIONS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. VERIFICAR ESTRUTURA DA TABELA SEMANTIC_ANALYSIS
SELECT 
    'ESTRUTURA TABELA SEMANTIC_ANALYSIS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'semantic_analysis' AND table_schema = 'public'
ORDER BY ordinal_position;
