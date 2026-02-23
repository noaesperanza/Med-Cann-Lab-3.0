-- ============================================================================
-- SQL: FUNÇÃO DE LIMPEZA DE SALAS DUPLICADAS
-- Execute este script no Supabase SQL Editor para criar a função 'cleanup_duplicate_rooms'
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_duplicate_rooms()
RETURNS TABLE (
  deleted_rooms_count INT,
  merged_messages_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  dup RECORD;
  primary_room_id UUID;
  v_deleted_count INT := 0;
  v_merged_count INT := 0;
BEGIN
  -- Iterar sobre cada par único de (paciente, profissional) que tem mais de 1 sala
  FOR r IN (
    SELECT 
      cp1.user_id as patient_id, 
      cp2.user_id as professional_id,
      COUNT(DISTINCT cp1.room_id) as room_count
    FROM chat_participants cp1
    JOIN chat_participants cp2 ON cp1.room_id = cp2.room_id AND cp1.user_id != cp2.user_id
    JOIN chat_rooms cr ON cp1.room_id = cr.id
    WHERE cp1.role = 'patient' AND cp2.role = 'professional' AND cr.type = 'patient'
    GROUP BY cp1.user_id, cp2.user_id
    HAVING COUNT(DISTINCT cp1.room_id) > 1
  ) LOOP
    
    RAISE NOTICE 'Processando duplicatas para Paciente % e Profissional %', r.patient_id, r.professional_id;

    -- Encontrar a "Sala Principal" (a que tem mais mensagens, ou a mais antiga se empate)
    SELECT cr.id INTO primary_room_id
    FROM chat_rooms cr
    JOIN chat_participants cp ON cr.id = cp.room_id
    WHERE cp.user_id = r.patient_id
    AND cr.id IN (
      SELECT room_id FROM chat_participants WHERE user_id = r.professional_id
    )
    ORDER BY (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id) DESC, cr.created_at ASC
    LIMIT 1;

    RAISE NOTICE 'Sala Principal selecionada: %', primary_room_id;

    -- Iterar sobre as salas duplicadas (não a principal)
    FOR dup IN (
      SELECT cr.id 
      FROM chat_rooms cr
      JOIN chat_participants cp ON cr.id = cp.room_id
      WHERE cp.user_id = r.patient_id
      AND cr.id IN (
        SELECT room_id FROM chat_participants WHERE user_id = r.professional_id
      )
      AND cr.id != primary_room_id
    ) LOOP
      
      RAISE NOTICE 'Removendo duplicata: %', dup.id;

      -- 1. Mover mensagens da duplicata para a principal
      UPDATE chat_messages 
      SET room_id = primary_room_id 
      WHERE room_id = dup.id;
      
      GET DIAGNOSTICS v_merged_count = ROW_COUNT;
      RAISE NOTICE 'Mensagens movidas: %', v_merged_count;

      -- 2. Remover participantes da duplicata
      DELETE FROM chat_participants WHERE room_id = dup.id;

      -- 3. Remover a sala duplicada
      DELETE FROM chat_rooms WHERE id = dup.id;

      v_deleted_count := v_deleted_count + 1;
    END LOOP;

  END LOOP;

  RETURN QUERY SELECT v_deleted_count, v_merged_count;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION cleanup_duplicate_rooms() TO postgres;
GRANT EXECUTE ON FUNCTION cleanup_duplicate_rooms() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_duplicate_rooms() TO service_role;

-- EXECUTAR LIMPEZA AGORA
SELECT * FROM cleanup_duplicate_rooms();

-- LIMPEZA ADICIONAL: Remover quaisquer salas de paciente vazias (sem mensagens) que sobraram
-- Isso remove o "lixo" visual de tentativas falhas de conexão
DELETE FROM chat_rooms 
WHERE type = 'patient' 
AND id NOT IN (SELECT DISTINCT room_id FROM chat_messages);

-- Remover participantes dessas salas deletadas (se sobrar algo órfão)
DELETE FROM chat_participants
WHERE room_id NOT IN (SELECT id FROM chat_rooms);
