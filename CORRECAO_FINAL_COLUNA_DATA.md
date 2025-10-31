# 🔧 CORREÇÃO FINAL - ERRO DE COLUNA "data"

## ❌ PROBLEMA IDENTIFICADO
```
ERROR: 42703: column "data" of relation "notifications" does not exist
LINE 102: id, type, title, message, data, user_id, user_type
```

## 🎯 CAUSA DO ERRO
A tabela `notifications` já existia no Supabase sem o campo `data`, e o `CREATE TABLE IF NOT EXISTS` não adiciona colunas novas a tabelas existentes.

## ✅ CORREÇÃO APLICADA

### 1. Remoção completa das tabelas existentes:
```sql
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS clinical_reports CASCADE;
```

### 2. Criação limpa das tabelas:
```sql
CREATE TABLE clinical_reports (...);
CREATE TABLE notifications (...);
```

### 3. Remoção do `IF NOT EXISTS`:
- **ANTES**: `CREATE TABLE IF NOT EXISTS` (não atualiza tabelas existentes)
- **DEPOIS**: `CREATE TABLE` (cria tabelas limpas)

## 🚀 SCRIPT FINAL CORRIGIDO

Use o arquivo `EXECUTAR_SUPABASE_FINAL.sql` que contém:
- ✅ Remoção completa das tabelas existentes
- ✅ Criação limpa com todos os campos
- ✅ Políticas RLS corretas
- ✅ Dados de exemplo funcionais

## 📋 INSTRUÇÕES DE EXECUÇÃO

1. **Acesse o Supabase**: [supabase.com](https://supabase.com)
2. **Abra SQL Editor**: Clique em "SQL Editor"
3. **Crie nova query**: Clique em "New Query"
4. **Cole o script final**: Use `EXECUTAR_SUPABASE_FINAL.sql`
5. **Execute**: Clique em "Run"

## ⚠️ IMPORTANTE

Este script irá **REMOVER** as tabelas existentes e recriar do zero. Isso é necessário para garantir que todos os campos estejam presentes.

## ✅ RESULTADO ESPERADO

Após executar o script final:
- ✅ Tabelas removidas e recriadas
- ✅ Todos os campos presentes (incluindo `data`)
- ✅ Políticas RLS funcionando
- ✅ Dados de exemplo inseridos
- ✅ Sistema pronto para uso

## 🔍 VERIFICAÇÃO

Para verificar se funcionou:
```sql
-- Verificar estrutura da tabela notifications
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications';

-- Verificar dados
SELECT * FROM notifications LIMIT 1;
```

---

**🎯 Use o script final e me confirme o resultado!**
