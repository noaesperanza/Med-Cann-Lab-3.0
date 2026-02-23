/*
  MEDCANNLAB SCHEDULING DIAGNOSTICS
  Objetivo: Queries prontas para debug, auditoria e suporte N2/N3.
*/

-- 1. VERIFICAR INTEGRIDADE DA AGENDA (Slots livres vs Agendados)
-- Lista agendamentos futuros e seus status
SELECT 
    a.appointment_date,
    a.status,
    a.title,
    p.email as professional_email,
    patient.email as patient_email
FROM appointments a
JOIN auth.users p ON a.professional_id = p.id
JOIN auth.users patient ON a.patient_id = patient.id
WHERE a.appointment_date >= NOW()
ORDER BY a.appointment_date ASC;

-- 2. INVESTIGAR BLOQUEIOS (Quem bloqueou e por quê)
SELECT * FROM time_blocks 
WHERE end_at > NOW() 
ORDER BY start_at ASC;

-- 3. AUDITAR REGRAS DE DISPONIBILIDADE ATIVAS
SELECT 
    u.email,
    pa.day_of_week,
    pa.start_time,
    pa.end_time
FROM professional_availability pa
JOIN auth.users u ON pa.professional_id = u.id
WHERE pa.is_active = TRUE
ORDER BY u.email, pa.day_of_week;

-- 4. CONFERÊNCIA DE CONFLITOS (Double Booking Check)
-- Esta query não deve retornar nada em um sistema saudável.
SELECT 
    a1.id as appt_1, 
    a2.id as appt_2, 
    a1.appointment_date, 
    a1.professional_id
FROM appointments a1
JOIN appointments a2 ON a1.professional_id = a2.professional_id
WHERE a1.id <> a2.id
  AND a1.appointment_date = a2.appointment_date
  AND a1.status IN ('scheduled', 'confirmed')
  AND a2.status IN ('scheduled', 'confirmed');

-- 5. ANALISAR ADVISORY LOCKS (Apenas Superuser ou via Dashboard Supabase)
-- SELECT * FROM pg_locks WHERE locktype = 'advisory';
