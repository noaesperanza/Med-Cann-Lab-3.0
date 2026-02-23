-- ==============================================================================
-- ENABLE SMART SCHEDULING SCHEMA
-- ==============================================================================
-- Descrição:
-- 1. Adiciona coluna `is_official` na tabela `public.users` (se não existir).
-- 2. Define Dr. Ricardo e Dr. Eduardo como oficiais.
-- 3. Cria View `doctors` para facilitar consulta de oficiais vs parceiros.
-- 4. Cria View `patient_doctors` para verificar vínculo paciente-médico.
-- ==============================================================================

-- 1. Adicionar coluna is_official em public.users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_official') THEN
        ALTER TABLE public.users ADD COLUMN is_official BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Coluna is_official adicionada em public.users.';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna is_official já existe em public.users.';
    END IF;
END $$;

-- 2. Marcar Médicos Oficiais (Dr. Ricardo e Dr. Eduardo)
-- Ajuste os emails conforme necessário se forem diferentes em produção
UPDATE public.users 
SET is_official = TRUE 
WHERE email IN ('ricardo.valenca@medcannlab.com.br', 'eduardo.faveret@medcannlab.com.br');

RAISE NOTICE '✅ Médicos oficiais atualizados.';

-- 3. Criar View `doctors`
CREATE OR REPLACE VIEW public.doctors AS
SELECT 
    id, 
    name, 
    is_official, 
    crm, 
    avatar_url,
    specialty,
    email
FROM public.users
WHERE type = 'professional';

RAISE NOTICE '✅ View doctors criada/atualizada.';

-- 4. Criar View `patient_doctors`
-- Baseada nos agendamentos (vínculo implícito) ou tabela de vínculo se existir.
-- Utilizando appointments como base conforme lógica atual do sistema.
CREATE OR REPLACE VIEW public.patient_doctors AS
SELECT DISTINCT ON (a.patient_id)
    a.patient_id,
    a.professional_id as doctor_id,
    u.name as doctor_name,
    u.is_official,
    u.specialty
FROM public.appointments a
JOIN public.users u ON a.professional_id = u.id
ORDER BY a.patient_id, a.created_at DESC;

RAISE NOTICE '✅ View patient_doctors criada/atualizada.';

-- Fim
