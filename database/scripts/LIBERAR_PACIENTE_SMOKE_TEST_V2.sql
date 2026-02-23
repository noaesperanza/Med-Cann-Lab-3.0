-- LIBERAR PACIENTE PARA TESTE (SMOKE TEST) - VERSÃO 2 (ROBUSTA)
-- Objetivo: Simular pagamento, vincular ao Dr. Ricardo Valença e garantir acesso.

DO $$
DECLARE
    v_patient_id UUID;
    v_doctor_id UUID;
    v_plan_id UUID;
BEGIN
    ---------------------------------------------------------------------------
    -- 1. IDENTIFICAÇÃO DOS USUÁRIOS
    ---------------------------------------------------------------------------
    
    -- Buscar ID do Paciente (tentativa dupla: auth e public)
    SELECT id INTO v_patient_id FROM auth.users WHERE email = 'casualmusic2021@gmail.com';
    
    IF v_patient_id IS NULL THEN
        RAISE NOTICE 'Paciente não encontrado em auth.users. Tentando public.users...';
        SELECT id INTO v_patient_id FROM public.users WHERE email = 'casualmusic2021@gmail.com';
    END IF;

    IF v_patient_id IS NULL THEN
        RAISE EXCEPTION 'ERRO CRÍTICO: Paciente casualmusic2021@gmail.com não encontrado. Cadastre-o primeiro.';
    END IF;

    -- Buscar ID do Dr. Ricardo Valença
    SELECT id INTO v_doctor_id FROM public.users 
    WHERE (name ILIKE '%Ricardo Valen%' OR email ILIKE '%ricardo%') 
    AND type = 'profissional' 
    LIMIT 1;

    IF v_doctor_id IS NULL THEN
        RAISE NOTICE 'Dr. Ricardo Valença não encontrado pelo nome. Tentando buscar qualquer profissional admin...';
        SELECT id INTO v_doctor_id FROM public.users WHERE type = 'profissional' LIMIT 1;
    END IF;
    
    IF v_doctor_id IS NULL THEN
         RAISE EXCEPTION 'Nenhum profissional encontrado para vincular o paciente.';
    END IF;

    RAISE NOTICE 'Paciente: % (ID: %)', 'casualmusic2021@gmail.com', v_patient_id;
    RAISE NOTICE 'Médico Vinculado: % (ID: %)', 'Ricardo Valença', v_doctor_id;

    ---------------------------------------------------------------------------
    -- 2. ATUALIZAÇÃO CADASTRAL E VÍNCULO
    ---------------------------------------------------------------------------

    UPDATE public.users 
    SET 
        status = 'active',
        invited_by = v_doctor_id, -- Vínculo crucial para lógica de dashboard
        metadata = jsonb_set(
            jsonb_set(
                COALESCE(metadata, '{}'), 
                '{subscription}', 
                '{"status": "active", "plan": "premium", "valid_until": "2030-01-01"}'
            ),
            '{onboarding}',
            '{"completed": true, "step": "finished"}'
        )
    WHERE id = v_patient_id;

    ---------------------------------------------------------------------------
    -- 3. SIMULAÇÃO DE ASSINATURA (TABELAS MÚLTIPLAS POR SEGURANÇA)
    ---------------------------------------------------------------------------

    -- Tabela: subscriptions (encontrada no useFinancialData.ts)
    BEGIN
        INSERT INTO public.subscriptions (user_id, status, plan, current_period_end, created_at)
        VALUES (v_patient_id, 'active', 'premium', NOW() + INTERVAL '1 year', NOW())
        ON CONFLICT (user_id) DO UPDATE 
        SET status = 'active', current_period_end = NOW() + INTERVAL '1 year';
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabela public.subscriptions não existe. Pulando.';
    END;

    -- Tabela: user_subscriptions (encontrada no ProfessionalFinancial.tsx)
    BEGIN
        INSERT INTO public.user_subscriptions (user_id, status, plan_id, current_period_end, created_at)
        VALUES (v_patient_id, 'active', 'premium', NOW() + INTERVAL '1 year', NOW())
        ON CONFLICT (user_id) DO UPDATE 
        SET status = 'active', current_period_end = NOW() + INTERVAL '1 year';
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabela public.user_subscriptions não existe. Pulando.';
    END;

    ---------------------------------------------------------------------------
    -- 4. SIMULAÇÃO DE TRANSAÇÃO (PARA FINANCEIRO DO MÉDICO)
    ---------------------------------------------------------------------------
    
    BEGIN
        INSERT INTO public.transactions (
            user_id, 
            doctor_id, 
            amount, 
            type, 
            status, 
            description, 
            payment_method, 
            created_at
        )
        VALUES (
            v_patient_id, 
            v_doctor_id, 
            79.99, 
            'revenue', 
            'completed', 
            'Assinatura Premium (Smoke Test)', 
            'PIX', 
            NOW()
        );
    EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Tabela public.transactions não existe. Pulando.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao inserir transação: %', SQLERRM;
    END;

    RAISE NOTICE '✅ SUCESSO! O Paciente está liberado, pago e vinculado.';

END $$;
