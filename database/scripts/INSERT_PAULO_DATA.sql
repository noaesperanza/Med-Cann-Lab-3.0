  -- =====================================================
  -- DADOS COMPLETOS DO PACIENTE PAULO GONÇALVES
  -- =====================================================
  -- Este script cria: usuário, avaliação clínica e agendamento

  -- 1. INSCREVER USUÁRIO PAULO GONÇALVES
  -- =====================================================
  -- Verificar se o usuário já existe antes de inserir
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'paulo.goncalves@test.com') THEN
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
      );
    END IF;
  END $$;

  -- 2. CRIAR AVALIAÇÃO CLÍNICA DO PAULO
  -- =====================================================
  INSERT INTO clinical_assessments (
    patient_id,
    doctor_id,
    assessment_type,
    data,
    status,
    clinical_report
  ) 
  SELECT
    paulo.id as patient_id,
    doctor.id as doctor_id,
    'IMRE' as assessment_type,
    jsonb_build_object(
      'name', 'Paulo Gonçalves',
      'age', 56,
      'cpf', '789.456.123-00',
      'phone', '(21) 99876-5432',
      'complaintList', jsonb_build_array('Dor crônica no joelho direito', 'Dificuldade para dormir', 'Irritabilidade'),
      'complaintDetails', jsonb_build_object(
        'Dor crônica no joelho direito', jsonb_build_object(
          'intensidade', 'Moderada a Severa',
          'frequencia', 'Diária',
          'duracao', '8 meses',
          'localizacao', 'Joelho direito',
          'caracteristica', 'Dor que piora ao caminhar'
        ),
        'Dificuldade para dormir', jsonb_build_object(
          'intensidade', 'Moderada',
          'frequencia', '3-4 vezes por semana',
          'duracao', '4 meses'
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
      'clinicalNotes', 'Paciente de 56 anos, engenheiro, relata dor crônica no joelho direito há 8 meses, com impacto nas atividades diárias. Refere dificuldade para dormir devido à dor. Uso de anti-inflamatórios sem melhora significativa. Sem histórico de trauma direto. Paciente busca alternativas terapêuticas.'
    ) as data,
    'completed' as status,
    '## RELATÓRIO CLÍNICO - AVALIAÇÃO IMRE

  **Paciente:** Paulo Gonçalves  
  **Idade:** 56 anos  
  **Data:** 18/01/2025  
  **Avaliação:** IMRE Triaxial  
  **Profissional Responsável:** Dr. Ricardo Valença

  ### QUEIXAS PRINCIPAIS

  1. **Dor crônica no joelho direito**
    - Intensidade: Moderada a Severa
    - Frequência: Diária
    - Duração: 8 meses
    - Localização: Joelho direito
    - Característica: Dor que piora ao caminhar

  2. **Dificuldade para dormir**
    - Intensidade: Moderada
    - Frequência: 3-4 vezes por semana
    - Duração: 4 meses

  3. **Irritabilidade**

  ### MEDICAÇÕES ATUAIS

  - Ibuprofeno 400mg (uso eventual)
  - Paracetamol 750mg (uso eventual)

  ### ALERGIAS

  - Dipirona

  ### HISTÓRICO FAMILIAR

  - Diabetes materna
  - Hipertensão paterna

  ### ESTILO DE VIDA

  - Exercício: Sedentário
  - Alimentação: Irregular
  - Stress: Alto (relacionado ao trabalho)
  - Tabagismo: Não
  - Consumo de álcool: Socialmente

  ### OBSERVAÇÕES CLÍNICAS

  Paciente de 56 anos, engenheiro, relata dor crônica no joelho direito há 8 meses, com impacto significativo nas atividades diárias. Refere dificuldade para dormir devido à dor, o que está afetando sua qualidade de vida. Uso de anti-inflamatórios sem melhora significativa. Não há histórico de trauma direto na região.

  O paciente busca alternativas terapêuticas para o controle da dor, mostrando interesse em tratamentos inovadores e redução do uso de medicação sintomática.

  ### ANÁLISE IMRE

  **Eixo Emocional:**
  - Moderado impacto emocional devido à dor crônica
  - Irritabilidade presente

  **Eixo Cognitivo:**
  - Paciente consciente da condição
  - Busca ativa de soluções terapêuticas

  **Eixo Comportamental:**
  - Impacto nas atividades diárias
  - Dificuldade para dormir
  - Necessidade de manejo da dor

  ### RECOMENDAÇÕES

  1. **Avaliação para Cannabis Medicinal**
    - Indicada para controle de dor crônica
    - Potencial benefício para qualidade do sono
    - Redução do uso de anti-inflamatórios

  2. **Avaliação Ortopédica**
    - Investigar causa da dor no joelho
    - Possível artrose ou lesão meniscal
    - Considerar exame de imagem (radiografia/Ressonância)

  3. **Melhoria do Estilo de Vida**
    - Aumentar atividade física gradualmente
    - Regularização da alimentação
    - Técnicas de manejo de stress

  4. **Acompanhamento**
    - Retorno em 15 dias para reavaliação
    - Ajuste de medicação conforme resposta
    - Monitoramento de efeitos colaterais

  ### OBSERVAÇÕES FINAIS

  Paciente apresenta quadro de dor crônica que impacta significativamente sua qualidade de vida. A avaliação para Cannabis Medicinal é justificada, com potencial benefício tanto para o controle da dor quanto para melhoria do sono.

  Paciente demonstra boa adesão ao tratamento e compreensão da condição clínica.

  *Relatório gerado automaticamente pelo Sistema Nôa Esperança - IA Residente*  
  *Método: Arte da Entrevista Clínica (AEC) - IMRE Triaxial*  
  *Coordenador Científico: Dr. Ricardo Valença*' as clinical_report
  FROM 
    (SELECT id FROM auth.users WHERE email = 'paulo.goncalves@test.com' LIMIT 1) paulo,
    (SELECT id FROM auth.users WHERE email IN ('ricardo.valenca@medcannlab.com', 'phpg69@gmail.com') LIMIT 1) doctor
  WHERE paulo.id IS NOT NULL AND doctor.id IS NOT NULL;

  -- 3. CRIAR AGENDAMENTO PARA CONSULTA
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
    is_remote,
    meeting_url
  )
  SELECT
    paulo.id as patient_id,
    doctor.id as professional_id,
    'Consulta Médica - Dr. Ricardo Valença' as title,
    'Consulta de acompanhamento - Avaliação para Cannabis Medicinal' as description,
    NOW() + INTERVAL '7 days' as appointment_date,
    60 as duration,
    'scheduled' as status,
    'consultation' as type,
    true as is_remote,
    'https://meet.google.com/medcannlab-consulta' as meeting_url
  FROM 
    (SELECT id FROM auth.users WHERE email = 'paulo.goncalves@test.com' LIMIT 1) paulo,
    (SELECT id FROM auth.users WHERE email IN ('ricardo.valenca@medcannlab.com', 'phpg69@gmail.com') LIMIT 1) doctor
  WHERE paulo.id IS NOT NULL AND doctor.id IS NOT NULL;

  -- =====================================================
  -- VERIFICAÇÃO
  -- =====================================================
  -- Para verificar se os dados foram inseridos corretamente:
  -- 
  -- SELECT * FROM clinical_assessments WHERE patient_id IN (SELECT id FROM auth.users WHERE email = 'paulo.goncalves@test.com');
  -- SELECT * FROM appointments WHERE patient_id IN (SELECT id FROM auth.users WHERE email = 'paulo.goncalves@test.com');
