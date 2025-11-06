-- =====================================================
-- 🏥 MEDCANLAB 3.0 - TABELAS ADICIONAIS
-- =====================================================
-- Execute este script APÓS o SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql
-- Este script cria tabelas adicionais necessárias para remover dados mockados
-- =====================================================

-- =====================================================
-- 1. TABELA DE RELATÓRIOS CLÍNICOS
-- =====================================================

CREATE TABLE IF NOT EXISTS clinical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo e status
  report_type VARCHAR(50) NOT NULL, -- 'initial_assessment', 'follow_up', 'imre', 'aec'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'completed', 'shared', 'archived'
  
  -- Conteúdo do relatório (JSONB para flexibilidade)
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Compartilhamento e blockchain
  shared_with UUID[] DEFAULT ARRAY[]::UUID[],
  nft_token TEXT,
  blockchain_hash TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_report_type CHECK (report_type IN ('initial_assessment', 'follow_up', 'imre', 'aec')),
  CONSTRAINT valid_report_status CHECK (status IN ('draft', 'completed', 'shared', 'archived'))
);

-- =====================================================
-- 2. TABELA DE KPIs CLÍNICOS PERSONALIZADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS clinical_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do KPI
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'neurologico', 'comportamental', 'cognitivo', 'social', 'fisico'
  kpi_type VARCHAR(50) NOT NULL, -- 'frequency', 'duration', 'count', 'score', 'percentage'
  
  -- Valores
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly'
  
  -- Configurações
  patient_specific BOOLEAN DEFAULT FALSE,
  noa_generated BOOLEAN DEFAULT FALSE,
  
  -- Thresholds (JSONB)
  thresholds JSONB DEFAULT '{}',
  
  -- Tendência
  trend VARCHAR(20), -- 'up', 'down', 'stable'
  trend_value NUMERIC,
  
  -- Metadados
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_category CHECK (category IN ('neurologico', 'comportamental', 'cognitivo', 'social', 'fisico')),
  CONSTRAINT valid_kpi_type CHECK (kpi_type IN ('frequency', 'duration', 'count', 'score', 'percentage')),
  CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  CONSTRAINT valid_trend CHECK (trend IN ('up', 'down', 'stable'))
);

-- =====================================================
-- 3. TABELA DE PERFIS DE PACIENTES (TEA, Neurologia)
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Dados demográficos
  age INTEGER,
  birth_date DATE,
  
  -- Diagnóstico
  diagnosis TEXT,
  autism_spectrum BOOLEAN DEFAULT FALSE,
  autism_level INTEGER, -- 1, 2, 3
  neurological_profile TEXT[],
  
  -- Consentimentos
  consent_data_sharing BOOLEAN DEFAULT FALSE,
  consent_research BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE DOCUMENTOS (BIBLIOTECA)
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  content_url TEXT,
  
  -- Categorização
  category VARCHAR(100),
  tags TEXT[],
  target_audience TEXT[] DEFAULT ARRAY[]::TEXT[], -- 'professional', 'student', 'patient'
  
  -- Metadados
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_type VARCHAR(50), -- 'pdf', 'video', 'article', 'book'
  file_size BIGINT,
  
  -- Relevância para IA
  ai_relevance BOOLEAN DEFAULT FALSE,
  ai_category TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE MENSAGENS DE CHAT
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL, -- ID do chat (pode ser patient_id, professional_id, ou room_id)
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Conteúdo
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  
  -- Metadados
  read_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_message_type CHECK (message_type IN ('text', 'image', 'file', 'system'))
);

-- =====================================================
-- 6. TABELA DE POSTS DO FÓRUM
-- =====================================================

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Conteúdo
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  
  -- Status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password TEXT,
  
  -- Estatísticas
  views INTEGER DEFAULT 0,
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  max_participants INTEGER,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA DE NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'appointment', 'report', 'message', 'system', 'alert'
  
  -- Ação
  action_url TEXT,
  action_type VARCHAR(50),
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_notification_type CHECK (type IN ('appointment', 'report', 'message', 'system', 'alert'))
);

-- =====================================================
-- 8. TABELA DE AVALIAÇÕES CLÍNICAS (IMRE, AEC)
-- =====================================================

CREATE TABLE IF NOT EXISTS clinical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de avaliação
  assessment_type VARCHAR(50) NOT NULL, -- 'IMRE', 'AEC', 'initial', 'follow_up'
  
  -- Status
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'archived'
  
  -- Dados da avaliação (JSONB)
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_assessment_type CHECK (assessment_type IN ('IMRE', 'AEC', 'initial', 'follow_up')),
  CONSTRAINT valid_assessment_status CHECK (status IN ('in_progress', 'completed', 'archived'))
);

-- =====================================================
-- 9. ADICIONAR CAMPOS FALTANTES EM TABELAS EXISTENTES
-- =====================================================

-- Adicionar campos em appointments
DO $$ 
BEGIN
  -- Adicionar rating se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'rating') THEN
    ALTER TABLE appointments ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
  END IF;

  -- Adicionar revenue se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'revenue') THEN
    ALTER TABLE appointments ADD COLUMN revenue NUMERIC(10, 2) DEFAULT 0;
  END IF;

  -- Adicionar comment se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'comment') THEN
    ALTER TABLE appointments ADD COLUMN comment TEXT;
  END IF;
END $$;

-- Adicionar campos em courses
DO $$ 
BEGIN
  -- Adicionar thumbnail se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'thumbnail') THEN
    ALTER TABLE courses ADD COLUMN thumbnail TEXT;
  END IF;

  -- Adicionar price se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'price') THEN
    ALTER TABLE courses ADD COLUMN price NUMERIC(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Adicionar campos em course_modules
DO $$ 
BEGIN
  -- Adicionar resources se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'course_modules' AND column_name = 'resources') THEN
    ALTER TABLE course_modules ADD COLUMN resources TEXT[];
  END IF;
END $$;

-- Adicionar campos em users
DO $$ 
BEGIN
  -- Adicionar age se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'age') THEN
    ALTER TABLE users ADD COLUMN age INTEGER;
  END IF;

  -- Adicionar diagnosis se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'diagnosis') THEN
    ALTER TABLE users ADD COLUMN diagnosis TEXT;
  END IF;
END $$;

-- =====================================================
-- 10. HABILITAR RLS EM TODAS AS NOVAS TABELAS
-- =====================================================

ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Clinical Reports: Pacientes veem seus próprios relatórios, profissionais veem relatórios de seus pacientes
CREATE POLICY "Users can view their own clinical reports"
  ON clinical_reports FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Doctors can create clinical reports"
  ON clinical_reports FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- Clinical KPIs: Profissionais veem KPIs de seus pacientes
CREATE POLICY "Professionals can view patient KPIs"
  ON clinical_kpis FOR SELECT
  USING (auth.uid() = professional_id OR auth.uid() = patient_id);

CREATE POLICY "Professionals can create KPIs"
  ON clinical_kpis FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

-- Patient Profiles: Pacientes veem seus próprios perfis, profissionais veem perfis de seus pacientes
CREATE POLICY "Users can view patient profiles"
  ON patient_profiles FOR SELECT
  USING (auth.uid() = patient_id OR EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointments.patient_id = patient_profiles.patient_id 
    AND appointments.professional_id = auth.uid()
  ));

-- Documents: Todos podem ver documentos publicados
CREATE POLICY "Anyone can view published documents"
  ON documents FOR SELECT
  USING (is_published = TRUE);

-- Chat Messages: Usuários veem mensagens de seus chats
CREATE POLICY "Users can view their chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR EXISTS (
    SELECT 1 FROM chat_messages cm2 
    WHERE cm2.chat_id = chat_messages.chat_id 
    AND cm2.sender_id = auth.uid()
  ));

-- Forum Posts: Todos podem ver posts ativos
CREATE POLICY "Anyone can view active forum posts"
  ON forum_posts FOR SELECT
  USING (is_active = TRUE);

-- Notifications: Usuários veem suas próprias notificações
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Clinical Assessments: Mesmas regras de clinical_reports
CREATE POLICY "Users can view their clinical assessments"
  ON clinical_assessments FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- =====================================================
-- 12. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_clinical_reports_patient_id ON clinical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_doctor_id ON clinical_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_type ON clinical_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_status ON clinical_reports(status);

CREATE INDEX IF NOT EXISTS idx_clinical_kpis_patient_id ON clinical_kpis(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_kpis_professional_id ON clinical_kpis(professional_id);
CREATE INDEX IF NOT EXISTS idx_clinical_kpis_category ON clinical_kpis(category);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_patient_id ON patient_profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_autism ON patient_profiles(autism_spectrum);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(is_published);
CREATE INDEX IF NOT EXISTS idx_documents_ai_relevance ON documents(ai_relevance);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_active ON forum_posts(is_active);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_clinical_assessments_patient_id ON clinical_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_doctor_id ON clinical_assessments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_type ON clinical_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_status ON clinical_assessments(status);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

