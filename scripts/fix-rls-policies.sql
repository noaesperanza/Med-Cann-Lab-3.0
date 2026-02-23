-- ============================================================================
-- FIX RLS POLICIES v2 - CORRIGIDO
-- Med-Cann-Lab 3.0
-- Data: 2025-12-23
-- PROBLEMA ANTERIOR: Recursão infinita em chat_participants
-- ============================================================================

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view professionals" ON public.users;
DROP POLICY IF EXISTS "Allow read access to users" ON public.users;

DROP POLICY IF EXISTS "Authenticated users can view their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Allow read chat_rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;

DROP POLICY IF EXISTS "Authenticated users can view their participations" ON public.chat_participants;
DROP POLICY IF EXISTS "Authenticated users can add participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view their participations" ON public.chat_participants;
DROP POLICY IF EXISTS "Allow read chat_participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add participants" ON public.chat_participants;

DROP POLICY IF EXISTS "Authenticated users can view messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow read chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;

-- ============================================================================
-- PASSO 2: CRIAR POLÍTICAS SIMPLES (SEM RECURSÃO!)
-- ============================================================================

-- USERS: Todos autenticados podem ver todos os usuários
CREATE POLICY "users_select_policy"
ON public.users FOR SELECT
USING (true);  -- Simplificado: todos podem ver usuários

-- CHAT_ROOMS: Todos autenticados podem ver e criar salas
CREATE POLICY "chat_rooms_select_policy"
ON public.chat_rooms FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "chat_rooms_insert_policy"
ON public.chat_rooms FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- CHAT_PARTICIPANTS: Usuário vê apenas SUAS participações (sem sub-query!)
CREATE POLICY "chat_participants_select_policy"
ON public.chat_participants FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "chat_participants_insert_policy"
ON public.chat_participants FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- CHAT_MESSAGES: Usuário vê mensagens de salas onde participa
-- Usando uma abordagem diferente para evitar recursão
CREATE POLICY "chat_messages_select_policy"
ON public.chat_messages FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND room_id IN (
    SELECT room_id FROM public.chat_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "chat_messages_insert_policy"
ON public.chat_messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND sender_id = auth.uid()
);

-- ============================================================================
-- PASSO 3: GARANTIR QUE RLS ESTÁ ATIVO
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICAÇÃO: Execute estas queries para testar
-- ============================================================================
-- SELECT * FROM public.users LIMIT 3;
-- SELECT * FROM public.chat_rooms LIMIT 3;
-- SELECT * FROM public.chat_participants LIMIT 3;
-- SELECT * FROM public.chat_messages LIMIT 3;
