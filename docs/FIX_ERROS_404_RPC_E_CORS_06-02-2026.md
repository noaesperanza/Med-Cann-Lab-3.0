# 🔧 FIX: Erros 404 RPC e CORS - 06/02/2026

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. **Erro 404: `get_chat_participants` não encontrado**
```
Failed to load resource: the server responded with a status of 404 ()
GET /rest/v1/rpc/get_chat_participants
```

**Causa:** A função RPC `get_chat_participants_for_room` não existe no banco de dados.

**Solução:** Executar o script SQL para criar a função.

---

### 2. **Erro CORS: `video-call-request-notification`**
```
Access to fetch at '.../functions/v1/video-call-request-notification' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Causa:** Edge Function não está deployada ou está desatualizada.

**Solução:** Redeployar a Edge Function no Supabase Dashboard.

---

## ✅ SOLUÇÕES

### **Solução 1: Criar Função RPC**

Execute no **Supabase SQL Editor**:

```sql
-- Arquivo: database/scripts/CREATE_RPC_GET_CHAT_PARTICIPANTS_FOR_ROOM.sql
```

**Ou copie e cole:**

```sql
CREATE OR REPLACE FUNCTION public.get_chat_participants_for_room(p_room_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.name, au.raw_user_meta_data->>'name', au.email)::text as name,
    COALESCE(u.email, au.email)::text as email,
    cp.role::text
  FROM public.chat_participants cp
  INNER JOIN auth.users au ON au.id = cp.user_id
  LEFT JOIN public.users u ON u.id = cp.user_id
  WHERE cp.room_id = p_room_id
  ORDER BY cp.role, u.name NULLS LAST, au.email;
END;
$$;
```

---

### **Solução 2: Redeployar Edge Function**

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/functions
2. Encontre: `video-call-request-notification`
3. Clique: **"Deploy"** ou **"Redeploy"**
4. Aguarde: ~30 segundos
5. Teste: Tente fazer uma videochamada novamente

---

## 📋 CHECKLIST

- [ ] Executar `CREATE_RPC_GET_CHAT_PARTICIPANTS_FOR_ROOM.sql` no Supabase
- [ ] Redeployar `video-call-request-notification` no Dashboard
- [ ] Testar Admin Chat (verificar se participantes carregam)
- [ ] Testar videochamada (verificar se notificação é enviada)

---

## 🔍 VERIFICAÇÃO

Após executar as soluções:

1. **Verificar RPC:**
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname = 'get_chat_participants_for_room';
   ```
   Deve retornar 1 linha.

2. **Verificar Edge Function:**
   - Dashboard → Edge Functions → `video-call-request-notification`
   - Status deve ser "Active"
   - Último deploy deve ser recente

---

**Documento criado por:** Sistema de Diagnóstico  
**Data:** 06/02/2026
