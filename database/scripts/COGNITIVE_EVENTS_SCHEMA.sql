-- Migration: Cognitive Event Protocol (CEP) - COS v5.0
-- Description: Tabela imutável (Insert-Only) para auditoria de decisões cognitivas.
-- Phase: 3 (Auditoria & Verdade Imutável)

CREATE TABLE IF NOT EXISTS cognitive_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent TEXT NOT NULL, -- 'CLINICA', 'ADMIN', 'ENSINO', 'SISTEMA'
  action TEXT NOT NULL, -- 'GENERATE_RESPONSE', 'BLOCK_ACTION', 'SYSTEM_INJECTION'
  decision_result TEXT NOT NULL, -- 'ALLOWED', 'DENIED', 'SIGNAL', 'SILENCED'
  source TEXT NOT NULL, -- 'COS_KERNEL', 'SMART_TRIGGER', 'MANUAL_OVERRIDE'
  metadata JSONB DEFAULT '{}', -- Contexto da decisão (reason, policy_version, etc)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para auditoria rápida
CREATE INDEX IF NOT EXISTS idx_cog_events_intent ON cognitive_events (intent);
CREATE INDEX IF NOT EXISTS idx_cog_events_created ON cognitive_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cog_events_result ON cognitive_events (decision_result);

-- Regra de Segurança: Insert-Only (Ninguém edita o passado)
-- No Supabase, isso é garantido por Policies, mas aqui definimos a tabela base.

ALTER TABLE cognitive_events ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas o sistema (via Service Role) ou Admins podem ver. Ninguém edita.
CREATE POLICY "Admins can view cognitive events" ON cognitive_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE
        u.id = auth.uid()
        AND (
          u.flag_admin = true
          OR (u.type)::text IN ('admin', 'master')
        )
    )
  );

-- O Edge Function usa Service Role, que bypassa RLS, então OK para inserts.

COMMENT ON TABLE cognitive_events IS 'O Livro da Verdade Cognitiva: Registro imutável de cada pulso de decisão do sistema.';
