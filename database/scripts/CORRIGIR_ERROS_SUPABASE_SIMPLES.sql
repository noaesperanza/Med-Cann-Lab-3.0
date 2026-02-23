-- =====================================================
-- CORREÇÃO SIMPLES DE ERROS SUPABASE - MedCannLab 3.0
-- Versão simplificada sem referências complexas
-- =====================================================

-- 1. Criar tabela de transações (simplificada)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  type TEXT NOT NULL DEFAULT 'payment',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de agendamentos (simplificada)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled',
  type TEXT NOT NULL DEFAULT 'consultation',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de cursos (simplificada)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  duration_hours INTEGER,
  price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de inscrições (simplificada)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'enrolled'
);

-- 5. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);

-- 6. Habilitar RLS básico
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS básicas
CREATE POLICY "Usuários veem suas transações" ON transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários veem seus agendamentos" ON appointments
  FOR SELECT USING (patient_id = auth.uid() OR professional_id = auth.uid());

CREATE POLICY "Todos veem cursos ativos" ON courses
  FOR SELECT USING (status = 'active');

CREATE POLICY "Usuários veem suas inscrições" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

-- 8. Inserir dados de exemplo
INSERT INTO courses (id, title, description, instructor_name, duration_hours, price) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Arte da Entrevista Clínica', 'Fundamentos da entrevista clínica aplicada à Cannabis Medicinal', 'Dr. Eduardo Faveret', 40, 299.90),
  ('550e8400-e29b-41d4-a716-446655440002', 'Farmacologia da Cannabis', 'Estudo dos componentes ativos e mecanismos de ação', 'Dr. Farmacologista', 60, 399.90),
  ('550e8400-e29b-41d4-a716-446655440003', 'Casos Clínicos', 'Casos clínicos e protocolos terapêuticos', 'Dr. Clínico', 80, 499.90)
ON CONFLICT (id) DO NOTHING;

-- 9. Verificar criação
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_courses FROM courses;
SELECT COUNT(*) as total_transactions FROM transactions;
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- =====================================================
-- SCRIPT SIMPLIFICADO CONCLUÍDO!
-- =====================================================
