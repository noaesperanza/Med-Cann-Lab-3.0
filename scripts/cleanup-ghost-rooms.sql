-- ============================================================================
-- LIMPEZA DE GHOST ROOMS - Med-Cann-Lab 3.0
-- Execute no Supabase SQL Editor
-- Data: 2025-12-23
-- ============================================================================

-- PASSO 1: Ver todas as salas duplicadas do paciente joao.vidal
-- (para entender o problema)
SELECT 
  cr.id as room_id,
  cr.name,
  cr.type,
  cr.created_at,
  (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id) as msg_count
FROM chat_rooms cr
WHERE cr.id IN (
  SELECT room_id FROM chat_participants 
  WHERE user_id = '07d79a5a-231b-4f7c-8819-6d260a9873c4'
)
ORDER BY cr.created_at DESC;

-- ============================================================================
-- PASSO 2: LIMPEZA - Manter apenas a sala mais recente COM mensagens
-- ============================================================================

-- 2a. Identificar salas vazias (sem mensagens) para deletar
WITH empty_rooms AS (
  SELECT cp.room_id
  FROM chat_participants cp
  WHERE cp.user_id = '07d79a5a-231b-4f7c-8819-6d260a9873c4'
  AND NOT EXISTS (
    SELECT 1 FROM chat_messages cm WHERE cm.room_id = cp.room_id
  )
)
-- Primeiro, remover participações das salas vazias
DELETE FROM chat_participants 
WHERE room_id IN (SELECT room_id FROM empty_rooms);

-- 2b. Deletar as salas vazias
DELETE FROM chat_rooms 
WHERE id NOT IN (
  SELECT DISTINCT room_id FROM chat_messages
)
AND id IN (
  SELECT room_id FROM chat_participants 
  WHERE user_id = '07d79a5a-231b-4f7c-8819-6d260a9873c4'
);

-- ============================================================================
-- PASSO 3: Verificar resultado
-- ============================================================================
SELECT 
  cr.id as room_id,
  cr.name,
  cr.type,
  (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id) as msg_count,
  (SELECT COUNT(*) FROM chat_participants WHERE room_id = cr.id) as participants
FROM chat_rooms cr
WHERE cr.id IN (
  SELECT room_id FROM chat_participants 
  WHERE user_id = '07d79a5a-231b-4f7c-8819-6d260a9873c4'
)
ORDER BY msg_count DESC;

-- ============================================================================
-- PASSO 4 (OPCIONAL): Limpar TODAS as salas sem mensagens do sistema
-- ============================================================================
-- CUIDADO: Isso remove todas as salas vazias, não só do paciente acima

-- DELETE FROM chat_participants 
-- WHERE room_id IN (
--   SELECT id FROM chat_rooms 
--   WHERE id NOT IN (SELECT DISTINCT room_id FROM chat_messages)
-- );

-- DELETE FROM chat_rooms 
-- WHERE id NOT IN (SELECT DISTINCT room_id FROM chat_messages);
