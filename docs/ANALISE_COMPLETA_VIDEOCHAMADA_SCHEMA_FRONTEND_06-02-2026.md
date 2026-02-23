# 📹 ANÁLISE COMPLETA: Videochamada - Schema vs Frontend vs Planejado
**Data:** 06/02/2026  
**Escopo:** Comparação entre schema atual, frontend implementado e planejamento original

---

## 📋 SUMÁRIO EXECUTIVO

### Status Geral: ⚠️ **30% IMPLEMENTADO**

**O que está:**
- ✅ Componente VideoCall.tsx (interface básica)
- ✅ Triggers nos dashboards profissionais
- ✅ Scripts SQL criados (mas não executados)

**O que falta:**
- ❌ Tabelas não existem no banco (schema atual não tem `video_call_sessions` nem `video_clinical_snippets`)
- ❌ Persistência de sessão
- ❌ Consentimento antes de iniciar
- ❌ Gravação clínica pontual
- ❌ Integração com Supabase

---

## 🗄️ 1. ANÁLISE DO SCHEMA ATUAL

### 1.1 Verificação no Schema Anexado

**Busca por "video" no schema:**
- ❌ **Nenhuma tabela `video_call_sessions` encontrada**
- ❌ **Nenhuma tabela `video_clinical_snippets` encontrada**
- ✅ Apenas referências em `course_modules.content_type` e `trl_lessons.format` (não relacionadas)

**Conclusão:** As tabelas de videochamada **NÃO EXISTEM** no banco de dados atual.

### 1.2 Tabelas Relacionadas que Existem

| Tabela | Uso | Relação com Videochamada |
|--------|-----|--------------------------|
| `appointments` | Agendamentos | Pode ter `meeting_url` (link externo) |
| `chat_messages` | Mensagens de chat | Não relacionado |
| `clinical_reports` | Relatórios clínicos | Não relacionado |
| `ai_chat_interactions` | Interações com IA | Não relacionado |

**Nenhuma tabela existente cobre videochamada.**

---

## 🎨 2. ANÁLISE DO FRONTEND

### 2.1 Componente VideoCall.tsx

**Localização:** `src/components/VideoCall.tsx` (228 linhas)

**Props:**
```typescript
interface VideoCallProps {
  isOpen: boolean
  onClose: () => void
  patientId?: string
  isAudioOnly?: boolean
}
```

**Estado Atual:**
- ✅ Interface visual completa
- ✅ Controles básicos (mute, vídeo, fullscreen, encerrar)
- ✅ Timer de duração (`callDuration`)
- ✅ Suporte a modo áudio/vídeo
- ✅ Cleanup de streams ao encerrar
- ✅ Mock WebRTC (getUserMedia)

**Faltando:**
- ❌ **Modal de consentimento** antes de iniciar
- ❌ **Botão "Gravar trecho"** (ícone ●)
- ❌ **Gravação com MediaRecorder** (limite 5 min)
- ❌ **Persistência de sessão** ao encerrar
- ❌ **Integração com Supabase** (insert em `video_call_sessions`)
- ❌ **Consent snapshot** (JSONB)
- ❌ **Persistência de trecho clínico** (insert em `video_clinical_snippets`)

### 2.2 Uso nos Dashboards

#### RicardoValencaDashboard.tsx ✅

**Estado:**
```typescript
const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
const [callType, setCallType] = useState<'video' | 'audio'>('video')
```

**Triggers:**
- ✅ Botão "📹 Video Call" (linha ~3578)
- ✅ Botão "📞 Audio Call" (linha ~3589)
- ✅ Validação: `if (selectedPatient)` → alert se não houver
- ✅ Renderização: `<VideoCall>` com `patientId` e `isAudioOnly`

**Código:**
```typescript
// ✅ CORRETO: Validação de paciente selecionado
if (selectedPatient) {
  setCallType('video')
  setIsVideoCallOpen(true)
} else {
  alert('Selecione um atendimento para iniciar a videochamada.')
}
```

#### EduardoFaveretDashboard.tsx ✅

**Estado:**
```typescript
const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
const [callType, setCallType] = useState<'video' | 'audio'>('video')
```

**Triggers:**
- ✅ Botões Video/Audio no card do paciente (linha ~864-876)
- ✅ Botão "📹 Video Call" no footer (linha ~1297)
- ✅ Renderização: `<VideoCall>` com `patientId` e `isAudioOnly`

**Status:** ✅ **IMPLEMENTADO CORRETAMENTE** conforme planejado

---

## 📊 3. COMPARAÇÃO: SCHEMA vs PLANEJADO

### 3.1 Tabelas Necessárias (Planejado)

| Tabela | Status no Schema | Status dos Scripts | Ação Necessária |
|--------|-----------------|-------------------|-----------------|
| `video_call_sessions` | ❌ **NÃO EXISTE** | ✅ Script criado | ⚠️ **EXECUTAR SQL** |
| `video_clinical_snippets` | ❌ **NÃO EXISTE** | ✅ Script criado | ⚠️ **EXECUTAR SQL** |

### 3.2 Estrutura Esperada vs Schema Atual

**Tabela `video_call_sessions` (Planejado):**
```sql
- id UUID
- session_id TEXT UNIQUE
- professional_id UUID → auth.users(id)
- patient_id UUID → auth.users(id)
- started_at TIMESTAMPTZ
- ended_at TIMESTAMPTZ
- duration_seconds INTEGER
- call_type TEXT CHECK ('video', 'audio')
- consent_snapshot JSONB
- created_at TIMESTAMPTZ
```

**Status:** ❌ **NÃO EXISTE NO SCHEMA ATUAL**

**Tabela `video_clinical_snippets` (Planejado):**
```sql
- id UUID
- session_id TEXT
- professional_id UUID → auth.users(id)
- patient_id UUID → auth.users(id)
- started_at TIMESTAMPTZ
- ended_at TIMESTAMPTZ
- duration_seconds INTEGER CHECK (<= 300)
- purpose TEXT DEFAULT 'clinical_record'
- consent_snapshot JSONB
- storage_path TEXT (opcional)
- retention_policy TEXT DEFAULT 'medical_record'
- created_at TIMESTAMPTZ
```

**Status:** ❌ **NÃO EXISTE NO SCHEMA ATUAL**

---

## 🔍 4. ANÁLISE DETALHADA DO FRONTEND

### 4.1 Fluxo Atual (VideoCall.tsx)

**Início:**
1. Componente recebe `isOpen={true}`
2. `useEffect` detecta `isOpen` e chama `getUserMedia()`
3. Timer inicia (`callDuration`)
4. Streams são configurados

**Durante:**
- Controles funcionam (mute, vídeo, fullscreen)
- Timer continua contando
- Nenhuma persistência

**Encerramento:**
1. `handleEndCall()` é chamado
2. Streams são parados
3. `onClose()` é chamado
4. Timer é resetado
5. ❌ **NENHUMA PERSISTÊNCIA NO BANCO**

### 4.2 O que Precisa ser Adicionado

#### 4.2.1 Modal de Consentimento (ANTES de iniciar)

**Onde:** Antes de `getUserMedia()` no `useEffect`

**Implementação:**
```typescript
const [showConsentModal, setShowConsentModal] = useState(false)
const [consentGiven, setConsentGiven] = useState(false)

// No useEffect, antes de getUserMedia:
if (isOpen && !consentGiven) {
  setShowConsentModal(true)
  return // Não inicia mídia sem consentimento
}
```

**Modal:**
- Texto explicativo sobre gravação
- Botões: ✅ Aceitar | ❌ Recusar
- Se recusar → `onClose()`
- Se aceitar → `setConsentGiven(true)`, salvar `consent_snapshot`

#### 4.2.2 Persistência de Sessão (Ao encerrar)

**Onde:** No `handleEndCall()`

**Implementação:**
```typescript
const handleEndCall = async () => {
  // Calcular duração
  const duration = callDuration
  
  // Preparar consent snapshot
  const consentSnapshot = {
    scope: "video_call",
    timestamp: new Date().toISOString(),
    acceptedBy: "patient", // ou "professional"
    // ... outros campos
  }
  
  // Salvar no Supabase
  const { data, error } = await supabase
    .from('video_call_sessions')
    .insert({
      session_id: generateSessionId(),
      professional_id: currentUser.id,
      patient_id: patientId,
      started_at: sessionStartTime,
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
      call_type: isAudioOnly ? 'audio' : 'video',
      consent_snapshot: consentSnapshot
    })
  
  // Limpar estado
  onClose()
  setCallDuration(0)
}
```

#### 4.2.3 Gravação Clínica Pontual

**Onde:** Botão na barra de controles

**Implementação:**
```typescript
const [isRecording, setIsRecording] = useState(false)
const [recordingDuration, setRecordingDuration] = useState(0)
const mediaRecorderRef = useRef<MediaRecorder | null>(null)
const recordingChunksRef = useRef<Blob[]>([])

// Botão "Gravar trecho" (ícone ●)
// Modal de consentimento específico para gravação
// MediaRecorder API
// Timer de 5 minutos (300 segundos)
// Auto-stop ao atingir 5 min
// Persistência em video_clinical_snippets
```

---

## 🎯 5. GAP ANALYSIS: O QUE FALTA

### 5.1 Banco de Dados

| Item | Status | Ação |
|------|--------|------|
| Tabela `video_call_sessions` | ❌ Não existe | ⚠️ Executar `CREATE_VIDEO_CALL_SESSIONS_AUDIT.sql` |
| Tabela `video_clinical_snippets` | ❌ Não existe | ⚠️ Executar `CREATE_VIDEO_CLINICAL_SNIPPETS.sql` |
| RLS Policies | ❌ Não existe | ✅ Incluído nos scripts SQL |
| Índices | ❌ Não existe | ✅ Incluído nos scripts SQL |

### 5.2 Frontend

| Funcionalidade | Status | Prioridade |
|----------------|--------|------------|
| Modal de consentimento | ❌ Não existe | 🔴 **ALTA** |
| Persistência de sessão | ❌ Não existe | 🔴 **ALTA** |
| Botão "Gravar trecho" | ❌ Não existe | 🟡 **MÉDIA** |
| Gravação com MediaRecorder | ❌ Não existe | 🟡 **MÉDIA** |
| Persistência de trecho | ❌ Não existe | 🟡 **MÉDIA** |
| Consent snapshot | ❌ Não existe | 🔴 **ALTA** |
| Integração Supabase | ❌ Não existe | 🔴 **ALTA** |

### 5.3 Integração

| Item | Status | Ação |
|------|--------|------|
| Import do Supabase | ✅ Existe (`src/lib/supabase.ts`) | ✅ OK |
| Função de persistência | ❌ Não existe | ⚠️ Criar em `VideoCall.tsx` |
| Geração de session_id | ❌ Não existe | ⚠️ Implementar |
| Cálculo de duração | ⚠️ Parcial (timer existe) | ⚠️ Converter para segundos ao salvar |

---

## 📋 6. CHECKLIST DE IMPLEMENTAÇÃO COMPLETO

### Fase 1: Banco de Dados (URGENTE) 🔴

- [ ] **Executar `CREATE_VIDEO_CALL_SESSIONS_AUDIT.sql` no Supabase**
  - Verificar se tabela foi criada
  - Verificar RLS policies
  - Verificar índices

- [ ] **Executar `CREATE_VIDEO_CLINICAL_SNIPPETS.sql` no Supabase**
  - Verificar se tabela foi criada
  - Verificar RLS policies
  - Verificar constraint de 5 minutos

- [ ] **Testar RLS manualmente**
  - Login como profissional → tentar SELECT/INSERT
  - Login como paciente → tentar SELECT
  - Verificar que paciente não pode INSERT/UPDATE

### Fase 2: Frontend - Consentimento (ALTA) 🔴

- [ ] **Adicionar estado de consentimento**
  ```typescript
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [consentSnapshot, setConsentSnapshot] = useState<any>(null)
  ```

- [ ] **Criar componente Modal de Consentimento**
  - Texto explicativo
  - Botões Aceitar/Recusar
  - Salvar consent snapshot

- [ ] **Integrar modal no fluxo**
  - Mostrar antes de `getUserMedia()`
  - Bloquear acesso a mídia sem consentimento

### Fase 3: Frontend - Persistência (ALTA) 🔴

- [ ] **Adicionar função `saveSession()`**
  - Gerar `session_id` único
  - Calcular `duration_seconds`
  - Preparar `consent_snapshot`
  - Insert no Supabase

- [ ] **Integrar no `handleEndCall()`**
  - Chamar `saveSession()` antes de `onClose()`
  - Tratar erros
  - Log de sucesso/erro

- [ ] **Adicionar estado de sessão**
  ```typescript
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  ```

### Fase 4: Frontend - Gravação (MÉDIA) 🟡

- [ ] **Adicionar estado de gravação**
  ```typescript
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  ```

- [ ] **Adicionar botão "Gravar trecho"**
  - Ícone ● (Circle)
  - Só aparece em modo vídeo
  - Modal de consentimento específico

- [ ] **Implementar MediaRecorder**
  - Iniciar gravação
  - Timer de 5 minutos
  - Auto-stop ao atingir limite
  - Botão "Parar gravação" (■)

- [ ] **Adicionar função `saveSnippet()`**
  - Preparar `consent_snapshot` específico
  - Insert em `video_clinical_snippets`
  - Tratar erros

### Fase 5: Testes e Validação 🟢

- [ ] **Testar fluxo completo**
  - Iniciar chamada → consentimento → persistência
  - Gravar trecho → consentimento → persistência
  - Verificar dados no Supabase

- [ ] **Testar RLS**
  - Profissional vê suas sessões
  - Paciente vê suas sessões
  - Não vê sessões de terceiros

- [ ] **Testar limites**
  - Gravação para em 5 minutos
  - Duração calculada corretamente
  - Consent snapshot salvo

---

## 🚀 7. PRÓXIMOS PASSOS IMEDIATOS

### Passo 1: Executar SQL (HOJE) 🔴

1. Abrir Supabase SQL Editor
2. Executar `database/scripts/CREATE_VIDEO_CALL_SESSIONS_AUDIT.sql`
3. Executar `database/scripts/CREATE_VIDEO_CLINICAL_SNIPPETS.sql`
4. Verificar tabelas criadas:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('video_call_sessions', 'video_clinical_snippets');
   ```

### Passo 2: Implementar Consentimento (HOJE) 🔴

1. Adicionar estados em `VideoCall.tsx`
2. Criar componente `ConsentModal.tsx`
3. Integrar no fluxo antes de `getUserMedia()`

### Passo 3: Implementar Persistência (HOJE) 🔴

1. Adicionar função `saveSession()` em `VideoCall.tsx`
2. Integrar no `handleEndCall()`
3. Testar insert no Supabase

### Passo 4: Implementar Gravação (AMANHÃ) 🟡

1. Adicionar botão "Gravar trecho"
2. Implementar MediaRecorder
3. Adicionar função `saveSnippet()`

---

## 📊 8. RESUMO FINAL

### Schema Atual
- ❌ **0% implementado** - Tabelas não existem

### Frontend Atual
- ✅ **30% implementado** - Interface OK, funcionalidades críticas faltando

### Scripts SQL
- ✅ **100% criados** - Prontos para execução

### Status Geral
- ⚠️ **15% do total implementado** - Muito trabalho pela frente

---

**Relatório gerado em:** 06/02/2026  
**Próxima ação:** Executar scripts SQL e implementar consentimento + persistência  
**Tempo estimado:** 4-6 horas para implementação completa
