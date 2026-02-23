-- =====================================================
-- 🔐 ADICIONAR BYPASS ADMIN EM TODAS AS RLS POLICIES
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Garantir que admin sempre tenha acesso total
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. FUNÇÃO AUXILIAR: Verificar se usuário é admin
-- =====================================================
-- ⚠️ NOTA: Se a função já existe e está sendo usada por policies,
-- use o script ATUALIZAR_FUNCAO_IS_ADMIN_USER_SEGURA_06-02-2026.sql
-- primeiro para atualizar a função sem quebrar dependências.

-- ✅ CORREÇÃO: Usar CREATE OR REPLACE (não DROP)
-- A função já existe e está sendo usada por policies
-- CREATE OR REPLACE mantém as dependências intactas
-- ✅ CORREÇÃO DE SEGURANÇA: SECURITY INVOKER (não DEFINER)
-- Isso garante que a função respeite RLS da tabela users
-- e não possa ser abusada por usuários não autenticados

-- Verificar se função já existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'is_admin_user'
            AND pronamespace = 'public'::regnamespace
    ) THEN
        RAISE NOTICE 'ℹ️ Função is_admin_user já existe. Usando CREATE OR REPLACE...';
    ELSE
        RAISE NOTICE '✅ Criando função is_admin_user...';
    END IF;
END $$;

-- ✅ CORREÇÃO: A função existente usa _user_id (com underscore)
-- PostgreSQL não permite mudar nome do parâmetro
-- Devemos manter o nome original: _user_id
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER  -- ✅ CORRIGIDO: Era SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = _user_id  -- ✅ CORRIGIDO: Usar _user_id (com underscore)
      AND type IN ('admin', 'master', 'gestor')
  );
$$;

-- ✅ CORREÇÃO DE SEGURANÇA: Apenas authenticated (não anon)
-- anon NÃO deve ter acesso a função que verifica privilégios
-- Isso fecha brecha de enumeração de privilégios

-- Remover acesso de anon primeiro (se existir)
REVOKE EXECUTE ON FUNCTION public.is_admin_user(UUID) FROM anon;

-- Garantir acesso apenas para authenticated
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

-- =====================================================
-- 2. CORRIGIR RLS: chat_participants
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can view own chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can insert own chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can update own chat participants" ON public.chat_participants;

-- Criar policies com bypass admin
CREATE POLICY "Users can view own chat participants"
  ON public.chat_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Users can insert own chat participants"
  ON public.chat_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Users can update own chat participants"
  ON public.chat_participants FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_admin_user(auth.uid())
  );

-- =====================================================
-- 3. CORRIGIR RLS: clinical_assessments
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Doctors can view own assessments" ON public.clinical_assessments;
DROP POLICY IF EXISTS "Patients can view own assessments" ON public.clinical_assessments;
DROP POLICY IF EXISTS "Doctors can insert own assessments" ON public.clinical_assessments;
DROP POLICY IF EXISTS "Doctors can update own assessments" ON public.clinical_assessments;

-- Criar policies com bypass admin
CREATE POLICY "Doctors can view own assessments"
  ON public.clinical_assessments FOR SELECT
  USING (
    auth.uid() = doctor_id
    OR auth.uid() = patient_id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Doctors can insert own assessments"
  ON public.clinical_assessments FOR INSERT
  WITH CHECK (
    auth.uid() = doctor_id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Doctors can update own assessments"
  ON public.clinical_assessments FOR UPDATE
  USING (
    auth.uid() = doctor_id
    OR public.is_admin_user(auth.uid())
  );

-- =====================================================
-- 4. CORRIGIR RLS: clinical_reports
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Professionals can view own reports" ON public.clinical_reports;
DROP POLICY IF EXISTS "Patients can view own reports" ON public.clinical_reports;
DROP POLICY IF EXISTS "Professionals can insert own reports" ON public.clinical_reports;
DROP POLICY IF EXISTS "Professionals can update own reports" ON public.clinical_reports;

-- Criar policies com bypass admin
CREATE POLICY "Professionals can view own reports"
  ON public.clinical_reports FOR SELECT
  USING (
    auth.uid() = COALESCE(professional_id, doctor_id)
    OR auth.uid() = patient_id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Professionals can insert own reports"
  ON public.clinical_reports FOR INSERT
  WITH CHECK (
    auth.uid() = COALESCE(professional_id, doctor_id)
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Professionals can update own reports"
  ON public.clinical_reports FOR UPDATE
  USING (
    auth.uid() = COALESCE(professional_id, doctor_id)
    OR public.is_admin_user(auth.uid())
  );

-- =====================================================
-- 5. CORRIGIR RLS: appointments
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Professionals can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can insert own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can update own appointments" ON public.appointments;

-- Criar policies com bypass admin
CREATE POLICY "Professionals can view own appointments"
  ON public.appointments FOR SELECT
  USING (
    auth.uid() = COALESCE(professional_id, doctor_id)
    OR auth.uid() = patient_id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Professionals can insert own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    auth.uid() = COALESCE(professional_id, doctor_id)
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Professionals can update own appointments"
  ON public.appointments FOR UPDATE
  USING (
    auth.uid() = COALESCE(professional_id, doctor_id)
    OR public.is_admin_user(auth.uid())
  );

-- =====================================================
-- 6. CORRIGIR RLS: patient_medical_records
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Patients can view own records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can insert patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can update patient records" ON public.patient_medical_records;

-- Criar policies com bypass admin
CREATE POLICY "Patients can view own records"
  ON public.patient_medical_records FOR SELECT
  USING (
    auth.uid() = patient_id
    OR auth.uid() IN (
      SELECT doctor_id FROM public.clinical_assessments
      WHERE patient_id = patient_medical_records.patient_id
    )
    OR auth.uid() IN (
      SELECT COALESCE(professional_id, doctor_id) FROM public.clinical_reports
      WHERE patient_id = patient_medical_records.patient_id
    )
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Professionals can insert patient records"
  ON public.patient_medical_records FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT doctor_id FROM public.clinical_assessments
      WHERE patient_id = patient_medical_records.patient_id
    )
    OR auth.uid() IN (
      SELECT COALESCE(professional_id, doctor_id) FROM public.clinical_reports
      WHERE patient_id = patient_medical_records.patient_id
    )
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Professionals can update patient records"
  ON public.patient_medical_records FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT doctor_id FROM public.clinical_assessments
      WHERE patient_id = patient_medical_records.patient_id
    )
    OR auth.uid() IN (
      SELECT COALESCE(professional_id, doctor_id) FROM public.clinical_reports
      WHERE patient_id = patient_medical_records.patient_id
    )
    OR public.is_admin_user(auth.uid())
  );

-- =====================================================
-- 7. CORRIGIR RLS: prescriptions
-- =====================================================

-- Verificar se tabela existe e tem RLS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'prescriptions'
  ) THEN
    -- Remover policies antigas
    DROP POLICY IF EXISTS "Professionals can view own prescriptions" ON public.prescriptions;
    DROP POLICY IF EXISTS "Patients can view own prescriptions" ON public.prescriptions;
    DROP POLICY IF EXISTS "Professionals can insert own prescriptions" ON public.prescriptions;
    DROP POLICY IF EXISTS "Professionals can update own prescriptions" ON public.prescriptions;

    -- Criar policies com bypass admin
    CREATE POLICY "Professionals can view own prescriptions"
      ON public.prescriptions FOR SELECT
      USING (
        auth.uid() = professional_id
        OR auth.uid() = patient_id
        OR public.is_admin_user(auth.uid())
      );

    CREATE POLICY "Professionals can insert own prescriptions"
      ON public.prescriptions FOR INSERT
      WITH CHECK (
        auth.uid() = professional_id
        OR public.is_admin_user(auth.uid())
      );

    CREATE POLICY "Professionals can update own prescriptions"
      ON public.prescriptions FOR UPDATE
      USING (
        auth.uid() = professional_id
        OR public.is_admin_user(auth.uid())
      );
  END IF;
END $$;

-- =====================================================
-- 8. CORRIGIR RLS: video_call_sessions
-- =====================================================

-- Verificar se tabela existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'video_call_sessions'
  ) THEN
    -- Remover policies antigas
    DROP POLICY IF EXISTS "Professional views own video call sessions" ON public.video_call_sessions;
    DROP POLICY IF EXISTS "Patient views own video call sessions" ON public.video_call_sessions;
    DROP POLICY IF EXISTS "Professional inserts own video call sessions" ON public.video_call_sessions;
    DROP POLICY IF EXISTS "Professional updates own video call sessions" ON public.video_call_sessions;

    -- Criar policies com bypass admin
    CREATE POLICY "Professional views own video call sessions"
      ON public.video_call_sessions FOR SELECT
      USING (
        auth.uid() = professional_id
        OR auth.uid() = patient_id
        OR public.is_admin_user(auth.uid())
      );

    CREATE POLICY "Professional inserts own video call sessions"
      ON public.video_call_sessions FOR INSERT
      WITH CHECK (
        auth.uid() = professional_id
        OR public.is_admin_user(auth.uid())
      );

    CREATE POLICY "Professional updates own video call sessions"
      ON public.video_call_sessions FOR UPDATE
      USING (
        auth.uid() = professional_id
        OR public.is_admin_user(auth.uid())
      );
  END IF;
END $$;

-- =====================================================
-- 9. VERIFICAR RESULTADO
-- =====================================================

-- Listar todas as policies criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'chat_participants',
        'clinical_assessments',
        'clinical_reports',
        'appointments',
        'patient_medical_records',
        'prescriptions',
        'video_call_sessions'
    )
ORDER BY tablename, policyname;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Bypass admin adicionado em todas as RLS policies!' AS status;
