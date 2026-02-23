-- ==============================================================================
-- CORREÇÃO: PERMISSÃO DE INSERT EM USERS
-- ==============================================================================
-- O erro 403 ao cadastrar paciente ocorre porque liberamos SELECT (leitura),
-- mas faltou liberar INSERT (escrita) para profissionais e admins.

BEGIN;

-- 1. Policy de INSERT para USERS
DROP POLICY IF EXISTS "Professionals and Admins can insert users" ON users;

CREATE POLICY "Professionals and Admins can insert users" ON users
FOR INSERT WITH CHECK (
    -- Admins (via JWT safe)
    ((auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor'))
    OR
    -- Profissionais (via JWT safe)
    ((auth.jwt() -> 'user_metadata' ->> 'type') IN ('professional', 'profissional', 'doctor', 'medico'))
);

-- 2. Policy de UPDATE para USERS (Caso precisem editar o paciente que criaram)
-- Nota: Aqui é mais restrito. Profissional só edita paciente que tem vínculo.
DROP POLICY IF EXISTS "Professionals can update assigned patients" ON users;

CREATE POLICY "Professionals can update assigned patients" ON users
FOR UPDATE USING (
    -- Mesma lógica segura da função V5
    check_professional_patient_link(id) 
    OR 
    ((auth.jwt() -> 'user_metadata' ->> 'type') IN ('admin', 'master', 'gestor'))
);

COMMIT;

SELECT '✅ Permissão de INSERT liberada para Profissionais e Admins.' as status;
