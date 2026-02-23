-- =====================================================
-- LIMPAR POLÍTICAS DUPLICADAS DE clinical_reports
-- =====================================================
-- Remover todas as políticas antigas e criar apenas as necessárias

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "IA pode inserir relatórios" ON clinical_reports;
DROP POLICY IF EXISTS "Pacientes podem ver seus relatórios" ON clinical_reports;
DROP POLICY IF EXISTS "Pacientes veem seus relatórios" ON clinical_reports;
DROP POLICY IF EXISTS "Profissionais autorizados podem ver relatórios de seus pacientes" ON clinical_reports;
DROP POLICY IF EXISTS "Profissionais podem ver relatórios de seus pacientes" ON clinical_reports;
DROP POLICY IF EXISTS "Profissionais podem ver relatórios" ON clinical_reports;
DROP POLICY IF EXISTS "Profissionais veem todos relatórios" ON clinical_reports;

-- Criar apenas as políticas necessárias e corretas

-- 1. Pacientes podem ver seus próprios relatórios
CREATE POLICY "Pacientes podem ver seus relatórios"
  ON clinical_reports
  FOR SELECT
  USING (auth.uid() = patient_id);

-- 2. Profissionais autorizados podem ver relatórios de seus pacientes
CREATE POLICY "Profissionais autorizados podem ver relatórios de seus pacientes"
  ON clinical_reports
  FOR SELECT
  USING (
    -- Verificar se é profissional autorizado
    get_current_user_email() IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
    -- E existe relacionamento com o paciente
    AND (
      EXISTS (
        SELECT 1 FROM clinical_assessments
        WHERE clinical_assessments.patient_id = clinical_reports.patient_id
        AND clinical_assessments.doctor_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM private_chats
        WHERE private_chats.patient_id = clinical_reports.patient_id
        AND private_chats.doctor_id = auth.uid()
      )
    )
  );

-- 3. IA pode inserir relatórios (para sistema)
CREATE POLICY "IA pode inserir relatórios"
  ON clinical_reports
  FOR INSERT
  WITH CHECK (true);

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'clinical_reports'
ORDER BY policyname;

