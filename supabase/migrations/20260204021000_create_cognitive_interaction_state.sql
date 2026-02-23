-- =====================================================
-- 🧠 CAS (Estado de Interação) — MedCannLab / CCOS
-- =====================================================
-- Objetivo:
-- - Persistir um estado operacional de interação (tom/profundidade/estilo)
-- - NÃO é diagnóstico, NÃO é saúde mental, NÃO executa ações
-- - Serve apenas para modular linguagem e aumentar observabilidade
--
-- Seguro para reexecução.

BEGIN;

-- Table: estado de interação por usuário (0..100)
CREATE TABLE IF NOT EXISTS public.cognitive_interaction_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  depth_level INT NOT NULL DEFAULT 0,
  traits JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_shift_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS cognitive_interaction_state_user_id_key
  ON public.cognitive_interaction_state(user_id);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.cognitive_interaction_state;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.cognitive_interaction_state
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.cognitive_interaction_state ENABLE ROW LEVEL SECURITY;

-- Policies (reset)
DROP POLICY IF EXISTS "cognitive_interaction_state_select" ON public.cognitive_interaction_state;
DROP POLICY IF EXISTS "cognitive_interaction_state_insert" ON public.cognitive_interaction_state;
DROP POLICY IF EXISTS "cognitive_interaction_state_update" ON public.cognitive_interaction_state;

-- SELECT: dono ou admin/master
CREATE POLICY "cognitive_interaction_state_select" ON public.cognitive_interaction_state
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.flag_admin = true
          OR (u.type)::text IN ('admin','master')
        )
    )
  );

-- INSERT: apenas próprio user_id
CREATE POLICY "cognitive_interaction_state_insert" ON public.cognitive_interaction_state
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: dono (admin pode ajustar se necessário)
CREATE POLICY "cognitive_interaction_state_update" ON public.cognitive_interaction_state
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.flag_admin = true
          OR (u.type)::text IN ('admin','master')
        )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (
          u.flag_admin = true
          OR (u.type)::text IN ('admin','master')
        )
    )
  );

COMMENT ON TABLE public.cognitive_interaction_state IS
  'CAS — Estado operacional de interação (tom/profundidade/estilo). Não é diagnóstico. Usado para modulação de linguagem + observabilidade.';

COMMIT;

