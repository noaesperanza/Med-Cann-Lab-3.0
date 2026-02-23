-- =====================================================
-- TABELAS PARA SISTEMA COMPLETO DE RELATÓRIOS CLÍNICOS
-- =====================================================

-- 1. TABELA: RELATÓRIOS CLÍNICOS
CREATE TABLE IF NOT EXISTS clinical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL,
  
  -- Dados do relatório
  report_data JSONB NOT NULL,
  
  -- Metadados NFT
  nft_metadata JSONB,
  
  -- Status do processo
  status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'nft_minted', 'saved_to_records')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA: PRONTUÁRIO DO PACIENTE
CREATE TABLE IF NOT EXISTS patient_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES clinical_reports(id) ON DELETE CASCADE,
  
  -- Tipo de registro
  record_type VARCHAR(50) NOT NULL,
  
  -- Dados do registro
  record_data JSONB NOT NULL,
  
  -- Referência NFT
  nft_token_id VARCHAR(100),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA: PRONTUÁRIO DO PROFISSIONAL
CREATE TABLE IF NOT EXISTS professional_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES clinical_reports(id) ON DELETE CASCADE,
  
  -- Tipo de registro
  record_type VARCHAR(50) NOT NULL,
  
  -- Dados do registro
  record_data JSONB NOT NULL,
  
  -- Referência NFT
  nft_token_id VARCHAR(100),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA: NFTs DE RELATÓRIOS
CREATE TABLE IF NOT EXISTS report_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES clinical_reports(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados NFT
  token_id VARCHAR(100) NOT NULL,
  contract_address VARCHAR(100) NOT NULL,
  transaction_hash VARCHAR(100) NOT NULL,
  ipfs_hash VARCHAR(100) NOT NULL,
  
  -- Metadados
  metadata JSONB NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'minted' CHECK (status IN ('minted', 'transferred', 'burned')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_clinical_reports_patient_id ON clinical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_professional_id ON clinical_reports(professional_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_status ON clinical_reports(status);

CREATE INDEX IF NOT EXISTS idx_patient_records_patient_id ON patient_medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_records_record_type ON patient_medical_records(record_type);

CREATE INDEX IF NOT EXISTS idx_professional_records_professional_id ON professional_medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_records_patient_id ON professional_medical_records(patient_id);

CREATE INDEX IF NOT EXISTS idx_report_nfts_patient_id ON report_nfts(patient_id);
CREATE INDEX IF NOT EXISTS idx_report_nfts_token_id ON report_nfts(token_id);

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- Habilitar RLS
ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_nfts ENABLE ROW LEVEL SECURITY;

-- Políticas para clinical_reports
CREATE POLICY "Users can view own clinical reports" ON clinical_reports
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = professional_id);

CREATE POLICY "Users can insert clinical reports" ON clinical_reports
  FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = professional_id);

-- Políticas para patient_medical_records
CREATE POLICY "Patients can view own medical records" ON patient_medical_records
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view patient records" ON patient_medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinical_reports 
      WHERE clinical_reports.id = patient_medical_records.report_id 
      AND clinical_reports.professional_id = auth.uid()
    )
  );

-- Políticas para professional_medical_records
CREATE POLICY "Professionals can view own records" ON professional_medical_records
  FOR SELECT USING (auth.uid() = professional_id);

-- Políticas para report_nfts
CREATE POLICY "Users can view own report NFTs" ON report_nfts
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own report NFTs" ON report_nfts
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- =====================================================
-- DADOS DE TESTE
-- =====================================================

-- Inserir relatório de teste
INSERT INTO clinical_reports (
  patient_id,
  professional_id,
  assessment_id,
  report_data,
  status
) VALUES (
  '3d6b170c-9b36-4e0d-8364-1e9c5131cb17', -- ID do paciente teste
  '3d6b170c-9b36-4e0d-8364-1e9c5131cb17', -- ID do profissional teste
  'test-assessment-001',
  '{
    "summary": "Relatório clínico IMRE Triaxial completo",
    "imreAnalysis": {
      "emotionalAxis": {"intensity": 7, "valence": 6, "arousal": 5, "stability": 8},
      "cognitiveAxis": {"attention": 7, "memory": 6, "executive": 7, "processing": 6},
      "behavioralAxis": {"activity": 6, "social": 7, "adaptive": 8, "regulatory": 7}
    },
    "clinicalFindings": {
      "renalFunction": {"creatinine": 1.2, "gfr": 85, "stage": "normal"},
      "cannabisMetabolism": {"cyp2c9": "normal", "cyp3a4": "normal", "metabolismRate": 1.0}
    },
    "recommendations": [
      "Acompanhamento médico regular",
      "Monitoramento de função renal",
      "Avaliação de fatores de risco",
      "Orientação sobre cannabis medicinal"
    ],
    "followUp": "Retorno em 30 dias"
  }',
  'generated'
) ON CONFLICT DO NOTHING;

SELECT 'Tabelas de relatórios clínicos criadas com sucesso!' AS status;
