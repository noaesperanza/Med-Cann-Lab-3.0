-- =====================================================
-- CORRIGIR USUÁRIO ESCUTESE@GMAIL.COM - VERSÃO FINAL
-- =====================================================
-- Este script garante que escutese@gmail.com esteja
-- corretamente cadastrado na tabela users como paciente
-- e possa ver os profissionais autorizados

-- 1. Verificar se o usuário existe em auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_from_auth,
    raw_user_meta_data->>'name' as name_from_auth,
    created_at
FROM auth.users
WHERE email = 'escutese@gmail.com';

-- 2. Verificar se existe na tabela users (ANTES)
SELECT 
    id,
    email,
    name,
    type,
    created_at
FROM users
WHERE email = 'escutese@gmail.com';

-- 3. CORRIGIR/CRIAR USUÁRIO NA TABELA USERS
DO $$
DECLARE
  auth_user_id UUID;
  auth_user_email TEXT := 'escutese@gmail.com';
  auth_user_name TEXT;
BEGIN
  -- Buscar ID do usuário em auth.users
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
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário % não encontrado em auth.users. Verifique se está logado corretamente.', auth_user_email;
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado em auth.users: % (%) - ID: %', auth_user_name, auth_user_email, auth_user_id;
  
  -- Inserir ou atualizar na tabela users, SEMPRE com type = 'patient'
  INSERT INTO users (id, email, name, type)
  VALUES (auth_user_id, auth_user_email, auth_user_name, 'patient')
  ON CONFLICT (id) DO UPDATE SET
    email = auth_user_email,
    name = auth_user_name,
    type = 'patient'; -- SEMPRE forçar tipo patient
  
  -- Garantir também por email (caso tenha sido criado com ID diferente)
  INSERT INTO users (id, email, name, type)
  VALUES (auth_user_id, auth_user_email, auth_user_name, 'patient')
  ON CONFLICT (email) DO UPDATE SET
    id = auth_user_id,
    name = auth_user_name,
    type = 'patient'; -- SEMPRE forçar tipo patient
  
  RAISE NOTICE '✅ Usuário criado/atualizado na tabela users com type = patient';
  
  -- Verificar resultado (sem SELECT dentro do DO para evitar erro)
  PERFORM 1 FROM users WHERE id = auth_user_id OR email = auth_user_email;
  
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

-- 5. Testar função is_current_user_patient()
-- Execute este comando enquanto estiver logado como escutese@gmail.com
SELECT 
    auth.uid() as current_user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
    (SELECT type FROM users WHERE id = auth.uid()) as type_in_users_table,
    is_current_user_patient() as is_patient_function_result,
    CASE 
        WHEN is_current_user_patient() = true THEN '✅ Retorna TRUE (é paciente)'
        WHEN is_current_user_patient() = false THEN '❌ Retorna FALSE (NÃO é paciente)'
        ELSE '⚠️ Retorna NULL (erro na função)'
    END as interpretacao;

-- 6. Testar busca direta de profissionais (simula o que o frontend faz)
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

-- 7. Testar função get_authorized_professionals()
-- (Execute enquanto logado como escutese@gmail.com)
SELECT * FROM get_authorized_professionals();

-- 8. Verificar quantos profissionais foram retornados
SELECT 
    COUNT(*) as total_profissionais,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Profissionais encontrados'
        ELSE '❌ Nenhum profissional encontrado'
    END as resultado
FROM get_authorized_professionals();

-- 9. VERIFICAÇÃO FINAL: Verificar se tudo está correto
SELECT 
    'VERIFICAÇÃO FINAL' as titulo,
    (SELECT COUNT(*) FROM users WHERE email = 'escutese@gmail.com' AND type = 'patient') as paciente_cadastrado,
    (SELECT COUNT(*) FROM users WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com') 
     AND type IN ('professional', 'admin')) as profissionais_autorizados_existem,
    (SELECT COUNT(*) FROM get_authorized_professionals()) as profissionais_retornados_pela_funcao,
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE email = 'escutese@gmail.com' AND type = 'patient') > 0
         AND (SELECT COUNT(*) FROM users WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com') 
              AND type IN ('professional', 'admin')) >= 2
        THEN '✅ Tudo configurado corretamente'
        ELSE '❌ Algo está faltando'
    END as status_geral;
