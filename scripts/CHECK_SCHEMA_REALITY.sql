-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO DE SCHEMA (REALITY CHECK)
-- Execute no SQL Editor do Supabase para confirmar a estrutura.
-- ============================================================================

-- 1. Tira-teima: Existe a tabela 'profiles'?
SELECT 
    'public.profiles' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) as exists;

-- 2. Tira-teima: Existe a tabela 'users'?
SELECT 
    'public.users' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) as exists;

-- 3. Verificando as colunas da tabela correta (public.users)
-- Isso confirma se o campo se chama 'type' ou 'role'
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
AND column_name IN ('type', 'role', 'email', 'name');

-- 4. Amostra de dados (para ver se 'type' está populado como 'profissional')
SELECT id, email, type 
FROM public.users 
LIMIT 5;

-- 5. Verificar se Tabela Renal já existe (para evitar erro de create)
SELECT 
    'public.renal_exams' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'renal_exams'
    ) as exists;
