-- =====================================================
-- 🔍 DIAGNÓSTICO: Perfis de Usuários e RLS
-- =====================================================
-- Script para entender perfis, vínculos e políticas RLS
-- Data: 06/02/2026

set search_path = public;

-- =====================================================
-- 1) PERFIS DE USUÁRIOS
-- =====================================================
SELECT 
  '=== PERFIS DE USUÁRIOS ===' as secao;

SELECT 
  u.id,
  u.email,
  u.name,
  u.type,
  u.flag_admin,
  u.crm,
  u.cro,
  u.created_at,
  CASE 
    WHEN u.flag_admin = true THEN '🔴 ADMIN'
    WHEN u.type = 'profissional' THEN '👨‍⚕️ PROFISSIONAL'
    WHEN u.type = 'paciente' THEN '👤 PACIENTE'
    WHEN u.type = 'aluno' THEN '🎓 ALUNO'
    ELSE '❓ OUTRO'
  END as perfil_visual
FROM public.users u
ORDER BY 
  CASE 
    WHEN u.flag_admin = true THEN 1
    WHEN u.type = 'profissional' THEN 2
    WHEN u.type = 'paciente' THEN 3
    ELSE 4
  END,
  u.created_at DESC;

-- =====================================================
-- 2) VÍNCULOS PROFISSIONAL-PACIENTE
-- =====================================================
SELECT 
  '=== VÍNCULOS PROFISSIONAL-PACIENTE ===' as secao;

-- Via clinical_reports
SELECT 
  'clinical_reports' as fonte_vinculo,
  COUNT(*) as total_vinculos,
  COUNT(DISTINCT cr.professional_id) as profissionais_unicos,
  COUNT(DISTINCT cr.patient_id) as pacientes_unicos
FROM public.clinical_reports cr;

-- Via clinical_assessments
SELECT 
  'clinical_assessments' as fonte_vinculo,
  COUNT(*) as total_vinculos,
  COUNT(DISTINCT ca.doctor_id) as profissionais_unicos,
  COUNT(DISTINCT ca.patient_id) as pacientes_unicos
FROM public.clinical_assessments ca;

-- Via appointments
SELECT 
  'appointments' as fonte_vinculo,
  COUNT(*) as total_vinculos,
  COUNT(DISTINCT a.professional_id) as profissionais_unicos,
  COUNT(DISTINCT a.patient_id) as pacientes_unicos
FROM public.appointments a;

-- Via chat_participants (salas com profissional + paciente)
SELECT 
  'chat_participants' as fonte_vinculo,
  COUNT(DISTINCT cp1.room_id) as total_salas,
  COUNT(DISTINCT cp1.user_id) as profissionais_unicos,
  COUNT(DISTINCT cp2.user_id) as pacientes_unicos
FROM public.chat_participants cp1
INNER JOIN public.chat_participants cp2 ON cp1.room_id = cp2.room_id
INNER JOIN public.users u1 ON cp1.user_id = u1.id
INNER JOIN public.users u2 ON cp2.user_id = u2.id
WHERE u1.type = 'profissional'
  AND u2.type = 'paciente'
  AND cp1.user_id != cp2.user_id;

-- =====================================================
-- 3) VÍNCULOS POR PROFISSIONAL (DETALHADO)
-- =====================================================
SELECT 
  '=== VÍNCULOS POR PROFISSIONAL ===' as secao;

SELECT 
  professional_name,
  professional_email,
  COUNT(DISTINCT patient_id) as total_pacientes_vinculados,
  string_agg(DISTINCT fonte, ', ') as fontes_vinculo
FROM (
  SELECT DISTINCT
    u.id as professional_id,
    u.name as professional_name,
    u.email as professional_email,
    'clinical_reports' as fonte,
    cr.patient_id
  FROM public.users u
  INNER JOIN public.clinical_reports cr ON cr.professional_id = u.id
  WHERE u.type = 'profissional'
  
  UNION
  
  SELECT DISTINCT
    u.id as professional_id,
    u.name as professional_name,
    u.email as professional_email,
    'clinical_assessments' as fonte,
    ca.patient_id
  FROM public.users u
  INNER JOIN public.clinical_assessments ca ON ca.doctor_id = u.id
  WHERE u.type = 'profissional'
  
  UNION
  
  SELECT DISTINCT
    u.id as professional_id,
    u.name as professional_name,
    u.email as professional_email,
    'appointments' as fonte,
    a.patient_id
  FROM public.users u
  INNER JOIN public.appointments a ON a.professional_id = u.id
  WHERE u.type = 'profissional'
  
  UNION
  
  SELECT DISTINCT
    u1.id as professional_id,
    u1.name as professional_name,
    u1.email as professional_email,
    'chat_participants' as fonte,
    cp2.user_id as patient_id
  FROM public.users u1
  INNER JOIN public.chat_participants cp1 ON cp1.user_id = u1.id
  INNER JOIN public.chat_participants cp2 ON cp1.room_id = cp2.room_id
  INNER JOIN public.users u2 ON cp2.user_id = u2.id
  WHERE u1.type = 'profissional'
    AND u2.type = 'paciente'
    AND cp1.user_id != cp2.user_id
) vinculos_profissional
GROUP BY professional_id, professional_name, professional_email
ORDER BY total_pacientes_vinculados DESC;

-- =====================================================
-- 4) POLÍTICAS RLS - patient_medical_records
-- =====================================================
SELECT 
  '=== POLÍTICAS RLS: patient_medical_records ===' as secao;

SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Tem USING'
    ELSE '❌ Sem USING'
  END as tem_using,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ Tem WITH CHECK'
    ELSE '❌ Sem WITH CHECK'
  END as tem_with_check
FROM pg_policies
WHERE tablename = 'patient_medical_records'
ORDER BY cmd, policyname;

-- =====================================================
-- 5) POLÍTICAS RLS - chat_participants
-- =====================================================
SELECT 
  '=== POLÍTICAS RLS: chat_participants ===' as secao;

SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Tem USING'
    ELSE '❌ Sem USING'
  END as tem_using,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ Tem WITH CHECK'
    ELSE '❌ Sem WITH CHECK'
  END as tem_with_check
FROM pg_policies
WHERE tablename = 'chat_participants'
ORDER BY cmd, policyname;

-- =====================================================
-- 6) FUNÇÕES HELPER (SECURITY DEFINER)
-- =====================================================
SELECT 
  '=== FUNÇÕES HELPER ===' as secao;

SELECT 
  proname as nome_funcao,
  prosecdef as security_definer,
  proconfig as configuracao
FROM pg_proc
WHERE proname IN (
  'is_professional_patient_link',
  'is_admin_user',
  'is_chat_room_member'
)
ORDER BY proname;

-- =====================================================
-- 7) STATUS RLS DAS TABELAS
-- =====================================================
SELECT 
  '=== STATUS RLS DAS TABELAS ===' as secao;

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END as status_rls
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'patient_medical_records',
    'chat_participants',
    'chat_rooms',
    'chat_messages',
    'clinical_reports',
    'clinical_assessments',
    'appointments'
  )
ORDER BY tablename;

-- =====================================================
-- 8) TESTE DE VÍNCULO (exemplo)
-- =====================================================
SELECT 
  '=== TESTE: Verificar vínculo profissional-paciente ===' as secao;

-- Substituir pelos IDs reais para testar
-- SELECT 
--   'Profissional ID' as profissional_id,
--   'Paciente ID' as patient_id,
--   public.is_professional_patient_link('PACIENTE_ID'::uuid, 'PROFISSIONAL_ID'::uuid) as tem_vinculo;

-- =====================================================
-- 9) RESUMO FINAL
-- =====================================================
SELECT 
  '=== RESUMO FINAL ===' as secao;

SELECT 
  (SELECT COUNT(*) FROM public.users WHERE type = 'profissional') as total_profissionais,
  (SELECT COUNT(*) FROM public.users WHERE type = 'paciente') as total_pacientes,
  (SELECT COUNT(*) FROM public.users WHERE flag_admin = true) as total_admins,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'patient_medical_records') as politicas_medical_records,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'chat_participants') as politicas_chat_participants,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('is_professional_patient_link', 'is_admin_user', 'is_chat_room_member')) as funcoes_helper;

SELECT '✅ Diagnóstico completo!' as status;
