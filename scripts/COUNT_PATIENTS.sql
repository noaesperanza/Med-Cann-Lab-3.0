-- Contagem total de pacientes
SELECT count(*) as total_pacientes 
FROM public.users 
WHERE type = 'paciente';

-- Lista detalhada com nomes e emails (sem coluna status)
SELECT name, email, created_at
FROM public.users 
WHERE type = 'paciente' 
ORDER BY name;
