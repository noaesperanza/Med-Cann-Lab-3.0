-- =====================================================
-- CRIAR USUÁRIA PACIENTE MARIA SILVA
-- Sistema Completo: Login, Avaliação, Relatórios e Compartilhamento
-- =====================================================

-- 1. CRIAR USUÁRIA MARIA SILVA NO AUTH
-- =====================================================
-- Email: maria.silva@medcannlab.com
-- Senha: maria123

DO $$
DECLARE
  v_maria_id UUID;
  v_ricardo_id UUID;
  v_eduardo_id UUID;
BEGIN
  -- Buscar IDs dos médicos
  SELECT id INTO v_ricardo_id FROM auth.users WHERE email IN ('rrvlenca@gmail.com', 'ricardo.valenca@medcannlab.com') LIMIT 1;
  SELECT id INTO v_eduardo_id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com' LIMIT 1;

  -- Criar ou obter ID da Maria Silva
  SELECT id INTO v_maria_id FROM auth.users WHERE email = 'maria.silva@medcannlab.com';
  
  IF v_maria_id IS NULL THEN
    -- Criar nova usuária Maria Silva
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
      'maria.silva@medcannlab.com',
      crypt('maria123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Maria Silva", "type": "patient", "cpf": "987.654.321-00", "phone": "(11) 98765-4321"}',
      false,
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_maria_id;
  END IF;

  -- 2. CRIAR REGISTRO NA TABELA USERS (se necessário)
  -- =====================================================
  INSERT INTO users (
    id,
    email,
    name,
    type,
    phone,
    created_at
  )
  VALUES (
    v_maria_id,
    'maria.silva@medcannlab.com',
    'Maria Silva',
    'patient',
    '(11) 98765-4321',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    type = EXCLUDED.type;

  -- 3. CRIAR AVALIAÇÃO CLÍNICA INICIAL DA MARIA
  -- =====================================================
  INSERT INTO clinical_assessments (
    patient_id,
    doctor_id,
    assessment_type,
    data,
    status,
    created_at
  )
  VALUES (
    v_maria_id,
    COALESCE(v_ricardo_id, v_eduardo_id),
    'IMRE',
    jsonb_build_object(
      'name', 'Maria Silva',
      'age', 35,
      'cpf', '987.654.321-00',
      'phone', '(11) 98765-4321',
      'complaintList', jsonb_build_array('Epilepsia'),
      'complaintDetails', jsonb_build_object(
        'Epilepsia', jsonb_build_object(
          'intensidade', 'Moderada',
          'frequencia', 'Semanal',
          'duracao', '2 anos',
          'localizacao', 'Crises generalizadas',
          'caracteristica', 'Crises convulsivas'
        )
      ),
      'medications', jsonb_build_array('Fenitoína 100mg'),
      'allergies', jsonb_build_array(),
      'familyHistory', 'Sem histórico familiar',
      'lifestyle', jsonb_build_object(
        'exercicio', 'Regular',
        'alimentacao', 'Saudável',
        'stress', 'Moderado',
        'tabagismo', 'Não',
        'alcool', 'Não'
      ),
      'clinicalNotes', 'Paciente de 35 anos, relata crises epilépticas há 2 anos. Em uso de fenitoína com controle parcial.'
    ),
    'completed',
    NOW()
  )
  ON CONFLICT DO NOTHING;

  -- 4. CRIAR AGENDAMENTO DE TESTE
  -- =====================================================
  INSERT INTO appointments (
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    appointment_type,
    status,
    created_at
  )
  VALUES (
    v_maria_id,
    COALESCE(v_ricardo_id, v_eduardo_id),
    CURRENT_DATE + INTERVAL '1 day',
    '09:00',
    'Consulta',
    'scheduled',
    NOW()
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Usuária paciente Maria Silva criada com sucesso!';
  RAISE NOTICE '📧 Email: maria.silva@medcannlab.com';
  RAISE NOTICE '🔑 Senha: maria123';
  RAISE NOTICE '👤 ID: %', v_maria_id;

END $$;

-- 5. VERIFICAR SE FOI CRIADA
-- =====================================================
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'type' as type,
  us.phone,
  us.type as user_type
FROM auth.users u
LEFT JOIN users us ON u.id = us.id
WHERE u.email = 'maria.silva@medcannlab.com';
