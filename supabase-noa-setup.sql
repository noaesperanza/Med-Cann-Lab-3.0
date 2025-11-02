-- Script SQL para configurar as tabelas da NOA no Supabase

-- Tabela para interações do usuário
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  text_raw TEXT NOT NULL,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para análise semântica
CREATE TABLE IF NOT EXISTS semantic_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES user_interactions(id) ON DELETE CASCADE,
  topics TEXT[],
  emotions TEXT,
  biomedical_terms TEXT[],
  interpretations TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_semantic_analysis_chat_id ON semantic_analysis(chat_id);

-- RLS (Row Level Security) - opcional, descomente se necessário
-- ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE semantic_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (opcional)
-- CREATE POLICY "Users can view their own interactions" ON user_interactions
--   FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert their own interactions" ON user_interactions
--   FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can view their own analysis" ON semantic_analysis
--   FOR SELECT USING (chat_id IN (
--     SELECT id FROM user_interactions WHERE user_id = auth.uid()::text
--   ));

-- CREATE POLICY "Users can insert their own analysis" ON semantic_analysis
--   FOR INSERT WITH CHECK (chat_id IN (
--     SELECT id FROM user_interactions WHERE user_id = auth.uid()::text
--   ));

-- Função para limpar dados antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_interactions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_interactions 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comentários das tabelas
COMMENT ON TABLE user_interactions IS 'Armazena todas as interações do usuário com a NOA';
COMMENT ON TABLE semantic_analysis IS 'Armazena a análise semântica das interações do usuário';

COMMENT ON COLUMN user_interactions.text_raw IS 'Texto original da mensagem do usuário';
COMMENT ON COLUMN user_interactions.context IS 'Contexto da conversa (últimas mensagens)';
COMMENT ON COLUMN semantic_analysis.topics IS 'Tópicos identificados na mensagem';
COMMENT ON COLUMN semantic_analysis.emotions IS 'Análise emocional (POSITIVE, NEGATIVE, NEUTRAL)';
COMMENT ON COLUMN semantic_analysis.biomedical_terms IS 'Termos biomédicos identificados';
COMMENT ON COLUMN semantic_analysis.interpretations IS 'Interpretação clínica da mensagem';
COMMENT ON COLUMN semantic_analysis.confidence IS 'Nível de confiança da análise (0-1)';
