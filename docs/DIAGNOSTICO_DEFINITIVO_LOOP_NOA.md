# RELATÓRIO TÉCNICO FINAL - DIAGNÓSTICO LOOP DA NOÂ
**Data:** 15/01/2026 18:46  
**Versão:** 3.0 (Diagnóstico Definitivo)

---

## 🔴 PROBLEMA RAIZ IDENTIFICADO

### O QUE ESTÁ ACONTECENDO
A Nôa **NÃO TEM MEMÓRIA** da conversa. Cada mensagem que você envia é processada como se fosse a PRIMEIRA vez.

**Evidência nos Logs:**
```
📥 [REQUEST] { messageLength: 40, assessmentPhase: "none" }
📥 [REQUEST] { messageLength: 5, assessmentPhase: "none" }  ← SEMPRE "none"!
```

### POR QUE ISSO ACONTECE

**Arquitetura Atual (INCOMPLETA):**
```
Você → Frontend → Edge Function → OpenAI → Resposta
                     ↓
                (SEM HISTÓRICO)
                (SEM BASE DE CONHECIMENTO)
                (SEM CONTEXTO)
```

**Arquitetura Necessária (TradeVision Original):**
```
Você → Frontend → Edge Function → [ 1. HISTÓRICO DATABASE ]
                                   [ 2. BASE CONHECIMENTO ]
                                   [ 3. ESTADO AEC        ]
                                        ↓
                                     OpenAI → Resposta
```

---

## 📊 COMPARATIVO: O QUE FALTA

| Funcionalidade | TradeVision Original (18k lines) | Med-Cann Lab Atual | Status |
|:---------------|:--------------------------------:|:------------------:|:------:|
| **Histórico de Mensagens** | ✅ Carrega últimas 20 msgs | ❌ Nenhuma | 🔴 CRÍTICO |
| **Base de Conhecimento (RAG)** | ✅ Busca em `documents` | ❌ Não implementado | 🔴 ALTA |
| **Persistência Estado AEC** | ✅ Salva no banco | ⚠️ Só `localStorage` | 🟡 MÉDIA |
| **Context Window Inteligente** | ✅ 4096 tokens managed | ❌ Envia só msg atual | 🔴 CRÍTICO |

---

## ✅ SOLUÇÃO COMPLETA (3 MÓDULOS)

### **MÓDULO 1: SISTEMA DE MEMÓRIA** 🔴 URGENTE
**O que é:** Carregar últimas mensagens da conversa do banco de dados  
**Onde salvar:** Tabela `ai_chat_interactions` (já existe! ✅)  
**Implementação:**
```typescript
// 1. Buscar últimas 10 mensagens do usuário
const { data: history } = await supabase
  .from('ai_chat_interactions')
  .select('user_message, ai_response')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10)

// 2. Formatar para OpenAI
const messages = history.reverse().flatMap(h => [
  { role: 'user', content: h.user_message },
  { role: 'assistant', content: h.ai_response }
])

// 3. Enviar para Edge Function
payload.conversationHistory = messages
```

**Impacto:** Nôa vai LEMBRAR que você já disse "Pedro" e não vai pedir de novo!

---

### **MÓDULO 2: BASE DE CONHECIMENTO (RAG)** 🟡 IMPORTANTE
**O que é:** Buscar documentos relevantes antes de responder  
**Onde buscar:** Tabela `documents` (protocolos, guidelines)  
**Implementação:**
```typescript
// 1. Detectar palavras-chave na mensagem
const keywords = extractKeywords(userMessage) // ex: ["avaliação", "clínica"]

// 2. Buscar documentos relacionados
const { data: docs } = await supabase
  .from('documents')
  .select('title, content')
  .or(keywords.map(k => `keywords.cs.{${k}}`).join(','))
  .limit(3)

// 3. Adicionar ao contexto da IA
payload.knowledgeBase = docs.map(d => d.content).join('\n\n')
```

**Impacto:** Respostas baseadas no protocolo AEC oficial do Dr. Ricardo!

---

### **MÓDULO 3: CORREÇÃO ESTADO AEC** 🟢 POLIMENTO
**O que é:** O fluxo está sendo iniciado mas o estado não persiste  
**Problema:** `processAssessment` não está sendo chamado  
**Solução:**
```typescript
// Mudar lógica de detecção (linha 154)
const platformIntent = this.platformFunctions.detectIntent(userMessage, this.platformData)

// ANTES:
if (userMessage.includes('avaliação')) { ... }

// DEPOIS:
if (platformIntent === 'ASSESSMENT_START') {
  await this.processAssessment(...)  // Inicia AEC
  clinicalAssessmentFlow.startAssessment(userId)  // Cria estado
}
```

**Impacto:** `assessmentPhase` vai mudar de `"none"` para `"INITIAL_GREETING"` → `"QUEIXA_PRINCIPAL"` → ...

---

## 🚀 PLANO DE IMPLEMENTAÇÃO (ORDEM DE PRIORIDADE)

### **FASE 1: QUICK WIN (30min)**
Implementar APENAS Módulo 1 (Memória/Histórico).  
**Resultado:** Loop resolvido IMEDIATAMENTE.

### **FASE 2: QUALIDADE (2h)**
Implementar Módulo 2 (Base Conhecimento).  
**Resultado:** Respostas profissionais e precisas.

### **FASE 3: PERFEIÇÃO (1h)**
Implementar Módulo 3 (Correção AEC).  
**Resultado:** Protocolo 10 fases funcionando 100%.

---

## 📋 DECISÃO NECESSÁRIA

**Opção A (RECOMENDADA):** Implementar FASE 1 AGORA (30min) → Testa → Se funcionar, continua FASE 2  
**Opção B:** Implementar TUDO (3h30min) de uma vez  
**Opção C:** Manter como está e ajustar apenas os prompts (não resolve o problema raiz)

---

## 🎯 PRÓXIMA AÇÃO IMEDIATA

**SE APROVAR FASE 1:**
1. Adicionar busca de histórico em `processTradeVisionRequest` (5 linhas)
2. Modificar Edge Function para receber histórico (10 linhas)
3. Fazer deploy (`DEPLOY_NOA.bat`)
4. Testar novamente

**Tempo Total:** ~30 minutos  
**Taxa de Sucesso Estimada:** 95%

---

**Aguardando sua decisão para prosseguir.**
