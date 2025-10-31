-- =====================================================
-- ADICIONAR COLUNA CLINICAL_REPORT
-- =====================================================
-- Adiciona a coluna clinical_report se ela não existir

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'clinical_assessments' 
    AND column_name = 'clinical_report'
  ) THEN
    ALTER TABLE clinical_assessments ADD COLUMN clinical_report TEXT;
    RAISE NOTICE 'Coluna clinical_report adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna clinical_report já existe.';
  END IF;
END $$;
