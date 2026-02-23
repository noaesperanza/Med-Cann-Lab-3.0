-- =====================================================
-- CORREÇÃO FINAL LOGIN DR. EDUARDO FAVERET
-- =====================================================

-- 1. Verificar dados atuais
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data->>'name' as nome,
  raw_user_meta_data->>'type' as tipo,
  aud
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 2. CORREÇÃO FINAL: Redefinir senha com hash correto
UPDATE auth.users 
SET 
  encrypted_password = crypt('123@456', gen_salt('bf')),
  email_confirmed_at = NOW(),
  aud = 'authenticated',
  updated_at = NOW()
WHERE email = 'eduardoscfaveret@gmail.com';

-- 3. Atualizar metadados específicos para Dr. Eduardo Faveret
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'name', 'Dr. Eduardo Faveret',
  'type', 'professional',
  'crm', '123456',
  'cro', '654321',
  'specialty', 'Cannabis Medicinal',
  'institution', 'MedCannLab',
  'role', 'founder',
  'custom_dashboard', 'eduardo_faveret'
)
WHERE email = 'eduardoscfaveret@gmail.com';

-- 4. Verificar resultado final
SELECT 
  'LOGIN CORRIGIDO' as status,
  email,
  raw_user_meta_data->>'name' as nome,
  raw_user_meta_data->>'type' as tipo,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'custom_dashboard' as dashboard,
  'Senha: 123@456' as senha_info
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- =====================================================
-- LOGIN CORRIGIDO E DASHBOARD PERSONALIZADO!
-- =====================================================
