-- Criar avaliações clínicas de teste para o paciente profrvalenca@gmail.com
-- Isso fará com que ele apareça na lista de pacientes do Dr. Eduardo

-- 1. Primeiro, vamos verificar se já existem avaliações para este paciente
SELECT 
    id,
    patient_id,
    patient_name,
    assessment_type,
    status,
    created_at
FROM public.clinical_assessments 
WHERE patient_id = (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com');

-- 2. Criar avaliações clínicas de teste
INSERT INTO public.clinical_assessments (
    id,
    patient_id,
    patient_name,
    patient_age,
    patient_cpf,
    patient_phone,
    doctor_id,
    doctor_name,
    assessment_type,
    status,
    data,
    clinical_report,
    created_at,
    updated_at
)
VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com'),
    'Dr. Ricardo Valença',
    35,
    '123.456.789-00',
    '(11) 99999-9999',
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'Dr. Eduardo Faveret',
    'IMRE',
    'completed',
    '{
        "name": "Dr. Ricardo Valença",
        "age": 35,
        "complaintList": ["Epilepsia", "Ansiedade", "Insônia"],
        "improvement": true,
        "symptoms": ["Convulsões reduzidas", "Melhor qualidade do sono"],
        "medication": "CBD 10mg/dia"
    }'::jsonb,
    'Relatório de Avaliação Clínica Inicial - Dr. Ricardo Valença

DIAGNÓSTICO PRINCIPAL: Epilepsia refratária com comorbidades ansiosas

HISTÓRIA CLÍNICA:
- Paciente de 35 anos com histórico de epilepsia desde os 18 anos
- Múltiplas tentativas de tratamento convencional sem sucesso completo
- Comorbidades: ansiedade generalizada e insônia
- Iniciou tratamento com cannabis medicinal há 6 meses

AVALIAÇÃO ATUAL:
- Redução significativa na frequência de convulsões (de 3-4/mês para 1/mês)
- Melhora na qualidade do sono
- Redução dos sintomas de ansiedade
- Boa aderência ao tratamento

PLANO TERAPÊUTICO:
- Manter CBD 10mg/dia
- Acompanhamento mensal
- Monitoramento via wearables
- Ajuste de dosagem conforme necessário

PRÓXIMA CONSULTA: 30 dias',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
),
(
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com'),
    'Dr. Ricardo Valença',
    35,
    '123.456.789-00',
    '(11) 99999-9999',
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'Dr. Eduardo Faveret',
    'AEC',
    'completed',
    '{
        "name": "Dr. Ricardo Valença",
        "age": 35,
        "complaintList": ["Epilepsia", "Ansiedade"],
        "improvement": true,
        "symptoms": ["Melhora cognitiva", "Redução de convulsões"],
        "medication": "CBD 10mg/dia + THC 2mg/dia"
    }'::jsonb,
    'Relatório de Avaliação Clínica - Arte da Entrevista Clínica

PACIENTE: Dr. Ricardo Valença
IDADE: 35 anos
DATA: ' || (NOW() - INTERVAL '7 days')::date || '

QUEIXA PRINCIPAL: Epilepsia refratária com melhora significativa

EVOLUÇÃO:
- Paciente relata melhora contínua desde última consulta
- Redução adicional na frequência de convulsões
- Melhora na função cognitiva
- Ajuste na medicação com adição de THC em baixa dosagem

EXAME FÍSICO:
- Sinais vitais estáveis
- Exame neurológico sem alterações
- Paciente alerta e orientado

PLANO:
- Manter CBD 10mg/dia
- Adicionar THC 2mg/dia
- Retorno em 30 dias
- Continuar monitoramento',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
);

-- 3. Verificar se as avaliações foram criadas
SELECT 
    id,
    patient_name,
    assessment_type,
    status,
    created_at,
    clinical_report
FROM public.clinical_assessments 
WHERE patient_id = (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com')
ORDER BY created_at DESC;

-- 4. Verificar se o paciente agora aparece na lista
SELECT 
    patient_id,
    patient_name,
    patient_age,
    patient_cpf,
    patient_phone,
    COUNT(*) as total_assessments,
    MAX(created_at) as last_visit
FROM public.clinical_assessments 
WHERE patient_id = (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com')
GROUP BY patient_id, patient_name, patient_age, patient_cpf, patient_phone;
