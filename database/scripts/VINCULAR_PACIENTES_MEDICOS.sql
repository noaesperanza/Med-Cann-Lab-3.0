-- ==============================================================================
-- SCRIPT DE VINCULAÇÃO MANUAL: PACIENTE -> MÉDICO
-- ==============================================================================
-- Instruções:
-- 1. Substitua os emails abaixo pelos reais.
-- 2. Execute o script no Supabase SQL Editor.
-- ==============================================================================

DO $$ 
DECLARE
    v_medico_email TEXT;
    v_paciente_email TEXT;
    v_medico_id UUID;
    v_paciente_id UUID;
BEGIN
    -- [CONFIGURE AQUI] --------------------------------------------------------
    v_medico_email := 'EMAIL_DO_MEDICO_AQUI@gmail.com';     -- Ex: iaianoaesperana@gmail.com
    v_paciente_email := 'EMAIL_DO_PACIENTE_AQUI@gmail.com'; -- Ex: paciente.teste@gmail.com
    -- -------------------------------------------------------------------------

    -- 1. Buscar IDs
    SELECT id INTO v_medico_id FROM auth.users WHERE email = v_medico_email;
    SELECT id INTO v_paciente_id FROM auth.users WHERE email = v_paciente_email;

    -- 2. Validações
    IF v_medico_id IS NULL THEN
        RAISE NOTICE '❌ Médico não encontrado: %', v_medico_email;
        RETURN;
    END IF;

    IF v_paciente_id IS NULL THEN
        RAISE NOTICE '❌ Paciente não encontrado: %', v_paciente_email;
        RETURN;
    END IF;

    -- 3. Criar Vínculo (Agendamento "Fictício" de Vinculação)
    -- Isso garante que o paciente apareça na lista do médico
    INSERT INTO public.appointments (
        patient_id, 
        professional_id, 
        title, 
        status, 
        appointment_date,
        type
    ) VALUES (
        v_paciente_id,
        v_medico_id,
        'Vinculação Inicial de Carteira',
        'scheduled',
        NOW(),
        'consultation'
    )
    ON CONFLICT DO NOTHING; -- Evita duplicidade se já houver constraint unique (opcional)

    RAISE NOTICE '✅ Vínculo criado com sucesso entre % e %', v_medico_email, v_paciente_email;

END $$;
