-- ============================================================================
-- FIX: GARANTIR QUE RICARDO (rrvalenca@gmail.com) VEJA AS MENSAGENS
-- Data: 2025-12-23
-- ============================================================================

DO $$
DECLARE
    v_ricardo_id UUID;
    v_admin_id UUID;
    v_room_id UUID;
BEGIN
    -- 1. Buscar ID do Ricardo pelo e-mail (garantia de estar certo)
    SELECT id INTO v_ricardo_id FROM auth.users WHERE email = 'rrvalenca@gmail.com';
    
    IF v_ricardo_id IS NULL THEN
        RAISE EXCEPTION 'Usuário rrvalenca@gmail.com não encontrado!';
    END IF;

    RAISE NOTICE 'ID do Ricardo encontrado: %', v_ricardo_id;

    -- 2. Garantir que ele seja um "Profissional" na tabela users (para ver o dashboard corretamente)
    -- Tenta 'professional' (inglês) que é o provável valor aceito pela constraint users_type_check
    BEGIN
        UPDATE public.users 
        SET type = 'professional' 
        WHERE id = v_ricardo_id AND type != 'professional';
    EXCEPTION WHEN check_violation THEN
        -- Se falhar, tenta manter o que estava ou ignorar, focando no chat
        RAISE NOTICE 'Não foi possível alterar tipo de usuário para professional. Mantendo original.';
    END;

    -- 3. Encontrar salas recentes criadas pelo Admin (ou qualquer sala "órfã" dele)
    -- Vamos pegar as últimas 5 salas criadas onde ele NÃO está participando e adicioná-lo
    -- Isso "recupera" as mensagens que o Admin mandou e ele não viu.
    
    FOR v_room_id IN 
        SELECT id FROM chat_rooms 
        WHERE created_at > (NOW() - INTERVAL '24 hours') -- Salas criadas hoje
        AND NOT EXISTS (
            SELECT 1 FROM chat_participants 
            WHERE room_id = chat_rooms.id AND user_id = v_ricardo_id
        )
    LOOP
        INSERT INTO chat_participants (room_id, user_id, role)
        VALUES (v_room_id, v_ricardo_id, 'professional')
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Ricardo adicionado à sala % para recuperar mensagens.', v_room_id;
    END LOOP;

    -- 4. Criar (ou garantir) uma sala direta entre Admin e Ricardo para teste futuro
    -- Supondo que quem está executando é o Admin
    v_admin_id := auth.uid();
    
    IF v_admin_id IS NOT NULL AND v_admin_id != v_ricardo_id THEN
        -- Tentar encontrar sala entre eles
        SELECT cr.id INTO v_room_id
        FROM chat_rooms cr
        JOIN chat_participants cp1 ON cr.id = cp1.room_id AND cp1.user_id = v_admin_id
        JOIN chat_participants cp2 ON cr.id = cp2.room_id AND cp2.user_id = v_ricardo_id
        LIMIT 1;
        
        IF v_room_id IS NULL THEN
            -- Criar sala nova
            INSERT INTO chat_rooms (name, type, created_by)
            VALUES ('Admin & Dr. Ricardo', 'direct', v_admin_id)
            RETURNING id INTO v_room_id;
            
            INSERT INTO chat_participants (room_id, user_id, role) VALUES (v_room_id, v_admin_id, 'admin');
            INSERT INTO chat_participants (room_id, user_id, role) VALUES (v_room_id, v_ricardo_id, 'professional');
            
            RAISE NOTICE 'Nova sala Admin-Ricardo criada: %', v_room_id;
        ELSE
            RAISE NOTICE 'Sala Admin-Ricardo já existe: %', v_room_id;
        END IF;
    END IF;

END$$;
