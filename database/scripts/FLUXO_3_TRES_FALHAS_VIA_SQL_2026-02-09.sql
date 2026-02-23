-- ============================================================================
-- FLUXO 3 (Três falhas) — Testes via SQL
-- Data: 2026-02-09
-- Objetivo: Validar por SQL o que der: (1) idempotência do chat, (2) estados
-- de video, (3) preparação RLS. Rode no Supabase SQL Editor.
--
-- FLUXO 3 RESUMO (como interpretar os resultados):
--   passo_1 — 3.1 Idempotência: veja query 3.1 (idempotente = OK).
--   passo_2 — 3.2 Video: veja query 3.2 (rejected/expired ou testar na UI).
--   passo_3 — 3.3 RLS: veja query 3.3 + rodar Bloco 2 do RLS_AUDIT como 3 perfis.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 IDEMPOTÊNCIA DO CHAT — "50 cliques = 1 sala"
-- Chama create_chat_room_for_patient_uuid 5 vezes com o mesmo par; esperado: mesmo room_id.
-- Troque os UUIDs por um patient_id e professional_id REAIS do seu banco.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_patient_id    UUID := (SELECT u.id FROM public.users u WHERE u.type IN ('paciente','patient') AND EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id) LIMIT 1);
  v_professional_id UUID := (SELECT u.id FROM public.users u WHERE u.type IN ('profissional','professional') AND EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id) LIMIT 1);
  v_room_1 UUID; v_room_2 UUID; v_room_3 UUID; v_room_4 UUID; v_room_5 UUID;
  v_rooms_count INT; v_participants_count INT;
BEGIN
  IF v_patient_id IS NULL OR v_professional_id IS NULL THEN
    RAISE NOTICE '3.1 CHAT: Ignorado — não há paciente ou profissional em public.users. Insira UUIDs manualmente.';
    RETURN;
  END IF;

  v_room_1 := public.create_chat_room_for_patient_uuid(v_patient_id, v_professional_id);
  v_room_2 := public.create_chat_room_for_patient_uuid(v_patient_id, v_professional_id);
  v_room_3 := public.create_chat_room_for_patient_uuid(v_patient_id, v_professional_id);
  v_room_4 := public.create_chat_room_for_patient_uuid(v_patient_id, v_professional_id);
  v_room_5 := public.create_chat_room_for_patient_uuid(v_patient_id, v_professional_id);

  SELECT COUNT(DISTINCT cr.id), (SELECT COUNT(*) FROM public.chat_participants cp WHERE cp.room_id = v_room_1)
  INTO v_rooms_count, v_participants_count
  FROM public.chat_rooms cr
  WHERE cr.id IN (v_room_1, v_room_2, v_room_3, v_room_4, v_room_5);

  IF v_room_1 = v_room_2 AND v_room_2 = v_room_3 AND v_room_3 = v_room_4 AND v_room_4 = v_room_5
     AND v_rooms_count = 1 AND v_participants_count = 2 THEN
    RAISE NOTICE '3.1 CHAT IDEMPOTÊNCIA: OK — 5 chamadas = 1 sala, 2 participantes.';
  ELSE
    RAISE WARNING '3.1 CHAT IDEMPOTÊNCIA: FALHOU — room_ids iguais? % | 1 sala? % | 2 participantes? %',
      (v_room_1 = v_room_2 AND v_room_2 = v_room_3 AND v_room_3 = v_room_4 AND v_room_4 = v_room_5), (v_rooms_count = 1), (v_participants_count = 2);
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 3.1 (resultado em tabela) — mesmo par (paciente, profissional), 3 chamadas
-- Depende de existir pelo menos 1 paciente e 1 profissional em public.users.
-- Se não houver linhas, troque por UUIDs fixos em params (ex.: 'uuid-paciente', 'uuid-prof').
-- ----------------------------------------------------------------------------
WITH params AS (
  SELECT p.id AS pid, pro.id AS proid
  FROM (SELECT u.id FROM public.users u WHERE u.type IN ('paciente','patient') AND EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id) LIMIT 1) p
  CROSS JOIN (SELECT u.id FROM public.users u WHERE u.type IN ('profissional','professional') AND EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id) LIMIT 1) pro
  WHERE p.id IS NOT NULL AND pro.id IS NOT NULL
),
calls AS (
  SELECT public.create_chat_room_for_patient_uuid(p.pid, p.proid) AS room_id FROM params p
  UNION ALL SELECT public.create_chat_room_for_patient_uuid(p.pid, p.proid) FROM params p
  UNION ALL SELECT public.create_chat_room_for_patient_uuid(p.pid, p.proid) FROM params p
)
SELECT '3.1 CHAT IDEMPOTÊNCIA' AS teste,
  (array_agg(room_id))[1] AS room_id,
  COUNT(DISTINCT room_id) AS quantos_room_ids_distintos,
  CASE WHEN COUNT(DISTINCT room_id) = 1 THEN 'OK' ELSE 'FALHA' END AS idempotente,
  (SELECT COUNT(*) FROM public.chat_participants cp WHERE cp.room_id = (SELECT (array_agg(c.room_id))[1] FROM calls c)) AS participantes_na_sala
FROM calls;


-- ----------------------------------------------------------------------------
-- 3.2 VIDEO — Estados rejected/expired existem e tabela aceita
-- (Não altera dados reais; só consulta.)
-- ----------------------------------------------------------------------------
SELECT '3.2 VIDEO ESTADOS' AS teste,
  (SELECT COUNT(*) FROM public.video_call_requests WHERE status = 'pending')   AS pending,
  (SELECT COUNT(*) FROM public.video_call_requests WHERE status = 'accepted')  AS accepted,
  (SELECT COUNT(*) FROM public.video_call_requests WHERE status = 'rejected')  AS rejected,
  (SELECT COUNT(*) FROM public.video_call_requests WHERE status = 'expired')   AS expired,
  CASE WHEN EXISTS (SELECT 1 FROM public.video_call_requests WHERE status IN ('rejected','expired'))
       THEN 'OK — rejeição/expirado usados' ELSE 'Nenhum rejected/expired ainda (testar na UI)' END AS observacao;


-- ----------------------------------------------------------------------------
-- 3.3 RLS — Verificações que não exigem trocar de usuário
-- (O teste completo é rodar Bloco 2 do RLS_AUDIT como admin, prof e paciente.)
-- ----------------------------------------------------------------------------
SELECT '3.3 RLS PREPARAÇÃO' AS teste, item, status
FROM (
  SELECT 1 AS ord, 'is_admin_user existe' AS item,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'is_admin_user')
         THEN 'OK' ELSE 'FALTA' END AS status
  UNION ALL
  SELECT 2, 'is_chat_room_member existe',
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'is_chat_room_member')
         THEN 'OK' ELSE 'FALTA' END
  UNION ALL
  SELECT 3, 'Políticas em patient_medical_records',
    (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public' AND tablename = 'patient_medical_records') || ' políticas'
  UNION ALL
  SELECT 4, 'Políticas em chat_rooms',
    (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public' AND tablename = 'chat_rooms') || ' políticas'
  UNION ALL
  SELECT 5, 'RLS ativo em patient_medical_records',
    CASE WHEN (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'patient_medical_records')
         THEN 'OK' ELSE 'NAO' END
) t
ORDER BY ord;


-- ----------------------------------------------------------------------------
-- RESUMO FLUXO 3
-- 3.1: idempotência = resultado do SELECT acima (idempotente = OK).
-- 3.2: video = tabela tem rejected/expired ou "testar na UI".
-- 3.3: RLS completo = rodar RLS_AUDIT_SANITY_QUERIES Bloco 2 como admin, prof, paciente.
-- ----------------------------------------------------------------------------
SELECT 'FLUXO 3 RESUMO' AS bloco,
  '3.1 Idempotência: veja query 3.1 (idempotente = OK)' AS passo_1,
  '3.2 Video: veja query 3.2 (rejected/expired ou testar na UI)' AS passo_2,
  '3.3 RLS: veja query 3.3 + rodar Bloco 2 do RLS_AUDIT como 3 perfis' AS passo_3;
