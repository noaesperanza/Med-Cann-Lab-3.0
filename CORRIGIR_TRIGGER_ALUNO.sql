-- =====================================================
-- CORRIGIR TRIGGER PARA ACEITAR 'aluno'
-- =====================================================
-- Este script corrige o trigger para mapear 'aluno' -> 'student'
-- Resolve o erro 500 "Database error saving new user"

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
BEGIN
  -- Extrair tipo dos metadados do usuário
  user_type := COALESCE(
    NEW.raw_user_meta_data->>'type',
    NEW.raw_user_meta_data->>'user_type',
    'patient'
  );
  
  -- Normalizar tipo: converter para lowercase
  user_type := LOWER(TRIM(user_type));
  
  -- Mapear 'aluno' para 'student' (a constraint aceita 'student', não 'aluno')
  IF user_type = 'aluno' THEN
    user_type := 'student';
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
  
  -- Inserir ou atualizar na tabela users
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

-- Verificar se o trigger existe e está ativo
SELECT 
    'TRIGGER' as verificacao,
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name = 'on_auth_user_created' THEN '✅ Trigger ativo'
        ELSE '❌ Trigger não encontrado'
    END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Teste: Verificar função
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
