# Roadmap de consolidação — 90 dias

**Princípio:** Sem refatoração agressiva. Consolidar e selar.  
**Data de início sugerida:** 05/02/2026  
**Referência de decisão:** `DECISAO_ARQUITETURA_CONSOLIDACAO_2026.md`, `DECISAO_SELADA_ROTAS_CANONICAS_V1.md`

---

## ⛔ Regra de ouro: Core e trigger intocáveis

- **Não mexer na lógica do Core** (`tradevision-core`). Foi difícil de montar; não refatorar, não “limpar”, não fragmentar.
- **O trigger é a fonte de verdade.** Contrato de triggers (ex.: `[TRIGGER_SCHEDULING]`, navegação, `app_commands`) **não** é alvo deste roadmap. Toda canonização é **só no front** (Sidebar, links, docs). O Core **já** usa paths canônicos nas respostas; nós só alinhamos o restante do app a eles.
- **Admin pode ver e usar rotas em construção.** Rotas ainda sendo criadas/ajustadas continuam acessíveis ao admin; a consolidação **não** bloqueia visibilidade nem uso por admin. Canonização progressiva, sem travar o que você ainda está montando.

---

## Objetivos do ciclo

1. Reduzir entropia de rotas e navegação (canonização).  
2. Eliminar “realidades paralelas” (uma tela por conceito).  
3. Selar o papel do Admin na lógica e na documentação.  
4. Manter Core + COS e modelo “fala ≠ ação” intocados.  
5. Documentação como contrato (decisões no doc selado).

---

## Fase 1 — Selagem e alinhamento (semanas 1–3)

| # | Ação | Responsável | Entregável |
|---|------|-------------|------------|
| 1.1 | Formalizar e divulgar `DECISAO_SELADA_ROTAS_CANONICAS_V1.md` como contrato de rotas. | Arquiteto / Tech lead | Doc aprovado e linkado no README ou índice de docs. |
| 1.2 | Ajustar `userTypes.ts`: `getDefaultRouteByType('admin')` → `/app/admin`. | Dev | PR pequeno; sem mudança de comportamento de redirect (SmartDashboardRedirect já faz certo). |
| 1.3 | Remover import não utilizado de `RedirectIndividualizado` em `App.tsx` ou documentar uso futuro; se remover, alinhar qualquer referência. | Dev | Código limpo ou doc de “reserva”. |
| 1.4 | Sidebar: trocar links do **paciente** de legados para canônicos (ex.: patient-noa-chat → rota canônica definida; patient-appointments → `/app/clinica/paciente/agendamentos`; patient-chat → `/app/clinica/paciente/chat-profissional`). | Dev | Sidebar paciente 100% canônico. |
| 1.5 | Atualizar `rotasIndividualizadas.ts`: clinica-paciente “Minha Agenda” → path `/app/clinica/paciente/agendamentos`; título “Meus agendamentos” ou “Minha agenda” (um só). | Dev | Navegação individualizada alinhada. |
| 1.6 | Atualizar `01_ROTAS_ESTRUTURADAS.md`: remover referência a `chat-pacientes`; documentar apenas `chat-profissionais`; alinhar descrição de agenda/agendamentos à decisão selada. | Doc | Doc de rotas = espelho do contrato. |

**Critério de fim da Fase 1:** Nenhum link novo aponta para rotas legadas; Admin tem default explícito; documento de rotas canônicas é a referência.

---

## Fase 2 — Uma verdade por tela (semanas 4–6)

| # | Ação | Responsável | Entregável |
|---|------|-------------|------------|
| 2.1 | Agenda paciente: rota `/app/clinica/paciente/agenda` vira redirect para `/app/clinica/paciente/agendamentos`. Componente PatientAgenda pode ser mantido apenas se usado em outro contexto; senão, remover após redirect. | Dev | Uma única tela de agendamentos do paciente. |
| 2.2 | Revisar outros pares “duplicados” (chats, dashboards) listados na auditoria; para cada par, decidir “única verdade” e transformar a outra rota em redirect. | Arquiteto + Dev | Lista de redirects aplicados; sem telas fantasmas em produção. |
| 2.3 | Console.log em produção: remover ou envolver em `import.meta.env.DEV` em SmartDashboardRedirect e RedirectIndividualizado (se mantido). | Dev | Console limpo em prod. |

**Critério de fim da Fase 2:** Não existe mais “duas telas para o mesmo conceito”; redirects garantem que links antigos não quebrem.

---

## Fase 3 — Legadas como só redirects (semanas 7–10)

| # | Ação | Responsável | Entregável |
|---|------|-------------|------------|
| 3.1 | Mapear todas as rotas legadas do inventário (AUDITORIA_USABILIDADE_ROTAS_E_FLUXOS.md) para a canônica correspondente. | Dev / Tech lead | Tabela legada → canônica. |
| 3.2 | Substituir, em lotes, rota legada por `<Route path="..." element={<Navigate to="CANONICA" replace />} />`. Priorizar rotas mais usadas (ex.: patient-appointments, patient-noa-chat, professional-my-dashboard). | Dev | App.tsx com legadas apenas como redirect. |
| 3.3 | Testes de fumaça: login como paciente, profissional, admin; clicar em cada item do Sidebar; links antigos (bookmarks) redirecionam sem 404. | QA / Dev | Checklist de regressão de navegação. |

**Critério de fim da Fase 3:** Navegação visível (Sidebar, Core, docs) só usa canônicas; legadas existem apenas para compatibilidade e redirecionam.

---

## Fase 4 — Documentação e revisor sistêmico (semanas 11–12 + contínuo)

| # | Ação | Responsável | Entregável |
|---|------|-------------|------------|
| 4.1 | Índice ou README em `docs/` que aponta para: Decisão de Consolidação, Rotas Canônicas v1, Roadmap 90 dias, Auditoria usabilidade, Invariante NOA, Evoluções para melhor. | Doc | Onboarding documental claro. |
| 4.2 | Regra de decisão nova: “Tudo que for decidido em arquitetura/rotas/UX: ou entra no documento selado (ou emenda ao selado), ou não entra no sistema.” Comunicar à equipe. | Arquiteto | Processo explícito. |
| 4.3 | (Opcional) Revisor sistêmico: a cada PR que toque em rotas, Core, Admin ou telas duplicadas, checklist de 3–5 perguntas (ex.: “Isso respeita DECISAO_SELADA_ROTAS_CANONICAS_V1?”). | Tech lead | Evitar nova entropia. |

**Critério de fim da Fase 4:** Documentação é contrato; processo de decisão está escrito e conhecido.

---

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Redirect em rota que recebe query params ou state | Preservar `location.search` e `location.state` no Navigate quando fizer sentido (ex.: `?section=analytics`). |
| Bookmark antigo quebra | Todas as legadas viram redirect; nenhuma vira 404. |
| “Esquecer” uma rota legada | Usar inventário da auditoria como checklist; passar por todas as Route em App.tsx. |

---

## O que fica fora do escopo (não fazer neste ciclo)

- **Não tocar na lógica do Core** (tradevision-core): sem refatorar, sem “melhorar” estrutura interna, sem mexer em triggers, parseTriggersFromGPTResponse, deriveAppCommandsV1, COS.evaluate. Correções de bug pontuais só se inevitáveis.  
- Não reescrever fluxos de chat ou avaliação clínica.  
- Não mudar modelo “fala ≠ ação” ou allow-list de comandos.  
- Não adicionar novas Edge Functions para cognição.  
- Refatoração agressiva de componentes: apenas troca de links e redirects no front; Core permanece como está.

---

**Fechamento:** Este roadmap é conservador de propósito. O objetivo é **consolidar** a verdade atual (rotas, uma tela por conceito, Admin explícito) e **selar** em documento, sem redesenhar o sistema. Ao final dos 90 dias, a entropia de navegação deve estar contida e a documentação ser a referência viva para o próximo ciclo de evolução.
