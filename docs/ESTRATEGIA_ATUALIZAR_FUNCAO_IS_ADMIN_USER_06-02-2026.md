# 🔧 ESTRATÉGIA: Atualizar Função is_admin_user

**Data:** 06/02/2026  
**Problema:** Função já existe com DEFAULT no parâmetro, não podemos mudar sem DROP

---

## ❌ **PROBLEMA IDENTIFICADO**

```
ERROR: 42P13: cannot remove parameter defaults from existing function
HINT: Use DROP FUNCTION is_admin_user(uuid) first.
```

**Causa:** A função `is_admin_user` já existe com `DEFAULT auth.uid()` no parâmetro. O PostgreSQL não permite:
- Mudar nome do parâmetro
- Remover DEFAULT do parâmetro
- Mudar SECURITY DEFINER para SECURITY INVOKER

**Sem fazer DROP** (que quebraria dependências).

---

## ✅ **ESTRATÉGIA CORRETA**

### **Opção 1: Apenas Corrigir Permissões (Recomendado Agora)**

**Arquivo:** `database/scripts/ATUALIZAR_APENAS_PERMISSOES_IS_ADMIN_USER_06-02-2026.sql`

**O que faz:**
- ✅ Remove `anon` do GRANT
- ✅ Garante `authenticated` no GRANT
- ✅ **NÃO mexe na função** (mantém como está)
- ✅ Não quebra dependências

**Vantagens:**
- ✅ Seguro
- ✅ Não quebra nada
- ✅ Fecha brecha de segurança (anon)

**Desvantagens:**
- ⚠️ Função continua como `SECURITY DEFINER` (se estiver assim)
- ⚠️ Não muda para `SECURITY INVOKER`

---

### **Opção 2: Verificar Estado Atual Primeiro**

**Arquivo:** `database/scripts/VERIFICAR_ESTADO_ATUAL_IS_ADMIN_USER_06-02-2026.sql`

**O que faz:**
- ✅ Mostra definição completa da função
- ✅ Mostra permissões atuais
- ✅ Mostra dependências (policies)
- ✅ Testa a função

**Use este primeiro** para ver exatamente como está!

---

## 🎯 **RECOMENDAÇÃO**

### **Passo 1: Verificar Estado Atual**

1. Execute: `VERIFICAR_ESTADO_ATUAL_IS_ADMIN_USER_06-02-2026.sql`
2. Veja:
   - Como a função está definida
   - Se é `SECURITY DEFINER` ou `SECURITY INVOKER`
   - Quais permissões tem
   - Quais policies dependem dela

### **Passo 2: Corrigir Permissões**

1. Execute: `ATUALIZAR_APENAS_PERMISSOES_IS_ADMIN_USER_06-02-2026.sql`
2. Isso remove `anon` e garante `authenticated`
3. **Não mexe na função** (seguro)

### **Passo 3: Se Precisar Mudar SECURITY DEFINER → INVOKER**

**Só fazer se realmente necessário!**

1. Criar função nova com nome diferente: `is_admin_user_v2`
2. Atualizar todas as policies para usar `is_admin_user_v2`
3. Remover função antiga

**Mas isso é trabalhoso e provavelmente desnecessário!**

---

## ✅ **CONCLUSÃO**

**Para agora:**
- ✅ Verificar estado atual
- ✅ Corrigir apenas permissões (remover anon)
- ✅ Deixar função como está

**Para depois (se necessário):**
- ⚠️ Criar função nova se precisar mudar SECURITY DEFINER
- ⚠️ Atualizar policies manualmente

---

**Documento criado por:** Sistema de Estratégia  
**Data:** 06/02/2026  
**Status:** ✅ Estratégia Definida
