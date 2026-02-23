
-- ============================================================
-- FIX CIRÚRGICO: is_admin_user + flag_admin do João Vidal
-- ============================================================

-- 1. Corrigir flag_admin do João Vidal (cbdrcpremium@gmail.com)
UPDATE public.users
SET flag_admin = true
WHERE email = 'cbdrcpremium@gmail.com';

-- 2. Atualizar is_admin_user para ser mais robusta:
--    Aceita flag_admin = true OU type = 'admin' OU type = 'master'
--    (sem depender exclusivamente do flag_admin)
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = _user_id
      AND (
        u.flag_admin = true 
        OR (u.type)::text IN ('admin', 'master')
      )
  );
$$;

-- 3. Garantir que get_chat_user_profiles também funciona para admins
--    (já foi corrigido em migration anterior, mas garantimos aqui)
CREATE OR REPLACE FUNCTION public.get_chat_user_profiles(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, name text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    p.user_id,
    COALESCE(p.name, u.name, split_part(p.email, '@', 1), 'Usuário') AS name,
    COALESCE(p.email, u.email) AS email
  FROM public.user_profiles p
  LEFT JOIN public.users u ON u.id = p.user_id
  WHERE p.user_id = ANY(p_user_ids)
    AND (
      -- ADMIN/PROFISSIONAL: acesso irrestrito (para exibir nomes no chat)
      is_admin_user(auth.uid())
      OR
      (
        SELECT (type)::text IN ('profissional', 'professional')
        FROM public.users
        WHERE id = auth.uid()
      )
      OR
      -- DEMAIS: apenas quem compartilha sala
      EXISTS (
        SELECT 1
        FROM public.chat_participants cp_self
        WHERE cp_self.user_id = auth.uid()
          AND cp_self.room_id IN (
            SELECT cp.room_id
            FROM public.chat_participants cp
            WHERE cp.user_id = p.user_id
          )
      )
    );
$$;
