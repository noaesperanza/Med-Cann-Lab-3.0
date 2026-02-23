# 🛠️ Fix: Erro de Login e 403 em patient_medical_records

**Data:** 06/02/2026  
**Reportado por:** Dr. Ricardo Valença

---

## 🚨 Problemas Identificados

### 1. Erro de Login (400)
```
Failed to load resource: the server responded with a status of 400
Erro no login: Invalid login credentials
```

**Causa:** Credenciais inválidas ou usuário não existe no Supabase Auth.

**Solução:** Verificar se o usuário existe e se a senha está correta.

---

### 2. Erro 403 em patient_medical_records
```
GET /rest/v1/patient_medical_records?select=*&patient_id=eq.XXX 403 (Forbidden)
```

**Causa:** Políticas RLS muito restritivas ou ausentes para admin/profissionais.

**Solução:** Script SQL criado para corrigir políticas RLS.

---

## ✅ Correções Implementadas

### Script SQL: `FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql`

**O que faz:**
1. Cria função `is_professional_patient_link()` (SECURITY DEFINER)
   - Verifica vínculo profissional-paciente via `clinical_reports` ou `clinical_assessments`
2. Cria função `is_admin_user()` (SECURITY DEFINER)
   - Verifica se usuário é admin
3. Remove políticas antigas (idempotente)
4. Cria novas políticas RLS:
   - **Admin**: vê, insere e atualiza todos os registros
   - **Profissional**: vê, insere e atualiza registros de pacientes vinculados
   - **Paciente**: vê, insere e atualiza seus próprios registros

---

## 📋 Como Aplicar o Fix

### 1. Executar SQL no Supabase

```sql
-- Executar no Supabase SQL Editor:
\i database/scripts/FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql
```

Ou copiar e colar o conteúdo do arquivo no SQL Editor.

### 2. Verificar Login

Se o erro de login persistir:

1. **Verificar se o usuário existe:**
   ```sql
   SELECT id, email, created_at 
   FROM auth.users 
   WHERE email = 'email@exemplo.com';
   ```

2. **Resetar senha (se necessário):**
   - Usar o painel do Supabase: Authentication > Users > Reset Password
   - Ou criar novo usuário de teste

3. **Verificar metadados do usuário:**
   ```sql
   SELECT id, email, raw_user_meta_data 
   FROM auth.users 
   WHERE email = 'email@exemplo.com';
   ```

### 3. Testar Acesso

Após executar o SQL, testar:

```sql
-- Como admin, deve retornar registros
SELECT COUNT(*) 
FROM patient_medical_records;

-- Como profissional vinculado, deve retornar registros do paciente
SELECT COUNT(*) 
FROM patient_medical_records 
WHERE patient_id = 'ID_DO_PACIENTE';
```

---

## 🔍 Verificação

### Verificar Políticas RLS

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'patient_medical_records'
ORDER BY policyname;
```

### Verificar Funções

```sql
SELECT 
  proname,
  prosecdef,
  proconfig
FROM pg_proc
WHERE proname IN ('is_professional_patient_link', 'is_admin_user');
```

---

## 📝 Notas

- **SECURITY DEFINER**: Funções usam `SECURITY DEFINER` para evitar recursão em RLS
- **Idempotente**: Script pode ser executado múltiplas vezes sem problemas
- **Compatível**: Mantém compatibilidade com políticas existentes

---

## ✅ Status

- [x] Script SQL criado
- [x] Funções helper criadas
- [x] Políticas RLS atualizadas
- [ ] SQL executado no Supabase (pendente)
- [ ] Testado (pendente)

---

**Criado por:** Auto (AI Assistant)  
**Data:** 06/02/2026
