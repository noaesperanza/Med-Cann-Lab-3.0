
-- ============================================================
-- SPRINT 1.1: DROPAR BACKDOOR DE ADMIN
-- Remove o trigger que concede admin automaticamente por email
-- ============================================================

-- 1. Dropar o trigger
DROP TRIGGER IF EXISTS tr_force_admin_email ON public.users;

-- 2. Dropar a função
DROP FUNCTION IF EXISTS public.force_admin_for_specific_email();

-- 3. Validação: Garantir que não existe mais
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_force_admin_email') THEN
    RAISE EXCEPTION 'FALHA: Trigger tr_force_admin_email ainda existe!';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'force_admin_for_specific_email') THEN
    RAISE EXCEPTION 'FALHA: Função force_admin_for_specific_email ainda existe!';
  END IF;
  RAISE NOTICE '✅ Backdoor removido com sucesso.';
END $$;
