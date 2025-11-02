-- =====================================================
-- CORREÇÃO ULTRA SIMPLES - MedCannLab 3.0
-- Apenas criar tabelas básicas sem políticas complexas
-- =====================================================

-- 1. Criar tabela de transações (mínima)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de agendamentos (mínima)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de cursos (mínima)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  duration_hours INTEGER,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de inscrições (mínima)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0
);

-- 5. Inserir dados de exemplo básicos
INSERT INTO courses (id, title, description, instructor_name, duration_hours, price) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Arte da Entrevista Clínica', 'Fundamentos da entrevista clínica aplicada à Cannabis Medicinal', 'Dr. Eduardo Faveret', 40, 299.90),
  ('550e8400-e29b-41d4-a716-446655440002', 'Farmacologia da Cannabis', 'Estudo dos componentes ativos e mecanismos de ação', 'Dr. Farmacologista', 60, 399.90),
  ('550e8400-e29b-41d4-a716-446655440003', 'Casos Clínicos', 'Casos clínicos e protocolos terapêuticos', 'Dr. Clínico', 80, 499.90)
ON CONFLICT (id) DO NOTHING;

-- 6. Verificar criação (sem usar colunas que podem não existir)
SELECT 'Tabelas criadas com sucesso!' as status;

-- 7. Contar registros básicos
SELECT 'courses' as tabela, COUNT(*) as total FROM courses
UNION ALL
SELECT 'transactions' as tabela, COUNT(*) as total FROM transactions
UNION ALL
SELECT 'appointments' as tabela, COUNT(*) as total FROM appointments
UNION ALL
SELECT 'course_enrollments' as tabela, COUNT(*) as total FROM course_enrollments;

-- =====================================================
-- SCRIPT ULTRA SIMPLES CONCLUÍDO!
-- =====================================================
