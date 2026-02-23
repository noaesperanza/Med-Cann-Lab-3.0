# 🔍 DEBUG: Deploy não está funcionando

**Data:** 06/02/2026  
**Problema:** Deploy feito 2x mas erro ainda persiste

---

## ❌ PROBLEMA

- Deploy feito 2 vezes
- Erro `aiResponse is not defined` ainda acontece
- Código local está correto

---

## 🔍 POSSÍVEIS CAUSAS

### **1. Cache do Supabase**

O Supabase pode estar usando cache da versão antiga.

**Solução:**
1. Dashboard → Functions → `tradevision-core`
2. Verificar se o código no Dashboard está igual ao arquivo local
3. Se diferente, copiar novamente e fazer deploy
4. Aguardar 1-2 minutos após deploy

---

### **2. Código não foi salvo antes do deploy**

O arquivo local pode não ter sido salvo antes do deploy.

**Solução:**
1. Salvar o arquivo `supabase/functions/tradevision-core/index.ts`
2. Verificar se as linhas 2167-2174 estão corretas
3. Fazer deploy novamente

---

### **3. Deploy para projeto errado**

Pode estar fazendo deploy para outro projeto.

**Solução:**
1. Verificar `project-ref` no comando:
   ```bash
   npx supabase functions deploy tradevision-core --project-ref itdjkfubfzmvmuxxjoae
   ```
2. Confirmar que é o projeto correto

---

### **4. Versão antiga ainda em cache**

O navegador ou Supabase pode estar usando cache.

**Solução:**
1. Limpar cache do navegador
2. Aguardar 2-3 minutos após deploy
3. Testar novamente

---

## ✅ VERIFICAÇÕES

### **1. Verificar código no Dashboard**

1. Dashboard → Functions → `tradevision-core`
2. Verificar linha ~2168:
   ```typescript
   let aiResponse = completion?.choices?.[0]?.message?.content || ''
   ```
3. Se estiver diferente, copiar código local e fazer deploy

---

### **2. Verificar logs após deploy**

1. Dashboard → Functions → `tradevision-core` → Logs
2. Fazer uma requisição de teste
3. Verificar se aparece o log:
   ```
   🔍 [TradeVision Debug]: aiResponse definido
   ```
4. Se não aparecer, o deploy não pegou

---

### **3. Testar diretamente no Dashboard**

1. Dashboard → Functions → `tradevision-core` → "Run"
2. Testar com payload:
   ```json
   {
     "message": "teste",
     "patientData": {
       "user": {
         "id": "test-id",
         "type": "admin"
       }
     }
   }
   ```
3. Verificar se erro ainda acontece

---

## 🚀 SOLUÇÃO RECOMENDADA

### **Passo a passo:**

1. **Salvar arquivo local:**
   - Certificar que `supabase/functions/tradevision-core/index.ts` está salvo

2. **Verificar código local (linhas 2167-2174):**
   ```typescript
   // CRÍTICO: Garantir que completion existe antes de acessar
   if (!completion || !completion.choices || !Array.isArray(completion.choices) || completion.choices.length === 0) {
       console.error('❌ [TradeVision Error]: completion inválido ou vazio', { completion })
       throw new Error('Resposta da IA inválida: completion não contém choices válidos')
   }

   // Garantir que aiResponse sempre está definido
   let aiResponse: string = completion?.choices?.[0]?.message?.content || ''
   
   // Se não houver resposta válida, usar fallback
   if (!aiResponse || typeof aiResponse !== 'string') {
       console.warn('⚠️ [TradeVision Warning]: Resposta da IA vazia ou inválida, usando fallback')
       aiResponse = 'Desculpe, não consegui processar sua mensagem no momento. Pode repetir?'
   }
   
   // Log de debug
   console.log('🔍 [TradeVision Debug]: aiResponse definido', {
       aiResponseDefined: typeof aiResponse !== 'undefined',
       aiResponseType: typeof aiResponse,
       aiResponseLength: aiResponse?.length || 0
   })
   ```

3. **Copiar TODO o código para o Dashboard:**
   - Dashboard → Functions → `tradevision-core`
   - Selecionar TODO (Ctrl+A)
   - Deletar
   - Copiar TODO o conteúdo do arquivo local
   - Colar
   - Salvar

4. **Aguardar 1-2 minutos**

5. **Testar novamente**

---

## 💡 DICA EXTRA

Se ainda não funcionar:

1. **Deletar e recriar a função:**
   - Dashboard → Functions → `tradevision-core` → Delete
   - Criar nova função com mesmo nome
   - Copiar código
   - Deploy

2. **Verificar variáveis de ambiente:**
   - Dashboard → Settings → Edge Functions → Secrets
   - Verificar se `OPENAI_API_KEY` está configurado

---

**Documento criado por:** Sistema de Debug  
**Data:** 06/02/2026  
**Status:** ⚠️ Aguardando verificação
