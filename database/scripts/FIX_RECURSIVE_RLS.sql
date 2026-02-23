-- =============================================================================
-- FIX RECURSIVE RLS - CORREÇÃO DE ERRO 500
-- =============================================================================
-- O erro 500 ocorre devido a um ciclo infinito (recursão) nas políticas de segurança:
-- Tabela 'users' verifica 'clinical_assessments' <-> Tabela 'clinical_assessments' verifica 'users'
--
-- ESTE SCRIPT QUEBRA O CICLO USANDO FUNÇÕES "SECURITY DEFINER"
-- =============================================================================

-- 1. Garantir que as funções seguras existam (Bypassam o RLS para ler tipo do usuário)
CREATE OR REPLACE FUNCTION get_current_user_type()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Segurança
AS $$
BEGIN
  RETURN (SELECT type FROM public.users WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
BEGIN
  RETURN (SELECT email FROM public.users WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u_email TEXT;
  u_type TEXT;
BEGIN
  SELECT email, type INTO u_email, u_type FROM public.users WHERE id = auth.uid();
  RETURN (u_type = 'admin' OR u_email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com', 'profrvalenca@gmail.com'));
END;
$$;

-- 2. Corrigir Políticas da Tabela de Avaliações IMRE (imre_assessments)
-- Removemos qualquer join direto com 'users' que não seja via função segura
DROP POLICY IF EXISTS "Users can read own assessments" ON imre_assessments;
DROP POLICY IF EXISTS "Professionals can read assigned assessments" ON imre_assessments;
DROP POLICY IF EXISTS "Admins can read all assessments" ON imre_assessments;

ALTER TABLE imre_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assessments"
ON imre_assessments FOR ALL
USING (
  auth.uid() = user_id
);

CREATE POLICY "Professionals can read assessments"
ON imre_assessments FOR SELECT
USING (
  -- Usa a função segura para checar se é profissional
  (get_current_user_type() IN ('professional', 'profissional', 'admin'))
);

-- 3. Corrigir Políticas da Tabela de Relatórios Clínicos (clinical_reports)
DROP POLICY IF EXISTS "Users can read own reports" ON clinical_reports;
DROP POLICY IF EXISTS "Professionals can read reports" ON clinical_reports;

ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
ON clinical_reports FOR ALL
USING (
  auth.uid() = patient_id
);

CREATE POLICY "Professionals and Admins can read reports"
ON clinical_reports FOR ALL
USING (
  (get_current_user_type() IN ('professional', 'profissional', 'admin'))
);

-- 4. Corrigir Políticas da Tabela de Avaliações Clínicas (clinical_assessments)
DROP POLICY IF EXISTS "Users can read own assessments" ON clinical_assessments;
DROP POLICY IF EXISTS "Professionals can read all assessments" ON clinical_assessments;

ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assessments"
ON clinical_assessments FOR SELECT
USING (
  auth.uid() = patient_id
);

CREATE POLICY "Professionals can manage assessments"
ON clinical_assessments FOR ALL
USING (
  (get_current_user_type() IN ('professional', 'profissional', 'admin'))
);

-- 5. Corrigir Políticas da Tabela de Usuários (users)
-- A política da tabela users é a mais sensível a loops
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Professionals can read patients" ON users;
DROP POLICY IF EXISTS "Admins can read all" ON users;

CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (
  auth.uid() = id
);

CREATE POLICY "Admins can read all"
ON users FOR ALL
USING (
  is_admin()
);

CREATE POLICY "Professionals can read patients"
ON users FOR SELECT
USING (
  (get_current_user_type() IN ('professional', 'profissional'))
  AND
  type = 'patient'
);

-- Confirmação
SELECT 'Políticas corrigidas com sucesso. Loop de recursão removido.' as status;
