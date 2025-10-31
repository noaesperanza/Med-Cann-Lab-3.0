# 🤖 SISTEMA HÍBRIDO NÔA ESPERANÇA

## 📋 **VISÃO GERAL**

Sistema híbrido que combina a **OpenAI Assistant API** com o **sistema local de treinamento** da Nôa Esperança, garantindo sempre uma resposta mesmo quando a API externa está indisponível.

---

## 🏗️ **ARQUITETURA**

### **Camadas do Sistema**

```
┌─────────────────────────────────────────┐
│      Frontend (NoaPlatformChat)         │
│  - Interface de chat flutuante          │
│  - Gerenciamento de mensagens           │
│  - Indicador de modo (Assistant/Local)  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   NoaAssistantIntegration (Híbrido)     │
│  ┌───────────────────────────────────┐  │
│  │ 1. Try Assistant API (GPT-4)      │  │
│  │ 2. Fallback → Sistema Local       │  │
│  └───────────────────────────────────┘  │
└────────────┬────────────────┬───────────┘
             │                │
             ▼                ▼
    ┌─────────────┐   ┌──────────────┐
    │ OpenAI API  │   │ Nôa Training │
    │  Assistant  │   │   System     │
    │   (Núcleo)  │   │   (Local)    │
    └─────────────┘   └──────────────┘
```

---

## 🔑 **CONFIGURAÇÃO DA API KEY**

### **Tipo de Chave Recomendada: Service Account**

Use **Service Account** para produção porque:

✅ **Servidor Backend**: Útil em funções serverless (Vercel Edge Functions)  
✅ **Sem Dependência de Usuário**: Não expira com sessões  
✅ **Segurança**: Permite revogação independente  
✅ **Escopo Controlado**: Acesso apenas às funções necessárias  
✅ **Ambiente de Produção**: Apropriado para produção  

### **Setup no Vercel**

1. **Criar Service Key**:
   - Acesse: https://platform.openai.com/api-keys
   - Clique em "Create new secret key"
   - Selecione: **"Service account"**
   - Nome: `medcannlab-production-service`

2. **Adicionar ao Vercel**:
   ```bash
   # Variável de ambiente no Vercel
   VITE_OPENAI_API_KEY=sk-...
   ```

3. **Verificar em Produção**:
   - A variável está disponível em `import.meta.env.VITE_OPENAI_API_KEY`
   - O sistema detecta automaticamente e usa o Assistant

---

## 🔄 **FLUXO DE EXECUÇÃO**

### **1. Tentativa com Assistant API**

```typescript
// src/lib/noaAssistantIntegration.ts
async sendMessage(message: string) {
  try {
    // 1. Criar thread (se não existir)
    if (!this.threadId) {
      this.threadId = await this.createThread()
    }

    // 2. Adicionar mensagem
    await this.addMessageToThread(message)

    // 3. Executar assistant
    const runId = await this.runAssistant()

    // 4. Aguardar conclusão
    await this.waitForRunCompletion(runId)

    // 5. Buscar resposta
    const response = await this.getLastMessage()
    
    return { content: response, from: 'assistant' }
  } catch (error) {
    // Fallback automático
    return this.useLocalFallback(message)
  }
}
```

### **2. Fallback para Sistema Local**

Quando a API não está disponível:

```typescript
private async useLocalFallback(message: string) {
  const trainingSystem = getNoaTrainingSystem()
  const response = trainingSystem.generateContextualResponse(message)
  
  return {
    content: response,
    from: 'local',
    metadata: { model: 'local' }
  }
}
```

---

## 🎯 **RECURSOS IMPLEMENTADOS**

### ✅ **Integração Híbrida**
- ✅ Tentativa automática com Assistant API
- ✅ Fallback inteligente para sistema local
- ✅ Detecção automática de disponibilidade
- ✅ Gerenciamento de threads para contexto

### ✅ **Interface do Chat**
- ✅ Indicador de modo (Assistant/Local) com ícone de cérebro
- ✅ Status de disponibilidade do Assistant
- ✅ Thread persistente entre mensagens
- ✅ Badges de código de usuário e rota atual

### ✅ **Sistema de Treinamento**
- ✅ Memória persistente de conversas
- ✅ Simulações de pacientes
- ✅ Contexto da plataforma
- ✅ Registro de identidade do usuário

---

## 🔧 **CONFIGURAÇÃO ATUAL**

### **Assistant ID**
```
asst_fN2Fk9fQ7JEyyFUIe50Fo9QD
```

### **Nome do Assistant no GPT Editor**
```
Nôa Núcleo
```

### **Instruções do Assistant**
- Especializada em cannabis medicinal e nefrologia
- Baseada na metodologia "Arte da Entrevista Clínica"
- Guardiã da escuta clínica
- Saudação: "Bons ventos soprem"

---

## 📊 **MONITORAMENTO**

### **Logs do Sistema**

O sistema registra automaticamente:

```typescript
// Verificar disponibilidade
const available = await assistantIntegration.checkAvailability()

// Obter status
const config = assistantIntegration.getConfig()
console.log({
  assistantId: config.assistantId,
  hasApiKey: !!config.apiKey,
  timeout: config.timeout
})
```

### **Modos de Operação**

| Modo | API Key | Assistant API | Sistema Local |
|------|---------|---------------|---------------|
| **Produção** | ✅ Service Key | ✅ Disponível | ✅ Fallback |
| **Desenvolvimento** | ❌ Não configurada | ❌ Indisponível | ✅ Ativo |
| **Erro de Rede** | ✅ Configurada | ⚠️ Timeout | ✅ Fallback |

---

## 🧪 **TESTANDO O SISTEMA**

### **1. Testar com Assistant API**

```typescript
// Forçar uso do Assistant
const response = await assistantIntegration.sendMessage(
  "Qual o status da plataforma?",
  "DEV-001",
  "/app/dashboard"
)

console.log(response.from) // "assistant"
```

### **2. Testar Fallback Local**

```typescript
// Desativar API Key temporariamente
// No arquivo .env.local, remova VITE_OPENAI_API_KEY

// Sistema usará fallback automaticamente
const response = await assistantIntegration.sendMessage(
  "Status da plataforma"
)

console.log(response.from) // "local"
```

---

## 🔒 **SEGURANÇA**

### **Gestão de API Keys**

1. **Nunca commite** a chave no código
2. **Use variáveis de ambiente** no Vercel
3. **Service Keys** podem ser revogadas independentemente
4. **Rate Limits** são gerenciados automaticamente

### **Proteção de Threads**

- Thread ID é mantido apenas em memória
- Não persiste entre recarregamentos
- Cada sessão do chat usa uma nova thread

---

## 🚀 **PRÓXIMOS PASSOS**

### **Melhorias Planejadas**

1. **Persistência de Threads**
   - Armazenar thread ID no Supabase
   - Recuperar contexto entre sessões
   - Manter histórico contínuo

2. **Tokens de Contexto**
   - Limitar tamanho da thread
   - Resumir mensagens antigas
   - Otimizar uso de tokens

3. **Métricas de Uso**
   - Tracking de chamadas
   - Análise de custos
   - Performance monitoring

4. **Actions Customizadas**
   - Integrar com Supabase
   - Ações específicas da plataforma
   - Tool calling do Assistant

---

## 📝 **CHECKLIST DE IMPLEMENTAÇÃO**

- [x] Criar `NoaAssistantIntegration` class
- [x] Implementar fluxo híbrido
- [x] Configurar fallback local
- [x] Integrar com chat component
- [x] Adicionar indicadores de modo
- [x] Documentar sistema
- [ ] Deploy com Service Key
- [ ] Testar em produção
- [ ] Monitorar uso e custos
- [ ] Implementar persistência de threads

---

## 💡 **DICAS**

### **Para Desenvolvimento**
```bash
# Use túnel ngrok para testar localmente
npx ngrok http 3001

# Configure em .env.local
VITE_OPENAI_API_KEY=sk-...
```

### **Para Produção**
```bash
# Configure no Vercel Dashboard
# Settings → Environment Variables
VITE_OPENAI_API_KEY=sk-... (Service Key)
```

---

## 📚 **REFERÊNCIAS**

- **Assistant API**: https://platform.openai.com/docs/assistants/overview
- **Service Keys**: https://platform.openai.com/api-keys
- **Threads**: https://platform.openai.com/docs/api-reference/threads

---

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Desenvolvido para:** MedCannLab 3.0  
**Assistant:** Nôa Núcleo (asst_fN2Fk9fQ7JEyyFUIe50Fo9QD)
