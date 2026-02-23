# LIVRO MAGNO — Documento Final Consolidado (MedCannLab 3.0)

**Versão:** 1.0  
**Data:** 06 de Fevereiro de 2026  
**Objetivo:** Uma única fonte da verdade — histórico, governança, **dados reais do app**, auditorias de ontem e hoje, e vereditos externos — para você entender **o que tem na mão**.

**Fontes unificadas:** Livro Magno 1.0.6, Diário Mestre 05.02, Diário Livro Magno 06.02, Auditoria de Triggers (Header + TradeVision Core), vereditos sobre o Livro e sobre a auditoria de triggers.

---

## Como usar este documento

- **Parte I** = História e governança (Linha do Tempo + COS + **Limites explícitos do sistema (Non-Goals)** + Termos + Economia + Mérito + **Política de evolução controlada**).
- **Parte II** = O que temos no app hoje (dados reais): triggers do header, triggers do Core (chat Nôa), onde está cada coisa e o que abre.
- **Parte III** = Vereditos e análise; **Compatibilidade com a arquitetura**; **Modelo de responsabilidade (RACI)**.
- **Referências** = Lista de todos os documentos de ontem e hoje para aprofundar.

---

# PARTE I — LIVRO MAGNO: HISTÓRICO E GOVERNANÇA

## 1. Introdução

O **Livro Magno** consolida o registro histórico do MedCannLab: diários de sessões, changelogs técnicos e marcos evolutivos em uma linha do tempo coesa. É a fonte definitiva da verdade sobre a evolução técnica, clínica e cognitiva do sistema.

A narrativa cobre desde a refundação da experiência do paciente (final de 2025) até o **event of sealing** da Arquitetura Cognitiva (COS v5.0) em fevereiro de 2026.

---

## 2. Linha do Tempo Unificada (resumo)

- **Dez/2025:** Jornada de Cuidado (dashboard paciente, vitrine de profissionais, trava de segurança, Nôa contextual); polimento chat/RLS e mobile; I18N.
- **Jan/2026:** Estabilização ambiente; Nôa Residente (fim de loops, persistência avaliação, chat profissional); módulo renal, assinatura digital e solicitação de exames (planejamento/implementação).
- **01–02/02/2026:** Último obstáculo de agendamento; **COS v3.0** (Constituição Cognitiva, CEP, pipeline clínico, TradeVision Core v3.0.1).
- **03/02:** Auditoria operacional + invariantes (fala ≠ ação, trigger_scheduling por palavra-chave, `INVARIANTE_MODELO_EXECUCAO_NOA.md`); refino de triggers (cancelamento, agenda vs card no chat, confirmação = ato direto).
- **04/02:** Git isolado (repo OrbitrumConnect/medcannlab5); selagem institucional (token `[TRIGGER_SCHEDULING]`, `PROTOCOLO_APP_COMMANDS_V2.md`); evolução append-only (Admin, CAS, fix RLS, epistemologia do cuidado).
- **05/02:** Gatilhos de agendamento ampliados; regra &lt; 10 palavras em contexto de agendamento; doc mestre e `EVOLUCOES_PARA_MELHOR.md`.
- **06/02 Sessão 1:** Terminal Clínico e Integrado (Paciente em foco + Evolução e Analytics + Prontuário); escala global 85%; scrollbars invisíveis; fix "patients before initialization".
- **06/02 Sessão 2:** Header unificado; triggers por perfil no header; cérebro Nôa sempre visível; alinhamento header–sidebar; correção loops React (useRef AlunoDashboard/EnsinoDashboard); acesso admin aos terminais clínicos preservado.

*(Detalhes dia a dia em `docs/LIVRO_MAGNO_DIARIO_UNIFICADO.md` e `docs/DIARIO_LIVRO_MAGNO_06-02-2026.md`.)*

---

## 3. COS v3.0 → v5.0 (O Selamento)

- **Constituição Cognitiva:** Não-Execução; Rastreabilidade Total; Auditoria Ontológica; Autonomia Graduada; Falibilidade Declarada.
- **CEP:** tabela `cognitive_events`, insert-only, auditabilidade jurídica.
- **Selamento:** Constituição congelada; Livro Magno hasheado no Kernel; evento `SYSTEM_SEALING` declarando versão 5.0. *O sistema opera sob auteridade (auto-restrição).*

---

## Limites explícitos do sistema (Non-Goals)

O MedCannLab **não se propõe** a:

- Substituir julgamento clínico humano.
- Tomar decisões médicas finais.
- Prescrever, alterar ou cancelar tratamentos sem ação humana explícita.
- Executar atos clínicos baseados apenas em linguagem natural.
- Operar como sistema autônomo ou autoexecutável.

A IA (Nôa) atua exclusivamente como sistema de apoio cognitivo, sob governança do Core e com execução condicionada a contratos, perfis e confirmações explícitas.

---

## 4. Termos para a linha do tempo (05–06.02)

- **05/02:** Gatilhos de agendamento ampliados; confirmações curtas; regra &lt; 10 palavras; documento mestre e evoluções append-only.
- **06/02 (Sessão 1):** Terminal Clínico e Integrado; Paciente em foco unificado; Evolução e Analytics + Prontuário; escala global 85%; correção "patients before initialization".
- **06/02 (Sessão 2):** Header unificado; triggers por perfil; cérebro Nôa sempre visível; alinhamento header–sidebar; correção loops React; acesso admin aos terminais clínicos preservado.

---

## 5. Anexo 1 — Economia gamificada (Two-Track)

- **Via 1 — Engajamento (Pontos/XP):** comportamento e uso; integer; retenção; não é dinheiro.
- **Via 2 — Programa de Indicação Comercial (Benefício Financeiro Condicionado):** recompensa financeira por trazer receita (novos assinantes); decimal (R$); crescimento viral. **Regra de Ouro:** cashback de indicação só existe se houver pagamento real na outra ponta.  
  **Reforço (blindagem máxima):** *"A participação no programa de indicação é opcional, desvinculada de qualquer atividade clínica, educacional ou assistencial."*

Implementação atual: Dar Pontos ✅ (`increment_user_points` no tradevision-core); Rastrear Indicação ✅ (`invited_by` em `users`); Calcular Comissão 🚧 (trigger futuro em `transactions`).

---

## 6. Anexo 2 — Sistema de Mérito

- Ranking percentual + mérito sustentado (3 meses). Benefícios: Consulta Gratuita (1/6 meses, médico ou 1º grau, não acumulável); Desconto progressivo (7º mês, 5%→30%, regride se sair). Recompensa comportamento no ecossistema, nunca o ato médico. Legal e alinhado a HealthTech.

---

## Política de evolução controlada

Mudanças no MedCannLab seguem os critérios:

### Podem evoluir
- UI/UX
- Heurísticas do Core
- Triggers não clínicos
- Visualização e navegação

### Não podem mudar sem nova versão do Livro Magno
- Constituição Cognitiva (COS)
- Princípios de execução (fala ≠ ação)
- Contratos de triggers clínicos
- Modelo de responsabilidade

Qualquer alteração estrutural exige: registro append-only, nova versão do Livro Magno e declaração explícita de impacto.

---

# PARTE II — O QUE TEMOS NO APP HOJE (DADOS REAIS)

Esta seção consolida **dados reais** do código e dos documentos de auditoria: o que existe, onde está e o que abre (EVA/UI).

## 7. Triggers do header (cards no topo)

- **Onde:** `DashboardTriggersContext`; cada dashboard chama `setDashboardTriggers`. **UI:** `Header.tsx` — cards em scroll horizontal em torno do cérebro Nôa; clique no card = `onChange(id)`.
- **Cérebro Nôa:** centro fixo; clique = abre/fecha chat da Nôa.

**Resumo por tipo de ação:**

| Comportamento | Dashboards |
|---------------|------------|
| Só troca `?section=` na mesma página | PatientDashboard, ProfessionalDashboard, EnsinoDashboard, AlunoDashboard, RicardoValencaDashboard, EduardoFaveretDashboard |
| Navega para outra rota | ClinicaDashboard (pacientes, relatorios, avaliacoes); PesquisaDashboard (cidade-amiga, forum-casos, medcann-lab); ProfessionalMyDashboard (atendimento, prescricoes, terminal-clinico, chat-profissionais) |
| Card “principal” não navega (fica na página) | ClinicaDashboard “Dashboard Clínica”; PesquisaDashboard “Eixo Pesquisa”; ProfessionalMyDashboard “Meu Dashboard” |

**Exemplos de rotas reais:**  
Paciente: `/app/clinica/paciente/dashboard?section=analytics|meus-agendamentos|plano|conteudo|perfil`.  
Profissional: `/app/clinica/profissional/dashboard?section=dashboard|prescriptions|clinical-reports|agendamentos`.  
Ricardo/Eduardo: mesma rota do dashboard, `?section=` define seção (atendimento, pacientes, agendamentos, prescricao-rapida, admin-upload, admin-renal, etc.).

**Documento completo (todos os dashboards e IDs):** `docs/AUDITORIA_TRIGGERS_HEADER_APP.md` — Parte A.

---

## 8. Triggers do TradeVision Core (chat Nôa)

- **Onde:** `supabase/functions/tradevision-core/index.ts` (Edge Function única). **Modelo:** GPT emite tag → Core governa → gera `metadata` e `app_commands` → front executa.
- **Tokens selados:** `[TRIGGER_SCHEDULING]` (agendamento); `[TRIGGER_ACTION]` (sinal interno; usuário não vê).
- **Fluxo:** Mensagem → Core (COS, GPT, heurísticas) → `parseTriggersFromGPTResponse` ou fallback `deriveAppCommandsV1` → `filterAppCommandsByRole` → resposta `{ text, metadata, app_commands }`. Front: `trigger_scheduling === true` → **widget de agendamento no chat**; `app_commands` → `executeAppCommands` → evento `noaCommand`; listeners (RicardoValencaDashboard, Layout, NoaConversationalInterface) executam navegação, prescrição, filtro pacientes, etc.

**O que cada trigger do Core abre no app (EVA):**

| Tag / origem | O que abre no app |
|--------------|--------------------|
| `[TRIGGER_SCHEDULING]` | Widget de agendamento (calendário) **dentro do chat** |
| `[NAVIGATE_TERMINAL]` | Seção Terminal de Atendimento ou navega para dashboard com `?section=atendimento` |
| `[NAVIGATE_AGENDA]` | Aba/rota de agenda profissional |
| `[NAVIGATE_PACIENTES]` | Tela de gestão de pacientes |
| `[NAVIGATE_RELATORIOS]` | Tela de relatórios clínicos |
| `[NAVIGATE_CHAT_PRO]` | Chat entre profissionais |
| `[NAVIGATE_PRESCRICAO]` | Tela de prescrições |
| `[NAVIGATE_BIBLIOTECA]` | Biblioteca compartilhada |
| `[NAVIGATE_FUNCAO_RENAL]` | Seção Função Renal |
| `[NAVIGATE_MEUS_AGENDAMENTOS]` | Página Meus agendamentos do paciente |
| `[NAVIGATE_MODULO_PACIENTE]` | Dashboard paciente, aba Evolução |
| `[SHOW_PRESCRIPTION]` | Terminal: seção prescrições + modal última prescrição |
| `[FILTER_PATIENTS_ACTIVE]` | Terminal: seção pacientes + filtro ativos |
| `[DOCUMENT_LIST]` | Lista de documentos no chat |

**Governança:** `filterAppCommandsByRole` — Admin: todos; profissional: todos exceto admin-renal (se restrito); paciente/aluno: só rotas paciente, biblioteca, documentos.

**Documento completo (fluxo, fallback Mundo B, tabela completa):** `docs/AUDITORIA_TRIGGERS_HEADER_APP.md` — Parte B.

---

## 9. Resumo unificado (Header + Core)

| Sistema | Onde | O que dispara | O que abre |
|---------|------|----------------|------------|
| **Header (cards)** | Contexto React + Header.tsx | Clique no card do dashboard atual | Seção (`?section=`) ou navegação para outra rota |
| **Core (chat Nôa)** | Edge Function + metadata/app_commands | Resposta do GPT com tag (ou heurística) | Widget de agendamento no chat; navegação (seção/rota); prescrição; filtro pacientes; documentos; botões "Abrir [aba]" na mensagem |

---

# PARTE III — VEREDITOS E ANÁLISE

Consolidação das avaliações externas que você recebeu sobre o Livro Magno e sobre a auditoria de triggers.

## 10. Veredito sobre o Livro Magno (governança e economia)

- **Geral:** Livro Magno 1.0.6 está coerente historicamente, arquiteturalmente sólido, juridicamente defensável no Brasil, alinhado com HealthTech e bem selado (append-only, governança clara). Não há sinal de investimento pirâmide, marketing multinível ou incentivo ilegal ao ato médico; o texto antecipa e neutraliza os pontos que costumam dar problema.
- **Livro como fonte da verdade:** Unificação de diário técnico, clínico, cognitivo e institucional dá defesa jurídica, continuidade histórica, base para auditoria e lastro institucional. Livro hasheado e referenciado no Kernel é decisão forte.
- **COS e Selamento:** Os 5 princípios estão equilibrados (não prometem autonomia total, não romantizam IA, não violam responsabilidade médica). Destaque para Falibilidade declarada, Autonomia graduada e Fala ≠ ação.
- **Triggers e determinismo:** Documentos como `INVARIANTE_MODELO_EXECUCAO_NOA.md` e `PROTOCOLO_APP_COMMANDS_V2.md` e triggers determinísticos reduzem riscos de “IA decidiu sozinha”, “executou sem confirmação” e “não sabemos por que aconteceu”.
- **Economia (Two-Track):** A separação Via 1 (comportamento/XP) vs Via 2 (referral condicionado a pagamento real) protege o projeto. Sugestão aplicada neste consolidado: reforçar Via 2 como “Programa de Indicação Comercial (Benefício Financeiro Condicionado)” e incluir a frase sobre participação opcional e desvinculada de atividade clínica/educacional/assistencial.
- **Mérito:** Ranking percentual, mérito sustentado, benefícios não acumuláveis e regressão automática; consulta gratuita como benefício institucional e desconto como fidelidade. Avaliado como legal, ético e defensável.
- **Conclusão:** O documento funciona como carta institucional, constituição cognitiva, pré-lastro jurídico e base de governança; defende em auditoria, conversa com conselho médico, investidor sério ou justificativa de decisões técnicas.

---

## 11. Veredito sobre a auditoria de triggers (Header + Core)

- **Geral:** Sistema de triggers está arquiteturalmente correto, determinístico onde precisa ser, governado (não “IA manda”), auditável ex-post e coerente entre Header ↔ Core ↔ UI. Não existe trigger implícito que cause ação clínica sem mediação explícita do Core ou do usuário.
- **Parte A (Header):** Modelo único (card = intenção de navegação; Header não sabe para onde vai); separação clara dos três tipos de ação (same route + section, navegação, no-op consciente); consistência entre Paciente, Profissional, Ensino, Pesquisa, Aluno; dashboards Ricardo/Eduardo com triggers contextuais por eixo. Atenção: padronizar `useRef` para onChange em todos os dashboards para evitar loops; considerar feedback visual para triggers “já está aqui” (Clinica/Pesquisa/ProfessionalMy dashboard).
- **Parte B (Core):** Modelo de IA governada (fala ≠ ação; GPT → tag, Core → valida, Front → executa); triggers como contrato; fallback heurístico (Mundo B) bem posicionado como resiliência e marcado como DETERMINISTIC_TRIGGER. Atenção: documento formal de contrato por trigger (ex.: `GPT_TRIGGER_CONTRACT.md`); logar quando comando for bloqueado por perfil (`command_blocked_by_role`); documentar que listeners de `noaCommand` podem ser múltiplos e que comandos devem ser idempotentes.
- **Coerência Header ↔ Core:** Os dois sistemas não se confundem; convergem no mesmo vocabulário (navigate-section, navigate-route, show-prescription, filter-patients). Avaliado como linguagem unificada de navegação cognitiva e manual de onboarding sênior.

---

# COMPATIBILIDADE COM A ARQUITETURA DO APP

Este documento e as auditorias referenciadas foram conferidos com o código atual do repositório. Resumo da verificação:

| O que foi conferido | Onde no app | Status |
|---------------------|-------------|--------|
| **Rotas eixo Clínica** | `src/App.tsx` | `/app/clinica/profissional/dashboard` → RicardoValencaDashboard; `/app/clinica/profissional/pacientes`, `relatorios`, `agendamentos`, `chat-profissionais`; `/app/clinica/paciente/dashboard`, `agendamentos` — compatível. |
| **Rotas eixo Ensino** | `src/App.tsx` | `/app/ensino/profissional/dashboard` → EnsinoDashboard; `/app/ensino/aluno/dashboard` → AlunoDashboard — compatível. |
| **Rotas eixo Pesquisa** | `src/App.tsx` | `/app/pesquisa/profissional/dashboard`, `forum-casos`, `cidade-amiga-dos-rins`, `medcann-lab` — compatível. |
| **Contexto de triggers do header** | `src/contexts/DashboardTriggersContext.tsx`, `src/components/Header.tsx` | `setDashboardTriggers`, `options`, `activeId`, `onChange`, `onBrainClick` — existem e batem com o doc. |
| **Dashboards que registram triggers** | `src/pages/*.tsx` | PatientDashboard, ProfessionalDashboard, ClinicaDashboard, EnsinoDashboard, PesquisaDashboard, AlunoDashboard, ProfessionalMyDashboard, RicardoValencaDashboard, EduardoFaveretDashboard — todos usam `setDashboardTriggers` conforme auditoria. |
| **TradeVision Core** | `supabase/functions/tradevision-core/index.ts` | `TRIGGER_SCHEDULING_TOKEN`, `GPT_TRIGGERS` (NAVIGATE_TERMINAL, NAVIGATE_AGENDA, NAVIGATE_PACIENTES, etc.), `parseTriggersFromGPTResponse`, `filterAppCommandsByRole`, `deriveAppCommandsV1` — compatível com a Parte II e com a auditoria. |
| **Tabelas / backend** | Supabase | `cognitive_events` referenciada no Core; economia (pontos, indicação) conforme Anexo 1 — implementação atual descrita no doc. |

**Nuances (não quebram compatibilidade):**

- **ClinicaDashboard:** componente montado em `/app/clinica-dashboard` (rota legada); os *triggers* desse dashboard navegam para `/app/clinica/profissional/pacientes`, `relatorios` e `dashboard` — correto no código e no doc.
- **Dashboard “Eduardo”:** a rota `/app/clinica/profissional/dashboard-eduardo` monta atualmente **ProfessionalMyDashboard**; o componente **EduardoFaveretDashboard** existe e usa `setDashboardTriggers` (auditoria correta); se no seu fluxo ele for acessado por outra rota ou link, o comportamento dos triggers descrito no doc continua válido para esse componente.

Conclusão: **os documentos (consolidado e auditorias) são compatíveis com a arquitetura e com o que o app faz hoje.** Rotas, contextos, Core e nomes de componentes conferem com o código.

---

## Modelo de responsabilidade (RACI simplificado)

| Ação | IA (Nôa) | Core | Front-end | Usuário |
|------|----------|------|-----------|---------|
| Interpretar linguagem | R | – | – | – |
| Gerar sugestão | R | – | – | – |
| Validar ação | – | R | – | – |
| Executar navegação | – | – | R | – |
| Confirmar ato clínico | – | – | – | R |
| Registrar evento | – | R | – | – |

**R** = Responsável pela ação. Nenhuma etapa clínica crítica ocorre sem responsabilidade humana final.

---

# REFERÊNCIAS — Documentos de ontem e hoje

| Documento | Conteúdo |
|-----------|----------|
| `docs/LIVRO_MAGNO_DIARIO_UNIFICADO.md` | Livro Magno 1.0.6 completo (timeline, COS, termos, Anexos 1 e 2). |
| `docs/DIARIO_MESTRE_COMPLETO_05-02-2026.md` | Diário mestre 05.02; análise do Core; gatilhos e regra &lt; 10 palavras; COS. |
| `docs/DIARIO_LIVRO_MAGNO_06-02-2026.md` | Diário 06.02; fluxo do Core; timeline 04→06.02; terminais; escala global; nível mercado; o que falta. |
| `docs/AUDITORIA_TRIGGERS_HEADER_APP.md` | Auditoria completa: triggers do header (por dashboard, rota, ação) + TradeVision Core (tags, fluxo, o que abre no app/EVA). |
| `docs/PROTOCOLO_APP_COMMANDS_V2.md` | Contrato de triggers; prioridade de canais; evolução append-only. |
| `docs/INVARIANTE_MODELO_EXECUCAO_NOA.md` | Fala ≠ ação; política de mudança; contrato `[TRIGGER_SCHEDULING]`. |
| `docs/EVOLUCOES_PARA_MELHOR.md` | Registro de mudanças que evoluíram o sistema (selar/acrescentar, sem redesenhar). |

---

**Documento final consolidado.** Histórico (Livro Magno), governança (COS, economia, mérito), dados reais do app (triggers header + Core, o que abre), vereditos sobre o Livro e sobre a auditoria de triggers, e referências a todos os docs de ontem e hoje — para você ter em mãos o que o MedCannLab é, o que faz e onde está documentado.
