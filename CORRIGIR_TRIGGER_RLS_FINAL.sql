-- =====================================================
-- CORRIGIR TRIGGER E RLS - VERSÃO FINAL
-- =====================================================
-- Este script corrige o trigger e garante que RLS não bloqueie a inserção
-- Resolve o erro 500 "Database error saving new user"

-- =====================================================
-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE (SE NECESSÁRIO)
-- =====================================================
-- IMPORTANTE: Se RLS estiver bloqueando, vamos criar políticas adequadas
-- em vez de desabilitar completamente

-- Verificar se RLS está habilitado
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE tablename = 'users' 
      AND schemaname = 'public'
      AND rowsecurity = true
  ) THEN
    RAISE NOTICE '⚠️ RLS está habilitado na tabela users. Criando políticas adequadas...';
  ELSE
    RAISE NOTICE '✅ RLS não está habilitado na tabela users.';
  END IF;
END $$;

-- =====================================================
-- PASSO 2: CRIAR POLÍTICAS RLS SE NECESSÁRIO
-- =====================================================
-- Política para permitir inserção via trigger (SECURITY DEFINER)
-- O trigger usa SECURITY DEFINER, então deve bypassar RLS, mas vamos garantir

-- Remover políticas conflitantes de INSERT se existirem
DROP POLICY IF EXISTS "Trigger pode inserir usuários" ON public.users;
DROP POLICY IF EXISTS "Permitir inserção via trigger" ON public.users;
DROP POLICY IF EXISTS "Inserir via trigger" ON public.users;

-- Criar política que permite inserção via trigger
-- IMPORTANTE: Esta política permite que o trigger (executando com SECURITY DEFINER) insira dados
CREATE POLICY "Permitir inserção via trigger handle_new_user" 
ON public.users
FOR INSERT
TO authenticated, anon, service_role
WITH CHECK (true);

-- Política para permitir que usuários vejam seus próprios dados
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para permitir que usuários atualizem seus próprios dados
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;
CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- PASSO 3: CORRIGIR FUNÇÃO handle_new_user()
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_type TEXT;
  user_name TEXT;
  error_message TEXT;
BEGIN
  -- Extrair tipo dos metadados do usuário
  user_type := COALESCE(
    NEW.raw_user_meta_data->>'type',
    NEW.raw_user_meta_data->>'user_type',
    'patient'
  );
  
  -- Normalizar tipo: converter para lowercase
  IF user_type IS NOT NULL THEN
    user_type := LOWER(TRIM(user_type));
  ELSE
    user_type := 'patient';
  END IF;
  
  -- Mapear 'aluno' para 'student' (a constraint aceita 'student', não 'aluno')
  IF user_type = 'aluno' THEN
    user_type := 'student';
    RAISE NOTICE 'Mapeando tipo "aluno" para "student" para usuário %', NEW.email;
  END IF;
  
  -- Validar tipo (após mapeamento)
  IF user_type NOT IN ('patient', 'professional', 'student', 'admin') THEN
    -- Tipo inválido: usar 'patient' como padrão seguro
    RAISE WARNING 'Tipo de usuário inválido: %. Usando padrão: patient', user_type;
    user_type := 'patient';
  END IF;
  
  -- Extrair nome
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
  -- IMPORTANTE: Como a função usa SECURITY DEFINER, ela deve bypassar RLS
  BEGIN
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
      type = EXCLUDED.type,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Usuário inserido com sucesso: % (tipo: %)', NEW.email, user_type;
    
  EXCEPTION
    WHEN check_violation THEN
      -- Se ainda assim houver violação de constraint, usar 'patient'
      error_message := SQLERRM;
      RAISE WARNING 'Erro de constraint ao inserir tipo %: %. Usando padrão: patient', user_type, error_message;
      
      BEGIN
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
        
        RAISE NOTICE '✅ Usuário inserido com tipo padrão (patient): %', NEW.email;
        
      EXCEPTION WHEN OTHERS THEN
        error_message := SQLERRM;
        RAISE EXCEPTION 'Erro crítico ao inserir usuário %: %', NEW.email, error_message;
      END;
      
    WHEN OTHERS THEN
      error_message := SQLERRM;
      RAISE EXCEPTION 'Erro inesperado ao inserir usuário %: %', NEW.email, error_message;
  END;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- PASSO 4: RECRIAR TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PASSO 5: VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar trigger
SELECT 
    'TRIGGER' as verificacao,
    trigger_name,
    event_manipulation,
    action_timing,
    CASE 
        WHEN trigger_name = 'on_auth_user_created' THEN '✅ Trigger ativo'
        ELSE '❌ Trigger não encontrado'
    END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar função
SELECT 
    'FUNCAO' as verificacao,
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name = 'handle_new_user' THEN '✅ Função corrigida'
        ELSE '❌ Função não encontrada'
    END as status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- Verificar políticas RLS
SELECT 
    'RLS_POLICIES' as verificacao,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'INSERT' THEN '✅ Política de INSERT encontrada'
        ELSE '⚠️ Política de ' || cmd
    END as status
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'public';

-- Verificar estrutura da tabela users
SELECT 
    'ESTRUTURA' as verificacao,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN is_nullable = 'NO' THEN '✅ NOT NULL'
        ELSE '✅ NULL permitido'
    END as status
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('id', 'email', 'name', 'type')
ORDER BY ordinal_position;

