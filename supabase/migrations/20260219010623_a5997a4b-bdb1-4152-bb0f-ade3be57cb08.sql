
-- PARTE 1: Drop funções conflitantes e recriar funções de chat

DROP FUNCTION IF EXISTS public.get_chat_participants_for_room(UUID);
DROP FUNCTION IF EXISTS public.get_chat_user_profiles(UUID[]);

-- Função para get_chat_participants_for_room (RPC sem recursão RLS)
CREATE FUNCTION public.get_chat_participants_for_room(p_room_id UUID)
RETURNS TABLE (user_id UUID, role TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.user_id, cp.role
  FROM chat_participants cp
  WHERE cp.room_id = p_room_id
    AND EXISTS (
      SELECT 1 FROM chat_participants cp2
      WHERE cp2.room_id = p_room_id AND cp2.user_id = auth.uid()
    );
$$;

-- Função get_chat_user_profiles (sem recursão RLS)
CREATE FUNCTION public.get_chat_user_profiles(p_user_ids UUID[])
RETURNS TABLE (user_id UUID, name TEXT, email TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id::UUID, u.name::TEXT, u.email::TEXT
  FROM public.users u
  WHERE u.id = ANY(p_user_ids);
$$;

-- Função para criar sala de chat idempotente
CREATE OR REPLACE FUNCTION public.create_chat_room_for_patient_uuid(
  p_patient_id UUID,
  p_patient_name TEXT,
  p_professional_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_room_name TEXT;
BEGIN
  SELECT cr.id INTO v_room_id
  FROM chat_rooms cr
  WHERE cr.type = 'patient'
    AND EXISTS (SELECT 1 FROM chat_participants cp1 WHERE cp1.room_id = cr.id AND cp1.user_id = p_patient_id)
    AND EXISTS (SELECT 1 FROM chat_participants cp2 WHERE cp2.room_id = cr.id AND cp2.user_id = p_professional_id)
  LIMIT 1;

  IF v_room_id IS NOT NULL THEN
    RETURN v_room_id;
  END IF;

  v_room_name := 'Canal de cuidado • ' || COALESCE(p_patient_name, 'Paciente');

  INSERT INTO chat_rooms (name, type, created_by)
  VALUES (v_room_name, 'patient', p_professional_id)
  RETURNING id INTO v_room_id;

  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (v_room_id, p_patient_id, 'patient')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (v_room_id, p_professional_id, 'professional')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  RETURN v_room_id;
END;
$$;
