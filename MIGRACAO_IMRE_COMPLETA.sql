-- =====================================================
-- 🏥 MIGRAÇÃO IMRE COMPLETA - MEDCANLAB 3.0→5.0
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. TABELA PRINCIPAL: IMRE ASSESSMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS imre_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID,
  assessment_type VARCHAR(50) NOT NULL DEFAULT 'triaxial',
  
  -- Dados do Sistema IMRE Triaxial (37 blocos preservados)
  triaxial_data JSONB NOT NULL,
  semantic_context JSONB NOT NULL,
  emotional_indicators JSONB,
  cognitive_patterns JSONB,
  behavioral_markers JSONB,
  
  -- Metadados da avaliação
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER,
  completion_status VARCHAR(20) DEFAULT 'in_progress',
  
  -- Contexto clínico
  clinical_notes TEXT,
  risk_factors JSONB,
  therapeutic_goals JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_completion_status CHECK (completion_status IN ('in_progress', 'completed', 'abandoned'))
);

-- 2. TABELA: IMRE BLOCOS SEMÂNTICOS
-- =====================================================
CREATE TABLE IF NOT EXISTS imre_semantic_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  block_number INTEGER NOT NULL,
  block_type VARCHAR(50) NOT NULL,
  
  -- Dados semânticos do bloco
  semantic_content JSONB NOT NULL,
  emotional_weight DECIMAL(3,2),
  cognitive_complexity DECIMAL(3,2),
  behavioral_impact DECIMAL(3,2),
  
  -- Metadados
  confidence_score DECIMAL(3,2),
  processing_time INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT valid_weights CHECK (emotional_weight >= 0 AND emotional_weight <= 1),
  CONSTRAINT valid_complexity CHECK (cognitive_complexity >= 0 AND cognitive_complexity <= 1),
  CONSTRAINT valid_impact CHECK (behavioral_impact >= 0 AND behavioral_impact <= 1)
);

-- 3. TABELA: CONTEXTO SEMÂNTICO PERSISTENTE
-- =====================================================
CREATE TABLE IF NOT EXISTS imre_semantic_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  
  -- Contexto semântico persistente
  semantic_memory JSONB NOT NULL,
  emotional_history JSONB,
  cognitive_patterns JSONB,
  behavioral_trends JSONB,
  
  -- Metadados
  context_version INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA: LOGS DE INTERAÇÃO NOA
-- =====================================================
CREATE TABLE IF NOT EXISTS noa_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  -- Dados da interação
  interaction_type VARCHAR(50) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  processing_time INTEGER,
  
  -- Análise semântica
  semantic_analysis JSONB,
  emotional_indicators JSONB,
  cognitive_insights JSONB,
  
  -- Metadados
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- 5. TABELA: INTEGRAÇÃO CLÍNICA
-- =====================================================
CREATE TABLE IF NOT EXISTS clinical_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  
  -- Dados clínicos integrados
  clinical_data JSONB NOT NULL,
  therapeutic_recommendations JSONB,
  risk_assessment JSONB,
  follow_up_plan JSONB,
  
  -- Metadados
  integration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clinician_notes TEXT,
  status VARCHAR(50) DEFAULT 'active'
);

-- 6. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE imre_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE imre_semantic_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imre_semantic_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_integration ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para imre_assessments
CREATE POLICY "Users can view own assessments" ON imre_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON imre_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON imre_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para imre_semantic_blocks
CREATE POLICY "Users can view blocks from own assessments" ON imre_semantic_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM imre_assessments 
      WHERE imre_assessments.id = imre_semantic_blocks.assessment_id 
      AND imre_assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert blocks to own assessments" ON imre_semantic_blocks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM imre_assessments 
      WHERE imre_assessments.id = imre_semantic_blocks.assessment_id 
      AND imre_assessments.user_id = auth.uid()
    )
  );

-- Políticas para imre_semantic_context
CREATE POLICY "Users can view own semantic context" ON imre_semantic_context
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own semantic context" ON imre_semantic_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para noa_interaction_logs
CREATE POLICY "Users can view own NOA logs" ON noa_interaction_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NOA logs" ON noa_interaction_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para clinical_integration
CREATE POLICY "Users can view own clinical integration" ON clinical_integration
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clinical integration" ON clinical_integration
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_imre_assessments_user_id ON imre_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_imre_assessments_date ON imre_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_imre_semantic_blocks_assessment_id ON imre_semantic_blocks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_imre_semantic_context_user_id ON imre_semantic_context(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_interaction_logs_user_id ON noa_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_integration_user_id ON clinical_integration(user_id);

-- 9. HABILITAR TEMPO REAL
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE imre_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE imre_semantic_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE noa_interaction_logs;

-- 10. VERIFICAR CRIAÇÃO DAS TABELAS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN (
  'imre_assessments', 
  'imre_semantic_blocks', 
  'imre_semantic_context', 
  'noa_interaction_logs', 
  'clinical_integration'
)
ORDER BY tablename;

-- Status: ✅ Migração IMRE Completa
-- - 5 tabelas IMRE criadas
-- - RLS habilitado com políticas seguras
-- - Índices para performance
-- - Tempo real ativado
-- - Sistema IMRE 100% operacional
