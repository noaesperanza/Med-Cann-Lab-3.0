# 📊 PANORAMA DETALHADO COMPLETO - MEDCANLAB 3.0

## 🎯 VISÃO GERAL DO PROJETO

O **MedCannLab 3.0** é uma plataforma médica completa e integrada para gestão clínica, ensino e pesquisa em Cannabis Medicinal. O sistema combina Inteligência Artificial (IA Residente Nôa Esperança), protocolo IMRE de avaliação clínica, comunicação em tempo real e gestão educacional.

**Status Atual**: Sistema funcional com funcionalidades avançadas implementadas e em desenvolvimento contínuo.

---

## 📁 ESTRUTURA DO PROJETO

### **Arquivos Principais**

#### **Documentação (197+ arquivos .md)**
- **Documentos Mestres**: 
  - `DOCUMENTO_MESTRE_ATUALIZADO_2025.md` - Documentação institucional completa
  - `PANORAMA_COMPLETO_MEDCANLAB.md` - Visão geral do sistema
  - `ARQUITETURA_COMPLETA_PLATAFORMA.md` - Arquitetura técnica
  - `MVP_MEDCANLAB_3.0.md` - Documentação do MVP

- **Guias e Tutoriais**: 100+ arquivos de guias, correções e instruções
- **Análises**: Documentos de análise de sistema, usuários, financeiro
- **Relatórios**: Relatórios detalhados de funcionalidades e avanços

#### **Scripts SQL (178+ arquivos)**
- **Setup e Configuração**: Scripts de criação de tabelas, políticas RLS
- **Correções**: Scripts de correção de erros e ajustes
- **Migrações**: Scripts de migração de dados e estrutura
- **Testes**: Scripts de verificação e diagnóstico

#### **Código Fonte**

**Frontend (React + TypeScript)**
- **59 Páginas** (`src/pages/`)
- **40+ Componentes** (`src/components/`)
- **6 Contextos** (`src/contexts/`)
- **5 Hooks Customizados** (`src/hooks/`)
- **30+ Bibliotecas/Serviços** (`src/lib/` e `src/services/`)

**Configuração**
- `package.json` - Dependências e scripts
- `vite.config.ts` - Configuração do Vite
- `tsconfig.json` - Configuração TypeScript
- `tailwind.config.js` - Configuração Tailwind CSS

---

## 🏗️ ARQUITETURA TÉCNICA

### **Stack Tecnológico**

#### **Frontend**
- **React 18.2.0** - Framework principal
- **TypeScript 5.2.2** - Tipagem estática
- **Vite 7.1.7** - Build tool e dev server (porta 3000)
- **Tailwind CSS 3.4.18** - Framework CSS
- **Framer Motion 12.23.22** - Animações
- **React Router DOM 6.30.1** - Roteamento
- **Zustand 5.0.8** - Gerenciamento de estado
- **Lucide React 0.548.0** - Ícones

#### **Backend e Banco de Dados**
- **Supabase** - Backend as a Service
  - PostgreSQL (banco de dados)
  - Autenticação
  - Storage (armazenamento de arquivos)
  - Realtime (atualizações em tempo real)
  - Row Level Security (RLS) para segurança

#### **Inteligência Artificial**
- **OpenAI Assistant API** - IA Residente Nôa Esperança
- **Transformers.js 2.17.2** - Modelos de IA locais
- **Xenova/Transformers** - Processamento NLP
- **Sistema RAG** - Recuperação de informações

#### **Outras Dependências**
- **PDF.js 5.4.394** - Processamento de PDFs
- **Class Variance Authority** - Variantes de componentes
- **CLSX** - Utilitário para classes CSS

---

## 👥 TIPOS DE USUÁRIOS E PERMISSÕES

### **1. Administradores (Admin)**
**Emails Especiais:**
- `rrvalenca@gmail.com`
- `rrvlenca@gmail.com`
- `profrvalenca@gmail.com`
- `iaianoaesperanza@gmail.com`

**Funcionalidades:**
- ✅ Dashboard administrativo completo
- ✅ Gestão de usuários (criação, edição, moderação)
- ✅ Gestão de cursos
- ✅ Sistema financeiro
- ✅ Moderação de chat global e fórum
- ✅ Analytics e métricas avançadas
- ✅ Upload de documentos
- ✅ Sistema renal especializado
- ✅ Unificação 3.0→5.0 (migração de dados)
- ✅ View-as (visualizar como outros tipos de usuário)

### **2. Profissionais de Saúde**
**Email Especial:**
- `eduardoscfaveret@gmail.com` (Dr. Eduardo Faveret)

**Funcionalidades:**
- ✅ Dashboard profissional personalizado
- ✅ Gestão de pacientes
- ✅ Sistema de agendamentos
- ✅ Avaliações clínicas (protocolo IMRE)
- ✅ Relatórios clínicos
- ✅ Chat com pacientes
- ✅ Chat global entre profissionais
- ✅ Fórum de casos clínicos
- ✅ Biblioteca médica
- ✅ Prescrições integrativas (5 racionalidades)

**Dashboards Específicos:**
- **Dr. Eduardo Faveret**: Dashboard com foco em Pós-graduação Cannabis
- **Dr. Ricardo Valença**: Dashboard com Cidade Amiga dos Rins e Arte da Entrevista Clínica

### **3. Pacientes**
**Emails Especiais:**
- `escutese@gmail.com`
- `escute-se@gmail.com`

**Funcionalidades:**
- ✅ Dashboard do paciente
- ✅ Avaliação clínica inicial com IA
- ✅ Visualização de relatórios clínicos
- ✅ Agendamentos
- ✅ Chat com NOA (IA Residente)
- ✅ Chat com profissionais
- ✅ Histórico médico
- ✅ KPIs de saúde

### **4. Estudantes/Alunos**
**Funcionalidades:**
- ✅ Dashboard do estudante
- ✅ Cursos (Pós-graduação Cannabis - 520h)
- ✅ Sistema de gamificação (pontos, ranking, badges)
- ✅ Biblioteca educacional
- ✅ Progresso de aprendizado
- ✅ Certificações

---

## 🎯 EIXOS DA PLATAFORMA

### **EIXO CLÍNICA**
**Rotas:**
- `/app/clinica/profissional/dashboard`
- `/app/clinica/profissional/pacientes`
- `/app/clinica/profissional/agendamentos`
- `/app/clinica/profissional/relatorios`
- `/app/clinica/profissional/chat-profissionais`
- `/app/clinica/paciente/dashboard`
- `/app/clinica/paciente/avaliacao-clinica`
- `/app/clinica/paciente/relatorios`
- `/app/clinica/paciente/agendamentos`
- `/app/clinica/paciente/chat-profissional`

**Funcionalidades:**
- Gestão de pacientes
- Prontuários médicos
- Agendamentos
- Avaliações clínicas IMRE
- Relatórios clínicos
- Comunicação paciente-profissional
- Prescrições integrativas

### **EIXO ENSINO**
**Rotas:**
- `/app/ensino/profissional/dashboard`
- `/app/ensino/profissional/preparacao-aulas`
- `/app/ensino/profissional/arte-entrevista-clinica`
- `/app/ensino/profissional/pos-graduacao-cannabis`
- `/app/ensino/profissional/gestao-alunos`
- `/app/ensino/aluno/dashboard`
- `/app/ensino/aluno/cursos`
- `/app/ensino/aluno/biblioteca`
- `/app/ensino/aluno/gamificacao`

**Cursos Disponíveis:**
- **Pós-graduação Cannabis Medicinal** (520 horas) - Dr. Eduardo Faveret
- **Arte da Entrevista Clínica** - Dr. Ricardo Valença
- **Jardins de Cura**

**Interconexões:**
- Arte da Entrevista Clínica ↔ Pós-graduação Cannabis (anamnese)

### **EIXO PESQUISA**
**Rotas:**
- `/app/pesquisa/profissional/dashboard`
- `/app/pesquisa/profissional/forum-casos`
- `/app/pesquisa/profissional/cidade-amiga-dos-rins`
- `/app/pesquisa/profissional/medcann-lab`
- `/app/pesquisa/profissional/jardins-de-cura`
- `/app/pesquisa/aluno/dashboard`
- `/app/pesquisa/aluno/forum-casos`

**Projetos:**
- **Cidade Amiga dos Rins** - Dr. Ricardo Valença
- **MedCann Lab** - Laboratório de pesquisa
- **Jardins de Cura** - Projeto de pesquisa

**Interconexões:**
- Cidade Amiga dos Rins ↔ Pós-graduação Cannabis (função renal)

---

## 🤖 SISTEMA DE IA RESIDENTE (NÔA ESPERANÇA)

### **Configuração**
- **OpenAI Assistant API** - Integração principal
- **Individualização por usuário** - Baseada em email e ID
- **Contexto persistente** - Memória de conversas
- **Acesso a dados da plataforma** - Integração com Supabase

### **Funcionalidades**

#### **1. Chat Multimodal**
- ✅ Texto
- ✅ Voz (microfone)
- ✅ Avatar animado
- ✅ Respostas empáticas
- ✅ Escuta ativa

#### **2. Avaliação Clínica Inicial**
**Fluxo Especial:**
1. IA suspende decoder (não pode dar devolutiva)
2. IA faz apenas perguntas pré-escritas
3. Usa reasoning do assistant
4. Resguarda palavras dos pacientes (sem interrupção)
5. Ao final: realiza entendimento
6. Apresenta entendimento ao usuário
7. Se concordar → emite relatório (camada semântica)
8. Relatório vai para dashboard do paciente
9. Sinal no dashboard do profissional

#### **3. Integração com Dados**
A IA tem acesso a:
- Dados do usuário atual
- Pacientes do profissional
- Avaliações clínicas
- Relatórios clínicos
- Documentos da base de conhecimento
- Histórico de interações
- Notificações

#### **4. Comandos Clínicos**
- "Nôa, qual é o status da plataforma agora?"
- "Mostre o contexto de treinamento recente focado em nefrologia."
- "Inicie a simulação clínica renal com abordagem IMRE completa."
- "Busque protocolos atualizados de cannabis medicinal para pacientes em diálise."

### **Arquivos Relacionados**
- `src/lib/noaResidentAI.ts` - Motor principal da IA
- `src/lib/noaEngine.ts` - Engine de processamento
- `src/lib/noaIntegration.ts` - Integração com plataforma
- `src/lib/noaKnowledgeBase.ts` - Base de conhecimento
- `src/lib/noaCommandSystem.ts` - Sistema de comandos
- `src/lib/noaPermissionManager.ts` - Gerenciamento de permissões
- `src/components/NoaConversationalInterface.tsx` - Interface conversacional
- `src/components/NoaAnimatedAvatar.tsx` - Avatar animado
- `src/hooks/useNOAChat.ts` - Hook para chat
- `src/contexts/NoaContext.tsx` - Contexto da IA

---

## 📊 SISTEMA IMRE (AVALIAÇÃO CLÍNICA)

### **Protocolo IMRE**
**IMRE = Investigação, Metodologia, Resultado, Evolução**

### **28 Blocos Clínicos**
1. Lista Indiciária (sintomas)
2. Desenvolvimento da Queixa
3. História Patológica
4. História Familiar
5. Hábitos de Vida
6. Medicações
7. Alergias
8. Exame Físico
9. Diagnóstico
10. E mais 19 blocos...

### **Fluxo de Avaliação**
1. **Início**: Usuário inicia avaliação clínica
2. **Perguntas**: IA faz perguntas pré-escritas
3. **Coleta**: Resguarda palavras dos pacientes
4. **Entendimento**: IA realiza análise
5. **Apresentação**: Mostra entendimento ao usuário
6. **Aprovação**: Usuário confirma ou ajusta
7. **Relatório**: Gera relatório clínico
8. **Armazenamento**: Salva no Supabase
9. **Notificação**: Alerta profissional

### **Três Camadas de KPIs**

#### **1. Camada Administrativa**
- Total de Pacientes
- Avaliações Completas
- Protocolos IMRE
- Respondedores TEZ

#### **2. Camada Semântica**
- Dado primário puro
- Coletado por IA
- Sem interrupção
- Resguarda palavras dos pacientes
- **Gerado pela Avaliação Clínica Inicial**

#### **3. Camada Clínica**
- Aplica 5 racionalidades médicas sobre o dado primário
- Gera planejamento de cuidado
- Gera prescrições
- **Baseado na camada semântica**

### **Arquivos Relacionados**
- `src/pages/ClinicalAssessment.tsx` - Página de avaliação
- `src/lib/imreMigration.ts` - Migração IMRE
- `src/lib/unifiedAssessment.ts` - Avaliação unificada
- `src/lib/clinicalAssessmentService.ts` - Serviço de avaliação
- `src/lib/clinicalReportService.ts` - Serviço de relatórios

---

## 💬 SISTEMA DE COMUNICAÇÃO

### **Chat Global**
- Comunicação entre todos os usuários
- Moderação automática
- Análise semântica de mensagens
- Sistema de canais
- Tempo real via Supabase Realtime

### **Chat Paciente-Profissional**
- Comunicação direta e privada
- Histórico de conversas
- Notificações
- Integração com prontuário

### **Chat Profissionais**
- Comunicação entre profissionais
- Fórum de casos clínicos
- Sala de debate
- Compartilhamento de conhecimento

### **Chat com NOA**
- Interface conversacional com IA
- Multimodal (texto, voz)
- Contexto persistente
- Acesso a dados da plataforma

### **Arquivos Relacionados**
- `src/pages/ChatGlobal.tsx` - Chat global
- `src/pages/PatientChat.tsx` - Chat do paciente
- `src/pages/PatientDoctorChat.tsx` - Chat paciente-médico
- `src/pages/ProfessionalChat.tsx` - Chat profissionais
- `src/pages/PatientNOAChat.tsx` - Chat com NOA
- `src/pages/ForumCasosClinicos.tsx` - Fórum de casos
- `src/pages/DebateRoom.tsx` - Sala de debate
- `src/hooks/useChatSystem.ts` - Hook de chat
- `src/contexts/RealtimeContext.tsx` - Contexto realtime

---

## 📚 BIBLIOTECA E DOCUMENTOS

### **Funcionalidades**
- ✅ Upload de documentos (PDFs, imagens, vídeos)
- ✅ Chat IA com documentos (RAG)
- ✅ Busca semântica
- ✅ Categorização automática
- ✅ Compartilhamento de documentos
- ✅ Base de conhecimento para IA

### **Recursos**
- **240+ Artigos Científicos**
- Documentos especializados em Cannabis Medicinal
- Protocolos clínicos
- Materiais educacionais
- Pesquisas e estudos

### **Sistema RAG (Retrieval-Augmented Generation)**
- Recuperação de informações relevantes
- Análise semântica de documentos
- Integração com IA Residente
- Busca inteligente

### **Arquivos Relacionados**
- `src/pages/Library.tsx` - Biblioteca
- `src/pages/AIDocumentChat.tsx` - Chat com documentos
- `src/lib/ragSystem.ts` - Sistema RAG
- `src/services/semanticSearch.ts` - Busca semântica
- `src/services/knowledgeBaseIntegration.ts` - Integração base conhecimento
- `src/services/criticalDocumentsManager.ts` - Gerenciador de documentos

---

## 🏆 SISTEMA DE GAMIFICAÇÃO

### **Funcionalidades**
- ✅ Sistema de pontos
- ✅ Ranking global
- ✅ Badges e conquistas
- ✅ Progresso de cursos
- ✅ Certificações
- ✅ Desafios e missões

### **Arquivos Relacionados**
- `src/pages/Gamificacao.tsx` - Página de gamificação

---

## 🎨 DESIGN E INTERFACE

### **Paleta de Cores**
```css
/* Cores Principais */
--primary-green: #00C16A
--dark-bg: rgba(15, 23, 42, 0.95) /* slate-900 */
--card-bg: rgba(255, 255, 255, 0.03)
--card-border: rgba(255, 255, 255, 0.1)
--text-primary: #FFFFFF
--text-secondary: #C8D6E5
--text-tertiary: #94A3B8

/* Gradientes */
--gradient-green: from-green-400 to-green-500
--gradient-blue: from-blue-500 to-cyan-500
--gradient-purple: from-purple-500 to-pink-500
```

### **Design System**
- **Dark Mode**: Tema escuro padrão
- **Responsivo**: Mobile-first
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Tipografia**: Sistema consistente

### **Componentes Principais**
- `Layout.tsx` - Layout principal
- `Header.tsx` - Cabeçalho com navegação
- `Sidebar.tsx` - Barra lateral
- `Breadcrumbs.tsx` - Navegação hierárquica
- `ProtectedRoute.tsx` - Rotas protegidas

---

## 🗄️ BANCO DE DADOS (SUPABASE)

### **Tabelas Principais**

#### **Core**
- `users` - Usuários do sistema
- `profiles` - Perfis de usuários
- `documents` - Biblioteca de documentos
- `chat_messages` - Mensagens do chat
- `chat_sessions` - Sessões de chat
- `channels` - Canais de chat

#### **Sistema Clínico**
- `clinical_assessments` - Avaliações clínicas
- `clinical_reports` - Relatórios clínicos
- `imre_assessments` - Avaliações IMRE
- `imre_semantic_blocks` - 37 blocos semânticos
- `imre_semantic_context` - Contexto semântico
- `patient_health_history` - Histórico de saúde
- `prescriptions` - Prescrições

#### **Sistema Educacional**
- `courses` - Cursos
- `course_enrollments` - Inscrições
- `lessons` - Aulas
- `progress` - Progresso de aprendizado

#### **Sistema de IA**
- `noa_interaction_logs` - Logs de interação NOA
- `noa_knowledge_base` - Base de conhecimento NOA
- `semantic_analysis` - Análise semântica
- `user_interactions` - Interações dos usuários

#### **Sistema de Moderação**
- `moderator_requests` - Solicitações de moderação
- `user_mutes` - Usuários silenciados

#### **Sistema Financeiro**
- `transactions` - Transações
- `subscriptions` - Assinaturas
- `payments` - Pagamentos

#### **Outras**
- `notifications` - Notificações
- `appointments` - Agendamentos
- `renal_monitoring` - Monitoramento renal

### **Row Level Security (RLS)**
Todas as tabelas têm RLS habilitado com políticas específicas:
- **Admin**: Acesso total
- **Profissional**: Acesso aos próprios pacientes
- **Paciente**: Acesso aos próprios dados
- **Aluno**: Acesso aos próprios cursos

### **Scripts SQL**
- **178+ arquivos SQL** para setup, correções, migrações e testes
- Scripts principais:
  - `SUPABASE_COMPLETE_SETUP.sql` - Setup completo
  - `CHAT_REALTIME_SETUP.sql` - Sistema de chat
  - `CREATE_ESSENTIAL_TABLES.sql` - Tabelas essenciais
  - `CREATE_NOTIFICATIONS_TABLE.sql` - Sistema de notificações
  - `CLINICAL_REPORTS_TABLES.sql` - Relatórios clínicos

---

## 🔐 SEGURANÇA E LGPD

### **Autenticação**
- Supabase Auth
- Email/password
- Row Level Security (RLS)
- Políticas de acesso por tipo de usuário

### **Proteção de Dados**
- LGPD compliant
- Blockchain da Escute-se (para rotas protegidas)
- Criptografia de dados sensíveis
- Auditoria de ações

### **Permissões**
- Sistema granular de permissões
- View-as para admins
- Compartilhamento controlado de relatórios
- Moderação de conteúdo

---

## 📱 PÁGINAS PRINCIPAIS (59 páginas)

### **Landing e Autenticação**
- `Landing.tsx` - Página inicial
- `Login.tsx` - Login
- `TermosLGPD.tsx` - Termos LGPD

### **Dashboards**
- `Dashboard.tsx` - Dashboard principal
- `AdminDashboard.tsx` - Dashboard admin
- `PatientDashboard.tsx` - Dashboard paciente
- `ProfessionalDashboard.tsx` - Dashboard profissional
- `AlunoDashboard.tsx` - Dashboard aluno
- `RicardoValencaDashboard.tsx` - Dashboard Dr. Ricardo
- `EduardoFaveretDashboard.tsx` - Dashboard Dr. Eduardo
- `ClinicaDashboard.tsx` - Dashboard clínica
- `EnsinoDashboard.tsx` - Dashboard ensino
- `PesquisaDashboard.tsx` - Dashboard pesquisa

### **Clínica**
- `ClinicalAssessment.tsx` - Avaliação clínica
- `Patients.tsx` - Lista de pacientes
- `PatientsManagement.tsx` - Gestão de pacientes
- `PatientManagementAdvanced.tsx` - Gestão avançada
- `NewPatientForm.tsx` - Novo paciente
- `PatientProfile.tsx` - Perfil do paciente
- `PatientOnboarding.tsx` - Onboarding paciente
- `PatientAgenda.tsx` - Agenda do paciente
- `PatientAppointments.tsx` - Agendamentos paciente
- `PatientKPIs.tsx` - KPIs do paciente
- `Scheduling.tsx` - Agendamentos
- `ProfessionalScheduling.tsx` - Agendamentos profissional
- `Prescriptions.tsx` - Prescrições
- `Reports.tsx` - Relatórios
- `Evaluations.tsx` - Avaliações

### **Comunicação**
- `ChatGlobal.tsx` - Chat global
- `PatientChat.tsx` - Chat paciente
- `PatientDoctorChat.tsx` - Chat paciente-médico
- `ProfessionalChat.tsx` - Chat profissional
- `PatientNOAChat.tsx` - Chat com NOA
- `ForumCasosClinicos.tsx` - Fórum de casos
- `DebateRoom.tsx` - Sala de debate

### **Educação**
- `Courses.tsx` - Cursos
- `StudyArea.tsx` - Área de estudo
- `CursoEduardoFaveret.tsx` - Curso Dr. Eduardo
- `CursoJardinsDeCura.tsx` - Curso Jardins de Cura
- `ArteEntrevistaClinica.tsx` - Arte da Entrevista Clínica
- `LessonPreparation.tsx` - Preparação de aulas
- `GestaoAlunos.tsx` - Gestão de alunos
- `Gamificacao.tsx` - Gamificação

### **Biblioteca e Documentos**
- `Library.tsx` - Biblioteca
- `AIDocumentChat.tsx` - Chat com documentos

### **Pesquisa**
- `MedCannLab.tsx` - MedCann Lab
- `MedCannLabStructure.tsx` - Estrutura MedCann Lab
- `CidadeAmigaDosRins.tsx` - Cidade Amiga dos Rins
- `JardinsDeCura.tsx` - Jardins de Cura

### **Administração**
- `AdminSettings.tsx` - Configurações admin
- `ProfessionalFinancial.tsx` - Financeiro profissional
- `SubscriptionPlans.tsx` - Planos de assinatura
- `PaymentCheckout.tsx` - Checkout de pagamento

### **Outras**
- `Profile.tsx` - Perfil do usuário
- `ExperienciaPaciente.tsx` - Experiência do paciente
- `TestPage.tsx` - Página de testes
- `NotFound.tsx` - Página 404

---

## 🔧 COMPONENTES PRINCIPAIS (40+ componentes)

### **Layout e Navegação**
- `Layout.tsx` - Layout principal
- `Header.tsx` - Cabeçalho
- `Sidebar.tsx` - Barra lateral
- `Breadcrumbs.tsx` - Breadcrumbs
- `NavegacaoIndividualizada.tsx` - Navegação individualizada
- `UserTypeNavigation.tsx` - Navegação por tipo
- `SmartDashboardRedirect.tsx` - Redirecionamento inteligente
- `RedirectIndividualizado.tsx` - Redirecionamento individualizado
- `EixoRotaRedirect.tsx` - Redirecionamento por eixo
- `EixoSelector.tsx` - Seletor de eixo
- `ProtectedRoute.tsx` - Rota protegida

### **IA e Chat**
- `NoaConversationalInterface.tsx` - Interface conversacional NOA
- `NOAChatBox.tsx` - Chat box NOA
- `ChatAIResident.tsx` - Chat IA residente
- `ClinicalAssessmentChat.tsx` - Chat avaliação clínica
- `NoaAnimatedAvatar.tsx` - Avatar animado NOA
- `NoaAvatar.tsx` - Avatar NOA
- `NoaEsperancaAvatar.tsx` - Avatar Nôa Esperança
- `MicrophoneButton.tsx` - Botão de microfone
- `MobileChatInput.tsx` - Input de chat mobile

### **Dashboards Específicos**
- `AreaAtendimentoEduardo.tsx` - Área atendimento Dr. Eduardo
- `AdminDashboardWrapper.tsx` - Wrapper dashboard admin
- `KPIDashboard.tsx` - Dashboard de KPIs
- `KPIClinicosPersonalizados.tsx` - KPIs clínicos personalizados

### **Clínica**
- `ClinicalReports.tsx` - Relatórios clínicos
- `MedicalRecord.tsx` - Prontuário médico
- `PatientHealthHistory.tsx` - Histórico de saúde
- `IntegrativePrescriptions.tsx` - Prescrições integrativas
- `QuickPrescriptions.tsx` - Prescrições rápidas
- `ShareAssessment.tsx` - Compartilhar avaliação
- `ShareReportModal.tsx` - Modal compartilhar relatório
- `ResponsibilityTransfer.tsx` - Transferência de responsabilidade
- `CoordenacaoMedica.tsx` - Coordenação médica
- `NeurologiaPediatrica.tsx` - Neurologia pediátrica

### **Agendamentos**
- `EduardoScheduling.tsx` - Agendamentos Dr. Eduardo

### **Educação**
- `GestaoCursos.tsx` - Gestão de cursos
- `SlidePlayer.tsx` - Player de slides

### **Documentos**
- `IntegratedDocuments.tsx` - Documentos integrados

### **Outros**
- `Newsletter.tsx` - Newsletter
- `VideoCall.tsx` - Videochamada
- `WearableMonitoring.tsx` - Monitoramento wearable
- `TestMonitoringDashboard.tsx` - Dashboard de monitoramento
- `MobileResponsiveWrapper.tsx` - Wrapper responsivo mobile
- `Footer.tsx` - Rodapé
- `LoginDebugPanel.tsx` - Painel debug login
- `UserTypeDebug.tsx` - Debug tipo de usuário
- `NoaCapabilities.tsx` - Capacidades NOA
- `NoaPermissions.tsx` - Permissões NOA

---

## 🎯 CONTEXTOS E ESTADO

### **Contextos React**
1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Autenticação
   - Usuário atual
   - Login/logout

2. **NoaContext** (`src/contexts/NoaContext.tsx`)
   - Estado da IA NOA
   - Conversas
   - Configurações

3. **NoaPlatformContext** (`src/contexts/NoaPlatformContext.tsx`)
   - Integração IA-plataforma
   - Dados da plataforma
   - Conexão

4. **RealtimeContext** (`src/contexts/RealtimeContext.tsx`)
   - Dados em tempo real
   - Subscriptions Supabase
   - Atualizações instantâneas

5. **ToastContext** (`src/contexts/ToastContext.tsx`)
   - Notificações toast
   - Mensagens de feedback

6. **UserViewContext** (`src/contexts/UserViewContext.tsx`)
   - View-as para admins
   - Tipo de visualização atual

---

## 🪝 HOOKS CUSTOMIZADOS

1. **useNOAChat** (`src/hooks/useNOAChat.ts`)
   - Hook para chat com NOA
   - Gerenciamento de mensagens
   - Estado do chat

2. **useChatSystem** (`src/hooks/useChatSystem.ts`)
   - Hook para sistema de chat
   - Mensagens em tempo real
   - Canais

3. **useDashboardData** (`src/hooks/useDashboardData.ts`)
   - Hook para dados do dashboard
   - Carregamento de dados
   - Atualizações

4. **useFinancialData** (`src/hooks/useFinancialData.ts`)
   - Hook para dados financeiros
   - Transações
   - Assinaturas

5. **useMedCannLabConversation** (`src/hooks/useMedCannLabConversation.ts`)
   - Hook para conversação MedCannLab
   - Integração com API externa

6. **useMicrophone** (`src/hooks/useMicrophone.ts`)
   - Hook para microfone
   - Gravação de áudio
   - Reconhecimento de voz

---

## 📦 BIBLIOTECAS E SERVIÇOS

### **Bibliotecas Principais** (`src/lib/`)

#### **IA e NOA**
- `noaResidentAI.ts` - Motor principal NOA
- `noaEngine.ts` - Engine de processamento
- `noaIntegration.ts` - Integração NOA
- `noaKnowledgeBase.ts` - Base de conhecimento
- `noaCommandSystem.ts` - Sistema de comandos
- `noaPermissionManager.ts` - Permissões NOA
- `noaAssistantIntegration.ts` - Integração Assistant API
- `noaEsperancaCore.ts` - Core Nôa Esperança
- `noaTrainingSystem.ts` - Sistema de treinamento

#### **Clínica**
- `clinicalAssessmentService.ts` - Serviço avaliação clínica
- `clinicalReportService.ts` - Serviço relatórios
- `unifiedAssessment.ts` - Avaliação unificada
- `imreMigration.ts` - Migração IMRE

#### **Sistema**
- `supabase.ts` - Cliente Supabase
- `ragSystem.ts` - Sistema RAG
- `localLLM.ts` - LLM local
- `transformersConfig.ts` - Configuração transformers
- `utils.ts` - Utilitários

#### **Plataforma**
- `platformFunctionsModule.ts` - Funções da plataforma
- `patientDashboardAPI.ts` - API dashboard paciente
- `schedulingConfig.ts` - Configuração agendamentos
- `rotasIndividualizadas.ts` - Rotas individualizadas
- `userTypes.ts` - Tipos de usuário
- `adminPermissions.ts` - Permissões admin

#### **MedCannLab API**
- `medcannlab/apiClient.ts` - Cliente API
- `medcannlab/apiKeyManager.ts` - Gerenciador de chaves
- `medcannlab/conversationalAgent.ts` - Agente conversacional
- `medcannlab/nlp.ts` - Processamento NLP
- `medcannlab/auditLogger.ts` - Logger de auditoria
- `medcannlab/errors.ts` - Tratamento de erros
- `medcannlab/types.ts` - Tipos TypeScript

#### **Outros**
- `filePermissionTransferSystem.ts` - Transferência de permissões
- `responsibilityTransferSystem.ts` - Transferência de responsabilidade
- `testMonitoringSystem.ts` - Sistema de monitoramento

### **Serviços** (`src/services/`)
- `semanticSearch.ts` - Busca semântica
- `knowledgeBaseIntegration.ts` - Integração base conhecimento
- `criticalDocumentsManager.ts` - Gerenciador documentos críticos
- `noaKnowledgeBase.ts` - Base conhecimento NOA

---

## 🚀 SCRIPTS E COMANDOS

### **Desenvolvimento**
```bash
npm run dev          # Servidor de desenvolvimento (porta 3000)
npm run build        # Build de produção
npm run preview      # Preview da build
npm run lint         # Linting do código
npm run lint:fix     # Corrigir erros de lint
npm run type-check   # Verificação de tipos TypeScript
npm test             # Executar testes
npm run test:watch   # Testes em modo watch
```

### **Banco de Dados**
- **178+ scripts SQL** para configuração, correções e migrações
- Executar no SQL Editor do Supabase
- Scripts principais em ordem:
  1. `SUPABASE_COMPLETE_SETUP.sql` - Setup completo
  2. `CREATE_ESSENTIAL_TABLES.sql` - Tabelas essenciais
  3. `CHAT_REALTIME_SETUP.sql` - Sistema de chat
  4. `CREATE_NOTIFICATIONS_TABLE.sql` - Notificações
  5. Scripts de correção conforme necessário

---

## 📊 MÉTRICAS E ESTATÍSTICAS

### **Código**
- **59 Páginas** React
- **40+ Componentes** React
- **6 Contextos** React
- **5 Hooks** customizados
- **30+ Bibliotecas/Serviços**
- **178+ Scripts SQL**
- **197+ Documentos** Markdown

### **Funcionalidades**
- ✅ Sistema de autenticação completo
- ✅ 4 tipos de usuários com permissões granulares
- ✅ 3 eixos (Clínica, Ensino, Pesquisa)
- ✅ IA Residente multimodal
- ✅ Sistema IMRE de avaliação clínica
- ✅ Chat em tempo real
- ✅ Biblioteca com RAG
- ✅ Sistema de gamificação
- ✅ Gestão financeira
- ✅ Sistema de agendamentos
- ✅ Relatórios clínicos automatizados

---

## 🔄 FLUXOS PRINCIPAIS

### **1. Fluxo de Login**
1. Usuário acessa `/`
2. Redirecionado para `/app` se autenticado
3. `SmartDashboardRedirect` verifica tipo de usuário
4. Redireciona para dashboard apropriado
5. IA Residente é inicializada

### **2. Fluxo de Avaliação Clínica**
1. Paciente acessa `/app/clinica/paciente/avaliacao-clinica`
2. Inicia avaliação clínica inicial
3. IA NOA suspende decoder
4. IA faz perguntas pré-escritas
5. Paciente responde (palavras resguardadas)
6. IA realiza entendimento
7. Apresenta entendimento ao paciente
8. Paciente confirma ou ajusta
9. Gera relatório (camada semântica)
10. Relatório vai para dashboard do paciente
11. Notificação no dashboard do profissional

### **3. Fluxo de Chat com NOA**
1. Usuário acessa interface conversacional
2. NOA é inicializada com contexto do usuário
3. Usuário envia mensagem (texto ou voz)
4. NOA processa com acesso a dados da plataforma
5. NOA responde com contexto relevante
6. Conversa é salva no histórico
7. Contexto é mantido para próximas interações

### **4. Fluxo de Prescrição Integrativa**
1. Profissional acessa paciente
2. Visualiza avaliação clínica (camada semântica)
3. Aplica 5 racionalidades médicas:
   - Biomédica
   - Medicina Tradicional Chinesa
   - Ayurvédica
   - Homeopática
   - Integrativa
4. Gera planejamento de cuidado
5. Cria prescrições
6. Salva no prontuário
7. Notifica paciente

---

## 🎓 CURSOS E EDUCAÇÃO

### **Cursos Disponíveis**

#### **1. Pós-graduação Cannabis Medicinal**
- **Professor**: Dr. Eduardo Faveret
- **Carga Horária**: 520 horas
- **Conteúdo**: Cannabis medicinal, protocolos, evidências

#### **2. Arte da Entrevista Clínica**
- **Professor**: Dr. Ricardo Valença
- **Conteúdo**: Metodologia AEC, anamnese, entrevista clínica
- **Interconexão**: Pós-graduação Cannabis (anamnese)

#### **3. Jardins de Cura**
- **Conteúdo**: Projeto de pesquisa e educação

### **Sistema de Gamificação**
- Pontos por atividades
- Ranking global
- Badges e conquistas
- Progresso visual
- Certificações

---

## 🔬 PROJETOS DE PESQUISA

### **1. Cidade Amiga dos Rins**
- **Coordenador**: Dr. Ricardo Valença
- **Foco**: Função renal, nefrologia
- **Interconexão**: Pós-graduação Cannabis (função renal)

### **2. MedCann Lab**
- **Foco**: Laboratório de pesquisa em Cannabis Medicinal
- **Recursos**: Análises, estudos, publicações

### **3. Jardins de Cura**
- **Foco**: Pesquisa e educação integrativa

---

## 📈 STATUS ATUAL DO SISTEMA

### ✅ **FUNCIONALIDADES 100% OPERACIONAIS**
1. ✅ Autenticação e sistema de usuários
2. ✅ Dashboards por tipo de usuário
3. ✅ Chat global e tempo real
4. ✅ Sistema IMRE de avaliação
5. ✅ Biblioteca de documentos
6. ✅ Dashboard administrativo
7. ✅ Sistema de moderação
8. ✅ Integração NOA básica
9. ✅ Sistema de agendamentos
10. ✅ Relatórios clínicos

### 🔄 **EM DESENVOLVIMENTO**
1. 🔄 Sistema RAG avançado
2. 🔄 Analytics detalhados
3. 🔄 Gamificação completa
4. 🔄 Sistema de notificações em tempo real
5. 🔄 Migração de dados completa
6. 🔄 Integração completa IA-plataforma
7. 🔄 Sistema financeiro completo

### 🎯 **PRÓXIMOS PASSOS**
1. Finalizar integração IA-plataforma
2. Implementar analytics avançados
3. Completar sistema de gamificação
4. Melhorar sistema de notificações
5. Otimizar performance
6. Expandir base de conhecimento
7. Adicionar mais funcionalidades administrativas

---

## 🔐 CONFIGURAÇÃO E DEPLOY

### **Variáveis de Ambiente Necessárias**

```env
# Supabase
VITE_SUPABASE_URL=https://itdjkfubfzmvmuxxjoae.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (IA Residente)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_ASSISTANT_ID=asst_...

# MedCannLab API (opcional)
VITE_MEDCANNLAB_API_URL=https://api.medcannlab.com
VITE_MEDCANNLAB_API_KEY=...
```

### **Deploy**
- **Frontend**: Vercel (recomendado) ou similar
- **Backend**: Supabase (já configurado)
- **Porta**: 3000 (desenvolvimento)

---

## 📞 SUPORTE E DOCUMENTAÇÃO

### **Documentação Disponível**
- **197+ arquivos Markdown** com documentação detalhada
- Guias de configuração
- Tutoriais de uso
- Documentação técnica
- Análises e relatórios

### **Principais Documentos**
- `README.md` - Visão geral
- `DOCUMENTO_MESTRE_ATUALIZADO_2025.md` - Documentação institucional
- `PANORAMA_COMPLETO_MEDCANLAB.md` - Panorama do sistema
- `ARQUITETURA_COMPLETA_PLATAFORMA.md` - Arquitetura técnica
- `MVP_MEDCANLAB_3.0.md` - Documentação MVP

---

## 🎉 CONCLUSÃO

O **MedCannLab 3.0** é uma plataforma médica completa e inovadora que integra:

- 🤖 **Inteligência Artificial** (NOA multimodal)
- 📊 **Avaliação Clínica** (Sistema IMRE)
- 💬 **Comunicação** (Chat em tempo real)
- 📚 **Educação** (Cursos e biblioteca)
- 🏆 **Gamificação** (Sistema de progresso)
- 👑 **Administração** (Controle total)
- 🔬 **Pesquisa** (Projetos e estudos)

**Status**: Sistema funcional com funcionalidades avançadas implementadas e em desenvolvimento contínuo.

**Próximo Passo**: Finalizar integrações pendentes e expandir funcionalidades.

---

**Versão**: 3.0  
**Data**: Janeiro 2025  
**Última Atualização**: Panorama completo do sistema

