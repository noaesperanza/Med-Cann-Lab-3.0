-- =====================================================
-- 🔗 Vincular Admin como Paciente do Dr. Ricardo
-- =====================================================
-- Admin: phpg69@gmail.com
-- Profissional: iaianoaesperanza@gmail.com (Dr. Ricardo Valença)
-- Data: 06/02/2026
-- =====================================================

set search_path = public;

-- =====================================================
-- 1. Verificar IDs dos usuários
-- =====================================================
DO $$
DECLARE
  admin_id uuid;
  dr_ricardo_id uuid;
BEGIN
  -- Encontrar ID do admin
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'phpg69@gmail.com';
  
  -- Encontrar ID do Dr. Ricardo
  SELECT id INTO dr_ricardo_id
  FROM auth.users
  WHERE email = 'iaianoaesperanza@gmail.com';
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION '❌ Admin não encontrado: phpg69@gmail.com';
  END IF;
  
  IF dr_ricardo_id IS NULL THEN
    RAISE EXCEPTION '❌ Dr. Ricardo não encontrado: iaianoaesperanza@gmail.com';
  END IF;
  
  RAISE NOTICE '✅ Admin encontrado: %', admin_id;
  RAISE NOTICE '✅ Dr. Ricardo encontrado: %', dr_ricardo_id;
END $$;

-- =====================================================
-- 2. Criar vínculo via clinical_assessments
-- =====================================================
-- Criar uma avaliação clínica para estabelecer o vínculo
DO $$
DECLARE
  admin_id uuid;
  dr_ricardo_id uuid;
  assessment_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'phpg69@gmail.com';
  SELECT id INTO dr_ricardo_id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com';
  
  -- Verificar se já existe vínculo
  IF EXISTS (
    SELECT 1 FROM public.clinical_assessments
    WHERE doctor_id = dr_ricardo_id AND patient_id = admin_id
  ) THEN
    RAISE NOTICE 'ℹ️ Vínculo via clinical_assessments já existe';
  ELSE
    -- Criar avaliação clínica básica para estabelecer vínculo
    INSERT INTO public.clinical_assessments (
      doctor_id,
      patient_id,
      data,
      created_at
    ) VALUES (
      dr_ricardo_id,
      admin_id,
      jsonb_build_object(
        'type', 'initial_assessment',
        'purpose', 'Vínculo administrativo - Admin como paciente do Dr. Ricardo',
        'created_by', 'system',
        'note', 'Vínculo criado para permitir que admin acesse dashboard do Dr. Ricardo como paciente'
      ),
      NOW()
    )
    RETURNING id INTO assessment_id;
    
    RAISE NOTICE '✅ Vínculo criado via clinical_assessments: %', assessment_id;
  END IF;
END $$;

-- =====================================================
-- 3. Criar vínculo via appointments (opcional)
-- =====================================================
-- Criar um agendamento para reforçar o vínculo
DO $$
DECLARE
  admin_id uuid;
  dr_ricardo_id uuid;
  appointment_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'phpg69@gmail.com';
  SELECT id INTO dr_ricardo_id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com';
  
  -- Verificar se já existe agendamento
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE professional_id = dr_ricardo_id AND patient_id = admin_id
  ) THEN
    RAISE NOTICE 'ℹ️ Vínculo via appointments já existe';
  ELSE
    -- Criar agendamento futuro para estabelecer vínculo
    -- Verificar estrutura de appointments antes de inserir
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
      admin_id,
      NOW() + INTERVAL '1 day', -- Agendamento para amanhã
      'consultation',
      'scheduled',
      'Vínculo Administrativo',
      'Vínculo administrativo - Admin como paciente do Dr. Ricardo',
      NOW()
    )
    RETURNING id INTO appointment_id;
    
    RAISE NOTICE '✅ Vínculo criado via appointments: %', appointment_id;
  END IF;
END $$;

-- =====================================================
-- 4. Criar sala de chat (se não existir)
-- =====================================================
DO $$
DECLARE
  admin_id uuid;
  dr_ricardo_id uuid;
  v_room_id uuid;  -- Renomeado para evitar ambiguidade
  room_exists boolean;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'phpg69@gmail.com';
  SELECT id INTO dr_ricardo_id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com';
  
  -- Verificar se já existe sala de chat
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_rooms cr
    JOIN public.chat_participants cp1 ON cp1.room_id = cr.id AND cp1.user_id = dr_ricardo_id
    JOIN public.chat_participants cp2 ON cp2.room_id = cr.id AND cp2.user_id = admin_id
    WHERE cr.type = 'patient'
  ) INTO room_exists;
  
  IF room_exists THEN
    RAISE NOTICE 'ℹ️ Sala de chat já existe';
  ELSE
    -- Verificar se coluna 'name' existe antes de criar sala
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'chat_rooms' 
      AND column_name = 'name'
    ) THEN
      -- Criar sala de chat COM name
      INSERT INTO public.chat_rooms (type, name, created_by, created_at)
      VALUES ('patient', 'Chat: Admin - Dr. Ricardo Valença', dr_ricardo_id, NOW())
      RETURNING id INTO v_room_id;
    ELSE
      -- Criar sala de chat SEM name
      INSERT INTO public.chat_rooms (type, created_by, created_at)
      VALUES ('patient', dr_ricardo_id, NOW())
      RETURNING id INTO v_room_id;
    END IF;
    
    -- Adicionar Dr. Ricardo como participante (profissional)
    -- Usar variável v_room_id para evitar ambiguidade
    INSERT INTO public.chat_participants (room_id, user_id, role)
    SELECT v_room_id, dr_ricardo_id, 'professional'
    ON CONFLICT (room_id, user_id) DO NOTHING;
    
    -- Adicionar Admin como participante (paciente)
    INSERT INTO public.chat_participants (room_id, user_id, role)
    SELECT v_room_id, admin_id, 'patient'
    ON CONFLICT (room_id, user_id) DO NOTHING;
    
    RAISE NOTICE '✅ Sala de chat criada: %', v_room_id;
  END IF;
END $$;

-- =====================================================
-- 5. Verificar vínculos criados
-- =====================================================
SELECT 
  'clinical_assessments' as fonte,
  COUNT(*) as total_vinculos
FROM public.clinical_assessments ca
JOIN auth.users admin ON admin.id = ca.patient_id
JOIN auth.users dr ON dr.id = ca.doctor_id
WHERE admin.email = 'phpg69@gmail.com'
  AND dr.email = 'iaianoaesperanza@gmail.com'

UNION ALL

SELECT 
  'appointments' as fonte,
  COUNT(*) as total_vinculos
FROM public.appointments a
JOIN auth.users admin ON admin.id = a.patient_id
JOIN auth.users dr ON dr.id = a.professional_id
WHERE admin.email = 'phpg69@gmail.com'
  AND dr.email = 'iaianoaesperanza@gmail.com'

UNION ALL

SELECT 
  'chat_participants' as fonte,
  COUNT(DISTINCT cr.id) as total_vinculos
FROM public.chat_rooms cr
JOIN public.chat_participants cp1 ON cp1.room_id = cr.id
JOIN auth.users admin ON admin.id = cp1.user_id AND cp1.role = 'patient'
JOIN public.chat_participants cp2 ON cp2.room_id = cr.id
JOIN auth.users dr ON dr.id = cp2.user_id AND cp2.role = 'professional'
WHERE admin.email = 'phpg69@gmail.com'
  AND dr.email = 'iaianoaesperanza@gmail.com';

-- =====================================================
-- 6. Verificar se função is_professional_patient_link reconhece o vínculo
-- =====================================================
DO $$
DECLARE
  admin_id uuid;
  dr_ricardo_id uuid;
  tem_vinculo boolean;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'phpg69@gmail.com';
  SELECT id INTO dr_ricardo_id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com';
  
  -- Verificar se função reconhece o vínculo
  SELECT public.is_professional_patient_link(admin_id, dr_ricardo_id) INTO tem_vinculo;
  
  IF tem_vinculo THEN
    RAISE NOTICE '✅ Vínculo reconhecido pela função is_professional_patient_link';
  ELSE
    RAISE WARNING '⚠️ Vínculo NÃO reconhecido pela função. Pode ser necessário recriar a função.';
  END IF;
END $$;

SELECT '✅ Processo de vinculação concluído!' as status;
