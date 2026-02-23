# 🔍 AUDITORIA DE CÓDIGO COMPLETA — MedCannLab 3.0
## Data: 23/02/2026 | Auditor: Antigravity AI | Sem acesso ao Supabase

---

# 📋 RESUMO EXECUTIVO

| Área | Nota (0-10) | Peso | Ponderada |
|---|:---:|:---:|:---:|
| 1. Estrutura de Pastas | **4.0** | 15% | 0.60 |
| 2. Fluxo de Dados | **3.0** | 20% | 0.60 |
| 3. Gestão de Estado | **5.0** | 5% | 0.25 |
| 4. Complexidade dos Componentes | **2.5** | 15% | 0.38 |
| 5. Dependências | **5.5** | 5% | 0.28 |
| 6. Organização da IA (Nôa) | **4.0** | 10% | 0.40 |
| 7. Rotas & RBAC | **5.0** | 10% | 0.50 |
| 8. Tratamento de Erros | **3.5** | 5% | 0.18 |
| 9. Performance & Re-render | **4.0** | 5% | 0.20 |
| 10. Testabilidade | **1.5** | 3% | 0.05 |
| 11. Tipagem (TypeScript) | **3.0** | 3% | 0.09 |
| 12. Segurança no Frontend | **3.0** | 2% | 0.06 |
| 13. Maturidade do Código | **3.5** | 2% | 0.07 |
| **NOTA FINAL PONDERADA** | | **100%** | **3.65 / 10** |

> **Veredicto: ⚠️ NÃO ESTÁ PRONTO PARA PRODUÇÃO.**
> O código funciona, tem funcionalidades ricas, mas sofre de débito técnico estrutural severo. Escalabilidade para 5.000 usuários requer reestruturação significativa.

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

> **16 arquivos com >60 KB.** Isso é um indicador severo de débito técnico estrutural.

### Pasta raiz poluída
- 15 arquivos `.md` de documentação na raiz do projeto (relatórios, diários de bordo, etc.)
- Arquivos como `ultimoschamao.txt` (84 KB), `schema_dump.ts` (288 KB) soltos
- Pasta `archive/` com 18 itens
- Pasta `database/` com **319 itens** — cresceu caoticamente
- Pasta `docs/` com **386 itens**
- Pasta `scripts/` com **69 itens**

## 🎯 Diagnóstico:
> **A arquitetura NÃO conta uma história clara. Parece que cresceu caoticamente.**

---

# 2️⃣ FLUXO DE DADOS (Data Flow) — Nota: 3.0/10

## Padrão esperado (saudável):
```
Component → Hook → Service → Supabase
```

## Padrão real encontrado:
```
Component → Supabase direto   ← PREDOMINANTE
Component → Hook → Supabase   ← Poucos casos
Component → Service → Supabase ← Raro
```

## 🚨 Supabase espalhado por TODO o app:

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

### No `src/pages/` — **praticamente TODOS** importam supabase diretamente
- `supabase.from()` encontrado em **20+ arquivos de pages**

### Nos `src/services/` — **9 arquivos** (caminho correto, mas subutilizado)
- chatEvolutionService.ts
- criticalDocumentsManager.ts
- emailService.ts
- knowledgeBaseIntegration.ts
- noaKnowledgeBase.ts ⚠️ **DUPLICADO** com lib/noaKnowledgeBase.ts
- notificationService.ts
- rationalityAnalysisService.ts
- semanticSearch.ts
- videoCallRequestService.ts

## 🚨 Consequências:
- **Impossível trocar backend** — Supabase está hardwired em 50+ arquivos
- **Impossível testar componentes isoladamente** — dependem do client Supabase real
- **Manutenção futura difícil** — qualquer mudança no schema exige caçar chamadas espalhadas

## ⚠️ Duplicação detectada:
- `src/lib/noaKnowledgeBase.ts` (11 KB) vs `src/services/noaKnowledgeBase.ts` (6 KB)
- Ambos existem, potencialmente com lógica diferente

## 🎯 Diagnóstico:
> **Arquitetura CAÓTICA. Supabase espalhado em 50+ arquivos. Não há camada de abstração real.**

---

# 3️⃣ GESTÃO DE ESTADO — Nota: 5.0/10

## O que existe:

### 9 Contexts:
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
- Uso de Zustand declarado no package.json (mas não encontrei stores explícitos)

## ⚠️ Problemas:
- **NoaContext + NoaPlatformContext**: sobreposição. Ambos gerenciam estado da Nôa.
  - `NoaContext` = lógica de chat completa
  - `NoaPlatformContext` = estado UI do chat
  - Deveria ser unificado ou ter fronteira mais clara
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
  - Especialmente `AuthProvider` e `NoaProvider` — mudanças causam re-render global

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
- Usa `useMemo` em 8+ instâncias (verificado)
- Provavelmente 20+ `useEffect`, 30+ `useState`
- **Um único arquivo .tsx maior que muitos projetos inteiros**
- Impossível de debugar, manter ou testar

### `NoaConversationalInterface.tsx` — 129 KB:
- Interface conversacional acoplada com lógica de processamento de PDF, RAG, digitação
- Mistura UI + comunicação com API + gerenciamento de estado

### `noaResidentAI.ts` — 1826 linhas:
- Classe monolítica com: processamento de mensagens, detecção de intenção, avaliação IMRE, RAG, geração de relatórios, interação com Assistant API
- Prompt do sistema embutido inline (linhas 139-174)
- Emails hardcoded para lógica condicional (linhas 546-552): `eduardoscfaveret@gmail.com`, `rrvalenca@gmail.com`

## 🎯 Diagnóstico:
> **Débito técnico estrutural máximo. 12+ arquivos com >60 KB. RicardoValencaDashboard.tsx é um antipadrão extremo.**

---

# 5️⃣ DEPENDÊNCIAS — Nota: 5.5/10

## Análise do package.json:

### ✅ Dependências coerentes:
- React 18.2 + Vite 7 + TypeScript 5.2 — boas
- react-router-dom, date-fns, framer-motion — padrão
- lucide-react para ícones — OK
- i18next para internacionalização — bom

### ⚠️ Problemas detectados:

| Dependência | Problema |
|---|---|
| `@xenova/transformers` (2.17.2) | SDK de ML pesada (~300 MB). Roda em browser? Performance? |
| `openai` (6.16.0) | SDK server-side incluída no bundle frontend. **Risco de segurança** se API key ficar exposta |
| `express` (5.2.1) + `cors` | Dependências de servidor **no bundle do frontend**. Deveriam estar em `devDependencies` ou projeto separado |
| `dotenv` (17.2.3) | Package server-side no bundle frontend. Vite usa `import.meta.env` |
| `stripe` (20.3.1) | SDK server-side no bundle frontend. Deveria usar `@stripe/stripe-js` |
| `resend` (6.9.2) | SDK de email (server-side) no bundle frontend |
| `web-pki` (2.17.0) | SDK de assinatura digital — OK para frontend |
| `pdfjs-dist` (5.4.394) | OK, mas historicamente problemático com workers |

### 🔴 Dependências server-side no frontend (GRAVE):
```
express, cors, dotenv, resend, stripe, openai
```
Esses pacotes **NÃO deveriam estar no bundle do frontend**. Isso:
- Aumenta drasticamente o tamanho do bundle
- Pode expor secrets via tree-shaking incompleto
- Indica que lógica server-side está rodando no cliente

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
├── noaKnowledgeBase.ts ⚠️ ......... 6 KB — DUPLICADO
├── knowledgeBaseIntegration.ts ..... 14 KB
├── semanticSearch.ts ............... 7.5 KB

hooks/
├── useMedCannLabConversation.ts .... 43 KB — Hook monolítico
├── useNOAChat.ts ................... 5 KB

components/
├── NoaConversationalInterface.tsx .. 129 KB — UI monolítica
├── NoaAnimatedAvatar.tsx ........... 13 KB
├── NoaAvatar.tsx ................... 6.8 KB
├── NoaCapabilities.tsx ............. 5.5 KB
├── NOAChatBox.tsx .................. 8.5 KB
├── NoaPermissions.tsx .............. 7.7 KB
├── NoaEsperancaAvatar.tsx .......... 11 KB
├── ChatAIResident.tsx .............. 11 KB
├── ClinicalAssessmentChat.tsx ...... 13 KB
```

## Estrutura IDEAL (recomendada):
```
noa/
├── core/
│   ├── noaResidentAI.ts
│   ├── noaEngine.ts
│   └── noaEsperancaCore.ts
├── memory/
│   └── memoryManager.ts
├── rag/
│   ├── ragSystem.ts
│   ├── knowledgeBase.ts
│   └── semanticSearch.ts
├── permissions/
│   └── permissionManager.ts
├── prompts/
│   └── systemPrompts.ts
├── assessment/
│   └── clinicalAssessmentFlow.ts
├── commands/
│   └── commandSystem.ts
├── training/
│   └── trainingSystem.ts
└── ui/
    ├── NoaConversationalInterface/
    │   ├── index.tsx
    │   ├── ChatMessage.tsx
    │   ├── InputArea.tsx
    │   └── hooks/
    ├── NoaAvatar/
    └── NoaChatBox/
```

## 🚨 Problemas:
1. **Duplicação**: `lib/noaKnowledgeBase.ts` (11 KB) vs `services/noaKnowledgeBase.ts` (6 KB)
2. **Prompt hardcoded inline**: System prompt com 35+ linhas dentro do constructor de `noaResidentAI.ts`
3. **Emails hardcoded na lógica**: `eduardoscfaveret@gmail.com`, `rrvalenca@gmail.com` usados para branching
4. **Acoplamento forte com UI**: processamento de IA, RAG e renderização no mesmo componente
5. **`useMedCannLabConversation.ts` com 43 KB** — Hook monolítico
6. **Sem versionamento de modelo** — parâmetros de IA (temperature, maxTokens) hardcoded
7. **7 arquivos `noa*` no mesmo diretório** sem organização hierárquica

---

# 7️⃣ ROTAS & PROTEÇÃO — Nota: 5.0/10

## Estrutura de rotas:
- **~90 rotas** definidas em `App.tsx` (366 linhas)
- Usa `react-router-dom` v6 com `<Routes>/<Route>`

## ✅ O que vai bem:
- `ProtectedRoute` existe e funciona com `requiredRole`
- Admin tem bypass (sempre acessa tudo)
- Normalização de tipos PT/EN (`normalizeUserType`)
- Rotas admin consistentemente protegidas (14 rotas com `requiredRole="admin"`)
- Sistema de "visualizar como" para admin (`UserViewContext`)

## ⚠️ Problemas:

### Rotas SEM proteção:
Múltiplas rotas dentro de `/app/*` **não usam ProtectedRoute**:
```
/app/courses                    — Sem proteção
/app/study-area                 — Sem proteção
/app/library                    — Sem proteção
/app/chat                       — Sem proteção
/app/forum                      — Sem proteção
/app/gamificacao                — Sem proteção
/app/profile                    — Sem proteção
/app/evaluations                — Sem proteção
/app/reports                    — Sem proteção
/app/ai-documents               — Sem proteção
/app/scheduling                 — Sem proteção
/app/prescriptions              — Sem proteção
/app/patients                   — Sem proteção
/app/new-patient                — Sem proteção
/app/subscription-plans         — Sem proteção
/app/checkout                   — Sem proteção
/app/patient-financial          — Sem proteção
/app/lesson-prep                — Sem proteção
/app/professional-financial     — Sem proteção
/app/test                       — Sem proteção
/app/drc-monitoring-schedule    — Sem proteção
/app/clinica/profissional/pacientes — Sem proteção ⚠️
/app/clinica/profissional/relatorios — Sem proteção ⚠️
```

> **Se alguém comentar o `ProtectedRoute`, 70%+ das rotas ficam abertas para qualquer tipo de usuário.**

### Rotas duplicadas/legadas:
- `/app/patient-dashboard` e `/app/clinica/paciente/dashboard` — mesmo componente
- `/app/professional-chat` e `/app/clinica/profissional/chat-profissionais` — mesma coisa
- Seção inteira de "Rotas Legadas" que duplica rotas estruturadas

### RBAC frontend-only:
- Proteção por role feita **somente no frontend** via `ProtectedRoute`
- Se o usuário manipular o state ou localStorage, pode acessar rotas restritas
- **Sem validação server-side** (RLS no Supabase pode compensar, mas não visível aqui)

---

# 8️⃣ TRATAMENTO DE ERROS — Nota: 3.5/10

## Padrão encontrado:

### `console.error()` — 131+ arquivos
- `console.error` encontrado em **50+ arquivos no src/**
- A maioria segue o padrão:
```typescript
} catch (error) {
  console.error('Erro:', error)
  // ... e segue a vida
}
```

### `console.log()` — 73+ arquivos com logs de debug
- `console.log` espalhado em **73+ arquivos**
- Inclui emojis para categorizar (✅, ❌, ⚠️, 🤖, 📊), o que é bom para debug mas ruim para produção

### Toast genérico:
- `ToastContext` existe, mas muitos erros são apenas logados no console
- Pacientes e profissionais não veem erros — o app simplesmente "falha silenciosamente"

### ⚠️ Sem logging estruturado:
- Nenhum serviço de logging centralizado (Sentry, LogRocket, etc.)
- Em sistema clínico, **erros silenciosos são perigosos**
- Nenhuma telemetria de erros

### ⚠️ `AuthContext` — bom tratamento de refresh token:
- Detecta erros de refresh token
- Limpa sessão quando inválido
- **Único ponto com tratamento robusto de erro**

---

# 9️⃣ PERFORMANCE & RE-RENDER — Nota: 4.0/10

## ✅ `useMemo` usado em vários arquivos:
- 85+ ocorrências de `useMemo` em componentes/pages
- `RicardoValencaDashboard.tsx` usa 8 `useMemo`
- Filtros e listas memorizados corretamente em vários casos

## ⚠️ Problemas:

### 8 Providers aninhados:
```jsx
<AuthProvider>         ← Qualquer mudança aqui
  <UserViewProvider>   ← re-renderiza TUDO abaixo
    <ToastProvider>
      ...
        <Routes>
```
- Mudança em `AuthContext` (ex.: `isLoading`) re-renderiza a árvore inteira

### Componentes gigantes = re-renders caros:
- `RicardoValencaDashboard.tsx` (231 KB) — qualquer `setState` re-renderiza ~5000 linhas de JSX
- Sem `React.memo`, `useCallback` insuficiente nesses componentes

### `supabase.from()` direto nos componentes:
- ~20 componentes fazem queries dentro de `useEffect`
- **Sem caching** (não usa React Query / SWR / TanStack Query)
- Queries podem ser repetidas em cada re-render ou navegação

### Polling potencial:
- `RealtimeContext` gerencia subscriptions — OK
- Mas sem evidência de debouncing em inputs de busca

---

# 🔟 TESTABILIDADE — Nota: 1.5/10

## Testes existentes:

### Unit tests:
- `src/lib/medcannlab/__tests__/apiClient.test.ts` (2 KB)
- `src/lib/medcannlab/__tests__/nlp.test.ts` (1.3 KB)

### E2E tests:
- `tests/e2e/` (4 arquivos via Playwright)
- Playwright configurado no `playwright.config.ts`

### Vitest configurado:
- `vitest` no devDependencies com coverage v8
- Scripts `test` e `test:watch` no package.json

### Total estimado: **~5% de cobertura** (otimista)

## 🚨 Problemas:
1. **2 unit tests** para um projeto de ~150 arquivos
2. **Componentes dependem diretamente do Supabase** — impossível mockar facilmente
3. **Sem camada de abstração** (services subutilizados) — não há boundary para testes
4. **Nenhum teste para a IA** — lógica crítica (noaResidentAI.ts) sem testes
5. **Nenhum teste para rotas/RBAC** — proteção de rotas sem validação automatizada
6. **O código foi escrito para funcionar, NÃO para ser testado**

---

# 1️⃣1️⃣ CONSISTÊNCIA DE TIPAGEM (TypeScript) — Nota: 3.0/10

## 🚨 Uso de `any`:

### `: any` encontrado em **50+ arquivos**
Exemplos de alto risco:
- `AuthContext.tsx`: `user_metadata?: any`
- `AuthContext.tsx`: `loadUser = async (authUser: any)`
- `noaResidentAI.ts`: `conversationContext: any[]`, `platformData?: any`, `metadata?: any`
- Maioria dos services: `error: any`, `data: any`

### `as any` encontrado em **50+ arquivos**
- Type casting perigoso espalhado em services e componentes
- Usado para contornar erros de tipo ao invés de tipar corretamente

## ⚠️ Problemas:
1. **Tipos globais escassos**: `src/types/` tem apenas 2 arquivos (`global.d.ts` com 682 bytes, `lucide-react.d.ts`)
2. **Sem DTOs definidos** para dados do Supabase (sem types de tabelas compartilhados)
3. **Tipos repetidos** — interfaces como User definidas localmente em múltiplos arquivos
4. **Supabase types** existem em `integrations/supabase/types` mas são gerados automaticamente
5. **Sem validação runtime** — dados do banco aceitos sem zod/yup/etc.

---

# 1️⃣2️⃣ SEGURANÇA NO FRONTEND — Nota: 3.0/10

## 🔴 PROBLEMAS CRÍTICOS:

### 1. Supabase anon key hardcoded no código:
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://itdjkfubfzmvmuxxjoae.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1Ni..."
```
- **Não usa variáveis de ambiente** — hardcoded no source code
- Embora a anon key seja "pública", deveria usar `import.meta.env.VITE_SUPABASE_URL`

### 2. Service Role Key exposta no `.env.example`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```
- `.env.example` contém a **service role key REAL** — deveria conter apenas placeholder
- **Se este repositório for público, TODA a segurança do Supabase está comprometida**

### 3. OpenAI API Key via variável de ambiente frontend:
```typescript
// noaAssistantIntegration.ts
apiKey: config.apiKey || (import.meta as any).env?.VITE_OPENAI_API_KEY || ''
```
- API key da OpenAI acessível via `VITE_` prefix = **exposta no bundle do cliente**
- Deveria passar por um proxy/edge function

### 4. Lógica condicional baseada em email:
```typescript
if (userEmail === 'eduardoscfaveret@gmail.com') { ... }
if (userEmail === 'rrvalenca@gmail.com') { ... }
```
- Emails hardcoded para determinar comportamento — frágil e inseguro

### 5. SDKs server-side no bundle frontend:
- `openai`, `stripe`, `resend`, `express` — pacotes server-side incluídos no frontend

## ✅ O que vai bem:
- Sem API keys `sk-*` hardcoded no source code
- AuthContext limpa tokens no logout
- Tratamento de refresh token inválido
- RBAC via RPC `get_my_primary_role` (server-side)

---

# 1️⃣3️⃣ SINAIS DE MATURIDADE — Nota: 3.5/10

## ❌ Sinais de Código Crescido Rápido:

### Arquivos enormes:
- **16 arquivos > 60 KB**, com RicardoValencaDashboard.tsx de 231 KB liderando

### Padrões inconsistentes:
- Alguns componentes em PascalCase, outros em camelCase
- Mistura de extensões `.tsx` e `.ts` sem critério claro
- `.backup` file commitado (`NewPatientForm.tsx.backup`)

### Lógica duplicada:
- `noaKnowledgeBase.ts` duplicado entre `lib/` e `services/`
- Scheduling duplicado: `RicardoScheduling.tsx` + `EduardoScheduling.tsx` + `ProfessionalScheduling.tsx`
- Dashboards duplicados: `RicardoValencaDashboard.tsx` + `EduardoFaveretDashboard.tsx` + `ProfessionalMyDashboard.tsx`

### TODOs esquecidos — **38 ocorrências encontradas**:
```
// TODO: Calcular tendência real
// TODO: Calcular start date
// TODO: Implementar depois
// TODO: Implementar chamada real à API da Soluti
// TODO: Implementar chamada real à API da Certisign
// TODO: Adicionar campo thumbnail no Supabase
// TODO: Calcular a partir de dados reais
// TODO: Implementar sistema de alertas
// TODO: Marcar como concluída no banco
// TODO: Implementar modal de seleção de profissional para novo chat
```

### Valores hardcoded:
- Profissionais específicos hardcoded na lógica
- Dados mocados/hardcoded em scheduling e chat

## ✅ Sinais de Maturidade:
- Nomeação em português consistente para domínio (bom para o contexto)
- `AuthContext` com tratamento robusto
- `lib/medcannlab/` bem organizado com tipos, erros e testes
- `clinicalGovernance/` com subpastas lógicas
- `.env.example` existe
- Playwright e Vitest configurados

---

# 📊 PLANO DE AÇÃO RECOMENDADO (por prioridade)

## 🔴 P0 — URGENTE (Segurança):
1. **Remover chave real do `.env.example`** — substituir por placeholders
2. **Mover Supabase keys para variáveis de ambiente** — usar `import.meta.env`
3. **Remover SDKs server-side do bundle** (openai, stripe, resend, express)
4. **Proxy para OpenAI** — nunca expor API key no frontend

## 🔴 P1 — CRÍTICO (Arquitetura):
5. **Quebrar `RicardoValencaDashboard.tsx`** — extrair em 10-15 componentes focados
6. **Quebrar `PatientDashboard.tsx`** — mesma abordagem
7. **Quebrar `NoaConversationalInterface.tsx`** — separar UI, hooks e lógica
8. **Criar camada de services** — migrar `supabase.from()` dos componentes para services

## 🟠 P2 — IMPORTANTE (Qualidade):
9. **Remover duplicação** — unificar `noaKnowledgeBase.ts`
10. **Organizar pasta `noa/`** — seguir estrutura recomendada
11. **Eliminar emails hardcoded** — usar sistema de roles/permissions
12. **Limpar rotas** — remover legadas, proteger rotas desprotegidas
13. **Extrair prompts** para arquivos separados
14. **Adicionar logging estruturado** (Sentry/similar)
15. **Resolver os 38 TODOs** ou criar issues

## 🟡 P3 — QUALIDADE (Médio prazo):
16. **Adicionar testes** — começar pelos services e noaResidentAI
17. **Eliminar `any`** — definir interfaces para todos os dados
18. **Implementar React Query** para cache de queries Supabase
19. **Code splitting** — lazy load dos dashboards pesados
20. **Limpar pasta raiz** — mover docs, scripts e database para locais organizados

---

# 🏥 RISCO PARA 5.000 USUÁRIOS

| Risco | Impacto | Probabilidade |
|---|:---:|:---:|
| Bundle size excessivo (server deps + componentes gigantes) | 🔴 Alto | 🔴 Certo |
| Re-renders desnecessários em dashboards | 🔴 Alto | 🔴 Certo |
| Queries repetidas sem cache | 🟠 Médio | 🔴 Certo |
| Keys expostas comprometem dados clínicos | 🔴 Crítico | 🟠 Provável |
| Bugs invisíveis em componentes >2000 linhas | 🔴 Alto | 🔴 Certo |
| Impossibilidade de manutenção por nova equipe | 🔴 Alto | 🔴 Certo |

---

*Relatório gerado em 23/02/2026 — Auditoria automatizada completa.*
