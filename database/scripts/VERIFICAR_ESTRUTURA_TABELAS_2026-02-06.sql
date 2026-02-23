-- Verificar estrutura real das tabelas antes de corrigir
-- Data: 06/02/2026

-- 1. Verificar estrutura de chat_participants
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chat_participants'
ORDER BY ordinal_position;

-- 2. Verificar estrutura de users
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar estrutura de auth.users (apenas metadados disponíveis)
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;
