-- =====================================================
-- 🧪 TESTE RÁPIDO: Chat Admin Funciona?
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Testar rapidamente se já é possível criar
--           salas e participantes do tipo 'admin'
-- =====================================================

-- 1. TESTE: Tentar inserir uma sala do tipo 'admin' (será revertida)
-- =====================================================
DO $$
DECLARE
    test_room_id UUID;
    test_user_id UUID;
    constraint_error BOOLEAN := false;
BEGIN
    -- Pegar um ID de usuário admin para teste
    SELECT id INTO test_user_id
    FROM auth.users
    WHERE email IN ('phpg69@gmail.com', 'rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com', 'cbdrcpremium@gmail.com')
    LIMIT 1;

    IF test_user_id IS NULL THEN
        RAISE NOTICE '⚠️ Nenhum admin encontrado para teste';
        RETURN;
    END IF;

    BEGIN
        -- Tentar inserir sala do tipo 'admin'
        INSERT INTO public.chat_rooms (name, type, created_by)
        VALUES ('TESTE_ADMIN_ROOM', 'admin', test_user_id)
        RETURNING id INTO test_room_id;

        -- Se chegou aqui, funcionou! Remover o teste
        DELETE FROM public.chat_rooms WHERE id = test_room_id;
        RAISE NOTICE '✅ SUCESSO: chat_rooms aceita type=''admin''';
    EXCEPTION
        WHEN check_violation THEN
            RAISE WARNING '❌ ERRO: Constraint bloqueia type=''admin'' em chat_rooms';
            RAISE NOTICE '💡 Execute: ADICIONAR_SUPORTE_CHAT_ADMIN_2026-02-06.sql';
            constraint_error := true;
        WHEN OTHERS THEN
            RAISE WARNING '❌ ERRO INESPERADO: %', SQLERRM;
    END;

    -- Teste 2: Tentar inserir participante com role='admin'
    BEGIN
        -- Criar sala temporária para teste
        INSERT INTO public.chat_rooms (name, type, created_by)
        VALUES ('TESTE_ADMIN_PARTICIPANT', 'patient', test_user_id)
        RETURNING id INTO test_room_id;

        -- Tentar inserir participante com role='admin'
        INSERT INTO public.chat_participants (room_id, user_id, role)
        VALUES (test_room_id, test_user_id, 'admin');

        -- Limpar teste
        DELETE FROM public.chat_participants WHERE room_id = test_room_id;
        DELETE FROM public.chat_rooms WHERE id = test_room_id;
        RAISE NOTICE '✅ SUCESSO: chat_participants aceita role=''admin''';
    EXCEPTION
        WHEN check_violation THEN
            -- Limpar sala de teste se foi criada
            DELETE FROM public.chat_rooms WHERE id = test_room_id;
            RAISE WARNING '❌ ERRO: Constraint bloqueia role=''admin'' em chat_participants';
            RAISE NOTICE '💡 Execute: ADICIONAR_SUPORTE_CHAT_ADMIN_2026-02-06.sql';
        WHEN OTHERS THEN
            -- Limpar sala de teste se foi criada
            DELETE FROM public.chat_rooms WHERE id = test_room_id;
            RAISE WARNING '❌ ERRO INESPERADO: %', SQLERRM;
    END;

    -- Resumo final
    IF NOT constraint_error THEN
        RAISE NOTICE '';
        RAISE NOTICE '═══════════════════════════════════════════════════════════';
        RAISE NOTICE '✅ TUDO OK! Chat Admin já está funcionando!';
        RAISE NOTICE '═══════════════════════════════════════════════════════════';
        RAISE NOTICE 'Você pode usar type=''admin'' e role=''admin'' normalmente.';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '═══════════════════════════════════════════════════════════';
        RAISE NOTICE '⚠️ PRECISA CORRIGIR! Execute o script de correção:';
        RAISE NOTICE '   ADICIONAR_SUPORTE_CHAT_ADMIN_2026-02-06.sql';
        RAISE NOTICE '═══════════════════════════════════════════════════════════';
    END IF;
END $$;

-- 2. VERIFICAR SE JÁ EXISTEM SALAS ADMIN (indica que já funciona)
-- =====================================================
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 
            '✅ Já existem ' || COUNT(*) || ' sala(s) do tipo admin - TUDO OK!'
        ELSE 
            'ℹ️ Nenhuma sala admin encontrada ainda (normal se não foi usado)'
    END AS status_admin_rooms
FROM public.chat_rooms
WHERE type = 'admin';

-- 3. VERIFICAR SE JÁ EXISTEM PARTICIPANTES ADMIN
-- =====================================================
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 
            '✅ Já existem ' || COUNT(*) || ' participante(s) com role=admin - TUDO OK!'
        ELSE 
            'ℹ️ Nenhum participante admin encontrado ainda (normal se não foi usado)'
    END AS status_admin_participants
FROM public.chat_participants
WHERE role = 'admin';
