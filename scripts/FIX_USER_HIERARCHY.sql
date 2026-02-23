-- 1. DEFINIÇÃO DA ELITE (ADMINS)
-- Pedro Henrique (CTO)
UPDATE public.users SET type = 'admin' WHERE email = 'phpg69@gmail.com';
-- João Eduardo (ADM)
UPDATE public.users SET type = 'admin' WHERE email = 'cbdrcpremium@gmail.com';
-- Ricardo Valença (Consultório + ADM)
UPDATE public.users SET type = 'admin' WHERE email = 'rrvalenca@gmail.com';
-- Eduardo Faveret (Consultório + ADM)
UPDATE public.users SET type = 'admin' WHERE email = 'eduardocfaveret@gmail.com';

-- 2. PROFISSIONAIS
-- Inoã
UPDATE public.users SET type = 'professional' WHERE email = 'inoaviana@gmail.com';
-- Dayana (Busca Inteligente)
UPDATE public.users SET type = 'professional' WHERE name ILIKE '%dayana%' OR email ILIKE '%dayana%';

-- 3. LIMPEZA GERAL (O resto vira Paciente)
-- Apenas se type for NULL ou 'student' antigo e NÃO for um dos emails/nomes acima.
-- Para segurança, vou listar explicitamente quem NÃO mudar.
UPDATE public.users 
SET type = 'patient' 
WHERE email NOT IN (
    'phpg69@gmail.com',
    'cbdrcpremium@gmail.com',
    'rrvalenca@gmail.com',
    'eduardocfaveret@gmail.com',
    'inoaviana@gmail.com'
)
AND (name NOT ILIKE '%dayana%' AND email NOT ILIKE '%dayana%')
AND type IS NULL; -- Só mudo quem está sem papel definido ou vou forçar? 
-- O usuário disse "o resto e ou paciente ou proficioanal". Vou assumir patient para quem não listamos.

-- Verificação Final
SELECT name, email, type FROM public.users ORDER BY type DESC;
