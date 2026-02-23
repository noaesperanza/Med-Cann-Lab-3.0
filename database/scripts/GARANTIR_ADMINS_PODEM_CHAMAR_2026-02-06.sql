-- =====================================================
-- ✅ GARANTIR QUE ADMINS PODEM SE CHAMAR
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Garantir que admins autorizados possam
--           criar solicitações de videochamada entre si
-- =====================================================

-- 1. VERIFICAR POLÍTICAS ATUAIS DE video_call_requests
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'video_call_requests'
ORDER BY policyname;

-- 2. GARANTIR QUE ADMINS PODEM CRIAR SOLICITAÇÕES
-- =====================================================
-- A política atual já permite que qualquer usuário autenticado
-- crie solicitações onde ele é o requester, então admins já podem.
-- Mas vamos adicionar uma política explícita para admins (opcional, mas mais claro)

DROP POLICY IF EXISTS "Admins can create video call requests to any admin" ON public.video_call_requests;

-- Política adicional para admins (não é necessária, mas deixa explícito)
-- A política existente já permite, mas esta garante que admins podem chamar outros admins
CREATE POLICY "Admins can create video call requests to any admin"
  ON public.video_call_requests FOR INSERT
  WITH CHECK (
    -- Requester deve ser admin
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND (u.flag_admin = true OR (u.type)::text IN ('admin', 'master'))
    )
    -- E recipient também deve ser admin (opcional, mas recomendado para segurança)
    AND EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = recipient_id
        AND (u.flag_admin = true OR (u.type)::text IN ('admin', 'master'))
    )
    -- E o requester deve ser o usuário autenticado
    AND auth.uid() = requester_id
  );

-- 3. VERIFICAR SE A TABELA EXISTE E TEM RLS HABILITADO
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'video_call_requests'
    ) THEN
        RAISE EXCEPTION 'Tabela video_call_requests não existe! Execute CREATE_VIDEO_CALL_REQUESTS.sql primeiro.';
    END IF;
    
    -- Garantir RLS habilitado
    ALTER TABLE public.video_call_requests ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ RLS habilitado para video_call_requests';
END $$;

-- 4. TESTE: VERIFICAR SE ADMINS PODEM CRIAR SOLICITAÇÕES
-- =====================================================
-- Este teste será executado quando um admin tentar criar uma solicitação
-- Se der erro, verificar logs do Supabase

-- 5. COMENTÁRIOS
-- =====================================================
COMMENT ON POLICY "Admins can create video call requests to any admin" ON public.video_call_requests IS 
'Permite que admins criem solicitações de videochamada para outros admins. Esta política é adicional à política geral que já permite qualquer usuário criar solicitações.';
