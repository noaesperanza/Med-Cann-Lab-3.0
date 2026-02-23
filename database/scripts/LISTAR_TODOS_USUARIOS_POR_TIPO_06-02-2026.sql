-- =====================================================
-- 👥 LISTAR TODOS OS USUÁRIOS POR TIPO
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Listar todos os usuários com seus emails e nomes, organizados por tipo
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. TODOS OS ADMINS
-- =====================================================

SELECT 
    '👑 ADMIN' AS tipo_usuario,
    id,
    email,
    name,
    type,
    crm,
    cro,
    phone,
    created_at
FROM public.users
WHERE type IN ('admin', 'master', 'gestor')
ORDER BY email;

-- =====================================================
-- 2. TODOS OS PROFISSIONAIS
-- =====================================================

SELECT 
    '👨‍⚕️ PROFISSIONAL' AS tipo_usuario,
    id,
    email,
    name,
    type,
    crm,
    cro,
    phone,
    created_at
FROM public.users
WHERE type IN ('profissional', 'professional')
ORDER BY email;

-- =====================================================
-- 3. TODOS OS PACIENTES
-- =====================================================

SELECT 
    '👤 PACIENTE' AS tipo_usuario,
    id,
    email,
    name,
    type,
    phone,
    created_at,
    (
        SELECT COUNT(*) FROM public.clinical_assessments WHERE patient_id = users.id
    ) AS total_assessments,
    (
        SELECT COUNT(*) FROM public.appointments WHERE patient_id = users.id
    ) AS total_appointments,
    (
        SELECT COUNT(DISTINCT room_id) FROM public.chat_participants WHERE user_id = users.id
    ) AS total_chat_rooms
FROM public.users
WHERE type = 'paciente'
ORDER BY email;

-- =====================================================
-- 4. TODOS OS ALUNOS
-- =====================================================

SELECT 
    '🎓 ALUNO' AS tipo_usuario,
    id,
    email,
    name,
    type,
    phone,
    created_at
FROM public.users
WHERE type = 'aluno'
ORDER BY email;

-- =====================================================
-- 5. RESUMO POR TIPO
-- =====================================================

SELECT 
    CASE 
        WHEN type IN ('admin', 'master', 'gestor') THEN '👑 ADMIN'
        WHEN type IN ('profissional', 'professional') THEN '👨‍⚕️ PROFISSIONAL'
        WHEN type = 'paciente' THEN '👤 PACIENTE'
        WHEN type = 'aluno' THEN '🎓 ALUNO'
        ELSE '❓ OUTRO: ' || type
    END AS tipo_usuario,
    type AS tipo_original,
    COUNT(*) AS total,
    STRING_AGG(email, ', ' ORDER BY email) AS emails
FROM public.users
GROUP BY type
ORDER BY 
    CASE 
        WHEN type IN ('admin', 'master', 'gestor') THEN 1
        WHEN type IN ('profissional', 'professional') THEN 2
        WHEN type = 'paciente' THEN 3
        WHEN type = 'aluno' THEN 4
        ELSE 5
    END,
    type;

-- =====================================================
-- 6. LISTA COMPLETA (TODOS OS USUÁRIOS)
-- =====================================================

SELECT 
    CASE 
        WHEN type IN ('admin', 'master', 'gestor') THEN '👑 ADMIN'
        WHEN type IN ('profissional', 'professional') THEN '👨‍⚕️ PROFISSIONAL'
        WHEN type = 'paciente' THEN '👤 PACIENTE'
        WHEN type = 'aluno' THEN '🎓 ALUNO'
        ELSE '❓ ' || UPPER(type)
    END AS tipo_usuario,
    id,
    email,
    name,
    type AS tipo_original,
    crm,
    cro,
    phone,
    created_at
FROM public.users
ORDER BY 
    CASE 
        WHEN type IN ('admin', 'master', 'gestor') THEN 1
        WHEN type IN ('profissional', 'professional') THEN 2
        WHEN type = 'paciente' THEN 3
        WHEN type = 'aluno' THEN 4
        ELSE 5
    END,
    email;

-- =====================================================
-- 7. PROFISSIONAIS COM DETALHES DE PACIENTES
-- =====================================================

SELECT 
    pro.email AS profissional_email,
    pro.name AS profissional_nome,
    pro.type AS tipo_profissional,
    pro.crm,
    COUNT(DISTINCT ca.patient_id) AS pacientes_assessments,
    COUNT(DISTINCT cr.patient_id) AS pacientes_reports,
    COUNT(DISTINCT a.patient_id) AS pacientes_appointments,
    COUNT(DISTINCT cp_pat.user_id) AS pacientes_chat,
    COUNT(DISTINCT 
        COALESCE(ca.patient_id, cr.patient_id, a.patient_id, cp_pat.user_id)
    ) AS total_pacientes_unicos
FROM public.users pro
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = pro.id
LEFT JOIN public.clinical_reports cr ON cr.professional_id = pro.id OR cr.doctor_id = pro.id
LEFT JOIN public.appointments a ON a.professional_id = pro.id OR a.doctor_id = pro.id
LEFT JOIN public.chat_participants cp ON cp.user_id = pro.id
LEFT JOIN public.chat_participants cp_pat ON cp_pat.room_id = cp.room_id 
    AND cp_pat.user_id != pro.id
    AND cp_pat.user_id IN (SELECT id FROM public.users WHERE type = 'paciente')
WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
GROUP BY pro.id, pro.email, pro.name, pro.type, pro.crm
ORDER BY total_pacientes_unicos DESC, pro.email;

-- =====================================================
-- 8. ADMINS COM DETALHES
-- =====================================================

SELECT 
    admin.email AS admin_email,
    admin.name AS admin_nome,
    admin.type AS tipo_admin,
    COUNT(DISTINCT ca.patient_id) AS pacientes_assessments,
    COUNT(DISTINCT cr.patient_id) AS pacientes_reports,
    COUNT(DISTINCT a.patient_id) AS pacientes_appointments,
    COUNT(DISTINCT cp_pat.user_id) AS pacientes_chat,
    COUNT(DISTINCT 
        COALESCE(ca.patient_id, cr.patient_id, a.patient_id, cp_pat.user_id)
    ) AS total_pacientes_unicos
FROM public.users admin
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = admin.id
LEFT JOIN public.clinical_reports cr ON cr.professional_id = admin.id OR cr.doctor_id = admin.id
LEFT JOIN public.appointments a ON a.professional_id = admin.id OR a.doctor_id = admin.id
LEFT JOIN public.chat_participants cp ON cp.user_id = admin.id
LEFT JOIN public.chat_participants cp_pat ON cp_pat.room_id = cp.room_id 
    AND cp_pat.user_id != admin.id
    AND cp_pat.user_id IN (SELECT id FROM public.users WHERE type = 'paciente')
WHERE admin.type IN ('admin', 'master', 'gestor')
GROUP BY admin.id, admin.email, admin.name, admin.type
ORDER BY total_pacientes_unicos DESC, admin.email;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Listagem completa de usuários concluída!' AS status;
