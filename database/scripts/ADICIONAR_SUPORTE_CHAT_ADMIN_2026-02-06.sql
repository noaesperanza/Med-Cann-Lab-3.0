-- =====================================================
-- ✅ ADICIONAR SUPORTE PARA CHAT ADMIN
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Garantir que chat_rooms suporte type='admin'
--           e chat_participants suporte role='admin'
-- =====================================================
-- IMPORTANTE: Execute primeiro VERIFICAR_CHAT_ADMIN_SUPPORT_2026-02-06.sql
--             para verificar o estado atual antes de aplicar este script.
-- =====================================================

-- 1. VERIFICAR E REMOVER CONSTRAINT RESTRITIVA EM chat_rooms.type (SE EXISTIR)
-- =====================================================
-- Se houver uma constraint CHECK que não inclui 'admin', vamos removê-la
DO $$
DECLARE
    constraint_name TEXT;
    constraint_def TEXT;
BEGIN
    -- Buscar constraint de type em chat_rooms
    SELECT conname, pg_get_constraintdef(oid)
    INTO constraint_name, constraint_def
    FROM pg_constraint
    WHERE conrelid = 'public.chat_rooms'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%type%'
      AND pg_get_constraintdef(oid) NOT LIKE '%admin%'
    LIMIT 1;

    -- Se encontrou constraint restritiva, remover
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Constraint removida: %', constraint_name;
    ELSE
        RAISE NOTICE 'Nenhuma constraint restritiva encontrada em chat_rooms.type';
    END IF;
END $$;

-- 2. ADICIONAR CONSTRAINT PERMISSIVA EM chat_rooms.type (SE NÃO EXISTIR)
-- =====================================================
-- Permitir: 'patient', 'professional', 'admin', e outros tipos existentes
DO $$
BEGIN
    -- Verificar se já existe constraint que inclui 'admin'
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.chat_rooms'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%type%'
          AND pg_get_constraintdef(oid) LIKE '%admin%'
    ) THEN
        -- Remover constraint antiga se existir (sem admin)
        ALTER TABLE public.chat_rooms 
        DROP CONSTRAINT IF EXISTS chat_rooms_type_check;

        -- Adicionar nova constraint que inclui 'admin'
        -- Nota: Se a tabela não tiver constraint, isso pode falhar silenciosamente
        --       (o que é ok, significa que type é TEXT sem restrição)
        BEGIN
            ALTER TABLE public.chat_rooms
            ADD CONSTRAINT chat_rooms_type_check 
            CHECK (type IN ('patient', 'professional', 'admin', 'support', 'general'));
            RAISE NOTICE 'Constraint adicionada: chat_rooms_type_check';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Constraint já existe ou type não tem constraint';
        END;
    ELSE
        RAISE NOTICE 'Constraint que inclui admin já existe em chat_rooms.type';
    END IF;
END $$;

-- 3. VERIFICAR E REMOVER CONSTRAINT RESTRITIVA EM chat_participants.role (SE EXISTIR)
-- =====================================================
DO $$
DECLARE
    constraint_name TEXT;
    constraint_def TEXT;
BEGIN
    -- Buscar constraint de role em chat_participants
    SELECT conname, pg_get_constraintdef(oid)
    INTO constraint_name, constraint_def
    FROM pg_constraint
    WHERE conrelid = 'public.chat_participants'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%'
      AND pg_get_constraintdef(oid) NOT LIKE '%admin%'
    LIMIT 1;

    -- Se encontrou constraint restritiva, remover
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.chat_participants DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Constraint removida: %', constraint_name;
    ELSE
        RAISE NOTICE 'Nenhuma constraint restritiva encontrada em chat_participants.role';
    END IF;
END $$;

-- 4. ADICIONAR CONSTRAINT PERMISSIVA EM chat_participants.role (SE NÃO EXISTIR)
-- =====================================================
DO $$
BEGIN
    -- Verificar se já existe constraint que inclui 'admin'
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.chat_participants'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%role%'
          AND pg_get_constraintdef(oid) LIKE '%admin%'
    ) THEN
        -- Remover constraint antiga se existir (sem admin)
        ALTER TABLE public.chat_participants 
        DROP CONSTRAINT IF EXISTS chat_participants_role_check;

        -- Adicionar nova constraint que inclui 'admin'
        BEGIN
            ALTER TABLE public.chat_participants
            ADD CONSTRAINT chat_participants_role_check 
            CHECK (role IN ('patient', 'professional', 'admin', 'support'));
            RAISE NOTICE 'Constraint adicionada: chat_participants_role_check';
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Constraint já existe ou role não tem constraint';
        END;
    ELSE
        RAISE NOTICE 'Constraint que inclui admin já existe em chat_participants.role';
    END IF;
END $$;

-- 5. VERIFICAÇÃO FINAL
-- =====================================================
DO $$
DECLARE
    rooms_support_admin BOOLEAN := false;
    participants_support_admin BOOLEAN := false;
BEGIN
    -- Verificar se chat_rooms aceita 'admin'
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.chat_rooms'::regclass
          AND contype = 'c'
          AND (pg_get_constraintdef(oid) LIKE '%admin%' OR pg_get_constraintdef(oid) NOT LIKE '%type%')
    ) OR NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.chat_rooms'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%type%'
    ) INTO rooms_support_admin;

    -- Verificar se chat_participants aceita 'admin'
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.chat_participants'::regclass
          AND contype = 'c'
          AND (pg_get_constraintdef(oid) LIKE '%admin%' OR pg_get_constraintdef(oid) NOT LIKE '%role%')
    ) OR NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.chat_participants'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%role%'
    ) INTO participants_support_admin;

    IF rooms_support_admin AND participants_support_admin THEN
        RAISE NOTICE '✅ SUCESSO: chat_rooms e chat_participants suportam type/role=''admin''';
    ELSE
        RAISE WARNING '⚠️ ATENÇÃO: Verifique manualmente as constraints';
        RAISE NOTICE 'chat_rooms suporta admin: %', rooms_support_admin;
        RAISE NOTICE 'chat_participants suporta admin: %', participants_support_admin;
    END IF;
END $$;

-- 6. COMENTÁRIOS
-- =====================================================
COMMENT ON COLUMN public.chat_rooms.type IS 'Tipo da sala: patient, professional, admin, support, general';
COMMENT ON COLUMN public.chat_participants.role IS 'Papel do participante: patient, professional, admin, support';
