-- =====================================================
-- SCRIPT SQL PARA SISTEMA DE RELATÓRIOS CLÍNICOS
-- MedCannLab 3.0 - Rota Mais Importante
-- =====================================================

-- Tabela para relatórios clínicos
CREATE TABLE IF NOT EXISTS clinical_reports (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('initial_assessment', 'follow_up', 'emergency')),
  protocol TEXT NOT NULL DEFAULT 'IMRE',
  content JSONB NOT NULL,
  generated_by TEXT NOT NULL CHECK (generated_by IN ('ai_resident', 'professional')),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'reviewed')),
  professional_id TEXT,
  professional_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para notificações
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  user_id TEXT,
  user_type TEXT CHECK (user_type IN ('patient', 'professional', 'admin'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clinical_reports_patient_id ON clinical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_generated_at ON clinical_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_generated_by ON clinical_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- RLS (Row Level Security) para relatórios clínicos
ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;

-- Política: Pacientes podem ver apenas seus próprios relatórios
CREATE POLICY "Pacientes podem ver seus próprios relatórios" ON clinical_reports
  FOR SELECT USING (
    patient_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' = 'patient'
      AND id::text = patient_id
    )
  );

-- Política: Profissionais podem ver todos os relatórios
CREATE POLICY "Profissionais podem ver todos os relatórios" ON clinical_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' IN ('professional', 'admin')
    )
  );

-- Política: IA pode inserir relatórios
CREATE POLICY "IA pode inserir relatórios" ON clinical_reports
  FOR INSERT WITH CHECK (true);

-- RLS para notificações
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias notificações
CREATE POLICY "Usuários podem ver suas notificações" ON notifications
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' IN ('professional', 'admin')
    )
  );

-- Política: Sistema pode inserir notificações
CREATE POLICY "Sistema pode inserir notificações" ON notifications
  FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clinical_reports_updated_at 
  BEFORE UPDATE ON clinical_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo (opcional)
INSERT INTO clinical_reports (
  id, 
  patient_id, 
  patient_name, 
  report_type, 
  protocol, 
  content, 
  generated_by, 
  generated_at, 
  status
) VALUES (
  'example_report_001',
  'example_patient_001',
  'Paciente Exemplo',
  'initial_assessment',
  'IMRE',
  '{
    "investigation": "Investigação realizada através da avaliação clínica inicial com IA residente",
    "methodology": "Aplicação da Arte da Entrevista Clínica (AEC) com protocolo IMRE",
    "result": "Avaliação clínica inicial concluída com sucesso",
    "evolution": "Plano de cuidado personalizado estabelecido",
    "recommendations": [
      "Continuar acompanhamento clínico regular",
      "Seguir protocolo de tratamento estabelecido",
      "Manter comunicação com equipe médica"
    ],
    "scores": {
      "clinical_score": 75,
      "treatment_adherence": 80,
      "symptom_improvement": 70,
      "quality_of_life": 85
    }
  }',
  'ai_resident',
  NOW(),
  'completed'
) ON CONFLICT (id) DO NOTHING;

-- Inserir notificação de exemplo
INSERT INTO notifications (
  id,
  type,
  title,
  message,
  data,
  user_id,
  user_type
) VALUES (
  'example_notification_001',
  'new_clinical_report',
  'Novo Relatório Clínico Gerado',
  'A IA residente gerou um novo relatório clínico para Paciente Exemplo',
  '{
    "report_id": "example_report_001",
    "patient_id": "example_patient_001",
    "patient_name": "Paciente Exemplo",
    "report_type": "initial_assessment",
    "generated_at": "2024-12-19T15:30:00Z"
  }',
  'example_professional_001',
  'professional'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO DAS TABELAS CRIADAS
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('clinical_reports', 'notifications')
ORDER BY table_name, ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('clinical_reports', 'notifications');

-- Contar registros nas tabelas
SELECT 
  'clinical_reports' as tabela,
  COUNT(*) as total_registros
FROM clinical_reports
UNION ALL
SELECT 
  'notifications' as tabela,
  COUNT(*) as total_registros
FROM notifications;

-- =====================================================
-- SCRIPT CONCLUÍDO COM SUCESSO!
-- =====================================================
