-- =====================================================
-- CRIAR TABELAS FALTANTES PARA INTEGRAÇÃO CHAT ↔ PRONTUÁRIO
-- Baseado na verificação: clinical_reports existe, outras não
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DE clinical_reports PARA COMPATIBILIDADE
SELECT 
  'clinical_reports - Estrutura Atual' AS verificacao,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clinical_reports'
ORDER BY ordinal_position;

-- 2. CRIAR TABELA patient_medical_records (para interações do chat)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'patient_medical_records'
  ) THEN
    CREATE TABLE patient_medical_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      
      -- Referência ao relatório clínico (pode ser NULL se não tiver relatório ainda)
      -- Compatível com clinical_reports.id que é TEXT
      report_id TEXT REFERENCES clinical_reports(id) ON DELETE SET NULL,
      
      -- Tipo de registro
      record_type VARCHAR(50) NOT NULL DEFAULT 'chat_interaction',
      
      -- Dados do registro (JSONB flexível para diferentes tipos)
      record_data JSONB NOT NULL,
      
      -- Referência NFT (opcional)
      nft_token_id VARCHAR(100),
      
      -- Metadados
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Tabela patient_medical_records criada';
  ELSE
    RAISE NOTICE '✅ Tabela patient_medical_records já existe';
  END IF;
END $$;

-- 3. CRIAR TABELA clinical_assessments (para avaliações IMRE em andamento)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'clinical_assessments'
  ) THEN
    CREATE TABLE clinical_assessments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      doctor_id UUID REFERENCES auth.users(id),
      
      -- Tipo de avaliação
      assessment_type TEXT NOT NULL DEFAULT 'IMRE',
      
      -- Dados da avaliação (JSONB flexível)
      data JSONB NOT NULL,
      
      -- Status da avaliação
      status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
      
      -- Relatório clínico (texto formatado)
      clinical_report TEXT,
      
      -- Timestamps
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Tabela clinical_assessments criada';
  ELSE
    RAISE NOTICE '✅ Tabela clinical_assessments já existe';
  END IF;
END $$;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_patient_id 
  ON patient_medical_records(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_medical_records_record_type 
  ON patient_medical_records(record_type);

CREATE INDEX IF NOT EXISTS idx_patient_medical_records_created_at 
  ON patient_medical_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_medical_records_report_id 
  ON patient_medical_records(report_id) WHERE report_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clinical_assessments_patient_id 
  ON clinical_assessments(patient_id);

CREATE INDEX IF NOT EXISTS idx_clinical_assessments_status 
  ON clinical_assessments(status);

CREATE INDEX IF NOT EXISTS idx_clinical_assessments_created_at 
  ON clinical_assessments(created_at DESC);

-- 5. HABILITAR RLS
ALTER TABLE patient_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- 6. REMOVER POLÍTICAS EXISTENTES (se houver) para recriar
DROP POLICY IF EXISTS "Patients can view own medical records" ON patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view patient records" ON patient_medical_records;
DROP POLICY IF EXISTS "Patients can insert own medical records" ON patient_medical_records;
DROP POLICY IF EXISTS "Professionals can insert patient records" ON patient_medical_records;
DROP POLICY IF EXISTS "Patients can update own medical records" ON patient_medical_records;

DROP POLICY IF EXISTS "Patients can view own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Professionals can view patient assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Patients can insert own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Patients can update own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Professionals can update patient assessments" ON clinical_assessments;

-- 7. CRIAR POLÍTICAS RLS PARA patient_medical_records

-- Pacientes podem ver seus próprios registros
CREATE POLICY "Patients can view own medical records" ON patient_medical_records
  FOR SELECT 
  USING (auth.uid() = patient_id);

-- Profissionais podem ver registros de pacientes que atendem
-- (através de clinical_reports associados)
CREATE POLICY "Professionals can view patient records" ON patient_medical_records
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clinical_reports 
      WHERE clinical_reports.id = patient_medical_records.report_id 
      AND clinical_reports.professional_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM clinical_assessments 
      WHERE clinical_assessments.patient_id = patient_medical_records.patient_id
      AND clinical_assessments.doctor_id = auth.uid()
    )
  );

-- Pacientes podem inserir seus próprios registros (para chat)
CREATE POLICY "Patients can insert own medical records" ON patient_medical_records
  FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

-- Profissionais podem inserir registros de pacientes que atendem
CREATE POLICY "Professionals can insert patient records" ON patient_medical_records
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinical_reports 
      WHERE clinical_reports.patient_id = patient_medical_records.patient_id
      AND clinical_reports.professional_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM clinical_assessments 
      WHERE clinical_assessments.patient_id = patient_medical_records.patient_id
      AND clinical_assessments.doctor_id = auth.uid()
    )
  );

-- Pacientes podem atualizar seus próprios registros
CREATE POLICY "Patients can update own medical records" ON patient_medical_records
  FOR UPDATE 
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- 8. CRIAR POLÍTICAS RLS PARA clinical_assessments

-- Pacientes podem ver suas próprias avaliações
CREATE POLICY "Patients can view own assessments" ON clinical_assessments
  FOR SELECT 
  USING (auth.uid() = patient_id);

-- Profissionais podem ver avaliações de pacientes que atendem
CREATE POLICY "Professionals can view patient assessments" ON clinical_assessments
  FOR SELECT 
  USING (auth.uid() = doctor_id);

-- Pacientes podem inserir suas próprias avaliações
CREATE POLICY "Patients can insert own assessments" ON clinical_assessments
  FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

-- Pacientes podem atualizar suas próprias avaliações
CREATE POLICY "Patients can update own assessments" ON clinical_assessments
  FOR UPDATE 
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Profissionais podem atualizar avaliações de pacientes que atendem
CREATE POLICY "Professionals can update patient assessments" ON clinical_assessments
  FOR UPDATE 
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- 9. CRIAR FUNÇÃO E TRIGGER PARA updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
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

-- 10. VERIFICAR RESULTADO FINAL
SELECT 
  'Status Final' AS verificacao,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'patient_medical_records'
  ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS patient_medical_records,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'clinical_assessments'
  ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS clinical_assessments,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'patient_medical_records') AS politicas_medical_records,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clinical_assessments') AS politicas_assessments;

