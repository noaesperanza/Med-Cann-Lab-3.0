# 📊 Análise completa: Plano vs o que existe no app e no repositório

**Data:** 09/02/2026  
**Referência:** `docs/PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md` (1–759) + `docs/PLANO_8_DIAS_MEDCANLAB.md`  
**Escopo:** Tabelas, views, RPCs, Edge Functions, fluxo clínico, scripts SQL.  
**Nota:** Supabase CLI não estava no PATH; análise feita por código-fonte, migrations e `database/scripts`. Para confirmar no banco, rode os scripts de verificação no SQL Editor ou use `supabase db dump` / `supabase inspect` quando o CLI estiver disponível.

---

## 1. Resumo executivo

| Categoria              | No plano | No repo/código | Verificar no banco? |
|------------------------|----------|----------------|----------------------|
| Tabelas críticas (RLS) | 9        | Todas usadas no código | Sim (RLS ativo, políticas) |
| Views                  | —        | 5 usadas       | Sim (existem?)       |
| RPCs                   | —        | 12 usadas      | Sim (existem?)       |
| Edge Functions         | 3        | 4 no repo      | Deploy feito?        |
| Scripts do plano       | 4        | 4 existem      | Executados?          |

---

## 2. Tabelas: plano vs uso no app

### 2.1 Tabelas que o plano exige (RLS com bypass admin)

| Tabela                   | Plano (sec. 3.3 / 1.2) | Uso no código (src + Edge Functions) | Script criação no repo |
|---------------------------|-------------------------|----------------------------------------|-------------------------|
| `users`                   | ✅ OK                   | ✅ Múltiplos (adminPermissions, PatientsManagement, etc.) | Implícito (auth + public.users) |
| `chat_participants`        | ✅ OK                   | ✅ PatientDoctorChat, AdminChat, PatientsManagement, useChatSystem | Vários RLS/chat |
| `clinical_assessments`     | ✅ OK                   | ✅ PatientsManagement, ProfessionalMyDashboard, PatientDoctorChat, etc. | CLINICAL_REPORTS_TABLES, etc. |
| `clinical_reports`         | ✅ OK                   | ✅ adminPermissions, PatientsManagement, ProfessionalMyDashboard, etc. | CLINICAL_REPORTS_TABLES |
| `appointments`             | ✅ OK                   | ✅ PatientsManagement, Scheduling, ProfessionalScheduling, etc. | Diversos |
| `patient_medical_records`  | ✅ OK                   | ✅ adminPermissions, PatientsManagement, noaResidentAI | FIX_PATIENT_MEDICAL_RECORDS_RLS_403, CRIAR_TABELAS_PRONTUARIO_RLS |
| `notifications`            | ✅ OK                   | ✅ notificationService, VideoCallScheduler, Edge Functions | — |
| `video_call_sessions`      | ✅ OK                   | ✅ VideoCall.tsx | — |
| `prescriptions`            | ⚠️ Verificar            | App usa `cfm_prescriptions` e `v_patient_prescriptions` | CRIAR_TABELA_PRESCRICOES_CFM |
| `video_call_requests`      | (implícito fluxo)       | ✅ videoCallRequestService, AdminChat | — |

**Conclusão:** Todas as tabelas críticas do plano são referenciadas no código. Prescrição no app está em `cfm_prescriptions` + views; o plano fala em `prescriptions` — pode ser nome diferente ou view. **No banco:** confirmar que todas existem e que RLS + bypass admin estão aplicados (scripts de verificação abaixo).

### 2.2 Outras tabelas/recursos usados no app (fora do plano explícito)

Conferidas no código (grep em `src`): `users_compatible`, `chat_rooms`, `chat_messages`, `patient_prescriptions`, `video_call_schedules`, `medical_certificates`, `user_profiles`, `documents`, `video_clinical_snippets`, `clinical_kpis`, `wearable_devices`, `epilepsy_events`, `conversation_ratings`, `patient_therapeutic_plans`, `educational_resources`, `user_interactions`, `critical_documents`, `ai_notifications`, `subscription_plans`, `transactions`, `user_subscriptions`, `courses`, `news_items`, `course_enrollments`, `course_modules`, `user_statistics`, `forum_posts`, `forum_comments`, `forum_likes`, `noa_lessons`, `lesson_content`. Storage: `avatar`. Essas também precisam existir no banco (ou ter fallback no código) para as telas que as usam não quebrarem.

---

## 3. Views usadas no app (precisam existir no banco)

| View                     | Onde é usada |
|--------------------------|--------------|
| `v_patient_prescriptions` | PatientsManagement, ProfessionalMyDashboard, PatientDashboard, ClinicalTerminal, PatientFocusView, ClinicalGovernanceDemo |
| `v_patient_appointments`   | PatientsManagement, PatientFocusView, ClinicalTerminal, PatientDashboard |
| `v_kpi_basic`              | RicardoValencaDashboard |
| `v_doctor_dashboard_kpis`  | RicardoValencaDashboard |
| `v_next_appointments`      | RicardoValencaDashboard |

**Ação:** No SQL Editor ou com Supabase CLI, confirmar existência:  
`SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name IN ('v_patient_prescriptions','v_patient_appointments','v_kpi_basic','v_doctor_dashboard_kpis','v_next_appointments');`

---

## 4. RPCs usadas no app (precisam existir no banco)

| RPC                          | Onde é usada |
|-----------------------------|--------------|
| `get_chat_participants_for_room` | AdminChat |
| `create_video_call_notification` | videoCallRequestService (fallback notificação) |
| `increment_document_usage`       | noaKnowledgeBase |
| `create_chat_room_for_patient`   | PatientChat, InvitePatient, PatientsManagement |
| `admin_get_users_status`        | ClinicalGovernanceAdmin |
| `get_available_slots_v3`        | lib/scheduling.ts |
| `book_appointment_atomic`        | lib/scheduling.ts |
| `get_my_rooms`                  | useChatSystem |
| `mark_room_read`                | useChatSystem (migration 20251221 existe) |
| `share_report_with_doctors`     | ShareReportModal, PatientAnalytics |
| `create_patient_user`           | PatientImportModal |
| `get_shared_reports_for_doctor`  | ClinicalReports |

**Ação:** Confirmar no banco:  
`SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';`  
e cruzar com a lista acima.

---

## 5. Edge Functions: plano vs repositório

| Função                         | Plano (Fase 2.1) | No repo (supabase/functions) | Observação |
|--------------------------------|------------------|-------------------------------|------------|
| `video-call-request-notification` | Deploy           | ✅ Existe                     | config.toml: verify_jwt = false |
| `video-call-reminders`            | Deploy           | ✅ Existe                     | — |
| `tradevision-core`                | Deploy           | ✅ Existe                     | Usa muitas tabelas (documents, noa_pending_actions, etc.) |
| `digital-signature`               | (Prescrição ICP) | ✅ Existe                     | cfm_prescriptions, document_snapshots, pki_transactions |

**Conclusão:** As 3 do plano existem no repo; há uma 4ª (digital-signature) alinhada à prescrição. **Verificar no dashboard Supabase** se as 3 (ou 4) estão deployadas e sem erro de CORS.

---

## 6. Scripts SQL do plano: existência e uso

| Script (plano sec. 8) | Citação no plano | Existe no repo? | Observação |
|----------------------|------------------|------------------|------------|
| `CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql` | ⚠️ EXECUTAR AGORA | ✅ `database/scripts/` | Cria lessons, modules, etc. Execução pendente de confirmação. |
| `ADICIONAR_BYPASS_ADMIN_RLS.sql` | ⚠️ CRIAR E EXECUTAR | ✅ `ADICIONAR_BYPASS_ADMIN_RLS_06-02-2026.sql` | Nome ligeiramente diferente; arquivo existe. |
| `VERIFICAR_RLS_ADMIN_06-02-2026.sql` | ✅ CRIADO | ✅ `database/scripts/` | Para rodar e conferir RLS. |
| `VINCULAR_EDUARDO_COMO_PROFISSIONAL_06-02-2026.sql` | ⚠️ EXECUTAR | ✅ `database/scripts/` | Vinculação Dr. Eduardo. |

**Ordem sugerida (00_ORDEM_EXECUCAO.txt):** FIX_COMPLETO_DR_RICARDO_E_ERROS ou passo a passo com FIX_PATIENT_MEDICAL_RECORDS_RLS_403, etc. Para diagnóstico RLS prontuário: `VER_TUDO_RLS_PATIENT_MEDICAL_RECORDS.sql` e `LIMPAR_POLITICAS_DUPLICADAS_E_GARANTIR_ADMIN.sql`.

---

## 7. Fluxo clínico (plano sec. 1.3 e 7): o que o código implementa

| Etapa do fluxo              | No plano | No código (páginas/hooks) |
|-----------------------------|----------|----------------------------|
| Paciente solicita agendamento | [ ]     | Scheduling, PatientAppointments (formulários e chamadas a appointments) |
| Profissional cria agendamento  | [ ]     | ProfessionalScheduling, RicardoValencaDashboard (appointments) |
| Chat profissional–paciente     | [ ]     | PatientDoctorChat, useChatSystem, chat_rooms + chat_participants + chat_messages |
| Videochamada                   | [x] parcial | VideoCall, useWebRTCRoom, videoCallRequestService; solicitar/aceitar/recusar/WebRTC |
| Avaliação clínica              | [ ]     | clinical_assessments (ProfessionalMyDashboard, PatientsManagement, etc.) |
| Relatório clínico              | [ ]     | clinical_reports, clinicalReportService, ClinicalReports |
| Prescrição                     | [ ]     | Prescriptions (cfm_prescriptions), IntegrativePrescriptions, digital-signature Edge Function |
| Prontuário                     | [x] em parte | PatientsManagement (evoluções: clinical_reports + clinical_assessments + patient_medical_records), loadEvolutions |

**Conclusão:** Fluxo está implementado no código em todas as etapas; videochamada e prontuário/evoluções já foram polidos (09/02). O que falta é validar em produção e marcar checklists (e, se faltar algo no banco, rodar scripts).

---

## 8. Migrations no repo (Supabase)

| Migration | Conteúdo provável |
|-----------|--------------------|
| `20251216014748_remote_commit.sql` | Commit remoto |
| `20251221_fix_mark_room_read.sql` | RPC mark_room_read |
| `20260204021000_create_cognitive_interaction_state.sql` | Tabela cognitive_interaction_state |
| `20260204021500_fix_user_interactions_rls.sql` | RLS user_interactions |
| `20260204030000_create_noa_pending_actions.sql` | Tabela noa_pending_actions |

Migrations cobrem apenas parte do esquema; muitas tabelas vêm de scripts em `database/scripts/`. Para “ter tudo” alinhado ao plano, executar no Supabase os scripts indicados no plano e na `00_ORDEM_EXECUCAO.txt`.

---

## 9. Checklist rápido: o que confirmar no banco (antes de começar)

- [ ] **Tabelas:** `users`, `chat_participants`, `chat_rooms`, `chat_messages`, `clinical_assessments`, `clinical_reports`, `appointments`, `patient_medical_records`, `notifications`, `video_call_requests`, `video_call_sessions`, `cfm_prescriptions` (e `prescriptions` se existir).
- [ ] **Views:** `v_patient_prescriptions`, `v_patient_appointments`, `v_kpi_basic`, `v_doctor_dashboard_kpis`, `v_next_appointments`.
- [ ] **RPCs:** `create_chat_room_for_patient`, `mark_room_read`, `get_my_rooms`, `create_video_call_notification`, `get_available_slots_v3`, `book_appointment_atomic`, `get_chat_participants_for_room`, demais listadas na sec. 4.
- [ ] **RLS:** Em todas as tabelas críticas (sec. 2.1), políticas com bypass admin (por tipo ou `is_admin_user()`). Para `patient_medical_records`: rodar `VER_TUDO_RLS_PATIENT_MEDICAL_RECORDS.sql` e, se necessário, `LIMPAR_POLITICAS_DUPLICADAS_E_GARANTIR_ADMIN.sql`.
- [ ] **Admin:** Um usuário com `flag_admin = true` ou `type = 'admin'` em `public.users` (ex.: phpg69@gmail.com) para testes.
- [ ] **Edge Functions:** Deploy e status OK de `video-call-request-notification`, `video-call-reminders`, `tradevision-core` (e `digital-signature` se usar prescrição assinada).

---

## 10. Conclusão

- **No repositório e no código:** Tabelas, views e RPCs do plano estão referenciadas; scripts do plano existem; Edge Functions do plano + digital-signature estão no repo; fluxo clínico está implementado (videochamada e prontuário/evoluções já ajustados em 09/02).
- **O que só o banco confirma:** Existência real de tabelas/views/RPCs, RLS ativo com bypass admin, políticas sem duplicidade (ex.: patient_medical_records), e deploy das Edge Functions. Recomenda-se rodar os scripts de verificação no SQL Editor (e, quando possível, `supabase inspect` / `supabase db dump`) para fechar “o que tem e o que não tem” antes de começar a próxima fase do plano.

**Documento gerado em:** 09/02/2026  
**Referência:** PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md (1–759).
