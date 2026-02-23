-- =====================================================
-- 🔒 SELAMENTO — "SUPER‑EGO" COS (RLS ON + Admin-only)
-- =====================================================
-- Data: 03/02/2026
-- Tabelas alvo (criticidade alta):
-- - cognitive_metabolism
-- - cognitive_policies
-- - system_config
-- - base_conhecimento
--
-- Princípio: clientes não devem ler/escrever essas tabelas livremente.
-- Edge Functions usam `service_role` e continuam funcionando (bypass RLS).
--
-- Seguro para reexecução.

-- Helper: admin = users.flag_admin OR users.type in ('admin','master')

-- =====================================================
-- 1) cognitive_metabolism
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.cognitive_metabolism') IS NOT NULL THEN
    ALTER TABLE public.cognitive_metabolism ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Enable all for authenticated" ON public.cognitive_metabolism;
    DROP POLICY IF EXISTS "cognitive_metabolism_admin_select" ON public.cognitive_metabolism;
    DROP POLICY IF EXISTS "cognitive_metabolism_admin_update" ON public.cognitive_metabolism;

    CREATE POLICY "cognitive_metabolism_admin_select" ON public.cognitive_metabolism
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );

    CREATE POLICY "cognitive_metabolism_admin_update" ON public.cognitive_metabolism
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );
  END IF;
END $$;

-- =====================================================
-- 2) cognitive_policies
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.cognitive_policies') IS NOT NULL THEN
    ALTER TABLE public.cognitive_policies ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Enable all for authenticated" ON public.cognitive_policies;
    DROP POLICY IF EXISTS "cognitive_policies_admin_select" ON public.cognitive_policies;
    DROP POLICY IF EXISTS "cognitive_policies_admin_update" ON public.cognitive_policies;

    CREATE POLICY "cognitive_policies_admin_select" ON public.cognitive_policies
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );

    CREATE POLICY "cognitive_policies_admin_update" ON public.cognitive_policies
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );
  END IF;
END $$;

-- =====================================================
-- 3) system_config
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.system_config') IS NOT NULL THEN
    ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Enable all for authenticated" ON public.system_config;
    DROP POLICY IF EXISTS "system_config_admin_select" ON public.system_config;
    DROP POLICY IF EXISTS "system_config_admin_update" ON public.system_config;

    CREATE POLICY "system_config_admin_select" ON public.system_config
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );

    CREATE POLICY "system_config_admin_update" ON public.system_config
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );
  END IF;
END $$;

-- =====================================================
-- 4) base_conhecimento
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.base_conhecimento') IS NOT NULL THEN
    ALTER TABLE public.base_conhecimento ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Enable all for authenticated" ON public.base_conhecimento;
    DROP POLICY IF EXISTS "base_conhecimento_admin_select" ON public.base_conhecimento;
    DROP POLICY IF EXISTS "base_conhecimento_admin_update" ON public.base_conhecimento;

    CREATE POLICY "base_conhecimento_admin_select" ON public.base_conhecimento
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );

    CREATE POLICY "base_conhecimento_admin_update" ON public.base_conhecimento
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
        )
      );
  END IF;
END $$;

