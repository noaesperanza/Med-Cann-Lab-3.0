# 🚀 GUIA PASSO A PASSO - EXECUTAR NO SUPABASE

## 📋 INSTRUÇÕES RÁPIDAS

### 1. Acessar o Supabase
1. Abra [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto **MedCannLab**

### 2. Abrir SQL Editor
1. No painel lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query**

### 3. Executar o Script
1. Copie todo o conteúdo do arquivo `EXECUTAR_SUPABASE_SIMPLES.sql`
2. Cole no editor SQL
3. Clique em **Run** (botão verde)

### 4. Verificar Resultado
O script deve retornar:
- ✅ "Tabelas criadas com sucesso!"
- ✅ Contagem de relatórios e notificações

## 🎯 O QUE SERÁ CRIADO

### Tabelas:
- `clinical_reports` - Relatórios clínicos
- `notifications` - Notificações do sistema

### Segurança:
- RLS (Row Level Security) habilitado
- Políticas para pacientes, profissionais e IA

### Funcionalidades:
- Índices para performance
- Triggers para timestamps automáticos
- Dados de exemplo para teste

## 🚨 SE DER ERRO

### Erro de Permissão:
- Verifique se você é admin do projeto
- Confirme que tem permissões de SQL

### Erro de Sintaxe:
- Verifique se copiou o script completo
- Execute linha por linha se necessário

### Erro de RLS:
- As políticas podem falhar se não houver usuários
- Isso é normal, as políticas funcionarão com usuários reais

## ✅ APÓS EXECUÇÃO

### Verificar Tabelas:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('clinical_reports', 'notifications');
```

### Verificar Dados:
```sql
SELECT * FROM clinical_reports LIMIT 5;
SELECT * FROM notifications LIMIT 5;
```

## 🎉 PRÓXIMO PASSO

Após executar com sucesso:
1. ✅ Testar o sistema no frontend
2. ✅ Fazer avaliação clínica com paciente
3. ✅ Verificar geração de relatório
4. ✅ Confirmar salvamento no dashboard

---

**📞 Em caso de dúvidas, consulte o arquivo completo `CRIAR_TABELAS_RELATORIOS_CLINICOS.sql`**
