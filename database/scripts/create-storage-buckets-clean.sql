INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar', 'avatar', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar');

CREATE POLICY "Authenticated users can upload avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatar' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
