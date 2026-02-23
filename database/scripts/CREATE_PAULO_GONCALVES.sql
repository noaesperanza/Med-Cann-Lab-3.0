-- =====================================================
-- CRIAR PACIENTE PAULO GONÇALVES PARA TESTE
-- =====================================================

-- Inserir usuário Paulo Gonçalves
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'paulo-goncalves-001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'paulo.goncalves@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Paulo Gonçalves", "type": "patient"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DADOS DO PACIENTE
-- =====================================================
-- Nome: Paulo Gonçalves
-- Idade: 56 anos
-- Email: paulo.goncalves@test.com
-- Senha: 123456
-- Tipo: Paciente
