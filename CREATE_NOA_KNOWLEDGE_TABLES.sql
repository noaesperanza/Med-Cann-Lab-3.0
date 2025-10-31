-- =====================================================
-- 🧠 TABELAS DE MEMÓRIA E CONHECIMENTO NÔA ESPERANÇA
-- =====================================================
-- Execute este script no Supabase SQL Editor

-- 1. TABELA: MEMÓRIAS GERAIS
CREATE TABLE IF NOT EXISTS noa_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('conversation', 'article', 'case', 'lesson', 'teaching')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  context JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA: ARTIGOS QUE A IA APRENDEU
CREATE TABLE IF NOT EXISTS noa_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  author TEXT,
  summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  teaching_points TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA: CASOS CLÍNICOS
CREATE TABLE IF NOT EXISTS noa_clinical_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_initials TEXT NOT NULL,
  chief_complaint TEXT NOT NULL,
  history TEXT NOT NULL,
  findings TEXT,
  diagnosis TEXT,
  treatment TEXT,
  discussion_points TEXT[] DEFAULT '{}',
  learning_points TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA: AULAS DO CURSO
CREATE TABLE IF NOT EXISTS noa_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_title TEXT NOT NULL,
  module_title TEXT NOT NULL,
  lesson_title TEXT NOT NULL,
  content TEXT NOT NULL,
  objectives TEXT[] DEFAULT '{}',
  key_concepts TEXT[] DEFAULT '{}',
  practical_applications TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_noa_memories_type ON noa_memories(type);
CREATE INDEX IF NOT EXISTS idx_noa_memories_keywords ON noa_memories USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_noa_memories_created_at ON noa_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_noa_articles_keywords ON noa_articles USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_noa_articles_created_at ON noa_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_noa_clinical_cases_chief_complaint ON noa_clinical_cases(chief_complaint);
CREATE INDEX IF NOT EXISTS idx_noa_clinical_cases_created_at ON noa_clinical_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_noa_lessons_course ON noa_lessons(course_title);
CREATE INDEX IF NOT EXISTS idx_noa_lessons_created_at ON noa_lessons(created_at DESC);

-- 6. HABILITAR RLS (Row Level Security)
ALTER TABLE noa_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_lessons ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS - Permitir acesso a todos os usuários autenticados
CREATE POLICY "Authenticated users can access all memories" ON noa_memories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all articles" ON noa_articles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all clinical cases" ON noa_clinical_cases
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access all lessons" ON noa_lessons
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. TRIGGERS PARA ATUALIZAR updated_at
CREATE TRIGGER update_noa_memories_updated_at
    BEFORE UPDATE ON noa_memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_noa_articles_updated_at
    BEFORE UPDATE ON noa_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_noa_clinical_cases_updated_at
    BEFORE UPDATE ON noa_clinical_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_noa_lessons_updated_at
    BEFORE UPDATE ON noa_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. VERIFICAR SE AS TABELAS FORAM CRIADAS
SELECT 'Tabelas de memória Nôa Esperança criadas com sucesso!' as status;
SELECT COUNT(*) as total_memories FROM noa_memories;
SELECT COUNT(*) as total_articles FROM noa_articles;
SELECT COUNT(*) as total_cases FROM noa_clinical_cases;
SELECT COUNT(*) as total_lessons FROM noa_lessons;
