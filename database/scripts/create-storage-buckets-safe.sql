-- Criar buckets (ignora se já existirem)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas (com tratamento de erro)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Avatar is publicly accessible'
    ) THEN
        CREATE POLICY "Avatar is publicly accessible"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'avatar');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Authenticated users can upload avatar'
    ) THEN
        CREATE POLICY "Authenticated users can upload avatar"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'avatar' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Authenticated users can view documents'
    ) THEN
        CREATE POLICY "Authenticated users can view documents"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Authenticated users can upload documents'
    ) THEN
        CREATE POLICY "Authenticated users can upload documents"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Authenticated users can update documents'
    ) THEN
        CREATE POLICY "Authenticated users can update documents"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Authenticated users can delete documents'
    ) THEN
        CREATE POLICY "Authenticated users can delete documents"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
    END IF;
END $$;
