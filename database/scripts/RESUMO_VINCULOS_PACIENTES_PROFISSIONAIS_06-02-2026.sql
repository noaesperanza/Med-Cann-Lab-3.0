-- =====================================================
-- 📊 RESUMO: VÍNCULOS PACIENTES ↔ PROFISSIONAIS
-- =====================================================
-- Data: 06/02/2026
-- Versão simplificada que retorna apenas o resumo final
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. RESUMO GERAL: PACIENTES E SEUS PROFISSIONAIS
-- =====================================================

WITH vinculos AS (
    SELECT DISTINCT
        pat.id AS paciente_id,
        pat.email AS paciente_email,
        pat.name AS paciente_nome,
        pro.id AS profissional_id,
        pro.email AS profissional_email,
        pro.name AS profissional_nome,
        'assessment' AS origem
    FROM public.users pat
    INNER JOIN public.clinical_assessments ca ON ca.patient_id = pat.id
    INNER JOIN public.users pro ON pro.id = ca.doctor_id
    WHERE pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pat.id,
        pat.email,
        pat.name,
        pro.id,
        pro.email,
        pro.name,
        'report' AS origem
    FROM public.users pat
    INNER JOIN public.clinical_reports cr ON cr.patient_id = pat.id
    INNER JOIN public.users pro ON pro.id = COALESCE(cr.professional_id, cr.doctor_id)
    WHERE pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pat.id,
        pat.email,
        pat.name,
        pro.id,
        pro.email,
        pro.name,
        'appointment' AS origem
    FROM public.users pat
    INNER JOIN public.appointments a ON a.patient_id = pat.id
    INNER JOIN public.users pro ON pro.id = COALESCE(a.professional_id, a.doctor_id)
    WHERE pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pat.id,
        pat.email,
        pat.name,
        pro.id,
        pro.email,
        pro.name,
        'chat' AS origem
    FROM public.users pat
    INNER JOIN public.chat_participants cp ON cp.user_id = pat.id
    INNER JOIN public.chat_participants cp_pro ON cp_pro.room_id = cp.room_id AND cp_pro.user_id != pat.id
    INNER JOIN public.users pro ON pro.id = cp_pro.user_id
    WHERE pat.type = 'paciente'
        AND pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
)
SELECT 
    paciente_email,
    paciente_nome,
    profissional_email,
    profissional_nome,
    STRING_AGG(DISTINCT origem, ', ' ORDER BY origem) AS tipos_vinculo,
    COUNT(DISTINCT origem) AS total_tipos
FROM vinculos
GROUP BY paciente_email, paciente_nome, profissional_email, profissional_nome
ORDER BY paciente_email, profissional_email;

-- =====================================================
-- 2. RESUMO POR PACIENTE: QUANTOS PROFISSIONAIS CADA PACIENTE TEM
-- =====================================================

WITH vinculos AS (
    SELECT DISTINCT
        pat.id AS paciente_id,
        pat.email AS paciente_email,
        pat.name AS paciente_nome,
        pro.id AS profissional_id
    FROM public.users pat
    INNER JOIN public.clinical_assessments ca ON ca.patient_id = pat.id
    INNER JOIN public.users pro ON pro.id = ca.doctor_id
    WHERE pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pat.id,
        pat.email,
        pat.name,
        pro.id
    FROM public.users pat
    INNER JOIN public.clinical_reports cr ON cr.patient_id = pat.id
    INNER JOIN public.users pro ON pro.id = COALESCE(cr.professional_id, cr.doctor_id)
    WHERE pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pat.id,
        pat.email,
        pat.name,
        pro.id
    FROM public.users pat
    INNER JOIN public.appointments a ON a.patient_id = pat.id
    INNER JOIN public.users pro ON pro.id = COALESCE(a.professional_id, a.doctor_id)
    WHERE pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pat.id,
        pat.email,
        pat.name,
        pro.id
    FROM public.users pat
    INNER JOIN public.chat_participants cp ON cp.user_id = pat.id
    INNER JOIN public.chat_participants cp_pro ON cp_pro.room_id = cp.room_id AND cp_pro.user_id != pat.id
    INNER JOIN public.users pro ON pro.id = cp_pro.user_id
    WHERE pat.type = 'paciente'
        AND pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
)
SELECT 
    paciente_email,
    paciente_nome,
    COUNT(DISTINCT profissional_id) AS total_profissionais,
    STRING_AGG(DISTINCT profissional_id::text, ', ' ORDER BY profissional_id::text) AS profissionais_ids
FROM vinculos
GROUP BY paciente_email, paciente_nome
ORDER BY total_profissionais DESC, paciente_email;

-- =====================================================
-- 3. RESUMO POR PROFISSIONAL: QUANTOS PACIENTES CADA PROFISSIONAL TEM
-- =====================================================

WITH vinculos AS (
    SELECT DISTINCT
        pro.id AS profissional_id,
        pro.email AS profissional_email,
        pro.name AS profissional_nome,
        pat.id AS paciente_id,
        pat.email AS paciente_email,
        pat.name AS paciente_nome
    FROM public.users pro
    INNER JOIN public.clinical_assessments ca ON ca.doctor_id = pro.id
    INNER JOIN public.users pat ON pat.id = ca.patient_id
    WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
        AND pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pro.id,
        pro.email,
        pro.name,
        pat.id,
        pat.email,
        pat.name
    FROM public.users pro
    INNER JOIN public.clinical_reports cr ON cr.professional_id = pro.id OR cr.doctor_id = pro.id
    INNER JOIN public.users pat ON pat.id = cr.patient_id
    WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
        AND pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pro.id,
        pro.email,
        pro.name,
        pat.id,
        pat.email,
        pat.name
    FROM public.users pro
    INNER JOIN public.appointments a ON a.professional_id = pro.id OR a.doctor_id = pro.id
    INNER JOIN public.users pat ON pat.id = a.patient_id
    WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
        AND pat.type = 'paciente'
    
    UNION
    
    SELECT DISTINCT
        pro.id,
        pro.email,
        pro.name,
        pat.id,
        pat.email,
        pat.name
    FROM public.users pro
    INNER JOIN public.chat_participants cp ON cp.user_id = pro.id
    INNER JOIN public.chat_participants cp_pat ON cp_pat.room_id = cp.room_id AND cp_pat.user_id != pro.id
    INNER JOIN public.users pat ON pat.id = cp_pat.user_id
    WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
        AND pat.type = 'paciente'
)
SELECT 
    profissional_email,
    profissional_nome,
    COUNT(DISTINCT paciente_id) AS total_pacientes,
    STRING_AGG(DISTINCT paciente_email, ', ' ORDER BY paciente_email) AS pacientes_emails
FROM vinculos
GROUP BY profissional_email, profissional_nome
ORDER BY total_pacientes DESC, profissional_email;

-- =====================================================
-- 4. ESTATÍSTICAS GERAIS
-- =====================================================

SELECT 
    '📊 ESTATÍSTICAS GERAIS' AS categoria,
    '' AS detalhe,
    '' AS valor
UNION ALL
SELECT 
    'Total de Pacientes' AS categoria,
    '' AS detalhe,
    COUNT(*)::text AS valor
FROM public.users
WHERE type = 'paciente'
UNION ALL
SELECT 
    'Total de Profissionais' AS categoria,
    '' AS detalhe,
    COUNT(*)::text AS valor
FROM public.users
WHERE type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
UNION ALL
SELECT 
    'Pacientes com Vínculos' AS categoria,
    '' AS detalhe,
    COUNT(DISTINCT pat.id)::text AS valor
FROM public.users pat
WHERE pat.type = 'paciente'
    AND (
        EXISTS (SELECT 1 FROM public.clinical_assessments WHERE patient_id = pat.id)
        OR EXISTS (SELECT 1 FROM public.clinical_reports WHERE patient_id = pat.id)
        OR EXISTS (SELECT 1 FROM public.appointments WHERE patient_id = pat.id)
        OR EXISTS (SELECT 1 FROM public.chat_participants WHERE user_id = pat.id)
    )
UNION ALL
SELECT 
    'Pacientes SEM Vínculos' AS categoria,
    '' AS detalhe,
    COUNT(*)::text AS valor
FROM public.users pat
WHERE pat.type = 'paciente'
    AND NOT EXISTS (SELECT 1 FROM public.clinical_assessments WHERE patient_id = pat.id)
    AND NOT EXISTS (SELECT 1 FROM public.clinical_reports WHERE patient_id = pat.id)
    AND NOT EXISTS (SELECT 1 FROM public.appointments WHERE patient_id = pat.id)
    AND NOT EXISTS (SELECT 1 FROM public.chat_participants WHERE user_id = pat.id)
UNION ALL
SELECT 
    'Profissionais com Pacientes' AS categoria,
    '' AS detalhe,
    COUNT(DISTINCT pro.id)::text AS valor
FROM public.users pro
WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
    AND (
        EXISTS (SELECT 1 FROM public.clinical_assessments WHERE doctor_id = pro.id)
        OR EXISTS (SELECT 1 FROM public.clinical_reports WHERE professional_id = pro.id OR doctor_id = pro.id)
        OR EXISTS (SELECT 1 FROM public.appointments WHERE professional_id = pro.id OR doctor_id = pro.id)
        OR EXISTS (SELECT 1 FROM public.chat_participants WHERE user_id = pro.id)
    )
UNION ALL
SELECT 
    'Profissionais SEM Pacientes' AS categoria,
    '' AS detalhe,
    COUNT(*)::text AS valor
FROM public.users pro
WHERE pro.type IN ('profissional', 'professional', 'admin', 'master', 'gestor')
    AND NOT EXISTS (SELECT 1 FROM public.clinical_assessments WHERE doctor_id = pro.id)
    AND NOT EXISTS (SELECT 1 FROM public.clinical_reports WHERE professional_id = pro.id OR doctor_id = pro.id)
    AND NOT EXISTS (SELECT 1 FROM public.appointments WHERE professional_id = pro.id OR doctor_id = pro.id)
    AND NOT EXISTS (SELECT 1 FROM public.chat_participants WHERE user_id = pro.id);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
