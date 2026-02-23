# 📋 GUIA: Verificação de Estrutura das Tabelas

**Data:** 06/02/2026  
**Objetivo:** Verificar estrutura REAL das tabelas antes de corrigir scripts

---

## 🚀 PASSO 1: Execute o Script Simples Primeiro

**Arquivo:** `database/scripts/VERIFICAR_ESTRUTURA_TABELAS_SIMPLES.sql`

**O que faz:**
- ✅ Mostra TODAS as colunas de cada tabela
- ✅ Verifica se colunas específicas existem
- ✅ Mostra tipos de dados
- ✅ Mostra se são nullable ou não

**Como executar:**
1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Copie o conteúdo de `VERIFICAR_ESTRUTURA_TABELAS_SIMPLES.sql`
3. Cole no SQL Editor
4. Clique em **"Run"**
5. **SALVE OS RESULTADOS** (exporte ou copie)

---

## 📊 O QUE O SCRIPT VERIFICA

### Tabelas Verificadas:
1. ✅ `chat_participants` - Todas as colunas
2. ✅ `clinical_assessments` - Todas as colunas
3. ✅ `clinical_reports` - Todas as colunas
4. ✅ `appointments` - Todas as colunas
5. ✅ `users` - Todas as colunas

### Colunas Específicas Verificadas:
- ✅ `chat_participants.created_at` - Existe ou não?
- ✅ `clinical_assessments.doctor_id` - Existe ou não?
- ✅ `clinical_assessments.professional_id` - Existe ou não?
- ✅ `clinical_reports.professional_id` - Existe ou não?
- ✅ `clinical_reports.doctor_id` - Existe ou não?
- ✅ `appointments.professional_id` - Existe ou não?
- ✅ `appointments.doctor_id` - Existe ou não?

---

## 🔧 PASSO 2: Use os Resultados para Corrigir

Após executar o script simples, você saberá:

1. **Quais colunas existem** em cada tabela
2. **Quais colunas NÃO existem** (causam erros)
3. **Tipos de dados** corretos
4. **Se são nullable** ou não

**Com essas informações, posso corrigir os scripts maiores!**

---

## ✅ CORREÇÕES JÁ APLICADAS

### Script de Diagnóstico Completo:
- ✅ Removido `cp.created_at` (coluna pode não existir)
- ✅ Usa `doctor_id` para `clinical_assessments`
- ✅ Usa `professional_id` para `clinical_reports`
- ✅ Suporta ambas as colunas quando necessário

---

## 📝 PRÓXIMOS PASSOS

1. **Execute o script simples** primeiro
2. **Compartilhe os resultados** comigo
3. **Eu corrijo os scripts maiores** baseado na estrutura real
4. **Execute os scripts corrigidos** sem erros!

---

**Documento criado por:** Sistema de Verificação  
**Data:** 06/02/2026  
**Status:** ✅ Pronto para execução
