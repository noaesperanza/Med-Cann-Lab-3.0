-- =====================================================
-- 👨‍⚕️ VINCULAR EDUARDO FAVERET COMO PROFISSIONAL
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Vincular Eduardo Faveret (admin) como profissional
-- para que ele tenha acesso ao dashboard-eduardo
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR USUÁRIO EDUARDO FAVERET
-- =====================================================
-- NOTA: Eduardo vai se cadastrar como profissional com email hotmail
-- Por enquanto, verificamos apenas o email admin (gmail)

SELECT 
    id,
    email,
    name,
    type,
    crm,
    created_at,
    'Admin (Gmail)' AS status
FROM public.users
WHERE email = 'eduardoscfaveret@gmail.com'
    AND type IN ('admin', 'master', 'gestor')
ORDER BY created_at DESC;

-- Verificar se já existe algum registro profissional do Eduardo
SELECT 
    id,
    email,
    name,
    type,
    crm,
    created_at,
    'Profissional (Hotmail ou outro)' AS status
FROM public.users
WHERE (email LIKE '%eduardo%faveret%' OR name LIKE '%Eduardo%Faveret%')
    AND type IN ('profissional', 'professional')
ORDER BY created_at DESC;

-- =====================================================
-- 2. VERIFICAR SE JÁ EXISTE COMO PROFISSIONAL
-- =====================================================
-- NOTA: Eduardo vai se cadastrar com email hotmail como profissional
-- Este script verifica se já existe, mas não cria automaticamente

SELECT 
    id,
    email,
    name,
    type,
    'Já existe como profissional' AS status
FROM public.users
WHERE (email LIKE '%eduardo%faveret%' OR name LIKE '%Eduardo%Faveret%')
    AND type IN ('profissional', 'professional')
ORDER BY created_at DESC;

-- =====================================================
-- 3. OPÇÃO 1: CRIAR REGISTRO SEPARADO COMO PROFISSIONAL
-- =====================================================

-- Verificar se já existe registro profissional
DO $$
DECLARE
    admin_user_id UUID;
    profissional_exists BOOLEAN;
BEGIN
    -- Buscar ID do admin
    SELECT id INTO admin_user_id
    FROM public.users
    WHERE email = 'eduardoscfaveret@gmail.com'
        AND type IN ('admin', 'master', 'gestor')
    LIMIT 1;

    IF admin_user_id IS NULL THEN
        RAISE NOTICE '❌ Usuário admin não encontrado';
        RETURN;
    END IF;

    -- Verificar se já existe como profissional
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE email = 'eduardoscfaveret@gmail.com'
            AND type IN ('profissional', 'professional')
    ) INTO profissional_exists;

    IF profissional_exists THEN
        RAISE NOTICE '✅ Eduardo já existe como profissional';
    ELSE
        -- Criar registro profissional vinculado ao mesmo email
        -- NOTA: Isso criará um registro separado, mas com mesmo email
        -- O sistema usa email para redirecionamento, então funcionará
        RAISE NOTICE '⚠️ Criando registro profissional separado...';
        -- Não vamos criar aqui, vamos usar Opção 2 (adicionar flag)
    END IF;
END $$;

-- =====================================================
-- 4. OPÇÃO 2: ADICIONAR FLAG NO REGISTRO ADMIN (RECOMENDADO)
-- =====================================================

-- Adicionar coluna para flag de dashboard único (se não existir)
DO $$
BEGIN
    -- Adicionar coluna dashboard_route se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = 'dashboard_route'
    ) THEN
        ALTER TABLE public.users
        ADD COLUMN dashboard_route TEXT;
        
        RAISE NOTICE '✅ Coluna dashboard_route criada';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna dashboard_route já existe';
    END IF;
END $$;

-- Atualizar Eduardo (admin) com flag de dashboard
-- NOTA: Quando Eduardo se cadastrar como profissional (hotmail),
-- este script pode ser executado novamente para atualizar o registro profissional
UPDATE public.users
SET dashboard_route = '/app/clinica/profissional/dashboard-eduardo'
WHERE email = 'eduardoscfaveret@gmail.com'
    AND type IN ('admin', 'master', 'gestor');

-- Se já existir registro profissional do Eduardo, atualizar também
UPDATE public.users
SET dashboard_route = '/app/clinica/profissional/dashboard-eduardo'
WHERE (email LIKE '%eduardo%faveret%' OR name LIKE '%Eduardo%Faveret%')
    AND type IN ('profissional', 'professional');

-- Atualizar Ricardo com flag de dashboard
UPDATE public.users
SET dashboard_route = '/app/ricardo-valenca-dashboard'
WHERE email = 'iaianoaesperanza@gmail.com'
    AND type IN ('profissional', 'professional');

-- Verificar resultado
SELECT 
    email,
    name,
    type,
    dashboard_route,
    '✅ Dashboard configurado' AS status
FROM public.users
WHERE email IN ('eduardoscfaveret@gmail.com', 'iaianoaesperanza@gmail.com')
ORDER BY email;

-- =====================================================
-- 5. VERIFICAR VÍNCULOS DE PACIENTES COM EDUARDO
-- =====================================================

-- Verificar se há pacientes vinculados ao email do Eduardo
SELECT 
    'Pacientes vinculados via email' AS tipo,
    COUNT(*) AS total
FROM (
    SELECT DISTINCT patient_id
    FROM public.clinical_assessments ca
    INNER JOIN public.users u ON u.id = ca.doctor_id
    WHERE u.email = 'eduardoscfaveret@gmail.com'
    
    UNION
    
    SELECT DISTINCT patient_id
    FROM public.clinical_reports cr
    INNER JOIN public.users u ON u.id = COALESCE(cr.professional_id, cr.doctor_id)
    WHERE u.email = 'eduardoscfaveret@gmail.com'
    
    UNION
    
    SELECT DISTINCT patient_id
    FROM public.appointments a
    INNER JOIN public.users u ON u.id = COALESCE(a.professional_id, a.doctor_id)
    WHERE u.email = 'eduardoscfaveret@gmail.com'
) AS pacientes_eduardo;

-- =====================================================
-- 6. VERIFICAR VÍNCULOS DE PACIENTES COM RICARDO
-- =====================================================

-- Verificar se há pacientes vinculados ao email do Ricardo
SELECT 
    'Pacientes vinculados via email' AS tipo,
    COUNT(*) AS total
FROM (
    SELECT DISTINCT patient_id
    FROM public.clinical_assessments ca
    INNER JOIN public.users u ON u.id = ca.doctor_id
    WHERE u.email = 'iaianoaesperanza@gmail.com'
    
    UNION
    
    SELECT DISTINCT patient_id
    FROM public.clinical_reports cr
    INNER JOIN public.users u ON u.id = COALESCE(cr.professional_id, cr.doctor_id)
    WHERE u.email = 'iaianoaesperanza@gmail.com'
    
    UNION
    
    SELECT DISTINCT patient_id
    FROM public.appointments a
    INNER JOIN public.users u ON u.id = COALESCE(a.professional_id, a.doctor_id)
    WHERE u.email = 'iaianoaesperanza@gmail.com'
) AS pacientes_ricardo;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT '✅ Script de vinculação concluído!' AS status;
