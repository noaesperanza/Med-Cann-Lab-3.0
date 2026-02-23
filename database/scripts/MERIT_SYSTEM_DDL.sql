-- ==============================================================================
-- 🏆 MERIT_SYSTEM_DDL.sql
-- Objetivo: Estrutura para Ranking, Mérito Sustentado e Benefícios
-- Data: 02/02/2026 (Updated: Fix Missing Columns)
-- Dependências: users (public)
-- ==============================================================================

-- 0. Tabela de Perfis de Gamificação (Base dos Pontos)
-- Necessária porque 'points' não está na tabela 'users' original
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    
    points integer DEFAULT 0,
    level integer DEFAULT 1,
    achievements text[] DEFAULT '{}',
    
    last_activity timestamptz DEFAULT now(),
    
    CONSTRAINT uq_user_profiles_user_id UNIQUE (user_id)
);

-- Index para Join rápido
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON public.user_profiles(points DESC);


-- 1. Tabela de Snapshots Mensais de Ranking (Histórico)
CREATE TABLE IF NOT EXISTS public.ranking_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    reference_month date NOT NULL, -- Ex: '2026-02-01'
    
    -- Métricas do Mês
    total_points_earned integer DEFAULT 0,
    assessments_completed integer DEFAULT 0,
    referrals_active integer DEFAULT 0,
    
    -- Resultado do Ranking
    global_rank_position integer, 
    percentile decimal(5,2),      
    tier_label text,              -- 'ELITE', 'PLATINUM', 'GOLD', 'STANDARD'
    
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, reference_month)
);

-- 2. Tabela de Elegibilidade e Benefícios Ativos
CREATE TABLE IF NOT EXISTS public.user_benefits_status (
    user_id uuid REFERENCES public.users(id) PRIMARY KEY,
    is_eligible boolean DEFAULT false, -- True se 3 meses consecutivos Top 5%
    
    -- Controle de Consecutividade
    consecutive_months_top5 integer DEFAULT 0,
    last_month_checked date,
    
    -- Benefício: Desconto Progressivo
    current_discount_percent integer DEFAULT 0, 
    discount_updated_at timestamptz,
    
    -- Benefício: Consulta Gratuita
    free_consultations_balance integer DEFAULT 0, 
    last_consultation_grant_date date,
    
    updated_at timestamptz DEFAULT now()
);

-- 3. Histórico de Uso de Benefícios
CREATE TABLE IF NOT EXISTS public.benefit_usage_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    
    benefit_type text NOT NULL, 
    details jsonb DEFAULT '{}', 
    value_monetary decimal(10,2), 
    
    used_at timestamptz DEFAULT now()
);

-- 4. Função Auxiliar para Calcular Percentil (Live View)
-- CORRIGIDO: Agora fazendo JOIN com user_profiles para pegar pontos
CREATE OR REPLACE VIEW public.view_current_ranking_live AS
SELECT 
    u.id as user_id,
    u.name,
    COALESCE(p.points, 0) as current_points,
    p.level,
    PERCENT_RANK() OVER (ORDER BY COALESCE(p.points, 0) DESC) as percentile_rank
FROM 
    public.users u
LEFT JOIN 
    public.user_profiles p ON u.id = p.user_id;

-- Segurança (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_usage_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura
CREATE POLICY "Public profiles read" ON public.user_profiles FOR SELECT USING (true); -- Leaderboard público
CREATE POLICY "Users read own history" ON public.ranking_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own benefit status" ON public.user_benefits_status FOR SELECT USING (auth.uid() = user_id);


-- TRIGGER: Criar user_profile automaticamente ao criar user
CREATE OR REPLACE FUNCTION public.handle_new_user_profile() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, points, level)
  VALUES (NEW.id, 0, 1)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON public.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
