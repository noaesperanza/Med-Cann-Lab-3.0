-- =====================================================
-- CORRIGIR POLÍTICAS RLS FINAL - SEM RECURSÃO
-- =====================================================
-- Apenas dois profissionais médicos na plataforma:
-- - Dr. Ricardo Valença (rrvalenca@gmail.com)
-- - Dr. Eduardo Faveret (eduardoscfaveret@gmail.com)
--
-- SOLUÇÃO: Usar funções SECURITY DEFINER que não passam pelas políticas RLS
-- Mantém identificação por ID (auth.uid()) e tipo de usuário para a IA

-- =====================================================
-- PARTE 1: Criar funções SECURITY DEFINER primeiro
-- =====================================================

-- Função para obter o email do usuário atual (sem passar por RLS)
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

-- Função para obter o tipo do usuário atual (sem passar por RLS)
-- IMPORTANTE: Esta função é usada pela IA para identificar o tipo de usuário
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

-- Função para verificar se é um dos profissionais autorizados
-- Usa email como identificador adicional, mas mantém verificação por tipo
CREATE OR REPLACE FUNCTION is_authorized_professional()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_email TEXT;
  user_type TEXT;
BEGIN
  SELECT email, type INTO user_email, user_type
  FROM users
  WHERE id = auth.uid();
  
  -- Verificar se é profissional ou admin E se está na lista autorizada
  RETURN (user_type IN ('professional', 'admin') 
          AND user_email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com'));
END;
$$;

-- =====================================================
-- PARTE 2: Remover políticas antigas
-- =====================================================

DROP POLICY IF EXISTS "Pacientes podem ver profissionais" ON users;
DROP POLICY IF EXISTS "Pacientes podem ver profissionais autorizados" ON users;
DROP POLICY IF EXISTS "Profissionais podem ver seus pacientes" ON users;
DROP POLICY IF EXISTS "Profissionais autorizados podem ver seus pacientes" ON users;
DROP POLICY IF EXISTS "Profissionais podem ver outros profissionais" ON users;
DROP POLICY IF EXISTS "Profissionais autorizados podem ver outros profissionais" ON users;

-- =====================================================
-- PARTE 3: Criar novas políticas usando funções SECURITY DEFINER
-- =====================================================

-- 1. Usuários podem ver seu próprio perfil
-- Esta política permite que a IA identifique o usuário atual pelo ID
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Pacientes podem ver apenas os dois profissionais autorizados
-- Usa get_current_user_type() para identificar que é paciente
-- IMPORTANTE: A IA precisa saber que o usuário é paciente
CREATE POLICY "Pacientes podem ver profissionais autorizados"
  ON users
  FOR SELECT
  USING (
    -- Verificar tipo de usuário usando função SECURITY DEFINER (sem recursão)
    get_current_user_type() = 'patient'
    -- E mostrar apenas os dois profissionais autorizados (verificação por email + tipo)
    AND (
      (users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com') 
       AND users.type IN ('professional', 'admin'))
      OR users.type = 'admin'
    )
  );

-- 3. Profissionais autorizados podem ver pacientes com relacionamento
-- Usa is_authorized_professional() que verifica tipo E email
CREATE POLICY "Profissionais autorizados podem ver seus pacientes"
  ON users
  FOR SELECT
  USING (
    -- Verificar se é profissional autorizado (tipo + email)
    is_authorized_professional()
    -- E o usuário sendo consultado é paciente (verificação de tipo importante para IA)
    AND users.type = 'patient'
    -- E existe relacionamento (chat, avaliação ou relatório)
    AND (
      EXISTS (
        SELECT 1 FROM private_chats
        WHERE private_chats.doctor_id = auth.uid() 
        AND private_chats.patient_id = users.id
      )
      OR EXISTS (
        SELECT 1 FROM clinical_assessments
        WHERE clinical_assessments.doctor_id = auth.uid()
        AND clinical_assessments.patient_id = users.id
      )
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
-- Mantém verificação de tipo para IA
CREATE POLICY "Profissionais autorizados podem ver outros profissionais"
  ON users
  FOR SELECT
  USING (
    -- Verificar se é profissional autorizado (tipo + email)
    is_authorized_professional()
    -- E o usuário sendo consultado também é profissional ou admin (tipo importante)
    AND users.type IN ('professional', 'admin')
    -- E está na lista autorizada (email + tipo)
    AND (
      users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
      OR users.type = 'admin'
    )
    AND users.id != auth.uid()
  );

-- 5. Alunos podem ver profissionais (para aprendizado)
-- IMPORTANTE: A IA precisa saber que o usuário é aluno
DROP POLICY IF EXISTS "Alunos podem ver profissionais" ON users;
CREATE POLICY "Alunos podem ver profissionais"
  ON users
  FOR SELECT
  USING (
    -- Verificar tipo de usuário (importante para IA identificar aluno)
    get_current_user_type() = 'student'
    -- E mostrar apenas profissionais autorizados
    AND (
      (users.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com') 
       AND users.type IN ('professional', 'admin'))
      OR users.type = 'admin'
    )
  );

-- =====================================================
-- PARTE 4: Verificar se as políticas foram criadas
-- =====================================================

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
