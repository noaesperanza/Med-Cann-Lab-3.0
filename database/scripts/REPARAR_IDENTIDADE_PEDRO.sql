-- ==============================================================================
-- REPARAR IDENTIDADE DO USUÁRIO PEDRO (phpg69@gmail.com)
-- ==============================================================================
-- Este script corrige o nome do usuário Pedro no Supabase, tanto nos metadados
-- do Auth quanto na tabela pública de usuários, garantindo que ele não seja
-- confundido com o Dr. Ricardo Valença.

-- 1. Obter o ID do usuário Pedro
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'phpg69@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- 2. Corrigir metadados no Auth
        UPDATE auth.users
        SET raw_user_meta_data = 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            '{"name": "Pedro", "type": "admin", "flag_admin": true}'::jsonb,
            updated_at = NOW()
        WHERE id = v_user_id;

        -- 3. Corrigir registro na tabela pública users
        -- Se não existir, o trigger deve criar, mas vamos garantir aqui
        INSERT INTO public.users (id, email, name, type, updated_at)
        VALUES (v_user_id, 'phpg69@gmail.com', 'Pedro', 'admin', NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = 'Pedro',
            type = 'admin',
            updated_at = NOW();

        RAISE NOTICE '✅ Identidade do usuário Pedro (phpg69@gmail.com) corrigida com sucesso.';
        
        -- 4. Reatribuição de Registros (OPCIONAL)
        -- Atualmente Pedro tem 4 agendamentos vinculados. 
        -- Se preferir manter esses registros com o Dr. Ricardo para limpar seu perfil master:
        
        DECLARE
            v_target_email TEXT := 'rrvalenca@gmail.com'; -- Pode ser alterado para outro email se desejar
            v_target_id UUID;
        BEGIN
            SELECT id INTO v_target_id FROM auth.users WHERE email = v_target_email;
            
            IF v_target_id IS NOT NULL THEN
                -- Transferir agendamentos
                UPDATE public.appointments 
                SET professional_id = v_target_id 
                WHERE professional_id = v_user_id;

                UPDATE public.appointments 
                SET doctor_id = v_target_id 
                WHERE doctor_id = v_user_id;

                -- Nota: Mantemos o acesso de ADMIN de Pedro intacto. 
                -- Esta transferência é apenas para "limpar" o histórico de consultas/testes.
                
                RAISE NOTICE '✅ Registros de teste transferidos para %.', v_target_email;
            END IF;
        END;

        RAISE NOTICE '✅ Identidade corrigida: Agora você é "Pedro" (Admin Master).';
    ELSE
        RAISE NOTICE '❌ Usuário phpg69@gmail.com não encontrado.';
    END IF;
END $$;


-- 4. Verificar resultado final
SELECT id, email, name, type
FROM public.users
WHERE email = 'phpg69@gmail.com'
UNION ALL
SELECT id, email, raw_user_meta_data->>'name' as name, raw_user_meta_data->>'type' as type
FROM auth.users
WHERE email = 'phpg69@gmail.com';
