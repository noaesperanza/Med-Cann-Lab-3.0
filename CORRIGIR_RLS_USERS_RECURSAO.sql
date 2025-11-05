-- =====================================================
-- CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- =====================================================
-- O problema é que as políticas estão fazendo queries na tabela users
-- dentro das próprias políticas, causando recursão infinita.
-- Vamos criar uma função SECURITY DEFINER para evitar isso.

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

-- Remover políticas que causam recursão
DROP POLICY IF EXISTS "Pacientes podem ver profissionais" ON users;
DROP POLICY IF EXISTS "Profissionais podem ver seus pacientes" ON users;
DROP POLICY IF EXISTS "Profissionais podem ver outros profissionais" ON users;

-- Recriar políticas usando a função auxiliar (sem recursão)
CREATE POLICY "Pacientes podem ver profissionais"
  ON users
  FOR SELECT
  USING (
    get_current_user_type() = 'patient'
    AND users.type IN ('professional', 'admin')
  );

CREATE POLICY "Profissionais podem ver seus pacientes"
  ON users
  FOR SELECT
  USING (
    get_current_user_type() IN ('professional', 'admin')
    AND users.type = 'patient'
    AND (
      EXISTS (
        SELECT 1 FROM private_chats
        WHERE (private_chats.doctor_id = auth.uid() AND private_chats.patient_id = users.id)
           OR (private_chats.patient_id = auth.uid() AND private_chats.doctor_id = users.id)
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

CREATE POLICY "Profissionais podem ver outros profissionais"
  ON users
  FOR SELECT
  USING (
    get_current_user_type() IN ('professional', 'admin')
    AND users.type IN ('professional', 'admin')
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

