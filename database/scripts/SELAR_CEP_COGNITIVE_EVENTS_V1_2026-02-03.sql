-- =====================================================
-- 🔒 SELAMENTO — CEP (COGNITIVE EVENTS) COS 5.0
-- =====================================================
-- Data: 03/02/2026
-- Objetivo:
-- - Criar `public.cognitive_events` (CEP) caso não exista
-- - Habilitar RLS
-- - Garantir SELECT apenas para Admin/Master
-- - Sem policies de INSERT/UPDATE/DELETE para clientes (Edge Function usa service_role e bypassa RLS)
--
-- Seguro para reexecução.

CREATE TABLE IF NOT EXISTS public.cognitive_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent TEXT NOT NULL, -- 'CLINICA', 'ADMIN', 'ENSINO', 'SISTEMA'
  action TEXT NOT NULL, -- 'GENERATE_RESPONSE', 'BLOCK_ACTION', 'SYSTEM_INJECTION', etc
  decision_result TEXT NOT NULL, -- 'ALLOWED', 'DENIED', 'SIGNAL', 'SILENCED'
  source TEXT NOT NULL, -- 'COS_KERNEL', 'SMART_TRIGGER', 'MANUAL_OVERRIDE'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cog_events_intent ON public.cognitive_events (intent);
CREATE INDEX IF NOT EXISTS idx_cog_events_created ON public.cognitive_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cog_events_result ON public.cognitive_events (decision_result);

ALTER TABLE public.cognitive_events ENABLE ROW LEVEL SECURITY;

-- limpar policy anterior (se existir) para evitar duplicidade/conflito
DROP POLICY IF EXISTS "Admins can view cognitive events" ON public.cognitive_events;
DROP POLICY IF EXISTS "cognitive_events_admin_select" ON public.cognitive_events;

CREATE POLICY "cognitive_events_admin_select" ON public.cognitive_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.flag_admin = true
          OR (u.type)::text IN ('admin','master')
        )
    )
  );

COMMENT ON TABLE public.cognitive_events IS
  'CEP — Registro imutável (insert-only via service_role) de pulsos cognitivos do COS.';

