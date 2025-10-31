-- Script para alterar usuário profrvalenca@gmail.com para tipo 'patient'
-- Este usuário será usado como paciente teste do Dr. Eduardo Faveret

-- 1. Verificar o usuário atual
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_type' as current_type,
    raw_user_meta_data->>'name' as name,
    created_at
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';

-- 2. Atualizar o tipo de usuário para 'patient'
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"user_type": "patient"}'::jsonb
WHERE email = 'profrvalenca@gmail.com';

-- 3. Verificar a alteração
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_type' as new_type,
    raw_user_meta_data->>'name' as name,
    updated_at
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';

-- Script para alterar usuário profrvalenca@gmail.com para tipo 'patient'
-- Este usuário será usado como paciente teste do Dr. Eduardo Faveret

-- 1. Verificar o usuário atual
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_type' as current_type,
    raw_user_meta_data->>'name' as name,
    created_at
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';

-- 2. Atualizar o tipo de usuário para 'patient'
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"user_type": "patient"}'::jsonb
WHERE email = 'profrvalenca@gmail.com';

-- 3. Verificar a alteração
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_type' as new_type,
    raw_user_meta_data->>'name' as name,
    updated_at
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';

-- 4. Criar/atualizar perfil do paciente na tabela profiles
INSERT INTO public.profiles (
    id,
    email,
    name,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', 'Paciente Teste'),
    created_at,
    NOW()
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
    name = COALESCE(EXCLUDED.name, 'Paciente Teste'),
    updated_at = NOW();

-- 5. Verificar o perfil criado/atualizado
SELECT 
    id,
    email,
    name,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'profrvalenca@gmail.com';

-- 6. Criar algumas avaliações clínicas de teste para este paciente
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
    'Paciente Teste',
    35,
    '123.456.789-00',
    '(11) 99999-9999',
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'Dr. Eduardo Faveret',
    'IMRE',
    'completed',
    '{
        "name": "Paciente Teste",
        "age": 35,
        "complaintList": ["Epilepsia", "Ansiedade", "Insônia"],
        "improvement": true,
        "symptoms": ["Convulsões reduzidas", "Melhor qualidade do sono"],
        "medication": "CBD 10mg/dia"
    }'::jsonb,
    'Relatório de Avaliação Clínica Inicial - Paciente Teste

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
    'Paciente Teste',
    35,
    '123.456.789-00',
    '(11) 99999-9999',
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'Dr. Eduardo Faveret',
    'AEC',
    'completed',
    '{
        "name": "Paciente Teste",
        "age": 35,
        "complaintList": ["Epilepsia", "Ansiedade"],
        "improvement": true,
        "symptoms": ["Melhora cognitiva", "Redução de convulsões"],
        "medication": "CBD 10mg/dia + THC 2mg/dia"
    }'::jsonb,
    'Relatório de Avaliação Clínica - Arte da Entrevista Clínica

PACIENTE: Paciente Teste
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

-- 7. Verificar as avaliações criadas
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

-- 8. Resumo final
SELECT 
    'ALTERAÇÃO CONCLUÍDA' as status,
    'profrvalenca@gmail.com' as email,
    'patient' as new_type,
    'Paciente Teste do Dr. Eduardo Faveret' as description;
