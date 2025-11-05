-- =====================================================
-- CRIAR USUÁRIO ALUNO DE TESTE
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Email: aluno.teste@medcannlab.com
-- Senha: aluno123

-- Criar usuário Aluno
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'aluno.teste@medcannlab.com') THEN
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
            'aluno.teste@medcannlab.com',
            crypt('aluno123', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"type": "aluno", "name": "Aluno Teste", "matricula": "2024001"}'::jsonb
        );
    ELSE
        UPDATE auth.users 
        SET raw_user_meta_data = '{"type": "aluno", "name": "Aluno Teste", "matricula": "2024001"}'::jsonb
        WHERE email = 'aluno.teste@medcannlab.com';
    END IF;
END $$;
