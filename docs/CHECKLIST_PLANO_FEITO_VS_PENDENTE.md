# ✅ Checklist: o que já foi feito vs o que NÃO foi (evitar repetir)

**Data:** 09/02/2026  
**Objetivo:** Um único lugar para ver **já feito** (não repetir) e **pendente** (próximas ações).  
**Referências:** `PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md`, `PLANO_8_DIAS_MEDCANLAB.md`, `ANALISE_FULL_PLANO_VS_APP_09-02-2026.md`.

---

## Legenda

| Símbolo | Significado |
|--------|-------------|
| **[x]** | Feito (implementado/validado no app ou banco) |
| **[~]** | Parcial (parte feita, parte pendente) |
| **[ ]** | Pendente (não fazer de novo se já [x]; fazer se ainda [ ]) |

---

## 1. Resumo rápido (não repetir vs fazer)

### Já feito — NÃO repetir

- Login admin (flag_admin / type admin); "Visualizar Como" (profissional, paciente, aluno).
- Lista de pacientes com **nomes** (getAllPatients; users/users_compatible); fix RangeError em lastVisit.
- Prontuário/evoluções: carregamento de clinical_reports + clinical_assessments + patient_medical_records; content sempre string (fix React #31); 403 tratado com scripts RLS.
- RLS patient_medical_records: políticas com is_admin_user(); scripts FIX + LIMPAR políticas duplicadas; script diagnóstico VER_TUDO_RLS.
- Sino de notificações no **Header** (NotificationCenter).
- Videochamada: solicitar/aceitar/recusar sem 406; quem aceita + requester na sala (realtime + polling 1,5 s); WebRTC real (admin–admin validado).
- Documentos: PLANO_REAL_DO_PRODUTO.md (mapa tabela→view→RPC→tela→edge + smoke-test clínico); ANALISE_FULL_PLANO_VS_APP.

### Pendente — Fazer quando for a vez

- Confirmar no **banco**: execução dos scripts CRIAR_TABELAS_FALTANDO, ADICIONAR_BYPASS (onde faltar), VINCULAR_EDUARDO; existência de views e RPCs.
- Videochamada 100%: realtime publication em video_call_requests; testes sistemáticos profissional↔paciente; timeout/notificações em todos os cenários; gravação/consentimento/auditoria.
- Edge Functions: deploy + CORS ok (notificação já tem fallback via RPC).
- Prescrição/assinatura: validar fluxo completo (digital-signature Edge + cfm_prescriptions); ICP-Brasil/Certificados.
- Integrações: WhatsApp, Email (ou mocks estáveis).
- Fase 3: ensino, pesquisa, UX (modais no lugar de alert/confirm), performance, documentação final.
- Vincular Dr. Eduardo como profissional (script VINCULAR_EDUARDO).

---

## 2. Por plano (detalhe)

### 2.1 PLANO POLIMENTO — Fase 1 (Sem travar admin)

| Item | Status | Observação |
|------|--------|------------|
| **1.1 Banco de Dados Completo** | | |
| Executar CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql | [ ] | Confirmar se já rodou no ambiente; não repetir execução cega. |
| Verificar tabelas/índices/RLS | [ ] | Rodar verificações (ex.: ANALISE_FULL checklist sec. 9). |
| **1.2 RLS com Bypass Admin** | | |
| patient_medical_records com bypass admin | [x] | FIX_PATIENT_MEDICAL_RECORDS_RLS_403 + LIMPAR_POLITICAS_DUPLICADAS. |
| Outras tabelas (chat_participants, clinical_*, appointments, etc.) | [~] | Código usa; bypass deve estar onde já rodamos scripts. Verificar resto. |
| Script ADICIONAR_BYPASS_ADMIN_RLS | [~] | Arquivo existe; executado em todos os ambientes? |
| **1.3 Fluxo Clínico Principal** | | |
| Paciente solicita agendamento | [~] | Telas existem (Scheduling, PatientAppointments); validar E2E. |
| Profissional cria agendamento | [~] | ProfessionalScheduling existe; validar E2E. |
| Chat profissional–paciente | [x] | Salas, mensagens, create_chat_room_for_patient; isolamento no código. |
| Videochamada: solicitar/aceitar/recusar/WebRTC | [x] | Sem 406; ambos na sala; WebRTC real. |
| Videochamada: realtime/timeout/gravação/auditoria | [ ] | Pendente. |
| Avaliação clínica | [~] | clinical_assessments no código; formulários e E2E a validar. |
| Relatório clínico | [~] | clinical_reports, get_shared_reports_for_doctor; validar E2E. |
| Prescrição + assinatura | [~] | Prescriptions + Edge digital-signature; validar fluxo completo. |
| Prontuário (visualizar/histórico) | [x] | PatientsManagement evoluções; fix React #31 e 403. |
| **1.4 Admin sempre funcional** | | |
| Login admin / Visualizar Como / rotas | [x] | Implementado e usado (getAllPatients com nomes). |
| RLS não bloqueia admin | [x] | is_admin_user() em patient_medical_records; outros onde aplicado. |
| **1.5 Testes como admin** | | |
| Fluxo completo como admin/paciente/profissional/aluno | [~] | Smoke-test em PLANO_REAL_DO_PRODUTO; executar e marcar. |

### 2.2 PLANO POLIMENTO — Fase 2 (Backend essencial)

| Item | Status | Observação |
|------|--------|------------|
| **2.1 Edge Functions** | | |
| Deploy video-call-request-notification, video-call-reminders, tradevision-core | [ ] | Repo tem; confirmar deploy e CORS. |
| Notificação de videochamada (fallback RPC) | [x] | create_video_call_notification usado quando Edge falha. |
| **2.2 Integrações** | | |
| WhatsApp / Email reais | [ ] | Pendente ou mocks. |
| **2.3 Notificações** | | |
| Sino no Header | [x] | NotificationCenter no Header. |
| Notificações em tempo real / centro no sidebar / marcar lida | [~] | Centro pode ser Header; realtime e “marcar lida” a validar. |
| **2.4 Videochamadas 100%** | | |
| Aceitar/recusar sem 406; ambos na sala; WebRTC | [x] | Feito. |
| CORS/Realtime/timeout/gravação/auditoria | [ ] | Pendente. |
| **2.5 Prescrições ICP-Brasil** | | |
| Assinatura digital / certificado / PDF / histórico | [~] | Edge digital-signature existe; validar ponta a ponta. |

### 2.3 PLANO POLIMENTO — Fase 3 (Refinamento)

| Item | Status |
|------|--------|
| Sistema de ensino (cursos, aulas, progresso, gamificação, certificados) | [ ] |
| Sistema de pesquisa (fórum, debate, pesquisas, análises) | [ ] |
| UX (substituir alert/confirm por modais; loading/error states) | [ ] |
| Performance (queries, cache, lazy load, imagens, bundle) | [ ] |
| Documentação final (rotas, funcionalidades, RLS, Edge, integrações) | [~] (PLANO_REAL, ANALISE, este checklist) |

### 2.4 CHECKLIST ADMIN (seção 4 do Plano Polimento)

| Bloco | Status | Observação |
|-------|--------|------------|
| 4.1 Autenticação e Acesso | [x] | Login admin; Visualizar Como; rotas acessíveis. |
| 4.2 RLS (bypass admin) | [x] para patient_medical_records | Outras tabelas: verificar conforme scripts. |
| 4.3 Dashboards | [x] | Admin e “como” profissional/paciente carregam; lista pacientes com nomes. |
| 4.4 Chat e Comunicação | [x] | AdminChat; videochamada; notificações no Header. |
| 4.5 Dados Clínicos | [x] prontuário/evoluções | Ver todos os prontuários; criar avaliação/relatório/prescrição a validar E2E. |
| 4.6 Testes e Debug | [~] | Smoke-test escrito; executar e documentar. |
| 4.7 Edge Functions | [ ] | Garantir que não bloqueiam admin; testar. |

### 2.5 PLANO 8 DIAS (resumo)

| Dia / Área | Feito | Pendente |
|------------|-------|----------|
| Dias 1–2 (banco, RLS, agenda, chat) | [x] RLS prontuário, admin, chat, lista pacientes | [ ] Executar scripts de criação/verificação no banco |
| Dias 3–4 (videochamada) | [x] Solicitar/aceitar/recusar, ambos na sala, WebRTC | [ ] Realtime; testes prof↔paciente |
| Dias 5–6 (Edge, notificações, 100% video) | [x] Sino Header; RPC notificação | [ ] Deploy Edge; CORS; gravação/auditoria; integrações |
| Dias 7–8 (prescrição, prontuário, refino) | [x] Prontuário/evoluções no app | [ ] Assinatura E2E; UX modais; doc final |

### 2.6 SCRIPTS SQL

| Script | Status | Ação |
|--------|--------|------|
| CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql | [ ] | Executar uma vez no ambiente; confirmar. |
| ADICIONAR_BYPASS_ADMIN_RLS_06-02-2026.sql | [~] | Existe; executar onde ainda não rodou. |
| FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql | [x] | Já usado. |
| LIMPAR_POLITICAS_DUPLICADAS_E_GARANTIR_ADMIN.sql | [x] | Já usado. |
| VER_TUDO_RLS_PATIENT_MEDICAL_RECORDS.sql | [x] | Diagnóstico; usar quando precisar. |
| VERIFICAR_RLS_ADMIN_06-02-2026.sql | [ ] | Rodar para verificar estado geral. |
| VINCULAR_EDUARDO_COMO_PROFISSIONAL_06-02-2026.sql | [ ] | Executar quando for vincular Dr. Eduardo. |

---

## 3. O que NÃO repetir (ação já feita)

- Não rodar de novo **FIX_PATIENT_MEDICAL_RECORDS_RLS** e **LIMPAR_POLITICAS_DUPLICADAS** no mesmo ambiente sem necessidade (risco de “policy already exists”).
- Não “corrigir” de novo: React #31 em evoluções (content string), RangeError lastVisit, lista de pacientes sem nome (getAllPatients já usado), sino de notificações (já no Header).
- Não reescrever mapa tabela→view→RPC→tela→edge nem smoke-test clínico (já em PLANO_REAL_DO_PRODUTO.md).

---

## 4. Próximas ações sugeridas (em ordem)

1. **Validar no banco:** views, RPCs, RLS nas tabelas críticas (checklist ANALISE_FULL sec. 9); executar só os scripts ainda não aplicados (CRIAR_TABELAS, ADICIONAR_BYPASS, VERIFICAR_RLS).
2. **Rodar smoke-test clínico** (PLANO_REAL_DO_PRODUTO Parte 2) e marcar aqui o que passou.
3. **Videochamada:** ativar realtime em video_call_requests; testes profissional↔paciente; depois timeout/gravação/auditoria se necessário.
4. **Edge Functions:** deploy + teste CORS; garantir que admin não fica bloqueado.
5. **Prescrição/assinatura:** fluxo completo (Prescriptions → digital-signature); certificados.
6. **Dr. Eduardo:** executar VINCULAR_EDUARDO quando for usar dashboard-eduardo.
7. Fase 3 quando Fase 1 e 2 estiverem estáveis.

---

**Atualizar este doc** sempre que concluir um bloco: trocar `[ ]` por `[x]` (ou `[~]` se parcial) para não repetir ação e manter visão única do que já foi feito e do que não foi.

---

## 5. Confirmação: análise dos diários (Livro Magno + diários 03–08/02)

**Data da análise:** 09/02/2026  
**Objetivo:** Garantir que o que está marcado como “feito” neste checklist está alinhado ao que os diários oficiais registram, para não repetir ações.

### Diários analisados

| Documento | Período | Conteúdo relevante |
|-----------|---------|--------------------|
| `LIVRO_MAGNO_DIARIO_UNIFICADO.md` | Dez/25 → Fev/26 | Linha do tempo unificada; 06/02 terminais, header, escala; 07/02 WebRTC, CORS, maybeSingle, Deno.serve. |
| `DIARIO_UNIFICADO_ULTIMOS_7_DIAS.md` | 03–08/02 | Resumo por dia: Core/triggers (03), selamento/Git (04), gatilhos/regra 10 palavras (05), terminais/videochamada/RLS (06), WebRTC/CORS/406 (07), 406+polling requester (08). |
| `DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` | 05–06 + 07 + 08/02 | Implementações videochamada, RLS (FIX_PATIENT_MEDICAL_RECORDS, FIX_CHAT_RLS, etc.), scripts SQL, sessões 07/02 (WebRTC, maybeSingle) e 08/02 (UPDATE sem .select(), getRequestById, polling 1,5 s). |
| `DIARIO_LIVRO_MAGNO_06-02-2026.md` | 06–07/02 | Fluxo Core, terminais, escala, tabelas; 07/02 WebRTC e polimento. |

### Cruzamento: diários vs este checklist

- **Até 08/02 (diários):** Login admin, Visualizar Como, RLS (patient_medical_records com is_professional_patient_link e is_admin_user), videochamada (solicitar/aceitar/recusar, WebRTC, 406 corrigido, polling requester), terminais (Paciente em foco, Evolução e Analytics), header unificado, notificação por RPC/insert, Edge Functions Deno.serve — **está registrado nos diários e coincide com o que este checklist marca como [x].**
- **09/02 (sessão atual, fora dos diários até agora):** Correções adicionais em PatientsManagement (getAllPatients, nomes de pacientes, RangeError lastVisit, evolution content string, 403 tratado); sino de notificações reposto no **Header**; scripts LIMPAR_POLITICAS_DUPLICADAS, VER_TUDO_RLS; criação de PLANO_REAL_DO_PRODUTO, ANALISE_FULL_PLANO_VS_APP, CHECKLIST_PLANO_FEITO_VS_PENDENTE. **Isso foi feito em 09/02 e está refletido neste checklist; o Livro Magno foi atualizado com entrada 09/02 abaixo.**

### Conclusão

**Sim:** O que está marcado como “já feito” neste checklist está **confirmado** pelos diários (03–08/02). As ações de **09/02** (admin/prontuário/nomes/RLS/sino/scripts/docs) estão documentadas aqui e na entrada 09/02 do Livro Magno. Use este checklist para não repetir; use os diários para o histórico técnico dia a dia.
