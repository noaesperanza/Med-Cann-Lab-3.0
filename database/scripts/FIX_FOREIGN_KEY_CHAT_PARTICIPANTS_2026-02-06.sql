-- Fix: Foreign Key Constraint em chat_participants
-- Erro: "insert or update on table chat_participants violates foreign key constraint chat_participants_user_id_fkey"
-- Data: 06/02/2026

-- 1. Verificar a constraint atual
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'chat_participants'
  AND kcu.column_name = 'user_id';

-- 2. Verificar registros órfãos (user_id que não existe em auth.users)
-- Nota: Removido cp.created_at caso a coluna não exista
SELECT 
  cp.room_id,
  cp.user_id,
  cp.role
FROM public.chat_participants cp
LEFT JOIN auth.users u ON u.id = cp.user_id
WHERE u.id IS NULL;

-- 3. Verificar se há user_id em chat_participants que não estão em users
-- (isso causa o erro de foreign key)
SELECT 
  COUNT(*) as registros_orfaos
FROM public.chat_participants cp
LEFT JOIN auth.users u ON u.id = cp.user_id
WHERE u.id IS NULL;

-- 4. Opção 1: Deletar registros órfãos (CUIDADO - apenas se realmente não forem necessários)
-- DELETE FROM public.chat_participants
-- WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 5. Opção 2: Criar usuários faltantes na tabela users (se os IDs existem em auth.users mas não em public.users)
-- Primeiro, verificar se os IDs existem em auth.users mas não em public.users
SELECT 
  cp.user_id,
  au.email,
  au.raw_user_meta_data->>'name' as name_from_auth,
  'Existe em auth.users mas não em public.users' as problema
FROM public.chat_participants cp
JOIN auth.users au ON au.id = cp.user_id
LEFT JOIN public.users pu ON pu.id = cp.user_id
WHERE pu.id IS NULL
LIMIT 20;

-- 6. Se necessário, criar registros em public.users para IDs que existem em auth.users
-- (Isso resolve o problema se a foreign key aponta para public.users ao invés de auth.users)
INSERT INTO public.users (id, email, name, type, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
  COALESCE(au.raw_user_meta_data->>'type', 'patient') as type,
  au.created_at
FROM auth.users au
WHERE au.id IN (
  SELECT DISTINCT cp.user_id
  FROM public.chat_participants cp
  LEFT JOIN public.users pu ON pu.id = cp.user_id
  WHERE pu.id IS NULL
)
ON CONFLICT (id) DO NOTHING;

-- 7. Verificar se a foreign key está apontando para auth.users ou public.users
-- Se estiver apontando para public.users, precisamos garantir que todos os IDs existam lá
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_participants'::regclass
  AND contype = 'f';

-- 8. Se a constraint aponta para auth.users, verificar se há IDs inválidos
-- Se aponta para public.users, garantir que todos os IDs existam em public.users
-- A solução mais segura é garantir que todos os user_id em chat_participants existam em public.users

-- 9. Verificar se há diferença entre auth.users e public.users
SELECT 
  COUNT(DISTINCT au.id) as total_auth_users,
  COUNT(DISTINCT pu.id) as total_public_users,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT pu.id) as diferenca
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id;

-- 10. Sincronizar public.users com auth.users (garantir que todos os IDs existam)
-- Nota: Verificar estrutura da tabela antes de inserir
DO $$
BEGIN
  -- Verificar se coluna 'name' existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) THEN
    -- Tabela tem coluna 'name'
    INSERT INTO public.users (id, email, name, type, created_at, updated_at)
    SELECT 
      au.id,
      au.email,
      COALESCE(
        au.raw_user_meta_data->>'name',
        SPLIT_PART(au.email, '@', 1)
      ) as name,
      COALESCE(
        au.raw_user_meta_data->>'type',
        'patient'
      ) as type,
      au.created_at,
      NOW() as updated_at
    FROM auth.users au
    WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW();
  ELSE
    -- Tabela não tem coluna 'name'
    INSERT INTO public.users (id, email, type, created_at, updated_at)
    SELECT 
      au.id,
      au.email,
      COALESCE(
        au.raw_user_meta_data->>'type',
        'patient'
      ) as type,
      au.created_at,
      NOW() as updated_at
    FROM auth.users au
    WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW();
  END IF;
END $$;

-- 11. Verificar novamente se ainda há registros órfãos
SELECT 
  COUNT(*) as registros_orfaos_restantes
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
WHERE u.id IS NULL;

-- 12. Se ainda houver registros órfãos, listá-los para análise
SELECT 
  cp.room_id,
  cp.user_id,
  cp.role,
  cp.created_at,
  'Registro órfão - user_id não existe em public.users' as problema
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
WHERE u.id IS NULL
LIMIT 50;

-- Comentários:
-- Se após executar este script ainda houver erro, pode ser que:
-- 1. A foreign key esteja apontando para auth.users mas alguns IDs não existem lá
-- 2. Há IDs em chat_participants que não existem em nenhuma das tabelas
-- Nesse caso, será necessário investigar a origem desses IDs e corrigi-los manualmente
