-- =====================================================
-- 🔧 FIX COMPLETO: Tabela notifications
-- =====================================================
-- Corrige todos os problemas relacionados à tabela notifications
-- Data: 06/02/2026

-- 1. Adicionar coluna metadata se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.notifications 
    ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE '✅ Coluna metadata adicionada à tabela notifications';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna metadata já existe na tabela notifications';
  END IF;
END $$;

-- 2. Garantir que is_read existe (alguns scripts usam 'read', outros 'is_read')
DO $$
BEGIN
  -- Verificar se existe 'read' e renomear para 'is_read' se necessário
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'read'
  ) AND NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'is_read'
  ) THEN
    ALTER TABLE public.notifications 
    RENAME COLUMN "read" TO "is_read";
    
    RAISE NOTICE '✅ Coluna "read" renomeada para "is_read"';
  END IF;
  
  -- Se não existe nenhuma das duas, criar is_read
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'is_read'
  ) THEN
    ALTER TABLE public.notifications 
    ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    
    RAISE NOTICE '✅ Coluna is_read criada na tabela notifications';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna is_read já existe na tabela notifications';
  END IF;
END $$;

-- 3. Garantir que type aceita 'video_call_request'
DO $$
BEGIN
  -- Verificar se há constraint que limita os tipos
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND constraint_name LIKE '%notification_type%'
  ) THEN
    -- Remover constraint antiga se existir
    ALTER TABLE public.notifications 
    DROP CONSTRAINT IF EXISTS valid_notification_type;
    
    RAISE NOTICE '✅ Constraint antiga removida';
  END IF;
  
  -- Não criar nova constraint restritiva - deixar flexível
  RAISE NOTICE 'ℹ️ Tipo de notificação flexível (sem constraint restritiva)';
END $$;

-- 4. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 5. Comentários
COMMENT ON COLUMN public.notifications.metadata IS 'Metadados adicionais da notificação (request_id, requester_id, call_type, etc)';
COMMENT ON COLUMN public.notifications.is_read IS 'Indica se a notificação foi lida pelo usuário';

-- Status: ✅ Tabela notifications corrigida
-- - Coluna metadata adicionada (JSONB)
-- - Coluna is_read garantida (BOOLEAN)
-- - Tipo flexível (sem constraint restritiva)
