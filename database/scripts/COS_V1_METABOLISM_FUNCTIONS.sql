-- 📜 COS v1.0: FUNÇÕES RPC DE METABOLISMO
-- Orquestrado por Pedro Henrique Passos Galluf

-- 1. Função para incrementar o metabolismo e garantir existência do registro
CREATE OR REPLACE FUNCTION public.increment_metabolism(p_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.cognitive_metabolism (professional_id, decision_count_today, last_interaction_at)
    VALUES (p_id, 1, NOW())
    ON CONFLICT (professional_id) DO UPDATE
    SET 
        decision_count_today = public.cognitive_metabolism.decision_count_today + 1,
        last_interaction_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Garantir que professional_id seja único na tabela de metabolismo para o ON CONFLICT funcionar
-- Nota: Se já existir dado, pode falhar. Ideal rodar no setup inicial.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cognitive_metabolism_professional_id_key'
    ) THEN
        ALTER TABLE public.cognitive_metabolism ADD CONSTRAINT cognitive_metabolism_professional_id_key UNIQUE (professional_id);
    END IF;
END $$;
