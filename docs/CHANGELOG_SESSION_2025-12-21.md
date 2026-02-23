# Relatório de Mudanças - Sessão 21/12/2025

## Resumo Executivo
Hoje focamos na reestruturação e simplificação do **Dashboard do Paciente** e no fluxo de **Agendamento de Consultas**, com foco na experiência do usuário e na garantia da Jornada de Cuidado (Avaliação Clínica Obrigatória).

## 🔄 Antes e Depois

### 1. Dashboard do Paciente (`PatientDashboard.tsx`)
*   **Antes:**
    *   Possuía uma aba interna complexa chamada "Agendamento" que renderizava uma lista de profissionais e explicações duplicadas.
    *   Navegação confusa entre o Dashboard e a página dedicada de Agendamentos.
*   **Depois:**
    *   **Simplificado:** Removemos a aba interna "sistema de agendamento".
    *   **Navegação Unificada:** O botão de "Agendar Consulta" agora redireciona diretamente para a rota `/app/patient-appointments`, centralizando a lógica.

### 2. Página de Agendamentos (`PatientAppointments.tsx`)
*   **Antes:**
    *   Exibia um texto longo e estático sobre a "Jornada de Cuidado".
    *   Não listava os profissionais disponíveis para agendamento direto (apenas consultórios genéricos ou via dashboard).
    *   Permitia tentar agendar (ou apenas ver calendário) sem verificar se o paciente já tinha passado pela avaliação inicial.
*   **Depois:**
    *   **Jornada Simplificada:** O texto longo foi substituído por um banner limpo com um botão "Manual da Jornada" que abre um modal explicativo (`JourneyManualModal`).
    *   **Vitrine de Profissionais:** Adicionada a seção "Agendar com Especialista" (Dr. Eduardo Faveret e Dr. Ricardo Valença) diretamente nesta página.
    *   **Trava de Segurança (Avaliação):** Ao clicar em "Agendar Consulta", o sistema verifica se o paciente possui um plano de cuidado (`carePlan`). Se não tiver, exibe o `AssessmentRequiredModal`.

### 3. Integração com IA (`PatientNOAChat.tsx`)
*   **Antes:**
    *   Chat abria genericamente ou apenas iniciava avaliação sem contexto do médico desejado.
*   **Depois:**
    *   **Contexto Preservado:** Se o paciente for redirecionado pelo modal de "Avaliação Obrigatória" ao tentar agendar com o Dr. Ricardo, o chat inicia dizendo: *"Gostaria de realizar minha avaliação para posterior agendamento com Dr. Ricardo Valença"*.

## 🛠️ Componentes Novos/Alterados
1.  **`src/components/AssessmentRequiredModal.tsx` [NOVO]:** Modal que bloqueia o agendamento se não houver avaliação, educando o paciente sobre a necessidade do protocolo IMRE.
2.  **`src/components/JourneyManualModal.tsx` [NOVO]:** Modal informativo com os passos da jornada (Avaliação -> Relatório -> Compartilhamento -> Consulta).
3.  **`src/pages/PatientAppointments.tsx`:** Refatorado para incluir a lista de profissionais e lógica de modal.
4.  **`src/pages/PatientNOAChat.tsx`:** Atualizado para receber `targetProfessional` via `location.state`.

## 🐛 Correções
*   Correção de erro de referência (`Stethoscope is not defined`) em `PatientAppointments.tsx`.
*   Limpeza de imports duplicados e código morto no Dashboard.

---

### 4. Polimento Profissional & Responsividade (Pós-Unificação)
*   **Responsividade Mobile Fix:** Removidas regras CSS agressivas em `mobile-responsive.css` que forçavam layout de 1 coluna em tablets, restaurando o comportamento correto do grid.
*   **Header Mobile Otimizado:** Criado um "Switcher de Visão" compacto para o Header no mobile, agrupando os botões de administração (Admin, Profissional, Aluno, etc.) em um dropdown para evitar quebra de layout.
*   **Clean Code:** Removido "hack" de CSS `<style>` em `PatientDashboard.tsx` que escondia o chat global. Substituído por controle de estado limpo via `NoaPlatformContext` (`hideGlobalChat`).

### 5. Melhorias de UI/UX e Correções no Chat (PatientChat & Appointments)
*   **Correção de Sobreposição (Z-Index):** Resolvido problema onde o dropdown de seleção de profissionais era cortado ou ficava atrás do chat. Implementado `z-[100]` para garantir visibilidade.
*   **Merge de Interface:** Seletor de profissionais foi integrado ao cabeçalho do chat, eliminando cards redundantes e otimizando o espaço.
*   **Limpeza Visual:**
    *   Removido banner duplicado "Avaliação Clínica Inicial" do modal de agendamento (`PatientAppointments`).
    *   Substituído por um link discreto para o "Manual da Jornada".
    *   Adicionado seção "Consentimento Informado & NFT Escute-se" ao `JourneyManualModal` para centralizar informações legais.
*   **Correção de Dados:** Ampliada a query de profissionais no chat para incluir tipos `admin`, `medico` e `specialist`, garantindo que toda a equipe clínica apareça na lista (fix para Ricardo Valença/Eduardo Faveret).

### 6. Follow-up (22/12): Correções Mobile
*   **Correção de Botão Flutuante (Sidebar):** Removido botão de menu antigo (`MobileResponsiveWrapper`) que estava fixado no topo (`fixed top-4`) e sobrepunha o novo cabeçalho, causando inconsistência visual e movimento indesejado ao rolar. Agora o controle da sidebar é exclusivo do Header.

### 7. Follow-up (22/12): Internacionalização (I18N)
*   **Fundação I18N:** Instaladas bibliotecas `i18next` e `react-i18next`. Criada configuração base em `src/lib/i18n.ts` e arquivos de tradução `src/locales/pt.json` e `en.json`.
*   **Trigger de Idioma:** Adicionado botão de troca de idioma (🇧🇷/🇺🇸) no Header. Textos do Header ("Configurações", "Sair") agora são dinâmicos e traduzíveis.

---



---
**Status:** ✅ Concluído e Testado.
