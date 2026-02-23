-- =====================================================
-- 🚨 EMERGENCY FIX V4: DATA REPAIR + RELATIONS + RLS
-- Resolvendo Recursão Infinita (500) e FK Missing (400/23503)
-- =====================================================

BEGIN;

-- 1. DATA REPAIR: SINCRONIZAR PUBLIC.USERS COM AUTH.USERS
-- Isso evita erro de FK (23503) ao tentar linkar tabelas de prontuário.
INSERT INTO public.users (id, email, name, type)
SELECT 
    au.id, 
    au.email, 
    COALESCE(au.raw_user_meta_data->>'name', 'Usuário ' || au.id),
    COALESCE(au.raw_user_meta_data->>'type', 'patient')
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id;

-- 2. FIX: RELACIONAMENTOS (Resolve Erro 400 no JOIN do PostgREST)
-- Agora que os IDs existem em public.users, podemos criar as FKs.
ALTER TABLE public.clinical_assessments 
  DROP CONSTRAINT IF EXISTS clinical_assessments_patient_id_fkey,
  ADD CONSTRAINT clinical_assessments_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.cfm_prescriptions 
  DROP CONSTRAINT IF EXISTS cfm_prescriptions_patient_id_fkey,
  ADD CONSTRAINT cfm_prescriptions_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. REMOVER POLÍTICAS ANTIGAS (Limpeza)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.users;
DROP POLICY IF EXISTS "Admins can view all prescriptions" ON public.cfm_prescriptions;
DROP POLICY IF EXISTS "Admins and owners can view prescriptions" ON public.cfm_prescriptions;

-- 4. CRIAR POLÍTICA SEGURA PARA USERS (VIA JWT - EVITA RECURSÃO)
CREATE POLICY "Users can view own profile or admins view all" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'type' IN ('admin', 'master', 'gestor'))
    OR
    (auth.jwt() ->> 'email' IN ('phpg69@gmail.com', 'admin@medcannlab.com'))
  );

-- 5. CRIAR POLÍTICA SEGURA PARA CFM_PRESCRIPTIONS
CREATE POLICY "Admins and owners can view prescriptions" ON public.cfm_prescriptions
  FOR SELECT
  USING (
    auth.uid() = patient_id
    OR
    auth.uid() = professional_id
    OR
    (auth.jwt() -> 'user_metadata' ->> 'type' IN ('admin', 'master', 'gestor'))
    OR
    (auth.jwt() ->> 'email' IN ('phpg69@gmail.com', 'admin@medcannlab.com'))
  );

-- 6. RPC admin_get_users_status (RESILIENTE)
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
BEGIN
    IF (auth.jwt() -> 'user_metadata' ->> 'type') NOT IN ('admin', 'master', 'gestor') 
       AND (auth.jwt() ->> 'email') NOT IN ('phpg69@gmail.com', 'admin@medcannlab.com') THEN
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

SELECT '✅ V4 Final: Perfis sincronizados, Recursão eliminada e Joins habilitados.' as status;
