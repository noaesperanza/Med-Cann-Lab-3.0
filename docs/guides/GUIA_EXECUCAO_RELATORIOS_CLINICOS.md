# 🚀 GUIA DE EXECUÇÃO - SISTEMA DE RELATÓRIOS CLÍNICOS

## 📋 RESUMO
Este guia orienta a execução do script SQL para criar o sistema completo de relatórios clínicos no Supabase, incluindo:
- Tabelas para relatórios clínicos e notificações
- Políticas de segurança (RLS)
- Índices para performance
- Dados de exemplo

## 🎯 OBJETIVOS
1. ✅ Criar tabelas necessárias para o sistema de relatórios
2. ✅ Implementar segurança com Row Level Security (RLS)
3. ✅ Configurar notificações automáticas
4. ✅ Testar o sistema completo

## 📁 ARQUIVOS NECESSÁRIOS
- `CRIAR_TABELAS_RELATORIOS_CLINICOS.sql` - Script principal

## 🔧 EXECUÇÃO NO SUPABASE

### Passo 1: Acessar o Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto MedCannLab

### Passo 2: Executar o Script SQL
1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `CRIAR_TABELAS_RELATORIOS_CLINICOS.sql`
4. Cole no editor SQL
5. Clique em **Run** para executar

### Passo 3: Verificar a Execução
O script deve retornar:
- ✅ Tabelas criadas com sucesso
- ✅ Políticas RLS configuradas
- ✅ Índices criados
- ✅ Dados de exemplo inseridos

## 🧪 TESTE DO SISTEMA

### Teste 1: Verificar Tabelas
```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('clinical_reports', 'notifications');
```

### Teste 2: Verificar Políticas RLS
```sql
-- Verificar políticas de segurança
SELECT policyname, tablename FROM pg_policies 
WHERE tablename IN ('clinical_reports', 'notifications');
```

### Teste 3: Verificar Dados de Exemplo
```sql
-- Verificar relatório de exemplo
SELECT id, patient_name, report_type, generated_by 
FROM clinical_reports 
WHERE id = 'example_report_001';

-- Verificar notificação de exemplo
SELECT id, title, message, user_type 
FROM notifications 
WHERE id = 'example_notification_001';
```

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 1. Sistema de Relatórios Clínicos
- **Tabela**: `clinical_reports`
- **Campos**: ID, paciente, tipo, protocolo, conteúdo, gerado por, status
- **Segurança**: RLS configurado para pacientes e profissionais

### 2. Sistema de Notificações
- **Tabela**: `notifications`
- **Campos**: ID, tipo, título, mensagem, dados, usuário, lida
- **Segurança**: RLS configurado para usuários

### 3. Políticas de Segurança (RLS)
- **Pacientes**: Podem ver apenas seus próprios relatórios
- **Profissionais**: Podem ver todos os relatórios
- **IA**: Pode inserir relatórios automaticamente

### 4. Performance
- **Índices**: Criados para consultas frequentes
- **Triggers**: Atualização automática de timestamps

## 🔄 FLUXO COMPLETO

### 1. Avaliação Clínica Inicial
1. Paciente clica no card "Primeira Avaliação Clínica"
2. IA residente abre com prompt IMRE
3. Paciente responde às perguntas da IA
4. IA detecta conclusão da avaliação
5. Relatório é gerado automaticamente
6. Relatório é salvo no dashboard do paciente
7. Notificação é enviada para profissional/admin

### 2. Visualização de Relatórios
1. Paciente acessa "Meus Relatórios" no dashboard
2. Sistema carrega relatórios do banco de dados
3. Relatórios são exibidos com informações completas
4. Paciente pode revisar e compartilhar

### 3. Notificações
1. Sistema gera notificação quando relatório é criado
2. Profissional/admin recebe notificação
3. Notificação pode ser marcada como lida
4. Histórico de notificações é mantido

## 🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema 1: Erro de Permissão
**Erro**: `permission denied for table clinical_reports`
**Solução**: Verificar se o usuário tem permissões adequadas no Supabase

### Problema 2: Política RLS Não Funciona
**Erro**: Usuário não consegue ver seus relatórios
**Solução**: Verificar se `auth.uid()` está retornando o ID correto

### Problema 3: Índices Não Criados
**Erro**: Consultas lentas
**Solução**: Executar novamente a parte de criação de índices

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Script SQL executado com sucesso
- [ ] Tabelas `clinical_reports` e `notifications` criadas
- [ ] Políticas RLS configuradas
- [ ] Índices criados
- [ ] Dados de exemplo inseridos
- [ ] Testes de consulta funcionando
- [ ] Sistema de relatórios operacional

## 🎉 PRÓXIMOS PASSOS

Após a execução bem-sucedida:
1. ✅ Testar o sistema completo no frontend
2. ✅ Verificar geração de relatórios pela IA
3. ✅ Confirmar salvamento no dashboard do paciente
4. ✅ Validar notificações para profissionais
5. ✅ Documentar funcionalidades implementadas

## 📞 SUPORTE

Em caso de problemas:
1. Verificar logs do Supabase
2. Consultar documentação do RLS
3. Testar consultas SQL individualmente
4. Verificar permissões de usuário

---

**🎯 Sistema de Relatórios Clínicos - MedCannLab 3.0**
**Rota Mais Importante: Avaliação Clínica Inicial com IA Resident**
