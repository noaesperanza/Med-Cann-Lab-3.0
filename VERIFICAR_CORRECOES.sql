-- VERIFICAÇÃO DAS CORREÇÕES APLICADAS
-- Execute este script para confirmar que os tipos foram corrigidos

-- Verificar se os tipos foram aplicados corretamente
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_aplicado,
    raw_user_meta_data->>'name' as nome_usuario,
    CASE 
        WHEN raw_user_meta_data->>'type' = 'patient' THEN '✅ PACIENTE'
        WHEN raw_user_meta_data->>'type' = 'admin' THEN '✅ ADMIN'
        WHEN raw_user_meta_data->>'type' = 'professional' THEN '✅ PROFISSIONAL'
        ELSE '❌ TIPO NÃO DEFINIDO'
    END as status_tipo
FROM auth.users 
WHERE id IN (
    'df6cee2d-2697-47eb-9ae2-f4d439df711f',
    '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
    '659ed341-74ac-413e-b708-332aff3e75bf'
)
ORDER BY email;

-- Verificar todos os usuários com tipos definidos
SELECT 
    email,
    raw_user_meta_data->>'type' as tipo,
    raw_user_meta_data->>'name' as nome,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'type' IS NOT NULL
ORDER BY created_at DESC;
