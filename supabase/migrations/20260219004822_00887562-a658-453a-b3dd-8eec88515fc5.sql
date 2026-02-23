
-- Sincronizar nomes e emails dos admins na tabela user_profiles
-- para o get_chat_user_profiles retornar os dados corretos
UPDATE public.user_profiles 
SET 
  name = u.name,
  email = u.email
FROM public.users u
WHERE user_profiles.user_id = u.id
  AND u.email IN ('rrvalenca@gmail.com', 'phpg69@gmail.com', 'eduardoscfaveret@gmail.com', 'cbdrcpremium@gmail.com');

-- Garantir que todos os usuários existentes tenham nome/email no user_profiles
-- (sync geral para evitar "Usuário" no chat)
UPDATE public.user_profiles 
SET 
  name = COALESCE(user_profiles.name, u.name),
  email = COALESCE(user_profiles.email, u.email)
FROM public.users u
WHERE user_profiles.user_id = u.id
  AND (user_profiles.name IS NULL OR user_profiles.email IS NULL);
