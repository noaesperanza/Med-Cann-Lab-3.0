# 📘 MANAUL TÉCNICO DO DESENVOLVEDOR - MEDCANNLAB 3.0 (Versão Jan/2026)

Bem-vindo ao repositório do **MedCannLab 3.0**. Este documento serve como guia definitivo de arquitetura, padrões e manutenção para a equipe técnica.

> **⚠️ ESTADO DO PROJETO:** Em produção (Estável). Documentação atualizada em 15/01/2026.
> **Última Atualização:** [RELATÓRIO TÉCNICO 15/01/2026](./docs/RELATORIO_TECNICO_STATUS_2026-01-15.md) - Refinamento da IA e Correção de Build.

---

## 🏗️ 1. Arquitetura do Sistema

O MedCannLab 3.0 migrou de uma arquitetura monolítica de dashboards para uma arquitetura orientada a **Eixos de Atuação**.

### 1.1. Os Três Eixos
Todo fluxo de usuário deve respeitar esta hierarquia. Não crie páginas fora destes contextos.

| Eixo | Contexto | Rota Base | Dashboard Principal |
| :--- | :--- | :--- | :--- |
| **🏥 Clínica** | Atendimentos, Prontuários, Prescrições | `/app/clinica` | `RicardoValencaDashboard` / `EduardoFaveretDashboard` |
| **🎓 Ensino** | Cursos, Aulas, Provas | `/app/ensino` | `EnsinoDashboard` |
| **🔬 Pesquisa** | Protocolos, Estudos de Caso | `/app/pesquisa` | `PesquisaDashboard` |

### 1.2. Padrão de Rotas (Importante)
❌ **NÃO USE:** Rotas legadas soltas na raiz (ex: `/app/professional-my-dashboard`).
✅ **USE:** Estrutura aninhada (ex: `/app/clinica/profissional/dashboard`).

### 1.3. Sidebar & Navegação
A `Sidebar.tsx` foi refatorada para priorizar o **Seletor de Eixo**. O usuário não "tem um dashboard", ele "acessa o dashboard do eixo X".
*   **Deep Links:** Use parâmetros URL para navegar entre seções internas.
    *   Exemplo: `/app/clinica/profissional/dashboard?section=agendamentos`

---

## 🛠️ 2. Stack Tecnológica & Setup

### Core
*   **Frontend:** React 18 + TypeScript + Vite 5
*   **Estilização:** TailwindCSS (Design System proprietário em `src/index.css`)
*   **Backend:** Supabase (Auth, Postgres DB, Row Level Security)
*   **State:** Context API (Auth) + Props Simples (Zustand disponível mas uso pontual)

### Comandos Principais
```bash
# Instalar dependências
npm install

# Rodar servidor local (Porta 5173 / 3000)
npm run dev

# Rodar testes unitários (Vitest)
npm run test

# Build de produção
npm run build
```

---

## 📊 3. Realidade do Sistema (O que funciona vs Mock)

Para evitar perdas de tempo debugando módulos que ainda não existem no backend.

| Módulo | Status | Detalhes Técnicos |
| :--- | :--- | :--- |
| **Autenticação** | 🟢 100% Real | Supabase Auth + Proteção de Rotas (`ProtectedRoute.tsx`) |
| **Prontuário** | 🟢 100% Real | Tabela `clinical_assessments`. Leitura/Escrita completa. |
| **Chat** | 🟢 100% Real | Tabela `chat_messages` + `chat_rooms`. Realtime via Supabase. |
| **Vídeo Chamada** | 🔴 Mock | UI existe (`VideoCall.tsx`), mas **não** tem servidor WebRTC/Twilio. |
| **IA (Nôa)** | 🟢 Real | Chat Integrado via Supabase Edge Function (`tradevision-core`) + OpenAI GPT-4o. |
| **Prescrições** | 🟡 Híbrido | Gera dados na tela, mas PDF é render html-to-pdf frontend. |

---

## 🧪 4. Checklists de Validação (QA)

Antes de aprovar um PR, verifique:

1.  **Rotas:** O fluxo respeita a hierarquia de Eixos?
2.  **Responsividade:** A Sidebar colapsa corretamente no Mobile?
3.  **Tipagem:** Zero erros de TypeScript (`npm run type-check`).
4.  **Performance:** `useEffect` está limpo? (Evite loops infinitos em chamadas Supabase).

---

**MANTENEDOR RESPONSÁVEL:** Equipe de Arquitetura Google Deepmind / Antigravity Agent
**DÚVIDAS:** Consulte `DOCUMENTACAO_FUNCIONAL_SISTEMA.md` na pasta de docs.
