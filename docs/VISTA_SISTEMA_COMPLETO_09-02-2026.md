# Vista do sistema como um todo — MedCannLab

**Data:** 09/02/2026  
**Objetivo:** Ver o sistema de ponta a ponta (front, backend, banco, CLI), documentar onde está cada coisa e como prosseguir sempre documentando. Inclui uso do Supabase CLI quando necessário.

---

## 1. Camadas do sistema (resumo)

| Camada | O quê | Onde |
|--------|--------|------|
| **Frontend** | React (Vite), rotas em `App.tsx`, telas em `src/pages`, componentes em `src/components` | `src/` |
| **Estado / Auth** | Supabase client (`src/lib/supabase`), sessão JWT | App + Supabase Auth |
| **Backend (BaaS)** | Supabase: Postgres, Realtime, Storage, Edge Functions | Projeto Supabase (Dashboard ou CLI) |
| **Banco** | Tabelas, views, RPCs, RLS — fonte da verdade | `public` schema; migrations em `supabase/migrations`; scripts em `database/scripts/` |
| **Edge** | digital-signature, tradevision-core, video-call-* | `supabase/functions/` |
| **Docs / Release** | Roteiro, auditoria, avaliação por rotas, Go/No-Go | `docs/` |

Nenhuma decisão clínica vive só no front; tudo que importa persiste no banco e passa por RLS.

---

## 2. Mapa de artefatos (o que usar para quê)

### 2.1 Release e validação

| Artefato | Uso |
|----------|-----|
| `docs/AVALIACAO_POR_ROTAS_PERCENTUAL_09-02-2026.md` | % pronto por rota; validação do método; conclusão executiva; tiers A/B/C. |
| `docs/CHECKLIST_GO_NO_GO_RELEASE.md` | Critérios Go/No-Go (auth, fluxo clínico, 3 falhas, chat/video, prescrição, RLS, release). |
| `docs/ROTEIRO_OPERACIONAL_VALIDACAO_09-02-2026.md` | Script passo a passo (0–10) para alguém rodar sem “adivinhar”. |
| `docs/AUDITORIA_TECNICA_8_CAMADAS_09-02-2026.md` | Leitura técnica (arquitetura, RLS, chat, video, riscos). |
| `docs/GOVERNANCA_UUID_IA_09-02-2026.md` | UUID na IA; risco semântico; regra de ouro; sanitização (TODO em código). |

### 2.2 Banco e RLS

| Artefato | Uso |
|----------|-----|
| `database/scripts/RLS_AUDIT_SANITY_QUERIES_2026-02-09.sql` | Sanity (Bloco 1), RLS audit por perfil (Bloco 2), RLS ativo (Blocos 3–5). Rodar Bloco 2 como admin, profissional e paciente. |
| `database/scripts/FLUXO_MANUAL_COMPLETO_VIA_SQL_2026-02-09.sql` | Happy path completo via SQL (usuários em auth.users). |
| `database/scripts/FLUXO_3_TRES_FALHAS_VIA_SQL_2026-02-09.sql` | Três falhas (idempotência chat, video reject/expire, RLS). |
| `database/scripts/GOVERNANCA_CHAT_ROOM_UUID_E_REVOKE_JSONB_2026-02-09.sql` | RPC canônica `create_chat_room_for_patient_uuid`; revogar JSONB. |
| `supabase/migrations/` | Migrações oficiais (cognitive state, noa pending, fix RLS, etc.). |

### 2.3 Código (referência rápida)

| O quê | Onde |
|-------|------|
| Rotas | `src/App.tsx` |
| Chat UUID (RPC única) | `PatientDoctorChat.tsx`, `PatientsManagement.tsx`, `InvitePatient.tsx`, `PatientChat.tsx`, `PatientDashboard.tsx` |
| Base de Conhecimento (sem prontuários) | `src/services/knowledgeBaseIntegration.ts` (comentário governança) |
| UUID na IA (sanitização pendente) | `src/lib/noaResidentAI.ts` (TODO + ref. GOVERNANCA_UUID_IA) |
| Video call | `VideoCall.tsx`, `useWebRTCRoom.ts`, `video_call_requests` |

---

## 3. Supabase CLI — quando e como usar

### 3.1 Disponibilidade

- **CLI:** Pode ser executado via `npx supabase` (ex.: `npx supabase --version`). Versão verificada: 2.58.5 (há atualização 2.75.0).
- **Projeto:** Config em `supabase/config.toml`; funções em `supabase/functions/`; migrações em `supabase/migrations/`.

### 3.2 Comandos úteis (sempre documentar resultado)

| Comando | Uso | Observação |
|---------|-----|------------|
| `npx supabase --version` | Confirmar CLI instalado | |
| `npx supabase login` | Autenticar no Supabase | Necessário para link e push |
| `npx supabase link --project-ref <ref>` | Vincular projeto remoto | Ref no Dashboard → Settings → General |
| `npx supabase db pull` | Puxar schema remoto para migrations | Útil para alinhar local ↔ remoto |
| `npx supabase db push` | Aplicar migrations locais ao remoto | Só após revisão; ambiente certo |
| `npx supabase status` | Status do projeto (local ou linked) | Pode falhar se `.env` tiver encoding inválido (ex.: BOM) |

### 3.3 Se `supabase status` falhar com erro de `.env`

- **Erro típico:** `failed to parse environment file: .env (unexpected character '»' in variable name)`.
- **Causa provável:** Encoding do `.env` (ex.: UTF-8 com BOM ou caractere inválido no nome de variável).
- **O que fazer:** (1) Abrir `.env` em editor e salvar como UTF-8 sem BOM; (2) ou rodar comandos que não dependem de `.env` (ex.: `db pull` após `link`); (3) ou usar **Supabase Dashboard → SQL Editor** para rodar os scripts de `database/scripts/` (RLS audit, fluxos, sanity) — mesma validação, sem depender do CLI local.

### 3.4 Rodar scripts SQL sem CLI

- **Dashboard:** Supabase Project → SQL Editor → colar conteúdo de `RLS_AUDIT_SANITY_QUERIES_2026-02-09.sql` (por blocos). Para Bloco 2 (RLS audit), use sessão do app logada como admin/profissional/paciente e rode no SQL Editor (ou via API com o mesmo JWT, se tiver endpoint que repasse).
- **Scripts de fluxo:** Rodar `FLUXO_MANUAL_COMPLETO_VIA_SQL` e `FLUXO_3_TRES_FALHAS_VIA_SQL` no SQL Editor; usuários devem existir em `auth.users` (e em `public.users` onde aplicável).

---

## 4. Fluxo de trabalho recomendado (prosseguir sempre documentando)

1. **Decisão ou correção** → Implementar no código e/ou no banco.
2. **Scripts SQL** → Manter em `database/scripts/` com nome e data (ex.: `*_2026-02-09.sql`); se for migração oficial, considerar `supabase/migrations/`.
3. **Validar** → Roteiro operacional (passos 0–10) e/ou RLS audit (Bloco 2 por perfil); fluxos 3 falhas e happy path via SQL quando fizer sentido.
4. **Documentar** → Atualizar um dos: `CHECKLIST_GO_NO_GO_RELEASE.md`, `AVALIACAO_POR_ROTAS_PERCENTUAL_09-02-2026.md`, `LIVRO_MAGNO_DIARIO_UNIFICADO.md` ou este doc, com o que foi feito e o resultado (ex.: “Bloco 2 rodado como profissional; contagem X; alinhado com expectativa”).
5. **CLI quando precisar** → Usar `npx supabase` para link, pull, push ou status; se `.env` bloquear, usar Dashboard para SQL e documentar que a validação foi feita pelo Dashboard.

---

## 5. Estado atual (09/02/2026) — uma linha por área

| Área | Estado |
|------|--------|
| Rotas / avaliação | Artefato de release por rotas com validação do método, conclusão executiva e tiers; ~29% rotas críticas 100%; núcleo clínico utilizável. |
| RLS | Políticas e funções (is_admin_user, is_professional_patient_link) em uso; Bloco 2 do RLS audit ainda a rodar como profissional e paciente no app. |
| Chat | RPC única `create_chat_room_for_patient_uuid`; idempotência; FK em auth/users respeitada nos fluxos SQL. |
| Video | Fluxo e estados existem; watchdog de expiração recomendado (auditoria). |
| Prescrição / assinatura | Fluxo salva em `cfm_prescriptions`; Edge digital-signature a validar (CORS/401 tratado). |
| Prontuários vs Base de Conhecimento | Prontuários só para profissionais vinculados; Base de Conhecimento só documentos (biblioteca). |
| CLI | `npx supabase` disponível; `status` pode falhar por `.env`; Dashboard SQL serve para todos os scripts de validação. |

**Troubleshooting rápido (erros de console):**
- **400 em `users` ou `users_compatible` com `type=eq.patient`:** Front passou a usar `.in('type', ['patient', 'paciente'])` (ProfessionalMyDashboard, PatientsManagement). Se ainda der 400, conferir se a coluna na tabela `users` se chama `type` e aceita texto.
- **404 em `conversation_ratings`:** Tabela pode não existir no projeto. Rodar `database/scripts/CREATE_CONVERSATION_RATINGS.sql` no SQL Editor do Supabase.
- **WebSocket Realtime falhou:** Verificar se Realtime está habilitado no projeto (Supabase Dashboard → Project Settings → API) e se não há bloqueio de rede/firewall.

---

## 6. Referências cruzadas

- **Próximos passos (ordem 1→7):** `PROXIMOS_PASSOS_FECHAMENTO_09-02-2026.md`
- **Livro Magno (completo):** `LIVRO_MAGNO_COMPLETO_DETALHADO_09-02-2026.md`
- **Resumo 7 dias:** `LIVRO_MAGNO_RESUMO_FINAL_09-02-2026.md`
- **Diário unificado:** `LIVRO_MAGNO_DIARIO_UNIFICADO.md`
- **Ordem de execução de scripts:** `database/scripts/00_ORDEM_EXECUCAO.txt` (se existir ordem recomendada).

Este documento é a **vista única** para “onde está o quê” e “como seguir em frente” com documentação e, quando fizer sentido, CLI no Supabase.
