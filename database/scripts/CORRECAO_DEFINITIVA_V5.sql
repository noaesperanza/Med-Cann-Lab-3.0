-- ==============================================================================
-- CORREÇÃO DEFINITIVA V5: FUNÇÕES SECURITY DEFINER (Antídoto para Loops)
-- ==============================================================================
-- Solução final para o erro 42P17 (Infinite Recursion).
-- Estratégia:
-- 1. Admins: Checagem via JWT (Memória).
-- 2. Profissionais: Checagem via Função SECURITY DEFINER (Bypassa RLS das tabelas filhas).
-- isso impede que a policy de users acione a policy de appointments que aciona users...

BEGIN;

-- 1. LIMPEZA TOTAL (Limpa o terreno para evitar conflitos)
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins and Masters can view all users" ON users;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON users;
DROP POLICY IF EXISTS "Professionals can view assigned patients" ON users;
DROP POLICY IF EXISTS "Users access" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users manage" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;

DROP POLICY IF EXISTS "Admin can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;

DROP POLICY IF EXISTS "Admin can view all clinical assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Professionals can view own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Patients can view own assessments" ON clinical_assessments;

DROP POLICY IF EXISTS "Admin can view all medical records" ON patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view assigned medical records" ON patient_medical_records;
DROP POLICY IF EXISTS "Patients can view own medical records" ON patient_medical_records;


-- 2. CRIAÇÃO DA VACINA (Função Security Definer)
-- Essa função roda como "Superusuário" da tabela, ignorando RLS interno.
-- Ela retorna TRUE se o usuário logado tiver vínculo com o paciente alvo.

CREATE OR REPLACE FUNCTION public.check_professional_patient_link(target_patient_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- <--- O SEGREDO: Roda com permissões do dono, ignora RLS
SET search_path = public -- Segurança
AS $$
    SELECT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.professional_id = auth.uid()
        AND a.patient_id = target_patient_id
    )
    OR
    EXISTS (
        SELECT 1 FROM clinical_assessments ca
        WHERE ca.doctor_id = auth.uid()
        AND ca.patient_id = target_patient_id
    );
$$;

-- 3. CAMADA DE SEGURANÇA NA TABELA USERS

-- A) Login Básico
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (
    id = auth.uid()
);

-- B) Admins (Via JWT - Imune a Loops)
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor')
);

-- C) Profissionais (Via Função Segura - Imune a Loops)
CREATE POLICY "Professionals can view assigned patients" ON users
FOR SELECT USING (
    check_professional_patient_link(id)
);


-- 4. CAMADA DE SEGURANÇA NAS TABELAS FILHAS (Sem subqueries perigosas)

-- APPOINTMENTS
CREATE POLICY "Admin can view all appointments" ON appointments
FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor')
);
CREATE POLICY "Professionals can view own appointments" ON appointments
FOR SELECT USING (
    professional_id = auth.uid() OR doctor_id = auth.uid()
);
CREATE POLICY "Patients can view own appointments" ON appointments
FOR SELECT USING (
    patient_id = auth.uid()
);

-- CLINICAL_ASSESSMENTS
CREATE POLICY "Admin can view all clinical assessments" ON clinical_assessments
FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor')
);
CREATE POLICY "Professionals can view own assessments" ON clinical_assessments
FOR SELECT USING (
    doctor_id = auth.uid()
);
CREATE POLICY "Patients can view own assessments" ON clinical_assessments
FOR SELECT USING (
    patient_id = auth.uid()
);

-- PATIENT_MEDICAL_RECORDS
CREATE POLICY "Admin can view all medical records" ON patient_medical_records
FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor')
);
-- Aqui usamos a mesma função segura para garantir consistência e evitar loop
CREATE POLICY "Professionals can view assigned medical records" ON patient_medical_records
FOR SELECT USING (
     check_professional_patient_link(patient_id)
);
CREATE POLICY "Patients can view own medical records" ON patient_medical_records
FOR SELECT USING (
    patient_id = auth.uid()
);

COMMIT;

SELECT '✅ Correção V5 (DEFINITIVA) Aplicada com Sucesso: Recursão eliminada via Security Definer.' as status;
