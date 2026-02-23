-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA clinical_reports
-- =====================================================
-- Corrigir a política de clinical_reports que está bloqueando acesso

-- Remover política muito permissiva
DROP POLICY IF EXISTS "Profissionais podem ver relatórios" ON clinical_reports;

-- Recriar política correta para profissionais
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

-- Verificar se as políticas foram criadas
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

