-- LIMPEZA DE DADOS ÓRFÃOS (GHOST DATA CLEANUP)
-- Remove avaliações clínicas que apontam para pacientes que não existem mais na tabela users

-- 1. Contar quantos órfãos existem antes de deletar
SELECT count(*) as orfaos_encontrados
FROM public.clinical_assessments ca
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = ca.patient_id
);

-- 2. Deletar as avaliações órfãs
DELETE FROM public.clinical_assessments ca
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = ca.patient_id
);

-- 3. Limpar também prontuários órfãos
DELETE FROM public.patient_medical_records pmr
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = pmr.patient_id
);

-- 4. Confirmar que a tabela users tem apenas os mocks (ou está vazia se ainda não rodou o mock)
SELECT * FROM public.users WHERE type = 'paciente';
