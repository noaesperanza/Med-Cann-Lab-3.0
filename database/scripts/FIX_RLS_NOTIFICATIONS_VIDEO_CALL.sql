-- =====================================================
-- 🔒 FIX RLS: Políticas para notificações de videochamada
-- =====================================================
-- Erro: "new row violates row-level security policy for table 'notifications'"
-- Problema: RLS bloqueia criação de notificações para outros usuários
-- Data: 06/02/2026

-- 1. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY policyname;

-- 2. Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- 3. Criar políticas mais flexíveis para videochamadas

-- Política: Usuários podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar notificações para si mesmos
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem criar notificações para outros (videochamadas)
-- IMPORTANTE: Permite criar notificações para outros usuários quando:
-- - É uma notificação de videochamada (type = 'video_call_request')
-- - Ou quando o metadata contém request_id (indica videochamada)
CREATE POLICY "Users can insert video call notifications for others"
ON public.notifications
FOR INSERT
WITH CHECK (
  -- Permite se for notificação de videochamada
  type = 'video_call_request' OR
  -- Ou se metadata contém request_id (indica videochamada)
  (metadata IS NOT NULL AND metadata ? 'request_id')
);

-- Política: Usuários podem atualizar suas próprias notificações
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'Sem USING'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
    ELSE 'Sem WITH CHECK'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notifications'
ORDER BY policyname;

-- Status: ✅ Políticas RLS criadas
-- - Usuários podem ver suas próprias notificações
-- - Usuários podem criar notificações para si mesmos
-- - Usuários podem criar notificações de videochamada para outros
-- - Usuários podem atualizar suas próprias notificações
