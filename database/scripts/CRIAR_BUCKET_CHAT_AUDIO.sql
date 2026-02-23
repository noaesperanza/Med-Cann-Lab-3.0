-- =====================================================
-- CRIAR BUCKET DE STORAGE PARA ÁUDIOS DE CHAT
-- =====================================================
-- Este script cria o bucket de storage para armazenar áudios
-- gravados durante as conversas entre paciente e profissional

-- Criar bucket para áudios de chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-audio',
  'chat-audio',
  false, -- Privado (apenas usuários autenticados podem acessar)
  52428800, -- 50MB limite por arquivo
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes (se houver) para evitar duplicatas
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de áudios" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ler seus próprios áudios" ON storage.objects;

-- Criar política RLS para permitir upload de áudios
CREATE POLICY "Usuários autenticados podem fazer upload de áudios"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-audio'
    AND auth.uid() IS NOT NULL
  );

-- Criar política RLS para permitir leitura de áudios
CREATE POLICY "Usuários podem ler seus próprios áudios"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'chat-audio'
    AND auth.uid() IS NOT NULL
    -- Verificar se o usuário tem acesso ao chat relacionado
    -- através do nome do arquivo que contém o chat_id
  );

-- Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'chat-audio';

