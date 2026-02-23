-- ==============================================================================
-- SCRIPT DE INSPEÇÃO COMPLETA: RLS E SCHEMA DO BANCO
-- ==============================================================================
-- Este script fornece uma visão detalhada de:
-- 1. Status do RLS em todas as tabelas (Habilitado/Desabilitado)
-- 2. Definições completas das políticas (Policies)
-- 3. Estrutura das tabelas (Schema)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STATUS RLS POR TABELA
-- Verifica quais tabelas têm RLS habilitado (relrowsecurity = true)
-- ------------------------------------------------------------------------------
SELECT 
    n.nspname AS schema,
    c.relname AS table_name,
    CASE 
        WHEN c.relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END AS rls_status,
    CASE 
        WHEN c.relforcerowsecurity THEN 'FORCED' 
        ELSE 'NOT FORCED' 
    END AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r' -- Apenas tabelas normais
ORDER BY c.relrowsecurity DESC, c.relname;

-- ------------------------------------------------------------------------------
-- 2. POLÍTICAS RLS DETALHADAS
-- Lista todas as políticas de segurança definidas
-- ------------------------------------------------------------------------------
SELECT
    schemaname,
    tablename,
    policyname,
    permissive AS is_permissive, -- 'PERMISSIVE' ou 'RESTRICTIVE'
    roles AS applied_to_roles,
    cmd AS command, -- SELECT, INSERT, UPDATE, DELETE, ALL
    qual AS using_expression, -- Expressão usada para filtrar linhas visíveis (USING)
    with_check AS check_expression -- Expressão usada para validar novas linhas (WITH CHECK)
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ------------------------------------------------------------------------------
-- 3. DETALHES DAS COLUNAS (SCHEMA)
-- Lista colunas, tipos de dados e constraints básicas
-- ------------------------------------------------------------------------------
SELECT 
    c.table_name,
    c.ordinal_position,
    c.column_name,
    c.data_type,
    c.udt_name, -- Nome exato do tipo (útil para enums/custom types)
    c.is_nullable,
    c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- ------------------------------------------------------------------------------
-- 4. CONTAGEM DE POLÍTICAS POR TABELA
-- Resumo rápido de quantas policies existem em cada tabela
-- ------------------------------------------------------------------------------
SELECT 
    tablename, 
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_policies DESC;
