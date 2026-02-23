# 🔧 CORREÇÃO - PACIENTE NÃO APARECE NO CHAT

## 📋 Problema Identificado:
O paciente `profrvalenca@gmail.com` não aparece na lista de pacientes porque não tem avaliações clínicas cadastradas no sistema.

## 🎯 Solução:
Execute este SQL no Supabase para criar dados de teste:

```sql
-- Criar avaliações clínicas de teste para o paciente profrvalenca@gmail.com
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
);
```

## 🎯 Passos:

1. **Acesse Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole o SQL acima**
4. **Execute**
5. **Recarregue a página** do Dr. Eduardo Faveret
6. **Acesse "Chat com Pacientes"**
7. **Verifique se "Dr. Ricardo Valença" aparece na lista**

## ✅ Resultado Esperado:
- Paciente "Dr. Ricardo Valença" aparece na lista de pacientes
- Pode ser selecionado para chat
- Dados do prontuário são exibidos
- Sistema de chat integrado funciona

## 🎉 Pronto!
Agora o paciente teste aparecerá na lista e poderá ser usado para testar o chat e prontuário integrado!
