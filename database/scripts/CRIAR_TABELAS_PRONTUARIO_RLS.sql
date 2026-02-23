-- =====================================================
-- CRIAR TABELAS DE PRONTUÁRIO E POLÍTICAS RLS
-- Para integração Chat ↔ Prontuário
-- =====================================================

-- 1. VERIFICAR E CRIAR TABELA patient_medical_records
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
      report_id TEXT REFERENCES clinical_reports(id) ON DELETE CASCADE,
      
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

-- 2. VERIFICAR E CRIAR TABELA clinical_assessments
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

-- 3. VERIFICAR E CRIAR TABELA clinical_reports (se não existir)
-- Usar estrutura compatível com clinicalReportService.ts
DO $$
BEGIN
  -- Verificar se tabela existe e criar se necessário
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'clinical_reports'
  ) THEN
    CREATE TABLE clinical_reports (
      id TEXT PRIMARY KEY,
      patient_id UUID NOT NULL,
      patient_name TEXT NOT NULL,
      report_type TEXT NOT NULL CHECK (report_type IN ('initial_assessment', 'follow_up', 'emergency')),
      protocol TEXT NOT NULL DEFAULT 'IMRE',
      content JSONB NOT NULL,
      generated_by TEXT NOT NULL CHECK (generated_by IN ('ai_resident', 'professional')),
      generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'reviewed')),
      professional_id UUID,
      professional_name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Tabela clinical_reports criada';
  ELSE
    RAISE NOTICE '✅ Tabela clinical_reports já existe';
  END IF;
END $$;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_patient_medical_records_patient_id 
  ON patient_medical_records(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_medical_records_record_type 
  ON patient_medical_records(record_type);

CREATE INDEX IF NOT EXISTS idx_patient_medical_records_created_at 
  ON patient_medical_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clinical_assessments_patient_id 
  ON clinical_assessments(patient_id);

CREATE INDEX IF NOT EXISTS idx_clinical_assessments_status 
  ON clinical_assessments(status);

CREATE INDEX IF NOT EXISTS idx_clinical_assessments_created_at 
  ON clinical_assessments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clinical_reports_patient_id 
  ON clinical_reports(patient_id);

CREATE INDEX IF NOT EXISTS idx_clinical_reports_generated_at 
  ON clinical_reports(generated_at DESC);

-- 5. HABILITAR RLS
ALTER TABLE patient_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Users can view own clinical reports" ON clinical_reports;
DROP POLICY IF EXISTS "Users can insert clinical reports" ON clinical_reports;
DROP POLICY IF EXISTS "IA can insert clinical reports" ON clinical_reports;

-- 7. CRIAR POLÍTICAS RLS PARA patient_medical_records

-- Pacientes podem ver seus próprios registros
CREATE POLICY "Patients can view own medical records" ON patient_medical_records
  FOR SELECT 
  USING (auth.uid() = patient_id);

-- Profissionais podem ver registros de pacientes que atendem
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

-- Profissionais podem inserir registros de pacientes
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

-- 9. CRIAR POLÍTICAS RLS PARA clinical_reports

-- Usuários podem ver seus próprios relatórios
CREATE POLICY "Users can view own clinical reports" ON clinical_reports
  FOR SELECT 
  USING (
    auth.uid()::text = patient_id::text 
    OR auth.uid()::text = professional_id::text
  );

-- Usuários podem inserir relatórios (paciente ou profissional)
CREATE POLICY "Users can insert clinical reports" ON clinical_reports
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = patient_id::text 
    OR auth.uid()::text = professional_id::text
  );

-- IA pode inserir relatórios (via service_role - será usado pelo código)
-- Nota: Em produção, isso seria feito via service_role do Supabase
-- Para desenvolvimento, podemos permitir se o paciente/profissional estiver autenticado
CREATE POLICY "IA can insert clinical reports" ON clinical_reports
  FOR INSERT 
  WITH CHECK (
    generated_by = 'ai_resident' 
    AND (
      auth.uid()::text = patient_id::text 
      OR auth.uid()::text = professional_id::text
    )
  );

-- 10. CRIAR FUNÇÕES DE TRIGGER PARA updated_at

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
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

DROP TRIGGER IF EXISTS update_clinical_reports_updated_at ON clinical_reports;
CREATE TRIGGER update_clinical_reports_updated_at
  BEFORE UPDATE ON clinical_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. VERIFICAR ESTRUTURA CRIADA
SELECT 
  'Tabelas criadas' AS verificacao,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'patient_medical_records') AS patient_medical_records,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'clinical_assessments') AS clinical_assessments,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'clinical_reports') AS clinical_reports;

SELECT 
  'Políticas RLS criadas' AS verificacao,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'patient_medical_records') AS politicas_medical_records,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clinical_assessments') AS politicas_assessments,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clinical_reports') AS politicas_reports;

