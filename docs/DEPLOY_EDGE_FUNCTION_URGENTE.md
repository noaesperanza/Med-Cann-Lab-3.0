# 🚨 DEPLOY URGENTE: Edge Function video-call-request-notification

**Status:** ❌ Erro de CORS bloqueando videochamadas  
**Prioridade:** ALTA

---

## 🐛 ERRO ATUAL

```
Access to fetch at '.../functions/v1/video-call-request-notification' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

---

## ✅ SOLUÇÃO: Deploy via Dashboard (MAIS RÁPIDO)

### **Passo a Passo:**

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/functions
   ```

2. **Encontre a função:**
   - Procure por `video-call-request-notification`
   - Se não existir, clique em **"New Function"**

3. **Se a função já existe:**
   - Clique no nome da função
   - Clique em **"Deploy"** ou **"Redeploy"**
   - Aguarde ~30 segundos

4. **Se a função NÃO existe:**
   - Clique em **"New Function"**
   - Nome: `video-call-request-notification`
   - Copie o conteúdo de `supabase/functions/video-call-request-notification/index.ts`
   - Cole no editor
   - Clique em **"Deploy"**

---

## 🔍 VERIFICAÇÃO DO CÓDIGO

O código da Edge Function está **100% correto**:

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

**O problema é apenas que a função não está deployada ou está desatualizada.**

---

## 📋 CHECKLIST PÓS-DEPLOY

Após fazer o deploy:

- [ ] Verificar status da função (deve estar "Active")
- [ ] Testar videochamada no Admin Chat
- [ ] Verificar logs da função (Dashboard → Functions → Logs)
- [ ] Confirmar que não há mais erro de CORS no console

---

## 🧪 TESTE RÁPIDO

Após o deploy, tente fazer uma videochamada. Você deve ver:

✅ **Sucesso:**
- Solicitação de videochamada criada
- Notificação enviada com sucesso
- Sem erro de CORS

❌ **Se ainda houver erro:**
- Verifique os logs da função
- Verifique se a função está "Active"
- Tente fazer deploy novamente

---

## ⚡ TEMPO ESTIMADO

- **Deploy via Dashboard:** ~2 minutos
- **Teste:** ~30 segundos
- **Total:** ~3 minutos

---

**Documento criado por:** Sistema de Diagnóstico  
**Data:** 06/02/2026  
**Status:** ⚠️ AGUARDANDO DEPLOY
