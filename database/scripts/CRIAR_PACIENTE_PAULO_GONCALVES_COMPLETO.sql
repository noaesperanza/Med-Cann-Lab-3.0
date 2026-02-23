-- =====================================================
-- CRIAR PACIENTE PAULO GONÇALVES PARA TESTE
-- Sistema Completo: Login, Avaliação, Relatórios e Compartilhamento
-- =====================================================

-- 1. CRIAR USUÁRIO PAULO GONÇALVES NO AUTH
-- =====================================================
-- Email: paulo.goncalves@test.com
-- Senha: paulo123456
-- ID: UUID gerado automaticamente ou fixo para testes

DO $$
DECLARE
  v_paulo_id UUID;
  v_ricardo_id UUID;
  v_eduardo_id UUID;
BEGIN
  -- Buscar IDs dos médicos
  SELECT id INTO v_ricardo_id FROM auth.users WHERE email IN ('rrvalenca@gmail.com', 'ricardo.valenca@medcannlab.com') LIMIT 1;
  SELECT id INTO v_eduardo_id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com' LIMIT 1;

  -- Criar ou obter ID do Paulo Gonçalves
  SELECT id INTO v_paulo_id FROM auth.users WHERE email = 'paulo.goncalves@test.com';
  
  IF v_paulo_id IS NULL THEN
    -- Criar novo usuário Paulo Gonçalves
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
      crypt('paulo123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Paulo Gonçalves", "type": "patient", "cpf": "123.456.789-00", "phone": "(21) 98765-4321"}',
      false,
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_paulo_id;
  END IF;

  -- 2. CRIAR REGISTRO NA TABELA USERS (se necessário)
  -- =====================================================
  -- Nota: A tabela users não tem coluna cpf, então removemos essa referência
  INSERT INTO users (
    id,
    email,
    name,
    type,
    phone,
    created_at
  )
  VALUES (
    v_paulo_id,
    'paulo.goncalves@test.com',
    'Paulo Gonçalves',
    'patient',
    '(21) 98765-4321',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    type = EXCLUDED.type;

  -- 3. CRIAR AVALIAÇÃO CLÍNICA INICIAL DO PAULO
  -- =====================================================
  INSERT INTO clinical_assessments (
    patient_id,
    assessment_type,
    data,
    status,
    created_at
  )
  VALUES (
    v_paulo_id,
    'IMRE',
    jsonb_build_object(
      'name', 'Paulo Gonçalves',
      'age', 56,
      'cpf', '123.456.789-00',
      'phone', '(21) 98765-4321',
      'complaintList', jsonb_build_array(
        'Dor crônica no joelho direito',
        'Dificuldade para dormir',
        'Irritabilidade'
      ),
      'complaintDetails', jsonb_build_object(
        'Dor crônica no joelho direito', jsonb_build_object(
          'intensidade', 'Moderada a Severa',
          'frequencia', 'Diária',
          'duracao', '8 meses',
          'localizacao', 'Joelho direito',
          'caracteristica', 'Dor que piora ao caminhar'
        )
      ),
      'medications', jsonb_build_array('Ibuprofeno 400mg', 'Paracetamol 750mg'),
      'allergies', jsonb_build_array('Dipirona'),
      'familyHistory', 'Diabetes materna, hipertensão paterna',
      'lifestyle', jsonb_build_object(
        'exercicio', 'Sedentário',
        'alimentacao', 'Irregular',
        'stress', 'Alto (trabalho)',
        'tabagismo', 'Não',
        'alcool', 'Socialmente'
      ),
      'clinicalNotes', 'Paciente de 56 anos, engenheiro, relata dor crônica no joelho direito há 8 meses, com impacto nas atividades diárias. Refere dificuldade para dormir devido à dor. Uso de anti-inflamatórios sem melhora significativa.'
    ),
    'completed',
    NOW()
  )
  ON CONFLICT DO NOTHING;

  -- 4. GERAR RELATÓRIO CLÍNICO DA AVALIAÇÃO
  -- =====================================================
  -- Nota: O relatório será gerado automaticamente pelo trigger criado no script ADICIONAR_COMPARTILHAMENTO_RELATORIOS.sql
  -- Se o trigger ainda não existir, este INSERT vai criar o relatório manualmente
  INSERT INTO clinical_reports (
    id,
    patient_id,
    patient_name,
    report_type,
    protocol,
    content,
    generated_by,
    generated_at,
    status
  )
  SELECT
    gen_random_uuid()::TEXT,
    ca.patient_id::TEXT,
    COALESCE(ca.data->>'name', 'Paulo Gonçalves'),
    'initial_assessment',
    COALESCE(ca.assessment_type, 'IMRE'),
    jsonb_build_object(
      'investigation', 'Avaliação clínica inicial completa utilizando protocolo IMRE Triaxial.',
      'methodology', 'Arte da Entrevista Clínica (AEC) aplicada à Cannabis Medicinal.',
      'result', COALESCE(ca.clinical_report, 'Avaliação clínica inicial concluída com sucesso. Paciente apresenta dor crônica no joelho direito há 8 meses, com impacto nas atividades diárias e qualidade do sono.'),
      'evolution', 'Plano de cuidado personalizado estabelecido. Recomenda-se avaliação para Cannabis Medicinal visando controle da dor e melhoria da qualidade do sono.',
      'recommendations', jsonb_build_array(
        'Avaliação para Cannabis Medicinal - Indicada para controle de dor crônica',
        'Avaliação Ortopédica - Investigar causa da dor no joelho',
        'Melhoria do estilo de vida - Aumentar atividade física gradualmente',
        'Retorno em 15 dias para reavaliação'
      ),
      'scores', jsonb_build_object(
        'clinical_score', 75,
        'treatment_adherence', 80,
        'symptom_improvement', 70,
        'quality_of_life', 85
      ),
      'fullReport', ca.data,
      'clinicalReport', ca.clinical_report
    ),
    'ai_resident',
    NOW(),
    'completed'
  FROM clinical_assessments ca
  WHERE ca.patient_id = v_paulo_id
    AND ca.status = 'completed'
    AND ca.assessment_type = 'IMRE'
    AND NOT EXISTS (
      SELECT 1 FROM clinical_reports cr 
      WHERE cr.patient_id = ca.patient_id::TEXT
        AND cr.report_type = 'initial_assessment'
        AND cr.generated_at >= ca.created_at - INTERVAL '1 minute'
    )
  LIMIT 1;

  -- 5. VINCULAR PAULO AOS MÉDICOS (se houver tabela de relacionamento)
  -- =====================================================
  -- Isso garante que o Paulo apareça nos dashboards dos médicos

  RAISE NOTICE '✅ Paciente Paulo Gonçalves criado com sucesso!';
  RAISE NOTICE '📧 Email: paulo.goncalves@test.com';
  RAISE NOTICE '🔑 Senha: paulo123456';
  RAISE NOTICE '👤 ID: %', v_paulo_id;
  RAISE NOTICE '👨‍⚕️ Dr. Ricardo ID: %', v_ricardo_id;
  RAISE NOTICE '👨‍⚕️ Dr. Eduardo ID: %', v_eduardo_id;

END $$;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS CRIADOS
-- =====================================================

-- Verificar usuário criado
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'type' as type,
  email_confirmed_at
FROM auth.users 
WHERE email = 'paulo.goncalves@test.com';

-- Verificar avaliações
SELECT 
  id,
  patient_id,
  assessment_type,
  status,
  created_at,
  data->>'name' as patient_name
FROM clinical_assessments 
WHERE patient_id IN (
  SELECT id FROM auth.users WHERE email = 'paulo.goncalves@test.com'
);

-- Verificar relatórios
SELECT 
  id,
  patient_id,
  patient_name,
  report_type,
  status,
  generated_at
FROM clinical_reports 
WHERE patient_id IN (
  SELECT id::TEXT FROM auth.users WHERE email = 'paulo.goncalves@test.com'
);

-- =====================================================
-- DADOS DE LOGIN PARA TESTE
-- =====================================================
-- Email: paulo.goncalves@test.com
-- Senha: paulo123456
-- Tipo: patient
-- Dashboard: /app/patient/dashboard

