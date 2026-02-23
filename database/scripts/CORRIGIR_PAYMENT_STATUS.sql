-- CORREÇÃO FINAL: Atualizar coluna payment_status explícita
-- O AuthContext seleciona 'payment_status' da tabela users.
-- O script anterior atualizou 'status' e 'metadata', mas não a coluna 'payment_status' usada pelo Guard.

DO $$
DECLARE
    v_patient_id UUID;
BEGIN
    -- 1. Identificar Paciente
    SELECT id INTO v_patient_id FROM auth.users WHERE email = 'casualmusic2021@gmail.com';
    
    IF v_patient_id IS NULL THEN
        RAISE NOTICE 'Paciente não encontrado em auth.users.';
        RETURN;
    END IF;

    -- 2. Atualizar a coluna payment_status (se existir)
    -- Usamos SQL dinâmico para evitar erro se a coluna não existir, 
    -- mas o código do AuthContext sugere fortemente que ela existe.
    
    BEGIN
        UPDATE public.users 
        SET payment_status = 'paid'
        WHERE id = v_patient_id;
        
        RAISE NOTICE '✅ payment_status atualizado para paid!';
    EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE '⚠️ Coluna payment_status não existe na tabela users. Tentando criar...';
        
        -- Se não existir, o AuthContext vai falhar silenciosamente ou pegar null.
        -- Vamos tentar adicionar a coluna para garantir.
        EXECUTE 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT ''pending''';
        
        UPDATE public.users 
        SET payment_status = 'paid'
        WHERE id = v_patient_id;
        
        RAISE NOTICE '✅ Coluna user.payment_status criada e atualizada!';
    END;
    
    -- 3. Reforçar metadados (Backup)
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'),
        '{payment_status}',
        '"paid"'
    )
    WHERE id = v_patient_id;

    RAISE NOTICE '✅ Metadados de Auth atualizados também.';

END $$;
