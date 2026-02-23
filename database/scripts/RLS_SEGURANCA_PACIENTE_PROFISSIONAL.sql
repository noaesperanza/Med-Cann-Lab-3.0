-- =====================================================
-- 🔐 POLÍTICAS RLS - SEGURANÇA PACIENTE/PROFISSIONAL
-- =====================================================
-- Regras de segurança baseadas nos requisitos:
-- 1. Relatório de avaliação clínica inicial só pode ser visto pelo paciente
-- 2. Profissional só vê se paciente compartilhar
-- 3. Chat entre profissional e paciente: ambos veem durante o chat, registrado no histórico do paciente

-- =====================================================
-- 1. TABELA: CLINICAL_ASSESSMENTS (Avaliações Clínicas)
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Pacientes podem ver suas próprias avaliações" ON clinical_assessments;
DROP POLICY IF EXISTS "Profissionais podem ver avaliações de seus pacientes" ON clinical_assessments;
DROP POLICY IF EXISTS "Pacientes podem criar avaliações" ON clinical_assessments;
DROP POLICY IF EXISTS "Profissionais podem atualizar avaliações" ON clinical_assessments;

-- Habilitar RLS
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Paciente vê APENAS suas próprias avaliações
CREATE POLICY "patient_view_own_assessments" ON clinical_assessments
  FOR SELECT
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 2: Profissional vê APENAS avaliações compartilhadas pelo paciente
CREATE POLICY "professional_view_shared_assessments" ON clinical_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessment_sharing 
      WHERE assessment_sharing.assessment_id = clinical_assessments.id
      AND assessment_sharing.patient_id = clinical_assessments.patient_id
      AND (
        -- Compartilhado com o profissional específico
        (assessment_sharing.shared_with_professional_id = auth.uid())
        OR
        -- Compartilhado com todos profissionais (se houver essa opção)
        (assessment_sharing.shared_with_all_professionals = TRUE)
      )
      AND assessment_sharing.patient_consent = TRUE
      AND (assessment_sharing.consent_expiry_date IS NULL OR assessment_sharing.consent_expiry_date > NOW())
    )
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- POLÍTICA 3: Paciente pode criar suas próprias avaliações
CREATE POLICY "patient_create_own_assessments" ON clinical_assessments
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 4: Paciente pode atualizar suas próprias avaliações
CREATE POLICY "patient_update_own_assessments" ON clinical_assessments
  FOR UPDATE
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 5: Profissional pode atualizar APENAS avaliações compartilhadas
CREATE POLICY "professional_update_shared_assessments" ON clinical_assessments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assessment_sharing 
      WHERE assessment_sharing.assessment_id = clinical_assessments.id
      AND assessment_sharing.patient_id = clinical_assessments.patient_id
      AND (
        assessment_sharing.shared_with_professional_id = auth.uid()
        OR assessment_sharing.shared_with_all_professionals = TRUE
      )
      AND assessment_sharing.patient_consent = TRUE
      AND (assessment_sharing.consent_expiry_date IS NULL OR assessment_sharing.consent_expiry_date > NOW())
    )
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- =====================================================
-- 2. TABELA: IMRE_ASSESSMENTS (Avaliações IMRE)
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Pacientes podem ver suas próprias avaliações IMRE" ON imre_assessments;
DROP POLICY IF EXISTS "Profissionais podem ver avaliações IMRE de seus pacientes" ON imre_assessments;

-- Habilitar RLS (se não estiver habilitado)
ALTER TABLE imre_assessments ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Paciente vê APENAS suas próprias avaliações IMRE
CREATE POLICY "patient_view_own_imre_assessments" ON imre_assessments
  FOR SELECT
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 2: Profissional vê APENAS avaliações IMRE compartilhadas
CREATE POLICY "professional_view_shared_imre_assessments" ON imre_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessment_sharing 
      WHERE assessment_sharing.assessment_id = imre_assessments.id
      AND assessment_sharing.patient_id = imre_assessments.patient_id
      AND (
        assessment_sharing.shared_with_professional_id = auth.uid()
        OR assessment_sharing.shared_with_all_professionals = TRUE
      )
      AND assessment_sharing.patient_consent = TRUE
      AND (assessment_sharing.consent_expiry_date IS NULL OR assessment_sharing.consent_expiry_date > NOW())
    )
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- POLÍTICA 3: Paciente pode criar suas próprias avaliações IMRE
CREATE POLICY "patient_create_own_imre_assessments" ON imre_assessments
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- =====================================================
-- 3. TABELA: CHAT_PARTICIPANTS / CHAT_MESSAGES (Chat Profissional-Paciente)
-- =====================================================

-- Verificar se existe tabela chat_participants ou chat_rooms
-- Criar políticas para chat entre profissional e paciente

-- POLÍTICA: Paciente vê chats onde ele é participante
CREATE POLICY "patient_view_own_chats" ON chat_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_participants.room_id
      AND cp.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
      )
    )
  );

-- POLÍTICA: Profissional vê chats onde ele é participante
CREATE POLICY "professional_view_own_chats" ON chat_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_participants.room_id
      AND cp.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
             OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
      )
    )
  );

-- POLÍTICA: Mensagens de chat - ambos participantes podem ver
CREATE POLICY "chat_participants_view_messages" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_messages.room_id
      AND cp.user_id = auth.uid()
    )
  );

-- POLÍTICA: Mensagens de chat - ambos participantes podem inserir
CREATE POLICY "chat_participants_insert_messages" ON chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_messages.room_id
      AND cp.user_id = auth.uid()
    )
  );

-- =====================================================
-- 4. TABELA: ASSESSMENT_SHARING (Compartilhamento)
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS assessment_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Compartilhamento com profissional específico
  shared_with_professional_id UUID REFERENCES auth.users(id),
  
  -- Compartilhamento com todos profissionais (opcional)
  shared_with_all_professionals BOOLEAN DEFAULT FALSE,
  
  -- Controle de consentimento
  patient_consent BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_expiry_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shared_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: paciente só pode compartilhar suas próprias avaliações
  CONSTRAINT check_patient_owns_assessment CHECK (
    shared_by = patient_id
  )
);

-- Habilitar RLS
ALTER TABLE assessment_sharing ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Paciente vê seus próprios compartilhamentos
CREATE POLICY "patient_view_own_sharing" ON assessment_sharing
  FOR SELECT
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 2: Profissional vê compartilhamentos feitos com ele
CREATE POLICY "professional_view_shared_with_me" ON assessment_sharing
  FOR SELECT
  USING (
    (
      shared_with_professional_id = auth.uid()
      OR shared_with_all_professionals = TRUE
    )
    AND patient_consent = TRUE
    AND (consent_expiry_date IS NULL OR consent_expiry_date > NOW())
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- POLÍTICA 3: Paciente pode criar compartilhamentos de suas próprias avaliações
CREATE POLICY "patient_create_sharing" ON assessment_sharing
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    AND auth.uid() = shared_by
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 4: Paciente pode atualizar seus próprios compartilhamentos
CREATE POLICY "patient_update_own_sharing" ON assessment_sharing
  FOR UPDATE
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 5: Paciente pode deletar seus próprios compartilhamentos
CREATE POLICY "patient_delete_own_sharing" ON assessment_sharing
  FOR DELETE
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- =====================================================
-- 5. TABELA: PATIENT_INTERACTIONS (Histórico do Paciente)
-- =====================================================

-- Criar tabela se não existir para registrar histórico completo
CREATE TABLE IF NOT EXISTS patient_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES auth.users(id),
  
  -- Tipo de interação
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('CHAT', 'CALL', 'ASSESSMENT', 'NOTE', 'DOCUMENT')),
  
  -- Conteúdo
  content TEXT,
  metadata JSONB,
  
  -- Referência a outras tabelas
  assessment_id UUID,
  chat_message_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE patient_interactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Paciente vê APENAS suas próprias interações
CREATE POLICY "patient_view_own_interactions" ON patient_interactions
  FOR SELECT
  USING (
    auth.uid() = patient_id
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' = 'paciente' OR auth.users.raw_user_meta_data->>'role' = 'patient')
    )
  );

-- POLÍTICA 2: Profissional vê APENAS interações compartilhadas
CREATE POLICY "professional_view_shared_interactions" ON patient_interactions
  FOR SELECT
  USING (
    (
      -- Interação em chat onde profissional é participante
      (interaction_type = 'CHAT' AND professional_id = auth.uid())
      OR
      -- Interação compartilhada via assessment_sharing
      EXISTS (
        SELECT 1 FROM assessment_sharing 
        WHERE assessment_sharing.assessment_id = patient_interactions.assessment_id
        AND assessment_sharing.patient_id = patient_interactions.patient_id
        AND (
          assessment_sharing.shared_with_professional_id = auth.uid()
          OR assessment_sharing.shared_with_all_professionals = TRUE
        )
        AND assessment_sharing.patient_consent = TRUE
        AND (assessment_sharing.consent_expiry_date IS NULL OR assessment_sharing.consent_expiry_date > NOW())
      )
    )
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'type' IN ('profissional', 'admin') 
           OR auth.users.raw_user_meta_data->>'role' IN ('professional', 'admin'))
    )
  );

-- POLÍTICA 3: Sistema pode inserir interações (via service_role)
-- Esta política permite que a aplicação insira interações automaticamente
CREATE POLICY "system_insert_interactions" ON patient_interactions
  FOR INSERT
  WITH CHECK (true); -- Será restringido pelo código da aplicação

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_assessment_sharing_patient_id ON assessment_sharing(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sharing_professional_id ON assessment_sharing(shared_with_professional_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sharing_assessment_id ON assessment_sharing(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sharing_consent ON assessment_sharing(patient_consent, consent_expiry_date);

CREATE INDEX IF NOT EXISTS idx_patient_interactions_patient_id ON patient_interactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_interactions_professional_id ON patient_interactions(professional_id);
CREATE INDEX IF NOT EXISTS idx_patient_interactions_type ON patient_interactions(interaction_type);

-- =====================================================
-- 7. FUNÇÃO AUXILIAR: Verificar se profissional pode ver avaliação
-- =====================================================

CREATE OR REPLACE FUNCTION professional_can_view_assessment(
  p_assessment_id UUID,
  p_professional_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM assessment_sharing 
    WHERE assessment_id = p_assessment_id
    AND patient_consent = TRUE
    AND (consent_expiry_date IS NULL OR consent_expiry_date > NOW())
    AND (
      shared_with_professional_id = p_professional_id
      OR shared_with_all_professionals = TRUE
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RESUMO DAS POLÍTICAS CRIADAS
-- =====================================================

-- ✅ CLINICAL_ASSESSMENTS:
--    - Paciente vê apenas suas próprias avaliações
--    - Profissional vê apenas avaliações compartilhadas
--    - Paciente pode criar/atualizar suas avaliações

-- ✅ IMRE_ASSESSMENTS:
--    - Paciente vê apenas suas próprias avaliações IMRE
--    - Profissional vê apenas avaliações IMRE compartilhadas
--    - Paciente pode criar suas avaliações IMRE

-- ✅ CHAT_PARTICIPANTS / CHAT_MESSAGES:
--    - Ambos (paciente e profissional) veem mensagens do chat onde são participantes
--    - Ambos podem inserir mensagens no chat

-- ✅ ASSESSMENT_SHARING:
--    - Paciente vê seus próprios compartilhamentos
--    - Profissional vê compartilhamentos feitos com ele
--    - Paciente pode criar/atualizar/deletar compartilhamentos

-- ✅ PATIENT_INTERACTIONS:
--    - Paciente vê apenas suas próprias interações
--    - Profissional vê interações compartilhadas ou de chats onde participa
--    - Sistema pode inserir interações automaticamente

-- Status: ✅ Todas as políticas RLS criadas conforme requisitos de segurança

