# 🔧 CORREÇÃO SIMPLES - USUÁRIOS EXISTENTES

## ❌ **ERRO ENCONTRADO**
```
ERROR: 42601: syntax error at or near "["
```
**Causa**: Tentativa de executar JSON como SQL

## ✅ **SOLUÇÃO**

### **Passo 1: Executar Script SQL**
Copie e cole este código no Supabase SQL Editor:

```sql
-- CORREÇÃO DOS USUÁRIOS EXISTENTES
-- Execute este script no Supabase SQL Editor

-- 1. Corrigir passosmir4@gmail.com (paciente)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"patient"'::jsonb
)
WHERE id = 'df6cee2d-2697-47eb-9ae2-f4d439df711f';

-- 2. Corrigir phpg69@gmail.com (admin)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"admin"'::jsonb
)
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';

-- 3. Corrigir rrvlenca@gmail.com (profissional)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE id = '659ed341-74ac-413e-b708-332aff3e75bf';

-- 4. Verificar resultado
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as tipo_corrigido,
    raw_user_meta_data
FROM auth.users 
WHERE id IN (
    'df6cee2d-2697-47eb-9ae2-f4d439df711f',
    '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
    '659ed341-74ac-413e-b708-332aff3e75bf'
);
```

### **Passo 2: Verificar Resultado**
Após executar, você deve ver:
```
id                                   | email                | tipo_corrigido
df6cee2d-2697-47eb-9ae2-f4d439df711f | passosmir4@gmail.com | patient
5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8 | phpg69@gmail.com     | admin
659ed341-74ac-413e-b708-332aff3e75bf | rrvlenca@gmail.com   | professional
```

### **Passo 3: Testar Login**
1. **passosmir4@gmail.com** → Dashboard de Paciente
2. **phpg69@gmail.com** → Dashboard Admin
3. **rrvlenca@gmail.com** → Dashboard Profissional

## 🎯 **RESULTADO ESPERADO**
- ✅ Login funciona corretamente
- ✅ Redirecionamento baseado no tipo
- ✅ Painel de debug mostra tipos corretos
