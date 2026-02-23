-- =====================================================
-- 🛠️ FIX COMPLETO: Chat + Patient Medical Records
-- =====================================================
-- Executa ambos os fixes em sequência:
-- 1. Fix recursão infinita no chat
-- 2. Fix erro 403 em patient_medical_records
-- Data: 06/02/2026

set search_path = public;

-- =====================================================
-- PARTE 1: FIX CHAT (Recursão Infinita)
-- =====================================================

SELECT '🔄 Iniciando fix do chat (recursão infinita)...' as status;

-- Garantir RLS habilitado
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Funções helper (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_chat_room_member(_room_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants p
    WHERE p.room_id = _room_id
      AND p.user_id = _user_id
  );
$$;

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

-- Remover políticas antigas do chat
DROP POLICY IF EXISTS "participants_select_room_member_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_insert_self_or_room_owner_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_update_self_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS "participants_delete_self_or_room_owner_or_admin" ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_select ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_insert ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_update ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_delete ON public.chat_participants;

-- Recriar políticas do chat
CREATE POLICY "participants_select_room_member_or_admin" ON public.chat_participants
  FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR public.is_chat_room_member(chat_participants.room_id, auth.uid())
  );

CREATE POLICY "participants_insert_self_or_room_owner_or_admin" ON public.chat_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1
      FROM public.chat_rooms r
      WHERE r.id = chat_participants.room_id
        AND r.created_by = auth.uid()
    )
  );

CREATE POLICY "participants_update_self_or_admin" ON public.chat_participants
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin_user()
  );

CREATE POLICY "participants_delete_self_or_room_owner_or_admin" ON public.chat_participants
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1
      FROM public.chat_rooms r
      WHERE r.id = chat_participants.room_id
        AND r.created_by = auth.uid()
    )
  );

-- Políticas de chat_rooms
DROP POLICY IF EXISTS "rooms_select_member_or_admin" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_insert_owner" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_update_owner_or_admin" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_delete_owner_or_admin" ON public.chat_rooms;

CREATE POLICY "rooms_select_member_or_admin" ON public.chat_rooms
  FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR public.is_chat_room_member(chat_rooms.id, auth.uid())
  );

CREATE POLICY "rooms_insert_owner" ON public.chat_rooms
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "rooms_update_owner_or_admin" ON public.chat_rooms
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_admin_user()
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.is_admin_user()
  );

CREATE POLICY "rooms_delete_owner_or_admin" ON public.chat_rooms
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_admin_user()
  );

-- Políticas de chat_messages
DROP POLICY IF EXISTS "messages_select_room_member_or_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_insert_sender_is_member" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_update_sender_or_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_delete_sender_or_admin" ON public.chat_messages;

CREATE POLICY "messages_select_room_member_or_admin" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    public.is_admin_user()
    OR public.is_chat_room_member(chat_messages.room_id, auth.uid())
  );

CREATE POLICY "messages_insert_sender_is_member" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_chat_room_member(chat_messages.room_id, auth.uid())
  );

CREATE POLICY "messages_update_sender_or_admin" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (
    sender_id = auth.uid()
    OR public.is_admin_user()
  )
  WITH CHECK (
    sender_id = auth.uid()
    OR public.is_admin_user()
  );

CREATE POLICY "messages_delete_sender_or_admin" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (
    sender_id = auth.uid()
    OR public.is_admin_user()
  );

SELECT '✅ Fix do chat concluído!' as status;

-- =====================================================
-- PARTE 2: FIX PATIENT_MEDICAL_RECORDS (Erro 403)
-- =====================================================

SELECT '🔄 Iniciando fix de patient_medical_records (erro 403)...' as status;

-- Garantir RLS habilitado
ALTER TABLE public.patient_medical_records ENABLE ROW LEVEL SECURITY;

-- Função helper para vínculo profissional-paciente
CREATE OR REPLACE FUNCTION public.is_professional_patient_link(_patient_id uuid, _professional_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinical_reports cr
    WHERE cr.patient_id = _patient_id
      AND cr.professional_id = _professional_id
    UNION
    SELECT 1
    FROM public.clinical_assessments ca
    WHERE ca.patient_id = _patient_id
      AND ca.doctor_id = _professional_id
    UNION
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = _patient_id
      AND a.professional_id = _professional_id
    UNION
    SELECT 1
    FROM public.chat_participants cp1
    INNER JOIN public.chat_participants cp2 ON cp1.room_id = cp2.room_id
    WHERE cp1.user_id = _professional_id
      AND cp2.user_id = _patient_id
      AND cp1.room_id = cp2.room_id
  );
$$;

-- Remover políticas antigas de patient_medical_records
DROP POLICY IF EXISTS "Patients can view own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can view assigned medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can view all medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Patients can insert own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can insert patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Patients can update own medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can insert medical records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Professionals can update patient records" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Admin can update medical records" ON public.patient_medical_records;

-- Criar políticas RLS (SELECT)
CREATE POLICY "Admin can view all medical records"
  ON public.patient_medical_records
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "Professionals can view patient records"
  ON public.patient_medical_records
  FOR SELECT
  TO authenticated
  USING (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

CREATE POLICY "Patients can view own medical records"
  ON public.patient_medical_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- Criar políticas RLS (INSERT)
CREATE POLICY "Patients can insert own medical records"
  ON public.patient_medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Professionals can insert patient records"
  ON public.patient_medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_professional_patient_link(patient_medical_records.patient_id, auth.uid())
  );

CREATE POLICY "Admin can insert medical records"
  ON public.patient_medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user());

-- Criar políticas RLS (UPDATE)
CREATE POLICY "Patients can update own medical records"
  ON public.patient_medical_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

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

CREATE POLICY "Admin can update medical records"
  ON public.patient_medical_records
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Comentários
COMMENT ON FUNCTION public.is_professional_patient_link IS
  'Verifica se há vínculo entre profissional e paciente via clinical_reports, clinical_assessments, appointments ou chat_participants. Garante isolamento: cada profissional vê apenas seus próprios pacientes.';
COMMENT ON FUNCTION public.is_admin_user IS
  'Verifica se o usuário é admin (flag_admin=true ou type=admin/master)';
COMMENT ON FUNCTION public.is_chat_room_member IS
  'Verifica se o usuário é membro de uma sala de chat (SECURITY DEFINER para evitar recursão)';

SELECT '✅ Fix de patient_medical_records concluído!' as status;

-- =====================================================
-- PARTE 3: FIX USERS TABLE (Erro 400)
-- =====================================================

SELECT '🔄 Iniciando fix da tabela users (erro 400)...' as status;

-- Garantir RLS habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Função helper para verificar tipo do usuário atual (sem recursão)
CREATE OR REPLACE FUNCTION public.get_current_user_type()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(
    (SELECT type::text FROM public.users WHERE id = auth.uid()),
    (SELECT raw_user_meta_data->>'type' FROM auth.users WHERE id = auth.uid()),
    'patient'
  );
$$;

-- Remover políticas antigas de users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Pacientes podem ver profissionais" ON public.users;
DROP POLICY IF EXISTS "Pacientes podem ver profissionais autorizados" ON public.users;
DROP POLICY IF EXISTS "Profissionais podem ver seus pacientes" ON public.users;
DROP POLICY IF EXISTS "Profissionais autorizados podem ver seus pacientes" ON public.users;
DROP POLICY IF EXISTS "Profissionais podem ver outros profissionais" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Professionals can view assigned patients" ON public.users;

-- Criar políticas RLS para users (SELECT)

-- 1. Usuário vê seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Admin vê todos os usuários
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

-- 3. Profissional vê pacientes vinculados
CREATE POLICY "Professionals can view assigned patients"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_type() = 'profissional'
    AND public.users.type = 'paciente'
    AND public.is_professional_patient_link(public.users.id, auth.uid())
  );

-- 4. Profissional vê outros profissionais (para colaboração)
CREATE POLICY "Professionals can view other professionals"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_type() = 'profissional'
    AND public.users.type = 'profissional'
    AND public.users.id != auth.uid()
  );

-- 5. Paciente vê profissionais vinculados
CREATE POLICY "Patients can view linked professionals"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    public.get_current_user_type() = 'paciente'
    AND public.users.type = 'profissional'
    AND public.is_professional_patient_link(auth.uid(), public.users.id)
  );

-- Comentários
COMMENT ON FUNCTION public.get_current_user_type IS
  'Retorna o tipo do usuário atual (SECURITY DEFINER para evitar recursão)';

SELECT '✅ Fix da tabela users concluído!' as status;

-- =====================================================
-- RESUMO FINAL
-- =====================================================
SELECT 
  '=== RESUMO ===' as secao,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'chat_participants') as politicas_chat_participants,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'patient_medical_records') as politicas_medical_records,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') as politicas_users,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('is_professional_patient_link', 'is_admin_user', 'is_chat_room_member', 'get_current_user_type')) as funcoes_helper;

SELECT '✅ Fix completo aplicado com sucesso!' as status;
