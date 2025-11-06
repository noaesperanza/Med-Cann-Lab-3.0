-- =====================================================
-- 🏥 MEDCANLAB 3.0 - MVP FINAL - SUPABASE SETUP
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script configura tudo necessário para o sistema funcionar

-- =====================================================
-- 1. TABELAS PRINCIPAIS
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

-- Tabela de avaliações clínicas
CREATE TABLE IF NOT EXISTS clinical_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  assessment_type TEXT,
  data JSONB,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relatórios clínicos
CREATE TABLE IF NOT EXISTS clinical_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  assessment_id UUID REFERENCES clinical_assessments(id),
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos (base de conhecimento)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  medical_terms TEXT[] DEFAULT '{}',
  embeddings JSONB,
  file_url TEXT,
  file_type TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de chat IA
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  context_docs UUID[] DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de interações NOA
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  text_raw TEXT NOT NULL,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de análise semântica
CREATE TABLE IF NOT EXISTS semantic_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES user_interactions(id) ON DELETE CASCADE,
  topics TEXT[],
  emotions TEXT,
  biomedical_terms TEXT[],
  interpretations TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de canais de chat
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private')),
  created_by UUID REFERENCES users(id),
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'document')),
  reactions JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inscrições em cursos
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  user_id UUID REFERENCES users(id),
  progress DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- =====================================================
-- 2. FUNÇÃO PARA CRIAR USUÁRIO AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'type', 'patient')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. POLÍTICAS RLS PARA USERS
-- =====================================================

-- Deletar políticas antigas se existirem
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Professionals can view patients" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Admin pode ver todos os usuários
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.type = 'admin'
    )
  );

-- Usuários podem ver próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Profissionais podem ver pacientes
CREATE POLICY "Professionals can view patients" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.type = 'professional'
    )
    AND type = 'patient'
  );

-- Usuários podem atualizar próprios dados
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Usuários podem inserir próprios dados (via trigger)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 5. POLÍTICAS RLS PARA CLINICAL_ASSESSMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Professionals can view patient assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Admin can view all assessments" ON clinical_assessments;

CREATE POLICY "Users can view own assessments" ON clinical_assessments
  FOR SELECT USING (
    patient_id = auth.uid() OR doctor_id = auth.uid()
  );

CREATE POLICY "Professionals can view patient assessments" ON clinical_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.type = 'professional'
    )
    AND doctor_id = auth.uid()
  );

CREATE POLICY "Admin can view all assessments" ON clinical_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.type = 'admin'
    )
  );

-- =====================================================
-- 6. POLÍTICAS RLS PARA DOCUMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view documents" ON documents;
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;

CREATE POLICY "Users can view documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Users can insert documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = uploaded_by);

-- =====================================================
-- 7. POLÍTICAS RLS PARA MESSAGES
-- =====================================================

DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

CREATE POLICY "Users can view messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. CRIAR USUÁRIOS ADMINISTRADORES ESPECIAIS
-- =====================================================

-- Nota: Estes usuários devem ser criados via Auth primeiro
-- Depois, atualize o tipo manualmente:

-- Para Dr. Ricardo Valença (admin)
-- UPDATE users SET type = 'admin' WHERE email IN (
--   'rrvalenca@gmail.com',
--   'rrvlenca@gmail.com',
--   'profrvalenca@gmail.com',
--   'iaianoaesperanza@gmail.com'
-- );

-- Para Dr. Eduardo Faveret (profissional)
-- UPDATE users SET type = 'professional' WHERE email = 'eduardoscfaveret@gmail.com';

-- Para paciente Escutese
-- UPDATE users SET type = 'patient' WHERE email IN ('escutese@gmail.com', 'escute-se@gmail.com');

-- =====================================================
-- 9. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_patient_id ON clinical_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_doctor_id ON clinical_assessments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_documents_keywords ON documents USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- =====================================================
-- ✅ SETUP COMPLETO!
-- =====================================================

SELECT '✅ Setup MVP Final concluído! Todas as tabelas e políticas foram configuradas.' as status;

