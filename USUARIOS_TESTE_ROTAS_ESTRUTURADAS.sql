-- USUÁRIOS DE TESTE PARA ROTAS ESTRUTURADAS
-- Execute este script no Supabase SQL Editor

-- 1. Usuário Admin (já existe, mas vamos garantir que está correto)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{type}', 
        '"admin"'::jsonb
    ),
    '{name}', 
    '"Dr. Ricardo Valença"'::jsonb
)
WHERE email LIKE '%ricardo%' OR email LIKE '%rrvlenca%' OR email LIKE '%profrvalenca%';

-- 2. Usuário Profissional - Clínica
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'profissional.clinica@medcannlab.com') THEN
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
            'profissional.clinica@medcannlab.com',
            crypt('clinica123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"type": "professional", "name": "Dr. Ana Silva", "crm": "12345", "cro": "67890"}'::jsonb
        );
    ELSE
        UPDATE auth.users 
        SET raw_user_meta_data = '{"type": "professional", "name": "Dr. Ana Silva", "crm": "12345", "cro": "67890"}'::jsonb
        WHERE email = 'profissional.clinica@medcannlab.com';
    END IF;
END $$;

-- 3. Usuário Paciente - Clínica
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'paciente.clinica@medcannlab.com') THEN
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
            'paciente.clinica@medcannlab.com',
            crypt('paciente123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"type": "patient", "name": "Maria Santos", "cpf": "123.456.789-00"}'::jsonb
        );
    ELSE
        UPDATE auth.users 
        SET raw_user_meta_data = '{"type": "patient", "name": "Maria Santos", "cpf": "123.456.789-00"}'::jsonb
        WHERE email = 'paciente.clinica@medcannlab.com';
    END IF;
END $$;

-- 4. Usuário Profissional - Ensino
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'profissional.ensino@medcannlab.com') THEN
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
            'profissional.ensino@medcannlab.com',
            crypt('ensino123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"type": "professional", "name": "Dr. Carlos Mendes", "crm": "54321", "cro": "09876"}'::jsonb
        );
    ELSE
        UPDATE auth.users 
        SET raw_user_meta_data = '{"type": "professional", "name": "Dr. Carlos Mendes", "crm": "54321", "cro": "09876"}'::jsonb
        WHERE email = 'profissional.ensino@medcannlab.com';
    END IF;
END $$;

-- 5. Usuário Aluno - Ensino
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'aluno.ensino@medcannlab.com') THEN
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
            'aluno.ensino@medcannlab.com',
            crypt('aluno123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"type": "aluno", "name": "João Oliveira", "matricula": "2024001"}'::jsonb
        );
    ELSE
        UPDATE auth.users 
        SET raw_user_meta_data = '{"type": "aluno", "name": "João Oliveira", "matricula": "2024001"}'::jsonb
        WHERE email = 'aluno.ensino@medcannlab.com';
    END IF;
END $$;

-- 6. Usuário Profissional - Pesquisa
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'profissional.pesquisa@medcannlab.com') THEN
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
            'profissional.pesquisa@medcannlab.com',
            crypt('pesquisa123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"type": "professional", "name": "Dra. Fernanda Costa", "crm": "98765", "cro": "43210"}'::jsonb
        );
    ELSE
        UPDATE auth.users 
        SET raw_user_meta_data = '{"type": "professional", "name": "Dra. Fernanda Costa", "crm": "98765", "cro": "43210"}'::jsonb
        WHERE email = 'profissional.pesquisa@medcannlab.com';
    END IF;
END $$;

-- 7. Usuário Aluno - Pesquisa
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'aluno.pesquisa@medcannlab.com') THEN
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
            'aluno.pesquisa@medcannlab.com',
            crypt('pesquisa123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"type": "aluno", "name": "Pedro Almeida", "matricula": "2024002"}'::jsonb
        );
    ELSE
        UPDATE auth.users 
        SET raw_user_meta_data = '{"type": "aluno", "name": "Pedro Almeida", "matricula": "2024002"}'::jsonb
        WHERE email = 'aluno.pesquisa@medcannlab.com';
    END IF;
END $$;

-- 8. Verificar usuários criados
SELECT 
    email,
    raw_user_meta_data->>'type' as tipo,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data->>'crm' as crm,
    raw_user_meta_data->>'cro' as cro,
    raw_user_meta_data->>'matricula' as matricula,
    raw_user_meta_data->>'cpf' as cpf,
    created_at
FROM auth.users 
WHERE email LIKE '%@medcannlab.com'
ORDER BY raw_user_meta_data->>'type', email;
