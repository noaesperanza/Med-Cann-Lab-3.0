-- 🔧 SCRIPT PARA CORRIGIR TIPOS DE USUÁRIO NO SISTEMA DE LOGIN
-- Este script verifica e corrige os tipos de usuário nos metadados do Supabase Auth

-- 1. VERIFICAR USUÁRIOS EXISTENTES E SEUS TIPOS
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 2. VERIFICAR ESPECIFICAMENTE OS METADADOS DE TIPO
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_from_metadata,
    raw_user_meta_data->>'user_type' as user_type_from_metadata,
    raw_user_meta_data->>'role' as role_from_metadata,
    raw_user_meta_data->>'name' as name_from_metadata
FROM auth.users 
WHERE raw_user_meta_data IS NOT NULL;

-- 3. ATUALIZAR METADADOS DO DR. RICARDO VALENÇA (se existir)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE email = 'rrvalenca@gmail.com' 
AND (raw_user_meta_data->>'type' IS NULL OR raw_user_meta_data->>'type' != 'professional');

-- 4. ATUALIZAR METADADOS DO DR. EDUARDO FAVERET (se existir)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE email = 'eduardoscfaveret@gmail.com' 
AND (raw_user_meta_data->>'type' IS NULL OR raw_user_meta_data->>'type' != 'professional');

-- 5. ATUALIZAR METADADOS DO ADMIN (se existir)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"admin"'::jsonb
)
WHERE email = 'admin@medcannlab.com' 
AND (raw_user_meta_data->>'type' IS NULL OR raw_user_meta_data->>'type' != 'admin');

-- 6. VERIFICAR RESULTADO DAS ATUALIZAÇÕES
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_after_update,
    raw_user_meta_data->>'name' as name_after_update
FROM auth.users 
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com', 'admin@medcannlab.com');

-- 7. CRIAR USUÁRIO DE TESTE PACIENTE (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'paciente.teste@medcannlab.com') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            'paciente.teste@medcannlab.com',
            crypt('paciente123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"name": "Paciente Teste", "type": "patient", "user_type": "patient"}'::jsonb
        );
        RAISE NOTICE 'Usuário paciente de teste criado com sucesso';
    ELSE
        RAISE NOTICE 'Usuário paciente de teste já existe';
    END IF;
END $$;

-- 8. CRIAR USUÁRIO DE TESTE ESTUDANTE (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'estudante.teste@medcannlab.com') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            'estudante.teste@medcannlab.com',
            crypt('estudante123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"name": "Estudante Teste", "type": "student", "user_type": "student"}'::jsonb
        );
        RAISE NOTICE 'Usuário estudante de teste criado com sucesso';
    ELSE
        RAISE NOTICE 'Usuário estudante de teste já existe';
    END IF;
END $$;

-- 9. VERIFICAR TODOS OS USUÁRIOS APÓS AS CORREÇÕES
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as user_type,
    raw_user_meta_data->>'name' as user_name,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 10. VERIFICAR SE HÁ USUÁRIOS SEM TIPO DEFINIDO
SELECT 
    id,
    email,
    raw_user_meta_data
FROM auth.users 
WHERE raw_user_meta_data->>'type' IS NULL 
   OR raw_user_meta_data->>'type' = '';

-- 📝 INSTRUÇÕES DE USO:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique os resultados de cada consulta
-- 3. Se necessário, ajuste os emails e tipos conforme sua necessidade
-- 4. Teste o login com diferentes tipos de usuário após executar o script
