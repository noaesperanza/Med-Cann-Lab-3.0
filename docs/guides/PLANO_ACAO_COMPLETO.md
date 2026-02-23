# 🎯 PLANO DE AÇÃO COMPLETO - MEDCANLAB 3.0

## 📋 RESUMO EXECUTIVO

**Problema Identificado**: Plataforma com 70% de dados mockados, tabelas Supabase ausentes, rotas quebradas e integrações não funcionais.

**Solução**: Criar script SQL completo, remover todos os dados mockados, conectar componentes ao Supabase, e testar todas as funcionalidades.

**Tempo Estimado**: 12 horas
**Prioridade**: CRÍTICA

---

## 🚀 FASE 1: CRIAR SCRIPT SQL COMPLETO (2 horas)

### 1.1 Consolidar Scripts SQL Existentes
- [ ] Ler todos os scripts SQL existentes
- [ ] Identificar tabelas duplicadas
- [ ] Consolidar em um único script
- [ ] Adicionar tabelas faltantes

### 1.2 Tabelas a Criar
- [ ] `appointments` - Agendamentos
- [ ] `courses` - Cursos
- [ ] `course_modules` - Módulos de cursos
- [ ] `course_enrollments` - Inscrições
- [ ] `user_profiles` - Perfis e gamificação
- [ ] `transactions` - Transações financeiras
- [ ] `wearable_devices` - Dispositivos wearables
- [ ] `epilepsy_events` - Eventos de epilepsia
- [ ] `analytics` - Analytics e métricas

### 1.3 Configurar RLS e Políticas
- [ ] Habilitar RLS em todas as tabelas
- [ ] Criar políticas de acesso por tipo de usuário
- [ ] Criar políticas de admin (acesso total)
- [ ] Testar políticas de segurança

### 1.4 Dados de Teste
- [ ] Criar usuários de teste
- [ ] Criar agendamentos de teste
- [ ] Criar cursos de teste
- [ ] Criar dados de monitoramento

---

## 🔧 FASE 2: REMOVER DADOS MOCKADOS (4 horas)

### 2.1 Componentes de Agendamento
- [ ] **EduardoScheduling.tsx**
  - Remover `mockAppointments` (linha 58-118)
  - Remover `mockAnalytics` (linha 120-140)
  - Conectar ao Supabase `appointments`
  - Implementar queries reais

- [ ] **ProfessionalScheduling.tsx**
  - Verificar dados mockados
  - Conectar ao Supabase
  - Implementar queries reais

- [ ] **PatientAppointments.tsx**
  - Verificar dados mockados
  - Conectar ao Supabase
  - Implementar queries reais

### 2.2 Componentes de Cursos
- [ ] **GestaoCursos.tsx**
  - Remover `mockCursos` (linha 67-116)
  - Remover `mockModulos` (linha 118-152)
  - Conectar ao Supabase `courses` e `course_modules`
  - Implementar queries reais

- [ ] **Courses.tsx**
  - Verificar dados mockados
  - Conectar ao Supabase
  - Implementar queries reais

- [ ] **AlunoDashboard.tsx**
  - Verificar dados mockados
  - Conectar ao Supabase `course_enrollments`
  - Implementar queries reais

### 2.3 Componentes de Monitoramento
- [ ] **WearableMonitoring.tsx**
  - Remover `mockDevices` (linha 68-126)
  - Conectar ao Supabase `wearable_devices`
  - Implementar queries reais

- [ ] **NeurologiaPediatrica.tsx**
  - Remover `mockPatients` (linha 73-113)
  - Remover `mockEvents` (linha 115-152)
  - Conectar ao Supabase `epilepsy_events`
  - Implementar queries reais

### 2.4 Dashboards
- [ ] **RicardoValencaDashboard.tsx**
  - Remover cálculos de KPIs com dados mockados
  - Conectar ao Supabase para carregar dados reais
  - Implementar queries reais para KPIs

- [ ] **EduardoFaveretDashboard.tsx**
  - Remover cálculos de KPIs com dados mockados
  - Conectar ao Supabase para carregar dados reais
  - Implementar queries reais para KPIs

- [ ] **ProfessionalDashboard.tsx**
  - Verificar dados mockados
  - Conectar ao Supabase
  - Implementar queries reais

- [ ] **PatientDashboard.tsx**
  - Verificar dados mockados
  - Conectar ao Supabase
  - Implementar queries reais

### 2.5 Gamificação
- [ ] **Gamificacao.tsx**
  - Verificar dados mockados
  - Conectar ao Supabase `user_profiles`
  - Implementar queries reais

---

## 🛣️ FASE 3: CORRIGIR ROTAS (2 horas)

### 3.1 Rotas de Clínica
- [ ] `/app/clinica/profissional/agendamentos` - Dados reais
- [ ] `/app/clinica/profissional/relatorios` - Dados reais
- [ ] `/app/clinica/paciente/dashboard` - Dados reais

### 3.2 Rotas de Ensino
- [ ] `/app/ensino/profissional/gestao-alunos` - Dados reais
- [ ] `/app/ensino/aluno/cursos` - Dados reais
- [ ] `/app/ensino/aluno/biblioteca` - Dados reais

### 3.3 Rotas de Pesquisa
- [ ] `/app/pesquisa/profissional/dashboard` - Dados reais
- [ ] `/app/pesquisa/aluno/dashboard` - Dados reais

### 3.4 Rotas Admin
- [ ] `/app/admin/*` - Dados reais em todas as rotas

---

## 🔗 FASE 4: INTEGRAR SISTEMAS (4 horas)

### 4.1 Sistema IMRE
- [ ] Verificar migração de tabelas IMRE
- [ ] Conectar avaliação clínica inicial
- [ ] Testar fluxo completo

### 4.2 Sistema NOA
- [ ] Finalizar integração
- [ ] Testar chat IA
- [ ] Testar avaliação clínica inicial

### 4.3 Sistema RAG
- [ ] Implementar integração
- [ ] Testar busca inteligente
- [ ] Testar chat IA com documentos

---

## ✅ CHECKLIST DE EXECUÇÃO

### PRIORIDADE CRÍTICA (Fazer primeiro)

1. **Criar Script SQL Completo**
   - [ ] Consolidar scripts existentes
   - [ ] Adicionar tabelas faltantes
   - [ ] Configurar RLS
   - [ ] Adicionar dados de teste

2. **Executar no Supabase**
   - [ ] Executar script SQL completo
   - [ ] Verificar criação de tabelas
   - [ ] Verificar RLS
   - [ ] Verificar dados de teste

3. **Remover Dados Mockados**
   - [ ] EduardoScheduling.tsx
   - [ ] GestaoCursos.tsx
   - [ ] NeurologiaPediatrica.tsx
   - [ ] WearableMonitoring.tsx
   - [ ] RicardoValencaDashboard.tsx
   - [ ] EduardoFaveretDashboard.tsx

4. **Conectar ao Supabase**
   - [ ] Agendamentos
   - [ ] Cursos
   - [ ] Monitoramento
   - [ ] Dashboards

### PRIORIDADE ALTA (Fazer depois)

1. **Corrigir Rotas**
   - [ ] Todas as rotas de clínica
   - [ ] Todas as rotas de ensino
   - [ ] Todas as rotas de pesquisa
   - [ ] Todas as rotas admin

2. **Integrar Sistemas**
   - [ ] IMRE
   - [ ] NOA
   - [ ] RAG

---

## 📊 RESULTADO ESPERADO

### ANTES
- **Funcionalidade**: 30%
- **Dados Mockados**: 70%
- **Tabelas Ausentes**: 9 tabelas críticas
- **Rotas Quebradas**: Múltiplas rotas

### DEPOIS
- **Funcionalidade**: 100%
- **Dados Mockados**: 0%
- **Tabelas Ausentes**: 0
- **Rotas Quebradas**: 0

---

## 🚨 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar Script SQL Completo** (`SUPABASE_COMPLETO_FINAL.sql`)
2. **Executar no Supabase**
3. **Remover primeiro componente mockado** (EduardoScheduling.tsx)
4. **Testar funcionalidade**
5. **Repetir para todos os componentes**

---

**STATUS**: Pronto para iniciar Fase 1

