# 📋 RESUMO - SQL DE ATUALIZAÇÃO FINAL APÓS REVISÃO

## 🎯 OBJETIVO

Este documento resume todas as atualizações SQL necessárias após a remoção de dados mockados e conexão completa com Supabase.

---

## 📊 TABELAS E COLUNAS ADICIONADAS/ATUALIZADAS

### 1. **COURSES** (Tabela de Cursos)

**Colunas Adicionadas:**
- ✅ `price` (NUMERIC) - Preço do curso
- ✅ `original_price` (NUMERIC) - Preço original (para descontos)
- ✅ `instructor` (TEXT) - Nome do instrutor
- ✅ `level` (VARCHAR) - Nível do curso (diferente de difficulty)
- ✅ `is_live` (BOOLEAN) - Se o curso tem aulas ao vivo
- ✅ `next_class_date` (TIMESTAMP) - Data da próxima aula
- ✅ `slug` (TEXT) - Slug para URLs amigáveis
- ✅ `duration_text` (TEXT) - Duração em formato texto ("8h", "520h")

**Índices Criados:**
- `idx_courses_slug` - Para busca por slug
- `idx_courses_published` - Para filtrar cursos publicados

---

### 2. **COURSE_RATINGS** (Nova Tabela - Opcional)

**Estrutura:**
- `id` (UUID) - Primary key
- `course_id` (UUID) - Referência ao curso
- `user_id` (UUID) - Referência ao usuário
- `rating` (NUMERIC) - Avaliação de 1 a 5
- `comment` (TEXT) - Comentário opcional
- `created_at`, `updated_at` (TIMESTAMP)

**Índices:**
- `idx_course_ratings_course_id` - Para buscar avaliações por curso
- `idx_course_ratings_user_id` - Para buscar avaliações por usuário

**RLS:**
- Todos podem ver avaliações
- Usuários podem criar/atualizar apenas suas próprias avaliações

---

### 3. **TRANSACTIONS** (Tabela de Transações)

**Colunas Adicionadas/Verificadas:**
- ✅ `doctor_id` (UUID) - Referência ao profissional
- ✅ `course_id` (UUID) - Referência ao curso (se aplicável)
- ✅ `appointment_id` (UUID) - Referência ao agendamento (se aplicável)
- ✅ `status` (VARCHAR) - Status da transação
- ✅ `type` (VARCHAR) - Tipo da transação

**Tipos de Transação:**
- `consultation` - Consulta médica
- `course` - Curso
- `subscription` - Assinatura
- `fee` - Taxa
- `refund` - Reembolso

**Status:**
- `pending` - Pendente
- `completed` - Completa
- `failed` - Falhou
- `refunded` - Reembolsada
- `cancelled` - Cancelada

**Índices:**
- `idx_transactions_user_id` - Para buscar transações do usuário
- `idx_transactions_doctor_id` - Para buscar transações do profissional
- `idx_transactions_status` - Para filtrar por status
- `idx_transactions_type` - Para filtrar por tipo
- `idx_transactions_created_at` - Para ordenar por data

**RLS:**
- Usuários veem apenas suas próprias transações ou transações onde são o profissional

---

### 4. **SUBSCRIPTION_PLANS** (Tabela de Planos de Assinatura)

**Colunas Adicionadas/Verificadas:**
- ✅ `is_active` (BOOLEAN) - Se o plano está ativo
- ✅ `features` (JSONB) - Array de features do plano
- ✅ `consultation_discount` (NUMERIC) - Desconto em consultas (%)

**Índices:**
- `idx_subscription_plans_active` - Para filtrar planos ativos

**RLS:**
- Todos podem ver planos ativos

**Dados Iniciais:**
- Med Cann 150 (R$ 150,00 - 10% desconto)
- Med Cann 250 (R$ 250,00 - 20% desconto)
- Med Cann 350 (R$ 350,00 - 30% desconto)

---

### 5. **USER_SUBSCRIPTIONS** (Nova Tabela)

**Estrutura:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Referência ao usuário
- `plan_id` (UUID) - Referência ao plano
- `status` (VARCHAR) - Status da assinatura
- `start_date` (TIMESTAMP) - Data de início
- `end_date` (TIMESTAMP) - Data de término
- `auto_renew` (BOOLEAN) - Renovação automática
- `payment_method` (VARCHAR) - Método de pagamento

**Status:**
- `active` - Ativa
- `cancelled` - Cancelada
- `expired` - Expirada
- `suspended` - Suspensa

**Índices:**
- `idx_user_subscriptions_user_id` - Para buscar assinaturas do usuário
- `idx_user_subscriptions_plan_id` - Para buscar assinaturas do plano
- `idx_user_subscriptions_status` - Para filtrar por status

**RLS:**
- Usuários veem apenas suas próprias assinaturas

---

### 6. **CHAT_MESSAGES** (Atualização)

**Colunas Adicionadas:**
- ✅ `sender_name` (TEXT) - Nome do remetente
- ✅ `sender_email` (TEXT) - Email do remetente

**Nota:** `chat_id` deve ser UUID (já corrigido anteriormente)

---

### 7. **APPOINTMENTS** (Atualização)

**Colunas Verificadas:**
- ✅ `doctor_id` (UUID) - Referência ao profissional

**Nota:** Se existir `professional_id`, os dados são migrados para `doctor_id`

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Políticas Criadas:

1. **courses:**
   - Todos podem ver cursos publicados

2. **course_ratings:**
   - Todos podem ver avaliações
   - Usuários podem criar/atualizar apenas suas próprias avaliações

3. **transactions:**
   - Usuários veem apenas suas próprias transações ou transações onde são o profissional

4. **subscription_plans:**
   - Todos podem ver planos ativos

5. **user_subscriptions:**
   - Usuários veem apenas suas próprias assinaturas

---

## ⚙️ FUNÇÕES E TRIGGERS

### Função:
- `update_updated_at_column()` - Atualiza `updated_at` automaticamente

### Triggers Criados:
- `update_courses_updated_at` - Para tabela `courses`
- `update_course_ratings_updated_at` - Para tabela `course_ratings`
- `update_transactions_updated_at` - Para tabela `transactions`
- `update_user_subscriptions_updated_at` - Para tabela `user_subscriptions`

---

## 📝 INSTRUÇÕES DE EXECUÇÃO

1. **Execute o script `SUPABASE_ATUALIZACAO_FINAL_REVISAO.sql` no Supabase SQL Editor**

2. **Verifique se todas as tabelas foram criadas/atualizadas:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('courses', 'course_ratings', 'transactions', 'subscription_plans', 'user_subscriptions');
   ```

3. **Verifique se as colunas foram adicionadas:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'courses' 
   AND column_name IN ('price', 'original_price', 'instructor', 'level', 'is_live', 'next_class_date', 'slug');
   ```

4. **Verifique se os índices foram criados:**
   ```sql
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename IN ('courses', 'course_ratings', 'transactions', 'subscription_plans', 'user_subscriptions');
   ```

5. **Verifique se as políticas RLS foram criadas:**
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('courses', 'course_ratings', 'transactions', 'subscription_plans', 'user_subscriptions');
   ```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] Script SQL executado com sucesso
- [ ] Todas as tabelas criadas/atualizadas
- [ ] Todas as colunas adicionadas
- [ ] Índices criados
- [ ] RLS habilitado e políticas criadas
- [ ] Triggers criados
- [ ] Dados iniciais inseridos (planos de assinatura)
- [ ] Testar busca de cursos no frontend
- [ ] Testar busca de transações no frontend
- [ ] Testar busca de assinaturas no frontend

---

## 🎯 RESULTADO ESPERADO

Após executar o script:
- ✅ Cursos podem ser cadastrados com todos os campos necessários
- ✅ Avaliações de cursos podem ser criadas (opcional)
- ✅ Transações podem ser registradas com todos os campos
- ✅ Planos de assinatura estão disponíveis
- ✅ Assinaturas de usuários podem ser gerenciadas
- ✅ RLS protege os dados adequadamente
- ✅ Performance otimizada com índices

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `CORRECAO_DADOS_MOCKADOS_CURSOS_FINANCEIRO.md` - Detalhes das correções
- `RELATORIO_FINAL_CORRECOES_IMPLEMENTADAS.md` - Relatório completo
- `SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql` - Script SQL base
- `SUPABASE_TABELAS_ADICIONAIS_CORRIGIDO.sql` - Tabelas adicionais

---

**Status:** ✅ **PRONTO PARA EXECUÇÃO**

