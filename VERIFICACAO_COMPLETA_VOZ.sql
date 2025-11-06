-- =====================================================
-- 🔍 VERIFICAÇÃO COMPLETA DAS ALTERAÇÕES DE COMANDOS DE VOZ
-- =====================================================
-- Execute este script para verificar TODAS as alterações
-- =====================================================

-- =====================================================
-- 1. VERIFICAR COLUNAS EM APPOINTMENTS
-- =====================================================
SELECT 
  '✅ COLUNAS APPOINTMENTS' as verificacao,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('notes', 'doctor_id', 'professional_id')
ORDER BY column_name;

-- =====================================================
-- 2. VERIFICAR COLUNAS EM USERS
-- =====================================================
SELECT 
  '✅ COLUNAS USERS' as verificacao,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('cpf', 'birth_date', 'gender', 'type')
ORDER BY column_name;

-- =====================================================
-- 3. VERIFICAR ÍNDICES
-- =====================================================
SELECT 
  '✅ ÍNDICES' as verificacao,
  tablename,
  indexname
FROM pg_indexes 
WHERE tablename = 'users' 
  AND indexname IN ('idx_users_type', 'idx_users_cpf', 'idx_users_name')
ORDER BY indexname;

-- =====================================================
-- 4. VERIFICAR FUNÇÃO
-- =====================================================
SELECT 
  '✅ FUNÇÃO' as verificacao,
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'search_patient_by_name';

-- =====================================================
-- 5. VERIFICAR POLÍTICAS RLS EM APPOINTMENTS
-- =====================================================
SELECT 
  '✅ POLÍTICAS APPOINTMENTS' as verificacao,
  policyname,
  cmd as command
FROM pg_policies 
WHERE tablename = 'appointments'
  AND (policyname LIKE '%appointment%' OR policyname LIKE '%professional%' OR policyname LIKE '%create%')
ORDER BY policyname;

-- =====================================================
-- 6. VERIFICAR POLÍTICAS RLS EM USERS (JÁ VERIFICADO)
-- =====================================================
SELECT 
  '✅ POLÍTICAS USERS' as verificacao,
  policyname,
  cmd as command
FROM pg_policies 
WHERE tablename = 'users'
  AND (policyname LIKE '%patient%' OR policyname LIKE '%professional%')
ORDER BY policyname;

-- =====================================================
-- 7. RESUMO FINAL
-- =====================================================
DO $$ 
DECLARE
  col_appointments INT;
  col_users INT;
  idx_count INT;
  func_count INT;
  pol_appointments INT;
  pol_users INT;
BEGIN
  -- Contar colunas em appointments
  SELECT COUNT(*) INTO col_appointments
  FROM information_schema.columns 
  WHERE table_name = 'appointments' 
    AND column_name IN ('notes', 'doctor_id', 'professional_id');
  
  -- Contar colunas em users
  SELECT COUNT(*) INTO col_users
  FROM information_schema.columns 
  WHERE table_name = 'users' 
    AND column_name IN ('cpf', 'birth_date', 'gender', 'type');
  
  -- Contar índices
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes 
  WHERE tablename = 'users' 
    AND indexname IN ('idx_users_type', 'idx_users_cpf', 'idx_users_name');
  
  -- Contar função
  SELECT COUNT(*) INTO func_count
  FROM pg_proc 
  WHERE proname = 'search_patient_by_name';
  
  -- Contar políticas em appointments
  SELECT COUNT(*) INTO pol_appointments
  FROM pg_policies 
  WHERE tablename = 'appointments'
    AND (policyname LIKE '%appointment%' OR policyname LIKE '%professional%' OR policyname LIKE '%create%');
  
  -- Contar políticas em users
  SELECT COUNT(*) INTO pol_users
  FROM pg_policies 
  WHERE tablename = 'users'
    AND (policyname LIKE '%patient%' OR policyname LIKE '%professional%');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESUMO DA VERIFICAÇÃO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Colunas em appointments: %/3', col_appointments;
  RAISE NOTICE 'Colunas em users: %/4', col_users;
  RAISE NOTICE 'Índices criados: %/3', idx_count;
  RAISE NOTICE 'Funções criadas: %/1', func_count;
  RAISE NOTICE 'Políticas em appointments: %', pol_appointments;
  RAISE NOTICE 'Políticas em users: %/2', pol_users;
  RAISE NOTICE '';
  
  IF col_appointments = 3 AND col_users = 4 AND idx_count = 3 AND func_count = 1 AND pol_users = 2 THEN
    RAISE NOTICE '✅ TODAS AS VERIFICAÇÕES PASSARAM!';
    RAISE NOTICE '🎉 Sistema pronto para comandos de voz!';
  ELSE
    RAISE NOTICE '⚠️ Algumas verificações falharam. Verifique os resultados acima.';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;




