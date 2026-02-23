
-- ============================================================
-- SECURITY PATCH: roles fora de users/user_profiles
-- Cria user_roles + has_role() + get_my_primary_role() + is_admin()
-- ============================================================

-- 1) Enum de roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'profissional', 'paciente', 'aluno');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Tabela de roles (SEM FK em auth.users para evitar dependência/limitações)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Função server-side para checar role (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- 4) Policies
DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_roles_admin_all ON public.user_roles;
CREATE POLICY user_roles_admin_all
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Role primária (prioridade: admin > profissional > aluno > paciente)
CREATE OR REPLACE FUNCTION public.get_my_primary_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN public.has_role(auth.uid(), 'admin') THEN 'admin'::public.app_role
      WHEN public.has_role(auth.uid(), 'profissional') THEN 'profissional'::public.app_role
      WHEN public.has_role(auth.uid(), 'aluno') THEN 'aluno'::public.app_role
      ELSE 'paciente'::public.app_role
    END;
$$;

-- 6) Substituir is_admin() hardcoded por verificação por role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- 7) Ajustar helper legado (evita depender de user_profiles.role)
CREATE OR REPLACE FUNCTION public.is_current_user_patient()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'paciente');
$$;

-- 8) Bootstrap: popular roles a partir do estado atual de public.users (apenas uma vez)
-- Observação: isso é migração de transição; depois o app passa a ler roles apenas de user_roles.
INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  CASE
    WHEN COALESCE(u.flag_admin, false) = true THEN 'admin'::public.app_role
    WHEN u.type IN ('profissional', 'professional') THEN 'profissional'::public.app_role
    WHEN u.type IN ('aluno', 'student') THEN 'aluno'::public.app_role
    ELSE 'paciente'::public.app_role
  END
FROM public.users u
WHERE u.id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
ON CONFLICT (user_id, role) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
