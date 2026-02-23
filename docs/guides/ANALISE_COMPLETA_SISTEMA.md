# 🔍 ANÁLISE COMPLETA DO SISTEMA - MedCannLab 3.0

## 📋 PROBLEMAS IDENTIFICADOS

### 1. BANNER AEC NO DASHBOARD DO DR. EDUARDO ❌
**Problema**: Banner "Arte da Entrevista Clínica" aparece como coordenador do Dr. Eduardo  
**Realidade**: 
- Dr. Eduardo coordena: **Pós-graduação Cannabis Medicinal**
- Dr. Ricardo coordena: **Arte da Entrevista Clínica** (AEC)
- AEC é metodologia/espinha dorsal, mas NÃO é curso do Dr. Eduardo

**Localização**: `src/pages/EduardoFaveretDashboard.tsx` linha 225-258

### 2. ORGANIZAÇÃO HEADER/SIDEBAR
**Problema**: Usuário quer reorganizar:
- Botões da sidebar → Header
- Tipos de usuário → Sidebar

**Estado Atual**:
- Header: Logo, menu de tipos de usuário (botões visíveis), perfil
- Sidebar: Seletor de eixos (Clínica/Ensino/Pesquisa), navegação por tipo, outros

**Objetivo**: 
- Header: Tipos de usuário (botões ou menu)
- Sidebar: Botões de navegação (eixos, funcionalidades)

### 3. PROBLEMAS BÁSICOS DE LOGIN/TIPO DE USUÁRIO
**Problemas históricos**:
- Tipos em inglês/português misturados
- Redirecionamentos hardcoded
- Nomes aparecendo como tipos
- Email especial não detectado corretamente

**Soluções aplicadas**:
- `userTypes.ts` centralizado
- Normalização de tipos
- AuthContext com prioridade de emails especiais
- UserViewContext para "view-as"

## 🎯 ARQUITETURA CORRETA

### CONSULTÓRIOS E RESPONSABILIDADES
**Dr. Ricardo Valença**:
- Admin da plataforma
- Coordenador: Cidade Amiga dos Rins (Pesquisa)
- Coordenador e Professor: Arte da Entrevista Clínica (Ensino)
- Dashboard: `/app/ricardo-valenca-dashboard`

**Dr. Eduardo Faveret**:
- Profissional
- Coordenador: Pós-graduação Cannabis Medicinal (Ensino)
- Dashboard: `/app/clinica/profissional/dashboard-eduardo`

### INTERCONEXÕES
- Cidade Amiga dos Rins ↔ Pós-graduação Cannabis (Função Renal)
- Arte da Entrevista Clínica ↔ Pós-graduação Cannabis (Anamnese)

### FLUXO AVALIAÇÃO CLÍNICA INICIAL
1. Paciente inicia avaliação
2. IA suspende decoder (sem devolutiva)
3. IA faz apenas perguntas pré-escritas
4. Ao final: IA realiza entendimento
5. Se paciente concordar → gera relatório
6. Relatório vai para dashboard do paciente
7. Sinal no dashboard do profissional

### TRÊS CAMADAS DE KPIs
**Administrativos**: Total Pacientes, Avaliações, Protocolos, Consultórios
**Semânticos**: Qualidade Escuta, Engajamento, Satisfação, Aderência
**Clínicos**: Wearables, Monitoramento, Episódios, Melhora

## 🔧 SISTEMA DE ROTAS
Formato: `/app/eixo/tipo/acao`

**Eixos**: clinica, ensino, pesquisa
**Tipos**: profissional, paciente, aluno, admin
**Ações**: dashboard, pacientes, agendamentos, etc.

## 📊 SISTEMA DE AUTENTICAÇÃO
**Emails Especiais** (prioridade absoluta):
- `iaianoaesperanza@gmail.com` → admin
- `rrvalenca@gmail.com` → admin  
- `eduardoscfaveret@gmail.com` → profissional
- `escutese@gmail.com` → paciente

**Tipos Normalizados**: Sempre em português (aluno, profissional, paciente, admin)

## 🚨 PROBLEMAS ESPECÍFICOS A CORRIGIR

1. **Banner AEC no Eduardo**: Remover ou transformar em referência à metodologia (não curso)
2. **Header/Sidebar**: Reorganizar conforme solicitação
3. **Login**: Garantir que funciona corretamente para todos os tipos
4. **View-as**: Garantir que admin pode ver como qualquer tipo

---
**Análise completa realizada. Próximo passo: Criar protótipos.**

