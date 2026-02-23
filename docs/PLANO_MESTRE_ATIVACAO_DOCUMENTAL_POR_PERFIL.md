# PLANO MESTRE — Ativação Documental por Fala/Escrita (por Perfil) — Core + Banco + LLM
**Produto:** MedCannLab (Nôa)  
**Status:** SELADO (plano de implementação)  
**Escopo:** interação por linguagem natural para **buscar / selecionar / abrir** documentos do banco com **governança por perfil**, **confirmação explícita** e **execução determinística**.  

---

## 0) Referências institucionais (fonte de verdade)
- **Contrato de comandos/triggers:** `docs/PROTOCOLO_APP_COMMANDS_V2.md`
- **Invariante de execução (anti-redesenho):** `docs/INVARIANTE_MODELO_EXECUCAO_NOA.md`
- **Biblioteca / KB no app:** `src/services/knowledgeBaseIntegration.ts` (tabela `documents`, busca e filtros)

Este documento é **append-only**: só acrescenta regras/estruturas sem quebrar contratos existentes (especialmente o token base `[TRIGGER_SCHEDULING]`).

---

## 1) Definições (vocabulário mínimo)
- **INPUT HUMANO**: fala (transcrita) ou texto digitado pelo usuário.
- **Intenção (intent)**: classificação do pedido (ex.: `DOC_SEARCH`, `DOC_OPEN`, `DOC_SUMMARY`).
- **Sinal determinístico**: saída do Core em `metadata.*` e/ou `app_commands` para o frontend executar sob allow-list.
- **Documento literal**: conteúdo bruto do banco (ex.: `documents.content`) exibido como fonte.
- **Conteúdo derivado**: explicação/resumo/ensino baseado em documentos, sem exibir o literal.
- **RAG/grounding**: leitura interna (não exibida) de documentos para responder com base.

---

## 2) Invariantes (NUNCA quebrar)
### 2.1) Regra de ouro (imutável)
**Usuário falar o nome de um documento NÃO é execução.**  
É apenas sinal semântico para **busca governada**.

**Sem confirmação humana explícita → ZERO execução.**

### 2.1.1) Esclarecimento histórico (para não haver ambiguidade)
Houve uma interpretação natural (e legítima) de que o “trigger” teria nascido como **chave universal** para qualquer ação do chat, especialmente no **encerramento** da avaliação clínica.

**Como o sistema está implementado hoje (fato verificável no código):**
- o token **`[TRIGGER_SCHEDULING]`** e o flag **`metadata.trigger_scheduling`** foram selados como contrato **nomeado** e **específico** para **abrir o widget/fluxo de agendamento** no frontend.
- a avaliação clínica **pode culminar em agendamento** (pós-relatório), e nesse ponto o Core instrui/adiciona o token de scheduling — por isso “parece” universal no fluxo clínico.

**Conclusão institucional:**
- o token é **imutável**, mas é **imutável como contrato de scheduling** (não como “qualquer ação”).
- a camada universal de execução do app é `metadata.*` + `app_commands` (allow-list), conforme `PROTOCOLO_APP_COMMANDS_V2`.

### 2.2) “Trigger único” (forma correta selada)
> A fala/escrita do usuário é a única fonte de ativação.  
> A execução pode ser disparada por múltiplos canais determinísticos (text token / metadata / app_commands), desde que todos nasçam do input humano.

### 2.3) Autoridade de decisão (Core ≠ LLM)
- **Core**: detecta intenção, governa, aplica políticas, valida permissões, decide e emite sinais determinísticos.
- **LLM**: linguagem, explicação, confirmação e UX conversacional. **Sem autoridade executiva.**

### 2.4) Canais Core → Front (prioridade recomendada)
Conforme `PROTOCOLO_APP_COMMANDS_V2.md`:
1) `metadata.*` (flags determinísticas)  
2) `app_commands` (allow-list; determinístico no Core)  
3) tokens no texto (`[TRIGGER_*]`) como contrato semântico (não como ponto único de falha)  
4) eventos locais (`noaCommand`) como fallback/retrocompatibilidade  

### 2.5) Regra de derivação (segurança)
Conforme `PROTOCOLO_APP_COMMANDS_V2.md`:
- `app_commands` (incluindo `open-document`) deve ser derivado **apenas do INPUT HUMANO**.
- `app_commands` **nunca** pode nascer de contexto injetado (RAG / “Contexto da Plataforma”) ou heurísticas autônomas.

---

## 3) Objetivo do sistema (o que será possível)
Permitir que o usuário peça, por fala/escrita:
- **Buscar** documentos (por nome, assunto, tags, keywords)
- **Receber lista curta** de candidatos (3–5) sem poluir o chat
- **Confirmar** explicitamente qual abrir
- **Executar** abertura determinística por **ID canônico**
- **Exibir literal** (somente quando permitido) ou **entregar conteúdo derivado** (quando restrito por perfil)

---

## 4) Hierarquia por perfil (SELADA)
| Perfil | Ao falar nome de doc | Resultado permitido |
|---|---|---|
| **Paciente** | Nunca abre doc bruto | Conteúdo **educativo/explicativo derivado** |
| **Aluno** | Nunca abre doc bruto | Conteúdo **didático validado** (resumo, exercícios, spoilers de fóruns finalizados/validados) |
| **Profissional** | Pode abrir doc literal | Literal **após confirmação** + validação (RLS/política/sanitização) |
| **Admin** | Pode abrir doc literal | Tudo + governança/auditoria/políticas/logs |

**Nota institucional:** esta hierarquia não é UX “bonita”; é **proteção do banco**, **compliance** e **limpeza cognitiva** (anti-spam).

---

## 5) Modelo de dados (estado atual + extensões permitidas)
### 5.1) Fonte documental (existente no app)
O frontend já integra a tabela **`documents`** (ver `KnowledgeBaseIntegration`) com campos como:
- `id`, `title`, `summary`, `content`
- `category`, `tags[]`, `keywords[]`
- `target_audience[]` (filtro por audiência/perfil)
- `isLinkedToAI`, `aiRelevance`, `file_type`, `author`, etc.

### 5.1.1) Confirmação pelo schema real (Supabase)
O schema atual confirma em `public.documents` (existente) campos úteis para este plano:
- **Identidade**: `id uuid`, `title text`
- **Conteúdo**: `content text`, `summary text`
- **Busca/Indexação**: `keywords text[]`, `medical_terms text[]`, `tags text[]`, `embeddings jsonb`
- **Governança por perfil**: `target_audience text[]`
- **Curadoria/visibilidade**: `is_published boolean`, `is_featured boolean`, `category text`, `type text`
- **IA**: `isLinkedToAI boolean`, `aiRelevance numeric (0..1)`

Isso significa que “usuário falou o nome do doc” pode ser resolvido **sem criar tabela nova de documentos**: a base já existe.

### 5.2) Extensões recomendadas (append-only; opcionais)
Para tornar o fluxo “nome falado → achar doc” mais estável e governável:
- `aliases text[]` (apelidos oficiais e variações de título)
- `status text` (ex.: `ACTIVE` / `QUARANTINED`)
- `integrity_hash text` (hash/checksum do conteúdo)
- `sanitized_content text` (opcional; cache do literal já sanitizado)
- `visibility_scope text` (ex.: `patient|student|professional|admin` ou derivado de `target_audience`)

Nenhuma extensão remove campos existentes; apenas adiciona.

---

## 5.3) Adequação ao schema atual (mapa de fontes por perfil)
Este plano opera por **catálogo governado**: o Core escolhe a fonte conforme perfil e intenção, e só então aplica o fluxo 2 estágios (lista curta → confirmação → execução).

### 5.3.1) Catálogo “documentos” (geral)
- **Tabela**: `public.documents`
- **Uso**:
  - **Paciente**: leitura de *metadados* e conteúdo **apenas** quando `target_audience` incluir paciente e houver política de publicação (ex.: `is_published=true`)
  - **Aluno**: leitura de docs didáticos quando `target_audience` incluir student e curadoria permitir
  - **Profissional/Admin**: leitura de docs internos conforme RLS/políticas

### 5.3.2) Catálogo “recursos educativos” (conteúdo público/curado)
- **Tabela**: `public.educational_resources`
- **Campos úteis**: `audience`, `visibility_scope`, `allowed_roles[]`, `status`, `url`
- **Uso recomendado**:
  - **Paciente**: conteúdos educativos públicos/curados
  - **Aluno**: conteúdos pedagógicos com recorte e trilhas

### 5.3.3) Catálogo “curso/aula” (alunos)
- **Tabelas**: `public.courses`, `public.course_modules`, `public.lesson_content`, `public.course_enrollments`
- **Uso**:
  - **Aluno**: entrega de conteúdo prático/didático (derivado ou literal quando a aula for o documento em si)
  - Controle de acesso por matrícula: `course_enrollments.status`

### 5.3.4) Catálogo “fórum” (alunos, quando finalizado/validado)
- **Tabelas**: `public.forum_posts`, `public.forum_comments`
- **Campos úteis**: `allowed_roles[]`, `post_roles[]`, flags de pin/hot/active
- **Observação institucional**:
  - “spoilers/resultados” só devem ser tratados como conteúdo liberado quando houver **marcação de finalização/validação** (se não existir hoje, entra como extensão append-only via campo/flag ou via `documents` como “compilado validado”).

### 5.3.5) Base histórica (legado)
- **Tabela**: `public.base_conhecimento`
- Status: existe como repositório antigo (`conteudo`, `tags jsonb`, `ativo`, `prioridade`).
- Diretriz: pode ser integrada como fonte adicional **sem substituir** `documents` (append-only).

---

## 5.4) Identidade de perfil no schema (fonte canônica)
O schema mostra múltiplas tabelas que podem expressar perfil/role:
- `public.users.type` e/ou `public.users.role`
- `public.user_profiles.role` / `public.user_profiles.type`
- `public.profiles.type`
- `public.chat_participants.role` (no contexto de salas)

**Selagem operacional:** escolha **1 fonte canônica** para o Core (ex.: `users.type`), e trate as demais como derivadas/auxiliares, para evitar ambiguidade de permissão.

### 5.4.1) Observação institucional — “Profissionais Oficiais” (Dr. Ricardo / Dr. Eduardo)
Existem **2 perfis humanos** que são “médicos oficiais” do app:
- **Dr. Ricardo Valença**
- **Dr. Eduardo Faveret**

**Como está implementado no produto (UX/roteamento):**
- Eles se cadastram como **profissionais** (não é um tipo/role separado no banco).
- Porém, o header/atalhos do app podem levar a **dashboards dedicados** (rotas específicas) para esses dois.
- Todos os demais profissionais usam o **dashboard profissional padrão**.

**Regra de governança (para não quebrar contratos):**
- “Profissional oficial” é uma **exceção de UX/roteamento**, não um bypass de permissões.
- A execução por chat continua governada por `metadata.*` e `app_commands` (allow-list) e por RLS/políticas do banco.

---

## 6) Fluxo canônico (2 estágios) — busca → confirmação → execução
### 6.1) Estágio 1 — Pedido humano (input)
Exemplos (fala/escrita):
- “abre o protocolo de dosagem”
- “me mostra a diretriz de prescrição segura”
- “quero a aula sobre dor crônica”
- “abre o documento ‘X’”

**Resultado esperado:** o Core classifica intenção e busca candidatos. **Nada abre.**

### 6.2) Estágio 1.5 — Busca governada (Core + banco)
O Core executa busca usando campos canônicos:
- `title`, `aliases` (se existir), `tags`, `keywords`, `summary`
- filtros por `target_audience`/perfil
- busca textual/semântica usando a lógica já existente no app (`KnowledgeBaseIntegration.semanticSearch`) como referência de matching

**Saída do Core (linguagem + dados):**
- o LLM responde com lista curta (3–5) e pede confirmação objetiva
- o Core grava um **pending action** (ver seção 7)

### 6.3) Estágio 2 — Confirmação humana (obrigatória)
Usuário responde:
- “1” / “abre o 2” / “cancelar”

Sem confirmação válida → **nenhuma execução**.

### 6.4) Estágio 3 — Execução determinística por ID canônico
Após confirmação:
- Core emite sinal determinístico de execução (preferência: `app_commands`, com fallback em `metadata`)
- frontend executa sob allow-list

Exemplo (forma proposta, alinhada ao v2):

```json
{
  "metadata": {
    "open_document": {
      "document_id": "uuid",
      "confirmed": true,
      "source": "user_confirmation"
    }
  },
  "app_commands": [
    {
      "kind": "noa_command",
      "command": {
        "type": "open-document",
        "target": "document",
        "label": "Abrir documento",
        "payload": {
          "document_id": "uuid",
          "confirmed": true,
          "source": "user_confirmation"
        }
      }
    }
  ]
}
```

**Importante:** `open-document` entra como **novo tipo** na allow-list (append-only). O frontend **ignora** qualquer comando fora da allow-list.

---

## 7) Estado “pendente de confirmação” (obrigatório em sistema stateless)
### 7.1) Por quê existe
O Core (Edge Function) é stateless entre requests. Para interpretar “1” como escolha, o sistema precisa saber:
- quais candidatos foram oferecidos
- em qual contexto/perfil
- se ainda está válido (TTL)

### 7.2) Tabela recomendada (proposta)
`noa_pending_actions` (ou equivalente):
- `id uuid`
- `user_id uuid`
- `conversation_id text` (ou `room_id`, se existir)
- `kind text` (ex.: `DOC_OPEN_CONFIRMATION`)
- `candidates jsonb` (lista de `{document_id, title, audience, score, ...}`)
- `expires_at timestamptz` (TTL curto, ex.: 2–5 min)
- `created_at timestamptz`

### 7.3) Regra de segurança
- “1/2/3” só é aceito se existir `pending_action` **válido e não expirado**.
- Se não existir: o sistema pede para o usuário refazer o pedido (“qual documento você quer abrir?”) — **fail-closed**.

---

## 8) RLS / ACL / Políticas (banco manda; Core não fura)
### 8.1) Regra
**RLS é a última palavra.**  
Mesmo com confirmação, se a policy negar, o Core retorna bloqueio explicável + evento auditável.

### 8.2) Política mínima por perfil (recomendação)
- **Paciente/Aluno**:
  - pode `SELECT` metadados seguros (ex.: `id`, `title`, `summary`, `tags`) de docs que incluam o perfil em `target_audience`
  - **não pode** `SELECT documents.content` (literal bruto), salvo se existir uma categoria explicitamente pública
- **Profissional/Admin**:
  - pode `SELECT` `content` conforme políticas (ex.: `target_audience` e/ou roles)

### 8.3) Acesso por “escopo”
Se o documento tiver escopo “clínico interno”, o paciente/aluno pode:
- receber **conteúdo derivado** (se permitido por política institucional)
- mas não recebe o literal

---

## 9) Sanitização forte + quarentena (doc corrompido nunca vaza)
### 9.1) Regra (imutável)
Documento literal só pode ser exibido após:
- validação de integridade mínima
- sanitização de conteúdo

### 9.2) Pipeline de sanitização (mínimo)
Antes de exibir literal:
- validar UTF‑8 / normalização
- remover caracteres de controle e bytes inválidos
- normalizar whitespace
- validar tamanho máximo e presença de payload estranho

### 9.3) Falha → quarentena (automática)
Se falhar:
- `status = QUARANTINED`
- evento `DOC_BLOCKED_SANITIZATION`
- usuário recebe: “Documento temporariamente indisponível por verificação de integridade.”

---

## 10) Regra do RAG (selada)
- **RAG pode ler documentos internamente** para grounding (melhorar resposta).
- **Exibir conteúdo literal** para o usuário: **somente** com confirmação explícita e permissão por perfil/política.

Isso preserva simultaneamente:
- qualidade das respostas
- governança documental
- compliance e anti-vazamento

---

## 11) Anti-spam e UX limpa (contrato operacional)
### 11.1) Lista curta (sempre)
- Máximo: **3–5** candidatos
- Sempre pedir seleção objetiva:
  - “Responda com 1–5 ou diga cancelar.”

### 11.2) Cooldown (recomendação)
Rate-limit por intenção (exemplo):
- `DOC_SEARCH`: 1 a cada 10–20s
- `DOC_OPEN`: 1 a cada 20–30s

### 11.3) Idempotência (recomendação)
Cada execução recebe `execution_id` (hash de `user_id + document_id + pending_action_id`) para evitar execução duplicada por refresh/retry.

---

## 12) Auditoria cognitiva total (CEP)
Cada etapa gera `cognitive_events` (insert-only; non-blocking):
- `DOC_INTENT_DETECTED`
- `DOC_CANDIDATES_LISTED`
- `DOC_OPEN_CONFIRMED`
- `DOC_OPEN_EXECUTED`
- `DOC_BLOCKED_SANITIZATION`
- `DOC_ACCESS_DENIED` (RLS/política)

Campos mínimos no metadata do evento:
- `intent`, `role`, `origin` (`DETERMINISTIC_TRIGGER` / `AI_RESPONSE` / `USER_CONFIRMATION`)
- `document_id` (se aplicável)
- `pending_action_id` (se aplicável)
- `ui_context` (rota/tela, se disponível)

---

## 13) Comportamento por perfil (respostas canônicas)
### 13.1) Paciente (educativo; sem literal)
- Se pedir “protocolo interno”: responder com explicação segura + opção de “pedir consulta”/“marcar avaliação”, sem abrir o bruto.
- Se houver doc público: mostrar resumo e, se confirmar, abrir o documento público (se policy permitir).

### 13.2) Aluno (didático validado; sem literal clínico interno)
- Responder com material pedagógico validado (resumo, passos, perguntas, exercícios).
- Pode listar “aulas/foruns finalizados validados” e abrir literal **apenas** se o documento tiver audiência aluno e estiver `ACTIVE`.

### 13.3) Profissional (literal permitido com confirmação)
- Pode abrir protocolos/guidelines internos.
- Exibição literal é sempre acompanhada por:
  - identificação do doc (`id`, `versão`, `categoria`)
  - observação “conteúdo literal (fonte)” quando aplicável

### 13.4) Admin (governança total)
- Além de docs, pode solicitar:
  - políticas, logs, auditoria, decisões
- Mantém o mesmo fluxo 2 estágios quando a ação for “abrir/exibir literal”.

---

## 14) Checklist de implementação (ordem recomendada; sem quebrar o que já funciona)
1) **Selar intents e regras** (este documento + `PROTOCOLO_APP_COMMANDS_V2` como base)
2) **Implementar pending-actions** (tabela + TTL + fail-closed)
3) **Implementar `DOC_SEARCH` → lista curta** (Core)
4) **Implementar `DOC_OPEN` com confirmação** (Core) e novo comando allow-list `open-document` (Front)
5) **Aplicar RLS mínimo** para `documents` conforme perfis (sem remover policies existentes)
6) **Sanitização + quarentena** antes de exibir literal
7) **CEP completo** (eventos por etapa + metadata consistente)
8) **Rate-limit + idempotência**

---

## 15) SELAGEM FINAL (resumo matemático)
🔒 **Nome falado → busca governada → lista curta → confirmação humana → execução determinística por ID canônico validado por perfil**  

Nenhum atalho. Nenhuma exceção. Nenhum vazamento.

---

## 16) Parecer externo (“parceiro GPT”) — análise de coerência com o sistema real (registrado)
Este anexo registra o veredito recebido e separa:
- **o que é factual/verificável** no repositório (docs/código/schema)
- **o que é opinião/ênfase retórica** (não-normativo; não vira contrato)

### 16.1) O que está coerente (verificável no que já temos)
- **Fala ≠ Ação**: é invariante institucional em `docs/PROTOCOLO_APP_COMMANDS_V2.md` e `docs/INVARIANTE_MODELO_EXECUCAO_NOA.md`.
- **Core ≠ LLM (autoridade)**: o protocolo define Core como governança/sinal determinístico; LLM como linguagem/confirmação.
- **Execução determinística por canais**: `metadata.*` e `app_commands` com allow-list são o caminho recomendado (prioridade) no v2.
- **RAG interno ≠ exibição literal**: o plano separa grounding interno de “mostrar conteúdo literal” sob confirmação.
- **Fluxo 2 estágios (anti-spam)**: “lista curta + confirmação” é compatível com o modelo do app e não substitui fluxos existentes.
- **Schema confirma o catálogo**: `public.documents` já existe com `title/summary/content/keywords/tags/target_audience/is_published/isLinkedToAI/aiRelevance/embeddings`.
- **Auditoria CEP**: `public.cognitive_events` existe (insert-only por desenho), e o plano define eventos documentais append-only.

### 16.2) O que é verdadeiro “em espírito”, mas NÃO é contrato técnico (opinião/hype)
O texto externo usa frases como “acima do padrão de compliance” / “nível enterprise 30–100 engenheiros” / comparações com bancos/aviação.
- Isso pode ser inspirador, mas **não é requisito** e **não é prova técnica**.
- O que vale como contrato é: **invariantes + canais + allow-list + RLS + confirmação + auditoria** (medidas verificáveis).

### 16.3) Correções de precisão (para não alucinar)
- **“Compatibilidade total”**: é compatível **como blueprint**, mas a execução documental ainda **não está implementada** no Core/Front.
- **“Pending actions + TTL”**: está descrito aqui; no banco atual não há tabela dedicada (a criação é parte do plano).
- **RLS de `documents`**: ainda precisa ser selado por políticas/grants específicas (o schema mostra a tabela, não as policies).

### 16.4) Status institucional (aqui-e-agora)
- **SELADO**: invariantes, fluxo e governança do plano.
- **APROVADO**: como blueprint de implementação (append-only; não quebra contratos).
- **PRONTO PARA VERSIONAMENTO**: pode receber versão (ex.: `v1.0.0`) como documento institucional.
- **NÃO FINALIZADO (implementação)**: ainda faltam itens executáveis listados abaixo.

### 16.5) Pendências objetivas para “finalizar implementação” (executável)
Para que o plano saia de blueprint e vire feature real (sem quebrar nada existente):
1) **Banco**
   - criar `noa_pending_actions` (ou equivalente) com TTL e RLS adequada
   - políticas RLS/grants para leitura de `documents` por perfil (especialmente restringindo `content` para paciente/aluno)
   - opcional: campos append-only em `documents` (`status`, `aliases`, `integrity_hash`, `sanitized_content`)
2) **Core (tradevision-core)**
   - intents `DOC_SEARCH` / `DOC_OPEN` / `DOC_SUMMARY` (classificação determinística + guard rails)
   - geração de lista curta (3–5) + persistência do pending-action
   - emissão determinística `metadata.open_document` e/ou `app_commands` tipo `open-document` somente após confirmação
   - sanitização + quarentena + `cognitive_events` por etapa
3) **Frontend**
   - adicionar `open-document` na allow-list do executor de `app_commands`
   - UI/route para abrir/visualizar documento (e “resumir” sob demanda) sem spam no chat
4) **Test plan (mínimo)**
   - negar exibição literal para paciente/aluno (RLS + UI)
   - confirmação obrigatória (sem pending válido → fail-closed)
   - doc corrompido → quarentena e bloqueio
   - rate-limit e idempotência

