-- ===============================================
-- 📊 DESCOBRIR O QUE EXISTE NO SUPABASE
-- Execute SEÇÃO POR SEÇÃO no SQL Editor
-- ===============================================

-- ============================================
-- PASSO 1: VER TODAS AS TABELAS QUE EXISTEM
-- ============================================
SELECT 
    tablename as "Tabelas Disponíveis"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;


-- ============================================
-- PASSO 2: CONTAR REGISTROS DAS TABELAS
-- (Só execute as que aparecerem no Passo 1!)
-- ============================================

-- Se USERS existe:
SELECT 'users' as tabela, COUNT(*) as total FROM users;

-- Se CHAT_MESSAGES existe:
SELECT 'chat_messages' as tabela, COUNT(*) as total FROM chat_messages;

-- Se CHAT_ROOMS existe:
SELECT 'chat_rooms' as tabela, COUNT(*) as total FROM chat_rooms;

-- Se DOCUMENTS existe:
SELECT 'documents' as tabela, COUNT(*) as total FROM documents;

-- Se COURSES existe:
SELECT 'courses' as tabela, COUNT(*) as total FROM courses;

-- Se COURSE_MODULES existe:
SELECT 'course_modules' as tabela, COUNT(*) as total FROM course_modules;

-- Se CLINICAL_ASSESSMENTS existe:
SELECT 'clinical_assessments' as tabela, COUNT(*) as total FROM clinical_assessments;

-- Se APPOINTMENTS existe:
SELECT 'appointments' as tabela, COUNT(*) as total FROM appointments;

-- Se PROFILES existe:
SELECT 'profiles' as tabela, COUNT(*) as total FROM profiles;

-- Se NOTIFICATIONS existe:
SELECT 'notifications' as tabela, COUNT(*) as total FROM notifications;


-- ============================================
-- PASSO 3: VER PRIMEIROS REGISTROS
-- (Só das tabelas que têm dados!)
-- ============================================

-- USERS (se existir e tiver dados)
SELECT * FROM users LIMIT 3;

-- CHAT_MESSAGES (sabemos que tem 31 registros)
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5;

-- DOCUMENTS (sabemos que tem 280 registros)
SELECT 
    id, 
    title, 
    category, 
    author, 
    created_at,
    is_published
FROM documents 
ORDER BY created_at DESC 
LIMIT 10;


-- ============================================
-- PASSO 4: VER ESTRUTURA COMPLETA
-- ============================================

-- Ver TODAS as colunas de TODAS as tabelas
SELECT 
    table_name as "Tabela",
    column_name as "Coluna",
    data_type as "Tipo",
    is_nullable as "Permite NULL"
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- ============================================
-- PASSO 5: DETALHES ESPECÍFICOS
-- ============================================

-- Estrutura da tabela DOCUMENTS (detalhada)
SELECT 
    column_name as "Coluna",
    data_type as "Tipo",
    character_maximum_length as "Tamanho Máximo",
    is_nullable as "NULL?"
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'documents'
ORDER BY ordinal_position;

-- Estrutura da tabela CHAT_MESSAGES (detalhada)
SELECT 
    column_name as "Coluna",
    data_type as "Tipo"
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'chat_messages'
ORDER BY ordinal_position;


-- ============================================
-- PASSO 6: ANÁLISE DOS DOCUMENTOS
-- ============================================

-- Ver categorias de documentos
SELECT 
    category as "Categoria",
    COUNT(*) as "Quantidade"
FROM documents
GROUP BY category
ORDER BY COUNT(*) DESC;

-- Ver tipos de documentos
SELECT 
    file_type as "Tipo de Arquivo",
    COUNT(*) as "Quantidade"
FROM documents
GROUP BY file_type
ORDER BY COUNT(*) DESC;

-- Ver autores
SELECT 
    author as "Autor",
    COUNT(*) as "Documentos"
FROM documents
GROUP BY author
ORDER BY COUNT(*) DESC;


-- ============================================
-- PASSO 7: VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
    tablename as "Tabela",
    policyname as "Nome da Política",
    cmd as "Comando (SELECT/INSERT/UPDATE/DELETE)"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- ============================================
-- PASSO 8: RESUMO FINAL
-- ============================================

-- Total de tabelas
SELECT COUNT(DISTINCT tablename) as "Total de Tabelas" 
FROM pg_tables 
WHERE schemaname = 'public';

-- Total de registros nos documentos
SELECT COUNT(*) as "Total de Documentos" FROM documents;

-- Total de mensagens de chat
SELECT COUNT(*) as "Total de Mensagens" FROM chat_messages;

-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size(current_database())) as "Tamanho do Banco";
