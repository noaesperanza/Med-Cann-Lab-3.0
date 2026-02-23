-- ==============================================================================
-- SECURITY FIX: RLS DELETE for user_interactions (LGPD/GDPR Compliance)
-- ==============================================================================
-- Description:
-- Adds a policy allowing users to DELETE their own rows in `user_interactions`.
-- This is critical for "Right to be Forgotten".
--
-- Table: public.user_interactions
-- Column: user_id (text) - matches auth.uid()::text
-- ==============================================================================

BEGIN;

-- 1. Ensure RLS is enabled (idempotent)
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing DELETE policy if it exists (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "user_interactions_delete_own" ON public.user_interactions;

-- 3. Create the DELETE policy
CREATE POLICY "user_interactions_delete_own"
ON public.user_interactions
FOR DELETE
TO authenticated
USING (
  -- Cast auth.uid() to text because user_interactions.user_id is text
  auth.uid()::text = user_id
)
WITH CHECK (
  auth.uid()::text = user_id
);

COMMIT;
