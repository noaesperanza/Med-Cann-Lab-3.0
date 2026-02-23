-- =====================================================
-- TABELA DE AVALIAÇÕES CLÍNICAS
-- =====================================================
-- Criar tabela para armazenar avaliações clínicas dos pacientes

CREATE TABLE IF NOT EXISTS clinical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID,
  assessment_type TEXT NOT NULL DEFAULT 'IMRE',
  
  -- Dados da avaliação
  data JSONB NOT NULL,
  
  -- Status da avaliação
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  
  -- Relatório clínico
  clinical_report TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_patient_id ON clinical_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_doctor_id ON clinical_assessments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_status ON clinical_assessments(status);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_created_at ON clinical_assessments(created_at);

-- Ativar RLS
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Pacientes podem ver suas próprias avaliações"
  ON clinical_assessments
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Pacientes podem criar avaliações"
  ON clinical_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Profissionais podem ver avaliações de seus pacientes"
  ON clinical_assessments
  FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Profissionais podem atualizar avaliações"
  ON clinical_assessments
  FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_clinical_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clinical_assessments_updated_at
  BEFORE UPDATE ON clinical_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_assessments_updated_at();
