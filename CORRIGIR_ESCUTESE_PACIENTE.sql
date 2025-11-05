-- =====================================================
-- CORRIGIR USUÁRIO ESCUTESE@GMAIL.COM NA TABELA USERS
-- =====================================================
-- Este script garante que escutese@gmail.com esteja
-- corretamente cadastrado na tabela users como paciente

-- 1. Verificar se o usuário existe em auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_from_auth,
    raw_user_meta_data->>'name' as name_from_auth,
    created_at
FROM auth.users
WHERE email = 'escutese@gmail.com';

-- 2. Verificar se existe na tabela users
SELECT 
    id,
    email,
    name,
    type,
    created_at
FROM users
WHERE email = 'escutese@gmail.com';

-- 3. Corrigir/Criar usuário na tabela users
DO $$
DECLARE
  auth_user_id UUID;
  auth_user_email TEXT := 'escutese@gmail.com';
  auth_user_name TEXT;
  auth_user_type TEXT := 'patient'; -- Forçar tipo patient
  user_exists_in_public BOOLEAN;
BEGIN
  -- Buscar ID do usuário em auth.users
  SELECT 
    id,
    COALESCE(
      NULLIF(raw_user_meta_data->>'name', ''),
      'Paciente Escutese',
      auth_user_email
    ),
    COALESCE(
      NULLIF(raw_user_meta_data->>'type', ''),
      'patient'
    )
  INTO auth_user_id, auth_user_name, auth_user_type
  FROM auth.users
  WHERE email = auth_user_email;
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário % não encontrado em auth.users. Verifique se está logado corretamente.', auth_user_email;
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado em auth.users: % (%) - ID: %', auth_user_name, auth_user_email, auth_user_id;
  
  -- Verificar se existe na tabela users
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth_user_id OR email = auth_user_email
  ) INTO user_exists_in_public;
  
  -- Sempre inserir ou atualizar, garantindo que o tipo seja 'patient'
  RAISE NOTICE '➕ Inserindo/Atualizando usuário na tabela users...';
  
  INSERT INTO users (id, email, name, type)
  VALUES (auth_user_id, auth_user_email, auth_user_name, 'patient')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    type = 'patient'; -- Sempre forçar tipo patient
  
  -- Garantir também por email (caso tenha sido criado com email diferente)
  INSERT INTO users (id, email, name, type)
  VALUES (auth_user_id, auth_user_email, auth_user_name, 'patient')
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    type = 'patient'; -- Sempre forçar tipo patient
  
  RAISE NOTICE '✅ Usuário criado/atualizado na tabela users com type = patient';
  
  -- Verificar resultado final
  RAISE NOTICE '📊 Verificando resultado final...';
  
  -- Verificar se foi criado/atualizado corretamente
  SELECT 
    id,
    email,
    name,
    type
  FROM users
  WHERE id = auth_user_id OR email = auth_user_email;
  
END $$;

-- 4. Verificar resultado após correção
SELECT 
    id,
    email,
    name,
    type,
    CASE 
      WHEN type = 'patient' THEN '✅ É paciente'
      ELSE '❌ NÃO é paciente (tipo: ' || type || ')'
    END as status,
    created_at
FROM users
WHERE email = 'escutese@gmail.com';

-- 5. Testar se o usuário atual (se for escutese@gmail.com) pode ver os profissionais
-- Execute este comando enquanto estiver logado como escutese@gmail.com
SELECT 
    auth.uid() as current_user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
    CASE 
        WHEN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'escutese@gmail.com' 
        THEN '✅ É escutese@gmail.com'
        ELSE '❌ Não é escutese@gmail.com'
    END as verification;

-- 6. Testar função is_current_user_patient() para escutese@gmail.com
-- (Execute enquanto logado como escutese@gmail.com)
SELECT 
    is_current_user_patient() as resultado,
    CASE 
        WHEN is_current_user_patient() = true THEN '✅ Retorna TRUE (é paciente)'
        WHEN is_current_user_patient() = false THEN '❌ Retorna FALSE (NÃO é paciente)'
        ELSE '⚠️ Retorna NULL (erro na função)'
    END as interpretacao;

-- 7. Testar busca direta de profissionais (simula o que o frontend faz)
-- Este teste mostra o que o paciente deve conseguir ver
SELECT 
    id,
    email,
    name,
    type,
    CASE 
        WHEN email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com') 
             AND type IN ('professional', 'admin')
        THEN '✅ Profissional autorizado'
        ELSE '❌ Não autorizado'
    END as status
FROM users
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
  AND type IN ('professional', 'admin');

-- 8. Testar função get_authorized_professionals()
-- (Execute enquanto logado como escutese@gmail.com)
SELECT * FROM get_authorized_professionals();

-- Verificar quantos profissionais foram retornados
SELECT 
    COUNT(*) as total_profissionais,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Profissionais encontrados'
        ELSE '❌ Nenhum profissional encontrado'
    END as resultado
FROM get_authorized_professionals();
