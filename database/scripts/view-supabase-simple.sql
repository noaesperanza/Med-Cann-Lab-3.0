-- ===============================================
-- 📊 VER TUDO NO SUPABASE - VERSÃO SIMPLIFICADA
-- Execute no SQL Editor do Supabase Dashboard
-- ===============================================

-- ============================================
-- 1️⃣ LISTAR TODAS AS TABELAS
-- ============================================
SELECT 
    tablename as "Tabela"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;


-- ============================================
-- 2️⃣ VERIFICAR TABELAS PRINCIPAIS
-- ============================================

-- USERS (CRÍTICA)
SELECT 'users' as tabela, COUNT(*) as total FROM users;

-- CHAT
SELECT 'chat_messages' as tabela, COUNT(*) as total FROM chat_messages;
SELECT 'chat_rooms' as tabela, COUNT(*) as total FROM chat_rooms;

-- DOCUMENTOS
SELECT 'documents' as tabela, COUNT(*) as total FROM documents;

-- CURSOS
SELECT 'courses' as tabela, COUNT(*) as total FROM courses;
SELECT 'course_modules' as tabela, COUNT(*) as total FROM course_modules;

-- CLÍNICO
SELECT 'clinical_assessments' as tabela, COUNT(*) as total FROM clinical_assessments;
SELECT 'appointments' as tabela, COUNT(*) as total FROM appointments;
SELECT 'prescriptions' as tabela, COUNT(*) as total FROM prescriptions;

-- OUTROS
SELECT 'profiles' as tabela, COUNT(*) as total FROM profiles;
SELECT 'notifications' as tabela, COUNT(*) as total FROM notifications;
SELECT 'prescription_templates' as tabela, COUNT(*) as total FROM prescription_templates;
SELECT 'newsletter_items' as tabela, COUNT(*) as total FROM newsletter_items;


-- ============================================
-- 3️⃣ VER PRIMEIROS REGISTROS DE CADA TABELA
-- ============================================

-- USERS
SELECT * FROM users LIMIT 3;

-- CHAT MESSAGES  
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5;

-- DOCUMENTS
SELECT id, title, category, author, created_at 
FROM documents 
ORDER BY created_at DESC 
LIMIT 5;

-- COURSES
SELECT * FROM courses LIMIT 3;

-- CLINICAL ASSESSMENTS
SELECT * FROM clinical_assessments LIMIT 3;


-- ============================================
-- 4️⃣ VER ESTRUTURA DAS TABELAS
-- ============================================

-- Estrutura da tabela USERS
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Permite NULL"
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Estrutura da tabela DOCUMENTS
SELECT 
    column_name as "Coluna",
    data_type as "Tipo"
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;


-- ============================================
-- 5️⃣ VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
    tablename as "Tabela",
    policyname as "Política",
    cmd as "Comando"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;


-- ============================================
-- 6️⃣ RESUMO GERAL
-- ============================================

-- Total de tabelas
SELECT 
    COUNT(DISTINCT table_name) as "Total de Tabelas"
FROM information_schema.tables
WHERE table_schema = 'public';

-- Tamanho do banco
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as "Tamanho Total";
