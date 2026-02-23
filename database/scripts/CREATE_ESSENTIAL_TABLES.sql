-- Criar apenas as tabelas essenciais que estão causando erros
-- Execute este script no Supabase SQL Editor

-- 1. Tabela de notificações (para resolver erro 404)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL DEFAULT 'Notificação',
  message TEXT NOT NULL DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de mensagens de chat (para o chat em tempo real)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'general',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 3. Tabela de perfis (para dados dos usuários)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  specialty TEXT,
  crm TEXT,
  cro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas básicas
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view chat messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6. Habilitar tempo real para chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 7. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- 8. Verificar se as tabelas foram criadas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('notifications', 'chat_messages', 'profiles')
ORDER BY tablename;

-- Status: ✅ Tabelas essenciais criadas
-- - notifications: Para resolver erro 404
-- - chat_messages: Para chat em tempo real
-- - profiles: Para dados dos usuários
-- - RLS habilitado
-- - Políticas básicas configuradas
-- - Tempo real ativado para chat
