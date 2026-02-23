/*
  INTEGRAÇÃO AGENDAMENTO FASE 1 - SCHEMA
  Adiciona colunas para suporte a providers externos (Cal.com / Calendly)
  
  Objetivo: Permitir que o agendamento externo sincronize com o banco interno.
*/

-- 1. Adicionar colunas de integração na tabela appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS external_provider TEXT CHECK (external_provider IN ('cal.com', 'calendly', 'google_calendar', 'other')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Index para busca rápida por ID externo (usado no webhook)
CREATE INDEX IF NOT EXISTS idx_appointments_external_id ON public.appointments(external_id);

-- 3. Comentários para documentação
COMMENT ON COLUMN public.appointments.external_id IS 'ID único do evento no provedor externo (ex: uid do Cal.com)';
COMMENT ON COLUMN public.appointments.external_provider IS 'Nome do sistema que originou o agendamento';
COMMENT ON COLUMN public.appointments.meeting_url IS 'URL da sala de conferência (ex: Google Meet, Zoom)';
