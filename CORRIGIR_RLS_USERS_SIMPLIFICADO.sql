-- =====================================================
-- CORRIGIR POLÍTICAS RLS SIMPLIFICADAS PARA PROFISSIONAIS ESPECÍFICOS
-- =====================================================
-- Apenas dois profissionais médicos na plataforma:
-- - Dr. Ricardo Valença (rrvalenca@gmail.com)
-- - Dr. Eduardo Faveret (eduardoscfaveret@gmail.com)

-- Criar função auxiliar que retorna o tipo do usuário atual
-- SECURITY DEFINER permite que a função execute com privilégios do criador
CREATE OR REPLACE FUNCTION get_current_user_type()
RETURNS TEXT
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
  
  RETURN user_type;
END;
$$;

-- Remover políticas antigas que causam recursão
DROP POLICY IF EXISTS "Pacientes podem ver profissionais" ON users;
DROP POLICY IF EXISTS "Profissionais podem ver seus pacientes" ON users;
DROP POLICY IF EXISTS "Profissionais podem ver outros profissionais" ON users;

-- 1. Usuários podem ver seu próprio perfil (manter existente)
-- Esta política já deve existir, mas vamos garantir
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Pacientes podem ver apenas os dois profissionais autorizados
CREATE POLICY "Pacientes podem ver profissionais autorizados"
  ON users
  FOR SELECT
  USING (
    get_current_user_type() = 'patient'
    AND (
      -- Apenas os dois profissionais autorizados
      users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
      OR users.type = 'admin'
    )
  );

-- 3. Profissionais autorizados podem ver pacientes com quem têm relacionamento
-- Criar função SECURITY DEFINER para obter email do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM users
  WHERE id = auth.uid();
  
  RETURN user_email;
END;
$$;

CREATE POLICY "Profissionais autorizados podem ver seus pacientes"
  ON users
  FOR SELECT
  USING (
    -- Verificar se é um dos profissionais autorizados usando função SECURITY DEFINER
    get_current_user_email() IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
    AND users.type = 'patient'
    AND (
      -- Existe chat entre profissional e paciente
      EXISTS (
        SELECT 1 FROM private_chats
        WHERE private_chats.doctor_id = auth.uid() 
        AND private_chats.patient_id = users.id
      )
      -- OU existe compartilhamento de avaliação
      OR EXISTS (
        SELECT 1 FROM clinical_assessments
        WHERE clinical_assessments.doctor_id = auth.uid()
        AND clinical_assessments.patient_id = users.id
      )
      -- OU existe relatório compartilhado
      OR EXISTS (
        SELECT 1 FROM clinical_reports
        WHERE clinical_reports.patient_id = users.id
        AND EXISTS (
          SELECT 1 FROM clinical_assessments
          WHERE clinical_assessments.patient_id = clinical_reports.patient_id
          AND clinical_assessments.doctor_id = auth.uid()
        )
      )
    )
  );

-- 4. Profissionais autorizados podem ver outros profissionais autorizados
CREATE POLICY "Profissionais autorizados podem ver outros profissionais"
  ON users
  FOR SELECT
  USING (
    -- Verificar se é um dos profissionais autorizados usando função SECURITY DEFINER
    get_current_user_email() IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
    AND (
      users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
      OR users.type = 'admin'
    )
    AND users.id != auth.uid()
  );

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

