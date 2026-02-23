# Auditoria: Triggers no App (MedCannLab 3.0)

**Data:** 06 de Fevereiro de 2026  
**Escopo:** (1) Triggers do **header** (cards por dashboard — rota e o que abre). (2) Sistema de **triggers do TradeVision Core** (chat Nôa): o que faz, como funciona, onde está e o que abre no app (widget, navegação, prescrição, etc.).

---

## Parte A — Triggers do header (cards no topo)

### 1. Visão geral

- **Onde vivem os triggers:** `DashboardTriggersContext`; cada página de dashboard chama `setDashboardTriggers({ options, activeId, onChange, onBrainClick, ... })`.
- **Onde aparecem:** `Header.tsx` — scroll horizontal de cards à esquerda/direita do ícone do cérebro Nôa; clique no card chama `triggersContext.onChange(id)`.
- **Cérebro Nôa:** Sempre no centro; clique executa `onBrainClick` (abre/fecha o chat da Nôa).

---

### 2. Por dashboard (trigger → rota / ação)

### 2.1 Paciente — `PatientDashboard.tsx`

**Rota da página:** `/app/clinica/paciente/dashboard` (ou equivalente paciente).

| Trigger (label) | id            | Ação |
|-----------------|---------------|------|
| Evolução        | `analytics`   | Mesma página, `?section=analytics` — aba Evolução (gráficos, scores). |
| Agenda          | `meus-agendamentos` | Mesma página, `?section=meus-agendamentos`. |
| Plano           | `plano`       | Mesma página, `?section=plano`. |
| Conteúdo        | `conteudo`    | Mesma página, `?section=conteudo`. |
| Perfil          | `perfil`      | Mesma página, `?section=perfil`. |

**Resumo:** Tudo na mesma rota; só muda o query `section`. Scroll to top ao trocar.

---

### 2.2 Profissional (terminal clínico) — `ProfessionalDashboard.tsx`

**Rota da página:** `/app/clinica/profissional/dashboard`.

| Trigger (label) | id              | Ação |
|-----------------|-----------------|------|
| Dashboard       | `dashboard`     | Mesma página, `?section=dashboard`. |
| Prescrições     | `prescriptions` | Mesma página, `?section=prescriptions`. |
| Relatórios      | `clinical-reports` | Mesma página, `?section=clinical-reports`. |
| Agendamentos   | `agendamentos`  | Mesma página, `?section=agendamentos`. |

**Resumo:** Tudo na mesma rota; `handleSectionChange` atualiza estado e `searchParams.section`.

---

### 2.3 Clínica (hub) — `ClinicaDashboard.tsx`

**Rota da página:** `/app/clinica/profissional/dashboard` (ou rota do hub clínica, conforme roteamento).

| Trigger (label)     | id           | Ação |
|---------------------|--------------|------|
| Dashboard Clínica  | `dashboard`  | Fica na página atual (já é o hub). Navegação: nenhuma. |
| Meus Pacientes     | `pacientes`  | **Navega** para `/app/clinica/profissional/pacientes`. |
| Avaliações         | `avaliacoes` | **Navega** para `/app/clinica/profissional/dashboard`. |
| Relatórios         | `relatorios` | **Navega** para `/app/clinica/profissional/relatorios`. |

**Resumo:** Um trigger mantém na página; os outros três mudam de rota.

---

### 2.4 Ensino (Eixo Ensino) — `EnsinoDashboard.tsx`

**Rota da página:** `/app/ensino/profissional/dashboard` (ou equivalente ensino).

| Trigger (label) | id          | Ação |
|-----------------|-------------|------|
| Dashboard       | `dashboard` | Mesma página, seção Dashboard (estado local `activeSection` + `?section=`). |
| Aulas           | `aulas`     | Mesma página, seção Aulas. |
| Biblioteca      | `biblioteca`| Mesma página, seção Biblioteca. |
| Avaliação       | `avaliacao` | Mesma página, seção Avaliação. |
| Newsletter      | `newsletter`| Mesma página, seção Newsletter. |
| Mentoria        | `mentoria`  | Mesma página, seção Mentoria. |

**Resumo:** Tudo na mesma rota; `handleSectionChange` atualiza `activeSection` e parâmetro de URL.

---

### 2.5 Pesquisa (Eixo Pesquisa) — `PesquisaDashboard.tsx`

**Rota da página:** `/app/pesquisa/profissional/dashboard` (ou equivalente pesquisa).

| Trigger (label)       | id             | Ação |
|-----------------------|----------------|------|
| Eixo Pesquisa         | `dashboard`    | Fica na página atual. Navegação: nenhuma. |
| Cidade Amiga dos Rins | `cidade-amiga` | **Navega** para `/app/pesquisa/profissional/cidade-amiga-dos-rins`. |
| Fórum de Casos        | `forum-casos`  | **Navega** para `/app/pesquisa/profissional/forum-casos`. |
| MedCann Lab          | `medcann-lab`  | **Navega** para `/app/pesquisa/profissional/medcann-lab`. |

**Resumo:** Um trigger mantém na página; três mudam de rota.

---

### 2.6 Aluno (Eixo Ensino) — `AlunoDashboard.tsx`

**Rota da página:** `/app/ensino/aluno/dashboard`.

| Trigger (label)      | id             | Ação |
|----------------------|----------------|------|
| Dashboard            | `dashboard`    | Mesma página, `?section=dashboard`. |
| Redes Sociais        | `redes-sociais`| Mesma página, `?section=redes-sociais`. |
| Notícias             | `noticias`     | Mesma página, `?section=noticias`. |
| Simulações           | `simulacoes`   | Mesma página, `?section=simulacoes`. |
| Teste de Nivelamento | `teste`        | Mesma página, `?section=teste`. |
| Biblioteca           | `biblioteca`   | Mesma página, `?section=biblioteca`. |
| Fórum Cann Matrix    | `forum`        | Mesma página, `?section=forum`. |
| Meu Perfil           | `perfil`       | Mesma página, `?section=perfil`. |

**Resumo:** Tudo na mesma rota; `handleTabChange` atualiza `activeTab` e URL `section`.

---

### 2.7 Meu Dashboard (profissional) — `ProfessionalMyDashboard.tsx`

**Rota da página:** `/app/clinica/profissional/meu-dashboard` (ou equivalente).

| Trigger (label)     | id                 | Ação |
|---------------------|--------------------|------|
| Meu Dashboard       | `meu-dashboard`    | Fica na página atual (return). |
| Atendimento        | `atendimento`      | **Navega** para `/app/clinica/profissional/dashboard?section=atendimento`. |
| Prescrições        | `prescricoes`      | **Navega** para `/app/clinica/profissional/dashboard?section=prescricoes`. |
| Terminal Clínico   | `terminal-clinico` | **Navega** para `/app/clinica/profissional/dashboard?section=terminal-clinico`. |
| Chat Profissionais | `chat-profissionais` | **Navega** para `/app/clinica/profissional/dashboard?section=chat-profissionais`. |

**Resumo:** Um trigger mantém na página; os outros quatro vão para o dashboard profissional com `section` definido.

---

### 2.8 Dr. Ricardo Valença / Terminal unificado — `RicardoValencaDashboard.tsx`

**Rota da página:** `/app/clinica/profissional/ricardo-valenca-dashboard` (ou rota que renderiza este dashboard).

Triggers **dependem do contexto** (admin vs profissional e do **eixo** atual: clínica, ensino, pesquisa). Todas as ações são na **mesma rota**; só muda `?section=<id>` (e o conteúdo da página renderiza a seção correspondente).

**Opções quando contexto = Clínica (ou profissional clínica):**

| Trigger (label)           | id                | Ação |
|---------------------------|-------------------|------|
| Biblioteca Compartilhada  | `admin-upload`    | Mesma página, `?section=admin-upload`. |
| Função Renal              | `admin-renal`     | Mesma página, `?section=admin-renal`. |
| Terminal de Atendimento   | `atendimento`     | Mesma página, `?section=atendimento`. |
| Gestão de Pacientes       | `pacientes`       | Mesma página, `?section=pacientes`. |
| Agenda Clínica            | `agendamentos`    | Mesma página, `?section=agendamentos`. |
| Prescrever                | `prescricao-rapida` | Mesma página, `?section=prescricao-rapida`. |
| Novo Paciente             | `novo-paciente`   | Mesma página, `?section=novo-paciente` (+ modal novo paciente). |
| Equipe                    | `chat-profissionais` | Mesma página, `?section=chat-profissionais`. |

**Opções quando contexto = Ensino (admin com eixo ensino):**

| Trigger (label)       | id                      | Ação |
|-----------------------|-------------------------|------|
| Aulas                 | `aulas`                 | Mesma página, `?section=aulas`. |
| Biblioteca            | `biblioteca`            | Mesma página, `?section=biblioteca`. |
| Avaliações            | `avaliacao`             | Mesma página, `?section=avaliacao`. |
| Notícias & Eventos    | `newsletter`            | Mesma página, `?section=newsletter`. |
| Mentoria              | `chat-profissionais`    | Mesma página, `?section=chat-profissionais`. |
| Ferramentas Pedagógicas | `ferramentas-pedagogicas` | Mesma página, `?section=ferramentas-pedagogicas`. |

**Opções quando contexto = Pesquisa (admin com eixo pesquisa):**

| Trigger (label) | id                   | Ação |
|-----------------|----------------------|------|
| Protocolos      | `avaliacao`          | Mesma página, `?section=avaliacao`. |
| Analytics       | `relatorios-clinicos`| Mesma página, `?section=relatorios-clinicos`. |
| Base Científica | `biblioteca`         | Mesma página, `?section=biblioteca`. |
| Insights        | `newsletter`         | Mesma página, `?section=newsletter`. |
| Colaboração     | `chat-profissionais` | Mesma página, `?section=chat-profissionais`. |

**Admin no dashboard Ricardo (eixo variável):** além das opções do eixo, aparecem:

- Resumo Administrativo (`dashboard`)
- Usuários (`admin-usuarios`)
- Biblioteca Compartilhada, Função Renal (como acima)

**Extras no contexto:** `onPrescricaoRapida` (prescrição rápida por voz) e `onNovoPaciente` (abre modal novo paciente) são usados pelo Header quando disponíveis (botões específicos), não pelo card de trigger.

---

### 2.9 Dr. Eduardo Faveret — `EduardoFaveretDashboard.tsx`

**Rota da página:** `/app/clinica/profissional/eduardo-faveret-dashboard` (ou equivalente).

| Trigger (label) | id                 | Ação |
|-----------------|--------------------|------|
| Terminal        | `terminal-clinico` | Mesma página, estado `activeSection = 'terminal-clinico'`. |
| Agenda Clínica  | `scheduling`       | Mesma página, seção scheduling. |
| Prescrever      | `prescriptions`   | Mesma página, seção prescriptions. |
| Gestão de Pacientes | `chat-pacientes` | Mesma página, seção chat-pacientes. |
| Equipe          | `chat-profissionais` | Mesma página, seção chat-profissionais. |
| Neurologia      | `neurologia`       | Mesma página, seção neurologia. |

**Resumo:** Ordem no header vem de `leftFooterOptions` (reversed) + `rightFooterOptions`. Tudo na mesma rota; só muda `activeSection` (e URL `section` quando há listener).

---

### 3. Resumo por tipo de ação

| Tipo | Onde ocorre |
|------|-------------|
| **Só troca de seção na mesma página (estado + URL `?section=`)** | PatientDashboard, ProfessionalDashboard, EnsinoDashboard, AlunoDashboard, RicardoValencaDashboard, EduardoFaveretDashboard. |
| **Navega para outra rota** | ClinicaDashboard (pacientes, relatorios, avaliacoes); PesquisaDashboard (cidade-amiga, forum-casos, medcann-lab); ProfessionalMyDashboard (atendimento, prescricoes, terminal-clinico, chat-profissionais). |
| **Clique no trigger “principal” não navega (fica na página)** | ClinicaDashboard “Dashboard Clínica”; PesquisaDashboard “Eixo Pesquisa”; ProfessionalMyDashboard “Meu Dashboard”. |

---

### 4. Fluxo técnico (resumo)

1. **Dashboard monta** → chama `setDashboardTriggers({ options, activeId, onChange, onBrainClick, ... })`.
2. **Header** → lê `options` e `activeId` do contexto; renderiza um card por opção.
3. **Clique no card** → `Header` chama `triggersContext.onChange(id)` → contexto chama `setActiveId(id)` e o `onChange` registrado pelo dashboard.
4. **onChange do dashboard** → ou atualiza estado/URL na mesma página, ou chama `navigate(...)` para outra rota.
5. **Cérebro Nôa** → clique chama `onBrainClick()` (abre/fecha chat).

---

### 5. Pontos de atenção

- **ClinicaDashboard e PesquisaDashboard:** o trigger com `id: 'dashboard'` não tem `navigate` no `onChange`; o usuário já está na página do hub — comportamento esperado (ver Parte A).
- **ProfessionalMyDashboard:** `id === 'meu-dashboard'` dá `return` no `onChange`; mesmo caso (ver Parte A).
- **RicardoValencaDashboard:** `sectionNavOptions` e `activeId` dependem de `currentEixo`, `viewAsType` e rota; o mesmo componente serve vários “perfis” de triggers (clínica, ensino, pesquisa, admin).
- **ProfessionalDashboard:** o `useEffect` de triggers inclui `handleSectionChange` nas dependências; se surgir “Maximum update depth exceeded”, estávelizar com `useRef` (como em AlunoDashboard/EnsinoDashboard).
- **EduardoFaveretDashboard:** idem; se aparecer loop de re-render, estávelizar o callback com `useRef`.

---

## Parte B — TradeVision Core: sistema de triggers no chat (Nôa)

Triggers aqui são **tags semânticas** que o GPT pode incluir na resposta ou que o Core deriva por heurística. O Core **não infere ação só da fala**; o modelo correto é: **GPT emite tag → Core governa → gera `app_commands` e `metadata` → front executa** (abre widget, navega, etc.).

### 6. Onde fica e o que é

| Onde | O quê |
|------|--------|
| **Core (backend)** | `supabase/functions/tradevision-core/index.ts` — Edge Function única; processa cada mensagem do chat da Nôa, chama OpenAI, extrai triggers da resposta do GPT (ou usa fallback heurístico), monta `metadata` e `app_commands`, devolve JSON. |
| **Tokens selados** | `[TRIGGER_SCHEDULING]` (agendamento — contrato imutável); `[TRIGGER_ACTION]` (sinal genérico de que há ações na resposta; usuário não vê). |
| **Lista de tags GPT** | `GPT_TRIGGERS` no Core: navegação (terminal, agenda, pacientes, relatórios, chat pro, prescrição, biblioteca, função renal, meus agendamentos, módulo paciente), prescrição, filtro pacientes, documentos, assinatura, certificado. |

### 7. Fluxo (como funciona)

1. **Usuário envia mensagem** no chat da Nôa → front chama a Edge Function `tradevision-core` com `message`, `conversationHistory`, `patientData`, etc.
2. **Core:** normaliza a mensagem, aplica COS (governança), chama o GPT com prompt que instrui quando emitir cada tag (ex.: "quando o usuário quiser agendar, use [TRIGGER_SCHEDULING]").
3. **Resposta do GPT:** pode conter tags no texto (ex.: `...Aqui estão os horários. [TRIGGER_SCHEDULING]`).
4. **Core pós-GPT:** Se o texto contém `[TRIGGER_SCHEDULING]` → `shouldTriggerScheduling = true`; registra em `cognitive_events`. Heurísticas podem setar o mesmo sem tag (DETERMINISTIC_TRIGGER). `parseTriggersFromGPTResponse(aiResponse)` gera `app_commands`; se GPT não emitiu tag, fallback `deriveAppCommandsV1(message)`. `filterAppCommandsByRole` remove comandos que o perfil não pode executar. Remove tags do texto; anexa `[TRIGGER_ACTION]` se houver app_commands.
5. **Resposta do Core:** `{ text, metadata: { trigger_scheduling, professionalId, ... }, app_commands }`.
6. **Front:** `useMedCannLabConversation` coloca app_commands e trigger_scheduling em message.metadata. Se `trigger_scheduling === true` → mensagem renderizada com **widget de agendamento** dentro do chat (SchedulingWidget). Se há app_commands → `executeAppCommands` dispara evento `noaCommand`. Listeners: **RicardoValencaDashboard** (navigate-section, filter-patients, show-prescription, navigate-route); **Layout** (navigate-route, navigate-section com fallback); **NoaConversationalInterface** (documento inline + botões "Abrir [aba]").

### 8. O que cada trigger do Core faz e o que abre no app (EVA)

| Tag / origem | O que o Core faz | O que abre no app (EVA / UI) |
|--------------|------------------|------------------------------|
| **`[TRIGGER_SCHEDULING]`** | Seta `metadata.trigger_scheduling = true`; pode incluir `professionalId`. | **Widget de agendamento** (calendário) **dentro do chat**; usuário escolhe horário/profissional sem sair do chat. |
| **`[NAVIGATE_TERMINAL]`** | app_command navigate-section target `atendimento`. | Terminal: seção Terminal de Atendimento. Fora: navega para dashboard com ?section=atendimento. |
| **`[NAVIGATE_AGENDA]`** | navigate-section `agendamentos`. | Aba/rota de agenda profissional. |
| **`[NAVIGATE_PACIENTES]`** | navigate-section `pacientes`. | Tela de gestão de pacientes. |
| **`[NAVIGATE_RELATORIOS]`** | navigate-section `relatorios-clinicos`. | Tela de relatórios clínicos. |
| **`[NAVIGATE_CHAT_PRO]`** | navigate-section `chat-profissionais`. | Chat entre profissionais. |
| **`[NAVIGATE_PRESCRICAO]`** | navigate-section `prescricao-rapida`. | Tela de prescrições. |
| **`[NAVIGATE_BIBLIOTECA]`** | navigate-section `admin-upload`. | Biblioteca compartilhada. |
| **`[NAVIGATE_FUNCAO_RENAL]`** | navigate-section `admin-renal`. | Seção Função Renal. |
| **`[NAVIGATE_MEUS_AGENDAMENTOS]`** | navigate-route `/app/clinica/paciente/agendamentos`. | Página Meus agendamentos do paciente. |
| **`[NAVIGATE_MODULO_PACIENTE]`** | navigate-route dashboard paciente ?section=analytics. | Dashboard paciente, aba Evolução. |
| **`[SHOW_PRESCRIPTION]`** | show-prescription target latest. | Terminal: seção prescrições + modal última prescrição. |
| **`[FILTER_PATIENTS_ACTIVE]`** | filter-patients. | Terminal: seção pacientes + filtro ativos. |
| **`[DOCUMENT_LIST]`** | document-list. | Lista de documentos no chat. |
| **`[SIGN_DOCUMENT]`** / **`[CHECK_CERTIFICATE]`** | Comandos de assinatura/certificado. | Assinatura digital / verificação certificado. |

**Governança:** `filterAppCommandsByRole` — Admin: todos; profissional: todos exceto admin-renal (se restrito); paciente/aluno: só rotas paciente, biblioteca, documentos.

### 9. Fallback Mundo B — `deriveAppCommandsV1(message)`

Quando o GPT não emite nenhuma tag, o Core gera app_commands por heurística (palavras-chave: "abrir agenda", "terminal de atendimento", "pacientes", "relatórios", "prescrever", "meus agendamentos", "módulo paciente", etc.). Auditado como DETERMINISTIC_TRIGGER. Resiliência; não substitui o contrato "GPT primeiro".

### 10. Resumo unificado (Header + Core)

| Sistema | Onde | O que dispara | O que abre |
|---------|------|----------------|------------|
| **Header (cards)** | Contexto React + Header.tsx | Clique no card do dashboard atual | Seção (?section=) ou navegação para outra rota. |
| **Core (chat Nôa)** | Edge Function + metadata/app_commands | Resposta do GPT com tag (ou heurística) | Widget de agendamento no chat; navegação (seção/rota); prescrição; filtro pacientes; documentos; botões "Abrir [aba]" na mensagem. |

---

**Documento:** Auditoria completa dos triggers no app — (A) triggers do header por dashboard, rota e o que abre; (B) TradeVision Core: o que faz, como funciona, onde está e o que abre (widget, navegação, prescrição, EVA). “não navegam” são o card “principal” do hub (ver Parte A).
