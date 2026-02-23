-- =====================================================
-- 🔗 Vincular Pacientes ao Dr. Ricardo Valença
-- =====================================================
-- Profissional: iaianoaesperanza@gmail.com (Dr. Ricardo Valença)
-- Pacientes a vincular:
--   - Gilda Cruz Siqueira (gildacscacomanga@gmail.com)
--   - joao eduardo (jvbiocann@gmail.com)
--   - Maria souza (graca11souza62@gmail.com)
--   - Maria Souza (graca11souza@gmail.com)
--   - passosmir4 (passosmir4@gmail.com)
--   - Pedro Paciente (casualmusic2021@gmail.com)
--   - Vicente Caetano Pimenta (vicente4faveret@gmail.com)
-- Data: 06/02/2026
-- =====================================================

set search_path = public;

-- =====================================================
-- 1. Verificar IDs
-- =====================================================
DO $$
DECLARE
  dr_ricardo_id uuid;
  pacientes_ids uuid[];
BEGIN
  -- Encontrar ID do Dr. Ricardo
  SELECT id INTO dr_ricardo_id
  FROM auth.users
  WHERE email = 'iaianoaesperanza@gmail.com';
  
  IF dr_ricardo_id IS NULL THEN
    RAISE EXCEPTION '❌ Dr. Ricardo não encontrado: iaianoaesperanza@gmail.com';
  END IF;
  
  -- Encontrar IDs dos pacientes
  SELECT ARRAY_AGG(id) INTO pacientes_ids
  FROM auth.users
  WHERE email IN (
    'gildacscacomanga@gmail.com',
    'jvbiocann@gmail.com',
    'graca11souza62@gmail.com',
    'graca11souza@gmail.com',
    'passosmir4@gmail.com',
    'casualmusic2021@gmail.com',
    'vicente4faveret@gmail.com'
  );
  
  IF pacientes_ids IS NULL OR array_length(pacientes_ids, 1) = 0 THEN
    RAISE EXCEPTION '❌ Nenhum paciente encontrado';
  END IF;
  
  RAISE NOTICE '✅ Dr. Ricardo encontrado: %', dr_ricardo_id;
  RAISE NOTICE '✅ Pacientes encontrados: %', array_length(pacientes_ids, 1);
END $$;

-- =====================================================
-- 2. Vincular via clinical_assessments
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
  
  FOREACH paciente_email IN ARRAY pacientes_emails
  LOOP
    SELECT id INTO paciente_id FROM auth.users WHERE email = paciente_email;
    
    IF paciente_id IS NOT NULL THEN
      -- Verificar se já existe vínculo
      IF NOT EXISTS (
        SELECT 1 FROM public.clinical_assessments
        WHERE doctor_id = dr_ricardo_id AND patient_id = paciente_id
      ) THEN
        -- Criar avaliação clínica para estabelecer vínculo
        INSERT INTO public.clinical_assessments (
          doctor_id,
          patient_id,
          data,
          created_at
        ) VALUES (
          dr_ricardo_id,
          paciente_id,
          jsonb_build_object(
            'type', 'initial_assessment',
            'purpose', 'Vínculo inicial com Dr. Ricardo Valença',
            'created_by', 'system',
            'note', 'Vínculo criado para permitir acesso ao dashboard do Dr. Ricardo'
          ),
          NOW()
        )
        RETURNING id INTO assessment_id;
        
        RAISE NOTICE '✅ Vínculo criado via clinical_assessments para: % (assessment_id: %)', paciente_email, assessment_id;
      ELSE
        RAISE NOTICE 'ℹ️ Vínculo já existe via clinical_assessments para: %', paciente_email;
      END IF;
    ELSE
      RAISE WARNING '⚠️ Paciente não encontrado: %', paciente_email;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 3. Vincular via appointments
-- =====================================================
DO $$
DECLARE
  dr_ricardo_id uuid;
  paciente_id uuid;
  paciente_email text;
  appointment_id uuid;
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
      -- Verificar se já existe agendamento
      IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE professional_id = dr_ricardo_id AND patient_id = paciente_id
      ) THEN
        -- Criar agendamento futuro para estabelecer vínculo
        INSERT INTO public.appointments (
          professional_id,
          patient_id,
          appointment_date,
          type,
          status,
          title,
          description,
          created_at
        ) VALUES (
          dr_ricardo_id,
          paciente_id,
          NOW() + INTERVAL '1 day', -- Agendamento para amanhã
          'consultation',
          'scheduled',
          'Vínculo Inicial',
          'Vínculo criado para permitir acesso ao dashboard do Dr. Ricardo Valença',
          NOW()
        )
        RETURNING id INTO appointment_id;
        
        RAISE NOTICE '✅ Vínculo criado via appointments para: % (appointment_id: %)', paciente_email, appointment_id;
      ELSE
        RAISE NOTICE 'ℹ️ Vínculo já existe via appointments para: %', paciente_email;
      END IF;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 4. Criar salas de chat (se não existirem)
-- =====================================================
DO $$
DECLARE
  dr_ricardo_id uuid;
  paciente_id uuid;
  paciente_email text;
  v_room_id uuid;  -- Renomeado para evitar ambiguidade
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
  
  -- Verificar se coluna 'name' existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'chat_rooms' 
    AND column_name = 'name'
  ) INTO has_name_column;
  
  FOREACH paciente_email IN ARRAY pacientes_emails
  LOOP
    SELECT id INTO paciente_id FROM auth.users WHERE email = paciente_email;
    
    IF paciente_id IS NOT NULL THEN
      -- Verificar se já existe sala de chat
      SELECT EXISTS (
        SELECT 1
        FROM public.chat_rooms cr
        JOIN public.chat_participants cp1 ON cp1.room_id = cr.id AND cp1.user_id = dr_ricardo_id
        JOIN public.chat_participants cp2 ON cp2.room_id = cr.id AND cp2.user_id = paciente_id
        WHERE cr.type = 'patient'
      ) INTO room_exists;
      
      IF NOT room_exists THEN
        -- Criar sala de chat
        IF has_name_column THEN
          INSERT INTO public.chat_rooms (type, name, created_by, created_at)
          VALUES ('patient', 'Chat: ' || paciente_email || ' - Dr. Ricardo', dr_ricardo_id, NOW())
          RETURNING id INTO v_room_id;
        ELSE
          INSERT INTO public.chat_rooms (type, created_by, created_at)
          VALUES ('patient', dr_ricardo_id, NOW())
          RETURNING id INTO v_room_id;
        END IF;
        
        -- Adicionar Dr. Ricardo como participante (profissional)
        -- Usar variável v_room_id para evitar ambiguidade
        INSERT INTO public.chat_participants (room_id, user_id, role)
        SELECT v_room_id, dr_ricardo_id, 'professional'
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        -- Adicionar Paciente como participante
        INSERT INTO public.chat_participants (room_id, user_id, role)
        SELECT v_room_id, paciente_id, 'patient'
        ON CONFLICT (room_id, user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Sala de chat criada para: % (room_id: %)', paciente_email, v_room_id;
      ELSE
        RAISE NOTICE 'ℹ️ Sala de chat já existe para: %', paciente_email;
      END IF;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 5. Verificar vínculos criados
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
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.clinical_assessments ca
      JOIN dr_ricardo dr ON ca.doctor_id = dr.id
      WHERE ca.patient_id = au.id
    ) THEN '✅ clinical_assessments'
    ELSE '❌'
  END as tem_assessment,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN dr_ricardo dr ON a.professional_id = dr.id
      WHERE a.patient_id = au.id
    ) THEN '✅ appointments'
    ELSE '❌'
  END as tem_appointment,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      JOIN public.chat_participants cp1 ON cp1.room_id = cr.id
      JOIN dr_ricardo dr ON cp1.user_id = dr.id AND cp1.role = 'professional'
      JOIN public.chat_participants cp2 ON cp2.room_id = cr.id AND cp2.user_id = au.id AND cp2.role = 'patient'
      WHERE cr.type = 'patient'
    ) THEN '✅ chat'
    ELSE '❌'
  END as tem_chat
FROM pacientes_emails pe
JOIN auth.users au ON au.email = pe.email
ORDER BY name;

SELECT '✅ Processo de vinculação concluído!' as status;
