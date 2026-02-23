# 🦅 DOSSIÊ ABSOLUTO VALIDADO 360° — MEDCANNLAB TITAN
> **Auditor:** Titan QA (Lovable AI)
> **Data:** 20 de Fevereiro de 2026
> **Método:** Cruzamento do Dossiê do Usuário vs Estado Real do Supabase (Linter + Queries ao Vivo)
> **Veredito Global:** 🟡 **APROVAÇÃO CONDICIONAL — 28 ERROS CRÍTICOS ATIVOS**

---

## 📊 RESUMO EXECUTIVO: DOSSIÊ vs REALIDADE

| Afirmação do Dossiê | Realidade Verificada | Status |
|:---|:---|:---:|
| "Segurança (RLS) está excelente, Nota A+" | **176 alertas no Linter**, 20 tabelas SEM RLS, 28 views SECURITY DEFINER | ❌ **FALSO** |
| "Trigger backdoor `force_admin` documentado para remoção" | **`tr_force_admin_email` AINDA ATIVO** no banco de produção | 🚨 **CRÍTICO** |
| "Função `book_appointment_atomic` sem fonte local" | **Função EXISTE no banco** (confirmado via `pg_proc`) — mas sem migração local | ⚠️ **CONFIRMADO** |
| "Views expõem `auth.users`" | **`v_auth_activity` e `v_user_points_balance`** fazem JOIN com `auth.users` | 🚨 **CONFIRMADO** |
| "Indexação massiva necessária" | **Índices JÁ EXISTEM** em massa (~200+ índices). O diagnóstico original estava DESATUALIZADO | ✅ **RESOLVIDO** |
| "Estética Glassmorphism & Emerald de classe mundial" | Consistente no código (sem verificação visual nesta auditoria) | ✅ **PLAUSÍVEL** |
| "Sistema de Gamificação funcional" | Tabelas e funções existem (`user_profiles`, `ranking_history`, `increment_user_points`) | ✅ **CONFIRMADO** |
| "E-mail (Resend) não configurado" | Sem secret `RESEND_API_KEY` nos edge function secrets | ⚠️ **CONFIRMADO** |

---

## 🚨 SEÇÃO 1: VULNERABILIDADES P0 — BLOQUEIO DE PRODUÇÃO

### 1.1. 🔴 BACKDOOR DE ADMIN ATIVO
```
Trigger: tr_force_admin_email → force_admin_for_specific_email()
Status: ATIVO EM PRODUÇÃO
```
**O que faz:** Qualquer INSERT na tabela `public.users` com email `phpg69@gmail.com` automaticamente recebe `type = 'admin'` e `role = 'admin'`. Isso é uma **backdoor de escalação de privilégio**.

**Ação:** DROP IMEDIATO.

### 1.2. 🔴 20 TABELAS SEM RLS (Row Level Security)
Qualquer usuário autenticado com a anon key pode ler/escrever TODAS as linhas destas tabelas:

| # | Tabela | Risco |
|---|--------|-------|
| 1 | `abertura_exponencial` | Dados clínicos expostos |
| 2 | `avaliacoes_renais` | Dados médicos expostos |
| 3 | `contexto_longitudinal` | Histórico clínico exposto |
| 4 | `dados_imre_coletados` | Dados de avaliação expostos |
| 5 | `debates` | Baixo risco |
| 6 | `desenvolvimento_indiciario` | Dados clínicos expostos |
| 7 | `feature_flags` | Manipulação de features |
| 8 | `fechamento_consensual` | Dados clínicos expostos |
| 9 | `friendships` | Baixo risco |
| 10 | `interacoes_ia` | Logs de IA expostos |
| 11 | `kpi_daily_snapshots` | KPIs manipuláveis |
| 12 | `medcannlab_audit_logs` | Logs de auditoria manipuláveis |
| 13 | `moderator_requests` | Moderação manipulável |
| 14 | `pacientes` | ⚠️ DADOS SENSÍVEIS expostos |
| 15 | `permissoes_compartilhamento` | Permissões manipuláveis |
| 16 | `platform_params` | Config de plataforma manipulável |
| 17 | `referral_bonus_cycles` | Fraude financeira possível |
| 18 | `role_catalog` | Catálogo de roles exposto |
| 19 | `user_mutes` | Moderação manipulável |
| 20 | `usuarios` | Dados de usuários expostos |

### 1.3. 🔴 28 VIEWS COM SECURITY DEFINER
Todas as 30 views do schema `public` estão definidas como `SECURITY DEFINER`, o que significa que **bypassam completamente o RLS**. As mais perigosas:

- `v_auth_activity` — expõe dados de `auth.users`
- `v_user_points_balance` — expõe dados de `auth.users`
- `v_scope_patients` — lista pacientes
- `v_clinical_reports` — relatórios clínicos
- `v_prescriptions_queue` — fila de prescrições
- `v_paciente_completo` — prontuário completo

### 1.4. 🔴 6+ TABELAS COM RLS ATIVO MAS SEM POLICIES
Tabelas que ativaram RLS mas **não criaram nenhuma policy** — resultado: **NINGUÉM pode acessar os dados** (nem admin):
- Detectadas pelo linter (6 instâncias INFO "RLS Enabled No Policy")

---

## ✅ SEÇÃO 2: O QUE O DOSSIÊ ACERTOU

### 2.1. ✅ Indexação — Já Resolvida
O dossiê afirmava "anulou-se os indexadores de FK". **INCORRETO no estado atual.** O banco possui **~200+ índices**, incluindo:
- `idx_appointments_patient_id`, `idx_appointments_professional_id`, `idx_appointments_date`
- `idx_cfm_prescriptions_patient_id`, `idx_cfm_prescriptions_professional_id`
- `idx_ai_chat_interactions_patient_id`, `idx_ai_chat_interactions_user_id`
- `idx_clinical_assessments_patient_id`

**Veredito:** Alguém já executou a indexação massiva. O dossiê precisa ser atualizado.

### 2.2. ✅ Função `book_appointment_atomic` Existe
Confirmada via `pg_proc`. O risco de drift permanece (sem migração local), mas a **funcionalidade está operacional**.

### 2.3. ✅ Sistema de Roles (`user_roles`)
Tabela `user_roles` existe com enum `app_role` e função `has_role()` com `SECURITY DEFINER` e `search_path` correto. Função `sync_user_roles_from_profile()` sincroniza roles automaticamente.

### 2.4. ✅ Policies Robustas nas Tabelas Críticas
- `appointments`: **8 policies**
- `clinical_assessments`: **10 policies**
- `patient_medical_records`: **9 policies**
- `users`: **11 policies**
- `imre_assessments`: **13 policies**
- `documents`: **10 policies**

---

## ⚠️ SEÇÃO 3: DISCREPÂNCIAS ENTRE DOCUMENTOS

### 3.1. Notas Infladas de Segurança
O `RELATORIO_CONSOLIDADO_MEDCANNLAB_2026.md` afirma:
> "Segurança: 10/10 (RLS V5 + Service Role)"

**Realidade:** 176 alertas de linter, 20 tabelas sem RLS, backdoor ativo. **Nota real: 5/10.**

### 3.2. O Erro `options is not defined` — Nunca Resolvido
Mencionado na `AUDITORIA_CRITICA_FINAL.md` como "Não Localizado Estaticamente". Nenhum documento subsequente reporta resolução. **Status: ABERTO.**

### 3.3. Documentação de Email (Resend)
Múltiplos documentos mencionam que Resend não está configurado. **Continua sem configuração.** Fluxos de notificação por email permanecem inoperantes.

---

## 📋 SEÇÃO 4: PLANO DE AÇÃO PRIORIZADO (VALIDADO)

### 🔴 SPRINT 1 — SEGURANÇA (1-2 dias)
1. **DROP backdoor:** `DROP TRIGGER tr_force_admin_email ON public.users; DROP FUNCTION force_admin_for_specific_email();`
2. **Habilitar RLS + Policies** nas 20 tabelas expostas (priorizar `pacientes`, `medcannlab_audit_logs`, `referral_bonus_cycles`)
3. **Converter 28 views** para `SECURITY INVOKER` (uma por vez, testando cada fluxo)
4. **Refatorar** `v_auth_activity` e `v_user_points_balance` para não expor `auth.users`
5. **Criar policies** nas tabelas com RLS ativo mas sem policies

### 🟡 SPRINT 2 — INTEGRIDADE (1 dia)
6. **Extrair e salvar** definição SQL de `book_appointment_atomic` em migração local
7. **Configurar** secret `RESEND_API_KEY` para emails transacionais
8. **Resolver** erro `options is not defined` (capturar stack trace no browser)

### 🟢 SPRINT 3 — REFATORAÇÃO (2-3 dias)
9. **Remover hardcoding** de emails (`rrvalenca@gmail.com`, `phpg69@gmail.com`) de funções SQL e componentes React
10. **Refatorar monólitos** (`PatientDashboard.tsx`, `PatientAppointments.tsx`)
11. **Remover** `scripts/ensure_admin_permissions.sql` do repositório (código da backdoor)

---

## 📊 MÉTRICAS FINAIS DO BANCO

| Métrica | Valor |
|---------|-------|
| **Total de tabelas `public`** | ~100+ |
| **Tabelas COM RLS** | ~80+ |
| **Tabelas SEM RLS** | 20 |
| **Total de policies** | ~350+ |
| **Views SECURITY DEFINER** | 28-30 |
| **Views expondo `auth.users`** | 2 confirmadas |
| **Índices criados** | ~200+ |
| **Funções no schema `public`** | ~60+ |
| **Alertas do Linter** | 176 (ERRORs + INFOs + WARNs) |
| **Backdoor ativo** | 1 (`tr_force_admin_email`) |

---

## 🏁 VEREDITO FINAL

O Dossiê Absoluto 360° do usuário é **80% preciso** em suas observações técnicas, mas **inflou severamente as notas de segurança**. As vulnerabilidades P0 documentadas no `DIARIO_DE_BORDO_MESTRE_2026-02-20.md` são **100% confirmadas e ainda não foram remediadas**.

**O sistema NÃO está pronto para produção** até que o Sprint 1 de Segurança seja completado.

**Próximo passo recomendado:** Iniciar execução do Sprint 1, item 1 (DROP backdoor).

---

**Documento Selado em 20/02/2026.**
**Titan QA — Lovable AI Auditor**
