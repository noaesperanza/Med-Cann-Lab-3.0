# ✅ CHECKLIST: Diagnóstico CORS Edge Function

**Data:** 06/02/2026

---

## 🔍 PASSO A PASSO PARA DIAGNOSTICAR

### **1. Verificar Logs da Função**

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/functions/video-call-request-notification/logs
2. Procure por requisições OPTIONS
3. Se **NÃO houver nenhuma requisição OPTIONS**, a função pode não estar sendo chamada

**O que procurar:**
- ✅ Requisições OPTIONS chegando
- ❌ Erros de sintaxe
- ❌ Erros de runtime
- ❌ Timeouts

---

### **2. Verificar Status da Função**

1. Dashboard → Functions → `video-call-request-notification` → **Overview**
2. Verifique:
   - Status: **"Active"** ✅
   - Último deploy: **Recente** ✅
   - Versão: **Mais recente** ✅

**Se não estiver "Active":**
- Clique em **"Deploy"**
- Aguarde até mudar para "Active"

---

### **3. Testar Função Manualmente**

1. Dashboard → Functions → `video-call-request-notification` → **Invocations**
2. Clique em **"Invoke Function"**
3. Use este payload:
```json
{
  "requestId": "test-123",
  "requesterId": "17345b36-50de-4112-bf78-d7c5d9342cdb",
  "recipientId": "f62c3f62-1d7e-44f1-bec9-6f3c40ece391",
  "callType": "video",
  "metadata": {}
}
```

**Resultados esperados:**
- ✅ Sucesso: Função funciona, problema é apenas CORS
- ❌ Erro: Função tem problema, verifique logs

---

### **4. Verificar Variáveis de Ambiente**

1. Dashboard → Functions → `video-call-request-notification` → **Settings** → **Secrets**
2. Verifique se existem:
   - `SUPABASE_URL` ✅
   - `SUPABASE_SERVICE_ROLE_KEY` ✅

**Se faltar:**
- Adicione manualmente
- Faça deploy novamente

---

### **5. Verificar Código no Dashboard**

1. Dashboard → Functions → `video-call-request-notification` → **Code**
2. Compare com o arquivo local: `supabase/functions/video-call-request-notification/index.ts`
3. Verifique se está **EXATAMENTE igual**

**Se estiver diferente:**
- Substitua completamente
- Faça deploy novamente

---

### **6. Testar com cURL (Terminal)**

Execute no terminal:

```bash
# Testar OPTIONS
curl -X OPTIONS \
  https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

**Resultados esperados:**
- ✅ Status 204 com headers CORS: Função funciona, problema pode ser cache
- ❌ Status 404: Função não está deployada
- ❌ Status 500: Erro na função (verifique logs)
- ❌ Sem headers CORS: Código não está sendo executado

---

### **7. Verificar Erros no Terminal (20 erros)**

Execute no terminal do projeto:

```bash
# Ver erros de build
npm run build 2>&1 | head -50

# Ver erros de dev
npm run dev 2>&1 | grep -i error | head -20
```

**Compartilhe os erros** para análise.

---

## 🆘 SOLUÇÃO ALTERNATIVA

Se nada funcionar, podemos implementar um **workaround temporário**:

1. **Criar notificação diretamente no frontend** (sem Edge Function)
2. **Usar Supabase Realtime** para notificações
3. **Implementar Edge Function depois** quando o problema for resolvido

---

## 📋 INFORMAÇÕES NECESSÁRIAS

Para ajudar melhor, preciso saber:

1. ✅ **Logs da função:** O que aparece quando você tenta fazer uma videochamada?
2. ✅ **Status da função:** Está "Active"?
3. ✅ **Erros no terminal:** Quais são os 20 erros? (execute `npm run build` e compartilhe)
4. ✅ **Teste manual:** A função funciona quando invocada manualmente?
5. ✅ **cURL:** O que retorna o teste com cURL?

---

**Documento criado por:** Sistema de Diagnóstico  
**Data:** 06/02/2026
