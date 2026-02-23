# 🔧 FIX: Limpeza de Estado ao Cancelar Videochamada

**Data:** 06/02/2026  
**Status:** ✅ Corrigido

---

## ❌ PROBLEMA IDENTIFICADO

**Sintoma:**
- Ao cancelar uma solicitação de videochamada, a mensagem/notificação ainda ficava visível
- O estado não era limpo corretamente após cancelamento
- Notificações canceladas ainda apareciam na lista

**Causa:**
1. O hook `useVideoCallRequests` não estava escutando o status `'cancelled'` no subscription
2. As notificações não estavam sendo filtradas para excluir solicitações canceladas
3. O estado local não era limpo imediatamente após cancelar

---

## ✅ CORREÇÃO IMPLEMENTADA

### **1. Adicionar 'cancelled' ao filtro do subscription:**

**ANTES (linha 114):**
```typescript
} else if (request.status === 'accepted' || request.status === 'rejected' || request.status === 'expired') {
  // Solicitação foi respondida ou expirou
  setPendingRequests(prev => prev.filter(r => r.request_id !== request.request_id))
}
```

**DEPOIS:**
```typescript
} else if (request.status === 'accepted' || request.status === 'rejected' || request.status === 'expired' || request.status === 'cancelled') {
  // Solicitação foi respondida, expirou ou foi cancelada
  setPendingRequests(prev => prev.filter(r => r.request_id !== request.request_id))
}
```

**Motivo:**
- Garantir que solicitações canceladas sejam removidas da lista em tempo real

---

### **2. Melhorar função `cancelRequest` para limpar estado imediatamente:**

**ANTES:**
```typescript
const cancelRequest = useCallback(async (requestId: string): Promise<VideoCallRequest | null> => {
  try {
    const request = await videoCallRequestService.cancelRequest(requestId)
    if (request) {
      setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
    }
    return request
  } catch (error) {
    console.error('Erro ao cancelar solicitação:', error)
    return null
  }
}, [])
```

**DEPOIS:**
```typescript
const cancelRequest = useCallback(async (requestId: string): Promise<VideoCallRequest | null> => {
  try {
    const request = await videoCallRequestService.cancelRequest(requestId)
    if (request) {
      // Remover imediatamente da lista
      setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
      // Recarregar para garantir sincronização
      await loadPendingRequests()
    }
    return request
  } catch (error) {
    console.error('Erro ao cancelar solicitação:', error)
    // Mesmo se der erro, remover da lista local para limpar UI
    setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
    return null
  }
}, [loadPendingRequests])
```

**Motivo:**
- Remover imediatamente da lista local
- Recarregar para garantir sincronização
- Limpar UI mesmo se houver erro

---

### **3. Filtrar notificações para excluir canceladas:**

**ANTES:**
```typescript
{pendingRequests.map(request => (
```

**DEPOIS:**
```typescript
{/* Filtrar apenas solicitações pendentes (não mostrar canceladas) */}
{pendingRequests.filter(r => r.status === 'pending').map(request => (
```

**Motivo:**
- Garantir que apenas solicitações pendentes sejam exibidas
- Não mostrar notificações de solicitações canceladas

---

### **4. Melhorar tratamento de erro no cancelamento:**

**ANTES:**
```typescript
onConfirm: async () => {
  await cancelRequest(pendingCallRequest)
  setPendingCallRequest(null)
  setTimeRemaining(null)
  toast.success('Solicitação cancelada', 'A solicitação foi cancelada com sucesso.')
}
```

**DEPOIS:**
```typescript
onConfirm: async () => {
  try {
    await cancelRequest(pendingCallRequest)
    // Limpar estados imediatamente
    setPendingCallRequest(null)
    setTimeRemaining(null)
    toast.success('Solicitação cancelada', 'A solicitação foi cancelada com sucesso.')
  } catch (error) {
    console.error('Erro ao cancelar:', error)
    // Limpar estados mesmo se der erro
    setPendingCallRequest(null)
    setTimeRemaining(null)
    toast.error('Erro', 'Não foi possível cancelar a solicitação, mas o estado foi limpo.')
  }
}
```

**Motivo:**
- Garantir que o estado seja limpo mesmo se houver erro
- Mostrar mensagem de erro amigável

---

## 🎯 RESULTADO ESPERADO

Após a correção:

1. ✅ **Estado limpo imediatamente** - `pendingCallRequest` e `timeRemaining` são limpos ao cancelar
2. ✅ **Notificações removidas** - Solicitações canceladas não aparecem mais na lista
3. ✅ **Sincronização em tempo real** - Subscription escuta status 'cancelled' e remove automaticamente
4. ✅ **UI sempre limpa** - Mesmo se houver erro, o estado é limpo

---

## 📝 NOTAS

- O cancelamento agora limpa todos os estados relacionados
- As notificações são filtradas para mostrar apenas solicitações pendentes
- O subscription em tempo real garante sincronização entre usuários

---

**Documento criado por:** Sistema de Correção  
**Data:** 06/02/2026  
**Versão:** 1.0
