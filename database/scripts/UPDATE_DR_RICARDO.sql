-- =====================================================
-- ATUALIZAR METADADOS DO DR. RICARDO VALENÇA
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Este script atualiza o email rrvalenca@gmail.com para exibir "Dr. Ricardo Valença"

UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'name', 'Dr. Ricardo Valença',
    'type', 'professional',
    'user_type', 'professional'
  ),
  updated_at = NOW()
WHERE email = 'rrvalenca@gmail.com';

-- Verificar se foi atualizado
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'type' as type,
  updated_at
FROM auth.users
WHERE email = 'rrvalenca@gmail.com';
