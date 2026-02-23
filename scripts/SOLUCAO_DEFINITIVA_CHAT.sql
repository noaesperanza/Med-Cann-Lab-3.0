-- ============================================================================
-- SOLUÇÃO DEFINITIVA PARA O SISTEMA DE CHAT
-- Data: 2025-12-23
-- Descrição: Este script consolida todas as correções necessárias para o chat:
-- 1. Corrige a função de criar sala (verifica duplicatas)
-- 2. Corrige o trigger de sincronização do Admin (valida existência do usuário)
-- 3. Limpa dependências quebradas se necessário
-- ============================================================================

-- A. CORREÇÃO DA FUNÇÃO DE CRIAR SALA (create_chat_room_for_patient)
-- ============================================================================
DROP FUNCTION IF EXISTS create_chat_room_for_patient(uuid, text, uuid);

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
  ON CONFLICT (room_id, user_id) DO NOTHING;

  -- 5. Adicionar profissional como participante
  INSERT INTO chat_participants (room_id, user_id, role)
  VALUES (v_room_id, p_professional_id, 'professional')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  RAISE NOTICE 'Nova sala criada: %', v_room_id;
  RETURN v_room_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_chat_room_for_patient(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION create_chat_room_for_patient(uuid, text, uuid) TO anon;


-- B. CORREÇÃO DO TRIGGER DE ADMIN (sync_admin_participant)
-- ============================================================================
CREATE OR REPLACE FUNCTION sync_admin_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID := '3d6b170c-c6f3-4e86-a979-37326d9c490a'; -- ID do Admin Ricardo
  v_prof_id UUID := 'b194cfdc-3903-4581-9f93-4a1d5203e08a';  -- ID do Profissional Ricardo
BEGIN
  -- Se o participante adicionado for o Profissional
  IF NEW.user_id = v_prof_id THEN
    
    -- VERIFICAÇÃO DE SEGURANÇA: Checar se o Admin ID existe para evitar erro de FK
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_id) THEN
        INSERT INTO public.chat_participants (room_id, user_id, role)
        VALUES (NEW.room_id, v_admin_id, 'professional')
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Admin sincronizado na sala %', NEW.room_id;
    ELSE
        RAISE WARNING 'Admin não encontrado (ID: %). Sincronização ignorada.', v_admin_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_admin_participant ON public.chat_participants;

CREATE TRIGGER trg_sync_admin_participant
AFTER INSERT ON public.chat_participants
FOR EACH ROW
EXECUTE FUNCTION sync_admin_participant();

-- C. BACKFILL SEGURO
-- ============================================================================
DO $$
DECLARE
  v_admin_id UUID := '3d6b170c-c6f3-4e86-a979-37326d9c490a';
  v_prof_id UUID := 'b194cfdc-3903-4581-9f93-4a1d5203e08a';
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_id) THEN
    INSERT INTO public.chat_participants (room_id, user_id, role)
    SELECT cp.room_id, v_admin_id, 'professional'
    FROM public.chat_participants cp
    WHERE cp.user_id = v_prof_id
    ON CONFLICT (room_id, user_id) DO NOTHING;
    
    RAISE NOTICE 'Backfill executado com sucesso.';
  ELSE
    RAISE WARNING 'Backfill ignorado: Admin ID não encontrado.';
  END IF;
END;
$$;
