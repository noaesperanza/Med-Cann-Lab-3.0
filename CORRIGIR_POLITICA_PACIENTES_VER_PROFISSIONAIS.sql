-- =====================================================
-- CORRIGIR POLÍTICA RLS PARA PACIENTES VEREM PROFISSIONAIS
-- =====================================================
-- Este script corrige a política RLS para garantir que pacientes
-- possam ver os dois profissionais autorizados

-- 0. Criar função helper que não passa por RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_current_user_patient()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_type TEXT;
BEGIN
  SELECT type INTO user_type
  FROM users
  WHERE id = auth.uid();
  
  RETURN user_type = 'patient';
END;
$$;

-- 1. Remover política existente
DROP POLICY IF EXISTS "Pacientes podem ver profissionais autorizados" ON users;

-- 2. Recriar política com lógica mais simples e robusta
-- Usa uma subquery direta para verificar se o usuário atual é paciente
CREATE POLICY "Pacientes podem ver profissionais autorizados"
  ON users
  FOR SELECT
  USING (
    -- Verificar se o usuário atual é paciente (usando função SECURITY DEFINER para evitar recursão)
    is_current_user_patient()
    -- E mostrar apenas os dois profissionais autorizados
    AND users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
    AND users.type IN ('professional', 'admin')
  );

-- 3. Criar função helper SECURITY DEFINER para buscar profissionais
-- Esta função pode ser usada pelo frontend se necessário
CREATE OR REPLACE FUNCTION get_authorized_professionals()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Verificar se o usuário atual é paciente
  IF EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.type = 'patient'
  ) THEN
    -- Retornar apenas os dois profissionais autorizados
    RETURN QUERY
    SELECT 
      u.id,
      u.email,
      u.name,
      u.type
    FROM users u
    WHERE u.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
      AND u.type IN ('professional', 'admin');
  END IF;
  
  RETURN;
END;
$$;

-- 4. Testar a função
SELECT * FROM get_authorized_professionals();

-- 5. Verificar a política criada
SELECT 
    policyname,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
  AND policyname = 'Pacientes podem ver profissionais autorizados';
