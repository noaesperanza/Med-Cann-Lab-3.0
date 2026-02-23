-- =====================================================
-- 🔗 Vincular Pacientes ao Dr. Ricardo Valença (VERSÃO LIMPA)
-- =====================================================
-- Profissional: iaianoaesperanza@gmail.com (Dr. Ricardo Valença)
-- Data: 06/02/2026
-- =====================================================

set search_path = public;

-- =====================================================
-- 1. Vincular via clinical_assessments
-- =====================================================
DO $$
DECLARE
  dr_ricardo_id uuid;
  paciente_id uuid;
  paciente_email text;
  assessment_id uuid;
  pacientes_emails text[] := ARRAY[
    'gildacscacomanga@gmail.com',
    'jvbiocann@gmail.com',
    'graca11souza62@gmail.com',
    'graca11souza@gmail.com',
    'passosmir4@gmail.com',
    'casualmusic2021@gmail.com',
    'vicente4faveret@gmail.com'
  ];
BEGIN
  SELECT id INTO dr_ricardo_id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com';
  
  IF dr_ricardo_id IS NULL THEN
    RAISE EXCEPTION '❌ Dr. Ricardo não encontrado';
  END IF;
  
  FOREACH paciente_email IN ARRAY pacientes_emails
  LOOP
    SELECT id INTO paciente_id FROM auth.users WHERE email = paciente_email;
    
    IF paciente_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.clinical_assessments
        WHERE doctor_id = dr_ricardo_id AND patient_id = paciente_id
      ) THEN
        INSERT INTO public.clinical_assessments (doctor_id, patient_id, data, created_at)
        VALUES (
          dr_ricardo_id,
          paciente_id,
          jsonb_build_object('type', 'initial_assessment', 'purpose', 'Vínculo inicial'),
          NOW()
        )
        RETURNING id INTO assessment_id;
        
        RAISE NOTICE '✅ clinical_assessments: %', paciente_email;
      END IF;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 2. Vincular via appointments
-- =====================================================
DO $$
DECLARE
  dr_ricardo_id uuid;
  paciente_id uuid;
  paciente_email text;
  pacientes_emails text[] := ARRAY[
    'gildacscacomanga@gmail.com',
    'jvbiocann@gmail.com',
    'graca11souza62@gmail.com',
    'graca11souza@gmail.com',
    'passosmir4@gmail.com',
    'casualmusic2021@gmail.com',
    'vicente4faveret@gmail.com'
  ];
BEGIN
  SELECT id INTO dr_ricardo_id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com';
  
  FOREACH paciente_email IN ARRAY pacientes_emails
  LOOP
    SELECT id INTO paciente_id FROM auth.users WHERE email = paciente_email;
    
    IF paciente_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE professional_id = dr_ricardo_id AND patient_id = paciente_id
      ) THEN
        INSERT INTO public.appointments (
          professional_id, patient_id, appointment_date, type, status, title, description, created_at
        ) VALUES (
          dr_ricardo_id, paciente_id, NOW() + INTERVAL '1 day', 'consultation', 'scheduled',
          'Vínculo Inicial', 'Vínculo criado para acesso ao dashboard', NOW()
        );
        
        RAISE NOTICE '✅ appointments: %', paciente_email;
      END IF;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 3. Criar salas de chat
-- =====================================================
DO $$
DECLARE
  dr_ricardo_id uuid;
  paciente_id uuid;
  paciente_email text;
  v_room_id uuid;
  room_exists boolean;
  has_name_column boolean;
  pacientes_emails text[] := ARRAY[
    'gildacscacomanga@gmail.com',
    'jvbiocann@gmail.com',
    'graca11souza62@gmail.com',
    'graca11souza@gmail.com',
    'passosmir4@gmail.com',
    'casualmusic2021@gmail.com',
    'vicente4faveret@gmail.com'
  ];
BEGIN
  SELECT id INTO dr_ricardo_id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com';
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'chat_rooms' AND column_name = 'name'
  ) INTO has_name_column;
  
  FOREACH paciente_email IN ARRAY pacientes_emails
  LOOP
    SELECT id INTO paciente_id FROM auth.users WHERE email = paciente_email;
    
    IF paciente_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1
        FROM public.chat_rooms cr
        JOIN public.chat_participants cp1 ON cp1.room_id = cr.id AND cp1.user_id = dr_ricardo_id
        JOIN public.chat_participants cp2 ON cp2.room_id = cr.id AND cp2.user_id = paciente_id
        WHERE cr.type = 'patient'
      ) INTO room_exists;
      
      IF NOT room_exists THEN
        IF has_name_column THEN
          INSERT INTO public.chat_rooms (type, name, created_by, created_at)
          VALUES ('patient', 'Chat: ' || paciente_email || ' - Dr. Ricardo', dr_ricardo_id, NOW())
          RETURNING id INTO v_room_id;
        ELSE
          INSERT INTO public.chat_rooms (type, created_by, created_at)
          VALUES ('patient', dr_ricardo_id, NOW())
          RETURNING id INTO v_room_id;
        END IF;
        
        -- Usar variável v_room_id para evitar ambiguidade
        INSERT INTO public.chat_participants (room_id, user_id, role)
        SELECT v_room_id, dr_ricardo_id, 'professional'
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        INSERT INTO public.chat_participants (room_id, user_id, role)
        SELECT v_room_id, paciente_id, 'patient'
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        RAISE NOTICE '✅ chat criado: %', paciente_email;
      END IF;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 4. Verificar vínculos criados
-- =====================================================
WITH dr_ricardo AS (
  SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'
),
pacientes_emails AS (
  SELECT UNNEST(ARRAY[
    'gildacscacomanga@gmail.com',
    'jvbiocann@gmail.com',
    'graca11souza62@gmail.com',
    'graca11souza@gmail.com',
    'passosmir4@gmail.com',
    'casualmusic2021@gmail.com',
    'vicente4faveret@gmail.com'
  ]) as email
)
SELECT 
  pe.email,
  COALESCE(
    (SELECT name FROM public.users WHERE id = au.id),
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) as name,
  CASE WHEN EXISTS (
    SELECT 1 FROM public.clinical_assessments ca
    JOIN dr_ricardo dr ON ca.doctor_id = dr.id WHERE ca.patient_id = au.id
  ) THEN '✅' ELSE '❌' END as assessment,
  CASE WHEN EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN dr_ricardo dr ON a.professional_id = dr.id WHERE a.patient_id = au.id
  ) THEN '✅' ELSE '❌' END as appointment,
  CASE WHEN EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    JOIN public.chat_participants cp1 ON cp1.room_id = cr.id
    JOIN dr_ricardo dr ON cp1.user_id = dr.id AND cp1.role = 'professional'
    JOIN public.chat_participants cp2 ON cp2.room_id = cr.id AND cp2.user_id = au.id AND cp2.role = 'patient'
    WHERE cr.type = 'patient'
  ) THEN '✅' ELSE '❌' END as chat
FROM pacientes_emails pe
JOIN auth.users au ON au.email = pe.email
ORDER BY name;

SELECT '✅ Processo concluído!' as status;
