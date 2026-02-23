# 📊 Como Ver os Resultados no Supabase SQL Editor

**Data:** 06/02/2026

---

## 🔍 O Problema

Quando você executa um script SQL no Supabase, às vezes você só vê a última mensagem:

```json
[
  {
    "status": "✅ Listagem completa de usuários concluída!"
  }
]
```

**Mas os dados estão lá!** Você só precisa saber onde procurar.

---

## ✅ SOLUÇÃO: Scripts Simplificados

Criei 2 scripts mais simples que retornam tudo em UMA query:

### 1. **Script Simples** (Recomendado para começar)
**Arquivo:** `database/scripts/LISTAR_USUARIOS_SIMPLES_06-02-2026.sql`

**O que retorna:**
- Tipo de usuário (👑 ADMIN, 👨‍⚕️ PROFISSIONAL, 👤 PACIENTE, 🎓 ALUNO)
- Email
- Nome
- Tipo original
- CRM, CRO, Telefone
- Data de cadastro

**Uma única tabela com todos os usuários!**

---

### 2. **Script com Estatísticas** (Mais completo)
**Arquivo:** `database/scripts/LISTAR_USUARIOS_COM_ESTATISTICAS_06-02-2026.sql`

**O que retorna:**
- Tudo do script simples
- **+ Estatísticas para pacientes:**
  - Total de assessments
  - Total de appointments
  - Total de chat rooms
- **+ Estatísticas para profissionais:**
  - Quantos pacientes têm (via assessments)
  - Quantos pacientes têm (via appointments)

---

## 🚀 COMO USAR

### Opção 1: Script Simples (Mais Fácil)

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra: `database/scripts/LISTAR_USUARIOS_SIMPLES_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. **Os resultados aparecerão em uma única tabela!**

**Resultado esperado:**
```
tipo_usuario | email | name | tipo_original | crm | cro | phone | data_cadastro
👑 ADMIN | phpg69@gmail.com | Pedro | admin | null | null | null | 2025-12-23
👨‍⚕️ PROFISSIONAL | iaianoaesperanza@gmail.com | Dr. Ricardo | profissional | CRM-123 | null | null | 2025-12-23
👤 PACIENTE | casualmusic2021@gmail.com | Pedro Paciente | paciente | null | null | null | 2025-12-23
```

---

### Opção 2: Script com Estatísticas (Mais Completo)

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra: `database/scripts/LISTAR_USUARIOS_COM_ESTATISTICAS_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. **Os resultados aparecerão em uma única tabela com estatísticas!**

---

## 💡 DICAS IMPORTANTES

### 1. **Role para Cima**
Se você executou um script com múltiplas queries:
- Os resultados aparecem em ordem (primeira query primeiro)
- A última mensagem de status aparece no final
- **Role para cima** para ver os dados anteriores!

### 2. **Use Scripts com Uma Única Query**
- Scripts com uma única query são mais fáceis de visualizar
- Todos os dados aparecem em uma única tabela
- Não precisa rolar para encontrar os resultados

### 3. **Exportar Resultados**
No Supabase SQL Editor:
- Clique no botão **"Download CSV"** para exportar os resultados
- Ou copie os dados diretamente da tabela

---

## 📊 EXEMPLO DE RESULTADO

### Script Simples:
```
tipo_usuario          | email                        | name              | tipo_original
👑 ADMIN              | phpg69@gmail.com             | Pedro             | admin
👑 ADMIN              | rrvalenca@gmail.com          | Ricardo           | admin
👨‍⚕️ PROFISSIONAL     | iaianoaesperanza@gmail.com   | Dr. Ricardo       | profissional
👤 PACIENTE           | casualmusic2021@gmail.com    | Pedro Paciente    | paciente
👤 PACIENTE           | graca11souza@gmail.com        | Maria Souza       | paciente
```

---

## ✅ CONCLUSÃO

**Use o script simples** (`LISTAR_USUARIOS_SIMPLES_06-02-2026.sql`) para ver todos os usuários de forma clara e direta!

---

**Documento criado por:** Sistema de Documentação  
**Data:** 06/02/2026
