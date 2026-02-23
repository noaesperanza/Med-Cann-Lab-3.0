# Protocolo `app_commands` v1 — Fluxo, segurança e execução (MedCannLab / Nôa)

> **Atualização:** Para a versão institucional (contrato imutável de triggers + canais de sinalização), ver `docs/PROTOCOLO_APP_COMMANDS_V2.md`.  
> Este documento v1 permanece como referência histórica/implementação inicial.

## Objetivo
Permitir que a Nôa **sugira ações de UI** (navegação/abrir seções/filtros read‑only) de forma:
- **retrocompatível** (chat continua sendo chat; texto sempre existe)
- **determinística** (não depende do LLM “inventar comando”)
- **auditável** (CEP registra sugestão)
- **segura** (execução só no frontend, com allow‑list)

Este protocolo NÃO executa escrita crítica no banco. Ele apenas orienta a interface.

---

## Invariante (não negociável)
Este protocolo existe para **acrescentar** agência sem “redesenhar o app”.

- Se um fluxo já funciona (ex.: widget/trigger), a mudança deve ser **append‑only** e retrocompatível.
- O app **não pode depender** do GPT “lembrar” tags no texto para executar UI.
- “Fala ≠ Ação”: execução é sempre determinística (allow‑list) e auditável.

Referência: `docs/INVARIANTE_MODELO_EXECUCAO_NOA.md`.

---

## Contrato de resposta (Core → Front)
O `tradevision-core` retorna um JSON com:
- `text`: texto gerado pelo LLM (fala da Nôa)
- `metadata`: flags e metadados (intenção, etc.)
- `app_commands`: **array de comandos estruturados**

O comando é um objeto versionado (v1):
- `kind: "noa_command"`
- `command: { type, target, label?, fallbackRoute?, payload? }`

---

## Tipos permitidos (MVP)
Hoje o executor permite apenas:
- `navigate-section`
- `navigate-route`
- `show-prescription`
- `filter-patients`

Qualquer outro tipo é ignorado (fail‑closed).

---

## Derivação no Core (determinístico)
O Core deriva `app_commands` via regex (não pelo modelo):
- Arquivo: `supabase/functions/tradevision-core/index.ts`
- Função: `deriveAppCommandsV1(message)`

### Regra de segurança crítica
`app_commands` é derivado **apenas da fala do usuário**, nunca de contexto injetado (RAG / “[Contexto da Plataforma]”).

Motivo: sem isso, palavras dentro do bloco de documentos (“pacientes”, “biblioteca”, “função renal”) poderiam disparar comandos “fantasma”.

Implementação: o Core corta a mensagem em marcadores conhecidos antes de normalizar:
- `[Contexto da Plataforma:`
- `[contexto_da_plataforma]`
- `[CONTEXTO CRÍTICO ...]`

---

## Execução no Front (Command Executor)
O executor canônico está em:
- `src/hooks/useMedCannLabConversation.ts`

Fluxo:
1) o chat chama `residentRef.current.processMessage(...)`
2) recebe `response`
3) extrai `response.metadata.app_commands`
4) executa em `executeAppCommands(...)`
5) cada comando dispara um evento `noaCommand` (retrocompatível):
   - `window.dispatchEvent(new CustomEvent('noaCommand', { detail }))`

O listener de execução (ex.: dashboard profissional) está em:
- `src/pages/RicardoValencaDashboard.tsx` (escuta `noaCommand`)

---

## Observabilidade / Auditoria (CEP)
Quando `app_commands` é sugerido, o Core registra um evento (non‑blocking):
- tabela: `cognitive_events`
- action: `APP_COMMAND_SUGGESTION`
- metadata: `{ app_commands, ui_context }`

Se o insert falhar, a conversa **não cai** (non‑blocking).

---

## `ui_context` (consciência de tela)
O frontend envia um objeto `ui_context` no payload ao Core com:
- `route` atual
- `timestamp`
- `source`
- `last_local_navigation` (quando houve comando local)

Objetivo: permitir auditoria e decisões futuras mais contextuais, sem depender de inferência do modelo.

---

## Limites intencionais (doutrina COS)
- O LLM **não tem autoridade de execução**
- Execução é do app, sob allow‑list
- Escritas críticas devem exigir confirmação explícita + execução determinística (Edge/RPC) + trilha (CEP/decisions)

