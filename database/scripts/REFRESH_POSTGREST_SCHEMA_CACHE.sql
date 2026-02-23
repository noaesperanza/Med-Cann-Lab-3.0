-- =====================================================
-- 🔄 REFRESH: Atualizar Schema Cache do PostgREST
-- =====================================================
-- O PostgREST mantém um cache do schema. Quando adicionamos colunas,
-- o cache pode não ser atualizado automaticamente.
-- Este script força a atualização do cache.
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

-- 2. Garantir que a coluna está acessível
-- PostgREST precisa que a coluna esteja no schema público e acessível
GRANT SELECT, INSERT, UPDATE ON public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;

-- 3. Forçar atualização do schema cache do PostgREST
-- O PostgREST atualiza o cache quando:
-- - A função é reiniciada
-- - O schema é alterado
-- - Fazemos um NOTIFY no canal 'pgrst' (se configurado)

-- Nota: O Supabase gerencia o PostgREST automaticamente.
-- Para forçar atualização, você pode:
-- 1. Fazer um pequeno ALTER na tabela (mesmo que não mude nada)
-- 2. Ou aguardar alguns minutos para o cache expirar

-- 4. Fazer um ALTER mínimo para forçar refresh do cache
ALTER TABLE public.notifications 
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

-- 5. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
  AND column_name = 'metadata';

-- Status: ✅ Schema cache será atualizado
-- Nota: Pode levar alguns minutos para o PostgREST atualizar o cache
-- Se o erro persistir, tente:
-- 1. Aguardar 2-3 minutos
-- 2. Reiniciar o projeto no Supabase Dashboard
-- 3. Verificar se há RLS bloqueando acesso à coluna
