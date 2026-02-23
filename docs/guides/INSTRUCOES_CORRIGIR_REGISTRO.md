# 🔧 INSTRUÇÕES PARA CORRIGIR ERRO DE REGISTRO

## ❌ **PROBLEMA**
- Erro 500 "Database error saving new user" ao tentar criar conta
- O trigger `handle_new_user()` está falhando ao inserir na tabela `users`

## ✅ **SOLUÇÃO**

### **Passo 1: Executar Script SQL de Correção**

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o arquivo: `CORRIGIR_TRIGGER_RLS_FINAL.sql`

Este script irá:
- ✅ Corrigir a função `handle_new_user()` para mapear `'aluno'` → `'student'`
- ✅ Criar políticas RLS adequadas para permitir inserção via trigger
- ✅ Recriar o trigger com as configurações corretas
- ✅ Verificar se tudo está funcionando

### **Passo 2: Verificar Resultados**

Após executar o script, você verá verificações mostrando:
- ✅ Trigger ativo
- ✅ Função corrigida
- ✅ Políticas RLS criadas
- ✅ Estrutura da tabela users

### **Passo 3: Testar Registro**

1. Vá para a landing page
2. Clique no card **"Aluno"**
3. Preencha os dados:
   - Nome completo
   - Email
   - Senha
   - Confirmar senha
4. Clique em **"Criar Conta"**

O registro deve funcionar agora! ✅

---

## 📋 **ALTERAÇÕES FEITAS NO FRONTEND**

### **1. Landing.tsx**
- ✅ Card "Aluno" agora envia `'student'` em vez de `'aluno'`
- ✅ Mantida compatibilidade com `'aluno'` para dados antigos

### **2. AuthContext.tsx**
- ✅ Sistema mapeia `'aluno'` → `'student'` automaticamente
- ✅ Interface atualizada para usar `'student'`

### **3. Dashboard.tsx**
- ✅ Atualizado para reconhecer `'student'` e `'aluno'`
- ✅ Compatibilidade mantida

### **4. noaResidentAI.ts**
- ✅ Atualizado para reconhecer `'student'`
- ✅ Compatibilidade com `'aluno'` mantida

---

## 🔍 **SE AINDA NÃO FUNCIONAR**

Execute também o script de diagnóstico:
- `DIAGNOSTICAR_ERRO_REGISTRO.sql` - Para verificar a estrutura da tabela
- `VERIFICAR_RLS_USERS.sql` - Para verificar políticas RLS

---

## ⚠️ **IMPORTANTE: IA RESIDENTE**

Todas as alterações foram feitas mantendo compatibilidade com a IA residente:
- ✅ Nenhuma rota da IA residente foi alterada
- ✅ Nenhum componente da IA residente foi modificado
- ✅ Apenas o mapeamento de tipos foi atualizado (mantendo compatibilidade)

---

## 📝 **RESUMO**

O problema era que:
1. Frontend enviava `'aluno'` como tipo
2. A constraint da tabela `users` só aceita `'student'`
3. O trigger não estava mapeando `'aluno'` → `'student'`
4. RLS pode estar bloqueando a inserção

A solução:
1. ✅ Frontend agora envia `'student'` (com compatibilidade para `'aluno'`)
2. ✅ Trigger mapeia `'aluno'` → `'student'` automaticamente
3. ✅ Políticas RLS criadas para permitir inserção via trigger
4. ✅ Função `handle_new_user()` corrigida com melhor tratamento de erros

