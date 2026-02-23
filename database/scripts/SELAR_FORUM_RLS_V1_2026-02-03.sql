-- =====================================================
-- 🔒 SELAMENTO RLS — FÓRUM (SEM PACIENTES)
-- =====================================================
-- Data: 03/02/2026
-- Regra de produto SELADA:
-- - Fórum é para: Admin + Profissionais + Alunos
-- - Pacientes NÃO participam (leitura nem escrita)
-- - Caso clínico que envolva paciente exige consentimento fora do escopo deste script
--   (processo + disclaimers no app). Aqui: contenção técnica de acesso.
--
-- Este script é "defensivo":
-- - só aplica policies se as tabelas/colunas existirem
-- - seguro para reexecução (DROP POLICY IF EXISTS)
--
-- Tabelas alvo esperadas:
-- - forum_posts(id, author_id, is_active, ...)
-- - forum_comments(post_id, author_id, ...)
-- - forum_likes(post_id, user_id?, author_id?)
-- - forum_views(post_id, user_id, ...)

-- =====================================================
-- Helper inline: "non-patient" = users.type NOT IN ('patient','paciente')
-- Admin = users.flag_admin=true OR users.type in ('admin','master')
-- =====================================================

DO $$
DECLARE
  has_forum_posts boolean;
  has_forum_comments boolean;
  has_forum_likes boolean;
  has_forum_views boolean;
  likes_has_user_id boolean;
BEGIN
  SELECT to_regclass('public.forum_posts') IS NOT NULL INTO has_forum_posts;
  SELECT to_regclass('public.forum_comments') IS NOT NULL INTO has_forum_comments;
  SELECT to_regclass('public.forum_likes') IS NOT NULL INTO has_forum_likes;
  SELECT to_regclass('public.forum_views') IS NOT NULL INTO has_forum_views;

  -- forum_posts -------------------------------------------------------------
  IF has_forum_posts THEN
    ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

    -- drop policies conhecidas / legadas
    DROP POLICY IF EXISTS "Anyone can view active forum posts" ON public.forum_posts;
    DROP POLICY IF EXISTS "Authenticated users can create forum posts" ON public.forum_posts;

    DROP POLICY IF EXISTS "forum_posts_select_non_patient" ON public.forum_posts;
    DROP POLICY IF EXISTS "forum_posts_insert_non_patient" ON public.forum_posts;
    DROP POLICY IF EXISTS "forum_posts_update_author_or_admin" ON public.forum_posts;
    DROP POLICY IF EXISTS "forum_posts_delete_author_or_admin" ON public.forum_posts;

    EXECUTE $POL$
      CREATE POLICY "forum_posts_select_non_patient" ON public.forum_posts
        FOR SELECT TO authenticated
        USING (
          (
            is_active = true
            AND EXISTS (
              SELECT 1
              FROM public.users u
              WHERE u.id = auth.uid()
                AND (u.type)::text NOT IN ('patient','paciente')
            )
          )
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_posts_insert_non_patient" ON public.forum_posts
        FOR INSERT TO authenticated
        WITH CHECK (
          author_id = auth.uid()
          AND EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.type)::text NOT IN ('patient','paciente')
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_posts_update_author_or_admin" ON public.forum_posts
        FOR UPDATE TO authenticated
        USING (
          author_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
        WITH CHECK (
          author_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_posts_delete_author_or_admin" ON public.forum_posts
        FOR DELETE TO authenticated
        USING (
          author_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
    $POL$;
  END IF;

  -- forum_comments ----------------------------------------------------------
  IF has_forum_comments THEN
    ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "forum_comments_select_non_patient" ON public.forum_comments;
    DROP POLICY IF EXISTS "forum_comments_insert_non_patient" ON public.forum_comments;
    DROP POLICY IF EXISTS "forum_comments_update_author_or_admin" ON public.forum_comments;
    DROP POLICY IF EXISTS "forum_comments_delete_author_or_admin" ON public.forum_comments;

    EXECUTE $POL$
      CREATE POLICY "forum_comments_select_non_patient" ON public.forum_comments
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.type)::text NOT IN ('patient','paciente')
          )
          AND EXISTS (
            SELECT 1
            FROM public.forum_posts fp
            WHERE fp.id = forum_comments.post_id
              AND fp.is_active = true
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_comments_insert_non_patient" ON public.forum_comments
        FOR INSERT TO authenticated
        WITH CHECK (
          author_id = auth.uid()
          AND EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.type)::text NOT IN ('patient','paciente')
          )
          AND EXISTS (
            SELECT 1
            FROM public.forum_posts fp
            WHERE fp.id = forum_comments.post_id
              AND fp.is_active = true
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_comments_update_author_or_admin" ON public.forum_comments
        FOR UPDATE TO authenticated
        USING (
          author_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
        WITH CHECK (
          author_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_comments_delete_author_or_admin" ON public.forum_comments
        FOR DELETE TO authenticated
        USING (
          author_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
    $POL$;
  END IF;

  -- forum_views -------------------------------------------------------------
  IF has_forum_views THEN
    ALTER TABLE public.forum_views ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "forum_views_select_non_patient" ON public.forum_views;
    DROP POLICY IF EXISTS "forum_views_insert_non_patient" ON public.forum_views;
    DROP POLICY IF EXISTS "forum_views_delete_self_or_admin" ON public.forum_views;

    EXECUTE $POL$
      CREATE POLICY "forum_views_select_non_patient" ON public.forum_views
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.type)::text NOT IN ('patient','paciente')
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_views_insert_non_patient" ON public.forum_views
        FOR INSERT TO authenticated
        WITH CHECK (
          user_id = auth.uid()
          AND EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.type)::text NOT IN ('patient','paciente')
          )
          AND EXISTS (
            SELECT 1
            FROM public.forum_posts fp
            WHERE fp.id = forum_views.post_id
              AND fp.is_active = true
          )
        )
    $POL$;

    EXECUTE $POL$
      CREATE POLICY "forum_views_delete_self_or_admin" ON public.forum_views
        FOR DELETE TO authenticated
        USING (
          user_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
          )
        )
    $POL$;
  END IF;

  -- forum_likes -------------------------------------------------------------
  IF has_forum_likes THEN
    ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

    -- user_id pode variar em schemas legados; detectar antes de criar policy de INSERT
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'forum_likes'
        AND column_name = 'user_id'
    ) INTO likes_has_user_id;

    DROP POLICY IF EXISTS "forum_likes_select_non_patient" ON public.forum_likes;
    DROP POLICY IF EXISTS "forum_likes_insert_non_patient" ON public.forum_likes;
    DROP POLICY IF EXISTS "forum_likes_delete_self_or_admin" ON public.forum_likes;

    EXECUTE $POL$
      CREATE POLICY "forum_likes_select_non_patient" ON public.forum_likes
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.type)::text NOT IN ('patient','paciente')
          )
        )
    $POL$;

    IF likes_has_user_id THEN
      EXECUTE $POL$
        CREATE POLICY "forum_likes_insert_non_patient" ON public.forum_likes
          FOR INSERT TO authenticated
          WITH CHECK (
            user_id = auth.uid()
            AND EXISTS (
              SELECT 1
              FROM public.users u
              WHERE u.id = auth.uid()
                AND (u.type)::text NOT IN ('patient','paciente')
            )
            AND EXISTS (
              SELECT 1
              FROM public.forum_posts fp
              WHERE fp.id = forum_likes.post_id
                AND fp.is_active = true
            )
          )
      $POL$;

      EXECUTE $POL$
        CREATE POLICY "forum_likes_delete_self_or_admin" ON public.forum_likes
          FOR DELETE TO authenticated
          USING (
            user_id = auth.uid()
            OR EXISTS (
              SELECT 1
              FROM public.users u
              WHERE u.id = auth.uid()
                AND (u.flag_admin = true OR (u.type)::text IN ('admin','master'))
            )
          )
      $POL$;
    END IF;
  END IF;
END $$;

