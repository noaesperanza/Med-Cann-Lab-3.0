-- SET DR. EDUARDO TO EXEMPT (PAYMENT)
-- Email: eduardoscfaveret@gmail.com

UPDATE public.users
SET payment_status = 'exempt'
WHERE email = 'eduardoscfaveret@gmail.com';

-- Verify
SELECT name, email, type, payment_status FROM public.users WHERE email = 'eduardoscfaveret@gmail.com';
