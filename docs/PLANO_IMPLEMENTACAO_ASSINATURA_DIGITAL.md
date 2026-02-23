# 🏗️ PLANO DE IMPLEMENTAÇÃO: ASSINATURA DIGITAL MÉDICA
**Data:** 05/02/2026  
**Arquitetura:** COS v5.0 + TradeVision Core  
**Status:** ✅ Pronto para implementação

---

## 🎯 O QUE PRECISAMOS PARA COMEÇAR

### **1. Pré-requisitos Técnicos**

#### **1.1 Autoridade Certificadora (AC)**
- [ ] **Escolher AC inicial** (recomendado: Soluti ou Certisign)
- [ ] **Conta de desenvolvedor** na AC escolhida
- [ ] **API Key / Credenciais** da AC
- [ ] **Documentação da API** da AC
- [ ] **Certificado de teste** (para desenvolvimento)

#### **1.2 Infraestrutura**
- [ ] **Tabelas de banco** (criar via migration)
- [ ] **Edge Function** para assinatura (criar nova)
- [ ] **Variáveis de ambiente** (API keys da AC)
- [ ] **RLS Policies** (segurança)

#### **1.3 Frontend**
- [ ] **Componente de assinatura** (criar novo)
- [ ] **Página de gestão de certificados** (criar nova)
- [ ] **Integração com Prescriptions.tsx** (modificar existente)

---

## 📍 ONDE VAI FICAR CADA PARTE

### **ARQUITETURA COMPLETA (COS v5.0)**

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1: FRONTEND (UX do Profissional)                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ src/pages/Prescriptions.tsx                           │ │
│  │ - Botão "Assinar Digitalmente"                        │ │
│  │ - Modal de confirmação                                │ │
│  │ - Status da assinatura                                │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ src/pages/CertificateManagement.tsx (NOVO)           │ │
│  │ - Listar certificados                                 │ │
│  │ - Adicionar certificado                               │ │
│  │ - Renovar certificado                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ src/components/DigitalSignatureWidget.tsx (NOVO)     │ │
│  │ - Widget de assinatura                                │ │
│  │ - Integração com AC                                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓ (chama)
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 2: TRADEVISION CORE (Orquestração COS v5.0)        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ supabase/functions/tradevision-core/index.ts          │ │
│  │ - Detecta intenção de assinar                        │ │
│  │ - Determina nível do documento                        │ │
│  │ - Valida permissões (COS governança)                  │ │
│  │ - Emite app_command: SIGN_DOCUMENT                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓ (orquestra)
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 3: EDGE FUNCTION DE ASSINATURA (NOVO)              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ supabase/functions/digital-signature/index.ts (NOVO)  │ │
│  │ - Recebe documentId + professionalId                   │ │
│  │ - Busca certificado ativo                             │ │
│  │ - Prepara hash do documento                           │ │
│  │ - Chama API da AC                                     │ │
│  │ - Persiste auditoria                                  │ │
│  │ - Retorna resultado                                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓ (integra)
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 4: AUTORIDADE CERTIFICADORA (EXTERNA)              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ API da AC (Soluti/Certisign/Valid/etc)              │ │
│  │ - Valida certificado                                 │ │
│  │ - Assina documento                                   │ │
│  │ - Retorna assinatura ICP-Brasil                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓ (persiste)
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 5: BANCO DE DADOS (Supabase)                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ medical_certificates (NOVO)                          │ │
│  │ - Certificados dos médicos                           │ │
│  │                                                       │ │
│  │ pki_transactions (EXISTE)                           │ │
│  │ - Auditoria de assinaturas                           │ │
│  │                                                       │ │
│  │ cfm_prescriptions (EXISTE)                           │ │
│  │ - Prescrições com assinatura                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO COMPLETO PARA O PROFISSIONAL

### **CENÁRIO: Médico quer assinar uma prescrição**

#### **PASSO 1: Médico cria prescrição**
```
Frontend: src/pages/Prescriptions.tsx
├─> Médico preenche dados
├─> Sistema valida campos
└─> Prescrição salva como "draft"
```

#### **PASSO 2: Médico clica "Assinar Digitalmente"**
```
Frontend: src/pages/Prescriptions.tsx
├─> handleDigitalSignature() é chamado
├─> Verifica se tem certificado ativo
│   └─> Se não tem: abre modal de configuração
└─> Chama Edge Function: digital-signature
```

#### **PASSO 3: TradeVision Core orquestra (COS v5.0)**
```
Edge Function: tradevision-core/index.ts
├─> Detecta intenção: "assinar prescrição"
├─> COS v5.0 avalia:
│   ├─> Verifica permissões (governança)
│   ├─> Verifica trauma (bloqueio)
│   ├─> Verifica metabolismo (limite)
│   └─> COS.evaluate() → allowed: true
├─> Determina nível: "level_3" (prescrição = legal)
├─> Emite app_command: { type: 'sign_document', ... }
└─> Frontend recebe comando
```

#### **PASSO 4: Edge Function de Assinatura executa**
```
Edge Function: digital-signature/index.ts
├─> Recebe: { documentId, professionalId, documentLevel }
├─> 1. Busca certificado ativo
│   └─> SELECT * FROM medical_certificates
│       WHERE professional_id = ? 
│       AND is_active = true
│       AND expires_at > NOW()
├─> 2. Prepara documento
│   ├─> Gera PDF final
│   ├─> Calcula hash SHA-256
│   └─> Cria snapshot imutável
├─> 3. Chama API da AC
│   └─> POST https://api.ac.com/sign
│       Body: { hash, certificateId, ... }
├─> 4. Recebe assinatura ICP-Brasil
│   └─> { signature: "...", validationUrl: "..." }
├─> 5. Persiste auditoria
│   └─> INSERT INTO pki_transactions
├─> 6. Atualiza prescrição
│   └─> UPDATE cfm_prescriptions
│       SET digital_signature = ?,
│           signature_timestamp = ?,
│           status = 'signed'
└─> 7. Retorna resultado
    └─> { success: true, signature: "...", ... }
```

#### **PASSO 5: Frontend exibe resultado**
```
Frontend: src/pages/Prescriptions.tsx
├─> Recebe resposta da Edge Function
├─> Atualiza UI:
│   ├─> Status: "Assinada"
│   ├─> Ícone de assinatura válida
│   └─> QR Code ITI (se aplicável)
└─> Médico vê confirmação
```

---

## 📂 ESTRUTURA DE ARQUIVOS

### **BACKEND (Supabase Edge Functions)**

```
supabase/functions/
├── tradevision-core/
│   └── index.ts (MODIFICAR)
│       └── Adicionar trigger: [SIGN_DOCUMENT]
│       └── Adicionar heurística: detectSignIntent()
│       └── Adicionar app_command: sign_document
│
└── digital-signature/ (NOVO)
    └── index.ts
        ├── serve() handler
        ├── resolveCertificate()
        ├── prepareDocumentHash()
        ├── callACProvider()
        ├── persistAudit()
        └── updateDocument()
```

### **FRONTEND (React)**

```
src/
├── pages/
│   ├── Prescriptions.tsx (MODIFICAR)
│   │   └── handleDigitalSignature() → chama Edge Function
│   │
│   └── CertificateManagement.tsx (NOVO)
│       ├── Listar certificados
│       ├── Adicionar certificado
│       └── Renovar certificado
│
├── components/
│   └── DigitalSignatureWidget.tsx (NOVO)
│       ├── Modal de assinatura
│       ├── Status da assinatura
│       └── QR Code ITI
│
└── lib/
    └── acIntegration.ts (NOVO)
        ├── ACProvider interface
        ├── SolutiAC class
        ├── CertisignAC class
        └── getACProvider() factory
```

### **DATABASE (Migrations)**

```
database/scripts/
└── CREATE_DIGITAL_SIGNATURE_SCHEMA.sql (NOVO)
    ├── ALTER TABLE cfm_prescriptions (adicionar document_level)
    ├── CREATE TABLE medical_certificates
    ├── CREATE TABLE signature_confirmations
    ├── CREATE TABLE document_snapshots
    └── RLS Policies
```

---

## 🔧 IMPLEMENTAÇÃO PASSO A PASSO

### **FASE 1: Estrutura de Banco (1-2 horas)**

#### **1.1 Criar Migration**

**Arquivo:** `database/scripts/CREATE_DIGITAL_SIGNATURE_SCHEMA.sql`

```sql
-- 1. Adicionar nível de documento
ALTER TABLE cfm_prescriptions 
ADD COLUMN IF NOT EXISTS document_level TEXT DEFAULT 'level_3' 
CHECK (document_level IN ('level_1', 'level_2', 'level_3'));

-- 2. Criar tabela de certificados
CREATE TABLE IF NOT EXISTS medical_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES auth.users(id) NOT NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('A1', 'A3', 'remote')),
  ac_provider TEXT NOT NULL,
  certificate_thumbprint TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de confirmações
CREATE TABLE IF NOT EXISTS signature_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES cfm_prescriptions(id) NOT NULL,
  professional_id UUID REFERENCES auth.users(id) NOT NULL,
  user_confirmed_signature BOOLEAN DEFAULT FALSE,
  confirmation_timestamp TIMESTAMPTZ,
  document_version_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabela de snapshots
CREATE TABLE IF NOT EXISTS document_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES cfm_prescriptions(id) NOT NULL,
  version_hash TEXT NOT NULL,
  pdf_url TEXT,
  is_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies
ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies para medical_certificates
CREATE POLICY "Profissionais veem seus certificados"
ON medical_certificates FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Profissionais gerenciam seus certificados"
ON medical_certificates FOR ALL
USING (auth.uid() = professional_id);

-- Policies para signature_confirmations
CREATE POLICY "Profissionais veem suas confirmações"
ON signature_confirmations FOR SELECT
USING (auth.uid() = professional_id);

-- Policies para document_snapshots
CREATE POLICY "Profissionais veem snapshots de seus documentos"
ON document_snapshots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cfm_prescriptions
    WHERE id = document_snapshots.document_id
    AND professional_id = auth.uid()
  )
);
```

---

### **FASE 2: Edge Function de Assinatura (3-4 horas)**

#### **2.1 Criar Edge Function**

**Arquivo:** `supabase/functions/digital-signature/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente não configuradas')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { documentId, documentLevel, professionalId } = await req.json()

    // 1. Validar nível do documento
    if (documentLevel !== 'level_3') {
      return new Response(JSON.stringify({
        error: 'Apenas documentos nível 3 requerem assinatura ICP-Brasil'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Buscar certificado ativo
    const { data: certificate, error: certError } = await supabase
      .from('medical_certificates')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (certError || !certificate) {
      return new Response(JSON.stringify({
        error: 'Certificado ICP-Brasil não encontrado ou expirado',
        requiresRenewal: true
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 3. Preparar hash do documento
    const { data: prescription } = await supabase
      .from('cfm_prescriptions')
      .select('*')
      .eq('id', documentId)
      .single()

    if (!prescription) {
      return new Response(JSON.stringify({
        error: 'Documento não encontrado'
      }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Gerar hash do documento (simplificado - em produção usar PDF real)
    const documentContent = JSON.stringify(prescription)
    const encoder = new TextEncoder()
    const data = encoder.encode(documentContent)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // 4. Criar snapshot imutável
    await supabase.from('document_snapshots').insert({
      document_id: documentId,
      version_hash: hashHex,
      is_final: true
    })

    // 5. Chamar AC (SIMULADO - substituir por API real)
    // TODO: Integrar com API real da AC escolhida
    const signatureResult = {
      signature: `ICP-BR-SHA256-${hashHex}`,
      validationUrl: `https://www.gov.br/iti/pt-br/validacao?codigo=${hashHex}`,
      timestamp: new Date().toISOString()
    }

    // 6. Persistir auditoria
    await supabase.from('pki_transactions').insert({
      document_id: documentId,
      signer_cpf: '000.000.000-00', // TODO: Buscar do certificado
      signature_value: signatureResult.signature,
      certificate_thumbprint: certificate.certificate_thumbprint,
      ac_provider: certificate.ac_provider
    })

    // 7. Atualizar documento
    await supabase
      .from('cfm_prescriptions')
      .update({
        digital_signature: signatureResult.signature,
        signature_timestamp: signatureResult.timestamp,
        status: 'signed',
        iti_validation_code: hashHex,
        iti_validation_url: signatureResult.validationUrl
      })
      .eq('id', documentId)

    return new Response(JSON.stringify({
      success: true,
      signature: signatureResult.signature,
      validationUrl: signatureResult.validationUrl
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
```

---

### **FASE 3: Integração com TradeVision Core (2-3 horas)**

#### **3.1 Adicionar Trigger no Core**

**Arquivo:** `supabase/functions/tradevision-core/index.ts`

**Localização:** Após os outros triggers (linha ~34)

```typescript
// Adicionar ao GPT_TRIGGERS
const GPT_TRIGGERS = {
  // ... triggers existentes
  SIGN_DOCUMENT: '[SIGN_DOCUMENT]',
  CHECK_CERTIFICATE: '[CHECK_CERTIFICATE]',
} as const
```

**Localização:** Após heurísticas de agendamento (linha ~790)

```typescript
// Heurística para detectar intenção de assinar
function detectSignIntent(norm: string): boolean {
  return /(assinar|assinatura|certificado|icp|brasil)/i.test(norm)
}

// Determinar nível do documento
function determineDocumentLevel(
  documentType: string,
  userRole: string
): 'level_1' | 'level_2' | 'level_3' {
  // Nível 3: Documentos legais (CFM)
  if (['prescription', 'atestado', 'laudo'].includes(documentType)) {
    return 'level_3'
  }
  // Nível 2: Administrativos simples
  if (['declaracao', 'relatorio_informativo'].includes(documentType)) {
    return 'level_2'
  }
  // Nível 1: Clínico interno
  return 'level_1'
}
```

**Localização:** No fluxo principal, após parse de triggers (linha ~2050)

```typescript
// Detectar intenção de assinar
if (detectSignIntent(norm) || aiResponse?.includes('[SIGN_DOCUMENT]')) {
  // Determinar documento atual (do contexto)
  const currentDocument = ui_context?.current_document
  
  if (currentDocument) {
    const documentLevel = determineDocumentLevel(
      currentDocument.type || 'prescription',
      userRole
    )
    
    // Adicionar app_command para assinatura
    app_commands.push({
      type: 'sign_document',
      document_id: currentDocument.id,
      document_level: documentLevel,
      requires_certificate: documentLevel === 'level_3'
    })
  }
}
```

---

### **FASE 4: Frontend - Componente de Assinatura (3-4 horas)**

#### **4.1 Modificar Prescriptions.tsx**

**Arquivo:** `src/pages/Prescriptions.tsx`

**Localização:** Substituir função `handleDigitalSignature` existente

```typescript
const handleDigitalSignature = async () => {
  if (!currentPrescriptionId) {
    alert('Crie uma prescrição primeiro')
    return
  }

  setSaving(true)
  setError(null)

  try {
    // Chamar Edge Function de assinatura
    const { data, error } = await supabase.functions.invoke('digital-signature', {
      body: {
        documentId: currentPrescriptionId,
        documentLevel: 'level_3', // Prescrição = nível 3
        professionalId: user.id
      }
    })

    if (error) {
      if (error.message?.includes('Certificado não encontrado')) {
        // Abrir modal de configuração de certificado
        setShowCertificateSetup(true)
        return
      }
      throw error
    }

    // Atualizar UI
    await loadPrescriptions()
    alert('Prescrição assinada digitalmente com sucesso!')
  } catch (err: any) {
    console.error('Erro ao assinar prescrição:', err)
    setError(err.message || 'Erro ao assinar prescrição')
    alert('Erro ao assinar prescrição: ' + (err.message || 'Erro desconhecido'))
  } finally {
    setSaving(false)
  }
}
```

---

### **FASE 5: Frontend - Gestão de Certificados (4-5 horas)**

#### **5.1 Criar CertificateManagement.tsx**

**Arquivo:** `src/pages/CertificateManagement.tsx` (NOVO)

```typescript
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const CertificateManagement: React.FC = () => {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCertificates()
  }, [user])

  const loadCertificates = async () => {
    if (!user?.id) return

    const { data, error } = await supabase
      .from('medical_certificates')
      .select('*')
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar certificados:', error)
      return
    }

    setCertificates(data || [])
  }

  const handleAddCertificate = async () => {
    // TODO: Implementar fluxo de adicionar certificado
    // - Upload de certificado A1
    // - Ou configuração de token A3
    // - Ou configuração de assinatura remota
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Certificados Digitais</h1>
      
      <button onClick={handleAddCertificate}>
        Adicionar Certificado
      </button>

      <div className="mt-6">
        {certificates.map(cert => (
          <div key={cert.id} className="border p-4 mb-4">
            <p>Tipo: {cert.certificate_type}</p>
            <p>AC: {cert.ac_provider}</p>
            <p>Expira em: {new Date(cert.expires_at).toLocaleDateString()}</p>
            <p>Status: {cert.is_active ? 'Ativo' : 'Inativo'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CertificateManagement
```

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### **Backend**
- [ ] Criar migration de schema
- [ ] Criar Edge Function `digital-signature`
- [ ] Integrar trigger no TradeVision Core
- [ ] Adicionar heurística de detecção
- [ ] Implementar determinação de nível
- [ ] Configurar variáveis de ambiente (API keys)

### **Frontend**
- [ ] Modificar `Prescriptions.tsx`
- [ ] Criar `CertificateManagement.tsx`
- [ ] Criar `DigitalSignatureWidget.tsx`
- [ ] Integrar com app_commands do Core
- [ ] Adicionar tratamento de erros

### **Integração AC**
- [ ] Escolher AC inicial
- [ ] Obter credenciais de API
- [ ] Implementar `acIntegration.ts`
- [ ] Testar integração
- [ ] Configurar fallback

### **Testes**
- [ ] Testar fluxo completo
- [ ] Testar sem certificado
- [ ] Testar certificado expirado
- [ ] Testar erro de AC
- [ ] Testar auditoria

---

## 📊 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Dia 1:** Estrutura de banco + Edge Function básica
2. **Dia 2:** Integração com TradeVision Core
3. **Dia 3:** Frontend - Prescriptions.tsx
4. **Dia 4:** Frontend - CertificateManagement.tsx
5. **Dia 5:** Integração real com AC + Testes

**Total estimado:** 5 dias de desenvolvimento

---

## 🔐 ALINHAMENTO COM COS v5.0

### **Como a Assinatura Digital se Integra ao COS:**

1. **Governança (COS Kernel):**
   - COS avalia se médico pode assinar
   - Verifica permissões e políticas
   - Bloqueia se necessário (trauma/metabolismo)

2. **Orquestração (TradeVision Core):**
   - Core não assina diretamente
   - Core orquestra o fluxo
   - Core governa via app_commands

3. **Auditoria (COS):**
   - Todas as assinaturas são auditadas
   - Logs em `pki_transactions`
   - Rastreabilidade completa

4. **Fail-Closed:**
   - Se AC falhar → bloqueia assinatura
   - Se certificado expirado → bloqueia
   - Se COS bloquear → não assina

---

**Documento gerado por:** Sistema de Planejamento  
**Data:** 05/02/2026  
**Status:** ✅ Pronto para execução
