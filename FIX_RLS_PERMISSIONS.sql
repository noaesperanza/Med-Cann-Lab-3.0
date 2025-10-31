-- =====================================================
-- 🔧 CORRIGIR PERMISSÕES RLS
-- =====================================================

-- 1. VERIFICAR RLS ATUAL
SELECT 
    'RLS STATUS' as status,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 2. DESABILITAR RLS TEMPORARIAMENTE (para teste)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR SE RLS FOI DESABILITADO
SELECT 
    'RLS DESABILITADO' as status,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 4. TESTAR CONSULTA DIRETA
SELECT 
    'TESTE CONSULTA' as status,
    id,
    nome,
    nivel
FROM usuarios 
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';
