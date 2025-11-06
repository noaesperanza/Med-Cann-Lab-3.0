# 📋 BACKUP: Configurações de Voz e Funcionalidades

## 🎤 CONFIGURAÇÕES DE VOZ (useMedCannLabConversation.ts)

### Ritmo (Rate)
```typescript
utterance.rate = 1.15 // Andante (mais rápido que o anterior 0.94)
```

### Volume
```typescript
utterance.volume = 0.93
```

### Tom de Voz (Pitch) e Seleção de Voz
```typescript
const voices = voicesRef.current
if (voices && voices.length > 0) {
  const preferred = voices.filter(voice => voice.lang && voice.lang.toLowerCase() === 'pt-br')
  // Priorizar voz contralto (mais grave) para Nôa Esperanza - evitar vozes soprano
  const contralto = preferred.find(voice => /contralto|grave|baixa|low|alto/i.test(voice.name))
  const victoria = preferred.find(voice => /vit[oó]ria/i.test(voice.name))
  // Evitar vozes soprano (agudas)
  const nonSoprano = preferred.filter(voice => !/soprano|aguda|high|tenor/i.test(voice.name))
  const fallback = nonSoprano.find(voice => /bia|camila|carol|helo[ií]sa|brasil|female|feminina/i.test(voice.name))
  // Usar contralto primeiro, depois victoria, depois fallback não-soprano
  const selectedVoice = contralto || victoria || fallback || nonSoprano[0] || preferred[0] || voices[0]
  if (selectedVoice) {
    utterance.voice = selectedVoice
    // Ajustar pitch para voz mais grave (contralto) - evitar soprano
    if (contralto) {
      utterance.pitch = 0.65 // Mais grave (contralto)
    } else if (victoria) {
      utterance.pitch = 0.75 // Ligeiramente mais grave
    } else {
      utterance.pitch = 0.78 // Padrão (evitar soprano)
    }
  } else {
    utterance.pitch = 0.78 // Padrão se não encontrar voz
  }
} else {
  utterance.pitch = 0.78 // Padrão se não houver vozes
}
```

## 🎙️ BOTÃO DE GRAVAÇÃO DE CONSULTA

### Estados (NoaConversationalInterface.tsx)
```typescript
const [isRecordingConsultation, setIsRecordingConsultation] = useState(false)
const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
const [consultationTranscript, setConsultationTranscript] = useState<string[]>([])
const [consultationStartTime, setConsultationStartTime] = useState<Date | null>(null)
const [showPatientSelector, setShowPatientSelector] = useState(false)
const [availablePatients, setAvailablePatients] = useState<any[]>([])
const [isSavingConsultation, setIsSavingConsultation] = useState(false)
const consultationRecognitionRef = useRef<any>(null) // Para gravação de consulta
```

### Funções Principais
- `handleStartConsultationRecording`: Inicia gravação de consulta
- `handleStopConsultationRecording`: Para e salva gravação de consulta
- `loadPatients`: Carrega lista de pacientes para seleção

### Localização no Código
- Arquivo: `src/components/NoaConversationalInterface.tsx`
- Linhas aproximadas: 421-589

## 🗣️ PERMISSÕES PARA AGENDAMENTO E REGISTRO DE PACIENTES POR VOZ

### Intents Adicionados (platformFunctionsModule.ts)
```typescript
type: 'APPOINTMENT_CREATE' | 'PATIENT_CREATE'
```

### Detecção de Intents
```typescript
// Agendamento
if (lowerMessage.includes('agendar') || 
    lowerMessage.includes('marcar consulta') ||
    lowerMessage.includes('agendamento')) {
  return {
    type: 'APPOINTMENT_CREATE',
    confidence: 0.9,
    metadata: { userId }
  }
}

// Registro de Paciente
if (lowerMessage.includes('novo paciente') ||
    lowerMessage.includes('cadastrar paciente') ||
    lowerMessage.includes('registrar paciente')) {
  return {
    type: 'PATIENT_CREATE',
    confidence: 0.9,
    metadata: { userId }
  }
}
```

### Funções de Execução
- `createAppointment`: Retorna `requiresData: true` com campos necessários
- `createPatient`: Retorna `requiresData: true` com campos necessários
- `saveAppointmentFromVoice`: Salva agendamento no Supabase
- `savePatientFromVoice`: Salva paciente no Supabase

### Localização no Código
- Arquivo: `src/lib/platformFunctionsModule.ts`
- Funções: `saveAppointmentFromVoice` (linha ~752), `savePatientFromVoice` (linha ~829)

## 📝 NOTAS IMPORTANTES

1. **Voz**: Configuração prioriza vozes contralto (graves) e evita soprano (agudas)
2. **Ritmo**: 1.15 (andante) - mais rápido que o anterior 0.94
3. **Gravação de Consulta**: Funcionalidade completa com seleção de paciente e salvamento
4. **Comandos de Voz**: Agendamento e registro de pacientes funcionais via voz

## 📦 CÓDIGO COMPLETO PARA RESTAURAÇÃO

### 1. Função loadPatients (NoaConversationalInterface.tsx)
```typescript
const loadPatients = useCallback(async () => {
  if (!user) return

  try {
    const userType = normalizeUserType(user.type)
    if (userType !== 'profissional' && userType !== 'admin') return

    // Buscar pacientes do profissional
    const { data: assessments, error } = await supabase
      .from('clinical_assessments')
      .select('patient_id')
      .eq('doctor_id', user.id)
      .not('patient_id', 'is', null)

    if (error) {
      console.error('Erro ao carregar pacientes:', error)
      return
    }

    const patientIds = [...new Set(assessments?.map((a: any) => a.patient_id).filter(Boolean) || [])]

    if (patientIds.length === 0) {
      setAvailablePatients([])
      return
    }

    const { data: patients, error: patientsError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', patientIds)

    if (patientsError) {
      console.error('Erro ao carregar dados dos pacientes:', patientsError)
      return
    }

    setAvailablePatients(patients || [])
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error)
  }
}, [user])
```

### 2. Execução de Ações (platformFunctionsModule.ts)
```typescript
case 'APPOINTMENT_CREATE':
  return await this.createAppointment(userId)
case 'PATIENT_CREATE':
  return await this.createPatient(userId)
```

### 3. Funções createAppointment e createPatient
```typescript
private async createAppointment(userId?: string): Promise<PlatformActionResult> {
  return {
    success: true,
    requiresData: true,
    data: {
      fields: [
        { name: 'patient_name', label: 'Nome do paciente', type: 'text', required: true },
        { name: 'appointment_date', label: 'Data da consulta', type: 'date', required: true },
        { name: 'appointment_time', label: 'Horário da consulta', type: 'time', required: true },
        { name: 'type', label: 'Tipo de consulta', type: 'text', required: false },
        { name: 'notes', label: 'Observações', type: 'text', required: false }
      ]
    }
  }
}

private async createPatient(userId?: string): Promise<PlatformActionResult> {
  return {
    success: true,
    requiresData: true,
    data: {
      fields: [
        { name: 'name', label: 'Nome completo', type: 'text', required: true },
        { name: 'cpf', label: 'CPF', type: 'text', required: false },
        { name: 'phone', label: 'Telefone', type: 'text', required: false },
        { name: 'email', label: 'Email', type: 'email', required: false },
        { name: 'birth_date', label: 'Data de nascimento', type: 'date', required: false },
        { name: 'gender', label: 'Gênero', type: 'text', required: false }
      ]
    }
  }
}
```

## 🔄 PRÓXIMOS PASSOS

Após reverter o código, estas configurações devem ser reaplicadas:
1. Restaurar configurações de voz em `useMedCannLabConversation.ts` (linhas 288-319)
2. Manter botão de gravação de consulta em `NoaConversationalInterface.tsx` (linhas 421-589)
3. Manter permissões de voz em `platformFunctionsModule.ts` (linhas 132-166, 215-220, 752-901)

