-- =====================================================
-- 🔧 CORRIGIR TABELA COURSES - MEDCANLAB 3.0
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR SE A TABELA COURSES EXISTE
-- =====================================================
SELECT 
  schemaname,
  tablename,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS AUSENTES (SE NECESSÁRIO)
-- =====================================================

-- Adicionar coluna is_published se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'is_published'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Adicionar coluna is_featured se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'is_featured'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE courses ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Adicionar coluna duration se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'duration'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE courses ADD COLUMN duration INTEGER;
    END IF;
END $$;

-- Adicionar coluna difficulty se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'difficulty'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE courses ADD COLUMN difficulty VARCHAR(20) DEFAULT 'beginner';
    END IF;
END $$;

-- Adicionar coluna category se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'category'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE courses ADD COLUMN category VARCHAR(50);
    END IF;
END $$;

-- Adicionar coluna tags se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'tags'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE courses ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- 3. ADICIONAR CONSTRAINTS SE NECESSÁRIO
-- =====================================================

-- Adicionar constraint de difficulty se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'valid_difficulty'
        AND constraint_schema = 'public'
    ) THEN
        ALTER TABLE courses ADD CONSTRAINT valid_difficulty 
        CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
    END IF;
END $$;

-- 4. HABILITAR RLS SE NÃO ESTIVER HABILITADO
-- =====================================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS RLS SE NÃO EXISTIREM
-- =====================================================

-- Política para visualizar cursos publicados
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' 
        AND policyname = 'Anyone can view published courses'
        AND schemaname = 'public'
    ) THEN
        CREATE POLICY "Anyone can view published courses" ON courses
          FOR SELECT USING (is_published = true);
    END IF;
END $$;

-- 6. CRIAR ÍNDICES SE NÃO EXISTIREM
-- =====================================================

-- Índice para is_published
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);

-- Índice para is_featured
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);

-- Índice para category
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- 7. VERIFICAR ESTRUTURA FINAL
-- =====================================================
SELECT 
  schemaname,
  tablename,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. VERIFICAR POLÍTICAS RLS
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'courses'
AND schemaname = 'public';

-- Status: ✅ Tabela Courses Corrigida
-- - Colunas ausentes adicionadas
-- - Constraints aplicados
-- - RLS habilitado
-- - Políticas criadas
-- - Índices otimizados
