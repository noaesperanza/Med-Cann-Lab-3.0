-- =====================================================
-- 🔧 CORRIGIR CONSTRAINT USERS E VERIFICAR EPILEPSY_EVENTS
-- =====================================================
-- Data: 06/02/2026
-- Problemas:
-- 1. Constraint CHECK na tabela users só aceita valores em inglês
-- 2. Tabela epilepsy_events pode ter estrutura diferente
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR CONSTRAINT ATUAL DA TABELA USERS
-- =====================================================

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
    AND contype = 'c'
    AND conname LIKE '%type%';

-- =====================================================
-- 2. REMOVER CONSTRAINT ANTIGA E CRIAR NOVA (ACEITA PORTUGUÊS E INGLÊS)
-- =====================================================

-- Remover constraint antiga (se existir)
DO $$
BEGIN
    -- Tentar remover constraint antiga
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_type_check;
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_type_check_old;
    RAISE NOTICE '✅ Constraints antigas removidas (se existiam)';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ℹ️ Nenhuma constraint antiga encontrada ou já foi removida';
END $$;

-- Criar nova constraint que aceita português E inglês
ALTER TABLE public.users 
ADD CONSTRAINT users_type_check 
CHECK (type IN (
    -- Valores em português
    'paciente', 'profissional', 'aluno', 'admin', 'master', 'gestor',
    -- Valores em inglês (para compatibilidade)
    'patient', 'professional', 'student', 'admin'
));

-- =====================================================
-- 3. VERIFICAR ESTRUTURA DA TABELA EPILEPSY_EVENTS
-- =====================================================

-- Verificar se a tabela existe
SELECT 
    'epilepsy_events' AS table_name,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'epilepsy_events'
    ) AS exists;

-- Verificar colunas da tabela epilepsy_events (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'epilepsy_events'
ORDER BY ordinal_position;

-- =====================================================
-- 4. CORRIGIR TABELA EPILEPSY_EVENTS (SE NECESSÁRIO)
-- =====================================================

-- Se a tabela existe mas não tem event_date, adicionar
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'epilepsy_events'
    ) THEN
        -- Verificar se event_date existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
                AND table_name = 'epilepsy_events'
                AND column_name = 'event_date'
        ) THEN
            -- Adicionar coluna event_date
            ALTER TABLE public.epilepsy_events
            ADD COLUMN event_date TIMESTAMPTZ DEFAULT NOW();
            
            -- Atualizar valores existentes
            UPDATE public.epilepsy_events
            SET event_date = COALESCE(created_at, NOW())
            WHERE event_date IS NULL;
            
            RAISE NOTICE '✅ Coluna event_date adicionada à tabela epilepsy_events';
        ELSE
            RAISE NOTICE 'ℹ️ Coluna event_date já existe na tabela epilepsy_events';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela epilepsy_events não existe ainda (será criada pelo script principal)';
    END IF;
END $$;

-- =====================================================
-- 5. AGORA PODEMOS CORRIGIR OS TIPOS DE USUÁRIO
-- =====================================================

-- Padronizar: patient → paciente
UPDATE public.users
SET type = 'paciente'
WHERE type = 'patient';

-- Padronizar: professional → profissional
UPDATE public.users
SET type = 'profissional'
WHERE type = 'professional';

-- Padronizar: student → aluno
UPDATE public.users
SET type = 'aluno'
WHERE type = 'student';

-- =====================================================
-- 6. VERIFICAR RESULTADO
-- =====================================================

-- Verificar tipos de usuário após correção
SELECT 
    type,
    COUNT(*) AS count,
    STRING_AGG(email, ', ' ORDER BY email) AS emails
FROM public.users
GROUP BY type
ORDER BY count DESC;

-- Verificar se há usuários com tipo inválido
SELECT 
    id,
    email,
    name,
    type,
    CASE 
        WHEN type IN ('paciente', 'profissional', 'aluno', 'admin', 'master', 'gestor', 'patient', 'professional', 'student') THEN '✅ VÁLIDO'
        ELSE '❌ INVÁLIDO'
    END AS status
FROM public.users
WHERE type NOT IN ('paciente', 'profissional', 'aluno', 'admin', 'master', 'gestor', 'patient', 'professional', 'student')
ORDER BY type;

-- =====================================================
-- 7. VERIFICAR ÍNDICE DE EPILEPSY_EVENTS
-- =====================================================

-- Verificar se o índice existe
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename = 'epilepsy_events'
    AND indexname LIKE '%event_date%';

-- Criar índice se não existir (e tabela existir)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'epilepsy_events'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public'
                AND tablename = 'epilepsy_events'
                AND indexname = 'idx_epilepsy_events_event_date'
        ) THEN
            CREATE INDEX IF NOT EXISTS idx_epilepsy_events_event_date 
            ON public.epilepsy_events(event_date DESC);
            RAISE NOTICE '✅ Índice idx_epilepsy_events_event_date criado';
        ELSE
            RAISE NOTICE 'ℹ️ Índice idx_epilepsy_events_event_date já existe';
        END IF;
    END IF;
END $$;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Script executado com sucesso! Constraint corrigida e epilepsy_events verificado.' AS status;
