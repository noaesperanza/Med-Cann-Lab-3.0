-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA TABELA USERS
-- =====================================================
-- Este script cria políticas RLS restritivas baseadas em relacionamentos:
-- - Pacientes podem ver apenas profissionais (para seleção no chat)
-- - Profissionais podem ver apenas seus pacientes (com chat ou compartilhamento)
-- - Usuários podem ver seu próprio perfil
-- - Não há acesso indiscriminado a dados de outros usuários

-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover política muito permissiva que criamos antes
DROP POLICY IF EXISTS "Usuários autenticados podem ver outros usuários" ON users;

-- 1. Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Pacientes podem ver profissionais e admins (para seleção no chat)
DROP POLICY IF EXISTS "Pacientes podem ver profissionais" ON users;
CREATE POLICY "Pacientes podem ver profissionais"
  ON users
  FOR SELECT
  USING (
    -- Verificar se o usuário atual é paciente verificando diretamente
    (SELECT type FROM users WHERE id = auth.uid()) = 'patient'
    -- E o usuário sendo consultado é profissional ou admin
    AND users.type IN ('professional', 'admin')
  );

-- 3. Profissionais podem ver pacientes com quem têm chat ou compartilhamento
DROP POLICY IF EXISTS "Profissionais podem ver seus pacientes" ON users;
CREATE POLICY "Profissionais podem ver seus pacientes"
  ON users
  FOR SELECT
  USING (
    -- Verificar se o usuário atual é profissional ou admin
    (SELECT type FROM users WHERE id = auth.uid()) IN ('professional', 'admin')
    -- E o usuário sendo consultado é paciente
    AND users.type = 'patient'
    -- E existe um chat ou compartilhamento entre eles
    AND (
      -- Existe chat entre profissional e paciente
      EXISTS (
        SELECT 1 FROM private_chats
        WHERE (private_chats.doctor_id = auth.uid() AND private_chats.patient_id = users.id)
           OR (private_chats.patient_id = auth.uid() AND private_chats.doctor_id = users.id)
      )
      -- OU existe compartilhamento de relatório ou avaliação
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

-- 4. Profissionais podem ver outros profissionais (para colaboração)
DROP POLICY IF EXISTS "Profissionais podem ver outros profissionais" ON users;
CREATE POLICY "Profissionais podem ver outros profissionais"
  ON users
  FOR SELECT
  USING (
    -- Verificar se o usuário atual é profissional ou admin
    (SELECT type FROM users WHERE id = auth.uid()) IN ('professional', 'admin')
    -- E o usuário sendo consultado também é profissional ou admin
    AND users.type IN ('professional', 'admin')
    AND users.id != auth.uid()
  );

-- 5. Permitir que usuários atualizem seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- 6. Permitir que usuários criem seu próprio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verificar se as políticas foram criadas
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
