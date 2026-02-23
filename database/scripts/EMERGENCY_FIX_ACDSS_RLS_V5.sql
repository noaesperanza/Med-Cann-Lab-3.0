-- =====================================================
-- 🛡️ EMERGENCY FIX V5: HEALING & INTEGRITY
-- Resolvendo Recursão (500), FK Orphans (23503) e Dashboard (400)
-- =====================================================

BEGIN;

-- 1. CURA DE DADOS: CRIAR PERFIS PARA IDS ÓRFÃOS
-- Existem IDs nas tabelas de prontuário que não existem em lugar nenhum.
-- Vamos criar perfis "fantasma" para permitir que as Chaves Estrangeiras sejam criadas.

-- Sincronizar primeiro o que existe no AUTH
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

-- Criar perfis para IDs que só existem na clinical_assessments
INSERT INTO public.users (id, email, name, type)
SELECT 
    DISTINCT patient_id, 
    'orphan-' || patient_id || '@medcannlab.com',
    'Paciente Recuperado (' || SUBSTRING(patient_id::text FROM 1 FOR 8) || ')',
    'patient'
FROM public.clinical_assessments
WHERE patient_id NOT IN (SELECT id FROM public.users)
ON CONFLICT DO NOTHING;

-- Criar perfis para IDs que só existem na cfm_prescriptions
INSERT INTO public.users (id, email, name, type)
SELECT 
    DISTINCT patient_id, 
    'orphan-presc-' || patient_id || '@medcannlab.com',
    'Paciente Recuperado (' || SUBSTRING(patient_id::text FROM 1 FOR 8) || ')',
    'patient'
FROM public.cfm_prescriptions
WHERE patient_id NOT IN (SELECT id FROM public.users)
ON CONFLICT DO NOTHING;

-- 2. FIX: RELACIONAMENTOS (Agora sem erro 23503)
ALTER TABLE public.clinical_assessments 
  DROP CONSTRAINT IF EXISTS clinical_assessments_patient_id_fkey,
  ADD CONSTRAINT clinical_assessments_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.cfm_prescriptions 
  DROP CONSTRAINT IF EXISTS cfm_prescriptions_patient_id_fkey,
  ADD CONSTRAINT cfm_prescriptions_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. FIX: RECURSÃO RLS (POLÍTICAS SEGURAS VIA JWT)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.users;
DROP POLICY IF EXISTS "Admins and owners can view prescriptions" ON public.cfm_prescriptions;

CREATE POLICY "Users can view own profile or admins view all" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'type' IN ('admin', 'master', 'gestor'))
    OR
    (auth.jwt() ->> 'email' IN ('phpg69@gmail.com', 'admin@medcannlab.com'))
  );

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

-- 4. RPC admin_get_users_status (REFORÇADO)
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

SELECT '✅ V5 AUTO-HEALING CONCLUÍDO. Dados órfãos corrigidos e dashboards liberados.' as status;
