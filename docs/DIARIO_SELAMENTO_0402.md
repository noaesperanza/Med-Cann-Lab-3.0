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
| 3 | Core | Monta prompt com as 10 etapas AEC 001; no **passo 10** instrui: incluir **`[ASSESSMENT_COMPLETED]`** ao final da fala. Chama OpenAI; recebe `completion.choices[0].message.content`. |
| 4 | GPT | Responde com texto de encerramento **+** tag **`[ASSESSMENT_COMPLETED]`** no texto. |
| 5 | Core | Devolve `{ text: aiResponse, metadata: { ... } }` **sem** remover a tag (tag vai em `text`). |
| 6 | noaResidentAI | Detecta `aiContent.includes('[ASSESSMENT_COMPLETED]')` → `aiContent = aiContent.replace('[ASSESSMENT_COMPLETED]', '').trim()` → `isCompleted = true` → chama `clinicalAssessmentFlow.completeAssessment(userId)` e `generateReport` (Edge Function `finalize_assessment`) → devolve `metadata: { assessmentCompleted: true, ... }`. |
| 7 | useMedCannLabConversation | Se `response.metadata?.assessmentCompleted` → adiciona mensagem `role: 'system'`, `metadata.type: 'action_card'`, conteúdo do card. |
| 8 | NoaConversationalInterface | Renderiza essa mensagem como card verde "Avaliação Concluída" com botão "Ver Relatório Clínico". |

### 1.4 Verdade absoluta (avaliação clínica)

O usuário **não gera** o trigger. Ele só dá sinais (ex.: "ok", "finalizar", silêncio após o passo 10). O **GPT interpreta** que o ciclo está completo e **emite** `[ASSESSMENT_COMPLETED]`. O trigger é um **ato cognitivo do GPT**. O Core só repassa o texto; o front detecta a tag e executa (card + relatório).

---

## Modelo 2: Trigger no Agendamento

### 2.1 Nome do trigger (contrato)

| Item | Valor real no código |
|------|----------------------|
| Tag (texto) | `[TRIGGER_SCHEDULING]` |
| Quem emite | GPT (no texto da resposta) |
| Quem governa | Core (lê a tag e seta `metadata.trigger_scheduling`) |
| Efeito no app | Widget de horários (SchedulingWidget) abaixo da mensagem no chat |

### 2.2 Onde está no código

| Camada | Arquivo | O quê |
|--------|---------|--------|
| **Constante** | `supabase/functions/tradevision-core/index.ts` | `const TRIGGER_SCHEDULING_TOKEN = '[TRIGGER_SCHEDULING]'`. Linha 13. |
| **Prompt (instrução ao GPT)** | `supabase/functions/tradevision-core/index.ts` | "Sempre que o assunto for agendamento, marcar consulta ou ver horários, você DEVE incluir a tag **[TRIGGER_SCHEDULING]** no final da sua resposta." Linha ~1407. Instruções adicionais em phaseInstruction (ex.: "Se o paciente confirmar... ADICIONE A TAG [TRIGGER_SCHEDULING]"). Linhas ~1732, 1758. |
| **Core (leitura da tag)** | `supabase/functions/tradevision-core/index.ts` | Após obter `aiResponse`: `if (aiResponse?.includes(TRIGGER_SCHEDULING_TOKEN)) { shouldTriggerScheduling = true }`. Registra evento em `cognitive_events` (AI_RESPONSE_TAG). Devolve `metadata.trigger_scheduling: shouldTriggerScheduling` no JSON de resposta. Linhas ~1834–1863, 1993. |
| **Repasse ao front** | `src/lib/noaResidentAI.ts` | `metadata: { ...data.metadata, ... }` — assim `trigger_scheduling` do Core chega ao hook. Linha ~1615. |
| **UI (exibição do widget)** | `src/components/NoaConversationalInterface.tsx` | Condição: `(message.metadata as any)?.trigger_scheduling === true` OU `message.content.includes(TRIGGER_SCHEDULING_TOKEN)`. Renderiza `<SchedulingWidget ... />` abaixo da mensagem. Texto da mensagem passa por `stripActionTokenForDisplay` (remove tokens; usuário não vê a tag). Linhas ~2308–2340. |
| **Tokens invisíveis** | Idem | `[TRIGGER_SCHEDULING]` em `INVISIBLE_DISPLAY_TOKENS` / `INVISIBLE_CONTENT_TOKENS`. |

### 2.3 Fluxo passo a passo (dados reais)

| Etapa | Onde | O quê (real) |
|-------|------|----------------|
| 1 | Usuário | Fala (ex.: "quero ver horários disponíveis para agendar", "quero agendar com o Dr. Ricardo"). |
| 2 | Frontend | Envia `message` e contexto para o Core. |
| 3 | Core | Monta prompt; instrui o GPT a incluir **`[TRIGGER_SCHEDULING]`** quando for agendamento/ver horários. Chama OpenAI. |
| 4 | GPT | Responde com texto (ex.: "Claro, veja os horários abaixo.") **+** tag **`[TRIGGER_SCHEDULING]`** no texto. |
| 5 | Core | Lê `aiResponse?.includes(TRIGGER_SCHEDULING_TOKEN)` → seta `shouldTriggerScheduling = true`. Opcional: registra `cognitive_events` com origin `AI_RESPONSE_TAG`. Devolve `{ text: aiResponse, metadata: { trigger_scheduling: true, ... }, app_commands }`. O Core **não** remove a tag do texto (o front remove na exibição). |
| 6 | noaResidentAI | Repassa `data.metadata` (incluindo `trigger_scheduling`) na resposta ao hook. |
| 7 | useMedCannLabConversation | Guarda a mensagem da assistente com `metadata` (incl. `trigger_scheduling`) e `content` (texto que pode ainda conter a tag até ser limpo no front). |
| 8 | NoaConversationalInterface | Para cada mensagem: se `metadata.trigger_scheduling === true` ou `content.includes(TRIGGER_SCHEDULING_TOKEN)` → renderiza o bloco do widget (mensagem + SchedulingWidget). Exibe o texto sem a tag (`stripActionTokenForDisplay`). |

### 2.4 Verdade absoluta (agendamento)

O usuário **não gera** o trigger. Ele só dá sinais ("quero ver horários", "agendar"). O **GPT interpreta** que é pedido de agendamento e **emite** `[TRIGGER_SCHEDULING]`. O Core **confia na tag** e seta `trigger_scheduling: true`; o front abre o widget. O trigger é um ato cognitivo do GPT.

---

## Uso como modelo para qualquer outra função do chat GPT no MedCannLab

Qualquer nova função do chat (terminal, abas, navegação, documentos, etc.) deve seguir o **mesmo padrão**:

1. **Nome do trigger** — Definir uma tag única (ex.: `[NAVIGATE_AGENDA]`, `[DOCUMENT_LIST]`).
2. **Prompt** — No Core, instruir o GPT a incluir essa tag no final da resposta quando interpretar a intenção correspondente (com palavras-chave/contexto no prompt).
3. **Core** — Ou (a) ler a tag na resposta e setar um flag em `metadata` (como no agendamento), ou (b) extrair a tag e converter em `app_commands` com `parseTriggersFromGPTResponse` (como navegação/documentos). Não inferir ação só da fala do usuário; sempre a partir da **resposta do GPT**.
4. **Front** — Remover a tag do texto exibido (lista de tokens invisíveis); executar a ação a partir de `metadata` ou `app_commands`.

**Resumo:** Um fluxo, vários triggers. O que muda é só o **nome do trigger** e as **palavras-chave** no prompt. Avaliação clínica e agendamento são os dois modelos selados; não editar. O resto já está alinhado no Core (GPT_TRIGGERS, parseTriggersFromGPTResponse, stripGPTTriggerTags, filterAppCommandsByRole).

---

## Referências de documentação e código

| Doc | Conteúdo |
|-----|----------|
| `docs/FLUXO_TRIGGER_AVALIACAO_CLINICA.md` | Fluxo completo do trigger da avaliação clínica. |
| `docs/MODELO_REAL_CHAT_HUB_TRIGGER_INVISIVEL.md` | Modelo real (chat hub, trigger invisível), verdade absoluta, tabela de camadas. |
| `docs/CORE_EM_ACORDO_COM_O_MODELO.md` | Checklist do Core e fechamento "tudo alinhado". |
| `docs/O_QUE_ESPERAR_CHAT_COMANDOS.md` | Regra-mãe, funcionalidades ativas, o que o usuário vê. |
| `docs/TRIGGERS_PALAVRAS_ACOES.md` | Palavras/frases que disparam ações e o que falta. |
| `supabase/functions/tradevision-core/index.ts` | Core: TRIGGER_SCHEDULING_TOKEN, CLINICAL_PROMPT (passo 10 e agendamento), leitura da tag, metadata.trigger_scheduling, GPT_TRIGGERS, parseTriggersFromGPTResponse. |
| `src/lib/noaResidentAI.ts` | Detecção de `[ASSESSMENT_COMPLETED]`, repasse de metadata. |
| `src/hooks/useMedCannLabConversation.ts` | action_card quando assessmentCompleted; strip de tokens ao salvar. |
| `src/components/NoaConversationalInterface.tsx` | Card avaliação, widget agendamento, stripActionTokenForDisplay, INVISIBLE_DISPLAY_TOKENS. |

---

**Documento mestre do dia de selamento 04/02 — completo. Avaliação clínica e agendamento como modelos de qualquer outra função do chat GPT no MedCannLab oficial.**
