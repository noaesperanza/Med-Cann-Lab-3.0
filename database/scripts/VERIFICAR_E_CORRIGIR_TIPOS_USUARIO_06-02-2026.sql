-- =====================================================
-- 🔍 VERIFICAR E CORRIGIR TIPOS DE USUÁRIO
-- =====================================================
-- Data: 06/02/2026
-- Problema: 0 pacientes cadastrados (pode ser problema de tipo)
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR TODOS OS TIPOS DE USUÁRIO
-- =====================================================

SELECT 
    type,
    COUNT(*) AS count,
    STRING_AGG(email, ', ' ORDER BY email) AS emails
FROM public.users
GROUP BY type
ORDER BY count DESC;

-- =====================================================
-- 2. VERIFICAR USUÁRIOS SEM TIPO OU COM TIPO INVÁLIDO
-- =====================================================

SELECT 
    id,
    email,
    name,
    type,
    CASE 
        WHEN type IS NULL THEN '❌ SEM TIPO'
        WHEN type NOT IN ('admin', 'master', 'gestor', 'profissional', 'professional', 'paciente', 'patient', 'aluno', 'student') THEN '⚠️ TIPO INVÁLIDO'
        ELSE '✅ OK'
    END AS status
FROM public.users
WHERE type IS NULL 
    OR type NOT IN ('admin', 'master', 'gestor', 'profissional', 'professional', 'paciente', 'patient', 'aluno', 'student')
ORDER BY type NULLS FIRST;

-- =====================================================
-- 3. VERIFICAR SE HÁ PACIENTES COM TIPO DIFERENTE
-- =====================================================

-- Verificar se há pacientes com type = 'patient' (inglês)
SELECT 
    id,
    email,
    name,
    type,
    'Paciente com tipo em inglês' AS issue
FROM public.users
WHERE type = 'patient'
ORDER BY email;

-- Verificar se há profissionais com type = 'professional' (inglês)
SELECT 
    id,
    email,
    name,
    type,
    'Profissional com tipo em inglês' AS issue
FROM public.users
WHERE type = 'professional'
ORDER BY email;

-- Verificar se há alunos com type = 'student' (inglês)
SELECT 
    id,
    email,
    name,
    type,
    'Aluno com tipo em inglês' AS issue
FROM public.users
WHERE type = 'student'
ORDER BY email;

-- =====================================================
-- 4. CORRIGIR CONSTRAINT PRIMEIRO (IMPORTANTE!)
-- =====================================================

-- ⚠️ ATENÇÃO: Execute primeiro o script CORRIGIR_CONSTRAINT_USERS_E_EPILEPSY_06-02-2026.sql
-- para corrigir a constraint CHECK antes de atualizar os tipos!

-- Remover constraint antiga (se existir)
DO $$
BEGIN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_type_check;
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_type_check_old;
    RAISE NOTICE '✅ Constraints antigas removidas (se existiam)';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ℹ️ Nenhuma constraint antiga encontrada ou já foi removida';
END $$;

-- Criar nova constraint que aceita português E inglês
ALTER TABLE public.users 
ADD CONSTRAINT users_type_check 
CHECK (type IN (
    -- Valores em português
    'paciente', 'profissional', 'aluno', 'admin', 'master', 'gestor',
    -- Valores em inglês (para compatibilidade)
    'patient', 'professional', 'student', 'admin'
));

-- =====================================================
-- 5. CORRIGIR TIPOS DE USUÁRIO (PADRONIZAR)
-- =====================================================

-- Padronizar: patient → paciente
UPDATE public.users
SET type = 'paciente'
WHERE type = 'patient';

-- Padronizar: professional → profissional
UPDATE public.users
SET type = 'profissional'
WHERE type = 'professional';

-- Padronizar: student → aluno
UPDATE public.users
SET type = 'aluno'
WHERE type = 'student';

-- =====================================================
-- 5. VERIFICAR RESULTADO APÓS CORREÇÃO
-- =====================================================

SELECT 
    type,
    COUNT(*) AS count,
    STRING_AGG(email, ', ' ORDER BY email) AS emails
FROM public.users
GROUP BY type
ORDER BY count DESC;

-- =====================================================
-- 6. VERIFICAR VÍNCULOS DE PACIENTES
-- =====================================================

-- Pacientes e seus profissionais vinculados
SELECT 
    pat.id,
    pat.email,
    pat.name,
    pat.type,
    COUNT(DISTINCT ca.id) as assessments_count,
    COUNT(DISTINCT cr.id) as reports_count,
    COUNT(DISTINCT a.id) as appointments_count,
    COUNT(DISTINCT cp.room_id) as chat_rooms_count
FROM public.users pat
LEFT JOIN public.clinical_assessments ca ON ca.patient_id = pat.id
LEFT JOIN public.clinical_reports cr ON cr.patient_id = pat.id
LEFT JOIN public.appointments a ON a.patient_id = pat.id
LEFT JOIN public.chat_participants cp ON cp.user_id = pat.id
WHERE pat.type = 'paciente'
GROUP BY pat.id, pat.email, pat.name, pat.type
ORDER BY pat.email;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
