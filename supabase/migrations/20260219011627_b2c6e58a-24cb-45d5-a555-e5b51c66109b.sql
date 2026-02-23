
-- ============================================================
-- Garantir roles em user_roles para novos usuários
-- Fonte: public.user_profiles.role (legado), mas autorização passa a usar user_roles
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_user_roles_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_role text;
  mapped public.app_role;
BEGIN
  raw_role := lower(coalesce(NEW.role, ''));

  mapped := CASE
    WHEN raw_role IN ('admin') THEN 'admin'::public.app_role
    WHEN raw_role IN ('profissional','professional','doctor','medico','médico') THEN 'profissional'::public.app_role
    WHEN raw_role IN ('aluno','student') THEN 'aluno'::public.app_role
    WHEN raw_role IN ('paciente','patient','user') THEN 'paciente'::public.app_role
    ELSE 'paciente'::public.app_role
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, mapped)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_sync_user_roles_from_profile ON public.user_profiles;
CREATE TRIGGER tg_sync_user_roles_from_profile
AFTER INSERT OR UPDATE OF role ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_roles_from_profile();
