-- =====================================================
-- VERIFICAÇÃO ESPECÍFICA: ESTRUTURA DE TABELAS DE PACIENTES
-- Focado nas tabelas necessárias para Chat ↔ Prontuário
-- =====================================================

-- 1. VERIFICAR SE TODAS AS TABELAS NECESSÁRIAS EXISTEM
SELECT 
  'Status das Tabelas' AS verificacao,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'patient_medical_records'
  ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS patient_medical_records,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'clinical_assessments'
  ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS clinical_assessments,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'clinical_reports'
  ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS clinical_reports,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'professional_medical_records'
  ) THEN '✅ EXISTE' ELSE '❌ NÃO EXISTE' END AS professional_medical_records;

-- 2. ESTRUTURA COMPLETA DA TABELA clinical_reports
SELECT 
  'clinical_reports - Estrutura' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clinical_reports'
ORDER BY ordinal_position;

-- 3. ESTRUTURA COMPLETA DA TABELA patient_medical_records (se existir)
SELECT 
  'patient_medical_records - Estrutura' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patient_medical_records'
ORDER BY ordinal_position;

-- Se não retornar nada, significa que a tabela não existe
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'patient_medical_records'
    ) THEN '❌ Tabela patient_medical_records NÃO EXISTE - precisa ser criada'
    ELSE '✅ Tabela patient_medical_records existe'
  END AS status_patient_medical_records;

-- 4. ESTRUTURA COMPLETA DA TABELA clinical_assessments (se existir)
SELECT 
  'clinical_assessments - Estrutura' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clinical_assessments'
ORDER BY ordinal_position;

-- Se não retornar nada, significa que a tabela não existe
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'clinical_assessments'
    ) THEN '❌ Tabela clinical_assessments NÃO EXISTE - precisa ser criada'
    ELSE '✅ Tabela clinical_assessments existe'
  END AS status_clinical_assessments;

-- 5. POLÍTICAS RLS PARA clinical_reports
SELECT 
  'clinical_reports - RLS' AS tabela,
  policyname,
  permissive,
  roles,
  cmd as operacao,
  qual as condicao_using,
  with_check as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'clinical_reports'
ORDER BY policyname;

-- 6. POLÍTICAS RLS PARA patient_medical_records (se existir)
SELECT 
  'patient_medical_records - RLS' AS tabela,
  policyname,
  permissive,
  roles,
  cmd as operacao,
  qual as condicao_using,
  with_check as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'patient_medical_records'
ORDER BY policyname;

-- 7. POLÍTICAS RLS PARA clinical_assessments (se existir)
SELECT 
  'clinical_assessments - RLS' AS tabela,
  policyname,
  permissive,
  roles,
  cmd as operacao,
  qual as condicao_using,
  with_check as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'clinical_assessments'
ORDER BY policyname;

-- 8. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
  'Status RLS' AS verificacao,
  tablename,
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END AS status_rls
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clinical_reports', 'patient_medical_records', 'clinical_assessments')
ORDER BY tablename;

-- 9. VERIFICAR RELACIONAMENTOS (FOREIGN KEYS)
SELECT 
  'Relacionamentos' AS verificacao,
  tc.table_name AS tabela_origem,
  kcu.column_name AS coluna_origem,
  ccu.table_name AS tabela_destino,
  ccu.column_name AS coluna_destino
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('clinical_reports', 'patient_medical_records', 'clinical_assessments')
ORDER BY tc.table_name, kcu.column_name;

-- 10. VERIFICAR DADOS EXISTENTES (contagem) - usando EXECUTE dinâmico
DO $$
DECLARE
  total_reports INTEGER := 0;
  total_patient_records INTEGER := 0;
  total_assessments INTEGER := 0;
  query_text TEXT;
BEGIN
  -- Contar clinical_reports
  BEGIN
    SELECT COUNT(*) INTO total_reports FROM clinical_reports;
  EXCEPTION WHEN OTHERS THEN
    total_reports := 0;
  END;

  -- Contar patient_medical_records se existir (usando EXECUTE dinâmico)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'patient_medical_records'
  ) THEN
    BEGIN
      query_text := 'SELECT COUNT(*) FROM patient_medical_records';
      EXECUTE query_text INTO total_patient_records;
    EXCEPTION WHEN OTHERS THEN
      total_patient_records := 0;
    END;
  ELSE
    total_patient_records := 0;
  END IF;

  -- Contar clinical_assessments se existir (usando EXECUTE dinâmico)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'clinical_assessments'
  ) THEN
    BEGIN
      query_text := 'SELECT COUNT(*) FROM clinical_assessments';
      EXECUTE query_text INTO total_assessments;
    EXCEPTION WHEN OTHERS THEN
      total_assessments := 0;
    END;
  ELSE
    total_assessments := 0;
  END IF;

  -- Retornar resultados
  RAISE NOTICE 'Dados Existentes:';
  RAISE NOTICE '  clinical_reports: %', total_reports;
  RAISE NOTICE '  patient_medical_records: % (tabela % existe)', 
    total_patient_records,
    CASE WHEN total_patient_records >= 0 THEN 'sim' ELSE 'não' END;
  RAISE NOTICE '  clinical_assessments: % (tabela % existe)', 
    total_assessments,
    CASE WHEN total_assessments >= 0 THEN 'sim' ELSE 'não' END;
END $$;

-- 10.1. VERIFICAR DADOS EXISTENTES (versão SELECT - apenas clinical_reports que sabemos que existe)
SELECT 
  'Dados Existentes' AS verificacao,
  (SELECT COUNT(*) FROM clinical_reports) AS total_clinical_reports,
  0 AS total_patient_medical_records,
  0 AS total_clinical_assessments;

