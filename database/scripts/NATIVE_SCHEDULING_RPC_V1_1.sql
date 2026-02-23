/*
  MEDCANNLAB SCHEDULING ENGINE V1.1 - RPC LAYER
  Status: Enterprise Safe (Atomic & Locking)
  Date: 2026-01-29
  
  Objetivos:
  1. get_available_slots: Gerar slots disponíveis calculando regras - exceções - agendamentos.
  2. book_appointment: Agendar com Lock Transacional (Advisory Lock) para evitar Double Booking.
*/

-- ==============================================================================
-- 1. GET AVAILABLE SLOTS (Query)
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_available_slots(
    p_professional_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (slot TIMESTAMP WITH TIME ZONE) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_date DATE;
    v_dow INTEGER;
    v_rule RECORD;
    v_slot TIMESTAMP WITH TIME ZONE;
    v_slot_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Loop pelos dias do range
    FOR v_date IN SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date LOOP
        v_dow := EXTRACT(DOW FROM v_date);
        
        -- Buscar regras de disponibilidade para o dia da semana
        FOR v_rule IN 
            SELECT * FROM professional_availability 
            WHERE professional_id = p_professional_id 
              AND day_of_week = v_dow 
              AND is_active = TRUE
        LOOP
            -- Gerar slots baseados na regra (Assume fuso da clínica para regra -> UTC para retorno)
            -- A simplicidade aqui assume que a regra '09:00' é '09:00 UTC' para o MVP Enterprise.
            -- Para total suporte a timezone, seria necessário projetar a data.
            -- V1.1: Regra 09:00 no banco = 09:00 no dia gerado.
            
            v_slot := v_date + v_rule.start_time;
            
            WHILE v_slot < (v_date + v_rule.end_time) LOOP
                v_slot_end := v_slot + (v_rule.slot_duration || ' minutes')::interval;
                
                -- Se o slot terminar depois do fim do expediente, ignora (ou ajusta conforme regra de negócio)
                IF v_slot_end > (v_date + v_rule.end_time) THEN
                    EXIT;
                END IF;

                -- VERIFICAÇÃO 1: Existe Agendamento conflituoso?
                IF EXISTS (
                    SELECT 1 FROM appointments 
                    WHERE professional_id = p_professional_id
                      AND status IN ('scheduled', 'confirmed', 'rescheduled')
                      -- Overlap check: (StartA < EndB) and (EndA > StartB)
                      AND appointment_date < v_slot_end
                      AND (appointment_date + (duration || ' minutes')::interval) > v_slot
                ) THEN
                    -- Slot ocupado, pular
                    v_slot := v_slot_end;
                    CONTINUE;
                END IF;

                -- VERIFICAÇÃO 2: Existe Bloqueio (Time Block)?
                IF EXISTS (
                    SELECT 1 FROM time_blocks
                    WHERE professional_id = p_professional_id
                      AND start_at < v_slot_end
                      AND end_at > v_slot
                ) THEN
                    -- Slot bloqueado, pular
                    v_slot := v_slot_end;
                    CONTINUE;
                END IF;
                
                -- Se passou, adiciona ao retorno
                slot := v_slot;
                RETURN NEXT;
                
                -- Avança para próximo slot
                v_slot := v_slot_end;
            END LOOP;
            
        END LOOP;
    END LOOP;
END;
$$;

-- ==============================================================================
-- 2. BOOK APPOINTMENT (Transactional Mutation)
-- ==============================================================================
CREATE OR REPLACE FUNCTION book_appointment(
    p_patient_id UUID,
    p_professional_id UUID,
    p_slot_time TIMESTAMP WITH TIME ZONE,
    p_type TEXT DEFAULT 'consultation',
    p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_appt_id UUID;
    v_dow INTEGER;
    v_time TIME;
    v_valid_rule BOOLEAN;
BEGIN
    -- 1. LOCK TRANSACIONAL (Advisory Lock no Professional ID)
    -- Isso garante que apenas uma transação por vez execute booking para este médico.
    -- hashtext converte UUID string para integer aceito pelo lock.
    PERFORM pg_advisory_xact_lock(hashtext(p_professional_id::text));

    -- 2. VALIDAÇÃO DE DISPONIBILIDADE (Double Check dentro do Lock)
    
    -- A) Checar conflito com agendamentos
    IF EXISTS (
        SELECT 1 FROM appointments 
        WHERE professional_id = p_professional_id
          AND status IN ('scheduled', 'confirmed', 'rescheduled')
          AND appointment_date = p_slot_time
    ) THEN
        RAISE EXCEPTION 'Slot alrealdy booked (Race Condition caught by Lock)';
    END IF;

    -- B) Checar conflito com Bloqueios
    IF EXISTS (
        SELECT 1 FROM time_blocks
        WHERE professional_id = p_professional_id
          AND start_at <= p_slot_time
          AND end_at > p_slot_time
    ) THEN
         RAISE EXCEPTION 'Slot is blocked by medical exception';
    END IF;

    -- C) (Opcional) Validar se obedece regra de horário (Hardening contra calls diretas)
    v_dow := EXTRACT(DOW FROM p_slot_time);
    v_time := p_slot_time::time;
    
    SELECT EXISTS (
        SELECT 1 FROM professional_availability
        WHERE professional_id = p_professional_id
          AND day_of_week = v_dow
          AND start_time <= v_time
          AND end_time > v_time
          AND is_active = TRUE
    ) INTO v_valid_rule;
    
    IF NOT v_valid_rule THEN
        RAISE EXCEPTION 'Slot is not valid per professional schedule rules (% %)', v_dow, v_time;
    END IF;

    -- 3. INSERIR AGENDAMENTO
    INSERT INTO appointments (
        patient_id, 
        professional_id, 
        appointment_date, 
        status, 
        type, 
        title,
        description
    ) VALUES (
        p_patient_id,
        p_professional_id,
        p_slot_time,
        'scheduled',
        p_type,
        'Consulta Agendada',
        COALESCE(p_reason, 'Agendamento via App')
    ) RETURNING id INTO v_appt_id;

    RETURN v_appt_id;
END;
$$;
