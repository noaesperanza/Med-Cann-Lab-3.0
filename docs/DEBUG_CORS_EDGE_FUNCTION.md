# 🔍 DEBUG: CORS Edge Function - Solução Alternativa

**Problema:** CORS persiste mesmo após 2 deploys  
**Data:** 06/02/2026

---

## 🔧 MUDANÇA FEITA

Alterei o status do OPTIONS de `200` para `204` (No Content), que é o padrão HTTP para preflight requests.

**Antes:**
```typescript
if (req.method === 'OPTIONS') {
  return new Response('ok', { 
    status: 200,
    headers: corsHeaders 
  })
}
```

**Depois:**
```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, { 
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400'
    }
  })
}
```

---

## 📋 PRÓXIMOS PASSOS

1. **Copie o código atualizado** de `supabase/functions/video-call-request-notification/index.ts`
2. **Cole no Dashboard** do Supabase
3. **Faça o deploy novamente**
4. **Teste** a videochamada

---

## 🔍 VERIFICAÇÕES ADICIONAIS

Se ainda não funcionar após o deploy:

### **1. Verificar Logs da Função:**
- Dashboard → Functions → `video-call-request-notification` → Logs
- Procure por erros de sintaxe ou runtime

### **2. Verificar Variáveis de Ambiente:**
- Dashboard → Functions → `video-call-request-notification` → Settings → Secrets
- Certifique-se de que `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configuradas

### **3. Testar a Função Diretamente:**
- Dashboard → Functions → `video-call-request-notification` → Invocations
- Tente invocar a função manualmente com um payload de teste

### **4. Verificar Cache do Navegador:**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Ou teste em uma aba anônima

---

## 🆘 SE AINDA NÃO FUNCIONAR

Pode ser um problema com:
1. **Configuração do Supabase** - Verificar se Edge Functions estão habilitadas
2. **Versão do Deno** - Verificar se está usando a versão correta
3. **Formato do código** - Verificar se não há caracteres especiais ou encoding incorreto

**Alternativa:** Criar a função via CLI do Supabase:
```bash
npx supabase functions deploy video-call-request-notification --project-ref itdjkfubfzmvmuxxjoae
```

---

**Documento criado por:** Sistema de Debug  
**Data:** 06/02/2026
