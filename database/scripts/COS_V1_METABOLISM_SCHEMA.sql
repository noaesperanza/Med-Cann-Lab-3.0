-- 📜 COS v1.0: INFRAESTRUTURA DE METABOLISMO E TRAUMA
-- Orquestrado por Pedro Henrique Passos Galluf

-- 1. ÓRGÃO DE METABOLISMO (Regulação de Energia/Frequência)
CREATE TABLE IF NOT EXISTS public.cognitive_metabolism (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES auth.users(id),
    decision_count_today INTEGER DEFAULT 0,
    decision_limit_daily INTEGER DEFAULT 100,
    silence_mode_active BOOLEAN DEFAULT FALSE,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ÓRGÃO DE TRAUMA (Protocolo de Sobrevivência)
CREATE TABLE IF NOT EXISTS public.institutional_trauma_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    severity TEXT CHECK (severity IN ('LOW', 'HIGH', 'CRITICAL')),
    reason TEXT,
    affected_domain TEXT DEFAULT 'CLINICAL',
    recovery_estimated_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS e Permissões
ALTER TABLE public.cognitive_metabolism ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_trauma_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON public.cognitive_metabolism FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.institutional_trauma_log FOR SELECT TO authenticated USING (true);

-- 4. Função para reset diário do metabolismo (Cron Jobs futuros)
CREATE OR REPLACE FUNCTION reset_daily_metabolism() RETURNS void AS $$
BEGIN
    UPDATE public.cognitive_metabolism SET decision_count_today = 0;
END;
$$ LANGUAGE plpgsql;
