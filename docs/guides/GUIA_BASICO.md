# 🔧 CORREÇÃO BÁSICA - Erros Supabase

## ❌ PROBLEMA IDENTIFICADO:

### Erro Atual:
```
ERROR: column "instructor_name" of relation "courses" does not exist
LINE 46: INSERT INTO courses (id, title, description, instructor_name, duration_hours, price) VALUES
```

### Causa:
- Tabela `courses` pode não ter sido criada corretamente
- Estrutura da tabela pode estar incorreta
- Inserção de dados antes da criação da tabela

## ✅ SOLUÇÃO BÁSICA:

### Script Criado:
- `CORRIGIR_SUPABASE_BASICO.sql`
- Verificação passo a passo
- Criação segura de tabelas
- Inserção condicional de dados

## 🎯 PROCESSO PASSO A PASSO:

### 1. **Verificação Inicial**
```sql
-- Verifica se tabela courses existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'courses'
) as courses_exists;
```

### 2. **Criação Segura**
```sql
-- Cria tabela courses se não existir
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  duration_hours INTEGER,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **Verificação da Estrutura**
```sql
-- Mostra colunas da tabela courses
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses'
ORDER BY ordinal_position;
```

### 4. **Inserção Condicional**
```sql
-- Insere dados apenas se tabela estiver vazia
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM courses) = 0 THEN
    INSERT INTO courses (id, title, description, instructor_name, duration_hours, price) VALUES 
      ('550e8400-e29b-41d4-a716-446655440001', 'Arte da Entrevista Clínica', 'Fundamentos da entrevista clínica aplicada à Cannabis Medicinal', 'Dr. Eduardo Faveret', 40, 299.90),
      ('550e8400-e29b-41d4-a716-446655440002', 'Farmacologia da Cannabis', 'Estudo dos componentes ativos e mecanismos de ação', 'Dr. Farmacologista', 60, 399.90),
      ('550e8400-e29b-41d4-a716-446655440003', 'Casos Clínicos', 'Casos clínicos e protocolos terapêuticos', 'Dr. Clínico', 80, 499.90);
  END IF;
END $$;
```

## 🚀 EXECUÇÃO:

### 1. Acessar Supabase:
- [supabase.com](https://supabase.com)
- Projeto MedCannLab
- SQL Editor

### 2. Executar Script:
- Copiar conteúdo de `CORRIGIR_SUPABASE_BASICO.sql`
- Colar no editor SQL
- Clicar em "Run"

### 3. Resultado Esperado:
```
courses_exists
true

column_name      | data_type
id               | uuid
title            | text
description      | text
instructor_name  | text
duration_hours   | integer
price            | numeric
created_at       | timestamp with time zone

total_courses
3

status
Tabelas criadas com sucesso!

tabela          | total
courses         | 3
transactions    | 0
appointments    | 0
course_enrollments | 0
```

## 🔍 VERIFICAÇÃO ADICIONAL:

### Para Confirmar:
```sql
-- Verificar todas as tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('transactions', 'appointments', 'courses', 'course_enrollments');

-- Verificar dados dos cursos
SELECT id, title, instructor_name, duration_hours, price FROM courses;
```

## 🎯 RESULTADO ESPERADO:

### Após Execução:
- ❌ Erros 400 eliminados
- ✅ Tabela courses criada corretamente
- ✅ Coluna instructor_name existe
- ✅ Dados inseridos com sucesso
- ✅ Dashboard funcionando
- ✅ Sistema operacional

## 📋 PRÓXIMOS PASSOS:

### Após Sucesso:
1. ✅ Testar dashboard
2. ✅ Verificar se erros 400 sumiram
3. ✅ Testar funcionalidades de cursos
4. ✅ Adicionar políticas RLS se necessário

---

**🎯 Execute o script básico e os erros serão resolvidos definitivamente!**
