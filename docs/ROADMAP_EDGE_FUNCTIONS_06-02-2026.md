# 🗺️ ROADMAP: Padronização de Edge Functions

**Data:** 06/02-2026  
**Status:** 📋 **PLANEJADO**

---

## 🎯 **OBJETIVO**

Padronizar todas as Edge Functions do projeto baseado na implementação bem-sucedida de `video-call-request-notification`.

---

## 📋 **FASE 1: Template Padrão**

### **1.1 Criar Template Base**

**Arquivo:** `docs/TEMPLATE_EDGE_FUNCTION_PADRAO.md`

**Conteúdo:**
- Estrutura padrão com CORS
- Validações obrigatórias
- Tratamento de erros
- Padrões de tipagem
- Exemplos de uso

**Tempo estimado:** 2-3 horas

---

### **1.2 Checklist Institucional**

**Arquivo:** `docs/CHECKLIST_EDGE_FUNCTIONS_INSTITUCIONAL.md`

**Itens:**
- [ ] CORS configurado corretamente
- [ ] OPTIONS retorna 200 com headers
- [ ] Validação de método HTTP
- [ ] Validação de parâmetros
- [ ] Tratamento de erros
- [ ] Logs adequados
- [ ] Tipagem explícita
- [ ] Fallbacks implementados
- [ ] Testes documentados

**Tempo estimado:** 1-2 horas

---

## 📋 **FASE 2: Aplicar em Edge Functions Existentes**

### **2.1 Listar Edge Functions Existentes**

**Edge Functions a revisar:**
- [ ] `video-call-request-notification` ✅ (já corrigida)
- [ ] `video-call-reminders` ⚠️ (revisar)
- [ ] `tradevision-core` ⚠️ (revisar)
- [ ] Outras Edge Functions...

**Tempo estimado:** 1 hora (auditoria)

---

### **2.2 Aplicar Padrão**

**Para cada Edge Function:**
1. Revisar código atual
2. Aplicar template padrão
3. Validar CORS
4. Adicionar validações
5. Testar em produção

**Tempo estimado:** 2-3 horas por Edge Function

---

## 📋 **FASE 3: WebRTC Signaling**

### **3.1 Revisar CORS + Auth do Signaling WebRTC**

**Objetivo:** Garantir que o signaling WebRTC também tenha CORS correto.

**Checklist:**
- [ ] Verificar Edge Functions de WebRTC
- [ ] Aplicar padrão de CORS
- [ ] Validar autenticação
- [ ] Testar em produção

**Tempo estimado:** 3-4 horas

---

## 📋 **FASE 4: Documentação e Treinamento**

### **4.1 Documentação Completa**

**Arquivos:**
- [ ] `docs/TEMPLATE_EDGE_FUNCTION_PADRAO.md`
- [ ] `docs/CHECKLIST_EDGE_FUNCTIONS_INSTITUCIONAL.md`
- [ ] `docs/GUIA_DEPLOY_EDGE_FUNCTIONS.md`
- [ ] `docs/BOAS_PRATICAS_EDGE_FUNCTIONS.md`

**Tempo estimado:** 4-6 horas

---

### **4.2 Treinamento (Opcional)**

**Conteúdo:**
- Como usar o template
- Como aplicar o checklist
- Como testar Edge Functions
- Como fazer deploy

**Tempo estimado:** 2-3 horas

---

## ⏱️ **TEMPO TOTAL ESTIMADO**

- **Fase 1:** 3-5 horas
- **Fase 2:** 3-4 horas (por Edge Function)
- **Fase 3:** 3-4 horas
- **Fase 4:** 6-9 horas

**Total:** 15-22 horas (2-3 dias de trabalho)

---

## 🎯 **PRIORIDADES**

### **🔴 ALTA (Fazer Agora)**
1. ✅ `video-call-request-notification` - FEITO
2. ⚠️ `video-call-reminders` - PRÓXIMO
3. ⚠️ `tradevision-core` - DEPOIS

### **🟡 MÉDIA (Fazer Depois)**
4. ⚠️ Criar template padrão
5. ⚠️ Criar checklist institucional
6. ⚠️ Revisar WebRTC signaling

### **🟢 BAIXA (Fazer Por Último)**
7. ⚠️ Documentação completa
8. ⚠️ Treinamento

---

## 📋 **CHECKLIST GERAL**

- [x] `video-call-request-notification` corrigida e validada
- [ ] Template padrão criado
- [ ] Checklist institucional criado
- [ ] `video-call-reminders` revisada
- [ ] `tradevision-core` revisada
- [ ] WebRTC signaling revisado
- [ ] Documentação completa
- [ ] Todas as Edge Functions padronizadas

---

**Documento criado por:** Sistema de Roadmap  
**Data:** 06/02/2026  
**Status:** 📋 Planejado
