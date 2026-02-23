# 🚀 GUIA: Deploy Edge Function com CORS Corrigido

**Data:** 06/02/2026  
**Status:** ⚠️ **PRECISA DEPLOY**

---

## 🎯 **PROBLEMA**

O erro de CORS ainda aparece porque:
1. A Edge Function precisa ser deployada com as correções
2. O frontend precisa ser rebuildado para usar o código atualizado

---

## ✅ **SOLUÇÃO**

### **1. Deploy da Edge Function**

**Arquivo:** `supabase/functions/video-call-request-notification/index.ts`

**Comando:**
```bash
# No diretório raiz do projeto
supabase functions deploy video-call-request-notification
```

**Ou via Supabase Dashboard:**
1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/functions
2. Selecione `video-call-request-notification`
3. Clique em "Deploy" ou "Update"

---

### **2. Rebuild do Frontend**

**Comando:**
```bash
# No diretório raiz do projeto
npm run build
# ou
yarn build
```

**Ou se estiver em desenvolvimento:**
```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
# ou
yarn dev
```

---

## 🔍 **VERIFICAÇÃO**

### **Após Deploy:**

1. **Testar CORS:**
   - Abrir console do navegador
   - Tentar fazer uma videochamada
   - Verificar se não há mais erro de CORS no console

2. **Verificar Fallback:**
   - Se CORS ainda falhar, o fallback deve criar notificação silenciosamente
   - Verificar se a notificação aparece no app
   - Console deve estar limpo (sem erros)

3. **Testar Notificação:**
   - Fazer solicitação de videochamada
   - Verificar se o destinatário recebe notificação
   - Verificar se não há logs de erro no console

---

## 📋 **CHECKLIST**

- [ ] Edge Function deployada
- [ ] Frontend rebuildado
- [ ] Testado em produção
- [ ] CORS funcionando (ou fallback silencioso)
- [ ] Notificações funcionando
- [ ] Console limpo (sem erros)

---

## ⚠️ **NOTA IMPORTANTE**

**O erro de CORS pode persistir mesmo após o deploy se:**
- O Supabase não atualizou a função corretamente
- Há cache do navegador
- A origem não está na lista de permitidas

**Solução:**
- Limpar cache do navegador (Ctrl+Shift+Delete)
- Testar em aba anônima
- Verificar se a Edge Function está retornando 204 para OPTIONS

---

**Documento criado por:** Sistema de Deploy  
**Data:** 06/02/2026  
**Status:** ⚠️ Aguardando Deploy
