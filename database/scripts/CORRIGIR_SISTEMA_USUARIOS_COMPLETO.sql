-- =====================================================
-- CORREÇÃO COMPLETA DO SISTEMA DE USUÁRIOS
-- =====================================================
-- Este script resolve todos os problemas identificados:
-- 1. Cria trigger para criar usuário automaticamente na tabela users
-- 2. Sincroniza usuários existentes
-- 3. Corrige função get_authorized_professionals()
-- 4. Garante que escutese@gmail.com está configurado corretamente
-- 5. Valida tipos de usuário conforme constraint CHECK

-- =====================================================
-- PASSO 1: CRIAR TRIGGER AUTOMÁTICO (CORRIGIDO)
-- =====================================================

-- Criar função que será executada pelo trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_type TEXT;
  user_name TEXT;
  valid_types TEXT[] := ARRAY['patient', 'professional', 'student', 'admin'];
BEGIN
  -- Extrair tipo dos metadados do usuário
  user_type := COALESCE(
    NEW.raw_user_meta_data->>'type',
    NEW.raw_user_meta_data->>'user_type',
    NULL
  );
  
  -- Normalizar tipo: converter para lowercase e validar
  IF user_type IS NOT NULL AND user_type != '' THEN
    user_type := LOWER(TRIM(user_type));
    
    -- Verificar se o tipo é válido (comparação case-sensitive com array)
    IF user_type NOT IN ('patient', 'professional', 'student', 'admin') THEN
      -- Tipo inválido: usar 'patient' como padrão seguro
      RAISE WARNING 'Tipo de usuário inválido: %. Usando padrão: patient', user_type;
      user_type := 'patient';
    END IF;
  ELSE
    -- Tipo não fornecido ou vazio: usar 'patient' como padrão
    user_type := 'patient';
  END IF;
  
  -- Garantir que user_type nunca seja NULL
  IF user_type IS NULL OR user_type = '' THEN
    user_type := 'patient';
  END IF;
  
  -- Extrair nome (garantir que nunca seja NULL ou vazio)
  user_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    SPLIT_PART(NEW.email, '@', 1),
    'Usuário'
  );
  
  -- Garantir que user_name nunca seja NULL ou vazio
  IF user_name IS NULL OR TRIM(user_name) = '' THEN
    user_name := COALESCE(SPLIT_PART(NEW.email, '@', 1), 'Usuário');
  END IF;
  
  -- Inserir ou atualizar na tabela users
  -- Garantir que user_type sempre será um dos valores válidos
  -- IMPORTANTE: No ON CONFLICT, garantir que o tipo seja validado
  INSERT INTO public.users (id, email, name, type)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_type
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, users.email),
    name = COALESCE(NULLIF(TRIM(EXCLUDED.name), ''), users.name),
    -- Garantir que o tipo seja sempre válido, mesmo no UPDATE
    type = CASE 
      WHEN EXCLUDED.type IN ('patient', 'professional', 'student', 'admin') 
      THEN EXCLUDED.type
      ELSE COALESCE(users.type, 'patient')
    END,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN check_violation THEN
    -- Se ainda assim houver violação de constraint, usar 'patient'
    RAISE WARNING 'Erro ao inserir tipo %. Usando padrão: patient', user_type;
    INSERT INTO public.users (id, email, name, type)
    VALUES (
      NEW.id,
      NEW.email,
      user_name,
      'patient'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, users.email),
      name = COALESCE(NULLIF(TRIM(EXCLUDED.name), ''), users.name),
      type = 'patient',
      updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PASSO 2: SINCRONIZAR USUÁRIOS EXISTENTES (CORRIGIDO)
-- =====================================================

DO $$
DECLARE
  auth_user RECORD;
  user_type TEXT;
  user_name TEXT;
  sync_count INTEGER := 0;
  valid_types TEXT[] := ARRAY['patient', 'professional', 'student', 'admin'];
BEGIN
  FOR auth_user IN 
    SELECT 
      id,
      email,
      raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users)
  LOOP
    -- Extrair e normalizar tipo
    user_type := COALESCE(
      auth_user.raw_user_meta_data->>'type',
      auth_user.raw_user_meta_data->>'user_type',
      NULL
    );
    
    IF user_type IS NOT NULL AND user_type != '' THEN
      user_type := LOWER(TRIM(user_type));
      
      -- Validar tipo (comparação explícita)
      IF user_type NOT IN ('patient', 'professional', 'student', 'admin') THEN
        RAISE WARNING 'Tipo inválido para %: %. Usando padrão: patient', auth_user.email, user_type;
        user_type := 'patient';
      END IF;
    ELSE
      user_type := 'patient';
    END IF;
    
    -- Garantir que user_type nunca seja NULL
    IF user_type IS NULL OR user_type = '' THEN
      user_type := 'patient';
    END IF;
    
    user_name := COALESCE(
      NULLIF(TRIM(auth_user.raw_user_meta_data->>'name'), ''),
      SPLIT_PART(auth_user.email, '@', 1),
      'Usuário'
    );
    
    -- Garantir que user_name nunca seja NULL ou vazio
    IF user_name IS NULL OR TRIM(user_name) = '' THEN
      user_name := COALESCE(SPLIT_PART(auth_user.email, '@', 1), 'Usuário');
    END IF;
    
    -- Inserir na tabela users com tipo validado
    BEGIN
      INSERT INTO public.users (id, email, name, type)
      VALUES (
        auth_user.id,
        auth_user.email,
        user_name,
        user_type
      )
      ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        name = COALESCE(NULLIF(TRIM(EXCLUDED.name), ''), users.name),
        -- Garantir que o tipo seja sempre válido, mesmo no UPDATE
        type = CASE 
          WHEN EXCLUDED.type IN ('patient', 'professional', 'student', 'admin') 
          THEN EXCLUDED.type
          ELSE COALESCE(users.type, 'patient')
        END;
      
      sync_count := sync_count + 1;
    EXCEPTION
      WHEN check_violation THEN
        -- Se ainda assim houver violação, usar 'patient'
        RAISE WARNING 'Erro ao inserir tipo % para %. Usando padrão: patient', user_type, auth_user.email;
        INSERT INTO public.users (id, email, name, type)
        VALUES (
          auth_user.id,
          auth_user.email,
          user_name,
          'patient'
        )
        ON CONFLICT (id) DO UPDATE SET
          email = COALESCE(EXCLUDED.email, users.email),
          name = COALESCE(NULLIF(TRIM(EXCLUDED.name), ''), users.name),
          type = 'patient';
        
        sync_count := sync_count + 1;
    END;
  END LOOP;
  
  RAISE NOTICE '✅ % usuários sincronizados na tabela users', sync_count;
END $$;

-- =====================================================
-- PASSO 3: CORRIGIR escutese@gmail.com
-- =====================================================

DO $$
DECLARE
  auth_user_id UUID;
  auth_user_email TEXT := 'escutese@gmail.com';
  auth_user_name TEXT;
BEGIN
  SELECT 
    id,
    COALESCE(
      NULLIF(raw_user_meta_data->>'name', ''),
      'Paciente Escutese',
      auth_user_email
    )
  INTO auth_user_id, auth_user_name
  FROM auth.users
  WHERE email = auth_user_email;
  
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO users (id, email, name, type)
    VALUES (auth_user_id, auth_user_email, auth_user_name, 'patient')
    ON CONFLICT (id) DO UPDATE SET
      email = auth_user_email,
      name = auth_user_name,
      type = 'patient';
    
    INSERT INTO users (id, email, name, type)
    VALUES (auth_user_id, auth_user_email, auth_user_name, 'patient')
    ON CONFLICT (email) DO UPDATE SET
      id = auth_user_id,
      name = auth_user_name,
      type = 'patient';
    
    RAISE NOTICE '✅ escutese@gmail.com configurado como paciente';
  ELSE
    RAISE NOTICE '⚠️ escutese@gmail.com não encontrado em auth.users';
  END IF;
END $$;

-- =====================================================
-- PASSO 4: CORRIGIR FUNÇÃO get_authorized_professionals()
-- =====================================================

CREATE OR REPLACE FUNCTION get_authorized_professionals()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_type TEXT;
BEGIN
  -- Verificar tipo do usuário atual (bypassa RLS por ser SECURITY DEFINER)
  SELECT type INTO current_user_type
  FROM users
  WHERE users.id = auth.uid();
  
  -- Se for paciente, retornar profissionais autorizados
  IF current_user_type = 'patient' THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.email,
      u.name,
      u.type
    FROM users u
    WHERE u.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
      AND u.type IN ('professional', 'admin');
  END IF;
  
  RETURN;
END;
$$;

-- =====================================================
-- PASSO 5: VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar trigger
SELECT 
    'TRIGGER' as verificacao,
    trigger_name,
    CASE 
        WHEN trigger_name = 'on_auth_user_created' THEN '✅ Trigger criado'
        ELSE '❌ Trigger não encontrado'
    END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar sincronização
SELECT 
    'SINCRONIZACAO' as verificacao,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.users) as total_public_users,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users) 
        THEN '✅ Todos sincronizados'
        ELSE '⚠️ Diferença encontrada'
    END as status;

-- Verificar escutese@gmail.com
SELECT 
    'ESCUTESE' as verificacao,
    id,
    email,
    name,
    type,
    CASE 
        WHEN type = 'patient' THEN '✅ Configurado como paciente'
        ELSE '❌ Tipo incorreto'
    END as status
FROM users
WHERE email = 'escutese@gmail.com';

-- Verificar profissionais autorizados
SELECT 
    'PROFISSIONAIS' as verificacao,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ Profissionais encontrados'
        ELSE '❌ Profissionais não encontrados'
    END as status
FROM users
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
  AND type IN ('professional', 'admin');

-- Verificar constraint da tabela users
SELECT 
    'CONSTRAINT' as verificacao,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  AND conname LIKE '%type%';
