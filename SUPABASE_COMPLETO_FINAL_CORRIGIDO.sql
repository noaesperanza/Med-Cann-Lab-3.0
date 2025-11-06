-- =====================================================
-- 🏥 MEDCANLAB 3.0 - SCRIPT SQL COMPLETO E CONSOLIDADO (CORRIGIDO)
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script cria TODAS as tabelas necessárias para a plataforma funcionar
-- CORRIGIDO: Adiciona colunas faltantes em tabelas existentes
-- =====================================================

-- =====================================================
-- 1. TABELAS PRINCIPAIS (JÁ EXISTENTES - VERIFICAR)
-- =====================================================

-- Tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('patient', 'professional', 'student', 'admin')),
  crm TEXT,
  cro TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  blood_type TEXT,
  allergies TEXT[],
  medications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELAS DE AGENDAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do agendamento
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60, -- em minutos
  
  -- Status e tipo
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  type VARCHAR(50) DEFAULT 'consultation', -- 'consultation', 'follow_up', 'emergency', 'assessment'
  
  -- Localização
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  meeting_url TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  CONSTRAINT valid_type CHECK (type IN ('consultation', 'follow_up', 'emergency', 'assessment'))
);

-- =====================================================
-- 3. TABELAS DE CURSOS (COM CORREÇÃO PARA TABELAS EXISTENTES)
-- =====================================================

-- Criar tabela courses se não existir
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  
  -- Metadados do curso
  duration INTEGER, -- em horas
  difficulty VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  category VARCHAR(50),
  tags TEXT[],
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- Adicionar colunas faltantes se a tabela já existir
DO $$ 
BEGIN
  -- Adicionar content se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'content') THEN
    ALTER TABLE courses ADD COLUMN content TEXT;
  END IF;

  -- Adicionar duration se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'duration') THEN
    ALTER TABLE courses ADD COLUMN duration INTEGER;
  END IF;

  -- Adicionar difficulty se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'difficulty') THEN
    ALTER TABLE courses ADD COLUMN difficulty VARCHAR(20) DEFAULT 'beginner';
  END IF;

  -- Adicionar category se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'category') THEN
    ALTER TABLE courses ADD COLUMN category VARCHAR(50);
  END IF;

  -- Adicionar tags se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'tags') THEN
    ALTER TABLE courses ADD COLUMN tags TEXT[];
  END IF;

  -- Adicionar is_published se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'is_published') THEN
    ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
  END IF;

  -- Adicionar is_featured se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'is_featured') THEN
    ALTER TABLE courses ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;

  -- Adicionar updated_at se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'updated_at') THEN
    ALTER TABLE courses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Dados do módulo
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration INTEGER, -- em minutos
  
  -- Tipo de conteúdo
  content_type VARCHAR(50) DEFAULT 'video', -- 'video', 'text', 'quiz', 'assignment'
  content_url TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Progresso
  progress DECIMAL(5,2) DEFAULT 0, -- porcentagem
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'enrolled', -- 'enrolled', 'in_progress', 'completed', 'dropped'
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, course_id),
  CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT valid_status CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped'))
);

-- =====================================================
-- 4. TABELAS DE GAMIFICAÇÃO E PERFIS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Dados do perfil
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  specialty TEXT,
  crm TEXT,
  cro TEXT,
  
  -- Gamificação
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  achievements TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  
  -- Atividade
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- em minutos
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELAS FINANCEIRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da transação
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'subscription', 'bonus'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  
  -- Dados do pagamento
  payment_method VARCHAR(50),
  payment_id TEXT,
  gateway_response JSONB,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_type CHECK (type IN ('payment', 'refund', 'subscription', 'bonus')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

-- =====================================================
-- 6. TABELAS DE MONITORAMENTO WEARABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS wearable_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do dispositivo
  device_type VARCHAR(50) NOT NULL, -- 'smartwatch', 'fitness_tracker', 'monitor'
  brand VARCHAR(50),
  model VARCHAR(100),
  
  -- Status
  battery_level INTEGER DEFAULT 100,
  connection_status VARCHAR(50) DEFAULT 'disconnected', -- 'connected', 'disconnected', 'low_battery'
  last_sync TIMESTAMP WITH TIME ZONE,
  
  -- Tipos de dados coletados
  data_types TEXT[] DEFAULT '{}', -- 'heart_rate', 'movement', 'temperature', 'sleep', etc.
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES wearable_devices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados coletados
  data_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2),
  unit VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELAS DE NEUROLOGIA PEDIÁTRICA
-- =====================================================

CREATE TABLE IF NOT EXISTS epilepsy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do evento
  event_type VARCHAR(50) NOT NULL, -- 'convulsao', 'ausencia', 'mioclonica', 'tonico-clonica', 'focal'
  severity VARCHAR(50) NOT NULL, -- 'leve', 'moderada', 'severa'
  duration INTEGER, -- em segundos
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contexto
  triggers TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  notes TEXT,
  
  -- Dados do wearable (se disponível)
  wearable_data JSONB,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABELAS DE ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de métrica
  metric_type VARCHAR(50) NOT NULL, -- 'kpi', 'dashboard', 'report'
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_unit VARCHAR(20),
  
  -- Contexto
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE epilepsy_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. POLÍTICAS RLS
-- =====================================================

-- Políticas para appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Admin can view all appointments" ON appointments;

CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = professional_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = professional_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = professional_id);

CREATE POLICY "Admin can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'admin'
    )
  );

-- Políticas para courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;

CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (is_published = true OR is_published IS NULL);

CREATE POLICY "Admin can manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'admin'
    )
  );

-- Políticas para course_enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can insert own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON course_enrollments;

CREATE POLICY "Users can view own enrollments" ON course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own enrollments" ON course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'admin'
    )
  );

-- Políticas para transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'admin'
    )
  );

-- Políticas para wearable_devices
DROP POLICY IF EXISTS "Users can view own devices" ON wearable_devices;
DROP POLICY IF EXISTS "Professionals can view patient devices" ON wearable_devices;
DROP POLICY IF EXISTS "Admin can view all devices" ON wearable_devices;

CREATE POLICY "Users can view own devices" ON wearable_devices
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view patient devices" ON wearable_devices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'professional'
    )
  );

CREATE POLICY "Admin can view all devices" ON wearable_devices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'admin'
    )
  );

-- Políticas para epilepsy_events
DROP POLICY IF EXISTS "Users can view own events" ON epilepsy_events;
DROP POLICY IF EXISTS "Professionals can view patient events" ON epilepsy_events;
DROP POLICY IF EXISTS "Admin can view all events" ON epilepsy_events;

CREATE POLICY "Users can view own events" ON epilepsy_events
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view patient events" ON epilepsy_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'professional'
    )
  );

CREATE POLICY "Admin can view all events" ON epilepsy_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.type = 'admin'
    )
  );

-- =====================================================
-- 11. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_wearable_devices_patient_id ON wearable_devices(patient_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_device_id ON wearable_data(device_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_patient_id ON wearable_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_timestamp ON wearable_data(timestamp);

CREATE INDEX IF NOT EXISTS idx_epilepsy_events_patient_id ON epilepsy_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_epilepsy_events_timestamp ON epilepsy_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_type ON analytics(metric_type);

-- =====================================================
-- 12. DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Inserir alguns cursos de exemplo (apenas se não existirem)
INSERT INTO courses (title, description, duration, difficulty, category, is_published, is_featured)
SELECT * FROM (VALUES
  ('Arte da Entrevista Clínica', 'Metodologia AEC para avaliação clínica inicial', 40, 'intermediate', 'Ensino', true, true),
  ('Pós-graduação em Cannabis Medicinal', 'Curso completo sobre cannabis medicinal', 60, 'advanced', 'Ensino', true, true),
  ('Cidade Amiga dos Rins', 'Projeto de pesquisa sobre função renal', 20, 'intermediate', 'Pesquisa', true, false)
) AS v(title, description, duration, difficulty, category, is_published, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE courses.title = v.title);

-- =====================================================
-- ✅ SETUP COMPLETO!
-- =====================================================

SELECT '✅ Script SQL Completo executado com sucesso! Todas as tabelas foram criadas/atualizadas.' as status;

