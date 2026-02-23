-- =====================================================
-- 🩹 ALINHAMENTO — institutional_trauma_log (COS Trauma)
-- =====================================================
-- Data: 03/02/2026
-- Objetivo:
-- - Corrigir mismatch entre o Core (tradevision-core) e o schema real
-- - Garantir que o INSERT do fallback de OpenAI não falhe
-- - Preservar compatibilidade com o schema atual:
--   (id, restricted_mode_active, reason, recovery_estimated_at, created_at)
--
-- O Core hoje faz:
--   insert { severity, reason, affected_domain, metadata }
-- e lê:
--   select * where restricted_mode_active=true and recovery_estimated_at > now()
--
-- Estratégia:
-- - Adicionar colunas (se não existirem): severity, affected_domain, metadata
-- - Aplicar defaults SOMENTE no cenário de fallback (sem alterar defaults globais):
--   - Core insere `severity/affected_domain/metadata`
--   - Se `restricted_mode_active`/`recovery_estimated_at` vierem nulos, setar:
--     - restricted_mode_active = true
--     - recovery_estimated_at = now() + 15 minutes
-- - Selar RLS: SELECT apenas Admin/Master (Core usa service_role)
--
-- Seguro para reexecução.

DO $$
BEGIN
  IF to_regclass('public.institutional_trauma_log') IS NULL THEN
    RAISE EXCEPTION 'Tabela public.institutional_trauma_log não existe';
  END IF;
END $$;

-- 1) Adicionar colunas que o Core tenta gravar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'institutional_trauma_log' AND column_name = 'severity'
  ) THEN
    ALTER TABLE public.institutional_trauma_log
      ADD COLUMN severity text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'institutional_trauma_log' AND column_name = 'affected_domain'
  ) THEN
    ALTER TABLE public.institutional_trauma_log
      ADD COLUMN affected_domain text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'institutional_trauma_log' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.institutional_trauma_log
      ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 2) Segurança operacional: não deixar defaults globais “fortes”
-- Se alguém já rodou uma versão anterior deste script que setava defaults permanentes,
-- removemos esses defaults para evitar impacto sistêmico.
DO $$
DECLARE
  d1 text;
  d2 text;
BEGIN
  SELECT column_default INTO d1
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'institutional_trauma_log' AND column_name = 'restricted_mode_active';

  IF d1 IS NOT NULL AND lower(d1) LIKE 'true%' THEN
    ALTER TABLE public.institutional_trauma_log
      ALTER COLUMN restricted_mode_active DROP DEFAULT;
  END IF;

  SELECT column_default INTO d2
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'institutional_trauma_log' AND column_name = 'recovery_estimated_at';

  IF d2 IS NOT NULL AND lower(d2) LIKE '%15 minutes%' THEN
    ALTER TABLE public.institutional_trauma_log
      ALTER COLUMN recovery_estimated_at DROP DEFAULT;
  END IF;
END $$;

-- 3) Trigger: aplicar defaults apenas quando o payload indicar "fallback do Core"
-- (ou seja: severity/affected_domain/metadata presentes) e quando os campos-alvo vierem nulos.
CREATE OR REPLACE FUNCTION public.set_trauma_fallback_defaults()
RETURNS trigger AS $$
BEGIN
  IF NEW.severity IS NOT NULL OR NEW.affected_domain IS NOT NULL OR NEW.metadata IS NOT NULL THEN
    IF NEW.restricted_mode_active IS NULL THEN
      NEW.restricted_mode_active := true;
    END IF;
    IF NEW.recovery_estimated_at IS NULL THEN
      NEW.recovery_estimated_at := now() + interval '15 minutes';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_trauma_fallback_defaults ON public.institutional_trauma_log;
CREATE TRIGGER trg_set_trauma_fallback_defaults
  BEFORE INSERT ON public.institutional_trauma_log
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trauma_fallback_defaults();

-- 4) RLS (sealing)
ALTER TABLE public.institutional_trauma_log ENABLE ROW LEVEL SECURITY;

-- remover policies perigosas/legadas, se existirem
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.institutional_trauma_log;
DROP POLICY IF EXISTS "institutional_trauma_log_admin_select" ON public.institutional_trauma_log;
DROP POLICY IF EXISTS "institutional_trauma_log_service_insert" ON public.institutional_trauma_log;

-- Admin/Master SELECT
CREATE POLICY "institutional_trauma_log_admin_select" ON public.institutional_trauma_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
    )
  );

-- service_role INSERT (documenta intenção; service_role normalmente bypassa RLS)
CREATE POLICY "institutional_trauma_log_service_insert" ON public.institutional_trauma_log
  FOR INSERT TO service_role
  WITH CHECK (true);

