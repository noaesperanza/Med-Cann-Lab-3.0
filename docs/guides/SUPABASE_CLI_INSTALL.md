# 🔧 Supabase CLI - Instalação e Uso no Windows

## 📥 Método 1: Download Direto (Recomendado)

### Passo 1: Baixar o executável

Acesse: https://github.com/supabase/cli/releases/latest

Baixe o arquivo para Windows:
- **`supabase_windows_amd64.zip`** (para Windows 64-bit)

### Passo 2: Extrair e adicionar ao PATH

```powershell
# Criar diretório para o Supabase CLI
New-Item -Path "C:\Program Files\Supabase" -ItemType Directory -Force

# Mover o executável extraído para lá
Move-Item supabase.exe "C:\Program Files\Supabase\supabase.exe"

# Adicionar ao PATH (PowerShell como Admin)
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\Program Files\Supabase",
    "Machine"
)
```

### Passo 3: Verificar instalação

```powershell
# Reinicie o PowerShell e execute:
supabase --version
```

---

## 📥 Método 2: Via Scoop (se disponível)

```powershell
# Instalar scoop primeiro (se não tiver)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Adicionar bucket do Supabase
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# Instalar Supabase CLI
scoop install supabase
```

---

## 📥 Método 3: Via NPX (Sem instalação global)

Você pode usar o Supabase CLI via **npx** sem instalar globalmente:

```powershell
npx supabase --version
npx supabase login
npx supabase link --project-ref itdjkfubfzmvmuxxjoae
```

---

## 🔐 Conectar ao Projeto via CLI

### 1. Login no Supabase

```powershell
supabase login
```

Isso abrirá o navegador para você fazer login na sua conta Supabase.

### 2. Link ao Projeto Existente

```powershell
# Usar o project reference ID do seu projeto
supabase link --project-ref itdjkfubfzmvmuxxjoae
```

Quando solicitado, insira a **senha do banco de dados** do seu projeto.

### 3. Verificar Status

```powershell
supabase status
```

---

## 🗄️ Comandos Úteis do CLI

### Migração de Banco de Dados

```powershell
# Criar nova migração
supabase migration new nome_da_migracao

# Aplicar migrações
supabase db push

# Reverter migração
supabase db reset
```

### Funções Edge

```powershell
# Criar nova função
supabase functions new minha-funcao

# Deploy de função
supabase functions deploy minha-funcao

# Logs de função
supabase functions logs minha-funcao
```

### Banco de Dados Local

```powershell
# Iniciar Supabase local
supabase start

# Parar Supabase local
supabase stop

# Status do ambiente local
supabase status
```

### Secrets e Configurações

```powershell
# Listar secrets
supabase secrets list

# Adicionar secret
supabase secrets set MINHA_CHAVE=valor
```

---

## 🔄 Alternativa: Usar Console Web

Se a instalação do CLI estiver com problemas, você pode fazer tudo via **Console Web do Supabase**:

🔗 https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae

### Funcionalidades Disponíveis:
- ✅ SQL Editor
- ✅ Table Editor
- ✅ Authentication
- ✅ Storage
- ✅ Edge Functions
- ✅ Database Migrations

---

## 📊 Conectar via SQL Direto

Você também pode conectar direto ao banco de dados PostgreSQL:

```powershell
# Usando psql (se tiver instalado)
psql "postgresql://postgres.[PROJECT-REF]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Credenciais**:
- Host: `aws-0-us-east-1.pooler.supabase.com`
- Database: `postgres`
- Port: `5432`
- User: `postgres.[itdjkfubfzmvmuxxjoae]`
- Password: (senha do projeto)

---

## ✅ Solução Rápida: NPX

**Se você só quer testar agora**, use NPX sem instalar nada:

```powershell
# Verificar versão
npx supabase --version

# Login
npx supabase login

# Link ao projeto
npx supabase link --project-ref itdjkfubfzmvmuxxjoae

# Executar SQL
npx supabase db diff
```

---

## 🎯 Recomendação

Para o MedCannLab 3.0, recomendo:

1. **Use NPX** para comandos rápidos (sem instalação)
2. **Use Console Web** para gerenciamento visual
3. **Use SDK JavaScript** (já configurado) para operações da aplicação

O CLI é útil principalmente para:
- 🔄 Migrações de banco de dados
- 🚀 Deploy de Edge Functions
- 🧪 Testes locais

Para desenvolvimento frontend/backend normal, o **SDK do Supabase** (já configurado em `src/lib/supabase.ts`) é suficiente!

---

**📌 Status Atual**: ✅ SDK configurado e pronto para uso. CLI é opcional para tarefas avançadas.
