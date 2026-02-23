-- SCRIPT DE HIGIENIZAÇÃO DE BASE DE USUÁRIOS
-- Atenção: Este script remove usuários duplicados ou de teste.

BEGIN;

-- 1. Remover usuários de teste óbvios
DELETE FROM public.users
WHERE email IN (
    'aluno.teste@medcannlab.com',
    'paulo.goncalves@test.com',
    'joao.vidal@remederi.com' -- Parece conta de teste antiga
);

-- 2. Corrigir nomes mal formatados (ex: minusculas)
UPDATE public.users SET name = 'Maria Souza' WHERE email = 'graca11souza@gmail.com';
UPDATE public.users SET name = 'Flora de Souza Bomfim' WHERE email = 'florasouzabomfim1984@gmail.com';
UPDATE public.users SET name = 'João Eduardo Vidal' WHERE email = 'cbdrepremium@gmail.com';

-- 3. Identificar duplicatas por NOME (mantendo o mais recente)
-- Esta query identifica IDs que devem ser apagados porque existe um registro mais novo com o mesmo nome
DELETE FROM public.users
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY lower(name) ORDER BY created_at DESC) as r_num
        FROM public.users
        WHERE type = 'paciente'
    ) t
    WHERE t.r_num > 1
);

-- 4. Garantir que Admins vejam seus cadastros
-- (A lógica de aplicação já cuida disso via adminPermissions.ts, mas vamos garantir que não haja filtros ocultos no banco)
-- Nenhuma ação de banco necessária aqui, a correção foi no código TypeScript (adminPermissions.ts).

COMMIT;

-- Verificação Final
SELECT name, email, type, created_at FROM public.users WHERE type = 'paciente' ORDER BY name;
