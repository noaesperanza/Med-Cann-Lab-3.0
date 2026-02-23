# ✅ CHECKLIST: POLIMENTO DE OUTRAS ÁREAS

**Data:** 06/02/2026  
**Status:** ⚠️ **PENDENTE**  
**Prioridade:** 🟢 MÉDIO (Após fluxo clínico e admin)

---

## 📋 **RESUMO**

Este checklist cobre as áreas que **não foram abordadas hoje**, focando em:
- ✅ Módulo de Ensino (cursos, aulas, gamificação)
- ✅ Módulo de Pesquisa (fórum, MedCann Lab, Jardins de Cura)
- ✅ UX/UI Refinado (substituir alerts, modais customizados)
- ✅ Performance e Otimizações
- ✅ Funcionalidades Pendentes

---

## 🎓 **1. MÓDULO DE ENSINO**

### **1.1 Sistema de Cursos** ⚠️

**Arquivos:**
- `src/pages/GestaoCursos.tsx`
- `src/pages/Courses.tsx`
- `src/pages/AlunoDashboard.tsx`

**Checklist:**
- [ ] **Remover dados mockados**
  - [ ] Remover `mockCursos` de `GestaoCursos.tsx`
  - [ ] Remover `mockModulos` de `GestaoCursos.tsx`
  - [ ] Conectar ao Supabase `courses`
  - [ ] Conectar ao Supabase `course_modules`

- [ ] **Queries Reais**
  - [ ] Listar cursos do Supabase
  - [ ] Listar módulos por curso
  - [ ] Criar novo curso
  - [ ] Editar curso existente
  - [ ] Deletar curso (soft delete)

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em `courses`
  - [ ] Verificar RLS em `course_modules`
  - [ ] Admin pode ver todos os cursos
  - [ ] Profissional pode ver seus cursos
  - [ ] Aluno pode ver cursos inscritos

**Tempo Estimado:** 2-3 horas

---

### **1.2 Sistema de Aulas (Lessons)** ⚠️

**Arquivos:**
- `src/pages/LessonDetail.tsx`
- `src/pages/LessonPage.tsx`
- `src/pages/LessonPreparation.tsx`

**Checklist:**
- [ ] **Tabela `lessons` criada** ✅ (já foi criada hoje)
- [ ] **Conectar componentes ao Supabase**
  - [ ] Listar aulas por módulo
  - [ ] Carregar detalhes da aula
  - [ ] Marcar aula como concluída
  - [ ] Salvar progresso do aluno

- [ ] **Funcionalidades**
  - [ ] Player de vídeo funcionando
  - [ ] Material de apoio (PDFs, links)
  - [ ] Exercícios e avaliações
  - [ ] Certificado ao concluir módulo

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em `lessons`
  - [ ] Aluno vê apenas aulas dos cursos inscritos
  - [ ] Profissional vê aulas dos seus cursos

**Tempo Estimado:** 2-3 horas

---

### **1.3 Sistema de Gamificação** ⚠️

**Arquivos:**
- `src/pages/Gamificacao.tsx`
- `src/pages/AlunoDashboard.tsx`

**Checklist:**
- [ ] **Tabelas criadas** ✅ (já foram criadas hoje)
  - [x] `gamification_points` ✅
  - [x] `user_achievements` ✅
  - [x] `user_statistics` ✅

- [ ] **Conectar componentes ao Supabase**
  - [ ] Remover dados mockados de `Gamificacao.tsx`
  - [ ] Carregar pontos do usuário
  - [ ] Carregar conquistas do usuário
  - [ ] Carregar ranking de alunos

- [ ] **Lógica de Pontos**
  - [ ] Pontos por aula concluída
  - [ ] Pontos por exercício acertado
  - [ ] Pontos por participação no fórum
  - [ ] Bônus por conclusão de módulo

- [ ] **Sistema de Conquistas**
  - [ ] Conquistas automáticas (ex: "Primeira Aula", "100 Pontos")
  - [ ] Conquistas manuais (ex: "Melhor Aluno do Mês")
  - [ ] Badges visuais
  - [ ] Notificações de conquistas

- [ ] **Ranking e Estatísticas**
  - [ ] Ranking geral de alunos
  - [ ] Ranking por curso
  - [ ] Estatísticas pessoais (tempo de estudo, aulas concluídas)

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em `gamification_points`
  - [ ] Verificar RLS em `user_achievements`
  - [ ] Aluno vê apenas seus pontos e conquistas
  - [ ] Admin pode ver todos os dados

**Tempo Estimado:** 3-4 horas

---

### **1.4 Gestão de Alunos** ⚠️

**Arquivos:**
- `src/pages/GestaoAlunos.tsx`
- `src/pages/AlunoDashboard.tsx`

**Checklist:**
- [ ] **Conectar ao Supabase**
  - [ ] Listar alunos inscritos
  - [ ] Ver progresso de cada aluno
  - [ ] Ver estatísticas de cada aluno
  - [ ] Aprovar/rejeitar inscrições

- [ ] **Funcionalidades**
  - [ ] Filtros por curso
  - [ ] Filtros por status (ativo, inativo, concluído)
  - [ ] Exportar relatórios de alunos
  - [ ] Enviar mensagens para alunos

- [ ] **RLS e Segurança**
  - [ ] Profissional vê apenas alunos dos seus cursos
  - [ ] Admin vê todos os alunos

**Tempo Estimado:** 1-2 horas

---

## 🔬 **2. MÓDULO DE PESQUISA**

### **2.1 Fórum de Casos Clínicos** ⚠️

**Arquivos:**
- `src/pages/ForumCasosClinicos.tsx`
- `src/pages/DebateRoom.tsx`

**Checklist:**
- [ ] **Conectar ao Supabase**
  - [ ] Listar posts do fórum
  - [ ] Criar novo post
  - [ ] Comentar em posts
  - [ ] Curtir posts/comentários

- [ ] **Funcionalidades**
  - [ ] Busca por palavras-chave
  - [ ] Filtros por categoria
  - [ ] Filtros por autor
  - [ ] Ordenação (mais recente, mais curtido, mais comentado)

- [ ] **Moderação**
  - [ ] Admin pode deletar posts
  - [ ] Admin pode editar posts
  - [ ] Sistema de denúncia
  - [ ] Bloqueio de usuários

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em `forum_posts`
  - [ ] Verificar RLS em `forum_comments`
  - [ ] Usuários podem ver todos os posts públicos
  - [ ] Usuários podem criar posts

**Tempo Estimado:** 2-3 horas

---

### **2.2 MedCann Lab** ⚠️

**Arquivos:**
- `src/pages/MedCannLab.tsx`
- `src/pages/MedCannLabStructure.tsx`

**Checklist:**
- [ ] **Conectar ao Supabase**
  - [ ] Carregar protocolos do banco
  - [ ] Carregar estudos do banco
  - [ ] Carregar estatísticas do banco

- [ ] **Funcionalidades**
  - [ ] Visualizar protocolos AEC
  - [ ] Visualizar estudos clínicos
  - [ ] Visualizar monitoramento renal
  - [ ] Visualizar deep learning
  - [ ] Visualizar dispositivos médicos
  - [ ] Visualizar impacto clínico

- [ ] **Integração com IA**
  - [ ] Chat IA sobre protocolos
  - [ ] Análise de dados com IA
  - [ ] Recomendações baseadas em IA

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em tabelas de pesquisa
  - [ ] Admin pode gerenciar protocolos
  - [ ] Profissionais podem visualizar protocolos

**Tempo Estimado:** 2-3 horas

---

### **2.3 Jardins de Cura** ⚠️

**Arquivos:**
- `src/pages/JardinsDeCura.tsx`
- `src/pages/CursoJardinsDeCura.tsx`

**Checklist:**
- [ ] **Conectar ao Supabase**
  - [ ] Carregar dados do projeto
  - [ ] Carregar participantes
  - [ ] Carregar resultados

- [ ] **Funcionalidades**
  - [ ] Visualizar estrutura do projeto
  - [ ] Visualizar participantes
  - [ ] Visualizar resultados
  - [ ] Inscrição no projeto

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em tabelas do projeto
  - [ ] Participantes podem ver seus dados
  - [ ] Admin pode gerenciar projeto

**Tempo Estimado:** 1-2 horas

---

### **2.4 Cidade Amiga dos Rins** ⚠️

**Arquivos:**
- `src/pages/CidadeAmigaDosRins.tsx`

**Checklist:**
- [ ] **Conectar ao Supabase**
  - [ ] Carregar dados do projeto
  - [ ] Carregar participantes
  - [ ] Carregar estatísticas

- [ ] **Funcionalidades**
  - [ ] Visualizar estrutura do projeto
  - [ ] Visualizar participantes
  - [ ] Visualizar estatísticas
  - [ ] Inscrição no projeto

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em tabelas do projeto
  - [ ] Participantes podem ver seus dados
  - [ ] Admin pode gerenciar projeto

**Tempo Estimado:** 1-2 horas

---

## 🎨 **3. UX/UI REFINADO**

### **3.1 Substituir `alert()` por Componentes Customizados** ⚠️

**Checklist:**
- [ ] **Criar componente Toast**
  - [ ] Componente `Toast.tsx` ou usar biblioteca (react-hot-toast, sonner)
  - [ ] Tipos: success, error, warning, info
  - [ ] Posicionamento (top-right, bottom-right, etc.)
  - [ ] Auto-dismiss configurável

- [ ] **Substituir em todos os componentes**
  - [ ] `PatientDoctorChat.tsx` - Substituir alerts de erro
  - [ ] `AdminChat.tsx` - Substituir alerts de erro
  - [ ] `RicardoValencaDashboard.tsx` - Substituir alerts
  - [ ] `EduardoFaveretDashboard.tsx` - Substituir alerts
  - [ ] `Prescriptions.tsx` - Substituir alerts
  - [ ] `ClinicalAssessment.tsx` - Substituir alerts
  - [ ] E todos os outros componentes

- [ ] **Padrão de uso:**
  ```tsx
  // Antes:
  alert('Erro ao salvar')
  
  // Depois:
  toast.error('Erro ao salvar')
  ```

**Tempo Estimado:** 3-4 horas

---

### **3.2 Substituir `confirm()` por Modais Customizados** ⚠️

**Checklist:**
- [ ] **Criar componente Modal de Confirmação**
  - [ ] Componente `ConfirmModal.tsx`
  - [ ] Props: title, message, onConfirm, onCancel
  - [ ] Estilo consistente com o app
  - [ ] Animações suaves

- [ ] **Substituir em todos os componentes**
  - [ ] `Prescriptions.tsx` - Confirmar exclusão
  - [ ] `GestaoCursos.tsx` - Confirmar exclusão de curso
  - [ ] `PatientsManagement.tsx` - Confirmar exclusão de paciente
  - [ ] `ForumCasosClinicos.tsx` - Confirmar exclusão de post
  - [ ] E todos os outros componentes

- [ ] **Padrão de uso:**
  ```tsx
  // Antes:
  if (confirm('Tem certeza?')) {
    // ação
  }
  
  // Depois:
  <ConfirmModal
    isOpen={showConfirm}
    title="Confirmar ação"
    message="Tem certeza que deseja continuar?"
    onConfirm={() => { /* ação */ }}
    onCancel={() => setShowConfirm(false)}
  />
  ```

**Tempo Estimado:** 2-3 horas

---

### **3.3 Melhorar Loading States** ⚠️

**Checklist:**
- [ ] **Criar componente Loading**
  - [ ] Componente `Loading.tsx` ou `Spinner.tsx`
  - [ ] Variantes: spinner, skeleton, progress bar
  - [ ] Estilo consistente

- [ ] **Aplicar em todos os componentes**
  - [ ] Dashboards - Loading ao carregar dados
  - [ ] Listas - Skeleton enquanto carrega
  - [ ] Formulários - Loading ao salvar
  - [ ] Chat - Loading ao enviar mensagem

**Tempo Estimado:** 2-3 horas

---

### **3.4 Melhorar Error States** ⚠️

**Checklist:**
- [ ] **Criar componente Error**
  - [ ] Componente `ErrorState.tsx`
  - [ ] Mensagens amigáveis
  - [ ] Botão de retry
  - [ ] Estilo consistente

- [ ] **Aplicar em todos os componentes**
  - [ ] Dashboards - Erro ao carregar dados
  - [ ] Listas - Erro ao carregar lista
  - [ ] Formulários - Erro ao salvar
  - [ ] Chat - Erro ao enviar mensagem

**Tempo Estimado:** 1-2 horas

---

## ⚡ **4. PERFORMANCE E OTIMIZAÇÕES**

### **4.1 Otimizar Queries do Banco** ⚠️

**Checklist:**
- [ ] **Adicionar índices**
  - [ ] Verificar índices em tabelas principais
  - [ ] Adicionar índices em colunas usadas em WHERE
  - [ ] Adicionar índices em colunas usadas em JOIN

- [ ] **Otimizar queries**
  - [ ] Usar `select` específico (não `select *`)
  - [ ] Usar `limit` quando possível
  - [ ] Usar `order by` apenas quando necessário
  - [ ] Evitar N+1 queries

- [ ] **Cache onde necessário**
  - [ ] Cache de dados estáticos (cursos, módulos)
  - [ ] Cache de dados do usuário (perfil, configurações)
  - [ ] Cache de queries frequentes

**Tempo Estimado:** 2-3 horas

---

### **4.2 Lazy Loading de Componentes** ⚠️

**Checklist:**
- [ ] **Implementar lazy loading**
  - [ ] Dashboards - Lazy load de seções pesadas
  - [ ] Bibliotecas - Lazy load de documentos
  - [ ] Chat - Lazy load de mensagens antigas
  - [ ] Cursos - Lazy load de módulos

- [ ] **Code splitting**
  - [ ] Separar rotas em chunks
  - [ ] Separar componentes pesados
  - [ ] Otimizar bundle size

**Tempo Estimado:** 2-3 horas

---

### **4.3 Otimizar Imagens** ⚠️

**Checklist:**
- [ ] **Otimizar imagens**
  - [ ] Usar formatos modernos (WebP, AVIF)
  - [ ] Redimensionar imagens grandes
  - [ ] Lazy load de imagens
  - [ ] Usar CDN se possível

**Tempo Estimado:** 1-2 horas

---

## 📊 **5. OUTRAS FUNCIONALIDADES PENDENTES**

### **5.1 Sistema de Notícias** ⚠️

**Arquivos:**
- `src/pages/NewsManagement.tsx`

**Checklist:**
- [ ] **Tabela `news` criada** ✅ (já foi criada hoje)
- [ ] **Conectar ao Supabase**
  - [ ] Listar notícias
  - [ ] Criar nova notícia
  - [ ] Editar notícia
  - [ ] Deletar notícia
  - [ ] Publicar/despublicar notícia

- [ ] **Funcionalidades**
  - [ ] Editor de texto rico (WYSIWYG)
  - [ ] Upload de imagens
  - [ ] Categorias de notícias
  - [ ] Data de publicação
  - [ ] Visualização pública

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em `news`
  - [ ] Admin pode criar/editar/deletar
  - [ ] Usuários podem visualizar notícias públicas

**Tempo Estimado:** 2-3 horas

---

### **5.2 Monitoramento Wearables** ⚠️

**Arquivos:**
- `src/pages/WearableMonitoring.tsx`
- `src/pages/NeurologiaPediatrica.tsx`

**Checklist:**
- [ ] **Tabela `wearable_devices` criada** ✅ (já foi criada hoje)
- [ ] **Tabela `epilepsy_events` criada** ✅ (já foi criada hoje)
- [ ] **Conectar ao Supabase**
  - [ ] Remover dados mockados
  - [ ] Listar dispositivos do paciente
  - [ ] Listar eventos de epilepsia
  - [ ] Criar alertas automáticos

- [ ] **Funcionalidades**
  - [ ] Dashboard de monitoramento
  - [ ] Gráficos de dados
  - [ ] Alertas em tempo real
  - [ ] Histórico de eventos

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em `wearable_devices`
  - [ ] Verificar RLS em `epilepsy_events`
  - [ ] Paciente vê apenas seus dados
  - [ ] Profissional vê dados dos seus pacientes

**Tempo Estimado:** 3-4 horas

---

### **5.3 Sistema Financeiro** ⚠️

**Arquivos:**
- `src/pages/ProfessionalFinancial.tsx`
- `src/pages/PaymentCheckout.tsx`
- `src/pages/SubscriptionPlans.tsx`

**Checklist:**
- [ ] **Tabela `transactions` criada** ✅ (já foi criada hoje)
- [ ] **Conectar ao Supabase**
  - [ ] Listar transações
  - [ ] Criar nova transação
  - [ ] Atualizar status de transação

- [ ] **Integração com Gateway de Pagamento**
  - [ ] Escolher provider (Stripe, Mercado Pago, etc.)
  - [ ] Implementar checkout
  - [ ] Webhook para atualizar status
  - [ ] Testar fluxo completo

- [ ] **Funcionalidades**
  - [ ] Histórico de pagamentos
  - [ ] Relatórios financeiros
  - [ ] Planos de assinatura
  - [ ] Faturas

- [ ] **RLS e Segurança**
  - [ ] Verificar RLS em `transactions`
  - [ ] Usuário vê apenas suas transações
  - [ ] Admin vê todas as transações

**Tempo Estimado:** 3-5 dias (depende da integração)

---

## 📋 **6. RESUMO E PRIORIDADES**

### **🔴 CRÍTICO (Fazer Primeiro)**
1. ✅ **Tabelas criadas** - JÁ FEITO HOJE
2. ⚠️ **RLS com bypass admin** - PRÓXIMO PASSO
3. ⚠️ **Fluxo clínico completo** - PRÓXIMO PASSO

### **🟡 ALTO (Fazer Depois)**
4. ⚠️ **Módulo de Ensino** - Cursos, aulas, gamificação
5. ⚠️ **Módulo de Pesquisa** - Fórum, MedCann Lab
6. ⚠️ **UX/UI Refinado** - Toasts, modais, loading

### **🟢 MÉDIO (Fazer Por Último)**
7. ⚠️ **Performance** - Otimizações, lazy loading
8. ⚠️ **Outras funcionalidades** - Notícias, wearables, financeiro

---

## ⏱️ **TEMPO TOTAL ESTIMADO**

- **Módulo de Ensino:** 8-12 horas
- **Módulo de Pesquisa:** 6-10 horas
- **UX/UI Refinado:** 8-12 horas
- **Performance:** 5-8 horas
- **Outras Funcionalidades:** 8-12 horas

**TOTAL:** 35-54 horas (4-7 dias de trabalho)

---

## ✅ **PRÓXIMOS PASSOS**

1. ✅ **Tabelas criadas** - FEITO HOJE
2. ⚠️ **Adicionar bypass admin em RLS** - PRÓXIMO
3. ⚠️ **Testar fluxo clínico completo** - DEPOIS
4. ⚠️ **Começar polimento de outras áreas** - DEPOIS

---

**Documento criado por:** Sistema de Checklist  
**Data:** 06/02/2026  
**Status:** ⚠️ Pendente
