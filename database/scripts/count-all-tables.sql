-- ===============================================
-- 📊 ANÁLISE COMPLETA DAS 82 TABELAS ENCONTRADAS
-- Execute no SQL Editor do Supabase
-- ===============================================

-- ============================================
-- CONTAGEM DE REGISTROS - TODAS AS 82 TABELAS
-- ============================================

SELECT 'abertura_exponencial' as tabela, COUNT(*) as total FROM abertura_exponencial
UNION ALL
SELECT 'ai_chat_interactions', COUNT(*) FROM ai_chat_interactions
UNION ALL
SELECT 'ai_saved_documents', COUNT(*) FROM ai_saved_documents
UNION ALL
SELECT 'analytics', COUNT(*) FROM analytics
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'assessment_sharing', COUNT(*) FROM assessment_sharing
UNION ALL
SELECT 'avaliacoes_renais', COUNT(*) FROM avaliacoes_renais
UNION ALL
SELECT 'base_conhecimento', COUNT(*) FROM base_conhecimento
UNION ALL
SELECT 'channels', COUNT(*) FROM channels
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'chat_messages_legacy', COUNT(*) FROM chat_messages_legacy
UNION ALL
SELECT 'chat_participants', COUNT(*) FROM chat_participants
UNION ALL
SELECT 'chat_rooms', COUNT(*) FROM chat_rooms
UNION ALL
SELECT 'chat_sessions', COUNT(*) FROM chat_sessions
UNION ALL
SELECT 'clinical_assessments', COUNT(*) FROM clinical_assessments
UNION ALL
SELECT 'clinical_integration', COUNT(*) FROM clinical_integration
UNION ALL
SELECT 'clinical_kpis', COUNT(*) FROM clinical_kpis
UNION ALL
SELECT 'clinical_reports', COUNT(*) FROM clinical_reports
UNION ALL
SELECT 'clinics', COUNT(*) FROM clinics
UNION ALL
SELECT 'contexto_longitudinal', COUNT(*) FROM contexto_longitudinal
UNION ALL
SELECT 'course_enrollments', COUNT(*) FROM course_enrollments
UNION ALL
SELECT 'course_modules', COUNT(*) FROM course_modules
UNION ALL
SELECT 'course_ratings', COUNT(*) FROM course_ratings
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'dados_imre_coletados', COUNT(*) FROM dados_imre_coletados
UNION ALL
SELECT 'debates', COUNT(*) FROM debates
UNION ALL
SELECT 'desenvolvimento_indiciario', COUNT(*) FROM desenvolvimento_indiciario
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'educational_resources', COUNT(*) FROM educational_resources
UNION ALL
SELECT 'epilepsy_events', COUNT(*) FROM epilepsy_events
UNION ALL
SELECT 'feature_flags', COUNT(*) FROM feature_flags
UNION ALL
SELECT 'fechamento_consensual', COUNT(*) FROM fechamento_consensual
UNION ALL
SELECT 'forum_comments', COUNT(*) FROM forum_comments
UNION ALL
SELECT 'forum_likes', COUNT(*) FROM forum_likes
UNION ALL
SELECT 'forum_posts', COUNT(*) FROM forum_posts
UNION ALL
SELECT 'forum_views', COUNT(*) FROM forum_views
UNION ALL
SELECT 'friendships', COUNT(*) FROM friendships
UNION ALL
SELECT 'global_chat_messages', COUNT(*) FROM global_chat_messages
UNION ALL
SELECT 'imre_assessments', COUNT(*) FROM imre_assessments
UNION ALL
SELECT 'imre_semantic_blocks', COUNT(*) FROM imre_semantic_blocks
UNION ALL
SELECT 'imre_semantic_context', COUNT(*) FROM imre_semantic_context
UNION ALL
SELECT 'integrative_prescription_templates', COUNT(*) FROM integrative_prescription_templates
UNION ALL
SELECT 'interacoes_ia', COUNT(*) FROM interacoes_ia
UNION ALL
SELECT 'lesson_content', COUNT(*) FROM lesson_content
UNION ALL
SELECT 'medcannlab_audit_logs', COUNT(*) FROM medcannlab_audit_logs
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'modelos_receituario', COUNT(*) FROM modelos_receituario
UNION ALL
SELECT 'moderator_requests', COUNT(*) FROM moderator_requests
UNION ALL
SELECT 'news_items', COUNT(*) FROM news_items
UNION ALL
SELECT 'noa_articles', COUNT(*) FROM noa_articles
UNION ALL
SELECT 'noa_clinical_cases', COUNT(*) FROM noa_clinical_cases
UNION ALL
SELECT 'noa_interaction_logs', COUNT(*) FROM noa_interaction_logs
UNION ALL
SELECT 'noa_lessons', COUNT(*) FROM noa_lessons
UNION ALL
SELECT 'noa_memories', COUNT(*) FROM noa_memories
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'pacientes', COUNT(*) FROM pacientes
UNION ALL
SELECT 'patient_insights', COUNT(*) FROM patient_insights
UNION ALL
SELECT 'patient_medical_records', COUNT(*) FROM patient_medical_records
UNION ALL
SELECT 'patient_prescriptions', COUNT(*) FROM patient_prescriptions
UNION ALL
SELECT 'patient_therapeutic_plans', COUNT(*) FROM patient_therapeutic_plans
UNION ALL
SELECT 'permissoes_compartilhamento', COUNT(*) FROM permissoes_compartilhamento
UNION ALL
SELECT 'platform_params', COUNT(*) FROM platform_params
UNION ALL
SELECT 'private_chats', COUNT(*) FROM private_chats
UNION ALL
SELECT 'private_messages', COUNT(*) FROM private_messages
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'role_catalog', COUNT(*) FROM role_catalog
UNION ALL
SELECT 'semantic_analysis', COUNT(*) FROM semantic_analysis
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'user_activity_logs', COUNT(*) FROM user_activity_logs
UNION ALL
SELECT 'user_courses', COUNT(*) FROM user_courses
UNION ALL
SELECT 'user_interactions', COUNT(*) FROM user_interactions
UNION ALL
SELECT 'user_mutes', COUNT(*) FROM user_mutes
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'user_statistics', COUNT(*) FROM user_statistics
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'wearable_data', COUNT(*) FROM wearable_data
UNION ALL
SELECT 'wearable_devices', COUNT(*) FROM wearable_devices
ORDER BY total DESC;
