-- Criar apenas a tabela notifications que está faltando
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL DEFAULT 'Notificação',
  message TEXT NOT NULL DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Políticas básicas
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Criar índice
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- 5. Verificar se a tabela foi criada
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'notifications';

-- Status: ✅ Tabela notifications criada
-- - Resolve erro 404
-- - RLS habilitado
-- - Políticas básicas configuradas
