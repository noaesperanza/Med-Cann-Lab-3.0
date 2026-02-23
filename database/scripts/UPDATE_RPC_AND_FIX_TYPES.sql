-- ==============================================================================
-- FIX: ADMIN GET USERS STATUS (Type Mismatch)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_get_users_status()
RETURNS TABLE (
    user_id uuid,
    name text,
    email text,
    type text,
    status text,          -- 'active', 'suspended'
    payment_status text,  -- 'pending', 'paid', 'exempt'
    owner_id uuid,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    is_online boolean     -- Calculado (True se logou nos últimos 15 min)
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth 
AS $$
BEGIN
    -- 1. VERIFICAÇÃO DE PERMISSÃO
    IF (auth.jwt() -> 'user_metadata' ->> 'type') NOT IN ('admin', 'master', 'gestor') THEN
        RAISE EXCEPTION 'Acesso Negado: Apenas administradores podem auditar usuários.';
    END IF;

    -- 2. QUERY PODEROSA (JOIN public + auth)
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.name::text, -- Cast explícito para text
        au.email::text, -- Cast explícito para text
        u.type::text, -- Cast explícito
        COALESCE(to_jsonb(u)->>'status', 'active')::text as status,
        COALESCE(to_jsonb(u)->>'payment_status', 'pending')::text as payment_status,
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

GRANT EXECUTE ON FUNCTION public.admin_get_users_status() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_get_users_status() FROM anon;

-- ==============================================================================
-- NEW: GET HIGH RISK PATIENTS SUMMARY (Risk Cockpit)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_high_risk_patients_summary()
RETURNS TABLE (
    id uuid,
    name text,
    risk_level text,
    last_exam_date text, -- Return as text ISO string for simpler frontend parsing
    days_since_exam int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH LatestExams AS (
        SELECT DISTINCT ON (patient_id)
            patient_id,
            drc_stage,
            exam_date
        FROM renal_exams
        WHERE drc_stage IN ('G3a', 'G3b', 'G4', 'G5') -- Filter only relevant risks
        ORDER BY patient_id, exam_date DESC
    )
    SELECT
        p.id,
        p.name::text,
        le.drc_stage::text as risk_level,
        le.exam_date::text as last_exam_date,
        (CURRENT_DATE - le.exam_date)::int as days_since_exam
    FROM LatestExams le
    JOIN patients p ON p.id = le.patient_id
    ORDER BY 
        CASE 
            WHEN le.drc_stage = 'G5' THEN 1
            WHEN le.drc_stage = 'G4' THEN 2
            WHEN le.drc_stage = 'G3b' THEN 3
            ELSE 4
        END ASC,
        le.exam_date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_high_risk_patients_summary() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_high_risk_patients_summary() FROM anon;
