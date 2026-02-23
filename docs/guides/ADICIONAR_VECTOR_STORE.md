# 🔗 ADICIONAR VECTOR STORE AO ASSISTANT

## 📋 **VECTOR STORE IDENTIFICADA**

```
vs_9E2EHezIrrXTL9MHT2LJ8m41
```

Esta é sua Vector Store com todo o conhecimento da Nôa Esperança.

---

## 🎯 **COMO ADICIONAR AO ASSISTANT**

### **Opção 1: Via GPT Editor (Mais Fácil)**

1. **Acesse**: https://chat.openai.com/gpts
2. **Abra "Nôa Núcleo"** → Edit
3. **Configure** → Knowledge
4. **Em "Add vector store"**, cole: `vs_9E2EHezIrrXTL9MHT2LJ8m41`
5. **Save**

---

### **Opção 2: Via Código (Mais Preciso)**

Atualize o Assistant via API:

```bash
curl https://api.openai.com/v1/assistants/asst_fN2Fk9fQ7JEyyFUIe50Fo9QD \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -H "OpenAI-Beta: assistants=v2" \
  -X PATCH \
  -d '{
    "tool_resources": {
      "file_search": {
        "vector_store_ids": ["vs_9E2EHezIrrXTL9MHT2LJ8m41"]
      }
    }
  }'
```

---

## 🚀 **O QUE ISSO FAZ?**

Após adicionar, o Assistant terá acesso a:
- ✅ Todo conteúdo da sua Vector Store
- ✅ Conhecimento sobre IMRE
- ✅ Dissertação (se estiver na store)
- ✅ Biblioteca médica
- ✅ Metodologias clínicas

---

## ✅ **PRÓXIMO PASSO**

Adicione a Vector Store ao "Nôa Núcleo" via GPT Editor e teste novamente!

**Versão:** 1.0.0  
**Data:** Janeiro 2025
