# 🔄 REORGANIZAÇÃO COMPLETA - MEDCANLAB 3.0

## 🎯 OBJETIVO
Reorganizar a plataforma do zero, mantendo funcionalidades existentes, mas com estrutura clara e organizada baseada na visão geral.

---

## 📋 ESTRUTURA PROPOSTA

### **1. ESPINHA DORSAL: ARTE DA ENTREVISTA CLÍNICA (AEC)**
- Metodologia central que conecta todos os eixos
- Integrada com IA Nôa Esperança
- Aplicada via protocolo IMRE
- Presente em todos os dashboards profissionais

### **2. ORGANIZAÇÃO EM 3 EIXOS**

#### **🏥 EIXO CLÍNICA**
- **Profissional**: Dashboard, Pacientes, Agendamentos, Relatórios, Chat
- **Paciente**: Dashboard, Avaliação Clínica, Relatórios, Agenda, Chat

#### **🎓 EIXO ENSINO**
- **Profissional**: Dashboard, Arte da Entrevista Clínica, Preparação de Aulas, Gestão de Alunos
- **Aluno**: Dashboard, Cursos, Biblioteca, Gamificação

#### **🔬 EIXO PESQUISA**
- **Profissional**: Dashboard, Fórum de Casos, Projetos de Pesquisa
- **Aluno**: Dashboard, Participação em Projetos

### **3. TIPOS DE USUÁRIO**

#### **👑 ADMIN**
- Acesso total
- "View as" para ver como outros tipos
- Funcionalidades administrativas completas

#### **👨‍⚕️ PROFISSIONAL**
- Dashboards específicos (Dr. Ricardo, Dr. Eduardo, Genérico)
- Acesso a todos os eixos
- KPIs das 3 camadas

#### **👤 PACIENTE**
- Dashboard próprio
- Acesso limitado ao eixo Clínica
- Visualização de seus dados

#### **🎓 ALUNO**
- Dashboard próprio
- Acesso aos eixos Ensino e Pesquisa
- Cursos e formação

### **4. TRÊS CAMADAS DE KPIs**

#### **📊 ADMINISTRATIVOS**
- Total de Pacientes
- Avaliações Completas
- Protocolos IMRE
- Respondedores TEZ

#### **🧠 SEMÂNTICOS**
- Qualidade da Escuta
- Engajamento
- Satisfação Clínica
- Aderência ao Tratamento

#### **🏥 CLÍNICOS**
- Wearables Ativos
- Monitoramento 24h
- Episódios Epilepsia
- Melhora de Sintomas

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: ESTRUTURA BASE**
1. Criar estrutura de pastas organizada
2. Organizar componentes por eixo
3. Criar contextos centralizados
4. Configurar rotas limpas

### **FASE 2: DASHBOARDS**
1. Dashboard Admin (completo)
2. Dashboard Profissional (Dr. Eduardo)
3. Dashboard Profissional (Dr. Ricardo)
4. Dashboard Paciente
5. Dashboard Aluno

### **FASE 3: INTEGRAÇÕES**
1. IA Nôa Esperança
2. Protocolo IMRE
3. Base de conhecimento
4. Integração MedCannLab API

### **FASE 4: FUNCIONALIDADES**
1. Sistema de chat
2. Relatórios clínicos
3. Gestão de pacientes
4. Agendamentos

---

## 📁 ESTRUTURA DE PASTAS PROPOSTA

```
src/
├── components/
│   ├── eixos/
│   │   ├── clinica/
│   │   ├── ensino/
│   │   └── pesquisa/
│   ├── dashboards/
│   │   ├── AdminDashboard.tsx
│   │   ├── ProfessionalDashboard.tsx
│   │   ├── PatientDashboard.tsx
│   │   └── StudentDashboard.tsx
│   ├── kpis/
│   │   ├── AdministrativeKPIs.tsx
│   │   ├── SemanticKPIs.tsx
│   │   └── ClinicalKPIs.tsx
│   └── aec/
│       └── ArteEntrevistaClinica.tsx
├── pages/
│   ├── eixos/
│   │   ├── clinica/
│   │   ├── ensino/
│   │   └── pesquisa/
│   └── dashboards/
├── contexts/
│   ├── AuthContext.tsx
│   ├── NoaContext.tsx
│   ├── UserViewContext.tsx
│   └── EixoContext.tsx
├── lib/
│   ├── noa/
│   ├── imre/
│   ├── kpis/
│   └── medcannlab/
└── routes/
    └── AppRoutes.tsx
```

---

## ✅ PRÓXIMOS PASSOS

**Aguardando sua confirmação para iniciar a reorganização completa.**

