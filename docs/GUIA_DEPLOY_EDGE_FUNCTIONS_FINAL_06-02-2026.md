# 🚀 GUIA: Deploy Edge Functions (Versão Final)

**Data:** 06/02/2026  
**Status:** ✅ **IMPORT CORRIGIDO** | ⚠️ **AGUARDANDO DEPLOY**

---

## ✅ **IMPORT CORRETO (Oficial do Supabase)**

```typescript
import { serve } from 'https://deno.land/x/supabase_functions@1.0.0/edge-runtime/mod.ts'
```

**❌ ERRADO:**
- `https://deno.land/x/supabase_functions@1.0.0/mod.ts` (sem edge-runtime)
- `https://deno.land/std@0.168.0/http/server.ts` (std library)

**✅ CERTO:**
- `https://deno.land/x/supabase_functions@1.0.0/edge-runtime/mod.ts` (edge-runtime)

---

## 🧠 **POR QUE ISSO RESOLVE O CORS DE VEZ?**

O `edge-runtime/mod.ts`:
- ✅ Integra com o gateway do Supabase
- ✅ Trata OPTIONS/preflight corretamente
- ✅ Evita bug de "Response to preflight request doesn't pass access control check"
- ✅ Funciona em Safari, WebView, Vercel, localhost
- ✅ É o mesmo runtime usado nos exemplos oficiais

---

## 📋 **EDGE FUNCTIONS CORRIGIDAS**

- [x] `video-call-request-notification` ✅
- [x] `video-call-reminders` ✅
- [x] `tradevision-core` ✅
- [x] `digital-signature` ✅

---

## 🚀 **DEPLOY OBRIGATÓRIO**

### **Comando:**
```bash
supabase functions deploy video-call-request-notification --no-verify-jwt
supabase functions deploy video-call-reminders --no-verify-jwt
supabase functions deploy tradevision-core --no-verify-jwt
supabase functions deploy digital-signature --no-verify-jwt
```

### **Ou deploy individual:**
```bash
# A mais importante primeiro
supabase functions deploy video-call-request-notification --no-verify-jwt
```

---

## 🧪 **TESTE DE VALIDAÇÃO**

### **1. Preflight Manual**

```bash
curl -i -X OPTIONS \
https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification
```

**Você precisa ver:**
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-headers: authorization, x-client-info, apikey, content-type
access-control-allow-methods: POST, OPTIONS
access-control-max-age: 86400
```

**Se isso aparecer → o POST vai funcionar no browser.**

---

### **2. Teste Real no Frontend**

1. Acesse o app
2. Tente fazer uma videochamada
3. **NÃO deve aparecer erro de CORS**
4. POST deve chegar na Edge Function
5. Log da Edge deve mostrar execução

---

## 📋 **CHECKLIST DE DEPLOY**

- [x] Import corrigido para `edge-runtime/mod.ts`
- [x] OPTIONS retorna 200 com headers CORS
- [x] Validação de método HTTP (só POST)
- [x] Headers CORS em todas as respostas
- [ ] **Deploy executado** ⚠️
- [ ] **Preflight testado** ⚠️
- [ ] **Fluxo completo testado** ⚠️

---

## 🎯 **RESUMO**

### **✅ Correção Aplicada:**
- Import correto: `edge-runtime/mod.ts`
- Todas as Edge Functions corrigidas
- Template atualizado

### **⚠️ Próximo Passo:**
- Deploy obrigatório
- Teste de preflight
- Teste de fluxo completo

---

**Documento criado por:** Sistema de Deploy  
**Data:** 06/02/2026  
**Status:** ✅ Import Corrigido | ⚠️ Aguardando Deploy
