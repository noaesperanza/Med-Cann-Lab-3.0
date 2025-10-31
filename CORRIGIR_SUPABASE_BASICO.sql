-- =====================================================
-- CORREÇÃO BÁSICA - MedCannLab 3.0
-- Verificar e criar tabelas passo a passo
-- =====================================================

-- 1. Verificar se tabela courses existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'courses'
) as courses_exists;

-- 2. Se não existir, criar tabela courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  duration_hours INTEGER,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar estrutura da tabela courses
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- 4. Criar outras tabelas básicas
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0
);

-- 5. Verificar se já existem dados na tabela courses
SELECT COUNT(*) as total_courses FROM courses;

-- 6. Se não houver dados, inserir dados de exemplo
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM courses) = 0 THEN
    INSERT INTO courses (id, title, description, instructor_name, duration_hours, price) VALUES 
      ('550e8400-e29b-41d4-a716-446655440001', 'Arte da Entrevista Clínica', 'Fundamentos da entrevista clínica aplicada à Cannabis Medicinal', 'Dr. Eduardo Faveret', 40, 299.90),
      ('550e8400-e29b-41d4-a716-446655440002', 'Farmacologia da Cannabis', 'Estudo dos componentes ativos e mecanismos de ação', 'Dr. Farmacologista', 60, 399.90),
      ('550e8400-e29b-41d4-a716-446655440003', 'Casos Clínicos', 'Casos clínicos e protocolos terapêuticos', 'Dr. Clínico', 80, 499.90);
  END IF;
END $$;

-- 7. Verificar resultado final
SELECT 'Tabelas criadas com sucesso!' as status;

-- 8. Contar registros em todas as tabelas
SELECT 'courses' as tabela, COUNT(*) as total FROM courses
UNION ALL
SELECT 'transactions' as tabela, COUNT(*) as total FROM transactions
UNION ALL
SELECT 'appointments' as tabela, COUNT(*) as total FROM appointments
UNION ALL
SELECT 'course_enrollments' as tabela, COUNT(*) as total FROM course_enrollments;

-- =====================================================
-- SCRIPT BÁSICO CONCLUÍDO!
-- =====================================================
