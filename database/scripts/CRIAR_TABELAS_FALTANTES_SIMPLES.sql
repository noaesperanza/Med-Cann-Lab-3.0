-- =====================================================
-- CRIAR TABELAS FALTANTES - VERSÃO SIMPLES
-- Execute apenas este SQL no Supabase SQL Editor
-- =====================================================

-- CRIAR patient_medical_records (se não existir)
CREATE TABLE IF NOT EXISTS patient_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id TEXT REFERENCES clinical_reports(id) ON DELETE SET NULL,
  record_type VARCHAR(50) NOT NULL DEFAULT 'chat_interaction',
  record_data JSONB NOT NULL,
  nft_token_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRIAR clinical_assessments (se não existir)
CREATE TABLE IF NOT EXISTS clinical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  assessment_type TEXT NOT NULL DEFAULT 'IMRE',
  data JSONB NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  clinical_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_patient_id ON patient_medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_record_type ON patient_medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_created_at ON patient_medical_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_patient_id ON clinical_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_status ON clinical_assessments(status);

-- HABILITAR RLS
ALTER TABLE patient_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS EXISTENTES (se houver)
DROP POLICY IF EXISTS "Patients can view own medical records" ON patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view patient records" ON patient_medical_records;
DROP POLICY IF EXISTS "Patients can insert own medical records" ON patient_medical_records;
DROP POLICY IF EXISTS "Patients can update own medical records" ON patient_medical_records;

DROP POLICY IF EXISTS "Patients can view own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Professionals can view patient assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Patients can insert own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Patients can update own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Professionals can update patient assessments" ON clinical_assessments;

-- CRIAR POLÍTICAS RLS PARA patient_medical_records

CREATE POLICY "Patients can view own medical records" ON patient_medical_records
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own medical records" ON patient_medical_records
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own medical records" ON patient_medical_records
  FOR UPDATE USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- CRIAR POLÍTICAS RLS PARA clinical_assessments

CREATE POLICY "Patients can view own assessments" ON clinical_assessments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own assessments" ON clinical_assessments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own assessments" ON clinical_assessments
  FOR UPDATE USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Professionals can view patient assessments" ON clinical_assessments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Professionals can update patient assessments" ON clinical_assessments
  FOR UPDATE USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);

-- FUNÇÃO E TRIGGER PARA updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patient_medical_records_updated_at ON patient_medical_records;
CREATE TRIGGER update_patient_medical_records_updated_at
  BEFORE UPDATE ON patient_medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinical_assessments_updated_at ON clinical_assessments;
CREATE TRIGGER update_clinical_assessments_updated_at
  BEFORE UPDATE ON clinical_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- VERIFICAR RESULTADO
SELECT 
  'Tabelas criadas' AS status,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_records') 
    THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS patient_medical_records,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinical_assessments') 
    THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS clinical_assessments;

