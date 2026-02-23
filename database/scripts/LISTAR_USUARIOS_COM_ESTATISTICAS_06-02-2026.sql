-- =====================================================
-- 👥 LISTAR USUÁRIOS COM ESTATÍSTICAS
-- =====================================================
-- Data: 06/02/2026
-- Versão com estatísticas para pacientes e profissionais
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
    -- Estatísticas para pacientes
    CASE 
        WHEN type = 'paciente' THEN (
            SELECT COUNT(*) FROM public.clinical_assessments WHERE patient_id = users.id
        )
        ELSE NULL
    END AS total_assessments,
    CASE 
        WHEN type = 'paciente' THEN (
            SELECT COUNT(*) FROM public.appointments WHERE patient_id = users.id
        )
        ELSE NULL
    END AS total_appointments,
    CASE 
        WHEN type = 'paciente' THEN (
            SELECT COUNT(DISTINCT room_id) FROM public.chat_participants WHERE user_id = users.id
        )
        ELSE NULL
    END AS total_chat_rooms,
    -- Estatísticas para profissionais
    CASE 
        WHEN type IN ('profissional', 'professional', 'admin', 'master', 'gestor') THEN (
            SELECT COUNT(DISTINCT patient_id) 
            FROM public.clinical_assessments 
            WHERE doctor_id = users.id
        )
        ELSE NULL
    END AS pacientes_assessments,
    CASE 
        WHEN type IN ('profissional', 'professional', 'admin', 'master', 'gestor') THEN (
            SELECT COUNT(DISTINCT patient_id) 
            FROM public.appointments 
            WHERE professional_id = users.id OR doctor_id = users.id
        )
        ELSE NULL
    END AS pacientes_appointments,
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
