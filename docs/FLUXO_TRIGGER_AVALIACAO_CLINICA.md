# Fluxo do trigger da avaliação clínica — do usuário ao chat

## Visão em uma frase

O usuário faz a avaliação (10 etapas no chat). Quando o **encerramento** acontece — seja porque o protocolo chegou ao passo 10, seja porque o usuário pede para **encerrar/parar** — o **GPT** (via Core) inclui a tag **`[ASSESSMENT_COMPLETED]`** na resposta. O **app** detecta essa tag, marca a avaliação como concluída, gera o relatório e mostra no chat um **card** “Avaliação Concluída” com botão para ver o relatório.

**Verdade absoluta:** o usuário **não gera** o trigger. Ele só dá sinais humanos (ex.: "ok", "finalizar", "podemos concluir", silêncio após o passo 10). O **GPT interpreta** que o ciclo está completo e **emite** `[ASSESSMENT_COMPLETED]`. O trigger é um **ato cognitivo do GPT**; o Core só repassa; o front só executa.

---

## 1. Interação usuário ↔ GPT (Core)

- O **usuário** escreve/fala no chat (ex.: responde às perguntas da Nôa ou diz “quero encerrar a avaliação” / “pode parar” / “finalizar”).
- O **frontend** envia a mensagem para o **Core** (Edge Function `tradevision-core`) junto com:
  - `message`, `conversationHistory`, `patientData`, `assessmentPhase`, `nextQuestionHint`, etc.
- O **Core** monta o prompt clínico (AEC 001 — 10 etapas) e envia para o **GPT**. No prompt está escrito:
  - **Passo 10 – ENCERRAMENTO:** ao final dessa fala, o modelo **DEVE** incluir a tag **`[ASSESSMENT_COMPLETED]`**.
- O modelo segue o protocolo: quando chega ao encerramento (ou quando o usuário pede para encerrar/parar), responde com o texto de encerramento **e** a tag **`[ASSESSMENT_COMPLETED]`** no texto.
- O **Core** devolve a resposta do GPT **sem alterar o texto** (a tag vem em `data.text`).

Ou seja: **quem “dispara” o trigger é o GPT**, ao colocar a tag na resposta, seguindo o passo 10 ou atendendo ao pedido de encerrar/parar.

---

## 2. App recebe a resposta (noaResidentAI)

- O **noaResidentAI** chama o Core e recebe `data.text` e `data.metadata`.
- **Se** `data.text` contiver **`[ASSESSMENT_COMPLETED]`**:
  1. **Remove** a tag do texto que será exibido:  
     `aiContent = aiContent.replace('[ASSESSMENT_COMPLETED]', '').trim()`
  2. Marca **`isCompleted = true`**.
  3. **Dispara o fluxo de finalização** no front:
     - Garante estado do `clinicalAssessmentFlow` (cria se não existir).
     - Chama `clinicalAssessmentFlow.completeAssessment(userId)`.
     - Chama `clinicalAssessmentFlow.generateReport(userId, userId)` → isso chama a Edge Function com **`action: 'finalize_assessment'`** e salva o relatório no banco.
  4. Devolve para o hook de conversa um objeto com **`metadata.assessmentCompleted: true`**.

Ou seja: **o trigger é a tag no texto**; o app **não** depende de um campo separado do Core para “avaliação concluída” — usa a presença da tag para setar `assessmentCompleted` e rodar o fluxo de relatório.

---

## 3. Hook de conversa (useMedCannLabConversation)

- Quando **`response.metadata?.assessmentCompleted === true`**:
  1. Após ~1 s (`setTimeout(..., 1000)`), **adiciona uma mensagem de sistema** ao chat:
     - `role: 'system'`
     - `metadata.type: 'action_card'`
     - Conteúdo: “✅ **Avaliação Concluída com Sucesso!** …” + instrução para ver o relatório na aba “Analytics e Evolução”.
  2. Essa mensagem é a que o usuário **vê** como o card verde “Avaliação Concluída”.

Ou seja: **o trigger (tag) vira** `metadata.assessmentCompleted` **e isso vira** uma mensagem especial **no chat**.

---

## 4. O que o usuário vê no chat (NoaConversationalInterface)

- As mensagens normais da Nôa e do usuário são renderizadas como de costume.
- Quando existe uma mensagem com **`role === 'system'`** e **`metadata?.type === 'action_card'`**, o componente **não** mostra como bolha de texto: mostra o **card** “Avaliação Concluída” (fundo verde, ícone, texto de sucesso e botão **“Ver Relatório Clínico”**).
- O botão navega para **`/app/clinica/paciente/dashboard?section=analytics`** e pode fechar o chat.

Ou seja: **a resposta “pro chat” do trigger** é exatamente esse **card** que o usuário vê; o texto da última fala da Nôa (já sem a tag) continua acima, e abaixo aparece o card.

---

## 5. Resumo do fluxo (lógica do trigger)

| Etapa | Onde | O quê |
|-------|------|--------|
| 1 | **Usuário** | Fala/escreve (responde às etapas ou pede “encerrar” / “parar” / “finalizar”). |
| 2 | **Frontend** | Envia `message` + `assessmentPhase`, etc., para o **Core**. |
| 3 | **Core** | Monta prompt com as 10 etapas e instrução: ao **passo 10 (ENCERRAMENTO)** incluir **`[ASSESSMENT_COMPLETED]`**. |
| 4 | **GPT** | Responde com texto de encerramento **+** tag **`[ASSESSMENT_COMPLETED]`** no texto. |
| 5 | **Core** | Devolve **`{ text: aiResponse, metadata: ... }`** (texto com a tag). |
| 6 | **noaResidentAI** | Detecta a tag → remove do texto, seta **`assessmentCompleted: true`**, chama **clinicalAssessmentFlow** (complete + generateReport → `finalize_assessment` no Core). |
| 7 | **useMedCannLabConversation** | Se **`metadata.assessmentCompleted`** → adiciona mensagem de sistema **action_card** ao chat. |
| 8 | **NoaConversationalInterface** | Renderiza essa mensagem como **card “Avaliação Concluída”** com botão “Ver Relatório Clínico”. |

---

## 6. Quando o trigger dispara

- **Ao chegar ao passo 10 (ENCERRAMENTO)** do protocolo: o prompt manda o modelo incluir a tag ao final dessa fala.
- **Quando o usuário pede para encerrar/parar/finalizar** a avaliação: o modelo pode antecipar o encerramento e, na resposta, incluir a tag (a lógica de “finalizar / encerrar / concluir” pode estar no agente conversacional do front, mas o **trigger que o app usa** é sempre **a tag na resposta do Core**).

O app **não** depende do usuário dizer literalmente “sou admin” ou “sou profissional” para esse fluxo; o perfil vem do **login** (enviado no request). O trigger da avaliação é **só** a tag **`[ASSESSMENT_COMPLETED]`** na resposta do GPT via Core → app → card no chat.
