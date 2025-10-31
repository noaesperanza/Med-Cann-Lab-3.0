-- Script para configurar o banco de dados do Chat IA
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  medical_terms TEXT[] DEFAULT '{}',
  embeddings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de sessões de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  context_docs UUID[] DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_documents_keywords ON documents USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_documents_medical_terms ON documents USING GIN (medical_terms);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents (created_at DESC);

-- 4. Função para busca por similaridade (se você tiver extensão vector)
-- CREATE EXTENSION IF NOT EXISTS vector;
-- CREATE INDEX IF NOT EXISTS idx_documents_embeddings ON documents USING ivfflat (embeddings vector_cosine_ops);

-- 5. RLS (Row Level Security) - opcional
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de segurança (ajuste conforme necessário)
CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_sessions" ON chat_sessions FOR ALL USING (true);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger para atualizar updated_at
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Inserir documentos de exemplo (opcional)
INSERT INTO documents (title, content, summary, keywords, medical_terms) VALUES
(
  'Guia Cannabis Medicinal',
  'A cannabis medicinal tem demonstrado eficácia no tratamento de diversas condições. O CBD (canabidiol) é eficaz para epilepsia refratária, enquanto o THC (tetrahidrocanabinol) tem aplicações em dor crônica e náuseas. A dosagem deve ser individualizada conforme protocolo médico.',
  'Guia completo sobre uso terapêutico da cannabis medicinal com protocolos de dosagem.',
  ARRAY['cannabis', 'medicinal', 'terapêutico', 'CBD', 'THC'],
  ARRAY['cannabis', 'cbd', 'thc', 'epilepsia', 'dor crônica']
),
(
  'Protocolo IMRE Triaxial',
  'O Protocolo IMRE Triaxial é um sistema estruturado de avaliação clínica composto por 28 blocos. Inclui anamnese detalhada, exame físico sistematizado e avaliação psicossocial. Reduz variabilidade na avaliação e melhora a qualidade do registro médico.',
  'Protocolo de avaliação clínica com sistema IMRE de 28 blocos para documentação padronizada.',
  ARRAY['IMRE', 'avaliação', 'clínica', 'protocolo', 'triaxial'],
  ARRAY['imre', 'avaliação', 'clínica', 'anamnese', 'exame físico']
);

-- 10. Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_documents FROM documents;
