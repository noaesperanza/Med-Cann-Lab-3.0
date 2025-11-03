-- =====================================================
-- CRIAR AVALIAÇÃO E RELATÓRIO PARA PAULO GONÇALVES
-- Execute este script DEPOIS de criar o paciente
-- =====================================================

DO $$
DECLARE
  v_paulo_id UUID;
BEGIN
  -- Buscar ID do Paulo Gonçalves
  SELECT id INTO v_paulo_id 
  FROM auth.users 
  WHERE email = 'paulo.goncalves@test.com';
  
  IF v_paulo_id IS NULL THEN
    RAISE EXCEPTION 'Paciente Paulo Gonçalves não encontrado. Execute primeiro o script CRIAR_PACIENTE_PAULO_GONCALVES_SIMPLES.sql';
  END IF;

  -- 1. CRIAR AVALIAÇÃO CLÍNICA
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
          'localizacao', 'Joelho direito'
        )
      ),
      'medications', jsonb_build_array('Ibuprofeno 400mg', 'Paracetamol 750mg'),
      'allergies', jsonb_build_array('Dipirona'),
      'familyHistory', 'Diabetes materna, hipertensão paterna',
      'lifestyle', jsonb_build_object(
        'exercicio', 'Sedentário',
        'alimentacao', 'Irregular',
        'stress', 'Alto (trabalho)'
      )
    ),
    'completed',
    NOW()
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Avaliação clínica criada para Paulo Gonçalves';
  RAISE NOTICE '✅ Se o trigger estiver ativo, o relatório será gerado automaticamente';
  
END $$;

-- 2. VERIFICAR AVALIAÇÃO CRIADA
-- =====================================================
SELECT 
  id,
  patient_id,
  assessment_type,
  status,
  created_at
FROM clinical_assessments 
WHERE patient_id IN (
  SELECT id FROM auth.users WHERE email = 'paulo.goncalves@test.com'
);

-- 3. VERIFICAR SE RELATÓRIO FOI GERADO AUTOMATICAMENTE
-- =====================================================
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

