# 📅 Plano de 8 Dias — MedCannLab 3.0

**Data de referência:** 08/02/2026  
**Objetivo:** Visão executiva em 8 dias para fluxo clínico estável, admin sempre funcional e videochamada no caminho para 100%.

> **Documentos relacionados:**  
> - Detalhe por fases: `docs/PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md`  
> - Resumo executivo: `docs/RESUMO_EXECUTIVO_PLANO_POLIMENTO_06-02-2026.md`  
> - Diário completo (05–06 + 07 + 08/02): `docs/DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md`  
> - Timeline unificada: `docs/DIARIO_UNIFICADO_ULTIMOS_7_DIAS.md`

---

## 📋 Visão geral (8 dias)

| Dia | Foco | Entregas principais |
|-----|------|----------------------|
| **Dia 1** | Banco + RLS Admin | Tabelas faltando; bypass admin em RLS; verificação. |
| **Dia 2** | Fluxo clínico base | Agenda, chat, isolamento profissional; admin não trava. |
| **Dia 3** | Videochamada (solicitação/aceite) | Solicitar, notificar, aceitar/recusar, timeout; sem 406. |
| **Dia 4** | Videochamada (WebRTC + “ambos na sala”) | WebRTC real; quem aceita e quem solicitou entram na sala (realtime + polling). |
| **Dia 5** | Edge Functions + notificações | Deploy Edge Functions; notificações completas; CORS resolvido. |
| **Dia 6** | Videochamada 100% + integrações | Realtime publication; testes profissional–paciente; gravação/consentimento; WhatsApp/Email (ou mocks estáveis). |
| **Dia 7** | Prescrição + prontuário | Assinatura digital; prescrições; prontuário completo; testes admin. |
| **Dia 8** | Refino + documentação | UX (modais, loading); performance; documentação final; checklist deploy. |

---

## 🎯 Status por área (atualizado 08/02/2026)

### Videochamada — **em andamento (no caminho)**

- ✅ Solicitação de videochamada (criar, notificar, aceitar/recusar).
- ✅ Fix 406 (UPDATE sem .select(); SELECT separado).
- ✅ Quem aceita sempre entra na sala (fallback com objeto em mãos).
- ✅ Requester puxado para a sala (realtime + **polling 1,5 s** como fallback).
- ✅ WebRTC real (áudio/vídeo entre dois dispositivos).
- ✅ Admin Chat e PatientDoctorChat com fluxo aceitar → ambos na sala (validado entre dois admins).
- ⏳ **Ainda não 100%:** Realtime na tabela `video_call_requests` (publication) a confirmar; testes sistemáticos profissional–paciente; gravação de trechos, consentimento e auditoria em fluxo real.

### Fluxo clínico principal

- Em linha com `PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md`: Paciente → Agenda → Chat → Videochamada → Avaliação → Prescrição → Registro.
- Admin sempre funcional (bypass RLS; “Visualizar Como”).

### Regra de ouro

**Admin nunca deve ficar travado. Se admin ficar travado, é bug de RLS ou rota, não regra de negócio.**

---

## 📌 Checklist rápido (8 dias)

### Dias 1–2 (base)

- [ ] Executar scripts: tabelas faltando, bypass admin RLS.
- [ ] Testar login admin e “Visualizar Como”.
- [ ] Fluxo agenda + chat + isolamento profissional.

### Dias 3–4 (videochamada — onde estamos)

- [x] Solicitar / aceitar / recusar sem 406.
- [x] Quem aceita entra na sala; requester entra (realtime ou polling).
- [ ] Confirmar Realtime `video_call_requests` no Supabase.
- [ ] Testes profissional ↔ paciente.

### Dias 5–6 (backend + videochamada 100%)

- [ ] Deploy Edge Functions; notificações completas.
- [ ] Videochamada 100%: gravação, consentimento, auditoria.
- [ ] Integrações (WhatsApp/Email ou mocks estáveis).

### Dias 7–8 (clínico + refino)

- [ ] Prescrição e assinatura digital; prontuário completo.
- [ ] UX (substituir alert/confirm por modais); performance; documentação.

---

## 📁 Documentos de suporte

| Documento | Uso |
|-----------|-----|
| `DIARIO_COMPLETO_05-06_FEVEREIRO_2026.md` | Detalhe técnico 05/02–08/02 (videochamada, RLS, WebRTC, 406, polling). |
| `DIARIO_UNIFICADO_ULTIMOS_7_DIAS.md` | Timeline 03/02–08/02 em um só lugar. |
| `PLANO_POLIMENTO_AJUSTES_FINAIS_06-02-2026.md` | Fases 1–3, checklist Admin, RLS, fluxo clínico. |
| `RESUMO_EXECUTIVO_PLANO_POLIMENTO_06-02-2026.md` | Resumo de prioridades e scripts SQL. |

---

**Última atualização:** 08/02/2026  
**Status:** Plano de 8 dias ativo; videochamada em andamento, no caminho para 100%.
