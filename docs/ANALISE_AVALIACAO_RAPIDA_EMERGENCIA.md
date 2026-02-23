# 🔍 ANÁLISE: Avaliação Rápida de Emergência

**Data:** 05/02/2026  
**Contexto:** Verificar se existe módulo de avaliação rápida e ajustar regra "uma pergunta por vez"

---

## 🎯 ANÁLISE DO CÓDIGO

### **1. O que foi encontrado:**

#### ✅ **Existe:**
- **Prescrições Rápidas** (`QuickPrescriptions.tsx`)
- **Agendamentos de Emergência** (tipo de consulta: "urgência")
- **Mensagens de emergência** no fallback offline
- **Detecção de urgência** no código (`urgency_language`)

#### ❌ **NÃO Existe:**
- **Módulo específico de "Avaliação Clínica Rápida de Emergência"**
- **Modo de avaliação acelerado** no protocolo AEC 001
- **Flag ou parâmetro** para ativar avaliação rápida

### **2. Protocolo AEC 001 Atual:**

O protocolo AEC 001 é para **avaliação clínica inicial completa**, não para emergência:
- 10 etapas obrigatórias
- Uma pergunta por vez (regra que acabamos de implementar)
- Foco em escuta e narrativa completa

---

## 💡 SOLUÇÃO PROPOSTA

### **Opção 1: Detectar Urgência e Permitir Múltiplas Perguntas (RECOMENDADA)**

**Como funciona:**
1. Sistema detecta palavras de urgência na mensagem do usuário
2. Se detectar urgência + estiver em avaliação clínica → permite múltiplas perguntas
3. Se não detectar urgência → mantém regra "uma pergunta por vez"

**Vantagens:**
- ✅ Não quebra avaliação normal
- ✅ Permite avaliação rápida quando necessário
- ✅ Detecção automática (não precisa flag manual)

**Implementação:**
```typescript
// Detectar urgência
const isUrgent = /(urgente|emergência|emergencia|socorro|urgência|preciso urgente|agora|imediato)/i.test(message)

// Ajustar instrução baseado em urgência
if (isUrgent && assessmentPhase === 'COMPLAINT_DETAILS') {
    phaseInstruction += `\n\n🚨 MODO URGÊNCIA DETECTADO: Você pode fazer múltiplas perguntas essenciais de uma vez para acelerar a avaliação. Foque nas perguntas críticas: Onde, Quando, Como, Intensidade.`
} else {
    // Modo normal: uma pergunta por vez
}
```

---

### **Opção 2: Flag Manual para Modo Rápido**

**Como funciona:**
1. Adicionar parâmetro `assessmentMode: 'normal' | 'rapid' | 'emergency'` no body
2. Frontend pode enviar `assessmentMode: 'rapid'` quando necessário
3. Core ajusta prompt baseado no modo

**Vantagens:**
- ✅ Controle explícito
- ✅ Médico/profissional decide quando usar

**Desvantagens:**
- ⚠️ Requer mudança no frontend
- ⚠️ Mais complexo

---

### **Opção 3: Manter Como Está (Uma Pergunta por Vez Sempre)**

**Como funciona:**
- Manter regra atual: sempre uma pergunta por vez
- Para emergência: orientar usuário a procurar atendimento imediato

**Vantagens:**
- ✅ Simples
- ✅ Não quebra nada
- ✅ Alinhado com protocolo AEC 001 completo

**Desvantagens:**
- ⚠️ Pode ser lento para casos urgentes

---

## 🎯 RECOMENDAÇÃO FINAL

### **Implementar Opção 1: Detecção Automática de Urgência**

**Por quê:**
1. ✅ Não quebra avaliação normal
2. ✅ Permite avaliação rápida quando necessário
3. ✅ Detecção automática (sem mudanças no frontend)
4. ✅ Mantém protocolo AEC 001 completo para casos normais

**Como implementar:**

1. **Adicionar detecção de urgência no Core:**
```typescript
// Após linha ~1513 (onde message é validado)
const isUrgent = /(urgente|emergência|emergencia|socorro|urgência|preciso urgente|agora|imediato|dor forte|muito mal)/i.test(message)
```

2. **Ajustar phaseInstruction baseado em urgência:**
```typescript
// Após linha ~1525 (onde adicionamos instrução para COMPLAINT_DETAILS)
if (assessmentPhase === 'COMPLAINT_DETAILS') {
    if (isUrgent) {
        phaseInstruction += `\n\n🚨 MODO URGÊNCIA DETECTADO\n\nVocê detectou urgência na mensagem do usuário. Para acelerar a avaliação, você pode fazer múltiplas perguntas essenciais de uma vez, focando nas informações críticas:\n- Onde você sente [queixa]?\n- Quando começou?\n- Como é a dor/sintoma? (intensidade)\n- O que parece melhorar ou piorar?\n\nFaça essas perguntas essenciais de uma vez para agilizar.`
    } else {
        phaseInstruction += `\n\n⚠️ FASE: DESENVOLVIMENTO DA QUEIXA\n\nVocê está na fase de explorar os detalhes da queixa principal. Esta fase requer MÚLTIPLAS perguntas, mas você DEVE fazer UMA por vez:\n- Primeiro: "Onde você sente [queixa]?"\n- Depois de receber resposta: "Quando começou?"\n- Depois: "Como é a dor/sintoma?"\n- E assim por diante.\n\nNÃO faça todas as perguntas de uma vez. Use o nextQuestionHint para saber qual pergunta fazer AGORA.`
    }
}
```

3. **Ajustar regra de conduta:**
```typescript
// Na linha ~1587, ajustar regra
- 🚨 **UMA PERGUNTA POR VEZ (REGRA ABSOLUTA - EXCETO EM URGÊNCIA)**: Faça APENAS UMA pergunta por vez. Aguarde a resposta do usuário antes de fazer a próxima pergunta. NUNCA faça múltiplas perguntas na mesma resposta, mesmo que o protocolo liste várias perguntas a serem feitas. Cada pergunta deve ser feita individualmente, em turnos separados.
  
  **EXCEÇÃO - MODO URGÊNCIA**: Se você detectar urgência na mensagem do usuário (palavras como "urgente", "emergência", "socorro", "agora", "imediato"), você pode fazer múltiplas perguntas essenciais de uma vez para acelerar a avaliação. Mas apenas em casos de urgência explícita.
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Adicionar detecção de urgência no Core
- [ ] Ajustar phaseInstruction para modo urgência
- [ ] Ajustar regra de conduta com exceção para urgência
- [ ] Testar:
  - [ ] Avaliação normal (uma pergunta por vez)
  - [ ] Avaliação com urgência (múltiplas perguntas)
  - [ ] Verificar se não quebrou outras funcionalidades

---

## 🧪 TESTE ESPERADO

### **Cenário 1: Avaliação Normal**
```
Usuário: "dores nos rins"

GPT: "Entendi, Pedro. Vamos explorar mais sobre as dores nos rins. 
      Onde exatamente você sente a dor?"

[Usuário responde]

GPT: "Quando essa dor começou?"
```

### **Cenário 2: Avaliação com Urgência**
```
Usuário: "dores nos rins urgente preciso de ajuda agora"

GPT: "Entendi, Pedro. Vou acelerar a avaliação. Preciso de algumas informações essenciais:
      - Onde exatamente você sente a dor?
      - Quando começou?
      - Como você descreveria a intensidade da dor?
      - O que parece melhorar ou piorar?"
```

---

## 📝 NOTAS IMPORTANTES

1. **Não quebrar funcionalidades existentes:**
   - Avaliação normal continua com uma pergunta por vez
   - Apenas casos de urgência explícita permitem múltiplas perguntas

2. **Append-only:**
   - Não remover funcionalidades
   - Apenas adicionar detecção de urgência
   - Seguir filosofia selada do sistema

3. **Segurança:**
   - Em casos de urgência real, sempre orientar procurar atendimento imediato
   - Avaliação rápida não substitui atendimento de emergência

---

**Documento criado por:** Sistema de Análise  
**Data:** 05/02/2026  
**Status:** ✅ Pronto para implementação
