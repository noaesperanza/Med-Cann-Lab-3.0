# ✅ CHECKLIST DE IMPLEMENTAÇÃO: ASSINATURA DIGITAL MÉDICA

**Data:** 05/02/2026  
**Status:** 🚀 Em andamento  
**Prioridade:** ALTA

---

## 📊 STATUS ATUAL

### ✅ **O QUE JÁ EXISTE:**
- [x] Tabela `cfm_prescriptions` (com campos de assinatura)
- [x] Tabela `pki_transactions` (auditoria)
- [x] Frontend `Prescriptions.tsx` (com integração Lacuna Web PKI simulada)
- [x] TradeVision Core funcionando
- [x] COS v5.0 implementado

### ❌ **O QUE FALTA FAZER:**

---

## 🎯 FASE 1: ESTRUTURA DE BANCO (PRIORIDADE 1)

### **1.1 Migration de Schema**
- [ ] Criar arquivo `database/scripts/CREATE_DIGITAL_SIGNATURE_SCHEMA.sql`
- [ ] Adicionar coluna `document_level` em `cfm_prescriptions`
- [ ] Criar tabela `medical_certificates`
- [ ] Criar tabela `signature_confirmations`
- [ ] Criar tabela `document_snapshots`
- [ ] Criar RLS Policies para todas as tabelas
- [ ] Executar migration no Supabase

**Tempo estimado:** 1-2 horas  
**Status:** ⏳ Pronto para começar

---

## 🎯 FASE 2: EDGE FUNCTION DE ASSINATURA (PRIORIDADE 2)

### **2.1 Criar Edge Function**
- [ ] Criar diretório `supabase/functions/digital-signature/`
- [ ] Criar arquivo `index.ts` com handler básico
- [ ] Implementar `resolveCertificate()` - busca certificado ativo
- [ ] Implementar `prepareDocumentHash()` - gera hash SHA-256
- [ ] Implementar `createSnapshot()` - cria snapshot imutável
- [ ] Implementar `callACProvider()` - integração com AC (simulado inicialmente)
- [ ] Implementar `persistAudit()` - salva em `pki_transactions`
- [ ] Implementar `updateDocument()` - atualiza `cfm_prescriptions`
- [ ] Adicionar tratamento de erros completo
- [ ] Testar Edge Function localmente

**Tempo estimado:** 3-4 horas  
**Status:** ⏳ Aguardando FASE 1

---

## 🎯 FASE 3: INTEGRAÇÃO COM TRADEVISION CORE (PRIORIDADE 3)

### **3.1 Adicionar Triggers no Core**
- [ ] Adicionar `SIGN_DOCUMENT` aos `GPT_TRIGGERS`
- [ ] Adicionar `CHECK_CERTIFICATE` aos `GPT_TRIGGERS`
- [ ] Criar função `detectSignIntent()` - heurística de detecção
- [ ] Criar função `determineDocumentLevel()` - determina nível do documento
- [ ] Adicionar lógica no fluxo principal para detectar intenção de assinar
- [ ] Adicionar `app_command` do tipo `sign_document`
- [ ] Testar detecção via chat (GPT + heurística)

**Tempo estimado:** 2-3 horas  
**Status:** ⏳ Aguardando FASE 2

---

## 🎯 FASE 4: FRONTEND - COMPONENTE DE ASSINATURA (PRIORIDADE 4)

### **4.1 Modificar Prescriptions.tsx**
- [ ] Atualizar `handleDigitalSignature()` para chamar Edge Function
- [ ] Adicionar verificação de certificado antes de assinar
- [ ] Adicionar modal de confirmação de assinatura
- [ ] Adicionar tratamento de erro (certificado não encontrado)
- [ ] Adicionar loading state durante assinatura
- [ ] Adicionar feedback visual (status "Assinada")
- [ ] Adicionar exibição de QR Code ITI (se aplicável)
- [ ] Testar fluxo completo de assinatura

**Tempo estimado:** 3-4 horas  
**Status:** ⏳ Aguardando FASE 2

---

## 🎯 FASE 5: FRONTEND - GESTÃO DE CERTIFICADOS (PRIORIDADE 5)

### **5.1 Criar CertificateManagement.tsx**
- [ ] Criar página `src/pages/CertificateManagement.tsx`
- [ ] Implementar listagem de certificados
- [ ] Implementar formulário de adicionar certificado (A1)
- [ ] Implementar configuração de token A3
- [ ] Implementar configuração de assinatura remota
- [ ] Implementar renovação de certificado
- [ ] Adicionar validação de certificado
- [ ] Adicionar notificações de vencimento
- [ ] Adicionar rota no sistema de navegação

**Tempo estimado:** 4-5 horas  
**Status:** ⏳ Aguardando FASE 1

---

## 🎯 FASE 6: FRONTEND - WIDGET DE ASSINATURA (PRIORIDADE 6)

### **6.1 Criar DigitalSignatureWidget.tsx**
- [ ] Criar componente `src/components/DigitalSignatureWidget.tsx`
- [ ] Implementar modal de assinatura
- [ ] Implementar exibição de status da assinatura
- [ ] Implementar exibição de QR Code ITI
- [ ] Implementar validação de assinatura
- [ ] Adicionar integração com app_commands do Core
- [ ] Testar widget no chat

**Tempo estimado:** 3-4 horas  
**Status:** ⏳ Aguardando FASE 4

---

## 🎯 FASE 7: INTEGRAÇÃO COM AC REAL (PRIORIDADE 7)

### **7.1 Escolher e Integrar AC**
- [ ] Escolher AC inicial (Soluti ou Certisign recomendado)
- [ ] Obter conta de desenvolvedor
- [ ] Obter API Key / Credenciais
- [ ] Ler documentação da API
- [ ] Criar arquivo `src/lib/acIntegration.ts`
- [ ] Implementar interface `ACProvider`
- [ ] Implementar classe `SolutiAC` ou `CertisignAC`
- [ ] Implementar factory `getACProvider()`
- [ ] Integrar com Edge Function `digital-signature`
- [ ] Testar integração real
- [ ] Configurar variáveis de ambiente

**Tempo estimado:** 4-6 horas  
**Status:** ⏳ Aguardando decisão de qual AC usar

---

## 🎯 FASE 8: TESTES E VALIDAÇÃO (PRIORIDADE 8)

### **8.1 Testes Funcionais**
- [ ] Testar fluxo completo de assinatura
- [ ] Testar sem certificado (deve abrir modal de configuração)
- [ ] Testar certificado expirado (deve bloquear)
- [ ] Testar erro de AC (deve ter fallback)
- [ ] Testar auditoria (verificar `pki_transactions`)
- [ ] Testar snapshots (verificar `document_snapshots`)
- [ ] Testar confirmações (verificar `signature_confirmations`)
- [ ] Testar níveis de documento (level_1, level_2, level_3)
- [ ] Testar integração com TradeVision Core
- [ ] Testar via chat (GPT + heurística)

**Tempo estimado:** 2-3 horas  
**Status:** ⏳ Aguardando todas as fases anteriores

---

## 📋 ORDEM DE EXECUÇÃO RECOMENDADA

### **HOJE (Dia 1):**
1. ✅ FASE 1: Criar migration de schema
2. ✅ FASE 2: Criar Edge Function básica (com simulação)

### **AMANHÃ (Dia 2):**
3. ✅ FASE 3: Integrar com TradeVision Core
4. ✅ FASE 4: Modificar Prescriptions.tsx

### **PRÓXIMOS DIAS:**
5. ✅ FASE 5: Criar CertificateManagement.tsx
6. ✅ FASE 6: Criar DigitalSignatureWidget.tsx
7. ✅ FASE 7: Integrar com AC real (quando escolher)
8. ✅ FASE 8: Testes completos

---

## 🚀 PRÓXIMA AÇÃO IMEDIATA

**Vamos começar pela FASE 1: Estrutura de Banco**

Criar o arquivo de migration com todas as tabelas necessárias.

---

**Documento criado por:** Sistema de Planejamento  
**Data:** 05/02/2026  
**Status:** ✅ Pronto para execução
