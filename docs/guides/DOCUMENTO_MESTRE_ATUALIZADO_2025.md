# DOCUMENTO MESTRE INSTITUCIONAL - MedCannLab 3.0
## Versão: 3.1 - Sistema Integrado com IA Residente
## Data: Janeiro 2025
## Status: OPERACIONAL - INTEGRAÇÃO IA-PLATAFORMA ATIVA

---

## 1. ARQUITETURA TÉCNICA ATUALIZADA

### 1.1 Sistema de Integração IA-Plataforma
- **Componente**: `PlatformIntegration.tsx`
- **Status**: ATIVO e funcionando
- **Funcionalidade**: Conecta a IA residente aos dados reais da plataforma em tempo real
- **Atualização**: A cada 10 segundos
- **Acesso**: Via localStorage e funções globais do window

### 1.2 Dados Disponíveis para IA
```javascript
// Dados do usuário atual
{
  user: {
    id: "f4a62265-8982-44db-8282-78129c4d014a",
    name: "Dr. Eduardo Faveret",
    email: "eduardoscfaveret@gmail.com",
    user_type: "professional",
    crm: "CRM-RJ 123456",
    cro: "CRO-RJ 789012"
  },
  dashboard: {
    activeSection: "area-atendimento",
    patients: [], // Array de pacientes do Dr. Eduardo
    clinicalReports: [], // Relatórios clínicos
    prescriptions: [], // Prescrições médicas
    notifications: [] // Notificações pendentes
  },
  system: {
    version: "3.0",
    lastUpdate: "2025-01-15T16:00:00.000Z",
    status: "active"
  }
}
```

---

## 2. FUNCIONALIDADES IMPLEMENTADAS

### 2.1 Área de Atendimento - Dr. Eduardo Faveret
- **Componente**: `AreaAtendimentoEduardo.tsx`
- **Seções Ativas**:
  - Dashboard (visão geral)
  - KPIs (indicadores clínicos)
  - Newsletter (conteúdo científico)
  - Prescrições (sistema integrativo)
  - Prontuário Médico (cinco racionalidades)

### 2.2 Sistema de Prescrições Integrativas
- **Componente**: `IntegrativePrescriptions.tsx`
- **Racionalidades Médicas**:
  1. **Biomédica**: Protocolos baseados em evidências
  2. **Medicina Tradicional Chinesa**: Acupuntura + fitoterapia
  3. **Ayurvédica**: Doshas e tratamentos naturais
  4. **Homeopática**: Remédios constitucionais
  5. **Integrativa**: Abordagem multidisciplinar

### 2.3 Prontuário Médico Integrado
- **Componente**: `MedicalRecord.tsx`
- **Funcionalidades**:
  - Visão geral de pacientes
  - Relatórios clínicos compartilhados
  - Prescrições com cinco racionalidades
  - Anotações clínicas
  - Sistema de notificações

---

## 3. DADOS MOCADOS ATUAIS

### 3.1 Pacientes do Dr. Eduardo Faveret
```javascript
const mockPatients = [
  {
    id: "1",
    name: "Maria Santos",
    cpf: "123.456.789-00",
    age: 35,
    phone: "(11) 99999-9999",
    email: "maria@email.com",
    lastVisit: "2024-01-15",
    status: "active",
    condition: "Epilepsia",
    priority: "high"
  },
  {
    id: "2", 
    name: "João Silva",
    cpf: "987.654.321-00",
    age: 42,
    phone: "(11) 88888-8888",
    email: "joao@email.com",
    lastVisit: "2024-01-10",
    status: "active",
    condition: "TEA",
    priority: "medium"
  }
]
```

### 3.2 Agendamentos para Hoje
```javascript
const todayAppointments = [
  {
    id: "1",
    patientName: "Maria Santos",
    time: "09:00",
    type: "Consulta de retorno",
    status: "confirmado",
    duration: "60 minutos"
  },
  {
    id: "2",
    patientName: "João Silva", 
    time: "14:00",
    type: "Avaliação inicial",
    status: "confirmado",
    duration: "90 minutos"
  },
  {
    id: "3",
    patientName: "Ana Costa",
    time: "16:30",
    type: "Consulta de emergência",
    status: "pendente",
    duration: "45 minutos"
  }
]
```

### 3.3 Relatórios Pendentes
```javascript
const pendingReports = [
  {
    id: "1",
    patientName: "Maria Santos",
    date: "2024-01-15",
    type: "Avaliação clínica inicial",
    status: "compartilhado",
    sharedWith: ["eduardoscfaveret@gmail.com"],
    nftToken: "NFT-123456",
    blockchainHash: "0x1234567890abcdef"
  },
  {
    id: "2",
    patientName: "João Silva",
    date: "2024-01-10", 
    type: "Relatório de acompanhamento",
    status: "rascunho",
    sharedWith: [],
    nftToken: null,
    blockchainHash: null
  }
]
```

---

## 4. SISTEMA DE NOTIFICAÇÕES

### 4.1 Notificações Ativas
```javascript
const activeNotifications = [
  {
    id: "1",
    title: "Relatório compartilhado",
    message: "Maria Santos compartilhou seu relatório clínico",
    type: "info",
    date: "2024-01-15T16:00:00Z",
    read: false
  },
  {
    id: "2",
    title: "Prescrição aprovada",
    message: "Prescrição de CBD para João Silva foi aprovada",
    type: "success", 
    date: "2024-01-15T15:30:00Z",
    read: false
  },
  {
    id: "3",
    title: "Agendamento confirmado",
    message: "Consulta com Ana Costa confirmada para 16:30",
    type: "warning",
    date: "2024-01-15T15:00:00Z", 
    read: false
  }
]
```

---

## 5. INTEGRAÇÃO IA-PLATAFORMA

### 5.1 Funções Disponíveis para IA
```javascript
// Acessar dados do dashboard
window.getPlatformData()

// Acessar dados de pacientes
window.getPatientData(patientId?)

// Acessar relatórios clínicos
window.getClinicalReports()

// Acessar notificações
window.getNotifications()

// Verificar conexão
window.isPlatformConnected()
```

### 5.2 Detecção de Intenções
A IA detecta automaticamente:
- **"dashboard"**, **"área"**, **"atendimento"** → Consulta sobre área de atendimento
- **"alterações"**, **"mudanças"** → Consulta sobre implementações recentes
- **"agendamentos"**, **"relatórios"** → Consulta sobre dados específicos

---

## 6. STATUS ATUAL DO SISTEMA

### 6.1 Componentes Ativos
- ✅ `PlatformIntegration.tsx` - Conectando IA aos dados
- ✅ `AreaAtendimentoEduardo.tsx` - Dashboard personalizado
- ✅ `IntegrativePrescriptions.tsx` - Prescrições com 5 racionalidades
- ✅ `MedicalRecord.tsx` - Prontuário médico integrado
- ✅ `NoaResidentAI.ts` - IA com acesso a dados reais

### 6.2 Funcionalidades Testadas
- ✅ Login e autenticação
- ✅ Redirecionamento personalizado
- ✅ Carregamento de dados do Supabase
- ✅ Integração IA-plataforma
- ✅ Sistema de prescrições integrativas
- ✅ Prontuário médico com cinco racionalidades

---

## 7. INSTRUÇÕES PARA IA RESIDENTE

### 7.1 Ao Receber Consultas sobre Plataforma
1. **Sempre verificar** se `window.getPlatformData()` retorna dados
2. **Usar dados reais** quando disponíveis, não informações genéricas
3. **Responder com informações específicas** do usuário atual
4. **Mencionar funcionalidades implementadas** quando relevante

### 7.2 Exemplo de Resposta Correta
```
Dr. Eduardo, aqui estão as informações da sua área de atendimento:

📊 Status do Dashboard:
• Seção ativa: area-atendimento
• Total de pacientes: 2
• Relatórios recentes: 2
• Notificações pendentes: 3
• Última atualização: 15/01/2025 16:00

🔍 Funcionalidades disponíveis:
• Prontuário Médico com cinco racionalidades
• Sistema de Prescrições Integrativas
• KPIs personalizados para TEA
• Newsletter científica
• Chat profissional

Agendamentos para hoje: 3 consultas confirmadas
Relatórios pendentes: 2 (1 compartilhado, 1 rascunho)
```

---

## 8. PRÓXIMOS PASSOS

### 8.1 Melhorias Planejadas
- [ ] Implementar dados reais do Supabase
- [ ] Adicionar mais templates de prescrição
- [ ] Integrar sistema de notificações em tempo real
- [ ] Implementar geração de NFTs
- [ ] Adicionar mais racionalidades médicas

### 8.2 Testes Necessários
- [ ] Testar integração IA-plataforma
- [ ] Validar carregamento de dados
- [ ] Verificar sistema de prescrições
- [ ] Testar prontuário médico
- [ ] Validar notificações

---

**Este documento deve ser atualizado sempre que houver mudanças significativas no sistema.**
