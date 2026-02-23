# 💬 GUIA - CONFIGURAR CHAT GLOBAL

## 🎯 **OBJETIVO**
Configurar o Chat Global para que profissionais e admins possam se comunicar em tempo real.

---

## 📋 **PASSOS PARA CONFIGURAÇÃO**

### **PASSO 1: EXECUTAR SCRIPT SQL (5 MIN)**
```sql
-- No Supabase SQL Editor:
-- 1. Abrir Supabase Dashboard
-- 2. Ir para SQL Editor
-- 3. Executar o script CONFIGURAR_CHAT_GLOBAL.sql
-- 4. Aguardar conclusão
```

### **PASSO 2: TESTAR CONFIGURAÇÃO (2 MIN)**
```sql
-- No Supabase SQL Editor:
-- 1. Executar o script TESTAR_CHAT_GLOBAL.sql
-- 2. Verificar se todas as verificações passaram
-- 3. Confirmar que as mensagens de teste foram inseridas
```

### **PASSO 3: TESTAR NO FRONTEND (3 MIN)**
1. **Acessar**: `http://localhost:3000/app/chat`
2. **Fazer login** como admin ou profissional
3. **Verificar** se as mensagens de teste aparecem
4. **Testar envio** de nova mensagem
5. **Verificar tempo real** - abrir em duas abas diferentes

---

## 🚀 **FUNCIONALIDADES DO CHAT GLOBAL**

### **✅ CANAIS DISPONÍVEIS**
- **Geral** - Discussões gerais sobre medicina
- **Cannabis Medicinal** - Especialistas em cannabis
- **Casos Clínicos** - Discussão de casos complexos
- **Pesquisa** - Pesquisas e estudos recentes
- **Suporte** - Suporte técnico e ajuda

### **✅ RECURSOS IMPLEMENTADOS**
- **Tempo Real** - Mensagens aparecem instantaneamente
- **Reações** - ❤️ 👍 💬
- **Mensagens Fixadas** - Para admins
- **Moderação** - Painel de moderação para admins
- **Usuários Online** - Lista de usuários ativos
- **Histórico** - Mensagens das últimas 24 horas

### **✅ FUNCIONALIDADES ADMIN**
- **Deletar mensagens** - Remover conteúdo inadequado
- **Fixar mensagens** - Destacar mensagens importantes
- **Silenciar usuários** - Moderar comportamento
- **Painel de moderação** - Controle total do chat

---

## 🧪 **DADOS DE TESTE INCLUÍDOS**

### **👥 USUÁRIOS DE TESTE**
- **Dr. João Silva** (Neurologia) - CRM789012
- **Dra. Maria Santos** (Psiquiatria) - CRM345678
- **Dr. Pedro Costa** (Clínica Geral) - CRM901234
- **Dr. Admin MedCannLab** (Administrador) - CRM123456

### **💬 MENSAGENS DE TESTE**
- **12 mensagens** em 5 canais diferentes
- **Discussões médicas** realistas
- **Reações e interações** simuladas
- **Mensagens fixadas** para demonstração

---

## 🔧 **CONFIGURAÇÕES TÉCNICAS**

### **BANCO DE DADOS**
- ✅ Tabela `chat_messages` criada
- ✅ RLS habilitado com políticas seguras
- ✅ Índices para performance
- ✅ Tempo real ativado

### **FRONTEND**
- ✅ Componente `ChatGlobal.tsx` funcional
- ✅ Tempo real com Supabase
- ✅ Interface responsiva
- ✅ Moderação para admins

### **SEGURANÇA**
- ✅ Apenas usuários autenticados podem enviar
- ✅ Todos podem ver mensagens
- ✅ Usuários podem deletar suas próprias mensagens
- ✅ Admins têm controle total

---

## 🎯 **RESULTADO ESPERADO**

### **APÓS CONFIGURAÇÃO:**
1. **Acessar `/app/chat`** → Ver mensagens de teste
2. **Enviar mensagem** → Aparece instantaneamente
3. **Abrir duas abas** → Mensagens sincronizadas
4. **Login como admin** → Ver painel de moderação
5. **Navegar entre canais** → Mensagens específicas de cada canal

### **FUNCIONALIDADES ATIVAS:**
- ✅ **Chat em tempo real**
- ✅ **Múltiplos canais**
- ✅ **Sistema de reações**
- ✅ **Moderação admin**
- ✅ **Usuários online**
- ✅ **Histórico de mensagens**

---

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Se não aparecer mensagens:**
1. Verificar se o script SQL foi executado
2. Verificar se o usuário está logado
3. Verificar console do navegador para erros
4. Verificar conexão com Supabase

### **Se tempo real não funcionar:**
1. Verificar se `supabase_realtime` está ativo
2. Verificar políticas RLS
3. Verificar se a tabela está na publicação

### **Se não conseguir enviar mensagem:**
1. Verificar se o usuário está autenticado
2. Verificar políticas RLS para INSERT
3. Verificar se o campo `message` não está vazio

---

## 🏆 **CONCLUSÃO**

**O Chat Global está configurado e pronto para uso!**

- ✅ **Profissionais** podem se comunicar em tempo real
- ✅ **Admins** têm controle total de moderação
- ✅ **Múltiplos canais** para diferentes discussões
- ✅ **Sistema robusto** com segurança e performance

**Próximo passo**: Testar o chat e começar a usar! 🚀
