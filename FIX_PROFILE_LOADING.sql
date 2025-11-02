-- Script para corrigir o carregamento de perfil
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela profiles existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se existem dados na tabela profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 3. Verificar políticas RLS da tabela profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Criar/atualizar políticas RLS se necessário
-- Política para permitir que usuários vejam seus próprios perfis
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem seus próprios perfis
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para permitir que usuários insiram seus próprios perfis
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Verificar se o usuário específico existe
-- Substitua '99286e6f-b309-41ad-8dca-cfbb80aa7666' pelo ID real do usuário
SELECT * FROM profiles WHERE id = '99286e6f-b309-41ad-8dca-cfbb80aa7666';

-- 8. Se não existir, criar o perfil (substitua os dados pelos reais)
INSERT INTO profiles (id, name, email, user_type, created_at, updated_at)
VALUES (
    '99286e6f-b309-41ad-8dca-cfbb80aa7666',
    'Usuário Admin',
    'admin@medcannlab.com',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    updated_at = NOW();

-- 9. Verificar se a inserção funcionou
SELECT * FROM profiles WHERE id = '99286e6f-b309-41ad-8dca-cfbb80aa7666';

-- 10. Testar consulta como usuário autenticado
-- Esta consulta deve funcionar se as políticas RLS estiverem corretas
SELECT id, name, email, user_type FROM profiles WHERE id = auth.uid();
