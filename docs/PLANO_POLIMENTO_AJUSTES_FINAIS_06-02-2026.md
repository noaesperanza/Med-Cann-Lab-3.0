# 🎯 PLANO DE POLIMENTO E AJUSTES FINAIS - MEDCANLAB 5.0

**Data:** 06/02/2026 (atualizado 09/02/2026)  
**Foco:** Fluxo Clínico Principal + Admin Sempre Funcional  
**Estratégia:** MVP → Produção em Camadas

---

## 📌 Atualização 09/02 — Onde o app já está (antes de analisar o plano)

**Resumo:** Considerando tudo que já existe no app, vários itens do plano já foram alcançados; o documento foi escrito como “meta” e vários checklists ainda estão `[ ]` mas a implementação já está adiante em várias frentes.

| Área | No plano | No app hoje |
|------|----------|-------------|
| **Admin** | Checklist 4.x todo `[ ]` | Login admin (flag_admin), “Visualizar Como”, acesso a rotas; admin carrega 21 pacientes (getAllPatients). |
| **Pacientes com nome** | Implícito no fluxo | ✅ Lista por `getAllPatients` (admin e profissional); nomes reais da tabela `users`; fix RangeError lastVisit. |
| **Prontuário / evoluções** | Fluxo clínico 1.3 | ✅ Carregamento de evoluções (clinical_reports + clinical_assessments + patient_medical_records); fix React #31 (content sempre string); 403 tratado com script RLS + limpeza de políticas duplicadas. |
| **RLS patient_medical_records** | Bypass admin | ✅ Políticas com `is_admin_user()`; script `FIX_PATIENT_MEDICAL_RECORDS_RLS_403` + `LIMPAR_POLITICAS_DUPLICADAS_E_GARANTIR_ADMIN`; diagnóstico `VER_TUDO_RLS_PATIENT_MEDICAL_RECORDS`. |
| **Notificações no Header** | Fase 2.3 “Centro no sidebar” | ✅ Sino de notificações no **Header** (NotificationCenter) ao lado do idioma. |
| **Videochamada** | 08/02 em andamento | Solicitar/aceitar/recusar sem 406; quem aceita + requester na sala; WebRTC real. Pendente: realtime publication, testes prof↔paciente, gravação/consentimento. |

**Conclusão:** Sim — em admin, lista de pacientes, prontuário/evoluções, RLS de prontuário e sino no Header o app já está no patamar (ou à frente) do que o plano descreve. Os checklists abaixo continuam como referência; vale ir marcando `[x]` conforme validar em produção.

> **Checklist único “já feito vs pendente”:** use `docs/CHECKLIST_PLANO_FEITO_VS_PENDENTE.md` para não repetir ações e ver o que falta.

---

## 📌 Atualização 08/02 — Videochamada (em andamento, no caminho)

**Status:** Ainda não 100% concretizada; estamos no caminho.

- ✅ Solicitar / aceitar / recusar **sem erro 406** (UPDATE + SELECT separado).
- ✅ Quem aceita **sempre entra na sala**; **requester é puxado** (realtime ou polling 1,5 s).
- ✅ WebRTC real (áudio/vídeo entre dois dispositivos); fluxo **aceitar → ambos na sala** validado (ex.: admin–admin).
- ⏳ Falta: Realtime na tabela `video_call_requests` (publication); testes profissional–paciente; gravação/consentimento/auditoria em fluxo real.

**Detalhe técnico:** `docs/DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` (Sessão 08/02).

---

## 📋 ÍNDICE

1. [Roadmap Visual (MVP → Produção)](#1-roadmap-visual)
2. [Diagrama de Fluxo com Swimlanes](#2-diagrama-de-fluxo)
3. [Modelo Ideal de RLS](#3-modelo-ideal-de-rls)
4. [Checklist: Admin Não Pode Quebrar](#4-checklist-admin)
5. [Plano por Fases](#5-plano-por-fases)
6. [Fluxo Clínico Principal](#6-fluxo-clínico-principal)

---

## 1. ROADMAP VISUAL (MVP → PRODUÇÃO)

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎯 ROADMAP DE IMPLEMENTAÇÃO                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔴 FASE 1: AGORA (Sem Travar Admin) - 2-3 dias                  │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Banco de Dados Completo                                       │
│  ✅ RLS com Bypass Admin                                         │
│  ✅ Fluxo Clínico Principal 100%                                 │
│  ✅ Admin Sempre Funcional                                       │
│  ✅ Testes Como Admin                                            │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  🟡 FASE 2: DEPOIS (Backend Essencial) - 3-5 dias               │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Edge Functions Deployadas                                    │
│  ✅ Integrações Críticas (WhatsApp/Email)                        │
│  ✅ Sistema de Notificações Completo                             │
│  ✅ Videochamadas 100%                                           │
│  ✅ Prescrições ICP-Brasil                                       │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  🟢 FASE 3: POR ÚLTIMO (Refinamento) - 5-7 dias                 │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Sistema de Ensino                                            │
│  ✅ Sistema de Pesquisa                                          │
│  ✅ UX Refinado                                                  │
│  ✅ Performance                                                  │
│  ✅ Documentação Final                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. DIAGRAMA DE FLUXO COM SWIMLANES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO CLÍNICO PRINCIPAL - SWIMLANES                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────────────────────┐
│    ADMIN     │ PROFISSIONAL │   PACIENTE   │          SISTEMA             │
├──────────────┼──────────────┼──────────────┼──────────────────────────────┤
│              │              │              │                              │
│  👑 Login    │  👨‍⚕️ Login   │  👤 Login    │  🔐 Auth + RLS Check        │
│  (bypass)    │  (normal)    │  (normal)    │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Dashboard   │  Dashboard   │  Dashboard   │  📊 Load Data (RLS)          │
│  (todos)     │  (pacientes)  │  (próprio)   │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Ver Como    │  Seleciona   │  Solicita    │  🔔 Notification             │
│  (qualquer)  │  Paciente    │  Agendamento │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Acessa      │  Cria        │  Recebe      │  📅 Appointment Created      │
│  Qualquer    │  Agendamento │  Confirmação │                              │
│  Dado        │              │              │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Inicia      │  Inicia      │  Solicita    │  📞 Video Call Request       │
│  Video Call  │  Video Call  │  Video Call  │                              │
│  (qualquer)  │  (paciente)  │  (profiss.)  │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Aceita/     │  Aceita/     │  Aceita/     │  🎥 WebRTC Connection        │
│  Rejeita     │  Rejeita     │  Rejeita     │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Chat        │  Chat        │  Chat        │  💬 Real-time Messages      │
│  (qualquer)  │  (paciente)  │  (profiss.)  │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Cria        │  Cria        │  Visualiza   │  📋 Assessment Created       │
│  Avaliação   │  Avaliação   │  Avaliação   │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Cria        │  Cria        │  Visualiza   │  📄 Report Generated         │
│  Relatório   │  Relatório   │  Relatório   │                              │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Assina      │  Assina      │  Visualiza   │  ✍️ Digital Signature        │
│  Prescrição  │  Prescrição  │  Prescrição  │  (ICP-Brasil)                │
│              │              │              │                              │
│      │       │      │       │      │       │                              │
│      ▼       │      ▼       │      ▼       │                              │
│              │              │              │                              │
│  Acessa      │  Acessa      │  Acessa      │  📊 Audit Log                │
│  Qualquer    │  Prontuário  │  Prontuário  │                              │
│  Prontuário  │  (pacientes) │  (próprio)   │                              │
│              │              │              │                              │
└──────────────┴──────────────┴──────────────┴──────────────────────────────┘

🔑 REGRA DE OURO: Admin sempre pode fazer tudo, mesmo que outros não possam.
```

---

## 3. MODELO IDEAL DE RLS

### 3.1 Template de Policy com Bypass Admin

```sql
-- ✅ MODELO CORRETO: Policy com bypass admin
CREATE POLICY "policy_name" ON table_name
FOR SELECT
USING (
    -- Regra normal para usuários comuns
    (auth.uid() = user_id OR auth.uid() = owner_id)
    OR
    -- Bypass para admin (SEMPRE)
    auth.uid() IN (
        SELECT id FROM public.users 
        WHERE type IN ('admin', 'master', 'gestor')
    )
);

-- ❌ MODELO ERRADO: Policy sem bypass admin
CREATE POLICY "policy_name" ON table_name
FOR SELECT
USING (
    auth.uid() = user_id  -- Admin fica travado aqui!
);
```

### 3.2 Tabelas Críticas - RLS Ideal

#### **chat_participants**
```sql
-- Profissional vê apenas seus pacientes
-- Paciente vê apenas seus profissionais
-- Admin vê tudo
USING (
    (auth.uid() = user_id)
    OR
    (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')))
);
```

#### **clinical_assessments**
```sql
-- Profissional vê apenas suas avaliações
-- Paciente vê apenas suas avaliações
-- Admin vê tudo
USING (
    (auth.uid() = doctor_id OR auth.uid() = patient_id)
    OR
    (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')))
);
```

#### **patient_medical_records**
```sql
-- Profissional vê apenas prontuários de seus pacientes
-- Paciente vê apenas seu prontuário
-- Admin vê tudo
USING (
    (auth.uid() = patient_id)
    OR
    (auth.uid() IN (
        SELECT doctor_id FROM public.clinical_assessments 
        WHERE patient_id = patient_medical_records.patient_id
    ))
    OR
    (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')))
);
```

### 3.3 Checklist RLS por Tabela

| Tabela | Bypass Admin? | Isolamento Profissional? | Isolamento Paciente? | Status |
|--------|---------------|--------------------------|----------------------|--------|
| `chat_participants` | ✅ | ✅ | ✅ | ✅ OK |
| `clinical_assessments` | ✅ | ✅ | ✅ | ✅ OK |
| `clinical_reports` | ✅ | ✅ | ✅ | ✅ OK |
| `appointments` | ✅ | ✅ | ✅ | ✅ OK |
| `patient_medical_records` | ✅ | ✅ | ✅ | ✅ OK |
| `notifications` | ✅ | ✅ | ✅ | ✅ OK |
| `video_call_sessions` | ✅ | ✅ | ✅ | ✅ OK |
| `prescriptions` | ⚠️ | ✅ | ✅ | ⚠️ Verificar |
| `users` | ✅ | ✅ | ✅ | ✅ OK |

---

## 4. CHECKLIST: ADMIN NÃO PODE QUEBRAR

### 4.1 Autenticação e Acesso

- [ ] Admin pode fazer login normalmente
- [ ] Admin não precisa de email vinculado a outros perfis
- [ ] Admin pode "visualizar como" qualquer tipo
- [ ] Admin não fica travado em nenhuma rota
- [ ] Admin pode acessar todas as rotas protegidas

### 4.2 RLS (Row Level Security)

- [ ] Todas as policies têm bypass para admin
- [ ] Admin pode SELECT em todas as tabelas
- [ ] Admin pode INSERT em todas as tabelas
- [ ] Admin pode UPDATE em todas as tabelas
- [ ] Admin pode DELETE em todas as tabelas (se necessário)
- [ ] RPC functions não bloqueiam admin

### 4.3 Dashboards

- [ ] Admin Dashboard carrega sem erros
- [ ] Admin pode acessar dashboard de profissional
- [ ] Admin pode acessar dashboard de paciente
- [ ] Admin pode acessar dashboard de aluno
- [ ] "Visualizar Como" funciona para todos os tipos

### 4.4 Chat e Comunicação

- [ ] Admin pode criar chat com qualquer usuário
- [ ] Admin pode ver todas as mensagens
- [ ] Admin pode iniciar videochamada com qualquer usuário
- [ ] Admin pode ver todas as notificações
- [ ] Admin não fica bloqueado por RLS em chat

### 4.5 Dados Clínicos

- [ ] Admin pode ver todos os prontuários
- [ ] Admin pode criar avaliações para qualquer paciente
- [ ] Admin pode criar relatórios para qualquer paciente
- [ ] Admin pode criar prescrições para qualquer paciente
- [ ] Admin pode ver todos os agendamentos

### 4.6 Testes e Debug

- [ ] Admin pode testar fluxo completo como paciente
- [ ] Admin pode testar fluxo completo como profissional
- [ ] Admin pode testar fluxo completo como aluno
- [ ] Admin pode simular erros sem quebrar sistema
- [ ] Admin pode acessar logs e debug

### 4.7 Edge Functions

- [ ] Edge Functions não bloqueiam admin
- [ ] Admin pode chamar todas as Edge Functions
- [ ] Admin pode ver erros de Edge Functions
- [ ] Admin pode testar integrações mockadas

---

## 5. PLANO POR FASES

### 🔴 FASE 1: AGORA (Sem Travar Admin) - 2-3 dias

#### **1.1 Banco de Dados Completo**

**Prioridade:** 🔴 CRÍTICO

- [ ] Executar `CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql`
- [ ] Verificar todas as tabelas criadas
- [ ] Verificar índices criados
- [ ] Verificar RLS aplicado

**Scripts:**
- `database/scripts/CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql`

**Tempo:** 30 minutos

---

#### **1.2 RLS com Bypass Admin**

**Prioridade:** 🔴 CRÍTICO

- [ ] Verificar todas as policies têm bypass admin
- [ ] Criar script para adicionar bypass onde faltar
- [ ] Testar acesso admin em todas as tabelas
- [ ] Documentar políticas de acesso

**Tabelas a verificar:**
- `chat_participants`
- `clinical_assessments`
- `clinical_reports`
- `appointments`
- `patient_medical_records`
- `notifications`
- `video_call_sessions`
- `prescriptions`
- `users`

**Tempo:** 2-3 horas

---

#### **1.3 Fluxo Clínico Principal 100%**

**Prioridade:** 🔴 CRÍTICO

**Fluxo:** Paciente → Agenda → Chat → Videochamada → Avaliação → Prescrição → Registro

- [ ] **Paciente solicita agendamento**
  - [ ] Formulário funcional
  - [ ] Notificação para profissional
  - [ ] Confirmação para paciente

- [ ] **Profissional cria agendamento**
  - [ ] Formulário funcional
  - [ ] Notificação para paciente
  - [ ] Confirmação para profissional

- [ ] **Chat Profissional-Paciente**
  - [ ] Criação automática de sala
  - [ ] Mensagens em tempo real
  - [ ] Histórico persistente
  - [ ] Isolamento por profissional

- [ ] **Videochamada** _(em andamento 08/02)_
  - [x] Solicitar (admin–admin; profissional–paciente no código)
  - [x] Aceitar/Rejeitar (sem 406)
  - [x] Quem aceita entra na sala; requester puxado (realtime + polling)
  - [x] WebRTC real (áudio/vídeo)
  - [ ] Timeout e notificações em todos os cenários
  - [ ] Realtime publication; testes sistemáticos profissional–paciente
  - [ ] Gravação de trechos, consentimento, auditoria

- [ ] **Avaliação Clínica**
  - [ ] Criar avaliação
  - [ ] Salvar no banco
  - [ ] Visualizar avaliação
  - [ ] Isolamento por profissional

- [ ] **Relatório Clínico**
  - [ ] Gerar relatório
  - [ ] Salvar no banco
  - [ ] Visualizar relatório
  - [ ] Isolamento por profissional

- [ ] **Prescrição**
  - [ ] Criar prescrição
  - [ ] Assinatura digital
  - [ ] Salvar no banco
  - [ ] Visualizar prescrição

- [ ] **Prontuário**
  - [ ] Visualizar prontuário
  - [ ] Histórico completo
  - [ ] Isolamento por profissional

**Tempo:** 1-2 dias

---

#### **1.4 Admin Sempre Funcional**

**Prioridade:** 🔴 CRÍTICO

- [ ] Testar login como admin
- [ ] Testar "Visualizar Como" todos os tipos
- [ ] Testar acesso a todas as rotas
- [ ] Testar acesso a todos os dados
- [ ] Verificar RLS não bloqueia admin
- [ ] Verificar Edge Functions não bloqueiam admin

**Tempo:** 2-3 horas

---

#### **1.5 Testes Como Admin**

**Prioridade:** 🔴 CRÍTICO

- [ ] Testar fluxo completo como admin
- [ ] Testar fluxo como paciente (via "Visualizar Como")
- [ ] Testar fluxo como profissional (via "Visualizar Como")
- [ ] Testar fluxo como aluno (via "Visualizar Como")
- [ ] Documentar bugs encontrados

**Tempo:** 1 dia

---

### 🟡 FASE 2: DEPOIS (Backend Essencial) - 3-5 dias

#### **2.1 Edge Functions Deployadas**

**Prioridade:** 🟡 ALTO

- [ ] Deploy `video-call-request-notification`
- [ ] Deploy `video-call-reminders`
- [ ] Deploy `tradevision-core`
- [ ] Verificar CORS funcionando
- [ ] Testar todas as funções

**Tempo:** 1 dia

---

#### **2.2 Integrações Críticas**

**Prioridade:** 🟡 ALTO

- [ ] **WhatsApp Integration**
  - [ ] Escolher provider (Twilio, Evolution API, etc.)
  - [ ] Implementar integração real
  - [ ] Testar envio de mensagens
  - [ ] Substituir mocks

- [ ] **Email Service**
  - [ ] Escolher provider (SendGrid, AWS SES, etc.)
  - [ ] Implementar integração real
  - [ ] Testar envio de emails
  - [ ] Substituir mocks

**Tempo:** 2-3 dias

---

#### **2.3 Sistema de Notificações Completo**

**Prioridade:** 🟡 ALTO

- [ ] Notificações em tempo real funcionando
- [ ] Notificações de videochamada funcionando
- [ ] Notificações de agendamento funcionando
- [ ] Notificações de chat funcionando
- [ ] Centro de notificações no sidebar
- [ ] Marcar como lida funcionando

**Tempo:** 1 dia

---

#### **2.4 Videochamadas 100%** _(em andamento — atualizado 08/02)_

**Prioridade:** 🟡 ALTO

- [x] Aceitar/recusar sem 406 (UPDATE + SELECT separado)
- [x] Quem aceita e requester entram na sala (polling 1,5 s como fallback)
- [x] WebRTC real (áudio/vídeo)
- [ ] CORS resolvido completamente (notificação já via RPC/insert)
- [ ] Realtime publication para `video_call_requests`; testes profissional–paciente
- [ ] Timeout e notificações em todos os cenários
- [ ] Gravação de trechos funcionando
- [ ] Auditoria funcionando

**Tempo:** 1 dia (restante)

---

#### **2.5 Prescrições ICP-Brasil**

**Prioridade:** 🟡 ALTO

- [ ] Assinatura digital funcionando
- [ ] Certificado ICP-Brasil funcionando
- [ ] Níveis de documento funcionando
- [ ] Geração de PDF funcionando
- [ ] Histórico de prescrições funcionando

**Tempo:** 1 dia

---

### 🟢 FASE 3: POR ÚLTIMO (Refinamento) - 5-7 dias

#### **3.1 Sistema de Ensino**

**Prioridade:** 🟢 MÉDIO

- [ ] Cursos funcionando
- [ ] Aulas funcionando
- [ ] Progresso funcionando
- [ ] Gamificação funcionando
- [ ] Certificados funcionando

**Tempo:** 2-3 dias

---

#### **3.2 Sistema de Pesquisa**

**Prioridade:** 🟢 MÉDIO

- [ ] Fórum de casos funcionando
- [ ] Debate Room funcionando
- [ ] Pesquisas funcionando
- [ ] Análises funcionando

**Tempo:** 1-2 dias

---

#### **3.3 UX Refinado**

**Prioridade:** 🟢 MÉDIO

- [ ] Substituir `alert()` por componentes customizados
- [ ] Substituir `confirm()` por modais customizados
- [ ] Melhorar feedback visual
- [ ] Melhorar loading states
- [ ] Melhorar error states

**Tempo:** 2 dias

---

#### **3.4 Performance**

**Prioridade:** 🟢 MÉDIO

- [ ] Otimizar queries do banco
- [ ] Adicionar cache onde necessário
- [ ] Lazy loading de componentes
- [ ] Otimizar imagens
- [ ] Otimizar bundle size

**Tempo:** 1-2 dias

---

#### **3.5 Documentação Final**

**Prioridade:** 🟢 MÉDIO

- [ ] Documentar todas as rotas
- [ ] Documentar todas as funcionalidades
- [ ] Documentar RLS policies
- [ ] Documentar Edge Functions
- [ ] Documentar integrações

**Tempo:** 1 dia

---

## 6. DASHBOARDS ÚNICOS (RICARDO E EDUARDO)

### 6.1 Configuração Atual

#### **Dr. Ricardo Valença** ✅
- **Email Admin:** `rrvalenca@gmail.com`
- **Email Profissional:** `iaianoaesperanza@gmail.com`
- **Dashboard:** `/app/ricardo-valenca-dashboard`
- **Status:** ✅ Vinculado e funcional

#### **Dr. Eduardo Faveret** ⚠️
- **Email Admin:** `eduardoscfaveret@gmail.com`
- **Email Profissional:** ⚠️ Ainda não vinculado
- **Dashboard:** `/app/clinica/profissional/dashboard-eduardo`
- **Status:** ⚠️ Precisa vincular como profissional

### 6.2 Checklist de Vinculação

- [ ] Executar `VINCULAR_EDUARDO_COMO_PROFISSIONAL_06-02-2026.sql`
- [ ] Verificar redirecionamento automático
- [ ] Vincular pacientes via `eduardoscfaveret@gmail.com`
- [ ] Testar dashboard-eduardo
- [ ] Verificar isolamento RLS

**Ver detalhes:** `docs/FLUXO_DASHBOARDS_UNICOS_06-02-2026.md`

---

## 7. FLUXO CLÍNICO PRINCIPAL

### 6.1 Checklist Completo do Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│           FLUXO CLÍNICO PRINCIPAL - CHECKLIST                │
└─────────────────────────────────────────────────────────────┘

1. PACIENTE SOLICITA AGENDAMENTO
   [ ] Formulário de agendamento funcional
   [ ] Validação de dados
   [ ] Notificação enviada para profissional
   [ ] Confirmação exibida para paciente
   [ ] Agendamento salvo no banco

2. PROFISSIONAL CRIA AGENDAMENTO
   [ ] Formulário de agendamento funcional
   [ ] Seleção de paciente funcional
   [ ] Validação de dados
   [ ] Notificação enviada para paciente
   [ ] Confirmação exibida para profissional
   [ ] Agendamento salvo no banco

3. CHAT PROFISSIONAL-PACIENTE
   [ ] Criação automática de sala
   [ ] Mensagens em tempo real
   [ ] Histórico persistente
   [ ] Isolamento por profissional (RLS)
   [ ] Notificações de novas mensagens

4. VIDEOCHAMADA
   [ ] Solicitar (paciente → profissional)
   [ ] Solicitar (profissional → paciente)
   [ ] Notificação em tempo real
   [ ] Aceitar/Rejeitar funcionando
   [ ] Timeout funcionando (30min paciente, 30s profissional)
   [ ] WebRTC funcionando
   [ ] Gravação de trechos (opcional)

5. AVALIAÇÃO CLÍNICA
   [ ] Formulário de avaliação funcional
   [ ] Protocolo IMRE funcionando
   [ ] Salvar no banco
   [ ] Visualizar avaliação
   [ ] Isolamento por profissional (RLS)

6. RELATÓRIO CLÍNICO
   [ ] Geração automática funcionando
   [ ] Salvar no banco
   [ ] Visualizar relatório
   [ ] Isolamento por profissional (RLS)

7. PRESCRIÇÃO
   [ ] Formulário de prescrição funcional
   [ ] Assinatura digital ICP-Brasil
   [ ] Salvar no banco
   [ ] Visualizar prescrição
   [ ] Geração de PDF

8. PRONTUÁRIO
   [ ] Visualizar prontuário completo
   [ ] Histórico de avaliações
   [ ] Histórico de relatórios
   [ ] Histórico de prescrições
   [ ] Histórico de agendamentos
   [ ] Isolamento por profissional (RLS)
```

---

## 8. SCRIPTS SQL NECESSÁRIOS

### 7.1 Scripts de Criação

1. `CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql` ⚠️ **EXECUTAR AGORA**

### 7.2 Scripts de Correção RLS

2. `ADICIONAR_BYPASS_ADMIN_RLS.sql` ⚠️ **CRIAR E EXECUTAR**

### 8.3 Scripts de Verificação

3. `VERIFICAR_RLS_ADMIN_06-02-2026.sql` ✅ **CRIADO**

### 8.4 Scripts de Vinculação

4. `VINCULAR_EDUARDO_COMO_PROFISSIONAL_06-02-2026.sql` ⚠️ **EXECUTAR**

---

## 9. CONCLUSÃO

### ✅ **PRIORIDADES ABSOLUTAS**

1. **Fluxo Clínico Principal 100%**
   - Paciente → Agenda → Chat → Videochamada → Avaliação → Prescrição → Registro
   - **Tempo:** 1-2 dias

2. **Admin Sempre Funcional**
   - RLS com bypass admin
   - "Visualizar Como" funcionando
   - Acesso total garantido
   - **Tempo:** 2-3 horas

3. **Banco de Dados Completo**
   - Criar tabelas faltando
   - Verificar RLS
   - **Tempo:** 30 minutos

### 🎯 **ESTRATÉGIA**

- **Fase 1 (Agora):** Garantir fluxo clínico + admin funcional
- **Fase 2 (Depois):** Backend essencial + integrações
- **Fase 3 (Por último):** Refinamento + ensino/pesquisa

### 🔑 **REGRA DE OURO**

**Admin nunca deve ficar travado. Se admin ficar travado, é bug de RLS ou rota, não regra de negócio.**

---

**Documento criado por:** Sistema de Planejamento  
**Data:** 06/02/2026 (atualizado 09/02/2026)  
**Status:** ✅ Plano Completo e Executável. Vários itens já implementados (ver "Atualização 09/02" no topo). Videochamada em andamento (secção 08/02).
