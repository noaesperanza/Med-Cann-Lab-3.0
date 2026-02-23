-- Criar Pacientes de Teste (Mock Data) para Validação do Sistema
-- Insere usuários apenas se não existirem (baseado no email)

INSERT INTO public.users (id, email, name, type, role, created_at, phone, gender, birth_date)
VALUES 
    (uuid_generate_v4(), 'joao.silva@exemplo.com', 'João da Silva', 'paciente', 'user', NOW(), '(11) 99999-0001', 'Masculino', '1980-05-15'),
    (uuid_generate_v4(), 'maria.santos@exemplo.com', 'Maria Santos Oliveira', 'paciente', 'user', NOW(), '(11) 99999-0002', 'Feminino', '1975-10-20'),
    (uuid_generate_v4(), 'carlos.pereira@exemplo.com', 'Carlos Pereira Júnior', 'paciente', 'user', NOW(), '(21) 98888-0003', 'Masculino', '1962-03-10'),
    (uuid_generate_v4(), 'ana.costa@exemplo.com', 'Ana Costa e Silva', 'paciente', 'user', NOW(), '(31) 97777-0004', 'Feminino', '1990-12-05'),
    (uuid_generate_v4(), 'roberto.almeida@exemplo.com', 'Roberto Almeida', 'paciente', 'user', NOW(), '(41) 96666-0005', 'Masculino', '1985-07-25')
ON CONFLICT (email) DO NOTHING;

-- Verificar inserção
SELECT name, email, type FROM public.users WHERE type = 'paciente';
