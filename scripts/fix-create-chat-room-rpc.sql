-- ============================================================================
-- FIX: create_chat_room_for_patient
-- Esta função DEVE verificar se já existe sala antes de criar nova
-- Execute no Supabase SQL Editor
-- Data: 2025-12-23
-- ============================================================================

-- Primeiro, dropar a função antiga (se existir)
DROP FUNCTION IF EXISTS create_chat_room_for_patient(uuid, text, uuid);

-- Criar função corrigida
CREATE OR REPLACE FUNCTION create_chat_room_for_patient(
  p_patient_id UUID,
  p_patient_name TEXT,
  p_professional_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id UUID;
  v_room_name TEXT;
BEGIN
  -- 1. PRIMEIRO: Verificar se já existe uma sala entre este paciente e profissional
  SELECT cr.id INTO v_room_id
  FROM chat_rooms cr
  WHERE cr.type = 'patient'
  AND EXISTS (
    SELECT 1 FROM chat_participants cp1
    WHERE cp1.room_id = cr.id AND cp1.user_id = p_patient_id
  )
  AND EXISTS (
    SELECT 1 FROM chat_participants cp2
    WHERE cp2.room_id = cr.id AND cp2.user_id = p_professional_id
  )
  LIMIT 1;

  -- 2. Se já existe, retornar o ID existente
  IF v_room_id IS NOT NULL THEN
    RAISE NOTICE 'Sala existente encontrada: %', v_room_id;
    RETURN v_room_id;
  END IF;

  -- 3. Se não existe, criar nova sala
  v_room_name := 'Canal de cuidado • ' || COALESCE(p_patient_name, 'Paciente');
  
  INSERT INTO chat_rooms (name, type, created_by)
  VALUES (v_room_name, 'patient', auth.uid())
  RETURNING id INTO v_room_id;

  -- 4. Adicionar paciente como participante
  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (v_room_id, p_patient_id, 'patient')
  ON CONFLICT (room_id, user_id) DO NOTHING;  -- Evitar duplicatas

  -- 5. Adicionar profissional como participante
  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (v_room_id, p_professional_id, 'professional')
  ON CONFLICT (room_id, user_id) DO NOTHING;  -- Evitar duplicatas

  RAISE NOTICE 'Nova sala criada: %', v_room_id;
  RETURN v_room_id;
END;
$$;

-- Dar permissões para a função ser chamada
GRANT EXECUTE ON FUNCTION create_chat_room_for_patient(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION create_chat_room_for_patient(uuid, text, uuid) TO anon;

-- ============================================================================
-- TESTE: Verificar se funciona
-- ============================================================================
-- SELECT create_chat_room_for_patient(
--   '07d79a5a-231b-4f7c-8819-6d260a9873c4',  -- joao (paciente)
--   'João Eduardo Vidal',
--   'b194cfdc-a245-404e-a5e4-8c5c8f222de9'   -- Ricardo (profissional)
-- );
-- Se rodar várias vezes, deve retornar SEMPRE o mesmo ID!
