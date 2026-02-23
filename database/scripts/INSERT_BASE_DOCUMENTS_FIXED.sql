-- Inserir documentos da biblioteca na tabela documents
-- Estrutura real: id (uuid), title, content, summary, keywords, medical_terms, etc.

-- Gerar UUIDs para os documentos
DO $$
DECLARE
    doc1_id UUID := gen_random_uuid();
    doc2_id UUID := gen_random_uuid();
    doc3_id UUID := gen_random_uuid();
    doc4_id UUID := gen_random_uuid();
    doc5_id UUID := gen_random_uuid();
    doc6_id UUID := gen_random_uuid();
BEGIN

-- Documento 1: Metodologia AEC
INSERT INTO documents (id, title, content, summary, keywords, medical_terms, file_type, file_size, created_at, updated_at)
VALUES 
(
  doc1_id,
  'Metodologia AEC - Arte da Entrevista Clínica',
  'Guia completo sobre a metodologia AEC (Arte da Entrevista Clínica) para entrevistas clínicas humanizadas. Desenvolvido pelos Drs. Ricardo Valença e Eduardo Faveret.',
  'Metodologia AEC para entrevistas clínicas humanizadas',
  ARRAY['AEC', 'Entrevista', 'Humanização', 'Metodologia', 'Clínica'],
  ARRAY['Arte da Entrevista Clínica', 'AEC', 'Entrevista Médica'],
  'pdf',
  2500000,
  NOW(),
  NOW()
),

-- Documento 2: Protocolo IMRE
(
  doc2_id,
  'Protocolo de Avaliação IMRE Triaxial',
  'Protocolo completo para avaliação clínica com sistema IMRE de 28 blocos semânticos. Metodologia de avaliação triaxial para análise clínica.',
  'Protocolo IMRE para avaliação clínica com 28 blocos semânticos',
  ARRAY['IMRE', 'Avaliação', 'Protocolo', 'Triaxial'],
  ARRAY['IMRE', 'Avaliação Clínica', 'Blocos Semânticos'],
  'pdf',
  1800000,
  NOW(),
  NOW()
),

-- Documento 3: Cannabis Medicinal
(
  doc3_id,
  'Cannabis Medicinal - Evidências Científicas',
  'Revisão sistemática das evidências científicas sobre cannabis medicinal. Análise de estudos clínicos e pesquisas sobre eficácia e segurança.',
  'Revisão de evidências científicas sobre cannabis medicinal',
  ARRAY['Cannabis', 'Pesquisa', 'Evidências', 'Medicinal'],
  ARRAY['Cannabis Medicinal', 'CBD', 'THC', 'Evidências Clínicas'],
  'pdf',
  3200000,
  NOW(),
  NOW()
),

-- Documento 4: Aula de Entrevista Clínica
(
  doc4_id,
  'Aula 1: Introdução à Entrevista Clínica',
  'Vídeo-aula introdutória sobre técnicas de entrevista clínica. Conteúdo educacional sobre comunicação médica e coleta de dados.',
  'Vídeo-aula introdutória sobre técnicas de entrevista clínica',
  ARRAY['Vídeo', 'Aula', 'Entrevista', 'Educação'],
  ARRAY['Entrevista Clínica', 'Comunicação Médica', 'Técnicas'],
  'video',
  45000000,
  NOW(),
  NOW()
),

-- Documento 5: Diretrizes ANVISA
(
  doc5_id,
  'Diretrizes de Prescrição de Cannabis',
  'Diretrizes atualizadas da ANVISA para prescrição de cannabis medicinal. Normativas e regulamentações sobre uso medicinal da cannabis.',
  'Diretrizes da ANVISA para prescrição de cannabis medicinal',
  ARRAY['Diretrizes', 'Cannabis', 'ANVISA', 'Prescrição'],
  ARRAY['Cannabis Medicinal', 'ANVISA', 'Prescrição', 'Regulamentação'],
  'pdf',
  1500000,
  NOW(),
  NOW()
),

-- Documento 6: Atlas de Anatomia Renal
(
  doc6_id,
  'Atlas de Anatomia Renal',
  'Atlas ilustrado da anatomia do sistema renal e urinário. Imagens e descrições detalhadas da estrutura anatômica dos rins.',
  'Atlas ilustrado da anatomia do sistema renal e urinário',
  ARRAY['Anatomia', 'Rim', 'Atlas', 'Imagem'],
  ARRAY['Anatomia Renal', 'Sistema Urinário', 'Nefrologia'],
  'image',
  8700000,
  NOW(),
  NOW()
);

RAISE NOTICE 'Documentos inseridos com sucesso!';
RAISE NOTICE 'Total de documentos: 6';

END $$;

-- Verificar se os documentos foram inseridos
SELECT 
  id, 
  title, 
  file_type, 
  file_size,
  created_at
FROM documents
ORDER BY created_at DESC
LIMIT 10;
