-- BUSCAR PACIENTES DO DR RICARDO
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'name' as nome, 
    raw_user_meta_data->>'type' as tipo,
    last_sign_in_at
FROM auth.users 
WHERE 
    -- Busca por padrão de nome (Case Insensitive)
    raw_user_meta_data->>'name' ILIKE '%Gilda%'
    OR raw_user_meta_data->>'name' ILIKE '%Flora%'
    OR raw_user_meta_data->>'name' ILIKE '%Maria Souza%'
    OR email ILIKE '%jvbiocann%'     -- Joao Eduardo
    OR email ILIKE '%casualmusic%'   -- Pedro (Teste User)
    OR email ILIKE '%iaianoaesperana%' -- O Médico (para confirmar ID)
ORDER BY raw_user_meta_data->>'name';
