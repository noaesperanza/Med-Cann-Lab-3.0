# 🛡️ TEMPLATE: Edge Function CORS-Proof

**Data:** 06/02/2026  
**Status:** ✅ **TEMPLATE OFICIAL**

---

## 🎯 **PROPÓSITO**

Template padrão para Edge Functions do Supabase que **nunca mais** terá problemas de CORS.

---

## ✅ **IMPORTS CORRETOS (CRÍTICO)**

```typescript
// ✅ CORRETO: Usar wrapper oficial do Supabase Edge Runtime
import { serve } from 'https://deno.land/x/supabase_functions@1.0.0/edge-runtime/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ❌ ERRADO: NÃO usar std/http/server.ts
// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// ❌ ERRADO: NÃO usar mod.ts (sem edge-runtime)
// import { serve } from 'https://deno.land/x/supabase_functions@1.0.0/mod.ts'
```

**Por quê?**
- Supabase Edge não é Deno puro
- É um runtime customizado + gateway + proxy + auth layer
- O wrapper oficial intercepta OPTIONS corretamente
- Respeita o gateway do Supabase
- Funciona em Vercel, localhost, mobile, Safari, WebView

---

## 📋 **TEMPLATE COMPLETO**

```typescript
// Edge Function: [Nome da Função]
// [Descrição]

// ✅ IMPORTANTE: Usar wrapper oficial do Supabase Edge Runtime
import { serve } from 'https://deno.land/x/supabase_functions@1.0.0/edge-runtime/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers - definidos ANTES de qualquer coisa
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CRÍTICO: OPTIONS deve ser tratado PRIMEIRO, antes de QUALQUER processamento
  // Não pode haver nenhum acesso a req, Deno.env, ou qualquer coisa antes disso
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200, // 200 é mais universalmente aceito (evita edge cases no Safari/WebView)
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400'
      }
    })
  }

  // Validar método HTTP - só aceitar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }

  // Só depois do OPTIONS, podemos processar outras coisas
  try {
    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente faltando')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Ler body apenas se for POST
    const body = await req.json()

    // [Sua lógica aqui]

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 🧪 **TESTE DE VALIDAÇÃO**

### **1. Preflight Manual**

```bash
curl -i -X OPTIONS \
https://[seu-projeto].supabase.co/functions/v1/[nome-da-funcao]
```

**Esperado:**
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-headers: authorization, x-client-info, apikey, content-type
access-control-allow-methods: POST, OPTIONS
access-control-max-age: 86400
```

**Se ver isso → o POST vai passar.**

---

### **2. Teste Real no Frontend**

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/[nome-da-funcao]`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': supabaseAnonKey || ''
  },
  body: JSON.stringify({ /* seus dados */ })
})
```

**Esperado:**
- ✅ NÃO deve aparecer erro de CORS
- ✅ POST deve chegar
- ✅ Log da Edge deve mostrar execução

---

## 🚀 **DEPLOY**

```bash
supabase functions deploy [nome-da-funcao] --no-verify-jwt
```

**Ou via Supabase Dashboard:**
1. Acesse: https://supabase.com/dashboard/project/[seu-projeto]/functions
2. Selecione a função
3. Clique em "Deploy" ou "Update"

---

## ⚠️ **CHECKLIST ANTES DE DEPLOY**

- [ ] Import usando `supabase_functions` (não `std/http/server.ts`)
- [ ] OPTIONS retorna 200 com headers CORS
- [ ] Validação de método HTTP (só POST)
- [ ] Headers CORS em todas as respostas (sucesso e erro)
- [ ] Tratamento de erros com headers CORS
- [ ] Teste de preflight manual passou

---

## 🎯 **REGRAS DE OURO**

1. **Sempre usar `supabase_functions`** (não `std/http/server.ts`)
2. **OPTIONS primeiro** (antes de qualquer processamento)
3. **Status 200** (não 204) para OPTIONS
4. **Headers CORS em todas as respostas** (sucesso e erro)
5. **Validar método HTTP** (só aceitar POST)

---

## 📋 **EDGE FUNCTIONS CORRIGIDAS**

- [x] `video-call-request-notification` ✅
- [x] `video-call-reminders` ✅
- [x] `tradevision-core` ✅
- [x] `digital-signature` ✅

---

**Documento criado por:** Sistema de Template  
**Data:** 06/02/2026  
**Status:** ✅ Template Oficial
