-- =====================================================
-- CRIAR DADOS REAIS PARA TESTE
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script cria: 1 paciente, 1 avaliação clínica e 1 agendamento

-- 1. CRIAR PACIENTE
-- =====================================================
DO $$
DECLARE
  new_patient_id UUID;
  doctor_id UUID;
BEGIN
  -- Obter ID do Dr. Ricardo Valença
  SELECT id INTO doctor_id 
  FROM auth.users 
  WHERE email IN ('rrvalenca@gmail.com', 'phpg69@gmail.com', 'ricardo.valenca@medcannlab.com')
  LIMIT 1;
  
  IF doctor_id IS NULL THEN
    RAISE NOTICE '⚠️ Médico não encontrado. Usando primeiro usuário profissional.';
    SELECT id INTO doctor_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'type' = 'professional'
    LIMIT 1;
  END IF;
  
  RAISE NOTICE '✅ Médico encontrado: %', doctor_id;

  -- Criar usuário paciente
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'paulo.goncalves@test.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Paulo Gonçalves", "type": "patient"}',
    false,
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO new_patient_id;
  
  IF new_patient_id IS NULL THEN
    SELECT id INTO new_patient_id 
    FROM auth.users 
    WHERE email = 'paulo.goncalves@test.com';
  END IF;
  
  RAISE NOTICE '✅ Paciente criado: %', new_patient_id;

  -- 2. CRIAR AVALIAÇÃO CLÍNICA
  -- =====================================================
  INSERT INTO clinical_assessments (
    patient_id,
    doctor_id,
    assessment_type,
    data,
    status,
    clinical_report
  )
  VALUES (
    new_patient_id,
    doctor_id,
    'IMRE',
    jsonb_build_object(
      'name', 'Paulo Gonçalves',
      'age', 56,
      'cpf', '789.456.123-00',
      'phone', '(21) 99876-5432',
      'complaintList', jsonb_build_array('Dor crônica no joelho direito', 'Dificuldade para dormir'),
      'medications', jsonb_build_array('Ibuprofeno 400mg'),
      'allergies', jsonb_build_array('Dipirona')
    ),
    'completed',
    '## RELATÓRIO CLÍNICO - PAULO GONÇALVES

**Paciente:** Paulo Gonçalves  
**Idade:** 56 anos  
**Data:** 18/01/2025

### QUEIXAS PRINCIPAIS
- Dor crônica no joelho direito (8 meses)
- Dificuldade para dormir

### MEDICAÇÕES
- Ibuprofeno 400mg

### ALERGIAS
- Dipirona

### RECOMENDAÇÕES
Avaliação para Cannabis Medicinal indicada para controle de dor crônica.
'
  );
  
  RAISE NOTICE '✅ Avaliação clínica criada';

  -- 3. CRIAR AGENDAMENTO
  -- =====================================================
  INSERT INTO appointments (
    patient_id,
    professional_id,
    title,
    description,
    appointment_date,
    duration,
    status,
    type,
    location
  )
  VALUES (
    new_patient_id,
    doctor_id,
    'Consulta de Avaliação',
    'Primeira consulta para avaliação de dor crônica',
    (NOW() + INTERVAL '3 days')::timestamp,
    60,
    'scheduled',
    'consultation',
    'Consultório Rio de Janeiro'
  );
  
  RAISE NOTICE '✅ Agendamento criado';
  RAISE NOTICE '🎉 SUCESSO! Dados criados com sucesso!';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ ERRO: %', SQLERRM;
END $$;

-- 4. VERIFICAR DADOS CRIADOS
-- =====================================================
SELECT 
  'Resumo' as tipo,
  (SELECT COUNT(*) FROM clinical_assessments) as total_avaliacoes,
  (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled') as total_agendamentos;
