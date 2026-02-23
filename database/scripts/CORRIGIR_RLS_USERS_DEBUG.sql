-- =====================================================
-- CORRIGIR POLÍTICA PARA PERMITIR QUERY POR EMAIL
-- =====================================================
-- O problema é que a query está usando .in('email', ...) mas a política
-- não está permitindo essa consulta. Precisamos ajustar a política.

-- Remover e recriar a política de pacientes para ser mais permissiva
-- quando o usuário é paciente
DROP POLICY IF EXISTS "Pacientes podem ver profissionais autorizados" ON users;

CREATE POLICY "Pacientes podem ver profissionais autorizados"
  ON users
  FOR SELECT
  USING (
    -- Verificar se o usuário atual é paciente usando função SECURITY DEFINER
    get_current_user_type() = 'patient'
    -- E mostrar apenas os dois profissionais autorizados
    -- Permitir query por email direto
    AND (
      (users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com') 
       AND users.type IN ('professional', 'admin'))
      OR users.type = 'admin'
    )
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

-- Testar a função get_current_user_type
-- Execute isso como um paciente para verificar se retorna 'patient'
SELECT get_current_user_type() as current_user_type;

