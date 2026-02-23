-- =====================================================
-- 🚨 EMERGENCY FIX: RLS & ADMIN VISIBILITY
-- Resolvendo erro 400 no Terminal Integrado e Mission Control
-- =====================================================

BEGIN;

-- 1. FIX: PERMISSÕES NA TABELA USERS
-- Sem isso, a lista de pacientes no Terminal Integrado fica vazia para o Admin.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'type' IN ('admin', 'master', 'gestor'))
    OR 
    (auth.uid() = id)
    OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND (type = 'admin' OR flag_admin = true)
    )
  );

-- 2. FIX: PERMISSÕES NA TABELA CFM_PRESCRICOES
-- Permite que o ACDSS Engine leia as prescrições para análise de confluência
ALTER TABLE public.cfm_prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all prescriptions" ON public.cfm_prescriptions;
CREATE POLICY "Admins can view all prescriptions" ON public.cfm_prescriptions
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'type' IN ('admin', 'master', 'gestor'))
    OR 
    (auth.uid() = patient_id)
    OR
    (auth.uid() = professional_id)
    OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND (type = 'admin' OR flag_admin = true)
    )
  );

-- 3. FIX: RPC admin_get_users_status
-- Tornando o check de permissão mais resiliente (aceitando flag_admin da public.users tbm)
CREATE OR REPLACE FUNCTION public.admin_get_users_status()
RETURNS TABLE (
    user_id uuid,
    name text,
    email text,
    type text,
    status text,
    payment_status text,
    owner_id uuid,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    is_online boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth 
AS $$
DECLARE
    is_admin_check boolean;
BEGIN
    -- Verificar se o chamador é admin no JWT ou na tabela users
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND (type = 'admin' OR flag_admin = true)
    ) OR (auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor')
    INTO is_admin_check;

    IF NOT is_admin_check THEN
        RAISE EXCEPTION 'Acesso Negado: Apenas administradores podem auditar usuários.';
    END IF;

    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.name,
        au.email::text,
        u.type,
        -- Resiliência: evita dependência de colunas opcionais em public.users
        COALESCE(to_jsonb(u)->>'status', 'active') as status,
        COALESCE(to_jsonb(u)->>'payment_status', 'pending') as payment_status,
        u.owner_id,
        au.last_sign_in_at,
        u.created_at,
        (au.last_sign_in_at > (now() - interval '15 minutes')) as is_online
    FROM 
        public.users u
    JOIN 
        auth.users au ON u.id = au.id
    ORDER BY 
        au.last_sign_in_at DESC NULLS LAST;

END;
$$;

COMMIT;

SELECT '✅ Sistema de visibilidade Admin corrigido. RLS e RPC operacionais.' as status;
