-- Migration: Fix Scheduling RPC and Slug Architecture
-- 1. Add slug column to profiles if missing
-- 2. Populate slug for known professionals
-- 3. Create secure RPC resolve_professional_by_slug

-- 1. Add slug column safety
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'slug') THEN
        ALTER TABLE public.profiles ADD COLUMN slug text UNIQUE;
    END IF;
END $$;

-- 2. Populate known slugs (CRITICAL for resolution)
UPDATE public.profiles
SET slug = 'ricardo-valenca'
WHERE email = 'rrvalenca@gmail.com';

UPDATE public.profiles
SET slug = 'eduardo-faveret'
WHERE email = 'eduardoscfaveret@gmail.com';

-- 3. Create the RPC Function (Idempotent)
CREATE OR REPLACE FUNCTION public.resolve_professional_by_slug(p_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- 3.1 Check profiles table first (Primary Source of Truth in V3)
  SELECT id
  INTO v_id
  FROM public.profiles
  WHERE slug = lower(p_slug)
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  -- 3.2 Legacy Fallback (Optional, but safe if names match exact slug format)
  -- useful if slug mapping hasn't propagated to profiles yet but name is unique
  -- Disabled to enforce data integrity via profiles.slug, but kept as comment for reference
  
  -- If not found, raise exception (Client handles 404)
  RAISE EXCEPTION 'Professional not found for slug: %', p_slug
  USING ERRCODE = 'P0002';
END;
$$;

-- 4. Grant Permissions
GRANT EXECUTE ON FUNCTION public.resolve_professional_by_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_professional_by_slug(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_professional_by_slug(text) TO anon; -- Needed if scheduling is public? usually authenticated only.

-- 5. Force Schema Cache Reload (Frontend trick usually, but good to document)
NOTIFY pgrst, 'reload schema';
