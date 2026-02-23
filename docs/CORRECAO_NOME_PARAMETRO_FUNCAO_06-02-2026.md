# 🔧 CORREÇÃO: Nome do Parâmetro da Função

**Data:** 06/02/2026  
**Problema:** Função usa `_user_id` mas script tentava usar `user_id`

---

## ❌ **ERRO ENCONTRADO**

```
ERROR: 42P13: cannot change name of input parameter "_user_id"
HINT: Use DROP FUNCTION is_admin_user(uuid) first.
```

**Causa:** A função `is_admin_user` já existe com parâmetro `_user_id` (com underscore). O PostgreSQL **não permite** mudar o nome do parâmetro com `CREATE OR REPLACE`.

---

## ✅ **SOLUÇÃO**

### **Usar o Nome Original do Parâmetro**

A função existente usa `_user_id` (com underscore), então devemos manter esse nome:

```sql
-- ✅ CORRETO: Usar _user_id (nome original)
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = _user_id  -- ✅ Usar _user_id aqui também
      AND type IN ('admin', 'master', 'gestor')
  );
$$;
```

---

## 📋 **SCRIPTS CORRIGIDOS**

### **1. Script de Atualização (Corrigido)**
**Arquivo:** `database/scripts/ATUALIZAR_FUNCAO_IS_ADMIN_USER_SEGURA_06-02-2026.sql`

- ✅ Usa `_user_id` (nome original)
- ✅ `CREATE OR REPLACE` funciona
- ✅ Não quebra dependências

### **2. Script de Bypass Admin (Corrigido)**
**Arquivo:** `database/scripts/ADICIONAR_BYPASS_ADMIN_RLS_06-02-2026.sql`

- ✅ Usa `_user_id` (nome original)
- ✅ Compatível com função existente

---

## 🚀 **COMO EXECUTAR**

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra: `database/scripts/ATUALIZAR_FUNCAO_IS_ADMIN_USER_SEGURA_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**

**Resultado esperado:**
- ✅ Função atualizada mantendo `_user_id`
- ✅ `SECURITY INVOKER` aplicado
- ✅ `anon` removido
- ✅ Todas as policies continuam funcionando

---

## ✅ **CONCLUSÃO**

**Problema:** Nome do parâmetro diferente  
**Solução:** Usar `_user_id` (nome original)  
**Status:** ✅ **CORRIGIDO**

---

**Documento criado por:** Sistema de Correção  
**Data:** 06/02/2026  
**Status:** ✅ Corrigido
