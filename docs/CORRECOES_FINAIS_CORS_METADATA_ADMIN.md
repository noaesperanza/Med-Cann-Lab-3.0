# 🔧 CORREÇÕES FINAIS: CORS, Metadata e Admin Chat

**Data:** 06/02/2026  
**Status:** ✅ Correções implementadas

---

## 📋 PROBLEMAS IDENTIFICADOS E CORRIGIDOS

### **1. ❌ CORS - Edge Function não retornava 204 OK no preflight**

**Problema:**
```
Access to fetch at '.../functions/v1/video-call-request-notification' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

**Causa:**
- Variáveis de ambiente sendo verificadas ANTES do return do OPTIONS
- Qualquer erro antes do return do OPTIONS cancela o preflight

**Correção:**
- ✅ OPTIONS retorna IMEDIATAMENTE (antes de qualquer processamento)
- ✅ Verificação de variáveis de ambiente APÓS o OPTIONS
- ✅ Status 204 (No Content) - padrão HTTP para preflight
- ✅ Headers CORS corretos

**Arquivo:** `supabase/functions/video-call-request-notification/index.ts`

---

### **2. ❌ Coluna `metadata` não existe na tabela `notifications`**

**Problema:**
```
Error creating notification: Could not find the 'metadata' column 
of 'notifications' in the schema cache
```

**Causa:**
- Tabela `notifications` não tinha coluna `metadata`
- Edge Function tentava inserir `metadata` mas coluna não existia

**Correção:**
- ✅ Script SQL criado para adicionar `metadata JSONB`
- ✅ Script também garante que `is_read` existe (alguns scripts usam `read`)
- ✅ Edge Function ajustada para usar `is_read` (não `read`)

**Arquivos:**
- `database/scripts/FIX_NOTIFICATIONS_METADATA_COLUMN.sql`
- `database/scripts/FIX_NOTIFICATIONS_TABLE_COMPLETE.sql`
- `supabase/functions/video-call-request-notification/index.ts`

---

### **3. ❌ "Nenhum admin encontrado para chamada" no Admin Chat**

**Problema:**
```
⚠️ Nenhum admin encontrado para chamada.
{otherParticipants: 0, totalParticipants: 0, ...}
```

**Causa:**
- Lógica de busca de admin para chamada não estava robusta
- Não tinha fallback suficiente quando `otherParticipants` estava vazio

**Correção:**
- ✅ Lógica melhorada com 3 níveis de fallback:
  1. `otherParticipants` (filtrado)
  2. `participants` (lista completa)
  3. `allAdmins` (lista de admins autorizados)
- ✅ Logs melhorados para debug
- ✅ Garantia de encontrar admin quando houver participantes na sala

**Arquivo:** `src/pages/AdminChat.tsx`

---

## 🚀 COMO APLICAR AS CORREÇÕES

### **1. Executar Script SQL no Supabase**

```sql
-- Execute este script no Supabase SQL Editor:
-- database/scripts/FIX_NOTIFICATIONS_TABLE_COMPLETE.sql
```

Este script:
- ✅ Adiciona coluna `metadata` (JSONB)
- ✅ Garante que `is_read` existe
- ✅ Remove constraints restritivas de tipo

### **2. Fazer Deploy da Edge Function**

```bash
# Via Supabase CLI (recomendado)
npx supabase functions deploy video-call-request-notification --project-ref itdjkfubfzmvmuxxjoae

# Ou via Dashboard:
# 1. Dashboard → Functions → video-call-request-notification
# 2. Copiar código de supabase/functions/video-call-request-notification/index.ts
# 3. Salvar e fazer deploy
```

### **3. Testar**

1. **Testar CORS:**
   - Abrir DevTools → Network
   - Tentar criar solicitação de videochamada
   - Verificar se OPTIONS retorna 204 (não mais erro de CORS)

2. **Testar Metadata:**
   - Criar solicitação de videochamada
   - Verificar se notificação é criada com `metadata`
   - Verificar se não há erro no console

3. **Testar Admin Chat:**
   - Abrir Admin Chat
   - Selecionar outro admin
   - Clicar em botão de video/audio call
   - Verificar se encontra o destinatário corretamente

---

## 📊 STATUS DAS CORREÇÕES

| Problema | Status | Arquivo Corrigido |
|----------|--------|-------------------|
| CORS preflight | ✅ Corrigido | `supabase/functions/video-call-request-notification/index.ts` |
| Coluna metadata | ✅ Script criado | `database/scripts/FIX_NOTIFICATIONS_TABLE_COMPLETE.sql` |
| Admin para chamada | ✅ Lógica melhorada | `src/pages/AdminChat.tsx` |

---

## ✅ PRÓXIMOS PASSOS

1. **Executar script SQL** no Supabase
2. **Fazer deploy da Edge Function** (via CLI ou Dashboard)
3. **Testar** todos os cenários:
   - Profissional → Paciente
   - Paciente → Profissional
   - Admin → Admin
4. **Verificar logs** no console para confirmar que não há mais erros

---

**Documento criado por:** Sistema de Correções  
**Data:** 06/02/2026  
**Status:** ✅ Pronto para deploy e teste
