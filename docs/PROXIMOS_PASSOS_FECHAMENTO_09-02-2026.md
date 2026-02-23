# Próximos passos — Fechamento MedCannLab

**Data:** 09/02/2026  
**Situação atual:** Sanity e RLS ativo OK (12/12). Uma rodada de contagens por tabela já feita (provavelmente como admin). Check-list Go/No-Go e script de RLS audit criados.

**Vista do sistema (app + banco + CLI):** `docs/VISTA_SISTEMA_COMPLETO_09-02-2026.md`

**Ordem de execução (1 → 7):** RLS audit 3 perfis → Go/No-Go §1 (auth/rotas) → §2 (happy path 8 passos) → §3 (três falhas) → video + prescrição → release (backup, rollback, veredito).

---

## Ordem sugerida (fazer em sequência)

### 1. Fechar o RLS audit (3 perfis)

- [ ] **Admin** — você já tem as contagens (31 appointments, 98 chat_rooms, 1320 patient_medical_records, etc.). Guarde ou anote como “baseline admin”.
- [ ] **Profissional** — no app, faça login como um **profissional** (ex.: Dr. Ricardo). Rode de novo a **mesma query de contagem** (Bloco 2 do `RLS_AUDIT_SANITY_QUERIES_2026-02-09.sql` ou a API que você usou). Esperado: contagens **menores** que admin (só seus pacientes/agendamentos/relatórios).
- [ ] **Paciente** — faça login como **paciente**. Rode a mesma query. Esperado: contagens **bem menores** (só o próprio conteúdo).

**Critério de sucesso:** admin ≥ profissional ≥ paciente em cada tabela. Se der certo, marque no **CHECKLIST_GO_NO_GO_RELEASE.md** a seção 6.1 (RLS audit passou).

**Dica:** Se no SQL Editor você está sempre como service_role, use no **app** uma tela ou chamada que execute esses `COUNT(*)` com o JWT do usuário logado (ou um endpoint que recebe o token e roda as contagens no backend).

---

### 2. Check-list Go/No-Go — Seção 1 (Auth + rotas)

Testar no navegador, sem pressa:

- [ ] Login **admin** → acessar `/app/admin`, depois “Visualizar Como” profissional e paciente. Lista de pacientes com **nomes** (sem RangeError, sem 403).
- [ ] Login **profissional** → navegar rotas do profissional; confirmar que vê **só seus pacientes**.
- [ ] Login **paciente** → navegar rotas do paciente; confirmar que vê **só seu conteúdo**.

Marcar no `CHECKLIST_GO_NO_GO_RELEASE.md` a seção 1 (todos [x] quando passar).

---

### 3. Check-list Go/No-Go — Seção 2 (Happy path, 8 passos)

**Script SQL do fluxo completo (como se fosse manual):** `database/scripts/FLUXO_MANUAL_COMPLETO_VIA_SQL_2026-02-09.sql`. Rode no Supabase SQL Editor; ele executa os 8 passos em sequência (agendamento → sala chat → mensagem → video request→accepted → avaliação → relatório → prescrição → registro prontuário) e devolve uma tabela de resultado + veredito. Use para validar que o banco e as tabelas aceitam o fluxo ponta a ponta.

Fazer **um** fluxo completo, do início ao fim (pode ser em mais de uma sessão):

1. Paciente solicita agendamento → confirma que aparece em `appointments` e na UI.
2. Profissional confirma/cria agendamento → confirma na lista.
3. Abrir chat paciente–profissional → sala criada/reutilizada (`create_chat_room_for_patient_uuid`), mensagem enviada e visível.
4. Solicitar videochamada → aceitar → os dois entram (WebRTC).
5. Criar avaliação → aparece no prontuário (aba Evolução).
6. Gerar/ver relatório → aparece.
7. Criar prescrição → salva em `cfm_prescriptions` e aparece na lista.

Marcar cada item da seção 2 do check-list quando validar.

---

### 4. Check-list Go/No-Go — Seção 3 (Três falhas)

- [ ] **Chat duplicado:** abrir chat com o mesmo paciente em 2 abas ou clicar 2 vezes em “Abrir chat”. Esperado: uma única sala; mesma conversa.
- [ ] **Video recusada/expirada:** solicitar videochamada e recusar (ou deixar expirar). Esperado: UI não fica presa; estado “recusada”/“expirada” visível.
- [ ] **RLS 403:** com um usuário não-admin, tentar acessar algo que não deveria (se tiver caso real). Esperado: mensagem clara; admin ainda acessa tudo.

Marcar seção 3 quando os 3 cenários estiverem OK.

---

### 5. Videochamada em produção (opcional mas recomendado)

- [ ] No Supabase: **Realtime** → publicação em `video_call_requests` ativa (para o requester ser puxado sem depender só de polling).
- [ ] Testar timeout (ex.: 30 s): após expirar, nenhum usuário preso em “chamada pendente”.
- [ ] Se gravação não estiver pronta: manter fora do MVP; deixar consent na UI para futuro.

---

### 6. Prescrição e assinatura

- [ ] Confirmar: prescrição criada e listada (paciente e profissional); quem emitiu rastreável.
- [ ] Se usar Edge `digital-signature`: testar invoke (sem CORS/401) ou tratar erro na UI. ICP-Brasil pode ficar para Fase 2.

---

### 7. Release (quando tudo acima estiver [x])

- [ ] Backup/restore testado (ex.: snapshot do Supabase).
- [ ] Tag do deploy anterior anotada (rollback plan).
- [ ] Preencher **Veredito final** no `CHECKLIST_GO_NO_GO_RELEASE.md` (Go) e data/responsável/ambiente.

---

## Resumo em 4 linhas

1. **Agora:** Fechar RLS audit (contagens como profissional e como paciente); marcar seção 6.1 do check-list.
2. **Depois:** Rodar seção 1 (auth + rotas nos 3 perfis) no app e marcar.
3. **Em seguida:** Um happy path completo (seção 2) + três falhas (seção 3).
4. **Por fim:** Video/prescrição conforme acima; release com backup e rollback definido.

Qualquer bloco que falhar vira **No-Go** até corrigir; o resto pode seguir em paralelo quando não depender desse bloco.
