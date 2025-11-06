-- ================================================================
-- ✅ VALIDAÇÃO DAS TABELAS CLÍNICAS ESSENCIAIS
-- ---------------------------------------------------------------
-- Execute este script no SQL Editor do Supabase para confirmar:
--   1. Se as tabelas existem
--   2. Se há dados disponíveis
--   3. Qual script executar caso algo esteja faltando
-- ================================================================

DO $$
DECLARE
  v_missing_tables TEXT[] := ARRAY[]::TEXT[];
  v_count INTEGER;
BEGIN
  ----------------------------------------------------------------
  -- clinical_kpis
  ----------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'clinical_kpis'
  ) THEN
    v_missing_tables := array_append(v_missing_tables, 'clinical_kpis');
    RAISE NOTICE '⚠️ Tabela clinical_kpis não encontrada. Execute SUPABASE_CORRECAO_ERROS_400_404.sql.';
  ELSE
    SELECT COUNT(*) INTO v_count FROM clinical_kpis;
    IF v_count = 0 THEN
      RAISE NOTICE '⚠️ Tabela clinical_kpis existe mas está vazia.';
      RAISE NOTICE '   → Insira métricas usando IDs reais de paciente/profissional.';
      RAISE NOTICE '   Exemplo:';
      RAISE NOTICE '     INSERT INTO clinical_kpis (patient_id, doctor_id, category, metric_name, metric_value, metric_unit, assessment_date)';
      RAISE NOTICE '     VALUES (''<paciente_uuid>'', ''<profissional_uuid>'', ''comportamental'', ''Qualidade da Escuta'', 88.5, ''pts'', CURRENT_DATE);';
    ELSE
      RAISE NOTICE '✅ clinical_kpis possui % registros.', v_count;
    END IF;
  END IF;

  ----------------------------------------------------------------
  -- wearable_devices
  ----------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'wearable_devices'
  ) THEN
    v_missing_tables := array_append(v_missing_tables, 'wearable_devices');
    RAISE NOTICE '⚠️ Tabela wearable_devices não encontrada. Execute SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql.';
  ELSE
    SELECT COUNT(*) INTO v_count FROM wearable_devices;
    IF v_count = 0 THEN
      RAISE NOTICE '⚠️ Tabela wearable_devices existe mas está vazia.';
      RAISE NOTICE '   → Cadastre dispositivos associados a pacientes.';
      RAISE NOTICE '   Exemplo:';
      RAISE NOTICE '     INSERT INTO wearable_devices (patient_id, device_type, brand, model, connection_status, last_sync)';
      RAISE NOTICE '     VALUES (''<paciente_uuid>'', ''smartwatch'', ''Garmin'', ''Venu 2'', ''connected'', NOW());';
    ELSE
      RAISE NOTICE '✅ wearable_devices possui % registros.', v_count;
    END IF;
  END IF;

  ----------------------------------------------------------------
  -- epilepsy_events
  ----------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'epilepsy_events'
  ) THEN
    v_missing_tables := array_append(v_missing_tables, 'epilepsy_events');
    RAISE NOTICE '⚠️ Tabela epilepsy_events não encontrada. Execute SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql.';
  ELSE
    SELECT COUNT(*) INTO v_count FROM epilepsy_events;
    IF v_count = 0 THEN
      RAISE NOTICE '⚠️ Tabela epilepsy_events existe mas está vazia.';
      RAISE NOTICE '   → Registre eventos clínicos recentes (últimos 30 dias para KPIs).';
      RAISE NOTICE '   Exemplo:';
      RAISE NOTICE '     INSERT INTO epilepsy_events (patient_id, event_type, severity, duration, timestamp)';
      RAISE NOTICE '     VALUES (''<paciente_uuid>'', ''convulsao'', ''leve'', 90, NOW() - INTERVAL ''2 days'');';
    ELSE
      RAISE NOTICE '✅ epilepsy_events possui % registros.', v_count;
    END IF;
  END IF;

  ----------------------------------------------------------------
  -- appointments
  ----------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
  ) THEN
    v_missing_tables := array_append(v_missing_tables, 'appointments');
    RAISE NOTICE '⚠️ Tabela appointments não encontrada. Execute SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql.';
  ELSE
    SELECT COUNT(*) INTO v_count FROM appointments;
    IF v_count = 0 THEN
      RAISE NOTICE '⚠️ Tabela appointments existe mas está vazia.';
      RAISE NOTICE '   → Registre consultas com professional_id preenchido.';
      RAISE NOTICE '   Exemplo:';
      RAISE NOTICE '     INSERT INTO appointments (patient_id, professional_id, title, appointment_date, status, type)';
      RAISE NOTICE '     VALUES (''<paciente_uuid>'', ''<profissional_uuid>'', ''Consulta inicial'', NOW() + INTERVAL ''1 day'', ''scheduled'', ''consultation'');';
    ELSE
      RAISE NOTICE '✅ appointments possui % registros.', v_count;
    END IF;
  END IF;

  ----------------------------------------------------------------
  -- Resumo final
  ----------------------------------------------------------------
  IF array_length(v_missing_tables, 1) IS NULL THEN
    RAISE NOTICE '✅ Estrutura conferida. Ajuste apenas os dados indicados acima, se necessário.';
  ELSE
    RAISE NOTICE '⚠️ Tabelas ausentes: %', v_missing_tables;
    RAISE NOTICE '   → Execute os scripts indicados para reconstruir a estrutura.';
  END IF;
END $$;


