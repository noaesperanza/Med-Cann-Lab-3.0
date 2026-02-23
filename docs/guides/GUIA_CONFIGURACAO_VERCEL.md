# 🔧 CONFIGURAÇÃO VERCEL - VARIÁVEIS DE AMBIENTE

## ❌ Problema Identificado
O Vercel está mostrando "indisponível" porque as configurações do Supabase não estão sendo carregadas corretamente no ambiente de produção.

## ✅ Solução: Configurar Variáveis de Ambiente no Vercel

### 1. Acessar o Dashboard do Vercel
- Ir para [vercel.com/dashboard](https://vercel.com/dashboard)
- Selecionar o projeto `medcanlab1.0`

### 2. Configurar Variáveis de Ambiente
- Ir em **Settings** → **Environment Variables**
- Adicionar as seguintes variáveis:

```
VITE_SUPABASE_URL = https://itdjkfubfzmvmuxxjoae.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjUyOTAsImV4cCI6MjA3Njc0MTI5MH0.j9Kfff56O2cWs5ocInVHaUFcaNTS7lrUNwsKBh2KIFM
```

### 3. Configurar para Todos os Ambientes
- ✅ **Production** (Produção)
- ✅ **Preview** (Preview)
- ✅ **Development** (Desenvolvimento)

### 4. Redeploy
- Após configurar as variáveis, fazer um novo deploy
- Ou usar o botão **Redeploy** no dashboard

## 🎯 Resultado Esperado
Após configurar as variáveis de ambiente, o sistema deve:
- ✅ Carregar corretamente no Vercel
- ✅ Conectar com o Supabase
- ✅ Mostrar a landing page com a imagem brain.png
- ✅ Permitir login e redirecionamento

## 📋 Checklist
- [ ] Variáveis configuradas no Vercel
- [ ] Deploy realizado
- [ ] Sistema funcionando no Vercel
- [ ] Login funcionando
- [ ] Imagem brain.png carregando

---
**🎉 Após essas configurações, o MedCannLab 3.0 estará 100% funcional no Vercel!**
