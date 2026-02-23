# 🚀 Deploy da Edge Function: video-call-request-notification

**Data:** 06/02/2026  
**Função:** Notificação de solicitação de videochamada (bidirecional)

---

## 📋 Nome da Função

**Nome:** `video-call-request-notification`

**Caminho no projeto:** `supabase/functions/video-call-request-notification/index.ts`

**URL após deploy:** `https://[seu-projeto].supabase.co/functions/v1/video-call-request-notification`

---

## 🔧 Como Fazer Deploy

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# 1. Certifique-se de estar logado no Supabase CLI
supabase login

# 2. Linkar ao projeto (se ainda não fez)
supabase link --project-ref [seu-project-ref]

# 3. Fazer deploy da função
supabase functions deploy video-call-request-notification
```

### Opção 2: Via Dashboard do Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **Edge Functions**
3. Clique em **Create a new function**
4. Nome: `video-call-request-notification`
5. Cole o conteúdo de `supabase/functions/video-call-request-notification/index.ts`
6. Clique em **Deploy**

---

## 🔐 Variáveis de Ambiente Necessárias

A função usa automaticamente as variáveis de ambiente do Supabase:
- `SUPABASE_URL` - Já configurada automaticamente
- `SUPABASE_SERVICE_ROLE_KEY` - Já configurada automaticamente

**Opcional (para WhatsApp):**
- `EVOLUTION_API_KEY` - Se usar Evolution API para WhatsApp
- Ou configure outro serviço de WhatsApp (Twilio, etc.)

---

## ✅ Verificação

Após o deploy, teste a função:

```bash
curl -X POST https://[seu-projeto].supabase.co/functions/v1/video-call-request-notification \
  -H "Authorization: Bearer [seu-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test_123",
    "requesterId": "uuid-requester",
    "recipientId": "uuid-recipient",
    "callType": "video",
    "metadata": {}
  }'
```

---

## 📝 Notas

- A função funciona **bidirecionalmente**: paciente → profissional e profissional → paciente
- Envia notificação in-app automaticamente
- WhatsApp está preparado (comentado) - descomente e configure quando tiver serviço
- Não falha a criação da solicitação se a notificação falhar (fail-safe)

---

**Criado por:** Auto (AI Assistant)  
**Data:** 06/02/2026
