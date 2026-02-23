# ⚡ SOLUÇÃO RÁPIDA: CORS Error video-call-request-notification

**Erro:** `Response to preflight request doesn't pass access control check`

---

## ✅ SOLUÇÃO IMEDIATA

A Edge Function `video-call-request-notification` precisa ser **redeployada** no Supabase Dashboard.

### **Passos:**

1. **Acesse:** https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/functions
2. **Encontre:** `video-call-request-notification`
3. **Clique:** "Deploy" ou "Redeploy"
4. **Aguarde:** Deploy completar (~30 segundos)
5. **Teste:** Tente fazer uma videochamada novamente

---

## 🔍 VERIFICAÇÃO

O código da Edge Function está **100% correto**:

```typescript
// ✅ CORS headers corretos
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ✅ OPTIONS handler correto
if (req.method === 'OPTIONS') {
  return new Response('ok', { 
    status: 200,  // ✅ Status correto
    headers: corsHeaders 
  })
}
```

**O problema é apenas que o deploy está desatualizado.**

---

## 📝 ALTERNATIVA: Deploy via CLI

Se preferir usar CLI (após corrigir .env):

```bash
# Login no Supabase
npx supabase login

# Deploy
npx supabase functions deploy video-call-request-notification --project-ref itdjkfubfzmvmuxxjoae
```

---

**Status:** ✅ Código correto - Apenas precisa redeploy  
**Tempo estimado:** 2 minutos  
**Prioridade:** Alta (bloqueia videochamadas)
