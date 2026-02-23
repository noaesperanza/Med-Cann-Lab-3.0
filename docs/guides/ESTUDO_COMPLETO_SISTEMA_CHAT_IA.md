# 📚 ESTUDO COMPLETO: Sistema de Chat com IA Residente

## 🎯 OBJETIVO
Mapear completamente a arquitetura, fluxo de dados, componentes e conexões do sistema de chat com a IA Residente (Nôa Esperança) antes de propor qualquer mudança.

---

## 🏗️ ARQUITETURA GERAL

### 1. CAMADAS DO SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE UI                          │
│  NoaConversationalInterface.tsx (Componente Principal)  │
│  - Interface visual do chat                              │
│  - Controles de microfone e gravação                     │
│  - Upload de documentos                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              CAMADA DE HOOKS/ESTADO                      │
│  useMedCannLabConversation.ts                           │
│  - Gerenciamento de mensagens                           │
│  - Síntese de voz (TTS)                                 │
│  - Estado de processamento                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            CAMADA DE LÓGICA DE IA                        │
│  NoaResidentAI.ts (Classe Principal)                    │
│  - Processamento de mensagens                           │
│  - Detecção de intenções                                │
│  - Protocolo IMRE                                       │
│  - Integração com Assistant API                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         CAMADA DE FUNÇÕES DA PLATAFORMA                  │
│  PlatformFunctionsModule.ts                             │
│  - Detecção de intenções de plataforma                  │
│  - Execução de ações (agendamento, paciente, etc)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         CAMADA DE INTEGRAÇÃO EXTERNA                     │
│  noaAssistantIntegration.ts                             │
│  - Integração com OpenAI Assistant API                  │
│  - Knowledge Base Integration                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              CAMADA DE DADOS                             │
│  Supabase (PostgreSQL)                                  │
│  - Mensagens                                            │
│  - Avaliações clínicas                                  │
│  - Relatórios                                           │
│  - Pacientes                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTES PRINCIPAIS

### 1. NoaConversationalInterface.tsx
**Responsabilidade**: Interface visual do chat

**Estados Principais**:
- `isOpen`: Chat aberto/fechado
- `isExpanded`: Chat expandido/minimizado
- `isListening`: Microfone ativo
- `isRecordingConsultation`: Gravação de consulta ativa
- `messages`: Mensagens do chat (vem do hook)
- `inputValue`: Texto do input

**Refs**:
- `recognitionRef`: Instância do SpeechRecognition para microfone normal
- `consultationRecognitionRef`: Instância do SpeechRecognition para gravação de consulta
- `isListeningRef`: Ref para estado de escuta (evita problemas de closure)
- `scrollContainerRef`: Container de scroll
- `fileInputRef`: Input de arquivo

**Funções Principais**:
- `startListening()`: Inicia reconhecimento de voz
- `stopListening()`: Para reconhecimento de voz
- `handleStartConsultationRecording()`: Inicia gravação de consulta
- `handleStopConsultationRecording()`: Para e salva gravação de consulta
- `loadPatients()`: Carrega lista de pacientes
- `sendMessage()`: Envia mensagem (vem do hook)

**Integração**:
- Usa `useMedCannLabConversation()` para lógica de chat
- Usa `useNoaPlatform()` para estado global do chat
- Usa `useAuth()` para dados do usuário

---

### 2. useMedCannLabConversation.ts
**Responsabilidade**: Gerenciamento de estado e lógica do chat

**Estados**:
- `messages`: Array de mensagens
- `hasShownWelcome`: Flag para mensagem de boas-vindas
- `isProcessing`: IA processando
- `isSpeaking`: IA falando
- `error`: Erros
- `lastIntent`: Última intenção detectada
- `usedEndpoints`: Endpoints usados

**Refs**:
- `residentRef`: Instância de NoaResidentAI
- `conversationIdRef`: ID da conversa
- `lastSpokenMessageRef`: ID da última mensagem falada
- `voicesRef`: Vozes disponíveis para TTS
- `speechEnabledRef`: Flag para habilitar/desabilitar TTS
- `speechQueueRef`: Fila de síntese de voz

**Funções Principais**:
- `sendMessage()`: Envia mensagem para a IA
- `stopSpeech()`: Para síntese de voz
- `updateMessageContent()`: Atualiza conteúdo de mensagem (para efeito de digitação)

**useEffects**:
1. **Inicialização da IA** (linha 80-108):
   - Inicializa `NoaResidentAI` quando usuário loga
   - Adiciona mensagem de boas-vindas
   - Limpa quando usuário faz logout

2. **Carregamento de vozes** (linha 167-188):
   - Carrega vozes disponíveis para TTS
   - Configura `onvoiceschanged`

3. **Eventos de som** (linha 152-165):
   - Escuta evento `noaSoundToggled` para habilitar/desabilitar TTS

4. **Eventos de chat** (linha 190-199):
   - Escuta `noaChatClosed` e `noaStopSpeech` para parar TTS

5. **Síntese de voz** (linha 201-403):
   - Monitora última mensagem da Nôa
   - Cria `SpeechSynthesisUtterance`
   - Configura voz (contralto, pitch, rate)
   - Executa síntese de voz com delay de 50ms
   - Atualiza conteúdo da mensagem progressivamente (efeito de digitação)

**Fluxo de Síntese de Voz**:
1. Detecta nova mensagem da Nôa
2. Verifica se já foi falada
3. Sanitiza texto para fala
4. Cria fila de síntese
5. Inicia efeito de digitação (revealStep)
6. Configura utterance (voz, pitch, rate)
7. Cancela fala anterior
8. Executa `speechSynthesis.speak()` após 50ms

---

### 3. NoaResidentAI.ts
**Responsabilidade**: Lógica central da IA

**Propriedades**:
- `config`: Configuração da IA
- `memory`: Memória da IA
- `conversationContext`: Contexto da conversa
- `isProcessing`: Flag de processamento
- `activeAssessments`: Map de avaliações ativas
- `assistantIntegration`: Integração com Assistant API
- `platformFunctions`: Módulo de funções da plataforma

**Métodos Principais**:

1. **`processMessage()`** (linha 96-200):
   - Método principal de processamento
   - Fluxo:
     a. Verifica se já está processando
     b. Lê dados da plataforma
     c. Detecta intenção da mensagem
     d. Detecta intenção de função da plataforma
     e. Executa ação da plataforma (se houver)
     f. Chama `getAssistantResponse()` para gerar resposta
     g. Salva interação no prontuário do paciente
     h. Retorna resposta

2. **`detectIntent()`** (linha ~250):
   - Detecta intenção da mensagem do usuário
   - Retorna: 'assessment', 'clinical', 'training', 'platform', 'general'

3. **`getAssistantResponse()`** (linha ~400):
   - Integra com OpenAI Assistant API
   - Busca documentos relevantes da Knowledge Base
   - Constrói contexto completo
   - Chama Assistant API
   - Retorna resposta formatada

4. **`buildPlatformActionContext()`** (linha ~650):
   - Constrói contexto de ações da plataforma
   - Para o Assistant mencionar na resposta

5. **`startAssessment()`** (linha ~1000):
   - Inicia avaliação clínica IMRE
   - Cria estado de avaliação
   - Retorna mensagem de boas-vindas

6. **`processInvestigationStep()`** (linha ~1100):
   - Processa etapa de investigação
   - Usa reasoning pausado
   - Gera pergunta adaptativa

7. **`processMethodologyStep()`** (linha ~1200):
   - Processa etapa de metodologia
   - Usa reasoning pausado

8. **`processResultStep()`** (linha ~1300):
   - Processa etapa de resultado
   - Usa reasoning pausado

9. **`processEvolutionStep()`** (linha ~1400):
   - Processa etapa de evolução
   - Usa reasoning pausado

10. **`generateReasoningQuestion()`** (linha ~1500):
    - Gera pergunta adaptativa baseada em análise
    - Usa Assistant API para gerar pergunta contextual

11. **`saveChatInteractionToPatientRecord()`** (linha ~1600):
    - Salva interação no prontuário do paciente
    - Salva em `clinical_assessments` e `clinical_reports`

12. **`checkForAssessmentCompletion()`** (linha ~1700):
    - Verifica se avaliação foi concluída
    - Gera relatório se concluída

---

### 4. PlatformFunctionsModule.ts
**Responsabilidade**: Detecção e execução de ações da plataforma

**Métodos Principais**:

1. **`detectIntent()`** (linha 36):
   - Detecta intenções de plataforma:
     - `ASSESSMENT_START`: Iniciar avaliação
     - `ASSESSMENT_COMPLETE`: Concluir avaliação
     - `REPORT_GENERATE`: Gerar relatório
     - `DASHBOARD_QUERY`: Consultar dashboard
     - `PATIENTS_QUERY`: Consultar pacientes
     - `APPOINTMENT_CREATE`: Criar agendamento
     - `PATIENT_CREATE`: Criar paciente
     - `KPIS_QUERY`: Consultar KPIs
     - etc.

2. **`executeAction()`** (linha ~180):
   - Executa ação detectada
   - Retorna resultado

3. **`saveAppointmentFromVoice()`** (linha 752):
   - Salva agendamento criado por voz
   - Busca paciente por nome
   - Insere em `appointments`

4. **`savePatientFromVoice()`** (linha 829):
   - Salva paciente criado por voz
   - Verifica se já existe (por CPF)
   - Insere em `users`

---

### 5. noaAssistantIntegration.ts
**Responsabilidade**: Integração com OpenAI Assistant API

**Métodos Principais**:
- `sendMessage()`: Envia mensagem para Assistant API
- `getKnowledgeBaseDocuments()`: Busca documentos relevantes
- Configuração de Assistant (ID, instruções, etc)

---

## 🔄 FLUXO COMPLETO DE UMA MENSAGEM

### Fluxo Normal (Texto)

```
1. Usuário digita mensagem
   ↓
2. NoaConversationalInterface.handleSend()
   ↓
3. useMedCannLabConversation.sendMessage()
   - Adiciona mensagem do usuário ao estado
   - Para síntese de voz (stopSpeech)
   - Define isProcessing = true
   ↓
4. NoaResidentAI.processMessage()
   - Detecta intenção
   - Detecta intenção de plataforma
   - Executa ação de plataforma (se houver)
   - Chama getAssistantResponse()
   ↓
5. noaAssistantIntegration.sendMessage()
   - Busca documentos relevantes
   - Constrói contexto
   - Chama OpenAI Assistant API
   - Retorna resposta
   ↓
6. NoaResidentAI.processMessage() (continuação)
   - Salva interação no prontuário
   - Retorna resposta
   ↓
7. useMedCannLabConversation.sendMessage() (continuação)
   - Adiciona resposta da IA ao estado
   - Define isProcessing = false
   ↓
8. useEffect de síntese de voz (linha 201-403)
   - Detecta nova mensagem da Nôa
   - Cria utterance
   - Configura voz (contralto, pitch 0.65-0.78, rate 1.15)
   - Executa síntese de voz (com delay de 50ms)
   - Atualiza conteúdo progressivamente (efeito de digitação)
   ↓
9. NoaConversationalInterface renderiza mensagem
   - Mostra mensagem na tela
   - Avatar animado mostra estado "falando"
```

### Fluxo com Voz (Microfone)

```
1. Usuário clica no botão do microfone
   ↓
2. NoaConversationalInterface.startListening()
   - Cancela síntese de voz
   - Dispara evento 'noaStopSpeech'
   - Para escuta anterior (stopListening)
   - Cria nova instância de SpeechRecognition
   - Configura: lang='pt-BR', continuous=true, interimResults=true
   - Define callbacks (onresult, onerror, onend)
   - Inicia recognition.start()
   - Define isListening = true, isListeningRef.current = true
   ↓
3. Usuário fala
   ↓
4. recognition.onresult()
   - Captura transcrição
   - Adiciona ao buffer
   - Agenda flush após 900ms de silêncio
   ↓
5. Após 900ms de silêncio
   ↓
6. flush()
   - Envia texto via sendMessage()
   - Limpa buffer
   ↓
7. Fluxo normal continua (passo 3-9 acima)
   ↓
8. Quando IA começa a processar
   ↓
9. useEffect (linha 332-338)
   - Detecta isProcessing && isListening
   - Para microfone (stopListening)
   ↓
10. recognition.onend()
    - Verifica se ainda deve estar ativo (isListeningRef.current)
    - Se sim, reinicia após 100ms
    - Se não, para definitivamente
```

### Fluxo de Gravação de Consulta

```
1. Profissional clica "Iniciar Gravação de Consulta"
   ↓
2. handleStartConsultationRecording()
   - Verifica se é profissional/admin
   - Se não há paciente selecionado, mostra seletor
   - Para escuta normal
   - Cria nova instância de SpeechRecognition
   - Configura callbacks
   - Inicia recognition.start()
   - Define isRecordingConsultation = true
   ↓
3. Durante gravação
   - recognition.onresult() captura transcrição
   - Adiciona a consultationTranscript
   - Envia mensagem visual no chat
   - recognition.onend() reinicia automaticamente
   ↓
4. Profissional clica "Parar e Salvar Consulta"
   ↓
5. handleStopConsultationRecording()
   - Para recognition
   - Calcula duração
   - Junta transcrição completa
   - Salva em clinical_assessments (tipo 'CONSULTA')
   - Salva em clinical_reports (se tabela existir)
   - Reseta estados
```

---

## 🎤 SISTEMA DE VOZ

### Síntese de Voz (TTS)

**Localização**: `useMedCannLabConversation.ts` (linha 201-403)

**Configurações Atuais**:
- Rate: 1.15 (andante)
- Volume: 0.93
- Pitch: 0.65 (contralto), 0.75 (victoria), 0.78 (padrão)
- Voz: Prioriza contralto, evita soprano

**Fluxo**:
1. useEffect monitora última mensagem da Nôa
2. Verifica se já foi falada (lastSpokenMessageRef)
3. Sanitiza texto
4. Cria fila de síntese
5. Inicia efeito de digitação
6. Configura utterance
7. Cancela fala anterior
8. Executa `speechSynthesis.speak()` após 50ms

**Eventos**:
- `noaStopSpeech`: Para síntese de voz
- `noaChatClosed`: Para síntese de voz
- `noaSoundToggled`: Habilita/desabilita TTS

**Problemas Identificados**:
- Delay de 50ms pode causar problemas em alguns navegadores
- Cancelamento e reinício podem causar bloqueio de áudio

---

### Reconhecimento de Voz (STT)

**Localização**: `NoaConversationalInterface.tsx` (linha 172-329)

**Configurações**:
- Lang: 'pt-BR'
- Continuous: true
- InterimResults: true

**Fluxo**:
1. Usuário clica no botão
2. Cancela síntese de voz
3. Cria instância de SpeechRecognition
4. Configura callbacks
5. Inicia recognition.start()
6. onresult captura transcrição
7. Após 900ms de silêncio, envia mensagem
8. onend reinicia se ainda ativo

**Problemas Identificados**:
- onend é chamado imediatamente após start() em alguns casos
- Reinício automático pode causar loops
- Múltiplas instâncias podem causar travamento

---

## 🔗 CONEXÕES ENTRE COMPONENTES

### 1. NoaConversationalInterface ↔ useMedCannLabConversation
- **Interface usa hook**: `const { messages, sendMessage, isProcessing, isSpeaking, ... } = useMedCannLabConversation()`
- **Hook gerencia**: Estado de mensagens, processamento, síntese de voz
- **Interface gerencia**: Microfone, gravação de consulta, UI

### 2. useMedCannLabConversation ↔ NoaResidentAI
- **Hook cria instância**: `residentRef.current = new NoaResidentAI()`
- **Hook chama**: `residentRef.current.processMessage()`
- **IA retorna**: `AIResponse` com conteúdo, metadata, etc

### 3. NoaResidentAI ↔ PlatformFunctionsModule
- **IA detecta intenção**: `platformFunctions.detectIntent()`
- **IA executa ação**: `platformFunctions.executeAction()`
- **Módulo retorna**: Resultado da ação

### 4. NoaResidentAI ↔ noaAssistantIntegration
- **IA chama**: `assistantIntegration.sendMessage()`
- **Integration retorna**: Resposta do Assistant API

### 5. NoaResidentAI ↔ Supabase
- **Salva interações**: `saveChatInteractionToPatientRecord()`
- **Salva avaliações**: `checkForAssessmentCompletion()`
- **Busca dados**: `getPlatformData()`

### 6. NoaConversationalInterface ↔ Supabase
- **Carrega pacientes**: `loadPatients()`
- **Salva consulta**: `handleStopConsultationRecording()`
- **Upload de documentos**: `processFileUpload()`

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. Microfone para imediatamente
**Sintoma**: Log mostra `✅ Escuta de voz iniciada` seguido de `🛑 Escuta de voz finalizada`

**Causa Provável**:
- `recognition.onend` é chamado imediatamente após `start()`
- Web Speech API pode chamar `onend` quando não há áudio sendo capturado
- Reinício automático pode não estar funcionando corretamente

**Localização**: `NoaConversationalInterface.tsx` (linha 265-316)

### 2. Sem som
**Sintoma**: IA não fala, mensagem de boas-vindas não é falada

**Causas Possíveis**:
- Síntese de voz não está sendo executada
- Vozes não estão carregadas (`voicesReady` = false)
- `speechEnabledRef.current` = false
- Delay de 50ms pode estar causando problemas
- Cancelamento de síntese pode estar bloqueando

**Localização**: `useMedCannLabConversation.ts` (linha 201-403)

### 3. Sistema trava
**Sintoma**: Página não responde, não consegue clicar em nada

**Causas Possíveis**:
- Loop infinito em useEffect
- Múltiplas instâncias de SpeechRecognition
- Múltiplas chamadas de síntese de voz
- Processamento bloqueante

**Localização**: Múltiplos arquivos

### 4. Mensagem de boas-vindas não aparece
**Sintoma**: Chat abre sem mensagem de boas-vindas

**Causas Possíveis**:
- `hasShownWelcome` não está sendo definido corretamente
- `messages.length === 0` não está sendo verificado corretamente
- Usuário não está logado quando a mensagem é adicionada

**Localização**: `useMedCannLabConversation.ts` (linha 80-108)

---

## 📊 ESTADO ATUAL vs ESTADO DESEJADO

### Estado Atual
- ✅ Configurações de voz salvas (rate: 1.15, pitch: 0.65-0.78, contralto)
- ✅ Botão de gravação de consulta implementado
- ✅ Permissões de voz implementadas (agendamento, paciente)
- ❌ Microfone para imediatamente após iniciar
- ❌ Sem som (síntese de voz não funciona)
- ❌ Sistema trava
- ❌ Mensagem de boas-vindas não aparece

### Estado Desejado
- ✅ Microfone permanece ativo após clicar
- ✅ Síntese de voz funciona (IA fala)
- ✅ Sistema não trava
- ✅ Mensagem de boas-vindas aparece e é falada
- ✅ Microfone reinicia automaticamente quando necessário
- ✅ Microfone para quando IA processa/fala

---

## 🔍 ANÁLISE DETALHADA

### Problema 1: Microfone para imediatamente

**Código Atual** (linha 265-316):
```typescript
recognition.onend = () => {
  if (recognitionRef.current !== handle || handle.stopped) {
    setIsListening(false)
    isListeningRef.current = false
    return
  }

  if (isListeningRef.current && !handle.stopped) {
    setTimeout(() => {
      if (recognitionRef.current === handle && !handle.stopped && isListeningRef.current) {
        try {
          recognition.start()
        } catch (e) {
          // ...
        }
      }
    }, 100)
  } else {
    setIsListening(false)
    isListeningRef.current = false
    recognitionRef.current = null
  }
}
```

**Análise**:
- O `onend` é chamado imediatamente após `start()` em alguns navegadores
- A verificação `isListeningRef.current` pode não estar atualizada no momento do callback
- O delay de 100ms pode não ser suficiente
- A verificação de `recognitionRef.current === handle` pode falhar se o handle mudou

**Possível Solução**:
- Garantir que `isListeningRef.current` seja atualizado ANTES de `start()`
- Aumentar delay para 200-300ms
- Adicionar verificação de estado do recognition antes de reiniciar
- Tratar erro "already started" graciosamente

---

### Problema 2: Sem som

**Código Atual** (linha 367-391):
```typescript
try {
  window.speechSynthesis.cancel()
  setTimeout(() => {
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
      window.speechSynthesis.speak(utterance)
    } catch (speakError) {
      console.warn('⚠️ Erro ao iniciar síntese de voz:', speakError)
      setIsSpeaking(false)
    }
  }, 50)
} catch (cancelError) {
  // ...
}
```

**Análise**:
- O delay de 50ms pode não ser suficiente para cancelar
- Múltiplos cancelamentos podem bloquear a síntese
- Verificação de `speaking` pode não ser confiável
- Erros podem estar sendo silenciados

**Possível Solução**:
- Remover delay ou aumentar para 100ms
- Verificar estado do speechSynthesis antes de cancelar
- Adicionar logs detalhados para debug
- Verificar se vozes estão carregadas antes de falar

---

### Problema 3: Sistema trava

**Análise**:
- Múltiplos useEffects podem estar criando loops
- Múltiplas instâncias de SpeechRecognition
- Processamento bloqueante
- Estado não está sendo atualizado corretamente

**Possível Solução**:
- Verificar dependências dos useEffects
- Garantir cleanup adequado
- Adicionar flags de inicialização
- Verificar se há processamento bloqueante

---

## 📝 PRÓXIMOS PASSOS (APENAS ESTUDO)

1. ✅ Mapear arquitetura completa
2. ✅ Identificar componentes principais
3. ✅ Mapear fluxo de dados
4. ✅ Identificar problemas
5. ⏳ Analisar logs do console
6. ⏳ Verificar estado dos refs
7. ⏳ Verificar dependências dos useEffects
8. ⏳ Verificar se há loops infinitos
9. ⏳ Verificar se há múltiplas instâncias
10. ⏳ Criar proposta de solução

---

## 🎯 CONCLUSÃO DO ESTUDO

O sistema é complexo com múltiplas camadas e integrações. Os problemas identificados estão relacionados a:

1. **Timing**: Delays e callbacks assíncronos
2. **Estado**: Refs e state não sincronizados
3. **Instâncias**: Múltiplas instâncias de APIs do navegador
4. **Cleanup**: Falta de cleanup adequado

**Próximo passo**: Aguardar confirmação do usuário sobre o entendimento antes de propor soluções.




