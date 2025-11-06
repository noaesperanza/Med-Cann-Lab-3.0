# 🏗️ ESTRUTURA DA PLATAFORMA - MedCannLab 3.0

## 📋 VISÃO GERAL

**MedCannLab 3.0** é uma plataforma médica integrada baseada em:

- **3 Eixos**: Clínica, Ensino, Pesquisa
- **3 Tipos de Usuário**: Profissional, Paciente, Aluno (+ Admin)
- **3 Camadas de KPIs**: Administrativa, Semântica, Clínica
- **Espinha Dorsal**: Arte da Entrevista Clínica

---

## 🎯 EIXOS DA PLATAFORMA

### **1. EIXO CLÍNICA** (`/app/clinica/`)
Gestão de atendimento clínico, pacientes, agendamentos e relatórios.

### **2. EIXO ENSINO** (`/app/ensino/`)
Cursos, materiais educacionais, gestão de alunos e certificações.

### **3. EIXO PESQUISA** (`/app/pesquisa/`)
Projetos de pesquisa, fórum de casos, estudos e análises.

---

## 👥 TIPOS DE USUÁRIO

### **Profissional**
- Médicos, enfermeiros, profissionais da saúde
- Acesso: Clínica, Ensino, Pesquisa

### **Paciente**
- Pacientes em tratamento
- Acesso: Clínica (apenas)

### **Aluno**
- Estudantes dos cursos
- Acesso: Ensino, Pesquisa

### **Admin**
- Administradores da plataforma
- Acesso: Todos os eixos e tipos (+ view-as)

---

## 🏥 CONSULTÓRIOS

### **Dr. Ricardo Valença**
- **Cidade Amiga dos Rins** (Eixo Pesquisa)
- **Arte da Entrevista Clínica** (Eixo Ensino)
- Dashboard: `/app/ricardo-valenca-dashboard`

### **Dr. Eduardo Faveret**
- **Pós-graduação Cannabis Medicinal** (Eixo Ensino)
- Dashboard: `/app/eduardo-faveret-dashboard`

---

## 🔄 INTERCONEXÕES

1. **Cidade Amiga dos Rins ↔ Pós-graduação Cannabis**
   - Conexão: Função Renal
   - Eixo: Pesquisa ↔ Ensino

2. **Arte da Entrevista Clínica ↔ Pós-graduação Cannabis**
   - Conexão: Anamnese
   - Eixo: Ensino ↔ Ensino

---

## 🤖 IA RESIDENTE - NÔA ESPERANÇA

### **Avaliação Clínica Inicial:**
1. Suspender decoder
2. Apenas perguntas (pré-escritas)
3. Usar reasoning do assistant
4. Entendimento
5. Relatório (se usuário concordar)

### **Resultado:**
- **Camada Semântica**: Dado primário puro, coletado por IA

---

## 📊 TRÊS CAMADAS DE KPIs

### **1. Administrativa**
- Total de Pacientes
- Avaliações Completas
- Protocolos IMRE
- Respondedores TEZ

### **2. Semântica**
- Dado primário puro
- Qualidade da Escuta
- Engajamento
- Satisfação Clínica
- Aderência ao Tratamento

### **3. Clínica**
- 5 Racionalidades Médicas aplicadas
- Planejamento de cuidado
- Prescrições
- Wearables Ativos
- Monitoramento 24h

---

**Última atualização:** 2025-01-XX

