-- =====================================================
-- 👥 LISTAR TODOS OS USUÁRIOS (VERSÃO SIMPLES)
-- =====================================================
-- Data: 06/02/2026
-- Retorna tudo em uma única query para facilitar visualização
-- Execute este script no Supabase SQL Editor

SELECT 
    CASE 
        WHEN type IN ('admin', 'master', 'gestor') THEN '👑 ADMIN'
        WHEN type IN ('profissional', 'professional') THEN '👨‍⚕️ PROFISSIONAL'
        WHEN type = 'paciente' THEN '👤 PACIENTE'
        WHEN type = 'aluno' THEN '🎓 ALUNO'
        ELSE '❓ ' || UPPER(COALESCE(type, 'SEM TIPO'))
    END AS tipo_usuario,
    email,
    name,
    type AS tipo_original,
    crm,
    cro,
    phone,
    created_at::date AS data_cadastro
FROM public.users
ORDER BY 
    CASE 
        WHEN type IN ('admin', 'master', 'gestor') THEN 1
        WHEN type IN ('profissional', 'professional') THEN 2
        WHEN type = 'paciente' THEN 3
        WHEN type = 'aluno' THEN 4
        ELSE 5
    END,
    email;
