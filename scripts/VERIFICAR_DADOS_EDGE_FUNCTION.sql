-- Verificar se a Edge Function está salvando dados
-- Execute no Supabase SQL Editor (https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/editor)

-- 1. Ver últimas 10 interações da IA
SELECT 
    created_at,
    user_id,
    left(user_message, 50) as user_msg_preview,
    left(ai_response, 50) as ai_response_preview,
    intent,
    metadata->>'system' as ai_system,
    metadata->>'simbologia' as tipo_escuta
FROM ai_chat_interactions
ORDER BY created_at DESC
LIMIT 10;

-- 2. Contar interações por hora (últimas 24h)
SELECT 
    date_trunc('hour', created_at) as hora,
    count(*) as total_interacoes,
    count(DISTINCT user_id) as usuarios_unicos
FROM ai_chat_interactions
WHERE created_at > now() - interval '24 hours'
GROUP BY hora
ORDER BY hora DESC;

-- 3. Ver se há interações HOJE
SELECT 
    COUNT(*) as interacoes_hoje,
    COUNT(DISTINCT user_id) as usuarios_hoje
FROM ai_chat_interactions
WHERE DATE(created_at) = CURRENT_DATE;
