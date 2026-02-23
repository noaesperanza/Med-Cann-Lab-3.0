# 📅 RELATÓRIO DETALHADO - SISTEMA DE AGENDAMENTO
## MedCannLab 3.0

---

## 1. AGENDAMENTO DO PACIENTE

### Arquivos Analisados:
- `src/pages/PatientAppointments.tsx`
- `src/pages/Scheduling.tsx`

### Status: ✅ IMPLEMENTADO, ⚠️ COM LIMITAÇÕES

#### Funcionalidades:
- ✅ Calendário visual
- ✅ Seleção de data e horário
- ✅ Lista de agendamentos
- ✅ Busca no Supabase
- ✅ Criação de agendamentos

#### Problemas Encontrados:

**1. PatientAppointments.tsx:**
```typescript
// Linha 242-251: handleSaveAppointment tem TODO
const handleSaveAppointment = async () => {
  if (!appointmentData.date || !appointmentData.time || ...) {
    alert('Por favor, preencha todos os campos obrigatórios.')
    return
  }

  try {
    // TODO: Salvar agendamento no banco vinculado à avaliação clínica inicial pela IA residente
    // O agendamento será processado pela IA residente que realizará a avaliação clínica inicial
    // e gerará o relatório que será direcionado para o prontuário do paciente
```

**Problemas:**
- ❌ `handleSaveAppointment` não salva no Supabase
- ❌ TODO indica integração com IA que não está implementada
- ⚠️ Não há validação de horários disponíveis
- ⚠️ Não há verificação de conflitos

**2. Scheduling.tsx:**
```typescript
// Linha 159-205: handleBookAppointment salva no Supabase
const handleBookAppointment = async () => {
  // ... busca IDs
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: patientId,
      professional_id: professionalId,
      // ... dados do agendamento
    })
```

**Status:**
- ✅ Salva no Supabase corretamente
- ⚠️ Mas busca IDs de forma complexa
- ⚠️ Não há validação de horários

#### Solução Proposta:

```typescript
// Completar handleSaveAppointment em PatientAppointments.tsx
const handleSaveAppointment = async () => {
  if (!appointmentData.date || !appointmentData.time || !appointmentData.specialty) {
    alert('Por favor, preencha todos os campos obrigatórios.')
    return
  }

  try {
    // 1. Buscar profissional baseado na especialidade
    const { data: professionals } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('type', 'profissional')
      .ilike('specialty', `%${appointmentData.specialty}%`)
      .limit(1)
    
    if (!professionals || professionals.length === 0) {
      alert('Nenhum profissional disponível para esta especialidade.')
      return
    }
    
    const professional = professionals[0]
    
    // 2. Verificar disponibilidade do horário
    const appointmentDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`)
    const { data: conflicting } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', professional.id)
      .eq('appointment_date', appointmentDateTime.toISOString())
      .eq('status', 'scheduled')
      .maybeSingle()
    
    if (conflicting) {
      alert('Este horário já está ocupado. Por favor, escolha outro.')
      return
    }
    
    // 3. Salvar agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: user!.id,
        professional_id: professional.id,
        appointment_date: appointmentDateTime.toISOString(),
        appointment_time: appointmentData.time,
        appointment_type: appointmentData.service,
        specialty: appointmentData.specialty,
        status: 'scheduled',
        type: appointmentData.type === 'online' ? 'consultation' : 'in-person',
        is_remote: appointmentData.type === 'online',
        duration: appointmentData.duration || 60,
        notes: appointmentData.notes || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    // 4. Se houver avaliação clínica inicial pendente, vincular
    const { data: pendingAssessment } = await supabase
      .from('clinical_assessments')
      .select('id')
      .eq('patient_id', user!.id)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (pendingAssessment) {
      await supabase
        .from('clinical_assessments')
        .update({ 
          appointment_id: data.id,
          status: 'pending_appointment'
        })
        .eq('id', pendingAssessment.id)
    }
    
    alert('Agendamento realizado com sucesso!')
    setShowAppointmentModal(false)
    loadAppointments() // Recarregar lista
  } catch (error) {
    console.error('Erro ao agendar:', error)
    alert('Erro ao agendar consulta. Tente novamente.')
  }
}
```

---

## 2. AGENDA DOS PROFISSIONAIS

### Arquivos Analisados:
- `src/pages/ProfessionalScheduling.tsx`
- `src/components/EduardoScheduling.tsx`

### Status: ✅ IMPLEMENTADO, ⚠️ FALTA SALVAMENTO

#### Funcionalidades:
- ✅ Visualização em calendário e lista
- ✅ Analytics completos
- ✅ Busca de agendamentos
- ✅ Criação de agendamentos (mas não salva)

#### Problemas Encontrados:

**1. ProfessionalScheduling.tsx:**
```typescript
// Linha 260-296: handleSaveAppointment não salva no Supabase
const handleSaveAppointment = () => {
  const newAppointment = {
    id: appointments.length + 1, // ID local, não do banco
    patientId: parseInt(appointmentData.patientId),
    // ... dados do agendamento
    createdAt: new Date().toISOString().split('T')[0]
  }

  setAppointments([...appointments, newAppointment]) // Apenas local
  setShowAppointmentModal(false)
  // Não salva no Supabase!
}
```

**Problemas:**
- ❌ `handleSaveAppointment` não salva no Supabase
- ❌ Apenas atualiza estado local
- ⚠️ Não há validação de horários
- ⚠️ Não há verificação de conflitos

**2. loadData:**
```typescript
// Linha 74-150: loadData busca corretamente do Supabase
const loadData = async () => {
  // ... busca agendamentos
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .eq('professional_id', user.id)
    .order('appointment_date', { ascending: true })
  
  // ... formata e salva no estado
  setAppointments(formattedAppointments)
}
```

**Status:**
- ✅ Busca corretamente do Supabase
- ✅ Formata dados corretamente
- ✅ Calcula analytics

#### Solução Proposta:

```typescript
// Corrigir handleSaveAppointment
const handleSaveAppointment = async () => {
  if (!appointmentData.patientId || !appointmentData.date || !appointmentData.time) {
    alert('Preencha todos os campos obrigatórios.')
    return
  }

  try {
    // 1. Verificar disponibilidade
    const appointmentDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`)
    const { data: conflicting } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', user!.id)
      .eq('appointment_date', appointmentDateTime.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .maybeSingle()
    
    if (conflicting) {
      alert('Este horário já está ocupado.')
      return
    }
    
    // 2. Salvar no Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointmentData.patientId,
        professional_id: user!.id,
        appointment_date: appointmentDateTime.toISOString(),
        appointment_time: appointmentData.time,
        appointment_type: appointmentData.service,
        specialty: appointmentData.specialty,
        status: 'scheduled',
        type: appointmentData.type === 'online' ? 'consultation' : 'in-person',
        is_remote: appointmentData.type === 'online',
        duration: appointmentData.duration || 60,
        notes: appointmentData.notes || '',
        priority: appointmentData.priority || 'normal',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    // 3. Recarregar dados
    await loadData()
    
    // 4. Fechar modal e limpar formulário
    setShowAppointmentModal(false)
    setAppointmentData({
      patientId: '',
      patientName: '',
      date: '',
      time: '',
      type: 'presencial',
      specialty: '',
      service: '',
      room: '',
      notes: '',
      duration: 60,
      priority: 'normal'
    })
    
    alert('Agendamento criado com sucesso!')
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    alert('Erro ao criar agendamento. Tente novamente.')
  }
}
```

---

## 3. INTEGRAÇÃO COM AVALIAÇÃO CLÍNICA INICIAL

### Status: ❌ NÃO IMPLEMENTADO

#### Problemas:
- ⚠️ TODO em `PatientAppointments.tsx` indica integração necessária
- ❌ Não há vínculo automático entre agendamento e avaliação
- ❌ IA não é notificada de novos agendamentos
- ❌ Não há fluxo: Agendamento → Avaliação → Relatório

#### Solução Proposta:

```typescript
// Adicionar integração com avaliação clínica inicial
const handleSaveAppointment = async () => {
  // ... salvar agendamento (código anterior)
  
  // Se for primeira consulta do paciente, iniciar avaliação clínica inicial
  const { data: previousAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', user!.id)
    .eq('status', 'completed')
    .limit(1)
    .maybeSingle()
  
  if (!previousAppointments) {
    // Primeira consulta - iniciar avaliação clínica inicial
    const { data: assessment } = await supabase
      .from('clinical_assessments')
      .insert({
        patient_id: user!.id,
        professional_id: professional.id,
        appointment_id: data.id,
        assessment_type: 'INITIAL',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    // Notificar IA residente
    // (implementar notificação)
  }
}
```

---

## 📊 RESUMO DE CORREÇÕES NECESSÁRIAS

### Agendamento do Paciente:
1. [ ] Completar `handleSaveAppointment` em `PatientAppointments.tsx`
2. [ ] Adicionar validação de horários disponíveis
3. [ ] Integrar com avaliação clínica inicial
4. [ ] Adicionar notificações de confirmação

### Agenda dos Profissionais:
1. [ ] Corrigir `handleSaveAppointment` para salvar no Supabase
2. [ ] Adicionar validação de conflitos de horário
3. [ ] Implementar sistema de lembretes
4. [ ] Adicionar integração com pagamento

### Integração Geral:
1. [ ] Vincular agendamento com avaliação clínica inicial
2. [ ] Notificar IA residente de novos agendamentos
3. [ ] Criar fluxo completo: Agendamento → Avaliação → Relatório → Prontuário

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Verificar/criar tabela `appointments` no Supabase
- [ ] Implementar RLS policies para agendamentos
- [ ] Corrigir salvamento em `ProfessionalScheduling.tsx`
- [ ] Completar salvamento em `PatientAppointments.tsx`
- [ ] Adicionar validação de horários
- [ ] Implementar sistema de notificações
- [ ] Integrar com avaliação clínica inicial
- [ ] Adicionar lembretes automáticos
- [ ] Testar fluxo completo

