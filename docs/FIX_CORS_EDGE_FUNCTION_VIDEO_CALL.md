# 🔧 FIX: CORS Error na Edge Function video-call-request-notification

**Data:** 06/02/2026  
**Erro:** `Response to preflight request doesn't pass access control check: It does not have HTTP ok status`

---

## 🐛 PROBLEMA

A Edge Function `video-call-request-notification` está retornando erro de CORS quando chamada de `https://medcannlab.vercel.app` (produção).

**Erro:**
```
Access to fetch at 'https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification' 
from origin 'https://medcannlab.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

---

## ✅ SOLUÇÃO

A Edge Function precisa ser **redeployada** no Supabase. O código já está correto, mas o deploy pode estar desatualizado.

### **Opção 1: Deploy via Supabase CLI (Recomendado)**

```bash
# 1. Certifique-se de estar no diretório do projeto
cd c:\medcannlab5-6361cc14ac66b8b7c60f0ef8f79d80d44fdbcd5d

# 2. Faça login no Supabase (se necessário)
npx supabase login

# 3. Link do projeto (se necessário)
npx supabase link --project-ref itdjkfubfzmvmuxxjoae

# 4. Deploy da Edge Function
npx supabase functions deploy video-call-request-notification
```

### **Opção 2: Deploy via Dashboard Supabase**

1. Acesse o **Supabase Dashboard**
2. Vá em **Edge Functions**
3. Encontre `video-call-request-notification`
4. Clique em **Deploy** ou **Redeploy**
5. Aguarde o deploy completar

---

## 🔍 VERIFICAÇÃO DO CÓDIGO

O código da Edge Function está correto:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,  // ✅ Status correto
      headers: corsHeaders 
    })
  }
  // ... resto do código
})
```

**Pontos verificados:**
- ✅ CORS headers corretos
- ✅ OPTIONS handler retorna status 200
- ✅ Headers incluídos em todas as respostas

---

## 🧪 TESTE APÓS DEPLOY

Após o deploy, teste fazendo uma solicitação de videochamada no Admin Chat. O erro de CORS deve desaparecer.

**Logs esperados:**
- ✅ Solicitação de videochamada criada
- ✅ Notificação enviada com sucesso
- ❌ Sem erro de CORS

---

## 📝 NOTA IMPORTANTE

Se o erro persistir após o deploy:

1. **Verifique se a Edge Function está ativa:**
   - Dashboard → Edge Functions → `video-call-request-notification` → Status deve ser "Active"

2. **Verifique os logs:**
   - Dashboard → Edge Functions → `video-call-request-notification` → Logs
   - Procure por erros de sintaxe ou runtime

3. **Verifique variáveis de ambiente:**
   - Dashboard → Edge Functions → `video-call-request-notification` → Settings → Secrets
   - Certifique-se de que `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configuradas

---

**Documento criado por:** Sistema de Diagnóstico  
**Data:** 06/02/2026
