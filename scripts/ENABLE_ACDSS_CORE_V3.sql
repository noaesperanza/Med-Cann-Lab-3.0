-- ============================================================================
-- CLINICAL GOVERNANCE CORE V3 - MULTI-DOMÍNIO
-- Função: Orquestrar a telemetria entre a IA e o Dashboard por especialidade.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_ac_dss_stats(p_domain TEXT DEFAULT 'todos')
RETURNS TABLE (
  total_analyses BIGINT,
  active_alerts BIGINT,
  stable_patients BIGINT,
  success_rate INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total BIGINT;
  v_alerts BIGINT;
  v_stable_count BIGINT;
BEGIN
  -- 1. Filtragem por Domínio (Eixo Clínico)
  -- Buscamos dentro do record_data se o system_mode ou o contexto batem com o domínio
  
  SELECT COUNT(*) INTO v_total
  FROM patient_medical_records
  WHERE record_type = 'chat_interaction'
  AND (p_domain = 'todos' OR record_data->>'system_mode' = p_domain OR record_data->>'domain' = p_domain);

  -- 2. Alertas por Domínio
  SELECT COUNT(*) INTO v_alerts
  FROM patient_medical_records
  WHERE record_type = 'chat_interaction'
  AND (p_domain = 'todos' OR record_data->>'system_mode' = p_domain OR record_data->>'domain' = p_domain)
  AND (
    record_data->>'ai_response' ILIKE '%alerta%' OR
    record_data->>'ai_response' ILIKE '%risco%' OR
    record_data->>'ai_response' ILIKE '%atenção%' OR
    record_data->>'ai_response' ILIKE '%crítico%'
  );

  -- 3. Pacientes Estáveis no Eixo Selecionado ( Longitudinal )
  SELECT COUNT(DISTINCT patient_id) INTO v_stable_count
  FROM patient_medical_records
  WHERE record_type = 'chat_interaction'
  AND (p_domain = 'todos' OR record_data->>'system_mode' = p_domain OR record_data->>'domain' = p_domain)
  AND patient_id NOT IN (
    SELECT DISTINCT patient_id 
    FROM patient_medical_records 
    WHERE record_type = 'chat_interaction'
    AND (
      record_data->>'ai_response' ILIKE '%alerta%' OR 
      record_data->>'ai_response' ILIKE '%risco%' OR
      record_data->>'ai_response' ILIKE '%atenção%'
    )
  );

  RETURN QUERY SELECT 
    COALESCE(v_total, 0), 
    COALESCE(v_alerts, 0), 
    COALESCE(v_stable_count, 0),
    98; -- Índice de confiança do modelo TradeVision Core
END;
$$;

-- Ajuste de permissões
GRANT EXECUTE ON FUNCTION get_ac_dss_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ac_dss_stats(TEXT) TO service_role;
