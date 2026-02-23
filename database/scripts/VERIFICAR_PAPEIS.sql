-- Listar contas chave para verificação de permissões
SELECT 
    email, 
    id, 
    raw_user_meta_data->>'type' as current_role,
    raw_user_meta_data->>'name' as name,
    last_sign_in_at
FROM auth.users 
WHERE email IN (
    'phpg69@gmail.com',            -- Você
    'rrvalenca@gmail.com',         -- Dr. Ricardo (Pessoal/Admin?)
    'iaianoaesperanza@gmail.com',  -- Dr. Ricardo (Profissional)
    'eduardoscfaveret@gmail.com',  -- Dr. Eduardo (Profissional/Admin?)
    'cbdrcpremium@gmail.com',      -- João? (Verificar)
    'rcpcbd@gmail.com',            -- João? (Verificar variação)
    'contato@medcannlab.com.br'    -- Possível conta admin geral
)
ORDER BY email;
