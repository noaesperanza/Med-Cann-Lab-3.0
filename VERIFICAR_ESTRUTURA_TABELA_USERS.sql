-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA USERS
-- =====================================================

-- Verificar estrutura da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Verificar se há alguma coluna com nome diferente
SELECT 
    attname as column_name,
    atttypid::regtype as data_type,
    attnum as column_position
FROM pg_attribute
WHERE attrelid = 'users'::regclass
  AND attnum > 0
  AND NOT attisdropped
ORDER BY attnum;
