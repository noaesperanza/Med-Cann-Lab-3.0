-- Verificar usuários existentes no banco
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'type' as type,
  created_at
FROM auth.users
ORDER BY created_at DESC;
