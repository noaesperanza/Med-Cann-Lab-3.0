# 🚀 SISTEMA DE ROTAS INDIVIDUALIZADAS - MedCannLab 3.0

## 📋 VISÃO GERAL

Sistema de rotas completamente individualizado baseado na estrutura:
- **3 Eixos**: Clínica, Ensino, Pesquisa
- **3 Tipos de Usuário**: Profissional, Paciente, Aluno
- **Rotas Específicas**: Cada combinação tem suas próprias rotas

## 🎯 ESTRUTURA DAS ROTAS

### Formato: `/app/eixo/tipo/acao`

```
/app/clinica/profissional/dashboard
/app/clinica/paciente/avaliacao-clinica
/app/ensino/aluno/cursos
/app/pesquisa/profissional/forum-casos
```

## 📊 ROTAS POR EIXO E TIPO

### 🏥 EIXO CLÍNICA

#### Profissional (`/app/clinica/profissional/`)
- **Dashboard**: `/dashboard` - Visão geral do atendimento
- **Pacientes**: `/pacientes` - Gestão de pacientes
- **Agendamentos**: `/agendamentos` - Consultas e horários
- **Relatórios**: `/relatorios` - Relatórios gerados pela IA
- **Chat**: `/chat-pacientes` - Comunicação com pacientes

#### Paciente (`/app/clinica/paciente/`)
- **Dashboard**: `/dashboard` - Meu dashboard de saúde
- **Avaliação**: `/avaliacao-clinica` - Avaliação com IA residente
- **Relatórios**: `/relatorios` - Meus relatórios clínicos
- **Agenda**: `/agenda` - Consultas e compromissos
- **Chat**: `/chat-profissional` - Chat com médico

### 🎓 EIXO ENSINO

#### Profissional (`/app/ensino/profissional/`)
- **Dashboard**: `/dashboard` - Gestão de cursos
- **Preparação**: `/preparacao-aulas` - Criar conteúdo didático
- **AEC**: `/arte-entrevista-clinica` - Metodologia AEC

#### Aluno (`/app/ensino/aluno/`)
- **Dashboard**: `/dashboard` - Acompanhamento acadêmico
- **Cursos**: `/cursos` - Cannabis Medicinal e AEC
- **Biblioteca**: `/biblioteca` - Materiais de estudo
- **Gamificação**: `/gamificacao` - Pontos e certificados

### 🔬 EIXO PESQUISA

#### Profissional (`/app/pesquisa/profissional/`)
- **Dashboard**: `/dashboard` - Gestão de projetos
- **Fórum**: `/forum-casos` - Discussão de casos

#### Aluno (`/app/pesquisa/aluno/`)
- **Dashboard**: `/dashboard` - Participação em projetos
- **Fórum**: `/forum-casos` - Discussão de casos

## 🔧 COMPONENTES IMPLEMENTADOS

### 1. `rotasIndividualizadas.ts`
- Configuração centralizada de todas as rotas
- Mapeamento por eixo e tipo de usuário
- Funções auxiliares para navegação

### 2. `RedirectIndividualizado.tsx`
- Redirecionamento inteligente baseado no tipo de usuário
- Rota padrão para cada tipo

### 3. `NavegacaoIndividualizada.tsx`
- Navegação contextual por eixo e tipo
- Breadcrumbs automáticos
- Seletor de eixo
- Menu de navegação específico

## 🚀 FUNCIONALIDADES

### ✅ Redirecionamento Automático
- Login → Rota específica do tipo de usuário
- Navegação contextual baseada no eixo

### ✅ Navegação Inteligente
- Breadcrumbs automáticos
- Menu específico por contexto
- Seletor de eixo visual

### ✅ Compatibilidade
- Rotas legadas mantidas
- Migração gradual possível

## 📝 EXEMPLOS DE USO

### Login de Paciente
```
1. Login como paciente
2. Redirecionamento para: /app/clinica/paciente/dashboard
3. Navegação mostra: Eixo Clínica > Paciente
4. Menu: Dashboard, Avaliação Clínica, Relatórios, Agenda, Chat
```

### Login de Profissional
```
1. Login como profissional
2. Redirecionamento para: /app/clinica/profissional/dashboard
3. Navegação mostra: Eixo Clínica > Profissional
4. Menu: Dashboard, Pacientes, Agendamentos, Relatórios, Chat
```

### Login de Aluno
```
1. Login como aluno
2. Redirecionamento para: /app/ensino/aluno/dashboard
3. Navegação mostra: Eixo Ensino > Aluno
4. Menu: Dashboard, Cursos, Biblioteca, Gamificação
```

## 🎯 BENEFÍCIOS

### ✅ Individualização Completa
- Cada usuário vê apenas suas funcionalidades
- Navegação contextual e intuitiva
- Experiência personalizada

### ✅ Organização Clara
- Estrutura lógica por eixo e tipo
- URLs semânticas e compreensíveis
- Fácil manutenção e expansão

### ✅ Segurança
- Rotas protegidas por tipo de usuário
- Acesso restrito a funcionalidades específicas
- Isolamento de contextos

## 🔄 MIGRAÇÃO

### Rotas Legadas Mantidas
- `/app/patient-dashboard` → `/app/clinica/paciente/dashboard`
- `/app/professional-dashboard` → `/app/clinica/profissional/dashboard`
- `/app/aluno-dashboard` → `/app/ensino/aluno/dashboard`

### Compatibilidade
- Links antigos continuam funcionando
- Migração gradual possível
- Sem quebra de funcionalidades

---

**🎉 Sistema de Rotas Individualizadas - MedCannLab 3.0**
**Estrutura: Eixo > Tipo > Ação - Completamente Personalizada**
