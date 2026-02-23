-- Migration: Add reasoning tags to AI Scheduling Predictions
-- Description: Permite armazenar "tags de raciocínio" para análise de viés e telemetria cognitiva.
-- Phase: 0 (Estabilidade Absoluta)

ALTER TABLE ai_scheduling_predictions 
ADD COLUMN IF NOT EXISTS reasoning_tags JSONB DEFAULT '[]';

-- Índice GIN para buscas performáticas dentro do JSONB
CREATE INDEX IF NOT EXISTS idx_predictions_tags 
ON ai_scheduling_predictions USING GIN (reasoning_tags);

COMMENT ON COLUMN ai_scheduling_predictions.reasoning_tags IS 'Tags de raciocínio da IA para análise de viés (ex: ["high_no_show_history", "friday_afternoon"])';
