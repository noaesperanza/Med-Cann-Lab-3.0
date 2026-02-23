# 🏥 PANORAMA COMPLETO - MEDCANLAB 3.0
## Data: 19 de Novembro de 2025 - 22:24
## Status: Sistema em Análise Completa

---

## 📋 **RESUMO EXECUTIVO**

O **MedCannLab 3.0** é uma plataforma médica completa e integrada para gestão clínica de Cannabis Medicinal, com sistema de IA residente (Nôa Esperança), avaliação clínica IMRE, chat em tempo real, gestão de pacientes, sistema educacional e administração completa.

---

## 🎯 **ARQUITETURA TÉCNICA**

### **Stack Tecnológico**
- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **IA**: Transformers.js (@xenova/transformers) + Integração OpenAI
- **Roteamento**: React Router DOM v6
- **Estado**: Zustand + Context API
- **Ícones**: Lucide React

### **Configuração do Servidor**
- **Porta**: 3000 (configurada)
- **Host**: true (acesso de rede habilitado)
- **Build Tool**: Vite 7.1.7
- **Node**: >=18.0.0

---

## 👥 **TIPOS DE USUÁRIOS E PERMISSÕES**

### **1. PACIENTES** (`paciente`)
**Dashboard Principal**: `/app/clinica/paciente/dashboard`

**Funcionalidades**:
- ✅ Dashboard personalizado com KPIs
- ✅ Avaliação Clínica IMRE (28 blocos clínicos)
- ✅ Chat com Nôa Esperança (IA multimodal)
- ✅ Chat direto com médico
- ✅ Agendamentos e agenda
- ✅ Relatórios clínicos
- ✅ Histórico de saúde
- ✅ Onboarding personalizado

**Rotas Principais**:
- `/app/clinica/paciente/dashboard`
- `/app/clinica/paciente/avaliacao-clinica`
- `/app/clinica/paciente/chat-profissional`
- `/app/clinica/paciente/agendamentos`
- `/app/patient-noa-chat`

### **2. PROFISSIONAIS DE SAÚDE** (`profissional`)
**Dashboard Principal**: `/app/clinica/profissional/dashboard`

**Funcionalidades**:
- ✅ Dashboard profissional com métricas
- ✅ Gestão avançada de pacientes
- ✅ Sistema de agendamentos
- ✅ Chat global entre profissionais
- ✅ Relatórios clínicos e análises
- ✅ Prescrições integrativas (5 racionalidades)
- ✅ Área de atendimento especializada
- ✅ Sistema financeiro profissional

**Rotas Principais**:
- `/app/clinica/profissional/dashboard`
- `/app/clinica/profissional/pacientes`
- `/app/clinica/profissional/agendamentos`
- `/app/clinica/profissional/chat-profissionais`
- `/app/professional-scheduling`
- `/app/professional-financial`

**Emails Especiais**:
- `eduardoscfaveret@gmail.com` → Dr. Eduardo Faveret (profissional)
- `rrvalenca@gmail.com` → Dr. Ricardo Valença (admin)
- `rrvlenca@gmail.com` → Dr. Ricardo Valença (admin)
- `profrvalenca@gmail.com` → Dr. Ricardo Valença (admin)

### **3. ESTUDANTES** (`aluno`)
**Dashboard Principal**: `/app/ensino/aluno/dashboard`

**Funcionalidades**:
- ✅ Dashboard estudante com progresso
- ✅ Cursos (Pós-graduação Cannabis 520h)
- ✅ Biblioteca educacional
- ✅ Sistema de gamificação
- ✅ Arte da Entrevista Clínica (AEC)
- ✅ Preparação de aulas
- ✅ Ranking e conquistas

**Rotas Principais**:
- `/app/ensino/aluno/dashboard`
- `/app/ensino/aluno/cursos`
- `/app/ensino/aluno/biblioteca`
- `/app/ensino/aluno/gamificacao`
- `/app/courses`
- `/app/arte-entrevista-clinica`

### **4. ADMINISTRADORES** (`admin`)
**Dashboard Principal**: `/app/admin`

**Funcionalidades**:
- ✅ Dashboard administrativo completo
- ✅ Gestão de usuários
- ✅ Gestão de cursos
- ✅ Sistema financeiro
- ✅ Analytics e métricas
- ✅ Moderação (chat e fórum)
- ✅ Upload de documentos
- ✅ Sistema renal especializado
- ✅ Unificação 3.0→5.0
- ✅ Configurações do sistema

**Rotas Principais**:
- `/app/admin` (wrapper com sub-rotas)
- `/app/admin/users`
- `/app/admin/courses`
- `/app/admin/analytics`
- `/app/admin/financial`
- `/app/admin/upload`
- `/app/admin/chat`
- `/app/admin/forum`

---

## 🤖 **SISTEMA NOA ESPERANÇA (IA RESIDENTE)**

### **Componentes Principais**
1. **NoaConversationalInterface** - Interface conversacional principal
2. **NoaAnimatedAvatar** - Avatar animado da Nôa
3. **NoaEsperancaAvatar** - Avatar com capacidades
4. **ChatAIResident** - Chat com IA residente
5. **ClinicalAssessmentChat** - Chat para avaliação clínica

### **Bibliotecas e Sistemas**
- `src/lib/noaResidentAI.ts` - Motor principal da IA
- `src/lib/noaEngine.ts` - Engine de processamento
- `src/lib/noaIntegration.ts` - Integração com plataforma
- `src/lib/noaTrainingSystem.ts` - Sistema de treinamento
- `src/lib/noaKnowledgeBase.ts` - Base de conhecimento
- `src/lib/noaCommandSystem.ts` - Sistema de comandos
- `src/lib/medcannlab/` - Integração com API MedCannLab

### **Capacidades da IA**
- ✅ Análise semântica avançada
- ✅ Detecção de intenções clínicas
- ✅ Processamento de contexto médico
- ✅ Memória persistente
- ✅ Análise emocional
- ✅ Diagnóstico assistido
- ✅ Suporte em Cannabis Medicinal
- ✅ Protocolo IMRE automatizado
- ✅ Multimodal (texto, voz, vídeo)

### **Integração com MedCannLab API**
- Endpoints consumidos:
  - `/platform/status` - Status da plataforma
  - `/training/context` - Contexto de treinamento
  - `/patients/simulations` - Simulações de pacientes
  - `/knowledge/library` - Biblioteca de conhecimento
- Autenticação via `X-API-Key`
- Sistema de auditoria integrado

---

## 📊 **SISTEMA IMRE (AVALIAÇÃO CLÍNICA)**

### **28 Blocos Clínicos**
1. Lista Indiciária
2. Desenvolvimento da Queixa
3. História Patológica Pregressa
4. História Familiar
5. História Social
6. Hábitos de Vida
7. Medicações Atuais
8. Alergias
9. Exame Físico
10-28. [Blocos adicionais do protocolo IMRE]

### **Componentes**
- `src/pages/ClinicalAssessment.tsx` - Página principal
- `src/components/ClinicalAssessmentChat.tsx` - Chat integrado
- `src/lib/unifiedAssessment.ts` - Avaliação unificada
- `src/lib/imreMigration.ts` - Migração IMRE
- `src/lib/clinicalAssessmentService.ts` - Serviço de avaliação
- `src/lib/clinicalReportService.ts` - Serviço de relatórios

### **Funcionalidades**
- ✅ Avaliação individualizada por paciente
- ✅ Geração automática de relatórios
- ✅ Protocolo IMRE automatizado
- ✅ Sistema de notificações
- ✅ Compartilhamento de relatórios
- ✅ Histórico completo

---

## 💬 **SISTEMA DE CHAT E COMUNICAÇÃO**

### **Tipos de Chat**
1. **Chat Global** (`/app/chat`)
   - Comunicação entre todos os usuários
   - Moderação automática
   - Tempo real via Supabase Realtime

2. **Chat Paciente-Médico** (`/app/clinica/paciente/chat-profissional`)
   - Comunicação direta e privada
   - Histórico persistente
   - Notificações

3. **Chat Profissionais** (`/app/clinica/profissional/chat-profissionais`)
   - Comunicação entre profissionais
   - Fórum de casos clínicos
   - Debates temáticos

4. **Chat Nôa Esperança** (`/app/patient-noa-chat`)
   - Chat com IA residente
   - Multimodal (texto, voz)
   - Contexto persistente

### **Componentes**
- `src/components/ProfessionalChatSystem.tsx`
- `src/pages/ChatGlobal.tsx`
- `src/pages/PatientChat.tsx`
- `src/pages/PatientDoctorChat.tsx`
- `src/pages/PatientNOAChat.tsx`
- `src/components/NOAChatBox.tsx`
- `src/hooks/useChatSystem.ts`

### **Tabelas do Banco**
- `chat_messages` - Mensagens do chat
- `chat_rooms` - Salas de chat
- `user_interactions` - Interações dos usuários

---

## 📚 **BIBLIOTECA E DOCUMENTOS**

### **Funcionalidades**
- ✅ Upload de documentos (PDF, imagens, vídeos)
- ✅ Chat IA com documentos
- ✅ Sistema RAG (Retrieval Augmented Generation)
- ✅ Análise semântica
- ✅ Busca inteligente
- ✅ Base de conhecimento

### **Componentes**
- `src/pages/Library.tsx`
- `src/pages/AIDocumentChat.tsx`
- `src/lib/ragSystem.ts`
- `src/services/semanticSearch.ts`
- `src/services/knowledgeBaseIntegration.ts`
- `src/services/noaKnowledgeBase.ts`

### **Tabelas do Banco**
- `documents` - Documentos da biblioteca
- `document_metadata` - Metadados
- `knowledge_base` - Base de conhecimento
- `noa_knowledge_documents` - Documentos da Nôa

---

## 🎓 **SISTEMA EDUCACIONAL**

### **Cursos Disponíveis**
1. **Pós-Graduação Cannabis** (520 horas)
2. **Arte da Entrevista Clínica (AEC)**
3. **Curso Eduardo Faveret**
4. **Jardins de Cura**

### **Funcionalidades**
- ✅ Sistema de progresso
- ✅ Gamificação (pontos, badges, ranking)
- ✅ Preparação de aulas
- ✅ Gestão de alunos
- ✅ Certificações

### **Componentes**
- `src/pages/Courses.tsx`
- `src/pages/CursoEduardoFaveret.tsx`
- `src/pages/ArteEntrevistaClinica.tsx`
- `src/pages/Gamificacao.tsx`
- `src/pages/LessonPreparation.tsx`
- `src/pages/GestaoAlunos.tsx`

---

## 🏥 **GESTÃO DE PACIENTES**

### **Funcionalidades**
- ✅ Lista completa de pacientes
- ✅ Perfil detalhado do paciente
- ✅ Histórico de saúde
- ✅ Relatórios clínicos
- ✅ Prescrições
- ✅ Agendamentos
- ✅ Onboarding de pacientes

### **Componentes**
- `src/pages/PatientsManagement.tsx`
- `src/pages/PatientManagementAdvanced.tsx`
- `src/pages/PatientProfile.tsx`
- `src/pages/NewPatientForm.tsx`
- `src/pages/PatientOnboarding.tsx`
- `src/components/PatientHealthHistory.tsx`
- `src/components/ClinicalReports.tsx`

---

## 📅 **SISTEMA DE AGENDAMENTOS**

### **Funcionalidades**
- ✅ Agendamento profissional
- ✅ Agenda do paciente
- ✅ Calendário interativo
- ✅ Notificações
- ✅ Exportação de agenda

### **Componentes**
- `src/pages/Scheduling.tsx`
- `src/pages/ProfessionalScheduling.tsx`
- `src/pages/PatientAppointments.tsx`
- `src/pages/PatientAgenda.tsx`
- `src/components/EduardoScheduling.tsx`

---

## 💰 **SISTEMA FINANCEIRO**

### **Funcionalidades**
- ✅ Planos de assinatura
- ✅ Checkout de pagamento
- ✅ Gestão financeira profissional
- ✅ Relatórios financeiros

### **Componentes**
- `src/pages/SubscriptionPlans.tsx`
- `src/pages/PaymentCheckout.tsx`
- `src/pages/ProfessionalFinancial.tsx`

---

## 🗄️ **BANCO DE DADOS (SUPABASE)**

### **Configuração**
- **URL**: `https://itdjkfubfzmvmuxxjoae.supabase.co`
- **Anon Key**: Configurada em `src/lib/supabase.ts`
- **RLS**: Row Level Security habilitado

### **Tabelas Principais**
- `users` / `profiles` - Usuários e perfis
- `chat_messages` - Mensagens
- `documents` - Documentos
- `imre_assessments` - Avaliações IMRE
- `clinical_reports` - Relatórios clínicos
- `appointments` - Agendamentos
- `courses` - Cursos
- `notifications` - Notificações
- `user_interactions` - Interações
- `moderator_requests` - Moderação

---

## 🔐 **AUTENTICAÇÃO E SEGURANÇA**

### **Sistema de Autenticação**
- Supabase Auth
- Tipos de usuário: `paciente`, `profissional`, `aluno`, `admin`
- Emails especiais com prioridade absoluta
- RLS (Row Level Security) para segurança de dados

### **Componentes**
- `src/contexts/AuthContext.tsx` - Contexto de autenticação
- `src/components/ProtectedRoute.tsx` - Rotas protegidas
- `src/lib/userTypes.ts` - Gerenciamento de tipos

---

## 🎨 **DESIGN SYSTEM**

### **Componentes de UI**
- Header dinâmico
- Sidebar colapsável
- Breadcrumbs
- Layout responsivo
- Mobile-first design

### **Estilos**
- Tailwind CSS
- Framer Motion (animações)
- Design system padronizado
- Tema escuro padrão
- Responsivo (mobile, tablet, desktop)

---

## 📁 **ESTRUTURA DE ARQUIVOS PRINCIPAIS**

```
src/
├── App.tsx                    # Rotas principais
├── main.tsx                   # Entry point
├── components/                # Componentes reutilizáveis
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── NoaConversationalInterface.tsx
│   └── ...
├── pages/                     # Páginas da aplicação
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── ClinicalAssessment.tsx
│   └── ...
├── contexts/                  # Contextos React
│   ├── AuthContext.tsx
│   ├── NoaContext.tsx
│   ├── RealtimeContext.tsx
│   └── ...
├── lib/                       # Bibliotecas e utilitários
│   ├── supabase.ts
│   ├── noaResidentAI.ts
│   ├── noaEngine.ts
│   ├── medcannlab/
│   └── ...
├── hooks/                     # Custom hooks
├── services/                  # Serviços
└── types/                     # TypeScript types
```

---

## 🚀 **STATUS ATUAL DO SISTEMA**

### ✅ **FUNCIONALIDADES OPERACIONAIS**
1. ✅ Autenticação e gestão de usuários
2. ✅ Dashboards por tipo de usuário
3. ✅ Sistema de chat (global, paciente-médico, profissionais)
4. ✅ Chat com Nôa Esperança (IA)
5. ✅ Avaliação clínica IMRE
6. ✅ Gestão de pacientes
7. ✅ Sistema de agendamentos
8. ✅ Biblioteca de documentos
9. ✅ Sistema educacional
10. ✅ Gamificação
11. ✅ Dashboard administrativo
12. ✅ Sistema financeiro
13. ✅ Relatórios clínicos

### 🔄 **EM DESENVOLVIMENTO/MELHORIAS**
1. Sistema RAG avançado
2. Analytics detalhados
3. Notificações push
4. Migração de dados 3.0→5.0
5. Integrações adicionais

---

## 📝 **OBSERVAÇÕES IMPORTANTES**

1. **Porta do Servidor**: Configurada para 3000
2. **Emails Especiais**: Têm prioridade absoluta sobre tabela `users`
3. **RLS**: Pode ter problemas de recursão infinita (já tratado com fallback)
4. **IA Nôa**: Integrada em todas as rotas protegidas
5. **Documentação**: Extensa documentação em arquivos `.md` na raiz

---

## 🎯 **PRÓXIMOS PASSOS SUGERIDOS**

1. Revisar e testar todas as funcionalidades
2. Verificar integrações com Supabase
3. Testar sistema de chat em tempo real
4. Validar sistema IMRE completo
5. Revisar políticas RLS
6. Testar sistema de pagamentos
7. Validar sistema de notificações
8. Revisar performance e otimizações

---

## 📞 **CONTATOS E SUPORTE**

- **Sistema**: MedCannLab 3.0
- **Versão**: 3.0.1
- **Data de Análise**: 19/11/2025 - 22:24
- **Status**: Sistema funcional e operacional

---

**🎉 Sistema completo e pronto para implementação de melhorias!**

