-- ============================================================================
-- SQL: SINCRONIZAR ADMIN NO CHAT (TRIGGER & BACKFILL)
-- Adiciona automaticamente o usuário Admin como participante nas salas onde
-- o usuário Profissional (Ricardo) está presente.
-- ============================================================================

-- IDs identificados (substitua se necessário, mas estes foram extraídos dos logs anteriores)
-- Profissional: b194cfdc-3903-4581-9f93-4a1d5203e08a
-- Admin:        3d6b170c-c6f3-4e86-a979-37326d9c490a

-- 1. CRIAR FUNÇÃO DO TRIGGER
CREATE OR REPLACE FUNCTION sync_admin_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com permissões de superusuário para evitar RLS
AS $$
DECLARE
  v_admin_id UUID := '3d6b170c-c6f3-4e86-a979-37326d9c490a'; -- ID do Admin
BEGIN
  -- Se o participante adicionado for o Profissional Ricardo
  IF NEW.user_id = 'b194cfdc-3903-4581-9f93-4a1d5203e08a' THEN
    
    -- VERIFICAÇÃO DE SEGURANÇA: Checar se o Admin ID realmente existe na tabela de usuários
    -- Isso evita o erro: violates foreign key constraint "chat_participants_user_id_fkey"
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_id) THEN
        -- Inserir o Admin Ricardo na mesma sala (se já não estiver)
        INSERT INTO public.chat_participants (room_id, user_id, role)
        VALUES (NEW.room_id, v_admin_id, 'professional')
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Admin sincronizado na sala %', NEW.room_id;
    ELSE
        RAISE WARNING 'Tentativa de sincronizar Admin falhou: Usuário Admin % não encontrado em auth.users', v_admin_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. CRIAR TRIGGER
DROP TRIGGER IF EXISTS trg_sync_admin_participant ON public.chat_participants;

CREATE TRIGGER trg_sync_admin_participant
AFTER INSERT ON public.chat_participants
FOR EACH ROW
EXECUTE FUNCTION sync_admin_participant();

-- 3. BACKFILL (CORRIGIR SALAS EXISTENTES)
-- Encontra todas as salas onde o Profissional está e insere o Admin
DO $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.chat_participants (room_id, user_id, role)
  SELECT cp.room_id, '3d6b170c-c6f3-4e86-a979-37326d9c490a', 'professional'
  FROM public.chat_participants cp
  WHERE cp.user_id = 'b194cfdc-3903-4581-9f93-4a1d5203e08a'
  ON CONFLICT (room_id, user_id) DO NOTHING;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Backfill concluído: Admin adicionado a % salas existentes.', v_count;
END;
$$;
