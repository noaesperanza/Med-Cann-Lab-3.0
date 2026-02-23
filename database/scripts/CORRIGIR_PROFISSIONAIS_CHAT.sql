-- =====================================================
-- CORRIGIR/CRIAR PROFISSIONAIS PARA O CHAT
-- =====================================================
-- Este script garante que os dois profissionais autorizados
-- estejam cadastrados corretamente na tabela users

-- 1. Verificar se Dr. Ricardo Valença existe
DO $$
DECLARE
  ricardo_id UUID;
  ricardo_email TEXT := 'rrvalenca@gmail.com';
BEGIN
  -- Buscar ID do usuário na tabela auth.users
  SELECT id INTO ricardo_id
  FROM auth.users
  WHERE email = ricardo_email
  LIMIT 1;

  IF ricardo_id IS NOT NULL THEN
    -- Verificar se existe na tabela users
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = ricardo_id) THEN
      -- Criar registro na tabela users
      INSERT INTO users (id, email, name, type)
      VALUES (
        ricardo_id,
        ricardo_email,
        'Dr. Ricardo Valença',
        'admin'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        type = 'admin';
      
      RAISE NOTICE '✅ Dr. Ricardo Valença criado/atualizado na tabela users';
    ELSE
      -- Atualizar tipo se necessário
      UPDATE users
      SET type = 'admin',
          name = 'Dr. Ricardo Valença',
          email = ricardo_email
      WHERE id = ricardo_id
        AND (type != 'admin' OR name != 'Dr. Ricardo Valença' OR email != ricardo_email);
      
      RAISE NOTICE '✅ Dr. Ricardo Valença já existe na tabela users';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Dr. Ricardo Valença não encontrado na tabela auth.users';
  END IF;
END $$;

-- 2. Verificar se Dr. Eduardo Faveret existe
DO $$
DECLARE
  eduardo_id UUID;
  eduardo_email TEXT := 'eduardoscfaveret@gmail.com';
BEGIN
  -- Buscar ID do usuário na tabela auth.users
  SELECT id INTO eduardo_id
  FROM auth.users
  WHERE email = eduardo_email
  LIMIT 1;

  IF eduardo_id IS NOT NULL THEN
    -- Verificar se existe na tabela users
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = eduardo_id) THEN
      -- Criar registro na tabela users
      INSERT INTO users (id, email, name, type)
      VALUES (
        eduardo_id,
        eduardo_email,
        'Dr. Eduardo Faveret',
        'professional'
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        type = 'professional';
      
      RAISE NOTICE '✅ Dr. Eduardo Faveret criado/atualizado na tabela users';
    ELSE
      -- Atualizar tipo se necessário
      UPDATE users
      SET type = 'professional',
          name = 'Dr. Eduardo Faveret',
          email = eduardo_email
      WHERE id = eduardo_id
        AND (type != 'professional' OR name != 'Dr. Eduardo Faveret' OR email != eduardo_email);
      
      RAISE NOTICE '✅ Dr. Eduardo Faveret já existe na tabela users';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Dr. Eduardo Faveret não encontrado na tabela auth.users';
  END IF;
END $$;

-- 3. Verificar resultado final
SELECT 
    id,
    email,
    name,
    type,
    created_at
FROM users
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
ORDER BY email;

-- 4. Testar se um paciente consegue ver esses profissionais
-- (Simular consulta que será feita pelo frontend)
-- NOTA: Este SELECT pode falhar se executado como admin, mas funcionará quando um paciente fizer login
SELECT 
    id,
    email,
    name,
    type
FROM users
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
  AND type IN ('professional', 'admin')
ORDER BY name;

