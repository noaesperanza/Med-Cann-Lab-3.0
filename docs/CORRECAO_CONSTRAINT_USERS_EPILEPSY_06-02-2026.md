# 🔧 CORREÇÃO: Constraint Users e Epilepsy Events

**Data:** 06/02/2026  
**Problemas Identificados:**
1. ❌ Constraint CHECK na tabela `users` só aceita valores em inglês (`'patient', 'professional', 'student', 'admin'`)
2. ❌ Erro ao criar índice em `epilepsy_events`: coluna `event_date` não existe

---

## 🔴 PROBLEMA 1: Constraint CHECK na Tabela Users

### Erro:
```
ERROR: 23514: new row for relation "users" violates check constraint "users_type_check"
DETAIL: Failing row contains (..., paciente, ...)
```

### Causa:
A constraint CHECK na tabela `users` só permite:
- `'patient'` (inglês)
- `'professional'` (inglês)
- `'student'` (inglês)
- `'admin'`

Mas o sistema está tentando usar:
- `'paciente'` (português)
- `'profissional'` (português)
- `'aluno'` (português)

### Solução:
**Arquivo:** `database/scripts/CORRIGIR_CONSTRAINT_USERS_E_EPILEPSY_06-02-2026.sql`

**O que faz:**
1. ✅ Remove constraint antiga
2. ✅ Cria nova constraint que aceita português E inglês
3. ✅ Atualiza tipos de usuário para português
4. ✅ Verifica resultado

**Valores aceitos pela nova constraint:**
- Português: `'paciente'`, `'profissional'`, `'aluno'`, `'admin'`, `'master'`, `'gestor'`
- Inglês (compatibilidade): `'patient'`, `'professional'`, `'student'`, `'admin'`

---

## 🔴 PROBLEMA 2: Coluna event_date em epilepsy_events

### Erro:
```
ERROR: 42703: column "event_date" does not exist
```

### Causa:
A tabela `epilepsy_events` pode ter sido criada sem a coluna `event_date`, ou a tabela já existe com estrutura diferente.

### Solução:
O script `CORRIGIR_CONSTRAINT_USERS_E_EPILEPSY_06-02-2026.sql` também:
1. ✅ Verifica se a tabela `epilepsy_events` existe
2. ✅ Verifica se a coluna `event_date` existe
3. ✅ Adiciona a coluna se não existir
4. ✅ Cria o índice se necessário

---

## 📋 COMO EXECUTAR

### Passo 1: Executar Script de Correção

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra o arquivo: `database/scripts/CORRIGIR_CONSTRAINT_USERS_E_EPILEPSY_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**

**Tempo estimado:** 1-2 minutos

---

### Passo 2: Verificar Resultado

Após executar, verifique:

```sql
-- Verificar tipos de usuário
SELECT type, COUNT(*) FROM public.users GROUP BY type;

-- Verificar constraint
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
    AND contype = 'c' 
    AND conname LIKE '%type%';
```

**Resultado esperado:**
- Constraint deve aceitar valores em português
- Tipos de usuário devem estar padronizados para português
- Pacientes devem aparecer na contagem

---

### Passo 3: Executar Script de Criar Tabelas (Se Necessário)

Se ainda não executou o script de criar tabelas faltando:

1. Execute: `database/scripts/CRIAR_TABELAS_FALTANDO_COMPLETO_06-02-2026.sql`
2. Agora deve funcionar sem erros

---

## ✅ CHECKLIST

- [ ] Script `CORRIGIR_CONSTRAINT_USERS_E_EPILEPSY_06-02-2026.sql` executado
- [ ] Constraint corrigida (aceita português e inglês)
- [ ] Tipos de usuário padronizados para português
- [ ] Tabela `epilepsy_events` verificada/corrigida
- [ ] Índice `idx_epilepsy_events_event_date` criado
- [ ] Pacientes aparecem na contagem
- [ ] Script de criar tabelas executado sem erros

---

## 🎯 RESULTADO ESPERADO

Após executar o script:

1. ✅ Constraint aceita valores em português
2. ✅ Tipos de usuário padronizados
3. ✅ Pacientes visíveis no sistema
4. ✅ Tabela `epilepsy_events` com estrutura correta
5. ✅ Índices criados corretamente

---

**Documento criado por:** Sistema de Correção  
**Data:** 06/02/2026  
**Status:** ✅ Pronto para execução
