-- =====================================================
-- 🛠️ FIX: Erro 403 em patient_medical_records
-- =====================================================
-- Erro observado:
--   GET /rest/v1/patient_medical_records?select=*&patient_id=eq.XXX 403 (Forbidden)
--
-- Causa:
--   Políticas RLS muito restritivas ou ausentes para admin/profissionais
--   que precisam acessar registros médicos de pacientes
--
-- Estratégia do fix:
--   - Adicionar política para admin ver todos os registros
--   - Melhorar política para profissionais (usar função SECURITY DEFINER)
--   - Garantir que pacientes vejam seus próprios registros
--
-- Seguro para reexecução (DROP IF EXISTS).
-- Data: 06/02/2026

set search_path = public;

-- =====================================================
-- 1) Garantir RLS habilitado
-- =====================================================
ALTER TABLE public.patient_medical_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2) Função helper para verificar vínculo profissional-paciente
-- =====================================================
-- Verifica se há vínculo através de:
-- - clinical_reports (professional_id + patient_id)
-- - clinical_assessments (doctor_id + patient_id)
-- - appointments (professional_id + patient_id)
-- - chat_participants (ambos na mesma sala de chat)
CREATE OR REPLACE FUNCTION public.is_professional_patient_link(_patient_id uuid, _professional_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    -- Vínculo via clinical_reports
    SELECT 1
    FROM public.clinical_reports cr
    WHERE cr.patient_id = _patient_id
      AND cr.professional_id = _professional_id
    UNION
    -- Vínculo via clinical_assessments
    SELECT 1
    FROM public.clinical_assessments ca
    WHERE ca.patient_id = _patient_id
      AND ca.doctor_id = _professional_id
    UNION
    -- Vínculo via appointments
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = _patient_id
      AND a.professional_id = _professional_id
    UNION
    -- Vínculo via chat (ambos na mesma sala)
    SELECT 1
    FROM public.chat_participants cp1
    INNER JOIN public.chat_participants cp2 ON cp1.room_id = cp2.room_id
    WHERE cp1.user_id = _professional_id
      AND cp2.user_id = _patient_id
      AND cp1.room_id = cp2.room_id
  );
$$;

-- =====================================================
-- 3) Função helper para verificar se é admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = _user_id
      AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
  );
$$;

-- =====================================================
-- 4) Remover políticas antigas (idempotente)
-- =====================================================
DROP POLICY IF EXISTS "Patients can view own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view assigned medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can view all medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Patients can insert own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can insert patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can insert medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Patients can update own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can update patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can update medical records" ON public.patient_medical_records;

-- =====================================================
-- 5) Criar políticas RLS (SELECT)
-- =====================================================

-- Admin: vê todos os registros
CREATE POLICY "Admin can view all medical records"
  ON public.patient_medical_records
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

-- Profissional: vê registros de pacientes vinculados
CREATE POLICY "Professionals can view patient records"
  ON public.patient_medical_records
  FOR SELECT
  TO authenticated
  USING (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

-- Paciente: vê seus próprios registros
CREATE POLICY "Patients can view own medical records"
  ON public.patient_medical_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- =====================================================
-- 6) Criar políticas RLS (INSERT)
-- =====================================================

-- Paciente: pode inserir seus próprios registros
CREATE POLICY "Patients can insert own medical records"
  ON public.patient_medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- Profissional: pode inserir registros de pacientes vinculados
CREATE POLICY "Professionals can insert patient records"
  ON public.patient_medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

-- Admin: pode inserir qualquer registro
CREATE POLICY "Admin can insert medical records"
  ON public.patient_medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user());

-- =====================================================
-- 7) Criar políticas RLS (UPDATE)
-- =====================================================

-- Paciente: pode atualizar seus próprios registros
CREATE POLICY "Patients can update own medical records"
  ON public.patient_medical_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Profissional: pode atualizar registros de pacientes vinculados
CREATE POLICY "Professionals can update patient records"
  ON public.patient_medical_records
  FOR UPDATE
  TO authenticated
  USING (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  )
  WITH CHECK (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

-- Admin: pode atualizar qualquer registro
CREATE POLICY "Admin can update medical records"
  ON public.patient_medical_records
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- =====================================================
-- 8) Comentários
-- =====================================================
COMMENT ON FUNCTION public.is_professional_patient_link IS
  'Verifica se há vínculo entre profissional e paciente via clinical_reports, clinical_assessments, appointments ou chat_participants. Garante isolamento: cada profissional vê apenas seus próprios pacientes.';
COMMENT ON FUNCTION public.is_admin_user IS
  'Verifica se o usuário é admin (flag_admin=true ou type=admin/master)';

-- =====================================================
-- 9) Verificação
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'patient_medical_records'
ORDER BY policyname;

SELECT '✅ Fix RLS patient_medical_records aplicado com sucesso!' as status;
