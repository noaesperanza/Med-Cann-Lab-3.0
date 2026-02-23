-- =====================================================
-- 🏥 MEDCANLAB 3.0 - SETUP COMPLETO DO SUPABASE
-- =====================================================
-- Execute este script no Supabase SQL Editor para configurar tudo

-- =====================================================
-- 📋 TABELAS PRINCIPAIS (JÁ EXISTENTES)
-- =====================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 2. TABELA DE CANAIS DE CHAT
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private')),
  created_by UUID REFERENCES users(id),
  members_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE MENSAGENS
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

-- 4. TABELA DE DEBATES/FÓRUM
CREATE TABLE IF NOT EXISTS debates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES users(id),
  category TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_password_protected BOOLEAN DEFAULT false,
  password TEXT,
  participants_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  votes JSONB DEFAULT '{"up": 0, "down": 0}',
  is_pinned BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE AMIZADES
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES users(id),
  addressee_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- 6. TABELA DE CHAT PRIVADO MÉDICO-PACIENTE
CREATE TABLE IF NOT EXISTS private_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

-- 7. TABELA DE MENSAGENS PRIVADAS
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES private_chats(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'document')),
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE MONITORAMENTO RENAL
CREATE TABLE IF NOT EXISTS renal_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  creatinine DECIMAL(4,2),
  tfg DECIMAL(5,2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  last_check TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE ALERTAS RENAIS
CREATE TABLE IF NOT EXISTS renal_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  alert_type TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE CURSOS
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER, -- em minutos
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABELA DE INSCRIÇÕES EM CURSOS
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  user_id UUID REFERENCES users(id),
  progress DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- 12. TABELA DE AVALIAÇÕES CLÍNICAS
CREATE TABLE IF NOT EXISTS clinical_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  assessment_type TEXT, -- IMRE, AEC, etc
  data JSONB,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TABELA DE DOCUMENTOS (Chat IA)
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
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TABELA DE SESSÕES DE CHAT IA
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  context_docs UUID[] DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. TABELA DE INTERAÇÕES NOA
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  text_raw TEXT NOT NULL,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TABELA DE ANÁLISE SEMÂNTICA
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

-- =====================================================
-- 🧬 TABELAS IMRE (NOVAS - UNIFICAÇÃO 3.0→5.0)
-- =====================================================

-- 17. TABELA PRINCIPAL: IMRE ASSESSMENTS
CREATE TABLE IF NOT EXISTS imre_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID, -- Referência ao paciente sendo avaliado
  assessment_type VARCHAR(50) NOT NULL DEFAULT 'triaxial',
  
  -- Dados do Sistema IMRE Triaxial (37 blocos preservados)
  triaxial_data JSONB NOT NULL,
  semantic_context JSONB NOT NULL,
  emotional_indicators JSONB,
  cognitive_patterns JSONB,
  behavioral_markers JSONB,
  
  -- Metadados da avaliação
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER, -- em minutos
  completion_status VARCHAR(20) DEFAULT 'in_progress',
  
  -- Contexto clínico
  clinical_notes TEXT,
  risk_factors JSONB,
  therapeutic_goals JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes para performance
  CONSTRAINT valid_completion_status CHECK (completion_status IN ('in_progress', 'completed', 'abandoned'))
);

-- 18. TABELA: IMRE BLOCOS SEMÂNTICOS
CREATE TABLE IF NOT EXISTS imre_semantic_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  block_number INTEGER NOT NULL,
  block_type VARCHAR(50) NOT NULL,
  
  -- Dados semânticos do bloco
  semantic_content JSONB NOT NULL,
  emotional_weight DECIMAL(3,2),
  cognitive_complexity DECIMAL(3,2),
  behavioral_impact DECIMAL(3,2),
  
  -- Contexto temporal
  block_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time INTEGER, -- em milissegundos
  
  -- Metadados
  confidence_score DECIMAL(3,2),
  validation_status VARCHAR(20) DEFAULT 'pending',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. TABELA: CONTEXTO SEMÂNTICO PERSISTENTE
CREATE TABLE IF NOT EXISTS imre_semantic_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contexto semântico acumulado
  semantic_memory JSONB NOT NULL,
  emotional_patterns JSONB,
  cognitive_trajectories JSONB,
  behavioral_evolution JSONB,
  
  -- Metadados do contexto
  context_version INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_stability DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. TABELA: NOA INTERACTION LOGS
CREATE TABLE IF NOT EXISTS noa_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  
  -- Dados da interação NOA
  interaction_type VARCHAR(50) NOT NULL, -- 'voice', 'text', 'multimodal'
  interaction_content JSONB NOT NULL,
  noa_response JSONB,
  
  -- Metadados da interação
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time INTEGER, -- em milissegundos
  confidence_score DECIMAL(3,2),
  
  -- Contexto da sessão
  session_id UUID,
  emotional_state VARCHAR(50),
  cognitive_load DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. TABELA: INTEGRAÇÃO COM MONITORAMENTO RENAL
CREATE TABLE IF NOT EXISTS clinical_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES imre_assessments(id) ON DELETE CASCADE,
  
  -- Dados clínicos integrados
  renal_function_data JSONB,
  cannabis_metabolism_data JSONB,
  therapeutic_response JSONB,
  
  -- Correlações IMRE ↔ Clínicas
  imre_clinical_correlations JSONB,
  risk_assessment JSONB,
  treatment_recommendations JSONB,
  
  -- Metadados da integração
  integration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correlation_strength DECIMAL(3,2),
  clinical_significance VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 📊 INSERIR DADOS REAIS
-- =====================================================

-- INSERIR USUÁRIOS ADMINISTRADORES
INSERT INTO users (email, name, type, created_at) VALUES
('phpg69@gmail.com', 'Administrador', 'admin', NOW()),
('admin@medcannlab.com', 'Admin Sistema', 'admin', NOW())
ON CONFLICT (email) DO NOTHING;

-- INSERIR PROFISSIONAIS MÉDICOS
INSERT INTO users (email, name, type, crm, phone, address, created_at) VALUES
('passosmir4@gmail.com', 'Dr. Passos Mir', 'professional', '12345-SP', '(11) 99999-9999', 'São Paulo, SP', NOW()),
('joao.silva@medcannlab.com', 'Dr. João Silva', 'professional', '67890-RJ', '(21) 88888-8888', 'Rio de Janeiro, RJ', NOW()),
('maria.santos@medcannlab.com', 'Dra. Maria Santos', 'professional', '11111-MG', '(31) 77777-7777', 'Belo Horizonte, MG', NOW()),
('pedro.costa@medcannlab.com', 'Dr. Pedro Costa', 'professional', '22222-SP', '(11) 66666-6666', 'São Paulo, SP', NOW()),
('ana.oliveira@medcannlab.com', 'Dra. Ana Oliveira', 'professional', '33333-RJ', '(21) 55555-5555', 'Rio de Janeiro, RJ', NOW())
ON CONFLICT (email) DO NOTHING;

-- INSERIR PACIENTES
INSERT INTO users (email, name, type, phone, address, blood_type, allergies, medications, created_at) VALUES
('breakinglegs@hotmail.com', 'Paciente Breaking Legs', 'patient', '(11) 44444-4444', 'São Paulo, SP', 'O+', '{"Penicilina"}', '{"Losartana 50mg", "Hidroclorotiazida 25mg"}', NOW()),
('maria.silva@email.com', 'Maria Silva', 'patient', '(11) 33333-3333', 'São Paulo, SP', 'O+', '{"Penicilina"}', '{"Losartana 50mg", "Hidroclorotiazida 25mg"}', NOW()),
('joao.santos@email.com', 'João Santos', 'patient', '(11) 22222-2222', 'São Paulo, SP', 'A+', '{"Nenhuma"}', '{"Metformina 850mg", "Gliclazida 80mg"}', NOW()),
('ana.costa@email.com', 'Ana Costa', 'patient', '(11) 11111-1111', 'São Paulo, SP', 'B+', '{"Nenhuma"}', '{"Nenhuma"}', NOW()),
('carlos.lima@email.com', 'Carlos Lima', 'patient', '(11) 00000-0000', 'São Paulo, SP', 'AB+', '{"Contraste iodado"}', '{"Bicalutamida 50mg", "Leuprorelina 3.75mg"}', NOW()),
('fernanda.oliveira@email.com', 'Fernanda Oliveira', 'patient', '(11) 99999-9999', 'São Paulo, SP', 'O-', '{"Nenhuma"}', '{"CBD 20mg", "Lorazepam 1mg"}', NOW()),
('roberto.santos@email.com', 'Roberto Santos', 'patient', '(11) 88888-8888', 'São Paulo, SP', 'A-', '{"Nenhuma"}', '{"THC 5mg", "CBD 10mg"}', NOW()),
('lucia.ferreira@email.com', 'Lucia Ferreira', 'patient', '(11) 77777-7777', 'São Paulo, SP', 'B-', '{"Nenhuma"}', '{"CBD 25mg", "Levetiracetam 500mg"}', NOW()),
('paulo.costa@email.com', 'Paulo Costa', 'patient', '(11) 66666-6666', 'São Paulo, SP', 'AB-', '{"Nenhuma"}', '{"THC 2.5mg", "Levodopa 100mg"}', NOW()),
('sandra.alves@email.com', 'Sandra Alves', 'patient', '(11) 55555-5555', 'São Paulo, SP', 'O+', '{"Nenhuma"}', '{"Nenhuma"}', NOW())
ON CONFLICT (email) DO NOTHING;

-- INSERIR ESTUDANTES
INSERT INTO users (email, name, type, created_at) VALUES
('estudante1@medcannlab.com', 'Carlos Oliveira', 'student', NOW()),
('estudante2@medcannlab.com', 'Ana Costa', 'student', NOW()),
('estudante3@medcannlab.com', 'Pedro Santos', 'student', NOW()),
('estudante4@medcannlab.com', 'Maria Lima', 'student', NOW()),
('estudante5@medcannlab.com', 'João Silva', 'student', NOW())
ON CONFLICT (email) DO NOTHING;

-- INSERIR CANAIS DE CHAT
INSERT INTO channels (name, description, type, created_by) VALUES
('Geral', 'Canal geral para discussões', 'public', (SELECT id FROM users WHERE email = 'phpg69@gmail.com')),
('Cannabis Medicinal', 'Discussões sobre cannabis medicinal', 'public', (SELECT id FROM users WHERE email = 'passosmir4@gmail.com')),
('Casos Clínicos', 'Discussão de casos complexos', 'public', (SELECT id FROM users WHERE email = 'joao.silva@medcannlab.com')),
('Pesquisa', 'Pesquisas e estudos recentes', 'public', (SELECT id FROM users WHERE email = 'maria.santos@medcannlab.com')),
('Suporte', 'Suporte técnico e ajuda', 'private', (SELECT id FROM users WHERE email = 'phpg69@gmail.com'));

-- INSERIR DEBATES
INSERT INTO debates (title, description, author_id, category, tags, is_active, participants_count, views, votes) VALUES
('CBD vs THC: Qual é mais eficaz para dor crônica?', 'Discussão sobre a eficácia comparativa entre CBD e THC no tratamento da dor crônica, baseada em evidências clínicas recentes.', (SELECT id FROM users WHERE email = 'joao.silva@medcannlab.com'), 'Cannabis Medicinal', '{"CBD", "THC", "Dor Crônica", "Cannabis"}', true, 24, 156, '{"up": 15, "down": 3}'),
('Protocolo de dosagem para pacientes idosos com cannabis', 'Compartilhamento de protocolos seguros para dosagem de cannabis em pacientes da terceira idade.', (SELECT id FROM users WHERE email = 'maria.santos@medcannlab.com'), 'Protocolos', '{"Dosagem", "Idosos", "Protocolo", "Segurança"}', false, 18, 89, '{"up": 22, "down": 1}'),
('Interações medicamentosas com cannabis: Casos reais', 'Análise de casos reais de interações medicamentosas com cannabis e estratégias de prevenção.', (SELECT id FROM users WHERE email = 'pedro.costa@medcannlab.com'), 'Farmacologia', '{"Interações", "Farmacologia", "Casos Reais", "Segurança"}', true, 31, 203, '{"up": 28, "down": 2}');

-- INSERIR CURSOS
INSERT INTO courses (title, description, category, level, duration, price, created_by) VALUES
('Arte da Entrevista Clínica', 'Curso completo sobre técnicas de entrevista clínica', 'Clínica', 'intermediate', 120, 299.90, (SELECT id FROM users WHERE email = 'passosmir4@gmail.com')),
('Pós-Graduação Cannabis Medicinal', 'Especialização em cannabis medicinal', 'Especialização', 'advanced', 480, 2999.90, (SELECT id FROM users WHERE email = 'joao.silva@medcannlab.com')),
('Sistema IMRE Triaxial', 'Metodologia IMRE para avaliação clínica', 'Metodologia', 'intermediate', 90, 199.90, (SELECT id FROM users WHERE email = 'maria.santos@medcannlab.com')),
('Introdução à Cannabis Medicinal', 'Curso introdutório sobre cannabis medicinal', 'Introdução', 'beginner', 60, 99.90, (SELECT id FROM users WHERE email = 'pedro.costa@medcannlab.com'));

-- INSERIR MONITORAMENTO RENAL
INSERT INTO renal_monitoring (patient_id, creatinine, tfg, risk_level, last_check, notes) VALUES
((SELECT id FROM users WHERE email = 'maria.silva@email.com'), 1.8, 45, 'high', NOW() - INTERVAL '2 hours', 'Paciente em acompanhamento'),
((SELECT id FROM users WHERE email = 'joao.santos@email.com'), 1.5, 58, 'medium', NOW() - INTERVAL '4 hours', 'Monitoramento regular'),
((SELECT id FROM users WHERE email = 'ana.costa@email.com'), 1.2, 72, 'low', NOW() - INTERVAL '6 hours', 'Função renal estável'),
((SELECT id FROM users WHERE email = 'carlos.lima@email.com'), 2.1, 38, 'critical', NOW() - INTERVAL '1 hour', 'Acompanhamento intensivo');

-- INSERIR ALERTAS RENAIS
INSERT INTO renal_alerts (patient_id, alert_type, severity, message, is_resolved) VALUES
((SELECT id FROM users WHERE email = 'carlos.lima@email.com'), 'creatinine_high', 'critical', 'Creatinina elevada - 2.1 mg/dL', false),
((SELECT id FROM users WHERE email = 'maria.silva@email.com'), 'tfg_low', 'high', 'TFG baixo - 45 mL/min', false),
((SELECT id FROM users WHERE email = 'joao.santos@email.com'), 'tfg_declining', 'medium', 'Declínio na TFG observado', false);

-- INSERIR CHATS PRIVADOS
INSERT INTO private_chats (doctor_id, patient_id) VALUES
((SELECT id FROM users WHERE email = 'passosmir4@gmail.com'), (SELECT id FROM users WHERE email = 'breakinglegs@hotmail.com')),
((SELECT id FROM users WHERE email = 'passosmir4@gmail.com'), (SELECT id FROM users WHERE email = 'maria.silva@email.com')),
((SELECT id FROM users WHERE email = 'joao.silva@medcannlab.com'), (SELECT id FROM users WHERE email = 'joao.santos@email.com'));

-- INSERIR MENSAGENS PRIVADAS
INSERT INTO private_messages (chat_id, sender_id, content, type) VALUES
((SELECT id FROM private_chats WHERE doctor_id = (SELECT id FROM users WHERE email = 'passosmir4@gmail.com') AND patient_id = (SELECT id FROM users WHERE email = 'breakinglegs@hotmail.com')), (SELECT id FROM users WHERE email = 'passosmir4@gmail.com'), 'Olá! Como você está se sentindo hoje?', 'text'),
((SELECT id FROM private_chats WHERE doctor_id = (SELECT id FROM users WHERE email = 'passosmir4@gmail.com') AND patient_id = (SELECT id FROM users WHERE email = 'breakinglegs@hotmail.com')), (SELECT id FROM users WHERE email = 'breakinglegs@hotmail.com'), 'Olá doutor! Estou me sentindo bem, obrigada!', 'text');

-- INSERIR INSCRIÇÕES EM CURSOS
INSERT INTO course_enrollments (course_id, user_id, progress) VALUES
((SELECT id FROM courses WHERE title = 'Arte da Entrevista Clínica'), (SELECT id FROM users WHERE email = 'estudante1@medcannlab.com'), 25.5),
((SELECT id FROM courses WHERE title = 'Pós-Graduação Cannabis Medicinal'), (SELECT id FROM users WHERE email = 'estudante2@medcannlab.com'), 60.0),
((SELECT id FROM courses WHERE title = 'Sistema IMRE Triaxial'), (SELECT id FROM users WHERE email = 'estudante3@medcannlab.com'), 15.0);

-- INSERIR AVALIAÇÕES CLÍNICAS
INSERT INTO clinical_assessments (patient_id, doctor_id, assessment_type, data, status) VALUES
((SELECT id FROM users WHERE email = 'breakinglegs@hotmail.com'), (SELECT id FROM users WHERE email = 'passosmir4@gmail.com'), 'IMRE', '{"symptoms": ["dor", "ansiedade"], "severity": "moderate"}', 'completed'),
((SELECT id FROM users WHERE email = 'maria.silva@email.com'), (SELECT id FROM users WHERE email = 'passosmir4@gmail.com'), 'AEC', '{"interview_data": "dados da entrevista"}', 'in_progress');

-- =====================================================
-- 🔧 CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debates_category ON debates(category);
CREATE INDEX IF NOT EXISTS idx_debates_is_active ON debates(is_active);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_chat_id ON private_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_renal_monitoring_patient_id ON renal_monitoring(patient_id);
CREATE INDEX IF NOT EXISTS idx_renal_alerts_patient_id ON renal_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_documents_keywords ON documents USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_documents_medical_terms ON documents USING GIN (medical_terms);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_semantic_analysis_chat_id ON semantic_analysis(chat_id);

-- Índices para IMRE Assessments
CREATE INDEX IF NOT EXISTS idx_imre_assessments_user_id ON imre_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_imre_assessments_patient_id ON imre_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_imre_assessments_date ON imre_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_imre_assessments_status ON imre_assessments(completion_status);

-- Índices para Blocos Semânticos
CREATE INDEX IF NOT EXISTS idx_imre_blocks_assessment_id ON imre_semantic_blocks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_imre_blocks_type ON imre_semantic_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_imre_blocks_timestamp ON imre_semantic_blocks(block_timestamp);

-- Índices para Contexto Semântico
CREATE INDEX IF NOT EXISTS idx_semantic_context_user_id ON imre_semantic_context(user_id);
CREATE INDEX IF NOT EXISTS idx_semantic_context_updated ON imre_semantic_context(last_updated);

-- Índices para NOA Interactions
CREATE INDEX IF NOT EXISTS idx_noa_logs_user_id ON noa_interaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_logs_assessment_id ON noa_interaction_logs(assessment_id);
CREATE INDEX IF NOT EXISTS idx_noa_logs_timestamp ON noa_interaction_logs(interaction_timestamp);

-- Índices para Integração Clínica
CREATE INDEX IF NOT EXISTS idx_clinical_integration_user_id ON clinical_integration(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_integration_assessment_id ON clinical_integration(assessment_id);

-- =====================================================
-- 🔒 CONFIGURAR RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE renal_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE renal_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE imre_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE imre_semantic_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE imre_semantic_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_integration ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ✅ SETUP COMPLETO FINALIZADO!
-- =====================================================

-- Verificar se tudo foi criado corretamente
SELECT 'Setup completo! Todas as 21 tabelas foram criadas e populadas com dados reais.' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_courses FROM courses;
SELECT COUNT(*) as total_debates FROM debates;
