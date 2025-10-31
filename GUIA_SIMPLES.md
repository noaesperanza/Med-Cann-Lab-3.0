# 🔄 ALTERAÇÃO SIMPLES - USUÁRIO PARA PACIENTE TESTE

## 📋 Execute apenas este SQL no Supabase:

```sql
-- 1. Atualizar o tipo de usuário para 'patient'
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"user_type": "patient"}'::jsonb
WHERE email = 'profrvalenca@gmail.com';

-- 2. Verificar a alteração
SELECT 
    id,
    email,
    raw_user_meta_data->>'user_type' as new_type,
    raw_user_meta_data->>'name' as name
FROM auth.users 
WHERE email = 'profrvalenca@gmail.com';
```

## 🎯 Passos:

1. **Acesse Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole o SQL acima**
4. **Execute**
5. **Verifique se o resultado mostra `new_type: patient`**

## ✅ Resultado Esperado:
- Email: `profrvalenca@gmail.com`
- new_type: `patient`
- name: `Dr. Ricardo Valença` (ou nome atual)

## 🧪 Teste:
1. **Faça logout** do sistema atual
2. **Faça login** com:
   - Email: `profrvalenca@gmail.com`
   - Senha: `123456`
3. **Verifique** se redireciona para dashboard de paciente

## 🎉 Pronto!
Agora você terá um paciente teste para testar o chat e relatórios com o Dr. Eduardo Faveret!
