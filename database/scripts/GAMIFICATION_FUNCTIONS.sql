-- ==============================================================================
-- 🎮 GAMIFICATION_FUNCTIONS.sql
-- Objetivo: Funções RPC para manipular Pontos e Conquistas de forma atômica
-- Data: 02/02/2026
-- ==============================================================================

-- 1. Helper: Pegar ID do perfil a partir do User ID
-- (Garante que o perfil existe antes de tentar update)
CREATE OR REPLACE FUNCTION ensure_user_profile(target_user_id uuid)
RETURNS uuid AS $$
DECLARE
  profile_id uuid;
BEGIN
  INSERT INTO public.user_profiles (user_id, points, level, achievements)
  VALUES (target_user_id, 0, 1, '{}')
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT id INTO profile_id FROM public.user_profiles WHERE user_id = target_user_id;
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Increment Points (RPC)
-- Uso: await supabase.rpc('increment_user_points', { p_user_id: '...', p_points: 50 })
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id uuid, p_points integer)
RETURNS void AS $$
DECLARE
  current_points integer;
  new_points integer;
  current_level integer;
  new_level integer;
BEGIN
  -- Garante perfil
  PERFORM ensure_user_profile(p_user_id);

  -- Atualiza pontos
  UPDATE public.user_profiles
  SET points = points + p_points,
      last_activity = now()
  WHERE user_id = p_user_id
  RETURNING points INTO new_points;

  -- Calcular Nível (Exemplo simples: 1 nível a cada 1000 pontos)
  new_level := floor(new_points / 1000) + 1;

  -- Atualizar nível se mudou
  UPDATE public.user_profiles
  SET level = new_level
  WHERE user_id = p_user_id AND level < new_level;

  -- Opcional: Registrar transação de pontos no histórico (se tabela existir)
  -- INSERT INTO public.point_history ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Unlock Achievement (RPC)
-- Uso: await supabase.rpc('unlock_achievement', { p_user_id: '...', p_achievement_id: 'first_assessment' })
CREATE OR REPLACE FUNCTION unlock_achievement(p_user_id uuid, p_achievement_id text)
RETURNS boolean AS $$
DECLARE
  user_achievements text[];
BEGIN
  -- Garante perfil
  PERFORM ensure_user_profile(p_user_id);

  SELECT achievements INTO user_achievements FROM public.user_profiles WHERE user_id = p_user_id;

  -- Se já tem, ignora
  IF p_achievement_id = ANY(user_achievements) THEN
    RETURN FALSE;
  END IF;

  -- Adiciona
  UPDATE public.user_profiles
  SET achievements = array_append(achievements, p_achievement_id)
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função auxiliar para o Front-end (Leaderboard)
-- Retorna top 10 usuários com avatar e nome
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE (
  rank bigint,
  user_id uuid,
  name text,
  avatar_url text,
  points integer,
  level integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    params.rank,
    p.user_id,
    p.name,
    p.avatar_url,
    p.points,
    p.level
  FROM (
    SELECT 
      user_id,
      rank() OVER (ORDER BY points DESC) as rank
    FROM public.user_profiles
    LIMIT limit_count
  ) params
  JOIN public.user_profiles p ON p.user_id = params.user_id
  ORDER BY params.rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Funções de Gamificação (RPC) criadas com sucesso!' as status;
