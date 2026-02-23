-- =====================================================
-- CORRIGIR FUNÇÃO get_authorized_professionals()
-- =====================================================
-- Esta correção garante que a função funcione corretamente
-- mesmo com políticas RLS ativas

-- Recriar função get_authorized_professionals() com lógica melhorada
CREATE OR REPLACE FUNCTION get_authorized_professionals()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  current_user_type TEXT;
BEGIN
  -- Verificar tipo do usuário atual usando função SECURITY DEFINER
  -- que bypassa RLS
  SELECT type INTO current_user_type
  FROM users
  WHERE users.id = auth.uid();
  
  -- Se for paciente, retornar profissionais autorizados
  IF current_user_type = 'patient' THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.email,
      u.name,
      u.type
    FROM users u
    WHERE u.email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
      AND u.type IN ('professional', 'admin');
  END IF;
  
  -- Se não for paciente, retornar vazio
  RETURN;
END;
$$;

-- Testar a função (execute enquanto logado como escutese@gmail.com)
SELECT * FROM get_authorized_professionals();

-- Verificar se está funcionando
SELECT 
    COUNT(*) as total_profissionais,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Função funcionando corretamente'
        ELSE '❌ Função retornando vazio'
    END as status
FROM get_authorized_professionals();

-- Verificar tipo do usuário atual
SELECT 
    auth.uid() as current_user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
    (SELECT type FROM users WHERE id = auth.uid()) as current_user_type_in_users_table,
    is_current_user_patient() as is_patient_function_result;
