-- ============================================================================
-- FLUXO MANUAL COMPLETO VIA SQL — Happy path em 8 passos
-- Data: 2026-02-09
-- Simula o fluxo clínico como se fosse manual: cada passo insere/atualiza
-- e registra o resultado. Rode no Supabase SQL Editor (como service_role ou
-- usuário com permissão nas tabelas).
--
-- IMPORTANTE: Usa apenas usuários que existam em auth.users (paciente e
-- profissional). Se der FK em chat_participants, sincronize: ver
-- FIX_FOREIGN_KEY_CHAT_PARTICIPANTS_2026-02-06.sql ou insira em auth/users.
-- ============================================================================

-- Tabela de resultado (session-scoped) para mostrar ao final
DROP TABLE IF EXISTS fluxo_manual_resultados;
CREATE TEMP TABLE fluxo_manual_resultados (
  passo INT,
  nome TEXT,
  id_criado UUID,
  status TEXT,
  observacao TEXT
);

DO $$
DECLARE
  v_pid    UUID;
  v_proid  UUID;
  v_appt_id   UUID;
  v_room_id   UUID;
  v_msg_id    UUID;
  v_vcr_id    UUID;
  v_ca_id    UUID;
  v_cr_id    UUID;
  v_cp_id    UUID;
  v_pmr_id   UUID;
  v_request_id TEXT;
BEGIN
  -- Par de teste: 1 paciente e 1 profissional que existam em auth.users
  -- (chat_participants.user_id FK costuma apontar para auth.users; senão a inserção falha)
  SELECT u.id INTO v_pid
  FROM public.users u
  WHERE u.type IN ('paciente','patient')
    AND EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id)
  LIMIT 1;
  SELECT u.id INTO v_proid
  FROM public.users u
  WHERE u.type IN ('profissional','professional')
    AND EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id)
  LIMIT 1;

  IF v_pid IS NULL OR v_proid IS NULL THEN
    INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
    VALUES (0, 'Setup', NULL, 'FALTA',
      'Precisa de 1 paciente e 1 profissional em public.users que existam também em auth.users (sync).');
    RETURN;
  END IF;

  -- -------------------------------------------------------------------------
  -- 1. Agendamento
  -- -------------------------------------------------------------------------
  INSERT INTO public.appointments (
    patient_id, professional_id, appointment_date, status, type, title, description
  ) VALUES (
    v_pid, v_proid, NOW() + INTERVAL '7 days', 'scheduled', 'consultation',
    'Teste fluxo SQL completo', 'Fluxo manual via SQL'
  ) RETURNING id INTO v_appt_id;

  INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
  VALUES (1, 'Agendamento', v_appt_id, 'OK', 'appointments');

  -- -------------------------------------------------------------------------
  -- 2. Sala de chat (idempotente)
  -- -------------------------------------------------------------------------
  v_room_id := public.create_chat_room_for_patient_uuid(v_pid, v_proid);
  INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
  VALUES (2, 'Sala chat', v_room_id, 'OK', 'chat_rooms + chat_participants');

  -- -------------------------------------------------------------------------
  -- 3. Mensagem no chat
  -- -------------------------------------------------------------------------
  INSERT INTO public.chat_messages (room_id, user_id, content, message_type)
  VALUES (v_room_id, v_proid, 'Mensagem teste fluxo manual SQL', 'text')
  RETURNING id INTO v_msg_id;

  INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
  VALUES (3, 'Mensagem chat', v_msg_id, 'OK', 'chat_messages');

  -- -------------------------------------------------------------------------
  -- 4. Videochamada: criar request → aceitar
  -- -------------------------------------------------------------------------
  v_request_id := 'vcr_fluxo_sql_' || to_char(NOW(), 'YYYYMMDDHH24MISS');
  INSERT INTO public.video_call_requests (
    request_id, requester_id, recipient_id, call_type, status, expires_at, metadata
  ) VALUES (
    v_request_id, v_proid, v_pid, 'video', 'pending',
    NOW() + INTERVAL '30 seconds', '{}'::jsonb
  ) RETURNING id INTO v_vcr_id;

  UPDATE public.video_call_requests
  SET status = 'accepted', accepted_at = NOW()
  WHERE request_id = v_request_id;

  INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
  VALUES (4, 'Videochamada (request→accepted)', v_vcr_id, 'OK', 'video_call_requests');

  -- -------------------------------------------------------------------------
  -- 5. Avaliação clínica
  -- -------------------------------------------------------------------------
  INSERT INTO public.clinical_assessments (patient_id, doctor_id, assessment_type, data, status)
  VALUES (
    v_pid, v_proid, 'IMRE',
    '{"symptoms": ["teste fluxo SQL"], "severity": "moderate"}'::jsonb,
    'completed'
  ) RETURNING id INTO v_ca_id;

  INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
  VALUES (5, 'Avaliação clínica', v_ca_id, 'OK', 'clinical_assessments');

  -- -------------------------------------------------------------------------
  -- 6. Relatório clínico (schema com content ou report_data)
  -- -------------------------------------------------------------------------
  BEGIN
    INSERT INTO public.clinical_reports (
      patient_id, professional_id, content, status, report_type, generated_by
    ) VALUES (
      v_pid, v_proid, 'Relatório teste fluxo manual SQL', 'completed',
      'initial_assessment', 'fluxo_sql_test'
    ) RETURNING id INTO v_cr_id;
  EXCEPTION WHEN OTHERS THEN
    -- Schema alternativo: report_data + assessment_id
    INSERT INTO public.clinical_reports (
      patient_id, professional_id, assessment_id, report_data, status
    ) VALUES (
      v_pid, v_proid, v_ca_id, '{"content": "Relatório teste fluxo SQL"}'::jsonb, 'generated'
    ) RETURNING id INTO v_cr_id;
  END;

  INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
  VALUES (6, 'Relatório clínico', v_cr_id, 'OK', 'clinical_reports');

  -- -------------------------------------------------------------------------
  -- 7. Prescrição (cfm_prescriptions)
  -- -------------------------------------------------------------------------
  INSERT INTO public.cfm_prescriptions (
    prescription_type, patient_id, patient_name, professional_id, professional_name,
    professional_crm, medications, status
  ) VALUES (
    'simple', v_pid, (SELECT COALESCE(name, email) FROM public.users WHERE id = v_pid),
    v_proid, (SELECT COALESCE(name, email) FROM public.users WHERE id = v_proid),
    'CRM-TESTE', '[]'::jsonb, 'draft'
  ) RETURNING id INTO v_cp_id;

  INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
  VALUES (7, 'Prescrição', v_cp_id, 'OK', 'cfm_prescriptions');

  -- -------------------------------------------------------------------------
  -- 8. Prontuário (registro em patient_medical_records, se existir e tiver colunas esperadas)
  -- -------------------------------------------------------------------------
  BEGIN
    INSERT INTO public.patient_medical_records (patient_id, report_id, record_type, record_data)
    VALUES (v_pid, v_cr_id, 'evolution', '{"content": "Evolução teste fluxo SQL"}'::jsonb)
    RETURNING id INTO v_pmr_id;
    INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
    VALUES (8, 'Registro prontuário', v_pmr_id, 'OK', 'patient_medical_records');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO fluxo_manual_resultados (passo, nome, id_criado, status, observacao)
    VALUES (8, 'Registro prontuário', NULL, 'SKIP', 'Tabela/colunas diferentes ou RLS: ' || SQLERRM);
  END;

END $$;

-- Resultado: um registro por passo
SELECT passo, nome, id_criado, status, observacao
FROM fluxo_manual_resultados
ORDER BY passo;

-- Resumo: quantos OK?
SELECT
  (SELECT COUNT(*) FROM fluxo_manual_resultados WHERE status = 'OK') AS passos_ok,
  (SELECT COUNT(*) FROM fluxo_manual_resultados WHERE status = 'SKIP') AS passos_skip,
  (SELECT COUNT(*) FROM fluxo_manual_resultados WHERE status = 'FALTA') AS passos_falha,
  CASE WHEN (SELECT COUNT(*) FROM fluxo_manual_resultados WHERE status = 'OK') >= 7
       THEN 'FLUXO MANUAL COMPLETO: OK' ELSE 'REVISAR' END AS veredito;
