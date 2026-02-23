# 🔧 FIX: Botões de Video/Audio Call sumiram do Chat Profissional-Paciente

**Data:** 06/02/2026  
**Status:** ✅ Corrigido

---

## ❌ PROBLEMA IDENTIFICADO

**Sintoma:**
- Os botões de video call e audio call sumiram do chat entre profissional e paciente
- Os botões aparecem no AdminChat (chat entre admins)
- Os botões aparecem nos dashboards (RicardoValencaDashboard, EduardoFaveretDashboard)

**Causa:**
- Os botões só apareciam quando `activeRoomId && otherParticipants.length > 0`
- Se `otherParticipants` estivesse vazio (participantes ainda não carregados ou sala com apenas 1 participante), os botões não apareciam

---

## ✅ CORREÇÃO IMPLEMENTADA

### **1. Remover condição restritiva de `otherParticipants.length > 0`:**

**ANTES (linha 1094):**
```typescript
{activeRoomId && otherParticipants.length > 0 && (
```

**DEPOIS:**
```typescript
{activeRoomId && (
```

**Motivo:**
- Os botões devem aparecer sempre que há uma sala ativa (`activeRoomId`)
- Não devem depender de `otherParticipants` estar carregado

---

### **2. Melhorar busca de `recipientId` quando `otherParticipants` está vazio:**

**ANTES:**
```typescript
const recipientId = otherParticipants[0]?.id
if (!recipientId) return
```

**DEPOIS:**
```typescript
// Buscar recipientId: primeiro de otherParticipants, depois de patientIdForCall, depois buscar da sala
let recipientId = otherParticipants[0]?.id || patientIdForCall

// Se ainda não tiver, buscar diretamente da sala
if (!recipientId && activeRoomId) {
  try {
    const { data: roomParticipants } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('room_id', activeRoomId)
      .neq('user_id', user?.id)
      .limit(1)
    
    if (roomParticipants && roomParticipants.length > 0) {
      recipientId = roomParticipants[0].user_id
    }
  } catch (err) {
    console.warn('Erro ao buscar recipient da sala:', err)
  }
}

if (!recipientId) {
  toast.error('Erro', 'Não foi possível identificar o destinatário da chamada. Tente novamente.')
  return
}
```

**Motivo:**
- Garantir que sempre encontre o `recipientId` mesmo se `otherParticipants` estiver vazio
- Usar múltiplas estratégias de busca (otherParticipants → patientIdForCall → query direta)
- Mostrar erro amigável se não conseguir encontrar

---

## 🎯 RESULTADO ESPERADO

Após a correção:

1. ✅ **Botões sempre visíveis** - Aparecem sempre que há uma sala ativa (`activeRoomId`)
2. ✅ **Funciona mesmo sem participantes carregados** - Busca `recipientId` de múltiplas fontes
3. ✅ **Mensagem de erro clara** - Se não conseguir encontrar destinatário, mostra erro amigável

---

## 📝 NOTAS

- A condição `otherParticipants.length > 0` era muito restritiva
- O chat entre profissional e paciente deve sempre mostrar os botões quando há uma sala ativa
- A busca de `recipientId` agora é mais robusta e usa múltiplas estratégias

---

**Documento criado por:** Sistema de Correção  
**Data:** 06/02/2026  
**Versão:** 1.0
