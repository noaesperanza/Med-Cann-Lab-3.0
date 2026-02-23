-- =====================================================
-- 🔍 FORÇAR LISTAGEM DAS 14 TABELAS
-- =====================================================
-- Execute este script para ver exatamente quais tabelas você tem

-- 1. LISTAR TODAS AS TABELAS COM FORÇA
SELECT 
    table_name as "Nome da Tabela"
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. ALTERNATIVA - USAR PG_TABLES
SELECT 
    tablename as "Nome da Tabela"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
