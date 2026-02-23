-- Criação da tabela de Templates de Exames (Biblioteca)
CREATE TABLE IF NOT EXISTS public.exam_request_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Conteúdo do modelo (HTML ou Texto)
    category TEXT DEFAULT 'Geral', -- Categoria (Laboratorial, Imagem, etc)
    is_public BOOLEAN DEFAULT false, -- Se true, visível para todos da clínica
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para busca rápida por título
CREATE INDEX IF NOT EXISTS idx_exam_templates_title ON public.exam_request_templates(title);

-- RLS: Templates
ALTER TABLE public.exam_request_templates ENABLE ROW LEVEL SECURITY;

-- Política: Profissionais podem ver templates públicos OU seus próprios
CREATE POLICY "Profissionais veem templates públicos ou próprios" 
ON public.exam_request_templates FOR SELECT 
USING (
    is_public = true OR 
    auth.uid() = created_by
);

-- Política: Profissionais podem criar templates
CREATE POLICY "Profissionais podem criar templates" 
ON public.exam_request_templates FOR INSERT 
WITH CHECK (
    auth.uid() = created_by
);

-- Política: Profissionais podem editar seus próprios templates
CREATE POLICY "Profissionais editam seus templates" 
ON public.exam_request_templates FOR UPDATE 
USING (auth.uid() = created_by);

-- Política: Profissionais podem deletar seus próprios templates
CREATE POLICY "Profissionais deletam seus templates" 
ON public.exam_request_templates FOR DELETE 
USING (auth.uid() = created_by);


-- -----------------------------------------------------------------------------


-- Criação da tabela de Solicitações de Exames (Histórico do Paciente)
CREATE TABLE IF NOT EXISTS public.patient_exam_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.users(id) NOT NULL,
    professional_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL, -- O texto final da solicitação
    status TEXT DEFAULT 'draft', -- 'draft', 'signed', 'cancelled'
    
    -- Campos para Assinatura Digital
    signature_token TEXT, -- Token retornado pela API de assinatura
    signed_pdf_url TEXT, -- URL do PDF assinado no Storage
    signed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para buscar exames de um paciente rapidamente
CREATE INDEX IF NOT EXISTS idx_patient_exams_patient_id ON public.patient_exam_requests(patient_id);

-- RLS: Requests
ALTER TABLE public.patient_exam_requests ENABLE ROW LEVEL SECURITY;

-- Política: Profissionais veem pedidos que eles criaram (ou todos, dependendo da regra da clínica)
-- Assumindo aqui que o prontuário é compartilhado, então PROFISSIONAIS veem de TODOS os pacientes
CREATE POLICY "Profissionais veem todos os pedidos de exame" 
ON public.patient_exam_requests FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND type IN ('profissional', 'admin')
    )
);

-- Política: Pacientes veem APENAS seus próprios pedidos
CREATE POLICY "Pacientes veem seus proprios pedidos" 
ON public.patient_exam_requests FOR SELECT 
USING (
    auth.uid() = patient_id
);

-- Política: Profissionais criam pedidos
CREATE POLICY "Profissionais criam pedidos" 
ON public.patient_exam_requests FOR INSERT 
WITH CHECK (
    auth.uid() = professional_id
);

-- Política: Profissionais editam pedidos APENAS se ainda forem rascunho (draft)
CREATE POLICY "Profissionais editam rascunhos" 
ON public.patient_exam_requests FOR UPDATE 
USING (
    auth.uid() = professional_id AND status = 'draft'
);
