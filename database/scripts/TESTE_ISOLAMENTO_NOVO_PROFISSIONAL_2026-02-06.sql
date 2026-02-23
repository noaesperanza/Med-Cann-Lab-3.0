-- =====================================================
-- 🧪 Teste: Isolamento de Novo Profissional
-- =====================================================
-- Objetivo: Verificar se novo profissional tem isolamento correto
-- Data: 06/02/2026
-- =====================================================

set search_path = public;

-- =====================================================
-- 1. Simular Novo Profissional Adicionando Paciente
-- =====================================================

-- Exemplo: Dr. João (novo profissional) adiciona Paciente Maria
-- NOTA: Substitua os IDs pelos IDs reais do seu ambiente

DO $$
DECLARE
  novo_profissional_id uuid := '00000000-0000-0000-0000-000000000001'; -- Substituir pelo ID real
  paciente_id uuid := '00000000-0000-0000-0000-000000000002'; -- Substituir pelo ID real
  dr_ricardo_id uuid;
  tem_vinculo_joao boolean;
  tem_vinculo_ricardo boolean;
BEGIN
  -- Encontrar ID do Dr. Ricardo
  SELECT id INTO dr_ricardo_id
  FROM auth.users
  WHERE email = 'iaianoaesperanza@gmail.com';
  
  IF dr_ricardo_id IS NULL THEN
    RAISE NOTICE '⚠️ Dr. Ricardo não encontrado. Teste será limitado.';
  END IF;
  
  -- Verificar se função is_professional_patient_link existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_professional_patient_link'
  ) THEN
    RAISE EXCEPTION '❌ Função is_professional_patient_link não existe. Execute FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql primeiro.';
  END IF;
  
  -- Teste 1: Criar vínculo para novo profissional
  -- (Simulação - descomente e ajuste IDs para testar)
  /*
  INSERT INTO public.appointments (
    professional_id,
    patient_id,
    appointment_date,
    type,
    status,
    title
  ) VALUES (
    novo_profissional_id,
    paciente_id,
    NOW() + INTERVAL '1 day',
    'consultation',
    'scheduled',
    'Teste de Isolamento'
  );
  */
  
  -- Teste 2: Verificar vínculo
  -- (Simulação - descomente e ajuste IDs para testar)
  /*
  SELECT public.is_professional_patient_link(paciente_id, novo_profissional_id)
  INTO tem_vinculo_joao;
  
  IF dr_ricardo_id IS NOT NULL THEN
    SELECT public.is_professional_patient_link(paciente_id, dr_ricardo_id)
    INTO tem_vinculo_ricardo;
  END IF;
  
  RAISE NOTICE '✅ Vínculo Dr. João: %', tem_vinculo_joao;
  IF dr_ricardo_id IS NOT NULL THEN
    RAISE NOTICE '✅ Vínculo Dr. Ricardo: %', tem_vinculo_ricardo;
  END IF;
  */
  
  RAISE NOTICE 'ℹ️ Teste configurado. Descomente e ajuste IDs para executar.';
END $$;

-- =====================================================
-- 2. Verificar Políticas RLS Ativas
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ USING definido'
    ELSE '❌ Sem USING'
  END as tem_using,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK definido'
    ELSE '❌ Sem WITH CHECK'
  END as tem_with_check
FROM pg_policies
WHERE tablename IN ('patient_medical_records', 'clinical_reports', 'clinical_assessments', 'appointments')
  AND policyname LIKE '%Professional%' OR policyname LIKE '%professional%'
ORDER BY tablename, policyname;

-- =====================================================
-- 3. Verificar Função is_professional_patient_link
-- =====================================================

SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'is_professional_patient_link';

-- =====================================================
-- 4. Listar Profissionais e seus Pacientes
-- =====================================================

WITH profissionais AS (
  SELECT DISTINCT
    u.id as profissional_id,
    COALESCE(
      (SELECT name FROM public.users WHERE id = u.id),
      u.raw_user_meta_data->>'name',
      SPLIT_PART(u.email, '@', 1)
    ) as profissional_nome,
    u.email as profissional_email
  FROM auth.users u
  WHERE (
    u.raw_user_meta_data->>'type' IN ('profissional', 'professional')
    OR EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = u.id AND pu.type IN ('profissional', 'professional'))
  )
)
SELECT 
  p.profissional_nome,
  p.profissional_email,
  COUNT(DISTINCT a.patient_id) as total_pacientes_via_appointments,
  COUNT(DISTINCT ca.patient_id) as total_pacientes_via_assessments,
  COUNT(DISTINCT cr.patient_id) as total_pacientes_via_reports
FROM profissionais p
LEFT JOIN public.appointments a ON a.professional_id = p.profissional_id
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = p.profissional_id
LEFT JOIN public.clinical_reports cr ON cr.professional_id = p.profissional_id
GROUP BY p.profissional_id, p.profissional_nome, p.profissional_email
ORDER BY p.profissional_nome;

-- =====================================================
-- 5. Verificar Isolamento: Pacientes por Profissional
-- =====================================================

-- Listar pacientes do Dr. Ricardo
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
)
SELECT 
  'Dr. Ricardo' as profissional,
  COUNT(DISTINCT a.patient_id) as pacientes_via_appointments,
  COUNT(DISTINCT ca.patient_id) as pacientes_via_assessments,
  COUNT(DISTINCT cr.patient_id) as pacientes_via_reports
FROM dr_ricardo dr
LEFT JOIN public.appointments a ON a.professional_id = dr.id
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = dr.id
LEFT JOIN public.clinical_reports cr ON cr.professional_id = dr.id;

-- Listar outros profissionais
SELECT 
  COALESCE(
    (SELECT name FROM public.users WHERE id = u.id),
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1)
  ) as profissional,
  COUNT(DISTINCT a.patient_id) as pacientes_via_appointments,
  COUNT(DISTINCT ca.patient_id) as pacientes_via_assessments
FROM auth.users u
LEFT JOIN public.appointments a ON a.professional_id = u.id
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = u.id
WHERE (
  u.raw_user_meta_data->>'type' IN ('profissional', 'professional')
  OR EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = u.id AND pu.type IN ('profissional', 'professional'))
)
  AND u.email != 'iaianoaesperanza@gmail.com'
GROUP BY u.id, u.email
HAVING COUNT(DISTINCT a.patient_id) > 0 OR COUNT(DISTINCT ca.patient_id) > 0
ORDER BY profissional;

SELECT '✅ Teste de isolamento concluído!' as status;
