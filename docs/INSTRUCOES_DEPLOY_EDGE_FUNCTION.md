# 🚨 INSTRUÇÕES: Deploy da Edge Function video-call-request-notification

**PROBLEMA:** Erro de CORS bloqueando videochamadas  
**SOLUÇÃO:** Deploy da Edge Function no Supabase Dashboard

---

## ⚡ SOLUÇÃO RÁPIDA (2 minutos)

### **Opção 1: Via Dashboard (RECOMENDADO)**

1. **Acesse:**
   ```
   https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/functions
   ```

2. **Procure por:** `video-call-request-notification`

3. **Se a função EXISTE:**
   - Clique no nome da função
   - Clique em **"Deploy"** ou **"Redeploy"**
   - Aguarde ~30 segundos

4. **Se a função NÃO EXISTE:**
   - Clique em **"New Function"** (botão no topo)
   - **Nome:** `video-call-request-notification`
   - **Código:** Copie TODO o conteúdo de:
     ```
     supabase/functions/video-call-request-notification/index.ts
     ```
   - Cole no editor
   - Clique em **"Deploy"**

5. **Aguarde:** Status deve mudar para "Active" (~30 segundos)

6. **Teste:** Tente fazer uma videochamada novamente

---

## 🔍 VERIFICAÇÃO

### **Como saber se funcionou:**

✅ **Sucesso:**
- Status da função: "Active"
- Sem erro de CORS no console
- Videochamada funciona normalmente

❌ **Se ainda houver erro:**
- Verifique os logs: Dashboard → Functions → `video-call-request-notification` → Logs
- Verifique se o código foi colado corretamente
- Tente fazer deploy novamente

---

## 📋 CHECKLIST

- [ ] Acessei o Dashboard do Supabase
- [ ] Encontrei ou criei a função `video-call-request-notification`
- [ ] Fiz o deploy da função
- [ ] Status está "Active"
- [ ] Testei uma videochamada
- [ ] Não há mais erro de CORS

---

## ⚠️ IMPORTANTE

**O código da função está 100% correto!** O problema é apenas que ela precisa ser deployada.

**Não adianta:**
- ❌ Editar o arquivo local sem fazer deploy
- ❌ Esperar que funcione automaticamente
- ❌ Tentar outras soluções sem fazer o deploy

**A única solução é:**
- ✅ **Fazer o deploy no Supabase Dashboard**

---

**Tempo estimado:** 2 minutos  
**Dificuldade:** Fácil  
**Prioridade:** ALTA (bloqueia videochamadas)
