-- =====================================================
-- VERIFICAÇÃO COMPLETA: ESTRUTURA DE REGISTROS DE PACIENTES
-- Antes de fazer alterações, verificar o que já existe
-- =====================================================

-- 1. VERIFICAR TODAS AS TABELAS RELACIONADAS A PACIENTES
SELECT 
  'Tabelas relacionadas a pacientes' AS secao,
  table_name,
  CASE 
    WHEN table_name ILIKE '%patient%' THEN '🎯 Paciente'
    WHEN table_name ILIKE '%medical%' OR table_name ILIKE '%clinical%' THEN '🏥 Clínico'
    WHEN table_name ILIKE '%record%' OR table_name ILIKE '%report%' THEN '📋 Registro'
    WHEN table_name ILIKE '%assessment%' OR table_name ILIKE '%imre%' THEN '📊 Avaliação'
    WHEN table_name ILIKE '%chat%' OR table_name ILIKE '%message%' THEN '💬 Comunicação'
    WHEN table_name ILIKE '%interaction%' THEN '🔄 Interação'
    ELSE '📌 Outro'
  END AS categoria
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name ILIKE '%patient%' OR
  table_name ILIKE '%medical%' OR
  table_name ILIKE '%clinical%' OR
  table_name ILIKE '%record%' OR
  table_name ILIKE '%report%' OR
  table_name ILIKE '%assessment%' OR
  table_name ILIKE '%imre%' OR
  table_name ILIKE '%chat%' OR
  table_name ILIKE '%message%' OR
  table_name ILIKE '%interaction%'
)
ORDER BY categoria, table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA patient_medical_records (se existir)
SELECT 
  'patient_medical_records' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  CASE 
    WHEN column_name ILIKE '%id%' THEN '🔑 ID'
    WHEN column_name ILIKE '%patient%' THEN '👤 Paciente'
    WHEN column_name ILIKE '%record%' THEN '📝 Registro'
    WHEN column_name ILIKE '%data%' OR column_name ILIKE '%content%' THEN '📦 Dados'
    WHEN column_name ILIKE '%type%' THEN '🏷️ Tipo'
    WHEN column_name ILIKE '%created%' OR column_name ILIKE '%updated%' THEN '📅 Timestamp'
    ELSE '📋 Outro'
  END AS categoria_coluna
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patient_medical_records'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA clinical_assessments (se existir)
SELECT 
  'clinical_assessments' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name ILIKE '%id%' THEN '🔑 ID'
    WHEN column_name ILIKE '%patient%' OR column_name ILIKE '%doctor%' THEN '👤 Usuário'
    WHEN column_name ILIKE '%assessment%' THEN '📊 Avaliação'
    WHEN column_name ILIKE '%data%' OR column_name ILIKE '%report%' THEN '📦 Dados'
    WHEN column_name ILIKE '%status%' THEN '✅ Status'
    WHEN column_name ILIKE '%created%' OR column_name ILIKE '%updated%' THEN '📅 Timestamp'
    ELSE '📋 Outro'
  END AS categoria_coluna
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clinical_assessments'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA clinical_reports (se existir)
SELECT 
  'clinical_reports' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name ILIKE '%id%' THEN '🔑 ID'
    WHEN column_name ILIKE '%patient%' OR column_name ILIKE '%professional%' THEN '👤 Usuário'
    WHEN column_name ILIKE '%report%' OR column_name ILIKE '%content%' THEN '📋 Relatório'
    WHEN column_name ILIKE '%generated%' THEN '🤖 Geração'
    WHEN column_name ILIKE '%status%' THEN '✅ Status'
    WHEN column_name ILIKE '%created%' OR column_name ILIKE '%updated%' THEN '📅 Timestamp'
    ELSE '📋 Outro'
  END AS categoria_coluna
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clinical_reports'
ORDER BY ordinal_position;

-- 5. VERIFICAR ESTRUTURA DA TABELA professional_medical_records (se existir)
SELECT 
  'professional_medical_records' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'professional_medical_records'
ORDER BY ordinal_position;

-- 6. VERIFICAR ESTRUTURA DA TABELA imre_assessments (se existir)
SELECT 
  'imre_assessments' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'imre_assessments'
ORDER BY ordinal_position;

-- 7. VERIFICAR ESTRUTURA DA TABELA user_interactions (se existir)
SELECT 
  'user_interactions' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_interactions'
ORDER BY ordinal_position;

-- 8. VERIFICAR ESTRUTURA DA TABELA chat_messages (se existir)
SELECT 
  'chat_messages' AS tabela,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- 9. VERIFICAR POLÍTICAS RLS EXISTENTES PARA TABELAS DE PACIENTES
SELECT 
  'Políticas RLS' AS secao,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operacao,
  qual as condicao_using,
  with_check as condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
AND (
  tablename ILIKE '%patient%' OR
  tablename ILIKE '%medical%' OR
  tablename ILIKE '%clinical%' OR
  tablename ILIKE '%record%' OR
  tablename ILIKE '%report%' OR
  tablename ILIKE '%assessment%' OR
  tablename ILIKE '%imre%' OR
  tablename ILIKE '%chat%' OR
  tablename ILIKE '%message%' OR
  tablename ILIKE '%interaction%'
)
ORDER BY tablename, policyname;

-- 10. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
  'Status RLS' AS secao,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ Habilitado'
    ELSE '❌ Desabilitado'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
AND (
  tablename ILIKE '%patient%' OR
  tablename ILIKE '%medical%' OR
  tablename ILIKE '%clinical%' OR
  tablename ILIKE '%record%' OR
  tablename ILIKE '%report%' OR
  tablename ILIKE '%assessment%' OR
  tablename ILIKE '%imre%'
)
ORDER BY tablename;

-- 11. VERIFICAR ÍNDICES NAS TABELAS DE PACIENTES
SELECT 
  'Índices' AS secao,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (
  tablename ILIKE '%patient%' OR
  tablename ILIKE '%medical%' OR
  tablename ILIKE '%clinical%' OR
  tablename ILIKE '%record%' OR
  tablename ILIKE '%report%' OR
  tablename ILIKE '%assessment%' OR
  tablename ILIKE '%imre%'
)
ORDER BY tablename, indexname;

-- 12. VERIFICAR FOREIGN KEYS (RELACIONAMENTOS)
SELECT
  'Relacionamentos (FK)' AS secao,
  tc.table_name AS tabela_origem,
  kcu.column_name AS coluna_origem,
  ccu.table_name AS tabela_destino,
  ccu.column_name AS coluna_destino,
  tc.constraint_name AS nome_constraint
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND (
  tc.table_name ILIKE '%patient%' OR
  tc.table_name ILIKE '%medical%' OR
  tc.table_name ILIKE '%clinical%' OR
  tc.table_name ILIKE '%record%' OR
  tc.table_name ILIKE '%report%' OR
  tc.table_name ILIKE '%assessment%' OR
  tc.table_name ILIKE '%imre%'
)
ORDER BY tc.table_name, kcu.column_name;

-- 13. RESUMO DE TABELAS EXISTENTES
SELECT 
  'RESUMO GERAL' AS secao,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name ILIKE '%patient%') AS tabelas_patient,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name ILIKE '%medical%') AS tabelas_medical,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name ILIKE '%clinical%') AS tabelas_clinical,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name ILIKE '%record%') AS tabelas_record,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name ILIKE '%report%') AS tabelas_report,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name ILIKE '%assessment%') AS tabelas_assessment;

-- 14. VERIFICAR SE patient_medical_records EXISTE
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'patient_medical_records'
    ) THEN '✅ Tabela patient_medical_records EXISTE'
    ELSE '❌ Tabela patient_medical_records NÃO EXISTE'
  END AS status_patient_medical_records;

-- 15. VERIFICAR SE clinical_assessments EXISTE
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'clinical_assessments'
    ) THEN '✅ Tabela clinical_assessments EXISTE'
    ELSE '❌ Tabela clinical_assessments NÃO EXISTE'
  END AS status_clinical_assessments;

-- 16. VERIFICAR SE clinical_reports EXISTE
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'clinical_reports'
    ) THEN '✅ Tabela clinical_reports EXISTE'
    ELSE '❌ Tabela clinical_reports NÃO EXISTE'
  END AS status_clinical_reports;

