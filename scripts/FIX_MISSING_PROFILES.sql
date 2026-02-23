-- ============================================================================
-- FIX: SINCRONIZAR PERFIS DE USUÁRIOS (Corrigir erro de FK)
-- Data: 2025-12-23
-- Problema: Erro "Key (user_id)=(...) is not present in table users" ao criar chat.
-- Causa: O usuário existe em auth.users mas não tem perfil em public.users.
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 1. Contar quantos usuários estão sem perfil
    SELECT COUNT(*) INTO v_count
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL;

    RAISE NOTICE 'Encontrados % usuários sem perfil na tabela public.users.', v_count;

    -- 2. Inserir perfis faltantes
    INSERT INTO public.users (id, email, name, type, created_at, updated_at)
    SELECT 
        au.id, 
        au.email, 
        COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
        COALESCE(au.raw_user_meta_data->>'type', 'paciente'), -- Default seguro
        au.created_at,
        NOW()
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL;

    -- 3. Confirmação
    RAISE NOTICE 'Perfis sincronizados com sucesso. Agora a criação de chat deve funcionar.';

    -- 4. Diagnóstico específico para o usuário do erro (Athanir)
    PERFORM * FROM public.users WHERE id = 'a16f4505-9c52-4643-93cb-65f0f7568f0d';
    IF FOUND THEN
        RAISE NOTICE 'Usuário Athanir (a16f4505...) verificado na tabela public.users.';
    END IF;

END$$;
