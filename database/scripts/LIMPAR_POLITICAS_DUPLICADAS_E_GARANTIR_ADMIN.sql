-- =====================================================
-- Limpar políticas duplicadas/antigas em patient_medical_records
-- e garantir que admin seja por is_admin_user() (public.users.flag_admin)
-- =====================================================
-- O diagnóstico mostrou políticas antigas que usam lista de email fixa
-- ("Allow admin select all" só permite 3 emails). Este script remove
-- essas políticas antigas e garante que o admin Pedro (phpg69@gmail.com)
-- tenha flag_admin na tabela users para is_admin_user() retornar true.
-- Data: 09/02/2026

SET search_path = public;

-- =====================================================
-- 1) Garantir que seu usuário admin está em public.users com flag_admin
-- =====================================================
-- Ajuste o email abaixo se for outro usuário admin.
UPDATE public.users
SET flag_admin = true, type = COALESCE(type, 'admin')
WHERE email = 'phpg69@gmail.com'
  AND (flag_admin IS NOT TRUE OR type NOT IN ('admin', 'master'));

-- Se o usuário não existir em users, inserir a partir de auth.users (se tiver permissão)
-- INSERT INTO public.users (id, email, name, type, flag_admin)
-- SELECT id, email, raw_user_meta_data->>'name', 'admin', true
-- FROM auth.users WHERE email = 'phpg69@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET flag_admin = true, type = 'admin';

-- =====================================================
-- 2) Remover políticas ANTIGAS/DUPLICADAS (lista fixa de emails ou auth.users)
-- =====================================================
-- Estas não vêm do FIX_PATIENT_MEDICAL_RECORDS_RLS_403; removê-las evita conflito.

DROP POLICY IF EXISTS "Allow admin select all" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Allow admin update" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Allow patient select own" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Pacientes veem seus próprios registros" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Profissionais veem registros de seus pacientes" ON public.patient_medical_records;
DROP POLICY IF EXISTS "Profissionais podem atualizar registros" ON public.patient_medical_records;
DROP POLICY IF EXISTS "IA pode inserir registros" ON public.patient_medical_records;

-- =====================================================
-- 3) Verificação rápida
-- =====================================================
SELECT 'Políticas restantes em patient_medical_records:' AS info;
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'patient_medical_records'
ORDER BY cmd, policyname;

SELECT 'Usuário phpg69 como admin em users:' AS info;
SELECT id, email, type, flag_admin FROM public.users WHERE email = 'phpg69@gmail.com';

SELECT '✅ Concluído. Admin deve passar por is_admin_user() (flag_admin em public.users).' AS status;
