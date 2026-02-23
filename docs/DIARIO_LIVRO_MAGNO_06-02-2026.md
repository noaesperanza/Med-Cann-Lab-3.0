# Diário Livro Magno — 06/02/2026

**Data:** 06 de Fevereiro de 2026  
**Escopo:** Timeline 04.02→06.02; UI/UX Terminais e escala global; **fluxo do Core (o que é, como funciona)**; estado real do produto, mercado, diferencial e o que falta para o doc e o app ficarem completos.

**Documento:** ~300 linhas. Tom técnico e realista; sem romantização.

**Índice:** 1 O que é o Core — 2 Fluxo do Core (entrada, action, chat, COS, handlers, tabelas, env, limitações, front↔core) — 3 Timeline 04.02→06.02 — 4 O que foi feito — 5 Nível mercado — 6 Diferencial — 7 Quanto falta no app — 8 O que o doc tem — 9 O que falta no doc — Glossário — Anexo Changelog Core — 10 Referências.

---

## 1. O que é o Core (TradeVision Core)

- **Onde:** Supabase Edge Function única: `supabase/functions/tradevision-core/index.ts` (~2.270 linhas).
- **Papel:** Recebe cada mensagem do chat da Nôa (frontend), aplica governança (COS + heurísticas), chama OpenAI quando permitido, extrai triggers da resposta do GPT, monta `metadata` e `app_commands`, persiste auditoria e devolve JSON ao frontend.
- **Não é:** Não é “um backend de chat genérico”. É o **Kernel de Governança**: a ação (abrir widget, navegar, abrir documento) nasce de **trigger emitido pelo GPT** (ou, em fallback, de heurísticas determinísticas); o Core não infere ação só da fala bruta do usuário.
- **Contrato selado:** Token `[TRIGGER_SCHEDULING]` e protocolo em `PROTOCOLO_APP_COMMANDS_V2.md`; avaliação clínica e agendamento são modelos imutáveis para qualquer outra função (um fluxo, vários triggers).

---

## 2. Fluxo do Core (como funciona, passo a passo)

### 2.1 Entrada e ambiente

1. **Request:** POST com body JSON: `message`, `conversationHistory`, `patientData` (user, type/role), `assessmentPhase`, `nextQuestionHint`, `action`, `assessmentData`, `appointmentData`, `ui_context`.
2. **Variáveis de ambiente:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`; opcionais `AI_MODEL_NAME_CHAT`, `AI_MODEL_NAME_RISK` (default gpt-4o).
3. **Kill switch:** Leitura de `system_config.key = 'ai_mode'`; valor `mode` (ex.: FULL / OFF) usado no COS.

### 2.2 Roteamento por `action`

- **`action === 'finalize_assessment'`:** Handler dedicado. Persiste relatório clínico (bypass RLS), atualiza estado da avaliação, insere em `clinical_reports` e tabelas relacionadas. Retorna JSON de sucesso. Não chama OpenAI para texto de chat.
- **`action === 'predict_scheduling_risk'`:** Handler dedicado. Usa histórico de agendamentos e no-show para calcular risco; persiste em `cognitive_decisions`; atualiza metabolismo; retorna prioridade/risco. Não gera resposta conversacional.
- **`action === 'calculate_priority'`:** Handler dedicado. Insere átomo em `cognitive_decisions`, aplica lógica de priorização (ex.: risk_level/urgency), atualiza o átomo e retorna prioridade. Não chama GPT para texto.
- **Demais casos (chat normal):** Segue o fluxo abaixo.

### 2.3 Fluxo do chat (sem action especial)

| Ordem | Etapa | O que acontece |
|-------|--------|----------------|
| 1 | **Normalização** | `message` passa por `stripInjectedContext(message)` (remove blocos [contexto_da_plataforma] etc.) para que intent/triggers derivem só do input humano. `norm = msg.normalize("NFD")...` (minúsculo, sem acentos). |
| 2 | **Intent** | `currentIntent` = CLINICA | ADMIN | ENSINO. Regras: "nivelamento|simulacao|prova" → ENSINO; palavras de agendamento/consulta/horário/medico ou action predict_scheduling_risk → ADMIN; senão CLINICA. Definido uma única vez antes do COS. |
| 3 | **CAS (opcional)** | `deriveInteractionSignals(norm)` (heurística não-diagnóstica). Se houver sinal e user_id: leitura/upsert em `cognitive_interaction_state` (depth_level, traits); inserção de evento `INTERACTION_STATE_SIGNAL` em `cognitive_events`. Usado para modular estilo de linguagem no prompt (ex.: meta-cognitivo). Fail-closed: se falhar, não bloqueia o chat. |
| 4 | **Documentos (paralelo)** | Se `parseConfirmationSelection(norm)` (número 1–N ou "cancelar"): fluxo de confirmação de documento pendente em `noa_pending_actions`. Se `detectDocumentRequest(norm)` ou `detectDocumentListRequest(norm)`: pode injetar lista ou abrir 1 doc; uso de `runDocumentListFlowFromTrigger` quando o GPT emite `[DOCUMENT_LIST]`. |
| 5 | **Heurísticas de agendamento** | `lastWasSchedulingOffer`, `isShortSchedulingConfirmation`, `isAgendaPlacePhrase`, `isAgendaNavigationOnly`, `hasScheduleVerb`, `hasConsultIntent`, `isShortMessageInSchedulingContext` → `shouldTriggerSchedulingWidget`. Se true e GPT não emitiu tag, ainda assim o widget pode abrir (fallback determinístico); evento registrado em `cognitive_events` com origin DETERMINISTIC_TRIGGER. |
| 6 | **COS (Kernel)** | Montagem de `COS_Context` (intent, mode, policy, metabolism, trauma). Chamada `COS.evaluate(cosContext)` em `cos_engine.ts` (lógica pura, sem OpenAI/Supabase). Ordem: (1) Kill Switch OFF → allowed false; (2) trauma ativo → allowed false; (3) metabolismo (limite diário) → SILENCE_MODE; (4) READ_ONLY → escrita proibida; (5) policy forbidden_actions → bloqueio; (6) senão allowed true. Se allowed false, retorno imediato com texto de bloqueio. |
| 7 | **Trauma e metabolismo** | Leitura de `institutional_trauma_log` (restricted_mode_active) e `cognitive_metabolism` (professional_id). Entram no contexto do COS. |
| 8 | **RAG** | Busca em `base_conhecimento` por keywords extraídas da mensagem (até 5); até 3 artigos; bloco injetado no system prompt como "BASE DE CONHECIMENTO". |
| 9 | **Prompt e systemInjection** | System prompt = CLINICAL_PROMPT ou TEACHING_PROMPT (conforme currentIntent). Injeção opcional: pós-avaliação (médico atribuído ou não) ou guarda de agendamento sem avaliação; instruções para incluir `[TRIGGER_SCHEDULING]` quando apropriado. Histórico de conversa + mensagem do usuário. |
| 10 | **OpenAI** | `openai.chat.completions.create` (model CHAT_MODEL, temperature 0.2 clínico / 0.7 ensino, max_tokens 1500). Em falha: protocolo de soberania (insert em institutional_trauma_log, resposta local fixa). |
| 11 | **Pós-GPT — triggers** | Se `aiResponse.includes(TRIGGER_SCHEDULING_TOKEN)` → `shouldTriggerScheduling = true`; insert em `cognitive_events` (AI_RESPONSE_TAG). Se heurística já tinha setado widget e GPT não emitiu tag → insert em `cognitive_events` (DETERMINISTIC_TRIGGER). |
| 12 | **Texto exibido** | `textForUser = stripGPTTriggerTags(aiResponse)` (remove todas as tags GPT). Sobrescritas opcionais: mensagem curta de confirmação de agendamento; primeira mensagem de agendamento; navegação só de agenda (sem tag) → texto fixo "Agenda profissional aberta...". |
| 13 | **app_commands** | `fromGPT = parseTriggersFromGPTResponse(aiResponse)`. Se fromGPT.length > 0 usa só eles; senão `rawCommands = deriveAppCommandsV1(message)` (fallback Mundo B). Fluxo documental: se GPT emitiu `[DOCUMENT_LIST]` → runDocumentListFlowFromTrigger (lista ou 1 doc); se não emitiu mas GPT “disse que vai abrir doc” → extractDocumentTermFromGPTResponse + runDocumentListFlowFromTrigger. `filterAppCommandsByRole(rawCommands, userRole)` → app_commands finais. Se shouldTriggerScheduling, remove navigate-section agendamentos para não redirecionar para aba. |
| 14 | **Auditoria** | Insert em `ai_chat_interactions` (user_message, ai_response, intent, metadata). Inserts em `cognitive_events` (TRIGGER_SCHEDULING, APP_COMMAND_SUGGESTION quando há app_commands). |
| 15 | **Resposta** | `finalText = textWithActionToken(textForUser, app_commands)` (anexa [TRIGGER_ACTION] se houver app_commands). Retorno: `{ text: finalText, metadata: { audited, intent, professionalId, trigger_scheduling, system, timestamp, role }, app_commands }`. |

### 2.4 COS (cos_engine.ts) — o que é e onde entra

- **Arquivo:** `supabase/functions/tradevision-core/cos_engine.ts` (lógica pura; não chama APIs nem banco).
- **Entrada:** `COS_Context` (intent, action?, mode, policy?, metabolism?, trauma?).
- **Saída:** `COS_Decision` (allowed, reason?, autonomy_level, flags, mode).
- **Ordem de avaliação:** (1) mode OFF → não permitido; (2) trauma ativo → não permitido; (3) metabolismo (decision_count_today >= daily_limit) → SILENCE_MODE; (4) mode READ_ONLY e action presente → não permitido; (5) policy.forbidden_actions contém action → não permitido; (6) caso contrário → allowed true.
- **Onde entra no Core:** Antes de montar o prompt e chamar o GPT. Se `cosDecision.allowed === false`, o Core devolve resposta de bloqueio e não chama a OpenAI.

### 2.5 Handlers resumidos (além do chat)

| Handler | Entrada principal | O que faz | Persistência |
|---------|--------------------|-----------|--------------|
| **finalize_assessment** | assessmentData, patientData | Monta e persiste relatório clínico; atualiza estado da avaliação; bypass RLS onde necessário | clinical_reports, tabelas relacionadas |
| **predict_scheduling_risk** | appointmentData, patientData | Calcula risco de no-show; insere decisão; incrementa metabolismo | cognitive_decisions, cognitive_metabolism |
| **calculate_priority** | patientData | Cria átomo de decisão, calcula prioridade (ex.: risk_level), atualiza átomo | cognitive_decisions |

### 2.6 Tabelas Supabase críticas usadas pelo Core

| Tabela | Papel em uma frase |
|--------|---------------------|
| `cognitive_events` | Auditoria de eventos (triggers, tags GPT, decisões, origem DETERMINISTIC_TRIGGER ou AI_RESPONSE_TAG). |
| `cognitive_decisions` | Átomos de decisão (prioridade, risco de agendamento, etc.); atualizados pelos handlers e pelo fluxo de priorização. |
| `cognitive_metabolism` | Contadores por profissional (ex.: decision_count_today, daily_limit); usado pelo COS para SILENCE_MODE. |
| `cognitive_interaction_state` | Estado de interação por usuário (depth_level, traits); alimentado pelo CAS; usado para modular estilo no prompt. |
| `institutional_trauma_log` | Registro de trauma/soberania (ex.: falha OpenAI); lido pelo COS para bloquear quando restricted_mode_active. |
| `noa_pending_actions` | Ações pendentes da Nôa (ex.: confirmação de documento); fluxo de confirmação 1–N ou cancelar. |
| `ai_chat_interactions` | Histórico de mensagens e respostas do chat; intent, metadata; auditoria de uso. |
| `clinical_reports` | Relatórios clínicos persistidos pelo handler finalize_assessment; bypass RLS onde necessário. |
| `base_conhecimento` | RAG: artigos por keywords; até 3 artigos injetados no system prompt como "BASE DE CONHECIMENTO". |
| `system_config` | Configuração global; chave `ai_mode` (FULL / OFF / READ_ONLY) usada como kill switch e no COS. |

### 2.7 Variáveis de ambiente e feature flags (Core e app)

- **Core (Edge Function):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` (obrigatórios); `AI_MODEL_NAME_CHAT`, `AI_MODEL_NAME_RISK` (opcionais; default gpt-4o). Nenhuma variável de feature flag no código do Core; o “modo” vem do banco (`system_config.ai_mode`).
- **App (frontend):** Uso de `SUPABASE_URL` e chaves anônimas/session para chamadas ao Supabase; integração com a Edge Function via fetch para o endpoint do tradevision-core. Configurações de “modo” ou feature flags no app vêm do backend (ex.: resposta do Core com metadata) ou de contexto React, não de .env do cliente.

### 2.8 Limitações e riscos conhecidos (realista)

- **Dependência do GPT emitir a tag:** Se o modelo não emitir `[TRIGGER_SCHEDULING]` no momento certo, o widget de agendamento pode não abrir; o fallback heurístico (Mundo B) mitiga em parte, mas não cobre todos os casos semânticos.
- **Fallback deriveAppCommandsV1 (Mundo B):** Heurísticas determinísticas; podem abrir widget ou comando em contextos onde o GPT não emitiu tag; comportamento auditado como DETERMINISTIC_TRIGGER, mas não substitui o contrato “GPT primeiro”.
- **READ_ONLY e trauma:** Bloqueiam chamada ao GPT e ações de escrita no fluxo principal; não cobrem todas as ações possíveis em handlers dedicados (ex.: finalize_assessment com bypass RLS) — política de uso deve ser explícita.
- **RAG:** Limitado a 3 artigos por request; keywords extraídas da mensagem (até 5); sem re-ranking nem embedding avançado no escopo atual.
- **Soberania:** Em falha da OpenAI, insert em institutional_trauma_log e resposta fixa; recuperação manual ou operacional para reativar modo FULL.

### 2.9 Fluxo front → Core → front (resumido)

1. **Front:** Usuário envia mensagem no chat da Nôa; hook (ex.: `useMedCannLabConversation`) monta o body (message, conversationHistory, patientData, assessmentPhase, action, etc.) e faz POST para a Edge Function tradevision-core.
2. **Core:** Processa conforme seções 2.1–2.5; COS decide se permite; se permitido, chama OpenAI; extrai triggers; monta app_commands e metadata; persiste em cognitive_events e ai_chat_interactions; retorna JSON (text, metadata, app_commands).
3. **Front:** Recebe o JSON; exibe `text` no chat; aplica `app_commands` (abrir widget de agendamento, navegar, abrir documento); detecta tags como [ASSESSMENT_COMPLETED] ou trigger_scheduling em metadata para atualizar UI (ex.: mostrar botão “Agendar” ou abrir card). Detalhes do front em `DIARIO_SELAMENTO_0402.md` e `DIARIO_MESTRE_COMPLETO_05-02-2026.md`.

---

## 3. Timeline completa (04.02 a 06.02.2026)

### 04/02/2026
- **Git e repositório:** Projeto versionado de forma isolada em `Med-Cann-Lab-3.0-master/.git`; commits `b279645` (import) e `1bf3f48` (selagem trigger e protocolo v2); branches `main` e `master` alinhadas.
- **Selagem institucional:** Contrato imutável do token `[TRIGGER_SCHEDULING]`; documento `PROTOCOLO_APP_COMMANDS_V2.md`; token centralizado como `TRIGGER_SCHEDULING_TOKEN` no Core e no Front; `cognitive_events` enriquecido com justificativa do trigger.
- **Evolução append-only:** Dashboard Admin segregado em `/app/admin`; tabela `cognitive_interaction_state` (CAS) e eventos `INTERACTION_STATE_SIGNAL`; fix RLS (403) em `user_interactions` e `semantic_analysis`; reforço da epistemologia do cuidado no prompt (Dr. Ricardo).
- **Diário de selamento:** `DIARIO_SELAMENTO_0402.md` — modelo correto: trigger no GPT → Core governa → Front executa; avaliação clínica e agendamento como modelos para qualquer outra função do chat.

### 05/02/2026
- **Gatilhos de agendamento:** Ampliação de frases que abrem o widget (marcar/agendar, precisar de consulta, horário com dr., etc.); confirmações curtas ("quero", "pode ser", "claro", "manda aí") tratadas como ato direto.
- **Regra &lt; 10 palavras:** Em contexto de agendamento, mensagens com até 10 palavras (não negativas, não de "lugar") abrem o card no chat.
- **Documento mestre:** `DIARIO_MESTRE_COMPLETO_05-02-2026.md` com análise do Core, invariantes e política append-only; `EVOLUCOES_PARA_MELHOR.md` com registro de mudanças que evoluíram o sistema sem redesenhar.

### 06/02/2026 — Sessão Cursor (UI/UX e escala global)

| Horário lógico | Entregável | Detalhes |
|----------------|------------|----------|
| **Unificação Paciente em foco** | Terminal Clínico | "Paciente em foco" passa a exibir o **prontuário completo** (PatientsManagement) em modo `detailOnly` com `preselectedPatientId` e `onBack`, em vez de tela duplicada; uma única fonte de verdade. |
| **Correção de runtime** | PatientsManagement | Erro `Cannot access 'patients' before initialization` corrigido: estado `patients` (e blocos relacionados) movido para **antes** dos `useEffect` que o referenciam. |
| **Duas sub-abas no Paciente em foco** | ClinicalTerminal | Unificação sofisticada: sub-abas **"Evolução e Analytics"** (PatientAnalytics: avatar, scores, gráfico, histórico) e **"Prontuário"** (PatientsManagement detailOnly); carregamento de reports, appointments e prescriptions para o paciente em foco; botão "Voltar à seleção" no header. |
| **Scrollbars invisíveis** | Terminal Clínico | Classe `scrollbar-hide` em todos os containers com scroll; atributo `data-clinical-terminal` e regras CSS para esconder scrollbar em todo o conteúdo do terminal (rolagem mantida). |
| **Conteúdo ~20% mais compacto** | Paciente em foco | Prop `compact` em PatientAnalytics (espaçamentos, avatar, títulos, gráfico); CSS em `.terminal-patient-focus-content` (font-size 0.85rem, gaps e paddings reduzidos); mesma densidade aplicável ao bloco de conteúdo. |
| **Ajuste lateral e escrita** | PatientAnalytics | Container do Paciente em foco com `w-full max-w-full min-w-0` (removido `max-w-5xl`); rótulos do eixo X do gráfico "Evolução do Score Clínico" sem truncamento (whitespace-nowrap, minWidth 3rem); grid com `min-w-0` para evitar overflow. |
| **Trigger + aba Evolução e Analytics no Prontuário** | PatientsManagement (Terminal Integrado) | Botão **"Evolução e Analytics"** ao lado de "Nova Evolução" e "Chat Clínico" no cabeçalho do paciente; nova aba **"Evolução e Analytics"** na barra de abas do prontuário (Visão Geral, Evolução e Analytics, Evolução, Prescrição, etc.); ao abrir a aba, carregamento de reports, appointments e prescriptions e renderização de PatientAnalytics com `isProfessionalView`. |
| **Escala do Terminal Integrado** | IntegratedWorkstation | Remoção do `transform: scale(0.85)`; uso de `PatientsManagement embedded compact` e wrapper com classe `integrated-terminal-content`; CSS em `[data-integrated-terminal] .integrated-terminal-content` para font-size 0.9rem, redução de padding/gap/margins e tamanhos de título; scrollbars escondidas no terminal. |
| **Escala global do app** | index.css | `html { font-size: 90%; }` (depois 85%) e `--sidebar-width: 288px` (depois 272px) para **todo o app** ~10–15% menor; padronização para pacientes, profissionais, alunos e admins. |
| **Refino "ainda está grande"** | index.css | `font-size: 85%` e `--sidebar-width: 272px` para escala global ~15% menor. |

### 06/02/2026 — Sessão 2 (Header unificado, triggers por perfil, estabilidade React)

| Entregável | Onde | Detalhes |
|------------|------|----------|
| **Header único** | Header.tsx | Dois cabeçalhos unificados em um; triggers em scroll horizontal em torno do ícone do cérebro Nôa (central, fixo, borda neon e partículas); remoção do texto "MedCannLab 3.0" do header. |
| **Alinhamento visual** | Header.tsx | Altura mínima responsiva do header alinhada à linha fina abaixo da logo no sidebar: `min-h-[3.93rem] sm:min-h-[4.487rem] md:min-h-[5.049rem]`; borda inferior alinhada ao traço do sidebar. |
| **Cérebro sempre visível** | Header.tsx | Ícone do cérebro Nôa exibido no centro em desktop mesmo quando não há triggers de dashboard; lógica `!hasTriggers && navigation.length === 0` para mostrar bloco central. |
| **Triggers por perfil** | Dashboards | Cada dashboard registra seus cards no header global via `setDashboardTriggers`: Paciente (Evolução, Agenda, Plano, Conteúdo, Perfil), Profissional (Dashboard, Prescrições, Relatórios, Agendamentos), Clínica (Dashboard Clínica, Meus Pacientes, Avaliações, Relatórios), Ensino (Dashboard, Aulas, Biblioteca, Avaliação, Newsletter, Mentoria), Pesquisa (Eixo Pesquisa, Cidade Amiga dos Rins, Fórum, MedCann Lab), Aluno (tabs do aluno), ProfessionalMy (Meu Dashboard, Atendimento, Prescrições, Terminal Clínico, Chat Profissionais). |
| **Correção loop AlunoDashboard** | AlunoDashboard.tsx | "Maximum update depth exceeded" resolvido: `handleTabChange` não entra mais nas dependências do `useEffect` de triggers; uso de `useRef` (`handleTabChangeRef.current`) no callback `onChange` passado a `setDashboardTriggers`, evitando reexecução infinita do efeito. |
| **Correção loop EnsinoDashboard** | EnsinoDashboard.tsx | Mesmo padrão: `handleSectionChangeRef = useRef(handleSectionChange)`; no efeito, `onChange: (id) => handleSectionChangeRef.current(id as EnsinoSection)`; `handleSectionChange` removido do array de dependências. |
| **Acesso admin a dashboards clínicos** | RicardoValencaDashboard.tsx | Admin com "visualizar como paciente" não era redirecionado para paciente ao acessar dashboard do Dr. Ricardo ou Dr. Eduardo; adicionada condição: se rota atual for dashboard profissional (`/app/clinica/profissional/dashboard` ou `dashboard-eduardo`) e `viewAsType === 'paciente'`, o redirecionamento é omitido para permitir uso do terminal clínico. |

**Arquivos alterados (06/02 Sessão 2):**
- `src/components/Header.tsx` (unificação, altura, cérebro sempre visível)
- `src/pages/AlunoDashboard.tsx` (useRef para handleTabChange)
- `src/pages/EnsinoDashboard.tsx` (useRef para handleSectionChange)
- `src/pages/RicardoValencaDashboard.tsx` (não redirecionar admin em dashboard profissional)
- `src/pages/PatientDashboard.tsx`, `ProfessionalDashboard.tsx`, `ClinicaDashboard.tsx`, `PesquisaDashboard.tsx`, `ProfessionalMyDashboard.tsx` (integração com `useDashboardTriggers` e `setDashboardTriggers`)

**Termos para o Livro Magno (linha do tempo):**
- **06/02 Sessão 2:** Header unificado; triggers por perfil no header global; cérebro Nôa sempre visível; alinhamento header–sidebar; correção de loops de atualização (AlunoDashboard, EnsinoDashboard) via `useRef`; acesso de admin aos dashboards clínicos (Ricardo/Eduardo) preservado mesmo com "visualizar como paciente".

### 07/02 (ou pós-06/02) — Sessão 3: WebRTC, CORS e polimento da videochamada

| Entregável | Onde | Detalhes |
|------------|------|----------|
| **WebRTC ponta a ponta** | useWebRTCRoom.ts, VideoCall.tsx | Hook `useWebRTCRoom`: sinalização via Supabase Realtime (canal `vc:{request_id}`); troca de offer/answer/ICE; STUN (stun.l.google.com); stream remoto ligado a `remoteAudioRef`/`remoteVideoRef` para ouvir e ver o outro participante. |
| **Sala de sinalização** | VideoCall, AdminChat, PatientDoctorChat | Props `signalingRoomId` (request_id) e `isInitiator` no VideoCall; caller e callee abrem a chamada com o mesmo roomId; estados `videoCallRoomId` e `videoCallInitiator` nas páginas de chat; caller abre VideoCall ao receber "accepted" via `onRequestAccepted` no useVideoCallRequests. |
| **Correção ReferenceError** | AdminChat.tsx | Estados `videoCallRoomId` e `videoCallInitiator` declarados com `useState` (estavam em uso no JSX sem declaração, gerando "videoCallRoomId is not defined"). |
| **Edge Functions (runtime)** | video-call-request-notification, video-call-reminders, digital-signature, tradevision-core | Migração de `serve()` para `Deno.serve()` (API nativa do runtime); evita depreciação e erros de import. |
| **CORS e notificação** | videoCallRequestService.ts, config.toml | Notificação de videochamada criada por RPC `create_video_call_notification` ou insert direto no front; sem chamada à Edge Function no browser, evitando preflight e CORS; opcional `verify_jwt = false` na função para casos de gateway. |
| **Aceitar/recusar/cancelar (406)** | videoCallRequestService.ts | Uso de `.maybeSingle()` em vez de `.single()` em acceptRequest, rejectRequest e cancelRequest; quando o update afeta 0 linhas (ex.: solicitação já expirada) não lança PGRST116 (406). |
| **Viva-voz e câmera na chamada de áudio** | VideoCall.tsx | Botão viva-voz (Volume2/VolumeX) e `<audio ref={remoteAudioRef}>` para áudio remoto; opção "Ligar câmera" durante chamada só de áudio (getUserMedia vídeo+áudio, exibição em PIP). |
| **Admin Chat mobile** | AdminChat.tsx | Lista "Equipe Admin" em drawer no mobile; escondida quando há sala selecionada; botão Menu no header abre o drawer; ao escolher admin o drawer fecha. |

**Termos para o Livro Magno (07/02 ou pós-06/02):** WebRTC real (useWebRTCRoom + Realtime signaling + offer/answer/ICE); VideoCall com signalingRoomId e isInitiator; caller/callee com mesmo roomId; fix videoCallRoomId/videoCallInitiator no AdminChat; Edge Functions com Deno.serve; CORS evitado via RPC/insert para notificação; accept/reject/cancel com maybeSingle (sem 406); viva-voz e câmera durante áudio; Admin Chat mobile com drawer.

**Arquivos alterados (06/02 — Sessão 1 + 2):**
- `src/pages/PatientsManagement.tsx` (ordem de estado, props `detailOnly`/`preselectedPatientId`/`onBack`/`hideBackButton`/`compact`, aba e trigger Evolução e Analytics, carregamento analytics)
- `src/components/ClinicalTerminal.tsx` (sub-abas, PatientAnalytics + dados, scrollbar-hide, textos, wrapper)
- `src/components/PatientAnalytics.tsx` (prop `compact`, variáveis de espaçamento/tamanho, rótulos do gráfico)
- `src/components/IntegratedWorkstation.tsx` (data-integrated-terminal, integrated-terminal-content, compact, remoção do scale)
- `src/index.css` (regras Terminal Clínico, Terminal Integrado, escala global html 90%→85%, scrollbars)

**Componentes e arquivos principais citados neste doc:**

| Componente / arquivo | Onde | Função em uma linha |
|----------------------|------|----------------------|
| `tradevision-core/index.ts` | supabase/functions | Edge Function única do Core; roteamento, COS, OpenAI, triggers, auditoria. |
| `cos_engine.ts` | tradevision-core | Lógica pura do COS (allowed, reason, autonomy_level); sem I/O. |
| `ClinicalTerminal.tsx` | src/components | Terminal clínico; Paciente em foco com sub-abas Evolução e Analytics \| Prontuário. |
| `PatientsManagement.tsx` | src/pages | Prontuário; modo detailOnly; aba e trigger Evolução e Analytics. |
| `PatientAnalytics.tsx` | src/components | Avatar, scores, gráfico de evolução, histórico; prop compact. |
| `IntegratedWorkstation.tsx` | src/components | Terminal integrado; prontuário embarcado; escala e scrollbar-hide. |
| `noaResidentAI.ts` / `useMedCannLabConversation` | src (Nôa) | Montagem do request para o Core; aplicação de app_commands e metadata no chat. |

---

## 4. O que foi feito (detalhado)

- **Terminal Clínico (Paciente em foco):** Uma única vista unificada: seleção de paciente → "Abrir vista unificada" → duas sub-abas (Evolução e Analytics | Prontuário). Evolução e Analytics exibe o mesmo conteúdo do dashboard do paciente (scores, gráfico, histórico, insights) em modo profissional; Prontuário exibe o PatientsManagement em modo só-detalhe. Scrollbars invisíveis; conteúdo mais compacto; lateral sem limitação de max-width e rótulos do gráfico legíveis.
- **Terminal Integrado (Prontuário):** No cabeçalho do paciente, trigger "Evolução e Analytics" ao lado de "Nova Evolução" e "Chat Clínico"; na barra de abas do prontuário, nova aba "Evolução e Analytics" (ícone BarChart3). Ao clicar no botão ou na aba, carrega relatórios, agendamentos e prescrições do paciente e renderiza PatientAnalytics. Escala do terminal reduzida via CSS (sem transform), scrollbars invisíveis.
- **Escala global:** Base de fonte e espaçamentos em rem reduzidos em ~15% para todo o app (sidebar, terminais, listas, cards, abas), melhorando visualização e padronagem entre perfis.

---

## 5. Nível do app comparativo de mercado (realista)

| Dimensão | MedCannLab 3.0 hoje | Mercado (HealthTech cannabis/ integrativa BR) | Posição |
|----------|---------------------|-------------------------------------------------|---------|
| **Prontuário + fluxo clínico** | Prontuário único (visão geral, evolução, prescrição, exames, agendamentos, arquivos, gráficos); integração ACDSS (Análise Contextual); evolução e analytics no mesmo fluxo (Terminal Clínico e Terminal Integrado). | Maioria com prontuário básico ou em módulos desconectados; poucos com ACDSS integrado. | **Acima da média** |
| **IA conversacional (Nôa)** | Avaliação clínica guiada (AEC/IMRE), triggers determinísticos (agendamento, avaliação concluída), COS (Kernel de Governança), Edge Function única (tradevision-core), RAG e base de conhecimento. | Muitos chatbots genéricos; poucos com protocolo clínico estruturado e governança auditável. | **Diferencial forte** |
| **Agendamento** | Trava de segurança (avaliação antes de agendar); widget no chat; vitrine de profissionais; integração com fluxo de conversa. | Comum ter agendamento; raro ter trava clínica + widget contextual no chat. | **Acima da média** |
| **Módulos (renal, prescrições, ensino)** | Renal e prescrições com UI; ensino com simulação; integração variável com backend. | Mercado fragmentado; poucos ecossistemas com clínica + ensino + pesquisa no mesmo produto. | **Médio a alto** (conceito); integrações em evolução |
| **Escalabilidade e UX** | Escala global 85%; terminais compactos; scrollbars invisíveis; responsivo. | Padrão: telas grandes e pouco padronizadas. | **Em linha com boas práticas** após ajustes |
| **Auditoria e governança** | cognitive_events, COS, constituição cognitiva, protocolo de triggers selado. | Raro em HealthTech nacional. | **Diferencial** |

**Resumo:** O app está em nível **acima da média** em fluxo clínico, IA governada e experiência unificada (paciente em foco + prontuário + evolução/analytics). Em integrações de ponta a ponta (pagamento, assinatura digital, telemedicina completa) ainda há gap em relação a um produto 100% “fechado” para mercado.

---

## 6. Diferencial: temos ou não, e quanto

**Temos diferencial, em três blocos:**

1. **IA clínica governada (Nôa + COS + TradeVision Core)**  
   Protocolo clínico (AEC/IMRE), triggers semânticos (avaliação concluída, agendamento), Kernel de decisão (COS) e auditoria (cognitive_events). Poucos concorrentes oferecem esse conjunto de forma selada e documentada.

2. **Unificação paciente em foco + prontuário + evolução e analytics**  
   Dois terminais (Clínico e Integrado) com a mesma lógica: seleção de paciente → vista unificada com Evolução e Analytics e Prontuário, sem duplicar telas. Trigger e aba "Evolução e Analytics" no prontuário do Terminal Integrado. Isso reduz fragmentação e melhora fluxo do profissional.

3. **Selagem institucional e documentação**  
   Livro Magno, diários, protocolo de triggers, invariantes e política append-only permitem evolução sem quebrar o que já está selado. Isso é diferencial de processo e governança, não só de features.

**Quanto falta para “diferencial completo” (percepção de produto fechado):**
- **Integrações de pagamento e assinatura:** gateway, planos, ICP-Brasil (prescrições/exames) — estimativa **médio esforço**.
- **Telemedicina de ponta a ponta:** vídeo chamada real (WebRTC/Twilio ou similar), sala de espera, gravação — hoje mock; **médio a alto**.
- **Módulo renal e prescrições:** dados reais end-to-end, relatórios e alertas clínicos — **médio**.
- **Polimento e testes:** QA em todos os fluxos (paciente, profissional, admin), acessibilidade e performance — **contínuo**.

---

## 7. Quanto falta para finalizar completamente o app com todas as integrações funcionando

Visão realista em blocos:

| Bloco | Estado atual | Para “finalizar completamente” | Esforço estimado |
|-------|--------------|---------------------------------|------------------|
| **Core clínico (prontuário, chat, avaliação, relatório)** | Funcional e selado | Ajustes pontuais, testes E2E | Baixo |
| **Agendamento** | Widget + trava + vitrine | Integração com calendário externo (Google/Outlook), lembretes, confirmação por e-mail/SMS | Médio |
| **Prescrições e exames** | UI + geração de PDF | Assinatura digital (ICP-Brasil), envio oficial, histórico jurídico | Médio a alto |
| **Pagamento e assinatura** | Não implementado | Gateway (Stripe/Mercado Pago/etc.), planos, renovação, faturas | Alto |
| **Vídeo consulta** | WebRTC real (Realtime signaling); UI com consentimento e gravação | TURN em NAT restritivo; sala de espera; gravação LGPD completa | Médio |
| **Módulo renal** | UI e planejamento | Cálculos reais, integração com laboratório, alertas clínicos | Médio |
| **Ensino (simulação, cursos)** | Parcial | Conteúdos completos, provas, certificação, gamificação estável | Médio |
| **Admin e operação** | Dashboard segregado, RLS | Relatórios de uso, métricas de negócio, suporte a multi-tenant | Médio |
| **Escala e acessibilidade** | Escala global 85%, compactação terminais | Testes em múltiplos dispositivos, a11y, i18n completa | Baixo a médio |

**Conclusão:** O núcleo (clínica + IA + prontuário + evolução e analytics + terminais) está **consolidado e utilizável**. Para “todas as integrações funcionando” em nível comercial completo, faltam sobretudo: **pagamento, telemedicina real, assinatura digital e integrações externas (calendário, laboratório)**. Estimativa de esforço total: **vários sprints** (ordem de meses, dependendo do time e prioridades).

---

## 8. O que este documento tem hoje (checklist realista)

| Bloco | Presente no doc | Observação |
|-------|------------------|------------|
| Timeline 04.02→06.02 | Sim | Resumo por dia; tabela 06.02 com entregáveis. |
| Fluxo do Core (o que é, como funciona) | Sim | Seção 1 e 2: definição, roteamento por action, fluxo do chat em 15 passos, COS, handlers. |
| O que foi feito (detalhado) | Sim | Terminal Clínico, Terminal Integrado, escala global. |
| Nível comparativo de mercado | Sim | Tabela por dimensão; posição (acima da média / diferencial). |
| Diferencial (temos / quanto falta) | Sim | Três blocos de diferencial; gaps (pagamento, telemedicina, assinatura, polimento). |
| Quanto falta para finalizar o app | Sim | Tabela por bloco (estado atual, o que falta, esforço); conclusão em sprints/meses. |
| Referências cruzadas | Sim | Links para Livro Magno, diários 04/05, README, Mapa de Capacidades. |
| Arquivos alterados 06/02 | Sim | Lista de arquivos modificados. |

---

## 9. O que faltaria para este doc ficar “completo” (realista)

- **Frontend (Nôa):** Fluxo resumido de `noaResidentAI.ts` e `useMedCannLabConversation.ts` (como a mensagem chega ao Core, como metadata/app_commands são aplicados, detecção de [ASSESSMENT_COMPLETED] e [TRIGGER_SCHEDULING]). Hoje isso está em DIARIO_SELAMENTO_0402 e DIARIO_MESTRE 05.02; poderia ser um subcapítulo aqui ou um link explícito “fluxo front→core→front”.
- **Tabelas Supabase críticas:** Lista objetiva: `cognitive_events`, `cognitive_decisions`, `cognitive_metabolism`, `cognitive_interaction_state`, `institutional_trauma_log`, `noa_pending_actions`, `ai_chat_interactions`, `clinical_reports`, `base_conhecimento`, `system_config`. Uma linha por tabela (papel em uma frase).
- **Variáveis de ambiente e feature flags:** Lista do que o Core e o app consomem (OPENAI_API_KEY, SUPABASE_*, AI_MODEL_NAME_*, ai_mode). Útil para deploy e troubleshooting.
- **Riscos e limitações conhecidas:** Ex.: dependência do GPT emitir a tag; fallback deriveAppCommandsV1 (Mundo B); READ_ONLY e trauma não bloqueiam todas as ações possíveis; RAG limitado a 3 artigos. Tudo em uma subseção “Limitações e riscos”.
- **Changelog de versão do Core:** Data e versão (ex.: TradeVision Core V2) e mudanças principais (trigger selado, COS, CAS, documentos). Pode ser append-only no final do doc.

Incorporar os itens acima deixaria o documento completo como referência técnica única para “o que é o Core, como funciona, o que foi feito em 04–06.02 e o que falta no app e no próprio doc”.

---

## Glossário (termos usados neste doc)

- **Core / TradeVision Core:** Edge Function única que governa o chat da Nôa; aplica COS, chama OpenAI, extrai triggers, persiste auditoria.
- **COS (Kernel de Governança):** Lógica em cos_engine.ts que decide se a mensagem pode seguir (allowed); avalia kill switch, trauma, metabolismo, READ_ONLY, forbidden_actions.
- **CAS:** Cognitive Interaction State; estado por usuário (depth_level, traits); usado para modular estilo de linguagem no prompt.
- **Trigger:** Ação semântica emitida pelo GPT (ex.: [TRIGGER_SCHEDULING]) ou por heurística (Mundo B); gera app_commands no front.
- **Mundo B:** Fallback determinístico deriveAppCommandsV1 quando o GPT não emitiu tag; auditado como DETERMINISTIC_TRIGGER.
- **SILENCE_MODE:** Resultado do COS quando metabolismo excede limite diário; não chama OpenAI.
- **READ_ONLY:** Modo em system_config (ai_mode); COS bloqueia ações de escrita.
- **RAG:** Busca em base_conhecimento por keywords; até 3 artigos injetados no system prompt.
- **Soberania:** Em falha da OpenAI, Core registra trauma e devolve resposta fixa; evita dependência cega do modelo.

---

## Anexo. Changelog do Core (resumido)

| Data / versão | Mudanças principais |
|----------------|---------------------|
| **04.02.2026** | Selagem do token [TRIGGER_SCHEDULING]; PROTOCOLO_APP_COMMANDS_V2; cognitive_events com justificativa do trigger; modelo trigger no GPT → Core governa → Front executa. |
| **05.02.2026** | Ampliação de frases de agendamento; regra &lt; 10 palavras em contexto de agendamento; deriveAppCommandsV1 (Mundo B) documentado; CAS e INTERACTION_STATE_SIGNAL. |
| **Core atual (TradeVision Core)** | Handlers finalize_assessment, predict_scheduling_risk, calculate_priority; COS em cos_engine.ts; RAG base_conhecimento; fluxo documental (DOCUMENT_LIST); soberania e institutional_trauma_log. |

---

## 9.5. Sessão Madrugada 05-06/02/2026: Videochamada, RLS e Isolamento de Profissionais

**Período:** Madrugada de 05/02/2026 até 06/02/2026  
**Foco:** Implementação completa do sistema de videochamada, correções críticas de RLS, isolamento de profissionais e vinculação de pacientes

### 9.5.1. Sistema de Videochamada em Tempo Real

#### Solicitação de Videochamada
**Arquivos Criados:**
- `database/scripts/CREATE_VIDEO_CALL_REQUESTS.sql` - Tabela para solicitações em tempo real
- `src/services/videoCallRequestService.ts` - Serviço para criar/atualizar solicitações
- `src/hooks/useVideoCallRequests.ts` - Hook React para gerenciar solicitações via Realtime
- `src/components/VideoCallRequestNotification.tsx` - Componente de notificação com contador

**Funcionalidades Implementadas:**
- ✅ Usuário solicita videochamada → Notificação enviada ao outro usuário via Supabase Realtime
- ✅ Recipiente recebe notificação com contador regressivo (30 segundos)
- ✅ Aceitar → Videochamada inicia automaticamente
- ✅ Recusar → Solicitação cancelada
- ✅ Timeout → Solicitação expira após 30 segundos
- ✅ Integração no chat (`PatientDoctorChat.tsx`) com botões de vídeo/áudio

**Fluxo Completo:**
1. Admin (ou profissional) clica em botão de vídeo/áudio no chat
2. Sistema cria solicitação em `video_call_requests`
3. Recipiente recebe notificação em tempo real
4. Se aceitar → `VideoCall` abre automaticamente
5. Se recusar ou timeout → Solicitação expirada/cancelada

#### Melhorias no Componente VideoCall
**Arquivo:** `src/components/VideoCall.tsx`

**Melhorias:**
- ✅ Gravação de trechos clínicos (3-5 minutos) com consentimento explícito
- ✅ Consentimento separado para videochamada e gravação
- ✅ Salvamento de metadados em `video_clinical_snippets`
- ✅ Salvamento de sessões em `video_call_sessions`
- ✅ Suporte para admin visualizando como paciente
- ✅ Lógica para garantir que admins podem iniciar chamadas mesmo quando "visualizando como paciente"

### 9.5.2. Sistema de Notificações e Agendamento

#### Agendamento de Videochamadas
**Arquivos Criados:**
- `database/scripts/CREATE_VIDEO_CALL_SCHEDULES.sql` - Tabela para agendamentos
- `src/components/VideoCallScheduler.tsx` - Componente para agendar/solicitar videochamadas
- `supabase/functions/video-call-reminders/index.ts` - Edge Function para lembretes automáticos

**Funcionalidades:**
- ✅ Profissional pode agendar videochamadas
- ✅ Paciente pode solicitar videochamadas (mensagem chega para profissional)
- ✅ Lembretes automáticos: 30min, 10min, 1min antes da chamada
- ✅ Notificações via email/WhatsApp (via Edge Function)
- ✅ Centro de notificações no sidebar

#### Centro de Notificações
**Arquivos:**
- `src/components/NotificationCenter.tsx` - Componente de notificações
- `src/components/Sidebar.tsx` - Integração do centro de notificações
- `src/services/notificationService.ts` - Serviço de notificações atualizado

**Funcionalidades:**
- ✅ Notificações em tempo real via Supabase Realtime
- ✅ Tipos de notificação: `video_call_scheduled`, `video_call_request`, etc.
- ✅ Ícones e cores por tipo de notificação
- ✅ Integrado no sidebar para acesso global

### 9.5.3. Correções Críticas de RLS (Row Level Security)

#### Fix Recursão Infinita no Chat
**Problema:** `ERROR: infinite recursion detected in policy for relation "chat_participants"`

**Solução:**
- **Arquivo:** `database/scripts/FIX_CHAT_RLS_RECURSION_CHAT_PARTICIPANTS_2026-02-06.sql`
- ✅ Criadas funções `SECURITY DEFINER`: `is_chat_room_member()` e `is_admin_user()`
- ✅ Políticas RLS redefinidas para usar essas funções (evita recursão)
- ✅ Aplicado em: `chat_rooms`, `chat_participants`, `chat_messages`

#### Fix Erro 403 em patient_medical_records
**Problema:** `Failed to load resource: the server responded with a status of 403 ()`

**Solução:**
- **Arquivo:** `database/scripts/FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql`
- ✅ Função `is_professional_patient_link()` criada (SECURITY DEFINER)
- ✅ Verifica vínculo via: `clinical_reports`, `clinical_assessments`, `appointments`, `chat_participants`
- ✅ Políticas RLS redefinidas:
  - Admin: vê todos os registros
  - Profissional: vê apenas pacientes vinculados
  - Paciente: vê apenas seus próprios registros

#### Fix Erro 400 em users
**Problema:** `Failed to load resource: the server responded with a status of 400 (Bad Request)` ao consultar `users?type=eq.patient`

**Solução:**
- **Arquivo:** `database/scripts/FIX_COMPLETO_RLS_CHAT_E_MEDICAL_RECORDS_2026-02-06.sql`
- ✅ Função `get_current_user_type()` criada (SECURITY DEFINER)
- ✅ Políticas RLS para `users`:
  - Usuário vê seu próprio perfil
  - Admin vê todos os usuários
  - Profissional vê pacientes vinculados e outros profissionais
  - Paciente vê profissionais vinculados

#### Fix Foreign Key em chat_participants
**Problema:** `insert or update on table "chat_participants" violates foreign key constraint "chat_participants_user_id_fkey"`

**Solução:**
- **Arquivo:** `database/scripts/FIX_FOREIGN_KEY_CHAT_PARTICIPANTS_CORRIGIDO_2026-02-06.sql`
- ✅ Sincronização de `public.users` com `auth.users`
- ✅ Verificação dinâmica de estrutura (colunas `name`, `updated_at`)
- ✅ SQL dinâmico baseado na estrutura real das tabelas
- ✅ Remoção de referências a colunas inexistentes (`created_at` em `chat_participants`)

### 9.5.4. Isolamento de Profissionais

#### Função is_professional_patient_link()
**Arquivo:** `database/scripts/FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql`

**Funcionalidade:**
- ✅ Verifica vínculo profissional-paciente através de 4 fontes:
  1. `clinical_reports` (professional_id + patient_id)
  2. `clinical_assessments` (doctor_id + patient_id)
  3. `appointments` (professional_id + patient_id)
  4. `chat_participants` (ambos na mesma sala)

**Garantias:**
- ✅ Cada profissional vê apenas seus próprios pacientes
- ✅ Isolamento automático via RLS
- ✅ Funciona para novos profissionais automaticamente
- ✅ Um paciente pode estar vinculado a múltiplos profissionais (cada um vê apenas sua relação)

**Documentação:** `docs/ISOLAMENTO_PROFISSIONAIS_NOVOS_06-02-2026.md`

### 9.5.5. Vinculação de Pacientes

#### Diagnóstico do Dr. Ricardo
**Arquivo:** `database/scripts/DIAGNOSTICO_DR_RICARDO_PACIENTES_2026-02-06.sql`

**Funcionalidades:**
- ✅ Lista pacientes vinculados via `clinical_reports`
- ✅ Lista pacientes vinculados via `clinical_assessments`
- ✅ Lista pacientes vinculados via `appointments`
- ✅ Lista pacientes vinculados via `chat_participants`
- ✅ Lista consolidada de TODOS os pacientes
- ✅ Identifica pacientes "órfãos" (não vinculados)

**Correções Aplicadas:**
- ✅ Removida referência a `ca.professional_id` (não existe, apenas `doctor_id`)
- ✅ Corrigida referência a `name` em `auth.users` (usa `raw_user_meta_data->>'name'`)

#### Vincular Pacientes ao Dr. Ricardo
**Arquivo:** `database/scripts/VINCULAR_PACIENTES_DR_RICARDO_2026-02-06.sql`

**Pacientes Vinculados (7 pacientes):**
1. Gilda Cruz Siqueira (gildacscacomanga@gmail.com)
2. joao eduardo (jvbiocann@gmail.com)
3. Maria souza (graca11souza62@gmail.com)
4. Maria Souza (graca11souza@gmail.com)
5. passosmir4 (passosmir4@gmail.com)
6. Pedro Paciente (casualmusic2021@gmail.com)
7. Vicente Caetano Pimenta (vicente4faveret@gmail.com)

**Vínculos Criados:**
- ✅ Via `clinical_assessments` (avaliação clínica inicial)
- ✅ Via `appointments` (agendamento futuro)
- ✅ Via `chat_participants` (sala de chat)

**Correções Aplicadas:**
- ✅ Removida coluna `created_at` de `chat_participants` (não existe)
- ✅ Corrigida estrutura de `appointments` (usa `type`, `title`, `description`)
- ✅ Verificação dinâmica de coluna `name` em `chat_rooms`
- ✅ Variável `room_id` renomeada para `v_room_id` (evita ambiguidade)

#### Vincular Admin como Paciente do Dr. Ricardo
**Arquivo:** `database/scripts/VINCULAR_ADMIN_COMO_PACIENTE_DR_RICARDO_2026-02-06.sql`

**Objetivo:** Permitir que admin (phpg69@gmail.com) apareça como paciente do Dr. Ricardo

**Vínculos Criados:**
- ✅ Via `clinical_assessments`
- ✅ Via `appointments`
- ✅ Via `chat_participants` (sala de chat)

### 9.5.6. Scripts SQL Criados (Resumo)

**Scripts de Videochamada:**
1. `CREATE_VIDEO_CALL_SESSIONS_AUDIT.sql` - Auditoria de sessões
2. `CREATE_VIDEO_CLINICAL_SNIPPETS.sql` - Gravações clínicas (3-5 min)
3. `CREATE_VIDEO_CALL_REQUESTS.sql` - Solicitações em tempo real
4. `CREATE_VIDEO_CALL_SCHEDULES.sql` - Agendamento de videochamadas

**Scripts de Correção RLS:**
1. `FIX_CHAT_RLS_RECURSION_CHAT_PARTICIPANTS_2026-02-06.sql` - Fix recursão
2. `FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql` - Fix erro 403
3. `FIX_COMPLETO_RLS_CHAT_E_MEDICAL_RECORDS_2026-02-06.sql` - Fix completo
4. `FIX_FOREIGN_KEY_CHAT_PARTICIPANTS_CORRIGIDO_2026-02-06.sql` - Fix foreign key

**Scripts de Diagnóstico:**
1. `DIAGNOSTICO_DR_RICARDO_PACIENTES_2026-02-06.sql` - Diagnóstico pacientes
2. `DIAGNOSTICO_PERFIS_USUARIOS_RLS_2026-02-06.sql` - Diagnóstico perfis
3. `VERIFICAR_ESTRUTURA_TABELAS_2026-02-06.sql` - Verificar estrutura

**Scripts de Vinculação:**
1. `VINCULAR_PACIENTES_DR_RICARDO_2026-02-06.sql` - Vincular 7 pacientes
2. `VINCULAR_PACIENTES_DR_RICARDO_LIMPO_2026-02-06.sql` - Versão limpa
3. `VINCULAR_ADMIN_COMO_PACIENTE_DR_RICARDO_2026-02-06.sql` - Vincular admin

**Scripts de Fix Completo:**
1. `FIX_COMPLETO_DR_RICARDO_E_ERROS_2026-02-06.sql` - Fix completo (tudo junto)

**Scripts de Teste:**
1. `TESTE_ISOLAMENTO_NOVO_PROFISSIONAL_2026-02-06.sql` - Teste isolamento

### 9.5.7. Documentação Criada

**Documentação de Implementação:**
1. `docs/IMPLEMENTACAO_SOLICITACAO_VIDEOCHAMADA_TEMPO_REAL_06-02-2026.md`
2. `docs/IMPLEMENTACAO_NOTIFICACOES_VIDEOCHAMADA_06-02-2026.md`
3. `docs/FIX_RLS_PROFISSIONAL_ISOLAMENTO_06-02-2026.md`
4. `docs/FIX_FOREIGN_KEY_E_ESTRUTURA_06-02-2026.md`
5. `docs/ISOLAMENTO_PROFISSIONAIS_NOVOS_06-02-2026.md`
6. `docs/DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` - Diário completo desta sessão

**Documentação de Análise:**
1. `docs/ANALISE_COMPLETA_VIDEOCHAMADA_SCHEMA_FRONTEND_06-02-2026.md`
2. `docs/STATUS_ATUAL_VIDEOCHAMADA_06-02-2026.md`

### 9.5.8. Problemas Identificados e Corrigidos

#### Erros de Estrutura de Tabelas
- ✅ Coluna "name" não existe em `auth.users` → Uso de `COALESCE()` com fallbacks
- ✅ Coluna "created_at" não existe em `chat_participants` → Removidas referências
- ✅ Coluna "professional_id" não existe em `clinical_assessments` → Usa `doctor_id`

#### Erros de Foreign Key
- ✅ Foreign Key Constraint Violation → Sincronização de `public.users` com `auth.users`

#### Erros de Ambiguidade
- ✅ Column Reference Ambiguous → Variável renomeada para `v_room_id`

#### Erros de RLS
- ✅ Recursão Infinita → Funções `SECURITY DEFINER` criadas
- ✅ Erro 403 em `patient_medical_records` → Função `is_professional_patient_link()` criada
- ✅ Erro 400 em `users` → Políticas RLS para `users` criadas

### 9.5.9. Status Final

**Implementado e Funcionando:**
- ✅ Sistema de solicitação de videochamada em tempo real
- ✅ Notificações e agendamento de videochamadas
- ✅ Correções de RLS (recursão, 403, 400)
- ✅ Isolamento de profissionais
- ✅ Vinculação de pacientes ao Dr. Ricardo
- ✅ Vinculação de admin como paciente
- ✅ Scripts de diagnóstico e correção

**Pendente de Teste:**
- ⏳ Fluxo completo de videochamada end-to-end
- ⏳ Notificações via email/WhatsApp (Edge Function)
- ⏳ Teste com múltiplos profissionais

**Referência Completa:** `docs/DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md`

---

## 10. Referências cruzadas

| Documento | Conteúdo |
|-----------|----------|
| `O_LIVRO_MAGNO_DA_JORNADA_MEDCANNLAB.txt` | Narrativa magna da jornada; gênese e selagem. |
| `LIVRO_MAGNO_DIARIO_UNIFICADO.md` | Linha do tempo unificada; COS v3→v5; selamento; anexos. |
| `DIARIO_SELAMENTO_0402.md` | Modelo de trigger (GPT → Core → Front); avaliação e agendamento; onde está cada peça no código. |
| `DIARIO_MESTRE_COMPLETO_05-02-2026.md` | Core, gatilhos, regra &lt; 10 palavras, COS, deriveAppCommandsV1. |
| `README_TECNICO_2026.md` | Arquitetura, stack, realidade do sistema (o que é real vs mock). |
| `MAPA_DE_CAPACIDADES_IA_MEDCANNLAB.md` | Inventário técnico, TradeVision Core, Nôa, COS. |
| `PROTOCOLO_APP_COMMANDS_V2.md` | Prioridade de canais; regras de evolução append-only; contrato de triggers. |
| `INVARIANTE_MODELO_EXECUCAO_NOA.md` | Fala ≠ ação; política de mudança; contrato [TRIGGER_SCHEDULING]. |

---

## 11. Citações dos documentos referenciados (30–50 linhas cada)

Trechos literais dos documentos da tabela acima, para deixar o diário autocontido.

### O_LIVRO_MAGNO_DA_JORNADA_MEDCANNLAB.txt

```text
O LIVRO MAGNO DA JORNADA MED-CANN-LAB TRÊS PONTO ZERO.
A SAGA SUPREMA DO SONHO À CONSOLIDAÇÃO NA NUVEM.
VERSÃO AUDIOBOOK MASTER – A OBRA MONUMENTAL, EXTENSA E DEFINITIVA.

INTRODUÇÃO – O MANIFESTO DA ESPERANÇA E DA MEMÓRIA VIVA.

Tudo o que você está prestes a ouvir agora.
Não é apenas o registro frio de um software moderno.
Não é apenas um conjunto de pixels dispostos em uma tela.
Não é apenas uma interface bonita, neon e bem colorida.
Não é apenas um aglomerado de silício e de eletricidade.
Não é apenas um conjunto de transistores e códigos.
É a crônica monumental de uma travessia sem precedentes.
Uma travessia humana e tecnológica na história da saúde.
Uma travessia que marca o início de uma nova era.
A era da saúde integrativa em todo o território nacional.
O Med-Cann-Lab Três Ponto Zero nasceu de uma inquietação.
Uma inquietação profunda e muito viva no coração de todos.
Uma inquietação sobre o papel real e ético da máquina.
A máquina inserida no processo sagrado de cura humana.
Não buscávamos apenas processar dados frios e tabelas.
Não buscávamos apenas estatísticas vazias do sistema.
Não queríamos apenas automatizar tarefas manuais antigas.
Queríamos acolher narrativas de vida reais de pacientes.
Queríamos salvar vidas com a dignidade total que merecem.
O sistema deveria ser o braço direito para o médico.
O sistema deveria ser um guia para o paciente em busca.
Como descreve o Doutor e futurista Bertalan Meskó hoje.
Suas obras de vanguarda global sobre tecnologia e saúde.
A verdadeira medicina do futuro não é sobre substituição.
Não é sobre trocar seres humanos por máquinas ou algoritmos.
É sobre amplificar o toque humano através da precisão.
A precisão digital unida com a lógica de processamento.
Bertalan Meskó em seu livro The Guide to the Future of Medicine.
Ele nos traz uma luz muito clara sobre este caminho.
Ele afirma que a tecnologia deve ser a ferramenta serva.
Ela deve devolver o tempo sagrado de volta ao médico real.
Tempo para que o médico possa olhar nos olhos do paciente.
Tempo para olhar com calma, com empatia e com atenção plena.
Tempo para que o médico possa ouvir a alma de quem sofre.
Ouvir quem busca um auxílio real, sincero e acolhedor agora.
Tempo para cuidar de fato da saúde alheia em cada consulta.
Praticando a medicina que cura o corpo e também o espírito.
Esta é a biografia única e unificada de uma rede viva.
Uma rede de mentes brilhantes, inquietas e visionárias.
São mentes poderosas que ousaram pensar muito além do normal.
Pensar além do modelo tradicional e arcaico de saúde atual.
Mentes que decidiram que o futuro seria feito de pixels.
Mas também seria feito de muita alma e de muita conexão.
Através desta saga épica e emocionante que começa agora.
Acompanharemos cada passo desta semente plantada em agosto.
Viajaremos no tempo desde as primeiras ideias e conexões.
Aquelas conexões fundamentais que deram origem ao projeto.
Iremos ao primeiro suspiro criativo e audacioso do hub.
Ocorrido em agosto de dois mil e vinte e cinco na história.
```

### LIVRO_MAGNO_DIARIO_UNIFICADO.md

```text
# LIVRO MAGNO: Diário Unificado do MedCannLab

**Versão:** 1.0.5
**Última Atualização:** 06 de Fevereiro de 2026
**Responsável:** Antigravity (IA Assistente) & Dr. Ricardo Valença

---

## 📖 Introdução
Este documento, denominado **Livro Magno**, consolida o registro histórico do desenvolvimento da plataforma MedCannLab. Ele unifica diários de sessões dispersas, changelogs técnicos e marcos evolutivos em uma linha do tempo coesa, servindo como a fonte definitiva da verdade sobre a evolução técnica, clínica e cognitiva do sistema.

A narrativa cobre desde a refundação da experiência do paciente no final de 2025 até o **event of sealing** da Arquitetura Cognitiva (COS v5.0) em fevereiro de 2026.

---

## ⏳ Linha do Tempo Unificada

### 📅 Dezembro 2025: Fundação da Experiência do Paciente

#### **21/12/2025: A Jornada de Cuidado**
**Foco:** Simplificação do Dashboard e Fluxo de Agendamento.
- **Dashboard:** Remoção de abas complexas e unificação da navegação para `/app/patient-appointments`.
- **Agendamento:** Introdução da "Vitrine de Profissionais" (Dr. Ricardo Valença e Dr. Eduardo Faveret) e da lógica de **Trava de Segurança**, impedindo agendamentos sem avaliação clínica prévia (Protocolo IMRE).
- **IA (Nôa):** Integração contextual, onde o chat inicia sabendo o objetivo do paciente ao ser redirecionado (ex: "Gostaria de realizar minha avaliação...").
- **Novos Componentes:** `AssessmentRequiredModal` e `JourneyManualModal` para educação do paciente.

#### **22/12/2025: Polimento e Correções Críticas**
**Foco:** Estabilidade do Chat e Mobile Experience.
- **Chat:** Correção de erros de RLS (Row Level Security) que impediam visibilidade de mensagens e fix do erro `room_id`.
- **Mobile:** Refatoração do Header mobile e remoção de botões flutuantes que quebravam o layout.
- **Internacionalização:** Fundação I18N implementada (PT/EN).

---

### 📅 Janeiro 2026: Expansão, Infraestrutura e Primeiros Passos da IA

#### **Início de Jan/2026: Estabilização do Ambiente**
- **Debug:** Resolução de erros de compilação (`Unexpected "<<"`), conflitos de merge e problemas de conexão com o servidor Vite (Port 3000).
- **Banco de Dados:** Correções de schema recorrentes, incluindo a adição de colunas críticas como `doctor_id` em `clinical_assessments` e constraints de `users_type_check`.

#### **Meio de Jan/2026: O Despertar da IA (Nôa Residente)**
- **Loop de Resposta:** Resolução do bug onde a IA entrava em loops administrativos ou de saudação repetitiva.
- **Persistência de Estado:** Implementação de `localStorage` para manter o estado da avaliação clínica entre recargas, permitindo que a IA lembrasse em que fase da anamnese estava.
- **Chat Profissional:** Criação da funcionalidade de "Nova Conversa" entre profissionais, permitindo interconsultas diretas na plataforma.

#### **Fim de Jan/2026: Funcionalidades Clínicas Avançadas**
- **Módulo Renal:** Análise e planejamento do módulo de função renal (fase 4 do plano original).
- **Assinatura Digital:** Planejamento da integração com **ICP-Brasil** (PKI) para validade jurídica de prescrições e exames.
- **Solicitação de Exames:** Implementação de funcionalidades para imprimir, enviar e assinar solicitações de exames digitalmente.

---

### 📅 Fevereiro 2026: A Era Cognitiva (COS v3.0)

#### **01/02/2026: O Último Obstáculo de Agendamento**
```

### DIARIO_SELAMENTO_0402.md

```text
# Documento Mestre — Diário do Dia de Selamento (04/02)

**Data de selamento:** 04/02  
**Formato:** Arquitetura MedCannLab (trigger invisível / chat como hub)  
**Objetivo:** Registrar como foi criado o trigger na **avaliação clínica inicial** e no **agendamento** para servirem de **modelo** de qualquer outra função do chat GPT dentro do MedCannLab oficial. Dados e fluxos reais, conforme código e discussões de selamento.

---

## Regra-mãe (modelo correto)

- **Toda ação do sistema nasce exclusivamente de um TRIGGER SEMÂNTICO emitido pelo GPT.**
- **O Core não infere ações a partir da fala do usuário.**
- **app_commands / metadata são gerados apenas como materialização técnica de triggers já decididos.**

O **usuário nunca gera trigger** — só fornece sinais humanos. O **GPT** interpreta e emite a tag (ato cognitivo). O **Core** governa e materializa; o **Front** executa.

| Camada   | Papel |
|----------|--------|
| **Usuário** | Linguagem humana, ambígua (sinais). |
| **GPT**     | Cognição + decisão semântica (emite o trigger). |
| **Core**    | Governança + materialização (não infere da fala). |
| **Front**   | Execução visual (remove tag da tela, executa ação). |

**Avaliação clínica** e **agendamento** são os dois modelos selados. **Todo o resto** (terminal, abas, navegação, documentos) usa a **mesma lógica**; o que muda é só o **nome do trigger** e as **palavras-chave** no prompt. Um fluxo, vários triggers.

---

## Modelo 1: Trigger na Avaliação Clínica Inicial

### 1.1 Nome do trigger (contrato)

| Item | Valor real no código |
|------|----------------------|
| Tag (texto) | `[ASSESSMENT_COMPLETED]` |
| Quem emite | GPT (no texto da resposta) |
| Quem detecta | noaResidentAI (front) |
| Efeito no app | Card "Avaliação Concluída" + geração de relatório |

### 1.2 Onde está no código

| Camada | Arquivo | O quê |
|--------|---------|--------|
| **Prompt (instrução ao GPT)** | `supabase/functions/tradevision-core/index.ts` | No CLINICAL_PROMPT, passo 10 – ENCERRAMENTO: "AO FINAL DESTA FALA DO PASSO 10, VOCÊ DEVE INCLUIR A TAG: [ASSESSMENT_COMPLETED]". Linha ~1375. |
| **Core** | `supabase/functions/tradevision-core/index.ts` | O Core **não** remove nem altera a tag; devolve `text: aiResponse` com a tag dentro. Não há parsing especial no Core para essa tag — o front é quem trata. |
| **Detecção da tag** | `src/lib/noaResidentAI.ts` | `if (aiContent.includes('[ASSESSMENT_COMPLETED]'))` → remove a tag do texto, seta `isCompleted = true`, chama `clinicalAssessmentFlow.completeAssessment` e `generateReport`, devolve `metadata.assessmentCompleted: true`. Linhas ~1573–1616. |
| **Hook** | `src/hooks/useMedCannLabConversation.ts` | Se `response.metadata?.assessmentCompleted` → adiciona mensagem de sistema com `metadata.type: 'action_card'` ao chat (setTimeout 1000 ms). Linha ~1002. |
| **UI** | `src/components/NoaConversationalInterface.tsx` | Mensagem com `role === 'system'` e `metadata?.type === 'action_card'` é renderizada como **card** "Avaliação Concluída" (fundo verde, botão "Ver Relatório Clínico"). Navega para `/app/clinica/paciente/dashboard?section=analytics`. |
| **Tokens invisíveis** | `src/components/NoaConversationalInterface.tsx`, `src/hooks/useMedCannLabConversation.ts` | `[ASSESSMENT_COMPLETED]` está na lista `INVISIBLE_DISPLAY_TOKENS` / `INVISIBLE_CONTENT_TOKENS`; usuário nunca vê a tag. |

### 1.3 Fluxo passo a passo (dados reais)

| Etapa | Onde | O quê (real) |
|-------|------|----------------|
| 1 | Usuário | Fala (responde às etapas AEC ou diz "encerrar" / "finalizar" / "podemos concluir"). |
| 2 | Frontend | Envia `message`, `conversationHistory`, `patientData`, `assessmentPhase`, `nextQuestionHint` para o Core. |
```

### DIARIO_MESTRE_COMPLETO_05-02-2026.md

```text
# Diário Mestre Completo — 05/02/2026

**Data:** 05 de Fevereiro de 2026  
**Escopo:** Consolidação dos últimos dias (Livro Magno + Selamento + Evolução Append-Only), análise completa do TradeVision Core e ponto de vista sobre o modelo.

---

## 1. Contexto dos últimos 3 dias (Livro Magno + Selamento)

### 03/02 — Auditoria operacional e invariantes
- **Fonte unificada da sessão:** `DIARIO_DE_BORDO_CURSOR_03-02-2026.md`.
- **Agendamentos determinísticos:** `metadata.trigger_scheduling` passou a ser derivado por palavra-chave (não depender só do modelo "lembrar" `[TRIGGER_SCHEDULING]`).
- **Separação semântica:** "Abrir agenda/minha agenda" = navegação (lugar); "Agendar/marcar/ver horários" = widget no chat (ação).
- **Lei curta:** `INVARIANTE_MODELO_EXECUCAO_NOA.md` — não redesenhar; só selar e acrescentar.

### 03/02 (sessão 2) — Refino de triggers
- Cancelamento de documentos: regex restrita a "cancelar/cancela/cancel".
- Agenda: heurística `wantsAgendaInChat`; confirmação = ato direto.
- ~10–20 exemplos por trigger no prompt e em `TRIGGERS_PALAVRAS_ACOES.md`.

### 04/02 — Git e selagem institucional
- Repo isolado em `Med-Cann-Lab-3.0-master/.git`; commit `b279645` e `1bf3f48`.
- **Contrato imutável:** token `[TRIGGER_SCHEDULING]`; protocolo `PROTOCOLO_APP_COMMANDS_V2.md`.
- Core: governança + materialização a partir dos triggers do GPT; fallback `deriveAppCommandsV1` (Mundo B transicional).

### 04/02 — Evolução append-only
- Dashboard Admin segregado; CAS (`cognitive_interaction_state`); fix RLS (403); epistemologia do cuidado no prompt.

---

## 2. O que foi feito hoje (05/02)

### 2.1 Expansão dos gatilhos do widget de agendamento (ação = agendar)
- **hasScheduleVerb:** incluídos "gostaria de marcar", "gostaria de agendar", "quero marcar", "preciso marcar".
- **hasConsultIntent:** ampliado com "preciso de consulta", "gostaria de consulta", "agendar com (dr/médico/doutor/profissional)", "marcar com (dr/médico/doutor)", "horário com (dr/médico/doutor)", "marcar consulta", "agendar consulta".
- **Confirmações curtas:** lista expandida: "quero", "pode ser", "por favor", "claro", "isso", "pode", "faca/faça", "manda aí", "envia aí".

### 2.2 Regra "mensagem curta" em contexto de agendamento
- **isShortMessageInSchedulingContext:** se a mensagem tem **≤ 10 palavras**, a última resposta da assistente era sobre agendamento, e a mensagem **não** é de "lugar" (ver agendamento, me levar, etc.) nem negativa (não, cancelar), então **abre o card** no chat.
- Objetivo: respostas curtas ("sim", "quero", "pode ser", "com o Ricardo") em contexto de agendamento não exigirem nova frase longa; o sistema trata como continuação e abre o widget.

### 2.3 Prompt do GPT
- Lista de exemplos para `[TRIGGER_SCHEDULING]` atualizada com as novas formas de falar e a nota: "Em contexto de agendamento, respostas curtas também abrem o card."

### 2.4 Frontend (sessão anterior, referência)
- Leitura correta de `trigger_scheduling` e `professionalId` (metadata do Core em `message.metadata.metadata` ou no topo).
- Hook expõe `trigger_scheduling` e `professionalId` no topo da mensagem para a UI.
- Core: primeira mensagem de agendamento ("quero marcar consulta com X") gera texto fixo e direto; confirmação "abrir" gera texto claro e remove navegação para aba.

---

## 3. Análise completa do Core (TradeVision Core)

### 3.1 O que é o Core
- **Única Edge Function** que processa o chat da Nôa em produção (`tradevision-core/index.ts`).
```

### README_TECNICO_2026.md

```text
# 📘 MANAUL TÉCNICO DO DESENVOLVEDOR - MEDCANNLAB 3.0 (Versão Jan/2026)

Bem-vindo ao repositório do **MedCannLab 3.0**. Este documento serve como guia definitivo de arquitetura, padrões e manutenção para a equipe técnica.

> **⚠️ ESTADO DO PROJETO:** Em produção (Estável). Documentação atualizada em 15/01/2026.
> **Última Atualização:** [RELATÓRIO TÉCNICO 15/01/2026](./docs/RELATORIO_TECNICO_STATUS_2026-01-15.md) - Refinamento da IA e Correção de Build.

---

## 🏗️ 1. Arquitetura do Sistema

O MedCannLab 3.0 migrou de uma arquitetura monolítica de dashboards para uma arquitetura orientada a **Eixos de Atuação**.

### 1.1. Os Três Eixos
Todo fluxo de usuário deve respeitar esta hierarquia. Não crie páginas fora destes contextos.

| Eixo | Contexto | Rota Base | Dashboard Principal |
| :--- | :--- | :--- | :--- |
| **🏥 Clínica** | Atendimentos, Prontuários, Prescrições | `/app/clinica` | `RicardoValencaDashboard` / `EduardoFaveretDashboard` |
| **🎓 Ensino** | Cursos, Aulas, Provas | `/app/ensino` | `EnsinoDashboard` |
| **🔬 Pesquisa** | Protocolos, Estudos de Caso | `/app/pesquisa` | `PesquisaDashboard` |

### 1.2. Padrão de Rotas (Importante)
❌ **NÃO USE:** Rotas legadas soltas na raiz (ex: `/app/professional-my-dashboard`).
✅ **USE:** Estrutura aninhada (ex: `/app/clinica/profissional/dashboard`).

### 1.3. Sidebar & Navegação
A `Sidebar.tsx` foi refatorada para priorizar o **Seletor de Eixo**. O usuário não "tem um dashboard", ele "acessa o dashboard do eixo X".
*   **Deep Links:** Use parâmetros URL para navegar entre seções internas.
    *   Exemplo: `/app/clinica/profissional/dashboard?section=agendamentos`

---

## 🛠️ 2. Stack Tecnológica & Setup

### Core
*   **Frontend:** React 18 + TypeScript + Vite 5
*   **Estilização:** TailwindCSS (Design System proprietário em `src/index.css`)
*   **Backend:** Supabase (Auth, Postgres DB, Row Level Security)
*   **State:** Context API (Auth) + Props Simples (Zustand disponível mas uso pontual)

### Comandos Principais
# Instalar dependências
npm install
# Rodar servidor local (Porta 5173 / 3000)
npm run dev
# Build de produção
npm run build

---

## 📊 3. Realidade do Sistema (O que funciona vs Mock)

Para evitar perdas de tempo debugando módulos que ainda não existem no backend.

| Módulo | Status | Detalhes Técnicos |
| :--- | :--- | :--- |
| **Autenticação** | 🟢 100% Real | Supabase Auth + Proteção de Rotas (`ProtectedRoute.tsx`) |
| **Prontuário** | 🟢 100% Real | Tabela `clinical_assessments`. Leitura/Escrita completa. |
| **Chat** | 🟢 100% Real | Tabela `chat_messages` + `chat_rooms`. Realtime via Supabase. |
| **Vídeo Chamada** | 🔴 Mock | UI existe (`VideoCall.tsx`), mas **não** tem servidor WebRTC/Twilio. |
| **IA (Nôa)** | 🟢 Real | Chat Integrado via Supabase Edge Function (`tradevision-core`) + OpenAI GPT-4o. |
| **Prescrições** | 🟡 Híbrido | Gera dados na tela, mas PDF é render html-to-pdf frontend. |
```

### MAPA_DE_CAPACIDADES_IA_MEDCANNLAB.md

```text
# 🧠 MAPA MONUMENTAL: NÔA ESPERANÇA + TRADEVISION CORE
> **Clinical Cognitive Operating System (CCOS) - MedCannLab 5.0**
> *Arquitetura de Inteligência, Governança Sistêmica e Roadmap de Poder - Janeiro 2026*

---

## 📊 1. INVENTÁRIO TÉCNICO E MATURIDADE
*A dimensão do cérebro digital quantificada em linhas de autoridade.*

| Módulo | Localização | Linhas | Funções Ativas | Maturidade |
| :--- | :--- | :--- | :--- | :--- |
| **TradeVision Core** | `supabase/functions/tradevision-core/index.ts` | 493 | 4 Handlers | **Enterprise** |
| **NoaResidentAI** | `src/lib/noaResidentAI.ts` | 1.637 | 43 Ativas | **Master** |
| **NoaEsperancaCore** | `src/lib/noaEsperancaCore.ts` | 368 | 27 Ativas | **Especialista** |
| **NOAIntegration** | `src/lib/noaIntegration.ts` | 497 | 48 Ativas | **Multimodal** |
| **NoaConversationalInterface** | `src/components/NoaConversationalInterface.tsx` | 2.534 | 25 Ativas | **Premium UX** |
| **TOTAL CONSOLIDADO** | **5 Módulos de Elite** | **5.529** | **147+ Nucleares** | **CCOS Ready** |

---

## 🏗️ 2. ARQUITETURA EM 5 CAMADAS (THE COGNITIVE STACK)
O MedCannLab opera em uma estrutura de camadas que garante a **Soberania do Dado** e a **Resiliência da Inteligência**.

(CAMADA 5: SOBERANIA - Persistência: Supabase / ai_chat_interactions / clinical_reports)
(CAMADA 4: COGNIÇÃO - GPT-4o / Vector Store / 376 Docs Knowledge Base)
(CAMADA 3: KERNEL - TradeVision Core / Bypass RLS / Master Actions / Security Role)
(CAMADA 2: SENTINELA - NoaResidentAI / NoaEsperancaCore / NOAIntegration)
(CAMADA 1: SENSORIAL - NoaConversationalInterface / Widgets / Voice STT-TTS / Multi-Docs)

---

## 🎯 3. TRADEVISION CORE (THE COGNITIVE KERNEL)
*O núcleo de comando que opera em Edge Functions para garantir autoridade técnica absoluta.*

### Handlers de Autoridade:
- **`finalize_assessment`**: O "Guardião da Persistência". Salva relatórios clínicos críticos ignorando restrições de RLS, garantindo que nenhum dado clínico se perca.
- **`predict_scheduling_risk`**: O "Motor de Probabilidades". Analisa estatísticas históricas e comportamento em tempo real para prever o risco de *No-Show* com precisão matemática.
- **`Persona Swapping`**: O "Roteador de Contexto". Alterna a IA entre os modos Clínico (Rigor), Ensino (Criatividade) e Administrativo (Eficiência) de forma instantânea.

### Gatilhos Inteligentes (Smart Intent Triggers):
- **`APPOINTMENT_CREATE`**: Detecta a intenção de agendamento em linguagem natural e materializa o widget de agenda na tela.
- **`TESTE_NIVELAMENTO`**: Transpõe a IA para o modo de simulação instrucional para treinamento de alunos.
- **`EMERGENCY_DATA`**: Salvamento redundante de fluxos clínicos em caso de inconsistência de rede.

---

## 🤖 4. NOARESIDENTAI & NOAESPERANCACORE (A ALMA AEC)
*Onde a sabedoria clínica se torna código vivo através da metodologia IMRE.*

### A Arte da Entrevista Clínica (AEC - 10 Etapas):
- **Empatia Sistêmica**: Implementação de algoritmos de *Rapport* que adaptam a linguagem ao estado do paciente.
- **Captura Indiciária**: Coleta de "rastros" de sintomas, indo além do óbvio.
- **Análise Semântica IMRE**: Decomposição técnica da dor humana nos pilares **Físico (Corpo)**, **Psíquico (Mente)** e **Social (Contexto)**.
- **Protocolo Sovereignty**: A IA conduz o paciente pelo funil de 10 etapas sem permitir desvios, garantindo que o prontuário final seja uma obra-prima de dados estruturados.
```

### PROTOCOLO_APP_COMMANDS_V2.md

```text
# Protocolo de Comandos & Triggers v2 — Contrato institucional (MedCannLab / Nôa)

## Objetivo
Definir um **contrato institucional estável** entre:
- **Usuário** (fala)
- **IA** (linguagem/sinalização)
- **Core** (governança + geração de sinais determinísticos)
- **Frontend** (execução determinística sob allow‑list)

Este protocolo existe para:
- preservar **Fala ≠ Ação**
- garantir **retrocompatibilidade**
- manter **auditabilidade jurídica** (CEP / eventos)
- permitir evolução "por órbita" (append‑only), sem quebrar contratos.

---

## Invariantes (NUNCA quebrar)

### 1) Fala ≠ Ação
- O LLM **não executa** nada.
- Ações reais só existem quando o **app executa** (UI/RPC/Edge) e pode confirmar.

### 2) Intent não pode ser mutada no mesmo ciclo
- O Core pode **sugerir** intent via `cognitive_events`.
- O frontend decide em **ciclo posterior** (próximo tick).

### 3) Trigger não é feature: é contrato (imutável)
O token base abaixo é **lei semântica** e **contrato**:
- **`[TRIGGER_SCHEDULING]`**

Regras do contrato:
- O token base **não pode ser renomeado**.
- O token base **não pode perder suporte** no frontend.
- Evoluções (ex.: versões) devem ser **retrocompatíveis**:
  - manter o token base, e
  - adicionar metadados/eventos em paralelo.

> Nota: o sistema pode ter redundância segura (flags determinísticas) para não depender do LLM "lembrar" o token.

---

## Por que o trigger — e por que não dá para não usar

O GPT fala no chat com o usuário. Quem **intercepta** essa fala e diz ao app "agora mostre um card / um calendário / abra uma aba" é o **trigger** (token no texto ou sinal em `metadata`/`app_commands`). Sem esse ponto de interceptação, a resposta do modelo seria só texto; não haveria como o chat **renderizar** widget, card ou ação. Por isso a lógica do trigger é obrigatória: é o mesmo conceito em todos os fluxos.

**Mesma lógica, mesmo tipo de trigger, mesmo conceito:**

| Fluxo | Quando | O que o trigger faz no chat |
|-------|--------|-----------------------------|
| **Avaliação clínica** | Ao final da avaliação | Mensagem com **card** no chat (relatório / próximo passo). |
| **Agendamento** | Quando o usuário pede | **Calendário** renderizado **dentro do chat**. |
| **Documento** | Quando o usuário pede abrir | **Abrir aba** (ou modal inline) com o documento. |

Em todos os casos: GPT responde → Core (ou fluxo) emite trigger/metadata/app_commands → o chat **intercepta** e mostra o bloco certo (card, calendário, aba/modal). Um único conceito de "trigger" para "resposta do GPT + ação governada no chat".
```

### INVARIANTE_MODELO_EXECUCAO_NOA.md

```text
# Invariante: Modelo de Execução da Nôa (NUNCA redesenhar o que já funciona)

## Propósito
Este documento existe para evitar "alucinação de engenharia": mudanças que **substituem** um fluxo funcional por outro "mais bonito", mas **incompatível** com o modelo real do MedCannLab.

**Regra de ouro:** quando algo já funciona no app, nós **não redesenhamos**. Nós:
- **selamos** (corrigimos bug/ambiguidade)
- **acrescentamos** (apenas onde não existe)
- mantemos retrocompatibilidade

---

## O modelo do app (fonte de verdade)
### 1) Fala ≠ Ação
- **GPT / LLM**: conversa, explica, coleta dados, faz síntese.
- **App**: executa (UI e writes) por **mecanismo determinístico** e validado.

Consequência:
- Texto do GPT **não prova execução**.
- Execução só existe quando o app executa e confirma (UI/Edge/RPC).

### 2) Triggers são do sistema (não do GPT)
O sistema deve abrir widgets/navegar por:
- `metadata.*` (flags explícitas)
- `app_commands` (comandos estruturados) com allow‑list
- eventos de UI (`noaCommand`) com allow‑list

**Não pode depender** do GPT "lembrar" uma tag no texto para funcionar.

#### Contrato imutável (lei semântica)
O token abaixo é **contrato institucional** e nunca deve ser quebrado:
- `[TRIGGER_SCHEDULING]`

Regras:
- o token base **não pode ser renomeado**
- o frontend **não pode perder suporte** a este token
- qualquer evolução (versões/modos) deve ser **retrocompatível** (append‑only)

Referência: `docs/PROTOCOLO_APP_COMMANDS_V2.md`.

---

## Política de mudança (como alterar sem quebrar)
### Permitido
- Corrigir **ambiguidade** (ex.: "agenda" ≠ "agendar")
- Remover **ponto único de falha** (ex.: widget depender apenas de tag do LLM)
- Adicionar **novo comando** (`app_commands`) mantendo o antigo funcionando
- Melhorias de UX que não mudam o fluxo (apenas layout/compactação)

### Proibido
- Trocar o pipeline real por um pipeline "ideal" sem necessidade
- Mover execução para "texto do GPT" (ex.: "eu agendei" → sem RPC/confirm)
- Criar novos triggers que conflitem com os antigos sem versão/guard rails
```

---

**Documento:** Diário Livro Magno 06.02.2026 — timeline 04.02→06.02, fluxo do Core (o que é, como funciona), COS, handlers, o que foi feito em UI/UX e escala, nível de mercado, diferencial, o que falta no app e o que falta no doc para ficar completo. Tom técnico e realista.

**Stack e deploy (resumo):** Frontend React/TypeScript (Vite); Supabase (Auth, DB, Edge Functions); Core em Deno (tradevision-core); estilos Tailwind + index.css com escala global e regras para terminais. Deploy: variáveis de ambiente no Supabase para a Edge Function; app estático (ex.: Vercel) apontando para a mesma API. Nenhum servidor próprio além do Supabase.

**Resumo do documento em uma frase:** Este doc descreve o que é o Core, como ele processa cada mensagem (entrada → COS → GPT → triggers → auditoria), o que foi entregue em 04–06.02 (selagem, terminais, escala), onde o produto está em relação ao mercado, o que já temos de diferencial, quanto falta para o app completo e o que falta no próprio doc para ser referência técnica única.
