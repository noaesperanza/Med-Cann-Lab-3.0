-- =====================================================
-- 🔧 FIX FINAL: Tabela notifications (baseado na estrutura real)
-- =====================================================
-- Estrutura atual detectada:
-- - ✅ metadata (JSONB) - já existe
-- - ✅ is_read (boolean) - já existe
-- - ⚠️ read (boolean) - DUPLICADO, precisa ser removido ou renomeado
-- - ✅ data (JSONB) - pode ser usado, mas código usa metadata
-- Data: 06/02/2026

-- 1. Remover coluna 'read' duplicada (se existir e is_read também existir)
DO $$
BEGIN
  -- Se ambas existem, remover 'read' (manter apenas 'is_read')
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'read'
  ) AND EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'is_read'
  ) THEN
    -- Migrar dados de 'read' para 'is_read' se necessário
    UPDATE public.notifications
    SET is_read = COALESCE("read", false)
    WHERE is_read IS NULL OR (is_read = false AND "read" = true);
    
    -- Remover coluna 'read'
    ALTER TABLE public.notifications 
    DROP COLUMN IF EXISTS "read";
    
    RAISE NOTICE '✅ Coluna "read" removida (mantida apenas "is_read")';
  ELSIF EXISTS (
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
    -- Se só existe 'read', renomear para 'is_read'
    ALTER TABLE public.notifications 
    RENAME COLUMN "read" TO "is_read";
    
    RAISE NOTICE '✅ Coluna "read" renomeada para "is_read"';
  ELSE
    RAISE NOTICE 'ℹ️ Estrutura de colunas de leitura já está correta';
  END IF;
END $$;

-- 2. Garantir que metadata existe (já existe, mas garantir default)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'metadata'
  ) THEN
    -- Garantir que default está correto
    ALTER TABLE public.notifications 
    ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
    
    RAISE NOTICE '✅ Coluna metadata já existe, default garantido';
  ELSE
    -- Criar se não existir
    ALTER TABLE public.notifications 
    ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE '✅ Coluna metadata criada';
  END IF;
END $$;

-- 3. Garantir que is_read tem default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'is_read'
  ) THEN
    -- Garantir default
    ALTER TABLE public.notifications 
    ALTER COLUMN is_read SET DEFAULT false;
    
    -- Garantir que não é NULL
    ALTER TABLE public.notifications 
    ALTER COLUMN is_read SET NOT NULL;
    
    -- Atualizar NULLs para false
    UPDATE public.notifications
    SET is_read = false
    WHERE is_read IS NULL;
    
    RAISE NOTICE '✅ Coluna is_read configurada corretamente';
  END IF;
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
COMMENT ON COLUMN public.notifications.data IS 'Dados adicionais da notificação (legado, pode ser usado como alternativa a metadata)';

-- Status: ✅ Tabela notifications corrigida
-- - Coluna 'read' removida (mantida apenas 'is_read')
-- - Coluna metadata garantida (JSONB, default '{}')
-- - Coluna is_read garantida (BOOLEAN, default false, NOT NULL)
