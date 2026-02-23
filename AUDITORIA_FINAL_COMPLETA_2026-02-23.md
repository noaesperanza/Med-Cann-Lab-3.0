# 🔍 AUDITORIA FINAL COMPLETA — MedCannLab 3.0 (Nôa Esperanza)
## Data: 23/02/2026 | Auditor: Antigravity AI
## Escopo: Frontend + Supabase | Acesso ao banco via CLI token
## Projeto: `itdjkfubfzmvmuxxjoae` — Nôa Esperanza Med Cann Lab

---

# 📋 RESUMO EXECUTIVO

## Nota Final

| Domínio | Nota | Peso | Ponderada |
|---|:---:|:---:|:---:|
| **Frontend** (13 blocos) | **3.65** | 60% | 2.19 |
| **Supabase** (banco + segurança) | **3.9** | 40% | 1.56 |
| **NOTA FINAL GERAL** | | **100%** | **3.75 / 10** |

## Veredicto

> ⚠️ **NÃO ESTÁ PRONTO PARA PRODUÇÃO COM DADOS SENSÍVEIS (LGPD).**
>
> O sistema possui funcionalidades ricas e está operacional em ambiente de desenvolvimento, mas apresenta:
> - **Segurança insuficiente**: dados clínicos acessíveis por qualquer usuário autenticado (RLS aberto), chaves reais expostas
> - **Débito técnico estrutural**: 16 arquivos >60 KB, Supabase espalhado em 50+ componentes
> - **Testabilidade ~5%**: 2 unit tests para ~150 arquivos
> - **Duplicação sistêmica**: tabelas, componentes, e lógica duplicados em múltiplos lugares

## Scorecard por Área

| # | Área | Nota (0-10) | Severidade |
|:---:|---|:---:|:---:|
| 1 | Estrutura de Pastas | **4.0** | 🟠 |
| 2 | Fluxo de Dados | **3.0** | 🔴 |
| 3 | Gestão de Estado | **5.0** | 🟡 |
| 4 | Complexidade dos Componentes | **2.5** | 🔴 |
| 5 | Dependências | **5.5** | 🟡 |
| 6 | Organização da IA (Nôa) | **4.0** | 🟠 |
| 7 | Rotas & RBAC | **5.0** | 🟡 |
| 8 | Tratamento de Erros | **3.5** | 🟠 |
| 9 | Performance & Re-render | **4.0** | 🟠 |
| 10 | Testabilidade | **1.5** | 🔴 |
| 11 | Tipagem (TypeScript) | **3.0** | 🔴 |
| 12 | Segurança no Frontend | **3.0** | 🔴 |
| 13 | Maturidade do Código | **3.5** | 🟠 |
| 14 | Schema & Tabelas (Supabase) | **3.5** | 🟠 |
| 15 | RLS & Segurança (Supabase) | **3.0** | 🔴 |
| 16 | Index & Performance (Supabase) | **4.0** | 🟠 |
| 17 | Migration Strategy (Supabase) | **2.5** | 🔴 |
| 18 | Edge Functions (Supabase) | **5.0** | 🟡 |
| 19 | Higiene de Dados (Supabase) | **3.0** | 🔴 |

---

# PARTE I — AUDITORIA DO FRONTEND

---

# 1️⃣ ESTRUTURA DE PASTAS (Arquitetura Macro) — Nota: 4.0/10

## Estrutura atual:
```
src/
├── App.tsx .................. 366 linhas (21 KB) — arquivo de rotas monolítico
├── components/ .............. 78 arquivos + 2 subdiretórios
├── pages/ ................... 73 arquivos (0 subdiretórios)
├── lib/ ..................... 34 arquivos + 2 subdiretórios
├── services/ ................ 9 arquivos
├── hooks/ ................... 10 arquivos
├── contexts/ ................ 9 arquivos
├── types/ ................... 2 arquivos
├── utils/ ................... 1 arquivo
├── integrations/ ............ supabase client
├── locales/ ................. 2 arquivos
├── constants/ ............... 2 arquivos
├── styles/ .................. 1 arquivo
└── scripts/ ................. 1 arquivo
```

## ✅ O que vai bem:
- Separação básica components/pages/hooks/services existe
- `lib/clinicalGovernance/` tem subpastas organizadas (core, types, utils, learning)
- `lib/medcannlab/` tem boa estrutura (apiClient, errors, types, __tests__)
- `integrations/supabase/client.ts` centraliza a instância Supabase

## 🚨 Problemas CRÍTICOS:

### Sem separação por domínio
- `components/` tem **78 arquivos soltos**. Não há separação entre domínios:
  - Chat, Scheduling, Clinical, Noa, UI, Dashboard — tudo misturado no mesmo nível
  - Exemplo: `EduardoScheduling.tsx`, `NoaConversationalInterface.tsx`, `VideoCall.tsx`, `RenalFunctionModule.tsx` — no mesmo diretório

### Mistura UI + regra de negócio
- Componentes contêm regra de negócio pesada (ex.: `NoaConversationalInterface.tsx` com **129 KB**)
- `RicardoValencaDashboard.tsx` com **231 KB** — é o maior arquivo do projeto e mistura UI com lógica

### Arquivos Frankenstein (>20 KB)
| Arquivo | Tamanho | Linhas estimadas |
|---|:---:|:---:|
| `pages/RicardoValencaDashboard.tsx` | **231 KB** | ~5.000+ |
| `pages/PatientDashboard.tsx` | **133 KB** | ~3.000+ |
| `pages/ChatGlobal.tsx` | **110 KB** | ~2.500+ |
| `pages/AlunoDashboard.tsx` | **96 KB** | ~2.000+ |
| `pages/PatientsManagement.tsx` | **86 KB** | ~1.800+ |
| `pages/Library.tsx` | **83 KB** | ~1.700+ |
| `pages/PatientAppointments.tsx` | **81 KB** | ~1.600+ |
| `components/NoaConversationalInterface.tsx` | **129 KB** | ~3.000+ |
| `pages/ArteEntrevistaClinica.tsx` | **76 KB** | ~1.600+ |
| `lib/noaResidentAI.ts` | **74 KB** | ~1.826 |
| `pages/EduardoFaveretDashboard.tsx` | **70 KB** | ~1.500+ |
| `pages/NewPatientForm.tsx` | **71 KB** | ~1.500+ |
| `pages/ProfessionalMyDashboard.tsx` | **69 KB** | ~1.500+ |
| `pages/ProfessionalScheduling.tsx` | **62 KB** | ~1.300+ |
| `pages/PatientDoctorChat.tsx` | **64 KB** | ~1.300+ |
| `components/PatientAnalytics.tsx` | **70 KB** | ~1.500+ |

> **16 arquivos com >60 KB.** Indicador severo de débito técnico estrutural.

### Pasta raiz poluída
- 15 arquivos `.md` de documentação na raiz do projeto
- Arquivos como `ultimoschamao.txt` (84 KB), `schema_dump.ts` (288 KB) soltos
- Pasta `archive/` com 18 itens
- Pasta `database/` com **319 itens** — cresceu caoticamente
- Pasta `docs/` com **386 itens**
- Pasta `scripts/` com **69 itens**

## 🎯 Diagnóstico:
> **A arquitetura NÃO conta uma história clara. Cresceu caoticamente.**

---

# 2️⃣ FLUXO DE DADOS (Data Flow) — Nota: 3.0/10

## Padrão esperado (saudável):
```
Component → Hook → Service → Supabase
```

## Padrão real encontrado:
```
Component → Supabase direto   ← PREDOMINANTE (50+ arquivos)
Component → Hook → Supabase   ← Poucos casos
Component → Service → Supabase ← Raro
```

## 🚨 `supabase.from()` espalhado em 50+ arquivos:

### No `src/components/` — **33 arquivos** importam supabase diretamente:
```
AreaAtendimentoEduardo.tsx, ClinicalGovernance/*.tsx, ClinicalReports.tsx,
ClinicalTerminal.tsx, CreatePatientModal.tsx, EduardoScheduling.tsx,
ExamRequestModule.tsx, GestaoCursos.tsx, IncentivosPanel.tsx,
IntegrativePrescriptions.tsx, KPIClinicosPersonalizados.tsx, KPIDashboard.tsx,
LoginDebugPanel.tsx, MedicalRecord.tsx, MedicalWorkstation.tsx,
NeurologiaPediatrica.tsx, NoaAnimatedAvatar.tsx, NoaConversationalInterface.tsx,
PatientAnalytics.tsx, PatientFocusView.tsx, PatientHealthHistory.tsx,
PatientImportModal.tsx, QuickPrescriptions.tsx, RenalFunctionModule.tsx,
ResearchDashboardContent.tsx, RicardoScheduling.tsx, RiskCockpit.tsx,
ShareReportModal.tsx, SlidePlayer.tsx, VideoCall.tsx, VideoCallScheduler.tsx,
WearableMonitoring.tsx
```

### No `src/pages/` — praticamente TODOS importam supabase diretamente

### Nos `src/services/` — **9 arquivos** (caminho correto, mas subutilizado):
```
chatEvolutionService.ts, criticalDocumentsManager.ts, emailService.ts,
knowledgeBaseIntegration.ts, noaKnowledgeBase.ts(DUPLICADO com lib/),
notificationService.ts, rationalityAnalysisService.ts, semanticSearch.ts,
videoCallRequestService.ts
```

## 🚨 Consequências:
- **Impossível trocar backend** — Supabase está hardwired em 50+ arquivos
- **Impossível testar componentes isoladamente** — dependem do client Supabase real
- **Manutenção futura difícil** — qualquer mudança no schema exige caçar chamadas espalhadas

## 🎯 Diagnóstico:
> **Fluxo caótico. Supabase espalhado em 50+ arquivos. Não há camada de abstração real.**

---

# 3️⃣ GESTÃO DE ESTADO — Nota: 5.0/10

## 9 Contexts:
| Context | Tamanho | Responsabilidade |
|---|:---:|---|
| `AuthContext.tsx` | 11.9 KB | Auth + user data + trial |
| `NoaContext.tsx` | 4.9 KB | Chat com IA Nôa |
| `NoaPlatformContext.tsx` | 1.7 KB | Abertura/fechamento do chat global |
| `RealtimeContext.tsx` | 8.2 KB | Subscriptions realtime |
| `ToastContext.tsx` | 5.5 KB | Notificações |
| `ConfirmContext.tsx` | 9.1 KB | Modal de confirmação |
| `UserViewContext.tsx` | 3.1 KB | "Visualizar como" admin |
| `DashboardTriggersContext.tsx` | 4.2 KB | Triggers do dashboard |
| `ClinicalGovernanceContext.tsx` | 2.0 KB | Governança clínica |

## ✅ O que vai bem:
- Responsabilidades dos contexts são relativamente claras
- `AuthContext` usa fonte de verdade correta (RPC `get_my_primary_role`)
- `NoaPlatformContext` é leve e focado

## ⚠️ Problemas:
- **NoaContext + NoaPlatformContext**: sobreposição — ambos gerenciam estado da Nôa
- **8 providers aninhados** no `App.tsx`:
  ```jsx
  <AuthProvider>
    <UserViewProvider>
      <ToastProvider>
        <ConfirmProvider>
          <NoaProvider>
            <NoaPlatformProvider>
              <RealtimeProvider>
                <ClinicalGovernanceProvider>
  ```
  - Qualquer re-render no topo cascateia para todos os filhos
- **Estado local excessivo** nos dashboards — `RicardoValencaDashboard.tsx` provavelmente tem 30+ `useState`

---

# 4️⃣ COMPLEXIDADE DOS COMPONENTES — Nota: 2.5/10

## 🚨 Arquivos CRÍTICOS (Frankenstein):

| Arquivo | Tamanho | Severidade |
|---|:---:|:---:|
| `RicardoValencaDashboard.tsx` | **231 KB** | 🔴 EXTREMO |
| `PatientDashboard.tsx` | **133 KB** | 🔴 EXTREMO |
| `NoaConversationalInterface.tsx` | **129 KB** | 🔴 EXTREMO |
| `ChatGlobal.tsx` | **110 KB** | 🔴 EXTREMO |
| `AlunoDashboard.tsx` | **96 KB** | 🔴 EXTREMO |
| `PatientsManagement.tsx` | **86 KB** | 🔴 CRÍTICO |
| `Library.tsx` | **83 KB** | 🔴 CRÍTICO |
| `LessonPreparation.tsx` | **78 KB** | 🔴 CRÍTICO |
| `ArteEntrevistaClinica.tsx` | **76 KB** | 🔴 CRÍTICO |
| `noaResidentAI.ts` | **74 KB** (1826 linhas) | 🔴 CRÍTICO |
| `NewPatientForm.tsx` | **71 KB** | 🔴 CRÍTICO |
| `PatientAnalytics.tsx` | **70 KB** | 🔴 CRÍTICO |

### `RicardoValencaDashboard.tsx` — 231 KB:
- Provável >5.000 linhas
- Usa `useMemo` em 8+ instâncias
- Provavelmente 20+ `useEffect`, 30+ `useState`
- **Um único arquivo .tsx maior que muitos projetos inteiros**
- Impossível de debugar, manter e testar

### `noaResidentAI.ts` — 1.826 linhas:
- Classe monolítica com: processamento de mensagens, detecção de intenção, avaliação IMRE, RAG, geração de relatórios, interação com Assistant API
- Prompt do sistema embutido inline (linhas 139-174)
- Emails hardcoded para lógica condicional (linhas 546-552): `eduardoscfaveret@gmail.com`, `rrvalenca@gmail.com`

## 🎯 Diagnóstico:
> **Débito técnico estrutural máximo. 12+ arquivos com >60 KB. RicardoValencaDashboard.tsx é um antipadrão extremo.**

---

# 5️⃣ DEPENDÊNCIAS — Nota: 5.5/10

### ✅ Dependências coerentes:
- React 18.2 + Vite 7 + TypeScript 5.2 — boas
- react-router-dom, date-fns, framer-motion — padrão
- lucide-react para ícones — OK
- i18next para internacionalização — bom

### 🔴 Dependências server-side NO BUNDLE FRONTEND (GRAVE):
| Dependência | Problema |
|---|---|
| `express` (5.2.1) + `cors` | Framework de servidor no bundle cliente |
| `openai` (6.16.0) | SDK server-side — risco de expor API key |
| `stripe` (20.3.1) | Deveria usar `@stripe/stripe-js` (client) |
| `resend` (6.9.2) | SDK de email (server-side only) |
| `dotenv` (17.2.3) | Vite usa `import.meta.env` |
| `@xenova/transformers` (2.17.2) | SDK de ML pesada (~300 MB) no browser |

> Esses pacotes inflam o bundle, podem expor secrets, e indicam que lógica server-side está rodando no cliente.

### ⚠️ Backup file solto:
- `NewPatientForm.tsx.backup` — arquivo backup commitado no projeto

---

# 6️⃣ ORGANIZAÇÃO DA IA (Nôa) — Nota: 4.0/10

## Estrutura real:
```
lib/
├── noaResidentAI.ts ................ 74 KB — Core monolítico
├── noaAssistantIntegration.ts ...... 16 KB — Integração OpenAI
├── noaCommandSystem.ts ............. 10 KB — Comandos
├── noaEngine.ts .................... 3.9 KB — Engine base
├── noaEsperancaCore.ts ............. 10 KB — Core da Nôa
├── noaIntegration.ts ............... 15 KB — Integração
├── noaKnowledgeBase.ts ............. 11 KB — Knowledge Base
├── noaPermissionManager.ts ......... 8.3 KB — Permissões
├── noaTrainingSystem.ts ............ 18 KB — Treinamento
├── platformFunctionsModule.ts ...... 29 KB — Funções da plataforma
├── ragSystem.ts .................... 12 KB — RAG
├── clinicalAssessmentFlow.ts ....... 23 KB — Fluxo AEC

services/
├── noaKnowledgeBase.ts ⚠️ ......... 6 KB — DUPLICADO com lib/
├── knowledgeBaseIntegration.ts ..... 14 KB
├── semanticSearch.ts ............... 7.5 KB

hooks/
├── useMedCannLabConversation.ts .... 43 KB — Hook monolítico

components/
├── NoaConversationalInterface.tsx .. 129 KB — UI monolítica
├── NoaAnimatedAvatar.tsx, NoaAvatar.tsx, NOAChatBox.tsx, etc.
```

## Estrutura IDEAL (recomendada):
```
noa/
├── core/           → noaResidentAI, engine, esperancaCore
├── memory/         → memoryManager
├── rag/            → ragSystem, knowledgeBase, semanticSearch
├── permissions/    → permissionManager
├── prompts/        → systemPrompts (extraídos)
├── assessment/     → clinicalAssessmentFlow
├── commands/       → commandSystem
├── training/       → trainingSystem
└── ui/             → NoaConversationalInterface/ (quebrado em subcomponentes)
```

## 🚨 Problemas:
1. **Duplicação**: `lib/noaKnowledgeBase.ts` (11 KB) vs `services/noaKnowledgeBase.ts` (6 KB)
2. **Prompt hardcoded inline**: System prompt com 35+ linhas dentro do constructor
3. **Emails hardcoded na lógica**: `eduardoscfaveret@gmail.com`, `rrvalenca@gmail.com` usados para branching
4. **Acoplamento forte com UI**: processamento de IA, RAG e renderização no mesmo componente
5. **`useMedCannLabConversation.ts` com 43 KB** — Hook monolítico
6. **Sem versionamento de modelo** — parâmetros de IA (temperature, maxTokens) hardcoded

---

# 7️⃣ ROTAS & PROTEÇÃO — Nota: 5.0/10

## Estrutura:
- **~90 rotas** definidas em `App.tsx` (366 linhas)
- `ProtectedRoute` existe e funciona com `requiredRole`
- Admin tem bypass (sempre acessa tudo)
- Normalização de tipos PT/EN (`normalizeUserType`)

## 🚨 Rotas SEM proteção (~23 rotas):
```
/app/courses, /app/study-area, /app/library, /app/chat,
/app/forum, /app/gamificacao, /app/profile, /app/evaluations,
/app/reports, /app/ai-documents, /app/scheduling, /app/prescriptions,
/app/patients, /app/new-patient, /app/subscription-plans, /app/checkout,
/app/patient-financial, /app/lesson-prep, /app/professional-financial,
/app/test, /app/drc-monitoring-schedule,
/app/clinica/profissional/pacientes,  ⚠️
/app/clinica/profissional/relatorios  ⚠️
```

### Rotas duplicadas/legadas:
- `/app/patient-dashboard` e `/app/clinica/paciente/dashboard` — mesmo componente
- Seção inteira de "Rotas Legadas" duplicando rotas estruturadas

### RBAC frontend-only:
- Proteção por role feita **somente no frontend** via `ProtectedRoute`
- Sem validação server-side completa (RLS compensa parcialmente)

---

# 8️⃣ TRATAMENTO DE ERROS — Nota: 3.5/10

### Padrão predominante:
```typescript
} catch (error) {
  console.error('Erro:', error)  // log e segue
}
```

- `console.error` em **50+ arquivos no src/**
- `console.log` em **73+ arquivos** com logs de debug (emojis: ✅❌⚠️🤖📊)
- Toast genérico — muitos erros apenas logados no console
- **Sem logging estruturado** (Sentry, LogRocket, etc.)
- Em sistema clínico, **erros silenciosos são perigosos**

### ✅ Exceção positiva:
- `AuthContext` tem tratamento robusto de refresh token

---

# 9️⃣ PERFORMANCE & RE-RENDER — Nota: 4.0/10

### ✅ O que vai bem:
- 85+ ocorrências de `useMemo` em componentes/pages
- Filtros e listas memorizados corretamente em vários casos

### ⚠️ Problemas:
- **8 Providers aninhados** — mudança em `AuthContext` re-renderiza a árvore inteira
- **Componentes gigantes** — qualquer `setState` em `RicardoValencaDashboard.tsx` (231 KB) re-renderiza ~5000 linhas de JSX
- **Sem biblioteca de cache** — não usa React Query/SWR/TanStack Query
- **Queries no `useEffect`** — ~20 componentes fazem queries Supabase sem cache, repetidas em cada re-render/navegação

---

# 🔟 TESTABILIDADE — Nota: 1.5/10

### Testes existentes:
- 2 unit tests em `src/lib/medcannlab/__tests__/` (apiClient.test.ts, nlp.test.ts)
- 4 E2E tests em `tests/e2e/` (Playwright)
- Vitest configurado no devDependencies

### Total estimado: **~5% de cobertura** (otimista)

### 🚨 Problemas:
1. **2 unit tests** para ~150 arquivos
2. Componentes dependem diretamente do Supabase — impossível mockar
3. Sem camada de abstração (services subutilizados)
4. **Nenhum teste para a IA** (noaResidentAI.ts — lógica crítica)
5. **Nenhum teste para rotas/RBAC**
6. **O código foi escrito para funcionar, NÃO para ser testado**

---

# 1️⃣1️⃣ TIPAGEM (TypeScript) — Nota: 3.0/10

### `: any` e `as any` encontrado em **50+ arquivos** cada:
- `AuthContext.tsx`: `user_metadata?: any`, `loadUser = async (authUser: any)`
- `noaResidentAI.ts`: `conversationContext: any[]`, `platformData?: any`, `metadata?: any`
- Maioria dos services: `error: any`, `data: any`

### Problemas:
1. `src/types/` tem apenas 2 arquivos (`global.d.ts` com 682 bytes, `lucide-react.d.ts`)
2. Sem DTOs definidos para dados do Supabase
3. Tipos repetidos — interfaces como User definidas localmente em múltiplos arquivos
4. Sem validação runtime (sem zod/yup)

---

# 1️⃣2️⃣ SEGURANÇA NO FRONTEND — Nota: 3.0/10

## 🔴 PROBLEMAS CRÍTICOS:

### 1. Supabase anon key hardcoded:
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://itdjkfubfzmvmuxxjoae.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1Ni..."
```
Deveria usar `import.meta.env.VITE_SUPABASE_URL`

### 2. Service Role Key REAL no `.env.example`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```
`.env.example` contém a chave REAL — se o repo for público, **toda a segurança do Supabase está comprometida**

### 3. OpenAI API Key no frontend:
```typescript
// noaAssistantIntegration.ts
apiKey: config.apiKey || (import.meta as any).env?.VITE_OPENAI_API_KEY || ''
```
API key com prefixo `VITE_` = **exposta no bundle do cliente** via source maps

### 4. Emails hardcoded para lógica condicional:
```typescript
if (userEmail === 'eduardoscfaveret@gmail.com') { ... }
if (userEmail === 'rrvalenca@gmail.com') { ... }
```

### 5. SDKs server-side no bundle:
`openai`, `stripe`, `resend`, `express` — pacotes server-side incluídos no frontend

---

# 1️⃣3️⃣ SINAIS DE MATURIDADE — Nota: 3.5/10

## ❌ Sinais de código crescido rápido:
- **16 arquivos > 60 KB**, com RicardoValencaDashboard.tsx de 231 KB
- Padrões inconsistentes (PascalCase vs camelCase, PT vs EN)
- `.backup` file commitado
- `noaKnowledgeBase.ts` duplicado entre `lib/` e `services/`
- Dashboards duplicados por profissional (Ricardo, Eduardo, Professional)
- **38 TODOs** esquecidos

## ✅ Sinais de maturidade:
- Nomeação em português consistente para domínio
- `AuthContext` com tratamento robusto
- `lib/medcannlab/` bem organizado
- `clinicalGovernance/` com subpastas lógicas
- Playwright e Vitest configurados

---

# PARTE II — AUDITORIA DO SUPABASE

---

# 1️⃣4️⃣ SCHEMA & TABELAS — Nota: 3.5/10

## Métricas do banco:
| Métrica | Valor | Status |
|---|:---:|:---:|
| **Tamanho total do DB** | 41 MB | ✅ Pequeno |
| **Total de tabelas** | ~115 | ⚠️ Muitas para o estágio |
| **Tamanho dos índices** | 6.912 KB | ✅ Adequado |
| **WAL Size** | 112 MB | ⚠️ 2.7x o DB |
| **Região** | East US (N. Virginia) | 🔴 Deveria ser São Paulo |

## Inventário completo (~115 tabelas):

### 🏥 Tabelas Clínicas (Core)
| Tabela | Tamanho | Linhas | RLS |
|---|:---:|:---:|:---:|
| `users` | **448 KB** | ~1.000+ | ✅ |
| `user_profiles` | **312 KB** | ~500+ | ✅ |
| `appointments` | **160 KB** | ~300+ | ✅ |
| `clinical_reports` | 8 KB | ~50 | ✅ |
| `clinical_assessments` | 0 bytes | 0 | ✅ |
| `ai_assessment_scores` | 0 bytes | 0 | ✅ |
| `imre_assessments` | 0 bytes | 0 | ❓ |
| `patient_medical_records` | ~16 KB | ~50+ | ✅ |
| `patient_prescriptions` | 8 KB | ~25 | ✅ |
| `patient_therapeutic_plans` | 32 KB | 0 | ❓ |
| `patient_conditions` | 24 KB | 0 | ❓ |
| `patient_lab_results` | 24 KB | ~18 | ✅ |
| `patient_exam_requests` | 48 KB | ~12 | ✅ |
| `prescriptions` | 32 KB | ~57 | ✅ |
| `renal_exams` | 16 KB | 0 | ❓ |
| `avaliacoes_renais` | 16 KB | ~14 | ✅ |
| `pacientes` | 24 KB | 0 | ✅ |
| `medical_certificates` | 32 KB | ~4 | ❓ |

### 💬 Chat & Comunicação
| Tabela | Tamanho | Linhas | RLS |
|---|:---:|:---:|:---:|
| `private_chats` | 40 KB | ~3.579 | ⚠️ |
| `private_messages` | 32 KB | ~3.629 | ⚠️ |
| `chat_rooms` | **168 KB** | ~1.000+ | ✅ |
| `global_chat_messages` | 64 KB | ~500+ | ✅ |
| `chat_participants` | 0 bytes | 0 | ❓ |
| `chat_messages` | 0 bytes | 0 | ❓ |
| `channels` | 32 KB | ~200 | ✅ |
| `messages` | 16 KB | 0 | ❓ |

### 🤖 IA & Nôa
| Tabela | Tamanho | Linhas | RLS |
|---|:---:|:---:|:---:|
| `documents` | **240 KB** | ~1.000+ | ✅ |
| `ai_chat_interactions` | ~16 KB | ~50+ | ✅ |
| `ai_saved_documents` | 40 KB | ~135 | ✅ |
| `ai_chat_history` | 40 KB | ~15 | ❓ |
| `noa_articles` | 32 KB | ~2 | ✅ |
| `noa_memories` | 8 KB | ~3 | ✅ |
| `semantic_analysis` | 32 KB | ~204 | ✅ |
| `interacoes_ia` | 32 KB | 0 | ✅ |

### 📚 Educação
| Tabela | Tamanho | Linhas | RLS |
|---|:---:|:---:|:---:|
| `courses` | **136 KB** | ~500+ | ✅ |
| `lesson_content` | **136 KB** | ~500+ | ✅ |
| `lessons` | 48 KB | ~16 | ✅ |
| `modules` | 32 KB | ~14 | ✅ |

### 📅 Agendamento
| Tabela | Tamanho | Linhas | RLS |
|---|:---:|:---:|:---:|
| `professional_availability` | 32 KB | ~11 | ✅ |
| `scheduling_audit_log` | 32 KB | ~1 | ✅ |
| `video_clinical_snippets` | 48 KB | ~7 | ✅ |

### 💰 Financeiro
| Tabela | Tamanho | Linhas | RLS |
|---|:---:|:---:|:---:|
| `transactions` | **120 KB** | ~600+ | ✅ |
| `user_subscriptions` | ~8 KB | ~2 | ✅ |

### 🏗️ Sistema
| Tabela | Tamanho | Linhas | RLS |
|---|:---:|:---:|:---:|
| `feature_flags` | 32 KB | ~204 | ✅ |
| `platform_params` | 32 KB | 0 | ✅ |
| `role_catalog` | 32 KB | ~76 | ✅ |
| `kpi_daily_snapshots` | 32 KB | ~47 | ✅ |
| `profiles` | 48 KB | **11.153** | ⚠️ Alto |

### 🔴 ~30 Tabelas VAZIAS (0 registros):
```
clinical_assessments, ai_assessment_scores, chat_participants,
chat_messages, imre_assessments, notifications, video_call_requests,
cognitive_metabolism, cognitive_decisions, cognitive_policies,
time_blocks, patient_conditions, course_modules, user_courses,
gamification_points, user_achievements, wearable_devices, wearable_data,
patient_therapeutic_plans, forum_comments, analytics, dev_vivo_sessions,
dev_vivo_audit, news, chat_sessions, messages, renal_exams,
user_statistics, patient_insights
```
> Funcionalidades planejadas mas nunca implementadas, ou frontend usando tabelas diferentes.

### 🔴 Tabelas duplicadas:
**Chat** — 3 sistemas coexistem:
- `chat_rooms` + `global_chat_messages` (usado)
- `private_chats` + `private_messages` (legado)
- `chat_sessions` + `chat_messages` + `messages` (vazio)

**Usuários** — 4 tabelas:
- `users` (448 KB) — principal
- `user_profiles` (312 KB) — perfis
- `profiles` (48 KB) — **11.153 registros** (suspeitamente alto)
- `usuarios` (32 KB) — legada

**Naming** — Mistura PT/EN:
- `pacientes` vs `patient_conditions`
- `avaliacoes_renais` vs `renal_exams`
- `interacoes_ia` vs `ai_chat_interactions`

---

# 1️⃣5️⃣ RLS & SEGURANÇA (Supabase) — Nota: 3.0/10

## Visão geral:
- **Tabelas com RLS habilitado**: ~35 (via sprint 1.2 + migrations avulsas)
- **Tabelas SEM RLS verificado**: ~80
- **Função auxiliar**: `public.has_role(auth.uid(), 'role')` — ✅ Boa prática

## 🔴 PROBLEMA CRÍTICO #1 — LGPD:

### "Authenticated read = USING (true)" em tabelas clínicas:
```sql
CREATE POLICY "Authenticated read abertura_exponencial"
  ON public.abertura_exponencial
  FOR SELECT TO authenticated USING (true);
```
Aplicado em: `abertura_exponencial`, `avaliacoes_renais`, `contexto_longitudinal`, `dados_imre_coletados`, `desenvolvimento_indiciario`, `fechamento_consensual`, `interacoes_ia`, `pacientes`, `permissoes_compartilhamento`

**Significa: QUALQUER usuário autenticado (paciente, aluno, profissional) pode LER TODOS os registros clínicos de TODOS os pacientes via API direta.**

> 🔴 **VIOLAÇÃO de LGPD** — dados de saúde são categoria especial (Art. 11). Paciente A pode ver dados de Paciente B.

## 🔴 PROBLEMA CRÍTICO #2 — ~80 tabelas SEM RLS:
Tabelas sensíveis provavelmente sem RLS:
- `patient_therapeutic_plans`, `patient_conditions`, `patient_insights`
- `ai_chat_history`, `noa_clinical_cases`
- `private_chats` (3.579 reg), `private_messages` (3.629 reg)
- `cognitive_decisions`, `cognitive_metabolism`

## ⚠️ Sem DELETE policies em tabelas clínicas:
- Nenhuma tabela clínica tem policy de DELETE
- Se o paciente pedir exclusão de dados (LGPD Art. 18), não há mecanismo

## ✅ O que vai bem:
- `has_role()` centraliza verificação de permissão
- Tabelas de sistema/config têm RLS adequado (admin-only write)
- Tabelas sociais (debates, friendships) têm policies com owner check

---

# 1️⃣6️⃣ INDEX & PERFORMANCE — Nota: 4.0/10

## ✅ Cache = 100%:
```
Index Hit Rate: 1.00  |  Table Hit Rate: 1.00
```
DB pequeno, cabe inteiro na memória.

## 🚨 Índices duplicados (~16):

### `clinical_assessments` — 8 índices duplicados (tabela VAZIA):
```
idx_clinical_assessments_doctor      ← TRIPLO
idx_clinical_assessments_doctor_id   ← TRIPLO
idx_clinical_doctor_id               ← TRIPLO
idx_clinical_assessments_patient     ← TRIPLO
idx_clinical_assessments_patient_id  ← TRIPLO
idx_clinical_patient_id              ← TRIPLO
idx_clinical_assessments_created     ← DUPLO
idx_clinical_assessments_created_at  ← DUPLO
idx_clinical_assessments_status      ← DUPLO
idx_clinical_status                  ← DUPLO
```

### `ai_chat_interactions` — 8 índices duplicados:
```
idx_ai_chat_created, idx_ai_chat_created_at, idx_ai_chat_interactions_created_at ← TRIPLO
idx_ai_chat_user, idx_ai_chat_user_id, idx_ai_chat_interactions_user_id ← TRIPLO
```

### 50+ índices com 0% de uso
Sinal de migrations acumulativas sem cleanup.

## ⚠️ Bloat moderado:
- `users` table: 3.1 bloat ratio
- `user_profiles`: 2.4
- Para 41 MB não é urgente, mas indica falta de VACUUM

## ⚠️ WAL Size = 112 MB (2.7x o DB):
Pode indicar replication lag. Long-running query = replication slot do Realtime (normal).

## 🔴 Região errada:
- Supabase: **East US (N. Virginia)** — ~120-180ms latência para Brasil
- Os outros 3 projetos da conta estão em **South America (São Paulo)**

---

# 1️⃣7️⃣ MIGRATION STRATEGY — Nota: 2.5/10

## Estrutura:
- `supabase/migrations/` — **25 arquivos** (sistema oficial)
- `database/scripts/` — **~80+ scripts SQL** soltos (fora do sistema)

## 🚨 Scripts fora do controle de versão:
80+ scripts SQL em `database/scripts/` executados manualmente no SQL Editor:
```
SUPABASE_COMPLETO_FINAL.sql
SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql
SUPABASE_CORRECAO_ERROS_400_404.sql
SUPABASE_MVP_FINAL.sql
CORRIGIR_ERROS_SUPABASE.sql
CORRIGIR_ERROS_SUPABASE_SIMPLES.sql
EMERGENCY_FIX_ACDSS_RLS_V2.sql
FIX_CHAT_RLS_RECURSION_CHAT_PARTICIPANTS_2026-02-06.sql
FIX_COMPLETO_RLS_CHAT_E_MEDICAL_RECORDS_2026-02-06.sql
FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql
...
```

> **Padrão: scripts avulsos, sem idempotência, sem rollback, executados manualmente no SQL Editor.**

## ⚠️ Sem rollback strategy:
- Nenhuma migration tem `DOWN` ou `ROLLBACK`

## ⚠️ Naming inconsistente:
- Descritivas: `20260219150000_fix_rls_delete.sql`
- UUID: `20260219004651_cb174291-a170-4fc8-8a55-b748b4a9ef1d.sql`
- Remote commits vazios: `20251216014748_remote_commit.sql` (0 bytes)

---

# 1️⃣8️⃣ EDGE FUNCTIONS — Nota: 5.0/10

## 7 Edge Functions ativas:
| Nome | Versão | Atualização |
|---|:---:|---|
| `tradevision-core` | v84 | 2026-02-20 |
| `get_chat_history` | v4 | 2026-01-21 |
| `digital-signature` | v9 | 2026-02-20 |
| `video-call-request-notification-` | v21 | 2026-02-07 |
| `video-call-reminders` | v9 | 2026-02-20 |
| `video-call-request-notification` | v6 | 2026-02-20 |
| `extract-document-text` | v2 | 2026-02-20 |

### ⚠️ Problemas:
1. **Duplicada**: `video-call-request-notification-` (com traço) e `video-call-request-notification` (sem traço)
2. **`tradevision-core`** — por que existe em um app médico?
3. **Sem proxy para OpenAI** — API key está no frontend
4. **Sem proxy para Stripe** — SDK server-side no frontend

### Edge Functions no repositório local:
```
supabase/functions/
├── digital-signature/
├── extract-document-text/
├── tradevision-core/          (4 files)
├── video-call-reminders/
└── video-call-request-notification/
```

---

# 1️⃣9️⃣ HIGIENE DE DADOS — Nota: 3.0/10

### ~30 tabelas vazias (nunca usadas)
- Funcionalidades planejadas mas não implementadas
- Inclui tabelas core como `clinical_assessments` (0 registros)

### 3 sistemas de chat coexistindo
- `chat_rooms` + `global_chat_messages` (ativo)
- `private_chats` + `private_messages` (legado com dados)
- `chat_sessions` + `chat_messages` + `messages` (vazio)

### 4 tabelas de "usuários"
- `users`, `user_profiles`, `profiles` (11.153!), `usuarios`

### `profiles` com 11.153 registros:
- Tabela `profiles` tem **11.153 registros** para ~1.000 usuários reais
- Possível trigger de insert automático duplicando registros

### Schema `backup` encontrado:
```
backup.backup_20251110_233423273__public_notifications
backup.backup_20251110_233423273__public_private_chats
```
Backup manual de novembro 2025. Sem automação.

---

# PARTE III — PLANO DE AÇÃO CONSOLIDADO

---

## 🔴 P0 — URGENTE (Fazer HOJE)

| # | Ação | Impacto |
|:---:|---|---|
| 1 | **Remover service role key REAL** do `.env.example` | Se repo público, banco está comprometido |
| 2 | **Corrigir RLS "USING (true)"** em 9 tabelas clínicas | LGPD — pacientes veem dados de outros |
| 3 | **Habilitar RLS** nas ~80 tabelas restantes | Dados expostos via API |
| 4 | **Mover Supabase keys** para `import.meta.env` | Keys hardcoded no source |
| 5 | **Criar edge function proxy** para OpenAI | API key exposta no frontend |

## 🔴 P1 — CRÍTICO (Próximas 2 semanas)

| # | Ação | Impacto |
|:---:|---|---|
| 6 | **Quebrar RicardoValencaDashboard.tsx** (231 KB) em 10-15 componentes | Impossível de manter |
| 7 | **Quebrar PatientDashboard.tsx** (133 KB) e NoaConversationalInterface (129 KB) | Mesma razão |
| 8 | **Criar camada de services** — migrar `supabase.from()` dos 50+ componentes | Impossível de testar/trocar backend |
| 9 | **Remover SDKs server-side** do bundle (express, openai, stripe, resend) | Segurança + bundle inflado |
| 10 | **Mover região** do Supabase para São Paulo | Latência de 120-180ms |
| 11 | **Proteger as ~23 rotas** sem `ProtectedRoute` | Qualquer user acessa tudo |
| 12 | **Remover 16 índices duplicados** | Performance e manutenção |

## 🟠 P2 — IMPORTANTE (Próximo mês)

| # | Ação | Impacto |
|:---:|---|---|
| 13 | **Unificar tabelas de chat** (3 sistemas → 1) | Coerência |
| 14 | **Unificar tabelas de usuário** (4 → 2 max) | Coerência |
| 15 | **Organizar pasta `noa/`** com estrutura hierárquica | Manutenibilidade |
| 16 | **Eliminar duplicação** noaKnowledgeBase.ts | Bugs potenciais |
| 17 | **Extrair prompts** para arquivos separados | Manutenibilidade |
| 18 | **Adicionar Sentry** ou logging estruturado | Visibilidade de erros |
| 19 | **Resolver os 38 TODOs** ou criar issues | Dívida técnica |
| 20 | **Auditar função `has_role()`** — single point of failure | Segurança |
| 21 | **Migrar scripts `database/`** para migrations oficiais | Governança de schema |
| 22 | **Remover emails hardcoded** da lógica (usar roles) | Manutenibilidade |

## 🟡 P3 — QUALIDADE (Médio prazo — 2-3 meses)

| # | Ação | Impacto |
|:---:|---|---|
| 23 | **Adicionar testes** — começar por services e noaResidentAI | Qualidade |
| 24 | **Eliminar `any`** — definir interfaces para todos os dados | Segurança de tipo |
| 25 | **Implementar React Query** para cache de queries Supabase | Performance |
| 26 | **Code splitting** — lazy load dos dashboards pesados | UX |
| 27 | **Limpar pasta raiz** — mover docs, scripts e database | Organização |
| 28 | **Decidir sobre ~30 tabelas vazias** — implementar ou remover | Higiene |
| 29 | **Padronizar naming** de tabelas (PT ou EN, não misto) | Consistência |
| 30 | **Adicionar DELETE policies** para LGPD Art. 18 | Compliance |

---

# PARTE IV — ANÁLISE DE RISCO PARA 5.000 USUÁRIOS

| Risco | Impacto | Probabilidade | Prioridade |
|---|:---:|:---:|:---:|
| RLS aberto — pacientes acessam dados de outros | 🔴 Crítico (LGPD) | 🔴 Certo | P0 |
| Service role key exposta em .env.example | 🔴 Crítico | 🟠 Provável | P0 |
| OpenAI API key exposta no frontend | 🟠 Alto (financeiro) | 🔴 Certo | P0 |
| Bundle inflado (server deps + componentes gigantes) | 🟠 Alto (UX) | 🔴 Certo | P1 |
| Re-renders em dashboards de 5000+ linhas | 🟠 Alto (UX) | 🔴 Certo | P1 |
| Queries repetidas sem cache | 🟡 Médio | 🔴 Certo | P2 |
| Latência 120-180ms (região Virginia) | 🟡 Médio (UX) | 🔴 Certo | P1 |
| Impossibilidade de manter/debugar por nova equipe | 🔴 Alto | 🔴 Certo | P1 |
| Erros silenciosos em contexto clínico | 🔴 Alto (paciente) | 🟠 Provável | P2 |
| Cobertura de testes ~5% | 🟠 Alto (qualidade) | 🔴 Certo | P3 |

---

# PARTE V — DADOS BRUTOS COLETADOS

## Supabase — Dados da conta:
| Projeto | Referência | Região | Criado em |
|---|---|---|---|
| Nôa Esperanza Dev | ljvipsawnzqgftdwwhsx | São Paulo | 2025-09-02 |
| Med Cann Lab com Nôa Esperanza | mtobhgtofxkqcjfpgsuf | São Paulo | 2025-08-19 |
| Plataforma Nôa Esperanza AEC | lhclqebtkyfftkevumix | São Paulo | 2025-08-19 |
| **Nôa Esperanza Med Cann Lab** (ATIVO) | **itdjkfubfzmvmuxxjoae** | **N. Virginia** ⚠️ | 2025-10-22 |

## Long-running queries:
| PID | Duração | Query |
|---|---|---|
| 1346356 | 03:18:57 | `START_REPLICATION SLOT supabase_realtime_messages_replication_slot_v2` |

> Normal — é o sistema Realtime do Supabase.

## Banco — Estatísticas gerais:
```
Database Size: 41 MB
Total Index Size: 6.912 KB
Total Table Size: 7.752 KB
Stats Reset: 125 days ago
Index Hit Rate: 1.00 (100%)
Table Hit Rate: 1.00 (100%)
WAL Size: 112 MB
```

---

# 📏 CONCLUSÃO

## O que FUNCIONA:
1. ✅ App operacional com funcionalidades ricas
2. ✅ Sistema de chat funcional
3. ✅ IA Nôa conversacional integrada
4. ✅ Sistema de autenticação robusto
5. ✅ Edge Functions ativas
6. ✅ RBAC básico implementado
7. ✅ Cache hit rate 100% no banco
8. ✅ Internacionalização configurada

## O que PRECISA de trabalho urgente:
1. 🔴 **Segurança do banco** — RLS aberto + keys expostas
2. 🔴 **Refatoração de componentes gigantes** — 16 arquivos >60 KB
3. 🔴 **Camada de abstração** — Supabase espalhado em 50+ arquivos
4. 🔴 **Testes** — cobertura ~5%
5. 🔴 **Tipagem** — `any` em 50+ arquivos
6. 🔴 **Região do banco** — deveria ser São Paulo

## Estimativa de esforço para produção:
| Nível | Esforço estimado |
|---|---|
| P0 (Segurança urgente) | **1 semana** — 1 dev |
| P1 (Crítico) | **4-6 semanas** — 2 devs |
| P2 (Importante) | **4-8 semanas** — 2 devs |
| P3 (Qualidade) | **8-12 semanas** — 2 devs |
| **Total para produção** | **~4-6 meses** com equipe de 2 devs |

---

*Relatório gerado em 23/02/2026 por Antigravity AI*
*Auditoria completa: 19 áreas analisadas | Frontend (13 blocos) + Supabase (6 blocos)*
*Acesso ao banco via Supabase CLI token*
