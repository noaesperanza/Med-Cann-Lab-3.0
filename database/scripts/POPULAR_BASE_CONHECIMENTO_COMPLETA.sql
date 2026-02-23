-- Script para popular a base de conhecimento completa da IA Nôa Esperança
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos limpar dados de teste existentes
DELETE FROM documents WHERE title LIKE '%teste%' OR title LIKE '%mock%';

-- Inserir documentos da base de conhecimento completa da IA Nôa Esperança
INSERT INTO documents (
  title, 
  file_type, 
  file_size, 
  author, 
  category, 
  target_audience, 
  tags, 
  keywords, 
  isLinkedToAI, 
  summary,
  aiRelevance,
  created_at,
  updated_at
) VALUES 

-- =====================================================
-- 🧠 DOCUMENTOS DA IA RESIDENTE (NÔA ESPERANÇA)
-- =====================================================

-- 1. Metodologia AEC - Arte da Entrevista Clínica
(
  'Metodologia AEC - Arte da Entrevista Clínica',
  'pdf',
  2400000,
  'Dr. Eduardo Faveret',
  'ai-documents',
  ARRAY['professional', 'student'],
  ARRAY['AEC', 'Entrevista', 'Humanização', 'Metodologia'],
  ARRAY['AEC', 'Entrevista', 'Humanização', 'Metodologia', 'Clínica'],
  true,
  'Metodologia completa da Arte da Entrevista Clínica (AEC) desenvolvida pelo Dr. Eduardo Faveret. Inclui técnicas de escuta ativa, humanização do atendimento e abordagem integral do paciente.',
  0.95,
  NOW(),
  NOW()
),

-- 2. Protocolo IMRE Triaxial Completo
(
  'Protocolo IMRE Triaxial - Avaliação Clínica Integral',
  'pdf',
  1800000,
  'Dra. Maria Santos',
  'ai-documents',
  ARRAY['professional', 'student'],
  ARRAY['IMRE', 'Avaliação', 'Protocolo', 'Triaxial'],
  ARRAY['IMRE', 'Avaliação', 'Protocolo', 'Triaxial', 'Clínica'],
  true,
  'Protocolo completo do método IMRE (Indicação, Motivação, Resultados Esperados) para avaliação clínica triaxial. Inclui os 28 blocos semânticos e fluxo de avaliação.',
  0.95,
  NOW(),
  NOW()
),

-- 3. Cannabis Medicinal - Guia Completo
(
  'Cannabis Medicinal - Guia Completo de Prescrição',
  'pdf',
  3200000,
  'Dr. Carlos Oliveira',
  'ai-documents',
  ARRAY['professional', 'student'],
  ARRAY['Cannabis', 'Prescrição', 'Medicinal', 'Guia'],
  ARRAY['Cannabis', 'Prescrição', 'Medicinal', 'Guia', 'Canabinoides'],
  true,
  'Guia completo de prescrição de cannabis medicinal incluindo dosagens, indicações, contraindicações e monitoramento terapêutico.',
  0.90,
  NOW(),
  NOW()
),

-- 4. Diretrizes ANVISA Cannabis Medicinal
(
  'Diretrizes ANVISA - Cannabis Medicinal',
  'pdf',
  1500000,
  'ANVISA',
  'protocols',
  ARRAY['professional'],
  ARRAY['Diretrizes', 'Cannabis', 'ANVISA', 'Regulamentação'],
  ARRAY['Diretrizes', 'Cannabis', 'ANVISA', 'Regulamentação', 'Brasil'],
  true,
  'Diretrizes oficiais da ANVISA para prescrição e uso de cannabis medicinal no Brasil.',
  0.85,
  NOW(),
  NOW()
),

-- 5. Atlas de Anatomia Renal e Urogenital
(
  'Atlas de Anatomia Renal e Urogenital',
  'pdf',
  8700000,
  'Dr. Pedro Lima',
  'research',
  ARRAY['professional', 'student'],
  ARRAY['Anatomia', 'Rim', 'Atlas', 'Urogenital'],
  ARRAY['Anatomia', 'Rim', 'Atlas', 'Urogenital', 'Nefrologia'],
  true,
  'Atlas ilustrado completo da anatomia renal e sistema urogenital com imagens detalhadas e descrições anatômicas.',
  0.80,
  NOW(),
  NOW()
),

-- 6. Aula 1: Introdução à Entrevista Clínica
(
  'Aula 1: Introdução à Entrevista Clínica',
  'mp4',
  45000000,
  'Dra. Ana Costa',
  'multimedia',
  ARRAY['student', 'professional'],
  ARRAY['Vídeo', 'Aula', 'Entrevista', 'Educação'],
  ARRAY['Vídeo', 'Aula', 'Entrevista', 'Educação', 'Clínica'],
  true,
  'Vídeo-aula introdutória sobre técnicas fundamentais de entrevista clínica e comunicação médico-paciente.',
  0.85,
  NOW(),
  NOW()
),

-- =====================================================
-- 📚 PROTOCOLOS CLÍNICOS AVANÇADOS
-- =====================================================

-- 7. Protocolo de Avaliação Renal em Cannabis
(
  'Protocolo de Avaliação Renal em Pacientes de Cannabis',
  'pdf',
  2100000,
  'Dr. Ricardo Valença',
  'protocols',
  ARRAY['professional'],
  ARRAY['Protocolo', 'Renal', 'Cannabis', 'Avaliação'],
  ARRAY['Protocolo', 'Renal', 'Cannabis', 'Avaliação', 'Nefrologia'],
  true,
  'Protocolo específico para avaliação da função renal em pacientes em uso de cannabis medicinal.',
  0.90,
  NOW(),
  NOW()
),

-- 8. Guia de Interações Medicamentosas
(
  'Guia de Interações Medicamentosas - Cannabis',
  'pdf',
  1800000,
  'Dr. João Silva',
  'protocols',
  ARRAY['professional'],
  ARRAY['Interações', 'Medicamentosas', 'Cannabis', 'Guia'],
  ARRAY['Interações', 'Medicamentosas', 'Cannabis', 'Guia', 'Farmacologia'],
  true,
  'Guia completo de interações medicamentosas entre cannabis e outros medicamentos.',
  0.85,
  NOW(),
  NOW()
),

-- 9. Protocolo de Monitoramento Terapêutico
(
  'Protocolo de Monitoramento Terapêutico - Cannabis',
  'pdf',
  1600000,
  'Dra. Maria Fernanda',
  'protocols',
  ARRAY['professional'],
  ARRAY['Monitoramento', 'Terapêutico', 'Cannabis', 'Protocolo'],
  ARRAY['Monitoramento', 'Terapêutico', 'Cannabis', 'Protocolo', 'Seguimento'],
  true,
  'Protocolo de monitoramento terapêutico para pacientes em uso de cannabis medicinal.',
  0.80,
  NOW(),
  NOW()
),

-- =====================================================
-- 🔬 PESQUISA CIENTÍFICA E EVIDÊNCIAS
-- =====================================================

-- 10. Revisão Sistemática - Cannabis e Epilepsia
(
  'Revisão Sistemática - Cannabis e Epilepsia',
  'pdf',
  2800000,
  'Dr. Eduardo Faveret',
  'research',
  ARRAY['professional', 'student'],
  ARRAY['Revisão', 'Sistemática', 'Cannabis', 'Epilepsia'],
  ARRAY['Revisão', 'Sistemática', 'Cannabis', 'Epilepsia', 'Evidências'],
  true,
  'Revisão sistemática das evidências científicas sobre o uso de cannabis no tratamento da epilepsia.',
  0.90,
  NOW(),
  NOW()
),

-- 11. Estudo Clínico - CBD e Dor Crônica
(
  'Estudo Clínico - CBD e Dor Crônica',
  'pdf',
  2200000,
  'Dr. Carlos Mendes',
  'research',
  ARRAY['professional', 'student'],
  ARRAY['Estudo', 'Clínico', 'CBD', 'Dor', 'Crônica'],
  ARRAY['Estudo', 'Clínico', 'CBD', 'Dor', 'Crônica', 'Pesquisa'],
  true,
  'Estudo clínico randomizado sobre eficácia do CBD no tratamento da dor crônica.',
  0.85,
  NOW(),
  NOW()
),

-- 12. Metanálise - Cannabis Medicinal
(
  'Metanálise - Eficácia da Cannabis Medicinal',
  'pdf',
  3500000,
  'Dr. Ana Paula',
  'research',
  ARRAY['professional', 'student'],
  ARRAY['Metanálise', 'Cannabis', 'Medicinal', 'Eficácia'],
  ARRAY['Metanálise', 'Cannabis', 'Medicinal', 'Eficácia', 'Evidências'],
  true,
  'Metanálise de estudos sobre eficácia da cannabis medicinal em diversas condições.',
  0.90,
  NOW(),
  NOW()
),

-- =====================================================
-- 📊 CASOS CLÍNICOS E ESTUDOS DE CASO
-- =====================================================

-- 13. Caso Clínico - Epilepsia Refratária
(
  'Caso Clínico - Epilepsia Refratária e Cannabis',
  'pdf',
  1200000,
  'Dr. Eduardo Faveret',
  'cases',
  ARRAY['professional', 'student'],
  ARRAY['Caso', 'Clínico', 'Epilepsia', 'Refratária', 'Cannabis'],
  ARRAY['Caso', 'Clínico', 'Epilepsia', 'Refratária', 'Cannabis', 'Tratamento'],
  true,
  'Caso clínico detalhado de paciente com epilepsia refratária tratado com cannabis medicinal.',
  0.85,
  NOW(),
  NOW()
),

-- 14. Caso Clínico - Dor Neuropática
(
  'Caso Clínico - Dor Neuropática e CBD',
  'pdf',
  1100000,
  'Dra. Maria Santos',
  'cases',
  ARRAY['professional', 'student'],
  ARRAY['Caso', 'Clínico', 'Dor', 'Neuropática', 'CBD'],
  ARRAY['Caso', 'Clínico', 'Dor', 'Neuropática', 'CBD', 'Tratamento'],
  true,
  'Caso clínico de paciente com dor neuropática tratado com CBD.',
  0.80,
  NOW(),
  NOW()
),

-- 15. Caso Clínico - Ansiedade e Cannabis
(
  'Caso Clínico - Ansiedade e Cannabis Medicinal',
  'pdf',
  1000000,
  'Dr. João Carlos',
  'cases',
  ARRAY['professional', 'student'],
  ARRAY['Caso', 'Clínico', 'Ansiedade', 'Cannabis', 'Medicinal'],
  ARRAY['Caso', 'Clínico', 'Ansiedade', 'Cannabis', 'Medicinal', 'Saúde Mental'],
  true,
  'Caso clínico de paciente com transtorno de ansiedade tratado com cannabis medicinal.',
  0.80,
  NOW(),
  NOW()
),

-- =====================================================
-- 🎥 MATERIAL MULTIMÍDIA EDUCACIONAL
-- =====================================================

-- 16. Aula 2: Farmacologia dos Canabinoides
(
  'Aula 2: Farmacologia dos Canabinoides',
  'mp4',
  52000000,
  'Dr. Carlos Oliveira',
  'multimedia',
  ARRAY['student', 'professional'],
  ARRAY['Vídeo', 'Aula', 'Farmacologia', 'Canabinoides'],
  ARRAY['Vídeo', 'Aula', 'Farmacologia', 'Canabinoides', 'Educação'],
  true,
  'Vídeo-aula sobre farmacologia dos canabinoides e seus mecanismos de ação.',
  0.85,
  NOW(),
  NOW()
),

-- 17. Aula 3: Dosagem e Titulação
(
  'Aula 3: Dosagem e Titulação de Cannabis',
  'mp4',
  48000000,
  'Dra. Ana Costa',
  'multimedia',
  ARRAY['student', 'professional'],
  ARRAY['Vídeo', 'Aula', 'Dosagem', 'Titulação', 'Cannabis'],
  ARRAY['Vídeo', 'Aula', 'Dosagem', 'Titulação', 'Cannabis', 'Prescrição'],
  true,
  'Vídeo-aula sobre princípios de dosagem e titulação de cannabis medicinal.',
  0.85,
  NOW(),
  NOW()
),

-- 18. Webinar - Cannabis e Nefrologia
(
  'Webinar - Cannabis Medicinal e Nefrologia',
  'mp4',
  65000000,
  'Dr. Ricardo Valença',
  'multimedia',
  ARRAY['professional'],
  ARRAY['Webinar', 'Cannabis', 'Nefrologia', 'Medicinal'],
  ARRAY['Webinar', 'Cannabis', 'Nefrologia', 'Medicinal', 'Educação'],
  true,
  'Webinar especializado sobre uso de cannabis medicinal em nefrologia.',
  0.90,
  NOW(),
  NOW()
),

-- =====================================================
-- 📋 DOCUMENTOS DE REFERÊNCIA RÁPIDA
-- =====================================================

-- 19. Guia de Referência Rápida - Dosagens
(
  'Guia de Referência Rápida - Dosagens Cannabis',
  'pdf',
  800000,
  'Dr. Eduardo Faveret',
  'protocols',
  ARRAY['professional'],
  ARRAY['Guia', 'Referência', 'Rápida', 'Dosagens', 'Cannabis'],
  ARRAY['Guia', 'Referência', 'Rápida', 'Dosagens', 'Cannabis', 'Prescrição'],
  true,
  'Guia de referência rápida com tabelas de dosagens de cannabis medicinal.',
  0.85,
  NOW(),
  NOW()
),

-- 20. Checklist de Avaliação Clínica
(
  'Checklist de Avaliação Clínica - Cannabis',
  'pdf',
  600000,
  'Dra. Maria Santos',
  'protocols',
  ARRAY['professional'],
  ARRAY['Checklist', 'Avaliação', 'Clínica', 'Cannabis'],
  ARRAY['Checklist', 'Avaliação', 'Clínica', 'Cannabis', 'Protocolo'],
  true,
  'Checklist prático para avaliação clínica de pacientes candidatos ao uso de cannabis.',
  0.80,
  NOW(),
  NOW()
);

-- Verificar quantos documentos foram inseridos
SELECT 
  COUNT(*) as total_documentos,
  COUNT(CASE WHEN "isLinkedToAI" = true THEN 1 END) as documentos_vinculados_ia,
  COUNT(CASE WHEN category = 'ai-documents' THEN 1 END) as documentos_ia_residente,
  COUNT(CASE WHEN category = 'protocols' THEN 1 END) as protocolos,
  COUNT(CASE WHEN category = 'research' THEN 1 END) as pesquisas,
  COUNT(CASE WHEN category = 'cases' THEN 1 END) as casos_clinicos,
  COUNT(CASE WHEN category = 'multimedia' THEN 1 END) as multimidia
FROM documents;

-- Listar todos os documentos inseridos
SELECT 
  title,
  category,
  "isLinkedToAI",
  "aiRelevance",
  author,
  created_at
FROM documents 
ORDER BY "aiRelevance" DESC, created_at DESC;
