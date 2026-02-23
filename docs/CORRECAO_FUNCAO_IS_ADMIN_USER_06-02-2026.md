# 🔧 CORREÇÃO: Função is_admin_user com Dependências

**Data:** 06/02/2026  
**Problema:** Função já existe e está sendo usada por policies

---

## ❌ **ERRO ENCONTRADO**

```
ERROR: 2BP01: cannot drop function is_admin_user(uuid) 
because other objects depend on it

DETAIL: policy participants_select_room_member_or_admin on table chat_participants 
depends on function is_admin_user(uuid)
...
```

**Causa:** A função `is_admin_user` já existe e está sendo usada por várias policies. Não podemos fazer `DROP` sem quebrar as dependências.

---

## ✅ **SOLUÇÃO**

### **Opção 1: Usar CREATE OR REPLACE (Recomendado)**

**Arquivo:** `database/scripts/ATUALIZAR_FUNCAO_IS_ADMIN_USER_SEGURA_06-02-2026.sql`

**O que faz:**
- ✅ Usa `CREATE OR REPLACE FUNCTION` (não `DROP`)
- ✅ Mantém dependências intactas
- ✅ Permite mudar `SECURITY DEFINER` para `SECURITY INVOKER`
- ✅ Atualiza permissões (remove `anon`, mantém `authenticated`)

**Vantagens:**
- ✅ Não quebra dependências
- ✅ Seguro para executar
- ✅ Atualiza função sem perder policies

---

### **Opção 2: Se CREATE OR REPLACE Não Funcionar**

Se por algum motivo `CREATE OR REPLACE` não permitir mudar `SECURITY DEFINER` para `SECURITY INVOKER`, podemos:

1. **Criar função nova com nome diferente:**
   ```sql
   CREATE FUNCTION public.is_admin_user_v2(user_id UUID)
   ...
   ```

2. **Atualizar todas as policies para usar nova função**

3. **Remover função antiga**

**Mas isso é desnecessário!** `CREATE OR REPLACE` deve funcionar.

---

## 🚀 **COMO EXECUTAR**

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra: `database/scripts/ATUALIZAR_FUNCAO_IS_ADMIN_USER_SEGURA_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**

**Resultado esperado:**
- ✅ Função atualizada para `SECURITY INVOKER`
- ✅ `anon` removido do GRANT
- ✅ `authenticated` mantido no GRANT
- ✅ Todas as policies continuam funcionando

---

## 📊 **VERIFICAÇÃO**

Após executar, verifique:

```sql
-- Verificar tipo de segurança
SELECT 
    proname,
    CASE 
        WHEN prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END AS security_type
FROM pg_proc
WHERE proname = 'is_admin_user';

-- Verificar permissões
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'is_admin_user';
```

**Resultado esperado:**
- `security_type`: `SECURITY INVOKER`
- `grantee`: apenas `authenticated` (não `anon`)

---

## ✅ **CONCLUSÃO**

**Use o script seguro:** `ATUALIZAR_FUNCAO_IS_ADMIN_USER_SEGURA_06-02-2026.sql`

Este script:
- ✅ Não quebra dependências
- ✅ Atualiza função corretamente
- ✅ Corrige permissões
- ✅ Mantém todas as policies funcionando

---

**Documento criado por:** Sistema de Correção  
**Data:** 06/02/2026  
**Status:** ✅ Solução Pronta
