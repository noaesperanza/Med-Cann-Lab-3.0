# 🔧 PLANO DE CORREÇÃO: Avaliação Clínica - Uma Pergunta por Vez

**Data:** 05/02/2026  
**Problema:** GPT está fazendo múltiplas perguntas de uma vez na avaliação clínica  
**Objetivo:** Ajustar para fazer UMA pergunta por vez, aguardando resposta antes da próxima

---

## 🔍 DIAGNÓSTICO DO PROBLEMA

### **Problema Identificado:**

O GPT está fazendo múltiplas perguntas de uma vez, como:
```
"Onde exatamente você sente a dor? Quando começou? Como é a dor? 
O que mais você sente? O que parece melhorar e o que parece piorar essa dor nos rins?"
```

### **Causa Raiz:**

**No prompt do Core (`tradevision-core/index.ts`, linha 1541):**
```
4. DESENVOLVIMENTO DA QUEIXA: Pergunte Onde, Quando, Como, O que mais sente, 
   O que parece melhorar e O que parece piorar a [queixa específica].
```

**Problema:** O prompt está **instruindo explicitamente** o GPT a fazer TODAS essas perguntas de uma vez!

**Contradição:** Na linha 1574 há a regra:
```
- Faça APENAS UMA pergunta por vez. Respeite as pausas.
```

Mas essa regra está sendo **ignorada** porque o passo 4 está explicitamente dizendo para fazer várias perguntas.

### **Sistema Já Tem a Solução:**

✅ O `clinicalAssessmentFlow.ts` já faz o controle de uma pergunta por vez  
✅ O sistema já envia `nextQuestionHint` para o Core  
✅ O Core já recebe `assessmentPhase` e `nextQuestionHint`  
✅ O problema é que o **prompt não está usando** essas informações corretamente

---

## 📋 PLANO DE CORREÇÃO

### **FASE 1: Ajustar o Prompt do Core (CRÍTICO)**

#### **1.1 Corrigir o Passo 4 do Protocolo AEC 001**

**Arquivo:** `supabase/functions/tradevision-core/index.ts`  
**Localização:** Linha ~1541

**ANTES (ERRADO):**
```typescript
4. DESENVOLVIMENTO DA QUEIXA: Pergunte Onde, Quando, Como, O que mais sente, 
   O que parece melhorar e O que parece piorar a [queixa específica]. 
   Substitua [queixa] pela resposta literal do usuário.
```

**DEPOIS (CORRETO):**
```typescript
4. DESENVOLVIMENTO DA QUEIXA: Você deve explorar a queixa principal fazendo 
   UMA pergunta por vez, aguardando a resposta antes de fazer a próxima. 
   As perguntas a serem feitas (uma de cada vez) são:
   - Onde você sente [queixa específica]?
   - Quando começou?
   - Como é a dor/sintoma?
   - O que mais você sente relacionado a isso?
   - O que parece melhorar [queixa específica]?
   - O que parece piorar [queixa específica]?
   
   IMPORTANTE: Faça APENAS UMA dessas perguntas por vez. Aguarde a resposta 
   do usuário antes de fazer a próxima. Substitua [queixa específica] pela 
   resposta literal do usuário na queixa principal.
```

#### **1.2 Reforçar a Regra de "Uma Pergunta por Vez"**

**Arquivo:** `supabase/functions/tradevision-core/index.ts`  
**Localização:** Linha ~1574 (REGRAS DE CONDUTA)

**ANTES:**
```typescript
REGRAS DE CONDUTA (IMPORTANTE):
- NUNCA forneça diagnósticos ou sugira interpretações clínicas.
- NUNCA antecipe blocos ou altere a ordem do roteiro.
- Faça APENAS UMA pergunta por vez. Respeite as pausas.
```

**DEPOIS:**
```typescript
REGRAS DE CONDUTA (IMPORTANTE - CRÍTICO):
- NUNCA forneça diagnósticos ou sugira interpretações clínicas.
- NUNCA antecipe blocos ou altere a ordem do roteiro.
- 🚨 **UMA PERGUNTA POR VEZ (REGRA ABSOLUTA)**: Faça APENAS UMA pergunta por vez. 
  Aguarde a resposta do usuário antes de fazer a próxima pergunta. 
  NUNCA faça múltiplas perguntas na mesma resposta, mesmo que o protocolo 
  liste várias perguntas a serem feitas. Cada pergunta deve ser feita 
  individualmente, em turnos separados.
- Respeite as pausas e dê tempo para o usuário responder.
```

#### **1.3 Usar nextQuestionHint de Forma Mais Enfática**

**Arquivo:** `supabase/functions/tradevision-core/index.ts`  
**Localização:** Linha ~1520 (onde nextQuestionHint é usado)

**ANTES:**
```typescript
if (nextQuestionHint) {
    phaseInstruction += `\n\n👉 PRÓXIMA PERGUNTA SUGERIDA PELO PROTOCOLO: "${nextQuestionHint}". Use esta pergunta para manter o fluxo correto.`
}
```

**DEPOIS:**
```typescript
if (nextQuestionHint) {
    phaseInstruction += `\n\n🚨 PRÓXIMA PERGUNTA OBRIGATÓRIA DO PROTOCOLO: "${nextQuestionHint}"\n\nVOCÊ DEVE FAZER APENAS ESTA PERGUNTA. NÃO faça múltiplas perguntas. NÃO adicione outras perguntas. Faça SOMENTE esta pergunta e aguarde a resposta do usuário antes de continuar.`
}
```

#### **1.4 Adicionar Instrução Específica para Fase COMPLAINT_DETAILS**

**Arquivo:** `supabase/functions/tradevision-core/index.ts`  
**Localização:** Após phaseInstruction (linha ~1522)

**ADICIONAR:**
```typescript
// Instrução específica para fase de desenvolvimento da queixa
if (assessmentPhase === 'COMPLAINT_DETAILS' || assessmentPhase === 'COMPLAINT_DETAILS') {
    phaseInstruction += `\n\n⚠️ FASE: DESENVOLVIMENTO DA QUEIXA\n\nVocê está na fase de explorar os detalhes da queixa principal. Esta fase requer MÚLTIPLAS perguntas, mas você DEVE fazer UMA por vez:\n- Primeiro: "Onde você sente [queixa]?"\n- Depois de receber resposta: "Quando começou?"\n- Depois: "Como é a dor/sintoma?"\n- E assim por diante.\n\nNÃO faça todas as perguntas de uma vez. Use o nextQuestionHint para saber qual pergunta fazer AGORA.`
}
```

---

### **FASE 2: Verificar Integração com clinicalAssessmentFlow**

#### **2.1 Verificar se nextQuestionHint está sendo enviado corretamente**

**Arquivo:** `src/lib/noaResidentAI.ts`  
**Localização:** Linha ~1476-1497

**Verificar:**
- ✅ `clinicalAssessmentFlow.getState()` está sendo chamado
- ✅ `nextQuestionHint` está sendo extraído corretamente
- ✅ `nextQuestionHint` está sendo enviado no body para o Core

**Se necessário, ajustar:**
```typescript
// Garantir que nextQuestionHint está sendo enviado
const body = {
  message: userMessage,
  conversationHistory: history,
  patientData: {
    user: userData,
    intent: detectedIntent
  },
  assessmentPhase: currentPhase, // ✅ Já está
  nextQuestionHint: nextQuestionHint, // ✅ Verificar se está sendo enviado
  // ... outros campos
}
```

---

### **FASE 3: Adicionar Validação Pós-Resposta (Opcional)**

#### **3.1 Detectar Múltiplas Perguntas na Resposta do GPT**

**Arquivo:** `supabase/functions/tradevision-core/index.ts`  
**Localização:** Após receber resposta do GPT (linha ~1900+)

**ADICIONAR (Opcional - para debug):**
```typescript
// Detectar se GPT fez múltiplas perguntas (para log/debug)
const questionMarks = (aiResponse || '').split('?').length - 1
if (questionMarks > 1 && assessmentPhase) {
    console.warn(`⚠️ [AVALIAÇÃO] GPT fez ${questionMarks} perguntas em uma resposta. Fase: ${assessmentPhase}`)
    // Não bloquear, mas logar para monitoramento
}
```

---

## 🎯 RESUMO DAS MUDANÇAS

### **Mudanças Críticas:**

1. ✅ **Passo 4 do Protocolo AEC 001:** Ajustar para fazer uma pergunta por vez
2. ✅ **Regra de Conduta:** Reforçar "uma pergunta por vez" como regra absoluta
3. ✅ **nextQuestionHint:** Usar de forma mais enfática e obrigatória
4. ✅ **Instrução específica:** Adicionar para fase COMPLAINT_DETAILS

### **Arquivos a Modificar:**

1. `supabase/functions/tradevision-core/index.ts`
   - Linha ~1541: Passo 4 do protocolo
   - Linha ~1574: Regras de conduta
   - Linha ~1520: Uso do nextQuestionHint
   - Linha ~1522: Instrução específica para COMPLAINT_DETAILS

2. `src/lib/noaResidentAI.ts` (verificar apenas)
   - Linha ~1476-1497: Verificar se nextQuestionHint está sendo enviado

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Ajustar Passo 4 do Protocolo AEC 001 no prompt
- [ ] Reforçar regra "uma pergunta por vez" nas REGRAS DE CONDUTA
- [ ] Tornar nextQuestionHint mais enfático e obrigatório
- [ ] Adicionar instrução específica para fase COMPLAINT_DETAILS
- [ ] Verificar se nextQuestionHint está sendo enviado do frontend
- [ ] Testar fluxo completo:
  - [ ] Iniciar avaliação
  - [ ] Chegar na fase "Desenvolvimento da Queixa"
  - [ ] Verificar se GPT faz apenas uma pergunta por vez
  - [ ] Verificar se aguarda resposta antes da próxima

---

## 🧪 TESTE ESPERADO

### **Antes (ERRADO):**
```
Usuário: "dores nos rins"

GPT: "Onde exatamente você sente a dor? Quando começou? Como é a dor? 
      O que mais você sente? O que parece melhorar e o que parece piorar?"
```

### **Depois (CORRETO):**
```
Usuário: "dores nos rins"

GPT: "Entendi, Pedro. Vamos explorar mais sobre as dores nos rins. 
      Onde exatamente você sente a dor?"

[Usuário responde]

GPT: "Quando essa dor começou?"

[Usuário responde]

GPT: "Como você descreveria essa dor?"

[... e assim por diante, uma pergunta por vez]
```

---

## 📝 NOTAS IMPORTANTES

1. **Não quebrar funcionalidades existentes:**
   - O sistema já tem `clinicalAssessmentFlow` funcionando
   - Apenas ajustar o prompt para usar corretamente o `nextQuestionHint`
   - Manter retrocompatibilidade

2. **Append-only:**
   - Não remover funcionalidades
   - Apenas ajustar instruções do prompt
   - Seguir filosofia selada do sistema

3. **Teste cuidadoso:**
   - Testar especialmente a fase "Desenvolvimento da Queixa"
   - Verificar se outras fases não foram afetadas
   - Garantir que o fluxo completo funciona

---

**Documento criado por:** Sistema de Análise  
**Data:** 05/02/2026  
**Status:** ✅ Pronto para implementação
