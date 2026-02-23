# 🏗️ ARQUITETURA COMPLETA - MEDCANLAB 3.0

## 🎯 VISÃO GERAL DO SISTEMA

### **CONSULTÓRIOS:**
1. **Dr. Eduardo Faveret**
   - Professor e coordenador da pós-graduação em Cannabis Medicinal
   - Curso específico do Dr. Eduardo
   - Produz pesquisa

2. **Dr. Ricardo Valença**
   - Coordenador do "Cidade Amiga dos Rins"
   - Coordenador e professor do curso "Arte da Entrevista Clínica"
   - Produz pesquisa
   - Interconexão: Cidade Amiga dos Rins ↔ Pós-graduação Cannabis (função renal)
   - Interconexão: Arte da Entrevista Clínica ↔ Pós-graduação Cannabis (anamnese)

### **COMUNICAÇÃO:**
- Consultórios se comunicam entre si
- Pacientes se comunicam com profissionais
- Profissionais se comunicam com pacientes
- Tudo pela plataforma
- LGPD garantida por blockchain da Escute-se

---

## 🔄 FLUXO DA AVALIAÇÃO CLÍNICA INICIAL

### **PASSO 1: Início**
- Usuário inicia avaliação clínica inicial
- IA suspende o decoder (não pode dar devolutiva)

### **PASSO 2: Perguntas**
- IA faz apenas perguntas pré-escritas no documento
- Usa reasoning do assistant
- Resguarda as palavras dos pacientes (sem interrupção)

### **PASSO 3: Entendimento**
- Ao final, IA realiza entendimento
- Apresenta ao usuário

### **PASSO 4: Relatório**
- Se usuário concordar → emite relatório
- Relatório vai para dashboard do paciente
- Sinal no dashboard do profissional que relatório foi preenchido

### **RESULTADO:**
- **Camada Semântica**: Dado primário puro, coletado por IA, sem interrupção, resguardando palavras dos pacientes

---

## 📊 TRÊS CAMADAS DE KPIs

### **1. CAMADA ADMINISTRATIVA**
- Total de Pacientes
- Avaliações Completas
- Protocolos IMRE
- Respondedores TEZ

### **2. CAMADA SEMÂNTICA**
- Dado primário puro
- Coletado por IA
- Sem interrupção
- Resguarda palavras dos pacientes
- **Gerado pela Avaliação Clínica Inicial**

### **3. CAMADA CLÍNICA**
- Aplica 5 racionalidades médicas sobre o dado primário
- Gera planejamento de cuidado
- Gera prescrições
- **Baseado na camada semântica**

---

## 🏥 INTERCONEXÃO DOS EIXOS

### **EIXO CLÍNICA:**
- Consultórios (Dr. Eduardo e Dr. Ricardo)
- Comunicação paciente-profissional
- Avaliações clínicas
- Relatórios

### **EIXO ENSINO:**
- Pós-graduação Cannabis Medicinal (Dr. Eduardo)
- Arte da Entrevista Clínica (Dr. Ricardo)
- **Interconexão**: Arte da Entrevista Clínica ↔ Pós-graduação Cannabis (anamnese)

### **EIXO PESQUISA:**
- Cidade Amiga dos Rins (Dr. Ricardo)
- Pesquisas dos consultórios
- **Interconexão**: Cidade Amiga dos Rins ↔ Pós-graduação Cannabis (função renal)

---

## 🤖 IA RESIDENTE (NÔA ESPERANÇA)

### **Funcionalidades:**
- Interage individualizadamente com cada usuário
- Treinada para escuta
- Na avaliação clínica inicial:
  - Suspende decoder
  - Apenas perguntas (sem devolutiva)
  - Usa reasoning do assistant
  - Ao final: entendimento → relatório

### **Integração:**
- Conectada a todos os eixos
- Conectada a todos os tipos de usuário
- Baseada em email e id

---

## 🔒 SEGURANÇA E LGPD

- Rotas protegidas por blockchain da Escute-se
- LGPD garantida
- Segurança em todas as comunicações
- Proteção de dados dos pacientes

---

## 📋 ESTRUTURA DE DASHBOARDS

### **Dr. Eduardo Faveret:**
- Dashboard principal do consultório
- Pós-graduação Cannabis Medicinal
- Pesquisa
- Comunicação com Dr. Ricardo
- Comunicação com pacientes

### **Dr. Ricardo Valença:**
- Dashboard principal do consultório
- Cidade Amiga dos Rins
- Arte da Entrevista Clínica
- Pesquisa
- Comunicação com Dr. Eduardo
- Comunicação com pacientes

### **Paciente:**
- Dashboard próprio
- Avaliação clínica inicial
- Relatórios
- Comunicação com profissionais

### **Aluno:**
- Dashboard próprio
- Cursos (Cannabis Medicinal, Arte da Entrevista Clínica)
- Pesquisa

---

## 🚀 PRÓXIMOS PASSOS

1. Criar estrutura de dashboards
2. Implementar comunicação entre consultórios
3. Implementar avaliação clínica inicial com IA
4. Implementar 3 camadas de KPIs
5. Integrar interconexões dos eixos
6. Garantir segurança e LGPD

