-- =====================================================
-- 🔍 LISTAR AS 14 TABELAS EXISTENTES (SIMPLES)
-- =====================================================
-- Execute este script para ver exatamente quais tabelas você tem

-- 1. LISTAR TODAS AS TABELAS
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CONTAR TOTAL
SELECT 
    COUNT(*) as total_tables,
    'Tabelas existentes' as description
FROM information_schema.tables 
WHERE table_schema = 'public';
