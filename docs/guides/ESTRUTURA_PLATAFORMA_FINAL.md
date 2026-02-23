# 🎯 ESTRUTURA FINAL DA PLATAFORMA MEDCANLAB 3.0

## 📋 VISÃO GERAL DA ORGANIZAÇÃO

### 🎭 ESPINHA DORSAL: ARTE DA ENTREVISTA CLÍNICA (AEC)
A Arte da Entrevista Clínica é a metodologia central que permeia todas as funcionalidades da plataforma.

---

## 🏗️ ESTRUTURA EM 3 NÍVEIS

### 1️⃣ **EIXOS** (3 principais)
- 🏥 **Clínica**: Atendimento, prontuários, pacientes
- 🎓 **Ensino**: Cursos, formação, capacitação
- 🔬 **Pesquisa**: Estudos, publicações, metodologia AEC

### 2️⃣ **TIPOS DE USUÁRIOS** (4 tipos)
- 👑 **Admin**: Acesso total, visualização como outros tipos
- 👨‍⚕️ **Profissional**: Médicos, enfermeiros, terapeutas
- 👤 **Paciente**: Usuários que recebem atendimento
- 🎓 **Aluno**: Estudantes em formação

### 3️⃣ **CAMADAS DE KPIs** (3 camadas)
- 📊 **Administrativos**: Total pacientes, protocolos IMRE, avaliações
- 🧠 **Semânticos**: Qualidade da escuta, engajamento, satisfação
- 🏥 **Clínicos**: Wearables, monitoramento 24h, melhora de sintomas

---

## 🗺️ MAPA DE NAVEGAÇÃO

### **DASHBOARD ADMIN** (`/app/ricardo-valenca-dashboard`)
Quando admin faz login:
1. **Primeiro**: Ver "Funcionalidades Administrativas"
2. **Segundo**: Ver "Painel de Tipos de Usuários" (3 cards)
3. **Terceiro**: Ver "Eixos" (Clínica, Ensino, Pesquisa)
4. **Header**: Botões para "ver como" cada tipo de usuário

### **DASHBOARD PROFISSIONAL - DR. EDUARDO** (`/app/clinica/profissional/dashboard-eduardo`)
Quando profissional faz login:
1. **Primeiro**: Banner "Arte da Entrevista Clínica" (destaque)
2. **Segundo**: Três Camadas de KPIs (Administrativos, Semânticos, Clínicos)
3. **Terceiro**: Eixo Clínica (9 cards funcionais)
4. **Quarto**: Eixo Ensino (cards)
5. **Quinto**: Eixo Pesquisa (cards)

### **DASHBOARD PROFISSIONAL - DR. RICARDO** (`/app/ricardo-valenca-dashboard`)
Mesma estrutura do Dr. Eduardo, mas com permissões de admin.

### **DASHBOARD PACIENTE** (`/app/clinica/paciente/dashboard`)
- Visualização simplificada
- Acesso a seus próprios dados
- Chat com profissional
- Relatórios pessoais

### **DASHBOARD ALUNO** (`/app/ensino/aluno/dashboard`)
- Cursos disponíveis
- Acesso à Arte da Entrevista Clínica
- Biblioteca
- Gamificação

---

## 📊 TRÊS CAMADAS DE KPIs DETALHADAS

### 📊 CAMADA ADMINISTRATIVA (Verde)
- Total de Pacientes
- Avaliações Completas
- Protocolos IMRE
- Respondedores TEZ

### 🧠 CAMADA SEMÂNTICA (Roxo)
- Qualidade da Escuta (%)
- Engajamento do Paciente (%)
- Satisfação Clínica (%)
- Aderência ao Tratamento (%)

### 🏥 CAMADA CLÍNICA (Azul)
- Wearables Ativos
- Monitoramento 24h
- Episódios Epilepsia
- Melhora de Sintomas

---

## 🎯 FUNCIONALIDADES POR EIXO

### 🏥 EIXO CLÍNICA
1. **Gestão de Pacientes** → `/app/clinica/profissional/pacientes`
2. **Agendamentos** → `/app/clinica/profissional/agendamentos`
3. **Arte da Entrevista Clínica** → `/app/ensino/profissional/arte-entrevista-clinica` ⭐
4. **KPIs TEA** → Seção interna
5. **Neurologia Pediátrica** → Seção interna
6. **Monitoramento Wearables** → Seção interna
7. **Agendamento Personalizado** → Seção interna
8. **Relatórios Clínicos** → `/app/clinica/profissional/relatorios`
9. **Chat com Pacientes** → `/app/clinica/profissional/chat-pacientes`

### 🎓 EIXO ENSINO
1. **Gestão de Ensino** → `/app/ensino/profissional/dashboard`
2. **Gestão de Cursos** → Seção interna
3. **Arte da Entrevista Clínica** → `/app/ensino/profissional/arte-entrevista-clinica` ⭐

### 🔬 EIXO PESQUISA
1. **Dashboard de Pesquisa** → `/app/pesquisa/profissional/dashboard`
2. **Pesquisa AEC** → Seção interna
3. **Publicações** → Seção interna

---

## 🔄 FUNCIONALIDADE "VIEW AS" (ADMIN)

Quando admin clica nos botões do header:
- **Admin**: Mostra dashboard administrativo completo
- **Profissional**: Mostra dashboard profissional (genérico ou específico)
- **Paciente**: Mostra dashboard paciente
- **Aluno**: Mostra dashboard aluno
- **Dr. Ricardo**: Mostra dashboard específico do Dr. Ricardo
- **Dr. Eduardo**: Mostra dashboard específico do Dr. Eduardo

**Como funciona:**
1. Admin clica no botão do header
2. `viewAsType` é atualizado no contexto
3. Dashboard redireciona para a rota correspondente
4. Admin mantém permissões administrativas
5. Visualização muda conforme o tipo selecionado

---

## 🎨 DESIGN SYSTEM

### **Cores Principais:**
- **Verde/Esmeralda**: Arte da Entrevista Clínica, Clínica
- **Roxo/Rosa**: KPIs Semânticos, Pesquisa
- **Azul/Ciano**: KPIs Clínicos, Ensino
- **Laranja/Amarelo**: Alertas, Importante

### **Componentes:**
- Cards com gradientes
- Hover effects (scale, shadow)
- Bordas arredondadas (rounded-xl)
- Espaçamento consistente (gap-4, p-6)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Estrutura Base:**
- [x] Arte da Entrevista Clínica como banner destaque
- [x] Três Camadas de KPIs organizadas
- [x] Eixos (Clínica, Ensino, Pesquisa) completos
- [x] Tipos de usuários funcionais
- [x] Header com botões de "view as"

### **Funcionalidades:**
- [x] Dashboard Admin
- [x] Dashboard Profissional (Dr. Eduardo)
- [x] Dashboard Profissional (Dr. Ricardo)
- [x] Dashboard Paciente
- [x] Dashboard Aluno
- [x] Navegação entre dashboards
- [x] Permissões por tipo de usuário

### **KPIs:**
- [x] Camada Administrativa
- [x] Camada Semântica
- [x] Camada Clínica

### **Rotas:**
- [x] Todas as rotas funcionais
- [x] Redirecionamentos corretos
- [x] Proteção de rotas

---

## 🚀 PRÓXIMOS PASSOS

1. **Testar cada dashboard individualmente**
2. **Verificar se todas as rotas estão funcionando**
3. **Testar funcionalidade "view as" do admin**
4. **Garantir que dados reais aparecem nos KPIs**
5. **Validar design em diferentes tamanhos de tela**

---

## 📝 NOTAS IMPORTANTES

- **Arte da Entrevista Clínica** deve aparecer em **DESTAQUE** em todos os dashboards profissionais
- **Três Camadas de KPIs** devem ser **sempre visíveis** no topo dos dashboards
- **Eixos** devem ser organizados de forma **clara e hierárquica**
- **Admin** deve poder **ver como** qualquer tipo de usuário
- **Design** deve seguir a **paleta de cores** da landing page

