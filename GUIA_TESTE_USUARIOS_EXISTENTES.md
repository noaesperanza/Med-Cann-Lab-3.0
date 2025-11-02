# 🧪 GUIA DE TESTE - USUÁRIOS EXISTENTES CORRIGIDOS

## 📊 **USUÁRIOS ENCONTRADOS NO BANCO**

Baseado na consulta executada, encontramos 3 usuários:

### **1. passosmir4@gmail.com**
- **ID**: `df6cee2d-2697-47eb-9ae2-f4d439df711f`
- **Tipo definido**: `patient`
- **Redirecionamento esperado**: `/app/patient-dashboard`

### **2. phpg69@gmail.com**
- **ID**: `5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8`
- **Tipo definido**: `admin`
- **Redirecionamento esperado**: `/app/dashboard`

### **3. rrvlenca@gmail.com**
- **ID**: `659ed341-74ac-413e-b708-332aff3e75bf`
- **Tipo definido**: `professional`
- **Redirecionamento esperado**: `/app/professional-dashboard`
- **Nota**: Parece ser o Dr. Ricardo Valença com email ligeiramente diferente

---

## 🔧 **EXECUTAR CORREÇÕES**

### **Passo 1: Executar Script SQL**
Execute o arquivo `CORRIGIR_USUARIOS_EXISTENTES.sql` no Supabase SQL Editor.

### **Passo 2: Verificar Resultado**
Após executar, você deve ver algo como:
```sql
id                                   | email                | type_after_update | name_after_update
df6cee2d-2697-47eb-9ae2-f4d439df711f | passosmir4@gmail.com | patient          | null
5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8 | phpg69@gmail.com     | admin            | null
659ed341-74ac-413e-b708-332aff3e75bf | rrvlenca@gmail.com   | professional     | null
```

---

## 🧪 **TESTAR LOGIN**

### **Teste 1: Paciente**
- **Email**: `passosmir4@gmail.com`
- **Senha**: `[sua senha]`
- **Resultado esperado**: 
  - ✅ Redirecionamento para `/app/patient-dashboard`
  - ✅ Painel de debug mostra tipo `patient`

### **Teste 2: Admin**
- **Email**: `phpg69@gmail.com`
- **Senha**: `[sua senha]`
- **Resultado esperado**:
  - ✅ Redirecionamento para `/app/dashboard`
  - ✅ Painel de debug mostra tipo `admin`

### **Teste 3: Profissional**
- **Email**: `rrvlenca@gmail.com`
- **Senha**: `[sua senha]`
- **Resultado esperado**:
  - ✅ Redirecionamento para `/app/professional-dashboard`
  - ✅ Painel de debug mostra tipo `professional`

---

## 🔍 **USAR PAINEL DE DEBUG**

1. **Abra a aplicação** em modo desenvolvimento
2. **Faça login** com qualquer um dos usuários acima
3. **Observe o painel de debug** no canto inferior direito
4. **Verifique se**:
   - Tipo detectado está correto
   - Redirecionamento esperado está correto
   - Metadados mostram o tipo definido

---

## 📝 **ADICIONAR NOMES (OPCIONAL)**

Se quiser adicionar nomes aos usuários, execute:

```sql
-- Adicionar nome ao paciente
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{name}', 
    '"Paciente Passos"'::jsonb
)
WHERE id = 'df6cee2d-2697-47eb-9ae2-f4d439df711f';

-- Adicionar nome ao admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{name}', 
    '"Administrador"'::jsonb
)
WHERE id = '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8';

-- Adicionar nome ao profissional
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{name}', 
    '"Dr. Ricardo Valença"'::jsonb
)
WHERE id = '659ed341-74ac-413e-b708-332aff3e75bf';
```

---

## ✅ **RESULTADO ESPERADO**

Após executar as correções e testar:

- ✅ **passosmir4@gmail.com** → Dashboard de Paciente
- ✅ **phpg69@gmail.com** → Dashboard Administrativo
- ✅ **rrvlenca@gmail.com** → Dashboard Profissional
- ✅ **Painel de debug** mostra tipos corretos
- ✅ **Redirecionamentos** funcionam automaticamente

---

## 🚨 **SE HOUVER PROBLEMAS**

### **Problema: Senha não funciona**
**Solução**: 
- Use a funcionalidade "Esqueci minha senha" no Supabase
- Ou crie novos usuários via interface de registro

### **Problema: Redirecionamento não funciona**
**Solução**:
- Verifique se as rotas existem no App.tsx
- Confirme se os dashboards estão implementados
- Use o painel de debug para diagnosticar

### **Problema: Tipo não está correto**
**Solução**:
- Execute novamente o script de correção
- Verifique se o UPDATE foi executado com sucesso
- Confirme se o ID está correto

---

**Status**: ✅ Script específico criado para os usuários encontrados
**Próximo passo**: Executar o script e testar o login
