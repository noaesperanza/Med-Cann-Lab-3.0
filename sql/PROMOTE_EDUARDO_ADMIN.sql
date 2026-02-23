-- PROMOTE DR. EDUARDO TO ADMIN
-- Email: eduardoscfaveret@gmail.com

-- 1. Update metadata in auth.users
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    jsonb_set(raw_user_meta_data, '{role}', '"admin"'),
    '{type}', '"admin"'
)
WHERE email = 'eduardoscfaveret@gmail.com';

-- 2. Update public.users
UPDATE public.users
SET type = 'admin'
WHERE email = 'eduardoscfaveret@gmail.com';

-- 3. Verify
SELECT email, raw_user_meta_data->>'role' as role FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com';
