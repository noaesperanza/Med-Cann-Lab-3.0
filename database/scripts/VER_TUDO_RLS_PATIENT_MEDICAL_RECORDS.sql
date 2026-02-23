-- =====================================================
-- 📋 VER TUDO: RLS e políticas de patient_medical_records
-- =====================================================
-- UMA ÚNICA QUERY: tudo aparece em um único resultado no Supabase.
-- Rode no SQL Editor e veja a tabela completa.
-- Data: 09/02/2026

SELECT ordem, secao, item, valor
FROM (
  -- 1) RLS na tabela
  SELECT 1 AS ordem, '1. RLS' AS secao, 'patient_medical_records' AS item,
    CASE WHEN c.relrowsecurity THEN 'RLS ATIVO (SIM)' ELSE 'RLS INATIVO (NÃO)' END AS valor
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'patient_medical_records'

  UNION ALL

  -- 2) Cabeçalho políticas
  SELECT 2, '2. Políticas', '---', 'nome | comando | condição USING'

  UNION ALL

  -- 3) Uma linha por política
  SELECT 10 + row_number() OVER (ORDER BY p.cmd, p.policyname)::int,
    '2. Políticas', p.policyname, p.cmd::text || ' | USING: ' || COALESCE(p.qual::text, '-')
  FROM pg_policies p
  WHERE p.schemaname = 'public' AND p.tablename = 'patient_medical_records'

  UNION ALL

  -- 4) Funções existem?
  SELECT 50, '3. Funções', 'is_admin_user', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin_user' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN 'EXISTE' ELSE 'NÃO EXISTE' END
  UNION ALL
  SELECT 51, '3. Funções', 'is_professional_patient_link', CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_professional_patient_link' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN 'EXISTE' ELSE 'NÃO EXISTE' END

  UNION ALL

  -- 5) Contagem (com permissão)
  SELECT 60, '4. Dados', 'Total de linhas', (SELECT COUNT(*)::text FROM public.patient_medical_records)

  UNION ALL

  -- 6) Usuário atual (auth.uid() no SQL Editor pode ser null)
  SELECT 70, '5. Seu usuário', 'auth.uid()', COALESCE(auth.uid()::text, '(null - rode como authenticated)')
  UNION ALL
  SELECT 71, '5. Seu usuário', 'is_admin_user()', COALESCE(public.is_admin_user()::text, 'null')

  UNION ALL

  -- 7) Sua linha em users (se existir)
  SELECT 80, '5. users (você)', u.email, 'type=' || COALESCE(u.type::text,'') || ' flag_admin=' || COALESCE(u.flag_admin::text,'')
  FROM public.users u
  WHERE u.id = auth.uid()

  UNION ALL

  SELECT 99, '---', 'FIM', '✅ Diagnóstico concluído.'
) t
ORDER BY ordem;
