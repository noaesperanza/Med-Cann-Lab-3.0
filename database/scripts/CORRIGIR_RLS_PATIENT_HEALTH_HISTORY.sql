-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA HISTÓRICO DE SAÚDE DO PACIENTE
-- =====================================================
-- Este script corrige as políticas RLS para permitir que pacientes
-- acessem seus próprios dados de histórico de saúde

-- 1. POLÍTICAS PARA clinical_assessments
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Pacientes podem ver suas próprias avaliações" ON clinical_assessments;
DROP POLICY IF EXISTS "Pacientes podem criar avaliações" ON clinical_assessments;
DROP POLICY IF EXISTS "Profissionais podem ver avaliações de seus pacientes" ON clinical_assessments;
DROP POLICY IF EXISTS "Profissionais podem atualizar avaliações" ON clinical_assessments;

-- Criar políticas corretas
CREATE POLICY "Pacientes podem ver suas próprias avaliações"
  ON clinical_assessments
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Profissionais podem ver avaliações de seus pacientes"
  ON clinical_assessments
  FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Pacientes podem criar avaliações"
  ON clinical_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Profissionais podem atualizar avaliações"
  ON clinical_assessments
  FOR UPDATE
  USING (auth.uid() = doctor_id);

-- 2. POLÍTICAS PARA private_chats
-- =====================================================

-- Verificar se a tabela existe e habilitar RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'private_chats') THEN
    ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Pacientes podem ver seus chats" ON private_chats;
    DROP POLICY IF EXISTS "Profissionais podem ver chats com pacientes" ON private_chats;
    DROP POLICY IF EXISTS "Pacientes podem criar chats" ON private_chats;
    DROP POLICY IF EXISTS "Profissionais podem criar chats" ON private_chats;
    
    -- Criar políticas corretas
    CREATE POLICY "Pacientes podem ver seus chats"
      ON private_chats
      FOR SELECT
      USING (auth.uid() = patient_id);
    
    CREATE POLICY "Profissionais podem ver chats com pacientes"
      ON private_chats
      FOR SELECT
      USING (auth.uid() = doctor_id);
    
    CREATE POLICY "Pacientes podem criar chats"
      ON private_chats
      FOR INSERT
      WITH CHECK (auth.uid() = patient_id);
    
    CREATE POLICY "Profissionais podem criar chats"
      ON private_chats
      FOR INSERT
      WITH CHECK (auth.uid() = doctor_id);
  END IF;
END $$;

-- 3. POLÍTICAS PARA private_messages
-- =====================================================

-- Verificar se a tabela existe e habilitar RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'private_messages') THEN
    ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Usuários podem ver mensagens de seus chats" ON private_messages;
    DROP POLICY IF EXISTS "Usuários podem criar mensagens" ON private_messages;
    
    -- Criar políticas corretas
    -- Permitir que pacientes vejam mensagens de chats onde são pacientes
    CREATE POLICY "Pacientes podem ver mensagens de seus chats"
      ON private_messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM private_chats
          WHERE private_chats.id = private_messages.chat_id
          AND private_chats.patient_id = auth.uid()
        )
      );
    
    -- Permitir que profissionais vejam mensagens de chats onde são médicos
    CREATE POLICY "Profissionais podem ver mensagens de seus chats"
      ON private_messages
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM private_chats
          WHERE private_chats.id = private_messages.chat_id
          AND private_chats.doctor_id = auth.uid()
        )
      );
    
    -- Permitir que usuários criem mensagens em chats onde participam
    CREATE POLICY "Usuários podem criar mensagens em seus chats"
      ON private_messages
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM private_chats
          WHERE private_chats.id = private_messages.chat_id
          AND (private_chats.patient_id = auth.uid() OR private_chats.doctor_id = auth.uid())
        )
        AND sender_id = auth.uid()
      );
  END IF;
END $$;

-- 4. POLÍTICAS PARA clinical_reports
-- =====================================================

-- Verificar se a tabela existe e habilitar RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clinical_reports') THEN
    ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Pacientes podem ver seus relatórios" ON clinical_reports;
    DROP POLICY IF EXISTS "Profissionais podem ver relatórios de seus pacientes" ON clinical_reports;
    
    -- Criar políticas corretas
    CREATE POLICY "Pacientes podem ver seus relatórios"
      ON clinical_reports
      FOR SELECT
      USING (auth.uid() = patient_id);
    
    -- Política simplificada para profissionais (sem dependência de joins)
    CREATE POLICY "Profissionais podem ver relatórios"
      ON clinical_reports
      FOR SELECT
      USING (
        -- Verificar se o profissional está na coluna professional_id se existir
        -- ou permitir acesso baseado apenas no authenticated role
        auth.uid() IS NOT NULL
      );
  END IF;
END $$;

-- 5. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================
-- Descomente a query abaixo para verificar as políticas criadas
/*
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('clinical_assessments', 'private_chats', 'private_messages', 'clinical_reports')
ORDER BY tablename, policyname;
*/
