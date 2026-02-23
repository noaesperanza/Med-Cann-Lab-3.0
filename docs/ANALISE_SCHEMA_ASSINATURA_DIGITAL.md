# 🔍 ANÁLISE DO SCHEMA: Assinatura Digital

**Data:** 05/02/2026  
**Contexto:** Análise do schema completo do banco de dados

---

## ✅ O QUE JÁ EXISTE NO SCHEMA

### **1. Tabela `cfm_prescriptions` (EXISTE)**
```sql
CREATE TABLE public.cfm_prescriptions (
  id uuid PRIMARY KEY,
  prescription_type text NOT NULL,
  patient_id uuid,
  patient_name text NOT NULL,
  patient_cpf text,
  patient_email text,
  patient_phone text,
  professional_id uuid NOT NULL,
  professional_name text NOT NULL,
  professional_crm text,
  professional_specialty text,
  medications jsonb DEFAULT '[]'::jsonb,
  notes text,
  status text DEFAULT 'draft'::text,
  
  -- ✅ CAMPOS DE ASSINATURA DIGITAL (JÁ EXISTEM):
  digital_signature text,
  signature_certificate text,
  signature_timestamp timestamp with time zone,
  
  -- ✅ CAMPOS ITI (JÁ EXISTEM):
  iti_validation_code text UNIQUE,
  iti_validation_url text,
  iti_qr_code text,
  
  -- Outros campos...
  sent_at timestamp with time zone,
  sent_via_email boolean DEFAULT false,
  sent_via_sms boolean DEFAULT false,
  email_sent_at timestamp with time zone,
  sms_sent_at timestamp with time zone,
  expires_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

**Status:** ✅ **EXISTE**  
**Falta:** ❌ Campo `document_level` (precisa adicionar)

---

### **2. Tabela `pki_transactions` (NÃO VISÍVEL NO SCHEMA, MAS EXISTE)**
Pelo código sabemos que existe:
```sql
CREATE TABLE public.pki_transactions (
  id uuid PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES cfm_prescriptions(id),
  signer_cpf text NOT NULL,
  signature_value text NOT NULL,
  certificate_thumbprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Status:** ✅ **EXISTE** (confirmado pelo código)  
**Falta:** ❌ Campo `ac_provider` (precisa adicionar)

---

## ❌ O QUE NÃO EXISTE NO SCHEMA

### **1. Tabela `medical_certificates`**
**Status:** ❌ **NÃO EXISTE**  
**Ação:** Criar via migration

### **2. Tabela `signature_confirmations`**
**Status:** ❌ **NÃO EXISTE**  
**Ação:** Criar via migration

### **3. Tabela `document_snapshots`**
**Status:** ❌ **NÃO EXISTE**  
**Ação:** Criar via migration

---

## 📋 RESUMO DO QUE FALTA

### **Migration Necessária:**

1. ✅ **Adicionar `document_level` em `cfm_prescriptions`**
2. ✅ **Adicionar `ac_provider` em `pki_transactions`** (se não existir)
3. ✅ **Criar tabela `medical_certificates`**
4. ✅ **Criar tabela `signature_confirmations`**
5. ✅ **Criar tabela `document_snapshots`**
6. ✅ **Criar RLS Policies**
7. ✅ **Criar índices**
8. ✅ **Criar funções auxiliares**

---

## 🎯 PRÓXIMA AÇÃO

**Executar migration:** `database/scripts/CREATE_DIGITAL_SIGNATURE_SCHEMA.sql`

Esta migration:
- ✅ Usa `IF NOT EXISTS` (seguro para executar)
- ✅ Usa `ADD COLUMN IF NOT EXISTS` (não quebra se já existir)
- ✅ Cria todas as tabelas necessárias
- ✅ Configura RLS corretamente
- ✅ Cria índices para performance

---

**Documento criado por:** Sistema de Análise  
**Data:** 05/02/2026  
**Status:** ✅ Schema analisado, migration pronta para executar
