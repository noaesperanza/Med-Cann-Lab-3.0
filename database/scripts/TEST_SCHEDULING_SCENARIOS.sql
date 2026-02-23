/*
  MEDCANNLAB SCHEDULING ENGINE V1.1 - AUTOMATED TEST SUITE
  Status: Validation Scope
  Date: 2026-01-29
  
  Objetivo:
  Validar automaticamente a lógica de slots, regras de disponibilidade e, principalmente, o LOCK Transacional.
  
  COMO RODAR:
  Execute este bloco anônimo no SQL Editor do Supabase. Se terminar sem erros ("NOTICE: TESTS PASSED"), tudo está certo.
*/

DO $$
DECLARE
    v_prof_id UUID;
    v_patient_a_id UUID;
    v_patient_b_id UUID;
    v_slots TIMESTAMP WITH TIME ZONE[];
    v_appt_id UUID;
    v_start_date DATE := CURRENT_DATE + 1; -- Amanhã
BEGIN
    RAISE NOTICE '=== INICIANDO SUITE DE TESTES DE AGENDAMENTO ===';

    -- 1. SETUP: Usando IDs REAIS (Recuperados de VINCULAR_PACIENTES_REAL.sql)
    -- Dr. Ricardo Valença
    v_prof_id := '3f241baa-2185-42fb-8d85-354893f76d1c';
    
    -- Gilda (Paciente Real)
    v_patient_a_id := 'e1988563-3e04-478f-a212-6874341b5ca1';
    
    -- Pedro Paciente (Paciente Teste)
    v_patient_b_id := 'd5e01ead-2f7e-4958-95e9-50dd66a7c5f9';

    RAISE NOTICE 'Test Actor: Dr. Ricardo (%)', v_prof_id;
    RAISE NOTICE 'Test Patient A: Gilda (%)', v_patient_a_id;

    -- 2. LIMPEZA (Teardown anterior)
    DELETE FROM professional_availability WHERE professional_id = v_prof_id;
    DELETE FROM appointments WHERE professional_id = v_prof_id AND appointment_date >= v_start_date;
    DELETE FROM time_blocks WHERE professional_id = v_prof_id;

    -- 3. CENÁRIO A: Configurar Disponibilidade
    -- Regra: Dia da semana de "Amanhã", das 09:00 as 12:00 (3 slots de 60min: 09, 10, 11)
    INSERT INTO professional_availability (professional_id, day_of_week, start_time, end_time, slot_duration)
    VALUES (v_prof_id, EXTRACT(DOW FROM v_start_date), '09:00', '12:00', 60);
    
    RAISE NOTICE '[OK] Disponibilidade Criada.';

    -- 4. CENÁRIO B: Consultar Slots (Deve retornar 3)
    -- Nota: A função get_available_slots retorna tabela, precisa converter pra array pra check
    SELECT ARRAY(SELECT slot FROM get_available_slots(v_prof_id, v_start_date, v_start_date)) INTO v_slots;
    
    IF array_length(v_slots, 1) <> 3 THEN
        RAISE EXCEPTION '[FAIL] Esperado 3 slots, retornou %', array_length(v_slots, 1);
    END IF;
    RAISE NOTICE '[OK] Slots gerados corretamente (3 slots).';

    -- 5. CENÁRIO C: Agendar Slot 1 (09:00) com sucesso
    v_appt_id := book_appointment(v_patient_a_id, v_prof_id, v_slots[1], 'consultation', 'Teste A');
    RAISE NOTICE '[OK] Agendamento realizado: %', v_appt_id;

    -- 6. CENÁRIO D: Tentar Double Booking no Slot 1 (Deve falhar)
    BEGIN
        PERFORM book_appointment(v_patient_b_id, v_prof_id, v_slots[1], 'consultation', 'Teste B - Hacker');
        RAISE EXCEPTION '[FAIL] Double Booking não foi bloqueado!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Slot alrealdy booked%' OR SQLERRM LIKE '%Lock%' THEN
            RAISE NOTICE '[OK] Double Booking bloqueado com sucesso. Erro capturado: %', SQLERRM;
        ELSE
            RAISE EXCEPTION '[FAIL] Erro inesperado no teste de concorrência: %', SQLERRM;
        END IF;
    END;

    -- 7. CENÁRIO E: Bloquear Slot 2 (10:00) via Time Block
    INSERT INTO time_blocks (professional_id, start_at, end_at, reason)
    VALUES (v_prof_id, v_slots[2], v_slots[2] + interval '1 hour', 'Almoço');
    
    -- Consultar slots novamente (Deve retornar apenas o Slot 3 -> 11:00)
    -- Slot 1 (09:00) ocupado por Book. Slot 2 (10:00) ocupado por Block.
    SELECT ARRAY(SELECT slot FROM get_available_slots(v_prof_id, v_start_date, v_start_date)) INTO v_slots;
    
    IF array_length(v_slots, 1) <> 1 THEN
        RAISE EXCEPTION '[FAIL] Esperado 1 slot restante (11:00), retornou %', array_length(v_slots, 1);
    END IF;
    RAISE NOTICE '[OK] Time Block funcionou. Slots restantes corretos.';

    RAISE NOTICE '=== TODOS OS TESTES PASSARAM COM SUCESSO ===';
    
    -- Opcional: Rollback de todos os dados de teste para não sujar o banco
    -- Em um ambiente de teste real, usaríamos ROLLBACK; no final.
    -- Como é um bloco DO, podemos lançar uma exceção controlada no final para fazer rollback automático se quisermos,
    -- ou deletar manualmente.
    
    DELETE FROM professional_availability WHERE professional_id = v_prof_id;
    DELETE FROM appointments WHERE id = v_appt_id;
    DELETE FROM time_blocks WHERE professional_id = v_prof_id;
    
    RAISE NOTICE 'Limpeza concluída.';
END;
$$;
