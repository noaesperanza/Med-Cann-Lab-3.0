-- ==============================================================================
-- VINCULAÇÃO REAL DE PACIENTES AO DR. RICARDO
-- ==============================================================================

DO $$ 
DECLARE
    v_ricardo_id UUID := '3f241baa-2185-42fb-8d85-354893f76d1c'; -- Dr. Ricardo (iaianoaesperana)
BEGIN
    -- 1. Flora
    INSERT INTO public.appointments (patient_id, professional_id, title, status, appointment_date, type)
    VALUES ('64d6a3e5-a9f5-42b9-adb5-ea6b0b36ac20', v_ricardo_id, 'Vinculação Inicial', 'scheduled', NOW(), 'consultation')
    ON CONFLICT DO NOTHING;

    -- 2. Gilda
    INSERT INTO public.appointments (patient_id, professional_id, title, status, appointment_date, type)
    VALUES ('e1988563-3e04-478f-a212-6874341b5ca1', v_ricardo_id, 'Vinculação Inicial', 'scheduled', NOW(), 'consultation')
    ON CONFLICT DO NOTHING;

    -- 3. Joao Eduardo (jvbiocann)
    INSERT INTO public.appointments (patient_id, professional_id, title, status, appointment_date, type)
    VALUES ('c68fb133-a72a-4c1e-8a8f-5d559a6713c3', v_ricardo_id, 'Vinculação Inicial', 'scheduled', NOW(), 'consultation')
    ON CONFLICT DO NOTHING;

    -- 4. Maria Souza (1)
    INSERT INTO public.appointments (patient_id, professional_id, title, status, appointment_date, type)
    VALUES ('43f53f57-44cd-419a-8bc4-5b81ff9efa47', v_ricardo_id, 'Vinculação Inicial', 'scheduled', NOW(), 'consultation')
    ON CONFLICT DO NOTHING;

    -- 5. Maria Souza (2)
    INSERT INTO public.appointments (patient_id, professional_id, title, status, appointment_date, type)
    VALUES ('af59920c-e638-405f-8aa3-48a2767924ec', v_ricardo_id, 'Vinculação Inicial', 'scheduled', NOW(), 'consultation')
    ON CONFLICT DO NOTHING;

    -- 6. Pedro Paciente (User Teste)
    INSERT INTO public.appointments (patient_id, professional_id, title, status, appointment_date, type)
    VALUES ('d5e01ead-2f7e-4958-95e9-50dd66a7c5f9', v_ricardo_id, 'Vinculação Inicial', 'scheduled', NOW(), 'consultation')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Todos os 6 pacientes foram vinculados ao Dr. Ricardo com sucesso via Agendamento!';
END $$;
