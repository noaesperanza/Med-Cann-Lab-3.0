-- Migration: Cognitive Decision Objects (CCOS v2.0)
-- Description: Implementa o Átomo Soberano do CCOS: o Decision Object.
-- Phase: 2 (Decisão Antes de Ação)

CREATE TABLE IF NOT EXISTS cognitive_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type TEXT NOT NULL CHECK (decision_type IN ('priority', 'scheduling', 'alert', 'protocol')),
  recommendation JSONB NOT NULL,
  justification TEXT NOT NULL,
  alternatives JSONB DEFAULT '[]',
  confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
  autonomy_level INTEGER CHECK (autonomy_level BETWEEN 0 AND 3),
  requires_human_confirmation BOOLEAN DEFAULT true,
  policy_snapshot JSONB NOT NULL, -- Snapshot da política aplicada no momento
  model_version TEXT NOT NULL,
  human_feedback TEXT CHECK (human_feedback IN ('accepted', 'modified', 'rejected')),
  human_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para auditoria e performance
CREATE INDEX IF NOT EXISTS idx_decisions_type ON cognitive_decisions (decision_type);
CREATE INDEX IF NOT EXISTS idx_decisions_feedback ON cognitive_decisions (human_feedback);
CREATE INDEX IF NOT EXISTS idx_decisions_created ON cognitive_decisions (created_at DESC);

COMMENT ON TABLE cognitive_decisions IS 'O Átomo Soberano: Repositório de todas as decisões e recomendações da IA para auditoria clínica.';
