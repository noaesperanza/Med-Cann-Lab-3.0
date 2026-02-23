
-- ================================================================
-- POPULAR PROFESSIONAL_AVAILABILITY COM HORÁRIOS REAIS
-- Dr. Ricardo Valença: 2135f0c0-eb5a-43b1-bc00-5f8dfea13561
-- Dr. Eduardo Faveret: f4a62265-8982-44db-8282-78129c4d014a
-- day_of_week: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
-- ================================================================

-- Limpar disponibilidade antiga (se houver) para esses 2 profissionais
DELETE FROM professional_availability 
WHERE professional_id IN (
  '2135f0c0-eb5a-43b1-bc00-5f8dfea13561',
  'f4a62265-8982-44db-8282-78129c4d014a'
);

-- Dr. Ricardo Valença: Seg-Qua-Sex, 09:00-12:00 e 14:00-17:00, slots de 60min
INSERT INTO professional_availability (professional_id, day_of_week, start_time, end_time, slot_duration, slot_interval_minutes, is_active)
VALUES
  -- Segunda (1)
  ('2135f0c0-eb5a-43b1-bc00-5f8dfea13561', 1, '09:00', '12:00', 60, 60, true),
  ('2135f0c0-eb5a-43b1-bc00-5f8dfea13561', 1, '14:00', '17:00', 60, 60, true),
  -- Quarta (3)
  ('2135f0c0-eb5a-43b1-bc00-5f8dfea13561', 3, '09:00', '12:00', 60, 60, true),
  ('2135f0c0-eb5a-43b1-bc00-5f8dfea13561', 3, '14:00', '17:00', 60, 60, true),
  -- Sexta (5)
  ('2135f0c0-eb5a-43b1-bc00-5f8dfea13561', 5, '09:00', '12:00', 60, 60, true),
  ('2135f0c0-eb5a-43b1-bc00-5f8dfea13561', 5, '14:00', '17:00', 60, 60, true);

-- Dr. Eduardo Faveret: Ter-Qui-Sáb, 08:00-12:00 e 13:00-17:00, slots de 60min
INSERT INTO professional_availability (professional_id, day_of_week, start_time, end_time, slot_duration, slot_interval_minutes, is_active)
VALUES
  -- Terça (2)
  ('f4a62265-8982-44db-8282-78129c4d014a', 2, '08:00', '12:00', 60, 60, true),
  ('f4a62265-8982-44db-8282-78129c4d014a', 2, '13:00', '17:00', 60, 60, true),
  -- Quinta (4)
  ('f4a62265-8982-44db-8282-78129c4d014a', 4, '08:00', '12:00', 60, 60, true),
  ('f4a62265-8982-44db-8282-78129c4d014a', 4, '13:00', '17:00', 60, 60, true),
  -- Sábado (6)
  ('f4a62265-8982-44db-8282-78129c4d014a', 6, '08:00', '12:00', 60, 60, true);
