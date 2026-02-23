# Roteiro operacional — Script de validação

**Data:** 09/02/2026  
**Objetivo:** Alguém executa do começo ao fim sem precisar “pensar”; ordem fixa; se falhar, corrigir antes de seguir.

---

## PASSO 0 — Preparação

- [ ] Confirmar que o usuário de teste existe em **auth.users**
- [ ] Confirmar que o mesmo usuário existe em **public.users**
- [ ] Confirmar **tipo** em public.users: `admin` | `professional` | `patient` (ou `profissional` | `paciente` conforme schema)

---

## PASSO 1 — Login e navegação

1. [ ] **Login como admin** → abrir dashboards (admin, depois “Visualizar Como” profissional e paciente) → **nenhuma tela branca**
2. [ ] **Logout**
3. [ ] **Login como profissional** → repetir navegação pelas rotas do profissional
4. [ ] **Logout**
5. [ ] **Login como paciente** → repetir navegação pelas rotas do paciente

**❌ Falhou?** → Corrigir rota/RLS antes de seguir.

---

## PASSO 2 — RLS Audit manual

Rodar a **mesma** query com cada perfil (no app, com JWT do usuário logado, ou via endpoint que use o token):

```sql
SELECT COUNT(*) FROM patient_medical_records;
```

- [ ] **Como admin:** anotar valor (ex.: 1320)
- [ ] **Como profissional:** anotar valor
- [ ] **Como paciente:** anotar valor

**Esperado:** `admin >= profissional > paciente`

**❌ Falhou?** → Ajustar políticas RLS (is_admin_user, is_professional_patient_link) antes de seguir.

---

## PASSO 3 — Chat (idempotência)

1. [ ] Abrir chat **paciente ↔ profissional** (qualquer um dos dois inicia)
2. [ ] Clicar várias vezes em “Abrir chat” ou reabrir a mesma conversa
3. [ ] Verificar no banco (ou via script):

```sql
SELECT COUNT(*) FROM chat_rooms;
SELECT COUNT(*) FROM chat_participants WHERE room_id = '<room_id_da_conversa>';
```

**Esperado:** **1 sala** para aquele par; **2 participantes** (paciente + profissional).

**❌ FK error ao criar sala?** → Usuário não existe em auth.users; garantir sync auth ↔ public ou usar apenas usuários que existam em ambos.

---

## PASSO 4 — Mensagens

1. [ ] Enviar **uma mensagem** no chat
2. [ ] **Refresh** da página (F5)
3. [ ] Confirmar **persistência** (mensagem continua visível)

---

## PASSO 5 — Agendamento

1. [ ] **Profissional** cria agendamento
2. [ ] **Paciente** visualiza o agendamento na sua lista
3. [ ] **Cancelar** o agendamento (ou alterar status)
4. [ ] Confirmar **update visível nos dois lados** (profissional e paciente)

---

## PASSO 6 — Prontuário

1. [ ] **Criar registro** no prontuário (evolução ou relatório)
2. [ ] **Criar relatório** e associar ao paciente
3. [ ] **Paciente** vê o que é dele? (sim)
4. [ ] **Outro paciente** (outro usuário) **NÃO** vê esse prontuário? (confirmar isolamento)

---

## PASSO 7 — Videochamada

1. [ ] **Enviar** request de videochamada (paciente → profissional ou vice-versa)
2. [ ] **Aceitar** em um fluxo → ambos entram na sala (WebRTC)
3. [ ] **Rejeitar** em outro fluxo → UI não fica presa; estado “rejected” visível
4. [ ] **Não responder** em outro fluxo → esperar timeout; estado “expired” ou equivalente
5. [ ] Verificar no banco:

```sql
SELECT status, COUNT(*) FROM video_call_requests GROUP BY status;
```

Confirmar que existem `pending`, `accepted`, `rejected`, `expired` conforme uso.

---

## PASSO 8 — Falhas (acesso indevido)

1. [ ] **Forçar acesso indevido** (ex.: paciente tentar acessar recurso de outro paciente; profissional tentar ver lista de outro profissional)
2. [ ] Confirmar **erro amigável** (mensagem clara, sem tela branca)
3. [ ] Confirmar **nenhum dado vazado** (nem em rede nem em UI)

---

## PASSO 9 — Prescrição

1. [ ] **Criar** prescrição (profissional)
2. [ ] **Rodar Edge** de assinatura (digital-signature) se aplicável
3. [ ] **Validar:** sucesso **ou** erro tratado na UI (sem CORS/401 não tratado)

---

## PASSO 10 — Backup e rollback

- [ ] **Dump** (backup) realizado (ex.: snapshot Supabase)
- [ ] **Tag** de release criada no repositório (ex.: `git tag v1.0.0-rc`)
- [ ] **Plano de rollback** conhecido (como voltar à tag anterior se necessário)

---

## Leitura final (sem rodeio)

O sistema já é maduro. O que falta não é arquitetura, é **prova operacional** e **ritual de release**.

Depois que você roda esse roteiro inteiro **uma vez**, o MedCannLab deixa de ser *“um app que funciona”* e vira *um sistema clínico governado, auditável e sustentável*.

---

## Próximos movimentos (opcionais)

- Transformar este roteiro em **PDF institucional**
- Criar **checklist automatizado** dentro do próprio app (tela “Validação release”)
- Gerar **apresentação executiva** de 10 slides (Go/No-Go) para stakeholders
