# Core em acordo com o modelo (trigger invisível / chat como hub)

Checklist do que o **tradevision-core** precisa cumprir para estar de acordo com o modelo real (doc `MODELO_REAL_CHAT_HUB_TRIGGER_INVISIVEL.md`).

---

## 1. Receber do chat e montar contexto

| Exigência | Status no Core |
|-----------|-----------------|
| Receber mensagem do usuário | ✅ `body.message` |
| Receber contexto (quem é o usuário, perfil) | ✅ `patientData` (user, type/user_type/role) |
| Não decidir UI sozinho; só enviar prompt ao GPT | ✅ Core monta prompt e chama GPT; ações vêm de trigger/comandos |

---

## 2. Governança por perfil (trigger só se o perfil puder)

| Exigência | Status no Core |
|-----------|-----------------|
| Ter perfil canônico por request | ✅ `userRole` = normalizeRole(patientData?.user?.user_type \|\| type \|\| role) |
| Nunca enviar comandos que o perfil não pode executar | ✅ `filterAppCommandsByRole(rawCommands, userRole)` antes de retornar |
| Documento literal só para pro/admin | ✅ `canOpenLiteral = userRole === 'admin' \|\| master \|\| professional'` no fluxo documental |
| Lista de documentos filtrada por target_audience para paciente/aluno | ✅ Filtro por `userRole` e `target_audience` na busca |

---

## 3. Trigger: GPT emite → Core governa → app_commands a partir do trigger (modelo selado)

| Exigência | Status no Core |
|-----------|-----------------|
| GPT emite trigger semântico (ex.: [NAVIGATE_TERMINAL], [NAVIGATE_AGENDA]) quando usuário pede | ✅ Prompt CLINICAL com regra 3 (NAVEGAÇÃO E TERMINAL) lista todas as tags |
| Core extrai app_commands **a partir** dos triggers na resposta do GPT | ✅ `parseTriggersFromGPTResponse(aiResponse)` (inclui NAVIGATE_*, DOCUMENT_LIST, etc.) |
| Se GPT não emitiu trigger, fallback por palavra-chave (Mundo B transicional) | ✅ `rawCommands = fromGPT.length > 0 ? fromGPT : deriveAppCommandsV1(message)` |
| Ignorar blocos injetados (RAG, contexto) na derivação por palavra-chave | ✅ `stripInjectedContext(message)` em deriveAppCommandsV1 |
| Usuário nunca vê as tags do GPT | ✅ `stripGPTTriggerTags(aiResponse)` → texto limpo |
| Documentos (lista): GPT emite [DOCUMENT_LIST] → Core governa (busca + pending) e injeta texto da lista | ✅ `runDocumentListFlowFromTrigger` chamado quando `aiResponse` contém `[DOCUMENT_LIST]`; `document-list` em app_commands |

---

## 4. Retorno: texto + metadata + comandos (contrato)

| Exigência | Status no Core |
|-----------|-----------------|
| Retornar `text` (resposta para exibir; o front remove trigger do texto) | ✅ `text: finalText` (pode conter [TRIGGER_ACTION]; front remove) |
| Retornar `metadata` com flags determinísticas (trigger_scheduling, role, intent) | ✅ `metadata.trigger_scheduling`, `metadata.role`, `metadata.intent`, etc. |
| Retornar `app_commands` (terminal, documento, navegação) quando houver ação governada | ✅ `app_commands` (já filtrados por perfil) |
| Quando há app_commands, sinalizar no texto com [TRIGGER_ACTION] (front remove) | ✅ `textWithActionToken(aiResponse, app_commands)` |

---

## 5. Agendamento (tag no GPT + governança)

| Exigência | Status no Core |
|-----------|-----------------|
| Prompt instruir GPT a incluir [TRIGGER_SCHEDULING] quando for agendamento | ✅ CLINICAL_PROMPT e phaseInstruction |
| Se GPT incluir a tag, confiar e setar trigger_scheduling = true | ✅ Não ignorar mais a tag; shouldTriggerScheduling = true |
| Enviar metadata.trigger_scheduling para o front abrir o widget | ✅ `metadata.trigger_scheduling: shouldTriggerScheduling` |

---

## 6. Avaliação clínica (tag no GPT)

| Exigência | Status no Core |
|-----------|-----------------|
| Prompt instruir GPT a incluir [ASSESSMENT_COMPLETED] no encerramento (passo 10) | ✅ Passo 10 no CLINICAL_PROMPT |
| Repassar o texto do GPT ao front (sem remover a tag; o cliente noaResidentAI detecta e trata) | ✅ Core devolve `text` do GPT; o app (noaResidentAI) detecta a tag e gera o card |

---

## Resumo: o Core está em acordo?

- **Sim**, desde que:
  1. `userRole` seja sempre definido a partir do request (e quando for `unknown`, não filtrar comandos, para não quebrar fluxo).
  2. `stripInjectedContext` seja usado em todo lugar onde se deriva intent/app_commands da mensagem.
  3. O retorno seja sempre `{ text, metadata, app_commands }` com governança já aplicada.

Nenhuma alteração obrigatória no código para “estar de acordo”; este doc serve de **checklist de conformidade** e de referência para futuras mudanças no Core.

---

## Reality check: análise do “GPT amigo” sobre deriveAppCommandsV1

**Pergunta:** O que o outro GPT disse está correto ou é delírio? (“Core ainda decide”, “deriveAppCommandsV1 é legado”, “precisa matar deriveAppCommandsV1 para ficar 100% ouro”.)

**Veredito: em grande parte correto; a conclusão “ainda decide no caminho principal” está errada.**

### O que o GPT amigo acertou

1. **deriveAppCommandsV1 é legado / compatibilidade**  
   No código está explícito: *“Se o GPT não emitiu nenhum, fallback: deriveAppCommandsV1(message) (Mundo B transicional).”*

2. **O modelo ouro é: GPT emite → Core parse → governa → materializa**  
   Esse é exatamente o fluxo implementado: `parseTriggersFromGPTResponse(aiResponse)` gera os comandos a partir das tags do GPT; depois `filterAppCommandsByRole`; depois retorno.

3. **Avaliação clínica / agendamento / documentos via trigger = ouro**  
   Correto. Navegação/terminal/abas hoje são **híbridos** no sentido de que, quando o GPT **não** emite tag, cai no fallback por palavra-chave.

### O que o GPT amigo errou ou exagerou

1. **“Aqui o Core ainda decide” no caminho principal**  
   **Falso.** No caminho principal o Core **não** decide a ação a partir da fala; decide só a partir da **resposta do GPT** (tags). A linha é:
   ```ts
   let rawCommands = fromGPT.length > 0 ? fromGPT : deriveAppCommandsV1(message)
   ```
   Ou seja: **se o GPT emitiu qualquer trigger, usa só os comandos derivados do GPT.** O Core só “interpreta a fala” quando `fromGPT.length === 0` (fallback).

2. **“Precisa matar deriveAppCommandsV1 para ficar 100% ouro”**  
   É uma **escolha de desenho**, não uma falha. Hoje:
   - **100% ouro no fluxo:** GPT emite → Core parse → governa → materializa. ✅
   - **Resiliência:** Se o GPT esquecer a tag, o usuário ainda recebe a ação via `deriveAppCommandsV1`. Remover o fallback deixa o sistema mais “puro” e mais **frágil** (depende 100% do GPT lembrar da tag).

### Tabela real (código atual)

| Camada | Status real |
|--------|-------------|
| Quem gera app_commands quando GPT emitiu tag? | **Só** `parseTriggersFromGPTResponse(aiResponse)` |
| Quando entra deriveAppCommandsV1? | **Só** quando `fromGPT.length === 0` |
| Core “interpreta fala” no caminho principal? | **Não** — interpreta a **resposta do GPT** (tags) |
| deriveAppCommandsV1 é legado? | **Sim** — comentário no código: “Mundo B transicional” |

### Conclusão

- O **modelo ouro já está em produção** no caminho principal: GPT emite → Core parse → governa → materializa.
- **deriveAppCommandsV1** é fallback de resiliência, não a fonte primária de decisão. Chamar de “modelo antigo” faz sentido; dizer que “o Core ainda decide (no principal)” não bate com o código.
- **Remover** o fallback é refactor válido para “100% ouro” e mais dependência do prompt/LLM; **manter** é refactor válido para robustez. Nenhum dos dois é delírio; a análise do GPT amigo está em geral correta, com o ajuste acima.

---

## Fechamento: tudo alinhado

- **Avaliação clínica** e **agendamento**: modelos selados; não editar.
- **Resto** (terminal, abas, navegação, documentos): mesma lógica — GPT emite tag → Core extrai com `parseTriggersFromGPTResponse` → `stripGPTTriggerTags` → `filterAppCommandsByRole` → retorno `app_commands`. Só mudam o nome do trigger e as palavras-chave no prompt.
- **deriveAppCommandsV1:** usado apenas quando o GPT não emitiu nenhum trigger (fallback “Mundo B transicional”).
- Um fluxo, vários triggers. Tudo alinhado.
