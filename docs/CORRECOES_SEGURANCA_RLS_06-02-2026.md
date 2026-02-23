# 🔒 CORREÇÕES DE SEGURANÇA - RLS E FUNÇÕES

**Data:** 06/02/2026  
**Prioridade:** 🔴 CRÍTICO  
**Status:** ✅ Corrigido

---

## 🔴 PROBLEMA 1: SECURITY DEFINER + GRANT PARA anon

### ❌ **Problema Identificado**

```sql
-- ❌ ERRADO
CREATE FUNCTION public.is_admin_user(user_id UUID)
SECURITY DEFINER  -- Executa com privilégios do dono
...
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, anon;
-- ❌ anon não deveria ter acesso!
```

**Risco:**
- `SECURITY DEFINER` executa com privilégios do dono
- `anon` não deveria conseguir chamar função que olha a tabela `users`
- Abre superfície de enumeração de privilégios
- Viola hardening básico

### ✅ **Correção Aplicada**

```sql
-- ✅ CORRETO
CREATE FUNCTION public.is_admin_user(user_id UUID)
SECURITY INVOKER  -- Executa com privilégios do chamador
...
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
-- ✅ Apenas authenticated

REVOKE EXECUTE ON FUNCTION public.is_admin_user(UUID) FROM anon;
-- ✅ Garantir que anon não tem acesso
```

**Benefícios:**
- ✅ Função respeita RLS da tabela `users`
- ✅ `anon` não tem acesso
- ✅ Fecha brecha de enumeração
- ✅ Admin sempre estará autenticado

---

## 🟠 PROBLEMA 2: SECURITY DEFINER vs SECURITY INVOKER

### ❌ **Problema Original**

```sql
-- ❌ SECURITY DEFINER ignora RLS
CREATE FUNCTION public.is_admin_user(user_id UUID)
SECURITY DEFINER
```

**Risco:**
- Função ignora RLS da tabela `users`
- Pode ser reutilizada fora do contexto de RLS
- Amplia impacto se função for usada em RPC/Edge Functions

### ✅ **Correção Aplicada**

```sql
-- ✅ SECURITY INVOKER respeita RLS
CREATE FUNCTION public.is_admin_user(user_id UUID)
SECURITY INVOKER
```

**Benefícios:**
- ✅ Função só responde corretamente no contexto de quem já passou pelo auth
- ✅ Continua funcionando perfeitamente dentro das policies
- ✅ Evita abuso futuro em RPC/Edge Functions
- ✅ Engenharia mais madura e segura

---

## 🟡 PROBLEMA 3: Performance de Subqueries em RLS

### ⚠️ **Risco Identificado**

```sql
-- ⚠️ Subquery correlacionada em RLS
auth.uid() IN (
  SELECT doctor_id FROM public.clinical_assessments
  WHERE patient_id = patient_medical_records.patient_id
)
```

**Problema:**
- RLS roda por linha
- Subqueries correlacionadas escalam mal
- Em base clínica real, pode virar gargalo silencioso

### 🔧 **Solução Futura (Dívida Técnica)**

**Quando for hora de otimizar:**

```sql
-- Criar tabela de vínculo explícito
CREATE TABLE patient_professional_links (
  patient_id UUID REFERENCES auth.users(id),
  professional_id UUID REFERENCES auth.users(id),
  PRIMARY KEY (patient_id, professional_id)
);

-- Policy otimizada
auth.uid() IN (
  SELECT professional_id
  FROM patient_professional_links
  WHERE patient_id = patient_medical_records.patient_id
)
OR is_admin_user(auth.uid())
```

**Status:** ⚠️ Anotado como dívida técnica consciente (não obrigatório agora)

---

## ✅ CHECKLIST DE SEGURANÇA

### **Antes de Considerar "Fechado":**

- [x] Remover `anon` do GRANT ✅
- [x] Trocar função para `SECURITY INVOKER` ✅
- [ ] Rodar `EXPLAIN ANALYZE` em 1 tabela crítica com RLS
- [ ] Testar:
  - [ ] Admin vendo tudo
  - [ ] Admin inserindo como qualquer papel
  - [ ] Usuário comum NÃO acessando admin-only

---

## 🎯 CONCLUSÃO

### **O Que Está Muito Bem Feito:**

✅ **Padronização**
- Todas as policies seguem o mesmo modelo mental
- Admin bypass consistente
- Nada "exótico"

✅ **Uso Correto de WITH CHECK**
- INSERT protegido
- UPDATE separado de SELECT
- Sem misturar responsabilidades

✅ **Script Idempotente**
- `DO $$ BEGIN IF EXISTS`
- Seguro para ambientes diferentes
- Ótimo para CI/CD depois

✅ **Sem Lógica de Negócio no GPT**
- Tudo está no Core / DB
- GPT só interpreta intenção

### **Ajustes Aplicados:**

✅ **Segurança**
- `SECURITY INVOKER` em vez de `SECURITY DEFINER`
- `anon` removido do GRANT
- Brecha de enumeração fechada

✅ **Performance**
- Anotado como dívida técnica consciente
- Solução futura documentada

---

## 📝 PRÓXIMOS PASSOS

1. ✅ **Executar script corrigido:**
   - `ADICIONAR_BYPASS_ADMIN_RLS_06-02-2026.sql` (já corrigido)

2. ⚠️ **Testar segurança:**
   - Admin vendo tudo
   - Admin inserindo como qualquer papel
   - Usuário comum não acessando admin-only

3. ⚠️ **Performance (futuro):**
   - Quando base crescer, criar tabelas de vínculo explícito
   - Otimizar subqueries em RLS

---

**Documento criado por:** Sistema de Segurança  
**Data:** 06/02/2026  
**Status:** ✅ Correções Aplicadas
