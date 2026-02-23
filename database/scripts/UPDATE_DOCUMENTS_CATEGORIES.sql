-- Atualizar documentos existentes com categorias baseadas nos títulos e keywords

-- 1. Atlas de Anatomia Renal - Multimidia (imagem)
UPDATE documents 
SET 
  category = 'multimedia',
  tags = ARRAY['atlas', 'anatomia', 'imagem', 'multimedia'],
  "isLinkedToAI" = false
WHERE title ILIKE '%Atlas%Anatomia%' OR 
      (keywords IS NOT NULL AND ('Anatomia' = ANY(keywords) OR 'Rim' = ANY(keywords)));

-- 2. Metodologia AEC - Protocolos
UPDATE documents 
SET 
  category = 'protocols',
  tags = ARRAY['aec', 'entrevista', 'metodologia', 'protocolo'],
  "isLinkedToAI" = false
WHERE title ILIKE '%AEC%' OR 
      (keywords IS NOT NULL AND 'AEC' = ANY(keywords));

-- 3. Protocolo IMRE - Protocolos
UPDATE documents 
SET 
  category = 'protocols',
  tags = ARRAY['imre', 'protocolo', 'avaliação', 'triaxial'],
  "isLinkedToAI" = false
WHERE title ILIKE '%IMRE%' OR 
      (keywords IS NOT NULL AND 'IMRE' = ANY(keywords));

-- 4. Cannabis Evidencias - Pesquisa
UPDATE documents 
SET 
  category = 'research',
  tags = ARRAY['cannabis', 'pesquisa', 'evidências', 'científicas'],
  "isLinkedToAI" = false
WHERE (keywords IS NOT NULL AND ('Pesquisa' = ANY(keywords) OR 'Evidências' = ANY(keywords))) OR
      title ILIKE '%Evidências%';

-- 5. Aula 1 - Multimidia (video)
UPDATE documents 
SET 
  category = 'multimedia',
  tags = ARRAY['vídeo', 'aula', 'educação', 'multimedia'],
  "isLinkedToAI" = false
WHERE (keywords IS NOT NULL AND ('Vídeo' = ANY(keywords) OR 'Aula' = ANY(keywords))) OR
      title ILIKE '%Aula%';

-- 6. Diretrizes Cannabis - Protocolos
UPDATE documents 
SET 
  category = 'protocols',
  tags = ARRAY['diretrizes', 'cannabis', 'prescrição', 'protocolo'],
  "isLinkedToAI" = false
WHERE title ILIKE '%Diretrizes%';

-- Verificar se há documentos sem categoria (deixar como 'research' por padrão)
UPDATE documents 
SET category = 'research'
WHERE category IS NULL OR category = '';

-- Verificar se há documentos sem tags (criar array vazio)
UPDATE documents 
SET tags = ARRAY[]::text[]
WHERE tags IS NULL;

-- Mostrar resultados
SELECT 
  id,
  title,
  category,
  tags,
  keywords,
  "isLinkedToAI"
FROM documents
ORDER BY created_at DESC;
