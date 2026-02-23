-- =====================================================
-- 💰 SISTEMA FINANCEIRO COMPLETO - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. ATUALIZAR TABELA TRANSACTIONS
-- =====================================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subscription_plan_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10,2) DEFAULT 0;

-- 2. CRIAR TABELA: SUBSCRIPTION_PLANS
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- "Med Cann 150", "Med Cann 250", "Med Cann 350"
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL, -- 150.00, 250.00, 350.00
  annual_price DECIMAL(10,2),
  consultation_discount INTEGER NOT NULL, -- 10, 20, 30 (porcentagem)
  features JSONB DEFAULT '[]', -- Lista de benefícios
  is_remote_only BOOLEAN DEFAULT true, -- Atendimento exclusivamente online
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA: USER_SUBSCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  next_billing_at TIMESTAMP WITH TIME ZONE, -- Próxima cobrança mensal
  auto_renew BOOLEAN DEFAULT true,
  payment_method_id TEXT, -- ID do cartão salvo no Mercado Pago
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id) -- Um usuário pode ter apenas uma assinatura ativa por plano
);

-- 4. INSERIR PLANOS DE ASSINATURA
-- =====================================================
INSERT INTO subscription_plans (name, description, monthly_price, consultation_discount, features, is_active) VALUES
(
  'Med Cann 150',
  'Plano básico com desconto de 10% nas consultas exclusivamente online',
  150.00,
  10,
  '[
    "Desconto de 10% em consultas online",
    "Acesso à biblioteca de documentos",
    "Suporte via chat",
    "Avaliação IMRE inicial"
  ]'::jsonb,
  true
),
(
  'Med Cann 250',
  'Plano intermediário com desconto de 20% nas consultas exclusivamente online',
  250.00,
  20,
  '[
    "Desconto de 20% em consultas online",
    "Tudo do plano anterior",
    "Consultas prioritárias",
    "Relatórios detalhados",
    "Acesso a cursos online"
  ]'::jsonb,
  true
),
(
  'Med Cann 350',
  'Plano premium com desconto de 30% nas consultas exclusivamente online',
  350.00,
  30,
  '[
    "Desconto de 30% em consultas online",
    "Tudo dos planos anteriores",
    "Suporte prioritário 24/7",
    "Consultas ilimitadas",
    "Acesso completo à plataforma",
    "Reembolsos garantidos"
  ]'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  monthly_price = EXCLUDED.monthly_price,
  consultation_discount = EXCLUDED.consultation_discount,
  features = EXCLUDED.features;

-- 5. HABILITAR RLS
-- =====================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS - SUBSCRIPTION_PLANS
-- =====================================================

-- Todos podem visualizar planos ativos
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- 7. POLÍTICAS RLS - USER_SUBSCRIPTIONS
-- =====================================================

-- Usuários podem ver suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias assinaturas
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias assinaturas
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- 9. FUNÇÃO PARA CALCULAR DESCONTO DE ASSINATURA
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_subscription_discount(
  p_user_id UUID,
  p_consultation_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_discount_percentage INTEGER := 0;
  v_discount_amount DECIMAL := 0;
BEGIN
  -- Buscar desconto da assinatura ativa do usuário
  SELECT sp.consultation_discount INTO v_discount_percentage
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND us.expires_at > NOW()
  LIMIT 1;
  
  -- Calcular valor do desconto
  IF v_discount_percentage > 0 THEN
    v_discount_amount := (p_consultation_amount * v_discount_percentage) / 100;
  END IF;
  
  RETURN v_discount_amount;
END;
$$ LANGUAGE plpgsql;

-- 10. VISUALIZAÇÃO: ASSINATURAS ATIVAS
-- =====================================================
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  us.id,
  us.user_id,
  sp.name AS plan_name,
  sp.monthly_price,
  sp.consultation_discount,
  us.status,
  us.started_at,
  us.expires_at,
  us.next_billing_at,
  us.auto_renew,
  CASE 
    WHEN us.expires_at > NOW() THEN true
    ELSE false
  END AS is_active
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active';

-- 11. COMENTÁRIOS DAS TABELAS
-- =====================================================
COMMENT ON TABLE subscription_plans IS 'Planos de assinatura disponíveis (Med Cann 150, 250, 350)';
COMMENT ON TABLE user_subscriptions IS 'Assinaturas ativas dos usuários';
COMMENT ON FUNCTION calculate_subscription_discount IS 'Calcula desconto da assinatura para consultas';

-- 12. VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
  '✅ Sistema Financeiro configurado com sucesso!' AS status,
  (SELECT COUNT(*) FROM subscription_plans) AS total_plans,
  (SELECT COUNT(*) FROM user_subscriptions) AS total_subscriptions;
