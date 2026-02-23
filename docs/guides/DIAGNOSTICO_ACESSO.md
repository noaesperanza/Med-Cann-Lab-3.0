# 🔍 DIAGNÓSTICO: Acesso via IP

## ⚠️ IMPORTANTE: A rota `/app/` requer autenticação!

A rota `/app/` está protegida e **redireciona automaticamente** para `/` (página inicial) se você não estiver logado.

## ✅ SOLUÇÃO CORRETA

### **1. Acesse primeiro a página inicial:**
```
http://192.168.12.101:3000/
```

### **2. Ou a página de login:**
```
http://192.168.12.101:3000/login
```

### **3. Depois de fazer login, você será redirecionado para `/app/`**

---

## 🔧 VERIFICAÇÕES TÉCNICAS

### **1. Servidor está rodando?**
```bash
# No terminal, execute:
cd "C:\Users\Ricardo_Valenca\Desktop\Noa Nova\medcannlab5-main"
npm run dev
```

**Você deve ver:**
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network:  http://192.168.12.101:3000/
```

### **2. Testar acesso local primeiro:**
- Acesse `http://localhost:3000/` no mesmo computador
- Se funcionar localmente, o problema é de rede/firewall

### **3. Verificar IP correto:**
```powershell
# No PowerShell:
ipconfig
```
Procure por "IPv4 Address" - deve ser `192.168.12.101`

### **4. Verificar Firewall:**
```powershell
# Permitir porta 3000 (execute como Administrador):
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### **5. Verificar se porta está em uso:**
```powershell
# Ver processos na porta 3000:
Get-NetTCPConnection -LocalPort 3000
```

---

## 🎯 FLUXO CORRETO DE ACESSO

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse a página inicial:**
   ```
   http://192.168.12.101:3000/
   ```

3. **Faça login** (se necessário)

4. **Será redirecionado automaticamente para `/app/`**

---

## 🐛 PROBLEMAS COMUNS

### **Problema 1: Página em branco**
**Solução:** Abra DevTools (F12) e verifique erros no Console

### **Problema 2: Erro de conexão**
**Solução:** 
- Verifique se o servidor está rodando
- Verifique firewall
- Verifique se o IP está correto

### **Problema 3: Redirecionamento infinito**
**Solução:** Limpe o cache e localStorage:
```javascript
// No console do navegador:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### **Problema 4: Porta 3000 ocupada**
**Solução:** Use outra porta:
```bash
npm run dev -- --port 3001
```
Depois acesse: `http://192.168.12.101:3001/`

---

## 📋 CHECKLIST RÁPIDO

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Vite mostra o IP de rede: `http://192.168.12.101:3000/`
- [ ] Testou `http://localhost:3000/` primeiro
- [ ] Firewall permite porta 3000
- [ ] IP está correto (`ipconfig`)
- [ ] Acessou `/` antes de `/app/`
- [ ] Fez login antes de acessar `/app/`

---

## 🚀 COMANDOS RÁPIDOS

**Iniciar servidor:**
```bash
npm run dev
```

**Verificar porta:**
```powershell
netstat -ano | findstr :3000
```

**Permitir firewall:**
```powershell
New-NetFirewallRule -DisplayName "Vite" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

**Se ainda não funcionar**, me envie:
1. Mensagem de erro exata do navegador
2. Logs do terminal quando inicia o servidor
3. Resultado de `ipconfig`

