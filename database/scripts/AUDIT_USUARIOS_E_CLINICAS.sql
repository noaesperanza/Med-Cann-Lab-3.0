-- ==============================================================================
-- AUDITORIA DE HIERARQUIA E IDENTIDADES (MedCannLab 2026)
-- ==============================================================================
-- Este script verifica a configuração dos 4 Admins e dos Profissionais principais,
-- confirmando nomes, tipos e associações clínicas.

-- 1. VERIFICAR OS 4 ADMINS PRINCIPAIS
SELECT 
    'ADMIN' as categoria,
    email,
    name as nome_publico,
    type as tipo_publico,
    flag_admin,
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = public.users.id) as nome_auth,
    (SELECT raw_user_meta_data->>'type' FROM auth.users WHERE auth.users.id = public.users.id) as tipo_auth
FROM public.users
WHERE email IN (
    'phpg69@gmail.com',         -- Pedro
    'cbdrcpremium@gmail.com',   -- João
    'rrvalenca@gmail.com',      -- Ricardo (Admin)
    'eduardoscfaveret@gmail.com' -- Eduardo (Admin)
);

-- 2. VERIFICAR CONTAS PROFISSIONAIS (CLÍNICAS)
SELECT 
    'PROFISSIONAL' as categoria,
    email,
    name as nome_publico,
    type as tipo_publico,
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = public.users.id) as nome_auth,
    (SELECT name FROM public.clinics WHERE doctor_id = public.users.id) as clinica_associada
FROM public.users
WHERE email IN (
    'iaianoaesperanza@gmail.com', -- Ricardo (Profissional)
    'eduardo.faveret@medcannlab.com.br', -- Eduardo (Profissional)
    'inoaviana@gmail.com'         -- Iona
);

-- 3. VERIFICAR RELAÇÃO ENTRE ADMINS E CONSULTÓRIOS
-- (Verifica se os IDs dos Admins aparecem como médicos em consultas ou clínicas)
SELECT 
    u.email as admin_email,
    u.name as admin_name,
    COUNT(a.id) as total_pacientes_vinculados
FROM public.users u
LEFT JOIN public.appointments a ON u.id = a.professional_id OR u.id = a.doctor_id
WHERE u.email IN ('phpg69@gmail.com', 'cbdrcpremium@gmail.com', 'rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com')
GROUP BY u.email, u.name;

-- 4. VERIFICAR USUÁRIO ATUAL (SIMULAÇÃO DE LOGIN)
-- Útil para o usuário rodar e ver como o sistema o enxerga
SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name_in_metadata,
    raw_user_meta_data->>'type' as type_in_metadata
FROM auth.users
WHERE id = auth.uid();
