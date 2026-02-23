# O que esperar no chat — comandos e comportamento

---

## Regra-mãe (modelo correto)

- **Toda ação do sistema nasce exclusivamente de um TRIGGER SEMÂNTICO emitido pelo GPT.**
- **O Core não infere ações a partir da fala do usuário.**
- **app_commands são gerados apenas como materialização técnica de triggers já decididos.**

O **usuário nunca gera trigger** — só fornece sinais humanos. O **GPT** interpreta e emite a tag (ato cognitivo). O **Core** governa e materializa; o **Front** executa. Avaliação clínica e agendamento são os dois modelos selados; **todo o resto** (terminal, abas, navegação, documentos) usa a **mesma lógica**. O que muda é só o nome do trigger e as palavras-chave — simples.

Ou seja: a decisão de “abrir agenda”, “mostrar documento”, “abrir widget de agendamento” é sempre do GPT (que emite a tag); o Core só governa, filtra por perfil e converte essa tag em `app_commands`/metadata para o frontend executar.

---

## Funcionalidades ativas (resumo)

| Funcionalidade | Ativa quando | Observação |
|----------------|--------------|------------|
| **Avaliação clínica** (fluxo IMRE + card no chat) | Sempre (front + Core) | GPT emite `[ASSESSMENT_COMPLETED]`; front exibe card e gera relatório. |
| **Agendamento** (widget de horários no chat) | Core deployado e em uso | GPT emite `[TRIGGER_SCHEDULING]`; Core devolve `metadata.trigger_scheduling`; front abre o widget. |
| **Navegação** (ir para agenda, terminal, pacientes, relatórios, biblioteca, etc.) | Core deployado e em uso | GPT emite `[NAVIGATE_*]`; Core devolve `app_commands`; Layout executa navigate-route/navigate-section. |
| **Documentos** (listar / abrir 1 doc direto no chat / escolher "1" e abrir no chat) | Core deployado + migration **noa_pending_actions** aplicada | GPT emite `[DOCUMENT_LIST]` ou detecção por palavra-chave; Core busca, lista ou abre direto (1 resultado); confirmação "1" → show-document-inline no chat. |
| **Tokens invisíveis** (usuário não vê nenhuma tag) | Sempre (front) | Front remove todos os tokens ao exibir e ao salvar. |
| **Filtro por perfil** (paciente só vê comandos de paciente, etc.) | Core deployado | Core aplica `filterAppCommandsByRole` antes de devolver `app_commands`. |
| **Prescrição / Filtrar pacientes ativos** | Só quando o usuário está no **Dashboard do profissional** | Comandos são enviados; o efeito visual ocorre apenas na tela que escuta (RicardoValencaDashboard). Fallback opcional: Layout navegar para o dashboard ao receber o comando. |

**Checklist para tudo funcionar de ponta a ponta:**  
- [ ] Migration **noa_pending_actions** aplicada.  
- [ ] Edge Function **tradevision-core** deployada.  
- [ ] Frontend apontando para o Core (noaResidentAI → TradeVision Cloud).

---

## O que é esperado do chat?

O chat é o ponto onde o usuário **fala ou escreve** e a Nôa **responde** e, quando aplicável, **aciona algo na tela** (card, calendário, navegação, documento). O que você vê é sempre a **resposta em texto**; o que você **não** vê são os tokens (`[TRIGGER_ACTION]`, `[TRIGGER_SCHEDULING]`), que o frontend oculta. As ações reais vêm de **metadata** e **app_commands** enviados pelo Core.

- **Paciente**: pode agendar, fazer avaliação clínica, ver “meus agendamentos”, ir à biblioteca. Não recebe comandos de profissional (agenda clínica, lista de pacientes, prescrição, etc.).
- **Aluno**: ações de aluno (ensino, simulação, biblioteca). Não recebe comandos de profissional.
- **Profissional**: pode usar o chat para ir à agenda, atendimento, pacientes, relatórios, prescrição, biblioteca, etc. Recebe todos os comandos de pro.
- **Admin**: recebe tudo (incluindo funções administrativas).

Ou seja: **cada perfil só vê e executa o que é permitido para ele.** O Core filtra os comandos por perfil; as frases que disparam os triggers continuam todas no Core — só não são entregues ao frontend quando o perfil não pode executar.

---

## Como vai funcionar? (fluxo em 3 passos)

1. **Usuário** fala ou digita no chat (ex.: “quero agendar”, “abrir minha agenda”, “quais documentos você vê?”).
2. **Core** (tradevision-core) recebe a mensagem, identifica a intenção, aplica a **governança por perfil** e devolve:
   - **text**: resposta em linguagem natural (para exibir).
   - **metadata**: flags (ex.: `trigger_scheduling`, `intent`, `role`).
   - **app_commands**: lista de comandos que **esse perfil** pode executar (navegar, abrir doc, etc.).
3. **Frontend** exibe o texto (sem tokens), trata as flags (ex.: mostra o widget de agendamento) e executa cada comando da allow-list (Layout navega, chat abre modal de documento, etc.).

Se o Core estiver deployado e a migration `noa_pending_actions` estiver aplicada, o fluxo documental (listar → usuário diz “1” → abrir doc) também funciona. Prescrição e filtro de pacientes têm efeito quando o usuário já está no dashboard do profissional (ou com fallback no Layout, se implementado).

---

## Visão geral (detalhe)

- O **Core** (tradevision-core) processa a mensagem e pode devolver `text`, `metadata` e `app_commands`.
- **O usuário nunca vê nenhum token** (`[TRIGGER_ACTION]`, `[TRIGGER_SCHEDULING]`, tags de navegação, etc.): o frontend remove todos antes de exibir e também ao salvar a mensagem. O pedido do usuário dispara a ação de forma automática; nada de “falar” ou mostrar trigger.
- Quando o Core indica agendamento (`metadata.trigger_scheduling`), o **widget de horários** aparece abaixo da mensagem.

Ou seja: no chat você vê só a resposta em linguagem natural; as ações acontecem por **metadata** e **app_commands**, de forma invisível e automática. **Cada perfil** recebe apenas os comandos que pode executar (Core aplica `filterAppCommandsByRole`).

**Já em uso e funcionando:** agendamento (widget de horários) e avaliação clínica (fluxo IMRE + relatório).

**Por perfil:** paciente faz ações de paciente, aluno de aluno, profissional de pro, admin de admin — já definido em `docs/PROTOCOLO_APP_COMMANDS_V2.md` (seção “Ações por perfil”) e em `docs/PLANO_MESTRE_ATIVACAO_DOCUMENTAL_POR_PERFIL.md`.

---

## Comandos que funcionam **em qualquer página** (listener no Layout)

| Comando              | O que acontece |
|----------------------|----------------|
| **navigate-route**   | Navega para a rota em `target` (ex.: `/app/library`). |
| **navigate-section** | Navega para `fallbackRoute?section=target` (ex.: dashboard com aba). |
| **open-document**    | Navega para `/app/library` e abre o documento em `payload.document_id`. |

Esses três são tratados globalmente pelo **Layout**; não importa se o usuário está no chat, na biblioteca ou no dashboard.

---

## Comandos que dependem de **quem está escutando**

| Comando                   | Onde funciona |
|---------------------------|----------------|
| **show-document-inline**  | Só quando o **chat da Nôa** está visível. Abre o documento em um modal dentro do próprio chat. |
| **show-prescription**     | Só na página **Dashboard do profissional** (RicardoValencaDashboard). Se o usuário estiver só no chat, o comando é disparado mas não há handler no Layout → nada acontece na UI. |
| **filter-patients**       | Idem: só no **Dashboard do profissional** (ex.: filtrar pacientes ativos / Rio Bonito). |

Ou seja: **todos os comandos** passam pela allow-list e disparam o evento `noaCommand`; mas **show-prescription** e **filter-patients** só têm efeito visível se o usuário já estiver na tela do dashboard que escuta esses tipos. Fora dessa tela, o evento “vai para o ar” e nenhum componente reage.

---

## Fluxo documental (lista → confirmação → abrir)

1. Usuário: “quais documentos você vê?” ou “quero ver o documento X”.
2. **Modelo selado:** o GPT pode incluir `[DOCUMENT_LIST]`; o Core, ao ver a tag, governa: busca em `documents`, monta lista, grava **noa_pending_actions** e injeta o texto da lista na resposta. (Há também o caminho por palavra-chave, que retorna antes do GPT.)
3. Nôa responde com a lista (ex.: “1. Título A, 2. Título B…”).
4. Usuário: “1” (ou “o primeiro”).
5. Core resolve o pending, emite **show-document-inline** (ou **open-document**) e anexa **`[TRIGGER_ACTION]`** ao texto.
6. Frontend: oculta o token e executa o comando (modal no chat ou abertura na biblioteca).

Para esse fluxo funcionar:

- A **migration** da tabela **noa_pending_actions** precisa estar aplicada.
- A **Edge Function** **tradevision-core** precisa estar deployada e ser a que o app chama (TradeVision Cloud).

---

## Resposta direta: “Vai funcionar todos os comandos?”

- **Sim**, no sentido de que **todos os comandos da allow-list** são aceitos e disparados pelo chat (Core → resposta → hook → `noaCommand`).
- **Parcialmente**, no sentido de **onde** eles têm efeito:
  - **navigate-route**, **navigate-section**, **open-document** → funcionam de qualquer lugar (Layout).
  - **show-document-inline** → funciona quando o chat está aberto.
  - **show-prescription** e **filter-patients** → só têm efeito quando o usuário está na página do dashboard que trata esses comandos (RicardoValencaDashboard).

Para “todos funcionarem” mesmo longe do dashboard, seria preciso um fallback no **Layout**: ao receber **show-prescription** ou **filter-patients**, navegar primeiro para o dashboard (ex.: rota do profissional) com `section`/query adequada, para a página que escuta esses comandos poder aplicar a ação.

---

## Selado (OK) vs Restante (o que falta)

**SELADO** — já funciona ou código pronto: **Avaliação clínica** (card no chat). **Agendamento** (calendário no chat). **Direcionamento de rota (profissionais)**: "abrir agenda", "clínica de atendimento", "pacientes", "relatórios", "biblioteca" → Core emite navigate-route/navigate-section → Layout navega. OK.

**RESTANTE** — **Fluxo documental**: migration noa_pending_actions + tradevision-core deployada. **Prescrição/filtro a partir do chat**: opcional fallback no Layout.

---

## Status do restante (detalhe) (além de agendamento e avaliação clínica)

| Item | Status | O que falta (se algo) |
|------|--------|------------------------|
| **navigate-route** / **navigate-section** | Código pronto (Layout). | Core deployado e Core enviando esses comandos quando o usuário pedir (ex.: “ir para a biblioteca”, “abrir dashboard”). |
| **open-document** | Código pronto (Layout → Library com `openDocumentId`). | Core deployado; Core emite comando ao confirmar documento (fluxo documental). |
| **show-document-inline** | Código pronto (modal no chat). | Core deployado; fluxo documental (lista → confirmação) precisa da tabela **noa_pending_actions**. |
| **Fluxo documental** (listar → “1” → abrir) | Lógica no Core + frontend prontas. | Migration **noa_pending_actions** aplicada + **tradevision-core** deployada. |
| **show-prescription** / **filter-patients** | Só têm efeito no **Dashboard do profissional**. | Se quiser que funcionem a partir do chat: fallback no Layout (ao receber o comando, navegar para o dashboard com section/query). |

Resumo: o “restante” já está implementado no frontend e no Core; para funcionar de ponta a ponta basta **deploy do Core** + **migration noa_pending_actions**. Prescrição e filtro de pacientes só “acionam” quando o usuário está no dashboard; para acionar a partir do chat seria preciso o fallback de navegação no Layout.

---

## Checklist rápido

- [ ] Migration **noa_pending_actions** aplicada (`supabase migration up`).
- [ ] Edge Function **tradevision-core** deployada e em uso.
- [ ] Frontend usa o endpoint do Core (noaResidentAI → TradeVision Cloud).
- [ ] Para documento no chat: usuário no chat e Core retornando **show-document-inline** (ou **open-document** para biblioteca).
