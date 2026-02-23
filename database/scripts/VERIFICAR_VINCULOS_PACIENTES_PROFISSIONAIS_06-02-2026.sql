-- =====================================================
-- 🔗 VERIFICAR VÍNCULOS DE PACIENTES COM PROFISSIONAIS
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Verificar quais pacientes estão vinculados a quais profissionais
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VÍNCULOS VIA CLINICAL_ASSESSMENTS
-- =====================================================

SELECT 
    'Via Clinical Assessments' AS tipo_vinculo,
    pat.email AS paciente_email,
    pat.name AS paciente_nome,
    pro.email AS profissional_email,
    pro.name AS profissional_nome,
    COUNT(ca.id) AS total_assessments
FROM public.users pat
INNER JOIN public.clinical_assessments ca ON ca.patient_id = pat.id
INNER JOIN public.users pro ON pro.id = ca.doctor_id
WHERE pat.type = 'paciente'
GROUP BY pat.id, pat.email, pat.name, pro.id, pro.email, pro.name
ORDER BY pat.email, pro.email;

-- =====================================================
-- 2. VÍNCULOS VIA CLINICAL_REPORTS
-- =====================================================

SELECT 
    'Via Clinical Reports' AS tipo_vinculo,
    pat.email AS paciente_email,
    pat.name AS paciente_nome,
    pro.email AS profissional_email,
    pro.name AS profissional_nome,
    COUNT(cr.id) AS total_reports
FROM public.users pat
INNER JOIN public.clinical_reports cr ON cr.patient_id = pat.id
INNER JOIN public.users pro ON pro.id = COALESCE(cr.professional_id, cr.doctor_id)
WHERE pat.type = 'paciente'
GROUP BY pat.id, pat.email, pat.name, pro.id, pro.email, pro.name
ORDER BY pat.email, pro.email;

-- =====================================================
-- 3. VÍNCULOS VIA APPOINTMENTS
-- =====================================================

SELECT 
    'Via Appointments' AS tipo_vinculo,
    pat.email AS paciente_email,
    pat.name AS paciente_nome,
    pro.email AS profissional_email,
    pro.name AS profissional_nome,
    COUNT(a.id) AS total_appointments
FROM public.users pat
INNER JOIN public.appointments a ON a.patient_id = pat.id
INNER JOIN public.users pro ON pro.id = COALESCE(a.professional_id, a.doctor_id)
WHERE pat.type = 'paciente'
GROUP BY pat.id, pat.email, pat.name, pro.id, pro.email, pro.name
ORDER BY pat.email, pro.email;

-- =====================================================
-- 4. VÍNCULOS VIA CHAT_PARTICIPANTS
-- =====================================================

SELECT 
    'Via Chat Rooms' AS tipo_vinculo,
    pat.email AS paciente_email,
    pat.name AS paciente_nome,
    pro.email AS profissional_email,
    pro.name AS profissional_nome,
    COUNT(DISTINCT cp.room_id) AS total_chat_rooms
FROM public.users pat
INNER JOIN public.chat_participants cp ON cp.user_id = pat.id
INNER JOIN public.chat_participants cp_pro ON cp_pro.room_id = cp.room_id AND cp_pro.user_id != pat.id
INNER JOIN public.users pro ON pro.id = cp_pro.user_id
WHERE pat.type = 'paciente'
    AND pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
GROUP BY pat.id, pat.email, pat.name, pro.id, pro.email, pro.name
ORDER BY pat.email, pro.email;

-- =====================================================
-- 5. RESUMO: TODOS OS VÍNCULOS POR PACIENTE
-- =====================================================

SELECT 
    pat.email AS paciente_email,
    pat.name AS paciente_nome,
    COUNT(DISTINCT ca.doctor_id) AS medicos_assessments,
    COUNT(DISTINCT COALESCE(cr.professional_id, cr.doctor_id)) AS medicos_reports,
    COUNT(DISTINCT COALESCE(a.professional_id, a.doctor_id)) AS medicos_appointments,
    COUNT(DISTINCT cp_pro.user_id) AS medicos_chat,
    COUNT(DISTINCT 
        COALESCE(ca.doctor_id, 
                 COALESCE(cr.professional_id, cr.doctor_id),
                 COALESCE(a.professional_id, a.doctor_id),
                 cp_pro.user_id
        )
    ) AS total_profissionais_vinculados
FROM public.users pat
LEFT JOIN public.clinical_assessments ca ON ca.patient_id = pat.id
LEFT JOIN public.clinical_reports cr ON cr.patient_id = pat.id
LEFT JOIN public.appointments a ON a.patient_id = pat.id
LEFT JOIN public.chat_participants cp ON cp.user_id = pat.id
LEFT JOIN public.chat_participants cp_pro ON cp_pro.room_id = cp.room_id 
    AND cp_pro.user_id != pat.id
    AND cp_pro.user_id IN (
        SELECT id FROM public.users 
        WHERE type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
    )
WHERE pat.type = 'paciente'
GROUP BY pat.id, pat.email, pat.name
ORDER BY total_profissionais_vinculados DESC, pat.email;

-- =====================================================
-- 6. RESUMO: TODOS OS VÍNCULOS POR PROFISSIONAL
-- =====================================================

SELECT 
    pro.email AS profissional_email,
    pro.name AS profissional_nome,
    COUNT(DISTINCT ca.patient_id) AS pacientes_assessments,
    COUNT(DISTINCT cr.patient_id) AS pacientes_reports,
    COUNT(DISTINCT a.patient_id) AS pacientes_appointments,
    COUNT(DISTINCT cp_pat.user_id) AS pacientes_chat,
    COUNT(DISTINCT 
        COALESCE(ca.patient_id, 
                 cr.patient_id,
                 a.patient_id,
                 cp_pat.user_id
        )
    ) AS total_pacientes_vinculados
FROM public.users pro
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = pro.id
LEFT JOIN public.clinical_reports cr ON cr.professional_id = pro.id OR cr.doctor_id = pro.id
LEFT JOIN public.appointments a ON a.professional_id = pro.id OR a.doctor_id = pro.id
LEFT JOIN public.chat_participants cp ON cp.user_id = pro.id
LEFT JOIN public.chat_participants cp_pat ON cp_pat.room_id = cp.room_id 
    AND cp_pat.user_id != pro.id
    AND cp_pat.user_id IN (
        SELECT id FROM public.users WHERE type = 'paciente'
    )
WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
GROUP BY pro.id, pro.email, pro.name
ORDER BY total_pacientes_vinculados DESC, pro.email;

-- =====================================================
-- 7. PACIENTES SEM VÍNCULOS (ISOLADOS)
-- =====================================================

SELECT 
    pat.email AS paciente_email,
    pat.name AS paciente_nome,
    'SEM VÍNCULOS' AS status
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
        SELECT 1 FROM public.chat_participants WHERE user_id = pat.id
    )
ORDER BY pat.email;

-- =====================================================
-- 8. PROFISSIONAIS SEM PACIENTES
-- =====================================================

SELECT 
    pro.email AS profissional_email,
    pro.name AS profissional_nome,
    'SEM PACIENTES' AS status
FROM public.users pro
WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_assessments WHERE doctor_id = pro.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.clinical_reports 
        WHERE professional_id = pro.id OR doctor_id = pro.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE professional_id = pro.id OR doctor_id = pro.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.chat_participants WHERE user_id = pro.id
    )
ORDER BY pro.email;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Análise de vínculos concluída!' AS status;
