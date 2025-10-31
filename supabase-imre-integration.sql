-- =====================================================
-- MEDCANLAB 3.0 → 5.0 UNIFICATION: IMRE TRIXIAL SYSTEM
-- =====================================================
-- Preservando a "alma" do sistema: escuta semântica profunda
-- Integrando com o "corpo" do 5.0: estrutura real de usuários

-- 1. TABELA PRINCIPAL: IMRE ASSESSMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS imre_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID, -- Referência ao paciente sendo avaliado
  assessment_type VARCHAR(50) NOT NULL DEFAULT 'triaxial',
  
  -- Dados do Sistema IMRE Triaxial (37 blocos preservados)
  triaxial_data JSONB NOT NULL,
  semantic_context JSONB NOT NULL,
  emotional_indicators JSONB,
  cognitive_patterns JSONB,
  behavioral_markers JSONB,
  
  -- Metadados da avaliação
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER, -- em minutos
  completion_status VARCHAR(20) DEFAULT 'in_progress',
  
  -- Contexto clínico
  clinical_notes TEXT,
  risk_factors JSONB,
  therapeutic_goals JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes para performance
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
  
  -- Contexto temporal
  block_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time INTEGER, -- em milissegundos
  
  -- Metadados
  confidence_score DECIMAL(3,2),
  validation_status VARCHAR(20) DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA: CONTEXTO SEMÂNTICO PERSISTENTE
-- =====================================================
CREATE TABLE IF NOT EXISTS imre_semantic_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contexto semântico acumulado
  semantic_memory JSONB NOT NULL,
  emotional_patterns JSONB,
  cognitive_trajectories JSONB,
  behavioral_evolution JSONB,
  
  -- Metadados do contexto
  context_version INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_stability DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA: NOA INTERACTION LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS noa_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  
  -- Dados da interação NOA
  interaction_type VARCHAR(50) NOT NULL, -- 'voice', 'text', 'multimodal'
  interaction_content JSONB NOT NULL,
  noa_response JSONB,
  
  -- Metadados da interação
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time INTEGER, -- em milissegundos
  confidence_score DECIMAL(3,2),
  
  -- Contexto da sessão
  session_id UUID,
  emotional_state VARCHAR(50),
  cognitive_load DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA: INTEGRAÇÃO COM MONITORAMENTO RENAL
-- =====================================================
CREATE TABLE IF NOT EXISTS clinical_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  
  -- Dados clínicos integrados
  renal_function_data JSONB,
  cannabis_metabolism_data JSONB,
  therapeutic_response JSONB,
  
  -- Correlações IMRE ↔ Clínicas
  imre_clinical_correlations JSONB,
  risk_assessment JSONB,
  treatment_recommendations JSONB,
  
  -- Metadados da integração
  integration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correlation_strength DECIMAL(3,2),
  clinical_significance VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para IMRE Assessments
CREATE INDEX IF NOT EXISTS idx_imre_assessments_user_id ON imre_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_imre_assessments_patient_id ON imre_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_imre_assessments_date ON imre_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_imre_assessments_status ON imre_assessments(completion_status);

-- Índices para Blocos Semânticos
CREATE INDEX IF NOT EXISTS idx_imre_blocks_assessment_id ON imre_semantic_blocks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_imre_blocks_type ON imre_semantic_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_imre_blocks_timestamp ON imre_semantic_blocks(block_timestamp);

-- Índices para Contexto Semântico
CREATE INDEX IF NOT EXISTS idx_semantic_context_user_id ON imre_semantic_context(user_id);
CREATE INDEX IF NOT EXISTS idx_semantic_context_updated ON imre_semantic_context(last_updated);

-- Índices para NOA Interactions
CREATE INDEX IF NOT EXISTS idx_noa_logs_user_id ON noa_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_logs_assessment_id ON noa_interaction_logs(assessment_id);
CREATE INDEX IF NOT EXISTS idx_noa_logs_timestamp ON noa_interaction_logs(interaction_timestamp);

-- Índices para Integração Clínica
CREATE INDEX IF NOT EXISTS idx_clinical_integration_user_id ON clinical_integration(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_integration_assessment_id ON clinical_integration(assessment_id);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas principais
CREATE TRIGGER update_imre_assessments_updated_at 
    BEFORE UPDATE ON imre_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE imre_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE imre_semantic_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imre_semantic_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_integration ENABLE ROW LEVEL SECURITY;

-- Políticas para IMRE Assessments
CREATE POLICY "Users can view their own assessments" ON imre_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" ON imre_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" ON imre_assessments
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para Blocos Semânticos
CREATE POLICY "Users can view their semantic blocks" ON imre_semantic_blocks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM imre_assessments 
            WHERE id = assessment_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert semantic blocks" ON imre_semantic_blocks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM imre_assessments 
            WHERE id = assessment_id AND user_id = auth.uid()
        )
    );

-- Políticas para Contexto Semântico
CREATE POLICY "Users can manage their semantic context" ON imre_semantic_context
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para NOA Interaction Logs
CREATE POLICY "Users can view their NOA interactions" ON noa_interaction_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert NOA interactions" ON noa_interaction_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para Integração Clínica
CREATE POLICY "Users can view their clinical integration" ON clinical_integration
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert clinical integration" ON clinical_integration
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES AUXILIARES PARA IMRE
-- =====================================================

-- Função para calcular estabilidade semântica
CREATE OR REPLACE FUNCTION calculate_semantic_stability(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    stability_score DECIMAL;
BEGIN
    SELECT AVG(confidence_score) INTO stability_score
    FROM imre_semantic_blocks isb
    JOIN imre_assessments ia ON isb.assessment_id = ia.id
    WHERE ia.user_id = user_uuid
    AND isb.created_at > NOW() - INTERVAL '30 days';
    
    RETURN COALESCE(stability_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Função para obter contexto semântico mais recente
CREATE OR REPLACE FUNCTION get_latest_semantic_context(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    context_data JSONB;
BEGIN
    SELECT semantic_memory INTO context_data
    FROM imre_semantic_context
    WHERE user_id = user_uuid
    ORDER BY last_updated DESC
    LIMIT 1;
    
    RETURN COALESCE(context_data, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS PARA ANÁLISE INTEGRADA
-- =====================================================

-- View: Resumo de Avaliações IMRE por Usuário
CREATE OR REPLACE VIEW imre_user_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(ia.id) as total_assessments,
    COUNT(CASE WHEN ia.completion_status = 'completed' THEN 1 END) as completed_assessments,
    AVG(ia.session_duration) as avg_session_duration,
    MAX(ia.assessment_date) as last_assessment_date,
    calculate_semantic_stability(u.id) as semantic_stability
FROM auth.users u
LEFT JOIN imre_assessments ia ON u.id = ia.user_id
GROUP BY u.id, u.email;

-- View: Correlações Clínicas
CREATE OR REPLACE VIEW clinical_correlations AS
SELECT 
    ci.id,
    ci.user_id,
    ci.assessment_id,
    ci.imre_clinical_correlations,
    ci.risk_assessment,
    ci.treatment_recommendations,
    ci.correlation_strength,
    ci.clinical_significance,
    ia.assessment_date,
    ia.triaxial_data
FROM clinical_integration ci
JOIN imre_assessments ia ON ci.assessment_id = ia.id
WHERE ci.correlation_strength > 0.7; -- Apenas correlações significativas

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON TABLE imre_assessments IS 'Sistema IMRE Triaxial - Preservando a alma semântica do MedCannLab 3.0';
COMMENT ON TABLE imre_semantic_blocks IS 'Blocos semânticos individuais do sistema IMRE (37 blocos preservados)';
COMMENT ON TABLE imre_semantic_context IS 'Contexto semântico persistente para continuidade da escuta';
COMMENT ON TABLE noa_interaction_logs IS 'Logs de interação com NOA Multimodal preservando escuta real';
COMMENT ON TABLE clinical_integration IS 'Integração entre IMRE e dados clínicos reais';

-- =====================================================
-- SCRIPT DE MIGRAÇÃO COMPLETO
-- =====================================================
-- Este script preserva completamente o sistema IMRE Triaxial
-- e o integra com a estrutura real do MedCannLab 5.0
-- Mantendo a "alma" (escuta semântica) e ganhando o "corpo" (dados reais)
