# 🚀 TESTE NO LOCALHOST - GUIA RÁPIDO

## ✅ Sim, você pode testar agora!

### Passo 1: Verificar Dependências

```bash
# No terminal, na pasta do projeto:
npm install
```

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se não existir):

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon

# OpenAI (Opcional - se não tiver, a IA funcionará em modo local)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_ASSISTANT_ID=asst-...
```

**Nota**: Se você não tiver essas variáveis ainda, o sistema ainda pode rodar, mas algumas funcionalidades (como IA Residente completa) podem não funcionar.

### Passo 3: Iniciar o Servidor

```bash
npm run dev
```

O servidor iniciará em: **http://localhost:3000**

### Passo 4: Testar no Navegador

1. Abra o navegador
2. Acesse: `http://localhost:3000`
3. Você verá a landing page
4. Teste login ou registro

## 🔍 O Que Você Pode Testar Agora

### ✅ Funcionalidades que Funcionam Sem Configuração Adicional:
- ✅ Landing Page
- ✅ Navegação
- ✅ Componentes visuais
- ✅ Rotas e redirecionamentos
- ✅ Design system

### ⚠️ Funcionalidades que Precisam de Configuração:
- ⚠️ Login/Registro (precisa Supabase)
- ⚠️ Dashboards com dados (precisa Supabase)
- ⚠️ IA Residente completa (precisa OpenAI API)
- ⚠️ Chat Global (precisa Supabase)

## 🎯 Teste Rápido - Visual

Mesmo sem Supabase configurado, você pode:
1. Ver a landing page
2. Ver os cards de perfil
3. Navegar pela interface
4. Ver o design aplicado
5. Testar responsividade

## 🔧 Se Precisar Configurar Supabase

1. **Criar projeto no Supabase** (se ainda não tiver)
2. **Executar o script SQL**: `SUPABASE_MVP_FINAL.sql`
3. **Obter URL e Key**: Dashboard > Settings > API
4. **Adicionar ao .env**

## 📝 Checklist Rápido

- [ ] `npm install` executado
- [ ] Arquivo `.env` criado (ou pelo menos vazio)
- [ ] `npm run dev` executado
- [ ] Navegador aberto em `localhost:3000`
- [ ] Landing page carregou?

## 🐛 Problemas Comuns

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port 3000 already in use"
```bash
# Alterar porta no vite.config.ts ou matar processo na porta 3000
```

### Página em branco
- Verificar console do navegador (F12)
- Verificar se há erros de compilação no terminal
- Verificar se todas as dependências foram instaladas

## 🎉 Pronto!

Se tudo estiver ok, você verá a landing page funcionando no localhost!

**Acesse**: http://localhost:3000

