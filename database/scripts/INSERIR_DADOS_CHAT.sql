-- =====================================================
-- 📝 INSERIR DADOS DE TESTE - CHAT GLOBAL
-- =====================================================
-- Execute este script no Supabase SQL Editor APÓS corrigir a estrutura

-- 1. LIMPAR DADOS EXISTENTES (OPCIONAL)
-- =====================================================
-- DELETE FROM chat_messages;

-- 2. INSERIR MENSAGENS DE TESTE
-- =====================================================
INSERT INTO chat_messages (user_id, user_name, user_avatar, content, channel, crm, specialty, type, reactions, is_pinned, is_online, created_at) VALUES
-- Mensagens no canal geral
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Bom dia pessoal! Como estão os casos de hoje?', 'general', 'CRM789012', 'Neurologia', 'text', '{"heart": 3, "thumbs": 5, "reply": 2}', false, true, NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Bom dia Dr. João! Tudo bem por aqui. Você já testou o novo sistema IMRE?', 'general', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 1, "thumbs": 3, "reply": 1}', false, true, NOW() - INTERVAL '1 hour 50 minutes'),
('00000000-0000-0000-0000-000000000004', 'Dr. Pedro Costa', 'PC', 'Ainda não, Dra. Maria. Como está funcionando?', 'general', 'CRM901234', 'Clínica Geral', 'text', '{"heart": 0, "thumbs": 1, "reply": 0}', false, true, NOW() - INTERVAL '1 hour 30 minutes'),
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Está excelente! A análise semântica está muito precisa.', 'general', 'CRM789012', 'Neurologia', 'text', '{"heart": 2, "thumbs": 4, "reply": 1}', false, true, NOW() - INTERVAL '1 hour 15 minutes'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Concordo! Os 28 blocos estão funcionando perfeitamente.', 'general', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 1, "thumbs": 2, "reply": 0}', false, true, NOW() - INTERVAL '1 hour'),

-- Mensagens no canal de cannabis
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Alguém tem experiência com CBD para dor neuropática?', 'cannabis', 'CRM789012', 'Neurologia', 'text', '{"heart": 5, "thumbs": 8, "reply": 3}', false, true, NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Sim! Tenho alguns casos com ótimos resultados. Podemos trocar experiências.', 'cannabis', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 3, "thumbs": 6, "reply": 2}', false, true, NOW() - INTERVAL '2 hours 45 minutes'),

-- Mensagens no canal de casos clínicos
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Caso interessante: paciente com dor crônica, sistema IMRE identificou padrão emocional específico.', 'clinical', 'CRM789012', 'Neurologia', 'text', '{"heart": 7, "thumbs": 12, "reply": 5}', true, true, NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Interessante! Qual foi o padrão identificado?', 'clinical', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 2, "thumbs": 4, "reply": 1}', false, true, NOW() - INTERVAL '2 hours 45 minutes'),
('00000000-0000-0000-0000-000000000002', 'Dr. João Silva', 'JS', 'Alta intensidade emocional (8.2) com baixa estabilidade (3.5). Padrão típico de ansiedade crônica.', 'clinical', 'CRM789012', 'Neurologia', 'text', '{"heart": 4, "thumbs": 8, "reply": 3}', false, true, NOW() - INTERVAL '2 hours 30 minutes'),

-- Mensagens no canal de pesquisa
('00000000-0000-0000-0000-000000000003', 'Dra. Maria Santos', 'MS', 'Novo estudo sobre cannabis e ansiedade publicado no JAMA. Muito promissor!', 'research', 'CRM345678', 'Psiquiatria', 'text', '{"heart": 6, "thumbs": 10, "reply": 4}', false, true, NOW() - INTERVAL '4 hours'),
('00000000-0000-0000-0000-000000000004', 'Dr. Pedro Costa', 'PC', 'Ótimo! Pode compartilhar o link?', 'research', 'CRM901234', 'Clínica Geral', 'text', '{"heart": 1, "thumbs": 2, "reply": 0}', false, true, NOW() - INTERVAL '3 hours 30 minutes'),

-- Mensagens no canal de suporte
('00000000-0000-0000-0000-000000000001', 'Dr. Admin MedCannLab', 'AM', 'Sistema funcionando perfeitamente! Qualquer dúvida, estou aqui.', 'support', 'CRM123456', 'Administrador', 'text', '{"heart": 2, "thumbs": 3, "reply": 1}', false, true, NOW() - INTERVAL '1 hour 30 minutes');

-- 3. VERIFICAR DADOS INSERIDOS
-- =====================================================
SELECT 
  channel,
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_message
FROM chat_messages 
GROUP BY channel
ORDER BY total_messages DESC;

-- 4. VERIFICAR MENSAGENS RECENTES
-- =====================================================
SELECT 
  user_name,
  content,
  channel,
  crm,
  specialty,
  reactions,
  is_pinned,
  created_at
FROM chat_messages 
ORDER BY created_at DESC
LIMIT 5;

-- Status: ✅ Dados de Teste Inseridos
-- - 12 mensagens em 5 canais diferentes
-- - 4 usuários profissionais participando
-- - Discussões médicas realistas
-- - Sistema pronto para uso
