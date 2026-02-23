-- =====================================================
-- 🏥 CRIAR TABELAS CORRIGIDO - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. TABELA: USER PROFILES (GAMIFICAÇÃO)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  specialty TEXT,
  crm TEXT,
  cro TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  achievements TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA: TRANSACTIONS (FINANCEIRO)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id TEXT,
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_type CHECK (type IN ('payment', 'refund', 'subscription', 'bonus')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

-- 3. TABELA: APPOINTMENTS (AGENDAMENTOS)
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled',
  type VARCHAR(50) DEFAULT 'consultation',
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  meeting_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  CONSTRAINT valid_type CHECK (type IN ('consultation', 'follow_up', 'emergency', 'assessment'))
);

-- 4. TABELA: COURSES (CURSOS) - SEM COLUNA is_published
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  duration INTEGER,
  difficulty VARCHAR(20) DEFAULT 'beginner',
  category VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- 5. TABELA: USER COURSES (PROGRESSO DOS CURSOS)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'enrolled',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id),
  CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT valid_status CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped'))
);

-- 6. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para appointments
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = professional_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id OR auth.uid() = professional_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = professional_id);

-- Políticas para courses (todos podem ver)
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

-- Políticas para user_courses
CREATE POLICY "Users can view own course progress" ON user_courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course progress" ON user_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress" ON user_courses
  FOR UPDATE USING (auth.uid() = user_id);

-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);

-- 9. HABILITAR TEMPO REAL
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE user_courses;

-- 10. VERIFICAR CRIAÇÃO DAS TABELAS (CORRIGIDO)
-- =====================================================
SELECT 
  table_schema,
  table_name,
  is_insertable_into
FROM information_schema.tables 
WHERE table_name IN (
  'user_profiles', 
  'transactions', 
  'appointments', 
  'courses', 
  'user_courses'
)
AND table_schema = 'public'
ORDER BY table_name;

-- Status: ✅ Tabelas Corrigidas Criadas
-- - user_profiles: Gamificação e perfis
-- - transactions: Sistema financeiro
-- - appointments: Agendamentos
-- - courses: Cursos e educação (sem is_published)
-- - user_courses: Progresso dos cursos
-- - RLS habilitado com políticas seguras
-- - Índices para performance
-- - Tempo real ativado
