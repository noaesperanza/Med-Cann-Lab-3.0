# 📋 GUIA: Execução dos SQLs de Diagnóstico

**Data:** 06/02/2026  
**Objetivo:** Verificar TUDO no Supabase para garantir 100% compatibilidade com o frontend

---

## 🎯 O QUE FAZER

Execute os 2 scripts SQL abaixo no Supabase SQL Editor para ter uma visão completa do banco de dados.

---

## 📝 SCRIPTS PARA EXECUTAR

### 1. **DIAGNÓSTICO COMPLETO** (Principal)

**Arquivo:** `database/scripts/DIAGNOSTICO_COMPLETO_SUPABASE_06-02-2026.sql`

**O que verifica:**
- ✅ Todas as tabelas do schema public
- ✅ Estrutura de cada tabela (colunas)
- ✅ Foreign keys (relacionamentos)
- ✅ RLS Policies (segurança)
- ✅ Funções RPC (stored procedures)
- ✅ Triggers
- ✅ Views
- ✅ Índices
- ✅ Usuários e seus tipos
- ✅ Vínculos profissional-paciente
- ✅ Tabelas esperadas pelo frontend
- ✅ Colunas críticas
- ✅ Funções RPC esperadas
- ✅ Dados de teste
- ✅ Admins e seus vínculos
- ✅ Profissionais e seus pacientes
- ✅ Integridade de dados
- ✅ Resumo final

**Tempo estimado:** 2-3 minutos

---

### 2. **VERIFICAÇÃO DE COMPATIBILIDADE** (Foco Frontend)

**Arquivo:** `database/scripts/VERIFICAR_COMPATIBILIDADE_FRONTEND_06-02-2026.sql`

**O que verifica:**
- ✅ Tabelas críticas para chat e videochamada
- ✅ Colunas críticas (metadata, is_read, etc.)
- ✅ RPC Functions críticas
- ✅ RLS Policies para tabelas críticas
- ✅ Tipos de usuário esperados
- ✅ Vínculos profissional-paciente
- ✅ Dados de teste necessários
- ✅ Resumo de compatibilidade

**Tempo estimado:** 1-2 minutos

---

## 🚀 COMO EXECUTAR

### Passo 1: Acessar Supabase SQL Editor

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Ou: Dashboard → SQL Editor → New Query

### Passo 2: Executar Script 1 (Diagnóstico Completo)

1. Abra o arquivo: `database/scripts/DIAGNOSTICO_COMPLETO_SUPABASE_06-02-2026.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou pressione `Ctrl+Enter`
5. Aguarde 2-3 minutos
6. **IMPORTANTE:** Salve os resultados (exportar ou copiar)

### Passo 3: Executar Script 2 (Compatibilidade Frontend)

1. Abra o arquivo: `database/scripts/VERIFICAR_COMPATIBILIDADE_FRONTEND_06-02-2026.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou pressione `Ctrl+Enter`
5. Aguarde 1-2 minutos
6. **IMPORTANTE:** Salve os resultados (exportar ou copiar)

---

## 📊 O QUE PROCURAR NOS RESULTADOS

### ✅ **Verificações Críticas**

1. **Tabelas Faltando:**
   - Procure por `❌ FALTANDO` nos resultados
   - Tabelas críticas que devem existir:
     - `lessons`
     - `modules`
     - `news`
     - `gamification_points`
     - `user_achievements`
     - `transactions`
     - `wearable_devices`
     - `epilepsy_events`

2. **Colunas Faltando:**
   - Procure por `❌ FALTANDO` nas colunas
   - Colunas críticas:
     - `notifications.metadata`
     - `notifications.is_read`
     - `video_call_requests.metadata`

3. **RPC Functions Faltando:**
   - Procure por `❌ FALTANDO` nas funções
   - Funções críticas:
     - `get_chat_participants_for_room`
     - `create_video_call_notification`
     - `create_chat_room_for_patient`

4. **RLS Policies:**
   - Verifique se todas as tabelas críticas têm políticas RLS
   - Tabelas que DEVEM ter RLS:
     - `chat_rooms`
     - `chat_messages`
     - `chat_participants`
     - `notifications`
     - `video_call_requests`
     - `clinical_assessments`
     - `clinical_reports`
     - `patient_medical_records`
     - `users`

5. **Vínculos Profissional-Paciente:**
   - Verifique se há profissionais sem pacientes
   - Verifique se há pacientes sem profissionais
   - Verifique se os vínculos estão corretos

6. **Dados de Teste:**
   - Verifique se há dados suficientes para testar
   - Tabelas que devem ter dados:
     - `chat_rooms` (pelo menos 1)
     - `chat_messages` (pelo menos algumas)
     - `notifications` (pelo menos algumas)
     - `users` (pelo menos alguns)

---

## 📋 CHECKLIST PÓS-EXECUÇÃO

Após executar os scripts, verifique:

- [ ] Todas as tabelas críticas existem?
- [ ] Todas as colunas críticas existem?
- [ ] Todas as RPC Functions críticas existem?
- [ ] Todas as tabelas críticas têm RLS?
- [ ] Há profissionais sem pacientes?
- [ ] Há pacientes sem profissionais?
- [ ] Há dados suficientes para testar?
- [ ] Há usuários órfãos (sem vínculos)?

---

## 🔧 PRÓXIMOS PASSOS

Após executar os scripts e analisar os resultados:

1. **Se houver tabelas faltando:**
   - Criar as tabelas faltando
   - Usar scripts em `database/scripts/` como referência

2. **Se houver colunas faltando:**
   - Adicionar as colunas faltando
   - Usar scripts de correção em `database/scripts/`

3. **Se houver RPC Functions faltando:**
   - Criar as funções faltando
   - Usar scripts em `database/scripts/CREATE_RPC_*.sql`

4. **Se houver problemas de RLS:**
   - Corrigir políticas RLS
   - Usar scripts de correção em `database/scripts/FIX_RLS_*.sql`

5. **Se houver problemas de vínculos:**
   - Criar vínculos faltando
   - Usar scripts de vinculação em `database/scripts/VINCULAR_*.sql`

---

## 📊 INTERPRETAÇÃO DOS RESULTADOS

### ✅ **Status: EXISTE**
- Tabela/coluna/função existe e está funcionando
- Nenhuma ação necessária

### ❌ **Status: FALTANDO**
- Tabela/coluna/função não existe
- **AÇÃO NECESSÁRIA:** Criar o que está faltando

### ⚠️ **Status: Sem dados**
- Tabela existe mas não tem dados
- **AÇÃO NECESSÁRIA:** Popular com dados de teste ou dados reais

---

## 💡 DICAS

1. **Salve os resultados:**
   - Exporte os resultados como CSV ou copie para um documento
   - Isso ajuda a comparar antes/depois

2. **Execute em partes:**
   - Se o script for muito grande, execute em partes
   - Cada seção pode ser executada separadamente

3. **Compare com o frontend:**
   - Use os resultados para comparar com o código do frontend
   - Verifique se todas as queries do frontend têm suporte no banco

---

**Documento criado por:** Sistema de Diagnóstico  
**Data:** 06/02/2026  
**Status:** ✅ Pronto para execução
