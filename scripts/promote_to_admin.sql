-- Promote phpg69@gmail.com to Admin

UPDATE public.users
SET 
    type = 'admin',
    role = 'admin',
    name = 'Ricardo Valença - Admin'
WHERE email = 'phpg69@gmail.com';

-- Verify the update
SELECT * FROM public.users WHERE email = 'phpg69@gmail.com';
