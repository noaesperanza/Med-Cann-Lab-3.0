-- Create table for storing ICP-Brasil signature audit trails
-- References cfm_prescriptions table

CREATE TABLE IF NOT EXISTS public.pki_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.cfm_prescriptions(id) ON DELETE CASCADE,
  signer_cpf TEXT NOT NULL,
  signature_value TEXT NOT NULL,
  certificate_thumbprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pki_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (doctors) to insert signature logs
CREATE POLICY "Authenticated users insert pki logs" 
ON public.pki_transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to view logs
CREATE POLICY "Authenticated users view pki logs" 
ON public.pki_transactions 
FOR SELECT 
TO authenticated 
USING (true);

-- Grant access to service role (for edge functions)
CREATE POLICY "Service role full access pki logs" 
ON public.pki_transactions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
