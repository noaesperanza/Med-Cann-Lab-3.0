# 🔍 Guia: Verificar Emails Duplicados por Tipo de Perfil

**Data:** 06/02/2026

---

## 📋 O QUE ESTE SCRIPT FAZ

O script `VERIFICAR_EMAILS_DUPLICADOS_POR_TIPO_06-02-2026.sql` identifica:

1. **Emails que aparecem em múltiplos tipos** (ex: mesmo email como admin E paciente)
2. **Emails duplicados no mesmo tipo** (ex: mesmo email como paciente 2x)
3. **Estatísticas gerais** de duplicações
4. **Recomendações** de quais manter e quais remover

---

## 🚀 COMO USAR

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra: `database/scripts/VERIFICAR_EMAILS_DUPLICADOS_POR_TIPO_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. **Role para cima** para ver todos os resultados!

---

## 📊 RESULTADOS QUE VOCÊ VERÁ

### 1. **Emails com Múltiplos Tipos**
```
email | total_tipos | tipos | nomes | ids
joao.vidal@gmail.com | 2 | paciente, profissional | João Vidal | id1, id2
```

### 2. **Detalhes Completos**
```
email | tipo_1 | nome_1 | tipo_2 | nome_2 | id_mais_antigo
joao.vidal@gmail.com | paciente | João | profissional | João | id_antigo
```

### 3. **Resumo Estatístico**
```
categoria | valor
Total de emails únicos | 32
Total de usuários | 33
Emails duplicados | 1
```

### 4. **Emails Duplicados (Mesmo Tipo)**
```
email | type | total_duplicados | nomes | ids
joao.vidal@gmail.com | paciente | 2 | João, João Eduardo | id1, id2
```

### 5. **Casos Específicos**
Verifica emails conhecidos (admins, profissionais) para ver se estão duplicados.

### 6. **Recomendações**
Sugere qual registro manter (geralmente o mais recente).

---

## ⚠️ PROBLEMAS COMUNS

### **Problema 1: Mesmo Email em Múltiplos Tipos**

**Exemplo:**
- `joao.vidal@gmail.com` como `paciente`
- `joao.vidal@gmail.com` como `profissional`

**Solução:**
- Decidir qual tipo é o correto
- Remover ou atualizar o registro incorreto
- Manter apenas um tipo por email

---

### **Problema 2: Email Duplicado no Mesmo Tipo**

**Exemplo:**
- `joao.vidal@gmail.com` como `paciente` (ID 1)
- `joao.vidal@gmail.com` como `paciente` (ID 2)

**Solução:**
- Manter o registro mais recente ou mais completo
- Remover os duplicados
- Verificar se há dados importantes nos registros antigos antes de remover

---

## 🔧 COMO CORRIGIR

### **Passo 1: Identificar Duplicações**

Execute o script e veja os resultados.

### **Passo 2: Decidir Qual Manter**

Para cada email duplicado:
- **Manter o mais recente** (created_at mais recente)
- **OU manter o mais completo** (com mais dados preenchidos)
- **OU manter o que está sendo usado** (com mais vínculos)

### **Passo 3: Remover Duplicados**

```sql
-- Exemplo: Remover registro duplicado (substituir ID pelo ID a remover)
DELETE FROM public.users
WHERE id = 'id-do-registro-duplicado';
```

**⚠️ CUIDADO:** Antes de remover, verifique:
- Se há vínculos (assessments, appointments, chat, etc.)
- Se há dados importantes no registro
- Se o registro está sendo usado

---

## 📊 EXEMPLO DE RESULTADO

### **Se houver duplicações:**

```
email | total_tipos | tipos
joao.vidal@gmail.com | 2 | paciente, profissional
cbdrepremium@gmail.com | 2 | admin, paciente
```

### **Se NÃO houver duplicações:**

```
(0 rows)
```

---

## ✅ CONCLUSÃO

Execute o script para verificar se há emails duplicados. Se houver, siga as recomendações para corrigir.

---

**Documento criado por:** Sistema de Documentação  
**Data:** 06/02/2026
