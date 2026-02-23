# 🔍 DIAGNÓSTICO COMPLETO: CORS Edge Function

**Problema:** CORS persiste após múltiplos deploys  
**Erro:** "Response to preflight request doesn't pass access control check: It does not have HTTP ok status"

---

## 🔍 CHECKLIST DE DIAGNÓSTICO

### **1. Verificar Logs da Função no Supabase**

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/functions/video-call-request-notification/logs
2. Procure por:
   - ❌ Erros de sintaxe
   - ❌ Erros de runtime
   - ❌ Timeouts
   - ✅ Requisições OPTIONS chegando

**Se não houver NENHUMA requisição OPTIONS nos logs:**
- A função pode não estar deployada corretamente
- Ou há um problema de roteamento

---

### **2. Testar a Função Manualmente**

1. Dashboard → Functions → `video-call-request-notification` → **Invocations**
2. Clique em **"Invoke Function"**
3. Use este payload de teste:
```json
{
  "requestId": "test-123",
  "requesterId": "17345b36-50de-4112-bf78-d7c5d9342cdb",
  "recipientId": "f62c3f62-1d7e-44f1-bec9-6f3c40ece391",
  "callType": "video",
  "metadata": {}
}
```

**Se a função retornar erro:**
- Verifique os logs para ver o erro específico
- Pode ser problema com variáveis de ambiente

---

### **3. Verificar Variáveis de Ambiente**

1. Dashboard → Functions → `video-call-request-notification` → **Settings** → **Secrets**
2. Certifique-se de que existem:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Se faltar alguma:**
- Adicione manualmente
- Faça deploy novamente

---

### **4. Verificar Código no Dashboard**

1. Dashboard → Functions → `video-call-request-notification` → **Code**
2. Verifique se o código está **EXATAMENTE** igual ao arquivo local
3. Procure por:
   - Caracteres especiais
   - Encoding incorreto
   - Linhas faltando

**Se o código estiver diferente:**
- Substitua completamente pelo código do arquivo local
- Faça deploy novamente

---

### **5. Verificar Status da Função**

1. Dashboard → Functions → `video-call-request-notification` → **Overview**
2. Verifique:
   - Status: Deve estar **"Active"**
   - Último deploy: Deve ser recente
   - Versão: Deve ser a mais recente

**Se status não estiver "Active":**
- Clique em **"Deploy"** novamente
- Aguarde até mudar para "Active"

---

### **6. Testar com cURL (Terminal)**

Execute no terminal:

```bash
# Testar OPTIONS (preflight)
curl -X OPTIONS \
  https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# Deve retornar status 204 e headers CORS
```

**Se retornar erro 404:**
- A função não está deployada ou o nome está errado

**Se retornar erro 500:**
- Há um erro na função (verifique logs)

**Se não retornar headers CORS:**
- O código não está sendo executado corretamente

---

### **7. Verificar Erros no Terminal (20 erros mencionados)**

Execute no terminal do projeto:

```bash
# Verificar erros de lint/TypeScript
npm run build

# Verificar erros de runtime
npm run dev
```

**Compartilhe os erros** para análise detalhada.

---

## 🆘 SOLUÇÃO ALTERNATIVA: Workaround Temporário

Se nada funcionar, podemos:

1. **Desabilitar temporariamente a notificação via Edge Function**
2. **Criar notificação diretamente no frontend** (sem Edge Function)
3. **Implementar depois quando o problema for resolvido**

---

## 📋 INFORMAÇÕES NECESSÁRIAS

Para ajudar melhor, preciso saber:

1. **Logs da função:** O que aparece quando você tenta fazer uma videochamada?
2. **Status da função:** Está "Active"?
3. **Erros no terminal:** Quais são os 20 erros?
4. **Teste manual:** A função funciona quando invocada manualmente?
5. **cURL:** O que retorna o teste com cURL?

---

**Documento criado por:** Sistema de Diagnóstico  
**Data:** 06/02/2026
