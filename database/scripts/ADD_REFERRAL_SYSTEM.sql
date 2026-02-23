-- ==============================================================================
-- 🚀 ADD_REFERRAL_SYSTEM.sql
-- Objetivo: Adicionar colunas para rastreamento de indicações (Referral System)
-- Data: 02/02/2026
-- ==============================================================================

-- 1. Adicionar colunas na tabela USERS
-- 'referral_code': O código único deste usuário (ex: 'RICARDO-8X92')
-- 'invited_by': O ID do usuário que indicou este usuário (quem ganha a comissão)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES public.users(id);

-- 2. Criar Index para performance (buscas rápidas por código ou por quem indicou)
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_invited_by ON public.users(invited_by);

-- 3. Função para gerar código de referral aleatório na criação do usuário
-- (Será chamada via Trigger ou pela Aplicação)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. (Opcional) Trigger para gerar código automaticamente se for NULL
CREATE OR REPLACE FUNCTION set_referral_code_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    -- Gera um código simples baseado no nome + random, ou apenas random
    NEW.referral_code := upper(substring(NEW.name from 1 for 3)) || '-' || upper(substring(md5(random()::text) from 1 for 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_referral_code ON public.users;
CREATE TRIGGER tr_set_referral_code
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION set_referral_code_on_insert();

-- 5. Confirmação
SELECT '✅ Sistema de Referral (Colunas e Trigger) adicionado com sucesso!' as result;
