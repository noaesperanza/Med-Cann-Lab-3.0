-- =====================================================
-- 🔍 VERIFICAR MENSAGENS NO BANCO - CHAT GLOBAL
-- =====================================================
-- Execute este script no Supabase SQL Editor para verificar se as mensagens estão sendo salvas

-- 1. Verificar se a tabela existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position;

-- 2. Contar total de mensagens
SELECT COUNT(*) as total_mensagens FROM chat_messages;

-- 3. Ver as últimas 10 mensagens
SELECT 
    id,
    user_id,
    user_name,
    content,
    channel,
    created_at,
    is_online
FROM chat_messages 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verificar se há mensagens do usuário admin
SELECT 
    id,
    user_name,
    content,
    created_at
FROM chat_messages 
WHERE user_id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8'
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position;
