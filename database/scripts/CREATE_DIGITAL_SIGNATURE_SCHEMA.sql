-- =====================================================
-- 📋 SCHEMA DE ASSINATURA DIGITAL MÉDICA ICP-BRASIL
-- =====================================================
-- Sistema completo de assinatura digital conforme CFM/ITI
-- Data: 05/02/2026
-- Arquitetura: COS v5.0 + TradeVision Core

-- 1. ADICIONAR NÍVEL DE DOCUMENTO EM cfm_prescriptions
-- =====================================================
ALTER TABLE cfm_prescriptions 
ADD COLUMN IF NOT EXISTS document_level TEXT DEFAULT 'level_3' 
CHECK (document_level IN ('level_1', 'level_2', 'level_3'));

COMMENT ON COLUMN cfm_prescriptions.document_level IS 
'Nível do documento: level_1 (clínico interno), level_2 (administrativo simples), level_3 (legal - requer ICP-Brasil)';

-- 2. CRIAR TABELA DE CERTIFICADOS MÉDICOS
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('A1', 'A3', 'remote')),
  ac_provider TEXT NOT NULL, -- Soluti, Certisign, Valid, Safeweb, Serasa
  certificate_thumbprint TEXT, -- Hash do certificado para identificação
  certificate_serial_number TEXT, -- Número de série do certificado
  certificate_subject TEXT, -- Dados do certificado (CN, CPF, etc)
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_medical_certificates_professional_id ON medical_certificates(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_certificates_active ON medical_certificates(professional_id, is_active, expires_at) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_medical_certificates_expires_at ON medical_certificates(expires_at);

COMMENT ON TABLE medical_certificates IS 
'Tabela de gestão de certificados digitais ICP-Brasil dos profissionais médicos';

-- 3. CRIAR TABELA DE CONFIRMAÇÕES DE ASSINATURA
-- =====================================================
CREATE TABLE IF NOT EXISTS signature_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES cfm_prescriptions(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_confirmed_signature BOOLEAN DEFAULT FALSE,
  confirmation_timestamp TIMESTAMPTZ,
  document_version_hash TEXT NOT NULL, -- Hash do documento no momento da confirmação
  ip_address TEXT, -- IP do usuário (opcional, para auditoria)
  user_agent TEXT, -- User agent (opcional, para auditoria)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_signature_confirmations_document_id ON signature_confirmations(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_confirmations_professional_id ON signature_confirmations(professional_id);
CREATE INDEX IF NOT EXISTS idx_signature_confirmations_hash ON signature_confirmations(document_version_hash);

COMMENT ON TABLE signature_confirmations IS 
'Registro de confirmação explícita do profissional antes de assinar documento';

-- 4. CRIAR TABELA DE SNAPSHOTS DE DOCUMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS document_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES cfm_prescriptions(id) ON DELETE CASCADE NOT NULL,
  version_hash TEXT NOT NULL, -- Hash SHA-256 do documento
  pdf_url TEXT, -- URL do PDF gerado (se aplicável)
  pdf_storage_path TEXT, -- Caminho no storage (se aplicável)
  is_final BOOLEAN DEFAULT FALSE, -- Se é o snapshot final antes da assinatura
  snapshot_data JSONB, -- Dados do documento no momento do snapshot (opcional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_document_snapshots_document_id ON document_snapshots(document_id);
CREATE INDEX IF NOT EXISTS idx_document_snapshots_hash ON document_snapshots(version_hash);
CREATE INDEX IF NOT EXISTS idx_document_snapshots_final ON document_snapshots(document_id, is_final) WHERE is_final = TRUE;

COMMENT ON TABLE document_snapshots IS 
'Snapshots imutáveis de documentos antes da assinatura digital (garantia de integridade)';

-- 5. CRIAR/ATUALIZAR TABELA pki_transactions
-- =====================================================
-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.pki_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.cfm_prescriptions(id) ON DELETE CASCADE,
  signer_cpf TEXT NOT NULL,
  signature_value TEXT NOT NULL,
  certificate_thumbprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.pki_transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (DROP IF EXISTS para evitar erro se já existir)
DROP POLICY IF EXISTS "Authenticated users insert pki logs" ON public.pki_transactions;
DROP POLICY IF EXISTS "Authenticated users view pki logs" ON public.pki_transactions;
DROP POLICY IF EXISTS "Service role full access pki logs" ON public.pki_transactions;

CREATE POLICY "Authenticated users insert pki logs" 
ON public.pki_transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users view pki logs" 
ON public.pki_transactions 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Service role full access pki logs" 
ON public.pki_transactions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Adicionar coluna ac_provider se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'pki_transactions' 
    AND column_name = 'ac_provider'
  ) THEN
    ALTER TABLE public.pki_transactions 
    ADD COLUMN ac_provider TEXT;
    
    COMMENT ON COLUMN public.pki_transactions.ac_provider IS 
    'Autoridade Certificadora que emitiu o certificado usado na assinatura';
  END IF;
END $$;

-- 6. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_snapshots ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLÍTICAS RLS PARA medical_certificates
-- =====================================================
DROP POLICY IF EXISTS "Profissionais veem seus certificados" ON medical_certificates;
DROP POLICY IF EXISTS "Profissionais gerenciam seus certificados" ON medical_certificates;

CREATE POLICY "Profissionais veem seus certificados"
ON medical_certificates FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Profissionais gerenciam seus certificados"
ON medical_certificates FOR ALL
USING (auth.uid() = professional_id);

-- 8. CRIAR POLÍTICAS RLS PARA signature_confirmations
-- =====================================================
DROP POLICY IF EXISTS "Profissionais veem suas confirmações" ON signature_confirmations;
DROP POLICY IF EXISTS "Profissionais criam confirmações" ON signature_confirmations;

CREATE POLICY "Profissionais veem suas confirmações"
ON signature_confirmations FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Profissionais criam confirmações"
ON signature_confirmations FOR INSERT
WITH CHECK (auth.uid() = professional_id);

-- 9. CRIAR POLÍTICAS RLS PARA document_snapshots
-- =====================================================
DROP POLICY IF EXISTS "Profissionais veem snapshots de seus documentos" ON document_snapshots;
DROP POLICY IF EXISTS "Profissionais criam snapshots de seus documentos" ON document_snapshots;

CREATE POLICY "Profissionais veem snapshots de seus documentos"
ON document_snapshots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cfm_prescriptions
    WHERE id = document_snapshots.document_id
    AND professional_id = auth.uid()
  )
);

CREATE POLICY "Profissionais criam snapshots de seus documentos"
ON document_snapshots FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cfm_prescriptions
    WHERE id = document_snapshots.document_id
    AND professional_id = auth.uid()
  )
);

-- 10. CRIAR FUNÇÃO PARA ATUALIZAR updated_at EM medical_certificates
-- =====================================================
CREATE OR REPLACE FUNCTION update_medical_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_medical_certificates_updated_at ON medical_certificates;
CREATE TRIGGER trigger_update_medical_certificates_updated_at
    BEFORE UPDATE ON medical_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_medical_certificates_updated_at();

-- 11. CRIAR FUNÇÃO PARA VERIFICAR CERTIFICADO ATIVO
-- =====================================================
CREATE OR REPLACE FUNCTION get_active_certificate(p_professional_id UUID)
RETURNS TABLE (
  id UUID,
  certificate_type TEXT,
  ac_provider TEXT,
  certificate_thumbprint TEXT,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.id,
    mc.certificate_type,
    mc.ac_provider,
    mc.certificate_thumbprint,
    mc.expires_at
  FROM medical_certificates mc
  WHERE mc.professional_id = p_professional_id
    AND mc.is_active = TRUE
    AND mc.expires_at > NOW()
  ORDER BY mc.expires_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_certificate IS 
'Retorna o certificado ativo e válido de um profissional médico';

-- 12. VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
  'Schema de Assinatura Digital criado com sucesso!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'medical_certificates') as medical_certificates_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'signature_confirmations') as signature_confirmations_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'document_snapshots') as document_snapshots_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'cfm_prescriptions' AND column_name = 'document_level') as document_level_exists;

-- Status: ✅ Schema de Assinatura Digital Criado
-- - Coluna document_level adicionada em cfm_prescriptions
-- - Tabela medical_certificates criada
-- - Tabela signature_confirmations criada
-- - Tabela document_snapshots criada
-- - RLS habilitado com políticas seguras
-- - Índices criados para performance
-- - Funções auxiliares criadas
-- - Sistema pronto para uso
