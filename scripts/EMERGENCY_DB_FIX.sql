-- 1. Inspecionar colunas de appointments (para ver se title é realmente required e o que mais falta)
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';

-- 2. Criar tabela de prescrições se não existir (para corrigir o erro 404)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    professional_id UUID REFERENCES auth.users(id),
    patient_id UUID REFERENCES auth.users(id),
    medication TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para prescrições
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Política simples: Profissionais veem e criam tudo (por enquanto, para não travar)
CREATE POLICY "Profissionais podem gerenciar prescricoes" 
ON public.prescriptions 
FOR ALL 
USING (auth.uid() IN (SELECT id FROM public.users WHERE type IN ('professional', 'admin')));

-- Pacientes veem suas próprias
CREATE POLICY "Pacientes veem suas prescricoes" 
ON public.prescriptions 
FOR SELECT 
USING (auth.uid() = patient_id);
