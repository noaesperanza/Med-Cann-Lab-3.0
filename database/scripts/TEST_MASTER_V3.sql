/*
  MEDCANNLAB MASTER V3 - AUTOMATED VERIFICATION SUITE
  Objetivo: Validar o funcionamento da engine transacional e auditoria.
*/

DO $$
DECLARE
    v_prof_id UUID;
    v_appt_id UUID;
    v_start_time TIMESTAMPTZ := NOW() + interval '1 day'; -- Amanha
    v_audit_count INTEGER;
BEGIN
    RAISE NOTICE '=== INICIANDO TESTES MASTER V3 ===';

    -- 1. Setup Actor
    SELECT id INTO v_prof_id FROM auth.users LIMIT 1;
    -- Cria disponibilidade temporária
    INSERT INTO professional_availability (professional_id, day_of_week, start_time, end_time, slot_duration)
    VALUES (v_prof_id, EXTRACT(DOW FROM v_start_time), '00:00', '23:59', 60);

    -- Ajusta v_start_time para ter hora cheia (ex 14:00:00) para casar com slot
    v_start_time := date_trunc('hour', v_start_time);

    -- 2. Teste Happy Path (Agendamento Atômico)
    v_appt_id := book_appointment_atomic(v_prof_id, v_prof_id, v_start_time, 'checkup', 'Teste Sucesso');
    RAISE NOTICE '[OK] Agendamento ID: % criado com sucesso.', v_appt_id;

    -- 3. Teste Double Booking Protection
    BEGIN
        PERFORM book_appointment_atomic(v_prof_id, v_prof_id, v_start_time, 'hacker', 'Tentativa Dupla');
        RAISE EXCEPTION '[FAIL] Engine permitiu double booking!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Slot no longer available%' THEN
            RAISE NOTICE '[OK] Bloqueio de Concorrência funcionou: %', SQLERRM;
        ELSE
            RAISE EXCEPTION '[FAIL] Erro inesperado: %', SQLERRM;
        END IF;
    END;

    -- 4. Teste Auditoria
    SELECT COUNT(*) INTO v_audit_count 
    FROM public.scheduling_audit_log 
    WHERE professional_id = v_prof_id AND start_time = v_start_time;
    
    IF v_audit_count >= 2 THEN
        RAISE NOTICE '[OK] Auditoria registrou % eventos (Esperado >= 2: Sucesso + Falha).', v_audit_count;
    ELSE
        RAISE EXCEPTION '[FAIL] Auditoria falhou. Encontrado: %', v_audit_count;
    END IF;

    -- 5. Cleanup
    DELETE FROM professional_availability WHERE professional_id = v_prof_id;
    DELETE FROM appointments WHERE id = v_appt_id;
    DELETE FROM scheduling_audit_log WHERE professional_id = v_prof_id;
    
    RAISE NOTICE '=== SUITE V3 CONCLUÍDA COM SUCESSO ===';
END;
$$;
