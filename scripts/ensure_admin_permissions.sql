-- SOLUÇÃO DEFINITIVA PARA LOGIN DE ADMIN
-- Este script cria um gatilho (trigger) que verifica se o novo usuário é 'phpg69@gmail.com'
-- Se for, ele força o tipo 'admin' automaticamente.

-- 1. Função que será executada ao inserir novo usuário
CREATE OR REPLACE FUNCTION public.force_admin_for_specific_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o email for o do Ricardo Valença (Admin)
    IF NEW.email = 'phpg69@gmail.com' THEN
        NEW.type := 'admin';
        NEW.role := 'admin';
        NEW.name := 'Ricardo Valença - Admin';
        RAISE NOTICE 'Admin permissions granted automatically to %', NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover trigger antigo se existir para evitar duplicação
DROP TRIGGER IF EXISTS tr_force_admin_email ON public.users;

-- 3. Criar o Trigger na tabela public.users
CREATE TRIGGER tr_force_admin_email
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.force_admin_for_specific_email();

-- 4. Confirmação
DO $$
BEGIN
    RAISE NOTICE 'Sistema de Auto-Admin configurado com sucesso.';
    RAISE NOTICE 'Agora basta se cadastrar (Sign Up) com phpg69@gmail.com';
END $$;
