# 🔧 SOLUÇÃO: Acesso via IP (192.168.12.101:3000)

## 🎯 PROBLEMA
Não consegue acessar o app por `http://192.168.12.101:3000/app/`

## ✅ SOLUÇÕES

### **1. VERIFICAR SE O SERVIDOR ESTÁ RODANDO**

Execute no terminal:
```bash
cd "C:\Users\Ricardo_Valenca\Desktop\Noa Nova\medcannlab5-main"
npm run dev
```

Você deve ver algo como:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network:  http://192.168.12.101:3000/
```

### **2. VERIFICAR CONFIGURAÇÃO DO VITE**

O arquivo `vite.config.ts` já está configurado corretamente:
```typescript
server: {
  port: 3000,
  host: true, // ✅ Permite acesso pela rede
}
```

### **3. VERIFICAR FIREWALL**

**Windows Firewall:**
1. Abra "Windows Defender Firewall"
2. Clique em "Configurações Avançadas"
3. Verifique se a porta 3000 está permitida para entrada

**Ou permita temporariamente:**
```powershell
# Execute como Administrador no PowerShell:
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### **4. VERIFICAR IP CORRETO**

Verifique seu IP atual:
```powershell
# No PowerShell:
ipconfig
```

Procure por "IPv4 Address" na sua conexão ativa. Deve ser algo como `192.168.x.x`

### **5. TESTAR ACESSO**

**URLs para testar:**
- `http://192.168.12.101:3000/` - Página inicial (Landing)
- `http://192.168.12.101:3000/app/` - Dashboard (requer login)
- `http://192.168.12.101:3000/login` - Página de login

**⚠️ IMPORTANTE:** A rota `/app/` requer autenticação. Você precisa:
1. Acessar primeiro `http://192.168.12.101:3000/` ou `/login`
2. Fazer login
3. Depois será redirecionado para `/app/`

### **6. VERIFICAR ROTAS**

A rota `/app` está configurada corretamente no `App.tsx`:
```typescript
<Route path="/app" element={<Layout />}>
  <Route index element={<SmartDashboardRedirect />} />
  ...
</Route>
```

### **7. PROBLEMAS COMUNS**

#### **A. Servidor não inicia**
```bash
# Verificar se a porta 3000 está em uso:
netstat -ano | findstr :3000

# Se estiver em uso, matar o processo:
taskkill /PID <PID_NUMBER> /F
```

#### **B. Erro de conexão**
- Verifique se o IP está correto
- Verifique se o firewall permite a porta 3000
- Tente acessar de outro dispositivo na mesma rede

#### **C. Página em branco**
- Abra o DevTools (F12)
- Verifique erros no Console
- Verifique a aba Network para ver se os arquivos estão carregando

### **8. COMANDOS ÚTEIS**

**Iniciar servidor:**
```bash
npm run dev
```

**Iniciar em porta específica (se 3000 estiver ocupada):**
```bash
npm run dev -- --port 3001
```

**Verificar processos na porta 3000:**
```powershell
Get-NetTCPConnection -LocalPort 3000
```

## 🔍 DEBUGGING

### **Verificar se o servidor está acessível:**

1. **No mesmo computador:**
   - Acesse `http://localhost:3000/`
   - Se funcionar, o problema é de rede/firewall

2. **De outro dispositivo na mesma rede:**
   - Acesse `http://192.168.12.101:3000/`
   - Se não funcionar, problema de firewall/rede

3. **Verificar logs do Vite:**
   - Quando iniciar o servidor, ele mostra o IP de rede
   - Confirme se é `192.168.12.101`

## 📝 CHECKLIST

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Vite mostra o IP de rede correto
- [ ] Firewall permite porta 3000
- [ ] IP está correto (`ipconfig`)
- [ ] Testou `http://localhost:3000/` primeiro
- [ ] Tentou acessar de outro dispositivo
- [ ] Verificou erros no console do navegador

## 🚀 SOLUÇÃO RÁPIDA

1. **Pare o servidor** (Ctrl+C)
2. **Limpe o cache:**
   ```bash
   rm -rf node_modules/.vite
   ```
3. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```
4. **Acesse:** `http://192.168.12.101:3000/`

---

**Se ainda não funcionar**, me envie:
- Mensagem de erro exata
- Logs do terminal quando inicia o servidor
- Resultado de `ipconfig`

