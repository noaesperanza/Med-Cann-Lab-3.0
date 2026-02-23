-- REMOVER SIMULAÇÃO/MÁSCARA DO DASHBOARD DE GOVERNANÇA PARA ADMINS
-- Objetivo: Permitir que Admins (Pedro, Ricardo, Eduardo, João) vejam nomes reais para depuração.

DROP FUNCTION IF EXISTS get_recent_audit_logs(int);

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
            -- SE FOR ADMIN/MASTER: MOSTRAR NOME REAL
            WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND (raw_user_meta_data->>'type' IN ('admin', 'master'))) 
            THEN 
                COALESCE(
                    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = a.patient_id),
                    (SELECT email FROM auth.users WHERE id = a.patient_id),
                    'Paciente Desconhecido (' || SUBSTRING(a.patient_id::text, 1, 4) || ')'
                )
            -- SE FOR O PRÓPRIO PACIENTE
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
            -- ADMIN VÊ TUDO
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND (raw_user_meta_data->>'type' IN ('admin', 'master'))
            )
            OR 
            -- PACIENTE VÊ SÓ O SEU
            a.patient_id = auth.uid()
        )
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$;
