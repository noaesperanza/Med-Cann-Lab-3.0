# Invariante: Modelo de Execução da Nôa (NUNCA redesenhar o que já funciona)

## Propósito
Este documento existe para evitar “alucinação de engenharia”: mudanças que **substituem** um fluxo funcional por outro “mais bonito”, mas **incompatível** com o modelo real do MedCannLab.

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

**Não pode depender** do GPT “lembrar” uma tag no texto para funcionar.

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
- Corrigir **ambiguidade** (ex.: “agenda” ≠ “agendar”)
- Remover **ponto único de falha** (ex.: widget depender apenas de tag do LLM)
- Adicionar **novo comando** (`app_commands`) mantendo o antigo funcionando
- Melhorias de UX que não mudam o fluxo (apenas layout/compactação)

### Proibido
- Trocar o pipeline real por um pipeline “ideal” sem necessidade
- Mover execução para “texto do GPT” (ex.: “eu agendei” → sem RPC/confirm)
- Criar novos triggers que conflitem com os antigos sem versão/guard rails

---

## Exemplo concreto (agendamento)
### Correto (modelo do app)
- Usuário pede: “agendar / marcar / ver horários”
- Sistema deriva **sinal determinístico** (flag/command) → UI abre widget
- GPT pode falar o que quiser, mas o widget independe do texto

### Incorreto (anti‑modelo)
- GPT pede dados manualmente e “promete” agendar sem abrir widget / sem confirmação do app

---

## Checklist de sanidade antes de alterar qualquer coisa
- Isso substitui um fluxo que já funciona? **Se sim: NÃO fazer.**
- Isso só sela um bug/ambiguidade e mantém retrocompatibilidade? **OK.**
- Existe um fallback determinístico se o LLM errar? **Obrigatório.**
- A ação crítica exige confirmação/execução determinística? **Obrigatório.**

