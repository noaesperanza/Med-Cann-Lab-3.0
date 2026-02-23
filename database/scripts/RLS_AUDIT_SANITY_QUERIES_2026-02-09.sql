-- ============================================================================
-- RLS AUDIT + SANITY QUERIES — MedCannLab
-- Data: 2026-02-09
-- Objetivo: Sinal verde/vermelho por tabela crítica e sanidade de schema.
--
-- Como usar:
-- 1. Rode BLOCO 1 primeiro (sanity): confira que tabelas/views/RPCs = OK.
-- 2. Rode BLOCO 2 três vezes: no app, faça login como admin → SQL Editor (aba
--    anônima ou outra sessão) e rode; depois login como profissional → rode;
--    depois login como paciente → rode. Compare contagens: admin >= prof >= paciente.
-- 3. BLOCO 3: RLS ativo nas tabelas críticas.
-- 4. BLOCO 4: ver quem é o usuário atual (útil ao trocar de perfil).
-- 5. BLOCO 5: resumo (tabelas existem + RLS ativo).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BLOCO 1 — Sanity: tabelas/views/RPCs existem?
-- Rode uma vez (qualquer usuário). Resultado = uma linha por recurso.
-- ----------------------------------------------------------------------------
SELECT '1. SANITY' AS bloco, tipo, nome, CASE WHEN existe THEN 'OK' ELSE 'FALTA' END AS status
FROM (
  SELECT 'tabela' AS tipo, table_name AS nome, TRUE AS existe
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name IN (
      'appointments', 'chat_rooms', 'chat_participants', 'chat_messages',
      'clinical_assessments', 'clinical_reports', 'patient_medical_records',
      'notifications', 'video_call_requests', 'video_call_sessions', 'cfm_prescriptions', 'users'
    )
  UNION ALL
  SELECT 'view', table_name, TRUE
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN ('v_patient_prescriptions', 'v_patient_appointments', 'v_kpi_basic', 'v_doctor_dashboard_kpis', 'v_next_appointments')
  UNION ALL
  SELECT 'rpc', routine_name, TRUE
  FROM information_schema.routines
  WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    AND routine_name IN ('create_chat_room_for_patient_uuid', 'get_chat_participants_for_room', 'create_video_call_notification', 'get_available_slots_v3', 'book_appointment_atomic')
) t
ORDER BY tipo, nome;


-- ----------------------------------------------------------------------------
-- BLOCO 2 — RLS AUDIT: contagem por tabela (com o usuário atual = JWT da sessão)
-- Rode 3 vezes: (1) logado como admin, (2) como profissional, (3) como paciente.
-- Compare: admin deve ver totais maiores; profissional e paciente, subset.
-- ----------------------------------------------------------------------------
SELECT '2. RLS AUDIT (usuário atual)' AS bloco, tabela, contagem, observacao
FROM (
  SELECT 'appointments' AS tabela, (SELECT COUNT(*)::text FROM public.appointments) AS contagem, 'admin: todos; prof: seus; paciente: próprios' AS observacao
  UNION ALL SELECT 'chat_rooms', (SELECT COUNT(*)::text FROM public.chat_rooms), 'quem participa'
  UNION ALL SELECT 'chat_participants', (SELECT COUNT(*)::text FROM public.chat_participants), 'quem participa'
  UNION ALL SELECT 'chat_messages', (SELECT COUNT(*)::text FROM public.chat_messages), 'salas em que participa'
  UNION ALL SELECT 'clinical_assessments', (SELECT COUNT(*)::text FROM public.clinical_assessments), 'admin: todos; prof: seus; paciente: próprios'
  UNION ALL SELECT 'clinical_reports', (SELECT COUNT(*)::text FROM public.clinical_reports), 'idem'
  UNION ALL SELECT 'patient_medical_records', (SELECT COUNT(*)::text FROM public.patient_medical_records), 'idem'
  UNION ALL SELECT 'notifications', (SELECT COUNT(*)::text FROM public.notifications), 'próprias'
  UNION ALL SELECT 'video_call_requests', (SELECT COUNT(*)::text FROM public.video_call_requests), 'requester ou recipient'
  UNION ALL SELECT 'video_call_sessions', (SELECT COUNT(*)::text FROM public.video_call_sessions), 'participante'
  UNION ALL SELECT 'cfm_prescriptions', (SELECT COUNT(*)::text FROM public.cfm_prescriptions), 'admin: todos; prof: suas; paciente: próprias'
  UNION ALL SELECT 'users', (SELECT COUNT(*)::text FROM public.users), 'admin: todos; outros: subset por RLS'
) t
ORDER BY tabela;


-- ----------------------------------------------------------------------------
-- BLOCO 3 — RLS ativo nas tabelas críticas?
-- ----------------------------------------------------------------------------
SELECT '3. RLS ATIVO' AS bloco, c.relname AS tabela,
  CASE WHEN c.relrowsecurity THEN 'SIM' ELSE 'NAO' END AS rls_ativo
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'appointments', 'chat_rooms', 'chat_participants', 'chat_messages',
    'clinical_assessments', 'clinical_reports', 'patient_medical_records',
    'notifications', 'video_call_requests', 'video_call_sessions', 'cfm_prescriptions', 'users'
  )
ORDER BY c.relname;


-- ----------------------------------------------------------------------------
-- BLOCO 4 — Quem sou eu? (útil ao rodar o Bloco 2 em cada perfil)
-- ----------------------------------------------------------------------------
SELECT '4. USUARIO ATUAL' AS bloco,
  auth.uid() AS uid,
  (SELECT email FROM auth.users WHERE id = auth.uid()) AS email,
  (SELECT type FROM public.users WHERE id = auth.uid()) AS type,
  (SELECT flag_admin FROM public.users WHERE id = auth.uid()) AS flag_admin;


-- ----------------------------------------------------------------------------
-- BLOCO 5 — Resumo: tudo OK?
-- Use após rodar Blocos 1–4. Uma linha: se alguma tabela crítica faltar ou RLS inativo, investigar.
-- ----------------------------------------------------------------------------
SELECT '5. RESUMO' AS bloco,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
   AND table_name IN ('appointments','chat_rooms','chat_participants','chat_messages','clinical_assessments','clinical_reports','patient_medical_records','notifications','video_call_requests','video_call_sessions','cfm_prescriptions','users')) AS tabelas_criticas_existem,
  12 AS tabelas_esperadas,
  (SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relrowsecurity = true
   AND c.relname IN ('appointments','chat_rooms','chat_participants','chat_messages','clinical_assessments','clinical_reports','patient_medical_records','notifications','video_call_requests','video_call_sessions','cfm_prescriptions','users')) AS tabelas_com_rls_ativo;
