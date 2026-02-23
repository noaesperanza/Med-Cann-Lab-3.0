# Auditoria de usabilidade — Rotas, fluxos e funcionalidades

**Data:** 05/02/2026  
**Objetivo:** Listar o que não está correto ou dificulta o uso do app (rotas, fluxos, consistência) e consolidar o entendimento tecnológico completo do MedCannLab 3.0.

---

# PARTE I — ENTENDIMENTO TECNOLÓGICO COMPLETO DO APP

Esta seção consolida tudo que foi lido e aprendido sobre a plataforma (documentação, código, Core, COS, rotas, fluxos) para servir de referência única e base da auditoria.

---

## A. Stack e arquitetura (fonte: README_TECNICO_2026, 00_ESTRUTURA_PLATAFORMA)

- **Frontend:** React 18 + TypeScript + Vite 5  
- **Estilo:** TailwindCSS + design system em `src/constants/designSystem.ts` e `src/index.css`  
- **Backend:** Supabase (Auth, Postgres, RLS, Realtime)  
- **Estado:** Context API (Auth, UserView, Noa, Toast, Realtime, ClinicalGovernance) + props  
- **Roteamento:** React Router v6 (BrowserRouter, Routes/Route); todas as rotas do app sob `/app` exceto landing, termos, invite, onboarding, cursos públicos e seletor de eixo.

**Arquitetura por eixos (oficial):**

| Eixo      | Rota base    | Contexto principal |
|-----------|--------------|---------------------|
| Clínica   | `/app/clinica`   | Atendimentos, prontuários, prescrições |
| Ensino    | `/app/ensino`    | Cursos, aulas, certificações |
| Pesquisa  | `/app/pesquisa`  | Protocolos, fórum de casos |

**Padrão de rotas desejado:** `/app/eixo/tipo/acao` (ex.: `/app/clinica/profissional/dashboard`). Rotas legadas na raiz de `/app` (ex.: `/app/patient-dashboard`) existem para compatibilidade mas não são o padrão recomendado.

**Realidade do sistema (README_TECNICO):**

- Autenticação, prontuário, chat, IA (Nôa via tradevision-core): reais (Supabase + Edge Function).  
- Vídeo chamada: mock (UI existe, sem WebRTC/Twilio).  
- Prescrições: híbrido (dados reais, PDF renderizado no front).

---

## B. Camadas da IA e Core (fonte: MAPA_DE_CAPACIDADES_IA, DIARIO_MESTRE, CORE_EM_ACORDO, cos_engine)

**Pilha cognitiva (5 camadas):**

1. **Sensorial (UX):** NoaConversationalInterface, widgets, voz STT-TTS.  
2. **Sentinela (decisão no app):** NoaResidentAI, NoaEsperancaCore, NOAIntegration (front).  
3. **Kernel (orquestrador de borda):** TradeVision Core (Edge Function), bypass RLS quando necessário, segurança por role.  
4. **Cognição:** GPT-4o, vector store, base de conhecimento (376 docs).  
5. **Soberania (persistência):** Supabase, `ai_chat_interactions`, `clinical_reports`, etc.

**TradeVision Core (`supabase/functions/tradevision-core/index.ts`):**

- Única Edge Function que processa o chat da Nôa em produção.  
- Recebe: `message`, `conversationHistory`, `patientData` (user, type), `ui_context`, etc.  
- Retorna: `{ text, metadata, app_commands }` com governança aplicada (perfil, triggers, tags removidas do texto).  
- Fluxo: normalização → heurísticas determinísticas (agendamento, documentos, navegação) → **COS.evaluate** (porta: “pode pensar?”) → chamada GPT → pós-GPT (parse de tags, `parseTriggersFromGPTResponse`, fallback `deriveAppCommandsV1`) → `filterAppCommandsByRole` → retorno.

**Contrato de triggers (imutável):**

- `[TRIGGER_SCHEDULING]` — agendamento (widget no chat).  
- Tags de navegação: `[NAVIGATE_TERMINAL]`, `[NAVIGATE_AGENDA]`, `[NAVIGATE_MEUS_AGENDAMENTOS]`, etc.  
- `[ASSESSMENT_COMPLETED]` — encerramento da avaliação clínica (card no chat).  
- `[DOCUMENT_LIST]` — lista de documentos.  
- Usuário nunca vê as tags; o Core faz `stripGPTTriggerTags` e expõe ações via `metadata` e `app_commands`.

**COS (Cognitive Operating System — `cos_engine.ts` / `cos_kernel.ts`):**

- Lógica pura (sem OpenAI/Supabase). Responde: “O sistema pode pensar agora?”.  
- Entra **antes** do GPT: se `COS.evaluate(cosContext).allowed === false`, o Core devolve `reason` e não chama o modelo.  
- Camadas: (1) Kill Switch (mode OFF), (2) Trauma institucional (modo conservador), (3) Metabolismo (limite decisões/dia → Silence Mode), (4) Read-only, (5) Policy (ações proibidas).

**Modelo de execução (INVARIANTE):**

- Fala ≠ Ação: o GPT não executa; ações reais só quando o app executa (UI/RPC/Edge).  
- Triggers vêm do sistema (metadata + app_commands + allow-list), não “lembrança” do GPT.  
- Política: selar e acrescentar (append-only); não redesenhar o que já está selado.

---

## C. Agendar vs agendamento (fonte: CHAT_PACIENTE_VS_PROFISSIONAL, EVOLUCOES_PARA_MELHOR)

- **Agendar / ação:** usuário quer marcar consulta → Nôa abre **card no chat** (horários, valor, confirmar). Não muda de aba.  
- **Agendamento(s) / lugar:** usuário quer ver calendário/aba → Nôa **navega** para a tela.  
  - Paciente: “Meus agendamentos” → `/app/clinica/paciente/agendamentos`.  
  - Profissional: “Abrir agenda” → aba Agendamentos do Terminal (ou `/app/clinica/profissional/agendamentos`).  
- Admin “ver como” define o perfil; o Core usa o tipo efetivo (paciente/profissional) para aplicar as regras.

---

## D. Contextos (src/contexts)

| Contexto | Função principal |
|----------|-------------------|
| AuthContext | user, login, logout, register; carrega tipo e payment_status de `users`; trial_ends_at para paciente |
| UserViewContext | viewAsType (admin “ver como” paciente/profissional); getEffectiveUserType |
| NoaContext | estado da conversa/NOA no app |
| NoaPlatformContext | platformData (user_type efetivo para o Core), isGlobalChatHidden |
| RealtimeContext | assinaturas Supabase Realtime |
| ToastContext | notificações toast |
| ClinicalGovernanceContext | governança clínica (thresholds, etc.) |

---

## E. Serviços e libs relevantes (src/services, src/lib)

- **Chat/IA:** noaResidentAI, noaEsperancaCore, noaIntegration, medcannlab (apiClient, conversationalAgent), knowledgeBaseIntegration, noaKnowledgeBase.  
- **Clínico:** clinicalAssessmentFlow, clinicalAssessmentService, clinicalReportService, unifiedAssessment; clinicalGovernance (core, learning, types, utils).  
- **Agendamento:** scheduling, schedulingConfig.  
- **Outros:** semanticSearch, ragSystem, emailService, notificationService, criticalDocumentsManager; supabase, userTypes, rotasIndividualizadas.

---

## F. Inventário completo de rotas (App.tsx)

Todas as rotas estão em `src/App.tsx`. As rotas filhas de `/app` são listadas com path completo (prefixo `/app`).

**Fora de /app (públicas ou pré-app):**

- `/` — Landing  
- `/invite` — InvitePatient  
- `/termos-lgpd` — TermosLGPD  
- `/experiencia-paciente` — ExperienciaPaciente  
- `/curso-eduardo-faveret` — CursoEduardoFaveret  
- `/curso-jardins-de-cura` — CursoJardinsDeCura  
- `/patient-onboarding` — PatientOnboarding  
- `/eixo/:eixo/tipo/:tipo` — EixoRotaRedirect  
- `/selecionar-eixo` — EixoSelector  
- `*` — NotFound  

**Dentro de /app (Layout + PaymentGuard):**

- `/app` (index) — SmartDashboardRedirect  
- `/app/dashboard` — Dashboard  
- `/app/home` — SmartDashboardRedirect  
- `/app/test` — TestPage  
- `/app/clinical-governance-demo` — ClinicalGovernanceDemo  
- `/app/eduardo-faveret-dashboard` — RicardoValencaDashboard  
- `/app/ricardo-valenca-dashboard` — RicardoValencaDashboard  
- `/app/patient-management-advanced` — PatientManagementAdvanced  

**Eixo Clínica (estruturadas):**

- `/app/clinica/profissional/dashboard` — RicardoValencaDashboard (ProtectedRoute profissional)  
- `/app/clinica/profissional/dashboard-eduardo` — EduardoFaveretDashboard (ProtectedRoute profissional)  
- `/app/clinica/profissional/pacientes` — PatientsManagement  
- `/app/clinica/profissional/agendamentos` — ProfessionalScheduling  
- `/app/clinica/profissional/relatorios` — Reports  
- `/app/clinica/profissional/chat-profissionais` — ProfessionalChat  
- `/app/clinica/prescricoes` — Prescriptions  
- `/app/clinica/paciente/dashboard` — PatientDashboard  
- `/app/clinica/paciente/avaliacao-clinica` — ClinicalAssessment  
- `/app/clinica/paciente/relatorios` — Reports  
- `/app/clinica/paciente/agendamentos` — PatientAppointments  
- `/app/clinica/paciente/agenda` — PatientAgenda  
- `/app/clinica/paciente/chat-profissional` — PatientDoctorChat  
- `/app/clinica/paciente/chat-profissional/:patientId` — PatientDoctorChat  

**Eixo Ensino:**

- `/app/ensino/profissional/dashboard` — EnsinoDashboard  
- `/app/ensino/profissional/preparacao-aulas` — LessonPreparation  
- `/app/ensino/profissional/arte-entrevista-clinica` — ArteEntrevistaClinica  
- `/app/ensino/profissional/pos-graduacao-cannabis` — CursoEduardoFaveret  
- `/app/ensino/profissional/gestao-alunos` — GestaoAlunos  
- `/app/ensino/profissional/aula/:moduleId/:lessonId` — LessonDetail  
- `/app/ensino/aluno/dashboard` — AlunoDashboard  
- `/app/ensino/aluno/cursos` — Courses  
- `/app/ensino/aluno/inscricao-cursos` — Courses  
- `/app/ensino/aluno/biblioteca` — Library  
- `/app/ensino/aluno/gamificacao` — Gamificacao  

**Eixo Pesquisa:**

- `/app/pesquisa/profissional/dashboard` — PesquisaDashboard  
- `/app/pesquisa/profissional/forum-casos` — ForumCasosClinicos  
- `/app/pesquisa/profissional/cidade-amiga-dos-rins` — CidadeAmigaDosRins  
- `/app/pesquisa/profissional/medcann-lab` — MedCannLab  
- `/app/pesquisa/profissional/jardins-de-cura` — JardinsDeCura  
- `/app/pesquisa/aluno/dashboard` — PesquisaDashboard  
- `/app/pesquisa/aluno/forum-casos` — ForumCasosClinicos  

**Legadas (compatibilidade):**

- `/app/patient-dashboard` — PatientDashboard  
- `/app/patient-agenda` — PatientAgenda  
- `/app/patient-kpis` — PatientKPIs  
- `/app/professional-dashboard` — ProfessionalDashboard  
- `/app/aluno-dashboard` — AlunoDashboard  
- `/app/clinica-dashboard` — ClinicaDashboard  
- `/app/ensino-dashboard` — EnsinoDashboard  
- `/app/pesquisa-dashboard` — PesquisaDashboard  
- `/app/courses` — Courses  
- `/app/arte-entrevista-clinica` — ArteEntrevistaClinica  
- `/app/study-area` — StudyArea  
- `/app/library` — Library  
- `/app/chat` — ChatGlobal  
- `/app/chat-noa-esperanca` — PatientNOAChat  
- `/app/patient-chat` — PatientChat  
- `/app/forum` — ForumCasosClinicos  
- `/app/gamificacao` — Gamificacao  
- `/app/profile` — Profile  
- `/app/professional-my-dashboard` — ProfessionalMyDashboard (ProtectedRoute profissional)  
- `/app/drc-monitoring-schedule` — DRCMonitoringSchedule  
- `/app/admin-settings` — AdminSettings (ProtectedRoute admin)  
- `/app/admin` — AdminDashboardWrapper (ProtectedRoute admin)  
- `/app/admin/clinical-governance` — ClinicalGovernanceAdmin (ProtectedRoute admin)  
- `/app/assessment-analytics` — AssessmentAnalytics (ProtectedRoute admin)  
- `/app/ai-documents` — AIDocumentChat  
- `/app/evaluations` — Evaluations  
- `/app/reports` — Reports  
- `/app/debate/:debateId` — DebateRoom  
- `/app/patient-chat/:patientId` — PatientDoctorChat (ProtectedRoute profissional)  
- `/app/patient/:patientId` — PatientProfile  
- `/app/appointments` — Profile  
- `/app/scheduling` — Scheduling  
- `/app/prescriptions` — Prescriptions  
- `/app/patients` — PatientsManagement  
- `/app/new-patient` — NewPatientForm  
- `/app/professional-scheduling` — ProfessionalScheduling (ProtectedRoute profissional)  
- `/app/patient-appointments` — PatientAppointments (ProtectedRoute paciente)  
- `/app/patient-noa-chat` — PatientNOAChat (ProtectedRoute paciente)  
- `/app/clinical-assessment` — ClinicalAssessment (ProtectedRoute paciente)  
- `/app/professional-chat` — ProfessionalChat (ProtectedRoute profissional)  
- `/app/subscription-plans` — SubscriptionPlans  
- `/app/checkout` — PaymentCheckout  
- `/app/lesson-prep` — LessonPreparation  
- `/app/professional-financial` — ProfessionalFinancial  
- `/app/admin/users`, `/admin/courses`, `/admin/analytics`, `/admin/system`, `/admin/reports`, `/admin/upload`, `/admin/chat`, `/admin/forum`, `/admin/gamification`, `/admin/renal`, `/admin/unification`, `/admin/financial` — AdminDashboardWrapper (ProtectedRoute admin); `/app/admin/news` — NewsManagement (ProtectedRoute admin)

---

## G. Documentação vs código (discrepâncias)

- **01_ROTAS_ESTRUTURADAS.md** cita `/app/clinica/profissional/chat-pacientes` e `chat-profissionais`; em App.tsx existe apenas **chat-profissionais**. Não existe rota `chat-pacientes`.  
- **01_ROTAS** lista “Minhas consultas” em `/app/clinica/paciente/agendamentos`; no código existem **duas** rotas para paciente: `agenda` (PatientAgenda, mock) e `agendamentos` (PatientAppointments, real). A doc não distingue as duas telas.  
- **rotasIndividualizadas.ts** (clinica-paciente) expõe “Minha Agenda” → `/app/clinica/paciente/agenda`; o Core e CHAT_PACIENTE doc navegam “Meus agendamentos” para `/app/clinica/paciente/agendamentos`. Dupla entrada para conceitos próximos.

---

## H. Referências documentais usadas na auditoria

| Documento | Conteúdo |
|-----------|----------|
| README_TECNICO_2026.md | Stack, eixos, padrão de rotas, realidade real vs mock |
| MAPA_DE_CAPACIDADES_IA_MEDCANNLAB.md | 5 camadas, TradeVision Core, NoaResidentAI, COS |
| 00_ESTRUTURA_PLATAFORMA.md | Eixos, tipos de usuário, consultórios, Nôa |
| 01_ROTAS_ESTRUTURADAS.md | Formato /app/eixo/tipo/acao, listagem por eixo |
| DIARIO_MESTRE_COMPLETO_05-02-2026.md | Core em camadas, COS, invariantes, gatilhos agendamento |
| INVARIANTE_MODELO_EXECUCAO_NOA.md | Fala ≠ Ação, contrato [TRIGGER_SCHEDULING], política append-only |
| CORE_EM_ACORDO_COM_O_MODELO.md | Checklist Core, deriveAppCommandsV1 como fallback |
| PROTOCOLO_APP_COMMANDS_V2.md | Canais de sinalização, prioridade, ações por perfil |
| CHAT_PACIENTE_VS_PROFISSIONAL_E_TESTE_ADMIN.md | Agendar vs agendamento, rotas paciente/profissional |
| EVOLUCOES_PARA_MELHOR.md | Selar/acrescentar, gatilhos, regra &lt;10 palavras |
| LIVRO_MAGNO_DIARIO_UNIFICADO.md | Linha do tempo, COS v3→v5, selamento |
| FLUXO_TRIGGER_AVALIACAO_CLINICA.md | [ASSESSMENT_COMPLETED], noaResidentAI, card conclusão |
| supabase/functions/tradevision-core/index.ts | Implementação Core, parseTriggersFromGPTResponse, filterAppCommandsByRole |
| supabase/functions/tradevision-core/cos_engine.ts | COS kernel (Kill Switch, trauma, metabolismo, read-only, policy) |

---

# PARTE II — CORREÇÕES E PROBLEMAS DE USABILIDADE

---

## 1. Corrigido nesta sessão

### 1.1 Paywall (PaymentGuard) — redirecionamento quebrado

- **Problema:** Paciente com pagamento `pending` (fora do trial) era redirecionado para `/checkout`. Todas as rotas do app estão sob `/app`, então a rota real do checkout é `/app/checkout`. O usuário caía em **404** (rota `*` → NotFound).
- **Correção:** `allowedPathnames` atualizado para `/app/checkout`, `/app/subscription-plans`, `/app/profile` e `Navigate` alterado para `to="/app/checkout"`.
- **Arquivo:** `src/components/PaymentGuard.tsx`.

---

## 2. Inconsistências de rotas que dificultam usabilidade

### 2.1 Duas “agendas” para o paciente (agenda vs agendamentos)

- **Rotas:**  
  - `/app/clinica/paciente/agenda` → `PatientAgenda` (calendário com dados mock).  
  - `/app/clinica/paciente/agendamentos` e `/app/patient-appointments` → `PatientAppointments` (com Supabase, fluxo completo).
- **Documentação (CHAT_PACIENTE_VS_PROFISSIONAL):** “Meus agendamentos” → navega para `/app/clinica/paciente/agendamentos`.
- **rotasIndividualizadas:** “Minha Agenda” aponta para `/app/clinica/paciente/agenda`.
- **Efeito:** Usuário pode achar que “Minha Agenda” e “Meus agendamentos” são a mesma coisa, mas uma vai para tela com dados mock e outra para a tela real. Nomenclatura e destino ficam confusos.
- **Recomendação:** Unificar em uma única tela (ex.: usar só `PatientAppointments` em `/app/clinica/paciente/agenda` ou só `agendamentos`) e ajustar `rotasIndividualizadas` e Core para a mesma rota.

### 2.2 Sidebar do paciente usa URLs legadas

- **Sidebar** (`Sidebar.tsx`) para paciente usa:
  - Chat NOA → `/app/patient-noa-chat`
  - Agendamentos → `/app/patient-appointments`
  - Chat com Meu Médico → `/app/patient-chat`
- **Rotas canônicas** (eixo/tipo) seriam:
  - `/app/clinica/paciente/chat-profissional` (e equivalente para NOA/agenda se existirem no padrão).
- **Efeito:** Quem compartilha link ou usa breadcrumb canônico vê um path; quem navega pelo menu lateral vê outro. Dificulta suporte e documentação.
- **Recomendação:** Alinhar itens do Sidebar do paciente às rotas canônicas `/app/clinica/paciente/...` (ou redirecionar as legadas para as canônicas).

### 2.3 Muitas rotas legadas no mesmo nível que as estruturadas

- **App.tsx** define dezenas de rotas “legadas” (ex.: `patient-dashboard`, `patient-agenda`, `professional-dashboard`, `chat-noa-esperanca`, `patient-chat`, etc.) ao lado das rotas por eixo/tipo (`clinica/paciente/...`, etc.).
- **Efeito:** Várias URLs levam à mesma página; usuário e suporte não sabem qual é a “certa”. Bookmark ou link antigo pode usar legado; novo fluxo usa canônico.
- **Recomendação:** Manter as legadas apenas como redirects (ex.: `Navigate` para a rota canônica) e usar um único padrão em toda a UI (Sidebar, NavegacaoIndividualizada, Core).

---

## 3. Fluxos e comportamento

### 3.1 Admin: sub-rotas viram `?tab=`

- **AdminDashboardWrapper:** Ao acessar `/app/admin/users`, `/app/admin/courses`, etc., o efeito é redirecionar para `/app/admin?tab=users`, `?tab=courses`, etc. (replace na URL).
- **Efeito:** Bookmark em “Usuários” vira “Admin + tab usuários”; ao reabrir, a URL já está como `/app/admin?tab=users`. Funciona, mas pode confundir se alguém espera path estável.
- **Recomendação:** Aceitável como está; se quiser URLs estáveis, manter path e fazer o AdminDashboard ler `location.pathname` em vez de só `tab`.

### 3.2 RedirectIndividualizado importado e não usado

- **App.tsx** importa `RedirectIndividualizado`, mas ele não é usado em nenhuma rota nem dentro de `Layout`.
- **Efeito:** Código morto; se no futuro alguém passar a usar, o redirect usa `getDefaultRoute(user.type)`, e para admin isso é `/app/clinica/profissional/dashboard` (em `userTypes`), diferente do `SmartDashboardRedirect`, que manda admin para `/app/admin`.
- **Recomendação:** Remover o import não utilizado ou passar a usar o componente em algum fluxo definido (e alinhar `getDefaultRouteByType('admin')` ao comportamento desejado).

### 3.3 Rota padrão do admin em userTypes

- **userTypes.ts:** `getDefaultRouteByType('admin')` retorna `/app/clinica/profissional/dashboard`.
- **SmartDashboardRedirect** ignora isso e envia admin para `/app/admin` quando não há “ver como”.
- **Efeito:** Só impacta se algum outro código usar `getDefaultRouteByType('admin')` (ex.: RedirectIndividualizado). Inconsistência conceitual.
- **Recomendação:** Em `userTypes`, fazer admin retornar `/app/admin` para alinhar à entrada real do admin.

---

## 4. Detalhes que atrapalham (menores)

### 4.1 Console.log em produção

- **SmartDashboardRedirect** e **RedirectIndividualizado** usam `console.log`/`console.warn` para debug.
- **Efeito:** Poluição do console em produção e possível vazamento de informação (tipo de usuário, redirecionamentos).
- **Recomendação:** Remover ou envolver em `if (import.meta.env.DEV)`.

### 4.2 Paywall: rota `/app/pagamento` removida da allow-list

- **PaymentGuard** permitia `/app/pagamento`, mas em **App.tsx** não existe rota `pagamento`; existem `checkout` e `subscription-plans`.
- **Correção:** Já ajustado na allow-list atual; manter apenas rotas que existem (`/app/checkout`, `/app/subscription-plans`, `/app/profile`, `/termos-lgpd`).

---

## 5. Resumo prioritário

| Prioridade | Item | Impacto |
|------------|------|--------|
| **Alta** | Paywall redirecionando para `/checkout` (404) | **Corrigido:** redirect e allow-list em `/app/checkout` etc. |
| **Média** | Duas telas “agenda” para paciente (agenda vs agendamentos) | Confusão e possível uso da tela mock em vez da real |
| **Média** | Sidebar paciente com URLs legadas | Links e breadcrumbs inconsistentes |
| **Média** | Muitas rotas legadas sem redirect para canônicas | Múltiplas URLs para a mesma página |
| **Baixa** | RedirectIndividualizado não usado / admin default em userTypes | Código morto e inconsistência se reativado |
| **Baixa** | Console.log em redirects | Ruído e possível vazamento em produção |
| **Baixa** | Admin sub-routes viram ?tab= | Bookmark ainda funciona; apenas UX de URL |

---

## 6. Referências (código e docs)

- **Rotas:** `src/App.tsx` (inventário completo na Part I, seção F).
- **Layout e Sidebar:** `src/components/Layout.tsx`, `Sidebar.tsx`, `Header.tsx`.
- **Paywall:** `src/components/PaymentGuard.tsx`.
- **Rotas por eixo/tipo:** `src/lib/rotasIndividualizadas.ts`, `src/lib/userTypes.ts`.
- **Redirect inicial:** `src/components/SmartDashboardRedirect.tsx`; `RedirectIndividualizado.tsx` (importado mas não usado).
- **Doc agendar vs agendamento:** `docs/CHAT_PACIENTE_VS_PROFISSIONAL_E_TESTE_ADMIN.md`.
- **Entendimento tecnológico completo (stack, Core, COS, rotas, documentação):** Part I deste documento (seções A–H).  
- **Decisão de arquitetura e consolidação (visão arquiteto):** `DECISAO_ARQUITETURA_CONSOLIDACAO_2026.md`.  
- **Contrato de rotas canônicas:** `DECISAO_SELADA_ROTAS_CANONICAS_V1.md`.  
- **Roadmap 90 dias (consolidação):** `ROADMAP_CONSOLIDACAO_90_DIAS.md`.
