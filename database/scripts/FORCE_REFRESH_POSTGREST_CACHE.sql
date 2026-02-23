-- =====================================================
-- 🔄 FORCE REFRESH: Forçar Atualização do Schema Cache do PostgREST
-- =====================================================
-- O PostgREST mantém um cache do schema. Quando adicionamos colunas,
-- o cache pode não ser atualizado automaticamente.
-- Este script força a atualização de várias formas.
-- Data: 06/02/2026

-- 1. Verificar se a coluna metadata existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'notifications' 
      AND column_name = 'metadata'
  ) THEN
    RAISE NOTICE '✅ Coluna metadata existe na tabela notifications';
  ELSE
    RAISE EXCEPTION '❌ Coluna metadata NÃO existe na tabela notifications';
  END IF;
END $$;

-- 2. Garantir permissões corretas
GRANT SELECT, INSERT, UPDATE ON public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO service_role;

-- 3. Fazer ALTERs mínimos para forçar refresh do cache
-- O PostgREST detecta mudanças no schema e atualiza o cache
ALTER TABLE public.notifications 
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

-- 4. Garantir que a coluna não é NULL (mas permite NULL para compatibilidade)
-- Não vamos forçar NOT NULL, mas garantir que o default está correto
ALTER TABLE public.notifications 
  ALTER COLUMN metadata SET DEFAULT COALESCE(metadata, '{}'::jsonb);

-- 5. Criar um índice na coluna metadata (força o PostgREST a reconhecer)
-- Isso ajuda o PostgREST a "ver" a coluna
CREATE INDEX IF NOT EXISTS idx_notifications_metadata 
  ON public.notifications USING gin (metadata);

-- 6. Comentário na coluna (ajuda o PostgREST a reconhecer)
COMMENT ON COLUMN public.notifications.metadata IS 
  'Metadados adicionais da notificação (request_id, requester_id, call_type, etc)';

-- 7. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
  AND column_name = 'metadata';

-- 8. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'notifications'
  AND indexname LIKE '%metadata%';

-- Status: ✅ Schema cache será atualizado
-- Nota: O PostgREST pode levar 2-5 minutos para atualizar o cache
-- Se o erro persistir após 5 minutos, tente:
-- 1. Reiniciar o projeto no Supabase Dashboard (Settings → General → Restart)
-- 2. Ou aguardar mais alguns minutos (cache expira automaticamente)
