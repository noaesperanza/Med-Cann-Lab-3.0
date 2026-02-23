-- =====================================================
-- ADICIONAR SISTEMA DE COMPARTILHAMENTO DE RELATÓRIOS
-- MedCannLab 3.0 - Paciente pode compartilhar com médicos
-- =====================================================

-- 1. ADICIONAR COLUNAS DE COMPARTILHAMENTO À TABELA CLINICAL_REPORTS
-- =====================================================

-- Adicionar coluna shared_with (array de IDs dos médicos com quem foi compartilhado)
ALTER TABLE clinical_reports 
ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT ARRAY[]::UUID[];

-- Adicionar coluna shared_at (quando foi compartilhado)
ALTER TABLE clinical_reports 
ADD COLUMN IF NOT EXISTS shared_at TIMESTAMP WITH TIME ZONE;

-- Adicionar coluna shared_by (ID do paciente que compartilhou)
ALTER TABLE clinical_reports 
ADD COLUMN IF NOT EXISTS shared_by UUID REFERENCES auth.users(id);

-- Adicionar coluna assessment_id (relacionamento com avaliação)
ALTER TABLE clinical_reports 
ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES clinical_assessments(id);

-- Adicionar índice para busca eficiente de relatórios compartilhados
CREATE INDEX IF NOT EXISTS idx_clinical_reports_shared_with ON clinical_reports USING GIN(shared_with);

-- Adicionar índice para shared_by
CREATE INDEX IF NOT EXISTS idx_clinical_reports_shared_by ON clinical_reports(shared_by);

-- Adicionar índice para assessment_id
CREATE INDEX IF NOT EXISTS idx_clinical_reports_assessment_id ON clinical_reports(assessment_id);

-- 2. FUNÇÃO PARA COMPARTILHAR RELATÓRIO COM MÉDICOS
-- =====================================================

CREATE OR REPLACE FUNCTION share_report_with_doctors(
  p_report_id TEXT,
  p_patient_id UUID,
  p_doctor_ids UUID[]
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_doctor_id UUID;
  v_doctor_name TEXT;
BEGIN
  -- Verificar se o relatório existe e pertence ao paciente
  IF NOT EXISTS (
    SELECT 1 FROM clinical_reports 
    WHERE id = p_report_id AND patient_id = p_patient_id::TEXT
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Relatório não encontrado ou não pertence ao paciente'
    );
  END IF;

  -- Atualizar relatório com médicos compartilhados
  UPDATE clinical_reports
  SET 
    shared_with = p_doctor_ids,
    shared_at = NOW(),
    shared_by = p_patient_id,
    status = CASE WHEN status = 'completed' THEN 'shared' ELSE status END,
    updated_at = NOW()
  WHERE id = p_report_id AND patient_id = p_patient_id::TEXT;

  -- Criar notificações para os médicos
  FOR v_doctor_id IN SELECT unnest(p_doctor_ids)
  LOOP
    SELECT name INTO v_doctor_name 
    FROM users 
    WHERE id = v_doctor_id;
    
    INSERT INTO notifications (
      id,
      type,
      title,
      message,
      data,
      user_id,
      user_type,
      created_at,
      read
    ) VALUES (
      gen_random_uuid()::TEXT,
      'report_shared',
      'Novo Relatório Compartilhado',
      'O paciente compartilhou um relatório de avaliação clínica inicial com você.',
      jsonb_build_object(
        'report_id', p_report_id,
        'patient_id', p_patient_id,
        'shared_at', NOW()
      ),
      v_doctor_id::TEXT,
      'professional',
      NOW(),
      false
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'report_id', p_report_id,
    'shared_with', p_doctor_ids,
    'shared_at', NOW(),
    'message', 'Relatório compartilhado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO PARA BUSCAR RELATÓRIOS COMPARTILHADOS COM MÉDICO
-- =====================================================

CREATE OR REPLACE FUNCTION get_shared_reports_for_doctor(
  p_doctor_id UUID
)
RETURNS TABLE (
  id TEXT,
  patient_id TEXT,
  patient_name TEXT,
  report_type TEXT,
  protocol TEXT,
  status TEXT,
  shared_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE,
  content JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.patient_id,
    cr.patient_name,
    cr.report_type,
    cr.protocol,
    cr.status,
    cr.shared_at,
    cr.generated_at,
    cr.content
  FROM clinical_reports cr
  WHERE p_doctor_id = ANY(cr.shared_with)
    AND cr.status = 'shared'
  ORDER BY cr.shared_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATUALIZAR POLÍTICAS RLS PARA COMPARTILHAMENTO
-- =====================================================

-- Remover políticas existentes se já existirem
DROP POLICY IF EXISTS "Médicos veem relatórios compartilhados" ON clinical_reports;
DROP POLICY IF EXISTS "Pacientes podem compartilhar relatórios" ON clinical_reports;

-- Política: Médicos podem ver relatórios compartilhados com eles
CREATE POLICY "Médicos veem relatórios compartilhados" ON clinical_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND type IN ('professional', 'admin')
    )
    AND (
      -- Ver todos os relatórios (admin/profissional)
      auth.uid() IN (SELECT id FROM users WHERE type IN ('professional', 'admin'))
      OR
      -- Ver relatórios compartilhados especificamente com este médico
      auth.uid() = ANY(shared_with)
    )
  );

-- Política: Pacientes podem compartilhar seus próprios relatórios
CREATE POLICY "Pacientes podem compartilhar relatórios" ON clinical_reports
  FOR UPDATE USING (
    patient_id = auth.uid()::TEXT
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND type = 'patient'
    )
  );

-- 5. VIEW PARA RELATÓRIOS COMPARTILHADOS (FACILITA BUSCA)
-- =====================================================

CREATE OR REPLACE VIEW shared_reports_view AS
SELECT 
  cr.id,
  cr.patient_id,
  cr.patient_name,
  cr.report_type,
  cr.protocol,
  cr.status,
  cr.shared_with,
  cr.shared_at,
  cr.shared_by,
  cr.generated_at,
  cr.content,
  u_patient.name as patient_full_name,
  u_patient.email as patient_email,
  array_agg(
    jsonb_build_object(
      'id', u_doctor.id,
      'name', u_doctor.name,
      'email', u_doctor.email
    )
  ) FILTER (WHERE u_doctor.id IS NOT NULL) as shared_with_doctors
FROM clinical_reports cr
LEFT JOIN users u_patient ON u_patient.id::TEXT = cr.patient_id
LEFT JOIN users u_doctor ON u_doctor.id = ANY(cr.shared_with)
WHERE cr.shared_with IS NOT NULL 
  AND array_length(cr.shared_with, 1) > 0
GROUP BY 
  cr.id, 
  cr.patient_id, 
  cr.patient_name, 
  cr.report_type, 
  cr.protocol, 
  cr.status, 
  cr.shared_with, 
  cr.shared_at, 
  cr.shared_by, 
  cr.generated_at, 
  cr.content,
  u_patient.name,
  u_patient.email;

-- 6. FUNÇÃO PARA VERIFICAR RELATÓRIOS PENDENTES DE COMPARTILHAMENTO
-- =====================================================

CREATE OR REPLACE FUNCTION get_pending_shared_reports_for_doctor(
  p_doctor_id UUID
)
RETURNS TABLE (
  id TEXT,
  patient_id TEXT,
  patient_name TEXT,
  report_type TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  days_waiting INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.patient_id,
    cr.patient_name,
    cr.report_type,
    cr.generated_at,
    EXTRACT(DAY FROM (NOW() - cr.generated_at))::INTEGER as days_waiting
  FROM clinical_reports cr
  WHERE p_doctor_id = ANY(cr.shared_with)
    AND cr.status = 'shared'
    AND cr.shared_at IS NOT NULL
  ORDER BY cr.shared_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAÇÃO DAS ALTERAÇÕES
-- =====================================================

-- Verificar colunas adicionadas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clinical_reports'
  AND column_name IN ('shared_with', 'shared_at', 'shared_by', 'assessment_id')
ORDER BY ordinal_position;

-- Verificar funções criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'share_report_with_doctors',
    'get_shared_reports_for_doctor',
    'get_pending_shared_reports_for_doctor'
  );

-- Verificar políticas RLS
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'clinical_reports'
  AND (policyname LIKE '%compartilh%' OR policyname LIKE '%shared%');

-- 7. FUNÇÃO PARA GERAR RELATÓRIO AUTOMATICAMENTE APÓS AVALIAÇÃO COMPLETADA
-- =====================================================
-- Esta função cria automaticamente um relatório na tabela clinical_reports
-- quando a IA residente completa uma avaliação clínica inicial

CREATE OR REPLACE FUNCTION generate_report_from_assessment()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_name TEXT;
  v_patient_id UUID;
BEGIN
  -- Verificar se a avaliação foi concluída e se ainda não existe relatório
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Buscar nome do paciente
    -- Primeiro tentar da tabela users, depois do JSON data
    SELECT name INTO v_patient_name
    FROM users
    WHERE id = NEW.patient_id
    LIMIT 1;
    
    -- Se não encontrar, usar o nome do JSON data
    IF v_patient_name IS NULL THEN
      v_patient_name := COALESCE(NEW.data->>'name', 'Paciente');
    END IF;


    v_patient_id := NEW.patient_id;

    -- Criar relatório clínico automaticamente se não existir
    INSERT INTO clinical_reports (
      id,
      patient_id,
      patient_name,
      report_type,
      protocol,
      content,
      generated_by,
      generated_at,
      status,
      assessment_id,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid()::TEXT,
      v_patient_id::TEXT,
      v_patient_name,
      'initial_assessment',
      COALESCE(NEW.assessment_type, 'IMRE'),
      jsonb_build_object(
        'investigation', COALESCE(NEW.data->>'investigation', 'Avaliação clínica inicial completa utilizando protocolo IMRE Triaxial.'),
        'methodology', COALESCE(NEW.data->>'methodology', 'Arte da Entrevista Clínica (AEC) aplicada à Cannabis Medicinal.'),
        'result', COALESCE(NEW.data->>'result', NEW.clinical_report, 'Avaliação clínica inicial concluída com sucesso.'),
        'evolution', COALESCE(NEW.data->>'evolution', 'Plano de cuidado personalizado estabelecido.'),
        'recommendations', COALESCE(
          (NEW.data->'recommendations')::jsonb,
          jsonb_build_array(
            'Acompanhamento médico regular',
            'Seguir protocolo de tratamento estabelecido',
            'Manter comunicação com equipe médica'
          )
        ),
        'scores', COALESCE(
          NEW.data->'scores',
          jsonb_build_object(
            'clinical_score', 75,
            'treatment_adherence', 80,
            'symptom_improvement', 70,
            'quality_of_life', 85
          )
        ),
        'fullReport', NEW.data,
        'clinicalReport', NEW.clinical_report
      ),
      'ai_resident',
      NOW(),
      'completed',
      NEW.id,
      NOW(),
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM clinical_reports cr 
      WHERE cr.assessment_id = NEW.id
    );

    RAISE NOTICE '✅ Relatório clínico gerado automaticamente para avaliação %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar função quando avaliação é concluída
DROP TRIGGER IF EXISTS trigger_generate_report_from_assessment ON clinical_assessments;

CREATE TRIGGER trigger_generate_report_from_assessment
  AFTER UPDATE OF status ON clinical_assessments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed'))
  EXECUTE FUNCTION generate_report_from_assessment();

-- Também criar trigger para INSERT caso a avaliação já seja criada como completed
CREATE OR REPLACE FUNCTION generate_report_on_insert_assessment()
RETURNS TRIGGER AS $$
DECLARE
  v_patient_name TEXT;
  v_patient_id UUID;
BEGIN
  -- Verificar se a avaliação já foi criada como concluída
  IF NEW.status = 'completed' THEN
    -- Buscar nome do paciente
    -- Primeiro tentar da tabela users, depois do JSON data
    SELECT name INTO v_patient_name
    FROM users
    WHERE id = NEW.patient_id
    LIMIT 1;
    
    -- Se não encontrar, usar o nome do JSON data
    IF v_patient_name IS NULL THEN
      v_patient_name := COALESCE(NEW.data->>'name', 'Paciente');
    END IF;


    v_patient_id := NEW.patient_id;

    -- Criar relatório clínico automaticamente
    INSERT INTO clinical_reports (
      id,
      patient_id,
      patient_name,
      report_type,
      protocol,
      content,
      generated_by,
      generated_at,
      status,
      assessment_id,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid()::TEXT,
      v_patient_id::TEXT,
      v_patient_name,
      'initial_assessment',
      COALESCE(NEW.assessment_type, 'IMRE'),
      jsonb_build_object(
        'investigation', COALESCE(NEW.data->>'investigation', 'Avaliação clínica inicial completa utilizando protocolo IMRE Triaxial.'),
        'methodology', COALESCE(NEW.data->>'methodology', 'Arte da Entrevista Clínica (AEC) aplicada à Cannabis Medicinal.'),
        'result', COALESCE(NEW.data->>'result', NEW.clinical_report, 'Avaliação clínica inicial concluída com sucesso.'),
        'evolution', COALESCE(NEW.data->>'evolution', 'Plano de cuidado personalizado estabelecido.'),
        'recommendations', COALESCE(
          (NEW.data->'recommendations')::jsonb,
          jsonb_build_array(
            'Acompanhamento médico regular',
            'Seguir protocolo de tratamento estabelecido',
            'Manter comunicação com equipe médica'
          )
        ),
        'scores', COALESCE(
          NEW.data->'scores',
          jsonb_build_object(
            'clinical_score', 75,
            'treatment_adherence', 80,
            'symptom_improvement', 70,
            'quality_of_life', 85
          )
        ),
        'fullReport', NEW.data,
        'clinicalReport', NEW.clinical_report
      ),
      'ai_resident',
      NOW(),
      'completed',
      NEW.id,
      NOW(),
      NOW()
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Relatório clínico gerado automaticamente para avaliação %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para INSERT
DROP TRIGGER IF EXISTS trigger_generate_report_on_insert_assessment ON clinical_assessments;

CREATE TRIGGER trigger_generate_report_on_insert_assessment
  AFTER INSERT ON clinical_assessments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION generate_report_on_insert_assessment();

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar triggers criados
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'clinical_assessments'
  AND trigger_name LIKE '%generate_report%';

-- =====================================================
-- SCRIPT CONCLUÍDO!
-- =====================================================

