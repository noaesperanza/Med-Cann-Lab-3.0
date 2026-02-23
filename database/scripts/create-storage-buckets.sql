-- Script para criar os buckets de Storage no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar bucket 'avatar' para imagens do avatar da IA
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket 'documents' para documentos da biblioteca
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para o bucket 'avatar'
-- Permitir leitura pública
CREATE POLICY "Avatar is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar');

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatar' AND auth.role() = 'authenticated');

-- Políticas de acesso para o bucket 'documents'
-- Permitir leitura para usuários autenticados
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
