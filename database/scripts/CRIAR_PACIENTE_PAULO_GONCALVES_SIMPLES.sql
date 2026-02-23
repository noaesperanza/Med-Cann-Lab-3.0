-- =====================================================
-- CRIAR PACIENTE PAULO GONÇALVES - VERSÃO SIMPLES
-- MedCannLab 3.0 - Sem dependências complexas
-- =====================================================
-- Email: paulo.goncalves@test.com
-- Senha: paulo123456

-- IMPORTANTE: Este script cria o usuário no auth.users
-- O registro na tabela 'users' será criado automaticamente pelo sistema ou trigger

-- 1. CRIAR USUÁRIO NO AUTH (se não existir)
-- =====================================================
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmed_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'paulo.goncalves@test.com',
  crypt('paulo123456', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Paulo Gonçalves","type":"patient","cpf":"123.456.789-00","phone":"(21) 98765-4321"}'::jsonb,
  false,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'paulo.goncalves@test.com'
);

-- 2. CRIAR REGISTRO NA TABELA USERS (se necessário e se a tabela existir)
-- =====================================================
-- Nota: Apenas tenta inserir se a tabela users existir e tiver as colunas necessárias
DO $$
DECLARE
  v_paulo_id UUID;
BEGIN
  -- Buscar ID do Paulo Gonçalves
  SELECT id INTO v_paulo_id 
  FROM auth.users 
  WHERE email = 'paulo.goncalves@test.com';
  
  IF v_paulo_id IS NOT NULL THEN
    -- Tentar inserir na tabela users (se existir)
    BEGIN
      INSERT INTO users (id, email, name, type, phone, created_at)
      VALUES (v_paulo_id, 'paulo.goncalves@test.com', 'Paulo Gonçalves', 'patient', '(21) 98765-4321', NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        type = EXCLUDED.type;
    EXCEPTION
      WHEN undefined_table THEN
        RAISE NOTICE 'Tabela users não existe. Usuário criado apenas no auth.users';
      WHEN undefined_column THEN
        RAISE NOTICE 'Alguma coluna não existe na tabela users. Usuário criado apenas no auth.users';
      WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao inserir na tabela users: %', SQLERRM;
    END;
  END IF;
END $$;

-- 3. VERIFICAR SE FOI CRIADO
-- =====================================================
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'type' as type,
  email_confirmed_at
FROM auth.users 
WHERE email = 'paulo.goncalves@test.com';

-- =====================================================
-- DADOS DE LOGIN PARA TESTE
-- =====================================================
-- Email: paulo.goncalves@test.com
-- Senha: paulo123456
-- Tipo: patient
-- Dashboard: /app/patient/dashboard
--
-- NOTA: Se você quiser criar avaliação e relatório para este paciente,
-- faça isso através da interface da aplicação, não via SQL.
-- Isso evita problemas de tipos UUID/TEXT.

