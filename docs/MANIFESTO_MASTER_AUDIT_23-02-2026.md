# 🦅 MANIFESTO MASTER SUPREMO — MEDCANNLAB 2026
## Versão: 6.0 (Audit Edition — Estado Real do Sistema)
## Data: 23 de Fevereiro de 2026
## Status: Documento de Auditoria Completa com Gap Analysis
## Escopo: Frontend, Backend, Banco de Dados, Segurança, Fluxos, Monetização, IA

---

# 📋 ÍNDICE

1. [Resumo Executivo](#1-resumo-executivo)
2. [Inventário Técnico Completo](#2-inventário-técnico-completo)
3. [Estado do Banco de Dados (Supabase)](#3-estado-do-banco-de-dados)
4. [Segurança — Auditoria Detalhada](#4-segurança)
5. [Fluxos Clínicos — Análise de Integridade](#5-fluxos-clínicos)
6. [IA Nôa Esperança — Estado Atual](#6-ia-nôa-esperança)
7. [Monetização & Gestão Financeira](#7-monetização)
8. [Módulos por Role (Paciente/Profissional/Admin/Aluno)](#8-módulos-por-role)
9. [Edge Functions — Inventário e Estado](#9-edge-functions)
10. [Gap Analysis: O Que Falta para 100%](#10-gap-analysis)
11. [Roadmap de Fechamento](#11-roadmap)
12. [Conclusão](#12-conclusão)

---

# 1. RESUMO EXECUTIVO

O MedCannLab 3.0 é uma plataforma de saúde integrativa focada em Cannabis Medicinal, com IA clínica residente (Nôa Esperança), sistema educacional, gestão de pacientes, prescrições digitais com assinatura ITI/ICP-Brasil, e gamificação.

### Números do Ecossistema (Dados Reais - 23/02/2026)

| Métrica | Valor |
|---------|-------|
| Usuários cadastrados (auth.users) | **23** |
| Pacientes (user_roles) | **10** |
| Profissionais | **8** |
| Admins | **4** |
| Tabelas no schema public | **120+** |
| Views | **30** |
| RPCs/Functions | **100+** |
| Triggers | **60+** |
| Edge Functions | **5** |
| Páginas React | **75** |
| Componentes React | **80+** |
| Serviços/Libs | **30+** |
| Contextos React | **9** |
| Relatórios Clínicos | **55** |
| Prescrições (cfm_prescriptions) | **24** |
| Agendamentos | **44** |
| Documentos na Base de Conhecimento | **433** |
| Salas de Chat | **75** |
| Mensagens de Chat (ativas) | **2** |
| Avaliações IMRE | **0** |
| Posts no Fórum | **0** |
| Cursos | **6** |
| Notificações | **57** |
| Storage Buckets | **3** (avatar, chat-audio, documents) |

---

# 2. INVENTÁRIO TÉCNICO COMPLETO

## 2.1 Tech Stack

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | React + TypeScript | 18.2 + 5.2 |
| Build Tool | Vite | 7.1 |
| Estilização | Tailwind CSS | 3.x |
| Animações | Framer Motion | 12.x |
| Roteamento | React Router DOM | 6.30 |
| Estado Global | Zustand | 5.x |
| i18n | i18next | 25.x |
| Ícones | Lucide React | 0.300 |
| Backend | Supabase (externo) | - |
| IA | OpenAI SDK | 6.x |
| PDF | pdfjs-dist | 5.x |
| Planilhas | xlsx | 0.18 |
| Email | Resend SDK | 6.x |
| Pagamento | Stripe SDK | 20.x |
| Certificados | web-pki | 2.x |

## 2.2 Páginas (75 rotas)

### Eixo Clínica — Profissional
| Rota | Componente | Status |
|------|-----------|--------|
| `/app/clinica/profissional/dashboard` | ProfessionalDashboardRouter | ✅ Funcional |
| `/app/clinica/profissional/pacientes` | PatientsManagement | ✅ Funcional |
| `/app/clinica/profissional/relatorios` | Reports | ✅ Funcional |
| `/app/clinica/profissional/chat-profissionais` | ProfessionalChat | ✅ Funcional |
| `/app/clinica/profissional/certificados` | CertificateManagement | ✅ Funcional |
| `/app/clinica/prescricoes` | Prescriptions | ✅ Funcional |

### Eixo Clínica — Paciente
| Rota | Componente | Status |
|------|-----------|--------|
| `/app/clinica/paciente/dashboard` | PatientDashboard | ✅ Funcional |
| `/app/clinica/paciente/avaliacao-clinica` | ClinicalAssessment | ⚠️ IMRE vazio |
| `/app/clinica/paciente/relatorios` | Reports | ✅ Funcional |
| `/app/clinica/paciente/agendamentos` | PatientAppointments | ✅ Funcional |
| `/app/clinica/paciente/chat-profissional` | PatientDoctorChat | ✅ Funcional |
| `/app/clinica/paciente/chat-noa` | PatientNOAChat | ✅ Funcional |

### Eixo Ensino
| Rota | Componente | Status |
|------|-----------|--------|
| `/app/ensino/profissional/dashboard` | EnsinoDashboard | ✅ Funcional |
| `/app/ensino/profissional/preparacao-aulas` | LessonPreparation | ✅ Funcional |
| `/app/ensino/profissional/arte-entrevista-clinica` | ArteEntrevistaClinica | ✅ Funcional |
| `/app/ensino/aluno/dashboard` | AlunoDashboard | ✅ Funcional |
| `/app/ensino/aluno/cursos` | Courses | ✅ Funcional (6 cursos) |
| `/app/ensino/aluno/biblioteca` | Library | ✅ Funcional (433 docs) |
| `/app/ensino/aluno/gamificacao` | Gamificacao | ✅ Funcional |

### Eixo Pesquisa
| Rota | Componente | Status |
|------|-----------|--------|
| `/app/pesquisa/profissional/dashboard` | PesquisaDashboard | ✅ Funcional |
| `/app/pesquisa/profissional/forum-casos` | ForumCasosClinicos | ⚠️ 0 posts |
| `/app/pesquisa/profissional/cidade-amiga-dos-rins` | CidadeAmigaDosRins | ✅ Funcional |

### Gestão Financeira
| Rota | Componente | Status |
|------|-----------|--------|
| `/app/patient-financial` | PatientFinancialDashboard | ✅ Funcional |
| `/app/professional-financial` | ProfessionalFinancial | ✅ Funcional |
| `/app/subscription-plans` | SubscriptionPlans | ✅ Funcional |
| `/app/checkout` | PaymentCheckout | ⚠️ Stripe não conectado |

### Admin
| Rota | Componente | Status |
|------|-----------|--------|
| `/app/admin` | AdminDashboardWrapper | ✅ Funcional |
| `/app/admin-settings` | AdminSettings | ✅ Funcional |
| `/app/admin/clinical-governance` | ClinicalGovernanceAdmin | ✅ Funcional |
| `/app/assessment-analytics` | AssessmentAnalytics | ✅ Funcional |

## 2.3 Contextos React (9)

| Contexto | Responsabilidade | Status |
|----------|-----------------|--------|
| AuthContext | Autenticação + RBAC via `get_my_primary_role()` | ✅ Seguro |
| NoaContext | Estado da IA Nôa | ✅ Funcional |
| NoaPlatformContext | Integração Nôa com plataforma | ✅ Funcional |
| RealtimeContext | WebSocket Supabase Realtime | ✅ Funcional |
| ToastContext | Notificações UI | ✅ Funcional |
| ConfirmContext | Modais de confirmação | ✅ Funcional |
| UserViewContext | Controle de visão de usuário | ✅ Funcional |
| ClinicalGovernanceContext | Governança clínica | ✅ Funcional |
| DashboardTriggersContext | Triggers do dashboard | ✅ Funcional |

## 2.4 Componentes Críticos (80+)

| Componente | Função | Status |
|-----------|--------|--------|
| ClinicalReports | Visualização de relatórios (profissional) | ✅ Corrigido (crash resolvido) |
| ClinicalTerminal | Terminal clínico integrado | ✅ Funcional |
| IntegratedWorkstation | Workstation médica | ✅ Funcional |
| MedicalRecord | Prontuário eletrônico | ✅ Funcional |
| QuickPrescriptions | Prescrição rápida CFM | ✅ Funcional |
| ShareReportModal | Compartilhamento de relatórios | ✅ Funcional |
| NoaConversationalInterface | Chat IA Nôa | ✅ Funcional |
| VideoCall | Teleconsulta | ⚠️ TURN/STUN não configurado |
| PaymentGuard | Paywall de acesso | ✅ Funcional |
| Sidebar | Navegação unificada | ✅ Funcional |
| PatientAnalytics | Analytics do paciente | ✅ Funcional |
| DigitalSignatureWidget | Assinatura digital ICP-Brasil | ⚠️ PKI parcial |

---

# 3. ESTADO DO BANCO DE DADOS

## 3.1 Tabelas (120+ no schema public)

### Tabelas Core (Dados Reais)
| Tabela | Registros | RLS | Status |
|--------|-----------|-----|--------|
| users | 35 | ✅ | Ativa |
| user_roles | 22 | ✅ | Ativa (RBAC) |
| user_profiles | - | ✅ | Ativa |
| appointments | 44 | ✅ | 27 scheduled, 17 cancelled |
| clinical_reports | 55 | ✅ | Ativa |
| cfm_prescriptions | 24 | ✅ | 22 draft, 1 signed, 1 sent |
| chat_rooms | 75 | ✅ | Ativa |
| chat_messages | 2 | ✅ | ⚠️ Quase vazio |
| chat_participants | - | ✅ | Ativa |
| notifications | 57 | ✅ | Ativa |
| documents | 433 | ✅ | Base de conhecimento |
| clinical_assessments | - | ✅ | Ativa |
| imre_assessments | 0 | ✅ | ❌ VAZIO |
| forum_posts | 0 | ✅ | ❌ VAZIO |
| courses | 6 | ✅ | Ativa |
| transactions | - | ✅ | Ativa |
| subscription_plans | - | ✅ | Ativa |

### Tabelas Auxiliares/Legadas
| Tabela | Observação |
|--------|-----------|
| pacientes | Sistema legado (paralelo a `users`) |
| usuarios | Sistema legado |
| prescriptions | ⚠️ Legada — usar `cfm_prescriptions` |
| chat_messages_legacy | Migrada |
| private_chats / private_messages | Legadas |

## 3.2 Views (30 — TODAS SECURITY DEFINER ⚠️)

| View | Risco | Ação Necessária |
|------|-------|-----------------|
| active_subscriptions | 🔴 DEFINER | Migrar para INVOKER |
| users_compatible | 🔴 DEFINER (expõe dados) | Migrar para INVOKER |
| v_auth_activity | 🔴 DEFINER (acessa auth.users) | Migrar para INVOKER |
| v_chat_inbox | 🔴 DEFINER | Migrar para INVOKER |
| v_clinical_reports | 🔴 DEFINER | Migrar para INVOKER |
| v_user_points_balance | 🔴 DEFINER | Migrar para INVOKER |
| view_current_ranking_live | 🔴 DEFINER | Migrar para INVOKER |
| *... 23 outras views* | 🔴 DEFINER | Migrar para INVOKER |

**⚠️ ALERTA CRÍTICO: Todas as 30 views usam SECURITY DEFINER, o que significa que elas executam com os privilégios do criador (postgres), bypassando RLS. Devem ser migradas para SECURITY INVOKER.**

## 3.3 RPCs/Functions (100+)

### Functions Críticas
| Function | Papel | Status |
|----------|-------|--------|
| `get_my_primary_role()` | RBAC — fonte de verdade | ✅ Ativa |
| `has_role(uuid, app_role)` | Verificação segura de role | ✅ Ativa |
| `share_report_with_doctors()` | Compartilhar relatórios | ✅ Ativa |
| `get_shared_reports_for_doctor()` | Buscar relatórios compartilhados | ✅ Ativa |
| `book_appointment_atomic()` | Agendamento atômico | ✅ Ativa |
| `create_chat_room_for_patient()` | Criar sala de chat | ✅ Ativa |
| `checkout_with_points()` | Checkout com desconto XP | ✅ Ativa |
| `calculate_monthly_ranking()` | Ranking mensal | ✅ Ativa |
| `increment_user_points()` | Gamificação | ✅ Ativa |
| `get_patient_medical_history()` | Prontuário resumido (JSONB) | ✅ Ativa |
| `get_unread_notifications_count()` | Contagem sino | ✅ Ativa |

### Functions Legadas/Duplicadas
| Function | Problema |
|----------|---------|
| `get_ac_dss_stats()` | 2 versões (sobrecarga) |
| `is_authorized_professional()` | Hardcoded emails |
| `get_authorized_professionals()` | Hardcoded emails |
| `handle_new_patient_triage()` | Hardcoded emails de fallback |
| `create_dev_vivo_session()` | Dev tool — remover em produção |

## 3.4 Triggers (60+)

### Triggers Ativos no Core
| Trigger | Tabela | Função |
|---------|--------|--------|
| trg_auth_users_to_user_profiles | auth.users | Cria perfil ao registrar |
| tg_sync_user_roles_from_profile | user_profiles | Sincroniza roles |
| trigger_generate_iti_code | cfm_prescriptions | Gera código ITI |
| trigger_set_prescription_expiry | cfm_prescriptions | Define validade (30 dias) |
| trigger_assessment_score | clinical_reports | Registra score IA |
| tr_process_appointment_referral_bonus | appointments | Bônus referral |
| on_patient_created_triage | users | Triagem automática |

## 3.5 Storage (3 buckets)

| Bucket | Conteúdo | Status |
|--------|----------|--------|
| avatar | Fotos de perfil | ✅ |
| chat-audio | Áudios de chat | ✅ |
| documents | Base de conhecimento (433 docs) | ✅ |

---

# 4. SEGURANÇA — AUDITORIA DETALHADA

## 4.1 RLS (Row Level Security)

✅ **TODAS as tabelas do schema public têm RLS habilitado.** (0 tabelas sem RLS)

### Políticas por Tabela Crítica

| Tabela | Políticas | Avaliação |
|--------|-----------|-----------|
| users | INSERT/UPDATE/SELECT | ✅ Adequado |
| clinical_reports | SELECT/INSERT/UPDATE por role | ✅ Adequado |
| cfm_prescriptions | CRUD por profissional + SELECT paciente | ✅ Adequado |
| appointments | CRUD segmentado por role | ✅ Adequado |
| chat_messages | INSERT/SELECT/UPDATE/DELETE por membro da sala | ✅ Adequado |
| notifications | SELECT por user_id | ✅ Adequado |
| documents | SELECT para autenticados | ⚠️ Considerar restringir |

## 4.2 Vulnerabilidades Identificadas

### 🔴 P0 — Críticas

| # | Vulnerabilidade | Impacto | Status |
|---|----------------|---------|--------|
| 1 | **30 views SECURITY DEFINER** | Bypass de RLS — qualquer autenticado pode ver dados de outros | 🔴 ABERTO |
| 2 | **Hardcoded emails em RPCs** (`is_authorized_professional`, `get_authorized_professionals`, `handle_new_patient_triage`) | Acoplamento rígido; falha se emails mudarem | 🟡 PARCIAL |

### 🟡 P1 — Importantes

| # | Vulnerabilidade | Impacto |
|---|----------------|---------|
| 3 | Tabelas legadas (`pacientes`, `usuarios`, `prescriptions`) coexistindo com tabelas novas | Confusão de dados, queries inconsistentes |
| 4 | `cfm_prescriptions` tem policy `allow_all_authenticated` (ALL) | Qualquer autenticado pode fazer CRUD completo |
| 5 | `v_auth_activity` acessa `auth.users` diretamente como DEFINER | Expõe metadados de autenticação |

### 🟢 P2 — Melhorias

| # | Item |
|---|------|
| 6 | Remover `dev_vivo_*` tabelas/functions em produção |
| 7 | `chat_messages_legacy` pode ser dropada |
| 8 | Consolidar `private_chats`/`private_messages` com `chat_rooms`/`chat_messages` |

## 4.3 RBAC

| Componente | Implementação | Status |
|-----------|--------------|--------|
| Tabela `user_roles` | ✅ Existe com enum `app_role` | ✅ Correto |
| Function `has_role()` | ✅ SECURITY DEFINER segura | ✅ Correto |
| Function `get_my_primary_role()` | ✅ Fonte de verdade | ✅ Correto |
| Frontend AuthContext | ✅ Usa `get_my_primary_role()` | ✅ Correto |
| ProtectedRoute | ✅ Verifica role | ✅ Correto |

---

# 5. FLUXOS CLÍNICOS — ANÁLISE DE INTEGRIDADE

## 5.1 Fluxo: Paciente → Relatório → Médico

```
[Paciente faz avaliação] 
    → [Nôa gera relatório IMRE] 
    → [Salva em clinical_reports] 
    → [Paciente clica "Compartilhar"]
    → [ShareReportModal → RPC share_report_with_doctors()]
    → [Atualiza shared_with[] + cria notificação]
    → [Médico vê na aba ClinicalReports]
    → [Notificação no sino ✅]
```

| Etapa | Status | Observação |
|-------|--------|-----------|
| Geração de relatório | ✅ | Via `clinicalReportService` |
| Salvamento no banco | ✅ | Tabela `clinical_reports` |
| Compartilhamento | ✅ | RPC funcional, `shared_with[]` atualizado |
| Notificação para médico | ✅ | Tabela `notifications`, user_id correto |
| Visualização pelo médico | ✅ | **Crash corrigido em 23/02/2026** |
| Sino de notificação | ✅ | `get_unread_notifications_count()` |

## 5.2 Fluxo: Prescrição Digital

```
[Médico seleciona paciente]
    → [QuickPrescriptions → cfm_prescriptions]
    → [Status: draft → signed → sent]
    → [Trigger: gera ITI code + validade 30 dias]
    → [Paciente visualiza prescrição]
```

| Etapa | Status | Observação |
|-------|--------|-----------|
| Criação de prescrição | ✅ | 22 drafts existentes |
| Assinatura digital | ⚠️ | Apenas 1 signed — PKI parcialmente configurado |
| Código ITI | ✅ | Trigger automático ao assinar |
| Envio ao paciente | ⚠️ | 1 sent — Resend/email não verificado em produção |
| Visualização pelo paciente | ✅ | Via `v_patient_prescriptions` |

## 5.3 Fluxo: Agendamento

```
[Paciente/Médico agenda]
    → [book_appointment_atomic() / INSERT appointments]
    → [Trigger: referral bonus + scheduling risk]
    → [Status: scheduled → confirmed → completed]
```

| Etapa | Status | Observação |
|-------|--------|-----------|
| Criação | ✅ | 44 agendamentos |
| Confirmação | ⚠️ | 0 confirmed/completed (todos scheduled ou cancelled) |
| Teleconsulta (VideoCall) | ⚠️ | TURN/STUN não configurado |
| Referral bonus | ✅ | Trigger ativo |

## 5.4 Fluxo: Chat Clínico

| Etapa | Status | Observação |
|-------|--------|-----------|
| Criação de sala | ✅ | 75 salas criadas |
| Envio de mensagens | ⚠️ | Apenas 2 mensagens — baixa utilização |
| Realtime | ✅ | WebSocket configurado |
| Limpeza 24h | ✅ | Trigger `cleanup_old_chat_messages` |

## 5.5 Fluxo: Avaliação IMRE (Nôa)

| Etapa | Status | Observação |
|-------|--------|-----------|
| Tabela `imre_assessments` | ❌ | **0 registros** |
| Interface de avaliação | ✅ | `ClinicalAssessment.tsx` existe |
| Protocolo IMRE no chat | ✅ | Nôa segue IMRE |
| Salvamento estruturado | ⚠️ | Relatórios salvos em `clinical_reports`, não em `imre_assessments` |

---

# 6. IA NÔA ESPERANÇA — ESTADO ATUAL

## 6.1 Arquitetura

| Componente | Arquivo | Status |
|-----------|---------|--------|
| Core Engine | `noaEsperancaCore.ts` | ✅ Funcional |
| Resident AI | `noaResidentAI.ts` | ✅ Funcional |
| Knowledge Base | `noaKnowledgeBase.ts` (2 versões) | ⚠️ Duplicado |
| Command System | `noaCommandSystem.ts` | ✅ Funcional |
| Training System | `noaTrainingSystem.ts` | ✅ Funcional |
| Permission Manager | `noaPermissionManager.ts` | ✅ Funcional |
| Chat Interface | `NoaConversationalInterface.tsx` | ✅ Funcional |
| RAG System | `ragSystem.ts` | ✅ Funcional (433 docs) |

## 6.2 Integrações

| Integração | Status |
|-----------|--------|
| OpenAI GPT-4o | ✅ Via Edge Function `tradevision-core` |
| Base de Conhecimento (433 docs) | ✅ Funcional |
| Extração de documentos PDF/DOCX | ✅ Edge Function `extract-document-text` |
| Semantic Search | ✅ `semanticSearch.ts` |
| Protocolo IMRE | ✅ Implementado no prompt |
| Governança Clínica | ✅ `clinicalGovernance/` |

## 6.3 Capacidades

- ✅ Chat conversacional com contexto longitudinal
- ✅ Geração de relatórios clínicos
- ✅ Leitura e resumo de documentos
- ✅ Avaliação por 5 racionalidades médicas
- ✅ Memória persistente (`noa_memories`)
- ⚠️ Predição de risco (`ai_scheduling_predictions`) — estrutura existe, dados vazios

---

# 7. MONETIZAÇÃO & GESTÃO FINANCEIRA

## 7.1 Estrutura de Planos

| Plano | Preço | Status |
|-------|-------|--------|
| Med Cann 150 | R$ 150/mês | ✅ Configurado |
| Med Cann 250 | R$ 250/mês | ✅ Configurado |
| Med Cann 350 | R$ 350/mês | ✅ Configurado |

## 7.2 Paywall

| Componente | Status |
|-----------|--------|
| PaymentGuard | ✅ Verifica `payment_status` |
| SubscriptionPlans page | ✅ Funcional |
| Stripe Integration | ⚠️ SDK instalado mas **webhook não conectado** |
| Checkout | ⚠️ Estrutura existe, processamento real pendente |

## 7.3 Gamificação & Cashback

| Feature | Status | Detalhe |
|---------|--------|---------|
| XP Points | ✅ | `increment_user_points()`, tabela `user_profiles` |
| Ranking Mensal | ✅ | `calculate_monthly_ranking()`, `ranking_history` |
| Tiers de Desconto | ✅ | Bronze → Diamante (0%-20%) |
| Cashback 8.7% | ✅ | Implementado no `PatientFinancialDashboard` |
| Referral System | ✅ | Trigger `tr_process_appointment_referral_bonus` |
| `checkout_with_points()` | ✅ | RPC funcional (75% cap) |

## 7.4 Dashboard Financeiro

| Módulo | Paciente | Profissional |
|--------|----------|-------------|
| Plano ativo + expiração | ✅ | N/A |
| XP + tier de desconto | ✅ | N/A |
| Cashback acumulado | ✅ | N/A |
| Código referral | ✅ | ✅ |
| Histórico de transações | ✅ | ✅ |
| Conformidade CDC/LGPD | ✅ | ✅ |

---

# 8. MÓDULOS POR ROLE

## 8.1 Paciente — Funcionalidades

| Funcionalidade | Status | Observação |
|---------------|--------|-----------|
| Dashboard com analytics | ✅ | Scores, evolução, plano terapêutico |
| Chat com médico | ✅ | Via `chat_rooms` tipo patient |
| Chat com Nôa IA | ✅ | Interface conversacional |
| Avaliação clínica IMRE | ⚠️ | Interface existe, 0 avaliações salvas |
| Visualizar prescrições | ✅ | Via view `v_patient_prescriptions` |
| Compartilhar relatórios | ✅ | ShareReportModal + RPC |
| Agendamentos | ✅ | PatientAppointments |
| Gestão financeira | ✅ | XP, cashback, plano, referral |
| Biblioteca | ✅ | 433 documentos |
| Gamificação | ✅ | XP, ranking, achievements |

## 8.2 Profissional — Funcionalidades

| Funcionalidade | Status | Observação |
|---------------|--------|-----------|
| Terminal clínico | ✅ | ClinicalTerminal + IntegratedWorkstation |
| Prontuário eletrônico | ✅ | MedicalRecord com 5 racionalidades |
| Prescrição digital CFM | ✅ | QuickPrescriptions (22 drafts) |
| Assinatura ITI/ICP-Brasil | ⚠️ | Widget existe, PKI parcial |
| Visualizar relatórios compartilhados | ✅ | **Crash corrigido** |
| Agendamento de pacientes | ✅ | ProfessionalScheduling |
| Chat com pacientes | ✅ | Via salas `chat_rooms` |
| Gestão de pacientes | ✅ | PatientsManagement (28 carregados) |
| Teleconsulta | ⚠️ | VideoCall sem TURN/STUN |
| Fórum de casos clínicos | ⚠️ | 0 posts |
| Dashboards personalizados | ✅ | Ricardo e Eduardo têm dashboards dedicados |

## 8.3 Admin — Funcionalidades

| Funcionalidade | Status |
|---------------|--------|
| Dashboard administrativo | ✅ |
| Gestão de usuários | ✅ |
| Governança clínica | ✅ |
| Analytics de avaliações | ✅ |
| Configurações da plataforma | ✅ |
| Gestão de notícias | ✅ |
| Gestão financeira | ✅ |

## 8.4 Aluno — Funcionalidades

| Funcionalidade | Status |
|---------------|--------|
| Dashboard do aluno | ✅ |
| Cursos (6 disponíveis) | ✅ |
| Biblioteca | ✅ |
| Gamificação | ✅ |
| Fórum | ⚠️ 0 posts |

---

# 9. EDGE FUNCTIONS — INVENTÁRIO E ESTADO

| Function | Caminho | Propósito | Status |
|----------|---------|-----------|--------|
| tradevision-core | `supabase/functions/tradevision-core/` | Motor IA (GPT-4o) | ✅ Ativa |
| extract-document-text | `supabase/functions/extract-document-text/` | Extração PDF/DOCX | ✅ Ativa |
| digital-signature | `supabase/functions/digital-signature/` | Assinatura digital | ⚠️ Parcial |
| video-call-reminders | `supabase/functions/video-call-reminders/` | Lembretes de videochamada | ⚠️ Não verificado |
| video-call-request-notification | `supabase/functions/video-call-request-notification/` | Notificação de videochamada | ⚠️ Não verificado |

---

# 10. GAP ANALYSIS: O QUE FALTA PARA 100%

## 🔴 Bloqueadores (Impedem Go-Live)

| # | Item | Esforço | Prioridade |
|---|------|---------|-----------|
| 1 | **Migrar 30 views de SECURITY DEFINER → INVOKER** | 4-6h | P0 |
| 2 | **Remover policy `allow_all_authenticated` de `cfm_prescriptions`** | 30min | P0 |
| 3 | **Conectar Stripe Webhooks** (pagamento real) | 2-3h | P0 |
| 4 | **Remover hardcoded emails das RPCs** (usar `user_roles` + `has_role()`) | 2h | P0 |

## 🟡 Importantes (Afetam Experiência)

| # | Item | Esforço | Prioridade |
|---|------|---------|-----------|
| 5 | Configurar TURN/STUN para VideoCall | 1-2h | P1 |
| 6 | Configurar Resend (email) em produção | 1h | P1 |
| 7 | Popular `imre_assessments` (fluxo IMRE completo salvando nesta tabela) | 3-4h | P1 |
| 8 | Consolidar tabelas legadas (`pacientes`, `usuarios`, `prescriptions`) | 2-3h | P1 |
| 9 | Verificar assinatura digital PKI (web-pki + Edge Function) | 2h | P1 |
| 10 | Popular fórum com posts iniciais | 1h | P1 |

## 🟢 Melhorias (Polish)

| # | Item | Esforço |
|---|------|---------|
| 11 | Remover tabelas `dev_vivo_*` | 30min |
| 12 | Dropar `chat_messages_legacy` | 15min |
| 13 | Consolidar `private_chats`/`private_messages` | 1h |
| 14 | Refatorar `noaKnowledgeBase.ts` (2 versões) | 1h |
| 15 | Refatorar componentes monolíticos (PatientDashboard 1000+ linhas) | 3-4h |
| 16 | Implementar testes E2E | 8-10h |
| 17 | Criptografia E2E real (LGPD hospitalar) | 4-6h |
| 18 | Limpeza de rotas legadas duplicadas no App.tsx | 1h |

---

# 11. ROADMAP DE FECHAMENTO

## Fase 1: Segurança (P0) — Estimativa: 1-2 dias
- [ ] Migrar 30 views para SECURITY INVOKER
- [ ] Remover `allow_all_authenticated` de `cfm_prescriptions`
- [ ] Substituir hardcoded emails por queries em `user_roles`
- [ ] Remover tabelas `dev_vivo_*`

## Fase 2: Integração de Pagamento (P0) — Estimativa: 1 dia
- [ ] Conectar Stripe webhooks
- [ ] Implementar processamento real de checkout
- [ ] Testar ciclo completo: plano → pagamento → acesso

## Fase 3: Fluxos Clínicos (P1) — Estimativa: 2-3 dias
- [ ] Configurar TURN/STUN para teleconsulta
- [ ] Integrar salvamento IMRE em `imre_assessments`
- [ ] Verificar PKI/assinatura digital em produção
- [ ] Configurar Resend para envio de prescrições

## Fase 4: Limpeza & Polish (P2) — Estimativa: 2-3 dias
- [ ] Consolidar tabelas legadas
- [ ] Refatorar componentes monolíticos
- [ ] Popular fórum e dados iniciais
- [ ] Limpar rotas duplicadas
- [ ] Testes E2E

## Progresso Geral Estimado

```
████████████████████████░░░░░ 82%
```

| Área | Completude |
|------|-----------|
| Frontend (UI/UX) | 92% |
| Backend (Supabase/RLS) | 85% |
| Segurança | 70% (views DEFINER) |
| Fluxos Clínicos | 85% |
| IA Nôa | 95% |
| Monetização | 65% (Stripe pendente) |
| Educação | 90% |
| Testes | 10% |
| **GERAL** | **~82%** |

---

# 12. CONCLUSÃO

O MedCannLab 3.0 é um sistema robusto com **82% de completude para Go-Live**. A arquitetura está sólida, os fluxos clínicos principais funcionam, e a IA Nôa opera com alta qualidade.

**Os 4 bloqueadores P0 podem ser resolvidos em 2-3 dias de trabalho focado:**

1. Views SECURITY DEFINER → INVOKER
2. RLS de `cfm_prescriptions`
3. Stripe Webhooks
4. Remoção de hardcoded emails

Após estas correções, a plataforma estará pronta para um **soft-launch controlado** com os 23 usuários atuais, seguido de escala gradual.

> *"O motor está a 82% de potência. Os 18% restantes são segurança, pagamento e testes — os parafusos que fazem a diferença entre um protótipo e um sistema de saúde de verdade."*

---

**Documento auditado automaticamente por Antigravity AI.**
**23 de Fevereiro de 2026.**
**Versão 6.0 — Audit Edition.**
