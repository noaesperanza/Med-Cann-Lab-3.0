-- 1. Promover usuários de gestão para ADMIN
-- Pedro (Você) - já é admin, mas garantindo
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{type}', '"admin"') 
WHERE email = 'phpg69@gmail.com';

-- Dr. Ricardo (Conta Pessoal/Gestão)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{type}', '"admin"') 
WHERE email = 'rrvalenca@gmail.com';

-- Dr. Eduardo (Conta Pessoal/Gestão)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{type}', '"admin"') 
WHERE email = 'eduardoscfaveret@gmail.com';

-- João (Gestão)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{type}', '"admin"') 
WHERE email = 'cbdrcpremium@gmail.com';

-- 2. Garantir conta Profissional do Dr. Ricardo
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{type}', '"professional"') 
WHERE email = 'iaianoaesperanza@gmail.com';


-- 3. Atualizar Funções de Governança (ACDSS)
-- Remover versões antigas para evitar erro de tipo de retorno (ERROR: 42P13)
DROP FUNCTION IF EXISTS get_ac_dss_stats(text);
DROP FUNCTION IF EXISTS get_recent_audit_logs(int);

-- Agora criar novas versões restritas APENAS para Admins e Master verem o dashboard global

-- Função Statistics
CREATE OR REPLACE FUNCTION get_ac_dss_stats(p_domain text DEFAULT 'todos')
RETURNS TABLE (
    total_analyses bigint,
    active_alerts bigint,
    stable_patients bigint,
    success_rate numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::bigint as total_analyses,
        COUNT(*) FILTER (WHERE (metadata->>'risk_level')::text IN ('high', 'critical'))::bigint as active_alerts,
        COUNT(*) FILTER (WHERE (metadata->>'risk_level')::text IN ('low', 'normal'))::bigint as stable_patients,
        98.5 as success_rate
    FROM ai_chat_interactions
    WHERE 
        (p_domain = 'todos' OR metadata->>'domain' = p_domain)
        AND (
            -- SE for Admin ou Master -> VÊ TUDO
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND (raw_user_meta_data->>'type' IN ('admin', 'master'))
            )
            OR 
            -- SE for Paciente -> VÊ SÓ O SEU (para fins de estatística pessoal se necessário, mas dashboard é admin)
            -- Mas mantemos a lógica para não quebrar chamadas existentes de perfil
            patient_id = auth.uid()
        );
END;
$$;

-- Função Audit Logs
CREATE OR REPLACE FUNCTION get_recent_audit_logs(p_limit int DEFAULT 10)
RETURNS TABLE (
    created_at timestamptz,
    patient_id uuid,
    patient_masked text,
    domain text,
    risk_level text,
    incident_flag boolean,
    ai_response text,
    user_message text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.created_at,
        a.patient_id,
        CASE 
            WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND (raw_user_meta_data->>'type' IN ('admin', 'master'))) 
            THEN 'Paciente (' || SUBSTRING(a.patient_id::text, 1, 4) || ')' -- Admin vê ID
            ELSE 'Você'
        END as patient_masked,
        COALESCE(a.metadata->>'domain', 'general') as domain,
        COALESCE(a.metadata->>'risk_level', 'low') as risk_level,
        (a.metadata->>'risk_level' IN ('high', 'critical')) as incident_flag,
        a.ai_response,
        a.user_message
    FROM ai_chat_interactions a
    WHERE 
        (
            -- SE for Admin ou Master -> VÊ TUDO
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND (raw_user_meta_data->>'type' IN ('admin', 'master'))
            )
            OR 
            -- SE for Paciente -> VÊ SÓ O SEU
            a.patient_id = auth.uid()
        )
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$;
