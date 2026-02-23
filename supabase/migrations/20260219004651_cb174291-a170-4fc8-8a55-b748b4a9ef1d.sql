
-- =====================================================
-- CORREÇÃO CIRÚRGICA: get_chat_user_profiles para admins
-- Problema: função retorna vazio quando admin busca perfil de outro admin
-- Solução: admin bypassa a restrição de sala compartilhada
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_chat_user_profiles(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, name text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Se o usuário atual é admin, retorna todos os perfis solicitados diretamente
  -- Caso contrário, mantém a restrição original (apenas quem compartilha sala)
  SELECT
    p.user_id,
    p.name,
    p.email
  FROM public.user_profiles p
  WHERE p.user_id = ANY(p_user_ids)
    AND (
      -- ADMIN: acesso irrestrito a perfis (para exibir nomes no chat)
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
          AND u.type IN ('admin', 'profissional', 'professional')
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
