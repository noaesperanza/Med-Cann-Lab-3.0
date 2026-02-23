-- =====================================================
-- DADOS DE TESTE - PACIENTES
-- =====================================================
-- Inserir pacientes fictícios para teste do fluxo

-- Inserir usuários de teste (se não existirem)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'test-patient-001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'maria.silva@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Maria Silva", "type": "patient"}',
  false,
  '',
  '',
  '',
  ''
), (
  'test-patient-002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'joao.santos@test.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "João Santos", "type": "patient"}',
  false,
  '',
  '',
  '',
  ''
), (
  'test-doctor-001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ricardo.valenca@medcannlab.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Dr. Ricardo Valença", "type": "professional"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Inserir avaliação clínica de teste para Maria Silva
INSERT INTO clinical_assessments (
  patient_id,
  doctor_id,
  assessment_type,
  data,
  status,
  clinical_report
) VALUES (
  'test-patient-001',
  'test-doctor-001',
  'IMRE',
  '{
    "complaintList": ["Dor de cabeça", "Insônia", "Ansiedade"],
    "complaintDetails": {
      "Dor de cabeça": {
        "intensidade": "Moderada",
        "frequencia": "Diária",
        "duracao": "2 semanas"
      },
      "Insônia": {
        "intensidade": "Severa",
        "frequencia": "Todas as noites",
        "duracao": "1 mês"
      }
    },
    "medications": ["Paracetamol", "Diazepam"],
    "allergies": ["Penicilina"],
    "familyHistory": "Hipertensão materna, diabetes paterna",
    "lifestyle": {
      "exercicio": "Sedentário",
      "alimentacao": "Irregular",
      "stress": "Alto"
    },
    "clinicalNotes": "Paciente relata dor de cabeça há 2 semanas, associada a insônia e ansiedade. Uso de medicação sintomática sem melhora significativa."
  }',
  'completed',
  '## RELATÓRIO CLÍNICO - AVALIAÇÃO IMRE

**Paciente:** Maria Silva  
**Data:** ' || NOW() || '  
**Avaliação:** IMRE Triaxial  

### QUEIXAS PRINCIPAIS
- Dor de cabeça (Moderada, Diária, 2 semanas)
- Insônia (Severa, Todas as noites, 1 mês)  
- Ansiedade

### MEDICAÇÕES ATUAIS
- Paracetamol
- Diazepam

### ALERGIAS
- Penicilina

### HISTÓRICO FAMILIAR
- Hipertensão materna
- Diabetes paterna

### ESTILO DE VIDA
- Exercício: Sedentário
- Alimentação: Irregular
- Stress: Alto

### OBSERVAÇÕES CLÍNICAS
Paciente relata dor de cabeça há 2 semanas, associada a insônia e ansiedade. Uso de medicação sintomática sem melhora significativa.

### RECOMENDAÇÕES
1. Avaliação para possível indicação de Cannabis Medicinal
2. Acompanhamento psicológico
3. Melhoria do estilo de vida
4. Reavaliação em 30 dias

---
*Relatório gerado automaticamente pelo Sistema Nôa Esperança*'
);

-- Inserir avaliação clínica de teste para João Santos
INSERT INTO clinical_assessments (
  patient_id,
  doctor_id,
  assessment_type,
  data,
  status,
  clinical_report
) VALUES (
  'test-patient-002',
  'test-doctor-001',
  'IMRE',
  '{
    "complaintList": ["Dor crônica", "Depressão"],
    "complaintDetails": {
      "Dor crônica": {
        "intensidade": "Severa",
        "frequencia": "Constante",
        "duracao": "6 meses"
      },
      "Depressão": {
        "intensidade": "Moderada",
        "frequencia": "Diária",
        "duracao": "3 meses"
      }
    },
    "medications": ["Tramadol", "Sertralina"],
    "allergies": [],
    "familyHistory": "Depressão materna",
    "lifestyle": {
      "exercicio": "Limitado",
      "alimentacao": "Regular",
      "stress": "Médio"
    },
    "clinicalNotes": "Paciente com dor crônica há 6 meses, associada a quadro depressivo. Uso de tramadol e sertralina com resposta parcial."
  }',
  'completed',
  '## RELATÓRIO CLÍNICO - AVALIAÇÃO IMRE

**Paciente:** João Santos  
**Data:** ' || NOW() || '  
**Avaliação:** IMRE Triaxial  

### QUEIXAS PRINCIPAIS
- Dor crônica (Severa, Constante, 6 meses)
- Depressão (Moderada, Diária, 3 meses)

### MEDICAÇÕES ATUAIS
- Tramadol
- Sertralina

### ALERGIAS
- Nenhuma relatada

### HISTÓRICO FAMILIAR
- Depressão materna

### ESTILO DE VIDA
- Exercício: Limitado
- Alimentação: Regular
- Stress: Médio

### OBSERVAÇÕES CLÍNICAS
Paciente com dor crônica há 6 meses, associada a quadro depressivo. Uso de tramadol e sertralina com resposta parcial.

### RECOMENDAÇÕES
1. Avaliação para Cannabis Medicinal para dor crônica
2. Continuidade do tratamento antidepressivo
3. Fisioterapia
4. Acompanhamento psicológico
5. Reavaliação em 15 dias

---
*Relatório gerado automaticamente pelo Sistema Nôa Esperança*'
);
