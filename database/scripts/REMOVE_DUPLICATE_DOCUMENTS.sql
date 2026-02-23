-- Remover documentos duplicados da tabela documents
-- Mantém apenas o documento mais recente de cada título

DELETE FROM documents
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as row_num
    FROM documents
  ) ranked
  WHERE row_num > 1
);

-- Verificar resultado
SELECT 
  title,
  COUNT(*) as duplicates_count
FROM documents
GROUP BY title
HAVING COUNT(*) > 1;
