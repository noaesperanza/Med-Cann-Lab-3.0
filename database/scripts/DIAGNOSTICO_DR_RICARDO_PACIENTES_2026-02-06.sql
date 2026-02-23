-- Diagnóstico: Pacientes vinculados ao Dr. Ricardo Valença
-- Email: iaianoaesperanza@gmail.com
-- Data: 06/02/2026

-- 1. Encontrar o ID do Dr. Ricardo
SELECT 
  id,
  email,
  COALESCE(
    (SELECT name FROM public.users WHERE id = auth.users.id),
    raw_user_meta_data->>'name',
    SPLIT_PART(email, '@', 1)
  ) as name,
  COALESCE(
    (SELECT type FROM public.users WHERE id = auth.users.id),
    raw_user_meta_data->>'type',
    'profissional'
  ) as type,
  created_at
FROM auth.users
WHERE email = 'iaianoaesperanza@gmail.com';

-- 2. Verificar pacientes vinculados via clinical_reports
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
)
SELECT 
  'clinical_reports' as fonte,
  cr.patient_id,
  COALESCE(
    (SELECT name FROM public.users WHERE id = cr.patient_id),
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) as patient_name,
  au.email as patient_email,
  cr.created_at as vinculado_em
FROM public.clinical_reports cr
JOIN auth.users au ON au.id = cr.patient_id
CROSS JOIN dr_ricardo dr
WHERE cr.professional_id = dr.id
ORDER BY cr.created_at DESC;

-- 3. Verificar pacientes vinculados via clinical_assessments
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
)
SELECT 
  'clinical_assessments' as fonte,
  ca.patient_id,
  COALESCE(
    (SELECT name FROM public.users WHERE id = ca.patient_id),
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) as patient_name,
  au.email as patient_email,
  ca.created_at as vinculado_em
FROM public.clinical_assessments ca
JOIN auth.users au ON au.id = ca.patient_id
CROSS JOIN dr_ricardo dr
WHERE ca.doctor_id = dr.id
ORDER BY ca.created_at DESC;

-- 4. Verificar pacientes vinculados via appointments
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
)
SELECT 
  'appointments' as fonte,
  a.patient_id,
  COALESCE(
    (SELECT name FROM public.users WHERE id = a.patient_id),
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) as patient_name,
  au.email as patient_email,
  a.appointment_date as vinculado_em
FROM public.appointments a
JOIN auth.users au ON au.id = a.patient_id
CROSS JOIN dr_ricardo dr
WHERE a.professional_id = dr.id
ORDER BY a.appointment_date DESC;

-- 5. Verificar pacientes vinculados via chat_participants
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
),
salas_do_ricardo AS (
  SELECT DISTINCT cp.room_id
  FROM public.chat_participants cp
  CROSS JOIN dr_ricardo dr
  WHERE cp.user_id = dr.id
    AND cp.role IN ('professional', 'admin')
)
SELECT 
  'chat_participants' as fonte,
  cp.user_id as patient_id,
  COALESCE(
    (SELECT name FROM public.users WHERE id = cp.user_id),
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) as patient_name,
  au.email as patient_email
FROM public.chat_participants cp
JOIN salas_do_ricardo s ON s.room_id = cp.room_id
JOIN auth.users au ON au.id = cp.user_id
WHERE cp.role = 'patient'
ORDER BY cp.user_id;

-- 6. Lista consolidada de TODOS os pacientes vinculados ao Dr. Ricardo
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
),
pacientes_via_reports AS (
  SELECT DISTINCT cr.patient_id
  FROM public.clinical_reports cr
  CROSS JOIN dr_ricardo dr
  WHERE cr.professional_id = dr.id
),
pacientes_via_assessments AS (
  SELECT DISTINCT ca.patient_id
  FROM public.clinical_assessments ca
  CROSS JOIN dr_ricardo dr
  WHERE ca.doctor_id = dr.id
),
pacientes_via_appointments AS (
  SELECT DISTINCT a.patient_id
  FROM public.appointments a
  CROSS JOIN dr_ricardo dr
  WHERE a.professional_id = dr.id
),
pacientes_via_chat AS (
  SELECT DISTINCT cp.user_id as patient_id
  FROM public.chat_participants cp
  CROSS JOIN dr_ricardo dr
  WHERE cp.room_id IN (
    SELECT room_id FROM public.chat_participants WHERE user_id = dr.id
  )
    AND cp.role = 'patient'
)
SELECT DISTINCT
  u.id,
  COALESCE(
    (SELECT name FROM public.users WHERE id = u.id),
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1)
  ) as name,
  u.email,
  COALESCE(
    (SELECT type FROM public.users WHERE id = u.id),
    u.raw_user_meta_data->>'type',
    'patient'
  ) as type,
  CASE 
    WHEN pvr.patient_id IS NOT NULL THEN 'clinical_reports'
    WHEN pva.patient_id IS NOT NULL THEN 'clinical_assessments'
    WHEN pvap.patient_id IS NOT NULL THEN 'appointments'
    WHEN pvc.patient_id IS NOT NULL THEN 'chat_participants'
    ELSE 'nenhum'
  END as fonte_vinculo
FROM auth.users u
LEFT JOIN pacientes_via_reports pvr ON pvr.patient_id = u.id
LEFT JOIN pacientes_via_assessments pva ON pva.patient_id = u.id
LEFT JOIN pacientes_via_appointments pvap ON pvap.patient_id = u.id
LEFT JOIN pacientes_via_chat pvc ON pvc.patient_id = u.id
WHERE (
  u.raw_user_meta_data->>'type' IN ('patient', 'paciente')
  OR EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = u.id AND pu.type IN ('patient', 'paciente'))
)
  AND (
    pvr.patient_id IS NOT NULL
    OR pva.patient_id IS NOT NULL
    OR pvap.patient_id IS NOT NULL
    OR pvc.patient_id IS NOT NULL
  )
ORDER BY name;

-- 7. Verificar se há pacientes na tabela users que NÃO estão vinculados ao Dr. Ricardo
-- (para identificar pacientes "órfãos" ou de outros profissionais)
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
),
pacientes_vinculados AS (
  SELECT DISTINCT cr.patient_id
  FROM public.clinical_reports cr
  CROSS JOIN dr_ricardo dr
  WHERE cr.professional_id = dr.id
  UNION
  SELECT DISTINCT ca.patient_id
  FROM public.clinical_assessments ca
  CROSS JOIN dr_ricardo dr
  WHERE ca.doctor_id = dr.id
  UNION
  SELECT DISTINCT a.patient_id
  FROM public.appointments a
  CROSS JOIN dr_ricardo dr
  WHERE a.professional_id = dr.id
)
SELECT 
  u.id,
  COALESCE(
    (SELECT name FROM public.users WHERE id = u.id),
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1)
  ) as name,
  u.email,
  'NÃO vinculado ao Dr. Ricardo' as status
FROM auth.users u
WHERE (
  u.raw_user_meta_data->>'type' IN ('patient', 'paciente')
  OR EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = u.id AND pu.type IN ('patient', 'paciente'))
)
  AND u.id NOT IN (SELECT patient_id FROM pacientes_vinculados)
ORDER BY name;
