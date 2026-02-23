# 🚀 PRÓXIMOS PASSOS: Assinatura Digital

**Data:** 05/02/2026  
**Status Atual:** ✅ 3 de 8 FASES COMPLETAS (37.5%)  
**Migration:** ✅ EXECUTADA COM SUCESSO

---

## ✅ O QUE JÁ ESTÁ PRONTO

1. ✅ **FASE 1:** Estrutura de banco criada e executada
2. ✅ **FASE 2:** Edge Function `digital-signature` criada
3. ✅ **FASE 3:** Integração no TradeVision Core completa

---

## 🎯 PRÓXIMOS PASSOS (ORDEM DE PRIORIDADE)

### **PASSO 1: FASE 4 - Modificar Prescriptions.tsx (PRIORIDADE ALTA)**

**Objetivo:** Integrar o botão de assinatura digital com a Edge Function

**O que fazer:**
1. Modificar função `handleDigitalSignature()` em `src/pages/Prescriptions.tsx`
2. Substituir simulação atual por chamada real à Edge Function
3. Adicionar verificação de certificado antes de assinar
4. Adicionar modal de confirmação
5. Adicionar tratamento de erros (certificado não encontrado, expirado, etc)
6. Adicionar loading state durante assinatura
7. Atualizar UI após assinatura bem-sucedida

**Arquivo:** `src/pages/Prescriptions.tsx`  
**Tempo estimado:** 2-3 horas  
**Dependências:** Nenhuma (pode começar agora)

**Código base:**
```typescript
const handleDigitalSignature = async () => {
  // 1. Verificar se tem prescrição selecionada
  // 2. Chamar Edge Function: supabase.functions.invoke('digital-signature')
  // 3. Tratar resposta (sucesso/erro)
  // 4. Atualizar UI
}
```

---

### **PASSO 2: FASE 5 - Criar CertificateManagement.tsx (PRIORIDADE MÉDIA)**

**Objetivo:** Criar página para gestão de certificados digitais

**O que fazer:**
1. Criar arquivo `src/pages/CertificateManagement.tsx`
2. Implementar listagem de certificados do profissional
3. Implementar formulário para adicionar certificado:
   - Tipo: A1 (arquivo), A3 (token), Remote (cloud)
   - AC Provider: Soluti, Certisign, Valid, etc
   - Data de expiração
   - Upload/Configuração
4. Implementar renovação de certificado
5. Adicionar notificações de vencimento
6. Adicionar rota no sistema de navegação

**Arquivo:** `src/pages/CertificateManagement.tsx` (NOVO)  
**Tempo estimado:** 3-4 horas  
**Dependências:** Nenhuma

**Estrutura básica:**
```typescript
- Lista de certificados (tabela/cards)
- Botão "Adicionar Certificado"
- Modal de adicionar/editar certificado
- Status visual (ativo, expirado, próximo do vencimento)
```

---

### **PASSO 3: FASE 6 - Criar DigitalSignatureWidget.tsx (PRIORIDADE MÉDIA)**

**Objetivo:** Criar widget de assinatura para usar no chat

**O que fazer:**
1. Criar arquivo `src/components/DigitalSignatureWidget.tsx`
2. Implementar modal de assinatura
3. Exibir status da assinatura (assinada, pendente, erro)
4. Exibir QR Code ITI (se aplicável)
5. Integrar com `app_commands` do TradeVision Core
6. Adicionar validação de assinatura

**Arquivo:** `src/components/DigitalSignatureWidget.tsx` (NOVO)  
**Tempo estimado:** 2-3 horas  
**Dependências:** FASE 4 (para integração)

---

### **PASSO 4: FASE 7 - Integração com AC Real (PRIORIDADE BAIXA - DEPENDE DE ESCOLHA)**

**Objetivo:** Substituir simulação por integração real com AC

**O que fazer:**
1. **Escolher AC inicial:**
   - Soluti (recomendado)
   - Certisign
   - Valid
   - Safeweb
   - Serasa

2. **Obter credenciais:**
   - Conta de desenvolvedor
   - API Key / Credenciais
   - Documentação da API

3. **Implementar integração:**
   - Criar `src/lib/acIntegration.ts`
   - Implementar interface `ACProvider`
   - Implementar classe específica (ex: `SolutiAC`)
   - Substituir simulação na Edge Function

**Arquivo:** `src/lib/acIntegration.ts` (NOVO)  
**Tempo estimado:** 4-6 horas  
**Dependências:** Escolha da AC + credenciais

---

### **PASSO 5: FASE 8 - Testes Completos (PRIORIDADE ALTA - ANTES DE PRODUÇÃO)**

**Objetivo:** Validar todo o fluxo de assinatura

**O que testar:**
1. ✅ Fluxo completo de assinatura (criar prescrição → assinar)
2. ✅ Sem certificado (deve abrir modal de configuração)
3. ✅ Certificado expirado (deve bloquear)
4. ✅ Erro de AC (deve ter fallback/mensagem clara)
5. ✅ Auditoria (verificar `pki_transactions`)
6. ✅ Snapshots (verificar `document_snapshots`)
7. ✅ Confirmações (verificar `signature_confirmations`)
8. ✅ Níveis de documento (level_1, level_2, level_3)
9. ✅ Integração com TradeVision Core (via chat)
10. ✅ Via chat (GPT + heurística)

**Tempo estimado:** 2-3 horas  
**Dependências:** Todas as fases anteriores

---

## 📋 CHECKLIST RÁPIDO

### **Para começar AGORA:**
- [ ] **FASE 4:** Modificar `Prescriptions.tsx` (2-3h)
- [ ] **FASE 5:** Criar `CertificateManagement.tsx` (3-4h)
- [ ] **FASE 6:** Criar `DigitalSignatureWidget.tsx` (2-3h)

### **Depois:**
- [ ] **FASE 7:** Integrar AC real (quando escolher)
- [ ] **FASE 8:** Testes completos

---

## 🎯 RECOMENDAÇÃO: ORDEM DE EXECUÇÃO

### **HOJE (Dia 1):**
1. ✅ **FASE 4:** Modificar `Prescriptions.tsx`
   - Integrar com Edge Function
   - Testar fluxo básico de assinatura

### **AMANHÃ (Dia 2):**
2. ✅ **FASE 5:** Criar `CertificateManagement.tsx`
   - Página de gestão de certificados
   - Adicionar certificado

3. ✅ **FASE 6:** Criar `DigitalSignatureWidget.tsx`
   - Widget para chat
   - Integração com Core

### **PRÓXIMOS DIAS:**
4. ✅ **FASE 7:** Integrar AC real (quando escolher)
5. ✅ **FASE 8:** Testes completos

---

## 💡 DICAS IMPORTANTES

### **1. Testar incrementalmente:**
- Após cada fase, testar o que foi implementado
- Não esperar todas as fases para testar

### **2. Edge Function já está pronta:**
- Pode testar chamando diretamente
- Usar Supabase Dashboard → Edge Functions → Test

### **3. Banco de dados pronto:**
- Todas as tabelas criadas
- RLS configurado
- Pode inserir dados de teste

### **4. TradeVision Core integrado:**
- Triggers funcionando
- Heurística detectando intenção
- GPT pode emitir `[SIGN_DOCUMENT]`

---

## 🚀 COMEÇAR AGORA

**Próxima ação imediata:**
1. Abrir `src/pages/Prescriptions.tsx`
2. Localizar função `handleDigitalSignature()`
3. Substituir simulação por chamada real à Edge Function
4. Testar

---

**Documento criado por:** Sistema de Planejamento  
**Data:** 05/02/2026  
**Status:** ✅ Pronto para continuar implementação
