-- =====================================================
-- TESTAR POLÍTICA DE USERS
-- =====================================================
-- Execute isso como um paciente para verificar se a política está funcionando

-- 1. Verificar o tipo do usuário atual
SELECT get_current_user_type() as current_user_type;

-- 2. Verificar o email do usuário atual
SELECT get_current_user_email() as current_user_email;

-- 3. Tentar buscar os profissionais autorizados (como paciente)
-- Esta query deve retornar os dois profissionais
SELECT id, name, email, type 
FROM users 
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
ORDER BY name;

-- Se a query acima não retornar nada, pode haver problema na política
-- Verificar a política atual
SELECT 
  policyname,
  qual
FROM pg_policies
WHERE tablename = 'users'
AND policyname = 'Pacientes podem ver profissionais autorizados';

