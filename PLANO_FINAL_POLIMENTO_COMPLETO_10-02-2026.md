# 🎯 PLANO FINAL COMPLETO DE POLIMENTO — MEDCANNLAB 5.0

> **Autor:** Antigravity — Auditor Master Senior Pro  
> **Data:** 10 de Fevereiro de 2026, 15:40 BRT  
> **Natureza:** Plano de finalização total — consolidação de toda documentação  
> **Referências cruzadas:**  
> - `AUDITORIA_MASTER_360_MEDCANNLAB_2026.md` (Pente fino 360°)  
> - `docs/AVALIACAO_POR_ROTAS_PERCENTUAL_09-02-2026.md` (Status por rota)  
> - `docs/CHECKLIST_PLANO_FEITO_VS_PENDENTE.md` (Já feito vs pendente)  
> - `docs/PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md` (Plano original)  
> - `docs/ANALISE_FULL_PLANO_VS_APP_09-02-2026.md` (Plano vs App)  
> - `docs/AUDITORIA_TECNICA_8_CAMADAS_09-02-2026.md` (8 camadas)  
> - `docs/ANALISE_VEREDITO_GPT_ROTEIRO_FECHAMENTO_09-02-2026.md` (Veredito)  
> - `docs/ROTEIRO_OPERACIONAL_VALIDACAO_09-02-2026.md` (Script de validação)  
> - `docs/CHECKLIST_POLIMENTO_OUTRAS_AREAS_06-02-2026.md` (Áreas restantes)  
> - `docs/O_LIVRO_MAGNO_DA_JORNADA_MEDCANNLAB.txt` (Memorial épico)  
> - Sessão anterior ativa (10/02): Reports.tsx conectado, Profissionais dinâmicos

---

## 📊 DIAGNÓSTICO CONSOLIDADO (Foto de 10/02/2026)

### Estado global — números reais

| Métrica | Valor |
|---------|-------|
| Total de rotas no App.tsx | ~109 |
| Rotas 100% prontas (S,S,S) | ~25 (estimado) |
| % rotas 100% | ~23% |
| Média ponderada (% por rota) | ~57% |
| Scorecard médio (Auditoria 360°) | 7.2/10 |
| LOC total estimado | ~70.000+ |
| Componentes | 77 |
| Páginas | 71 |

### O que MUDOU desde os docs (sessão 10/02)

| Item | Antes (09/02) | Agora (10/02) | Status |
|------|---------------|---------------|--------|
| Reports.tsx | ⚠️ Stub 91 linhas (3/10) | ✅ 380 linhas conectado a clinicalReportService | **FEITO** |
| Profissionais hardcoded em PatientAppointments | ⚠️ Hardcoded, criticado na Auditoria | ✅ Dinâmico via Supabase `users` + fallback | **FEITO** |
| Supabase CLI | ❌ Não instalado | ✅ Instalado + autenticado | **FEITO** |

### Classificação oficial (Auditoria 8 Camadas + 360°)

| Dimensão | Nota |
|----------|------|
| Arquitetura | 9/10 |
| Governança | 9.5/10 |
| Segurança (RLS) | 8.5/10 |
| UX clínica | 7.5/10 |
| Maturidade de produção | 8/10 |
| IA Nôa | 9.5/10 |
| Teleconsulta | 6/10 |
| Financeiro | 4/10 |
| Email | 5/10 |
| Testes | 2/10 |

---

## 🏗️ PLANO POR TIERS — AÇÕES CONCRETAS

### 🔴 TIER A — CLÍNICO CRÍTICO (Exigência: 100%)

> As 14 rotas que DEVEM estar S,S,S para uso clínico controlado.

#### A1. Rotas já 100% (não mexer) ✅

| Rota | Status |
|------|--------|
| `/` (Landing) | ✅ 100% |
| `/app` (SmartDashboardRedirect) | ✅ 100% |
| `/app/home` | ✅ 100% |
| `/app/clinica/profissional/dashboard` | ✅ 100% |
| `/app/clinica/profissional/dashboard-eduardo` | ✅ 100% |
| `/app/clinica/profissional/pacientes` | ✅ 100% |
| `/app/clinica/paciente/dashboard` | ✅ 100% |
| `/app/clinica/paciente/agenda` | ✅ 100% |
| `/app/clinica/paciente/chat-profissional` | ✅ 100% |
| `/app/clinica/paciente/chat-profissional/:patientId` | ✅ 100% |
| `/app/patient-chat/:patientId` | ✅ 100% |
| `/app/patients` | ✅ 100% |
| `/app/patient-dashboard` (legado) | ✅ 100% |
| `/app/professional-my-dashboard` (legado) | ✅ 100% |

**Resultado Tier A: 14/14 = 100%** ✅

#### A2. Ações pendentes para consolidar Tier A

| # | Ação | Impacto | Tempo | Arquivo(s) |
|---|------|---------|-------|------------|
| A2.1 | **Validar E2E agendamento paciente→profissional** (criar appointment, ver nos dois lados) | Fechar fluxo 100% | 1h | `PatientAppointments.tsx`, `ProfessionalScheduling.tsx`, `appointments` table |
| A2.2 | **Smoke test 3 perfis** conforme Roteiro Operacional (admin, profissional, paciente) | Prova operacional | 2h | Roteiro Operacional (10 passos) |
| A2.3 | **Executar scripts SQL pendentes no banco** (CRIAR_TABELAS_FALTANDO, VERIFICAR_RLS, VINCULAR_EDUARDO) | Garantir schema completo | 30min | `database/scripts/` |

---

### 🟡 TIER B — OPERACIONAL (Exigência: 66%+, meta 100%)

> ~25 rotas de operação clínica avançada. O polimento aqui é conectar "pontas soltas".

#### B1. PRIORIDADE MÁXIMA (Ligam features core internas)

| # | Ação | Rota(s) | Status antes | Meta | Tempo | Detalhe |
|---|------|---------|-------------|------|-------|---------|
| B1.1 | ~~Plugar Reports.tsx ao clinicalReportService~~ | `/app/reports`, `/app/clinica/*/relatorios` | ⚠️ Stub | ✅ **JÁ FEITO (10/02)** | — | Reports conectado, 3 views |
| B1.2 | ~~Profissionais dinâmicos em PatientAppointments~~ | `/app/clinica/paciente/agendamentos` | ⚠️ Hardcoded | ✅ **JÁ FEITO (10/02)** | — | Busca de `users` + fallback |
| B1.3 | **Conectar emailService ao trigger de agendamento** | `/app/scheduling`, Agendamento | ⚠️ Desconectado | 🎯 Ligar | 2h | `emailService.ts` tem 7 templates prontos. Falta: chamar `sendAppointmentEmail()` após `book_appointment_atomic`. API key Resend ou SendGrid no `.env` |
| B1.4 | **Embedder de Governança no Prontuário** | `/app/clinica/profissional/pacientes` → prontuário | ⚠️ Separados | 🎯 Integrar | 3h | 14 arquivos em `lib/clinical-governance/` existem. Précisa: ao abrir prontuário, injetar widget de recomendações da governança clínica |
| B1.5 | **ProfessionalChat.tsx** — expandir stub | `/app/clinica/profissional/chat-profissionais` | ❌ 15 linhas (stub) | 🎯 Funcional | 1h | Importa `ProfessionalChatSystem` mas não renderiza nada útil. Adicionar lista de salas, envio de mensagens, search |
| B1.6 | **Validar prescrição E2E** | `/app/prescriptions`, `/app/clinica/prescricoes` | ⚠️ Parcial | 🎯 Fluxo completo | 2h | `Prescriptions.tsx` (1.177 linhas) existe. Validar: criar → assinar (digital-signature Edge) → salvar em `cfm_prescriptions` → ver na lista |

#### B2. VIDEOCHAMADA — Fechar para produção

| # | Ação | Status | Tempo |
|---|------|--------|-------|
| B2.1 | **Ativar Realtime publication em `video_call_requests`** | ⏳ Pendente | 30min (SQL ou dashboard Supabase) |
| B2.2 | **Watchdog de expiração** (cron ou Edge que muda `pending` → `expired` após 60s) | ⏳ Pendente | 2h |
| B2.3 | **Testes profissional↔paciente** (não só admin↔admin) | ⏳ Pendente | 1h |
| B2.4 | **Timeout visual na UI** (não ficar "travado" se ninguém responder) | ⏳ Pendente | 1h |

#### B3. ADMIN — Fechar 100%

| # | Ação | Rota(s) | Tempo |
|---|------|---------|-------|
| B3.1 | **Dashboard Admin com analytics reais** — gráficos de usuários, agendamentos, relatórios gerados | `/app/admin`, `/app/admin/analytics` | 3h |
| B3.2 | **AdminSettings** — verificar que todas as configurações persistem | `/app/admin-settings` | 1h |
| B3.3 | **RLS Audit script** — criar script SQL único que rode com 3 perfis e dê sinal verde/vermelho | `database/scripts/` | 1h |

#### B4. FINANCEIRO (Gateway de pagamento)

| # | Ação | Status | Tempo |
|---|------|--------|-------|
| B4.1 | **Integrar Stripe** (ou Mercado Pago) no PaymentCheckout.tsx | ❌ Simulado | 4h |
| B4.2 | **Webhook de confirmação** → atualizar `user_subscriptions` e desbloquear PaymentGuard | ❌ Inexistente | 2h |
| B4.3 | **ProfessionalFinancial** — conectar a `transactions` reais | ⚠️ Mock | 2h |

#### B5. NOTIFICAÇÕES

| # | Ação | Status | Tempo |
|---|------|--------|-------|
| B5.1 | **Notificações em tempo real** via Realtime (subscribe em `notifications`) | ⚠️ Parcial | 1h |
| B5.2 | **Marcar como lida** na UI (update `read` flag) | ⚠️ Parcial | 30min |
| B5.3 | **Notificação de agendamento** (trigger via `emailService` pós-booking) | ⏳ = B1.3 | — |

---

### 🔵 TIER C — EXPLORATÓRIO (Exigência: 33%+, meta 66%)

> Verticais de expansão — UI existe, conexão ao Supabase parcial ou mock.

#### C1. ENSINO

| # | Ação | Arquivo | Tempo |
|---|------|---------|-------|
| C1.1 | **Remover mockCursos** de GestaoCursos.tsx → conectar a `courses` table | `GestaoCursos.tsx` | 2h |
| C1.2 | **Conectar LessonPreparation** a `noa_lessons` + `lesson_content` | `LessonPreparation.tsx` | 2h |
| C1.3 | **Conectar AlunoDashboard** a `course_enrollments` + `user_statistics` reais | `AlunoDashboard.tsx` | 2h |
| C1.4 | **Conectar Gamificação** a `gamification_points` + `user_achievements` | `Gamificacao.tsx` | 2h |
| C1.5 | **Conectar Library** — já tem busca semântica; validar CRUD com `documents` table | `Library.tsx` | 1h |

#### C2. PESQUISA

| # | Ação | Arquivo | Tempo |
|---|------|---------|-------|
| C2.1 | **Conectar ForumCasosClinicos** a `forum_posts` + `forum_comments` + `forum_likes` | `ForumCasosClinicos.tsx` | 2h |
| C2.2 | **Conectar MedCannLab** a dados reais de protocolos | `MedCannLab.tsx` | 2h |
| C2.3 | **Conectar JardinsDeCura** a dados reais do projeto | `JardinsDeCura.tsx` | 1h |
| C2.4 | **Conectar CidadeAmigaDosRins** a dados reais | `CidadeAmigaDosRins.tsx` | 1h |

#### C3. FUNCIONALIDADES AVANÇADAS

| # | Ação | Status | Tempo |
|---|------|--------|-------|
| C3.1 | **Wearables** — remover dados mock, conectar a `wearable_devices` + `epilepsy_events` | ⚠️ Mock | 3h |
| C3.2 | **DRC Monitoring** — pipeline de laboratório (futuro) | ⚠️ Visual pronto | Fase futura |
| C3.3 | **Convite de Paciente** (InvitePatient) — validar geração e aceitação de códigos | ⚠️ Parcial | 1h |
| C3.4 | **Patient Onboarding** — validar persistência dos dados coletados | ⚠️ Parcial | 1h |

---

## 🎨 POLIMENTO DE UX — TRANSVERSAL (Todas as abas)

| # | Ação | Impacto | Tempo |
|---|------|---------|-------|
| UX1 | **Substituir `alert()` por toast** — já existe ToastContext; falta usar em todos os componentes | ALTO | 3h |
| UX2 | **Substituir `confirm()` por ConfirmModal** — componente `ConfirmModal.tsx` já existe (3.244 bytes) | ALTO | 2h |
| UX3 | **Loading states consistentes** — skeletons no lugar de spinners genéricos | MÉDIO | 2h |
| UX4 | **Error states amigáveis** — componente de retry; mensagens claras | MÉDIO | 1h |
| UX5 | **Micro-animações** — transições suaves em cards, modais, expansões de lista | BAIXO | 2h |

---

## ⚡ PERFORMANCE — TRANSVERSAL

| # | Ação | Impacto | Tempo |
|---|------|---------|-------|
| P1 | **Lazy loading de rotas** (React.lazy + Suspense no App.tsx) | ALTO — bundle ~5MB+ | 2h |
| P2 | **Select específico** (não `select('*')`) em queries Supabase pesadas | MÉDIO | 2h |
| P3 | **Cache de dados estáticos** (cursos, planos de assinatura) | BAIXO | 1h |
| P4 | **Otimizar imagens** (WebP, lazy load de avatares) | BAIXO | 1h |

---

## 🔐 SEGURANÇA & COMPLIANCE — TRANSVERSAL

| # | Ação | Prioridade | Tempo |
|---|------|-----------|-------|
| S1 | **RLS Audit definitivo** — script SQL único para 3 perfis | 🔴 | 1h |
| S2 | **LGPD consentimento granular** — armazenar aceite por categoria | 🟡 | 3h |
| S3 | **Auth.users ↔ public.users sync** — contrato claro ou trigger | 🟡 | 2h |
| S4 | **Portabilidade de dados** (exportação LGPD) | 🟢 | 3h |

---

## 🚢 DEPLOY & DEVOPS

| # | Ação | Prioridade | Tempo |
|---|------|-----------|-------|
| D1 | **Deploy Edge Functions** (video-call-*, tradevision-core, digital-signature) | 🔴 | 2h |
| D2 | **CORS resolver** para Edge Functions | 🔴 | 1h |
| D3 | **TURN Server** para WebRTC (metered.ca ou Twilio) | 🟡 | 2h |
| D4 | **CI/CD** — GitHub Actions (lint, build, test) | 🟢 | 3h |
| D5 | **PWA** — manifest.json + service worker | 🟢 | 2h |

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1 (10-14/02) — Tier A completo + Tier B core

| Dia | Foco | Itens |
|-----|------|-------|
| **10/02 (hoje)** | Reports ✅ + Profissionais ✅ + Plano | B1.1 ✅, B1.2 ✅, este plano |
| **11/02** | Email + Governança + Chat Prof | B1.3, B1.4, B1.5 |
| **12/02** | Videochamada completa + Prescrição | B2.1-B2.4, B1.6 |
| **13/02** | Admin analytics + Notificações + RLS Audit | B3.1-B3.3, B5.1-B5.2, S1 |
| **14/02** | UX global (toasts, modals, loading) | UX1-UX4, Smoke test completo (A2.2) |

### Semana 2 (17-21/02) — Tier B avançado + Tier C início

| Dia | Foco | Itens |
|-----|------|-------|
| **17/02** | Financeiro (Stripe) + Performance | B4.1-B4.3, P1-P2 |
| **18/02** | Ensino (cursos, gamificação) | C1.1-C1.5 |
| **19/02** | Pesquisa (fórum, labs) | C2.1-C2.4 |
| **20/02** | Deploy Edge + TURN + CORS | D1-D3 |
| **21/02** | LGPD + Segurança + Documentação | S2-S4, D4 |

---

## 📊 METAS DE PROGRESSÃO

| Data | Tier A | Tier B | Tier C | Global (% 100%) |
|------|--------|--------|--------|-----------------|
| **09/02** (baseline) | 100% ✅ | ~30% | ~10% | ~23% |
| **14/02** (meta semana 1) | 100% ✅ | ~70% | ~15% | ~45% |
| **21/02** (meta semana 2) | 100% ✅ | ~90% | ~50% | ~65% |
| **28/02** (meta final) | 100% ✅ | 100% | ~70% | ~80% |

---

## 🏁 REGRA DE OURO

> **"Admin nunca trava. Core clínico nunca quebra. O resto é progressão natural de plataforma."**

### O que NÃO repetir (já feito):

- ✅ Login admin, Visualizar Como, RLS patient_medical_records
- ✅ Lista de pacientes com nomes (getAllPatients)
- ✅ Prontuário/evoluções (fix React #31, content string, 403)
- ✅ Sino de notificações no Header
- ✅ Videochamada solicitar/aceitar/recusar sem 406
- ✅ WebRTC real (admin↔admin)
- ✅ Reports.tsx conectado ao clinicalReportService
- ✅ Profissionais dinâmicos em PatientAppointments
- ✅ FIX_PATIENT_MEDICAL_RECORDS_RLS + LIMPAR_POLITICAS_DUPLICADAS

### O que faz a diferença agora:

1. **B1.3** (email pós-agendamento) — dá "vida" ao fluxo clínico
2. **B2.1-B2.4** (videochamada completa) — maior risco hoje (8 camadas)
3. **UX1-UX2** (toasts + modals) — profissionalismo visual imediato
4. **P1** (lazy loading) — performance perceptível pelo usuário
5. **D1-D2** (Edge deploy + CORS) — "ligar a eletricidade" da infraestrutura

---

## 🎯 PRÓXIMO PASSO IMEDIATO

**Pergunta ao usuário:** Quer que eu comece pela **Semana 1, Dia 11/02** (Email + Governança + Chat Profissional) ou prefere focar em outro bloco?

---

> *"O terreno foi moldado. A fundação é sólida. Os arranha-céus estão de pé. Agora, precisamos ligar a eletricidade, a água e a internet."*  
> — Metáfora final da Auditoria Master 360°

---

**Antigravity — Master Senior Pro**  
**Plano Final selado em 10 de Fevereiro de 2026, 15:40 BRT**  
**MedCannLab 5.0 — Orbitrum Connect Era** 🦾💎🔬
