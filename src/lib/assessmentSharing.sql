-- =====================================================
-- 🏥 SISTEMA DE COMPARTILHAMENTO DE AVALIAÇÕES IMRE
-- =====================================================
-- Sistema de compartilhamento entre os dois consultórios
-- Consultório Escola Ricardo Valença e Consultório Escola Eduardo Faveret

-- =====================================================
-- 1. TABELA: COMPARTILHAMENTO DE AVALIAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referências
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Compartilhamento com consultórios
  shared_with_ricardo_valenca BOOLEAN DEFAULT FALSE,
  shared_with_eduardo_faveret BOOLEAN DEFAULT FALSE,
  
  -- Controle de acesso
  patient_consent BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_expiry_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shared_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA: CONSULTÓRIOS (Dr. Ricardo e Dr. Eduardo)
-- =====================================================
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do consultório
  name TEXT NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(doctor_id)
);

-- Inserir os dois consultórios
INSERT INTO clinics (name, doctor_id, description) VALUES
  ('Consultório Escola Ricardo Valença', (SELECT id FROM auth.users WHERE email = 'ricardo@medcannlab.com' LIMIT 1), 'Consultório especializado em Cannabis Medicinal e Nefrologia'),
  ('Consultório Escola Eduardo Faveret', (SELECT id FROM auth.users WHERE email = 'eduardo@medcannlab.com' LIMIT 1), 'Consultório especializado em Cannabis Medicinal e Arte da Entrevista Clínica')
ON CONFLICT (doctor_id) DO NOTHING;

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE assessment_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Políticas para assessment_sharing
CREATE POLICY "Patients can view own assessment sharing" ON assessment_sharing
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own assessment sharing" ON assessment_sharing
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own assessment sharing" ON assessment_sharing
  FOR UPDATE USING (auth.uid() = patient_id);

-- Políticas para Dr. Ricardo Valença
CREATE POLICY "Ricardo Valenca can view shared assessments" ON assessment_sharing
  FOR SELECT USING (
    shared_with_ricardo_valenca = TRUE 
    AND patient_consent = TRUE
    AND (consent_expiry_date IS NULL OR consent_expiry_date > NOW())
    AND shared_with_ricardo_valenca = TRUE
  );

-- Políticas para Dr. Eduardo Faveret
CREATE POLICY "Eduardo Faveret can view shared assessments" ON assessment_sharing
  FOR SELECT USING (
    shared_with_eduardo_faveret = TRUE 
    AND patient_consent = TRUE
    AND (consent_expiry_date IS NULL OR consent_expiry_date > NOW())
    AND shared_with_eduardo_faveret = TRUE
  );

-- Políticas para clinics
CREATE POLICY "Anyone can view clinics" ON clinics
  FOR SELECT USING (TRUE);

CREATE POLICY "Doctors can view own clinic" ON clinics
  FOR SELECT USING (auth.uid() = doctor_id);

-- =====================================================
-- 4. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para compartilhar avaliação
CREATE OR REPLACE FUNCTION share_assessment_with_clinics(
  p_assessment_id UUID,
  p_share_with_ricardo BOOLEAN,
  p_share_with_eduardo BOOLEAN,
  p_patient_consent BOOLEAN DEFAULT TRUE,
  p_expiry_days INTEGER DEFAULT 365
) RETURNS UUID AS $$
DECLARE
  v_sharing_id UUID;
  v_patient_id UUID;
BEGIN
  -- Obter patient_id da avaliação
  SELECT patient_id INTO v_patient_id FROM imre_assessments WHERE id = p_assessment_id;
  
  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;
  
  -- Criar registro de compartilhamento
  INSERT INTO assessment_sharing (
    assessment_id,
    patient_id,
    shared_with_ricardo_valenca,
    shared_with_eduardo_faveret,
    patient_consent,
    consent_date,
    consent_expiry_date,
    shared_by
  ) VALUES (
    p_assessment_id,
    v_patient_id,
    p_share_with_ricardo,
    p_share_with_eduardo,
    p_patient_consent,
    NOW(),
    NOW() + (p_expiry_days || ' days')::INTERVAL,
    auth.uid()
  ) RETURNING id INTO v_sharing_id;
  
  RETURN v_sharing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar acesso de consultório
CREATE OR REPLACE FUNCTION clinic_can_access_assessment(
  p_assessment_id UUID,
  p_clinic_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_doctor_id UUID;
  v_ricardo_email TEXT := 'ricardo@medcannlab.com';
  v_eduardo_email TEXT := 'eduardo@medcannlab.com';
  v_result BOOLEAN := FALSE;
BEGIN
  -- Obter doctor_id do consultório
  SELECT doctor_id INTO v_doctor_id FROM clinics WHERE id = p_clinic_id;
  
  IF v_doctor_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o paciente deu consentimento e se a avaliação foi compartilhada
  SELECT EXISTS (
    SELECT 1 FROM assessment_sharing ash
    INNER JOIN auth.users u ON u.id = ash.patient_id
    WHERE ash.assessment_id = p_assessment_id
    AND ash.patient_consent = TRUE
    AND (ash.consent_expiry_date IS NULL OR ash.consent_expiry_date > NOW())
    AND (
      -- Se for Dr. Ricardo e tiver permissão
      (u.email = v_ricardo_email AND ash.shared_with_ricardo_valenca = TRUE)
      OR
      -- Se for Dr. Eduardo e tiver permissão
      (u.email = v_eduardo_email AND ash.shared_with_eduardo_faveret = TRUE)
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. INDEXES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_assessment_sharing_assessment_id ON assessment_sharing(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sharing_patient_id ON assessment_sharing(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sharing_ricardo ON assessment_sharing(shared_with_ricardo_valenca) WHERE shared_with_ricardo_valenca = TRUE;
CREATE INDEX IF NOT EXISTS idx_assessment_sharing_eduardo ON assessment_sharing(shared_with_eduardo_faveret) WHERE shared_with_eduardo_faveret = TRUE;
CREATE INDEX IF NOT EXISTS idx_assessment_sharing_consent ON assessment_sharing(patient_consent, consent_expiry_date);
CREATE INDEX IF NOT EXISTS idx_clinics_doctor_id ON clinics(doctor_id);

-- =====================================================
-- 6. VIEWS PARA FACILITAR CONSULTAS
-- =====================================================

-- View de avaliações compartilhadas com Dr. Ricardo
CREATE OR REPLACE VIEW ricardo_shared_assessments AS
SELECT 
  ash.*,
  ia.assessment_date,
  ia.completion_status,
  ia.triaxial_data,
  ia.clinical_notes
FROM assessment_sharing ash
INNER JOIN imre_assessments ia ON ia.id = ash.assessment_id
WHERE ash.shared_with_ricardo_valenca = TRUE
  AND ash.patient_consent = TRUE
  AND (ash.consent_expiry_date IS NULL OR ash.consent_expiry_date > NOW());

-- View de avaliações compartilhadas com Dr. Eduardo
CREATE OR REPLACE VIEW eduardo_shared_assessments AS
SELECT 
  ash.*,
  ia.assessment_date,
  ia.completion_status,
  ia.triaxial_data,
  ia.clinical_notes
FROM assessment_sharing ash
INNER JOIN imre_assessments ia ON ia.id = ash.assessment_id
WHERE ash.shared_with_eduardo_faveret = TRUE
  AND ash.patient_consent = TRUE
  AND (ash.consent_expiry_date IS NULL OR ash.consent_expiry_date > NOW());

-- View de avaliações do paciente
CREATE OR REPLACE VIEW patient_assessments AS
SELECT 
  ia.*,
  ash.shared_with_ricardo_valenca,
  ash.shared_with_eduardo_faveret,
  ash.patient_consent,
  ash.consent_date,
  ash.consent_expiry_date
FROM imre_assessments ia
LEFT JOIN assessment_sharing ash ON ash.assessment_id = ia.id
WHERE ia.user_id = auth.uid();
