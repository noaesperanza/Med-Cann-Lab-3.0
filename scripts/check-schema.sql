SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('exam_request_templates', 'patient_exam_requests');
