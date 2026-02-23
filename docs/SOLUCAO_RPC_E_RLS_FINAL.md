# 🔧 SOLUÇÃO FINAL: RPC 400 + RLS Bloqueando

**Data:** 06/02/2026  
**Status:** ✅ Soluções implementadas

---

## 📋 PROBLEMAS IDENTIFICADOS

### **1. ❌ RPC retornando 400 Bad Request**

**Erro:**
```
POST .../rest/v1/rpc/create_video_call_notification 400 (Bad Request)
⚠️ RPC não disponível, tentando método direto
```

**Causa:**
- Função RPC não foi criada ainda (script SQL não executado)
- Ou função existe mas parâmetros estão incorretos

**Solução:**
- ✅ Melhor tratamento de erro no frontend (mostra erro real)
- ⚠️ **Precisa executar script SQL para criar função RPC**

---

### **2. ❌ RLS ainda bloqueando mesmo com política**

**Erro:**
```
Error creating notification: {code: '42501', details: null, hint: null, 
message: 'new row violates row-level security policy for table "notifications"'}
```

**Causa:**
- Múltiplas políticas INSERT podem estar conflitando
- PostgREST avalia todas as políticas e se qualquer uma falhar, bloqueia
- Política "Users can insert own notifications" pode estar sendo avaliada primeiro

**Solução:**
- ✅ Script SQL criado para remover políticas conflitantes
- ✅ Criar política única e permissiva
- ⚠️ **Precisa executar script SQL**

---

## ✅ SOLUÇÕES IMPLEMENTADAS

### **1. Tratamento de Erro Melhorado no Frontend**

**Arquivo:** `src/services/videoCallRequestService.ts`

**Mudanças:**
- Loga erro real da RPC para debug
- Detecta se função não existe (erro 400/PGRST202)
- Mensagem clara sobre qual script executar

---

### **2. Script SQL - Política RLS Única**

**Arquivo:** `database/scripts/FIX_RLS_NOTIFICATIONS_FINAL.sql`

**O que faz:**
- Remove TODAS as políticas INSERT existentes
- Cria política única e permissiva:
  - Permite inserir para si mesmo
  - Permite inserir notificações de videochamada para outros
  - Sem conflitos entre múltiplas políticas

---

### **3. Função RPC (já criada anteriormente)**

**Arquivo:** `database/scripts/CREATE_RPC_CREATE_VIDEO_CALL_NOTIFICATION.sql`

**Status:** ✅ Já existe, só precisa executar

---

## 🚀 PRÓXIMOS PASSOS (ORDEM DE EXECUÇÃO)

### **1. Executar Script SQL - Função RPC** ⚠️ **OBRIGATÓRIO**

```sql
-- Execute no Supabase SQL Editor:
-- database/scripts/CREATE_RPC_CREATE_VIDEO_CALL_NOTIFICATION.sql
```

**O que faz:**
- Cria função RPC `create_video_call_notification`
- Bypass RLS usando `SECURITY DEFINER`
- Permite criar notificações para qualquer usuário

**Tempo estimado:** 1-2 minutos

---

### **2. Executar Script SQL - Política RLS** ⚠️ **OBRIGATÓRIO**

```sql
-- Execute no Supabase SQL Editor:
-- database/scripts/FIX_RLS_NOTIFICATIONS_FINAL.sql
```

**O que faz:**
- Remove políticas INSERT conflitantes
- Cria política única e permissiva
- Permite notificações de videochamada para outros usuários

**Tempo estimado:** 1-2 minutos

---

### **3. Fazer Deploy da Edge Function** ⚠️ **OBRIGATÓRIO**

```bash
npx supabase functions deploy video-call-request-notification --project-ref itdjkfubfzmvmuxxjoae
```

**Tempo estimado:** 2-3 minutos

---

### **4. Testar** ✅ **RECOMENDADO**

**Teste 1: RPC**
1. Tentar criar solicitação de videochamada
2. Verificar logs:
   - ✅ "Notificação criada via RPC (bypass RLS) com metadata" (ideal)
   - ⚠️ "Função RPC não encontrada" (se script não foi executado)

**Teste 2: RLS**
1. Tentar criar solicitação de videochamada
2. Verificar logs:
   - ✅ "Notificação criada via fallback (frontend direto) com metadata" (se RPC não funcionar, mas RLS permitir)
   - ❌ "new row violates row-level security policy" (se RLS ainda bloquear)

**Teste 3: CORS**
1. Abrir DevTools → Network
2. Tentar criar solicitação de videochamada
3. Verificar requisição OPTIONS:
   - Status: **204** ✅ (após deploy)

---

## 📊 STATUS DAS SOLUÇÕES

| Problema | Status | Solução | Ação Necessária |
|----------|--------|---------|-----------------|
| RPC 400 | ⚠️ Aguardando | Função RPC criada | Executar script SQL |
| RLS bloqueando | ⚠️ Aguardando | Política única criada | Executar script SQL |
| CORS | ⚠️ Aguardando | Código correto | Fazer deploy Edge Function |

---

## 🎯 RESULTADO ESPERADO

Após executar os passos acima:

1. ✅ **RPC funcionando** - Notificações criadas via RPC (bypass RLS)
2. ✅ **RLS não bloqueia mais** - Política única e permissiva
3. ✅ **CORS resolvido** - OPTIONS retorna 204 após deploy
4. ✅ **Sistema robusto** - Fallback funciona mesmo se RPC falhar

---

## 💡 NOTAS IMPORTANTES

1. **Ordem importa** - Execute scripts SQL primeiro, depois deploy
2. **RPC é mais seguro** - Bypass RLS com privilégios controlados
3. **Política única evita conflitos** - Uma política permissiva é melhor que múltiplas
4. **Fallback funciona sempre** - Sistema não bloqueia mesmo se RPC não estiver disponível

---

**Documento criado por:** Sistema de Solução Final  
**Data:** 06/02/2026  
**Status:** ✅ Pronto para execução
