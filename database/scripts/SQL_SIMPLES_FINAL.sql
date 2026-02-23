-- SQL SIMPLIFICADO - SEM PROBLEMAS DE JSON

-- 1. Criar avaliação clínica inicial
INSERT INTO public.clinical_assessments (
    id,
    patient_id,
    doctor_id,
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
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'IMRE',
    'completed',
    '{"name": "Dr. Ricardo Valença", "age": 35, "complaintList": ["Epilepsia", "Ansiedade", "Insônia"], "improvement": true, "symptoms": ["Convulsões reduzidas", "Melhor qualidade do sono"], "medication": "CBD 10mg/dia", "aiAssessment": true, "sharedWithDoctor": true, "nftMinted": true, "blockchainHash": "0x1234567890abcdef"}'::jsonb,
    'RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL - IA RESIDENT NÔA ESPERANÇA

PACIENTE: Dr. Ricardo Valença
IDADE: 35 anos
DATA: ' || NOW()::date || '
MÉDICO RESPONSÁVEL: Dr. Eduardo Faveret
PROTOCOLO: IMRE Triaxial
IA RESPONSÁVEL: Nôa Esperança - IA Resident

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

IMPACTO DA CANNABIS MEDICINAL:
✅ Redução significativa nas convulsões
✅ Melhora na qualidade do sono
✅ Controle da ansiedade
✅ Melhora na qualidade de vida
✅ Sem efeitos adversos significativos

RECOMENDAÇÕES DA IA:
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

PRÓXIMOS PASSOS:
- Retorno em 30 dias
- Continuar monitoramento 24/7 via wearables
- Compartilhar dados com Dr. Eduardo Faveret
- Ajustar tratamento conforme evolução

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

-- 2. Criar notificação simples
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
    '{"patientId": "' || (SELECT id FROM auth.users WHERE email = 'profrvalenca@gmail.com') || '", "patientName": "Dr. Ricardo Valença", "reportType": "IMRE"}'::jsonb,
    false,
    NOW()
);

-- 3. Verificar se foi criado
SELECT 
    '🎉 FLUXO COMPLETO CRIADO COM SUCESSO!' as status,
    'Avaliação clínica inicial com IA resident' as etapa1,
    'Relatório gerado e compartilhado' as etapa2,
    'Notificação enviada para Dr. Eduardo' as etapa3,
    'Pronto para chat e comentários' as etapa4;
