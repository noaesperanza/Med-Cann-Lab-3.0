# ✅ Check-list Go/No-Go — Release Candidate MedCannLab

**Data:** 09/02/2026  
**Objetivo:** Critérios para dar **launch** só quando estes itens passarem. Marcar `[x]` quando validado **em ambiente de produção (ou staging)**.

**Regra:** 0 tela branca, 0 loop, 0 RangeError, 0 403 surpresa nos 3 perfis (admin / profissional / paciente).

---

## 1. Autenticação e rotas (3 perfis)

| # | Critério | Admin | Profissional | Paciente |
|---|----------|:-----:|:------------:|:--------:|
| 1.1 | Login e redirect para dashboard | [ ] | [ ] | [ ] |
| 1.2 | Navega todas as rotas protegidas do seu perfil (sem 403) | [ ] | [ ] | [ ] |
| 1.3 | Profissional vê **somente seus pacientes** | — | [ ] | — |
| 1.4 | Paciente vê **somente seu próprio conteúdo** | — | — | [ ] |
| 1.5 | "Visualizar Como" (admin) funciona para profissional e paciente | [ ] | — | — |

**Go:** Todos [x]. **No-Go:** Qualquer tela branca, loop, RangeError ou 403 inesperado.

---

## 2. Fluxo clínico — Happy path (8 passos)

Validar que **cada etapa gera registro no banco e aparece na UI** (sem refresh manual).

| # | Etapa | Onde validar | Registro/UI |
|---|-------|--------------|-------------|
| 2.1 | Paciente solicita agendamento | PatientAppointments / Scheduling | `appointments` + confirmação na tela |
| 2.2 | Profissional confirma/cria agendamento | ProfessionalScheduling | `appointments` + lista atualizada |
| 2.3 | Sala de chat criada ou reutilizada | PatientDoctorChat / PatientsManagement | `chat_rooms` + `chat_participants`; RPC `create_chat_room_for_patient_uuid` |
| 2.4 | Mensagem enviada e recebida (persistente) | Chat (qualquer) | `chat_messages` + mensagem visível |
| 2.5 | Videochamada: request → accept → ambos entram | PatientDoctorChat / AdminChat | `video_call_requests` + WebRTC ativo |
| 2.6 | Avaliação salva e aparece no prontuário | ClinicalAssessment → PatientsManagement | `clinical_assessments` + aba Evolução |
| 2.7 | Relatório salvo e aparece | Relatórios → Prontuário | `clinical_reports` + visível |
| 2.8 | Prescrição salva e aparece | Prescriptions | `cfm_prescriptions` + lista/visualização |

**Go:** As 8 etapas validadas (pode ser em sessões diferentes). **No-Go:** Qualquer etapa que não persista ou não apareça na UI.

---

## 3. Três falhas bem tratadas

| # | Cenário | Comportamento esperado | [ ] |
|---|---------|------------------------|:---:|
| 3.1 | Chat duplicado (2 cliques / 2 abas) | Uma única sala; idempotência da RPC | [ ] |
| 3.2 | Videochamada recusada ou expirada | UI não fica presa; estado "rejected"/"expired" visível | [ ] |
| 3.3 | RLS nega acesso (ex.: 403) | Mensagem adequada na UI + admin consegue acessar (bypass) | [ ] |

**Go:** Os 3 cenários testados e com comportamento correto.

---

## 4. Chat e videochamada

| # | Critério | [ ] |
|---|----------|:---:|
| 4.1 | Front chama **só** `create_chat_room_for_patient_uuid(patient_id, professional_id)` | [ ] |
| 4.2 | Idempotência: múltiplos cliques = 1 sala | [ ] |
| 4.3 | Video: accept / reject / expired funcionando; nenhum usuário preso > 60 s | [ ] |
| 4.4 | Realtime em `video_call_requests` ativo (ou fallback polling estável) | [ ] |

---

## 5. Prescrição e assinatura

| # | Critério | [ ] |
|---|----------|:---:|
| 5.1 | Prescrição criada e salva em `cfm_prescriptions`; visível para paciente e profissional | [ ] |
| 5.2 | Quem emitiu rastreável (auditoria mínima) | [ ] |
| 5.3 | Assinatura digital (Edge): invoke sem CORS/401 ou tratado em UI (ICP pode ser Fase 2) | [ ] |

---

## 6. RLS e banco

| # | Critério | [ ] |
|---|----------|:---:|
| 6.1 | RLS audit passou (script `RLS_AUDIT_SANITY_QUERIES_2026-02-09.sql`): admin vê tudo, prof/paciente só o devido | [ ] |
| 6.2 | Migrações/scripts aplicados (ex.: GOVERNANCA_CHAT_ROOM_UUID, FIX_PATIENT_MEDICAL_RECORDS, LIMPAR_POLITICAS) | [ ] |
| 6.3 | Views e RPCs existem (v_patient_prescriptions, v_patient_appointments, create_chat_room_for_patient_uuid, etc.) | [ ] |
| 6.4 | Prontuários (patient_medical_records) só para profissionais vinculados; **nunca** na Base de Conhecimento (só documentos da biblioteca) | [ ] |

---

## 7. Notificações e UX

| # | Critério | [ ] |
|---|----------|:---:|
| 7.1 | Sino de notificações no Header; unread count (se implementado) | [ ] |
| 7.2 | Marcar como lida (se implementado) | [ ] |

---

## 8. Release e operação

| # | Critério | [ ] |
|---|----------|:---:|
| 8.1 | Backup/restore testado (ex.: snapshot Supabase) | [ ] |
| 8.2 | Plano de rollback definido (tag do deploy anterior) | [ ] |
| 8.3 | Observabilidade mínima (ex.: erros de front capturados; 1–2 métricas) ou planejada para pós-launch | [ ] |

---

## Veredito final

- **Go:** Todas as seções obrigatórias (1–6) com [x]; 7 e 8 conforme política do time.
- **No-Go:** Qualquer item bloqueador (auth, RLS, fluxo clínico, chat, video) falhando.

**Data do preenchimento:** _______________  
**Responsável:** _______________  
**Ambiente:** [ ] Staging  [ ] Produção

**Vista do sistema (app + banco + CLI):** `docs/VISTA_SISTEMA_COMPLETO_09-02-2026.md`
