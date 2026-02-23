-- =====================================================
-- 🔧 Fix RLS/Grants — user_interactions / semantic_analysis
-- =====================================================
-- Sintoma (frontend): 403 em /rest/v1/user_interactions
-- Causa: RLS habilitado por scripts de setup sem policies/grants suficientes
-- Objetivo:
-- - Permitir que usuários autenticados registrem suas próprias interações
-- - Permitir que Admin/Master auditem (SELECT) quando necessário
-- - Manter o modelo "fail-closed" (nada fora das regras entra)
--
-- Seguro para reexecução.

BEGIN;

-- Garantir privilégios básicos (PostgREST precisa de GRANT + policy quando RLS está ON)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON TABLE public.user_interactions TO authenticated;
GRANT SELECT, INSERT ON TABLE public.semantic_analysis TO authenticated;

-- RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semantic_analysis ENABLE ROW LEVEL SECURITY;

-- Reset policies
DROP POLICY IF EXISTS "user_interactions_select_own_or_admin" ON public.user_interactions;
DROP POLICY IF EXISTS "user_interactions_insert_own" ON public.user_interactions;
DROP POLICY IF EXISTS "semantic_analysis_select_own_or_admin" ON public.semantic_analysis;
DROP POLICY IF EXISTS "semantic_analysis_insert_own" ON public.semantic_analysis;

-- Helper: is admin/master?
-- (mesmo modelo usado no CEP: public.users.flag_admin OR type in admin/master)

CREATE POLICY "user_interactions_select_own_or_admin" ON public.user_interactions
  FOR SELECT TO authenticated
  USING (
    auth.uid()::text = user_id
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

CREATE POLICY "user_interactions_insert_own" ON public.user_interactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- semantic_analysis é filha de user_interactions (chat_id -> user_interactions.id)
CREATE POLICY "semantic_analysis_select_own_or_admin" ON public.semantic_analysis
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_interactions ui
      WHERE ui.id = semantic_analysis.chat_id
        AND (
          ui.user_id = auth.uid()::text
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
    )
  );

CREATE POLICY "semantic_analysis_insert_own" ON public.semantic_analysis
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_interactions ui
      WHERE ui.id = semantic_analysis.chat_id
        AND ui.user_id = auth.uid()::text
    )
  );

COMMIT;

