-- ==============================================================================
-- REPARAR PERMISSÕES DE ADMINS MASTERS (METADATA - FINAL)
-- ==============================================================================
-- Aplica permissão TOTAL (God Mode) para os seguintes usuários confirmados:
-- 1. Pedro (phpg69@gmail.com)
-- 2. João (cbdrcpremium@gmail.com) -> CORRIGIDO
-- 3. Ricardo Admin (rrvalenca@gmail.com)
-- 4. Eduardo Admin (eduardoscfaveret@gmail.com)

UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  '{"type": "admin", "role": "master", "permissions": ["all"]}'::jsonb
WHERE email IN (
    'phpg69@gmail.com',
    'cbdrcpremium@gmail.com',
    'rrvalenca@gmail.com',
    'eduardoscfaveret@gmail.com'
);

-- Conferência Final
SELECT email, raw_user_meta_data->>'type' as type, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email IN (
    'phpg69@gmail.com',
    'cbdrcpremium@gmail.com',
    'rrvalenca@gmail.com',
    'eduardoscfaveret@gmail.com'
);
