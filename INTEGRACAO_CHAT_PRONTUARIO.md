# Integração Chat ↔ Prontuário

## 🎯 Objetivo

**O chat deve ser o ambiente central de interação** e os dados gerados aqui devem ser **automaticamente salvos no prontuário do paciente**.

## 📋 Requisitos

1. **Chat como ambiente principal**: Todas as interações acontecem no chat
2. **Registro automático**: Dados são salvos automaticamente no prontuário
3. **Resumo em tempo real**: Chat mostra resumo da entrevista enquanto acontece
4. **História clínica preservada**: Dados ficam no prontuário do paciente

## 🔐 Políticas RLS (Row Level Security)

### Tabelas Envolvidas:

1. **`clinical_reports`** - Relatórios clínicos
   - Política: Pacientes veem seus relatórios (`patient_id = auth.uid()`)
   - Política: Profissionais veem todos relatórios
   - Política: IA pode inserir relatórios

2. **`patient_medical_records`** - Prontuário do paciente
   - Política: Pacientes veem seus registros (`patient_id = auth.uid()`)
   - Política: Profissionais veem registros dos pacientes

3. **`clinical_assessments`** - Avaliações clínicas
   - Política: Pacientes veem suas avaliações (`patient_id = auth.uid()`)
   - Política: Profissionais veem avaliações de seus pacientes

## ✅ Conformidade com RLS

As políticas RLS permitem:
- ✅ IA inserir relatórios (se tiver role `service_role`)
- ✅ Paciente ver seus próprios registros
- ✅ Profissional ver registros dos pacientes
- ✅ Chat salvar dados automaticamente no prontuário

## 🔄 Implementação

### Fluxo Proposto:

```
Chat (Conversa)
    ↓
NoaResidentAI processa mensagem
    ↓
Salva automaticamente no prontuário (patient_medical_records)
    ↓
Atualiza resumo da entrevista (clinical_assessments)
    ↓
Gera relatório final (clinical_reports)
    ↓
Exibe no dashboard do profissional
```

### Modificações Necessárias:

1. **`noaResidentAI.ts`**: Salvar cada etapa automaticamente
2. **`clinicalReportService.ts`**: Criar registro em tempo real
3. **Interface**: Mostrar resumo da entrevista no chat

## ⚠️ Segurança

- ✅ Respeita RLS (paciente só vê seus dados)
- ✅ Profissional acessa dados dos pacientes
- ✅ IA salva dados como `generated_by = 'ai_resident'`
- ✅ Auditoria completa (quem fez o quê)

