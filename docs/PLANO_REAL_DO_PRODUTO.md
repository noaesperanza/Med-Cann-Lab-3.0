# 🗺️ Plano real do produto — mapa e smoke-test clínico

**Data:** 09/02/2026  
**Objetivo:** Mapa definitivo (tabela → view → RPC → tela → Edge) e checklist de smoke-test clínico (admin → paciente → médico → prescrição → assinatura).

> **Checklist “feito vs pendente” (evitar repetir):** `docs/CHECKLIST_PLANO_FEITO_VS_PENDENTE.md`

---

## Mapa em uma linha (fluxo smoke-test)

| Etapa | Tabela(s) | View(s) | RPC(s) | Tela | Edge |
|-------|-----------|---------|--------|------|------|
| Admin / lista pacientes | `users` | `users_compatible` | — | AdminDashboard, PatientsManagement | — |
| Paciente: agenda + chat | `appointments`, `chat_rooms`, `chat_participants`, `chat_messages` | `v_patient_appointments` | `create_chat_room_for_patient_uuid` | PatientDashboard, PatientAppointments, PatientDoctorChat | — |
| Médico: prontuário | `clinical_assessments`, `clinical_reports`, `patient_medical_records` | `v_patient_prescriptions`, `v_patient_appointments` | — | PatientsManagement, RicardoValencaDashboard | — |
| Prescrição | `cfm_prescriptions` | — | — | Prescriptions | **digital-signature** |
| Assinatura | `medical_certificates`, `document_snapshots`, `pki_transactions`, `signature_confirmations` | — | — | Prescriptions, CertificateManagement | **digital-signature** |
| Videochamada (opcional) | `video_call_requests`, `notifications` | — | `create_video_call_notification` | PatientDoctorChat, AdminChat | video-call-request-notification |

---

## Parte 1 — Mapa definitivo

### 1.1 Por recurso de dados (tabela / view)

| Recurso | Tipo | Usado em telas/serviços | RPCs que usam | Edge que usa |
|--------|------|-------------------------|---------------|--------------|
| `users` | tabela | PatientsManagement, PatientDoctorChat, AdminChat, Scheduling, Prescriptions, Profile, NewPatientForm, ClinicalGovernanceAdmin, etc. | — | video-call-request-notification (busca recipient) |
| `users_compatible` | tabela/view | PatientsManagement, RicardoValencaDashboard, ProfessionalMyDashboard, Prescriptions, PatientDashboard, ClinicalTerminal, PatientFocusView | — | — |
| `chat_rooms` | tabela | PatientDoctorChat, AdminChat, PatientDashboard, PatientChat | — | — |
| `chat_participants` | tabela | PatientDoctorChat, AdminChat, PatientsManagement, PatientDashboard, PatientChat | `get_chat_participants_for_room` | — |
| `chat_messages` | tabela | PatientChat, PatientDashboard, DebateRoom, ChatGlobal | — | — |
| `clinical_assessments` | tabela | PatientsManagement, ProfessionalMyDashboard, PatientDoctorChat, EduardoFaveretDashboard, NewPatientForm, PatientAppointments, ClinicalAssessment, ClinicalGovernanceDemo, LessonPreparation | — | tradevision-core |
| `clinical_reports` | tabela | PatientsManagement, ProfessionalMyDashboard, adminPermissions, PatientDashboard, rationalityAnalysisService | `get_shared_reports_for_doctor` | tradevision-core |
| `appointments` | tabela | PatientsManagement, Scheduling, ProfessionalScheduling, PatientDashboard, PatientAppointments, RicardoValencaDashboard, EnsinoDashboard, CidadeAmigaDosRins | `get_available_slots_v3`, `book_appointment_atomic` | tradevision-core |
| `patient_medical_records` | tabela | PatientsManagement, adminPermissions, noaResidentAI | — | — |
| `notifications` | tabela | notificationService, VideoCallScheduler, AdminChat (indireto) | — | video-call-request-notification, video-call-reminders (insert) |
| `video_call_requests` | tabela | videoCallRequestService, AdminChat | `create_video_call_notification` | video-call-request-notification (lê/notifica) |
| `video_call_sessions` | tabela | VideoCall.tsx | — | — |
| `video_call_schedules` | tabela | VideoCallScheduler | — | video-call-reminders |
| `cfm_prescriptions` | tabela | Prescriptions | — | digital-signature |
| `v_patient_prescriptions` | view | PatientsManagement, ProfessionalMyDashboard, PatientDashboard, ClinicalTerminal, PatientFocusView, ClinicalGovernanceDemo | — | — |
| `v_patient_appointments` | view | PatientsManagement, PatientFocusView, ClinicalTerminal, PatientDashboard | — | — |
| `v_kpi_basic` | view | RicardoValencaDashboard | — | — |
| `v_doctor_dashboard_kpis` | view | RicardoValencaDashboard | — | — |
| `v_next_appointments` | view | RicardoValencaDashboard | — | — |
| `medical_certificates` | tabela | CertificateManagement | — | digital-signature |
| `document_snapshots` / `pki_transactions` / `signature_confirmations` | tabelas | (uso via Edge) | — | digital-signature |

### 1.2 Por tela (principal → tabelas/views/RPCs/Edge)

| Tela (rota principal) | Tabelas / views | RPCs | Edge |
|-----------------------|------------------|------|------|
| **PatientsManagement** (`/app/patients`, clinica/profissional/pacientes) | users, users_compatible, clinical_assessments, clinical_reports, patient_medical_records, chat_participants, chat_rooms, appointments, v_patient_prescriptions, v_patient_appointments | create_chat_room_for_patient_uuid | — |
| **PatientDoctorChat** (clinica/paciente/chat-profissional) | chat_participants, users, chat_rooms, clinical_assessments | — | — (video usa video_call_requests + RPC create_video_call_notification) |
| **RicardoValencaDashboard** (ricardo-valenca-dashboard) | patient_prescriptions, v_kpi_basic, v_doctor_dashboard_kpis, clinical_assessments, v_next_appointments, appointments, users_compatible | — | — |
| **Prescriptions** (clinica/prescricoes, prescriptions) | cfm_prescriptions, users_compatible, users | — | **digital-signature** (invoke) |
| **CertificateManagement** (clinica/profissional/certificados) | medical_certificates | — | digital-signature (indireto) |
| **AdminChat** (admin-chat) | users, chat_participants, chat_rooms, video_call_requests | get_chat_participants_for_room | — |
| **Scheduling** (scheduling) | users, appointments | get_available_slots_v3, book_appointment_atomic | — |
| **PatientDashboard** (clinica/paciente/dashboard) | appointments, v_patient_appointments, clinical_reports, clinical_assessments, patient_therapeutic_plans, v_patient_prescriptions, educational_resources, chat_participants, chat_rooms, chat_messages, users_compatible, conversation_ratings | — | — |
| **PatientChat** (patient-chat) | users, chat_participants, chat_messages | **create_chat_room_for_patient_uuid** | — |
| **ClinicalGovernanceAdmin** (admin/clinical-governance) | users | **admin_get_users_status** | — |
| **ClinicalReports** (componente / relatórios) | — | **get_shared_reports_for_doctor** | — |
| **InvitePatient** (/invite) | users | **create_chat_room_for_patient_uuid** | — |
| **Profile** (profile) | user_profiles, storage(avatar) | — | — |

### 1.3 Por RPC (quem chama e em que fluxo)

| RPC | Chamado por | Fluxo |
|-----|-------------|--------|
| `get_chat_participants_for_room` | AdminChat | Admin chat: listar participantes da sala |
| `create_video_call_notification` | videoCallRequestService | Videochamada: notificar recipient (fallback quando Edge falha) |
| `create_chat_room_for_patient_uuid` | PatientChat, InvitePatient, PatientsManagement, PatientDoctorChat, PatientDashboard | Chat: criar sala paciente–profissional (padrão; nome do paciente vindo de public.users) |
| `admin_get_users_status` | ClinicalGovernanceAdmin | Admin: status de usuários |
| `get_available_slots_v3` | lib/scheduling.ts (Scheduling) | Agenda: horários disponíveis |
| `book_appointment_atomic` | lib/scheduling.ts (Scheduling) | Agenda: agendar consulta |
| `get_my_rooms` | useChatSystem | Chat: minhas salas |
| `mark_room_read` | useChatSystem | Chat: marcar sala como lida |
| `share_report_with_doctors` | ShareReportModal, PatientAnalytics | Relatório: compartilhar com médicos |
| `create_patient_user` | PatientImportModal | Cadastro: criar usuário paciente |
| `get_shared_reports_for_doctor` | ClinicalReports | Relatório: listar compartilhados |
| `increment_document_usage` | noaKnowledgeBase | Documentos: uso |

### 1.4 Por Edge Function (quem invoca e o que usa no banco)

| Edge Function | Invocada por | Tabelas/recursos que usa |
|---------------|--------------|---------------------------|
| **video-call-request-notification** | (backend/trigger ou front opcional) — front usa RPC `create_video_call_notification` como fallback | users (busca recipient), notifications (insert) |
| **video-call-reminders** | Cron / Supabase (não pelo front) | video_call_schedules, notifications (insert) |
| **tradevision-core** | Chamadas do app/NOA (se configurado) | documents, noa_pending_actions, clinical_reports, appointments, cognitive_* | 
| **digital-signature** | Prescriptions.tsx (`supabase.functions.invoke('digital-signature', ...)`) | medical_certificates, document_snapshots, pki_transactions, cfm_prescriptions, signature_confirmations |

---

## Parte 2 — Smoke-test clínico

Fluxo mínimo para validar: **login admin → experiência como paciente → experiência como médico → prescrição → assinatura**.

### 2.1 Pré-requisitos

- [ ] Um usuário **admin** em `public.users` com `flag_admin = true` ou `type = 'admin'` (ex.: phpg69@gmail.com).
- [ ] Pelo menos um **paciente** e um **profissional** (ou admin “Visualizar Como” profissional/paciente).
- [ ] RLS e políticas aplicadas (scripts `FIX_PATIENT_MEDICAL_RECORDS_RLS_403`, `LIMPAR_POLITICAS_DUPLICADAS_E_GARANTIR_ADMIN` se necessário).

### 2.2 Smoke-test — passo a passo

#### Bloco A — Login e admin

| # | Ação | Rota / tela | O que verificar |
|---|------|-------------|------------------|
| A1 | Login como **admin** | `/` → login → redirect | Redirect para dashboard (ex.: `/app/admin` ou SmartDashboardRedirect). |
| A2 | Acessar **Admin** | `/app/admin` | Dashboard carrega sem 403; menu visível. |
| A3 | **Visualizar Como** profissional | Header: seletor “Visualizar Como” → Profissional | URL muda para contexto profissional (ex.: ricardo-valenca-dashboard ou clinica/profissional/dashboard). |
| A4 | Lista de pacientes (como profissional) | `/app/ricardo-valenca-dashboard` ou `/app/clinica/profissional/pacientes` | Lista de pacientes com **nomes** (não só “Paciente” + código); sem erro de “Invalid time value”. |
| A5 | **Visualizar Como** paciente | Header: “Visualizar Como” → Paciente | URL muda para contexto paciente (ex.: clinica/paciente/dashboard). |

#### Bloco B — Fluxo paciente

| # | Ação | Rota / tela | O que verificar |
|---|------|-------------|------------------|
| B1 | Dashboard paciente | `/app/clinica/paciente/dashboard` | Carrega; se houver dados, exibe agenda, prescrições, relatórios (views/tabelas sem 403). |
| B2 | Agendamentos | `/app/clinica/paciente/agendamentos` ou PatientAppointments | Lista ou formulário de agendamentos; uso de `appointments` e `clinical_assessments` sem erro. |
| B3 | Chat com profissional | `/app/clinica/paciente/chat-profissional` (PatientDoctorChat) | Lista de conversas ou sala; chat_rooms, chat_participants, chat_messages sem 403. |
| B4 | (Opcional) Solicitar videochamada | Na tela de chat: botão videochamada | video_call_requests insert; notificação (RPC ou Edge) sem CORS bloqueando. |

#### Bloco C — Fluxo médico/profissional

| # | Ação | Rota / tela | O que verificar |
|---|------|-------------|------------------|
| C1 | Dashboard profissional | `/app/ricardo-valenca-dashboard` ou `/app/clinica/profissional/dashboard` | KPIs (v_kpi_basic, v_doctor_dashboard_kpis, v_next_appointments) carregam; sem 403. |
| C2 | Prontuário / evoluções | PatientsManagement: selecionar paciente → aba Evolução / Overview | Evoluções carregam (clinical_assessments, clinical_reports, patient_medical_records); sem React error #31; sem 403 em patient_medical_records. |
| C3 | Agendamentos profissional | `/app/professional-scheduling` ou ProfessionalScheduling | Lista/criação de appointments; RPCs get_available_slots_v3 / book_appointment_atomic se usados. |

#### Bloco D — Prescrição

| # | Ação | Rota / tela | O que verificar |
|---|------|-------------|------------------|
| D1 | Tela de prescrições | `/app/clinica/prescricoes` ou `/app/prescriptions` (Prescriptions) | Lista ou formulário com `cfm_prescriptions`; tela carrega sem 403. |
| D2 | Criar/editar prescrição | Na mesma tela: novo ou editar | Insert/update em `cfm_prescriptions` (conforme UI); sem 403. |

#### Bloco E — Assinatura digital

| # | Ação | Rota / tela | O que verificar |
|---|------|-------------|------------------|
| E1 | Disparar assinatura | Prescriptions: ação que chama assinatura (ex.: “Assinar”) | `supabase.functions.invoke('digital-signature', ...)` é chamado. |
| E2 | Resposta da Edge | Console / UI | Sem erro de CORS ou 401; resposta esperada da Edge (ex.: sucesso/erro tratado). |
| E3 | (Opcional) Certificados | `/app/clinica/profissional/certificados` (CertificateManagement) | Lista/gestão de medical_certificates; integração com digital-signature se aplicável. |

### 2.3 Checklist resumido (smoke-test)

- [ ] **A** — Login admin; acessar /app/admin; “Visualizar Como” profissional e paciente; lista de pacientes com nomes.
- [ ] **B** — Como paciente: dashboard, agendamentos, chat (e opcionalmente videochamada).
- [ ] **C** — Como médico: dashboard profissional; prontuário/evoluções sem 403 e sem React #31.
- [ ] **D** — Prescrição: tela carrega; criar/editar prescrição (cfm_prescriptions).
- [ ] **E** — Assinatura: invoke da Edge `digital-signature` sem CORS/401; certificados (se aplicável).

### 2.4 Mapas rápidos para o smoke-test

- **Admin → lista pacientes:** `users` (getAllPatients) → PatientsManagement / RicardoValencaDashboard.
- **Paciente → agenda/chat:** `appointments`, `v_patient_appointments`, `chat_rooms`, `chat_participants`, `chat_messages`; RPC `create_chat_room_for_patient_uuid` se criar sala.
- **Médico → prontuário:** `clinical_assessments`, `clinical_reports`, `patient_medical_records` → PatientsManagement (loadEvolutions).
- **Prescrição:** `cfm_prescriptions` → Prescriptions.
- **Assinatura:** Edge `digital-signature` ← Prescriptions; Edge usa `medical_certificates`, `document_snapshots`, `pki_transactions`, `cfm_prescriptions`, `signature_confirmations`.

---

**Documento gerado em:** 09/02/2026  
**Referência:** ANALISE_FULL_PLANO_VS_APP_09-02-2026.md, PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md.
