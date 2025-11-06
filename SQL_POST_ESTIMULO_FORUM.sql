-- =====================================================
-- 📝 POST DE ESTÍMULO - FÓRUM DE CONSELHEIROS EM IA NA SAÚDE
-- =====================================================
-- Este script cria a tabela forum_posts se não existir
-- e insere um post de estímulo aos participantes
-- =====================================================

-- Primeiro, criar a tabela forum_posts se não existir
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password TEXT,
  views INTEGER DEFAULT 0,
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Criar política RLS (todos podem ver posts ativos)
DROP POLICY IF EXISTS "Anyone can view active forum posts" ON forum_posts;
CREATE POLICY "Anyone can view active forum posts" ON forum_posts
  FOR SELECT USING (is_active = TRUE);

-- Criar política para inserção (usuários autenticados podem criar posts)
DROP POLICY IF EXISTS "Authenticated users can create forum posts" ON forum_posts;
CREATE POLICY "Authenticated users can create forum posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_active ON forum_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned) WHERE is_pinned = TRUE;

-- Inserir post de estímulo no fórum
DO $$
DECLARE
  admin_user_id UUID;
  post_id UUID;
BEGIN
  -- Buscar um usuário admin para ser o autor do post
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email IN ('rrvalenca@gmail.com', 'iaianoaesperanza@gmail.com', 'consultoriodosvalenca@gmail.com')
  LIMIT 1;

  -- Se não encontrar admin, buscar qualquer profissional
  IF admin_user_id IS NULL THEN
    SELECT u.id INTO admin_user_id
    FROM auth.users u
    INNER JOIN public.users pu ON u.id = pu.id
    WHERE pu.type = 'admin' OR pu.type = 'professional'
    LIMIT 1;
  END IF;

  -- Se ainda não encontrar, buscar qualquer usuário
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM auth.users
    LIMIT 1;
  END IF;

  -- Se ainda não encontrar, não podemos criar o post
  IF admin_user_id IS NULL THEN
    RAISE NOTICE '⚠️ Nenhum usuário encontrado. Não é possível criar o post.';
    RETURN;
  END IF;

  -- Verificar se o post já existe (para evitar duplicatas)
  SELECT id INTO post_id
  FROM forum_posts
  WHERE title LIKE '%Aulas em Vídeo%' OR title LIKE '%Pós-Graduação em Cannabis Medicinal%'
  LIMIT 1;

  -- Se não existir, criar o post
  IF post_id IS NULL THEN
    INSERT INTO forum_posts (
      id,
      author_id,
      title,
      content,
      category,
      tags,
      is_pinned,
      is_active,
      current_participants,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_user_id,
      '🎓 Aulas em Vídeo - Pós-Graduação em Cannabis Medicinal',
      E'Olá, colegas do Fórum de Conselheiros em IA na Saúde!\n\n📚 Estamos compartilhando nossa playlist completa de aulas sobre **Cannabis Medicinal** e **Arte da Entrevista Clínica**.\n\n🎥 **Acesse nossa playlist completa:**\nhttps://www.youtube.com/embed/AGC3ZtGSPlY?si=V6fSuQYLxJRBvD-u\n\n**Conteúdo disponível:**\n✅ Pós-Graduação em Cannabis Medicinal\n✅ Metodologia Arte da Entrevista Clínica (AEC)\n✅ Casos clínicos reais\n✅ Protocolos terapêuticos\n✅ Certificação inclusa\n\n💡 **Este é um espaço para:**\n- Compartilhar experiências clínicas\n- Discutir casos complexos\n- Trocar conhecimento sobre cannabis medicinal\n- Aprender com colegas especialistas\n\n🚀 **Vamos juntos construir uma comunidade forte de conselheiros em IA na saúde!**\n\nParticipe, compartilhe e vamos crescer juntos! 🌿',
      'cannabis',
      ARRAY['Aulas', 'Vídeo', 'Cannabis Medicinal', 'Pós-Graduação', 'AEC', 'Educação'],
      TRUE, -- Post fixado
      TRUE, -- Post ativo
      1,
      NOW(),
      NOW()
    ) RETURNING id INTO post_id;

    RAISE NOTICE '✅ Post de estímulo criado com sucesso! ID: %', post_id;
  ELSE
    RAISE NOTICE 'ℹ️ Post de estímulo já existe. ID: %', post_id;
  END IF;
END $$;

-- Verificar se o post foi criado
SELECT 
  id,
  title,
  author_id,
  is_pinned,
  is_active,
  created_at
FROM forum_posts
WHERE title LIKE '%Aulas em Vídeo%' OR title LIKE '%Pós-Graduação em Cannabis Medicinal%'
ORDER BY created_at DESC
LIMIT 1;

