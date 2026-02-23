-- =====================================================
-- 🛠️ FIX Foreign Key em chat_participants (VERSÃO CORRIGIDA)
-- =====================================================
-- Erro: "insert or update on table chat_participants violates foreign key constraint chat_participants_user_id_fkey"
-- Data: 06/02/2026
-- 
-- Estrutura confirmada:
-- - auth.users: NÃO tem coluna 'name' (usa raw_user_meta_data->>'name')
-- - public.users: Pode ou não ter coluna 'name' (verificar antes de usar)
-- - chat_participants: Pode ou não ter coluna 'created_at' (verificar antes de usar)

set search_path = public;

-- =====================================================
-- 1. Verificar constraint atual
-- =====================================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_participants'::regclass
  AND contype = 'f'
  AND conkey::text LIKE '%user_id%';

-- =====================================================
-- 2. Verificar registros órfãos (user_id que não existe)
-- =====================================================
SELECT 
  COUNT(*) as total_orfaos,
  'Registros com user_id que não existe em auth.users' as problema
FROM public.chat_participants cp
LEFT JOIN auth.users u ON u.id = cp.user_id
WHERE u.id IS NULL;

-- =====================================================
-- 3. Verificar estrutura de public.users
-- =====================================================
DO $$
DECLARE
  has_name_column boolean;
  has_updated_at_column boolean;
BEGIN
  -- Verificar se coluna 'name' existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) INTO has_name_column;
  
  -- Verificar se coluna 'updated_at' existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'updated_at'
  ) INTO has_updated_at_column;
  
  RAISE NOTICE 'Coluna name existe: %', has_name_column;
  RAISE NOTICE 'Coluna updated_at existe: %', has_updated_at_column;
END $$;

-- =====================================================
-- 4. Sincronizar public.users com auth.users
-- =====================================================
-- Garantir que todos os IDs em auth.users existam em public.users
DO $$
DECLARE
  has_name_column boolean;
  has_updated_at_column boolean;
  sql_text text;
BEGIN
  -- Verificar estrutura
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) INTO has_name_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'updated_at'
  ) INTO has_updated_at_column;
  
  -- Construir SQL dinamicamente baseado na estrutura
  IF has_name_column AND has_updated_at_column THEN
    -- Tabela tem name e updated_at
    sql_text := '
      INSERT INTO public.users (id, email, name, type, created_at, updated_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(
          au.raw_user_meta_data->>''name'',
          SPLIT_PART(au.email, ''@'', 1)
        ) as name,
        COALESCE(
          au.raw_user_meta_data->>''type'',
          ''patient''
        ) as type,
        au.created_at,
        NOW() as updated_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE
      SET 
        email = EXCLUDED.email,
        updated_at = NOW()';
  ELSIF has_name_column THEN
    -- Tabela tem name mas não updated_at
    sql_text := '
      INSERT INTO public.users (id, email, name, type, created_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(
          au.raw_user_meta_data->>''name'',
          SPLIT_PART(au.email, ''@'', 1)
        ) as name,
        COALESCE(
          au.raw_user_meta_data->>''type'',
          ''patient''
        ) as type,
        au.created_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email';
  ELSIF has_updated_at_column THEN
    -- Tabela tem updated_at mas não name
    sql_text := '
      INSERT INTO public.users (id, email, type, created_at, updated_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(
          au.raw_user_meta_data->>''type'',
          ''patient''
        ) as type,
        au.created_at,
        NOW() as updated_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE
      SET 
        email = EXCLUDED.email,
        updated_at = NOW()';
  ELSE
    -- Tabela não tem name nem updated_at
    sql_text := '
      INSERT INTO public.users (id, email, type, created_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(
          au.raw_user_meta_data->>''type'',
          ''patient''
        ) as type,
        au.created_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email';
  END IF;
  
  EXECUTE sql_text;
  RAISE NOTICE '✅ Sincronização concluída';
END $$;

-- =====================================================
-- 5. Verificar se ainda há registros órfãos
-- =====================================================
SELECT 
  COUNT(*) as orfaos_restantes,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Nenhum registro órfão encontrado'
    ELSE '⚠️ Ainda há ' || COUNT(*) || ' registros órfãos'
  END as status
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
LEFT JOIN auth.users au ON au.id = cp.user_id
WHERE u.id IS NULL AND au.id IS NULL;

-- =====================================================
-- 6. Listar registros órfãos (se houver)
-- =====================================================
SELECT 
  cp.room_id,
  cp.user_id,
  cp.role,
  '⚠️ Este user_id não existe em public.users nem em auth.users' as problema
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
LEFT JOIN auth.users au ON au.id = cp.user_id
WHERE u.id IS NULL AND au.id IS NULL
LIMIT 20;

-- =====================================================
-- 7. Opção: Deletar registros órfãos (CUIDADO!)
-- =====================================================
-- Descomente apenas se realmente necessário:
-- DELETE FROM public.chat_participants
-- WHERE user_id NOT IN (SELECT id FROM auth.users)
--   AND user_id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL);

SELECT '✅ Fix de foreign key concluído!' as status;
