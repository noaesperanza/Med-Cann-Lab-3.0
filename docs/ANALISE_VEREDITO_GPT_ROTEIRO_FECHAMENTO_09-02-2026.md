# Análise: veredito do GPT (roteiro de fechamento) vs estado real do app

**Data:** 09/02/2026  
**Objetivo:** Conferir se o “roteiro de fechamento” do GPT está alinhado aos **dados reais** do app e ao estado atual (CHECKLIST_PLANO_FEITO_VS_PENDENTE, PLANO_REAL_DO_PRODUTO, código e scripts).

---

## Resposta direta: tabela de video call

**Sim.** A tabela de solicitação de videochamada chama-se exatamente **`video_call_requests`**.  
Uso no código: `videoCallRequestService.ts`, `AdminChat.tsx`, `useVideoCallRequests` (realtime subscription na tabela `video_call_requests`).

---

## Veredito por bloco do roteiro GPT

### 0) Regra de fechamento (freeze de escopo)

- **GPT:** Freeze de escopo; bloqueador = quebra agendamento/chat/vídeo/registro/prescrição ou trava admin.
- **Real:** Alinhado com o que já está no CHECKLIST e no PLANO_POLIMENTO (Fase 1 = não travar admin + fluxo clínico; Fase 3 = refinamento depois).
- **Veredito:** Correto.

---

### 1) Checklist Go/No-Go (3 perfis, 0 tela branca / 403 / RangeError)

- **GPT:** Admin/profissional/paciente; 0 tela branca, 0 loop, 0 RangeError, 0 403 surpresa.
- **Real:**  
  - Admin e “Visualizar Como” já usados; getAllPatients com nomes; fix RangeError (lastVisit); 403 em patient_medical_records tratado com RLS + scripts.  
  - Profissional vê só seus pacientes via RLS (is_professional_patient_link, etc.).  
  - Smoke-test em PLANO_REAL_DO_PRODUTO (Parte 2) cobre isso; ainda falta **executar e marcar** os checkboxes.
- **Veredito:** Correto. Falta só rodar o smoke em 3 perfis e formalizar o Go/No-Go.

---

### 2) Fluxo clínico: happy path + 3 erros previsíveis

- **GPT:** 8 passos (agendamento → chat → mensagem → video → avaliação → relatório → prescrição); cada etapa gera registro e aparece na UI. Três falhas tratadas: chat duplicado, video recusada/expirada, RLS com fallback admin.
- **Real:**  
  - Happy path: telas e tabelas existem (Scheduling, PatientAppointments, chat, video, clinical_assessments, clinical_reports, cfm_prescriptions, evoluções). Status no checklist: [~] “validar E2E” em várias etapas.  
  - Chat duplicado: tratado na RPC (ver item 3).  
  - Video recusada/expirada: aceitar/recusar sem 406; polling 1,5 s para requester; timeout existe (expires_at). UI “presa” pode precisar de checagem (timeout visual / estado “expired”).  
  - RLS: admin com bypass (is_admin_user); UI com fallback/tratamento de erro em patient_medical_records.
- **Veredito:** Correto. O roteiro é um bom guia; falta **teste dirigido** dos 8 passos e dos 3 cenários de falha.

---

### 3) Chat: uma verdade + idempotência

- **GPT:** Uma chamada = `create_chat_room_for_patient_uuid(patient_id, professional_id)`. Idempotência: unique ou tabela de link para “50 cliques = 1 sala”.
- **Real:**  
  - Front já padronizado: **só** `create_chat_room_for_patient_uuid` (PatientsManagement, PatientChat, InvitePatient, PatientDoctorChat, PatientDashboard).  
  - Idempotência: a **própria RPC** já garante. Ela busca sala existente (por type='patient' + participantes patient_id e professional_id); se existir, retorna; senão cria. Ou seja, “50 cliques = 1 sala” já é o comportamento atual.  
  - Não há unique em tabela (chat_rooms não tem patient_id/professional_id; o vínculo é por chat_participants). A garantia é lógica na função.
- **Veredito:** Correto. Nada a mudar de modelo; opcional: índice ou constraint para reforçar unicidade (ex.: unique em tabela de link) se quiser dupla garantia no banco.

---

### 4) Videochamada: produção (Realtime, timeouts, auditoria, consentimento)

- **GPT:** Publication Realtime em video_call_requests; estados requested → accepted/rejected/expired → in_progress → ended; auditoria (quem, quando, motivo); consent/gravação ou ao menos consent_given + modal.
- **Real:**  
  - Tabela: **`video_call_requests`** (confirmado).  
  - Realtime: subscription no front em `video_call_requests`; requester hoje usa **polling 1,5 s** como fallback quando Realtime não dispara. Ou seja: publication Realtime ainda é **pendente** como “bloqueador real” (conferir no Supabase se a publication está ativa).  
  - Estados: status (pending, accepted, rejected, expired, etc.); timestamps (expires_at, accepted_at, rejected_at). Timeout (ex.: 30 s) existe; “ninguém preso após 30–60 s” precisa ser validado na UI.  
  - Auditoria: quem solicitou/aceitou e timestamps estão na tabela; “motivo de encerramento” pode ser só status (ended/rejected/expired).  
  - Gravação: no plano está como Fase 2 ou fora do MVP; consent já existe no fluxo (VideoCall).
- **Veredito:** Correto. Prioridade real: **ativar Realtime em `video_call_requests`** e validar timeouts/estados na UI; auditoria mínima já existe; gravação fora do MVP está alinhado.

---

### 5) Prescrição: registro vs ICP-Brasil

- **GPT:** MVP = criar/salvar em cfm_prescriptions, exibir, log (quem emitiu). ICP-Brasil = Fase 2.
- **Real:** Prescriptions usa `cfm_prescriptions`; Edge `digital-signature` existe; fluxo completo e ICP ainda [~] “validar ponta a ponta”.  
- **Veredito:** Correto. Fechar agora = registro rastreável em cfm_prescriptions; assinatura ICP pode ficar explícita como Fase 2.

---

### 6) RLS: varredura final (script de verificação)

- **GPT:** Script único: SELECT em tabelas críticas; critério admin vê tudo, profissional vê subset, paciente vê só o próprio.
- **Real:** Existem scripts de diagnóstico (VER_TUDO_RLS_PATIENT_MEDICAL_RECORDS, VERIFICAR_RLS_ADMIN, etc.); não há um **único** “RLS audit” que rode SELECT em todas as tabelas críticas com os 3 perfis.  
- **Veredito:** Correto. Faz sentido ter um **script SQL de “RLS audit”** (smoke por tabela, por perfil) para dar sinal verde/vermelho antes de release.

---

### 7) Observabilidade (logs, erros, 3 KPIs)

- **GPT:** Sentry ou equivalente; log mínimo backend/Edge; KPIs: % falha RPC, latência dashboard, 403/406 por dia.
- **Real:** Não implementado de forma explícita no repo (Sentry, métricas de RPC, 403/406).  
- **Veredito:** Correto. É o “cinto de segurança” que o app ainda não tem; pode ser mínimo no primeiro release (ex.: erros de front + 1–2 métricas no Supabase/dashboard).

---

### 8) Documento de release (Release Candidate Checklist)

- **GPT:** Checklist de ~20 itens com [x] em produção (banco, RLS audit, happy path, video accept/reject/expired, chat idempotente, notificações, backup, rollback).
- **Real:** PLANO_REAL_DO_PRODUTO tem smoke-test; CHECKLIST_PLANO_FEITO_VS_PENDENTE tem feito vs pendente; não existe um **Release Candidate Checklist** único com critérios de “launch” e rollback.  
- **Veredito:** Correto. Vale criar um **Release Candidate Checklist** (markdown) e ir marcando em produção.

---

## Resumo executivo

| Item GPT | Alinhado ao app? | Observação |
|----------|------------------|------------|
| Freeze de escopo | Sim | Igual à nossa Fase 1 vs 3. |
| Go/No-Go 3 perfis | Sim | Smoke já desenhado; falta executar e marcar. |
| Happy path + 3 falhas | Sim | Código pronto; falta teste dirigido. |
| Chat: uma verdade + idempotência | Sim | Já feito (create_chat_room_for_patient_uuid + lógica na RPC). |
| Video: Realtime + estados + timeout | Parcial | Realtime publication pendente; resto em grande parte feito. |
| Prescrição MVP vs ICP | Sim | cfm_prescriptions + digital-signature; ICP Fase 2. |
| RLS audit (script único) | Falta | Ter um script “RLS audit” é útil. |
| Observabilidade mínima | Falta | Sentry/KPIs não implementados. |
| Release Candidate Checklist | Falta | Criar um doc único de release. |

**Conclusão:** O roteiro do GPT está **certo** em relação ao estado real do app. Ele descreve bem o que já está feito (chat padronizado e idempotente, fluxo clínico nas telas, video sem 406, RLS admin) e o que falta (Realtime em video_call_requests, teste E2E dos 8 passos, RLS audit único, observabilidade, checklist de release). A recomendação “agora em 6 passos” também bate: (1) já fizemos; (2) idempotência já está na RPC; (3)–(6) são os próximos passos naturais.

---

## Próximos artefatos sugeridos (como o GPT ofereceu)

- **(A) Check-list Go/No-Go** em markdown: pode ser uma versão “release” do smoke-test do PLANO_REAL_DO_PRODUTO (Blocos A–E) com critérios Go/No-Go e 3 perfis.
- **(B) SQL “RLS audit + sanity”**: um script que rode SELECT nas tabelas críticas (appointments, chat_rooms, chat_participants, chat_messages, clinical_assessments, clinical_reports, patient_medical_records, notifications, video_call_requests, video_call_sessions, cfm_prescriptions) e devolva contagens ou amostras; para ser rodado “como admin”, “como profissional” e “como paciente” (ex.: via `set request.jwt.claims` ou contas de teste) e dar sinal verde/vermelho.

**Artefatos criados (09/02/2026):**
- **(A)** `docs/CHECKLIST_GO_NO_GO_RELEASE.md` — Check-list Go/No-Go para release (3 perfis, happy path, falhas, RLS, release).
- **(B)** `database/scripts/RLS_AUDIT_SANITY_QUERIES_2026-02-09.sql` — RLS audit + sanity (Blocos 1–5: tabelas/views/RPCs, contagem por tabela, RLS ativo, usuário atual, resumo).
