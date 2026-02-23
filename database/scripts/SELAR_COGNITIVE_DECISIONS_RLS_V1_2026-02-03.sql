-- =====================================================
-- 🔒 SELAMENTO RLS — COGNITIVE DECISIONS (CCOS)
-- =====================================================
-- Data: 03/02/2026
-- Objetivo:
-- - Remover policy perigosa "ALL true" em `public.cognitive_decisions`
-- - Permitir SELECT/UPDATE/DELETE apenas para Admin/Master
-- - Permitir INSERT para service_role (Edge Functions)
--
-- Observação:
-- - O frontend tem o componente `DecisionFeedbackLoop` que atualiza decisões.
--   Ao selar, esse painel deve ser admin-only (o que é correto).
--
-- Seguro para reexecução.

ALTER TABLE public.cognitive_decisions ENABLE ROW LEVEL SECURITY;

-- Remover políticas perigosas conhecidas
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.cognitive_decisions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.cognitive_decisions;

DROP POLICY IF EXISTS "cognitive_decisions_admin_select" ON public.cognitive_decisions;
DROP POLICY IF EXISTS "cognitive_decisions_admin_update" ON public.cognitive_decisions;
DROP POLICY IF EXISTS "cognitive_decisions_admin_delete" ON public.cognitive_decisions;
DROP POLICY IF EXISTS "cognitive_decisions_service_insert" ON public.cognitive_decisions;

-- Admin/Master SELECT
CREATE POLICY "cognitive_decisions_admin_select" ON public.cognitive_decisions
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

-- Admin/Master UPDATE (feedback/notes)
CREATE POLICY "cognitive_decisions_admin_update" ON public.cognitive_decisions
  FOR UPDATE TO authenticated
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
  )
  WITH CHECK (
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

-- Admin/Master DELETE (apenas para limpeza/incident response)
CREATE POLICY "cognitive_decisions_admin_delete" ON public.cognitive_decisions
  FOR DELETE TO authenticated
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

-- service_role INSERT (Edge Functions); em geral service_role já bypassa RLS,
-- mas manter policy explícita documenta a intenção.
CREATE POLICY "cognitive_decisions_service_insert" ON public.cognitive_decisions
  FOR INSERT TO service_role
  WITH CHECK (true);

