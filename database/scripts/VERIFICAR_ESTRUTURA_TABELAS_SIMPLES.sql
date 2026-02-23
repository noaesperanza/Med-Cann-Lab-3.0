-- =====================================================
-- 🔍 VERIFICAÇÃO SIMPLES: Estrutura Real das Tabelas
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Verificar estrutura REAL das tabelas antes de corrigir scripts
-- Execute este script primeiro para ver o que existe!

-- =====================================================
-- 1. ESTRUTURA DE chat_participants
-- =====================================================

SELECT 
    'chat_participants' AS table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'chat_participants'
ORDER BY ordinal_position;

-- =====================================================
-- 2. ESTRUTURA DE clinical_assessments
-- =====================================================

SELECT 
    'clinical_assessments' AS table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'clinical_assessments'
ORDER BY ordinal_position;

-- =====================================================
-- 3. ESTRUTURA DE clinical_reports
-- =====================================================

SELECT 
    'clinical_reports' AS table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'clinical_reports'
ORDER BY ordinal_position;

-- =====================================================
-- 4. ESTRUTURA DE appointments
-- =====================================================

SELECT 
    'appointments' AS table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'appointments'
ORDER BY ordinal_position;

-- =====================================================
-- 5. ESTRUTURA DE users
-- =====================================================

SELECT 
    'users' AS table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- 6. VERIFICAR SE COLUNAS ESPECÍFICAS EXISTEM
-- =====================================================

SELECT 
    'chat_participants.created_at' AS column_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'chat_participants' 
                AND column_name = 'created_at'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END AS status
UNION ALL
SELECT 
    'clinical_assessments.doctor_id',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'clinical_assessments' 
                AND column_name = 'doctor_id'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END
UNION ALL
SELECT 
    'clinical_assessments.professional_id',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'clinical_assessments' 
                AND column_name = 'professional_id'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END
UNION ALL
SELECT 
    'clinical_reports.professional_id',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'clinical_reports' 
                AND column_name = 'professional_id'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END
UNION ALL
SELECT 
    'clinical_reports.doctor_id',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'clinical_reports' 
                AND column_name = 'doctor_id'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END
UNION ALL
SELECT 
    'appointments.professional_id',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'appointments' 
                AND column_name = 'professional_id'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END
UNION ALL
SELECT 
    'appointments.doctor_id',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'appointments' 
                AND column_name = 'doctor_id'
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END;

-- =====================================================
-- FIM DA VERIFICAÇÃO
-- =====================================================
-- Após executar, você verá:
-- 1. Todas as colunas de cada tabela
-- 2. Se colunas específicas existem ou não
-- Use esses resultados para corrigir os scripts maiores!
