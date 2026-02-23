-- ==============================================================================
-- CORREÇÃO DEFINITIVA V6: CADASTRO DE PACIENTES + FINANCEIRO (Owner-Based)
-- ==============================================================================
-- 1. "Read Your Own Writes": Adiciona owner_id para o médico ver quem ele cadastrou.
-- 2. "Financial Logic": Adiciona payment_status para controle de adesão (R$ 63,00).

BEGIN;

-- 1. ADICIONAR COLUNAS NECESSÁRIAS
-- owner_id: Quem criou o registro (Dr. Ricardo, Dr. Eduardo...)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- payment_status: 'pending' (padrão), 'paid', 'exempt'
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- payment_amount: Opcional, para histórico (ex: 63.00)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2) DEFAULT 63.00;


-- 2. TRIGGER INTELIGENTE (Auto-Preenchimento)
CREATE OR REPLACE FUNCTION public.handle_new_patient_creation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Se quem está criando é um usuário autenticado (Médico), marca ele como Dono
    IF auth.uid() IS NOT NULL THEN
        NEW.owner_id := auth.uid();
    END IF;
    
    -- Garante que o tipo seja 'paciente' se vier nulo
    IF NEW.type IS NULL THEN
        NEW.type := 'paciente';
    END IF;

    -- Garante status financeiro inicial como 'pending'
    IF NEW.payment_status IS NULL THEN
        NEW.payment_status := 'pending';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_patient_created ON public.users;
CREATE TRIGGER on_patient_created
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_patient_creation();


-- 3. INTERVENÇÃO NAS POLICIES (RLS)

-- A) VISUALIZAÇÃO (SELECT)
-- Médico vê paciente se: TIVER VÍNCULO (V5) ...OU... FOR O DONO (V6)
DROP POLICY IF EXISTS "Professionals can view assigned patients" ON users;

CREATE POLICY "Professionals can view assigned patients" ON users
FOR SELECT USING (
    -- V5: Vínculo via tabela de agendamentos/avaliações
    check_professional_patient_link(id)
    OR
    -- V6: É o criador do registro (acesso imediato após cadastro)
    (owner_id = auth.uid())
);


-- B) INSERÇÃO (INSERT)
-- Liberar INSERT para Admins e Profissionais
DROP POLICY IF EXISTS "Professionals and Admins can insert users" ON users;

CREATE POLICY "Professionals and Admins can insert users" ON users
FOR INSERT WITH CHECK (
    -- Admins
    ((auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor'))
    OR
    -- Profissionais
    ((auth.jwt() -> 'user_metadata' ->> 'type') IN ('professional', 'profissional', 'doctor', 'medico'))
);

-- C) EDIÇÃO (UPDATE)
-- Profissional pode editar se tiver vínculo OU for o dono
DROP POLICY IF EXISTS "Professionals can update assigned patients" ON users;

CREATE POLICY "Professionals can update assigned patients" ON users
FOR UPDATE USING (
    check_professional_patient_link(id) 
    OR 
    (owner_id = auth.uid())
    OR
    ((auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor'))
);

COMMIT;

SELECT '✅ Correção V6 (FINANCEIRA) Aplicada: Owner-Id e Payment-Status configurados.' as status;
