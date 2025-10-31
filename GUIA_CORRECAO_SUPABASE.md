# 🔧 CORREÇÃO DE ERROS SUPABASE - Deploy Vercel

## ❌ PROBLEMAS IDENTIFICADOS:

### Erros 400 no Deploy:
```
Failed to load resource: 400 (transações)
Failed to load resource: 400 (agendamentos)
```

### Causa:
- Tabelas `transactions` e `appointments` não existem
- Consultas falhando por tabelas ausentes

## ✅ SOLUÇÃO:

### Script SQL Criado:
- `CORRIGIR_ERROS_SUPABASE.sql`
- Cria todas as tabelas faltantes
- Configura políticas RLS
- Adiciona dados de exemplo

## 🎯 TABELAS CRIADAS:

### 1. **transactions**
- Pagamentos e transações financeiras
- Campos: amount, currency, type, status, description
- RLS: Usuários veem apenas suas transações

### 2. **appointments**
- Agendamentos de consultas
- Campos: patient_id, professional_id, appointment_date, status
- RLS: Pacientes veem seus agendamentos, profissionais veem os deles

### 3. **courses**
- Cursos disponíveis
- Campos: title, description, instructor_id, duration_hours, price
- RLS: Todos veem cursos ativos

### 4. **course_enrollments**
- Inscrições em cursos
- Campos: user_id, course_id, progress_percentage, status
- RLS: Usuários veem suas inscrições

## 🚀 EXECUÇÃO:

### 1. Acessar Supabase:
- [supabase.com](https://supabase.com)
- Projeto MedCannLab
- SQL Editor

### 2. Executar Script:
- Copiar conteúdo de `CORRIGIR_ERROS_SUPABASE.sql`
- Colar no editor SQL
- Clicar em "Run"

### 3. Verificar Resultado:
- ✅ "Tabelas criadas com sucesso!"
- ✅ Contagem de políticas RLS
- ✅ Registros de exemplo inseridos

## 🔒 SEGURANÇA:

### Políticas RLS Configuradas:
- **Transações**: Usuários veem apenas as suas
- **Agendamentos**: Pacientes e profissionais veem os relevantes
- **Cursos**: Todos veem cursos ativos
- **Inscrições**: Usuários veem suas próprias inscrições

### Admins:
- Acesso total a todas as tabelas
- Podem gerenciar qualquer registro

## 📊 DADOS DE EXEMPLO:

### Cursos Inseridos:
1. **Arte da Entrevista Clínica** - 40h - R$ 299,90
2. **Farmacologia da Cannabis** - 60h - R$ 399,90
3. **Casos Clínicos** - 80h - R$ 499,90

## 🎯 RESULTADO ESPERADO:

### Após Execução:
- ❌ Erros 400 eliminados
- ✅ Consultas funcionando
- ✅ Dashboard carregando dados
- ✅ Sistema financeiro operacional
- ✅ Agendamentos funcionando

## 🔍 VERIFICAÇÃO:

### Para Confirmar:
```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('transactions', 'appointments', 'courses', 'course_enrollments');

-- Verificar dados
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM transactions;
SELECT COUNT(*) FROM appointments;
```

---

**🎯 Execute o script SQL e os erros 400 do Supabase serão resolvidos!**
