-- =====================================================
-- VERIFICAR E CORRIGIR LOGIN DR. EDUARDO FAVERET
-- =====================================================

-- 1. Verificar se o usuário existe
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 2. Se não existir, criar o usuário
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      'eduardoscfaveret@gmail.com',
      crypt('123@456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      jsonb_build_object(
        'name', 'Dr. Eduardo Faveret',
        'type', 'professional',
        'crm', '123456',
        'cro', '654321',
        'specialty', 'Cannabis Medicinal',
        'institution', 'MedCannLab'
      ),
      'authenticated',
      'authenticated'
    );
    RAISE NOTICE 'Usuário Dr. Eduardo Faveret criado com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário Dr. Eduardo Faveret já existe.';
  END IF;
END $$;

-- 3. Se existir, atualizar os metadados
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

-- 4. Verificar resultado final
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as nome,
  raw_user_meta_data->>'type' as tipo,
  raw_user_meta_data->>'crm' as crm,
  raw_user_meta_data->>'cro' as cro,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 5. Verificar se a senha está correta
-- (Esta consulta não retorna a senha por segurança, mas confirma se o usuário existe)
SELECT 
  'Usuário encontrado' as status,
  email,
  'Senha: 123@456' as senha_info
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- =====================================================
-- SCRIPT CONCLUÍDO!
-- =====================================================
