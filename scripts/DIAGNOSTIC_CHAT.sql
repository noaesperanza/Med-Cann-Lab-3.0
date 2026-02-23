-- DIAGNOSTICO DE CHAT
-- Verificar as últimas salas criadas e seus participantes
-- para entender por que o Ricardo não vê a mensagem do Admin.

SELECT 
    cr.id as room_id,
    cr.name as room_name,
    cr.type,
    cr.created_by,
    au.email as creator_email,
    cr.created_at
FROM chat_rooms cr
LEFT JOIN auth.users au ON cr.created_by = au.id
ORDER BY cr.created_at DESC
LIMIT 5;

-- Verificar participantes dessas salas
SELECT 
    cp.room_id,
    cp.user_id,
    au.email as participant_email,
    cp.role
FROM chat_participants cp
JOIN auth.users au ON cp.user_id = au.id
WHERE cp.room_id IN (
    SELECT id FROM chat_rooms ORDER BY created_at DESC LIMIT 5
);

-- Verificar se existe alguma sala entre Admin (current user se for rodar no editor, mas vamos buscar por email genérico) e Ricardo
-- Supondo que Ricardo = rrvalenca@...
-- Vamos buscar usuários
SELECT id, email FROM auth.users WHERE email LIKE '%rrvalenca%';
