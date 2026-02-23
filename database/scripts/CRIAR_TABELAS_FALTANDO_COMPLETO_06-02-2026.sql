-- =====================================================
-- 🏗️ CRIAR TODAS AS TABELAS FALTANDO - MedCannLab 5.0
-- =====================================================
-- Data: 06/02/2026
-- Objetivo: Criar todas as tabelas que o frontend espera mas não existem
-- Script IDEMPOTENTE (pode ser executado múltiplas vezes)
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. TABELA: lessons (CRÍTICO - Sistema de Ensino)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID, -- Referência futura para modules
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration INTEGER, -- em minutos
  order_index INTEGER DEFAULT 0,
  lesson_type TEXT DEFAULT 'video' CHECK (lesson_type IN ('video', 'reading', 'quiz', 'assignment', 'interactive')),
  is_published BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON public.lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_is_published ON public.lessons(is_published);

-- RLS para lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published lessons" ON public.lessons;
CREATE POLICY "Anyone can view published lessons"
  ON public.lessons FOR SELECT
  USING (is_published = true OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

-- =====================================================
-- 2. TABELA: modules (ALTO - Módulos de Curso)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  duration TEXT, -- ex: "8h", "12h"
  lesson_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para modules
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON public.modules(order_index);
CREATE INDEX IF NOT EXISTS idx_modules_is_published ON public.modules(is_published);

-- RLS para modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published modules" ON public.modules;
CREATE POLICY "Anyone can view published modules"
  ON public.modules FOR SELECT
  USING (is_published = true OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

-- Atualizar foreign key em lessons para referenciar modules
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lessons') THEN
    -- Adicionar constraint se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'lessons_module_id_fkey'
    ) THEN
      ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_module_id_fkey 
      FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- =====================================================
-- 3. TABELA: news (MÉDIO - Sistema de Notícias)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT DEFAULT 'cannabis-medicinal' CHECK (category IN (
    'cannabis-medicinal', 'pesquisa-clinica', 'metodologia-aec', 
    'regulamentacao', 'nefrologia', 'clinica', 'pesquisa', 'farmacologia'
  )),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author TEXT, -- Nome do autor (fallback)
  date DATE DEFAULT CURRENT_DATE,
  read_time TEXT,
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  source TEXT,
  url TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para news
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news(published);
CREATE INDEX IF NOT EXISTS idx_news_date ON public.news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON public.news(author_id);

-- RLS para news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
CREATE POLICY "Anyone can view published news"
  ON public.news FOR SELECT
  USING (published = true OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Admins can manage news"
  ON public.news FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

-- =====================================================
-- 4. TABELA: gamification_points (MÉDIO - Pontuação)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gamification_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL, -- 'lesson_completed', 'assessment_done', 'chat_message', etc.
  source_id UUID, -- ID do recurso que gerou os pontos (lesson_id, assessment_id, etc.)
  description TEXT,
  category TEXT CHECK (category IN ('learning', 'clinical', 'social', 'special')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para gamification_points
CREATE INDEX IF NOT EXISTS idx_gamification_points_user_id ON public.gamification_points(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_points_source ON public.gamification_points(source);
CREATE INDEX IF NOT EXISTS idx_gamification_points_category ON public.gamification_points(category);
CREATE INDEX IF NOT EXISTS idx_gamification_points_created_at ON public.gamification_points(created_at DESC);

-- RLS para gamification_points
ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own points" ON public.gamification_points;
CREATE POLICY "Users can view own points"
  ON public.gamification_points FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "System can insert points" ON public.gamification_points;
CREATE POLICY "System can insert points"
  ON public.gamification_points FOR INSERT
  WITH CHECK (true); -- Sistema pode inserir pontos para qualquer usuário

-- =====================================================
-- 5. TABELA: user_achievements (MÉDIO - Conquistas)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL, -- ID da conquista (ex: 'first_lesson', 'perfect_week')
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('learning', 'clinical', 'social', 'special')),
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Índices para user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_category ON public.user_achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_rarity ON public.user_achievements(rarity);

-- RLS para user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "System can insert achievements" ON public.user_achievements;
CREATE POLICY "System can insert achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true); -- Sistema pode inserir conquistas para qualquer usuário

-- =====================================================
-- 6. TABELA: transactions (MÉDIO - Sistema Financeiro)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'refund', 'subscription', 'bonus', 'withdrawal')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_method VARCHAR(50),
  payment_id TEXT,
  gateway_response JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT valid_amount CHECK (amount > 0)
);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- RLS para transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "System can insert transactions" ON public.transactions;
CREATE POLICY "System can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

-- =====================================================
-- 7. TABELA: wearable_devices (MÉDIO - Dispositivos Wearables)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wearable_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('smartwatch', 'fitness_tracker', 'monitor', 'other')),
  brand VARCHAR(50),
  model VARCHAR(100),
  device_id TEXT, -- ID único do dispositivo
  battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  connection_status VARCHAR(50) DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'low_battery', 'error')),
  last_sync TIMESTAMPTZ,
  data_types TEXT[] DEFAULT '{}', -- 'heart_rate', 'movement', 'temperature', 'sleep', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para wearable_devices
CREATE INDEX IF NOT EXISTS idx_wearable_devices_patient_id ON public.wearable_devices(patient_id);
CREATE INDEX IF NOT EXISTS idx_wearable_devices_device_type ON public.wearable_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_wearable_devices_connection_status ON public.wearable_devices(connection_status);

-- RLS para wearable_devices
ALTER TABLE public.wearable_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own devices" ON public.wearable_devices;
CREATE POLICY "Patients can view own devices"
  ON public.wearable_devices FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT doctor_id FROM public.clinical_assessments WHERE patient_id = auth.uid()
    UNION
    SELECT professional_id FROM public.clinical_reports WHERE patient_id = auth.uid()
  ) OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "Patients can manage own devices" ON public.wearable_devices;
CREATE POLICY "Patients can manage own devices"
  ON public.wearable_devices FOR ALL
  USING (auth.uid() = patient_id OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

-- =====================================================
-- 8. TABELA: wearable_data (Dados dos Dispositivos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.wearable_devices(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_type VARCHAR(50) NOT NULL, -- 'heart_rate', 'movement', 'temperature', 'sleep', etc.
  value DECIMAL(10,2),
  unit VARCHAR(20),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para wearable_data
CREATE INDEX IF NOT EXISTS idx_wearable_data_device_id ON public.wearable_data(device_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_patient_id ON public.wearable_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_data_type ON public.wearable_data(data_type);
CREATE INDEX IF NOT EXISTS idx_wearable_data_timestamp ON public.wearable_data(timestamp DESC);

-- RLS para wearable_data
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own data" ON public.wearable_data;
CREATE POLICY "Patients can view own data"
  ON public.wearable_data FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT doctor_id FROM public.clinical_assessments WHERE patient_id = auth.uid()
    UNION
    SELECT professional_id FROM public.clinical_reports WHERE patient_id = auth.uid()
  ) OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "System can insert wearable data" ON public.wearable_data;
CREATE POLICY "System can insert wearable data"
  ON public.wearable_data FOR INSERT
  WITH CHECK (true); -- Sistema pode inserir dados de dispositivos

-- =====================================================
-- 9. TABELA: epilepsy_events (MÉDIO - Neurologia Pediátrica)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.epilepsy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('seizure', 'aura', 'absence', 'myoclonic', 'tonic_clonic', 'other')),
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  duration_seconds INTEGER,
  description TEXT,
  location TEXT,
  witnesses TEXT[],
  triggers TEXT[],
  medication_taken TEXT[],
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Quem registrou (paciente, familiar, profissional)
  event_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para epilepsy_events
CREATE INDEX IF NOT EXISTS idx_epilepsy_events_patient_id ON public.epilepsy_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_epilepsy_events_event_type ON public.epilepsy_events(event_type);
CREATE INDEX IF NOT EXISTS idx_epilepsy_events_event_date ON public.epilepsy_events(event_date DESC);

-- RLS para epilepsy_events
ALTER TABLE public.epilepsy_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own events" ON public.epilepsy_events;
CREATE POLICY "Patients can view own events"
  ON public.epilepsy_events FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT doctor_id FROM public.clinical_assessments WHERE patient_id = auth.uid()
    UNION
    SELECT professional_id FROM public.clinical_reports WHERE patient_id = auth.uid()
  ) OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "Patients and professionals can insert events" ON public.epilepsy_events;
CREATE POLICY "Patients and professionals can insert events"
  ON public.epilepsy_events FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id OR 
    auth.uid() IN (SELECT id FROM public.users WHERE type IN ('profissional', 'professional', 'admin', 'master', 'gestor'))
  );

-- =====================================================
-- 10. TABELA: ai_chat_history (BAIXO - Histórico Chat IA)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT,
  message TEXT NOT NULL,
  response TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  model TEXT, -- Modelo de IA usado
  tokens_used INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ai_chat_history
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON public.ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON public.ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON public.ai_chat_history(created_at DESC);

-- RLS para ai_chat_history
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat history" ON public.ai_chat_history;
CREATE POLICY "Users can view own chat history"
  ON public.ai_chat_history FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "Users can insert own chat history" ON public.ai_chat_history;
CREATE POLICY "Users can insert own chat history"
  ON public.ai_chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 11. VERIFICAR E CRIAR TABELA: lesson_content (se necessário)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID,
  lesson_id TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, lesson_id)
);

-- Índices para lesson_content
CREATE INDEX IF NOT EXISTS idx_lesson_content_module_id ON public.lesson_content(module_id);
CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson_id ON public.lesson_content(lesson_id);

-- RLS para lesson_content
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view lesson content" ON public.lesson_content;
CREATE POLICY "Anyone can view lesson content"
  ON public.lesson_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage lesson content" ON public.lesson_content;
CREATE POLICY "Admins can manage lesson content"
  ON public.lesson_content FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

-- =====================================================
-- 12. VERIFICAR E CRIAR TABELA: user_statistics (para Gamificação)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  experience_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_lessons_completed INTEGER DEFAULT 0,
  total_assessments_completed INTEGER DEFAULT 0,
  total_chat_messages INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- em minutos
  current_streak INTEGER DEFAULT 0, -- dias consecutivos
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_statistics
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_experience_points ON public.user_statistics(experience_points DESC);

-- RLS para user_statistics
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own statistics" ON public.user_statistics;
CREATE POLICY "Users can view own statistics"
  ON public.user_statistics FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE type IN ('admin', 'master', 'gestor')));

DROP POLICY IF EXISTS "System can manage statistics" ON public.user_statistics;
CREATE POLICY "System can manage statistics"
  ON public.user_statistics FOR ALL
  USING (true); -- Sistema pode gerenciar estatísticas

-- =====================================================
-- 13. VERIFICAR E CRIAR TABELA: news_items (alias para news)
-- =====================================================

-- Se o frontend usa 'news_items' em vez de 'news', criar view ou tabela
DO $$
BEGIN
  -- Verificar se frontend usa 'news_items'
  -- Se sim, criar view ou tabela adicional
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'news_items'
  ) THEN
    -- Criar view que aponta para news
    CREATE OR REPLACE VIEW public.news_items AS
    SELECT * FROM public.news;
    
    -- Ou criar tabela separada (descomente se preferir)
    /*
    CREATE TABLE IF NOT EXISTS public.news_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      category TEXT DEFAULT 'cannabis-medicinal',
      author TEXT,
      date DATE DEFAULT CURRENT_DATE,
      read_time TEXT,
      impact TEXT,
      source TEXT,
      url TEXT,
      tags TEXT[] DEFAULT '{}',
      image_url TEXT,
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    */
  END IF;
END $$;

-- =====================================================
-- 14. RESUMO FINAL
-- =====================================================

SELECT 
    'lessons' AS table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lessons')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END AS status
UNION ALL
SELECT 
    'modules',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modules')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'news',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'gamification_points',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gamification_points')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'user_achievements',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_achievements')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'transactions',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'wearable_devices',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wearable_devices')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'epilepsy_events',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'epilepsy_events')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'ai_chat_history',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_chat_history')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
UNION ALL
SELECT 
    'user_statistics',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_statistics')
        THEN '✅ CRIADA'
        ELSE '❌ ERRO'
    END
ORDER BY status, table_name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- ✅ Todas as tabelas faltando foram criadas!
-- ✅ RLS configurado para todas
-- ✅ Índices criados para performance
-- ✅ Foreign keys configuradas
-- Execute este script e depois execute os scripts de diagnóstico novamente!
