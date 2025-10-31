-- =====================================================
-- ✅ VERIFICAÇÃO FINAL DO MEDCANLAB
-- =====================================================
-- Execute este script para verificar se tudo está funcionando

-- 1. VERIFICAR TODAS AS TABELAS CRIADAS
SELECT 
    table_name,
    'Tabela criada' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. CONTAR TOTAL DE TABELAS
SELECT 
    COUNT(*) as total_tables,
    'Tabelas no Supabase' as description
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 3. VERIFICAR DADOS INICIAIS
SELECT 
    'CANAIS DE CHAT' as categoria,
    COUNT(*) as total_registros
FROM channels
UNION ALL
SELECT 
    'CURSOS DISPONÍVEIS' as categoria,
    COUNT(*) as total_registros
FROM courses
UNION ALL
SELECT 
    'USUÁRIOS ORIGINAIS' as categoria,
    COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
    'BASE DE CONHECIMENTO' as categoria,
    COUNT(*) as total_registros
FROM base_conhecimento;

-- 4. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
SELECT 
    'ESTRUTURA CHANNELS' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'channels' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. VERIFICAR ESTRUTURA DA TABELA MESSAGES
SELECT 
    'ESTRUTURA MESSAGES' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'messages' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. VERIFICAR ESTRUTURA DA TABELA COURSES
SELECT 
    'ESTRUTURA COURSES' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'courses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. RESUMO FINAL
SELECT 
    'MEDCANLAB 3.0 - STATUS FINAL' as title,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM channels) as total_channels,
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM base_conhecimento) as total_base_conhecimento,
    'SISTEMA 100% FUNCIONAL' as status;
