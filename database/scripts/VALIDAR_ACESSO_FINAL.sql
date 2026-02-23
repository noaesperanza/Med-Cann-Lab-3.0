-- ==============================================================================
-- SCRIPT DE VALIDAÇÃO FINAL (SMOKE TEST)
-- ==============================================================================
-- Rode este script para simular o acesso dos usuários e confirmar a correção.

BEGIN;

-- 1. Testar acesso do DOUTOR RICARDO (iaianoaesperana@gmail.com)
-- Esperado: Deve retornar os pacientes vinculados a ele.
-- Se der erro "Recursion" aqui, a correção V5 falhou.

DO $$
DECLARE
    v_user_id uuid;
    v_count int;
BEGIN
    -- Pegar ID do Ricardo
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'iaianoaesperana@gmail.com';
    
    -- Simular Login (Setar contexto local)
    PERFORM set_config('request.jwt.claim.sub', v_user_id::text, true);
    PERFORM set_config('request.jwt.claim.email', 'iaianoaesperana@gmail.com', true);
    PERFORM set_config('request.jwt.claims', '{"sub": "' || v_user_id || '", "email": "iaianoaesperana@gmail.com", "user_metadata": {"type": "professional"}}', true);

    -- Tentar ler pacientes (Isso aciona a RLS)
    SELECT COUNT(*) INTO v_count FROM public.users WHERE type = 'paciente';
    
    RAISE NOTICE '✅ [TESTE RICARDO] Acesso OK! Pacientes visíveis: %', v_count;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ [TESTE RICARDO] FALHOU: %', SQLERRM;
END $$;


-- 2. Testar acesso do ADMIN MASTER (phpg69@gmail.com)
-- Esperado: Deve ver TODOS os pacientes (Count alto).

DO $$
DECLARE
    v_user_id uuid;
    v_count int;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'phpg69@gmail.com';
    
    -- Simular Login Admin
    PERFORM set_config('request.jwt.claim.sub', v_user_id::text, true);
    PERFORM set_config('request.jwt.claim.email', 'phpg69@gmail.com', true);
    -- O PULO DO GATO: Admin tem metadata type=admin no JWT simulado
    PERFORM set_config('request.jwt.claims', '{"sub": "' || v_user_id || '", "email": "phpg69@gmail.com", "user_metadata": {"type": "master"}}', true);

    SELECT COUNT(*) INTO v_count FROM public.users WHERE type = 'paciente';
    
    RAISE NOTICE '✅ [TESTE ADMIN] Acesso OK! Pacientes visíveis: %', v_count;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ [TESTE ADMIN] FALHOU: %', SQLERRM;
END $$;

ROLLBACK; -- Rollback para não deixar sujeira de configuração de sessão
