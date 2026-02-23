# Auditoria técnica — 8 camadas

**Data:** 09/02/2026  
**Tipo:** Análise técnica independente (arquitetura, banco, RLS, fluxos, riscos de produção). Sem marketing; sem repetir o óbvio.

---

## 1. Arquitetura geral — o que está construído

Não é “um app”; é um **sistema clínico orientado a eventos + governança**:

- **Estado canônico no banco** (Postgres como fonte da verdade)
- **Supabase** como BaaS + IAM
- **Edge Functions** como autoridade operacional
- **Frontend** reativo, não soberano
- **IA** como copiloto, não como fonte primária de dados

Classificação: **Clinical Operating System com automação assistida por IA**.

---

## 2. Modelo de dados — leitura das tabelas reais

**Núcleo clínico (maduro):** patient_medical_records (1320+), clinical_assessments, clinical_reports, cfm_prescriptions, medical_certificates — produção clínica real.

**Comunicação:** chat_rooms (98), chat_participants (68), chat_messages (1). Arquitetura do chat correta; uso ainda embrionário. Idempotência pensada antes do scale. Atenção: pouca mensagem = pouco teste de concorrência; race conditions ainda não provocadas em produção.

**Videochamada:** video_call_requests (72), video_call_sessions (12). Fluxo e estados existem (pending, accepted, rejected, expired). Falta orquestração de UX e **watchdog de estado** (expiração automática).

---

## 3. Erro FK em chat_participants — leitura correta

O erro `chat_participants_user_id_fkey` (user_id não presente em "users") **não é bug do chat**. É **alarme arquitetural**: identidade (auth.users) e domínio (public.users) dessincronizados. O FK está fazendo o trabalho certo: impedir relação clínica com identidade que não existe oficialmente. Solução adotada: fluxos e app usam apenas usuários que existem em **auth.users** (e, onde aplicável, em public.users).

---

## 4. RLS — acima da média; o que ainda falta provar

**Já certo:** RLS ativo; funções como is_admin_user, is_professional_patient_link; separação por papel (admin, professional, patient).

**Ainda não provado:** Execução **real via JWT** — evidência de que profissional não vê outro profissional, paciente não vê outro paciente, e admin vê tudo por decisão explícita. Diferença entre “está protegido” e “consigo **provar** que está protegido”. Próximo passo: rodar RLS audit (Bloco 2) como profissional e como paciente no app.

---

## 5. Chat — avaliação técnica

**Decisão correta:** RPC canônica (create_chat_room_for_patient_uuid), idempotência, ON CONFLICT DO NOTHING, FK forte.

**Risco futuro:** Concorrência extrema (dois dispositivos, dois profissionais, criação simultânea). Recomendação quando escalar: índice único lógico na sala (ex.: UNIQUE sobre par normalizado patient_id/professional_id) para garantir uma sala por par no banco.

---

## 6. Videochamada — maior risco hoje

**Problema real:** Estado `pending` não expira sozinho se a UI falhar → UI travada, usuário acha que “não funcionou”, médico acha que “o paciente sumiu”.

**Falta técnica:** Watchdog no banco (cron ou Edge Function de expiração) + fallback quando Realtime falha. Em saúde, isso vira desconfiança; não é detalhe.

---

## 7. IA — maior vantagem usada certo

**Feito certo:** Prontuário **fora** do RAG. IA lê documentos, snapshots, knowledge base; IA **não** é fonte de verdade clínica. Isso protege LGPD, erros clínicos e auditoria ética.

---

## 8. Diagnóstico final

**O que existe hoje:** Sistema clínico funcional; governança de dados acima da média; base preparada para auditoria; arquitetura que escala sem refatoração traumática.

**O que falta para produção tranquila:**

- **Prova de RLS por identidade real** (Bloco 2 com 3 perfis).
- **Watchdog de estados** (video/chat edge cases; expiração de pending).
- **Consolidação auth.users ↔ public.users** (sync ou contrato claro).
- **Mais uso real de chat** (para expor concorrência).

**Classificação honesta:**

| Dimensão              | Nota    |
|-----------------------|---------|
| Arquitetura           | 9/10    |
| Governança            | 9.5/10  |
| Segurança             | 8.5/10  |
| UX clínica            | 7.5/10  |
| Maturidade de produção| 8/10    |

Conclusão: não é MVP frágil; é **sistema clínico sério em fase de consolidação operacional**.

---

## Próximos passos objetivos (escolher prioridade)

- **Modelo ideal auth.users ↔ public.users** (contrato e sync).
- **RLS Audit definitivo** (script + UI no app).
- **Watchdog de videochamada** (SQL + Edge de expiração).
- **Artefato institucional oficial** (PDF/checklist automatizado/apresentação Go/No-Go).
