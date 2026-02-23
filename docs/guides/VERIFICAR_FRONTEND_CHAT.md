# 🔍 VERIFICAR FRONTEND CHAT

## 📋 **CHECKLIST DE DEBUG**

### **1. CONSOLE DO NAVEGADOR (F12)**
- [ ] Abrir Developer Tools (F12)
- [ ] Ir na aba Console
- [ ] Tentar enviar mensagem
- [ ] Verificar erros em vermelho
- [ ] Anotar mensagens de erro

### **2. ABA NETWORK (F12)**
- [ ] Ir na aba Network
- [ ] Tentar enviar mensagem
- [ ] Verificar se aparece requisição para Supabase
- [ ] Verificar status da requisição (200, 403, 401, etc.)

### **3. VERIFICAR AUTENTICAÇÃO**
- [ ] Nome do usuário aparece no canto superior?
- [ ] Tipo de usuário está correto (admin/professional)?
- [ ] Usuário está realmente logado?

### **4. VERIFICAR CAMPOS**
- [ ] Campo de mensagem está preenchido?
- [ ] Canal selecionado está correto?
- [ ] Botão de enviar está clicável?

## 🚨 **ERROS COMUNS E SOLUÇÕES**

### **Erro 403 - Forbidden**
```
Solução: Executar CORRIGIR_RLS_CHAT.sql
```

### **Erro 401 - Unauthorized**
```
Solução: Fazer logout e login novamente
```

### **Erro de Rede**
```
Solução: Verificar conexão com Supabase
```

### **Sem Erro Visível**
```
Solução: Verificar se mensagem está sendo enviada
```

## 🧪 **TESTE MANUAL**

1. **Digite uma mensagem simples**: "teste"
2. **Pressione Enter** ou clique em enviar
3. **Observe o console** para erros
4. **Verifique a aba Network** para requisições
5. **Aguarde alguns segundos** para ver se aparece

## 📊 **INFORMAÇÕES PARA COLETAR**

- **Erro no console**: [Cole aqui]
- **Status da requisição**: [200/403/401/etc]
- **Usuário logado**: [Nome e tipo]
- **Canal selecionado**: [general/cannabis/etc]
- **Mensagem digitada**: [Texto da mensagem]
