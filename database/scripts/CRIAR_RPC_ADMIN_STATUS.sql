-- ==============================================================================
-- RPC: ADMIN GET USERS STATUS (Power Dashboard)
-- ==============================================================================
-- Esta função permite que o Painel do Admin acesse dados sensíveis de auth,
-- combinados com dados de negócio da tabela public.users.
--
-- O QUE ELA RETORNA:
-- 1. Dados Públicos: Nome, Tipo, Payment_Status, Status (Banido/Ativo)
-- 2. Dados Sensíveis (AUTH): Email Real, Último Login (para status Online)
--
-- SEGURANÇA:
-- Roda como SECURITY DEFINER (Superusuário), mas tem trava interna de permissão.
-- Só Admins/Masters/Gestores podem chamar.

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_get_users_status()
RETURNS TABLE (
    user_id uuid,
    name text,
    email text,
    type text,
    status text,          -- 'active', 'suspended'
    payment_status text,  -- 'pending', 'paid', 'exempt'
    owner_id uuid,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    is_online boolean     -- Calculado (True se logou nos últimos 15 min)
) 
LANGUAGE plpgsql
SECURITY DEFINER -- <--- Permite ler auth.users
SET search_path = public, auth 
AS $$
BEGIN
    -- 1. VERIFICAÇÃO DE PERMISSÃO (Critical Security Check)
    -- Apenas usuários com metadata admin/master/gestor podem rodar isso.
    IF (auth.jwt() -> 'user_metadata' ->> 'type') NOT IN ('admin', 'master', 'gestor') THEN
        RAISE EXCEPTION 'Acesso Negado: Apenas administradores podem auditar usuários.';
    END IF;

    -- 2. QUERY PODEROSA (JOIN public + auth)
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.name,
        au.email::text, -- Cast explícito
        u.type,
        -- Resiliência: não depende de colunas existirem fisicamente em public.users
        -- (evita erro "column u.status does not exist" quando o schema real não tem a coluna).
        COALESCE(to_jsonb(u)->>'status', 'active') as status, -- Default active
        COALESCE(to_jsonb(u)->>'payment_status', 'pending') as payment_status, -- Default pending
        u.owner_id,
        au.last_sign_in_at,
        u.created_at,
        -- Lógica de "Online": Se last_sign_in_at for recente (15 min)
        (au.last_sign_in_at > (now() - interval '15 minutes')) as is_online
    FROM 
        public.users u
    JOIN 
        auth.users au ON u.id = au.id
    ORDER BY 
        au.last_sign_in_at DESC NULLS LAST; -- Mais recentes primeiro (Online no topo)

END;
$$;

-- 3. PERMISSÃO DE EXECUÇÃO
-- Libera apenas para autenticados (a trava interna filtra os admins)
GRANT EXECUTE ON FUNCTION public.admin_get_users_status() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_get_users_status() FROM anon;

COMMIT;

SELECT '✅ RPC [admin_get_users_status] criada com sucesso. Dashboard Admin pronto para decolar.' as status;
