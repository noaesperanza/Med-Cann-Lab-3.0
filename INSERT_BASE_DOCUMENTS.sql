-- Inserir documentos da biblioteca na tabela documents
-- Execute este script no Supabase SQL Editor

INSERT INTO documents (title, category, type, size, author, upload_date, downloads, rating, tags, is_linked_to_ai)
VALUES 
-- Documento 1: Metodologia AEC
(
  'Metodologia AEC - Arte da Entrevista Clínica',
  'methodology',
  'pdf',
  '2.4 MB',
  'Dr. Eduardo Faveret',
  '2025-01-10',
  1247,
  4.9,
  ARRAY['AEC', 'Entrevista', 'Humanização'],
  true
),

-- Documento 2: Protocolo IMRE
(
  'Protocolo de Avaliação IMRE Triaxial',
  'protocols',
  'pdf',
  '1.8 MB',
  'Dra. Maria Santos',
  '2025-01-08',
  892,
  4.8,
  ARRAY['IMRE', 'Avaliação', 'Protocolo'],
  true
),

-- Documento 3: Cannabis Medicinal
(
  'Cannabis Medicinal - Evidências Científicas',
  'research',
  'pdf',
  '3.2 MB',
  'Dr. Carlos Oliveira',
  '2025-01-05',
  634,
  4.7,
  ARRAY['Cannabis', 'Pesquisa', 'Evidências'],
  false
),

-- Documento 4: Aula de Entrevista Clínica
(
  'Aula 1: Introdução à Entrevista Clínica',
  'methodology',
  'video',
  '45 MB',
  'Dra. Ana Costa',
  '2025-01-03',
  456,
  4.6,
  ARRAY['Vídeo', 'Aula', 'Entrevista'],
  true
),

-- Documento 5: Diretrizes ANVISA
(
  'Diretrizes de Prescrição de Cannabis',
  'guidelines',
  'pdf',
  '1.5 MB',
  'ANVISA',
  '2024-12-31',
  789,
  4.9,
  ARRAY['Diretrizes', 'Cannabis', 'ANVISA'],
  true
),

-- Documento 6: Atlas de Anatomia Renal
(
  'Atlas de Anatomia Renal',
  'research',
  'image',
  '8.7 MB',
  'Dr. Pedro Lima',
  '2024-12-27',
  234,
  4.5,
  ARRAY['Anatomia', 'Rim', 'Atlas'],
  false
);

-- Verificar se os documentos foram inseridos
SELECT 
  id, 
  title, 
  category, 
  type, 
  author, 
  is_linked_to_ai,
  upload_date
FROM documents
ORDER BY upload_date DESC;
