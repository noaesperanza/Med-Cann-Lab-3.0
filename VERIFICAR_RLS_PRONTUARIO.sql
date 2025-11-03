-- =====================================================
-- VERIFICAR POLÍTICAS RLS PARA PRONTUÁRIO
-- Garantir que chat pode salvar automaticamente
-- =====================================================

-- 1. VERIFICAR SE patient_medical_records TEM RLS HABILITADO
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'patient_medical_records';

-- 2. VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'patient_medical_records'
ORDER BY policyname;

-- 3. VERIFICAR SE PRECISA DE POLÍTICA PARA INSERT
-- Se não houver política de INSERT, precisa criar

-- 4. VERIFICAR SE PRECISA DE POLÍTICA PARA IA INSERIR
-- A IA deve poder inserir registros quando o usuário está autenticado

-- 5. CRIAR POLÍTICAS SE NECESSÁRIO
DO $$
BEGIN
  -- Política para pacientes inserirem seus próprios registros
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patient_medical_records' 
    AND policyname = 'Patients can insert own medical records'
  ) THEN
    CREATE POLICY "Patients can insert own medical records" ON patient_medical_records
      FOR INSERT 
      WITH CHECK (auth.uid() = patient_id);
    
    RAISE NOTICE '✅ Política de INSERT criada para pacientes';
  ELSE
    RAISE NOTICE '✅ Política de INSERT já existe';
  END IF;

  -- Política para profissionais inserirem registros de pacientes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patient_medical_records' 
    AND policyname = 'Professionals can insert patient records'
  ) THEN
    CREATE POLICY "Professionals can insert patient records" ON patient_medical_records
      FOR INSERT 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM clinical_reports 
          WHERE clinical_reports.patient_id = patient_medical_records.patient_id
          AND clinical_reports.professional_id = auth.uid()
        )
      );
    
    RAISE NOTICE '✅ Política de INSERT criada para profissionais';
  ELSE
    RAISE NOTICE '✅ Política de INSERT já existe';
  END IF;
END $$;

-- 6. VERIFICAR clinical_assessments
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'clinical_assessments';

SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'clinical_assessments'
ORDER BY policyname;

-- 7. CRIAR POLÍTICA DE INSERT PARA clinical_assessments SE NECESSÁRIO
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clinical_assessments' 
    AND policyname = 'Patients can insert own assessments'
  ) THEN
    CREATE POLICY "Patients can insert own assessments" ON clinical_assessments
      FOR INSERT 
      WITH CHECK (auth.uid() = patient_id);
    
    RAISE NOTICE '✅ Política de INSERT criada para clinical_assessments (pacientes)';
  ELSE
    RAISE NOTICE '✅ Política de INSERT já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clinical_assessments' 
    AND policyname = 'Patients can update own assessments'
  ) THEN
    CREATE POLICY "Patients can update own assessments" ON clinical_assessments
      FOR UPDATE 
      USING (auth.uid() = patient_id)
      WITH CHECK (auth.uid() = patient_id);
    
    RAISE NOTICE '✅ Política de UPDATE criada para clinical_assessments (pacientes)';
  ELSE
    RAISE NOTICE '✅ Política de UPDATE já existe';
  END IF;
END $$;

-- 8. RESUMO FINAL
SELECT 
  'Resumo RLS Prontuário' AS verificacao,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'patient_medical_records') AS politicas_medical_records,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clinical_assessments') AS politicas_assessments,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clinical_reports') AS politicas_reports;

