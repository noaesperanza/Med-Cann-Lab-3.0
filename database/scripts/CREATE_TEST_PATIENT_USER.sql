-- =====================================================
-- CRIAR USUÁRIO DE TESTE PACIENTE
-- =====================================================

-- Inserir usuário paciente de teste
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'test-patient-user-001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'paciente@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Paciente Teste"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Inserir dados do usuário na tabela users
INSERT INTO users (
  id,
  email,
  name,
  type,
  avatar_url,
  phone,
  address,
  blood_type,
  allergies,
  medications,
  created_at,
  updated_at
) VALUES (
  'test-patient-user-001',
  'paciente@test.com',
  'Paciente Teste',
  'patient',
  NULL,
  '(11) 99999-9999',
  'Rua Teste, 123 - São Paulo, SP',
  'O+',
  ARRAY['Penicilina'],
  ARRAY['Paracetamol 500mg'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  blood_type = EXCLUDED.blood_type,
  allergies = EXCLUDED.allergies,
  medications = EXCLUDED.medications,
  updated_at = NOW();

-- Verificar se foi criado
SELECT 
  u.id,
  u.email,
  u.name,
  u.type,
  u.phone,
  u.address
FROM users u 
WHERE u.email = 'paciente@test.com';
