# 🎤 Instruções para Executar Atualização de Comandos de Voz

## 📋 Resumo das Alterações

Este script atualiza o Supabase para suportar:
1. **Agendamento de consultas por voz** - A IA pode criar agendamentos através de comandos de voz
2. **Cadastro de pacientes por voz** - A IA pode cadastrar novos pacientes através de comandos de voz

## 🔧 Alterações no Banco de Dados

### Tabela `appointments`:
- ✅ Adiciona coluna `notes` (observações do agendamento)
- ✅ Adiciona coluna `doctor_id` (alias para `professional_id` para compatibilidade)

### Tabela `users`:
- ✅ Adiciona coluna `cpf` (para cadastro de pacientes)
- ✅ Adiciona coluna `birth_date` (data de nascimento)
- ✅ Adiciona coluna `gender` (gênero)

### Índices:
- ✅ `idx_users_type` - Otimiza busca por tipo de usuário
- ✅ `idx_users_cpf` - Otimiza busca por CPF
- ✅ `idx_users_name` - Otimiza busca por nome (para agendamentos)

### Políticas RLS:
- ✅ Profissionais podem criar agendamentos
- ✅ Profissionais podem ver seus agendamentos
- ✅ Profissionais podem criar pacientes
- ✅ Profissionais podem ver pacientes

### Funções:
- ✅ `search_patient_by_name(TEXT)` - Busca otimizada de pacientes por nome

## 📝 Como Executar

1. **Acesse o Supabase Dashboard**
   - Vá para https://app.supabase.com
   - Selecione seu projeto MedCannLab 3.0

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `SUPABASE_ATUALIZACAO_COMANDOS_VOZ.sql`
   - Cole no editor SQL
   - Clique em "Run" ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verifique os Resultados**
   - O script mostrará mensagens de sucesso para cada alteração
   - Verifique se não há erros no console

## ✅ Verificação Pós-Execução

Após executar o script, verifique se:

1. **Colunas foram adicionadas:**
   ```sql
   -- Verificar colunas em appointments
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'appointments' 
   AND column_name IN ('notes', 'doctor_id');
   
   -- Verificar colunas em users
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name IN ('cpf', 'birth_date', 'gender');
   ```

2. **Índices foram criados:**
   ```sql
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename = 'users' 
   AND indexname IN ('idx_users_type', 'idx_users_cpf', 'idx_users_name');
   ```

3. **Função foi criada:**
   ```sql
   SELECT proname 
   FROM pg_proc 
   WHERE proname = 'search_patient_by_name';
   ```

## 🎯 Funcionalidades Ativadas

Após executar este script, a IA residente (Nôa Esperanza) poderá:

### Agendamento de Consultas por Voz:
- **Comando:** "Agendar consulta", "Marcar consulta", "Nova consulta"
- **Dados coletados:** Nome do paciente, data, hora, tipo, observações
- **Ação:** Cria agendamento na tabela `appointments`

### Cadastro de Pacientes por Voz:
- **Comando:** "Novo paciente", "Cadastrar paciente", "Adicionar paciente"
- **Dados coletados:** Nome, CPF, telefone, email, data de nascimento, gênero
- **Ação:** Cria novo registro na tabela `users` com `type = 'patient'`

## ⚠️ Observações Importantes

1. **Compatibilidade:** O script verifica se as colunas já existem antes de adicioná-las, então é seguro executar múltiplas vezes.

2. **RLS Policies:** As políticas de segurança foram atualizadas para permitir que profissionais criem agendamentos e pacientes.

3. **Índices:** Os índices melhoram significativamente a performance das buscas por nome e CPF.

4. **Função de Busca:** A função `search_patient_by_name` usa `SECURITY DEFINER` para garantir que profissionais possam buscar pacientes mesmo com RLS ativado.

## 🐛 Troubleshooting

Se encontrar erros:

1. **Erro de permissão:** Verifique se você está logado como admin no Supabase
2. **Erro de coluna já existe:** Isso é normal, o script verifica antes de criar
3. **Erro de RLS:** Verifique se as políticas foram criadas corretamente

## 📞 Suporte

Se tiver problemas, verifique:
- Logs do Supabase no dashboard
- Console do navegador para erros JavaScript
- Mensagens de erro do SQL Editor

---

**Data de criação:** $(date)
**Versão:** 1.0
**Status:** ✅ Pronto para execução




