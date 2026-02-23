-- 💎 MANIFESTO MEDCANNLAB 5.0 - MASTER UPDATE - V2 (FIXED)
-- MIGRACAO_MANIFESTO_50_V1.sql

-- 1. INFRAESTRUTURA
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_first_completed_at TIMESTAMP WITH TIME ZONE;

-- Tabela de Ciclos de Bônus (Traceabilidade Total)
CREATE TABLE IF NOT EXISTS public.referral_bonus_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.users(id),
    doctor_id UUID REFERENCES public.users(id),
    appointment_id UUID REFERENCES public.appointments(id),
    cycle_number INTEGER CHECK (cycle_number >= 1 AND cycle_number <= 6),
    reference_month TEXT NOT NULL,
    take_rate_generated DECIMAL(10,2) NOT NULL,
    bonus_value DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled', 'reversal')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AUTOMAÇÃO: Marco Zero
-- Nota: Como 'appointments' não tem 'payment_status', usamos a existência de transação paga ou apenas o status 'completed'
CREATE OR REPLACE FUNCTION set_referral_marco_zero() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        -- Verifica se o paciente tem indicador e ainda não tem marco zero
        UPDATE public.users SET referral_first_completed_at = NEW.appointment_date
        WHERE id = NEW.patient_id 
        AND referral_first_completed_at IS NULL 
        AND invited_by IS NOT NULL;
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_referral_marco_zero ON public.appointments;
CREATE TRIGGER tr_set_referral_marco_zero 
AFTER UPDATE OF status ON public.appointments 
FOR EACH ROW 
WHEN (NEW.status = 'completed') 
EXECUTE FUNCTION set_referral_marco_zero();

-- 3. LOGICA: Automação do Bônus (30% do Take Rate)
-- Buscamos o valor da transação vinculada ao agendamento
CREATE OR REPLACE FUNCTION process_appointment_referral_bonus() RETURNS TRIGGER AS $$
DECLARE
    v_doctor_id UUID; 
    v_marco_zero TIMESTAMP WITH TIME ZONE; 
    v_cycle INTEGER; 
    v_bonus DECIMAL(10,2);
    v_payment_amount DECIMAL(10,2);
BEGIN
    -- Busca indicador e marco zero
    SELECT invited_by, referral_first_completed_at INTO v_doctor_id, v_marco_zero 
    FROM public.users WHERE id = NEW.patient_id;
    
    IF v_doctor_id IS NULL OR v_marco_zero IS NULL THEN RETURN NEW; END IF;
    
    -- Calcula ciclo (1-6 meses)
    v_cycle := floor(extract(epoch from (NEW.appointment_date - v_marco_zero)) / 2592000) + 1;
    IF v_cycle > 6 THEN RETURN NEW; END IF;
    
    -- Busca o valor pago na transação vinculada
    SELECT amount INTO v_payment_amount 
    FROM public.transactions 
    WHERE appointment_id = NEW.id AND (status = 'completed' OR status = 'paid') 
    LIMIT 1;

    -- Se não achou transação, assume valor padrão (ex: 300) ou ignora
    IF v_payment_amount IS NULL THEN 
        v_payment_amount := 0; -- Blindagem: só bônus se houver transação
    END IF;
    
    -- No MedCannLab, o Take Rate é o que fica para a plataforma. 
    -- Se v_payment_amount é o valor total, o take rate costuma ser uma % disso.
    -- Aqui calculamos 30% SOBRE o que a plataforma recebe (ex: 20% do total)
    -- Para simplificar conforme Manifesto: 30% da Take Rate.
    -- Vamos assumir uma Take Rate fixa de R$ 60 (20% de uma consulta de R$ 300) se não especificado
    v_bonus := (v_payment_amount * 0.20) * 0.30; 
    
    IF v_bonus <= 0 THEN RETURN NEW; END IF;
    
    -- Registra Ciclo
    INSERT INTO public.referral_bonus_cycles (
        patient_id, 
        doctor_id, 
        appointment_id, 
        cycle_number, 
        reference_month, 
        take_rate_generated, 
        bonus_value, 
        status
    )
    VALUES (
        NEW.patient_id, 
        v_doctor_id, 
        NEW.id, 
        v_cycle, 
        to_char(NEW.appointment_date, 'YYYY-MM'), 
        (v_payment_amount * 0.20), 
        v_bonus, 
        'pending'
    );
    
    -- Registra Transação PENDENTE para o médico
    INSERT INTO public.transactions (user_id, amount, description, type, status, metadata)
    VALUES (
        v_doctor_id, 
        v_bonus, 
        'Bônus Ciclo ' || v_cycle || ' - Paciente: ' || NEW.patient_id, 
        'bonus', 
        'pending', 
        jsonb_build_object('cycle', v_cycle, 'appointment_id', NEW.id)
    );
    
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_process_appointment_referral_bonus ON public.appointments;
CREATE TRIGGER tr_process_appointment_referral_bonus 
AFTER UPDATE OF status ON public.appointments 
FOR EACH ROW 
WHEN (NEW.status = 'completed') 
EXECUTE FUNCTION process_appointment_referral_bonus();
