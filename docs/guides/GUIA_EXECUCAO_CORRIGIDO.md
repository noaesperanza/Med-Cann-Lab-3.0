# 🔧 GUIA DE EXECUÇÃO - CORREÇÃO DO SISTEMA DE LOGIN

## ❌ **ERRO ENCONTRADO**
```
ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## ✅ **SOLUÇÃO**

### **Opção 1: Script Simplificado (Recomendado)**
Execute o arquivo `FIX_USER_TYPES_SIMPLE.sql` que não usa `ON CONFLICT`:

```sql
-- Execute apenas as consultas de atualização
-- Não tenta criar usuários novos (use a interface da aplicação)
```

### **Opção 2: Executar Consultas Individuais**
Execute cada consulta separadamente no Supabase SQL Editor:

#### **1. Verificar usuários existentes:**
```sql
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as current_type,
    raw_user_meta_data->>'name' as current_name,
    created_at
FROM auth.users 
ORDER BY created_at DESC;
```

#### **2. Corrigir Dr. Ricardo Valença:**
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE email = 'rrvalenca@gmail.com';
```

#### **3. Corrigir Dr. Eduardo Faveret:**
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"professional"'::jsonb
)
WHERE email = 'eduardoscfaveret@gmail.com';
```

#### **4. Corrigir Admin:**
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{type}', 
    '"admin"'::jsonb
)
WHERE email = 'admin@medcannlab.com';
```

#### **5. Verificar resultado:**
```sql
SELECT 
    id,
    email,
    raw_user_meta_data->>'type' as type_after_update,
    raw_user_meta_data->>'name' as name_after_update
FROM auth.users 
WHERE email IN ('rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com', 'admin@medcannlab.com');
```

## 🧪 **TESTE APÓS CORREÇÃO**

### **1. Teste com Dr. Ricardo Valença**
- **Email**: `rrvalenca@gmail.com`
- **Senha**: `[sua senha]`
- **Resultado esperado**: Redirecionamento para `/app/professional-dashboard`

### **2. Teste com Dr. Eduardo Faveret**
- **Email**: `eduardoscfaveret@gmail.com`
- **Senha**: `Eduardo2025!`
- **Resultado esperado**: Redirecionamento para `/app/professional-dashboard`

### **3. Teste com Admin**
- **Email**: `admin@medcannlab.com`
- **Senha**: `admin123`
- **Resultado esperado**: Redirecionamento para `/app/dashboard`

### **4. Criar usuários de teste**
Use a interface de registro da aplicação para criar:
- **Paciente**: Tipo `patient` → `/app/patient-dashboard`
- **Estudante**: Tipo `student` → `/app/student-dashboard`

## 🔍 **USAR PAINEL DE DEBUG**

1. Abra a aplicação em modo desenvolvimento
2. Faça login com qualquer usuário
3. Observe o painel de debug no canto inferior direito
4. Verifique se o tipo está correto
5. Confirme se o redirecionamento está funcionando

## 📊 **RESULTADO ESPERADO**

Após executar as correções:

- ✅ **Dr. Ricardo** → Dashboard Profissional
- ✅ **Dr. Eduardo** → Dashboard Profissional  
- ✅ **Admin** → Dashboard Administrativo
- ✅ **Novos usuários** → Dashboard correto baseado no tipo

## 🚨 **SE AINDA HOUVER PROBLEMAS**

### **Problema: Tipo ainda não está correto**
**Solução**: 
1. Verifique se o UPDATE foi executado com sucesso
2. Confirme se o email está correto
3. Execute a consulta de verificação novamente

### **Problema: Redirecionamento não funciona**
**Solução**:
1. Verifique se as rotas existem no App.tsx
2. Confirme se os dashboards estão implementados
3. Use o painel de debug para diagnosticar

### **Problema: Painel de debug não aparece**
**Solução**:
1. Confirme que está em modo desenvolvimento
2. Verifique se o componente foi importado corretamente
3. Recarregue a página

---

**Status**: ✅ Script corrigido e pronto para execução
**Próximo passo**: Executar as consultas SQL e testar o login
