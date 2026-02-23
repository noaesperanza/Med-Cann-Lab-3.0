# 📹 ANÁLISE COMPLETA: Implementação de Videochamada
**Data:** 06/02/2026  
**Status:** ⚠️ **PARCIALMENTE IMPLEMENTADO** - SQL e funcionalidades críticas faltando

---

## 📋 SUMÁRIO EXECUTIVO

### ✅ O que ESTÁ implementado:
- ✅ Componente `VideoCall.tsx` básico (mock WebRTC)
- ✅ Triggers nos dashboards (RicardoValencaDashboard, EduardoFaveretDashboard)
- ✅ Integração com `patientId` e `isAudioOnly`
- ✅ Controles básicos (mute, vídeo, encerrar)

### ❌ O que FALTA implementar:
- ❌ **Scripts SQL** (tabelas `video_call_sessions` e `video_clinical_snippets`)
- ❌ **Auditoria de sessões** (persistência ao encerrar chamada)
- ❌ **Gravação clínica pontual** (3-5 minutos com consentimento)
- ❌ **Consentimento explícito** (modal antes de iniciar)
- ❌ **Integração com Edge Function** (persistência no banco)
- ❌ **RLS Policies** (perfis profissional/paciente)

---

## 🔍 1. ANÁLISE DO COMPONENTE ATUAL

### 1.1 VideoCall.tsx - Estado Atual

**Localização:** `src/components/VideoCall.tsx`

**Funcionalidades Implementadas:**
- ✅ Interface visual completa
- ✅ Controles básicos (mute, vídeo, fullscreen)
- ✅ Timer de duração da chamada
- ✅ Suporte a modo áudio/vídeo
- ✅ Cleanup de streams ao encerrar

**Funcionalidades FALTANDO:**
- ❌ **Consentimento antes de iniciar** (modal de consentimento)
- ❌ **Gravação de trecho clínico** (botão "Gravar trecho" com limite 5 min)
- ❌ **Persistência de sessão** (salvar no banco ao encerrar)
- ❌ **Consent snapshot** (JSONB com detalhes do consentimento)
- ❌ **Integração com Supabase** (insert em `video_call_sessions`)

**Código Atual:**
```typescript
// ❌ FALTA: Modal de consentimento antes de iniciar
// ❌ FALTA: Botão "Gravar trecho" (ícone ●)
// ❌ FALTA: Limite 5 min de gravação
// ❌ FALTA: Persistência ao encerrar (Edge Function)
// ❌ FALTA: Consent snapshot
```

---

## 🗄️ 2. ANÁLISE DO BANCO DE DADOS

### 2.1 Scripts SQL - STATUS: ❌ **NÃO EXISTEM**

**Scripts Necessários:**
1. ❌ `CREATE_VIDEO_CALL_SESSIONS_AUDIT.sql` - **NÃO ENCONTRADO**
2. ❌ `CREATE_VIDEO_CLINICAL_SNIPPETS.sql` - **NÃO ENCONTRADO**

**O que precisa ser criado:**

#### Tabela 1: `video_call_sessions`
- Auditoria de sessões (quem, quando, duração, tipo)
- **SEM conteúdo** de áudio/vídeo
- RLS para profissional (SELECT, INSERT, UPDATE próprias sessões)
- RLS para paciente (SELECT apenas sessões em que é patient_id)

#### Tabela 2: `video_clinical_snippets`
- Gravações pontuais (até 5 min)
- `consent_snapshot` (JSONB)
- `retention_policy`
- RLS para profissional (SELECT, INSERT próprios trechos)
- RLS para paciente (SELECT apenas trechos em que é patient_id)

---

## 🎯 3. ANÁLISE DOS TRIGGERS (FRONTEND)

### 3.1 RicardoValencaDashboard ✅

**Status:** ✅ **IMPLEMENTADO CORRETAMENTE**

**Localização:** `src/pages/RicardoValencaDashboard.tsx`

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

### 3.2 EduardoFaveretDashboard ✅

**Status:** ✅ **IMPLEMENTADO CORRETAMENTE**

**Localização:** `src/pages/EduardoFaveretDashboard.tsx`

**Triggers:**
- ✅ Botões Video/Audio no card do paciente (linha ~864-876)
- ✅ Botão "📹 Video Call" no footer (linha ~1297)
- ✅ Renderização: `<VideoCall>` com `patientId` e `isAudioOnly`

### 3.3 Outras Páginas (Placeholders) ⚠️

**Status:** ⚠️ **APENAS ESTADO, SEM COMPONENTE**

| Página | O que tem | Observação |
|--------|-----------|------------|
| `PatientChat.tsx` | `isVideoCall`, `startVideoCall()` | ❌ Não renderiza `<VideoCall />` |
| `DebateRoom.tsx` | `isVideoCall`, `startVideoCall()` | ❌ Não renderiza `<VideoCall />` |
| `ChatGlobal.tsx` | `isVideoCall`, `startVideoCall()` | ❌ Não renderiza `<VideoCall />` |

**Conclusão:** ✅ **Conforme planejado** - apenas dashboards de profissional têm o componente real.

---

## 👥 4. ANÁLISE DE PERFIS E RLS

### 4.1 Desenho do Módulo (Conforme Documento)

**Quem inicia:** ✅ Profissional (médico)  
**Com quem:** ✅ Sessão associada a `patient_id`  
**Onde:** ✅ Apenas em telas de profissional (protegidas por `requiredRole="profissional"`)  
**Paciente:** ⚠️ Não tem tela "entrar na videochamada" (conforme desenho)

### 4.2 RLS Necessário (NÃO IMPLEMENTADO)

**Tabela `video_call_sessions`:**
- ❌ Política: `Professional views own video call sessions` (SELECT onde `professional_id = auth.uid()`)
- ❌ Política: `Professional inserts own video call sessions` (INSERT com `professional_id = auth.uid()`)
- ❌ Política: `Professional updates own video call sessions` (UPDATE onde `professional_id = auth.uid()`)
- ❌ Política: `Patient views own video call sessions` (SELECT onde `patient_id = auth.uid()`)

**Tabela `video_clinical_snippets`:**
- ❌ Política: `Professional views own snippets` (SELECT onde `professional_id = auth.uid()`)
- ❌ Política: `Professional inserts own snippets` (INSERT com `professional_id = auth.uid()`)
- ❌ Política: `Patient views own snippets` (SELECT onde `patient_id = auth.uid()`)

---

## 📝 5. FUNCIONALIDADES CRÍTICAS FALTANDO

### 5.1 Consentimento Antes de Iniciar ❌

**O que falta:**
- Modal de consentimento antes de abrir `VideoCall`
- Texto explicativo sobre gravação
- Botões: ✅ Aceitar | ❌ Recusar

**Onde implementar:**
- Adicionar estado `showConsentModal` em `VideoCall.tsx`
- Modal antes de `getUserMedia()`
- Salvar `consent_snapshot` em JSONB

### 5.2 Gravação Clínica Pontual ❌

**O que falta:**
- Botão "Gravar trecho" (ícone ●) na barra de controles
- Limite de 5 minutos (timer)
- Modal de consentimento específico para gravação
- Botão "Parar gravação" (■)
- Auto-stop ao atingir 5 min
- Persistência em `video_clinical_snippets`

**Onde implementar:**
- Adicionar estado `isRecording` em `VideoCall.tsx`
- Adicionar `MediaRecorder` API
- Timer de 5 minutos
- Edge Function para persistir trecho

### 5.3 Persistência de Sessão ❌

**O que falta:**
- Ao encerrar chamada, salvar em `video_call_sessions`
- Calcular `duration_seconds`
- Salvar `consent_snapshot`
- Chamar Edge Function ou Supabase diretamente

**Onde implementar:**
- Função `saveSession()` em `VideoCall.tsx`
- Chamada ao Supabase ao `handleEndCall()`
- Edge Function opcional para auditoria adicional

### 5.4 Edge Function (Opcional mas Recomendado) ❌

**O que falta:**
- Edge Function `save-video-session` ou similar
- Validação de permissões
- Auditoria adicional
- Integração com COS (governança)

---

## 🎯 6. CHECKLIST DE IMPLEMENTAÇÃO

### Prioridade 1 - CRÍTICO (SQL)
- [ ] Criar `CREATE_VIDEO_CALL_SESSIONS_AUDIT.sql`
- [ ] Criar `CREATE_VIDEO_CLINICAL_SNIPPETS.sql`
- [ ] Executar scripts no Supabase
- [ ] Verificar RLS policies

### Prioridade 2 - ALTO (Funcionalidades Core)
- [ ] Adicionar modal de consentimento em `VideoCall.tsx`
- [ ] Implementar persistência de sessão ao encerrar
- [ ] Adicionar botão "Gravar trecho" (ícone ●)
- [ ] Implementar gravação com limite 5 min
- [ ] Adicionar modal de consentimento para gravação
- [ ] Implementar persistência de trecho clínico

### Prioridade 3 - MÉDIO (Melhorias)
- [ ] Edge Function para auditoria
- [ ] Integração com COS (governança)
- [ ] Notificações ao paciente
- [ ] Histórico de sessões no dashboard

---

## 📊 7. COMPARAÇÃO: PLANEJADO vs IMPLEMENTADO

| Funcionalidade | Planejado | Implementado | Status |
|----------------|-----------|--------------|--------|
| **Componente VideoCall** | ✅ | ✅ | ✅ OK |
| **Triggers nos dashboards** | ✅ | ✅ | ✅ OK |
| **Validação de paciente** | ✅ | ✅ | ✅ OK |
| **Tabela video_call_sessions** | ✅ | ❌ | ❌ FALTA |
| **Tabela video_clinical_snippets** | ✅ | ❌ | ❌ FALTA |
| **RLS Policies** | ✅ | ❌ | ❌ FALTA |
| **Consentimento antes de iniciar** | ✅ | ❌ | ❌ FALTA |
| **Gravação clínica pontual** | ✅ | ❌ | ❌ FALTA |
| **Persistência de sessão** | ✅ | ❌ | ❌ FALTA |
| **Consent snapshot** | ✅ | ❌ | ❌ FALTA |

**Conclusão:** ⚠️ **30% implementado** - Interface OK, mas funcionalidades críticas faltando.

---

## 🚀 8. PRÓXIMOS PASSOS RECOMENDADOS

### Passo 1: Criar Scripts SQL (URGENTE)
1. Criar `database/scripts/CREATE_VIDEO_CALL_SESSIONS_AUDIT.sql`
2. Criar `database/scripts/CREATE_VIDEO_CLINICAL_SNIPPETS.sql`
3. Executar no Supabase
4. Verificar tabelas criadas

### Passo 2: Implementar Consentimento
1. Adicionar modal de consentimento em `VideoCall.tsx`
2. Salvar `consent_snapshot` em JSONB
3. Bloquear acesso a mídia sem consentimento

### Passo 3: Implementar Persistência
1. Função `saveSession()` ao encerrar chamada
2. Calcular `duration_seconds`
3. Insert em `video_call_sessions`

### Passo 4: Implementar Gravação
1. Botão "Gravar trecho" (ícone ●)
2. Modal de consentimento específico
3. `MediaRecorder` API
4. Timer 5 minutos
5. Persistência em `video_clinical_snippets`

---

## 📋 9. REFERÊNCIAS

**Documentos Base:**
- Checklist SQL, Frontend (triggers) e Perfis - 05/02/2026
- Perfis e compartilhamento - 05/02/2026
- Gravação clínica pontual (3–5 minutos) - 05/02/2026

**Arquivos Atuais:**
- `src/components/VideoCall.tsx` - Componente base (mock)
- `src/pages/RicardoValencaDashboard.tsx` - Triggers implementados
- `src/pages/EduardoFaveretDashboard.tsx` - Triggers implementados

---

**Relatório gerado em:** 06/02/2026  
**Status geral:** ⚠️ **PARCIALMENTE IMPLEMENTADO** - SQL e funcionalidades críticas faltando  
**Próxima ação:** Criar scripts SQL e implementar funcionalidades faltantes
