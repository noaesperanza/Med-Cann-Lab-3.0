-- =====================================================
-- 🛠️ FIX COMPLETO: Dr. Ricardo + Erros de Foreign Key e RLS
-- =====================================================
-- Data: 06/02/2026
-- Email Dr. Ricardo: iaianoaesperanza@gmail.com

set search_path = public;

-- =====================================================
-- PARTE 1: DIAGNÓSTICO - Pacientes do Dr. Ricardo
-- =====================================================

SELECT '🔍 Iniciando diagnóstico do Dr. Ricardo...' as status;

-- 1.1 Encontrar ID do Dr. Ricardo
DO $$
DECLARE
  dr_ricardo_id uuid;
BEGIN
  SELECT id INTO dr_ricardo_id
  FROM auth.users
  WHERE email = 'iaianoaesperanza@gmail.com';
  
  IF dr_ricardo_id IS NULL THEN
    RAISE NOTICE '❌ Dr. Ricardo não encontrado em auth.users';
  ELSE
    RAISE NOTICE '✅ Dr. Ricardo encontrado: %', dr_ricardo_id;
  END IF;
END $$;

-- 1.2 Listar TODOS os pacientes vinculados ao Dr. Ricardo
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
),
pacientes_consolidados AS (
  -- Via clinical_reports
  SELECT DISTINCT cr.patient_id, 'clinical_reports' as fonte
  FROM public.clinical_reports cr
  CROSS JOIN dr_ricardo dr
  WHERE cr.professional_id = dr.id
  
  UNION
  
  -- Via clinical_assessments
  SELECT DISTINCT ca.patient_id, 'clinical_assessments' as fonte
  FROM public.clinical_assessments ca
  CROSS JOIN dr_ricardo dr
  WHERE ca.doctor_id = dr.id
  
  UNION
  
  -- Via appointments
  SELECT DISTINCT a.patient_id, 'appointments' as fonte
  FROM public.appointments a
  CROSS JOIN dr_ricardo dr
  WHERE a.professional_id = dr.id
  
  UNION
  
  -- Via chat_participants
  SELECT DISTINCT cp2.user_id as patient_id, 'chat_participants' as fonte
  FROM public.chat_participants cp1
  JOIN public.chat_participants cp2 ON cp1.room_id = cp2.room_id
  CROSS JOIN dr_ricardo dr
  WHERE cp1.user_id = dr.id
    AND cp2.role = 'patient'
)
SELECT 
  u.id,
  u.name,
  u.email,
  STRING_AGG(DISTINCT pc.fonte, ', ') as fontes_vinculo,
  COUNT(DISTINCT pc.fonte) as total_fontes
FROM auth.users u
JOIN pacientes_consolidados pc ON pc.patient_id = u.id
WHERE u.type IN ('patient', 'paciente')
GROUP BY u.id, u.name, u.email
ORDER BY total_fontes DESC, u.name;

-- =====================================================
-- PARTE 2: FIX Foreign Key em chat_participants
-- =====================================================

SELECT '🔧 Corrigindo foreign key em chat_participants...' as status;

-- 2.1 Verificar constraint atual
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.chat_participants'::regclass
  AND contype = 'f'
  AND conkey::text LIKE '%user_id%';

-- 2.2 Verificar registros órfãos (user_id que não existe)
SELECT 
  COUNT(*) as total_orfaos,
  'Registros com user_id que não existe em public.users' as problema
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
WHERE u.id IS NULL;

-- 2.3 Sincronizar public.users com auth.users
-- Garantir que todos os IDs em auth.users existam em public.users
-- Nota: Verificar estrutura da tabela antes de inserir
DO $$
DECLARE
  has_name_column boolean;
  has_updated_at_column boolean;
  sql_text text;
BEGIN
  -- Verificar estrutura
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) INTO has_name_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'updated_at'
  ) INTO has_updated_at_column;
  
  -- Construir SQL dinamicamente
  IF has_name_column AND has_updated_at_column THEN
    sql_text := '
      INSERT INTO public.users (id, email, name, type, created_at, updated_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>''name'', SPLIT_PART(au.email, ''@'', 1)) as name,
        COALESCE(au.raw_user_meta_data->>''type'', ''patient'') as type,
        au.created_at,
        NOW() as updated_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()';
  ELSIF has_name_column THEN
    sql_text := '
      INSERT INTO public.users (id, email, name, type, created_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>''name'', SPLIT_PART(au.email, ''@'', 1)) as name,
        COALESCE(au.raw_user_meta_data->>''type'', ''patient'') as type,
        au.created_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email';
  ELSIF has_updated_at_column THEN
    sql_text := '
      INSERT INTO public.users (id, email, type, created_at, updated_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>''type'', ''patient'') as type,
        au.created_at,
        NOW() as updated_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()';
  ELSE
    sql_text := '
      INSERT INTO public.users (id, email, type, created_at)
      SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>''type'', ''patient'') as type,
        au.created_at
      FROM auth.users au
      WHERE au.id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL)
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email';
  END IF;
  
  EXECUTE sql_text;
  RAISE NOTICE '✅ Sincronização concluída';
END $$;

-- 2.4 Verificar se ainda há registros órfãos
SELECT 
  COUNT(*) as orfaos_restantes
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
WHERE u.id IS NULL;

-- 2.5 Se ainda houver órfãos, listá-los para análise manual
SELECT 
  cp.room_id,
  cp.user_id,
  cp.role,
  cp.created_at,
  '⚠️ Este user_id não existe em public.users nem em auth.users' as problema
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
LEFT JOIN auth.users au ON au.id = cp.user_id
WHERE u.id IS NULL AND au.id IS NULL
LIMIT 20;

-- =====================================================
-- PARTE 3: FIX RLS patient_medical_records (403)
-- =====================================================

SELECT '🔒 Corrigindo RLS de patient_medical_records...' as status;

-- 3.1 Garantir função is_professional_patient_link existe e está correta
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

-- 3.2 Garantir função is_admin_user existe
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

-- 3.3 Remover políticas antigas de patient_medical_records
DROP POLICY IF EXISTS "Admin can view all medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Patients can view own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can insert medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can insert patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Patients can insert own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can update medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can update patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Patients can update own medical records" ON public.patient_medical_records;

-- 3.4 Recriar políticas RLS (SELECT)
-- Admin: vê todos os registros
CREATE POLICY "Admin can view all medical records"
  ON public.patient_medical_records
  FOR SELECT
  USING (public.is_admin_user());

-- Profissional: vê apenas registros de pacientes vinculados
CREATE POLICY "Professionals can view patient records"
  ON public.patient_medical_records
  FOR SELECT
  USING (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

-- Paciente: vê seus próprios registros
CREATE POLICY "Patients can view own medical records"
  ON public.patient_medical_records
  FOR SELECT
  USING (auth.uid() = patient_id);

-- 3.5 Recriar políticas RLS (INSERT)
CREATE POLICY "Admin can insert medical records"
  ON public.patient_medical_records
  FOR INSERT
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Professionals can insert patient records"
  ON public.patient_medical_records
  FOR INSERT
  WITH CHECK (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

CREATE POLICY "Patients can insert own medical records"
  ON public.patient_medical_records
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- 3.6 Recriar políticas RLS (UPDATE)
CREATE POLICY "Admin can update medical records"
  ON public.patient_medical_records
  FOR UPDATE
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Professionals can update patient records"
  ON public.patient_medical_records
  FOR UPDATE
  USING (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  )
  WITH CHECK (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

CREATE POLICY "Patients can update own medical records"
  ON public.patient_medical_records
  FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- =====================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- =====================================================

SELECT '✅ Verificação final...' as status;

-- 4.1 Verificar se Dr. Ricardo pode ver apenas seus pacientes
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
)
SELECT 
  COUNT(DISTINCT cr.patient_id) as pacientes_via_reports,
  COUNT(DISTINCT ca.patient_id) as pacientes_via_assessments,
  COUNT(DISTINCT a.patient_id) as pacientes_via_appointments
FROM dr_ricardo dr
LEFT JOIN public.clinical_reports cr ON cr.professional_id = dr.id
LEFT JOIN public.clinical_assessments ca ON ca.doctor_id = dr.id
LEFT JOIN public.appointments a ON a.professional_id = dr.id;

-- 4.2 Verificar se não há mais registros órfãos
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Nenhum registro órfão encontrado'
    ELSE '⚠️ Ainda há ' || COUNT(*) || ' registros órfãos'
  END as status_foreign_key
FROM public.chat_participants cp
LEFT JOIN public.users u ON u.id = cp.user_id
WHERE u.id IS NULL;

-- 4.3 Verificar políticas RLS
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

SELECT '✅ Fix completo executado!' as status;
