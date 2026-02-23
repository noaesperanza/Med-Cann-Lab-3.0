# Diário Mestre Completo — 05/02/2026

**Data:** 05 de Fevereiro de 2026  
**Escopo:** Consolidação dos últimos dias (Livro Magno + Selamento + Evolução Append-Only), análise completa do TradeVision Core e ponto de vista sobre o modelo.

---

## 1. Contexto dos últimos 3 dias (Livro Magno + Selamento)

### 03/02 — Auditoria operacional e invariantes
- **Fonte unificada da sessão:** `DIARIO_DE_BORDO_CURSOR_03-02-2026.md`.
- **Agendamentos determinísticos:** `metadata.trigger_scheduling` passou a ser derivado por palavra-chave (não depender só do modelo “lembrar” `[TRIGGER_SCHEDULING]`).
- **Separação semântica:** “Abrir agenda/minha agenda” = navegação (lugar); “Agendar/marcar/ver horários” = widget no chat (ação).
- **Lei curta:** `INVARIANTE_MODELO_EXECUCAO_NOA.md` — não redesenhar; só selar e acrescentar.

### 03/02 (sessão 2) — Refino de triggers
- Cancelamento de documentos: regex restrita a “cancelar/cancela/cancel”.
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
- **hasScheduleVerb:** incluídos “gostaria de marcar”, “gostaria de agendar”, “quero marcar”, “preciso marcar”.
- **hasConsultIntent:** ampliado com “preciso de consulta”, “gostaria de consulta”, “agendar com (dr/médico/doutor/profissional)”, “marcar com (dr/médico/doutor)”, “horário com (dr/médico/doutor)”, “marcar consulta”, “agendar consulta”.
- **Confirmações curtas:** lista expandida: “quero”, “pode ser”, “por favor”, “claro”, “isso”, “pode”, “faca/faça”, “manda aí”, “envia aí”.

### 2.2 Regra “mensagem curta” em contexto de agendamento
- **isShortMessageInSchedulingContext:** se a mensagem tem **≤ 10 palavras**, a última resposta da assistente era sobre agendamento, e a mensagem **não** é de “lugar” (ver agendamento, me levar, etc.) nem negativa (não, cancelar), então **abre o card** no chat.
- Objetivo: respostas curtas (“sim”, “quero”, “pode ser”, “com o Ricardo”) em contexto de agendamento não exigirem nova frase longa; o sistema trata como continuação e abre o widget.

### 2.3 Prompt do GPT
- Lista de exemplos para `[TRIGGER_SCHEDULING]` atualizada com as novas formas de falar e a nota: “Em contexto de agendamento, respostas curtas também abrem o card.”

### 2.4 Frontend (sessão anterior, referência)
- Leitura correta de `trigger_scheduling` e `professionalId` (metadata do Core em `message.metadata.metadata` ou no topo).
- Hook expõe `trigger_scheduling` e `professionalId` no topo da mensagem para a UI.
- Core: primeira mensagem de agendamento (“quero marcar consulta com X”) gera texto fixo e direto; confirmação “abrir” gera texto claro e remove navegação para aba.

---

## 3. Análise completa do Core (TradeVision Core)

### 3.1 O que é o Core
- **Única Edge Function** que processa o chat da Nôa em produção (`tradevision-core/index.ts`).
- Recebe: `message`, `conversationHistory`, `patientData` (user, type), `ui_context`, etc.
- Retorna: `{ text, metadata, app_commands }` com governança já aplicada (perfil, triggers, strip de tags).

### 3.2 Fluxo em camadas (modelo selado)
1. **Normalização e contexto:** `normalizePt(message)`, histórico, última mensagem da assistente.
2. **Heurísticas determinísticas (antes do GPT):**  
   - Agendamento: `lastWasSchedulingOffer`, `isShortSchedulingConfirmation`, `isAgendaPlacePhrase`, `isAgendaNavigationOnly`, `hasScheduleVerb`, `hasConsultIntent`, `isShortMessageInSchedulingContext`, `shouldTriggerSchedulingWidget`.  
   - Documentos: `parseConfirmationSelection`, `detectDocumentRequest`, `detectDocumentListRequest`, fluxo de pending.  
   - Navegação: `deriveAppCommandsV1(message)` (fallback quando o GPT não emite tag).
3. **Chamada ao GPT:** prompt CLINICAL (AEC 001, agendamento, navegação, documentos, bloqueio de assuntos) + phaseInstruction + RAG (base de conhecimento).
4. **Pós-GPT:**  
   - Leitura de tags na resposta: `[TRIGGER_SCHEDULING]`, `[NAVIGATE_*]`, `[DOCUMENT_LIST]`, etc.  
   - `parseTriggersFromGPTResponse(aiResponse)` → `app_commands`.  
   - Se o GPT não emitiu nenhum trigger: `rawCommands = deriveAppCommandsV1(message)` (Mundo B).  
   - `shouldTriggerScheduling` = tag do GPT ou heurística; texto da primeira mensagem de agendamento e da confirmação curta sobrescritos para clareza.  
   - Remoção de `navigate-section` para `agendamentos` quando `shouldTriggerScheduling` é true.  
   - `filterAppCommandsByRole(rawCommands, userRole)` → comandos finais.  
   - Retorno: `text` (sem tags visíveis), `metadata.trigger_scheduling`, `metadata.professionalId`, `app_commands`.

### 3.3 Por que o Core é assim (contexto de criação)
- **Fala ≠ Ação:** o usuário não “gera” trigger; dá sinais. O **GPT interpreta** e emite a tag; o **Core governa** e materializa; o **Front executa**. Isso está explícito em `DIARIO_SELAMENTO_0402.md` e em `INVARIANTE_MODELO_EXECUCAO_NOA.md`.
- **Não depender só do GPT:** “O sistema deve abrir widgets/navegar por metadata.* e app_commands (…) Não pode depender do GPT lembrar uma tag no texto para funcionar.” Por isso existe o **fallback determinístico** (palavras-chave + heurísticas) e `trigger_scheduling` derivado também por keyword.
- **Agendamento e avaliação clínica = modelos selados:** não redesenhar; só acrescentar exemplos e regras compatíveis (append-only).
- **Um fluxo, vários triggers:** o mesmo pipeline (GPT → parse → governança → app_commands) serve para terminal, agenda, documentos, etc.; mudam o nome do trigger e as palavras-chave no prompt.

### 3.4 Pontos que outras IAs podem subestimar
- **“O Core ainda decide pela fala”:** Falso no caminho principal. Quando o GPT emite qualquer trigger, os comandos vêm **só** de `parseTriggersFromGPTResponse(aiResponse)`. O Core só usa a fala no fallback (`fromGPT.length === 0`).
- **“deriveAppCommandsV1 é legado, tem que matar”:** É fallback de **resiliência**. Remover deixa o sistema 100% dependente do GPT lembrar da tag; manter é escolha de robustez (documentado em `CORE_EM_ACORDO_COM_O_MODELO.md`).
- **“Agendar vs agendamento é confuso”:** Foi selado de propósito: **agendar** = ação → card no chat; **agendamento/agenda** = lugar → navegar para a aba. Não unificar os dois conceitos.

---

## 4. Ponto de vista (fechamento)

O Core não é “mais um backend de chat”. É o **Kernel de Governança** do MedCannLab: converte intenção (GPT + heurísticas) em ações auditáveis (metadata + app_commands), respeitando perfil, contrato de triggers e invariantes. A expansão de gatilhos e a regra de mensagens curtas (< 10 palavras) em contexto de agendamento seguem a política **append-only** e **não substituem** o fluxo existente; apenas **aumentam a cobertura** de como o usuário pode falar, sem quebrar “ver agendamento” = lugar e “agendar” = ação. O Livro Magno e o Diário de Selamento existem para que qualquer IA ou desenvolvedor entenda **por que** as decisões foram tomadas e **não** as reverta por “limpeza” ou “simplificação”. O sistema é assim por design institucional e de segurança; a evolução é selar e acrescentar, nunca redesenhar o que já está selado.

---

## 5. Referências

| Documento | Conteúdo |
|-----------|----------|
| `LIVRO_MAGNO_DIARIO_UNIFICADO.md` | Linha do tempo unificada; COS v3→v5; selamento. |
| `DIARIO_SELAMENTO_0402.md` | Modelo correto: trigger no GPT → Core governa → Front executa. |
| `CORE_EM_ACORDO_COM_O_MODELO.md` | Checklist do Core; realidade sobre deriveAppCommandsV1. |
| `INVARIANTE_MODELO_EXECUCAO_NOA.md` | Fala ≠ ação; política de mudança; contrato `[TRIGGER_SCHEDULING]`. |
| `CHAT_PACIENTE_VS_PROFISSIONAL_E_TESTE_ADMIN.md` | Agendar vs agendamento; teste como admin. |
| `supabase/functions/tradevision-core/index.ts` | Implementação do Core. |
| `supabase/functions/tradevision-core/cos_engine.ts` | Kernel COS (lógica pura: veredito antes do GPT). |
| `supabase/functions/tradevision-core/cos_kernel.ts` | Ponto de entrada canônico do COS (re-export do engine). |
| `EVOLUCOES_PARA_MELHOR.md` | Evoluções identificadas e documentadas (append-only, selar/acrescentar). |

---

## 6. COS (Cognitive Operating System) — e fechamento

O **COS** não é “mais uma camada de configuração”. É o **Kernel de Doutrina**: responde, em lógica pura (sem chamar OpenAI nem Supabase), à pergunta *“O sistema pode pensar agora?”*.

- **Onde entra:** Antes de qualquer processamento de mensagem, o Core monta `COS_Context` (intent, mode, policy, metabolism, trauma) e chama `COS.evaluate(cosContext)`. Se `allowed === false`, o Core devolve imediatamente o `reason` e não chama o GPT.
- **Camadas do Kernel (cos_engine.ts):** (1) **Kill Switch** (mode OFF); (2) **Trauma institucional** (homeostase de sobrevivência — modo conservador); (3) **Metabolismo** (limite de decisões/dia → Silence Mode); (4) **Read-only** (escrita proibida); (5) **Policy** (ações proibidas por política).
- **Papel no caminho:** O Core = **COS (porta)** + heurísticas + GPT + governança. O COS é a porta: sem “sim” do Kernel, não há chamada ao modelo nem materialização de comandos. Isso fecha o desenho: doutrina (COS) → cognição (GPT) → governança (triggers, app_commands, perfil).

**Fechamento:** O Core vale a pena e o caminho está certo. O COS completa o triângulo: **doutrina (COS) + cognição (GPT) + execução (Front)**. Evolução continua append-only; o que está selado permanece.

---

**Documento mestre completo — 05/02/2026. Fechamento do ciclo de expansão de gatilhos, regra de mensagens curtas, análise do Core e do COS; contexto de criação preservado.**