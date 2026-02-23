-- =====================================================
-- 🎤 SUPABASE - ATUALIZAÇÃO PARA COMANDOS DE VOZ
-- =====================================================
-- Este script atualiza o Supabase para suportar:
-- 1. Agendamento de consultas por voz
-- 2. Cadastro de pacientes por voz
-- =====================================================

-- =====================================================
-- 1. ATUALIZAR TABELA APPOINTMENTS
-- =====================================================

-- Adicionar coluna 'notes' se não existir (para observações do agendamento)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'notes') THEN
    ALTER TABLE appointments ADD COLUMN notes TEXT;
    RAISE NOTICE '✅ Coluna notes adicionada à tabela appointments';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna notes já existe na tabela appointments';
  END IF;
END $$;

-- Adicionar coluna 'doctor_id' se não existir (alias para professional_id)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'appointments' AND column_name = 'doctor_id') THEN
    ALTER TABLE appointments ADD COLUMN doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Coluna doctor_id adicionada à tabela appointments';
    
    -- Copiar dados de professional_id para doctor_id se houver dados
    UPDATE appointments SET doctor_id = professional_id WHERE professional_id IS NOT NULL AND doctor_id IS NULL;
    RAISE NOTICE '✅ Dados copiados de professional_id para doctor_id';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna doctor_id já existe na tabela appointments';
  END IF;
END $$;

-- =====================================================
-- 2. ATUALIZAR TABELA USERS
-- =====================================================

-- Adicionar coluna 'cpf' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'cpf') THEN
    ALTER TABLE users ADD COLUMN cpf TEXT UNIQUE;
    RAISE NOTICE '✅ Coluna cpf adicionada à tabela users';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna cpf já existe na tabela users';
  END IF;
END $$;

-- Adicionar coluna 'birth_date' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'birth_date') THEN
    ALTER TABLE users ADD COLUMN birth_date DATE;
    RAISE NOTICE '✅ Coluna birth_date adicionada à tabela users';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna birth_date já existe na tabela users';
  END IF;
END $$;

-- Adicionar coluna 'gender' se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'gender') THEN
    ALTER TABLE users ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
    RAISE NOTICE '✅ Coluna gender adicionada à tabela users';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna gender já existe na tabela users';
  END IF;
END $$;

-- Adicionar coluna 'user_type' como alias para 'type' (para compatibilidade)
-- NOTA: O código usa 'user_type', mas o schema usa 'type'. Vamos criar uma view ou função.
-- Por enquanto, vamos garantir que o código use 'type' corretamente.
-- Mas vamos adicionar um índice para melhorar a busca por tipo de usuário
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_type') THEN
    CREATE INDEX idx_users_type ON users(type);
    RAISE NOTICE '✅ Índice idx_users_type criado';
  ELSE
    RAISE NOTICE 'ℹ️ Índice idx_users_type já existe';
  END IF;
END $$;

-- Adicionar índice para busca por CPF
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_cpf') THEN
    CREATE INDEX idx_users_cpf ON users(cpf) WHERE cpf IS NOT NULL;
    RAISE NOTICE '✅ Índice idx_users_cpf criado';
  ELSE
    RAISE NOTICE 'ℹ️ Índice idx_users_cpf já existe';
  END IF;
END $$;

-- Adicionar índice para busca por nome (para agendamentos por voz)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_name') THEN
    CREATE INDEX idx_users_name ON users(name);
    RAISE NOTICE '✅ Índice idx_users_name criado';
  ELSE
    RAISE NOTICE 'ℹ️ Índice idx_users_name já existe';
  END IF;
END $$;

-- =====================================================
-- 3. ATUALIZAR RLS POLICIES PARA APPOINTMENTS
-- =====================================================

-- Garantir que profissionais podem criar agendamentos
DROP POLICY IF EXISTS "Professionals can create appointments" ON appointments;
CREATE POLICY "Professionals can create appointments" ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type IN ('professional', 'admin')
    )
  );

-- Garantir que profissionais podem ver agendamentos onde são o doctor_id
DROP POLICY IF EXISTS "Professionals can view their appointments" ON appointments;
CREATE POLICY "Professionals can view their appointments" ON appointments
  FOR SELECT
  TO authenticated
  USING (
    doctor_id = auth.uid() 
    OR professional_id = auth.uid()
    OR patient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- =====================================================
-- 4. ATUALIZAR RLS POLICIES PARA USERS (CADASTRO DE PACIENTES)
-- =====================================================

-- Garantir que profissionais podem criar pacientes
DROP POLICY IF EXISTS "Professionals can create patients" ON users;
CREATE POLICY "Professionals can create patients" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (type = 'patient' AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type IN ('professional', 'admin')
    ))
    OR auth.uid() = id -- Usuário pode criar seu próprio perfil
  );

-- Garantir que profissionais podem ver pacientes
DROP POLICY IF EXISTS "Professionals can view patients" ON users;
CREATE POLICY "Professionals can view patients" ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() -- Usuário pode ver seu próprio perfil
    OR type = 'patient' AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type IN ('professional', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );

-- =====================================================
-- 5. CRIAR FUNÇÃO PARA BUSCAR PACIENTE POR NOME (OTIMIZAÇÃO)
-- =====================================================

CREATE OR REPLACE FUNCTION search_patient_by_name(patient_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  cpf TEXT,
  phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.cpf,
    u.phone
  FROM users u
  WHERE u.type = 'patient'
    AND LOWER(u.name) LIKE LOWER('%' || patient_name || '%')
  ORDER BY u.name
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão para a função
GRANT EXECUTE ON FUNCTION search_patient_by_name(TEXT) TO authenticated;

DO $$ 
BEGIN
  RAISE NOTICE '✅ Função search_patient_by_name criada';
END $$;

-- =====================================================
-- RESUMO DAS ALTERAÇÕES
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Alterações realizadas:';
  RAISE NOTICE '1. ✅ Coluna notes adicionada à appointments';
  RAISE NOTICE '2. ✅ Coluna doctor_id adicionada à appointments';
  RAISE NOTICE '3. ✅ Colunas cpf, birth_date, gender adicionadas à users';
  RAISE NOTICE '4. ✅ Índices criados para otimização de buscas';
  RAISE NOTICE '5. ✅ Políticas RLS atualizadas para comandos de voz';
  RAISE NOTICE '6. ✅ Função search_patient_by_name criada';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora a plataforma suporta:';
  RAISE NOTICE '- 🎤 Agendamento de consultas por voz';
  RAISE NOTICE '- 🎤 Cadastro de pacientes por voz';
  RAISE NOTICE '========================================';
END $$;

