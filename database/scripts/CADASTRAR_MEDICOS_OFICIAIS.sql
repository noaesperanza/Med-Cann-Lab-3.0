-- =====================================================
-- CADASTRO OFICIAL DE MÉDICOS PARCEIROS
-- =====================================================
-- Este script cria os usuários profissionais para Dr. Ricardo e Dr. Eduardo
-- Senha padrão inicial: MedCann2026! (Eles devem alterar depois)

-- 1. Dr. Ricardo Valença
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ricardo.valenca@medcannlab.com.br') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_super_admin
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'ricardo.valenca@medcannlab.com.br',
      crypt('MedCann2026!', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dr. Ricardo Valença", "type": "professional", "specialty": "Cannabis Medicinal", "crm": "CRM-RJ 123456"}',
      NOW(),
      NOW(),
      false
    );
     RAISE NOTICE '✅ Dr. Ricardo Valença cadastrado.';
  ELSE
    RAISE NOTICE 'ℹ️ Dr. Ricardo Valença já existe.';
  END IF;
END $$;

-- 2. Dr. Eduardo Faveret
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'eduardo.faveret@medcannlab.com.br') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_super_admin
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'eduardo.faveret@medcannlab.com.br',
      crypt('MedCann2026!', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dr. Eduardo Faveret", "type": "professional", "specialty": "Neuropediatria", "crm": "CRM-RJ 654321"}',
      NOW(),
      NOW(),
      false
    );
    RAISE NOTICE '✅ Dr. Eduardo Faveret cadastrado.';
  ELSE
    RAISE NOTICE 'ℹ️ Dr. Eduardo Faveret já existe.';
  END IF;
END $$;

-- 3. Listar IDs gerados para confirmação
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'name' as name, 
    raw_user_meta_data->>'type' as type
FROM auth.users 
WHERE email IN ('ricardo.valenca@medcannlab.com.br', 'eduardo.faveret@medcannlab.com.br');
