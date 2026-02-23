# 📋 PLANO DE ORGANIZAÇÃO FINAL - MEDCANLAB 3.0

## 🎯 BASEADO NA ARQUITETURA ATUAL

### **ARQUITETURA IDENTIFICADA:**
- React + Vite + TypeScript
- Supabase (Backend-as-a-Service)
- IA Residente: Nôa Esperança
- Protocolo IMRE para avaliações
- Múltiplos dashboards por tipo de usuário
- Eixos: Clínica, Ensino, Pesquisa
- Tipos: Paciente, Profissional, Aluno, Admin

---

## 🏗️ ESTRUTURA PROPOSTA

### **1. ESPINHA DORSAL: ARTE DA ENTREVISTA CLÍNICA (AEC)**
- **Metodologia central** que conecta todos os eixos
- **Integrada com Nôa Esperança** (IA residente)
- **Aplicada via protocolo IMRE**
- **Presente em todos os dashboards profissionais**

### **2. ORGANIZAÇÃO POR EIXOS**

#### **🏥 EIXO CLÍNICA**
**Rotas:**
- `/app/clinica/profissional/dashboard` - Dashboard profissional
- `/app/clinica/profissional/pacientes` - Gestão de pacientes
- `/app/clinica/profissional/agendamentos` - Agendamentos
- `/app/clinica/profissional/relatorios` - Relatórios clínicos
- `/app/clinica/profissional/chat-pacientes` - Chat com pacientes
- `/app/clinica/paciente/dashboard` - Dashboard paciente
- `/app/clinica/paciente/avaliacao-clinica` - Avaliação clínica
- `/app/clinica/paciente/relatorios` - Relatórios do paciente

**Funcionalidades:**
- Prontuário eletrônico
- Avaliações IMRE
- Protocolos de cannabis medicinal
- Monitoramento com wearables
- Relatórios automatizados pela IA

#### **🎓 EIXO ENSINO**
**Rotas:**
- `/app/ensino/profissional/dashboard` - Dashboard ensino
- `/app/ensino/profissional/arte-entrevista-clinica` - AEC
- `/app/ensino/profissional/preparacao-aulas` - Preparação de aulas
- `/app/ensino/profissional/gestao-alunos` - Gestão de alunos
- `/app/ensino/aluno/dashboard` - Dashboard aluno
- `/app/ensino/aluno/cursos` - Cursos disponíveis
- `/app/ensino/aluno/biblioteca` - Biblioteca
- `/app/ensino/aluno/gamificacao` - Gamificação

**Funcionalidades:**
- Cursos de cannabis medicinal
- Metodologia AEC para formação
- Gestão de alunos
- Biblioteca de conhecimento
- Sistema de gamificação

#### **🔬 EIXO PESQUISA**
**Rotas:**
- `/app/pesquisa/profissional/dashboard` - Dashboard pesquisa
- `/app/pesquisa/profissional/forum-casos` - Fórum de casos
- `/app/pesquisa/profissional/cidade-amiga-dos-rins` - Projeto Cidade Amiga
- `/app/pesquisa/profissional/medcann-lab` - MedCann Lab
- `/app/pesquisa/profissional/jardins-de-cura` - Jardins de Cura

**Funcionalidades:**
- Pesquisa AEC
- Publicações científicas
- Fórum de casos clínicos
- Projetos de pesquisa

---

### **3. DASHBOARDS POR TIPO DE USUÁRIO**

#### **👑 ADMIN** (`/app/ricardo-valenca-dashboard`)
**Funcionalidades:**
- Painel administrativo completo
- Gestão de usuários
- Acesso a todos os dados (bypass RLS)
- "View as" - ver como outros tipos de usuário
- Funcionalidades administrativas:
  - Gestão de usuários
  - Cursos
  - Financeiro
  - Chat Global + Moderação
  - Moderação Fórum
  - Ranking & Gamificação
  - Upload
  - Analytics
  - Sistema
  - Biblioteca
  - Chat IA Documentos

#### **👨‍⚕️ PROFISSIONAL**
**Dashboards específicos:**
- **Dr. Ricardo Valença**: `/app/ricardo-valenca-dashboard`
- **Dr. Eduardo Faveret**: `/app/clinica/profissional/dashboard-eduardo`
- **Genérico**: `/app/clinica/profissional/dashboard`

**Funcionalidades:**
- Gestão de pacientes
- Avaliações IMRE
- Relatórios clínicos
- Chat com pacientes
- Agendamentos
- Monitoramento com wearables
- Acesso à Arte da Entrevista Clínica
- KPIs (3 camadas)

#### **👤 PACIENTE** (`/app/clinica/paciente/dashboard`)
**Funcionalidades:**
- Visualização de seus próprios dados
- Avaliações clínicas
- Relatórios pessoais
- Chat com profissional
- Agendamentos
- Histórico clínico

#### **🎓 ALUNO** (`/app/ensino/aluno/dashboard`)
**Funcionalidades:**
- Cursos disponíveis
- Acesso à Arte da Entrevista Clínica
- Biblioteca
- Gamificação
- Certificações

---

### **4. TRÊS CAMADAS DE KPIs**

#### **📊 CAMADA ADMINISTRATIVA**
- Total de Pacientes
- Avaliações Completas
- Protocolos IMRE
- Respondedores TEZ

#### **🧠 CAMADA SEMÂNTICA**
- Qualidade da Escuta
- Engajamento do Paciente
- Satisfação Clínica
- Aderência ao Tratamento

#### **🏥 CAMADA CLÍNICA**
- Wearables Ativos
- Monitoramento 24h
- Episódios Epilepsia
- Melhora de Sintomas

---

### **5. INTEGRAÇÃO COM IA NÔA ESPERANÇA**

**Funcionalidades:**
- Memória persistente
- Relatórios clínicos automatizados
- Integração com protocolo IMRE
- Base de conhecimento consultável
- Chat integrado em todos os dashboards
- Auditoria de interações

---

## 📝 PERGUNTAS PARA ALINHAR:

1. **Arte da Entrevista Clínica:**
   - Deve aparecer como banner em TODOS os dashboards profissionais?
   - Ou apenas no eixo Ensino?
   - Como deve ser integrada com a IA Nôa?

2. **KPIs:**
   - Devem aparecer em TODOS os dashboards profissionais?
   - Ou apenas em dashboards específicos?
   - Como devem ser calculados?

3. **Dashboard Dr. Eduardo:**
   - Deve ter acesso a TODAS as funcionalidades do eixo Clínica?
   - Deve ter KPIs das 3 camadas?
   - Como deve ser organizado visualmente?

4. **Admin "View As":**
   - Quando admin clica para ver como profissional, deve ver o dashboard genérico ou específico?
   - Deve manter permissões de admin ou assumir permissões do tipo visualizado?

5. **Organização Visual:**
   - Qual a ordem de prioridade visual?
   - O que deve aparecer primeiro no dashboard?
   - Como organizar os cards e seções?

---

## 🎨 SUGESTÃO DE ESTRUTURA VISUAL

### **Dashboard Profissional (Dr. Eduardo):**
```
1. Banner Arte da Entrevista Clínica (destaque)
2. Três Camadas de KPIs (resumo)
3. Eixo Clínica (cards principais)
4. Eixo Ensino (cards)
5. Eixo Pesquisa (cards)
```

### **Dashboard Admin:**
```
1. Funcionalidades Administrativas (destaque)
2. Painel de Tipos de Usuários (3 cards)
3. System Info
4. Eixos (Clínica, Ensino, Pesquisa)
```

---

## ✅ PRÓXIMOS PASSOS

**Aguardando sua confirmação:**
1. A estrutura acima está correta?
2. O que precisa ser ajustado?
3. Quais perguntas posso responder para clarear?

**Depois de alinhados:**
1. Implementar a estrutura final
2. Garantir que todas as rotas funcionam
3. Testar integração completa
4. Validar design e UX

