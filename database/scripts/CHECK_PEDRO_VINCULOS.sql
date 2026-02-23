-- ==============================================================================
-- INVESTIGAR PACIENTES VINCULADOS A PEDRO (phpg69@gmail.com)
-- ==============================================================================
-- Este script identifica quais pacientes, agendamentos ou avaliações estão 
-- erroneamente vinculados ao ID do Pedro.

WITH user_info AS (
    SELECT id FROM auth.users WHERE email = 'phpg69@gmail.com'
)
SELECT 
    'Agendamento' as tipo_vinculo,
    a.id::text as item_id,
    a.title as detalhe,
    p.name as nome_paciente,
    a.appointment_date as data
FROM public.appointments a
JOIN public.users p ON a.patient_id = p.id
WHERE a.professional_id = (SELECT id FROM user_info)
   OR a.doctor_id = (SELECT id FROM user_info)

UNION ALL

SELECT 
    'Avaliação Clínica' as tipo_vinculo,
    ac.id::text as item_id,
    ac.assessment_type as detalhe,
    p.name as nome_paciente,
    ac.created_at as data
FROM public.clinical_assessments ac
JOIN public.users p ON ac.patient_id = p.id
WHERE ac.doctor_id = (SELECT id FROM user_info)

UNION ALL

SELECT 
    'Relatório Clínico' as tipo_vinculo,
    cr.id as item_id,
    cr.report_type as detalhe,
    cr.patient_name as nome_paciente,
    cr.generated_at as data
FROM public.clinical_reports cr
WHERE cr.professional_id = (SELECT id FROM user_info)
   OR cr.doctor_id = (SELECT id FROM user_info);

