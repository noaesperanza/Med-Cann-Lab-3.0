-- =====================================================
-- 🔍 DIAGNÓSTICO COMPLETO SUPABASE - MedCannLab 5.0
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Verificar TUDO no banco de dados
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. LISTAR TODAS AS TABELAS DO SCHEMA PUBLIC
-- =====================================================

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 2. VERIFICAR ESTRUTURA DE CADA TABELA (COLUNAS)
-- =====================================================

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 3. VERIFICAR FOREIGN KEYS (RELACIONAMENTOS)
-- =====================================================

SELECT
    tc.table_name AS source_table,
    kcu.column_name AS source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 4. VERIFICAR RLS POLICIES (SEGURANÇA)
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS command,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 5. VERIFICAR FUNÇÕES RPC (STORED PROCEDURES)
-- =====================================================

SELECT 
    routine_schema,
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- =====================================================
-- 6. VERIFICAR TRIGGERS
-- =====================================================

SELECT 
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 7. VERIFICAR VIEWS
-- =====================================================

SELECT 
    table_schema,
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 8. VERIFICAR ÍNDICES
-- =====================================================

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 9. VERIFICAR USUÁRIOS E SEUS TIPOS
-- =====================================================

-- Usuários na tabela public.users
SELECT 
    id,
    email,
    name,
    type,
    crm,
    cro,
    phone,
    created_at,
    updated_at
FROM public.users
ORDER BY type, name;

-- Contagem por tipo
SELECT 
    type,
    COUNT(*) as total
FROM public.users
GROUP BY type
ORDER BY total DESC;

-- =====================================================
-- 10. VERIFICAR VÍNCULOS PROFISSIONAL-PACIENTE
-- =====================================================

-- Vínculos via clinical_assessments
SELECT 
    ca.id as assessment_id,
    ca.patient_id,
    pu.name as patient_name,
    pu.email as patient_email,
    ca.doctor_id as professional_id,
    pro.name as professional_name,
    pro.email as professional_email,
    ca.created_at
FROM public.clinical_assessments ca
LEFT JOIN public.users pu ON pu.id = ca.patient_id
LEFT JOIN public.users pro ON pro.id = ca.doctor_id
ORDER BY ca.created_at DESC
LIMIT 50;

-- Vínculos via clinical_reports
SELECT 
    cr.id as report_id,
    cr.patient_id,
    pu.name as patient_name,
    pu.email as patient_email,
    COALESCE(cr.professional_id, cr.doctor_id) as professional_id,
    pro.name as professional_name,
    pro.email as professional_email,
    cr.created_at
FROM public.clinical_reports cr
LEFT JOIN public.users pu ON pu.id = cr.patient_id
LEFT JOIN public.users pro ON pro.id = COALESCE(cr.professional_id, cr.doctor_id)
ORDER BY cr.created_at DESC
LIMIT 50;

-- Vínculos via appointments
SELECT 
    a.id as appointment_id,
    a.patient_id,
    pu.name as patient_name,
    pu.email as patient_email,
    a.professional_id,
    pro.name as professional_name,
    pro.email as professional_email,
    a.appointment_date,
    a.status
FROM public.appointments a
LEFT JOIN public.users pu ON pu.id = a.patient_id
LEFT JOIN public.users pro ON pro.id = a.professional_id
ORDER BY a.appointment_date DESC
LIMIT 50;

-- Vínculos via chat_participants
SELECT 
    cp.room_id,
    cr.name as room_name,
    cp.user_id,
    u.name as user_name,
    u.email as user_email,
    u.type as user_type,
    cp.role
    -- cp.created_at removido - coluna pode não existir
FROM public.chat_participants cp
LEFT JOIN public.chat_rooms cr ON cr.id = cp.room_id
LEFT JOIN public.users u ON u.id = cp.user_id
WHERE u.type IN ('paciente', 'profissional', 'professional')
ORDER BY cr.created_at DESC NULLS LAST, cp.room_id
LIMIT 100;

-- =====================================================
-- 11. VERIFICAR TABELAS ESPERADAS PELO FRONTEND
-- =====================================================

-- Lista de tabelas que o frontend espera encontrar
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        'users',
        'chat_rooms',
        'chat_messages',
        'chat_participants',
        'video_call_requests',
        'video_call_sessions',
        'video_clinical_snippets',
        'video_call_schedules',
        'notifications',
        'clinical_assessments',
        'clinical_reports',
        'patient_medical_records',
        'appointments',
        'prescriptions',
        'courses',
        'documents',
        'course_enrollments',
        'forum_posts',
        'forum_comments',
        'conversation_ratings',
        'digital_signatures',
        'pki_transactions',
        -- Tabelas que podem estar faltando
        'lessons',
        'modules',
        'news',
        'gamification_points',
        'user_achievements',
        'ai_chat_history',
        'transactions',
        'wearable_devices',
        'epilepsy_events',
        -- Tabelas IMRE (não migradas)
        'imre_assessments',
        'imre_semantic_blocks',
        'imre_semantic_context',
        'noa_interaction_logs',
        'clinical_integration'
    ]) AS table_name
),
existing_tables AS (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
)
SELECT 
    et.table_name,
    CASE 
        WHEN et.table_name IN (SELECT tablename FROM existing_tables) 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END AS status
FROM expected_tables et
ORDER BY status, et.table_name;

-- =====================================================
-- 12. VERIFICAR COLUNAS ESPERADAS EM TABELAS CRÍTICAS
-- =====================================================

-- Tabela users
SELECT 
    'users' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Tabela notifications
SELECT 
    'notifications' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Tabela video_call_requests
SELECT 
    'video_call_requests' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'video_call_requests'
ORDER BY ordinal_position;

-- Tabela chat_rooms
SELECT 
    'chat_rooms' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'chat_rooms'
ORDER BY ordinal_position;

-- Tabela chat_messages
SELECT 
    'chat_messages' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- Tabela clinical_assessments
SELECT 
    'clinical_assessments' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'clinical_assessments'
ORDER BY ordinal_position;

-- Tabela clinical_reports
SELECT 
    'clinical_reports' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'clinical_reports'
ORDER BY ordinal_position;

-- Tabela patient_medical_records
SELECT 
    'patient_medical_records' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'patient_medical_records'
ORDER BY ordinal_position;

-- =====================================================
-- 13. VERIFICAR RLS POR TABELA
-- =====================================================

SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 14. VERIFICAR FUNÇÕES RPC ESPERADAS
-- =====================================================

WITH expected_rpc AS (
    SELECT unnest(ARRAY[
        'get_chat_participants_for_room',
        'create_video_call_notification',
        'create_chat_room_for_patient',
        'is_chat_room_member',
        'is_admin_user',
        'is_professional_patient_link',
        'get_chat_participants',
        'get_active_certificate'
    ]) AS function_name
),
existing_rpc AS (
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
)
SELECT 
    er.function_name,
    CASE 
        WHEN er.function_name IN (SELECT routine_name FROM existing_rpc) 
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END AS status
FROM expected_rpc er
ORDER BY status, er.function_name;

-- =====================================================
-- 15. VERIFICAR DADOS DE TESTE
-- =====================================================

-- Contagem de registros por tabela
SELECT 
    'users' AS table_name,
    COUNT(*) AS record_count
FROM public.users
UNION ALL
SELECT 
    'chat_rooms',
    COUNT(*)
FROM public.chat_rooms
UNION ALL
SELECT 
    'chat_messages',
    COUNT(*)
FROM public.chat_messages
UNION ALL
SELECT 
    'chat_participants',
    COUNT(*)
FROM public.chat_participants
UNION ALL
SELECT 
    'video_call_requests',
    COUNT(*)
FROM public.video_call_requests
UNION ALL
SELECT 
    'notifications',
    COUNT(*)
FROM public.notifications
UNION ALL
SELECT 
    'clinical_assessments',
    COUNT(*)
FROM public.clinical_assessments
UNION ALL
SELECT 
    'clinical_reports',
    COUNT(*)
FROM public.clinical_reports
UNION ALL
SELECT 
    'appointments',
    COUNT(*)
FROM public.appointments
UNION ALL
SELECT 
    'courses',
    COUNT(*)
FROM public.courses
UNION ALL
SELECT 
    'documents',
    COUNT(*)
FROM public.documents
ORDER BY record_count DESC;

-- =====================================================
-- 16. VERIFICAR ADMINS E SEUS VÍNCULOS
-- =====================================================

-- Listar todos os admins
SELECT 
    id,
    email,
    name,
    type,
    created_at
FROM public.users
WHERE type IN ('admin', 'master', 'gestor')
ORDER BY email;

-- Verificar se admins têm vínculos como pacientes
SELECT 
    u.id,
    u.email,
    u.name,
    u.type,
    COUNT(DISTINCT ca.id) as assessments_count,
    COUNT(DISTINCT cr.id) as reports_count,
    COUNT(DISTINCT a.id) as appointments_count
FROM public.users u
LEFT JOIN public.clinical_assessments ca ON ca.patient_id = u.id
LEFT JOIN public.clinical_reports cr ON cr.patient_id = u.id
LEFT JOIN public.appointments a ON a.patient_id = u.id
WHERE u.type IN ('admin', 'master', 'gestor')
GROUP BY u.id, u.email, u.name, u.type
ORDER BY u.email;

-- =====================================================
-- 17. VERIFICAR PROFISSIONAIS E SEUS PACIENTES
-- =====================================================

-- Profissionais e quantos pacientes cada um tem
SELECT 
    pro.id,
    pro.email,
    pro.name,
    pro.type,
    COUNT(DISTINCT ca.patient_id) as patients_via_assessments,
    COUNT(DISTINCT cr.patient_id) as patients_via_reports,
    COUNT(DISTINCT a.patient_id) as patients_via_appointments,
    COUNT(DISTINCT cp.user_id) FILTER (WHERE u.type = 'paciente') as patients_via_chat
FROM public.users pro
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = pro.id
LEFT JOIN public.clinical_reports cr ON (cr.doctor_id = pro.id OR cr.professional_id = pro.id)
LEFT JOIN public.appointments a ON (a.professional_id = pro.id OR a.doctor_id = pro.id)
LEFT JOIN public.chat_participants cp ON cp.room_id IN (
    SELECT room_id FROM public.chat_participants WHERE user_id = pro.id
)
LEFT JOIN public.users u ON u.id = cp.user_id
WHERE pro.type IN ('profissional', 'professional')
GROUP BY pro.id, pro.email, pro.name, pro.type
ORDER BY pro.email;

-- =====================================================
-- 18. VERIFICAR INTEGRIDADE DE DADOS
-- =====================================================

-- Usuários órfãos (sem vínculos)
SELECT 
    u.id,
    u.email,
    u.name,
    u.type,
    'Sem vínculos' AS issue
FROM public.users u
WHERE u.type IN ('paciente', 'profissional', 'professional')
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_assessments WHERE patient_id = u.id OR doctor_id = u.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_reports WHERE patient_id = u.id OR doctor_id = u.id OR professional_id = u.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.appointments WHERE patient_id = u.id OR professional_id = u.id OR doctor_id = u.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.chat_participants WHERE user_id = u.id
    )
ORDER BY u.type, u.email;

-- =====================================================
-- 19. RESUMO FINAL
-- =====================================================

SELECT 
    'Tabelas' AS category,
    COUNT(*)::text AS count
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'RLS Policies',
    COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'RPC Functions',
    COUNT(*)::text
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
UNION ALL
SELECT 
    'Triggers',
    COUNT(*)::text
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT 
    'Views',
    COUNT(*)::text
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'Usuários',
    COUNT(*)::text
FROM public.users
UNION ALL
SELECT 
    'Usuários Admin',
    COUNT(*)::text
FROM public.users
WHERE type IN ('admin', 'master', 'gestor')
UNION ALL
SELECT 
    'Usuários Profissional',
    COUNT(*)::text
FROM public.users
WHERE type IN ('profissional', 'professional')
UNION ALL
SELECT 
    'Usuários Paciente',
    COUNT(*)::text
FROM public.users
WHERE type = 'paciente';

-- =====================================================
-- FIM DO DIAGNÓSTICO
-- =====================================================
