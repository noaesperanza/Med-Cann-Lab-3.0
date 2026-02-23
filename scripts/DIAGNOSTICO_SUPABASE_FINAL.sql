-- DIAGRÓSTICO DE SAÚDE DO SUPABASE (MedCannLab 3.0)
-- Execute este script no SQL Editor do Supabase para verificar se o ambiente está pronto.

DO $$
DECLARE
    v_missing_funcs TEXT := '';
    v_missing_tables TEXT := '';
    v_rls_check INTEGER;
    v_admin_check TEXT;
BEGIN
    RAISE NOTICE '--- INICIANDO DIAGNÓSTICO DO SISTEMA ---';

    -- 1. VERIFICAR TABELAS DO CHAT
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        v_missing_tables := v_missing_tables || ' [chat_messages]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_rooms') THEN
        v_missing_tables := v_missing_tables || ' [chat_rooms]';
    END IF;

    IF v_missing_tables <> '' THEN
        RAISE WARNING '❌ TABELAS FALTANDO: %', v_missing_tables;
    ELSE
        RAISE NOTICE '✅ Estrutura de Tabelas de Chat OK';
    END IF;

    -- 2. VERIFICAR FUNÇÕES RPC (CRÍTICO PARA PERFORMANCE)
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_my_rooms') THEN
        v_missing_funcs := v_missing_funcs || ' [get_my_rooms]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_room_read') THEN
        v_missing_funcs := v_missing_funcs || ' [mark_room_read]';
    END IF;

    IF v_missing_funcs <> '' THEN
        RAISE WARNING '⚠️ FUNÇÕES RPC AUSENTES: %. O chat pode ficar lento ou falhar. Execute scripts/OPTIMIZE_CHAT_PERFORMANCE.sql', v_missing_funcs;
    ELSE
        RAISE NOTICE '✅ Funções RPC de Chat OK';
    END IF;

    -- 3. VERIFICAR RLS DA TABELA USERS (Causa comum de erro 400)
    SELECT COUNT(*) INTO v_rls_check 
    FROM pg_policies 
    WHERE tablename = 'users' AND cmd = 'SELECT';

    IF v_rls_check = 0 THEN
        RAISE WARNING '⚠️ CUIDADO: Nenhuma política de SELECT encontrada para tabela users. Isso gera erro 400 no frontend.';
    ELSE
        RAISE NOTICE '✅ Políticas RLS para Users encontradas (% policies)', v_rls_check;
    END IF;

    -- 4. VERIFICAR ADMINISTRADOR
    SELECT 
        CASE 
            WHEN raw_user_meta_data->>'flag_admin' = 'true' THEN '✅ CONFIGURADO' 
            ELSE '⚠️ METADATA FALTANDO' 
        END
    INTO v_admin_check
    FROM auth.users 
    WHERE email ILIKE '%phpg69@gmail.com%';

    IF v_admin_check IS NULL THEN
        RAISE WARNING '⚠️ Usuário phpg69@gmail.com NÃO ENCONTRADO na tabela auth.users';
    ELSE
        RAISE NOTICE '🔍 Status do Admin (phpg69@gmail.com): %', v_admin_check;
        
        -- Auto-fix opcional (apenas informativo na query)
        IF v_admin_check LIKE '%FALTANDO%' THEN
             RAISE NOTICE '   -> RECOMENDAÇÃO: Execute scripts/promote_to_admin.sql';
        END IF;
    END IF;

    RAISE NOTICE '--- FIM DO DIAGNÓSTICO ---';
END $$;
