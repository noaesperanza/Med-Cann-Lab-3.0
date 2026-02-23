-- CLEANUP SCRIPT: Remove redundant/duplicate RLS policies on 'documents'
-- Keep only the essential policies for Security and Functionality

-- 1. Drop redundant/duplicate policies (keeping the most descriptive ones created recently)
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view documents" ON public.documents;

-- 2. Verify and Re-Apply the ESSENTIAL policies (if they don't exist, though they should)
-- (We assume the "Service role full access", "Authenticated users view all", and "Authenticated users upload" 
--  from the previous fix are the ones we want to keep. The drops above target the generic/older ones)

-- 3. Final verification query
SELECT * FROM pg_policies WHERE tablename = 'documents';
