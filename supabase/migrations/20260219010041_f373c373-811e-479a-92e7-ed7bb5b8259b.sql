
-- ================================================================
-- FASE 2: SELAR FLUXOS CLÍNICOS — Normalização e Limpeza
-- ================================================================

-- 1. Normalizar tipo 'professional' → 'profissional' (inglês → português)
UPDATE public.users
SET type = 'profissional'
WHERE type = 'professional';

-- 2. Normalizar tipo 'patient' → 'paciente' (inglês → português)
UPDATE public.users
SET type = 'paciente'
WHERE type = 'patient';

-- 3. Normalizar tipo 'student' → 'aluno' (inglês → português)
UPDATE public.users
SET type = 'aluno'
WHERE type = 'student';

-- 4. Limpar salas de chat do tipo 'professional' sem participantes (lixo de testes)
DELETE FROM chat_rooms
WHERE type = 'professional'
AND id NOT IN (SELECT DISTINCT room_id FROM chat_participants);

-- 5. Garantir que a função create_chat_room_for_patient_uuid existe com assinatura correta
-- (função idempotente: se já existe sala para o par, retorna ela)
CREATE OR REPLACE FUNCTION public.create_chat_room_for_patient_uuid(
  p_patient_id uuid,
  p_professional_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_room_id UUID;
  v_patient_name TEXT;
  v_room_name TEXT;
BEGIN
  -- Verificar sala existente para o par (idempotência)
  SELECT cr.id INTO v_room_id
  FROM chat_rooms cr
  WHERE cr.type = 'patient'
    AND EXISTS (SELECT 1 FROM chat_participants cp1 WHERE cp1.room_id = cr.id AND cp1.user_id = p_patient_id)
    AND EXISTS (SELECT 1 FROM chat_participants cp2 WHERE cp2.room_id = cr.id AND cp2.user_id = p_professional_id)
  LIMIT 1;

  -- Se já existe, retornar
  IF v_room_id IS NOT NULL THEN
    RETURN v_room_id;
  END IF;

  -- Buscar nome do paciente
  SELECT COALESCE(name, email, 'Paciente') INTO v_patient_name
  FROM public.users
  WHERE id = p_patient_id;

  v_room_name := 'Canal de cuidado • ' || v_patient_name;

  -- Criar sala nova
  INSERT INTO chat_rooms (name, type, created_by)
  VALUES (v_room_name, 'patient', auth.uid())
  RETURNING id INTO v_room_id;

  -- Inserir paciente
  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (v_room_id, p_patient_id, 'patient')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  -- Inserir profissional
  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (v_room_id, p_professional_id, 'professional')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  RETURN v_room_id;
END;
$$;

-- 6. Garantir que a cbdrcpremium@gmail.com (João Vidal) tem flag_admin correto
-- (já foi feito antes, mas garantimos idempotência)
UPDATE public.users
SET flag_admin = true
WHERE email = 'cbdrcpremium@gmail.com'
  AND flag_admin IS DISTINCT FROM true;

-- 7. Garantir que Eduardo Faveret tem tipo correto (profissional)
UPDATE public.users
SET type = 'profissional'
WHERE email IN ('eduardoscfaveret@gmail.com', 'eduardo.faveret@hotmail.com', 'iaianoaesperanza@gmail.com')
  AND type != 'profissional';

-- 8. Garantir que todos os admins têm payment_status exempt
UPDATE public.users
SET payment_status = 'exempt'
WHERE type = 'admin'
  AND payment_status IS DISTINCT FROM 'exempt';
