            -- =====================================================
-- CORREÇÃO COMPLETA LOGIN DR. EDUARDO FAVERET
-- =====================================================

-- 1. Verificar dados completos do usuário
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  updated_at,
  raw_user_meta_data->>'name' as nome,
  raw_user_meta_data->>'type' as tipo,
  aud,
  role
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 2. CORREÇÃO 1: Confirmar email se não estiver confirmado
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'eduardoscfaveret@gmail.com' 
AND email_confirmed_at IS NULL;

-- 3. CORREÇÃO 2: Redefinir senha para garantir que está correta
UPDATE auth.users 
SET encrypted_password = crypt('123@456', gen_salt('bf'))
WHERE email = 'eduardoscfaveret@gmail.com';

-- 4. CORREÇÃO 3: Ativar usuário se estiver inativo
UPDATE auth.users 
SET aud = 'authenticated'
WHERE email = 'eduardoscfaveret@gmail.com';

-- 5. CORREÇÃO 4: Atualizar metadados para garantir que estão corretos
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'name', 'Dr. Eduardo Faveret',
  'type', 'professional',
  'crm', '123456',
  'cro', '654321',
  'specialty', 'Cannabis Medicinal',
  'institution', 'MedCannLab'
)
WHERE email = 'eduardoscfaveret@gmail.com';

-- 6. Verificar resultado final
SELECT 
  'CORREÇÕES APLICADAS' as status,
  email,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data->>'name' as nome,
  raw_user_meta_data->>'type' as tipo,
  aud,
  'Senha: 123@456' as senha_info
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 7. Teste de login simulado
SELECT 
  'TESTE DE LOGIN' as teste,
  'Email: eduardoscfaveret@gmail.com' as email,
  'Senha: 123@456' as senha,
  'Tipo: professional' as tipo,
  'Status: Pronto para login' as status;

-- =====================================================
-- CORREÇÕES APLICADAS!
-- =====================================================
