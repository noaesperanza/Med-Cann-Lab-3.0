# 🗄️ AUDITORIA SUPABASE — MedCannLab 3.0
## Data: 23/02/2026 | Acesso via CLI token | Projeto: itdjkfubfzmvmuxxjoae

---

# 📋 RESUMO EXECUTIVO DO BANCO

| Métrica | Valor | Status |
|---|:---:|:---:|
| **Tamanho total do DB** | 41 MB | ✅ Pequeno |
| **Total de tabelas** | ~115 tabelas | ⚠️ Muitas para o estágio atual |
| **Tamanho dos índices** | 6.912 KB | ✅ Adequado |
| **Cache Hit Rate (Index)** | **1.00** (100%) | ✅ Excelente |
| **Cache Hit Rate (Table)** | **1.00** (100%) | ✅ Excelente |
| **WAL Size** | 112 MB | ⚠️ ~2.7x o tamanho do DB |
| **Stats Reset** | 125 dias atrás | ⚠️ Considere resetar |
| **Edge Functions** | 7 ativas | ✅ |
| **Long-running queries** | 1 (replication slot) | ✅ Normal (Realtime) |
| **Região** | East US (N. Virginia) | ⚠️ Usuários no Brasil |

---

# 1️⃣ INVENTÁRIO DE TABELAS (~115 tabelas)

## 🏥 Tabelas Clínicas (Core do negócio)
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `users` | **448 KB** | ~1.000+ | ✅ |
| `user_profiles` | **312 KB** | ~500+ | ✅ |
| `appointments` | **160 KB** | ~300+ | ✅ |
| `clinical_reports` | 8 KB | ~50 | ✅ |
| `clinical_assessments` | 0 bytes | 0 | ✅ |
| `ai_assessment_scores` | 0 bytes | 0 | ✅ |
| `imre_assessments` | 0 bytes | 0 | ❓ |
| `patient_medical_records` | ~16 KB | ~50+ | ✅ |
| `patient_prescriptions` | 8 KB | ~25 | ✅ |
| `patient_therapeutic_plans` | 32 KB | 0 | ❓ |
| `patient_conditions` | 24 KB | 0 | ❓ |
| `patient_lab_results` | 24 KB | ~18 | ✅ |
| `patient_exam_requests` | 48 KB | ~12 | ✅ |
| `patient_insights` | 32 KB | 0 | ❓ |
| `prescriptions` | 32 KB | ~57 | ✅ |
| `renal_exams` | 16 KB | 0 | ❓ |
| `avaliacoes_renais` | 16 KB | ~14 | ✅ |
| `pacientes` | 24 KB | 0 | ✅ |
| `medical_certificates` | 32 KB | ~4 | ❓ |

## 💬 Chat & Comunicação
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `private_chats` | 40 KB | ~3.579 | ⚠️ |
| `private_messages` | 32 KB | ~3.629 | ⚠️ |
| `chat_rooms` | **168 KB** | ~1.000+ | ✅ |
| `global_chat_messages` | 64 KB | ~500+ | ✅ |
| `chat_participants` | 0 bytes | 0 | ❓ |
| `chat_messages` | 0 bytes | 0 | ❓ |
| `chat_sessions` | 16 KB | 0 | ❓ |
| `channels` | 32 KB | ~200 | ✅ |
| `messages` | 16 KB | 0 | ❓ |

## 🤖 IA & Nôa
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `ai_chat_interactions` | ~16 KB | ~50+ | ✅ |
| `ai_chat_history` | 40 KB | ~15 | ❓ |
| `ai_saved_documents` | 40 KB | ~135 | ✅ |
| `documents` | **240 KB** | ~1.000+ | ✅ |
| `noa_articles` | 32 KB | ~2 | ✅ |
| `noa_clinical_cases` | 24 KB | 0 | ❓ |
| `noa_memories` | 8 KB | ~3 | ✅ |
| `noa_interaction_logs` | 24 KB | 0 | ❓ |
| `noa_pending_actions` | ~8 KB | ~5 | ✅ |
| `interacoes_ia` | 32 KB | 0 | ✅ |
| `semantic_analysis` | 32 KB | ~204 | ✅ |

## 🧠 Cognitivo & Governança
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `cognitive_events` | ~16 KB | ~20+ | ✅ |
| `cognitive_decisions` | 16 KB | 0 | ❓ |
| `cognitive_metabolism` | 24 KB | 0 | ❓ |
| `cognitive_policies` | 16 KB | 0 | ❓ |
| `clinical_integration` | 24 KB | 0 | ❓ |

## 📚 Educação & Cursos
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `courses` | **136 KB** | ~500+ | ✅ |
| `course_modules` | 24 KB | 0 | ❓ |
| `course_ratings` | 32 KB | 0 | ✅ |
| `lesson_content` | **136 KB** | ~500+ | ✅ |
| `lessons` | 48 KB | ~16 | ✅ |
| `modules` | 32 KB | ~14 | ✅ |
| `user_courses` | 24 KB | 0 | ❓ |

## 📅 Agendamento
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `professional_availability` | 32 KB | ~11 | ✅ |
| `time_blocks` | 16 KB | 0 | ❓ |
| `scheduling_audit_log` | 32 KB | ~1 | ✅ |
| `video_call_requests` | 0 bytes | 0 | ✅ |
| `video_call_quality_logs` | ~8 KB | 0 | ✅ |
| `video_clinical_snippets` | 48 KB | ~7 | ✅ |
| `ai_scheduling_predictions` | 16 KB | ~11 | ❓ |
| `smart_slot_rules` | 16 KB | ~1 | ❓ |

## 🏗️ Sistema & Config
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `feature_flags` | 32 KB | ~204 | ✅ |
| `platform_params` | 32 KB | 0 | ✅ |
| `role_catalog` | 32 KB | ~76 | ✅ |
| `system_config` | 16 KB | ~1 | ❓ |
| `analytics` | 24 KB | 0 | ❓ |
| `kpi_daily_snapshots` | 32 KB | ~47 | ✅ |
| `medcannlab_audit_logs` | 24 KB | 0 | ✅ |

## 💰 Financeiro & Gamificação
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `transactions` | **120 KB** | ~600+ | ✅ |
| `user_subscriptions` | ~8 KB | ~2 | ✅ |
| `benefit_usage_log` | 16 KB | ~2 | ❓ |
| `user_benefits_status` | 8 KB | 0 | ❓ |
| `referral_bonus_cycles` | 16 KB | 0 | ✅ |
| `gamification_points` | 32 KB | 0 | ❓ |
| `user_achievements` | 40 KB | ~15 | ❓ |
| `ranking_history` | 24 KB | ~3 | ❓ |
| `user_statistics` | 24 KB | 0 | ❓ |

## 🔧 DevVivo (Debug/Audit)
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `dev_vivo_sessions` | 32 KB | 0 | ❓ |
| `dev_vivo_audit` | 32 KB | 0 | ❓ |
| `dev_vivo_diagnostics` | 24 KB | ~1 | ❓ |
| `dev_vivo_changes` | ~16 KB | ~5 | ❓ |

## 📊 IMRE & AEC (Protocolo)
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `dados_imre_coletados` | 24 KB | 0 | ✅ |
| `imre_semantic_context` | 24 KB | 0 | ✅ |
| `imre_semantic_blocks` | 24 KB | ~1 | ✅ |
| `abertura_exponencial` | 16 KB | 0 | ✅ |
| `contexto_longitudinal` | 16 KB | 0 | ✅ |
| `desenvolvimento_indiciario` | 16 KB | 0 | ✅ |
| `fechamento_consensual` | 16 KB | 0 | ✅ |

## 🔗 Social & Fórum
| Tabela | Tamanho | Linhas est. | RLS |
|---|:---:|:---:|:---:|
| `forum_posts` | **144 KB** | ~500+ | ✅ |
| `forum_comments` | 32 KB | 0 | ✅ |
| `forum_likes` | 32 KB | ~1 | ✅ |
| `forum_views` | 32 KB | 0 | ⚠️ |
| `debates` | 16 KB | 0 | ✅ |
| `friendships` | 24 KB | 0 | ✅ |
| `moderator_requests` | 16 KB | 0 | ✅ |
| `user_mutes` | 16 KB | ~4 | ✅ |

---

# 2️⃣ ANÁLISE DE RLS (Row Level Security)

## Visão Geral:
- **Tabelas com RLS habilitado**: ~35 (via migration `20260220175906`)
- **Tabelas SEM RLS verificado**: ~80 (muitas tabelas mais antigas)
- **Função auxiliar**: `public.has_role(auth.uid(), 'role')` — ✅ Boa prática

## ✅ RLS bem implementado (Sprint 1.2):
A migration `20260220175906` cobre **20 tabelas** em 4 grupos:
1. **Clínicas (9)**: abertura_exponencial, avaliacoes_renais, contexto_longitudinal, dados_imre_coletados, desenvolvimento_indiciario, fechamento_consensual, interacoes_ia, pacientes, permissoes_compartilhamento
2. **Sistema/Config (4)**: feature_flags, platform_params, role_catalog, kpi_daily_snapshots
3. **Auditoria/Moderação (3)**: medcannlab_audit_logs, moderator_requests, user_mutes
4. **Financeiro/Social (4)**: referral_bonus_cycles, debates, friendships, usuarios

## 🚨 PROBLEMAS CRÍTICOS DE RLS:

### 1. Padrão "Authenticated read = USING (true)" — ABERTO DEMAIS:
```sql
-- TODAS as tabelas clínicas usam:
CREATE POLICY "Authenticated read ..." ON public.tabela_clinica
  FOR SELECT TO authenticated USING (true);
```
**Significa: qualquer usuário autenticado (paciente, aluno, profissional) pode LER TODOS os registros clínicos de TODOS os pacientes.**

🔴 **Isso é uma VIOLAÇÃO de LGPD.** Pacientes não devem ver dados de outros pacientes. Um paciente pode querying diretamente a API e ver:
- Avaliações renais de todos os pacientes
- Dados IMRE coletados de todos
- Contexto longitudinal de todos
- Desenvolvimento indiciário de todos

### 2. Tabelas SEM RLS (estimativa ~80 tabelas):
Tabelas críticas que provavelmente NÃO têm RLS:
- `patient_therapeutic_plans` — planos terapêuticos sem proteção
- `patient_conditions` — condições dos pacientes sem proteção
- `patient_insights` — insights de pacientes
- `cognitive_decisions` — decisões cognitivas
- `cognitive_metabolism` — metabolismo cognitivo
- `ai_chat_history` — histórico de chat da IA
- `noa_clinical_cases` — casos clínicos da Nôa
- `gamification_points` — pontos (manipulação possível)
- `user_achievements` — conquistas
- `time_blocks` — blocos de agenda
- `chat_sessions` — sessões de chat

### 3. Tabelas de chat com dados sensíveis:
- `private_chats` (3.579 registros) — ⚠️ Sem RLS visível na sprint
- `private_messages` (3.629 registros) — ⚠️ Sem RLS visível na sprint
- Chat entre paciente-profissional potencialmente acessível por terceiros

### 4. Sem policy de DELETE em tabelas clínicas:
Nenhuma tabela clínica tem policy de DELETE. Se precisar excluir dados (LGPD Art. 18), como fazer?

---

# 3️⃣ EDGE FUNCTIONS (7 ativas)

| Nome | Status | Versão | Última atualização |
|---|:---:|:---:|---|
| `tradevision-core` | ✅ Active | v84 | 2026-02-20 |
| `get_chat_history` | ✅ Active | v4 | 2026-01-21 |
| `digital-signature` | ✅ Active | v9 | 2026-02-20 |
| `video-call-request-notification-` | ✅ Active | v21 | 2026-02-07 |
| `video-call-reminders` | ✅ Active | v9 | 2026-02-20 |
| `video-call-request-notification` | ✅ Active | v6 | 2026-02-20 |
| `extract-document-text` | ✅ Active | v2 | 2026-02-20 |

### ⚠️ Problemas:
1. **`video-call-request-notification-` (com traço no final)** e **`video-call-request-notification`** — parecem duplicadas
2. **`tradevision-core`** — Nome estranho para um app médico. O que faz?
3. **Sem edge function para OpenAI** — API key está no frontend. Deveria ter função proxy.
4. **Sem edge function para Stripe** — SDK server-side no frontend

---

# 4️⃣ PERFORMANCE DO BANCO

## ✅ Cache Hit Rate = 100%:
```
Index Hit Rate: 1.00
Table Hit Rate: 1.00
```
Excelente — tudo está em cache. Banco pequeno, cabe inteiro na memória.

## ⚠️ WAL Size = 112 MB (2.7x o DB):
- DB = 41 MB, WAL = 112 MB
- Pode indicar muitas transações ou replication lag
- **Long-running query**: replication slot do Realtime (normal)

## 🚨 Índices com problemas:

### Índices duplicados (clinical_assessments):
```
idx_clinical_assessments_doctor     — 0 bytes
idx_clinical_assessments_doctor_id  — 0 bytes  ← DUPLICADO
idx_clinical_doctor_id              — 0 bytes  ← TRIPLO!

idx_clinical_assessments_patient    — 0 bytes
idx_clinical_assessments_patient_id — 0 bytes  ← DUPLICADO
idx_clinical_patient_id             — 0 bytes  ← TRIPLO!

idx_clinical_assessments_status     — 0 bytes
idx_clinical_status                 — 0 bytes  ← DUPLICADO

idx_clinical_assessments_created    — 0 bytes
idx_clinical_assessments_created_at — 0 bytes  ← DUPLICADO
```
**8 índices duplicados** em uma tabela vazia. Sinal de migrations acumulativas sem cleanup.

### Índices duplicados (ai_chat_interactions):
```
idx_ai_chat_created                  ← DUPLICADO
idx_ai_chat_created_at               ← DUPLICADO
idx_ai_chat_interactions_created_at  ← TRIPLO!

idx_ai_chat_user      ← DUPLICADO
idx_ai_chat_user_id   ← DUPLICADO
idx_ai_chat_interactions_user_id ← TRIPLO!

idx_ai_chat_user_date           ← DUPLICADO com acima
idx_ai_chat_interactions_session_id
idx_ai_chat_interactions_patient_id
idx_ai_chat_intent
```
**~8 índices duplicados** em outra tabela.

### Índices nunca usados (0% usage):
~50+ índices com 0% de uso. Muitos são em tabelas vazias, mas indica excesso de indexação.

## ⚠️ Bloat moderado:
- `users` table: 3.1 bloat ratio em 448 KB
- `user_profiles`: 2.4 em 312 KB
- Vários índices com 2.0-2.2 bloat
- Para um DB de 41 MB, não é urgente, mas indica falta de VACUUM regular

---

# 5️⃣ SCHEMA DE MIGRATIONS

## Estrutura:
- `supabase/migrations/` — **25 arquivos** de migration
- `database/scripts/` — **~80+ scripts SQL** soltos (não migrations)

### ⚠️ Problemas:

### 1. Scripts SQL FORA do sistema de migrations:
**~80+ scripts em `database/scripts/`** que NÃO são migrations:
```
SUPABASE_COMPLETO_FINAL.sql
SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql
SUPABASE_CORRECAO_ERROS_400_404.sql
SUPABASE_MVP_FINAL.sql
SUPABASE_TABELAS_ADICIONAIS.sql
SUPABASE_TABELAS_ADICIONAIS_CORRIGIDO.sql
SUPABASE_TABELAS_ADICIONAIS_LIMPO.sql
CRIAR_TABELAS_AUSENTES.sql
CRIAR_TABELAS_CORRIGIDO.sql
CRIAR_TABELAS_FALTANTES.sql
CRIAR_TABELAS_FALTANTES_SIMPLES.sql
CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql
CORRIGIR_ERROS_SUPABASE.sql
CORRIGIR_ERROS_SUPABASE_SIMPLES.sql
CORRIGIR_RLS_CHAT.sql
CORRIGIR_RLS_PATIENT_HEALTH_HISTORY.sql
CORRIGIR_RLS_USERS_TABLE.sql
FIX_CHAT_RLS_RECURSION_CHAT_PARTICIPANTS_2026-02-06.sql
FIX_COMPLETO_RLS_CHAT_E_MEDICAL_RECORDS_2026-02-06.sql
FIX_DOCUMENTS_RLS.sql
FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql
FIX_PROFILE_LOADING.sql
FIX_RECURSIVE_RLS.sql
EMERGENCY_FIX_ACDSS_RLS_V2.sql
...
```

> **Padrão: scripts executados manualmente no SQL Editor do Supabase, sem controle de versão, sem idempotência.**

### 2. Naming inconsistente nas migrations:
- Algumas com nome descritivo: `20260219150000_fix_rls_delete.sql`
- Outras com UUID: `20260219004651_cb174291-a170-4fc8-8a55-b748b4a9ef1d.sql`
- Remote commits vazios

### 3. Sem rollback strategy:
- Nenhuma migration tem `DOWN` ou `ROLLBACK`
- Se uma migration falha, não há caminho de volta

---

# 6️⃣ TABELAS VAZIAS (Red Flag)

Tabelas criadas mas NUNCA populadas:
```
clinical_assessments       — 0 bytes, 0 registros
ai_assessment_scores       — 0 bytes, 0 registros
chat_participants          — 0 bytes, 0 registros
chat_messages              — 0 bytes, 0 registros
imre_assessments           — 0 bytes, 0 registros
notifications              — 0 bytes, 0 registros
video_call_requests        — 0 bytes, 0 registros
cognitive_metabolism       — 0 linhas
cognitive_decisions        — 0 linhas
cognitive_policies         — 0 linhas
time_blocks                — 0 linhas
patient_conditions         — 0 linhas
course_modules             — 0 linhas
user_courses               — 0 linhas
gamification_points        — 0 linhas
user_achievements          — 0 linhas
wearable_devices           — 0 linhas
wearable_data              — 0 linhas
patient_therapeutic_plans  — 0 linhas
forum_comments             — 0 linhas
analytics                  — 0 linhas
dev_vivo_sessions          — 0 linhas
dev_vivo_audit             — 0 linhas
news                       — 0 linhas
chat_sessions              — 0 linhas
messages                   — 0 linhas
renal_exams                — 0 linhas
user_statistics            — 0 linhas
```

> **~30 tabelas vazias = funcionalidades planejadas mas nunca implementadas no frontend, ou frontend que usa tabelas diferentes para a mesma coisa.**

---

# 7️⃣ DUPLICAÇÃO DE DADOS

### Tabelas de chat duplicadas:
| Grupo 1 (Usado) | Grupo 2 (Legado?) | Grupo 3 (Vazio) |
|---|---|---|
| `chat_rooms` (168 KB) | `private_chats` (40 KB) | `chat_sessions` (0) |
| `global_chat_messages` (64 KB) | `private_messages` (32 KB) | `chat_messages` (0) |
| `channels` (32 KB) | — | `messages` (0) |

> **3 sistemas de chat diferentes coexistem no banco.**

### Tabelas de usuário duplicadas:
- `users` (448 KB) — tabela principal
- `user_profiles` (312 KB) — perfis
- `profiles` (48 KB) — **11.153 registros?** (Número suspeitamente alto)
- `usuarios` (32 KB) — tabela legada

> **4 tabelas de "usuários" para ~1.000 usuários reais.**

### Tabelas de paciente duplicadas:
- `pacientes` (24 KB) — tabela em português
- `patient_conditions`, `patient_insights`, `patient_lab_results`, etc. — em inglês
- Mistura de naming conventions PT/EN

---

# 8️⃣ REGIÃO & LATÊNCIA

| Métrica | Valor |
|---|---|
| **Região do Supabase** | `East US (North Virginia)` |
| **Região dos usuários** | Brasil |
| **Latência estimada** | ~120-180ms por request |

⚠️ **O banco está em Virginia mas os usuários são brasileiros.** Outros 3 projetos estão em `South America (São Paulo)` — este deveria estar também.

---

# 9️⃣ FUNCTION RPC `has_role`

A função `has_role(auth.uid(), 'role')` é usada em TODAS as policies:
```sql
public.has_role(auth.uid(), 'admin')
public.has_role(auth.uid(), 'profissional')
```

✅ **Boa prática** — centraliza verificação de permissão
⚠️ **Se essa função falhar ou tiver bug, TODA a segurança colapsa**
⚠️ **Não pode ser auditada sem o source code da função (precisa de `db dump`/Docker)**

---

# 🔟 BACKUP

### Schema `backup` detectado:
Uma tabela de backup foi detectada:
```
backup.backup_20251110_233423273__public_notifications  — 48 KB
backup.backup_20251110_233423273__public_private_chats   — 40 KB
```
✅ Existe backup manual, mas não é automatizado.

---

# 📊 NOTAS DA AUDITORIA SUPABASE

| Área | Nota (0-10) |
|---|:---:|
| **Schema Design** | 3.5 |
| **RLS / Segurança** | 3.0 |
| **Index Management** | 4.0 |
| **Migration Strategy** | 2.5 |
| **Performance** | 7.0 |
| **Naming Consistency** | 3.0 |
| **Edge Functions** | 5.0 |
| **Data Hygiene** | 3.0 |
| **NOTA GERAL SUPABASE** | **3.9 / 10** |

---

# 🚨 PLANO DE AÇÃO SUPABASE (por prioridade)

## 🔴 P0 — URGENTE (LGPD / Segurança):
1. **Corrigir RLS "USING (true)"** em tabelas clínicas — pacientes NÃO devem ler dados de outros pacientes
2. **Habilitar RLS** nas ~80 tabelas que não tem
3. **Mover região** para South America (São Paulo) — latência alta para BR
4. **Remover service role key** do `.env.example`
5. **Criar edge function proxy** para OpenAI — tirar API key do frontend

## 🟠 P1 — CRÍTICO (Arquitetura):
6. **Unificar tabelas de chat** — 3 sistemas coexistindo
7. **Unificar tabelas de usuário** — 4 tabelas para ~1.000 users
8. **Remover ~16 índices duplicados** em clinical_assessments e ai_chat_interactions
9. **Migrar scripts soltos** para migrations oficiais
10. **Auditar função `has_role`** — é single point of failure

## 🟡 P2 — QUALIDADE:
11. **Limpar ~30 tabelas vazias** — decidir: implementar ou remover
12. **Padronizar naming** — PT ou EN, não misturar
13. **Adicionar policies de DELETE** para LGPD compliance
14. **Criar edge function "tradevision" audit** — entender o que faz
15. **Remover edge function duplicada** video-call-request-notification
16. **Resolver WAL size** (112 MB) — VACUUM ou checkpoint

---

# 📏 NOTA FINAL COMBINADA (Frontend + Supabase)

| Domínio | Nota | Peso |
|---|:---:|:---:|
| Frontend (13 blocos) | 3.65 | 60% |
| Supabase (banco) | 3.9 | 40% |
| **NOTA FINAL GERAL** | **3.75 / 10** | **100%** |

> **VEREDICTO FINAL: O sistema tem funcionalidades ricas e está operacional, mas NÃO está pronto para produção com dados sensíveis (LGPD). A segurança do banco é o ponto mais crítico — dados clínicos acessíveis por qualquer usuário autenticado.**

---

*Relatório gerado em 23/02/2026 — Auditoria Supabase via CLI token.*
