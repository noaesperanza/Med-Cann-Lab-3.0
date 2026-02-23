/*
  MEDCANNLAB SCHEDULING - EMERGENCY ROLLBACK
  Objetivo: Desfazer as alterações da V1.1 em caso de falha crítica no deploy.
  USO: Rodar apenas se a migração falhar ou causar instabilidade severa.
*/

BEGIN;

-- 1. Remover Funções RPC (Lógica)
DROP FUNCTION IF EXISTS book_appointment(UUID, UUID, TIMESTAMP WITH TIME ZONE, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_available_slots(UUID, DATE, DATE);

-- 2. Remover Tabelas V1.1 (CUIDADO: Perda de Dados de Configuração)
-- Se já houver dados reais, faça backup antes!
DROP TABLE IF EXISTS public.time_blocks;
DROP TABLE IF EXISTS public.professional_availability;

-- 3. Reverter alterações na tabela appointments (Opcional, geralmente seguro manter colunas extras)
-- ALTER TABLE public.appointments DROP COLUMN IF EXISTS availability_id;
-- ALTER TABLE public.appointments DROP COLUMN IF EXISTS canceled_at;
-- ... (Manter colunas costuma ser menos destrutivo que dropar)

COMMIT;
