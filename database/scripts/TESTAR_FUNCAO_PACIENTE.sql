-- =====================================================
-- TESTAR FUNÇÃO is_current_user_patient()
-- =====================================================
-- Execute este script enquanto estiver logado como paciente

-- 1. Verificar qual usuário está logado
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_from_auth,
    raw_user_meta_data->>'name' as name_from_auth
FROM auth.users
WHERE id = auth.uid();

-- 2. Verificar se esse usuário existe na tabela users
SELECT 
    id,
    email,
    name,
    type,
    CASE 
        WHEN type = 'patient' THEN '✅ É paciente'
        ELSE '❌ NÃO é paciente'
    END as status
FROM users
WHERE id = auth.uid();

-- 3. Testar a função is_current_user_patient()
SELECT 
    is_current_user_patient() as resultado_funcao,
    CASE 
        WHEN is_current_user_patient() = true THEN '✅ Função retorna TRUE (é paciente)'
        WHEN is_current_user_patient() = false THEN '❌ Função retorna FALSE (NÃO é paciente)'
        ELSE '⚠️ Função retorna NULL (erro)'
    END as interpretacao;

-- 4. Testar busca de profissionais usando a política RLS
SELECT 
    id,
    email,
    name,
    type
FROM users
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
  AND type IN ('professional', 'admin');

-- 5. Testar a função get_authorized_professionals()
SELECT * FROM get_authorized_professionals();
