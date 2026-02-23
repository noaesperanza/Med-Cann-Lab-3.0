# Diário de Bordo Cursor — 03-02-2026
**Projeto:** MedCannLab V3 / TradeVision Core / COS 5.0  
**Data:** 03 de Fevereiro de 2026  
**Contexto:** Sessão de alinhamento arquitetural + auditoria do Core + plano de expansão de comandos no chat  
**Participantes:** Pedro (owner) + GPT‑5.2 (auditoria técnica orientada a implementação)  

---

## Propósito deste diário
Registrar, de forma objetiva e executável, a visão completa do **TradeVision Core** (Edge Function + COS) e do **controle do app via chat**, preservando a essência política do sistema:

- **O sistema é confiável; o modelo não.**
- **Não‑execução**: IA sugere/organiza; execução é humana ou determinística (kernel seguro).
- **Rastreabilidade total**: nada relevante sem trilha (decisão/evento/espelhamento).
- **Autonomia graduada** e **falibilidade declarada**.

Este diário consolida o que foi discutido nesta conversa e o que foi confirmado no código do repositório.

---

## Fonte primária de verdade (não negociável)
Este trabalho se ancora no documento:
- `docs/AUDITORIA_COS_5_0_FINAL.md` (tratado como **fonte primária de verdade arquitetural**)

Consequência direta:
- Nenhuma proposta aqui implica **remoção** ou **simplificação** da governança (Trauma/Metabolismo/Política/Kernel).
- O sistema é tratado como **Arquitetura Cognitiva Avançada (COS)**.

---

## Modelo mental validado (síntese operacional)
O TradeVision Core opera como um “lobo pré‑frontal digital”:

- **Supabase**: realidade (source of truth).
- **TradeVision Core (Edge Function)**: córtex (decide se pode pensar).
- **COS Kernel + tabelas de controle**: super‑ego (governança).
- **Persona Nôa**: ego (interface de linguagem).
- **LLM**: linguagem (prestador de serviço; sem autoridade).

Fluxo de consciência (resumo):
1) estímulo do usuário → 2) intenção → 3) julgamento COS (trauma/metabolismo/política) → 4) decisão auditável (quando aplicável) → 5) fala/ação condicionada → 6) memória/espelhamento.

---

## O que foi confirmado no código (estado atual real)

### Core (Edge Function `supabase/functions/tradevision-core/index.ts`)
- **Intenções ativas na prática:** `CLINICA`, `ADMIN`, `ENSINO` (por regras de keywords + `action`).
- **Camadas de decisão implementadas:** Trauma → Metabolismo → Política → Kernel `COS.evaluate()` → (só então) LLM.
- **Auditoria / trilha:**
  - `ai_chat_interactions` (espelhamento da conversa e metadados)
  - `cognitive_decisions` (átomos de decisão para ações específicas como risco/agendamento e prioridade)
  - `cognitive_events` (CEP) sendo inserido em pontos de trigger/injeção/confirmação
- **Trigger de agendamento já implementado e “end-to-end”:**
  - pela tag `[TRIGGER_SCHEDULING]` no texto e/ou `metadata.trigger_scheduling`

### Frontend (chat e execução de UI)
O app já tem “mãos” para executar ações, mas de forma distribuída:

- **Widget de agendamento** abre automaticamente no chat quando:
  - `metadata.trigger_scheduling === true` ou texto contém `[TRIGGER_SCHEDULING]`
  - Implementado em `src/components/NoaConversationalInterface.tsx`.

- **Card de ação pós‑avaliação (“Ver Relatório”)**:
  - Gerado no frontend (mensagem `role=system` com `metadata.type='action_card'`) em `src/hooks/useMedCannLabConversation.ts`.
  - Renderizado no chat e navega para analytics do paciente.

- **Canal de comando via evento já existe (`noaCommand`)**:
  - Em `useMedCannLabConversation.ts` há uma matriz de comandos (regex) que dispara `window.dispatchEvent(new CustomEvent('noaCommand', ...))`.
  - O dashboard `RicardoValencaDashboard.tsx` escuta `noaCommand` e executa navegação/filtragem/seções.

### Diagnóstico estruturante
Existe “controle do app via chat”, mas **não é um protocolo único**. Ele emerge por:
- tags no texto, flags em metadata, cards gerados no frontend, e comandos locais por regex.

---

## Realidade vs. visão ideal (o “gap” principal)

### Visão ideal (alvo)
Mensagem → Core entende → Core devolve resposta + comando estruturado → frontend executa → frontend confirma execução → Core registra evento.

### Realidade atual (observada)
- O mecanismo funciona em pontos críticos (agendamento, cards), mas:
  - **há múltiplos pipelines de chat** no app (comportamentos e triggers espalhados).
  - não existe ainda um **contrato universal** de comandos (ex.: `app_command`).
  - a “consciência de tela” (rota/aba/paciente selecionado/modal aberto) não é garantida no Core (falta `ui_context` padronizado).
  - CEP/Events: precisa garantir robustez operacional (existência e comportamento em produção; idealmente “non‑blocking”).

---

## Plano realista (sem violar COS) — Fases de trabalho

### Fase 0 — Consolidação de verdade e pré‑requisitos (curto)
- **Objetivo:** garantir que a base governada é estável antes de aumentar autonomia.
- Ações:
  - Auditar o **schema real do Supabase** (você irá enviar) e validar:
    - existência/índices/RLS de `cognitive_events`, `cognitive_decisions`, `ai_chat_interactions`, `system_config`, `cognitive_policies`, `cognitive_metabolism`, `institutional_trauma_log`.
  - Garantir que inserts em `cognitive_events` não derrubem o fluxo (estratégia “non‑blocking” quando apropriado).

### Fase 1 — Unificar o “cérebro” de chat (médio)
- **Objetivo:** reduzir fragmentação e garantir previsibilidade de triggers.
- Ações:
  - Mapear e decidir o caminho “canônico” de chat do produto (recomendação: `NoaResidentAI → tradevision-core` como canal único).
  - Onde existirem chats paralelos, alinhar para que todos consumam a mesma resposta estruturada do Core (sem remover experiências; apenas unificar backend/cérebro).

### Fase 2 — Protocolo formal de comando (alto impacto)
- **Objetivo:** sair de “tags e regex” para um canal auditável e versionável.
- Ações:
  - Introduzir no JSON de resposta do Core um campo opcional:
    - `app_command` (ou `app_commands[]`) com schema estável e governado.
  - Criar um **Command Executor único** no frontend que:
    - executa comandos (navegação, abrir modal, abrir card, abrir widget, fetch read‑only)
    - emite **ACK** de execução/falha/negação.
  - Adicionar `ui_context` no payload enviado ao Core (rota, seção, paciente selecionado, etc.).

### Fase 3 — Cobertura das funções essenciais (“Terminal de Atendimento”)
- **Objetivo:** habilitar ações essenciais do profissional sem quebrar a política de não‑execução.
- Estratégia:
  - Tudo que for **UI/Read** pode ser executado diretamente no frontend via `app_command`.
  - Tudo que for **Write crítico** deve virar:
    - comando estruturado `RUN_ACTION` + `requires_confirmation`
    - execução determinística por Edge Function/RPC com auditoria (CEP + Decision Object quando aplicável).

---

## Primeira lista pragmática de comandos essenciais (MVP de agência)
Prioridade para “valor imediato” no Terminal de Atendimento:

- **Navegação**
  - abrir/alternar seção do terminal (Prontuário, Prescrições, Agenda, Relatórios, Chat Profissionais)
  - navegar para rota específica (ex.: analytics do paciente)

- **Cards/Widgets**
  - abrir widget de agendamento
  - abrir card de “avaliação concluída” / “ação recomendada”

- **Busca/Contexto**
  - selecionar paciente atual (quando houver) e abrir prontuário
  - filtrar lista de pacientes (ativo, clínica X)

- **Ações governadas (com confirmação)**
  - solicitar exame (gerar documento/registro determinístico)
  - gerar atestado PDF (determinístico)
  - encaminhar relatório ao médico / notificar

---

## Critérios de sucesso (para declarar “evolução sem sabotagem”)
- O chat continua útil como chat (texto sempre presente).
- `app_command` é **opcional** e **retrocompatível** com triggers atuais.
- Toda ação executável é:
  - **permitida** por política (intent/autonomy/forbidden_actions)
  - **auditada** (evento emitido e evento de execução/erro)
  - **explicável** (por que foi sugerida, por que foi executada/negada)
- A governança COS (Trauma/Metabolismo/Política/Kernel) permanece intacta.

---

## Próximo insumo esperado
Você vai enviar o **schema do Supabase**. A partir dele, o próximo entregável desta linha de trabalho será:
- uma auditoria “schema ↔ doutrina ↔ código” (lacunas e riscos reais),
- e um plano de implementação do `app_command` v1 com política e eventos CEP obrigatórios.

---

## Schema Reality Check (Supabase) — 03/02/2026
**Entrada:** dump de schema fornecido pelo owner (contextual, não executável).  
**Objetivo:** verificar aderência do banco ao que o `tradevision-core` lê/escreve hoje (COS/CEP/decisions/metabolism/trauma).

### Confirmado no schema (alinhado com o Core)
- `system_config` (kill switch / `ai_mode`)
- `cognitive_policies` (intent, autonomy_level, forbidden_actions, version, active)
- `cognitive_decisions` (átomo de decisão) — campos principais existem para `priority` e `scheduling`
- `ai_chat_interactions` (espelhamento de conversas) — suporta `intent` e `metadata`
- `appointments` + `ai_scheduling_predictions` (base do Oracle de no-show)
- `base_conhecimento` (RAG por conteúdo)

### Gap CRÍTICO #1 — `cognitive_events` (CEP) AUSENTE NO BANCO (confirmado)
O `tradevision-core` insere em `cognitive_events` (INTENT_SUGGESTION / SYSTEM_INJECTION / INTENT_CONFIRMATION).  
Foi verificado via catálogo:
- `select to_regclass('public.cognitive_events')` → **`null`**

Ou seja: **a tabela não existe neste banco** no estado atual.

**Risco real:** se a tabela não existir em produção, inserts podem quebrar fluxo (ou degradar rastreabilidade), violando o princípio de **Rastreabilidade Total** do COS.

**Ação recomendada (COS‑compatível):**
- Criar `cognitive_events` (CEP) + índices + RLS (select restrito; insert via service role).
  - Referência pronta no repo: `database/scripts/COGNITIVE_EVENTS_SCHEMA.sql`.
- Definir estratégia “non‑blocking” para inserts de evento quando apropriado (log nunca deve derrubar assistência clínica).

### Gap CRÍTICO #2 — `institutional_trauma_log` não bate com o que o Core tenta escrever (confirmado)
Foi verificado no banco que `institutional_trauma_log` possui apenas:
- `id`
- `restricted_mode_active`
- `reason`
- `recovery_estimated_at`
- `created_at`

No código (fallback de OpenAI down), o Core tenta inserir campos adicionais:
- `severity`, `affected_domain`, `metadata`.

**Risco real:** no cenário de falha da OpenAI (justamente quando mais precisamos de robustez), o “protocolo de soberania” pode falhar ao tentar registrar trauma.

**Ação recomendada (COS‑compatível):**
- **Escolha A (preferível, alinhada ao Livro Magno/Auditoria):** evoluir a tabela adicionando `severity`, `affected_domain`, `metadata` (mantém ontologia completa do trauma).
- **Escolha B (rápida e segura):** tornar o insert do fallback resiliente ao schema (inserir apenas colunas existentes) + log alternativo em `ai_chat_interactions.metadata` quando em degradação.

### Gap CRÍTICO #3 — Metabolismo (`cognitive_metabolism`) divergente (tipo e função RPC)
No schema enviado:
- `cognitive_metabolism.professional_id` é **text** e `UNIQUE`.
- Campos mínimos (decision_count_today, decision_limit_daily) existem, porém **não aparecem** colunas que o Core já usa em outras versões (metadata/last_interaction_at etc.).

No Core:
- leitura: `.eq('professional_id', professionalId)` (ok se `professionalId` for string compatível)
- escrita: chama RPC `increment_metabolism(p_id)` (no repo, a função é `p_id UUID`; aqui não foi listada no dump).

**Atualização (03/02/2026):** foi confirmado via consulta ao catálogo que a função existe como:
- `increment_metabolism(p_id text)`

Isso remove o risco de incompatibilidade de tipo **no RPC** e é coerente com a estratégia atual do Core de aceitar identificadores “não‑UUID” (ex.: `system-global`, slugs, ou IDs vindos do app).

**Risco residual (governança/operacional):**
- coexistência de múltiplas identidades de `professional_id` (UUID vs slug vs sentinel) pode reduzir qualidade de auditoria e de throttling (fragmentação de contagem por “identidade textual”).

**Ação recomendada (COS‑compatível):**
- Decidir soberania de identidade do `professional_id` (UUID de `auth.users` vs string de “slug”/alias).
- Alinhar o RPC `increment_metabolism` ao tipo real usado e garantir idempotência/ON CONFLICT.

### Observação de integridade de modelo (não bloqueante, mas importante)
Há múltiplas “fontes de identidade” no schema (`public.users`, `public.user_profiles`, `profiles`, `auth.users`, além de tabelas legadas como `pacientes/usuarios`).  
O Core e partes do frontend assumem `auth.users` como base (ex.: `auth.admin.getUserById`).

**Ação recomendada:**
- Fixar uma convenção (quem é “fonte de verdade” para pacientes/profissionais) e documentar o join canonical.

### Resultado desta etapa
- O schema confirma a base necessária para operar COS (política/decisão/espelho), mas existem **3 gaps críticos** (CEP, Trauma fallback, Metabolismo RPC/tipo) que precisam ser fechados antes de expandir agência via `app_command`.

### Governança no banco (RLS/Policies) — achado adicional (crítico)
Foi verificado:
- **RLS ON**:
  - `ai_chat_interactions`
  - `cognitive_decisions`
- **RLS OFF**:
  - `cognitive_metabolism`
  - `cognitive_policies`
  - `institutional_trauma_log`

**Risco real (doutrina COS):**
- Tabelas que compõem o “super‑ego” (políticas/trauma/metabolismo) com RLS desligado podem permitir leitura/escrita indevida por clientes autenticados dependendo de grants/policies.  
  Mesmo quando o Core usa `service_role` (bypass), a doutrina exige contenção também no “modo humano”.

### Policies inseguras detectadas (prioridade alta)
1) `cognitive_decisions`:
   - Policy “Enable all for authenticated” (`cmd: ALL`, `qual: true`).  
   - **Risco:** qualquer autenticado pode editar/deletar decisões auditáveis (quebra de imutabilidade prática).

**Recomendação COS‑compatível:**
- `ai_chat_interactions`: foi confirmado que há `WITH CHECK (auth.uid() = user_id)` em INSERT (anti‑spoof OK). Manter, e reduzir redundâncias de SELECT/INSERT para facilitar auditoria.
- `cognitive_decisions`: tornar **append‑only** para clientes (ou no mínimo restringir UPDATE/DELETE), e reservar SELECT para admins.

### Auditoria ampliada (Policies + Grants) — achados de segurança sistêmica
Com base no dump de `pg_policies` e `role_table_grants`, há um padrão repetido no banco:
- **Policies permissivas com `cmd: ALL` e `qual: true`** em tabelas sensíveis (ex.: `cognitive_decisions`, `chat_rooms`, `chat_messages`), permitindo que qualquer autenticado altere dados fora de escopo.
- **Grants amplos para `anon`/`authenticated`** (inclusive `UPDATE/DELETE/TRUNCATE/TRIGGER` em várias tabelas), que só são seguros se **RLS + policies** forem restritivas. Onde RLS está OFF, o risco explode.

**Prioridade de contenção (sem quebrar o app):**
1) **Chat Core** (`chat_messages`, `chat_rooms`, `chat_participants`):
   - Remover policies “ALL true” e substituir por checks de participação/ownership (sender_id/room membership).
2) **Átomos de decisão** (`cognitive_decisions`):
   - Restringir UPDATE/DELETE a admins (ou via RPC security definer).
3) **Super‑ego COS** (`cognitive_policies`, `cognitive_metabolism`, `institutional_trauma_log`, `system_config`):
   - Ligar RLS e limitar SELECT/UPDATE a admins; escrita preferencialmente via service_role/SQL controlado.

### Nota operacional importante (para não quebrar UX)
O componente `DecisionFeedbackLoop` no frontend atualiza `cognitive_decisions` diretamente via client.
Ao “selar” essa tabela, deve-se:
- ou restringir UPDATE apenas a admins (mantém UX para admin),
- ou migrar o feedback para uma RPC (mais seguro).

---

## Decisões de produto SELADAS nesta sessão (governança + UX)
### Fórum (conselheiros / casos clínicos)
- **Regra:** todos participam **exceto pacientes**.
- **Justificativa:** LGPD + risco de exposição de dados sensíveis; fórum é espaço de discussão técnica/educacional.
- **Casos com paciente:** somente com **consentimento explícito** do caso + **disclaimer curto** (desde a entrada e reforçado no início da Avaliação Clínica Inicial).

### Chats (separação de domínios)
- **Chat humano (paciente↔profissional / profissionais / SAC):** privado por **participação em sala**.
- **Chat Nôa/Core (COS + GPT + ações):** permanece **retrocompatível**; selamentos focam somente onde é perigoso (policies/RLS permissivas).

---

## Selamento v1 (DB) — artefatos gerados no repo (prontos para execução)
### Scripts novos (03/02/2026)
- `database/scripts/SELAR_CHAT_ROOMS_RLS_V1_2026-02-03.sql`
  - Selamento do chat humano por membership (`chat_rooms`/`chat_participants`/`chat_messages`).
  - Inclui **compatibilidade opcional** se existir `chat_messages.chat_id` (thread legado de fórum/debate).
- `database/scripts/SELAR_FORUM_RLS_V1_2026-02-03.sql`
  - Selamento do fórum para **não‑pacientes** (admin/profissional/aluno).
- `database/scripts/SELAR_CEP_COGNITIVE_EVENTS_V1_2026-02-03.sql`
  - Cria o CEP (`cognitive_events`) + RLS (select admin-only).
- `database/scripts/SELAR_COGNITIVE_DECISIONS_RLS_V1_2026-02-03.sql`
  - Remove policy “ALL true” e sela `cognitive_decisions` (admin-only; insert via service_role).

### Ordem recomendada de execução (Supabase SQL Editor)
1) `SELAR_CEP_COGNITIVE_EVENTS_V1_2026-02-03.sql` (fecha a rastreabilidade mínima)
2) `SELAR_COGNITIVE_DECISIONS_RLS_V1_2026-02-03.sql` (fecha o átomo soberano)
3) `SELAR_CHAT_ROOMS_RLS_V1_2026-02-03.sql` (fecha o chat humano)
4) `SELAR_FORUM_RLS_V1_2026-02-03.sql` (fecha o fórum sem pacientes)

---

## Efeito esperado no app (após executar Selamento v1)
### 1) Chat humano (salas: paciente↔profissional / profissionais / SAC)
- **Antes (risco):** policies permissivas (`ALL true`, `auth.uid() IS NOT NULL`) permitiam leitura/escrita fora de escopo.
- **Depois (esperado):**
  - Usuário **só vê salas** em que é participante (`chat_participants`).
  - Usuário **só lê mensagens** de salas onde é participante.
  - Usuário **só envia** mensagem se for participante e `sender_id = auth.uid()`.
  - Criador da sala (`chat_rooms.created_by`) pode **adicionar/remover participantes** (para viabilizar “requisitar sala com profissional/SAC”).
  - Admin/Master mantém capacidade de auditoria/moderação.

### 2) Fórum (casos clínicos / conselheiros)
- **Antes (risco):** políticas existentes no repo eram genéricas (“qualquer autenticado”) e não respeitavam “sem pacientes”.
- **Depois (esperado):**
  - Paciente **não consegue** ler nem criar posts/engajar.
  - Profissional/aluno/admin **consegue** participar (conforme RLS).
  - Caso de paciente vira **processo governado**: consentimento + disclaimer (UX) — não só regra social.

### 3) CCOS / Átomos de decisão (`cognitive_decisions`)
- **Antes (risco):** policy “ALL true” permitia qualquer autenticado editar/deletar a trilha de decisão.
- **Depois (esperado):**
  - Apenas Admin/Master consegue **ler e dar feedback** (UPDATE) ou remover (DELETE em incident response).
  - Edge Functions continuam inserindo decisões via `service_role`.
  - O painel `DecisionFeedbackLoop` deve operar apenas para admins (comportamento correto).

### 4) CEP / Eventos cognitivos (`cognitive_events`)
- **Antes (risco):** tabela ausente em produção quebrava a rastreabilidade (“Total Traceability”).
- **Depois (esperado):**
  - `tradevision-core` consegue registrar eventos CEP sem falhar por inexistência.
  - Somente Admin/Master consegue visualizar via client (select).
  - Inserções continuam sendo responsabilidade do Core (service_role).

---

## Observações técnicas importantes (para evitar surpresa)
### Dois “mundos” de chat no código (legado vs canônico)
O repositório contém dois padrões:
- **Canônico (salas)**: `chat_rooms`/`chat_participants`/`chat_messages.room_id` (usado em `useChatSystem`, `PatientDoctorChat`, `PatientChat`).
- **Legado (thread)**: alguns módulos antigos usam `chat_messages.chat_id` ligado a `forum_posts` (ex.: `DebateRoom`).

**Ação tomada no selamento:** o script `SELAR_CHAT_ROOMS_RLS...` adiciona policies opcionais para `chat_id` **somente se** a coluna `chat_id` e a tabela `forum_posts` existirem no banco.

### Fórum no frontend referencia tabelas que podem não existir
`ForumCasosClinicos.tsx` lê `forum_comments`, `forum_likes`, `forum_views`.  
No repo (scripts), a criação dessas tabelas não aparece como “fonte de verdade” única.

**Ação tomada no selamento:** `SELAR_FORUM_RLS...` é defensivo e só sela o que existir; se uma tabela não existir, o script não quebra.

---

## O que ainda é esperado do app (próximas entregas)
1) **UX de consentimento/disclaimer**:
   - Disclaimers pequenos na entrada do Fórum e no início da Avaliação Clínica Inicial (reforço do consentimento quando um caso for discutido).
2) **Trauma fallback (resiliência)**:
   - Alinhar `institutional_trauma_log` ao que o Core tenta registrar (Escolha A/B).
3) **Unificar protocolo de ação (agência)**:
   - Introduzir `app_command` v1 + `ui_context` + executor único + ACK + registro CEP de execução.

## Próximo plano de implementações (após Selamento v1)
1) **Trauma fallback**: alinhar `institutional_trauma_log` ao Core.
   - Script pronto: `database/scripts/ALINHAR_INSTITUTIONAL_TRAUMA_LOG_SCHEMA_V1_2026-02-03.sql`
   - Efeito: adiciona `severity/affected_domain/metadata` + aplica defaults de fallback via **trigger** (15 min) sem criar default global “forte”.
2) **Super‑ego COS no banco**:
   - Script pronto: `database/scripts/SELAR_SUPER_EGO_RLS_V1_2026-02-03.sql`
   - Efeito: liga RLS e sela SELECT/UPDATE admin-only em `cognitive_metabolism`, `cognitive_policies`, `system_config`, `base_conhecimento`.
3) **Unificação do protocolo de ação**:
   - desenhar `app_command` v1 + `ui_context` (sem quebrar triggers atuais)
   - implementar `Command Executor` único no frontend + ACK + log CEP de execução.

---

## Pós‑Selamento v1 — verificação rápida (SQL + smoke test)
### Queries rápidas (Supabase SQL Editor)
**Policies presentes (visão geral):**
```sql
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('chat_rooms','chat_participants','chat_messages','forum_posts','cognitive_events','cognitive_decisions')
order by tablename, policyname, cmd;
```

**RLS ligado (confirmação):**
```sql
select schemaname, tablename, rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename in ('chat_rooms','chat_participants','chat_messages','forum_posts','cognitive_events','cognitive_decisions');
```

### Smoke test (comportamento esperado no app)
- **Chat humano**
  - usuário vê apenas salas onde participa
  - consegue enviar mensagem só nas suas salas
  - criação de sala/requisição funciona (e creator consegue convidar profissional/SAC)
- **Fórum**
  - paciente não acessa (nem listagem nem detalhes nem postar)
  - aluno/profissional/admin acessa normalmente
- **Governança**
  - `DecisionFeedbackLoop` opera apenas para admin (SELECT/UPDATE em `cognitive_decisions`)
  - Core continua logando eventos/decisões sem quebrar fluxo (CEP + CCOS via service_role)

---

## Registro de execução real (Supabase) — o que foi feito, o que falhou, como foi corrigido
### Linha do tempo (03/02/2026)
- **Selamento do Chat Humano (rooms/participants/messages)**
  - **Falha observada:** erro `42710` (policy já existe), exemplo:
    - `policy "rooms_select_member_or_admin" for table "chat_rooms" already exists`
  - **Causa real:** o script removia policies permissivas legadas, mas não removia as policies criadas pelo próprio selamento antes de recriá‑las (não 100% idempotente).
  - **Correção aplicada:** `database/scripts/SELAR_CHAT_ROOMS_RLS_V1_2026-02-03.sql` foi atualizado para também executar `DROP POLICY IF EXISTS` para:
    - `rooms_*`, `participants_*`, `messages_*`
    - policies opcionais do legado `chat_id`
  - **Resultado:** script ficou **reexecutável** (rodar novamente não gera colisão).

- **Trauma fallback (`institutional_trauma_log`)**
  - **Ponto de atenção levantado:** `ALTER COLUMN SET DEFAULT` altera comportamento global e pode gerar falsos positivos de modo restrito em inserts futuros.
  - **Correção aplicada:** `database/scripts/ALINHAR_INSTITUTIONAL_TRAUMA_LOG_SCHEMA_V1_2026-02-03.sql` foi ajustado para:
    - **não** setar defaults globais fortes
    - aplicar defaults apenas no cenário de fallback via trigger `trg_set_trauma_fallback_defaults`
    - documentar INSERT via `service_role` com policy explícita
    - remover defaults fortes se já tivessem sido aplicados (DROP DEFAULT quando detectado)
  - **Evidência confirmada:** trigger presente:
    - `tgname = trg_set_trauma_fallback_defaults`

- **Super‑ego COS (RLS ON em tabelas críticas)**
  - **Execução:** `database/scripts/SELAR_SUPER_EGO_RLS_V1_2026-02-03.sql`
  - **Evidência confirmada (RLS ON):**
    - `base_conhecimento.rls_enabled = true`
    - `cognitive_metabolism.rls_enabled = true`
    - `cognitive_policies.rls_enabled = true`
    - `system_config.rls_enabled = true`

### Nota de compatibilidade (para não quebrar o produto)
- Selamentos de RLS **não bloqueiam o Core** porque o `tradevision-core` opera com `service_role` (bypass RLS).
- Usuários finais continuam recebendo “conhecimento” via chat (RAG no Core), mas não acessam `base_conhecimento` diretamente via client.

---

## Addendum — Implementações e correções feitas no código (pós‑registro)
Esta seção consolida mudanças que foram efetivamente implementadas no repo após o selamento.

### 1) Protocolo `app_commands` v1 (Core → Front) implementado
- **Core** (`supabase/functions/tradevision-core/index.ts`):
  - adicionou tipos (`NoaUiCommand`, `AppCommandV1`)
  - implementou `deriveAppCommandsV1(...)` (regex determinístico)
  - passou a retornar `app_commands` no JSON de resposta
  - log non‑blocking no CEP (`cognitive_events`) com `APP_COMMAND_SUGGESTION`
  - aceita `ui_context` no payload (para auditoria e contexto de tela)
- **Frontend**:
  - `src/lib/noaResidentAI.ts` envia `ui_context` ao Core e propaga `app_commands`
  - `src/hooks/useMedCannLabConversation.ts` executa `app_commands` via allow‑list e despacha evento `noaCommand`
  - `src/pages/RicardoValencaDashboard.tsx` escuta `noaCommand` e navega/filtra/abre seções

**Docs separados (referência):**
- `docs/PROTOCOLO_APP_COMMANDS_V1.md`

### 2) Anti‑alucinação (governança) — explicação consolidada
- Documento separado criado para explicar “como o Core reduz fala solta” (governança COS, ancoragem, separação fala/ação e auditabilidade):
  - `docs/GOVERNANCA_ANTI_ALUCINACAO_TRADEVISION_CORE.md`

### 3) Correções de robustez (travamento / quedas do Core)
- `src/lib/noaResidentAI.ts`:
  - adicionou timeout no carregamento de histórico e na chamada ao Core
  - em falha do Core, retorna resposta `type='error'` (evita travar indefinidamente)
  - evita “cair” em fallback clínico/AEC por causa de mensagem com contexto injetado
  - passou a usar `rawUserMessage` (sem blocos injetados) para memória e salvamento em prontuário

### 4) Correções de comandos acidentais por contexto injetado
- Problema observado: o app injeta blocos (`[Contexto da Plataforma]` / `[CONTEXTO CRÍTICO ...]`) e isso podia disparar `app_commands` por palavras dentro do bloco (ex.: “pacientes”, “biblioteca”, “função renal”).
- Correção aplicada no Core: `deriveAppCommandsV1(...)` passou a derivar comandos usando apenas a fala do usuário (corte por marcadores).

### 5) “Modo paciente” (navegação) não deve virar consulta de pacientes
- Problema observado: `platformFunctionsModule.detectIntent` disparava `PATIENTS_QUERY` só por conter “paciente”.
- Correção aplicada: `src/lib/platformFunctionsModule.ts` ignora `PATIENTS_QUERY` quando a frase é navegação de módulo (`modo paciente`, `módulo paciente`, `ver como paciente`, etc.).

### 6) Ambiguidade “show” removida dos gatilhos
- “show” é elogio comum; foi removido como gatilho de comando (evita navegação indevida).

### 7) Agenda (profissional) ≠ Agendamento (paciente) — correção de gatilho e alinhamento de fala/ação
**Problema observado (produção/local):**
- Ao pedir “**abrir agenda**”, o app navegava para a seção correta do Terminal Profissional (`agendamentos`), mas:
  - o Core/LLM respondia como se fosse **agendamento do paciente** (“escolha um horário disponível para agendar…”)
  - a palavra **“agenda”** estava acionando o gatilho de widget/agendamento indevidamente (mistura de domínios).

**Correções aplicadas no Core** (`supabase/functions/tradevision-core/index.ts`):
- Introduzida heurística `isAgendaNavigationOnly` para diferenciar:
  - **navegação** (“abrir agenda”, “minha agenda”, “ver agenda…”)  
  - de **agendamento** (agendar/marcar/ver horários/disponibilidade/vagas).
- Removido o acionamento por `norm.includes('agenda')` do gatilho de agendamento (evita falso-positivo).
- Se o LLM inserir `[TRIGGER_SCHEDULING]` por reflexo num caso de navegação, o Core **ignora e remove** a tag (fail-closed).
- Alinhamento texto x ação: em navegação de agenda, o Core força resposta:
  - “**Agenda profissional aberta…**” (sem instrução de “escolher horário para agendar”).

**Efeito esperado:**
- Profissional/Admin (vendo como profissional): “abrir agenda” → abre a **agenda profissional** e confirma corretamente.
- Paciente: “quero agendar / ver horários” → abre o **fluxo de agendamento** (quando aplicável).

### 8) Comando explícito para paciente: “Meus agendamentos / Minhas consultas”
**Objetivo:** tornar previsível a navegação do paciente para seus agendamentos, sem depender de inferência ambígua de “agenda”.

**Implementado (Core + Front fallback):**
- **Core** (`supabase/functions/tradevision-core/index.ts`):
  - adicionou `app_command` (`navigate-route`) para:
    - `/app/clinica/paciente/agendamentos`
  - gatilhos: “meus agendamentos”, “minhas consultas”, “consultas agendadas”, “ver/abrir agendamentos”, “agenda do paciente”, etc.
- **Frontend** (`src/hooks/useMedCannLabConversation.ts`):
  - adicionou comando local `patient-appointments-route` com os mesmos padrões (funciona mesmo se o Core estiver indisponível).

### 9) UX — Tela de agendamentos do paciente (`PatientAppointments`) refinada para “caber” e parecer produto
**Tela alvo:** `/app/clinica/paciente/agendamentos` (e rota legada `/app/patient-appointments`).

**Mudanças implementadas** (`src/pages/PatientAppointments.tsx`):
- Layout do modo calendário reorganizado para desktop:
  - **Calendário à esquerda**, cards à direita (coluna sticky para reduzir scroll).
- Compactação de cards “inchados”:
  - reduziu padding/altura do estado vazio de “Próximas Consultas”.
- Barra superior unificada (menos “poluição”):
  - Calendário/Lista em toggle segmentado
  - ações agrupadas em dropdown **“Ações”**:
    - Novo agendamento
    - Manual da jornada
    - Iniciar avaliação clínica
- Remoção da faixa “Sua Jornada de Cuidado” (ganho de espaço vertical).
- “Marketplace” MVP de profissionais/parceiros:
  - busca + filtro por especialidade
  - botão “Ver perfil” → modal com detalhes (MVP), tags e CTA “Agendar…”.

**Observação operacional (dev):**
- Algumas vezes o HMR/Vite pode manter bundle antigo; usar `Ctrl+F5`/hard refresh para ver os controles novos.

### 10) Achados de console (não bloqueantes, mas para backlog)
- Warning de React: “Encountered two children with the same key, `Analytics e Evolução`” apontando para `Sidebar.tsx` (keys devem ser únicas).
- Alguns `500` em chamadas REST (`chat_participants`/`chat_messages`) durante alternância admin “ver como paciente” — provável problema de backend/policy/infra a investigar separado.

---

## Arquivos alterados nesta sessão (03/02/2026 — complementos)
- `src/pages/PatientAppointments.tsx`
- `src/hooks/useMedCannLabConversation.ts`
- `supabase/functions/tradevision-core/index.ts`

### 11) FIX — Widget de agendamento não pode depender do GPT “lembrar” tag
**Incidente observado:**
- Usuário pediu “termina/finaliza agendamento” e “abrir widget/terminal de agendamento”.
- O GPT respondeu instruindo preencher dados/manualmente, **sem abrir o widget**.
- Na prática, isso ocorre quando o modelo **não inclui** `[TRIGGER_SCHEDULING]` e/ou quando o gatilho fica ambíguo.

**Correção aplicada (mínima, sem redesenhar arquitetura):**
- Mantivemos o modelo original:
  - **GPT** fala/coleta/explica (sem executar)
  - **App** abre widget quando recebe sinal determinístico
- No Core (`tradevision-core`), o `metadata.trigger_scheduling` passou a ser **determinístico por palavra‑chave** (quando a intenção é claramente “agendar/ver horários”), mesmo sem a tag do LLM.
- A tag `[TRIGGER_SCHEDULING]` continua suportada (retrocompatível), mas deixou de ser “ponto único de falha”.
- Também foi ampliado o reconhecimento de navegação “terminal/área de agendamento(s)” para abrir a seção correta de agenda no Terminal (sem misturar com widget do paciente).

**Efeito esperado:**
- “agendar / marcar / ver horários / disponibilidade …” → widget abre sempre (determinístico).
- “abrir agenda / minha agenda / terminal de agendamento …” → navegação de agenda (profissional), sem abrir widget por engano.

### 12) Invariante documentada (para evitar “alucinação de engenharia”)
Foi criado um documento de lei curta para garantir que sempre seguimos o modelo do app:
- **não redesenhar o que já funciona**
- **só acrescentar onde não existe**
- **fala ≠ ação**
- triggers/execução sempre determinísticos (não depender do GPT “lembrar tag”)

Documento: `docs/INVARIANTE_MODELO_EXECUCAO_NOA.md`.

---

## Registro operacional — Git (04/02/2026)
Objetivo: **commit + push somente do projeto** `Med-Cann-Lab-3.0-master` para o repositório GitHub solicitado.

### Ações executadas
- Detectado risco: `git` estava apontando para o repositório pai (`C:\Users\phpg6`) e poderia versionar arquivos fora do projeto.
- Inicializado repositório Git **isolado** em `Med-Cann-Lab-3.0-master/.git`.
- Configurado remote `origin` → `https://github.com/OrbitrumConnect/medcannlab5.git`.
- Ajustado `.gitignore` para impedir commit de arquivos locais/sensíveis:
  - `.env`, `.gitconfig`, `supabase/.temp/`.
- Removidos arquivos temporários/não‑essenciais (não fazem parte do runtime do app):
  - `ago --oneline`, `build_log.txt`, `current_schema_check.sql` (vazio).
- Criado commit: `b279645` — `chore: import Med-Cann-Lab 3.0`.
- Push forçado conforme solicitado, alinhando branches remotas:
  - `HEAD -> origin/master` (**--force**)
  - `HEAD -> origin/main` (**--force**)

### Estado final verificado
- Working tree: **clean**
- Branch local: `main` rastreando `origin/main`.

---

## Selagem institucional — Contrato de Trigger + Protocolo v2 (04/02/2026)
Objetivo: **tornar explícito e imutável** o contrato do trigger de agendamento e consolidar o protocolo de sinais (texto/metadata/app_commands) sem alterar o comportamento do app.

### Entregas (documentação)
- Criado `docs/PROTOCOLO_APP_COMMANDS_V2.md` (contrato institucional):
  - invariantes: **Fala ≠ Ação**, **intent não muta no ciclo**, **`[TRIGGER_SCHEDULING]` imutável**
  - canais de sinalização e ordem de prioridade (metadata → app_commands → token no texto → eventos locais)
  - diretriz de versionamento **retrocompatível** (append‑only)
- Atualizado `docs/INVARIANTE_MODELO_EXECUCAO_NOA.md` com seção “Contrato imutável” do token `[TRIGGER_SCHEDULING]`.
- `docs/PROTOCOLO_APP_COMMANDS_V1.md` passou a apontar para o v2 (mantido como histórico).

### Entregas (código — sem mudança de runtime)
- Core (`supabase/functions/tradevision-core/index.ts`):
  - token base selado como constante `TRIGGER_SCHEDULING_TOKEN`
  - enriquecimento de `cognitive_events` para justificativa do trigger (origem, derivação, precondições)
- Front (`src/components/NoaConversationalInterface.tsx`):
  - token base selado como constante `TRIGGER_SCHEDULING_TOKEN` (evita divergência/typo)

### Publicação
- Commit: `1bf3f48` — `chore: seal trigger contract and protocol v2`
- Push: `origin/main` e `origin/master` alinhados no mesmo commit.

### Deploy (operacional)
- **Necessário deploy manual** da Edge Function para refletir alterações do Core (Git não publica function):
  - `supabase functions deploy tradevision-core`

---

## Evolução append-only — Dashboard Admin + CAS + Correções RLS (04/02/2026)
Objetivo: **evoluir sem subtrair**: manter contratos e fluxos estáveis, adicionando camadas de segurança/observabilidade e segregação de UI.

### A) Dashboard Admin (segregação real)
**Problema observado:** admin caía no terminal normal (ex.: consultório) sem um painel administrativo próprio/seguro.

**Correção aplicada (frontend):**
- `src/pages/AdminDashboard.tsx`: `/app/admin` virou hub administrativo com abas (`?tab=`) e rotas `/app/admin/*` reaproveitadas via wrapper.
- `src/pages/Dashboard.tsx` + `src/components/SmartDashboardRedirect.tsx`: admin redireciona para `/app/admin`.
- `src/components/Header.tsx`: botão “Admin” no cabeçalho passa a navegar para `/app/admin`.
- `src/components/UserTypeNavigation.tsx`: links admin corrigidos para rotas existentes (`/app/admin/users`, `/app/admin/reports`).

### B) CAS (Estado de Interação) — “mais inteligência” sem mexer em execução
**Entrega (DB):**
- Migration: `supabase/migrations/20260204021000_create_cognitive_interaction_state.sql`
- Tabela `public.cognitive_interaction_state` (depth_level 0..100 + traits) com RLS (dono e admin/master).

**Entrega (Core):**
- `supabase/functions/tradevision-core/index.ts`
  - derivação determinística de sinais (não-diagnóstica) → `INTERACTION_STATE_SIGNAL` em `cognitive_events`
  - upsert non-blocking do state (fail‑closed: se cair, app segue normal)
  - modulação apenas de **tom/profundidade/estrutura** do texto (Fala ≠ Ação preservado)

### C) Fix 403 — RLS de `user_interactions` (observado no browser)
**Sintoma:** `403` em `/rest/v1/user_interactions` ao registrar uso de documentos (RAG).

**Causa:** RLS habilitado por setup, sem policies/grants adequados.

**Correção (DB):**
- Migration: `supabase/migrations/20260204021500_fix_user_interactions_rls.sql`
- Policies/grants para permitir INSERT/SELECT do próprio usuário e SELECT por admin/master (auditoria).

### D) Epistemologia do cuidado (Dr. Ricardo) — doença não é o centro
**Ajuste no prompt (Core):**
- reforço institucional: **narrativa/escuta primeiro**, rótulos como clarificação posterior.
- não muda trigger/intent/execução; melhora fidelidade da entrevista.

