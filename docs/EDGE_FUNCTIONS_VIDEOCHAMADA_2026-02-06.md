# 📞 Edge Functions para Videochamadas

**Data:** 06/02/2026

## 🎯 Resumo

Existem **2 Edge Functions** para o sistema de videochamadas, cada uma com um propósito específico:

---

## 1. `video-call-request-notification` ⚡ (TEMPO REAL)

### Propósito
Enviar notificações **imediatas** quando alguém solicita uma videochamada.

### Quando é chamada
- Quando um **paciente** solicita videochamada para um profissional
- Quando um **profissional** solicita videochamada para um paciente
- Quando um **admin** solicita videochamada para outro admin

### O que faz
1. Cria notificação in-app para o destinatário
2. Envia mensagem WhatsApp (quando implementado)
3. Notifica em tempo real

### Endpoint
```
POST /functions/v1/video-call-request-notification
```

### Parâmetros
```json
{
  "requestId": "vcr_1234567890_abc123",
  "requesterId": "uuid-do-requester",
  "recipientId": "uuid-do-recipient",
  "callType": "video" | "audio",
  "metadata": {
    "roomId": "uuid-da-sala",
    "isAdminChat": true
  }
}
```

### Status
- ✅ **Criada e commitada**
- ⚠️ **Precisa ser deployada no Supabase**
- ❌ **Erro CORS atual** (será resolvido após deploy)

---

## 2. `video-call-reminders` ⏰ (AGENDAMENTO)

### Propósito
Enviar lembretes **automáticos** antes de videochamadas agendadas.

### Quando é chamada
- Via **cron job** ou **pg_cron** (a cada minuto)
- Verifica agendamentos na tabela `video_call_schedules`
- Envia lembretes nos horários:
  - **30 minutos** antes
  - **10 minutos** antes
  - **1 minuto** antes

### O que faz
1. Busca agendamentos próximos
2. Verifica se já enviou o lembrete
3. Cria notificação in-app
4. Envia email/WhatsApp (quando implementado)
5. Marca como enviado na tabela

### Endpoint
```
POST /functions/v1/video-call-reminders
```

### Parâmetros
```json
{
  "schedule_id": "uuid-do-agendamento",
  "scheduled_at": "2026-02-06T20:00:00Z"
}
```

### Status
- ✅ **Criada e commitada**
- ⚠️ **Precisa ser deployada no Supabase**
- ⚠️ **Precisa configurar cron job** para executar periodicamente

---

## 📋 Resumo das Diferenças

| Aspecto | `video-call-request-notification` | `video-call-reminders` |
|---------|-----------------------------------|-------------------------|
| **Tipo** | Tempo real | Agendado |
| **Trigger** | Usuário clica em "Video/Audio Call" | Cron job (a cada minuto) |
| **Tabela** | `video_call_requests` | `video_call_schedules` |
| **Quando** | Imediato | 30min, 10min, 1min antes |
| **Uso** | Solicitação de chamada | Lembretes de agendamento |

---

## 🚀 Como Fazer Deploy

### Opção 1: Via Supabase CLI

```bash
# Deploy da função de notificação em tempo real
supabase functions deploy video-call-request-notification

# Deploy da função de lembretes
supabase functions deploy video-call-reminders
```

### Opção 2: Via Supabase Dashboard

1. Acesse **Supabase Dashboard** → **Edge Functions**
2. Para cada função:
   - Clique em **"New Function"** ou **"Deploy"**
   - Selecione a pasta da função
   - Clique em **"Deploy"**

---

## ⚙️ Configuração do Cron (para `video-call-reminders`)

Após deploy, configure um cron job para executar a cada minuto:

### Via Supabase Dashboard (pg_cron)
```sql
-- Executar a cada minuto
SELECT cron.schedule(
  'video-call-reminders',
  '* * * * *', -- A cada minuto
  $$
  SELECT net.http_post(
    url := 'https://SEU_PROJETO.supabase.co/functions/v1/video-call-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SEU_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## ✅ Checklist de Deploy

- [ ] Deploy `video-call-request-notification`
- [ ] Testar notificação em tempo real
- [ ] Deploy `video-call-reminders`
- [ ] Configurar cron job para lembretes
- [ ] Testar lembretes automáticos

---

## 🔍 Troubleshooting

### Erro CORS
- **Causa:** Edge Function não deployada ou CORS mal configurado
- **Solução:** Fazer deploy da função e verificar headers CORS

### Notificações não chegam
- **Causa:** Edge Function não está sendo chamada ou falha silenciosamente
- **Solução:** Verificar logs no Supabase Dashboard → Edge Functions → Logs

### Lembretes não são enviados
- **Causa:** Cron job não configurado ou não está executando
- **Solução:** Verificar se o cron está ativo e executando corretamente
