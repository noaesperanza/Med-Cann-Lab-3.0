-- =====================================================
-- 🚀 POPULAR SISTEMA COM DADOS INICIAIS
-- =====================================================
-- Execute este script para popular o sistema com dados de teste

-- 1. CRIAR PERFIS PARA OS USUÁRIOS EXISTENTES
INSERT INTO profiles (user_id, name, type, created_at) VALUES
((SELECT id FROM usuarios LIMIT 1 OFFSET 0), 'Admin Principal', 'admin', NOW()),
((SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'Dr. Passos Mir', 'professional', NOW()),
((SELECT id FROM usuarios LIMIT 1 OFFSET 2), 'Paciente Teste', 'patient', NOW());

-- 2. INSERIR MENSAGENS DE CHAT GLOBAL
INSERT INTO chat_messages (user_id, content, channel, created_at) VALUES
((SELECT id FROM usuarios LIMIT 1 OFFSET 0), 'Bem-vindos ao MedCannLab 3.0!', 'general', NOW()),
((SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'Sistema funcionando perfeitamente!', 'general', NOW()),
((SELECT id FROM usuarios LIMIT 1 OFFSET 2), 'Chat global ativo!', 'general', NOW());

-- 3. INSERIR MENSAGENS POR CANAL
INSERT INTO messages (channel_id, user_id, content, created_at) VALUES
((SELECT id FROM channels WHERE name = 'Geral'), (SELECT id FROM usuarios LIMIT 1 OFFSET 0), 'Canal geral funcionando!', NOW()),
((SELECT id FROM channels WHERE name = 'Cannabis Medicinal'), (SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'Discussões sobre cannabis medicinal', NOW()),
((SELECT id FROM channels WHERE name = 'Casos Clínicos'), (SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'Casos clínicos complexos', NOW());

-- 4. INSERIR DOCUMENTOS
INSERT INTO documents (title, content, summary, keywords, medical_terms, uploaded_by, created_at) VALUES
('Guia Cannabis Medicinal', 'A cannabis medicinal tem demonstrado eficácia no tratamento de diversas condições. O CBD (canabidiol) é eficaz para epilepsia refratária, enquanto o THC (tetrahidrocanabinol) tem aplicações em dor crônica e náuseas.', 'Guia completo sobre uso terapêutico da cannabis medicinal', '{"cannabis", "medicinal", "terapêutico", "CBD", "THC"}', '{"cannabis", "cbd", "thc", "epilepsia", "dor crônica"}', (SELECT id FROM usuarios LIMIT 1 OFFSET 0), NOW()),
('Protocolo IMRE Triaxial', 'O Protocolo IMRE Triaxial é um sistema estruturado de avaliação clínica composto por 28 blocos. Inclui anamnese detalhada, exame físico sistematizado e avaliação psicossocial.', 'Protocolo de avaliação clínica com sistema IMRE', '{"IMRE", "avaliação", "clínica", "protocolo", "triaxial"}', '{"imre", "avaliação", "clínica", "anamnese", "exame físico"}', (SELECT id FROM usuarios LIMIT 1 OFFSET 1), NOW()),
('Monitoramento Renal', 'O monitoramento da função renal é essencial para pacientes em uso de cannabis medicinal. Creatinina, TFG e outros marcadores devem ser acompanhados regularmente.', 'Guia de monitoramento renal para pacientes', '{"renal", "monitoramento", "creatinina", "TFG", "cannabis"}', '{"renal", "creatinina", "tfg", "monitoramento", "cannabis"}', (SELECT id FROM usuarios LIMIT 1 OFFSET 1), NOW());

-- 5. INSERIR INTERAÇÕES IA
INSERT INTO user_interactions (user_id, text_raw, context, created_at) VALUES
('user1', 'Olá NOA, como você está?', '{"session": "teste", "type": "greeting"}', NOW()),
('user2', 'Preciso de ajuda com dosagem de CBD', '{"session": "dosagem", "type": "medical"}', NOW()),
('user3', 'Como funciona o sistema IMRE?', '{"session": "imre", "type": "educational"}', NOW());

-- 6. INSERIR ANÁLISE SEMÂNTICA
INSERT INTO semantic_analysis (chat_id, topics, emotions, biomedical_terms, interpretations, confidence, created_at) VALUES
((SELECT id FROM user_interactions LIMIT 1 OFFSET 0), '{"saudação", "NOA"}', 'positiva', '{"NOA", "sistema"}', 'Usuário cumprimentando o sistema NOA', 0.95, NOW()),
((SELECT id FROM user_interactions LIMIT 1 OFFSET 1), '{"dosagem", "CBD", "medicinal"}', 'neutra', '{"CBD", "dosagem", "medicinal"}', 'Usuário solicitando ajuda com dosagem de CBD', 0.88, NOW()),
((SELECT id FROM user_interactions LIMIT 1 OFFSET 2), '{"IMRE", "sistema", "educacional"}', 'curiosa', '{"IMRE", "sistema", "avaliação"}', 'Usuário interessado no sistema IMRE', 0.92, NOW());

-- 7. INSERIR SESSÕES DE CHAT
INSERT INTO chat_sessions (user_id, context_docs, messages, created_at) VALUES
((SELECT id FROM usuarios LIMIT 1 OFFSET 0), '{}', '[{"role": "user", "content": "Olá NOA!"}, {"role": "assistant", "content": "Olá! Como posso ajudar?"}]', NOW()),
((SELECT id FROM usuarios LIMIT 1 OFFSET 1), '{}', '[{"role": "user", "content": "Preciso de ajuda com dosagem"}, {"role": "assistant", "content": "Claro! Vou te ajudar com a dosagem."}]', NOW());

-- 8. INSERIR SISTEMA DE AMIZADES
INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
((SELECT id FROM usuarios LIMIT 1 OFFSET 0), (SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'accepted', NOW()),
((SELECT id FROM usuarios LIMIT 1 OFFSET 1), (SELECT id FROM usuarios LIMIT 1 OFFSET 2), 'pending', NOW());

-- 9. INSERIR CHATS PRIVADOS
INSERT INTO private_chats (doctor_id, patient_id, created_at) VALUES
((SELECT id FROM usuarios LIMIT 1 OFFSET 1), (SELECT id FROM usuarios LIMIT 1 OFFSET 2), NOW());

-- 10. INSERIR MENSAGENS PRIVADAS
INSERT INTO private_messages (chat_id, sender_id, content, created_at) VALUES
((SELECT id FROM private_chats LIMIT 1), (SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'Olá! Como você está se sentindo hoje?', NOW()),
((SELECT id FROM private_chats LIMIT 1), (SELECT id FROM usuarios LIMIT 1 OFFSET 2), 'Olá doutor! Estou me sentindo bem, obrigada!', NOW());

-- 11. INSERIR AVALIAÇÕES CLÍNICAS
INSERT INTO clinical_assessments (patient_id, doctor_id, assessment_type, data, status, created_at) VALUES
((SELECT id FROM usuarios LIMIT 1 OFFSET 2), (SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'IMRE', '{"symptoms": ["dor", "ansiedade"], "severity": "moderate"}', 'completed', NOW()),
((SELECT id FROM usuarios LIMIT 1 OFFSET 2), (SELECT id FROM usuarios LIMIT 1 OFFSET 1), 'AEC', '{"interview_data": "dados da entrevista"}', 'in_progress', NOW());

-- 12. INSERIR INSCRIÇÕES EM CURSOS
INSERT INTO course_enrollments (course_id, user_id, progress, created_at) VALUES
((SELECT id FROM courses LIMIT 1 OFFSET 0), (SELECT id FROM usuarios LIMIT 1 OFFSET 0), 25.5, NOW()),
((SELECT id FROM courses LIMIT 1 OFFSET 1), (SELECT id FROM usuarios LIMIT 1 OFFSET 1), 60.0, NOW()),
((SELECT id FROM courses LIMIT 1 OFFSET 2), (SELECT id FROM usuarios LIMIT 1 OFFSET 2), 15.0, NOW());

-- 13. VERIFICAR STATUS APÓS POPULAÇÃO
SELECT 
    'SISTEMA POPULADO COM SUCESSO!' as status,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM chat_messages) as total_chat_messages,
    (SELECT COUNT(*) FROM messages) as total_mensagens,
    (SELECT COUNT(*) FROM documents) as total_documentos,
    (SELECT COUNT(*) FROM user_interactions) as total_interacoes_ia,
    (SELECT COUNT(*) FROM semantic_analysis) as total_analises_semanticas,
    (SELECT COUNT(*) FROM chat_sessions) as total_sessoes_chat,
    (SELECT COUNT(*) FROM friendships) as total_amizades,
    (SELECT COUNT(*) FROM private_chats) as total_chats_privados,
    (SELECT COUNT(*) FROM clinical_assessments) as total_avaliacoes_clinicas,
    (SELECT COUNT(*) FROM course_enrollments) as total_inscricoes_cursos;
