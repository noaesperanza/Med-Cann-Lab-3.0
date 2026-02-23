
-- ============================================================================
-- RLS AUDIT GATE - SQL NATIVE
-- Objetivo: Verificar se as tabelas críticas têm RLS ativo e políticas definidas.
-- ============================================================================

WITH critical_tables AS (
    SELECT unnest(ARRAY[
        'appointments', 'chat_rooms', 'chat_participants', 'chat_messages',
        'clinical_assessments', 'clinical_reports', 'patient_medical_records',
        'notifications', 'video_call_requests', 'video_call_sessions', 'cfm_prescriptions', 'users'
    ]) AS table_name
),
rls_status AS (
    SELECT 
        ct.table_name,
        COALESCE(c.relrowsecurity, false) AS rls_enabled,
        COUNT(p.polname) AS policy_count
    FROM critical_tables ct
    LEFT JOIN pg_class c ON c.relname = ct.table_name
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
    LEFT JOIN pg_policy p ON p.polrelid = c.oid
    GROUP BY ct.table_name, c.relrowsecurity
)
SELECT 
    table_name,
    CASE WHEN rls_enabled THEN 'SIM' ELSE 'NAO' END AS rls_ativo,
    policy_count AS politicas_encontradas,
    CASE 
        WHEN rls_enabled AND policy_count > 0 THEN '✅ OK'
        ELSE '⚠️ REVISAR'
    END AS status
FROM rls_status
ORDER BY table_name;
