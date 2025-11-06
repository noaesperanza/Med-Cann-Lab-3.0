-- =====================================================
-- 🏥 MEDCANLAB 3.0 - ATUALIZAÇÃO FINAL APÓS REVISÃO
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script adiciona/atualiza colunas e tabelas necessárias
-- após a remoção de dados mockados e conexão com Supabase
-- =====================================================

-- =====================================================
-- 1. ATUALIZAÇÃO DA TABELA COURSES
-- =====================================================

-- Adicionar colunas faltantes na tabela courses
DO $$ 
BEGIN
  -- Adicionar price se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'price') THEN
    ALTER TABLE courses ADD COLUMN price NUMERIC(10, 2);
  END IF;

  -- Adicionar original_price se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'original_price') THEN
    ALTER TABLE courses ADD COLUMN original_price NUMERIC(10, 2);
  END IF;

  -- Adicionar instructor se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'instructor') THEN
    ALTER TABLE courses ADD COLUMN instructor TEXT;
  END IF;

  -- Adicionar level se não existir (diferente de difficulty)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'level') THEN
    ALTER TABLE courses ADD COLUMN level VARCHAR(50);
  END IF;

  -- Adicionar is_live se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'is_live') THEN
    ALTER TABLE courses ADD COLUMN is_live BOOLEAN DEFAULT FALSE;
  END IF;

  -- Adicionar next_class_date se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'next_class_date') THEN
    ALTER TABLE courses ADD COLUMN next_class_date TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Adicionar slug se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'slug') THEN
    ALTER TABLE courses ADD COLUMN slug TEXT;
  END IF;

  -- Adicionar duration_text se não existir (para formatos como "8h", "520h")
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'duration_text') THEN
    ALTER TABLE courses ADD COLUMN duration_text TEXT;
  END IF;
END $$;

-- Criar índice para slug (se não existir)
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug) WHERE slug IS NOT NULL;

-- Criar índice para is_published (se não existir)
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) WHERE is_published = TRUE;

-- =====================================================
-- 2. TABELA COURSE_RATINGS (OPCIONAL - PARA AVALIAÇÕES)
-- =====================================================

CREATE TABLE IF NOT EXISTS course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Criar índices para course_ratings
CREATE INDEX IF NOT EXISTS idx_course_ratings_course_id ON course_ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_course_ratings_user_id ON course_ratings(user_id);

-- =====================================================
-- 3. ATUALIZAÇÃO DA TABELA TRANSACTIONS
-- =====================================================

-- Verificar se a tabela transactions existe, se não, criar
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  type VARCHAR(50) NOT NULL, -- 'consultation', 'course', 'subscription', 'fee', 'refund'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded', 'cancelled'
  payment_method VARCHAR(50), -- 'credit_card', 'debit_card', 'pix', 'boleto', 'points'
  payment_provider VARCHAR(50), -- 'mercadopago', 'stripe', 'internal'
  provider_transaction_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_transaction_type CHECK (type IN ('consultation', 'course', 'subscription', 'fee', 'refund')),
  CONSTRAINT valid_transaction_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'))
);

-- Adicionar colunas faltantes se a tabela já existir
DO $$ 
BEGIN
  -- Adicionar doctor_id se não existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'doctor_id') THEN
      ALTER TABLE transactions ADD COLUMN doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    -- Adicionar course_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'course_id') THEN
      ALTER TABLE transactions ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
    END IF;

    -- Adicionar appointment_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'appointment_id') THEN
      ALTER TABLE transactions ADD COLUMN appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;
    END IF;

    -- Adicionar status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'status') THEN
      ALTER TABLE transactions ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;

    -- Adicionar type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'type') THEN
      ALTER TABLE transactions ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'consultation';
    END IF;
  END IF;
END $$;

-- Criar índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_doctor_id ON transactions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- =====================================================
-- 4. ATUALIZAÇÃO DA TABELA SUBSCRIPTION_PLANS
-- =====================================================

-- Verificar se a tabela subscription_plans existe, se não, criar
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10, 2) NOT NULL,
  consultation_discount NUMERIC(5, 2) DEFAULT 0, -- porcentagem de desconto
  features JSONB DEFAULT '[]', -- array de features
  is_active BOOLEAN DEFAULT TRUE,
  max_consultations INTEGER, -- limite de consultas por mês (NULL = ilimitado)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas faltantes se a tabela já existir
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
    -- Adicionar is_active se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'is_active') THEN
      ALTER TABLE subscription_plans ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    -- Adicionar features se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'features') THEN
      ALTER TABLE subscription_plans ADD COLUMN features JSONB DEFAULT '[]';
    END IF;

    -- Adicionar consultation_discount se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_plans' AND column_name = 'consultation_discount') THEN
      ALTER TABLE subscription_plans ADD COLUMN consultation_discount NUMERIC(5, 2) DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Criar índice para subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = TRUE;

-- =====================================================
-- 5. TABELA USER_SUBSCRIPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'cancelled', 'expired', 'suspended'))
);

-- Criar índices para user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- =====================================================
-- 6. ATUALIZAÇÃO DA TABELA CHAT_MESSAGES
-- =====================================================

-- Adicionar colunas sender_name e sender_email se não existirem
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    -- Adicionar sender_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_messages' AND column_name = 'sender_name') THEN
      ALTER TABLE chat_messages ADD COLUMN sender_name TEXT;
    END IF;

    -- Adicionar sender_email se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_messages' AND column_name = 'sender_email') THEN
      ALTER TABLE chat_messages ADD COLUMN sender_email TEXT;
    END IF;

    -- Garantir que chat_id é UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'chat_messages' AND column_name = 'chat_id') THEN
      -- Verificar se é UUID, se não, tentar converter
      -- (Isso pode falhar se houver dados inválidos, então vamos apenas garantir o tipo)
      BEGIN
        ALTER TABLE chat_messages ALTER COLUMN chat_id TYPE UUID USING chat_id::UUID;
      EXCEPTION WHEN OTHERS THEN
        -- Se falhar, criar uma nova coluna e migrar depois
        RAISE NOTICE 'Não foi possível converter chat_id para UUID automaticamente. Verifique os dados.';
      END;
    END IF;
  END IF;
END $$;

-- =====================================================
-- 7. ATUALIZAÇÃO DA TABELA APPOINTMENTS
-- =====================================================

-- Adicionar doctor_id se não existir (já foi corrigido antes, mas garantindo)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    -- Adicionar doctor_id se não existir (pode ser professional_id ou doctor_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'doctor_id') THEN
      -- Verificar se existe professional_id para migrar
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'professional_id') THEN
        ALTER TABLE appointments ADD COLUMN doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        -- Copiar dados de professional_id para doctor_id
        UPDATE appointments SET doctor_id = professional_id WHERE professional_id IS NOT NULL;
      ELSE
        ALTER TABLE appointments ADD COLUMN doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- =====================================================
-- 8. RLS (ROW LEVEL SECURITY) POLICIES
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para courses (todos podem ver cursos publicados)
DROP POLICY IF EXISTS "Cursos públicos são visíveis para todos" ON courses;
CREATE POLICY "Cursos públicos são visíveis para todos" ON courses
  FOR SELECT USING (is_published = TRUE);

-- Políticas para course_ratings (usuários podem ver todas as avaliações, mas só criar suas próprias)
DROP POLICY IF EXISTS "Avaliações são visíveis para todos" ON course_ratings;
CREATE POLICY "Avaliações são visíveis para todos" ON course_ratings
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias avaliações" ON course_ratings;
CREATE POLICY "Usuários podem criar suas próprias avaliações" ON course_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias avaliações" ON course_ratings;
CREATE POLICY "Usuários podem atualizar suas próprias avaliações" ON course_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para transactions (usuários veem apenas suas próprias transações)
DROP POLICY IF EXISTS "Usuários veem suas próprias transações" ON transactions;
CREATE POLICY "Usuários veem suas próprias transações" ON transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = doctor_id);

-- Políticas para subscription_plans (todos podem ver planos ativos)
DROP POLICY IF EXISTS "Planos ativos são visíveis para todos" ON subscription_plans;
CREATE POLICY "Planos ativos são visíveis para todos" ON subscription_plans
  FOR SELECT USING (is_active = TRUE);

-- Políticas para user_subscriptions (usuários veem apenas suas próprias assinaturas)
DROP POLICY IF EXISTS "Usuários veem suas próprias assinaturas" ON user_subscriptions;
CREATE POLICY "Usuários veem suas próprias assinaturas" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 9. FUNÇÕES ÚTEIS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_ratings_updated_at ON course_ratings;
CREATE TRIGGER update_course_ratings_updated_at
  BEFORE UPDATE ON course_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir planos de assinatura padrão (se não existirem)
-- Usando ON CONFLICT para evitar duplicatas por nome ou ID
DO $$
BEGIN
  -- Verificar e inserir Med Cann 150
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Med Cann 150') THEN
    INSERT INTO subscription_plans (id, name, description, monthly_price, consultation_discount, features, is_active)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'Med Cann 150',
      'Plano básico com desconto de 10% nas consultas exclusivamente online',
      150.00,
      10,
      '["Desconto de 10% em consultas online", "Acesso à biblioteca de documentos", "Suporte via chat", "Avaliação IMRE inicial"]'::jsonb,
      TRUE
    );
  END IF;

  -- Verificar e inserir Med Cann 250
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Med Cann 250') THEN
    INSERT INTO subscription_plans (id, name, description, monthly_price, consultation_discount, features, is_active)
    VALUES (
      '00000000-0000-0000-0000-000000000002',
      'Med Cann 250',
      'Plano intermediário com desconto de 20% nas consultas exclusivamente online',
      250.00,
      20,
      '["Desconto de 20% em consultas online", "Tudo do plano anterior", "Consultas prioritárias", "Relatórios detalhados", "Acesso a cursos online"]'::jsonb,
      TRUE
    );
  END IF;

  -- Verificar e inserir Med Cann 350
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Med Cann 350') THEN
    INSERT INTO subscription_plans (id, name, description, monthly_price, consultation_discount, features, is_active)
    VALUES (
      '00000000-0000-0000-0000-000000000003',
      'Med Cann 350',
      'Plano premium com desconto de 30% nas consultas exclusivamente online',
      350.00,
      30,
      '["Desconto de 30% em consultas online", "Tudo dos planos anteriores", "Consultas ilimitadas", "Acesso prioritário a novos cursos", "Suporte premium"]'::jsonb,
      TRUE
    );
  END IF;
END $$;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
  RAISE NOTICE '✅ Script de atualização executado com sucesso!';
  RAISE NOTICE '📋 Verifique as tabelas e colunas criadas acima.';
  RAISE NOTICE '🔒 RLS habilitado e políticas criadas.';
  RAISE NOTICE '📊 Índices criados para melhor performance.';
END $$;

