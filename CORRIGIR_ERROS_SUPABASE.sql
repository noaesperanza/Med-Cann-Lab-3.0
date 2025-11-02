-- =====================================================
-- CORREÇÃO DE ERROS SUPABASE - MedCannLab 3.0
-- Resolver erros 400 identificados no deploy
-- =====================================================

-- 1. Criar tabela de transações (se não existir)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'subscription', 'course_purchase')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  payment_method TEXT,
  external_id TEXT, -- ID do gateway de pagamento
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de agendamentos (se não existir)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  professional_id UUID NOT NULL REFERENCES auth.users(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  type TEXT NOT NULL DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow_up', 'emergency', 'assessment')),
  notes TEXT,
  location TEXT DEFAULT 'online',
  meeting_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de cursos (se não existir)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT, -- Nome do instrutor em vez de referência
  duration_hours INTEGER,
  price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de inscrições em cursos
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_courses_instructor_name ON courses(instructor_name);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);

-- 6. Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS para transações
CREATE POLICY "Usuários veem suas próprias transações" ON transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas próprias transações" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins podem ver todas as transações" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' = 'admin'
    )
  );

-- 8. Políticas RLS para agendamentos
CREATE POLICY "Pacientes veem seus agendamentos" ON appointments
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Profissionais veem agendamentos com eles" ON appointments
  FOR SELECT USING (professional_id = auth.uid());

CREATE POLICY "Profissionais podem criar agendamentos" ON appointments
  FOR INSERT WITH CHECK (
    professional_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' IN ('professional', 'admin')
    )
  );

CREATE POLICY "Admins podem gerenciar todos os agendamentos" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' = 'admin'
    )
  );

-- 9. Políticas RLS para cursos
CREATE POLICY "Todos podem ver cursos ativos" ON courses
  FOR SELECT USING (status = 'active');

CREATE POLICY "Instrutores podem gerenciar cursos por nome" ON courses
  FOR ALL USING (
    instructor_name = (
      SELECT raw_user_meta_data->>'name' 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins podem gerenciar todos os cursos" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' = 'admin'
    )
  );

-- 10. Políticas RLS para inscrições
CREATE POLICY "Usuários veem suas próprias inscrições" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem se inscrever em cursos" ON course_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Instrutores veem inscrições em seus cursos" ON course_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_enrollments.course_id 
      AND courses.instructor_name = (
        SELECT raw_user_meta_data->>'name' 
        FROM auth.users 
        WHERE id = auth.uid()
      )
    )
  );

-- 11. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Triggers para updated_at
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Inserir dados de exemplo
INSERT INTO courses (id, title, description, instructor_name, duration_hours, price, status) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Arte da Entrevista Clínica', 'Fundamentos da entrevista clínica aplicada à Cannabis Medicinal', 'Dr. Eduardo Faveret', 40, 299.90, 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Farmacologia da Cannabis', 'Estudo dos componentes ativos e mecanismos de ação', 'Dr. Farmacologista', 60, 399.90, 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Casos Clínicos', 'Casos clínicos e protocolos terapêuticos', 'Dr. Clínico', 80, 499.90, 'active')
ON CONFLICT (id) DO NOTHING;

-- 14. Verificar criação das tabelas
SELECT 
  'Tabelas criadas com sucesso!' as status,
  COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_name IN ('transactions', 'appointments', 'courses', 'course_enrollments');

-- 15. Verificar políticas RLS
SELECT 
  tablename,
  COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename IN ('transactions', 'appointments', 'courses', 'course_enrollments')
GROUP BY tablename;

-- 16. Contar registros de exemplo
SELECT 
  'courses' as tabela,
  COUNT(*) as total_registros
FROM courses
UNION ALL
SELECT 
  'transactions' as tabela,
  COUNT(*) as total_registros
FROM transactions
UNION ALL
SELECT 
  'appointments' as tabela,
  COUNT(*) as total_registros
FROM appointments
UNION ALL
SELECT 
  'course_enrollments' as tabela,
  COUNT(*) as total_registros
FROM course_enrollments;

-- =====================================================
-- SCRIPT CONCLUÍDO COM SUCESSO!
-- =====================================================
