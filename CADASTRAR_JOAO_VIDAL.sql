-- =====================================================
-- CADASTRAR JOÃO VIDAL
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script cadastra o João Vidal como profissional

DO $$
DECLARE
  existing_user_id UUID;
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'joaovidal@gmail.com';
  
  IF existing_user_id IS NULL THEN
    -- Criar usuário profissional
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
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'joaovidal@gmail.com',
      crypt('Joao2025!', gen_salt('bf')), -- Senha temporária
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "João Vidal", "type": "professional", "user_type": "professional"}',
      false,
      '',
      '',
      '',
      ''
    );
    
    RAISE NOTICE '✅ João Vidal cadastrado com sucesso!';
  ELSE
    -- Atualizar metadados do usuário existente
    UPDATE auth.users
    SET 
      raw_user_meta_data = jsonb_build_object(
        'name', 'João Vidal',
        'type', 'professional',
        'user_type', 'professional'
      ),
      updated_at = NOW()
    WHERE email = 'joaovidal@gmail.com';
    
    RAISE NOTICE '✅ Metadados do João Vidal atualizados!';
  END IF;
  
END $$;

-- Verificar resultado após executar o bloco
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'type' as type,
  created_at,
  updated_at
FROM auth.users
WHERE email = 'joaovidal@gmail.com';
