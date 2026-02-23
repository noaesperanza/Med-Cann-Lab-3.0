-- SCRIPT SIMPLES PARA CRIAR USUÁRIOS DE TESTE
-- Execute este script no Supabase SQL Editor

-- 1. Atualizar usuário admin existente
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

-- 2. Criar usuário Profissional - Clínica
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

-- 3. Criar usuário Paciente - Clínica
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

-- 4. Criar usuário Aluno - Ensino
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

-- 5. Verificar usuários criados
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
WHERE email LIKE '%@medcannlab.com' OR email LIKE '%ricardo%' OR email LIKE '%rrvlenca%' OR email LIKE '%profrvalenca%'
ORDER BY raw_user_meta_data->>'type', email;
