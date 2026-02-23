# Relatório Técnico Mestre - Unificação de Agendamento e Segurança de Jornada
**Data:** 21/12/2025
**Commit:** `89da9ad5` - *refactor: unify patient scheduling flow, add assessment requirement modal and clean up dashboard*

## 1. Visão Geral da Arquitetura
Este commit realizou uma refatoração estrutural significativa no módulo do paciente (`/app/clinica/paciente`), com o objetivo de centralizar o fluxo de agendamento e impor regras de negócio críticas (Avaliação Clínica Obrigatória) antes de permitir a interação com especialistas.

### Mudança de Paradigma
*   **Antes:** O agendamento era fragmentado. Existia um "mini-sistema" dentro do componente `PatientDashboard.tsx` (aba interna) e uma página separada `PatientAppointments.tsx`. Isso gerava duplicação de código e inconsistência visual/funcional.
*   **Depois:** `PatientDashboard.tsx` atua apenas como um hub visual. Toda a lógica de agendamento, escolha de profissionais e verificação de pré-requisitos foi movida e centralizada em `PatientAppointments.tsx`.

## 2. Detalhamento das Alterações por Arquivo

### 🏗️ `src/pages/PatientDashboard.tsx` (Refatoração & Limpeza)
*   **Remoção de Código Morto:**
    *   Removida a função `renderAgendamento()` inteira.
    *   Removida a constante `availableProfessionals` (agora reside em `PatientAppointments`).
    *   Removida a lógica de estado para `activeTab === 'agendamento'`.
*   **Redirecionamento:**
    *   A função `handleScheduleAppointment` foi alterada para executar um `navigate('/app/patient-appointments')` direto, em vez de alterar o estado local.

### 📅 `src/pages/PatientAppointments.tsx` (Nova Lógica Central)
*   **Integração de UI:**
    *   Importação e renderização da lista de profissionais (`AVAILABLE_PROFESSIONALS`) com cards visuais (Dr. Eduardo Faveret, Dr. Ricardo Valença).
*   **Implementação de "Guard Rail" (Trava de Segurança):**
    *   Ao clicar em "Agendar Consulta", o sistema não abre mais o calendário imediatamente.
    *   **Lógica:** Verifica se `carePlan?.id` existe (indicando que o paciente já tem um plano/avaliação).
    *   **Fluxo Feliz:** Se `carePlan` existe -> Abre modal de calendário.
    *   **Fluxo de Bloqueio:** Se `carePlan` não existe -> Abre `AssessmentRequiredModal`.

### 🤖 `src/pages/PatientNOAChat.tsx` (Contexto de IA)
*   **Engenharia de Prompt Dinâmica:**
    *   Atualizado para ler `location.state.targetProfessional`.
    *   Se o usuário chega aqui vindo do bloqueio de agendamento, a IA recebe o prompt: *"Gostaria de realizar minha avaliação para posterior agendamento com [Nome do Médico] ([Especialidade])"*.
    *   Isso garante que a IA saiba o **porquê** do usuário estar ali, melhorando a continuidade da experiência.

### 🧩 Novos Componentes (UI/UX)

#### `src/components/AssessmentRequiredModal.tsx`
*   **Propósito:** Educar e Redirecionar.
*   **Design:** Modal escuro com ícones de alerta (`Shield`, `Stethoscope`). Explica que o agendamento requer avaliação prévia.
*   **Ação:** Botão "Iniciar Avaliação Agora" que leva ao chat da Nôa.

#### `src/components/JourneyManualModal.tsx`
*   **Propósito:** Informação Estática.
*   **Design:** Substituiu o texto longo que poluiu a tela de agendamentos. Mostra os 4 passos da jornada (Avaliação -> Relatório -> Compartilhamento -> Agendamento) em formato de timeline vertical.

## 3. Fluxo do Usuário (User Journey) Atualizado

1.  **Dashboard:** Paciente clica em "Agendar Consulta".
2.  **Redirecionamento:** Vai para `/app/patient-appointments`.
3.  **Seleção:** Paciente vê os médicos e clica em "Agendar" no card do Dr. Ricardo Valença.
4.  **Verificação:** Sistema checa: "Usuário tem carePlan?"
    *   **NÃO:** Exibe `AssessmentRequiredModal`. Paciente clica em "Iniciar Avaliação". Vai para Chat Nôa. Nôa diz: "Entendi que você quer agendar com Dr. Ricardo. Vamos fazer sua avaliação primeiro."
    *   **SIM:** Exibe modal de calendário/horários padrão.

## 4. Métricas de Código
*   **Linhas Removidas:** ~200 linhas de código duplicado em `PatientDashboard.tsx`.
*   **Linhas Adicionadas:** ~150 linhas em `PatientAppointments.tsx` (lógica de UI e Modal) + 2 novos arquivos de componente.
*   **Complexidade:** Reduzida. A responsabilidade de "Agendar" agora é única e exclusiva de uma página.

## 5. Próximos Passos Sugeridos
*   Verificar se a query de `carePlan` está robusta para todos os casos (ex: avaliações antigas).
*   Implementar a persistência do agendamento solicitado *após* o término da avaliação no chat (atualmente a IA apenas sabe da intenção, mas não "reserva" a vaga).
