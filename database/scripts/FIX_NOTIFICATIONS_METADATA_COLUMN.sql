-- =====================================================
-- 🔧 FIX: Adicionar coluna metadata à tabela notifications
-- =====================================================
-- Erro: "Could not find the 'metadata' column of 'notifications'"
-- Data: 06/02/2026

-- Verificar se coluna metadata existe
DO $$
BEGIN
  -- Adicionar coluna metadata se não existir
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

-- Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Comentário
COMMENT ON COLUMN public.notifications.metadata IS 'Metadados adicionais da notificação (request_id, requester_id, call_type, etc)';
