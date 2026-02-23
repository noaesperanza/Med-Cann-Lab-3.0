-- ============================================================================
-- GOVERNANÇA: Chat room — padrão UUID e travamento JSONB
-- Data: 2026-02-09
-- 1) Cria create_chat_room_for_patient_uuid (só UUIDs; nome vindo do banco)
-- 2) Revoga execute da create_chat_room_for_patient_jsonb de anon/authenticated
-- 3) Teste de sanidade (30 s)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Função canônica por UUID (padrão front/API)
-- Nome do paciente obtido de public.users → reduz payload, evita inconsistência
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_chat_room_for_patient_uuid(
  p_patient_id UUID,
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
  v_patient_name TEXT;
BEGIN
  -- Nome do paciente a partir do banco (única fonte da verdade; public.users)
  SELECT COALESCE(NULLIF(TRIM(u.name), ''), split_part(u.email, '@', 1), 'Paciente')
  INTO v_patient_name
  FROM public.users u
  WHERE u.id = p_patient_id
  LIMIT 1;

  v_patient_name := COALESCE(TRIM(v_patient_name), 'Paciente');

  -- 1) Já existe sala entre este paciente e profissional?
  SELECT cr.id INTO v_room_id
  FROM chat_rooms cr
  WHERE cr.type = 'patient'
  AND EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.room_id = cr.id AND cp.user_id = p_patient_id)
  AND EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.room_id = cr.id AND cp.user_id = p_professional_id)
  LIMIT 1;

  IF v_room_id IS NOT NULL THEN
    RETURN v_room_id;
  END IF;

  -- 2) Criar nova sala
  v_room_name := 'Canal de cuidado • ' || v_patient_name;

  INSERT INTO chat_rooms (name, type, created_by)
  VALUES (v_room_name, 'patient', auth.uid())
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

COMMENT ON FUNCTION public.create_chat_room_for_patient_uuid(uuid, uuid) IS
  'Padrão corporativo: cria ou retorna sala paciente-profissional. Nome do paciente vindo de public.users.';

GRANT EXECUTE ON FUNCTION public.create_chat_room_for_patient_uuid(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_chat_room_for_patient_uuid(uuid, uuid) TO anon;


-- ----------------------------------------------------------------------------
-- 2) Travar create_chat_room_for_patient_jsonb (porta lateral)
-- Se a função existir: só service_role pode executar.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'create_chat_room_for_patient_jsonb'
      AND routine_type = 'FUNCTION'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.create_chat_room_for_patient_jsonb(uuid, uuid) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.create_chat_room_for_patient_jsonb(uuid, uuid) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.create_chat_room_for_patient_jsonb(uuid, uuid) TO service_role;
    RAISE NOTICE 'create_chat_room_for_patient_jsonb: execute revogado de anon/authenticated; grant para service_role.';
  ELSE
    RAISE NOTICE 'create_chat_room_for_patient_jsonb não existe; nada a revogar.';
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 3) Teste de sanidade (~30 s)
-- Troque os UUIDs por IDs reais de paciente e profissional no seu ambiente.
-- ----------------------------------------------------------------------------
-- SELECT public.create_chat_room_for_patient_uuid(
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   '00000000-0000-0000-0000-000000000002'::uuid
-- ) AS room_id;
--
-- Depois conferir:
-- SELECT * FROM public.chat_rooms ORDER BY created_at DESC LIMIT 5;
-- SELECT * FROM public.chat_participants ORDER BY joined_at DESC LIMIT 10;

-- ----------------------------------------------------------------------------
-- 4) Confirmação (sempre retorna 1 linha — se ver isto, o script rodou OK)
-- ----------------------------------------------------------------------------
SELECT 'create_chat_room_for_patient_uuid instalada; revoke jsonb aplicado (se existia).' AS status;
