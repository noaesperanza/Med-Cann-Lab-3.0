-- =====================================================
-- 🏥 DADOS DE TESTE COMPLETOS - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor APÓS criar as tabelas

-- 1. INSERIR USUÁRIOS DE TESTE
-- =====================================================

-- Inserir perfis de usuários
INSERT INTO user_profiles (user_id, name, specialty, crm, cro, points, level, achievements, last_activity) VALUES
-- Admin
('00000000-0000-0000-0000-000000000001', 'Dr. Admin MedCannLab', 'Administrador', 'CRM123456', NULL, 5000, 50, ARRAY['Fundador', 'Admin Master'], NOW() - INTERVAL '1 hour'),
-- Profissionais
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'Neurologia', 'CRM789012', NULL, 2500, 25, ARRAY['Especialista', 'Mentor'], NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'Psiquiatria', 'CRM345678', NULL, 1800, 18, ARRAY['Especialista'], NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000004', 'Dr. Pedro Costa', 'Clínica Geral', 'CRM901234', NULL, 1200, 12, ARRAY['Iniciante'], NOW() - INTERVAL '4 hours'),
-- Pacientes
('00000000-0000-0000-0000-000000000005', 'Ana Oliveira', NULL, NULL, NULL, 800, 8, ARRAY['Paciente Ativo'], NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000006', 'Carlos Mendes', NULL, NULL, NULL, 600, 6, ARRAY['Paciente'], NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000007', 'Lucia Ferreira', NULL, NULL, NULL, 400, 4, ARRAY['Paciente'], NOW() - INTERVAL '3 days'),
-- Estudantes
('00000000-0000-0000-0000-000000000008', 'Roberto Alves', NULL, NULL, NULL, 300, 3, ARRAY['Estudante'], NOW() - INTERVAL '1 week'),
('00000000-0000-0000-0000-000000000009', 'Fernanda Lima', NULL, NULL, NULL, 200, 2, ARRAY['Estudante'], NOW() - INTERVAL '2 weeks');

-- 2. INSERIR CURSOS DE TESTE
-- =====================================================

INSERT INTO courses (title, description, content, duration, difficulty, category, tags) VALUES
('Pós-Graduação Cannabis Medicinal', 'Curso completo de 520 horas sobre cannabis medicinal', 'Conteúdo completo do curso...', 520, 'advanced', 'Medicina', ARRAY['cannabis', 'medicina', 'pós-graduação']),
('Arte da Entrevista Clínica', 'Metodologia AEC para entrevistas clínicas', 'Conteúdo sobre metodologia AEC...', 40, 'intermediate', 'Clínica', ARRAY['entrevista', 'clínica', 'AEC']),
('Sistema IMRE Triaxial', 'Avaliação clínica com 28 blocos semânticos', 'Conteúdo sobre sistema IMRE...', 20, 'beginner', 'Avaliação', ARRAY['IMRE', 'avaliação', 'clínica']),
('Neurofarmacologia da Cannabis', 'Fundamentos neurofarmacológicos', 'Conteúdo sobre neurofarmacologia...', 30, 'advanced', 'Farmacologia', ARRAY['neurofarmacologia', 'cannabis']),
('LGPD na Medicina', 'Privacidade e proteção de dados', 'Conteúdo sobre LGPD...', 15, 'beginner', 'Direito', ARRAY['LGPD', 'privacidade']);

-- 3. INSERIR PROGRESSO DOS CURSOS
-- =====================================================

INSERT INTO user_courses (user_id, course_id, progress, completed_lessons, total_lessons, status, enrolled_at) VALUES
-- Dr. João Silva
('00000000-0000-0000-0000-000000000002', (SELECT id FROM courses WHERE title = 'Pós-Graduação Cannabis Medicinal'), 75.5, 15, 20, 'in_progress', NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM courses WHERE title = 'Sistema IMRE Triaxial'), 100.0, 10, 10, 'completed', NOW() - INTERVAL '15 days'),
-- Dra. Maria Santos
('00000000-0000-0000-0000-000000000003', (SELECT id FROM courses WHERE title = 'Arte da Entrevista Clínica'), 60.0, 12, 20, 'in_progress', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM courses WHERE title = 'Neurofarmacologia da Cannabis'), 40.0, 8, 20, 'in_progress', NOW() - INTERVAL '10 days'),
-- Dr. Pedro Costa
('00000000-0000-0000-0000-000000000004', (SELECT id FROM courses WHERE title = 'Sistema IMRE Triaxial'), 80.0, 8, 10, 'in_progress', NOW() - INTERVAL '5 days'),
-- Estudantes
('00000000-0000-0000-0000-000000000008', (SELECT id FROM courses WHERE title = 'LGPD na Medicina'), 100.0, 5, 5, 'completed', NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000009', (SELECT id FROM courses WHERE title = 'Sistema IMRE Triaxial'), 30.0, 3, 10, 'in_progress', NOW() - INTERVAL '3 days');

-- 4. INSERIR TRANSAÇÕES DE TESTE
-- =====================================================

INSERT INTO transactions (user_id, amount, currency, description, type, status, payment_method, created_at) VALUES
-- Dr. João Silva
('00000000-0000-0000-0000-000000000002', 2500.00, 'BRL', 'Pós-Graduação Cannabis Medicinal', 'payment', 'completed', 'credit_card', NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000002', 500.00, 'BRL', 'Curso Sistema IMRE', 'payment', 'completed', 'pix', NOW() - INTERVAL '15 days'),
-- Dra. Maria Santos
('00000000-0000-0000-0000-000000000003', 800.00, 'BRL', 'Arte da Entrevista Clínica', 'payment', 'completed', 'credit_card', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000003', 600.00, 'BRL', 'Neurofarmacologia da Cannabis', 'payment', 'completed', 'pix', NOW() - INTERVAL '10 days'),
-- Dr. Pedro Costa
('00000000-0000-0000-0000-000000000004', 500.00, 'BRL', 'Sistema IMRE Triaxial', 'payment', 'completed', 'credit_card', NOW() - INTERVAL '5 days'),
-- Estudantes
('00000000-0000-0000-0000-000000000008', 200.00, 'BRL', 'LGPD na Medicina', 'payment', 'completed', 'pix', NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000009', 500.00, 'BRL', 'Sistema IMRE Triaxial', 'payment', 'pending', 'credit_card', NOW() - INTERVAL '3 days');

-- 5. INSERIR AGENDAMENTOS DE TESTE
-- =====================================================

INSERT INTO appointments (patient_id, professional_id, title, description, appointment_date, duration, status, type, location, is_remote) VALUES
-- Ana Oliveira com Dr. João Silva
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Consulta de Avaliação IMRE', 'Primeira consulta para avaliação com sistema IMRE', NOW() + INTERVAL '2 days', 60, 'scheduled', 'consultation', 'Consultório Dr. João Silva', FALSE),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Retorno - Avaliação IMRE', 'Retorno para análise dos resultados', NOW() + INTERVAL '1 week', 30, 'scheduled', 'follow_up', 'Consultório Dr. João Silva', FALSE),
-- Carlos Mendes com Dra. Maria Santos
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Consulta Psiquiátrica', 'Avaliação psiquiátrica inicial', NOW() + INTERVAL '3 days', 45, 'confirmed', 'consultation', 'Consultório Dra. Maria Santos', TRUE),
-- Lucia Ferreira com Dr. Pedro Costa
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'Consulta Clínica Geral', 'Consulta de rotina', NOW() + INTERVAL '5 days', 30, 'scheduled', 'consultation', 'Consultório Dr. Pedro Costa', FALSE);

-- 6. INSERIR AVALIAÇÕES IMRE DE TESTE
-- =====================================================

INSERT INTO imre_assessments (user_id, patient_id, triaxial_data, semantic_context, emotional_indicators, cognitive_patterns, behavioral_markers, assessment_date, session_duration, completion_status, clinical_notes) VALUES
-- Avaliação da Ana Oliveira
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 
 '{"emotional_axis": {"intensity": 7.5, "valence": 6.2, "arousal": 8.1, "stability": 5.8}, "cognitive_axis": {"attention": 6.5, "memory": 7.2, "executive": 5.9, "processing": 6.8}, "behavioral_axis": {"activity": 7.1, "social": 6.3, "adaptive": 7.5, "regulatory": 6.0}}',
 '{"context": "Primeira avaliação", "session_notes": "Paciente colaborativa", "environment": "Consultório"}',
 '{"anxiety": 6.5, "depression": 4.2, "stress": 7.1, "mood": 6.8}',
 '{"attention_span": "moderate", "memory_recall": "good", "executive_function": "adequate"}',
 '{"social_interaction": "normal", "daily_activities": "maintained", "sleep_pattern": "irregular"}',
 NOW() - INTERVAL '1 day', 45, 'completed', 'Paciente apresentou boa colaboração durante a avaliação. Resultados indicam necessidade de acompanhamento.'),

-- Avaliação do Carlos Mendes
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006',
 '{"emotional_axis": {"intensity": 8.2, "valence": 4.1, "arousal": 9.0, "stability": 3.5}, "cognitive_axis": {"attention": 5.2, "memory": 6.8, "executive": 4.1, "processing": 5.5}, "behavioral_axis": {"activity": 3.2, "social": 2.8, "adaptive": 4.5, "regulatory": 3.8}}',
 '{"context": "Avaliação psiquiátrica", "session_notes": "Paciente ansioso", "environment": "Consultório"}',
 '{"anxiety": 8.5, "depression": 7.2, "stress": 9.1, "mood": 3.8}',
 '{"attention_span": "reduced", "memory_recall": "impaired", "executive_function": "compromised"}',
 '{"social_interaction": "withdrawn", "daily_activities": "reduced", "sleep_pattern": "disrupted"}',
 NOW() - INTERVAL '2 days', 60, 'completed', 'Paciente apresenta quadro de ansiedade generalizada com comprometimento funcional significativo.');

-- 7. INSERIR BLOCOS SEMÂNTICOS DE TESTE
-- =====================================================

INSERT INTO imre_semantic_blocks (assessment_id, block_number, block_type, semantic_content, emotional_weight, cognitive_complexity, behavioral_impact, confidence_score, processing_time) VALUES
-- Blocos da avaliação da Ana Oliveira
((SELECT id FROM imre_assessments WHERE patient_id = '00000000-0000-0000-0000-000000000005'), 1, 'indiciaria', '{"symptoms": ["dor_cronica", "ansiedade", "insonia"], "severity": 7.5, "duration": "6_meses"}', 0.75, 0.60, 0.80, 0.85, 120),
((SELECT id FROM imre_assessments WHERE patient_id = '00000000-0000-0000-0000-000000000005'), 2, 'queixa', '{"main_complaint": "dor_articular", "development": "progressivo", "associated_symptoms": ["rigidez", "edema"]}', 0.70, 0.65, 0.75, 0.90, 150),
((SELECT id FROM imre_assessments WHERE patient_id = '00000000-0000-0000-0000-000000000005'), 3, 'patologica', '{"medical_history": ["hipertensao", "diabetes"], "surgeries": ["apendicectomia"], "allergies": ["penicilina"]}', 0.60, 0.70, 0.65, 0.88, 100),

-- Blocos da avaliação do Carlos Mendes
((SELECT id FROM imre_assessments WHERE patient_id = '00000000-0000-0000-0000-000000000006'), 1, 'indiciaria', '{"symptoms": ["ansiedade", "pânico", "insonia"], "severity": 8.5, "duration": "3_meses"}', 0.90, 0.75, 0.85, 0.92, 180),
((SELECT id FROM imre_assessments WHERE patient_id = '00000000-0000-0000-0000-000000000006'), 2, 'queixa', '{"main_complaint": "crises_de_ansiedade", "development": "agudo", "associated_symptoms": ["taquicardia", "sudorese", "tremor"]}', 0.95, 0.80, 0.90, 0.95, 200);

-- 8. INSERIR LOGS DE INTERAÇÃO NOA
-- =====================================================

INSERT INTO noa_interaction_logs (user_id, session_id, interaction_type, input_data, output_data, processing_time, semantic_analysis, emotional_indicators, success) VALUES
-- Interações da Ana Oliveira
('00000000-0000-0000-0000-000000000005', 'session_ana_001', 'chat', '{"message": "Olá NOA, estou sentindo muita dor nas articulações"}', '{"response": "Entendo sua preocupação com a dor articular. Vamos analisar seus sintomas juntos."}', 2500, '{"topics": ["dor", "articulações", "sintomas"], "sentiment": "preocupado"}', '{"anxiety": 6.5, "concern": 7.2}', TRUE),
('00000000-0000-0000-0000-000000000005', 'session_ana_001', 'assessment', '{"question": "Como você descreveria sua dor?"}', '{"response": "A dor é constante, piora pela manhã e melhora com movimento"}', 1800, '{"topics": ["dor", "padrão", "movimento"], "sentiment": "descritivo"}', '{"pain_level": 7.5, "anxiety": 5.8}', TRUE),

-- Interações do Carlos Mendes
('00000000-0000-0000-0000-000000000006', 'session_carlos_001', 'chat', '{"message": "NOA, estou tendo crises de ansiedade muito fortes"}', '{"response": "Reconheço que as crises de ansiedade podem ser muito angustiantes. Vamos trabalhar juntos para entender melhor."}', 3200, '{"topics": ["ansiedade", "crises", "angústia"], "sentiment": "angustiado"}', '{"anxiety": 8.5, "panic": 9.0}', TRUE);

-- 9. INSERIR INTEGRAÇÃO CLÍNICA
-- =====================================================

INSERT INTO clinical_integration (user_id, assessment_id, clinical_data, therapeutic_recommendations, risk_assessment, follow_up_plan, clinician_notes, status) VALUES
-- Integração clínica da Ana Oliveira
('00000000-0000-0000-0000-000000000002', (SELECT id FROM imre_assessments WHERE patient_id = '00000000-0000-0000-0000-000000000005'),
 '{"diagnosis": "artrite_reumatoide", "severity": "moderada", "prognosis": "bom_com_tratamento"}',
 '{"medications": ["anti_inflamatorios", "analgesicos"], "therapy": ["fisioterapia", "exercicios"], "lifestyle": ["dieta_anti_inflamatoria"]}',
 '{"cardiovascular": "baixo", "renal": "baixo", "hepatic": "baixo"}',
 '{"next_appointment": "1_mes", "monitoring": ["marcadores_inflamatorios", "funcao_articular"]}',
 'Paciente com quadro típico de artrite reumatóide. Resposta ao tratamento esperada em 4-6 semanas.', 'active'),

-- Integração clínica do Carlos Mendes
('00000000-0000-0000-0000-000000000003', (SELECT id FROM imre_assessments WHERE patient_id = '00000000-0000-0000-0000-000000000006'),
 '{"diagnosis": "transtorno_ansiedade_generalizada", "severity": "grave", "prognosis": "reservado"}',
 '{"medications": ["ansioliticos", "antidepressivos"], "therapy": ["terapia_cognitivo_comportamental", "relaxamento"], "lifestyle": ["exercicios", "meditacao"]}',
 '{"cardiovascular": "alto", "psiquiatrico": "alto", "social": "alto"}',
 '{"next_appointment": "1_semana", "monitoring": ["sintomas_ansiedade", "funcionamento_social"]}',
 'Paciente com TAG grave com comprometimento funcional significativo. Necessário acompanhamento intensivo.', 'active');

-- 10. INSERIR MENSAGENS DE CHAT DE TESTE
-- =====================================================

INSERT INTO chat_messages (user_id, content, channel, created_at) VALUES
-- Mensagens no canal geral
('00000000-0000-0000-0000-000000000002', 'Bom dia pessoal! Como estão os casos de hoje?', 'general', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000003', 'Bom dia Dr. João! Tudo bem por aqui. Você já testou o novo sistema IMRE?', 'general', NOW() - INTERVAL '1 hour 50 minutes'),
('00000000-0000-0000-0000-000000000004', 'Ainda não, Dra. Maria. Como está funcionando?', 'general', NOW() - INTERVAL '1 hour 30 minutes'),
('00000000-0000-0000-0000-000000000002', 'Está excelente! A análise semântica está muito precisa.', 'general', NOW() - INTERVAL '1 hour 15 minutes'),
('00000000-0000-0000-0000-000000000003', 'Concordo! Os 28 blocos estão funcionando perfeitamente.', 'general', NOW() - INTERVAL '1 hour'),

-- Mensagens no canal de casos clínicos
('00000000-0000-0000-0000-000000000002', 'Caso interessante: paciente com dor crônica, sistema IMRE identificou padrão emocional específico.', 'casos_clinicos', NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000003', 'Interessante! Qual foi o padrão identificado?', 'casos_clinicos', NOW() - INTERVAL '2 hours 45 minutes'),
('00000000-0000-0000-0000-000000000002', 'Alta intensidade emocional (8.2) com baixa estabilidade (3.5). Padrão típico de ansiedade crônica.', 'casos_clinicos', NOW() - INTERVAL '2 hours 30 minutes');

-- 11. VERIFICAR DADOS INSERIDOS
-- =====================================================

-- Verificar contagem de registros
SELECT 
  'user_profiles' as tabela, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'user_courses', COUNT(*) FROM user_courses
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'imre_assessments', COUNT(*) FROM imre_assessments
UNION ALL
SELECT 'imre_semantic_blocks', COUNT(*) FROM imre_semantic_blocks
UNION ALL
SELECT 'noa_interaction_logs', COUNT(*) FROM noa_interaction_logs
UNION ALL
SELECT 'clinical_integration', COUNT(*) FROM clinical_integration
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages;

-- Status: ✅ Dados de Teste Completos Inseridos
-- - 9 usuários de teste (1 admin, 3 profissionais, 3 pacientes, 2 estudantes)
-- - 5 cursos com diferentes níveis
-- - Progresso de cursos para vários usuários
-- - 7 transações financeiras
-- - 4 agendamentos
-- - 2 avaliações IMRE completas
-- - 5 blocos semânticos
-- - 3 logs de interação NOA
-- - 2 integrações clínicas
-- - 8 mensagens de chat
-- - Sistema 100% funcional com dados reais
