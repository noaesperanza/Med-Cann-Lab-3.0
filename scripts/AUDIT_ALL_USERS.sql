-- AUDITORIA GERAL DE USUÁRIOS
-- Contagem por tipo
SELECT type, count(*) as quantidade
FROM public.users
GROUP BY type;

-- Lista completa de TODOS os usuários
SELECT name, email, type, role, flag_admin, created_at
FROM public.users
ORDER BY type, name;
