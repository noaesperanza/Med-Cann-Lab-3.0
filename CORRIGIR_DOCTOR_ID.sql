-- =====================================================
-- CORRIGIR DOCTOR_ID DAS AVALIAÇÕES
-- =====================================================

BEGIN;

-- Atualizar todas as avaliações para usar o ID correto do Dr. Ricardo Valença
UPDATE clinical_assessments
SET doctor_id = '3d6b170c-9b36-4e0d-8364-1e9c5131cb17'
WHERE doctor_id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';

COMMIT;

-- Verificar o resultado
SELECT 
  'Avaliações atualizadas' as status,
  COUNT(*) as total
FROM clinical_assessments
WHERE doctor_id = '3d6b170c-9b36-4e0d-8364-1e9c5131cb17';

-- Mostrar todas as avaliações
SELECT id, patient_id, doctor_id, status, created_at
FROM clinical_assessments
ORDER BY created_at DESC;
