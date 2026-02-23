-- 🦅 TRADEVISION I.A SCHEMA --
-- Criação das tabelas de auditoria e logs para o sistema TradeVision

-- 1. Tabela de Interações (O "Espelho")
-- Armazena cada interação entre usuário e IA para auditoria clínica
CREATE TABLE IF NOT EXISTS public.ai_chat_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Opcional, se estiver falando de um paciente
    
    -- Conteúdo
    user_message TEXT,
    ai_response TEXT,
    
    -- Metadados de Auditoria
    intent TEXT, -- 'clinical_query', 'dev_debug', 'greeting', etc
    confidence NUMERIC, -- 0.0 a 1.0
    model TEXT, -- 'gpt-4o-mini', 'gpt-4', etc
    
    -- Campos Técnicos
    processing_time INTEGER, -- em ms
    input_tokens INTEGER,
    output_tokens INTEGER,
    
    -- Flags
    is_dev_mode BOOLEAN DEFAULT FALSE, -- Se foi gerado em modo 'Dev Vivo'
    
    -- JSON para dados extras (flexibilidade)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Habilitar RLS
ALTER TABLE public.ai_chat_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS)
-- Admins veem tudo. Usuários veem apenas seus próprios chats.
CREATE POLICY "Admins view all interactions" ON public.ai_chat_interactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.type = 'admin')
        )
    );

CREATE POLICY "Users view own interactions" ON public.ai_chat_interactions
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users insert own interactions" ON public.ai_chat_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 2. Tabela de Auditoria do "Dev Vivo"
-- Tabela rigorosa para registrar quem ativou o modo de desenvolvimento em produção
CREATE TABLE IF NOT EXISTS public.dev_vivo_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    executed_by UUID REFERENCES auth.users(id),
    
    command_text TEXT,
    context_snapshot JSONB, -- Estado do sistema no momento
    
    reason TEXT -- Motivo da ativação (opcional)
);

-- RLS para Audit
ALTER TABLE public.dev_vivo_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins only audit" ON public.dev_vivo_audit
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.type = 'admin')
        )
    );

-- 3. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON public.ai_chat_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_created ON public.ai_chat_interactions(created_at DESC);
