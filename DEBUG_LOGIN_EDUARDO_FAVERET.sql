-- =====================================================
-- DEBUG LOGIN DR. EDUARDO FAVERET
-- =====================================================

-- 1. Verificar dados completos do usuário
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 2. Verificar se há problemas com a senha
-- (Testar hash da senha)
SELECT 
  'Teste de senha' as teste,
  crypt('123@456', gen_salt('bf')) as hash_nova_senha,
  'Senha atual deve ser: 123@456' as info;

-- 3. Verificar se o usuário está ativo
SELECT 
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Email confirmado'
    ELSE 'Email NÃO confirmado'
  END as status_email,
  CASE 
    WHEN last_sign_in_at IS NOT NULL THEN 'Já fez login antes'
    ELSE 'Nunca fez login'
  END as status_login,
  CASE 
    WHEN aud = 'authenticated' THEN 'Usuário ativo'
    ELSE 'Usuário inativo'
  END as status_usuario
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 4. Verificar metadados específicos
SELECT 
  raw_user_meta_data->>'name' as nome,
  raw_user_meta_data->>'type' as tipo,
  raw_user_meta_data->>'crm' as crm,
  raw_user_meta_data->>'cro' as cro,
  raw_user_meta_data->>'specialty' as especialidade,
  raw_user_meta_data->>'institution' as instituicao
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 5. Verificar se há outros usuários com email similar
SELECT 
  email,
  raw_user_meta_data->>'name' as nome,
  created_at
FROM auth.users 
WHERE email LIKE '%eduardo%' OR email LIKE '%faveret%'
ORDER BY created_at DESC;

-- 6. Verificar configurações de autenticação
SELECT 
  'Configurações de Auth' as info,
  'Verificar se email confirmation está habilitado' as config1,
  'Verificar se password reset está habilitado' as config2,
  'Verificar se signup está habilitado' as config3;

-- =====================================================
-- SCRIPT DE DEBUG CONCLUÍDO!
-- =====================================================
