-- Migration: Initial Governance Infrastructure (CCOS v2.0)
-- Description: Cria as tabelas de Políticas Cognitivas Versionadas e Configuração do Kill Switch.
-- Phase: 1 (Governança Invisível)

-- 1. Tabela de Políticas Cognitivas Versionadas
CREATE TABLE IF NOT EXISTS cognitive_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent TEXT NOT NULL, -- 'CLINICA', 'ENSINO', 'ADMIN'
  version INTEGER DEFAULT 1,
  autonomy_level INTEGER CHECK (autonomy_level BETWEEN 0 AND 3),
  allowed_actions JSONB DEFAULT '[]',
  forbidden_actions JSONB DEFAULT '[]',
  requires_confirmation BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Políticas Iniciais (Doutrina CCOS v2.0)
INSERT INTO cognitive_policies (intent, version, autonomy_level, allowed_actions, forbidden_actions, requires_confirmation)
VALUES 
  ('CLINICA', 1, 1, '["ask_question", "generate_summary", "suggest_protocol"]', '["prescribe", "diagnose"]', true),
  ('ENSINO', 1, 2, '["simulate_patient", "evaluate_student", "provide_feedback"]', '["access_real_patient_data"]', false),
  ('ADMIN', 1, 2, '["schedule", "send_reminder", "generate_report"]', '["modify_clinical_data"]', false)
ON CONFLICT DO NOTHING;

-- 2. Tabela de Configuração do Sistema (Kill Switch)
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Estado Inicial: Autonomia Plena (Sempre auditável)
INSERT INTO system_config (key, value)
VALUES ('ai_mode', '{"mode": "FULL", "reason": "Selo de Maturidade Inicial", "updated_at": null}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_policies_intent_version ON cognitive_policies (intent, version DESC);

COMMENT ON TABLE cognitive_policies IS 'Doutrina Operacional: Define o que a IA pode e não pode fazer por contexto.';
COMMENT ON TABLE system_config IS 'Controle Mestre: Kill Switch e configurações globais do CCOS.';
