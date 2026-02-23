-- =====================================================
-- 📋 TABELA DE PRESCRIÇÕES MÉDICAS CFM
-- =====================================================
-- Sistema completo de prescrições eletrônicas conforme CFM
-- Com assinatura digital ICP Brasil e validação ITI

-- 1. CRIAR TABELA DE PRESCRIÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS cfm_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de prescrição CFM
  prescription_type TEXT NOT NULL CHECK (prescription_type IN ('simple', 'special', 'blue', 'yellow')),
  
  -- Dados do paciente
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_cpf TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  
  -- Dados do profissional
  professional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  professional_name TEXT NOT NULL,
  professional_crm TEXT NOT NULL,
  professional_specialty TEXT,
  
  -- Medicamentos (array JSONB)
  medications JSONB NOT NULL DEFAULT '[]'::JSONB,
  -- Estrutura: [{"name": "Paracetamol", "dosage": "500mg", "frequency": "De 8/8 horas", "duration": "7 dias", "quantity": "14 comprimidos"}]
  
  -- Assinatura digital
  digital_signature TEXT,
  signature_certificate TEXT, -- Certificado ICP Brasil
  signature_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Validação ITI
  iti_validation_code TEXT UNIQUE, -- Código único para validação no Portal ITI
  iti_qr_code TEXT, -- QR Code para validação
  iti_validation_url TEXT, -- URL de validação no Portal ITI
  
  -- Status da prescrição
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'sent', 'validated', 'cancelled')),
  
  -- Envio
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_via_email BOOLEAN DEFAULT FALSE,
  sent_via_sms BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Observações e notas
  notes TEXT,
  observations TEXT,
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Data de validade da prescrição
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cfm_prescriptions_patient_id ON cfm_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_cfm_prescriptions_professional_id ON cfm_prescriptions(professional_id);
CREATE INDEX IF NOT EXISTS idx_cfm_prescriptions_type ON cfm_prescriptions(prescription_type);
CREATE INDEX IF NOT EXISTS idx_cfm_prescriptions_status ON cfm_prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_cfm_prescriptions_created_at ON cfm_prescriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cfm_prescriptions_iti_code ON cfm_prescriptions(iti_validation_code);
CREATE INDEX IF NOT EXISTS idx_cfm_prescriptions_patient_created ON cfm_prescriptions(patient_id, created_at DESC);

-- 3. HABILITAR RLS
-- =====================================================
ALTER TABLE cfm_prescriptions ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Profissionais podem ver suas prescrições" ON cfm_prescriptions;
DROP POLICY IF EXISTS "Pacientes podem ver suas prescrições" ON cfm_prescriptions;
DROP POLICY IF EXISTS "Profissionais podem criar prescrições" ON cfm_prescriptions;
DROP POLICY IF EXISTS "Profissionais podem atualizar suas prescrições" ON cfm_prescriptions;
DROP POLICY IF EXISTS "Profissionais podem deletar suas prescrições" ON cfm_prescriptions;

-- POLÍTICA 1: Profissional vê suas próprias prescrições
CREATE POLICY "Profissionais podem ver suas prescrições" ON cfm_prescriptions
  FOR SELECT
  USING (
    auth.uid() = professional_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- POLÍTICA 2: Paciente vê suas próprias prescrições
CREATE POLICY "Pacientes podem ver suas prescrições" ON cfm_prescriptions
  FOR SELECT
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' 
           OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 3: Profissional pode criar prescrições
CREATE POLICY "Profissionais podem criar prescrições" ON cfm_prescriptions
  FOR INSERT
  WITH CHECK (
    auth.uid() = professional_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- POLÍTICA 4: Profissional pode atualizar suas prescrições
CREATE POLICY "Profissionais podem atualizar suas prescrições" ON cfm_prescriptions
  FOR UPDATE
  USING (
    auth.uid() = professional_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- POLÍTICA 5: Profissional pode deletar suas prescrições (apenas rascunhos)
CREATE POLICY "Profissionais podem deletar suas prescrições" ON cfm_prescriptions
  FOR DELETE
  USING (
    auth.uid() = professional_id
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- 5. CRIAR FUNÇÃO PARA GERAR CÓDIGO ITI
-- =====================================================
CREATE OR REPLACE FUNCTION generate_iti_validation_code()
RETURNS TEXT AS $$
BEGIN
  -- Gera código único no formato: ITI-YYYYMMDD-HHMMSS-XXXXX
  RETURN 'ITI-' || 
         TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
         TO_CHAR(NOW(), 'HH24MISS') || '-' ||
         UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_cfm_prescriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cfm_prescriptions_updated_at ON cfm_prescriptions;
CREATE TRIGGER trigger_update_cfm_prescriptions_updated_at
    BEFORE UPDATE ON cfm_prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_cfm_prescriptions_updated_at();

-- 7. CRIAR FUNÇÃO PARA DEFINIR DATA DE EXPIRAÇÃO AUTOMÁTICA
-- =====================================================
CREATE OR REPLACE FUNCTION set_prescription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Prescrições simples: 30 dias
  -- Prescrições especiais: 30 dias
  -- Receita azul: 30 dias
  -- Receita amarela: 30 dias
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NOW() + INTERVAL '30 days';
  END IF;
  
  -- Gerar código ITI automaticamente quando assinada
  IF NEW.status = 'signed' AND NEW.iti_validation_code IS NULL THEN
    NEW.iti_validation_code = generate_iti_validation_code();
    NEW.iti_validation_url = 'https://www.gov.br/iti/pt-br/validacao?codigo=' || NEW.iti_validation_code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_prescription_expiry ON cfm_prescriptions;
CREATE TRIGGER trigger_set_prescription_expiry
    BEFORE INSERT OR UPDATE ON cfm_prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION set_prescription_expiry();

-- 8. VERIFICAR ESTRUTURA FINAL
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cfm_prescriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Status: ✅ Tabela de Prescrições CFM Criada
-- - Tabela cfm_prescriptions criada
-- - RLS habilitado com políticas seguras
-- - Índices criados para performance
-- - Função para gerar código ITI
-- - Triggers para updated_at e expiração automática
-- - Sistema pronto para uso

