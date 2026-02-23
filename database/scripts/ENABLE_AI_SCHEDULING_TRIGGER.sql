/*
  ENABLE AI SCHEDULING TRIGGER
  ----------------------------
  Este script configura o gatilho assíncrono para o módulo de "Scheduling Risk Intelligence" (Phase 3B).
  
  O QUE ELE FAZ:
  1. Habilita extensão pg_net (se disponível).
  2. Cria função Trigger que chama a Edge Function 'tradevision-core'.
  3. Acopla o trigger à tabela 'appointments' (AFTER INSERT).
  
  COMO USAR:
  1. Substitua 'YOUR_PROJECT_URL' pela URL real do seu projeto Supabase.
  2. Substitua 'YOUR_SERVICE_ROLE_KEY' pela chave de serviço (ou anon key se configurado policy).
  3. Execute no SQL Editor do Supabase.
*/

CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Função Gatilho Assíncrona via HTTP Post
CREATE OR REPLACE FUNCTION public.trigger_ai_scheduling_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_url TEXT := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/tradevision-core'; -- ⚠️ SUBSTITUIR
    v_token TEXT := 'Bearer YOUR_SERVICE_ROLE_KEY'; -- ⚠️ SUBSTITUIR
    v_payload JSONB;
BEGIN
    -- Montar Payload para a Edge Function
    v_payload := jsonb_build_object(
        'action', 'predict_scheduling_risk',
        'appointmentData', jsonb_build_object(
            'appointment_id', NEW.id,
            'patient_id', NEW.patient_id,
            'professional_id', NEW.professional_id,
            'date', NEW.appointment_date
        )
    );

    -- Enviar Request Assíncrono (Fire-and-Forget)
    PERFORM net.http_post(
        url := v_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', v_token
        ),
        body := v_payload
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Não bloquear o insert se a IA falhar
    RAISE WARNING 'Falha ao acionar IA TradeVision: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Criar Gatilho (Trigger)
DROP TRIGGER IF EXISTS trg_ai_predict_risk ON public.appointments;

CREATE TRIGGER trg_ai_predict_risk
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.trigger_ai_scheduling_risk();

COMMENT ON FUNCTION public.trigger_ai_scheduling_risk IS 'Dispara análise de risco de agendamento via Edge Function (Phase 3B)';
