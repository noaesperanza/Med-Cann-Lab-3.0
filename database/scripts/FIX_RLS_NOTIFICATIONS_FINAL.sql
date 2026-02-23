-- =====================================================
-- 🔒 FIX RLS FINAL: Políticas para notificações de videochamada
-- =====================================================
-- Problema: RLS bloqueia criação de notificações mesmo com política
-- Solução: Remover política restritiva e usar apenas política permissiva
-- Data: 06/02/2026

-- 1. Remover TODAS as políticas INSERT existentes
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert video call notifications for others" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- 2. Criar política única e permissiva para INSERT
-- Permite inserir notificações quando:
-- - É para si mesmo (auth.uid() = user_id)
-- - OU é notificação de videochamada (type = 'video_call_request')
-- - OU tem metadata com request_id (indica videochamada)
CREATE POLICY "Users can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  -- Permite para si mesmo
  auth.uid() = user_id
  OR
  -- Permite notificações de videochamada
  type = 'video_call_request'
  OR
  -- Permite se metadata contém request_id
  (metadata IS NOT NULL AND metadata ? 'request_id')
);

-- 3. Verificar políticas criadas
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

-- Status: ✅ Política RLS única e permissiva criada
-- - Permite inserir para si mesmo
-- - Permite inserir notificações de videochamada para outros
-- - Sem conflitos entre múltiplas políticas
