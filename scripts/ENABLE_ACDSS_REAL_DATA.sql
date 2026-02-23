-- ============================================================================
-- ENABLE ACDSS REAL DATA (Conectando a IA ao Dashboard de Governança)
-- ============================================================================

-- 1. Criação da Função RPC para estatísticas em tempo real
CREATE OR REPLACE FUNCTION get_ac_dss_stats()
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
  v_stable BIGINT;
BEGIN
  -- Contar total de interações clínicas da IA
  SELECT COUNT(*) INTO v_total
  FROM patient_medical_records
  WHERE record_type = 'chat_interaction';

  -- Contar alertas (simulado por keywords no JSON por enquanto)
  -- No futuro, a IA deve marcar explicitamente "has_risk: true"
  SELECT COUNT(*) INTO v_alerts
  FROM patient_medical_records
  WHERE record_type = 'chat_interaction'
  AND (
    record_data->>'ai_response' ILIKE '%alerta%' OR
    record_data->>'ai_response' ILIKE '%risco%' OR
    record_data->>'ai_response' ILIKE '%atenção%'
  );

  -- Contar pacientes únicos atendidos (Estáveis = Total - Alertas)
  SELECT COUNT(DISTINCT patient_id) INTO v_stable
  FROM patient_medical_records
  WHERE record_type = 'chat_interaction';
  
  -- Ajuste simples para demo
  IF v_stable > v_alerts THEN
    v_stable := v_stable - v_alerts;
  ELSE
    v_stable := 0;
  END IF;

  RETURN QUERY SELECT 
    COALESCE(v_total, 0), 
    COALESCE(v_alerts, 0), 
    COALESCE(v_stable, 0),
    85; -- Taxa de sucesso fixa (placeholder para V1)
END;
$$;

-- 2. Permissões
GRANT EXECUTE ON FUNCTION get_ac_dss_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_ac_dss_stats() TO service_role;

RAISE NOTICE '✅ Função get_ac_dss_stats criada com sucesso!';
