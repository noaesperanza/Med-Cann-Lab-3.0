-- =====================================================
-- 🔍 VERIFICAR RLS: ADMIN TEM ACESSO TOTAL?
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Verificar se todas as policies têm bypass admin
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. LISTAR TODAS AS POLICIES E VERIFICAR BYPASS ADMIN
-- =====================================================

SELECT 
    tablename,
    policyname,
    cmd AS operation,
    CASE 
        WHEN qual::text LIKE '%is_admin_user%' 
            OR qual::text LIKE '%admin%' 
            OR qual::text LIKE '%master%' 
            OR qual::text LIKE '%gestor%'
        THEN '✅ TEM BYPASS'
        ELSE '❌ SEM BYPASS'
    END AS bypass_status,
    qual::text AS policy_condition
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'chat_participants',
        'clinical_assessments',
        'clinical_reports',
        'appointments',
        'patient_medical_records',
        'prescriptions',
        'video_call_sessions',
        'notifications',
        'users'
    )
ORDER BY 
    tablename,
    CASE 
        WHEN qual::text LIKE '%is_admin_user%' THEN 1
        WHEN qual::text LIKE '%admin%' THEN 2
        ELSE 3
    END,
    policyname;

-- =====================================================
-- 2. RESUMO: QUANTAS POLICIES TÊM BYPASS ADMIN?
-- =====================================================

SELECT 
    tablename,
    COUNT(*) AS total_policies,
    COUNT(*) FILTER (
        WHERE qual::text LIKE '%is_admin_user%' 
            OR qual::text LIKE '%admin%' 
            OR qual::text LIKE '%master%' 
            OR qual::text LIKE '%gestor%'
    ) AS policies_com_bypass,
    COUNT(*) FILTER (
        WHERE qual::text NOT LIKE '%is_admin_user%' 
            AND qual::text NOT LIKE '%admin%' 
            AND qual::text NOT LIKE '%master%' 
            AND qual::text NOT LIKE '%gestor%'
    ) AS policies_sem_bypass,
    CASE 
        WHEN COUNT(*) FILTER (
            WHERE qual::text NOT LIKE '%is_admin_user%' 
                AND qual::text NOT LIKE '%admin%' 
                AND qual::text NOT LIKE '%master%' 
                AND qual::text NOT LIKE '%gestor%'
        ) = 0 THEN '✅ OK'
        ELSE '⚠️ PRECISA CORREÇÃO'
    END AS status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'chat_participants',
        'clinical_assessments',
        'clinical_reports',
        'appointments',
        'patient_medical_records',
        'prescriptions',
        'video_call_sessions',
        'notifications',
        'users'
    )
GROUP BY tablename
ORDER BY 
    CASE 
        WHEN COUNT(*) FILTER (
            WHERE qual::text NOT LIKE '%is_admin_user%' 
                AND qual::text NOT LIKE '%admin%' 
                AND qual::text NOT LIKE '%master%' 
                AND qual::text NOT LIKE '%gestor%'
        ) = 0 THEN 1
        ELSE 2
    END,
    tablename;

-- =====================================================
-- 3. TESTAR ACESSO ADMIN (SIMULAÇÃO)
-- =====================================================

-- Verificar se função is_admin_user existe
SELECT 
    'is_admin_user function' AS check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = 'is_admin_user'
                AND pronamespace = 'public'::regnamespace
        ) THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END AS status;

-- =====================================================
-- 4. LISTAR ADMINS DO SISTEMA
-- =====================================================

SELECT 
    id,
    email,
    name,
    type,
    '✅ É ADMIN' AS status
FROM public.users
WHERE type IN ('admin', 'master', 'gestor')
ORDER BY email;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Verificação de RLS concluída!' AS status;
