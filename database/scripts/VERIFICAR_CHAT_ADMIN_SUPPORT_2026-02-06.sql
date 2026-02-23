-- =====================================================
-- 🔍 VERIFICAR SUPORTE PARA CHAT ADMIN
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Verificar se as tabelas chat_rooms e chat_participants
--           suportam type='admin' e role='admin' respectivamente
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA chat_rooms
-- =====================================================
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chat_rooms'
ORDER BY ordinal_position;

-- 2. VERIFICAR CONSTRAINTS DE CHECK NA COLUNA type
-- =====================================================
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_rooms'::regclass
  AND contype = 'c'
  AND conname LIKE '%type%';

-- 3. VERIFICAR ESTRUTURA DA TABELA chat_participants
-- =====================================================
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chat_participants'
ORDER BY ordinal_position;

-- 4. VERIFICAR CONSTRAINTS DE CHECK NA COLUNA role
-- =====================================================
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_participants'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';

-- 5. TESTAR SE JÁ EXISTEM SALAS DO TIPO 'admin'
-- =====================================================
SELECT 
    COUNT(*) AS total_admin_rooms,
    COUNT(DISTINCT id) AS unique_admin_rooms
FROM public.chat_rooms
WHERE type = 'admin';

-- 6. TESTAR SE JÁ EXISTEM PARTICIPANTES COM role='admin'
-- =====================================================
SELECT 
    COUNT(*) AS total_admin_participants,
    COUNT(DISTINCT room_id) AS rooms_with_admin_participants
FROM public.chat_participants
WHERE role = 'admin';
