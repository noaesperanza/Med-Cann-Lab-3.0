# Análise: Terminais Unificados — Um único workstation para profissionais da saúde

**Data:** 09 de Fevereiro de 2026  
**Objetivo:** Integrar Terminal Clínico e Terminal de Atendimento em **um único terminal** (usando o Terminal de Atendimento como base), para melhor usabilidade e um único workstation.

---

## 1. O que foi analisado

- **Diários:** Livro Magno, Diário Unificado Últimos 7 Dias, Diário Completo 05–06 e 07–08/02, Diário de Bordo 03/02 (Fase 3 — Terminal de Atendimento).
- **Core:** TradeVision Core, COS, triggers, app_commands; modelo “lobo pré-frontal”; Fase 3 = cobertura das funções essenciais no “Terminal de Atendimento”.
- **Frontend:** Rotas `/app/clinica/profissional/dashboard?section=...`, Sidebar, Header, RicardoValencaDashboard, EduardoFaveretDashboard.
- **Componentes:** `ClinicalTerminal.tsx`, `IntegratedWorkstation.tsx`, `PatientsManagement.tsx`, `PatientAnalytics.tsx`.

---

## 2. Estado atual: dois terminais

### 2.1 Terminal de Atendimento (`IntegratedWorkstation`)

- **Rota:** `section=atendimento` (e variantes: `section=pacientes`, `section=chat-clinico`, `section=prescricoes`, `section=agendamentos`).
- **Onde:** `RicardoValencaDashboard` renderiza `<IntegratedWorkstation />` para essas seções; `EduardoFaveretDashboard` não usa IntegratedWorkstation (só ClinicalTerminal).
- **Abas atuais:**
  - **Prontuário** — lista de pacientes + gestão (`PatientsManagement` embedded, compact).
  - **Chat Clínico** — `ProfessionalChatSystem` com `selectedPatientId`.
  - **Saúde Renal** — `RenalFunctionModule`.
  - **Prescrições** — `QuickPrescriptions`.
  - **Agendamentos** — `EduardoScheduling`.
  - *(Governança comentada no código.)*
- **Contexto:** `selectedPatientId` / `defaultPatientId` (um paciente em foco para Chat, Renal, Prescrições).
- **Visual:** Header “Terminal Integrado / MedCannLab OS”, fundo `#0f172a`, abas horizontais.

### 2.2 Terminal Clínico (`ClinicalTerminal`)

- **Rota:** `section=terminal-clinico`.
- **Onde:** `RicardoValencaDashboard` e `EduardoFaveretDashboard` renderizam `<ClinicalTerminal />`.
- **Abas atuais:**
  - **Clinical Governance Engine** — `ClinicalGovernanceDemo` (governança, decisões).
  - **Paciente em foco** — seleção de paciente → vista unificada com duas sub-abas:
    - **Evolução e Analytics** — `PatientAnalytics` (avatar, scores, gráfico, histórico, prescrições).
    - **Prontuário** — `PatientsManagement` em modo `detailOnly` + `preselectedPatientId` + botão voltar.
  - **Relatórios IA** — `ClinicalReports`.
  - **Base de Conhecimento** — `Library`.
  - **Fórum de Casos Clínicos** — `ForumCasosClinicos`.
- **Contexto:** `selectedPatient` (lista `linkedPatients`), dados carregados para `focusReports`, `focusAppointments`, `focusPrescriptions` quando “Paciente em foco” está aberto.
- **Visual:** Header “TERMINAL CLÍNICO / Command & Governance Center”, fundo `#050914`, estilo mais “governance”.

---

## 3. Sobreposição e diferenças

| Recurso              | Terminal de Atendimento     | Terminal Clínico                    |
|----------------------|-----------------------------|-------------------------------------|
| Lista de pacientes   | Sim (aba Prontuário)        | Não (só busca em “Paciente em foco”) |
| Prontuário detalhe   | Via lista (navega no PM)     | Sim (sub-aba em Paciente em foco)   |
| Evolução e Analytics | Não                         | Sim (sub-aba em Paciente em foco)   |
| Chat clínico         | Sim                         | Não                                 |
| Saúde Renal          | Sim                         | Não                                 |
| Prescrições          | Sim                         | Não                                 |
| Agendamentos         | Sim                         | Não                                 |
| Governança (ACDSS)   | Comentada                   | Sim (aba dedicada)                  |
| Relatórios IA        | Não                         | Sim                                 |
| Base de Conhecimento | Não                         | Sim (Library)                       |
| Fórum de Casos       | Não                         | Sim                                 |

Conclusão: o **Terminal de Atendimento** é o fluxo operacional do dia a dia (prontuário, chat, prescrições, agenda, renal). O **Terminal Clínico** é o fluxo de governança, conhecimento e “paciente em foco” (analytics + prontuário em uma vista unificada). Hoje o profissional precisa alternar entre duas seções (e dois UIs) no mesmo dashboard.

---

## 4. Proposta: um único terminal (base = Terminal de Atendimento)

Objetivo: **um único workstation** — o mesmo que já é usado para atendimento — passando a incluir todas as funções do Terminal Clínico, com UI limpa e sofisticada.

### 4.1 Princípios

1. **Base = IntegratedWorkstation**  
   Manter o componente `IntegratedWorkstation` como único container do terminal profissional. Rotas e sidebar passam a ter uma única entrada “Terminal” ou “Atendimento” que abre esse workstation.

2. **Uma barra de abas única**  
   Todas as funções em uma única navegação horizontal (ou agrupada, veja abaixo), sem trocar de “terminal”.

3. **Paciente em foco integrado**  
   A experiência “Paciente em foco” (seleção → Evolução e Analytics | Prontuário) vira **uma aba** do workstation, em vez de um terminal à parte. O `selectedPatientId` do workstation pode ser usado também nessa aba (e opcionalmente na seleção de paciente em foco).

4. **Evitar duplicação de UI**  
   Remover a necessidade de duas “capas” (dois headers, dois estilos). Um único header “Terminal Integrado” ou “Workstation” com identidade visual consistente (ex.: escala e paleta já usadas no IntegratedWorkstation, com toques de “clínico” onde fizer sentido).

5. **Append-only na navegação**  
   Não remover abas existentes; apenas **acrescentar** as que hoje estão só no ClinicalTerminal. Assim mantemos o contrato de “evolução sem redesenho” dos diários.

### 4.2 Abas do terminal unificado (proposta)

Ordem sugerida (fluxo do profissional):

1. **Prontuário** — lista e gestão de pacientes (atual).
2. **Paciente em foco** — seleção de paciente → sub-abas “Evolução e Analytics” e “Prontuário” (conteúdo hoje do ClinicalTerminal).
3. **Chat Clínico** — (atual).
4. **Prescrições** — (atual).
5. **Agendamentos** — (atual).
6. **Saúde Renal** — (atual).
7. **Governança** — Clinical Governance Engine (hoje no Terminal Clínico).
8. **Relatórios IA** — ClinicalReports.
9. **Conhecimento** — Library.
10. **Fórum** — ForumCasosClinicos.

Alternativa mais enxuta: **agrupar** em menos abas principais, com sub-abas ou painéis:

- **Atendimento:** Prontuário | Paciente em foco | Chat | Prescrições | Agendamentos | Renal.
- **Governança e Conhecimento:** Governança | Relatórios | Conhecimento | Fórum.

A primeira opção (lista plana de 10 abas) é mais direta para implementar; a segunda exige um nível extra de navegação (tabs ou sidebar interna) mas deixa o header do terminal mais limpo.

**Estratégia híbrida (recomendada pelo review arquitetural):**

- Implementar **lista plana primeiro** (V1).  
- Estruturar o código **já preparado para agrupamento futuro**: cada aba tem um `group` (`'atendimento' | 'governanca'`), assim a UI pode evoluir para abas agrupadas ou dropdowns sem refatorar a lógica. Exemplo de estrutura:

```ts
type TabGroup = 'atendimento' | 'governanca'
const tabs = [
  { id: 'patients', group: 'atendimento', label: 'Prontuário', ... },
  { id: 'patient-focus', group: 'atendimento', ... },
  { id: 'chat', group: 'atendimento', ... },
  { id: 'prescriptions', group: 'atendimento', ... },
  { id: 'scheduling', group: 'atendimento', ... },
  { id: 'renal', group: 'atendimento', ... },
  { id: 'governance', group: 'governanca', ... },
  { id: 'reports', group: 'governanca', ... },
  { id: 'knowledge', group: 'governanca', ... },
  { id: 'forum', group: 'governanca', ... },
]
```

Isso reduz risco de saturação visual em telas menores ou usuários menos avançados, sem se prender à UI atual.

### 4.3 Onde fica cada bloco de código

- **IntegratedWorkstation:**  
  - Expandir `TabId` e o array `tabs` com as novas abas.  
  - Em `renderContent()`, adicionar `case`s que renderizam:  
    - **Paciente em foco:** bloco de seleção de paciente + sub-abas Evolução e Analytics / Prontuário (lógica e componentes hoje em `ClinicalTerminal` para `patient-focus`).  
    - **Governança:** `ClinicalGovernanceDemo`.  
    - **Relatórios IA:** `ClinicalReports`.  
    - **Conhecimento:** `Library`.  
    - **Fórum:** `ForumCasosClinicos`.  
  - Reutilizar estados e carregamento de dados (relatórios, appointments, prescrições) para “Paciente em foco” — pode ser extraído para um hook ou componente `PatientFocusView` que recebe `selectedPatientId`, `onBack`, etc.

- **ClinicalTerminal:**  
  - Deixar de ser renderizado como tela principal. Duas opções:  
    - **A)** Deprecar: remover do `renderActiveSection` e da sidebar; toda a funcionalidade migrada para IntegratedWorkstation.  
    - **B)** Manter como “alias”: redirecionar `section=terminal-clinico` para `section=atendimento` (ou para `section=atendimento&tab=governance`), de forma que “Terminal Clínico” na sidebar abra o mesmo workstation, possivelmente com aba inicial “Paciente em foco” ou “Governança”.

- **RicardoValencaDashboard:**  
  - `case 'terminal-clinico':` passar a renderizar `<IntegratedWorkstation initialTab="patient-focus" />` (ou `initialTab="governance"`) em vez de `<ClinicalTerminal />`.  
  - Ou unificar de vez: apenas `section=atendimento` com query opcional `?tab=...` para aba inicial; `terminal-clinico` vira redirect para `atendimento`.

- **EduardoFaveretDashboard:**  
  - Hoje só usa ClinicalTerminal para “Terminal”. Passar a usar IntegratedWorkstation com `initialTab` adequado (ex.: `patient-focus` ou `patients`).

- **Sidebar / rotas:**  
  - Manter um único link “Terminal” ou “Terminal de Atendimento” apontando para `section=atendimento`.  
  - Opcional: manter o link “Terminal Clínico” como redirect para o mesmo terminal com aba inicial diferente (ex.: `section=atendimento&tab=patient-focus`).

### 4.4 Paciente em foco no workstation — e fonte única de verdade do paciente ativo

- No ClinicalTerminal, “Paciente em foco” usa: `linkedPatients`, `selectedPatient`, `showPatientAvatarView`, `patientFocusSubTab`, `focusReports`, `focusAppointments`, `focusPrescriptions`, e carrega avatar de `users`.  
- No IntegratedWorkstation já existe `selectedPatientId` (e opcionalmente lista de pacientes via PatientsManagement).  

**Regra arquitetural (fonte única da verdade):**

- **IntegratedWorkstation é dono do estado:** `activePatientId` (ou `selectedPatientId`) vive **só** no workstation.  
- **Abas consomem, não controlam:** Prontuário, Paciente em foco, Chat, Prescrições, Governança recebem o paciente ativo como prop; nenhuma aba é “dona” do paciente global.  
- **PatientFocusView pode sugerir mudança, não aplicar sozinha:** Se o usuário escolher outro paciente dentro de “Paciente em foco”, o componente chama um callback `onPatientChange(patientId)`; o IntegratedWorkstation atualiza `activePatientId` e todas as abas passam a refletir o mesmo paciente. Isso evita bugs clínicos graves (ex.: prescrição para A, prontuário mostrando B).

Proposta de implementação:

- Criar **`PatientFocusView`** que recebe: `activePatientId`, `onPatientChange`, e opcionalmente lista de pacientes (ou carrega `linkedPatients` internamente). Contém: busca/seleção de paciente, sub-abas “Evolução e Analytics” e “Prontuário”, e usa `PatientAnalytics` + `PatientsManagement` (detailOnly, preselectedPatientId, compact). Ao selecionar paciente na busca, chama `onPatientChange(id)`.  
- IntegratedWorkstation: aba “Paciente em foco” → `<PatientFocusView activePatientId={activePatientId} onPatientChange={setActivePatientId} />`.  
- Aba Prontuário (PatientsManagement): ao abrir detalhe de um paciente, o workstation pode atualizar `activePatientId` para esse paciente, para que Chat/Prescrições/Renal/Paciente em foco fiquem em contexto alinhado.

### 4.5 Visual e usabilidade

- **Header único:** Um só header (“Terminal Integrado” ou “Workstation Clínico”), com a mesma barra de abas.  
- **Paleta:** Manter coerência com o restante do app (ex.: escala 85%, sidebar, cores já usadas no IntegratedWorkstation). Evitar dois temas (um “escuro governance” e outro “slate”); escolher um e aplicar em todas as abas.  
- **Scroll e densidade:** Manter `scrollbar-hide`, `compact` e classes como `integrated-terminal-content` / `terminal-patient-focus-content` onde já existem, para conteúdo compacto e limpo.  
- **Responsivo:** Abas em scroll horizontal em telas pequenas (já há `overflow-x-auto` no nav); considerar ícones + labels curtas ou só ícones no mobile.

**Governança — contexto cognitivo diferente:** A aba Governança é “modo analítico”, não fluxo operacional de atendimento. Recomendação: tratamento visual sutil (badge, ícone ou tom diferente), e opcionalmente um *context cue* tipo “Modo analítico / Governança” quando a aba estiver ativa — sem mudar o tema global, só um aviso discreto para o profissional.

---

## 4.6 Validação e pontos de atenção (review arquitetural)

**Veredito:** A proposta está correta e madura; a base ser o IntegratedWorkstation é a escolha certa; “Paciente em foco” como aba (não como terminal) é o ponto-chave. Transição de “dois sistemas mentais” para “um único workstation cognitivo para o profissional”, alinhada ao lobo pré-frontal e à Fase 3.

**O que foi validado:**

1. **Container vs funções** — IntegratedWorkstation como único container; abas = modos de trabalho. Reduz carga cognitiva, duplicação de estado e bugs de sincronização (paciente selecionado, permissões, contexto).  
2. **Paciente em foco transversal** — Extrair para PatientFocusView reutilizável resolve inconsistência de UX, divergência de dados e necessidade de “voltar de terminal”; é refatoração de domínio, não só de UI.  
3. **Migração append-only** — Redirect/alias para `terminal-clinico`, não remover abas nem quebrar rotas; respeita histórico dos diários, hábitos do profissional e links/comandos internos.

**Pontos de atenção (não invalidadores):**

| Ponto | Risco | Mitigação |
|-------|--------|-----------|
| **10+ abas** | Saturação visual em telas menores ou usuários menos avançados | Lista plana em V1; código já com `TabGroup` para agrupamento futuro (ex.: Atendimento vs Governança). |
| **Estado do paciente** | Cada aba “escolher paciente sozinha” → bugs clínicos | Workstation possui `activePatientId`; abas consomem via props; PatientFocusView emite `onPatientChange`, não é dona do estado global. |
| **Governança no fluxo operacional** | Contexto cognitivo diferente (analítico vs atendimento) | Aba separada; tratamento visual sutil (badge/ícone/tom ou context cue “Modo analítico / Governança”). |

---

## 5. Plano de implementação (resumido)

1. **Fonte única de verdade do paciente no workstation**  
   - IntegratedWorkstation mantém `activePatientId` (ou renomear `selectedPatientId` para esse nome).  
   - Todas as abas que dependem de paciente recebem `activePatientId` e, quando aplicável, `onPatientChange` (ex.: PatientFocusView; Prontuário pode chamar `onPatientChange` ao abrir detalhe de um paciente).

2. **Extrair “Paciente em foco” para componente reutilizável**  
   - Criar `PatientFocusView.tsx` com a lógica e UI hoje em ClinicalTerminal (patient-focus).  
   - Props: `activePatientId`, `onPatientChange`; não manter estado próprio de “paciente selecionado” como dono global.  
   - Usar em IntegratedWorkstation na nova aba “Paciente em foco”.

3. **Expandir IntegratedWorkstation**  
   - Adicionar abas (com `group: 'atendimento' | 'governanca'` para agrupamento futuro): Paciente em foco, Governança, Relatórios IA, Conhecimento, Fórum.  
   - Implementar `renderContent()` para cada uma, reutilizando ClinicalGovernanceDemo, ClinicalReports, Library, ForumCasosClinicos.  
   - Governança: context cue visual opcional (“Modo analítico / Governança”).  
   - Repassar `activePatientId` (e `onPatientChange` onde couber) para Governança e PatientFocusView.

4. **Unificar rota e navegação**  
   - Fazer `section=terminal-clinico` redirecionar para `section=atendimento` (com query `tab=patient-focus` ou `tab=governance` se quiser).  
   - Ou remover `terminal-clinico` da sidebar e deixar só “Terminal de Atendimento”.

4. **RicardoValencaDashboard e EduardoFaveretDashboard**  
   - Trocar `case 'terminal-clinico': return <ClinicalTerminal />` por `return <IntegratedWorkstation initialTab="patient-focus" />` (ou tab desejada).  
   - EduardoFaveret: onde hoje renderiza ClinicalTerminal, passar a renderizar IntegratedWorkstation.

6. **Limpeza**  
   - Remover ou deprecar `ClinicalTerminal` como tela principal; opcionalmente manter o componente apenas como wrapper/redirect para não quebrar links antigos.  
   - Atualizar Sidebar (descrições, um único item “Terminal” se desejado).  
   - Atualizar triggers do header / noaCommand se algum comando abrir “terminal clínico” (passar a abrir o workstation com a aba correta).

6. **Testes e documentação**  
   - Testar: Prontuário → seleção de paciente → Chat/Renal/Prescrições com mesmo paciente; depois abrir “Paciente em foco” e ver Evolução e Analytics + Prontuário.  
   - Testar governança, relatórios, conhecimento e fórum dentro do mesmo terminal.  
   - Atualizar Livro Magno / diário com “Terminais unificados no workstation único”.

---

## 6. Resumo executivo

- **Situação atual:** Dois terminais (Atendimento = operação do dia a dia; Clínico = governança + paciente em foco + conhecimento + fórum). Dois UIs e duas entradas na sidebar.  
- **Meta:** Um único terminal (workstation) baseado no **Terminal de Atendimento**, incorporando todas as funções do Terminal Clínico em uma mesma barra de abas, com visual limpo e consistente.  
- **Mudança principal:** Expandir `IntegratedWorkstation` com as abas e conteúdos do `ClinicalTerminal`; extrair “Paciente em foco” para um componente reutilizável; deixar de usar ClinicalTerminal como tela principal e passar a usar só IntegratedWorkstation para ambas as seções (`atendimento` e `terminal-clinico`).  
- **Benefício:** Melhor usabilidade para profissionais da saúde — um único lugar para prontuário, paciente em foco, chat, prescrições, agenda, renal, governança, relatórios, conhecimento e fórum, sem alternar entre dois terminais.

---

**Documento criado por:** Análise dos diários (Livro Magno, DIARIO_UNIFICADO_ULTIMOS_7_DIAS, DIARIO_COMPLETO_05-06, DIARIO_DE_BORDO_CURSOR_03-02) e do código (ClinicalTerminal, IntegratedWorkstation, RicardoValencaDashboard, Sidebar, rotas).  
**Review arquitetural:** Incorporados veredito (proposta correta e madura), pontos de atenção (abas 10+, estado do paciente, governança) e mitigações (TabGroup, fonte única activePatientId, context cue Governança).  
**Próximo passo sugerido:** Estabelecer `activePatientId` no IntegratedWorkstation; em seguida implementar `PatientFocusView` e a expansão das abas conforme a ordem do plano acima.
