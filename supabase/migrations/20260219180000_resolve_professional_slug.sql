-- Secure RPC to resolve professional ID by slug
-- Replaces insecure frontend filtering and RLS bypass strategies

CREATE OR REPLACE FUNCTION public.resolve_professional_by_slug(p_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres) to access auth.users
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid;
    v_target_email text;
    v_slug_clean text;
BEGIN
    -- 1. If input is already a UUID, return it directly
    IF p_slug ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN p_slug::uuid;
    END IF;

    -- 2. Check for known hardcoded slugs (Business Logic Mappings)
    -- This mirrors the frontend constants for reliability
    CASE p_slug
        WHEN 'ricardo-valenca' THEN v_target_email := 'rrvalenca@gmail.com';
        WHEN 'eduardo-faveret' THEN v_target_email := 'eduardoscfaveret@gmail.com';
        ELSE v_target_email := NULL;
    END CASE;

    -- If we have a known email, look it up directly
    IF v_target_email IS NOT NULL THEN
        SELECT id INTO v_user_id
        FROM auth.users
        WHERE email = v_target_email
        LIMIT 1;
        
        IF v_user_id IS NOT NULL THEN
            RETURN v_user_id;
        END IF;
    END IF;

    -- 3. Fuzzy search by name in Profiles (Public data)
    v_slug_clean := replace(p_slug, '-', ' ');
    
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE unaccent(name) ILIKE unaccent('%' || v_slug_clean || '%')
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;

    -- 4. Fuzzy search in Auth User Metadata (Privileged access via SECURITY DEFINER)
    -- Only performed if nothing else matches
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE (raw_user_meta_data->>'name')::text ILIKE '%' || v_slug_clean || '%'
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        RETURN v_user_id;
    END IF;

    -- 5. If nothing found, raise a proper error code
    RAISE EXCEPTION 'Professional not found for slug: %', p_slug 
    USING ERRCODE = 'P0002'; -- "no_data_found" standard SQL state
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.resolve_professional_by_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_professional_by_slug(text) TO service_role;
