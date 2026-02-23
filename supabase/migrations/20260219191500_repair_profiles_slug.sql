-- Diagnostic & Repair: Ensure Professionals Exist in Profiles with correct Slug
-- Run this in Supabase SQL Editor to fix the "Professional not found" error.

DO $$
DECLARE
    v_ricardo_id uuid;
    v_faveret_id uuid;
BEGIN
    -- 1. Find Ricardo in AUTH.users (Source of Truth)
    SELECT id INTO v_ricardo_id FROM auth.users WHERE email = 'rrvalenca@gmail.com';
    
    IF v_ricardo_id IS NOT NULL THEN
        -- Upsert into public.profiles (Create if missing)
        INSERT INTO public.profiles (id, email, name, type)
        VALUES (v_ricardo_id, 'rrvalenca@gmail.com', 'Ricardo Valença', 'professional')
        ON CONFLICT (id) DO UPDATE 
        SET slug = 'ricardo-valenca', 
            email = 'rrvalenca@gmail.com', -- Ensure email is consistent
            type = 'professional';
            
        RAISE NOTICE 'Ricardo profile updated/created with slug: ricardo-valenca';
    ELSE
        RAISE WARNING 'User rrvalenca@gmail.com NOT FOUND in auth.users!';
    END IF;

    -- 2. Find Faveret in AUTH.users
    SELECT id INTO v_faveret_id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com';

    IF v_faveret_id IS NOT NULL THEN
        -- Upsert into public.profiles
        INSERT INTO public.profiles (id, email, name, type)
        VALUES (v_faveret_id, 'eduardoscfaveret@gmail.com', 'Eduardo Faveret', 'professional')
        ON CONFLICT (id) DO UPDATE 
        SET slug = 'eduardo-faveret',
            email = 'eduardoscfaveret@gmail.com',
            type = 'professional';
            
        RAISE NOTICE 'Faveret profile updated/created with slug: eduardo-faveret';
    ELSE
        RAISE WARNING 'User eduardoscfaveret@gmail.com NOT FOUND in auth.users!';
    END IF;
    
    -- 3. Double Check: List current state for debugging
    PEFORM pg_sleep(0.5); -- just a tiny pause
END $$;

-- Validation Query (Run this separately or check output)
SELECT id, email, name, slug, type FROM public.profiles WHERE slug IN ('ricardo-valenca', 'eduardo-faveret');
