-- =====================================================
-- 🔍 VERIFICAÇÃO DAS ALTERAÇÕES DE COMANDOS DE VOZ
-- =====================================================
-- Execute este script para verificar se todas as alterações foram aplicadas corretamente
-- =====================================================

-- 1. VERIFICAR COLUNAS EM APPOINTMENTS
SELECT 
  'appointments' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('notes', 'doctor_id', 'professional_id')
ORDER BY column_name;

-- 2. VERIFICAR COLUNAS EM USERS
SELECT 
  'users' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('cpf', 'birth_date', 'gender', 'type')
ORDER BY column_name;

-- 3. VERIFICAR ÍNDICES
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'users' 
  AND indexname IN ('idx_users_type', 'idx_users_cpf', 'idx_users_name')
ORDER BY indexname;

-- 4. VERIFICAR FUNÇÃO
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'search_patient_by_name';

-- 5. VERIFICAR POLÍTICAS RLS EM APPOINTMENTS
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
WHERE tablename = 'appointments'
  AND policyname LIKE '%appointment%'
ORDER BY policyname;

-- 6. VERIFICAR POLÍTICAS RLS EM USERS
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
WHERE tablename = 'users'
  AND (policyname LIKE '%patient%' OR policyname LIKE '%professional%')
ORDER BY policyname;

-- 7. TESTAR FUNÇÃO DE BUSCA (se houver pacientes cadastrados)
-- Descomente a linha abaixo para testar (substitua 'Nome' pelo nome de um paciente)
-- SELECT * FROM search_patient_by_name('Nome');

-- =====================================================
-- RESUMO DA VERIFICAÇÃO
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ VERIFICAÇÃO CONCLUÍDA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Verifique os resultados acima:';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Deve mostrar:';
  RAISE NOTICE '  - 3 colunas em appointments (notes, doctor_id, professional_id)';
  RAISE NOTICE '  - 4 colunas em users (cpf, birth_date, gender, type)';
  RAISE NOTICE '  - 3 índices em users';
  RAISE NOTICE '  - 1 função search_patient_by_name';
  RAISE NOTICE '  - Políticas RLS para appointments e users';
  RAISE NOTICE '';
  RAISE NOTICE 'Se todos os itens aparecerem, está tudo OK! 🎉';
  RAISE NOTICE '========================================';
END $$;




