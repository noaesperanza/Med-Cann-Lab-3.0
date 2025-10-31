-- SCRIPT CORRIGIDO PARA SUPABASE - VERSÃO FINAL
-- Execute este script no SQL Editor do Supabase

-- 1. Remover tabelas existentes (se existirem)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS clinical_reports CASCADE;

-- 2. Criar tabela de relatórios clínicos
CREATE TABLE clinical_reports (
  id TEXT PRIMARY KEY,
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('initial_assessment', 'follow_up', 'emergency')),
  protocol TEXT NOT NULL DEFAULT 'IMRE',
  content JSONB NOT NULL,
  generated_by TEXT NOT NULL CHECK (generated_by IN ('ai_resident', 'professional')),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'reviewed')),
  professional_id UUID,
  professional_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de notificações
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  user_id UUID,
  user_type TEXT CHECK (user_type IN ('patient', 'professional', 'admin'))
);

-- 4. Criar índices
CREATE INDEX idx_clinical_reports_patient_id ON clinical_reports(patient_id);
CREATE INDEX idx_clinical_reports_generated_at ON clinical_reports(generated_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- 5. Habilitar RLS
ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para relatórios
CREATE POLICY "Pacientes veem seus relatórios" ON clinical_reports
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Profissionais veem todos relatórios" ON clinical_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' IN ('professional', 'admin')
    )
  );

CREATE POLICY "IA pode inserir relatórios" ON clinical_reports
  FOR INSERT WITH CHECK (true);

-- 7. Políticas RLS para notificações
CREATE POLICY "Usuários veem suas notificações" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'type' IN ('professional', 'admin')
    )
  );

CREATE POLICY "Sistema pode inserir notificações" ON notifications
  FOR INSERT WITH CHECK (true);

-- 8. Função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Trigger para updated_at
CREATE TRIGGER update_clinical_reports_updated_at 
  BEFORE UPDATE ON clinical_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Dados de exemplo
INSERT INTO clinical_reports (
  id, patient_id, patient_name, report_type, protocol, content, generated_by, status
) VALUES (
  'example_report_001',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Paciente Exemplo',
  'initial_assessment',
  'IMRE',
  '{"investigation": "Investigação realizada", "methodology": "Protocolo IMRE", "result": "Avaliação concluída", "evolution": "Plano estabelecido", "recommendations": ["Continuar acompanhamento"], "scores": {"clinical_score": 75}}',
  'ai_resident',
  'completed'
);

INSERT INTO notifications (
  id, type, title, message, data, user_id, user_type
) VALUES (
  'example_notification_001',
  'new_clinical_report',
  'Novo Relatório Clínico',
  'IA gerou relatório para Paciente Exemplo',
  '{"report_id": "example_report_001", "patient_name": "Paciente Exemplo"}',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'professional'
);

-- 11. Verificar criação
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_relatorios FROM clinical_reports;
SELECT COUNT(*) as total_notificacoes FROM notifications;
