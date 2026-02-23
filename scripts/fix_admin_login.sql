-- Script to Fix Admin Login (phpg69@gmail.com)

-- 1. Ensure the user exists in auth.users
-- Note: We cannot insert directly into auth.users easily without the proper extension or superuser, 
-- but we can update the password if the user exists, or insert if we are using the service_role key in a migration.
-- However, for a "fix" script to be run in the SQL Editor, we can try the following:

DO $$
DECLARE
    new_user_id uuid := '88451996-857c-4734-938b-826079968413'; -- Fixed ID for consistency if creating
    target_email text := 'phpg69@gmail.com';
    target_password text := 'p6p7p8P9!'; -- We cannot set plain text password in auth.users directly via simple SQL unless using supabase functions if available, usually we have to sign up again.
    -- BUT, if this is a local Supabase (localhost:54321), we might be able to.
    -- Assuming this is a hosted project or we want to just check status.
BEGIN
    -- This part is tricky usually. 
    -- Best approach for specific login issues:
    -- 1. Check if user exists in public.users to confirm the profile.
    
    RAISE NOTICE 'Checking user %', target_email;
    
    -- If you need to RESET the password, it's best done via the Supabase Dashboard > Authentication > Users.
    -- OR via the client API (Forgot Password).
    
    -- However, we CAN ensure the PROFILE exists and has the correct role.
    
    INSERT INTO public.users (id, email, name, type, role, created_at)
    VALUES (
        (SELECT id FROM auth.users WHERE email = target_email), -- Attempt to get ID from auth.users
        target_email,
        'Ricardo Valença - Admin',
        'admin',
        'admin',
        now()
    )
    ON CONFLICT (email) DO UPDATE
    SET 
        type = 'admin',
        role = 'admin',
        name = 'Ricardo Valença - Admin';
        
    RAISE NOTICE 'Updated public profile for %', target_email;
    
END $$;

-- If the user does NOT exist in auth.users (Access Token error / Invalid login), 
-- you MUST create it in the Supabase Dashboard or use the Sign Up page.
-- This script only fixes the PUBLIC profile (permissions).
