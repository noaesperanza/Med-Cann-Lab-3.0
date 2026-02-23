# 📋 Ordem de Execução dos Scripts SQL

**Data:** 06/02/2026  
**Objetivo:** Corrigir erros de Foreign Key, RLS e diagnosticar pacientes do Dr. Ricardo

---

## 🎯 Ordem Recomendada

### **OPÇÃO 1: Fix Completo (Recomendado - Tudo de uma vez)**

Execute apenas este script que faz tudo:

```sql
1. FIX_COMPLETO_DR_RICARDO_E_ERROS_2026-02-06.sql
```

**O que faz:**
- ✅ Diagnóstico dos pacientes do Dr. Ricardo
- ✅ Fix do Foreign Key em `chat_participants`
- ✅ Fix do RLS em `patient_medical_records` (erro 403)
- ✅ Sincronização de `public.users` com `auth.users`

---

### **OPÇÃO 2: Passo a Passo (Para diagnóstico detalhado)**

#### **PASSO 1: Verificar Estrutura (Opcional)**
```sql
VERIFICAR_ESTRUTURA_TABELAS_2026-02-06.sql
```
**Objetivo:** Ver estrutura real das tabelas antes de corrigir

---

#### **PASSO 2: Diagnóstico do Dr. Ricardo**
```sql
DIAGNOSTICO_DR_RICARDO_PACIENTES_2026-02-06.sql
```
**Objetivo:** Ver quais pacientes estão vinculados ao Dr. Ricardo

**Resultado esperado:**
- Lista de pacientes via `clinical_reports`
- Lista de pacientes via `clinical_assessments`
- Lista de pacientes via `appointments`
- Lista de pacientes via `chat_participants`
- Lista consolidada de TODOS os pacientes
- Pacientes "órfãos" (não vinculados)

---

#### **PASSO 3: Fix Foreign Key em chat_participants**
```sql
FIX_FOREIGN_KEY_CHAT_PARTICIPANTS_CORRIGIDO_2026-02-06.sql
```
**Objetivo:** Corrigir erro 409 (foreign key constraint violation)

**O que faz:**
- Verifica constraint atual
- Identifica registros órfãos
- Sincroniza `public.users` com `auth.users`
- Verifica se ainda há problemas

**Resultado esperado:**
- ✅ Nenhum registro órfão encontrado
- ✅ Foreign key funcionando corretamente

---

#### **PASSO 4: Fix RLS em patient_medical_records**
```sql
FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql
```
**Objetivo:** Corrigir erro 403 (Forbidden) ao acessar `patient_medical_records`

**O que faz:**
- Cria função `is_professional_patient_link()` (SECURITY DEFINER)
- Cria função `is_admin_user()` (SECURITY DEFINER)
- Recria políticas RLS para SELECT, INSERT, UPDATE
- Garante isolamento: cada profissional vê apenas seus pacientes

**Resultado esperado:**
- ✅ Admin pode ver todos os registros
- ✅ Profissional vê apenas pacientes vinculados
- ✅ Paciente vê apenas seus próprios registros
- ✅ Erro 403 resolvido

---

#### **PASSO 5: Fix Completo Chat + Medical Records (Opcional)**
```sql
FIX_COMPLETO_RLS_CHAT_E_MEDICAL_RECORDS_2026-02-06.sql
```
**Objetivo:** Fix completo de chat (recursão) + medical records + users

**O que faz:**
- Fix recursão infinita no chat
- Fix RLS de `patient_medical_records`
- Fix RLS de `users` (erro 400)

**Quando usar:**
- Se ainda houver erro de recursão no chat
- Se ainda houver erro 400 ao consultar `users`

---

## 📊 Resumo da Ordem

### **Cenário 1: Quero tudo rápido**
```
1. FIX_COMPLETO_DR_RICARDO_E_ERROS_2026-02-06.sql
```

### **Cenário 2: Quero diagnosticar primeiro**
```
1. VERIFICAR_ESTRUTURA_TABELAS_2026-02-06.sql (opcional)
2. DIAGNOSTICO_DR_RICARDO_PACIENTES_2026-02-06.sql
3. FIX_FOREIGN_KEY_CHAT_PARTICIPANTS_CORRIGIDO_2026-02-06.sql
4. FIX_PATIENT_MEDICAL_RECORDS_RLS_403_2026-02-06.sql
```

### **Cenário 3: Ainda há erros de chat/usuários**
```
1. FIX_COMPLETO_RLS_CHAT_E_MEDICAL_RECORDS_2026-02-06.sql
```

---

## ⚠️ Importante

1. **Execute no Supabase SQL Editor**
2. **Execute na ordem indicada**
3. **Leia os resultados de cada script**
4. **Se houver erro, pare e verifique**

---

## ✅ Verificação Pós-Execução

Após executar os scripts, verifique:

1. **Foreign Key:**
   ```sql
   -- Deve retornar 0
   SELECT COUNT(*) FROM public.chat_participants cp
   LEFT JOIN public.users u ON u.id = cp.user_id
   WHERE u.id IS NULL;
   ```

2. **RLS patient_medical_records:**
   ```sql
   -- Deve funcionar sem erro 403
   SELECT * FROM patient_medical_records LIMIT 10;
   ```

3. **Pacientes do Dr. Ricardo:**
   ```sql
   -- Ver lista de pacientes vinculados
   -- (Usar DIAGNOSTICO_DR_RICARDO_PACIENTES_2026-02-06.sql)
   ```

---

**Criado por:** Auto (AI Assistant)  
**Data:** 06/02/2026
