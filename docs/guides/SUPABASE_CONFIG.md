# 🔐 Configuração do Supabase - MedCannLab 3.0

## ✅ Credenciais Atualizadas - 15/12/2025

### URL do Projeto
```
https://itdjkfubfzmvmuxxjoae.supabase.co
```

### Chave Anon (Pública - Frontend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjUyOTAsImV4cCI6MjA3Njc0MTI5MH0.j9Kfff56O2cWs5ocInVHaUFcaNTS7lrUNwsKBh2KIFM
```

### Chave Service Role (Privada - ⚠️ NUNCA EXPONHA NO FRONTEND)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE2NTI5MCwiZXhwIjoyMDc2NzQxMjkwfQ.ah3Qfel7dN2x6Iyd1tY9evQaMR0OX8LpRZJXPvzr1fg
```

---

## 📝 Como Configurar

### 1. Criar arquivo `.env` na raiz do projeto

```bash
# Copie o arquivo .env.example para .env
cp .env.example .env
```

### 2. Verificar que o arquivo `.env` contém:

```env
VITE_SUPABASE_URL=https://itdjkfubfzmvmuxxjoae.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjUyOTAsImV4cCI6MjA3Njc0MTI5MH0.j9Kfff56O2cWs5ocInVHaUFcaNTS7lrUNwsKBh2KIFM
```

### 3. Reiniciar o servidor de desenvolvimento

```bash
npm run dev
```

---

## 🚀 Deploy (Vercel/Netlify)

### Vercel
1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - `VITE_SUPABASE_URL` = `https://itdjkfubfzmvmuxxjoae.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<chave anon acima>`

### Netlify
1. Vá em **Site settings** → **Build & deploy** → **Environment**
2. Adicione as mesmas variáveis

---

## ⚠️ IMPORTANTE - Segurança

- ✅ **Chave Anon**: Pode ser usada no frontend (já está configurada)
- ❌ **Chave Service Role**: NUNCA use no frontend!
  - Use apenas em scripts backend/administrativos
  - Tem permissões totais no banco de dados
  - Bypass de Row Level Security (RLS)

---

## 🧪 Testar Conexão

Execute no console do navegador após fazer login:

```javascript
import { supabase } from './src/lib/supabase'

// Testar conexão
const { data, error } = await supabase.from('users').select('count')
if (error) {
  console.error('❌ Erro de conexão:', error)
} else {
  console.log('✅ Conectado ao Supabase!', data)
}
```

---

## 📊 Status

- **Projeto**: itdjkfubfzmvmuxxjoae
- **Região**: us-east-1
- **Plan**: Free (pode ser upgradeado)
- **Status**: ✅ Ativo e configurado
- **Última atualização**: 15/12/2025

---

**🔗 Conexão configurada e pronta para uso!**
