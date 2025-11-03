-- =====================================================
-- TESTAR INTEGRAÇÃO CHAT ↔ PRONTUÁRIO
-- Verificar se o salvamento automático está funcionando
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
  'Estrutura patient_medical_records' AS verificacao,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patient_medical_records'
ORDER BY ordinal_position;

SELECT 
  'Estrutura clinical_assessments' AS verificacao,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'clinical_assessments'
ORDER BY ordinal_position;

-- 2. VERIFICAR POLÍTICAS RLS
SELECT 
  'Políticas RLS patient_medical_records' AS verificacao,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'patient_medical_records' AND schemaname = 'public'
ORDER BY policyname;

SELECT 
  'Políticas RLS clinical_assessments' AS verificacao,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'clinical_assessments' AND schemaname = 'public'
ORDER BY policyname;

-- 3. CONTAR DADOS EXISTENTES
SELECT 
  'Dados Existentes' AS verificacao,
  (SELECT COUNT(*) FROM patient_medical_records) AS total_interacoes,
  (SELECT COUNT(*) FROM clinical_assessments) AS total_avaliacoes,
  (SELECT COUNT(*) FROM clinical_assessments WHERE status = 'in_progress') AS avaliacoes_em_andamento,
  (SELECT COUNT(*) FROM clinical_assessments WHERE status = 'completed') AS avaliacoes_concluidas;

-- 4. VERIFICAR ÚLTIMAS INTERAÇÕES (se houver dados)
SELECT 
  'Últimas Interações' AS verificacao,
  id,
  patient_id,
  record_type,
  record_data->>'user_message' AS mensagem_usuario,
  record_data->>'ai_response' AS resposta_ia,
  record_data->>'assessment_step' AS etapa_avaliacao,
  created_at
FROM patient_medical_records
ORDER BY created_at DESC
LIMIT 5;

-- 5. VERIFICAR AVALIAÇÕES EM ANDAMENTO (se houver dados)
SELECT 
  'Avaliações em Andamento' AS verificacao,
  id,
  patient_id,
  assessment_type,
  status,
  data->>'step' AS etapa_atual,
  data->>'investigation' AS investigacao,
  created_at,
  updated_at
FROM clinical_assessments
WHERE status = 'in_progress'
ORDER BY updated_at DESC
LIMIT 5;

-- 6. VERIFICAR RELACIONAMENTO COM clinical_reports
SELECT 
  'Relacionamento com Relatórios' AS verificacao,
  pmr.id AS interacao_id,
  pmr.patient_id,
  pmr.report_id,
  CASE 
    WHEN pmr.report_id IS NOT NULL THEN '✅ Vinculado a relatório'
    ELSE '❌ Sem relatório vinculado'
  END AS status_vinculo,
  pmr.created_at
FROM patient_medical_records pmr
ORDER BY pmr.created_at DESC
LIMIT 5;

-- 7. TESTE DE INSERÇÃO SIMULADA (apenas verificação, não insere)
-- Substituir 'USER_ID_AQUI' pelo ID real do usuário para testar
SELECT 
  'Teste de Estrutura' AS verificacao,
  'Estrutura pronta para receber dados do chat' AS status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_medical_records') 
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinical_assessments')
    THEN '✅ Tabelas prontas'
    ELSE '❌ Tabelas faltando'
  END AS tabelas,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'patient_medical_records') >= 2
      AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clinical_assessments') >= 2
    THEN '✅ RLS configurado'
    ELSE '⚠️ RLS incompleto'
  END AS rls_status;

