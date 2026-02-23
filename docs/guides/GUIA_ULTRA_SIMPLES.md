# 🔧 CORREÇÃO ULTRA SIMPLES - Erros Supabase

## ❌ PROBLEMAS ENCONTRADOS:

### Erros Sequenciais:
1. `ERROR: column "instructor_id" does not exist`
2. `ERROR: column "status" does not exist`

### Causa:
- Referências a colunas que não existem
- Políticas RLS complexas demais
- Estrutura muito elaborada

## ✅ SOLUÇÃO ULTRA SIMPLES:

### Script Criado:
- `CORRIGIR_SUPABASE_ULTRA_SIMPLES.sql`
- Apenas tabelas básicas
- Sem políticas RLS complexas
- Sem referências problemáticas

## 🎯 TABELAS CRIADAS (MÍNIMAS):

### 1. **transactions**
```sql
- id (UUID)
- user_id (UUID)
- amount (DECIMAL)
- description (TEXT)
- created_at (TIMESTAMP)
```

### 2. **appointments**
```sql
- id (UUID)
- patient_id (UUID)
- professional_id (UUID)
- appointment_date (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)
```

### 3. **courses**
```sql
- id (UUID)
- title (TEXT)
- description (TEXT)
- instructor_name (TEXT)
- duration_hours (INTEGER)
- price (DECIMAL)
- created_at (TIMESTAMP)
```

### 4. **course_enrollments**
```sql
- id (UUID)
- user_id (UUID)
- course_id (UUID)
- enrolled_at (TIMESTAMP)
- progress_percentage (INTEGER)
```

## 🚀 EXECUÇÃO:

### 1. Acessar Supabase:
- [supabase.com](https://supabase.com)
- Projeto MedCannLab
- SQL Editor

### 2. Executar Script:
- Copiar conteúdo de `CORRIGIR_SUPABASE_ULTRA_SIMPLES.sql`
- Colar no editor SQL
- Clicar em "Run"

### 3. Resultado Esperado:
```
Tabelas criadas com sucesso!

tabela          | total
courses         | 3
transactions    | 0
appointments    | 0
course_enrollments | 0
```

## 🔒 SEGURANÇA:

### RLS Desabilitado Temporariamente:
- Foco em criar tabelas primeiro
- Políticas podem ser adicionadas depois
- Prioridade: resolver erros 400

## 📊 DADOS DE EXEMPLO:

### Cursos Inseridos:
1. **Arte da Entrevista Clínica** - Dr. Eduardo Faveret - 40h - R$ 299,90
2. **Farmacologia da Cannabis** - Dr. Farmacologista - 60h - R$ 399,90
3. **Casos Clínicos** - Dr. Clínico - 80h - R$ 499,90

## 🎯 RESULTADO ESPERADO:

### Após Execução:
- ❌ Erros 400 eliminados
- ✅ Tabelas criadas com sucesso
- ✅ Consultas básicas funcionando
- ✅ Dashboard carregando dados
- ✅ Sistema operacional

## 🔍 VERIFICAÇÃO:

### Para Confirmar:
```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('transactions', 'appointments', 'courses', 'course_enrollments');

-- Verificar dados
SELECT COUNT(*) FROM courses;
```

## 📋 PRÓXIMOS PASSOS:

### Após Sucesso:
1. ✅ Testar dashboard
2. ✅ Verificar se erros 400 sumiram
3. ✅ Adicionar políticas RLS se necessário
4. ✅ Expandir funcionalidades

---

**🎯 Execute o script ultra simples e os erros 400 serão resolvidos!**
