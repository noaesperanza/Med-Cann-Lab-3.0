# 🧹 GUIA PARA LIMPAR DADOS MOCKADOS

## 📅 **Data:** 31/12/2024
## 🎯 **Objetivo:** Remover dados de teste do sistema

---

## 🔍 **PROBLEMA IDENTIFICADO:**

### **Dados Mockados Encontrados:**
- ✅ **Dr. Ricardo Valença** aparecendo como paciente
- ✅ **KPIs com valores fixos** (1, 1, 5)
- ✅ **Mensagens de chat** com dados de exemplo

### **Causa:**
- ❌ **Dados de teste** no banco Supabase
- ❌ **Avaliações clínicas** com dados mockados
- ❌ **Mensagens de chat** com dados de exemplo

---

## 🧹 **SOLUÇÕES IMPLEMENTADAS:**

### **1. Chat Limpo:**
- ✅ **Mensagens mockadas removidas** do hook `useChatSystem`
- ✅ **Sistema iniciando** com array vazio
- ✅ **Dados reais** serão salvos conforme uso

### **2. Script SQL Criado:**
- ✅ **`LIMPAR_DADOS_TESTE.sql`** criado
- ✅ **Consultas para identificar** dados de teste
- ✅ **Comandos para remover** dados específicos

---

## 🎯 **COMO LIMPAR OS DADOS:**

### **Passo 1: Acesse o Supabase**
1. Vá para [supabase.com](https://supabase.com)
2. Acesse seu projeto
3. Vá para **SQL Editor**

### **Passo 2: Execute o Script**
1. Copie o conteúdo do arquivo `LIMPAR_DADOS_TESTE.sql`
2. Cole no SQL Editor
3. Execute as consultas de verificação primeiro

### **Passo 3: Remover Dados de Teste**
```sql
-- Verificar dados do Dr. Ricardo como paciente
SELECT 
  id,
  patient_id,
  data->>'name' as patient_name,
  data->>'cpf' as patient_cpf,
  created_at
FROM clinical_assessments 
WHERE data->>'name' = 'Dr. Ricardo Valença' 
   OR data->>'email' = 'rrvalenca@gmail.com';

-- Remover dados de teste (CUIDADO!)
DELETE FROM clinical_assessments 
WHERE data->>'name' = 'Dr. Ricardo Valença' 
   OR data->>'email' = 'rrvalenca@gmail.com';
```

### **Passo 4: Verificar Resultado**
```sql
-- Verificar dados restantes
SELECT COUNT(*) as total_assessments FROM clinical_assessments;
```

---

## 🚀 **APÓS LIMPEZA:**

### **Sistema Limpo:**
- ✅ **Chat vazio** - mensagens reais conforme uso
- ✅ **Pacientes reais** - apenas dados verdadeiros
- ✅ **KPIs dinâmicos** - baseados em dados reais
- ✅ **Sistema profissional** - pronto para uso

### **Funcionalidades Mantidas:**
- ✅ **Chat profissionais** funcionando
- ✅ **Sistema híbrido** online/offline
- ✅ **Armazenamento local** funcionando
- ✅ **Sincronização** com Supabase

---

## ⚠️ **CUIDADOS:**

### **Antes de Executar:**
1. **Faça backup** dos dados importantes
2. **Execute consultas de verificação** primeiro
3. **Confirme** que são dados de teste
4. **Execute** apenas se tiver certeza

### **Dados que Serão Removidos:**
- ❌ **Avaliações clínicas** do Dr. Ricardo como paciente
- ❌ **Dados mockados** de pacientes
- ❌ **Mensagens de chat** de exemplo

---

## 🎯 **RESULTADO ESPERADO:**

**✅ Sistema completamente limpo e profissional**
**✅ Apenas dados reais de pacientes**
**✅ KPIs baseados em dados verdadeiros**
**✅ Chat funcionando com mensagens reais**

**🚀 Execute o script SQL para limpar os dados de teste!** 🎯
