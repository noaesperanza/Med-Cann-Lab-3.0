# 🚀 GUIA FINAL: CORS e Deploy da Edge Function

**Data:** 06/02/2026  
**Status:** ✅ Código 100% CORS-safe

---

## ✅ CONFIRMAÇÃO: Código CORS-Safe

O código da Edge Function está **correto** e **seguro para CORS**:

```typescript
// CORS headers - definidos ANTES de qualquer coisa
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CRÍTICO: OPTIONS retorna IMEDIATAMENTE
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400'
      }
    })
  }
  // ... resto do código
})
```

✅ **Pontos críticos cobertos:**
- OPTIONS tratado ANTES de qualquer processamento
- Headers CORS definidos no topo
- Status 204 (padrão HTTP para preflight)
- Nenhum acesso a `req.json()` ou variáveis antes do OPTIONS

---

## 🔍 POSSÍVEIS CAUSAS DE "Failed to fetch"

Mesmo com CORS configurado, erros podem acontecer por:

### **1. Variáveis de Ambiente Não Definidas**

**Problema:**
- `SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` não estão configuradas
- Edge Function não consegue criar cliente Supabase

**Solução:**
1. Dashboard → Settings → Edge Functions
2. Verificar se variáveis estão definidas:
   - `SUPABASE_URL` (geralmente automático)
   - `SUPABASE_SERVICE_ROLE_KEY` (precisa configurar)

**Como verificar:**
```bash
# Via Supabase CLI
npx supabase functions secrets list --project-ref itdjkfubfzmvmuxxjoae
```

---

### **2. Timeout ou Falha na Função**

**Problema:**
- Função demora muito para responder
- Erro 500 dentro da função
- Frontend recebe "Failed to fetch"

**Solução:**
- Verificar logs da Edge Function no Dashboard
- Adicionar mais logs para debug
- Verificar se todas as queries estão otimizadas

---

### **3. HTTPS / Domínio Diferente**

**Problema:**
- Testando localmente (`localhost:3000`) com função em `https://...`
- CORS deve permitir, mas pode haver problemas

**Solução:**
- Usar `'Access-Control-Allow-Origin': '*'` (já configurado)
- Ou restringir para domínio específico:
  ```typescript
  'Access-Control-Allow-Origin': 'https://medcannlab.vercel.app'
  ```

---

## 🧪 TESTE DA EDGE FUNCTION

### **1. Teste no Dashboard do Supabase**

1. Dashboard → Functions → `video-call-request-notification`
2. Clicar em "Run"
3. Testar com payload:
   ```json
   {
     "requestId": "test_123",
     "requesterId": "uuid-do-usuario",
     "recipientId": "uuid-do-destinatario",
     "callType": "video",
     "metadata": {}
   }
   ```
4. Verificar se retorna sucesso

---

### **2. Teste CORS com cURL**

```bash
# Teste OPTIONS (preflight)
curl -X OPTIONS \
  https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -i

# Deve retornar:
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: POST, OPTIONS
# Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

---

### **3. Teste no Frontend**

```typescript
// Teste simples de CORS
const testCORS = async () => {
  try {
    const response = await fetch(
      'https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          requestId: 'test_123',
          requesterId: user.id,
          recipientId: recipientId,
          callType: 'video',
          metadata: {}
        }),
        mode: 'cors' // Importante!
      }
    )
    
    if (response.ok) {
      console.log('✅ CORS funcionando!', await response.json())
    } else {
      console.error('❌ Erro:', await response.text())
    }
  } catch (error) {
    console.error('❌ Erro de CORS:', error)
  }
}
```

**⚠️ Importante:**
- Não usar `credentials: 'include'` se `Access-Control-Allow-Origin: '*'`
- Usar `mode: 'cors'` explicitamente

---

## 🔧 RECOMENDAÇÕES FINAIS

### **1. Variáveis de Ambiente**

Verificar no Dashboard:
- Settings → Edge Functions → Secrets
- `SUPABASE_URL` (geralmente automático)
- `SUPABASE_SERVICE_ROLE_KEY` (precisa configurar)

### **2. Logs para Debug**

A Edge Function já tem logs, mas você pode adicionar mais:

```typescript
console.log('📥 Request recebido:', {
  method: req.method,
  url: req.url,
  hasBody: !!req.body
})
```

### **3. Restringir Origem (Opcional, mais seguro)**

Se quiser restringir para domínios específicos:

```typescript
const allowedOrigins = [
  'https://medcannlab.vercel.app',
  'http://localhost:3000'
]

const origin = req.headers.get('origin')
const corsOrigin = allowedOrigins.includes(origin) ? origin : '*'

const corsHeaders = {
  'Access-Control-Allow-Origin': corsOrigin,
  // ... resto
}
```

---

## 📋 CHECKLIST DE DEPLOY

- [ ] ✅ Código Edge Function corrigido (CORS-safe)
- [ ] ✅ Variáveis de ambiente configuradas no Supabase
- [ ] ✅ Script SQL executado (FORCE_REFRESH_POSTGREST_CACHE.sql)
- [ ] ✅ Deploy da Edge Function feito
- [ ] ✅ Teste no Dashboard (Run function)
- [ ] ✅ Teste CORS com cURL (OPTIONS retorna 204)
- [ ] ✅ Teste no frontend (fetch com mode: 'cors')
- [ ] ✅ Aguardar 2-5 minutos para schema cache atualizar

---

## 🎯 RESULTADO ESPERADO

Após seguir este guia:

1. ✅ **CORS funcionando** - OPTIONS retorna 204, POST funciona
2. ✅ **Edge Function funcionando** - Notificações criadas corretamente
3. ✅ **Metadata funcionando** - Após schema cache atualizar
4. ✅ **Sistema robusto** - Fallback funciona mesmo se Edge Function falhar

---

## 💡 DICAS EXTRAS

1. **Sempre teste no Dashboard primeiro** - Se funcionar lá, o problema é CORS no frontend
2. **Use `mode: 'cors'` explicitamente** - Garante que o navegador trata como CORS
3. **Não use `credentials: 'include'` com `*`** - Isso quebra CORS
4. **Verifique logs da Edge Function** - Dashboard → Functions → Logs

---

**Documento criado por:** Sistema de Guia Final  
**Data:** 06/02/2026  
**Status:** ✅ Pronto para deploy e testes
