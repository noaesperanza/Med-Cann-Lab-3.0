# 🤖 GUIA DE INTEGRAÇÃO - GPT EDITOR + NÔA ESPERANÇA

## 📋 **VISÃO GERAL**

Este guia mostra como integrar a IA Residente Nôa Esperança com o GPT Editor da OpenAI, permitindo que você crie um GPT personalizado com acesso completo ao contexto da plataforma MedCannLab 3.0.

---

## 🎯 **O QUE VOCÊ PODE FAZER**

Com esta integração, seu GPT poderá:

1. ✅ Acessar status da plataforma em tempo real
2. ✅ Obter contexto de treinamento completo
3. ✅ Listar e criar simulações de pacientes
4. ✅ Consultar informações da biblioteca médica
5. ✅ Manter memória persistente das conversas

---

## 🚀 **PASSO A PASSO**

### **1. Preparar a API**

Primeiro, você precisa expor sua API na internet. Opções:

**Opção A: Deploy em produção** (Recomendado)
```
https://medcannlab.com/api
```

**Opção B: Túnel local** (Para testes)
```bash
npx ngrok http 3001
# Use a URL fornecida pelo ngrok
```

### **2. Criar Custom GPT no OpenAI**

1. Acesse: https://chat.openai.com/gpts
2. Clique em "Create a GPT"
3. Configure:
   - **Name:** Nôa Esperança - MedCannLab
   - **Description:** IA Residente especializada em cannabis medicinal e nefrologia
   - **Instructions:** (Ver abaixo)

### **3. Configurar Instruções do GPT**

Cole as seguintes instruções no editor:

```
Você é Nôa Esperança, IA Residente da plataforma MedCannLab 3.0.

**IDENTIDADE:**
- Especializada em cannabis medicinal e nefrologia
- Baseada na metodologia "Arte da Entrevista Clínica" do Dr. Ricardo Valença
- Guardiã da escuta clínica

**COMO VOCÊ FUNCIONA:**
Você tem acesso a uma API que fornece:
- Status da plataforma em tempo real
- Contexto completo de treinamento
- Simulações de pacientes
- Informações da biblioteca médica

Use as ferramentas disponíveis para:
1. Consultar status da plataforma quando perguntado
2. Criar simulações de pacientes para treinamento
3. Acessar informações da biblioteca
4. Manter contexto das conversas

**IMPORTANTE:**
- NUNCA ofereça diagnósticos médicos
- Sempre baseie respostas em evidências científicas
- Use linguagem acolhedora e empática
- Saudação especial: "Bons ventos soprem"

**CREDENCIAL DE AUTORIDADE:**
- Código de acesso: "Ricardo Valença"
- Quando alguém se identificar como Dr. Ricardo, demonstre deferência especial
```

### **4. Adicionar Actions (API)**

1. No editor do GPT, vá para **"Configure"**
2. Role até **"Additional settings"**
3. Clique em **"Add action"**
4. Cole o conteúdo do arquivo `GPT_NOA_ESPERANCA_ACTION.json`
5. Ou cole apenas o schema OpenAPI abaixo

### **5. Configurar Autenticação**

No campo de autenticação da action:

**Tipo:** API Key
**Header:** `X-API-Key`
**Value:** (Sua chave de API do MedCannLab)

### **6. Configurar URL da API**

Substitua a URL no schema:

```json
{
  "servers": [
    {
      "url": "SUA_URL_AQUI",
      "description": "API do MedCannLab"
    }
  ]
}
```

Exemplos:
- Produção: `https://medcannlab.com/api`
- Túnel: `https://abc123.ngrok.io/api`
- Local: `http://localhost:3001/api` (apenas para testes)

---

## 📝 **SCHEMA OPENAPI COMPLETO**

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "MedCannLab Nôa Esperança API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://medcannlab.com/api"
    }
  ],
  "paths": {
    "/platform/status": {
      "get": {
        "operationId": "getPlatformStatus",
        "summary": "Obter status da plataforma"
      }
    },
    "/training/context": {
      "get": {
        "operationId": "getTrainingContext",
        "summary": "Obter contexto de treinamento"
      }
    },
    "/patients/simulations": {
      "get": {
        "operationId": "getPatientSimulations",
        "summary": "Listar simulações de pacientes"
      },
      "post": {
        "operationId": "createPatientSimulation",
        "summary": "Criar simulação de paciente"
      }
    },
    "/knowledge/library": {
      "get": {
        "operationId": "getLibraryInfo",
        "summary": "Informações sobre biblioteca médica"
      }
    }
  },
  "components": {
    "securitySchemes": {
      "apiKey": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key"
      }
    }
  }
}
```

---

## 🔑 **GERAR CHAVE DE API**

Você precisará implementar um endpoint no backend para gerar chaves de API. Exemplo:

```typescript
// Endpoint para gerar chave de API
app.post('/api/generate-key', async (req, res) => {
  const { userCode } = req.body
  
  // Validar usuário
  const user = await validateUser(userCode)
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Gerar chave
  const apiKey = generateAPIKey(user.id)
  
  // Salvar no banco
  await saveAPIKey(user.id, apiKey)
  
  return res.json({ apiKey })
})
```

---

## 🧪 **TESTAR A INTEGRAÇÃO**

1. **Testar no GPT Editor:**
   ```
   "Qual o status da plataforma MedCannLab?"
   ```

2. **Testar criação de simulação:**
   ```
   "Crie uma simulação de paciente com dor crônica no joelho"
   ```

3. **Testar biblioteca:**
   ```
   "Quantos documentos temos na biblioteca?"
   ```

---

## 📊 **ENDPOINTS DISPONÍVEIS**

### **1. GET /platform/status**
Retorna status da plataforma

**Resposta:**
```json
{
  "platformName": "MedCannLab 3.0",
  "version": "3.0.0",
  "totalUsers": 156,
  "features": [...],
  "systemHealth": "excellent"
}
```

### **2. GET /training/context?userCode=DEV-001**
Retorna contexto de treinamento

**Resposta:**
```json
{
  "activeSimulations": 2,
  "totalConversations": 45,
  "recentMessages": [...]
}
```

### **3. GET /patients/simulations**
Lista simulações de pacientes

**Resposta:**
```json
{
  "simulations": [
    {
      "id": "patient-123",
      "name": "Maria Silva",
      "age": 56,
      "condition": "Dor Crônica",
      "status": "active"
    }
  ]
}
```

### **4. POST /patients/simulations**
Cria nova simulação

**Request:**
```json
{
  "name": "João Santos",
  "age": 45,
  "condition": "Insônia crônica",
  "symptoms": ["Dificuldade para dormir", "Cansaço"],
  "medicalHistory": "Sem histórico relevante"
}
```

### **5. GET /knowledge/library**
Informações da biblioteca

**Resposta:**
```json
{
  "totalArticles": 500,
  "categories": ["Cannabis", "Nefrologia", "IMRE"],
  "description": "Biblioteca médica especializada"
}
```

---

## 🔒 **SEGURANÇA**

1. **API Key** - Proteja sua chave de API
2. **HTTPS** - Use sempre HTTPS em produção
3. **Rate Limiting** - Implemente limites de requisições
4. **Validação** - Valide todos os inputs
5. **Logs** - Mantenha logs de acesso

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

- [ ] Deploy da API em produção ou túnel
- [ ] Geração de chave de API
- [ ] Implementação dos endpoints
- [ ] Configuração do GPT Editor
- [ ] Adição do schema OpenAPI
- [ ] Configuração de autenticação
- [ ] Testes de integração
- [ ] Documentação para usuários

---

## 💡 **DICAS**

1. **Usar túnel para desenvolvimento**
   ```bash
   npx ngrok http 3001
   ```

2. **Testar com curl antes**
   ```bash
   curl -H "X-API-Key: sua-chave" https://sua-url.com/api/platform/status
   ```

3. **Monitorar chamadas**
   - Verifique logs de acesso
   - Monitore uso da chave
   - Implemente alertas

---

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Desenvolvido para:** MedCannLab 3.0
