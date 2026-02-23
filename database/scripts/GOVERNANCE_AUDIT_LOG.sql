-- Migration: Governance Audit Log (CCOS v2.0)
-- Description: Tabela para registrar alterações em políticas, ativação de Kill Switch e violações de autonomia.
-- Phase: 1 (Governança Invisível)

CREATE TABLE IF NOT EXISTS governance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'POLICY_CHANGE', 'KILL_SWITCH_ACTIVATE', 'POLICY_VIOLATION'
  actor_id UUID REFERENCES auth.users(id), -- Quem fez a alteração (se houver)
  intent_affected TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  severity TEXT DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para logar alterações em system_config (Kill Switch) automaticamente
CREATE OR REPLACE FUNCTION audit_system_config_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO governance_audit_log (event_type, old_value, new_value, reason, severity)
  VALUES ('KILL_SWITCH_CHANGE', OLD.value, NEW.value, NEW.value->>'reason', 'CRITICAL');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_system_config
AFTER UPDATE ON system_config
FOR EACH ROW
EXECUTE FUNCTION audit_system_config_change();

COMMENT ON TABLE governance_audit_log IS 'Doutrina CCOS: Registro imutável de governança sistêmica.';
