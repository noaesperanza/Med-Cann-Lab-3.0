-- Script para limpar dados de teste do sistema
-- Execute este script no Supabase SQL Editor

-- 1. Verificar dados existentes
SELECT 
  id,
  patient_id,
  doctor_id,
  data->>'name' as patient_name,
  data->>'cpf' as patient_cpf,
  created_at
FROM clinical_assessments 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Remover dados de teste (se existirem)
-- CUIDADO: Execute apenas se quiser remover TODOS os dados
-- DELETE FROM clinical_assessments WHERE data->>'name' = 'Dr. Ricardo Valença';

-- 3. Verificar se há dados do Dr. Ricardo como paciente
SELECT 
  id,
  patient_id,
  doctor_id,
  data->>'name' as patient_name,
  data->>'cpf' as patient_cpf,
  data->>'email' as patient_email,
  created_at
FROM clinical_assessments 
WHERE data->>'name' LIKE '%Ricardo%' 
   OR data->>'email' LIKE '%ricardo%'
   OR data->>'cpf' LIKE '%123%'
ORDER BY created_at DESC;

-- 4. Se quiser remover especificamente os dados do Dr. Ricardo como paciente:
-- DELETE FROM clinical_assessments 
-- WHERE data->>'name' = 'Dr. Ricardo Valença' 
--    OR data->>'email' = 'rrvalenca@gmail.com'
--    OR data->>'cpf' = '12345678901';

-- 5. Verificar dados restantes
SELECT COUNT(*) as total_assessments FROM clinical_assessments;
