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
- permitir evolução “por órbita” (append‑only), sem quebrar contratos.

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

> Nota: o sistema pode ter redundância segura (flags determinísticas) para não depender do LLM “lembrar” o token.

---

## Por que o trigger — e por que não dá para não usar

O GPT fala no chat com o usuário. Quem **intercepta** essa fala e diz ao app “agora mostre um card / um calendário / abra uma aba” é o **trigger** (token no texto ou sinal em `metadata`/`app_commands`). Sem esse ponto de interceptação, a resposta do modelo seria só texto; não haveria como o chat **renderizar** widget, card ou ação. Por isso a lógica do trigger é obrigatória: é o mesmo conceito em todos os fluxos.

**Mesma lógica, mesmo tipo de trigger, mesmo conceito:**

| Fluxo | Quando | O que o trigger faz no chat |
|-------|--------|-----------------------------|
| **Avaliação clínica** | Ao final da avaliação | Mensagem com **card** no chat (relatório / próximo passo). |
| **Agendamento** | Quando o usuário pede | **Calendário** renderizado **dentro do chat**. |
| **Documento** | Quando o usuário pede abrir | **Abrir aba** (ou modal inline) com o documento. |

Em todos os casos: GPT responde → Core (ou fluxo) emite trigger/metadata/app_commands → o chat **intercepta** e mostra o bloco certo (card, calendário, aba/modal). Um único conceito de “trigger” para “resposta do GPT + ação governada no chat”.

---

## Ações por perfil (já definido)

Cada perfil só executa **ações da sua esfera**. A governança está no Core e no banco (RLS); o frontend obedece aos comandos que o Core emite (e o Core só emite o que o perfil pode fazer).

| Perfil        | O que pode fazer (resumo) |
|---------------|---------------------------|
| **Paciente**  | Ações de paciente: agendar, avaliação clínica, ver conteúdos educativos/derivados (nunca doc bruto). |
| **Aluno**     | Ações de aluno: ensino, simulação, conteúdos didáticos validados (nunca doc bruto). |
| **Profissional** | Ações de pro: agendar, pacientes, relatórios, prescrição, abrir documento literal (após confirmação). |
| **Admin**     | Ações de admin: tudo acima + governança, upload, políticas, logs. |

**Fonte de verdade (detalhe):** `docs/PLANO_MESTRE_ATIVACAO_DOCUMENTAL_POR_PERFIL.md` — hierarquia documental, catálogos por perfil e fluxo em 2 estágios.

---

## Canais de sinalização (Core → Front)
O Core retorna:
- `text`: fala (string)
- `metadata`: flags e contexto (objeto)
- `app_commands`: comandos estruturados (array)

### Prioridade recomendada para execução no Front
1) **`metadata.*`** (flags determinísticas)
2) **`app_commands`** (allow‑list; determinístico no Core)
3) **Tokens no texto** (`[TRIGGER_*]`) como contrato semântico (não como ponto único de falha)
4) **Eventos locais** (`noaCommand`) como fallback/retrocompatibilidade

---

## Trigger de agendamento (Scheduling)

### Contrato semântico (texto)
- Se o LLM inserir `text` contendo **`[TRIGGER_SCHEDULING]`**, o frontend pode abrir o widget.
- O Core **pode manter o token no texto** (para compatibilidade e auditoria visual).

**Escopo (para evitar interpretação errada):**
- `"[TRIGGER_SCHEDULING]"` é um contrato **nomeado** para o domínio **agendamento** (abrir widget/horários).
- Ele não deve ser reutilizado como “token universal” para outras ações (documentos, navegação, etc.).
- Para ações gerais do app, o canal universal é `metadata.*` e `app_commands` (allow-list).

### Token universal de ação (`[TRIGGER_ACTION]`)
- O Core **anexa** `[TRIGGER_ACTION]` ao `text` sempre que a resposta incluir `app_commands` (ações governadas).
- O **frontend oculta** o token na exibição (não altera a execução; a execução é via `metadata`/`app_commands`).
- O token **não dispara** nenhuma ação por si só; é apenas contrato de UX/auditoria.

**Por quê `[TRIGGER_ACTION]`?**
- Não conflita com `[TRIGGER_SCHEDULING]`
- Não carrega semântica de domínio (documento, navegação, etc.)
- Não quebra contratos existentes
- É semanticamente neutro e universal
- Representa: *"Existe ação governada nesta resposta"*

---

## Regra institucional dos tokens (contrato)

| Token | Papel |
|-------|--------|
| **`[TRIGGER_ACTION]`** | Marcador **universal** de existência de ação governada (app_commands/metadata). Não indica qual ação; só que há ação. |
| **`[TRIGGER_SCHEDULING]`** | Marcador **específico e imutável** de agendamento clínico (widget de horários). Domínio único: scheduling. |

- Os dois **coexistem**: uma resposta pode conter ambos (ex.: agendar + abrir documento).
- O frontend **não remove** a lógica de `[TRIGGER_SCHEDULING]`; apenas **acrescenta** o tratamento de exibição de `[TRIGGER_ACTION]`.

### Contrato determinístico (metadata)
O Core pode enviar:
- `metadata.trigger_scheduling: boolean`

Regras:
- `true` abre widget, mesmo se o LLM não inseriu a tag.
- `false` não abre widget (fail‑closed), mesmo que o texto “pareça” pedir.

---

## `app_commands` (comandos estruturados)

### Forma (v2 mantém v1)
Cada comando é:
- `kind: "noa_command"`
- `command: { type, target, label?, fallbackRoute?, payload? }`

### Allow‑list
Somente tipos permitidos devem ser executados (qualquer outro é ignorado):
- `navigate-section`
- `navigate-route`
- `show-prescription`
- `filter-patients`
- `open-document`
- `show-document-inline`
- `document-list` (quando o GPT emite `[DOCUMENT_LIST]`; Core injeta a lista e pode enviar este comando)

### Selado vs Falta (status institucional)

**SELADO (OK)** — lógica e contrato definidos; código pronto: **Avaliação clínica** (ao final → card no chat). **Agendamento** (ao pedir → calendário no chat). **Direcionamento de rota (profissionais)**: profissional pede pelo chat "abrir agenda", "clínica de atendimento", "pacientes", "relatórios", "biblioteca" → GPT emite tag → Core emite `navigate-route`/`navigate-section` → Layout navega. **Documentos (lista)**: usuário pede "quais documentos" → GPT emite `[DOCUMENT_LIST]` → Core governa (busca + pending) e injeta lista na resposta; comando `document-list` quando aplicável.

**FALTA** — **Prescrição/filtro a partir do chat**: opcional fallback no Layout para navegar ao dashboard. Fluxo documental (confirmação "1" → abrir doc) depende de migration `noa_pending_actions` + deploy `tradevision-core`.

### Regra de derivação (segurança)
`app_commands` deve ser derivado **apenas da fala do usuário**, nunca de contexto injetado (RAG / “Contexto da Plataforma”).

---

## Auditoria (CEP) — “por quê isso abriu?”
Toda abertura de widget/ação de navegação relevante deve gerar `cognitive_events` non‑blocking contendo:
- `trigger` (nome)
- `origin` (ex.: `AI_RESPONSE_TAG` vs `DETERMINISTIC_TRIGGER`)
- `preconditions` (se aplicável)
- `ui_context` (rota/tela, quando disponível)
- `version` (se houver)

---

## Versionamento de trigger (sem quebrar)
Se for necessário versionar, há 2 formas permitidas:

### A) Versionar só em metadata/evento (zero risco)
- manter `text` com o token base
- registrar `metadata.trigger_version = "v1"` e/ou `cognitive_events.metadata.version`

### B) Versionar no texto (somente se retrocompatível)
- `...[TRIGGER_SCHEDULING] [TRIGGER_SCHEDULING:v1]`
- o frontend **continua aceitando** o token base.

