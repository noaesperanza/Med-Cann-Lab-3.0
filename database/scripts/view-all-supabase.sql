-- ===============================================
-- 📊 ANÁLISE COMPLETA DO BANCO SUPABASE
-- MedCannLab 3.0
-- ===============================================

-- ============================================
-- 1️⃣ LISTAR TODAS AS TABELAS DO SCHEMA PUBLIC
-- ============================================
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2️⃣ CONTAGEM DE REGISTROS POR TABELA
-- ============================================
-- ATENÇÃO: Este script pode demorar um pouco

DO $$
DECLARE
    table_record RECORD;
    row_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 CONTAGEM DE REGISTROS POR TABELA';
    RAISE NOTICE '========================================';
    
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_record.tablename) INTO row_count;
        RAISE NOTICE '% : % registros', table_record.tablename, row_count;
    END LOOP;
    
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 3️⃣ ESTRUTURA DE CADA TABELA (COLUNAS)
-- ============================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================
-- 4️⃣ VERIFICAR TABELAS ESPECÍFICAS
-- ============================================

-- Tabela USERS (CRÍTICA)
SELECT 'users' as tabela, COUNT(*) as total FROM users;
SELECT * FROM users LIMIT 3;

-- Tabela CHAT_MESSAGES
SELECT 'chat_messages' as tabela, COUNT(*) as total FROM chat_messages;
SELECT * FROM chat_messages LIMIT 3;

-- Tabela CHAT_ROOMS
SELECT 'chat_rooms' as tabela, COUNT(*) as total FROM chat_rooms;
SELECT * FROM chat_rooms LIMIT 3;

-- Tabela DOCUMENTS
SELECT 'documents' as tabela, COUNT(*) as total FROM documents;
SELECT id, title, category, created_at FROM documents LIMIT 5;

-- Tabela COURSES
SELECT 'courses' as tabela, COUNT(*) as total FROM courses;
SELECT * FROM courses LIMIT 3;

-- Tabela COURSE_MODULES
SELECT 'course_modules' as tabela, COUNT(*) as total FROM course_modules;
SELECT * FROM course_modules LIMIT 3;

-- Tabela CLINICAL_ASSESSMENTS
SELECT 'clinical_assessments' as tabela, COUNT(*) as total FROM clinical_assessments;
SELECT * FROM clinical_assessments LIMIT 3;

-- Tabela APPOINTMENTS
SELECT 'appointments' as tabela, COUNT(*) as total FROM appointments;
SELECT * FROM appointments LIMIT 3;

-- Tabela PRESCRIPTIONS
SELECT 'prescriptions' as tabela, COUNT(*) as total FROM prescriptions;
SELECT * FROM prescriptions LIMIT 3;

-- Tabela PRESCRIPTION_TEMPLATES
SELECT 'prescription_templates' as tabela, COUNT(*) as total FROM prescription_templates;
SELECT * FROM prescription_templates LIMIT 3;

-- Tabela NEWSLETTER_ITEMS
SELECT 'newsletter_items' as tabela, COUNT(*) as total FROM newsletter_items;
SELECT * FROM newsletter_items LIMIT 3;

-- Tabela PROFILES
SELECT 'profiles' as tabela, COUNT(*) as total FROM profiles;
SELECT * FROM profiles LIMIT 3;

-- Tabela NOTIFICATIONS
SELECT 'notifications' as tabela, COUNT(*) as total FROM notifications;
SELECT * FROM notifications LIMIT 3;

-- ============================================
-- 5️⃣ VERIFICAR POLÍTICAS RLS (Row Level Security)
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 6️⃣ VERIFICAR ÍNDICES
-- ============================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 7️⃣ VERIFICAR FOREIGN KEYS
-- ============================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- 8️⃣ RESUMO EXECUTIVO
-- ============================================
SELECT 
    COUNT(DISTINCT table_name) as total_tabelas,
    COUNT(DISTINCT column_name) as total_colunas
FROM information_schema.columns
WHERE table_schema = 'public';

-- Tamanho do banco de dados
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as tamanho_total;

-- ============================================
-- 🎯 QUERIES RÁPIDAS PARA COPIAR E COLAR
-- ============================================

-- Ver todas as tabelas
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Ver contagem de uma tabela específica
-- SELECT COUNT(*) FROM nome_da_tabela;

-- Ver estrutura de uma tabela
-- SELECT * FROM information_schema.columns WHERE table_name = 'nome_da_tabela';

-- Ver primeiros registros
-- SELECT * FROM nome_da_tabela LIMIT 5;
