# 📔 Diário Unificado — Últimos 7–8 Dias (03 a 08 de Fevereiro de 2026)

**Objetivo:** Uma única fonte para a timeline técnica e operacional do MedCannLab nos últimos dias. Este documento unifica os diários de bordo, selamento, mestre, Livro Magno e sessões de 05–08/02 em **um só lugar**.  
**Limite:** ~1000 linhas. Para detalhes completos de um dia, use o documento fonte indicado ao final de cada seção.

**Documentos fonte:**  
`DIARIO_DE_BORDO_CURSOR_03-02-2026.md`, `DIARIO_DE_BORDO_DIA_03.md`, `DIARIO_SELAMENTO_0402.md`, `DIARIO_MESTRE_COMPLETO_05-02-2026.md`, `DIARIO_LIVRO_MAGNO_06-02-2026.md`, `DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md`, `LIVRO_MAGNO_DIARIO_UNIFICADO.md`.

---

## 📋 Índice

1. [03/02 — Auditoria Core e interface](#0302--auditoria-core-e-interface)
2. [04/02 — Selamento e Git](#0402--selamento-e-git)
3. [05/02 — Gatilhos e regra &lt; 10 palavras](#0502--gatilhos-e-regra-10-palavras)
4. [06/02 — Terminais, escala global e videochamada](#0602--terminais-escala-global-e-videochamada)
5. [07/02 — WebRTC real e polimento](#0702--webrtc-real-e-polimento)
6. [08/02 — Videochamada: 406, polling requester, console](#0802--videochamada-406-polling-requester-console)
7. [Resumo executivo e índice de fontes](#resumo-executivo-e-índice-de-fontes)

---

## 03/02 — Auditoria Core e interface

**Data:** 03 de Fevereiro de 2026  
**Foco:** Alinhamento arquitetural do TradeVision Core, auditoria do fluxo GPT→Core→Front, refinamento da landing, governança e correções de runtime (agenda vs agendar).

### Contexto

O sistema já tinha chat da Nôa, widget de agendamento e cards pós-avaliação, mas o controle do app via chat era fragmentado (tags, metadata, regex locais). O objetivo foi consolidar a **verdade** do Core (modelo “lobo pré-frontal”), garantir que agendamento não dependesse só do GPT “lembrar” da tag e documentar invariantes para evolução sem redesenho.

### O que foi feito

**Auditoria do Core (Cursor)**

- **Modelo mental validado:** Supabase = realidade (source of truth); TradeVision Core = córtex (decide se pode pensar); COS Kernel + tabelas = superego (governança); Nôa = ego (interface); LLM = prestador (sem autoridade).
- **Fluxo de consciência:** estímulo → intenção → julgamento COS (trauma/metabolismo/política) → decisão auditável → fala/ação condicionada → memória/espelhamento.
- **Intenções ativas:** CLINICA, ADMIN, ENSINO (por keywords + action). Trigger de agendamento end-to-end: `[TRIGGER_SCHEDULING]` e `metadata.trigger_scheduling`; auditoria em `ai_chat_interactions`, `cognitive_decisions`, `cognitive_events`.
- **Gap identificado:** múltiplos pipelines de chat; não existia contrato universal de comandos; `ui_context` não padronizado. Plano em fases (Fase 0: schema/RLS; Fase 1: cérebro único de chat; Fase 2: app_command formal; Fase 3: Terminal de Atendimento).

**Agendamentos determinísticos e semântica**

- `metadata.trigger_scheduling` passou a ser **derivado também por palavra-chave** (agendar/marcar/horários/disponibilidade), não só pela tag do GPT. Objetivo: quando o modelo não inclui a tag, o widget ainda abre (comportamento “feijão com arroz”).
- **Separação selada:** “abrir agenda”, “minha agenda”, “ver agenda” = **navegação** (lugar); “agendar”, “marcar”, “ver horários”, “disponibilidade” = **ação** (widget no chat). Ajuste no Core e no front para que fala e ação ficassem alinhadas.
- **Comando explícito paciente:** “Meus agendamentos” / “Minhas consultas” como app_command + fallback para `/app/clinica/paciente/agendamentos`.

**Refino de triggers (sessão 2)**

- Cancelamento de documentos: regex restrita a “cancelar/cancela/cancel”; “cancelar” sem documento pendente segue para o GPT.
- Heurística `wantsAgendaInChat` para distinguir “ver agenda aqui no chat” vs “ir para aba”.
- Confirmação = ato direto (sem pergunta prévia). ~10–20 exemplos por trigger no prompt e em `TRIGGERS_PALAVRAS_ACOES.md`.

**Invariante e documento**

- Criado `INVARIANTE_MODELO_EXECUCAO_NOA.md`: não redesenhar; só selar e acrescentar; execução sempre determinística; evita “alucinação de engenharia”.

**Landing e COS (Dia 03)**

- Redesign “Dark High-End”: tema slate-950/900, hero com cérebro centralizado, partículas douradas, scrollbar invisível; seção “Solução” unificada (3 pilares Nôa + simulação do chat); carousel de parceiros reposicionado.
- Auditoria COS 5.0: Trauma Log, Metabolismo, governança; schema `cognitive_events` insert-only (referência `COGNITIVE_EVENTS_SCHEMA.sql`).
- Redesign do painel de agendamentos do paciente: calendário à esquerda (sticky), cards à direita; toggle Calendário/Lista; dropdown Ações; MVP de “Marketplace” (busca por especialidade, modal de perfil).

**Schema reality check (gaps críticos)**

- **cognitive_events (CEP):** tabela ausente no banco em produção; risco de insert quebrar fluxo. Ação: criar tabela + estratégia non-blocking.
- **institutional_trauma_log:** Core insere campos (severity, affected_domain, metadata) que não existiam no schema; em falha OpenAI o registro de trauma podia falhar. Ação: evoluir tabela ou insert resiliente.
- **cognitive_metabolism:** RPC `increment_metabolism(p_id text)` confirmada; compatibilidade ok.

### Problemas resolvidos

| Problema | Solução |
|----------|---------|
| Widget não abria quando o GPT não emitia a tag | Derivação de `trigger_scheduling` por palavra-chave no Core. |
| “Abrir agenda” abria widget em vez de navegar | Separação semântica: agenda = lugar; agendar = ação; ajuste no Core e na UI. |
| Confusão entre navegação e ação de agendar | Regras e documentação seladas; heurísticas nomeadas. |

### Documentos fonte

- `docs/DIARIO_DE_BORDO_CURSOR_03-02-2026.md` (auditoria, plano fases, schema check)
- `docs/DIARIO_DE_BORDO_DIA_03.md` (landing, timeline noite, Git 04/02, selagem 04/02)
- `docs/INVARIANTE_MODELO_EXECUCAO_NOA.md`

---

## 04/02 — Selamento e Git

**Data:** 04 de Fevereiro de 2026  
**Foco:** Selagem institucional do contrato de trigger, protocolo v2, repositório Git isolado e evolução append-only (Admin, CAS, RLS).

### Contexto

Era necessário congelar o **modelo correto** (quem emite trigger, quem governa, quem executa) e publicar o projeto em repositório sem arrastar arquivos pessoais. O Diário de Selamento registra onde cada peça está no código para que avaliação clínica e agendamento sirvam de **modelo** para qualquer outra função do chat.

### O que foi feito

**Git e repositório**

- Projeto versionado de forma **isolada** em `Med-Cann-Lab-3.0-master/.git` (evitar versionar `C:\Users\...`).
- Remote: `origin` → `https://github.com/OrbitrumConnect/medcannlab5.git`.
- `.gitignore`: `.env`, `.gitconfig`, `supabase/.temp/`.
- Commits: `b279645` (chore: import Med-Cann-Lab 3.0); `1bf3f48` (chore: seal trigger contract and protocol v2).
- Branches `main` e `master` alinhadas (push forçado quando necessário).

**Contrato imutável e protocolo**

- Token `[TRIGGER_SCHEDULING]` explicitado como **lei institucional** (não renomear; não remover suporte no front).
- Documento `PROTOCOLO_APP_COMMANDS_V2.md`: prioridade de canais, regras de evolução append-only.
- Token centralizado como `TRIGGER_SCHEDULING_TOKEN` no Core e no Front (evita divergência/typo).
- `cognitive_events` enriquecido com justificativa do trigger (origem, derivação, precondições).

**Modelo correto (Diário de Selamento)**

- **Regra-mãe:** Toda ação do sistema nasce de **trigger semântico emitido pelo GPT**. O Core não infere ações a partir da fala do usuário. app_commands/metadata são materialização técnica de triggers já decididos.
- **Camadas:** Usuário = sinais; GPT = emite trigger; Core = governa e materializa; Front = executa.
- **Modelos selados:** (1) Avaliação clínica — tag `[ASSESSMENT_COMPLETED]`, card “Avaliação Concluída”, relatório; (2) Agendamento — tag `[TRIGGER_SCHEDULING]`, Core seta `metadata.trigger_scheduling`, Front exibe SchedulingWidget. Ambos documentados com tabela “Onde está no código” e fluxo passo a passo.
- **Uso como modelo:** Qualquer nova função do chat: definir nome do trigger → instruir GPT no prompt → Core lê tag ou converte em app_commands → Front remove tag da tela e executa. Um fluxo, vários triggers.

**Evolução append-only**

- Dashboard Admin segregado em `/app/admin` (hub com abas); header “Admin” aponta para `/app/admin`.
- Tabela `cognitive_interaction_state` (CAS): depth_level, traits; eventos `INTERACTION_STATE_SIGNAL` para modular estilo de linguagem (não diagnóstico).
- Fix RLS (403): policies/grants para `user_interactions` e `semantic_analysis`.
- Epistemologia do cuidado no prompt (Dr. Ricardo): doença como efeito; narrativa/escuta como centro; rótulos como clarificação posterior.

### Referências de código (Selamento)

| Camada | Arquivo | O quê |
|--------|---------|-------|
| Constante | `tradevision-core/index.ts` | `TRIGGER_SCHEDULING_TOKEN` |
| Prompt | `tradevision-core/index.ts` | Instrução ao GPT para incluir a tag quando for agendamento |
| Core (leitura) | `tradevision-core/index.ts` | `aiResponse?.includes(TRIGGER_SCHEDULING_TOKEN)` → shouldTriggerScheduling; cognitive_events |
| Front | `noaResidentAI.ts`, `NoaConversationalInterface.tsx` | metadata.trigger_scheduling; stripActionTokenForDisplay; INVISIBLE_DISPLAY_TOKENS |

### Documentos fonte

- `docs/DIARIO_SELAMENTO_0402.md`
- `docs/PROTOCOLO_APP_COMMANDS_V2.md`

---

## 05/02 — Gatilhos e regra &lt; 10 palavras

**Data:** 05 de Fevereiro de 2026  
**Foco:** Ampliação dos gatilhos de agendamento, confirmações curtas como ato direto e regra de mensagem curta em contexto de agendamento; análise do Core e do COS.

### Contexto

O usuário podia falar de muitas formas (“quero”, “pode ser”, “com o Dr. Ricardo”); o sistema às vezes não abria o card. A política é append-only: aumentar cobertura sem quebrar “agenda = lugar” e “agendar = ação”.

### O que foi feito

**Gatilhos ampliados**

- **hasScheduleVerb / hasConsultIntent:** incluídos “gostaria de marcar/agendar”, “preciso de consulta”, “gostaria de consulta”, “agendar/marcar com dr/médico/doutor/profissional”, “horário com”, “marcar consulta”, “agendar consulta”.
- **Confirmações curtas (ato direto):** “quero”, “pode ser”, “por favor”, “claro”, “isso”, “pode”, “faca/faça”, “manda aí”, “envia aí” — tratadas como continuação e abertura do card sem nova pergunta.

**Regra &lt; 10 palavras**

- Em **contexto de agendamento** (última resposta da Nôa sobre agendamento), mensagens com **até 10 palavras** que não sejam de “lugar” (ver agendamento, me levar) nem negativas (não, cancelar) passam a abrir o card no chat.
- Objetivo: “sim”, “quero”, “pode ser”, “com o Ricardo” funcionarem sem exigir frase longa.

**Prompt e frontend**

- Lista de exemplos para `[TRIGGER_SCHEDULING]` atualizada no Core; nota: “Em contexto de agendamento, respostas curtas também abrem o card.”
- Frontend: leitura de `trigger_scheduling` e `professionalId` (metadata do Core); primeira mensagem de agendamento e confirmação curta com texto fixo/sobrescrito para clareza.

**Análise do Core (documento mestre)**

- **Fluxo em camadas:** (1) Normalização e contexto; (2) Heurísticas (agendamento, documentos, navegação deriveAppCommandsV1); (3) Chamada GPT (CLINICAL_PROMPT, RAG); (4) Pós-GPT: leitura de tags, parseTriggersFromGPTResponse, fallback Mundo B, filterAppCommandsByRole.
- **Por que o Core é assim:** Fala ≠ ação; usuário dá sinais, GPT emite tag, Core governa, Front executa. Não depender só do GPT → fallback determinístico. Agendamento e avaliação = modelos selados (append-only). Um fluxo, vários triggers.
- **Pontos que outras IAs podem subestimar:** Comandos vêm de parseTriggersFromGPTResponse quando o GPT emite trigger; deriveAppCommandsV1 é fallback de resiliência, não legado a remover; “agendar” vs “agendamento” é intencional (ação vs lugar).

**COS (fechamento)**

- COS = Kernel de Doutrina: “O sistema pode pensar agora?”. Entra antes do GPT: COS.evaluate(cosContext); se allowed === false, Core devolve reason e não chama o modelo.
- Camadas no cos_engine: Kill Switch → Trauma → Metabolismo (Silence Mode) → Read-only → Policy (forbidden_actions).

**Documentos criados**

- `DIARIO_MESTRE_COMPLETO_05-02-2026.md` (contexto 03–05, análise Core, COS).
- `EVOLUCOES_PARA_MELHOR.md` (registro de mudanças que evoluíram o sistema sem redesenhar).

### Documentos fonte

- `docs/DIARIO_MESTRE_COMPLETO_05-02-2026.md`
- `docs/EVOLUCOES_PARA_MELHOR.md`

---

## 06/02 — Terminais, escala global e videochamada

**Data:** 06 de Fevereiro de 2026  
**Foco:** UI/UX dos terminais clínicos (Paciente em foco, Evolução e Analytics), escala global do app, header unificado, triggers por perfil, estabilidade React; em paralelo (madrugada 05–06): videochamada em tempo real, RLS e isolamento de profissionais.

### Contexto

O terminal clínico tinha telas duplicadas e conteúdo “grande”; o header era fragmentado por dashboard. A videochamada existia como UI mas faltava solicitação/notificação em tempo real e correções de RLS que impediam chat e prontuário de funcionar para todos os perfis.

### O que foi feito

**Sessão 1 — Terminais e escala**

- **Unificação Paciente em foco:** Uma única vista: seleção de paciente → “Abrir vista unificada” → duas sub-abas: **Evolução e Analytics** (PatientAnalytics: avatar, scores, gráfico, histórico) e **Prontuário** (PatientsManagement em modo `detailOnly` com `preselectedPatientId`, `onBack`). Scrollbars invisíveis (`scrollbar-hide`, `data-clinical-terminal`); conteúdo ~20% mais compacto (prop `compact`, CSS `.terminal-patient-focus-content`).
- **Correção de runtime:** PatientsManagement — erro “Cannot access 'patients' before initialization” corrigido: estado `patients` (e blocos relacionados) declarado **antes** dos `useEffect` que o referenciam.
- **Ajustes laterais e gráfico:** Container com `w-full max-w-full min-w-0`; rótulos do eixo X do gráfico “Evolução do Score Clínico” sem truncamento (`whitespace-nowrap`, minWidth).
- **Trigger e aba no Prontuário (Terminal Integrado):** Botão “Evolução e Analytics” ao lado de “Nova Evolução” e “Chat Clínico” no cabeçalho do paciente; nova aba “Evolução e Analytics” na barra de abas do prontuário; ao abrir, carregamento de reports, appointments e prescriptions e renderização de PatientAnalytics com `isProfessionalView`.
- **Escala do Terminal Integrado:** Remoção de `transform: scale(0.85)`; uso de `integrated-terminal-content` e CSS para font-size 0.9rem e redução de padding/gap; scrollbars escondidas.
- **Escala global do app:** `html { font-size: 85%; }`, `--sidebar-width: 272px` para **todo o app** ~15% menor; padronização para pacientes, profissionais, alunos e admins.

**Sessão 2 — Header e estabilidade React**

- **Header único:** Dois cabeçalhos fundidos em um; triggers em scroll horizontal em torno do ícone do cérebro Nôa (centro fixo, borda neon, partículas); remoção do texto “MedCannLab 3.0” do header.
- **Alinhamento header–sidebar:** Altura mínima responsiva (`min-h-[3.93rem]` a `min-h-[5.049rem]`) alinhada à linha fina abaixo da logo no sidebar.
- **Cérebro Nôa sempre visível:** Exibido no centro em desktop mesmo quando não há triggers ativos.
- **Triggers por perfil:** Cada dashboard registra seus cards no header via `setDashboardTriggers`: Paciente (Evolução, Agenda, Plano, Conteúdo, Perfil); Profissional (Dashboard, Prescrições, Relatórios, Agendamentos); Clínica, Ensino, Pesquisa, Aluno, ProfessionalMy com conjuntos respectivos.
- **Correção “Maximum update depth exceeded”:** Em AlunoDashboard e EnsinoDashboard, o `useEffect` que chama `setDashboardTriggers` passou a usar **useRef** para o callback (ex.: `handleTabChangeRef.current`, `handleSectionChangeRef.current`), removendo a função das dependências do efeito e evitando loop infinito de re-renders.
- **Acesso admin:** Em RicardoValencaDashboard, admin com “visualizar como paciente” deixa de ser redirecionado quando está em rota de dashboard profissional (Dr. Ricardo / Dr. Eduardo), permitindo uso do terminal clínico.

**Madrugada 05–06/02 — Videochamada e RLS**

- **Solicitação de videochamada:** Tabela `video_call_requests`; `videoCallRequestService.ts`, `useVideoCallRequests.ts`, `VideoCallRequestNotification.tsx`; fluxo: usuário solicita → notificação em tempo real (Supabase Realtime) → aceitar/recusar/timeout (ex.: 30 s); VideoCall abre quando solicitação é aceita. Integração em PatientDoctorChat e AdminChat (botões vídeo/áudio).
- **VideoCall:** Consentimento inicial; gravação de trechos clínicos (3–5 min) com consentimento explícito; sessões em `video_call_sessions`, trechos em `video_clinical_snippets`; suporte para admin “visualizando como paciente”.
- **Notificações e agendamento:** VideoCallScheduler, Edge Function video-call-reminders (lembretes 30min, 10min, 1min), centro de notificações no sidebar.
- **RLS — Recursão infinita:** Políticas em `chat_participants`, `chat_rooms`, `chat_messages` causavam “infinite recursion detected”. Solução: funções **SECURITY DEFINER** `is_chat_room_member()`, `is_admin_user()`; políticas redefinidas para usar essas funções. Script: `FIX_CHAT_RLS_RECURSION_CHAT_PARTICIPANTS_2026-02-06.sql`.
- **RLS — 403 patient_medical_records:** Função `is_professional_patient_link()` (SECURITY DEFINER) verificando vínculo via clinical_reports, clinical_assessments, appointments, chat_participants; políticas para admin (todos), profissional (vinculados), paciente (próprios). Script: `FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql`.
- **RLS — 400 users:** Função `get_current_user_type()`; políticas para usuário (próprio perfil), admin (todos), profissional (pacientes vinculados + outros profissionais), paciente (profissionais vinculados). Script: `FIX_COMPLETO_RLS_CHAT_E_MEDICAL_RECORDS_2026-02-06.sql`.
- **Isolamento de profissionais:** Cada profissional vê apenas seus pacientes (RLS + vínculos). Scripts de vinculação: pacientes ao Dr. Ricardo; admin como paciente do Dr. Ricardo. Documentação: `FIX_RLS_PROFISSIONAL_ISOLAMENTO_06-02-2026.md`.

### Problemas identificados e corrigidos (06/02)

| Problema | Causa | Solução |
|----------|------|---------|
| Coluna "name" não existe | auth.users sem coluna name (está em raw_user_meta_data) | COALESCE(public.users.name, auth.raw_user_meta_data->>'name', SPLIT_PART(email,'@',1)) |
| created_at em chat_participants | Coluna não existe | Remover referências nos scripts |
| professional_id em clinical_assessments | Tabela usa doctor_id | Usar doctor_id em todos os scripts |
| Foreign key chat_participants | user_id não existe em public.users | Sincronizar users; verificação dinâmica antes de insert |
| Coluna room_id ambígua | Variável conflita com coluna | Renomear para v_room_id em scripts |
| Recursão infinita RLS | Políticas chamando políticas | Funções SECURITY DEFINER; políticas usam funções |
| 403 patient_medical_records | RLS sem vínculo profissional-paciente | is_professional_patient_link() + políticas |
| 400 users | Filtro type/estrutura | get_current_user_type() + políticas por tipo |

**Fluxo da solicitação de videochamada (06/02)**

1. Usuário A (admin/profissional) clica em botão de vídeo ou áudio no chat.
2. Front chama `videoCallRequestService.createRequest({ recipientId, callType, timeoutSeconds })`; insert em `video_call_requests` (status pending).
3. Notificação criada (RPC ou insert em `notifications`) e/ou subscription Realtime em `video_call_requests` faz o usuário B receber a solicitação.
4. Componente `VideoCallRequestNotification` exibe popup com contador regressivo (ex.: 30 s).
5. Se B aceita: `acceptRequest(request_id)` → update status = accepted; em A e B o hook/Realtime detecta; ambos abrem `VideoCall` (com request_id como sala quando houver WebRTC).
6. Se B recusa ou timeout: update status = rejected/expired; A recebe atualização e pode ver toast ou limpar estado de espera.
7. VideoCall: consentimento inicial → getUserMedia (vídeo+áudio ou só áudio) → com signalingRoomId, useWebRTCRoom conecta os dois (07/02).

### Scripts SQL criados (amostra)

- Videochamada: CREATE_VIDEO_CALL_REQUESTS, CREATE_VIDEO_CALL_SESSIONS_AUDIT, CREATE_VIDEO_CLINICAL_SNIPPETS, CREATE_VIDEO_CALL_SCHEDULES.
- RLS: FIX_CHAT_RLS_RECURSION_*, FIX_PATIENT_MEDICAL_RECORDS_RLS_403_*, FIX_COMPLETO_RLS_*.
- Vinculação: VINCULAR_PACIENTES_DR_RICARDO_*, VINCULAR_ADMIN_COMO_PACIENTE_*.
- Diagnóstico: DIAGNOSTICO_DR_RICARDO_PACIENTES_*, VERIFICAR_ESTRUTURA_TABELAS_*.

### Arquivos principais alterados (06/02)

- Terminais/UI: `PatientsManagement.tsx`, `ClinicalTerminal.tsx`, `PatientAnalytics.tsx`, `IntegratedWorkstation.tsx`, `index.css`, `Header.tsx`, `AlunoDashboard.tsx`, `EnsinoDashboard.tsx`, `RicardoValencaDashboard.tsx`; dashboards (setDashboardTriggers).
- Videochamada/RLS: `videoCallRequestService.ts`, `useVideoCallRequests.ts`, `VideoCallRequestNotification.tsx`, `VideoCall.tsx`, `PatientDoctorChat.tsx`, `AdminChat.tsx`; scripts em `database/scripts/`.

### Documentos fonte

- `docs/DIARIO_LIVRO_MAGNO_06-02-2026.md` (timeline 04→06, fluxo Core, tabelas)
- `docs/DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` (implementações, problemas, scripts, documentação criada)

---

## 07/02 — WebRTC real e polimento

**Data:** 07 de Fevereiro de 2026 (ou pós-06/02)  
**Foco:** Áudio e vídeo entre dois dispositivos (ouvir e ser ouvido; ver e ser visto), correções CORS, 406 e UX da chamada; Edge Functions com runtime nativo.

### Contexto

A UI de videochamada e a solicitação/notificação já existiam, mas **nenhum stream remoto** era enviado nem reproduzido — cada lado só via/se ouvia a si mesmo. Era necessário WebRTC (ou equivalente) para mídia real. Em paralelo, aceitar/recusar/cancelar retornavam 406 em certos casos; a notificação via Edge Function no browser gerava CORS no localhost; e no AdminChat faltavam estados para a sala de sinalização, gerando ReferenceError.

### O que foi feito

**WebRTC ponta a ponta**

- **Hook `useWebRTCRoom`** (`src/hooks/useWebRTCRoom.ts`): Parâmetros `roomId` (request_id), `isInitiator`, `localStream`, `enabled`, `userId`. Canal Supabase Realtime `vc:{roomId}` para sinalização; troca de mensagens: offer, answer, ice, ready (callee envia “ready” ao inscrever; initiator envia offer ao receber “ready” ou ao inscrever). STUN: stun.l.google.com:19302. RTCPeerConnection com ontrack → setRemoteStream; onicecandidate → broadcast do candidato. Retorno: `remoteStream`, `connectionState`, `error`.
- **VideoCall:** Novas props `signalingRoomId` e `isInitiator`. Quando sala e user existem, usa useWebRTCRoom; stream remoto atribuído a `remoteAudioRef` e `remoteVideoRef` (ouvir e ver o outro). Indicadores na UI: “Conectando áudio...”, “Conectado”, mensagem de erro. Viva-voz (Volume2/VolumeX) e opção “Ligar câmera” durante chamada de áudio já existentes; passam a funcionar com áudio remoto real.
- **Sala única por chamada:** AdminChat e PatientDoctorChat mantêm estados `videoCallRoomId` e `videoCallInitiator`. Ao aceitar (callee): setVideoCallRoomId(request_id), setVideoCallInitiator(false), abrir VideoCall. Caller: useVideoCallRequests recebe opção `onRequestAccepted`; quando status vira “accepted” e o usuário é o requester, setVideoCallRoomId(request_id), setVideoCallInitiator(true), abrir VideoCall. Ambos entram no mesmo canal Realtime e trocam offer/answer/ICE.

**Correção ReferenceError**

- Em AdminChat, `videoCallRoomId` e `videoCallInitiator` eram usados no JSX (VideoCall props e onClose) sem declaração. Solução: `useState<string | null>(null)` e `useState(false)` declarados junto dos outros estados de videochamada.

**Edge Functions (runtime)**

- Migração de `serve()` (import de `@supabase/functions`) para **Deno.serve()** (API nativa do runtime) em: video-call-request-notification, video-call-reminders, digital-signature, tradevision-core. Evita depreciação e erros de import.

**CORS e notificação**

- Notificação de videochamada passou a ser criada no front por **RPC** (`create_video_call_notification`) ou **insert** direto na tabela de notificações, sem chamar a Edge Function no browser. Evita preflight OPTIONS e CORS no localhost (onde o gateway pode retornar 401 antes da função rodar). Opcional: `verify_jwt = false` na config da função para casos de gateway.

**Aceitar / recusar / cancelar (406)**

- Em `videoCallRequestService.ts`, acceptRequest, rejectRequest e cancelRequest usavam `.single()` no update; quando o update afetava 0 linhas (ex.: solicitação já expirada), o Supabase retornava PGRST116 (406). Solução: usar **.maybeSingle()** para não lançar quando não houver linha retornada.

**UX da chamada e Admin Chat mobile**

- Viva-voz e câmera durante áudio já estavam na UI; com stream remoto funcionando, o áudio do outro sai no elemento de áudio (e setSinkId para alto-falante quando disponível).
- Admin Chat no mobile: lista “Equipe Admin” em **drawer**; escondida quando há sala selecionada; botão Menu no header abre o drawer; ao escolher um admin o drawer fecha.

### Problemas resolvidos (07/02)

| Problema | Solução |
|----------|---------|
| Não ouvir o outro na chamada | WebRTC com useWebRTCRoom; Realtime para signaling; stream remoto em remoteAudioRef/remoteVideoRef. |
| CORS ao chamar Edge Function no localhost | Notificação criada por RPC/insert no front; não chamar a função no browser. |
| 406 ao aceitar/recusar/cancelar | .maybeSingle() no lugar de .single() nos updates. |
| ReferenceError: videoCallRoomId is not defined | Estados videoCallRoomId e videoCallInitiator declarados em AdminChat. |
| Caller não abria VideoCall quando o outro aceitava | onRequestAccepted no useVideoCallRequests; caller abre com mesmo request_id e isInitiator=true. |

### Arquivos alterados/criados (07/02)

- Novo: `src/hooks/useWebRTCRoom.ts`
- Alterados: `src/components/VideoCall.tsx`, `src/hooks/useVideoCallRequests.ts`, `src/pages/AdminChat.tsx`, `src/pages/PatientDoctorChat.tsx`; Edge Functions (Deno.serve); `videoCallRequestService.ts` (maybeSingle, fluxo de notificação).

### Documentos fonte

- `docs/DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` (seção Sessão 07/02)
- `docs/DIARIO_LIVRO_MAGNO_06-02-2026.md` (seção 07/02)
- `docs/LIVRO_MAGNO_DIARIO_UNIFICADO.md` (entrada 07/02)

---

## 08/02 — Videochamada: 406, polling requester, console

**Data:** 08 de Fevereiro de 2026  
**Foco:** Corrigir 406 ao aceitar/recusar, garantir que quem aceita e quem solicitou entrem na sala, remover aviso de console. **Videochamada ainda não 100% concretizada; estamos no caminho.**

### O que foi feito

- **406:** `acceptRequest` e `rejectRequest` passaram a fazer UPDATE sem `.select()` e depois SELECT separado por `request_id` (evita conflito RETURNING/RLS no PostgREST).
- **Quem aceita sempre entra:** Em `VideoCallRequestNotification`, sempre chamar `onAccept(toUse)` com `accepted ?? { ...request, status: 'accepted' }`.
- **Requester puxado para a sala:** Novo `getRequestById(requestId)` no serviço; em AdminChat e PatientDoctorChat, polling a cada 1,5 s quando há `pendingCallRequest`; ao detectar `status === 'accepted'`, abrir sala e limpar estado. Funciona como fallback quando o Realtime do Supabase não dispara.
- **Console:** Removido o aviso "Nenhum admin encontrado para chamada" (useMemo em AdminChat).

### Documentos fonte

- `docs/DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` (seção Sessão 08/02)

---

## Resumo executivo e índice de fontes

### Resumo por dia (últimos 7 dias)

| Data   | Marco principal |
|--------|------------------|
| **03/02** | Auditoria Core (modelo lobo pré-frontal); triggers determinísticos e separação agenda vs agendar; invariante “não redesenhar”; landing dark high-end; cognitive_events insert-only; schema reality check (gaps CEP, trauma_log, metabolism). |
| **04/02** | Selamento: contrato [TRIGGER_SCHEDULING], PROTOCOLO_APP_COMMANDS_V2; Git (main/master, repo isolado); modelo GPT→Core→Front e “onde está no código”; CAS, fix RLS, epistemologia do cuidado. |
| **05/02** | Gatilhos de agendamento ampliados; regra &lt; 10 palavras; documento mestre e EVOLUCOES_PARA_MELHOR; análise do Core em camadas; COS como Kernel de Doutrina. |
| **06/02** | Terminais (Paciente em foco unificado, Evolução e Analytics, escala 85%); header unificado e triggers por perfil; fix loops React (useRef); videochamada (solicitação, notificação, RLS, isolamento); scripts SQL e vinculação. |
| **07/02** | WebRTC real (useWebRTCRoom, Realtime signaling); fix videoCallRoomId/videoCallInitiator; Deno.serve nas Edge Functions; CORS via RPC/insert; maybeSingle (sem 406); viva-voz e câmera em áudio; Admin Chat mobile drawer. |
| **08/02** | Fix 406 (UPDATE sem .select() + SELECT); quem aceita sempre entra na sala; polling para puxar requester (getRequestById, 1,5 s); remoção do aviso "Nenhum admin encontrado". Videochamada em andamento, ainda não 100%. |

**Em uma frase:** Nos últimos dias consolidamos a governança do Core (triggers selados, invariantes), a experiência dos terminais e do header, o fluxo de videochamada com solicitação/notificação/RLS/WebRTC e o polimento (CORS, 406, polling requester, console); videochamada no caminho, ainda não 100% concretizada.

### Índice de documentos fonte

| Documento | Período / foco |
|-----------|-----------------|
| `DIARIO_DE_BORDO_CURSOR_03-02-2026.md` | 03/02 — Auditoria Core, triggers, invariantes, plano fases, schema check. |
| `DIARIO_DE_BORDO_DIA_03.md` | 03/02 — Landing, UX agendamentos, noite (agenda vs agendar, widget determinístico); registro Git e selagem 04/02. |
| `DIARIO_SELAMENTO_0402.md` | 04/02 — Modelo correto avaliação + agendamento; onde está no código; uso como modelo. |
| `DIARIO_MESTRE_COMPLETO_05-02-2026.md` | 05/02 — Gatilhos, regra 10 palavras, análise Core, COS. |
| `DIARIO_LIVRO_MAGNO_06-02-2026.md` | 06/02 e 07/02 — Timeline 04→06, fluxo Core, terminais, WebRTC. |
| `DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` | 05–06 e 07/02 — Videochamada, RLS, isolamento, scripts, WebRTC. |
| `LIVRO_MAGNO_DIARIO_UNIFICADO.md` | Linha do tempo longa (dez/25 → fev/26); termos para o Livro Magno. |

Para detalhes técnicos de um dia específico, use o documento fonte indicado na seção daquele dia.

### Lições aprendidas (últimos 7 dias)

- **RLS:** Políticas que referenciam outras tabelas com RLS podem causar recursão infinita; funções SECURITY DEFINER que leem as tabelas necessárias e retornam boolean evitam o problema. Sempre testar com usuários de cada perfil (admin, profissional, paciente).
- **Schema real vs código:** Antes de scripts em massa, verificar colunas existentes (name em auth.users, created_at em chat_participants, doctor_id vs professional_id). Usar COALESCE e SQL dinâmico quando a estrutura variar.
- **Triggers e resiliência:** Depender só do GPT para emitir uma tag deixa o sistema frágil; derivação por palavra-chave (heurísticas) como fallback mantém o widget de agendamento e outras ações previsíveis. Documentar como “Mundo B” e auditar como DETERMINISTIC_TRIGGER.
- **Videochamada:** Sem WebRTC (ou serviço equivalente), cada lado só tem o próprio stream; o “outro” só aparece quando há PeerConnection e sinalização (offer/answer/ICE). Usar o mesmo roomId (ex.: request_id) nos dois lados e um canal Realtime dedicado simplifica a implementação.
- **CORS em Edge Functions:** Chamar a função a partir do browser com JWT pode gerar 401 no preflight; criar o recurso (ex.: notificação) por RPC ou insert direto no front evita a chamada HTTP à função e elimina o problema no localhost.

---

**Última atualização:** 08/02/2026  
**Mantido como:** fonte única da timeline dos últimos 7–8 dias (03 a 08 de Fevereiro de 2026). **Máximo:** ~1000 linhas.
