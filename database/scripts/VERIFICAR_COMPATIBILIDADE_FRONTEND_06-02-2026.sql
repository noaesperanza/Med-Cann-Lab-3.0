-- =====================================================
-- 🔍 VERIFICAÇÃO DE COMPATIBILIDADE FRONTEND-BACKEND
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Verificar se o banco está 100% compatível com o frontend

-- =====================================================
-- 1. VERIFICAR TABELAS USADAS PELO FRONTEND
-- =====================================================

-- Tabelas críticas para chat
SELECT 
    'chat_rooms' AS table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_rooms')
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END AS status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_rooms')
        THEN (SELECT COUNT(*)::text FROM public.chat_rooms)
        ELSE '0'
    END AS record_count
UNION ALL
SELECT 
    'chat_messages',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages')
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages')
        THEN (SELECT COUNT(*)::text FROM public.chat_messages)
        ELSE '0'
    END
UNION ALL
SELECT 
    'chat_participants',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_participants')
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_participants')
        THEN (SELECT COUNT(*)::text FROM public.chat_participants)
        ELSE '0'
    END
UNION ALL
SELECT 
    'video_call_requests',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_call_requests')
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_call_requests')
        THEN (SELECT COUNT(*)::text FROM public.video_call_requests)
        ELSE '0'
    END
UNION ALL
SELECT 
    'video_call_sessions',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_call_sessions')
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_call_sessions')
        THEN (SELECT COUNT(*)::text FROM public.video_call_sessions)
        ELSE '0'
    END
UNION ALL
SELECT 
    'video_clinical_snippets',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_clinical_snippets')
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_clinical_snippets')
        THEN (SELECT COUNT(*)::text FROM public.video_clinical_snippets)
        ELSE '0'
    END
UNION ALL
SELECT 
    'notifications',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
        THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
        THEN (SELECT COUNT(*)::text FROM public.notifications)
        ELSE '0'
    END;

-- =====================================================
-- 2. VERIFICAR COLUNAS CRÍTICAS
-- =====================================================

-- Verificar se notifications tem metadata
SELECT 
    'notifications.metadata' AS column_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'notifications' 
                AND column_name = 'metadata'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END AS status
UNION ALL
SELECT 
    'notifications.is_read',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'notifications' 
                AND column_name = 'is_read'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'notifications.type',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'notifications' 
                AND column_name = 'type'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'video_call_requests.request_id',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'video_call_requests' 
                AND column_name = 'request_id'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'video_call_requests.metadata',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'video_call_requests' 
                AND column_name = 'metadata'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'chat_messages.message',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'chat_messages' 
                AND column_name = 'message'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'users.type',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'users' 
                AND column_name = 'type'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END;

-- =====================================================
-- 3. VERIFICAR RPC FUNCTIONS CRÍTICAS
-- =====================================================

SELECT 
    'get_chat_participants_for_room' AS function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'public'
                AND routine_name = 'get_chat_participants_for_room'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END AS status
UNION ALL
SELECT 
    'create_video_call_notification',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'public'
                AND routine_name = 'create_video_call_notification'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'create_chat_room_for_patient',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'public'
                AND routine_name = 'create_chat_room_for_patient'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'is_chat_room_member',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'public'
                AND routine_name = 'is_chat_room_member'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'is_admin_user',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'public'
                AND routine_name = 'is_admin_user'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END
UNION ALL
SELECT 
    'is_professional_patient_link',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines
            WHERE routine_schema = 'public'
                AND routine_name = 'is_professional_patient_link'
        ) THEN '✅ EXISTE'
        ELSE '❌ FALTANDO'
    END;

-- =====================================================
-- 4. VERIFICAR RLS PARA TABELAS CRÍTICAS
-- =====================================================

SELECT 
    'chat_rooms' AS table_name,
    COUNT(*)::text AS policy_count,
    STRING_AGG(policyname, ', ' ORDER BY policyname) AS policies
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'chat_rooms'
UNION ALL
SELECT 
    'chat_messages',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'chat_messages'
UNION ALL
SELECT 
    'chat_participants',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'chat_participants'
UNION ALL
SELECT 
    'notifications',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications'
UNION ALL
SELECT 
    'video_call_requests',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'video_call_requests'
UNION ALL
SELECT 
    'clinical_assessments',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'clinical_assessments'
UNION ALL
SELECT 
    'clinical_reports',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'clinical_reports'
UNION ALL
SELECT 
    'patient_medical_records',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'patient_medical_records'
UNION ALL
SELECT 
    'users',
    COUNT(*)::text,
    STRING_AGG(policyname, ', ' ORDER BY policyname)
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- =====================================================
-- 5. VERIFICAR TIPOS DE USUÁRIO ESPERADOS
-- =====================================================

SELECT 
    type,
    COUNT(*) AS count,
    STRING_AGG(email, ', ' ORDER BY email) AS emails
FROM public.users
GROUP BY type
ORDER BY count DESC;

-- Verificar se há tipos inesperados
SELECT 
    type,
    COUNT(*) AS count
FROM public.users
WHERE type NOT IN ('admin', 'master', 'gestor', 'profissional', 'professional', 'paciente', 'patient', 'aluno', 'student')
GROUP BY type;

-- =====================================================
-- 6. VERIFICAR VÍNCULOS PROFISSIONAL-PACIENTE
-- =====================================================

-- Verificar se há profissionais sem pacientes
SELECT 
    pro.id,
    pro.email,
    pro.name,
    'Sem pacientes vinculados' AS issue
FROM public.users pro
WHERE pro.type IN ('profissional', 'professional')
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_assessments WHERE doctor_id = pro.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_reports WHERE doctor_id = pro.id OR professional_id = pro.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.appointments WHERE professional_id = pro.id OR doctor_id = pro.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.chat_participants cp1
        JOIN public.chat_participants cp2 ON cp2.room_id = cp1.room_id
        JOIN public.users u ON u.id = cp2.user_id
        WHERE cp1.user_id = pro.id AND u.type = 'paciente'
    )
ORDER BY pro.email;

-- Verificar se há pacientes sem profissionais
SELECT 
    pat.id,
    pat.email,
    pat.name,
    'Sem profissionais vinculados' AS issue
FROM public.users pat
WHERE pat.type = 'paciente'
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_assessments WHERE patient_id = pat.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_reports WHERE patient_id = pat.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.appointments WHERE patient_id = pat.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.chat_participants cp1
        JOIN public.chat_participants cp2 ON cp2.room_id = cp1.room_id
        JOIN public.users u ON u.id = cp2.user_id
        WHERE cp1.user_id = pat.id AND u.type IN ('profissional', 'professional')
    )
ORDER BY pat.email;

-- =====================================================
-- 7. VERIFICAR DADOS DE TESTE NECESSÁRIOS
-- =====================================================

-- Verificar se há dados suficientes para testar
SELECT 
    'chat_rooms' AS table_name,
    COUNT(*) AS count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '⚠️ Sem dados'
    END AS status
FROM public.chat_rooms
UNION ALL
SELECT 
    'chat_messages',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '⚠️ Sem dados'
    END
FROM public.chat_messages
UNION ALL
SELECT 
    'notifications',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '⚠️ Sem dados'
    END
FROM public.notifications
UNION ALL
SELECT 
    'video_call_requests',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '⚠️ Sem dados'
    END
FROM public.video_call_requests
UNION ALL
SELECT 
    'clinical_assessments',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '⚠️ Sem dados'
    END
FROM public.clinical_assessments
UNION ALL
SELECT 
    'clinical_reports',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '⚠️ Sem dados'
    END
FROM public.clinical_reports
UNION ALL
SELECT 
    'appointments',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '⚠️ Sem dados'
    END
FROM public.appointments;

-- =====================================================
-- 8. RESUMO DE COMPATIBILIDADE
-- =====================================================

SELECT 
    'Tabelas Críticas' AS category,
    COUNT(*) FILTER (WHERE tablename IN ('chat_rooms', 'chat_messages', 'chat_participants', 'video_call_requests', 'notifications'))::text AS existem,
    (5 - COUNT(*) FILTER (WHERE tablename IN ('chat_rooms', 'chat_messages', 'chat_participants', 'video_call_requests', 'notifications')))::text AS faltam
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'RPC Functions Críticas',
    COUNT(*) FILTER (WHERE routine_name IN ('get_chat_participants_for_room', 'create_video_call_notification', 'create_chat_room_for_patient'))::text,
    (3 - COUNT(*) FILTER (WHERE routine_name IN ('get_chat_participants_for_room', 'create_video_call_notification', 'create_chat_room_for_patient')))::text
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
UNION ALL
SELECT 
    'RLS Policies',
    COUNT(*)::text,
    '0'::text
FROM pg_policies
WHERE schemaname = 'public';

-- =====================================================
-- FIM DA VERIFICAÇÃO
-- =====================================================
