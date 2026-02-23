-- Avaliações da conversa (paciente avalia 0-5 estrelas após avaliação clínica / atendimento).
-- Usado para: card "Avalie a conversa" no dashboard; cálculo de ranking a cada 50 avaliações.
CREATE TABLE IF NOT EXISTS public.conversation_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  context text NOT NULL DEFAULT 'noa' CHECK (context IN ('noa', 'professional', 'consultation')),
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_ratings_patient ON public.conversation_ratings(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversation_ratings_professional ON public.conversation_ratings(professional_id);
CREATE INDEX IF NOT EXISTS idx_conversation_ratings_created ON public.conversation_ratings(created_at DESC);

ALTER TABLE public.conversation_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pacientes podem inserir própria avaliação" ON public.conversation_ratings;
CREATE POLICY "Pacientes podem inserir própria avaliação" ON public.conversation_ratings
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Usuários autenticados podem ler avaliações" ON public.conversation_ratings;
CREATE POLICY "Usuários autenticados podem ler avaliações" ON public.conversation_ratings
  FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.conversation_ratings IS 'Avaliações 1-5 estrelas da conversa/atendimento (Nôa ou profissional). Base para ranking e média de estrelas.';
