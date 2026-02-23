-- =====================================================
-- CORRIGIR TRIGGER PARA ACEITAR 'aluno' - VERSÃO FINAL
-- =====================================================
-- Este script corrige o trigger para mapear 'aluno' -> 'student'
-- Resolve o erro 500 "Database error saving new user"
-- Versão com melhor tratamento de erros e logging

-- Corrigir função handle_new_user() para mapear 'aluno' para 'student'
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

-- Verificar se o trigger existe e está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

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

-- Verificar estrutura da tabela users
SELECT 
    'ESTRUTURA' as verificacao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('id', 'email', 'name', 'type')
ORDER BY ordinal_position;

