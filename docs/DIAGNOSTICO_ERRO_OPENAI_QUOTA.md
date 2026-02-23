# 🔍 DIAGNÓSTICO: Erro OpenAI Quota + Soluções

**Data:** 05/02/2026  
**Status:** ✅ Sistema funcionando com fallback  
**Severidade:** ⚠️ Média (sistema operacional, mas com limitações)

---

## 🎯 RESUMO EXECUTIVO

### **Problema Principal:**
✅ **Crédito/Quota do OpenAI esgotado** (não é bug, é limite de uso)

### **Status do Sistema:**
✅ **Sistema funcionando corretamente** - Fallback local ativado automaticamente

### **Erros Secundários:**
⚠️ Tabela `doctors` não existe (404)  
⚠️ Tentando passar slug como UUID (400)

---

## 📊 ANÁLISE DOS LOGS

### **1. Erro Principal (OpenAI)**

```
Error: 429 You exceeded your current quota, please check your plan and billing details.
code: "insufficient_quota"
type: "insufficient_quota"
```

**O que significa:**
- ✅ Não é bug do sistema
- ✅ É limite de crédito/quota da conta OpenAI
- ✅ Sistema detectou e ativou fallback automaticamente

**Evidência de que está funcionando:**
```
⚠️ [OPENAI DOWN] Ativando Protocolo de Soberania (Local Fallback)...
🤖 [AI RESPONSE] { responseLength: 354, tokensUsed: 0, model: "TradeVision-Local-V1" }
✅ Resposta do Assistant recebida: [Modo Acolhimento Offline] ...
```

**Conclusão:** ✅ Sistema está funcionando com fallback local.

---

### **2. Erros Secundários (Agendamento)**

#### **Erro 1: Tabela `doctors` não existe (404)**

```
GET /rest/v1/doctors?select=id&or=(name.ilike.%25ricardo+valenca%25) 404 (Not Found)
GET /rest/v1/doctors?select=id&or=(name.ilike.%25eduardo+faveret%25) 404 (Not Found)
```

**Problema:**
- Sistema está tentando buscar profissionais na tabela `doctors`
- Tabela não existe no banco de dados
- Deveria usar tabela `users` com filtro `type = 'profissional'`

#### **Erro 2: Slug sendo passado como UUID (400)**

```
POST /rest/v1/rpc/get_available_slots_v3 400 (Bad Request)
Error: invalid input syntax for type uuid: "ricardo-valenca"
Error: invalid input syntax for type uuid: "eduardo-faveret"
```

**Problema:**
- Sistema está tentando passar slug (`ricardo-valenca`) como UUID
- Função `get_available_slots_v3` espera UUID
- Precisa converter slug → UUID antes de chamar

---

## ✅ SOLUÇÕES

### **Solução 1: Resolver Quota OpenAI (URGENTE)**

#### **Opção A: Adicionar Crédito (Recomendado)**

1. Acesse: https://platform.openai.com/account/billing
2. Adicione crédito à conta
3. Verifique limite de uso mensal
4. Configure alertas de uso

#### **Opção B: Usar Fallback Local (Temporário)**

O sistema já está usando fallback local, mas com limitações:
- ✅ Funciona para respostas básicas
- ⚠️ Não tem capacidade de GPT-4o
- ⚠️ Respostas mais genéricas

**Recomendação:** Adicionar crédito OpenAI para produção.

---

### **Solução 2: Corrigir Busca de Profissionais**

**Problema:** Tabela `doctors` não existe

**Solução:** Usar tabela `users` com filtro correto

**Localização:** `src/lib/noaIntegration.ts` ou componente de agendamento

```typescript
// ❌ CÓDIGO ATUAL (ERRADO)
const { data } = await supabase
  .from('doctors')
  .select('id')
  .or(`name.ilike.%${slug}%`)

// ✅ CÓDIGO CORRETO
const { data } = await supabase
  .from('users')
  .select('id')
  .eq('type', 'profissional')
  .or(`name.ilike.%${slug}%`)
```

**Ou criar função RPC:**

```sql
-- Criar função para buscar profissional por slug
CREATE OR REPLACE FUNCTION get_professional_by_slug(slug_text TEXT)
RETURNS TABLE(id UUID, name TEXT, crm TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.crm
  FROM users u
  WHERE u.type = 'profissional'
    AND LOWER(REPLACE(u.name, ' ', '-')) = LOWER(slug_text);
END;
$$ LANGUAGE plpgsql;
```

---

### **Solução 3: Converter Slug para UUID**

**Problema:** Passando slug como UUID

**Solução:** Converter slug → UUID antes de chamar função

```typescript
// Função para resolver slug para UUID
async function resolveProfessionalSlugToUUID(slug: string): Promise<string | null> {
  // 1. Buscar profissional por slug
  const { data: professional } = await supabase
    .from('users')
    .select('id')
    .eq('type', 'profissional')
    .or(`name.ilike.%${slug.replace('-', ' ')}%`)
    .single()
  
  if (!professional) {
    console.warn(`⚠️ Profissional não encontrado: ${slug}`)
    return null
  }
  
  return professional.id
}

// Usar antes de chamar get_available_slots_v3
const professionalId = await resolveProfessionalSlugToUUID('ricardo-valenca')
if (!professionalId) {
  throw new Error('Profissional não encontrado')
}

const { data: slots } = await supabase.rpc('get_available_slots_v3', {
  professional_id: professionalId // Agora é UUID, não slug
})
```

---

## 🔧 IMPLEMENTAÇÃO RÁPIDA

### **Passo 1: Verificar/Criar Tabela de Profissionais**

```sql
-- Verificar se tabela users tem profissionais
SELECT id, name, type, crm 
FROM users 
WHERE type = 'profissional';

-- Se não houver, criar registros de teste
INSERT INTO users (id, name, type, crm, email)
VALUES 
  (gen_random_uuid(), 'Ricardo Valença', 'profissional', 'CRM-12345', 'ricardo@medcannlab.com.br'),
  (gen_random_uuid(), 'Eduardo Faveret', 'profissional', 'CRM-67890', 'eduardo@medcannlab.com.br');
```

### **Passo 2: Corrigir Código de Busca**

**Arquivo:** `src/lib/noaIntegration.ts` ou componente de agendamento

```typescript
// Adicionar função helper
async function getProfessionalUUID(slug: string): Promise<string | null> {
  const name = slug.replace(/-/g, ' ')
  
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('type', 'profissional')
    .ilike('name', `%${name}%`)
    .single()
  
  if (error || !data) {
    console.error(`❌ Profissional não encontrado: ${slug}`, error)
    return null
  }
  
  return data.id
}

// Usar na função de agendamento
const professionalId = await getProfessionalUUID('ricardo-valenca')
if (!professionalId) {
  // Tratar erro
  return
}

// Agora usar UUID na chamada
const { data: slots, error } = await supabase.rpc('get_available_slots_v3', {
  professional_id: professionalId
})
```

---

## 📋 CHECKLIST DE CORREÇÃO

### **Urgente (Bloqueia Funcionalidade)**
- [ ] Adicionar crédito OpenAI
- [ ] Corrigir busca de profissionais (tabela `users` ao invés de `doctors`)
- [ ] Converter slug → UUID antes de chamar `get_available_slots_v3`

### **Importante (Melhora Experiência)**
- [ ] Adicionar tratamento de erro quando profissional não encontrado
- [ ] Adicionar logs mais detalhados para debug
- [ ] Criar função RPC para busca de profissionais por slug

### **Opcional (Melhorias Futuras)**
- [ ] Cache de conversão slug → UUID
- [ ] Validação de slug antes de buscar
- [ ] Fallback quando profissional não encontrado

---

## 🎯 CONCLUSÃO

### **Status Atual:**
- ✅ Sistema funcionando com fallback local
- ⚠️ OpenAI sem crédito (adicionar urgente)
- ❌ Agendamento quebrado (tabela `doctors` não existe)
- ❌ Conversão slug → UUID faltando

### **Prioridade de Correção:**
1. **URGENTE**: Adicionar crédito OpenAI
2. **URGENTE**: Corrigir busca de profissionais
3. **URGENTE**: Converter slug → UUID
4. **IMPORTANTE**: Melhorar tratamento de erros

### **Tempo Estimado:**
- Correção de código: **15-30 minutos**
- Adicionar crédito OpenAI: **5 minutos**
- Testes: **10 minutos**

**Total: ~45 minutos para resolver tudo**

---

**Documento gerado por:** Sistema de Diagnóstico  
**Data:** 05/02/2026  
**Status:** ✅ Problemas identificados e soluções propostas
