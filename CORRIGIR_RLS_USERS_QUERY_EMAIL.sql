-- =====================================================
-- CORRIGIR POLÍTICA PARA PERMITIR QUERY POR EMAIL
-- =====================================================
-- O problema é que a política precisa permitir queries filtradas por email
-- quando o usuário é paciente. Vamos ajustar a política.

-- Remover política atual
DROP POLICY IF EXISTS "Pacientes podem ver profissionais autorizados" ON users;

-- Recriar política que permite query por email
-- Esta política deve retornar TRUE quando:
-- 1. O usuário atual é paciente
-- 2. O usuário consultado é um dos profissionais autorizados
CREATE POLICY "Pacientes podem ver profissionais autorizados"
  ON users
  FOR SELECT
  USING (
    -- Verificar se o usuário atual é paciente usando função SECURITY DEFINER
    get_current_user_type() = 'patient'
    -- E permitir ver profissionais autorizados
    -- Verificação por email (permite .in('email', ...))
    AND (
      users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
      OR users.type = 'admin'
    )
    -- E garantir que o tipo é profissional ou admin
    AND users.type IN ('professional', 'admin')
  );

-- Verificar se a política foi criada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users'
AND policyname = 'Pacientes podem ver profissionais autorizados';
