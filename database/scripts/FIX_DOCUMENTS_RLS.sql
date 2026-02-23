-- RLS FIX: Ensure 'documents' table is secure but accessible to Service Role (AI)

-- 1. Enable RLS explicitly
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Service role access" ON public.documents;
DROP POLICY IF EXISTS "Public select access" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users upload" ON public.documents;

-- 3. Create Policy: Allow SERVICE ROLE (Edge Functions) explicit full access
CREATE POLICY "Service role full access" 
ON public.documents 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Create Policy: Allow Authenticated Users to View All Documents (Library)
CREATE POLICY "Authenticated users view all" 
ON public.documents 
FOR SELECT 
TO authenticated 
USING (true);

-- 5. Create Policy: Allow Authenticated Users to Insert (Upload)
CREATE POLICY "Authenticated users upload" 
ON public.documents 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 6. Verify policy status (optional, for manual check)
SELECT * FROM pg_policies WHERE tablename = 'documents';
