# 📜 DIÁRIO DE BORDO MESTRE - 20 DE FEVEREIRO DE 2026
> **A Saga da Evolução: De "App Funcional" para "Sistema Clínico Auditável"**
> **Versão:** Gold Master (Titan Edition - Fase de Escalabilidade)
> **Prioridade Máxima:** 🔐 Segurança → 🔧 Integridade de Código → 🏗️ Arquitetura → 💎 Polimento

---

## 🚦 O PLANO DE REFINAMENTO (GOLD MASTER)

Para elevar a aplicação ao patamar de **Produção Clínica Real**, estabelecemos um plano de ação estrito, operando sob o princípio de Zero Trust e focando em risco real.

### 🚨 FASE 0 — SEGURANÇA IMEDIATA (P0)
*Status: Inadiável. O sistema não pode ignorar esses furos estruturais.*

1. **Remover Backdoor (Trigger Admin)**
   - **Arquivo:** `supabase/migrations/20260220100000_drop_admin_backdoor.sql`
   - **Ação Extra:** Rodar queries de validação de duplicidade:
     ```sql
     SELECT tgname FROM pg_trigger WHERE tgname ILIKE '%force_admin%';
     SELECT proname FROM pg_proc WHERE proname ILIKE '%force_admin%';
     ```
   - **Pós-ação:** Validar se não há usuários com roles de admin herdadas indevidamente.

2. **Converter Views para SECURITY INVOKER**
   - **Arquivo:** `supabase/migrations/20260220101000_fix_security_definer_views.sql`
   - **Estratégia:** Não usar substituições em massa ("replace cego"). Conveter view a view, testar o fluxo atrelado, ajustar a *policy*, e seguir para a próxima. O RLS é ativado silenciosamente e uma quebra aqui pode derrubar funções vitais do banco.

3. **Habilitar RLS nas 20 Tabelas**
   - **Arquivo:** `supabase/migrations/20260220102000_enable_missing_rls.sql`
   - **Regra:** Nunca ativar RLS (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`) sem uma *Policy* acompanhante aprovada, caso contrário a visibilidade da aplicação irá quebrar inteiramente.

4. **Corrigir Exposição de `auth.users` (Mandatório)**
   - Views contendo `JOIN auth.users u ON ...` devem ser refatoradas.
   - **Regra:** Criar view intermediária segura exportando APENAS `id` e `email`. Metadata completa nunca deve ir para o lado público em âmbito clínico.

### 🔧 FASE 1 — REMOÇÃO DE HARDCODING (P1)
1. **Refatorar `PatientAppointments.tsx`**
   - Substituir variáveis como `REAL_PROF_IDS` por queries baseadas em roles no banco:
     ```typescript
     const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'professional');
     ```
   - **Recomendação:** Desacoplar criando o hook abstrato `useProfessionals()`.

2. **Remover E-mails Hardcoded em Lógica**
   - Substituição de checagens baseadas em string por autorização unificada por `UUID` ou `user_roles`. A identidade deve pautar autorização, não a leitura sintática de strings (e-mail é apenas para login/comunicação).

### 🏗️ FASE 2 — REFATORAÇÃO ESTRUTURAL (P2)
Onde a escalabilidade ganha vida e o código é enxugado para manutenção colaborativa.

- **Fim dos Monólitos de UI**
  - **Meta:** `PatientDashboard.tsx` < 600 linhas.
  - **Meta:** `PatientAppointments.tsx` < 700 linhas.
- **Desacoplamento:**
  - Extrair hooks customizados (`usePatientData()`, `useAppointments()`, `useBooking()`).
  - Separar pura **Business Logic** de **Data Fetching** do Frontend React.

### 💎 FASE 3 — UX & POLIMENTO (P3)
1. **LGPD — Deleção de Conta Segura**
   - Sistemas clínicos não devem usar "Hard Delete" para apagamento de dados, pois destrói o arquivo médico. Empregar **Soft Delete** com anonimização irreversível: marcar como inativo preservando IDs internos rastreáveis.
2. **Sistema de Feedback Global**
   - Implementar interceptor para requests ao Supabase mapeado em um _handler unificado_ de "Toasts" para erros, evitando poluição de chamadas `toast()` injetadas repetitivamente pelas views.

---

## 📌 ORDEM MESTRA DE EXECUÇÃO RECOMENDADA
1. **Backup Completo** do banco de dados de produção.
2. **Dropar backdoor** de administração.
3. **Corrigir views e vazamento do lado `auth.users`**.
4. **Converter views** gradualmente para Security Invokers.
5. **Habilitar RLS** com base no catálogo estrito e políticas válidas.
6. **Rodar Linter do Supabase** alvejando zero alertas de erros/insegurança.
7. Avançar apenas após essas etapas para hardcoding de frontend na UI.

---

## 🔬 DIAGNÓSTICO PROFUNDO: ARQUITETURA E PERFORMANCE (THE DEEP AUDIT DIVE)

Adicional à Fase Global, fomos ao núcleo de performance, evidenciando:

### ⚡ 1. Acoplamento Crítico de Dados no React
Foram listadas **34 instâncias da chamada direta** `supabase.from(...)` no escopo restrito de `src/components` e `src/pages`. Com essa decisão, UI tornou-se acoplada ao esquema relacional (Data Layer), gerando fragilidade de caching, duplicação e falha na componentização de testes unitários limpos.
- **Solução:** Padrão "Services → Hooks → Components" usando orquestradores como o React Query.

### ⚡ 2. Risco de "Full Table Scans" de Banco de Dados
Na revisão de todas as mais recentes migrações SQL (23 arquivos), **anulou-se os indexadores de chaves em ForeignKey** (exceto um modesto arquivo). Para um banco de saúde que transaciona prontuários e horários de disponibilidade: sem diretivas elementares de `CREATE INDEX ON schema.table (foreign_key)`.
- **Risco Iminente:** Seq Scans massivos do Postgres derretendo a máquina de produção quando os usuários subirem. Índices obrigatórios devem amarrar `user_id`, `patient_id` e colunas-filtro.

### ⚡ 3. Vazamento Financeiro e Estado do Client na Inteligência (NOA)
Em `src/hooks/useNOAChat.ts`, foi encontrado um design onde `loadChatHistory` mapeava a leitura de *todas* as requisições, afundando a memória do React local. Paralelo à isso, havia `import.meta.env` mal mapeado gerando strings hardcoded e vazo de IDs de serviço.
Embora o Core do TradeVision previna envios mastodônticos ao LLM via limitação restritiva ("Windowing" natural das 10 requisições recentes), o frontend sem cursor de paginação está a meros dias do bloqueio de UX em clientes interativos e heavy-users da IA.

---

## 🏢 VEREDITO C-LEVEL

O Hub abandonou o invólucro de "MVP rápido" para se provar numa transição turbulenta até o status de **Plataforma Escalável**. Recomenda-se veementemente a prática restritiva de **Code Freeze de UI** por 1 a 2 Sprints. A energia do time agora focará religiosamente em:
1. Indexação massiva em Postgres.
2. Controle Estrito de Custos da Context Window GPT.
3. Desinchar monólitos vitais acima das 2 mil linhas e purgar lixo (como `ts-ignores`).

**Assim nos despedimos da Startup Insegura para abraçar o Sistema Clínico Enterprise.**
