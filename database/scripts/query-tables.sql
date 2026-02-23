-- Query para listar todas as tabelas e contagem de registros
SELECT 
    schemaname,
    tablename,
    (xpath('/row/cnt/text()', 
        xml_count))[1]::text::int as row_count
FROM (
    SELECT 
        schemaname,
        tablename,
        query_to_xml(format('SELECT count(*) AS cnt FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
    FROM pg_tables
    WHERE schemaname = 'public'
) AS subquery
ORDER BY row_count DESC;
