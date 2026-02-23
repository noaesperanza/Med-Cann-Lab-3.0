-- FLUXO COMPLETO: Avaliação Clínica Inicial com IA Resident
-- Simula todo o processo: IA avalia → gera relatório → paciente compartilha → profissional recebe notificação

-- 1. Criar avaliação clínica inicial completa para o paciente teste
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
        "medication": "CBD 10mg/dia",
        "aiAssessment": true,
        "sharedWithDoctor": true,
        "nftMinted": true,
        "blockchainHash": "0x1234567890abcdef"
    }'::jsonb,
    'RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL - IA RESIDENT NÔA ESPERANÇA

PACIENTE: Dr. Ricardo Valença
IDADE: 35 anos
DATA: ' || NOW()::date || '
MÉDICO RESPONSÁVEL: Dr. Eduardo Faveret
PROTOCOLO: IMRE Triaxial
IA RESPONSÁVEL: Nôa Esperança - IA Resident

═══════════════════════════════════════════════════════════════

1. LISTA INDICIÁRIA (Análise IA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUEIXAS PRINCIPAIS IDENTIFICADAS:
• Epilepsia refratária (diagnóstico prévio)
• Ansiedade generalizada
• Insônia crônica
• Fadiga diurna
• Dificuldade de concentração

SINTOMAS RELATADOS:
• Convulsões tônico-clônicas (frequência: 2-3/mês)
• Episódios de ansiedade (diários)
• Dificuldade para iniciar sono
• Despertar precoce
• Irritabilidade

2. DESENVOLVIMENTO DA QUEIXA (Análise IA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HISTÓRIA DA DOENÇA ATUAL:
- Epilepsia diagnosticada aos 18 anos
- Múltiplas tentativas de tratamento convencional
- Resposta parcial aos anticonvulsivantes
- Início do tratamento com cannabis medicinal há 6 meses
- Melhora significativa na frequência de convulsões

EVOLUÇÃO RECENTE:
- Redução de 70% na frequência de convulsões
- Melhora na qualidade do sono
- Redução dos sintomas de ansiedade
- Aumento da qualidade de vida

3. RASTREAMENTO ESTRUTURADO (Análise IA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SISTEMA NEUROLÓGICO:
- Exame neurológico sem alterações focais
- Cognição preservada
- Linguagem fluente
- Coordenação motora normal

SISTEMA PSIQUIÁTRICO:
- Humor estável
- Ansiedade controlada
- Sono melhorado
- Apetite normal

SISTEMA CARDIOVASCULAR:
- Pressão arterial normal
- Frequência cardíaca regular
- Sem alterações

4. ANÁLISE INTEGRATIVA (IA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPACTO DA CANNABIS MEDICINAL:
✅ Redução significativa nas convulsões
✅ Melhora na qualidade do sono
✅ Controle da ansiedade
✅ Melhora na qualidade de vida
✅ Sem efeitos adversos significativos

ADERÊNCIA AO TRATAMENTO:
- Excelente aderência ao CBD
- Seguimento rigoroso das orientações
- Comunicação ativa com a equipe médica

5. RECOMENDAÇÕES DA IA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANTER:
- CBD 10mg/dia (manhã)
- Acompanhamento mensal
- Monitoramento via wearables

AJUSTAR:
- Considerar aumento gradual da dosagem se necessário
- Manter registro detalhado dos episódios

MONITORAR:
- Frequência de convulsões
- Qualidade do sono
- Sintomas de ansiedade
- Efeitos adversos

6. PRÓXIMOS PASSOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Retorno em 30 dias
- Continuar monitoramento 24/7 via wearables
- Compartilhar dados com Dr. Eduardo Faveret
- Ajustar tratamento conforme evolução

═══════════════════════════════════════════════════════════════

RELATÓRIO GERADO POR: Nôa Esperança - IA Resident
PROTOCOLO: IMRE Triaxial
METODOLOGIA: Arte da Entrevista Clínica (AEC)
DATA/HORA: ' || NOW()::timestamp || '
NFT MINTADO: Sim
BLOCKCHAIN: Polygon
HASH: 0x1234567890abcdef

STATUS: ✅ COMPARTILHADO COM PROFISSIONAL
NOTIFICAÇÃO: ✅ ENVIADA PARA DR. EDUARDO FAVERET',
    NOW(),
    NOW()
);

-- 2. Criar notificação para o Dr. Eduardo Faveret
INSERT INTO public.notifications (
    id,
    user_id,
    type,
    title,
    message,
    data,
    read,
    created_at
)
VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'report_shared',
    '📋 Novo Relatório Compartilhado',
    'Dr. Ricardo Valença compartilhou uma avaliação clínica inicial com você.',
    '{
        "patientId": "' || (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com') || '",
        "patientName": "Dr. Ricardo Valença",
        "assessmentId": "' || (SELECT id FROM clinical_assessments WHERE patient_id = (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com') ORDER BY created_at DESC LIMIT 1) || '",
        "reportType": "IMRE",
        "sharedAt": "' || NOW()::timestamp || '"
    }'::jsonb,
    false,
    NOW()
);

-- 3. Criar agendamento simulado
INSERT INTO public.appointments (
    id,
    patient_id,
    doctor_id,
    patient_name,
    doctor_name,
    appointment_date,
    appointment_time,
    status,
    type,
    notes,
    created_at
)
VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com'),
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'Dr. Ricardo Valença',
    'Dr. Eduardo Faveret',
    (NOW() + INTERVAL '7 days')::date,
    '14:00:00',
    'scheduled',
    'follow_up',
    'Consulta de retorno após avaliação clínica inicial com IA resident',
    NOW()
);

-- 4. Verificar se tudo foi criado corretamente
SELECT 
    'AVALIAÇÃO CLÍNICA' as tipo,
    patient_name,
    assessment_type,
    status,
    created_at
FROM public.clinical_assessments 
WHERE patient_id = (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com')
ORDER BY created_at DESC LIMIT 1

UNION ALL

SELECT 
    'NOTIFICAÇÃO' as tipo,
    title,
    type,
    CASE WHEN read THEN 'Lida' ELSE 'Não lida' END as status,
    created_at
FROM public.notifications 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com')
ORDER BY created_at DESC LIMIT 1

UNION ALL

SELECT 
    'AGENDAMENTO' as tipo,
    patient_name,
    type,
    status,
    created_at
FROM public.appointments 
WHERE patient_id = (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com')
ORDER BY created_at DESC LIMIT 1;

-- 5. Resumo do fluxo criado
SELECT 
    '🎉 FLUXO COMPLETO CRIADO COM SUCESSO!' as status,
    'Avaliação clínica inicial com IA resident' as etapa1,
    'Relatório gerado e compartilhado' as etapa2,
    'Notificação enviada para Dr. Eduardo' as etapa3,
    'Agendamento criado' as etapa4,
    'Pronto para chat e comentários' as etapa5;
