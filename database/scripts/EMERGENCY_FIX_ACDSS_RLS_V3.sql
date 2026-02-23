-- =====================================================
-- 🚨 EMERGENCY FIX V3: RESOLVING RLS RECURSION
-- Corrigindo "infinite recursion detected in policy for relation users"
-- =====================================================

BEGIN;

-- 1. FIX: RELACIONAMENTOS (Evita Erro 400 no JOIN)
-- PostgREST precisa de FKs explícitas para tabelas na mesma schema para fazer JOIN automático.
ALTER TABLE public.clinical_assessments 
  DROP CONSTRAINT IF EXISTS clinical_assessments_patient_id_fkey,
  ADD CONSTRAINT clinical_assessments_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.cfm_prescriptions 
  DROP CONSTRAINT IF EXISTS cfm_prescriptions_patient_id_fkey,
  ADD CONSTRAINT cfm_prescriptions_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. REMOVER POLÍTICAS QUE CAUSAM RECURSÃO
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all prescriptions" ON public.cfm_prescriptions;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.users;

-- 2. CRIAR POLÍTICA SEGURA PARA USERS (SEM QUERY NA PRÓPRIA TABELA)
-- Usamos apenas dados do JWT (auth.jwt()) para evitar recursão infinita.
CREATE POLICY "Users can view own profile or admins view all" ON public.users
  FOR SELECT
  USING (
    -- O próprio usuário pode se ver
    auth.uid() = id
    OR 
    -- Admins identificados pelo JWT (metadata ou email)
    (auth.jwt() -> 'user_metadata' ->> 'type' IN ('admin', 'master', 'gestor', 'profissional'))
    OR
    (auth.jwt() ->> 'email' IN ('phpg69@gmail.com', 'admin@medcannlab.com'))
  );

-- 3. CRIAR POLÍTICA SEGURA PARA CFM_PRESCRIPTIONS
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

-- 4. RPC admin_get_users_status (JÁ É SEGURA POIS USA SECURITY DEFINER E ACESSA AUTH)
-- Vou apenas garantir que ela não dependa de loops.
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
    -- Verificação via JWT e emails conhecidos (evita recursão)
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

SELECT '✅ V3: Recursão eliminada. RLS e RPC agora utilizam JWT para segurança máxima.' as status;
