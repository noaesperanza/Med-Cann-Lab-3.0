import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, MicOff, X, Send, Loader2, Activity, BookOpen, Brain, Upload, Maximize2, Minimize2, User } from 'lucide-react'
import clsx from 'clsx'
import NoaAnimatedAvatar from './NoaAnimatedAvatar'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useMedCannLabConversation } from '../hooks/useMedCannLabConversation'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { KnowledgeBaseIntegration } from '../services/knowledgeBaseIntegration'
import { normalizeUserType } from '../lib/userTypes'
import { getAvailableSlots, bookAppointment } from '../lib/scheduling'
import { Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Contrato institucional (IMUTÁVEL): token base de agendamento
const TRIGGER_SCHEDULING_TOKEN = '[TRIGGER_SCHEDULING]'
// Token universal de ação (app_commands) — exibição oculta; execução é via metadata/app_commands
const TRIGGER_ACTION_TOKEN = '[TRIGGER_ACTION]'

/** Lista de tokens que o usuário NUNCA deve ver; execução é sempre via metadata/app_commands ou flags. */
const INVISIBLE_DISPLAY_TOKENS = [
  TRIGGER_ACTION_TOKEN,
  TRIGGER_SCHEDULING_TOKEN,
  '[NAVIGATE_TERMINAL]',
  '[NAVIGATE_AGENDA]',
  '[NAVIGATE_PACIENTES]',
  '[NAVIGATE_RELATORIOS]',
  '[NAVIGATE_CHAT_PRO]',
  '[NAVIGATE_PRESCRICAO]',
  '[NAVIGATE_BIBLIOTECA]',
  '[NAVIGATE_FUNCAO_RENAL]',
  '[NAVIGATE_MEUS_AGENDAMENTOS]',
  '[NAVIGATE_MODULO_PACIENTE]',
  '[SHOW_PRESCRIPTION]',
  '[FILTER_PATIENTS_ACTIVE]',
  '[DOCUMENT_LIST]',
  '[ASSESSMENT_COMPLETED]'
]

/** Remove todos os tokens invisíveis do texto exibido (usuário nunca vê triggers; ações são automáticas). */
function stripActionTokenForDisplay(text: string): string {
  if (!text || typeof text !== 'string') return text ?? ''
  let out = text
  for (const token of INVISIBLE_DISPLAY_TOKENS) {
    out = out.split(token).join('')
  }
  return out.replace(/\n\s*\n\s*\n/g, '\n\n').trim()
}

// Configurar PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (err) {
  console.warn('Erro ao configurar PDF.js worker:', err)
}

interface NoaConversationalInterfaceProps {
  userCode?: string
  userName?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline'
  hideButton?: boolean
  variant?: 'default' | 'clean'
  onViewSchedule?: () => void
}

type NoaCommandDetail = {
  type: string
  target: string
  label?: string
  fallbackRoute?: string
  payload?: Record<string, any>
  rawMessage?: string
  source?: 'voice' | 'text'
  timestamp?: string
}

type InlineDocument = {
  id: string
  title: string
  summary?: string | null
  content?: string | null
  file_url?: string | null
  file_type?: string | null
  category?: string | null
  created_at?: string | null
  updated_at?: string | null
}

const getPositionClasses = (position: NoaConversationalInterfaceProps['position']) => {
  switch (position) {
    case 'bottom-left':
      return 'bottom-4 left-4'
    case 'top-right':
      return 'top-4 right-4'
    case 'top-left':
      return 'top-4 left-4'
    case 'bottom-right':
      return 'bottom-4 right-4'
    case 'inline':
      return ''
    default:
      return 'bottom-4 right-4'
  }
}

type RecognitionHandle = {
  recognition: any
  timer?: number
  buffer: string
  stopped?: boolean
  retryCount?: number
  maxRetries?: number
  lastError?: string | null
  startTime?: number // Timestamp de quando iniciou a escuta
  maxDuration?: number // Duração máxima em ms (padrão: 30 segundos)
  inactivityTimer?: number // Timer para detectar inatividade
  restartScheduled?: boolean // Flag para evitar múltiplas tentativas de reinício simultâneas
}

// Widget de Agendamento Inteligente para o Chat
const SchedulingWidget = ({
  patientId,
  professionalId,
  onSuccess,
  onCancel
}: {
  patientId: string
  professionalId: string
  onSuccess: (appointmentId: string) => void
  onCancel: () => void
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar slots ao mudar a data
  useEffect(() => {
    let active = true

    const loadSlots = async () => {
      if (loading) return // Evita chamadas duplicadas

      setLoading(true)
      try {
        // Validation before calling API
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(professionalId) && professionalId !== 'ricardo-valenca' && professionalId !== 'eduardo-faveret') {
          // Allow known slugs to proceed to backend resolution, but block random strings
          console.warn('Professional ID format invalid awaiting resolution:', professionalId)
        }

        const slots = await getAvailableSlots(professionalId, selectedDate, selectedDate)
        if (active) setAvailableSlots(slots)
      } catch (err: any) {
        console.error('Erro ao buscar slots:', err)
        if (active) setAvailableSlots([]) // Clear slots on error

        // Se for erro de profissional não encontrado, não adianta tentar de novo
        if (err.message && err.message.includes('Professional not found')) {
          console.warn('Aborting slot retry - Invalid Professional')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSlots()
    return () => { active = false }
  }, [professionalId, selectedDate])

  const handleBooking = async () => {
    if (!selectedSlot) return

    setBookingLoading(true)
    setError(null)
    try {
      // Construir data completa
      const [hours, minutes] = selectedSlot.split(':')
      const appointmentDate = new Date(selectedDate)
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const appointmentId = await bookAppointment(
        patientId,
        professionalId,
        appointmentDate.toISOString(),
        'consultation',
        'Agendamento via Chat IA'
      )

      onSuccess(appointmentId)
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar.')
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/80 rounded-lg p-4 mb-4 border border-slate-700 w-full animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
        <h4 className="text-white font-semibold flex items-center">
          <CalendarIcon className="w-4 h-4 mr-2 text-blue-400" />
          Agendar Consulta
        </h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Seletor de Data Simplificado */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
          className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"
          disabled={selectedDate <= new Date()}
        >
          &lt;
        </button>
        <span className="text-white font-medium">
          {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
        </span>
        <button
          onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
          className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"
        >
          &gt;
        </button>
      </div>

      {/* Grid de Horários */}
      <div className="grid grid-cols-3 gap-2 mb-4 max-h-40 overflow-y-auto pr-1">
        {loading ? (
          <div className="col-span-3 text-center py-4 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            Buscando horários...
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="col-span-3 text-center py-4 text-slate-500 text-sm">
            Nenhum horário disponível
          </div>
        ) : (
          availableSlots.map(slot => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={clsx(
                "py-1.5 px-2 rounded text-xs transition-colors border",
                selectedSlot === slot
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
              )}
            >
              {slot}
            </button>
          ))
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">
          ⚠️ {error}
        </div>
      )}

      {/* Disclaimer e Botão */}
      <div className="space-y-3 pt-2 border-t border-slate-700">
        <div className="flex items-start text-xs text-yellow-400/90 bg-yellow-900/10 p-2 rounded">
          <Activity className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
          <span>Valor da consulta particular: <strong>R$ 350,00</strong></span>
        </div>

        <button
          onClick={handleBooking}
          disabled={!selectedSlot || bookingLoading}
          className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-green-900/20"
        >
          {bookingLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirmando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Agendamento</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

const NoaConversationalInterface: React.FC<NoaConversationalInterfaceProps> = ({
  userCode = 'DR-001',
  userName = 'Dr. Ricardo Valença',
  position = 'bottom-right',
  hideButton = false,
  variant,
  onViewSchedule,
}) => {
  const { isOpen: contextIsOpen, pendingMessage, clearPendingMessage, closeChat } = useNoaPlatform()
  const resolvedVariant = variant || 'default'
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState((hideButton && position === 'inline') || contextIsOpen)
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [shouldAutoResume, setShouldAutoResume] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('ai-documents')
  const [uploadArea, setUploadArea] = useState('cannabis')
  const [uploadUserType, setUploadUserType] = useState<string[]>(['professional', 'student'])
  // Estados para gravação de consulta
  const [isRecordingConsultation, setIsRecordingConsultation] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [consultationTranscript, setConsultationTranscript] = useState<string[]>([])
  const [consultationStartTime, setConsultationStartTime] = useState<Date | null>(null)
  const [showPatientSelector, setShowPatientSelector] = useState(false)
  const [availablePatients, setAvailablePatients] = useState<any[]>([])
  const [isSavingConsultation, setIsSavingConsultation] = useState(false)
  const [inlineDocOpen, setInlineDocOpen] = useState(false)
  const [inlineDocLoading, setInlineDocLoading] = useState(false)
  const [inlineDocError, setInlineDocError] = useState<string | null>(null)
  const [inlineDoc, setInlineDoc] = useState<InlineDocument | null>(null)
  const recognitionRef = useRef<RecognitionHandle | null>(null)
  const consultationRecognitionRef = useRef<any>(null) // Para gravação de consulta
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isListeningRef = useRef(false) // Ref para verificar estado atual de isListening
  const immediateListenTimeoutRef = useRef<number | null>(null)
  const autoResumeRequestedRef = useRef(false)
  const wasSpeakingRef = useRef(false) // Ref para rastrear quando a IA estava falando
  const lastSpeechEndTimeRef = useRef<number>(0) // Timestamp da última vez que a IA terminou de falar
  const hasActiveSimulationRef = useRef(false) // Ref para rastrear se há simulação ativa
  const isStartingRef = useRef(false) // Lock para evitar múltiplas inicializações simultâneas
  const hasUserEnabledMicRef = useRef(false) // Flag para rastrear quando o usuário explicitamente ativou o microfone
  const { user } = useAuth()

  const {
    messages,
    sendMessage,
    isProcessing,
    isSpeaking,
    error,
    usedEndpoints,
    lastIntent
  } = useMedCannLabConversation({
    documentContext: inlineDoc ? { id: inlineDoc.id, title: inlineDoc.title, summary: inlineDoc.summary ?? undefined, content: inlineDoc.content ?? undefined } : null
  })

  const sanitizeInlineText = useCallback((value: string) => {
    // Remover caracteres de controle comuns que podem quebrar renderização
    return (value || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim()
  }, [])

  const openInlineDocument = useCallback(async (documentId: string) => {
    const id = (documentId || '').trim()
    if (!id) return

    setInlineDocOpen(true)
    setIsOpen(true) // garantir que o chat esteja visível
    setInlineDocLoading(true)
    setInlineDocError(null)
    setInlineDoc(null)

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, summary, content, file_url, file_type, category, created_at, updated_at')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        setInlineDocError('Documento não encontrado.')
        return
      }

      setInlineDoc({
        id: data.id,
        title: data.title,
        summary: data.summary,
        content: data.content,
        file_url: (data as any).file_url ?? null,
        file_type: (data as any).file_type ?? null,
        category: data.category ?? null,
        created_at: (data as any).created_at ?? null,
        updated_at: (data as any).updated_at ?? null
      })

      // Trigger: jogar o documento no chat para a Nôa analisar em tempo real
      sendMessage('Analise o documento que acabei de abrir no chat.', {
        documentForAnalysis: {
          id: data.id,
          title: data.title ?? '',
          summary: data.summary ?? undefined,
          content: data.content ?? undefined
        }
      })
    } catch (e: any) {
      console.warn('⚠️ Falha ao abrir documento inline:', e)
      setInlineDocError('Não foi possível carregar o documento agora. Verifique permissões/RLS.')
    } finally {
      setInlineDocLoading(false)
    }
  }, [setIsOpen, sendMessage])

  // Listener: abrir documento inline via comando determinístico (resposta "1" após lista de docs)
  useEffect(() => {
    const handleNoaCommand = (event: Event) => {
      const custom = event as CustomEvent<NoaCommandDetail>
      const detail = custom.detail
      if (!detail) return
      if (detail.type !== 'show-document-inline') return
      const docId = (
        (detail.payload?.document_id as string | undefined) ??
        (detail as unknown as { document_id?: string }).document_id
      )?.trim()
      if (!docId) {
        console.warn('⚠️ show-document-inline sem document_id:', detail)
        return
      }
      openInlineDocument(docId)
    }

    window.addEventListener('noaCommand', handleNoaCommand as EventListener)
    return () => window.removeEventListener('noaCommand', handleNoaCommand as EventListener)
  }, [openInlineDocument])

  // Inicializar wasSpeakingRef com o estado inicial de isSpeaking
  useEffect(() => {
    // Atualizar timestamp quando a IA termina de falar
    if (wasSpeakingRef.current && !isSpeaking) {
      lastSpeechEndTimeRef.current = Date.now()
      console.log('🔇 IA terminou de falar, registrando timestamp para evitar eco')
    }
    wasSpeakingRef.current = isSpeaking
    console.log('🎤 wasSpeakingRef inicializado:', isSpeaking)
  }, [isSpeaking]) // Atualizar sempre que isSpeaking mudar

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }

    // Atualizar ref de simulação ativa sempre que as mensagens mudarem
    const hasActiveSimulation = messages.some(msg => {
      const metadata = msg.metadata as Record<string, any> | undefined
      return metadata?.simulationActive === true &&
        metadata?.simulationRole === 'patient'
    })

    // Verificar se há avaliação clínica ativa
    // O metadata pode estar aninhado (metadata.metadata) ou direto
    const hasActiveAssessment = messages.some(msg => {
      const metadata = msg.metadata as Record<string, any> | undefined
      const nestedMetadata = metadata?.metadata as Record<string, any> | undefined

      return metadata?.assessmentActive === true ||
        nestedMetadata?.assessmentActive === true ||
        metadata?.type === 'assessment' ||
        nestedMetadata?.type === 'assessment' ||
        (metadata?.intent === 'IMRE_ANALYSIS' && nestedMetadata?.assessmentActive !== false)
    })

    hasActiveSimulationRef.current = hasActiveSimulation || hasActiveAssessment

    if (hasActiveSimulation) {
      console.log('🎭 Simulação ativa detectada - microfone terá prioridade máxima')
    }
    if (hasActiveAssessment) {
      console.log('📋 Avaliação clínica ativa detectada - microfone terá prioridade máxima')
    }

    // Log detalhado para debug
    if (hasActiveAssessment || hasActiveSimulation) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage) {
        console.log('🔍 Metadata da última mensagem:', {
          metadata: lastMessage.metadata,
          nestedMetadata: (lastMessage.metadata as Record<string, any>)?.metadata
        })
      }
    }
  }, [messages])

  useEffect(() => {
    // Se hideButton é true E position é inline, sempre abrir (sem botão e sem controle externo)
    // Se contextIsOpen é true, abrir o chat (permite botões customizados controlarem via context)
    const shouldBeOpen = (hideButton && position === 'inline') || contextIsOpen
    console.log('🔍 NoaConversationalInterface - Atualizando isOpen:', { shouldBeOpen, hideButton, contextIsOpen, position })
    setIsOpen(shouldBeOpen)
  }, [contextIsOpen, hideButton, position])

  useEffect(() => {
    if (pendingMessage) {
      console.log('📨 Processando mensagem pendente:', pendingMessage.substring(0, 100))
      setInputValue(pendingMessage)
      // Aguardar um pouco para garantir que o chat esteja totalmente pronto
      setTimeout(() => {
        sendMessage(pendingMessage)
        clearPendingMessage()
        // Limpar o input após enviar a mensagem pendente
        setInputValue('')
      }, 500)
    }
  }, [pendingMessage, sendMessage, clearPendingMessage])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stopped = true
        if (recognitionRef.current.timer) {
          window.clearTimeout(recognitionRef.current.timer)
          recognitionRef.current.timer = undefined
        }
        recognitionRef.current.recognition.onresult = null
        recognitionRef.current.recognition.onerror = null
        recognitionRef.current.recognition.onend = null
        recognitionRef.current.recognition.stop()
        const text = recognitionRef.current.buffer.trim()
        if (text.length > 0) {
          sendMessage(text, { preferVoice: true })
        }
        recognitionRef.current = null
      }
    }
  }, [sendMessage])

  const stopListening = useCallback(() => {
    // REMOVIDO: Todas as proteções que impediam parar o microfone
    // Controle 100% manual - usuário pode parar quando quiser

    console.log('🛑 Parando escuta de voz (chat fechado)...')

    // Verificar estado atual antes de parar
    if (recognitionRef.current && recognitionRef.current.recognition) {
      try {
        const currentState = recognitionRef.current.recognition.state
        console.log('🔍 Estado do reconhecimento antes de parar:', currentState)
      } catch (e) {
        console.warn('⚠️ Não foi possível verificar estado antes de parar:', e)
      }
    }

    // Atualizar ref PRIMEIRO para evitar reinício
    isListeningRef.current = false

    const handle = recognitionRef.current
    if (handle) {
      handle.stopped = true

      // Limpar todos os timers
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      if (handle.inactivityTimer) {
        window.clearTimeout(handle.inactivityTimer)
        handle.inactivityTimer = undefined
      }
      // Limpar timer de duração máxima
      const maxTimer = (handle as any).maxDurationTimer
      if (maxTimer) {
        window.clearTimeout(maxTimer)
          ; (handle as any).maxDurationTimer = undefined
      }

      // Limpar timer de fallback se existir
      const fallbackTimer = (handle as any).fallbackTimer
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
          ; (handle as any).fallbackTimer = undefined
      }

      // Remover callbacks para evitar reinício
      handle.recognition.onresult = null
      handle.recognition.onerror = null
      handle.recognition.onend = null
      try {
        handle.recognition.stop()
      } catch (e) {
        // Ignorar erros ao parar
      }

      // Enviar texto capturado se houver
      const text = handle.buffer.trim()
      if (text.length > 0) {
        sendMessage(text, { preferVoice: true })
      }

      recognitionRef.current = null
    }
    setIsListening(false)
  }, [sendMessage, isOpen])

  const startListening = useCallback(async (force: boolean = false): Promise<void> => {
    console.log('🎤 startListening chamado. Estado atual:', {
      isOpen,
      isProcessing,
      isSpeaking,
      isListening: isListeningRef.current,
      hasActiveSimulation: hasActiveSimulationRef.current,
      isStarting: isStartingRef.current,
      force
    })

    // Se for forçado (ação manual do usuário), ignorar verificações de estado
    if (!force) {
      // Verificar se já está iniciando - ignorar chamadas duplicadas
      if (isStartingRef.current) {
        console.log('⏳ Já há uma inicialização em andamento, ignorando chamada duplicada')
        return
      }

      // Verificar se já está realmente ouvindo
      if (recognitionRef.current && recognitionRef.current.recognition) {
        try {
          const currentState = recognitionRef.current.recognition.state
          if (currentState === 'listening' || currentState === 'starting') {
            console.log('✅ Reconhecimento já está ativo, não reiniciar:', currentState)
            return
          }
        } catch (e) {
          // Continuar se não conseguir verificar
        }
      }
    } else {
      // Se for forçado, limpar qualquer estado bloqueante
      isStartingRef.current = false
      console.log('🔄 Início forçado - limpando estados bloqueantes')
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('⚠️ Reconhecimento de voz não suportado neste navegador.')
      alert('Reconhecimento de voz não está disponível no seu navegador. Por favor, use o campo de texto para digitar sua mensagem.')
      return
    }

    // Marcar como iniciando
    isStartingRef.current = true

    // Limpar qualquer reconhecimento anterior que possa estar travado
    if (recognitionRef.current && recognitionRef.current.recognition) {
      try {
        const currentState = recognitionRef.current.recognition.state
        console.log('🔍 Estado do reconhecimento anterior:', currentState)
        if (currentState === 'listening' || currentState === 'starting') {
          console.log('🔄 Parando reconhecimento anterior antes de iniciar novo')
          recognitionRef.current.recognition.stop()
          recognitionRef.current.stopped = true
        }
      } catch (e) {
        console.log('ℹ️ Não foi possível verificar estado do reconhecimento, continuando...')
      }
    }

    // Resetar estados antes de iniciar
    isListeningRef.current = false
    setIsListening(false)

    // Verificar permissões de microfone antes de iniciar
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Liberar stream imediatamente - só precisamos verificar permissão
        stream.getTracks().forEach(track => track.stop())
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar permissão de microfone:', error)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador e tente novamente.')
        return
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('Nenhum microfone encontrado. Verifique se o dispositivo está conectado e tente novamente.')
        return
      } else {
        console.warn('⚠️ Aviso ao verificar permissão, mas continuando...', error)
      }
    }

    // Parar fala da IA imediatamente quando iniciar escuta
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    window.dispatchEvent(new Event('noaStopSpeech'))

    // NÃO parar escuta anterior - deixar que o onend cuide do reinício
    // Isso evita abortar o microfone desnecessariamente

    console.log('🎤 Iniciando escuta de voz...')

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition: any = new SpeechRecognition()

    // Configurações otimizadas para melhor reconhecimento
    recognition.lang = 'pt-BR'
    recognition.continuous = false // CHAT COMUM: não contínuo - para quando o usuário para de falar
    recognition.interimResults = true // Mostrar resultados intermediários no input
    recognition.maxAlternatives = 1 // Uma alternativa é suficiente

    // Configurações adicionais para melhorar qualidade (se disponíveis)
    // REMOVIDO: grammars causava erro - não é necessário para funcionamento básico
    // if ('grammars' in recognition) {
    //   recognition.grammars = null // Isso causava erro TypeError
    // }

    // Configurações de áudio (se disponíveis)
    // REMOVIDO: serviceURI não é padrão e pode causar problemas
    // if ('serviceURI' in recognition) {
    //   recognition.serviceURI = 'wss://speech.googleapis.com/v1/speech:recognize'
    // }

    const handle: RecognitionHandle = {
      recognition,
      buffer: '',
      retryCount: 0,
      maxRetries: 3,
      lastError: null,
      startTime: Date.now(),
      maxDuration: 15000, // 15 segundos máximo
      inactivityTimer: undefined,
      restartScheduled: false // Inicializar flag de reinício agendado
    }
    recognitionRef.current = handle

    // Timer máximo: parar após 15 segundos (será limpo em stopListening)
    let maxDurationTimer: number | undefined = undefined

    const flush = () => {
      const text = handle.buffer.trim()
      console.log('🔄 flush() chamado. Buffer:', text, 'Tamanho:', text.length)
      if (text.length > 0) {
        console.log('📤 Enviando mensagem capturada por voz:', text)
        try {
          // Limpar o input antes de enviar
          setInputValue('')
          sendMessage(text, { preferVoice: true })
          console.log('✅ sendMessage chamado com sucesso')
          handle.buffer = ''
        } catch (error) {
          console.error('❌ Erro ao enviar mensagem:', error)
        }
      } else {
        console.log('⚠️ flush() chamado mas buffer está vazio')
      }
      // REMOVIDO: Não parar microfone após enviar mensagem - manter sempre ligado
      // if (handle.stopped !== true) {
      //   handle.stopped = true
      //   stopListening()
      // }
    }

    const scheduleFlush = () => {
      // Limpar timer anterior
      if (handle.timer) {
        window.clearTimeout(handle.timer)
      }
      // Limpar timer de inatividade
      if (handle.inactivityTimer) {
        window.clearTimeout(handle.inactivityTimer)
        handle.inactivityTimer = undefined
      }

      // Timer para enviar após 1.5 segundos de silêncio (aumentado de 900ms)
      console.log('⏰ Agendando flush() em 1.5s. Buffer atual:', handle.buffer)
      handle.timer = window.setTimeout(() => {
        console.log('⏰ Timer de flush() disparado. Buffer:', handle.buffer)
        flush()
      }, 1500)

      // REMOVIDO: Timer de inatividade - o microfone deve ficar sempre ligado
      // handle.inactivityTimer = window.setTimeout(() => {
      //   if (handle.buffer.trim().length === 0) {
      //     console.log('⏱️ Sem atividade de voz por 5 segundos, parando microfone')
      //     handle.stopped = true
      //     stopListening()
      //   }
      // }, 5000)
    }

      // REMOVIDO: Timeout máximo - o microfone deve ficar sempre ligado
      // maxDurationTimer = window.setTimeout(() => {
      //   if (recognitionRef.current === handle && !handle.stopped) {
      //     console.log('⏱️ Tempo máximo de escuta atingido (15s), parando microfone')
      //     const text = handle.buffer.trim()
      //     if (text.length > 0) {
      //       flush()
      //     } else {
      //       handle.stopped = true
      //       stopListening()
      //     }
      //   }
      // }, handle.maxDuration || 15000)

      // Armazenar timer no handle para poder limpar depois
      ; (handle as any).maxDurationTimer = maxDurationTimer

    // Função para limpar caracteres especiais inválidos
    const cleanTranscript = (text: string): string => {
      // Remover caracteres especiais inválidos comuns em erros de reconhecimento
      return text
        .replace(/[~*]/g, '') // Remover ~ e *
        .replace(/\s+/g, ' ') // Normalizar espaços múltiplos
        .trim()
    }

    // Função para validar se o texto não parece ser eco da IA
    // SIMPLIFICADA: Aceitar quase tudo, apenas rejeitar texto vazio
    const isValidUserInput = (text: string): boolean => {
      const cleaned = cleanTranscript(text.toLowerCase())

      // Apenas rejeitar texto completamente vazio
      if (cleaned.length < 1) {
        console.log('⚠️ Texto vazio, rejeitando')
        return false
      }

      // Aceitar qualquer texto não vazio - confiar no usuário
      return true
    }

    recognition.onresult = (event: any) => {
      console.log('🎤 onresult disparado! Número de resultados:', event.results.length, 'resultIndex:', event.resultIndex)

      // REMOVIDO: Todas as verificações de bloqueio - deixar o microfone funcionar livremente
      // O usuário pode falar a qualquer momento

      // Resetar timer de inatividade quando há atividade
      if (handle.inactivityTimer) {
        window.clearTimeout(handle.inactivityTimer)
        handle.inactivityTimer = undefined
      }

      let allFinalTexts: string[] = []
      let allIntermediateTexts: string[] = []

      // Processar todos os resultados do evento atual
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const rawTranscript = result[0].transcript.trim()
        const cleanedTranscript = cleanTranscript(rawTranscript)

        if (cleanedTranscript.length > 0) {
          if (result.isFinal) {
            // Resultado FINAL: SEMPRE aceitar e processar
            allFinalTexts.push(cleanedTranscript)
            console.log('🎤 Texto capturado (final, limpo):', cleanedTranscript, '(original:', rawTranscript + ')')
            // Atualizar input imediatamente
            setInputValue(cleanedTranscript)
          } else {
            // Resultado intermediário: mostrar no input imediatamente para feedback visual
            allIntermediateTexts.push(cleanedTranscript)
            console.log('🎤 Texto capturado (intermediário, limpo):', cleanedTranscript, '(original:', rawTranscript + ')')
            // Atualizar input imediatamente com texto intermediário
            const currentIntermediate = allIntermediateTexts.join(' ')
            setInputValue(currentIntermediate)
            handle.buffer = currentIntermediate.trim()
            console.log('📝 Input atualizado com texto intermediário:', currentIntermediate)
          }
        }
      }

      // Se houver resultados FINAIS, usar apenas o último (mais completo)
      if (allFinalTexts.length > 0) {
        // Usar o último resultado final (geralmente o mais completo)
        const finalText = allFinalTexts[allFinalTexts.length - 1]

        // IMPORTANTE: Substituir o buffer ao invés de acumular
        // Isso evita duplicações de múltiplos eventos onresult
        handle.buffer = finalText.trim()

        // Atualizar o input para feedback visual
        setInputValue(finalText.trim())

        console.log('✅ MICROFONE FUNCIONANDO! Texto final capturado e validado:', finalText)
        console.log('📝 Buffer atualizado (substituído):', handle.buffer)
        console.log('📝 Input atualizado com texto capturado')

        // Agendar envio após silêncio
        scheduleFlush()
      } else if (allIntermediateTexts.length > 0) {
        // Se não há resultado final mas há texto intermediário, mostrar no input para feedback visual
        const intermediateText = allIntermediateTexts.join(' ')
        console.log('✅ MICROFONE FUNCIONANDO! Texto intermediário:', intermediateText)
        // Atualizar input com texto intermediário para feedback visual
        // IMPORTANTE: Substituir qualquer texto pré-existente
        setInputValue(intermediateText)
        // Também atualizar o buffer com texto intermediário para garantir que seja enviado se não houver resultado final
        handle.buffer = intermediateText.trim()
        console.log('📝 Input e buffer atualizados com texto intermediário:', intermediateText)
        // NÃO agendar flush ainda - aguardar resultado final, mas manter no buffer
      } else {
        console.log('⚠️ onresult chamado mas sem texto capturado válido')
      }
    }

    recognition.onerror = (event: any) => {
      handle.lastError = event.error

      // Logar todos os erros para debug com mais detalhes
      console.error('🔍 Erro no reconhecimento de voz:', {
        error: event.error,
        message: event.message || 'Sem mensagem',
        state: recognition.state,
        timestamp: new Date().toISOString(),
        handleMatch: recognitionRef.current === handle,
        isOpen,
        hasActiveSimulation: hasActiveSimulationRef.current
      })

      // Ignorar erros não críticos silenciosamente
      if (event.error === 'no-speech') {
        console.log('ℹ️ Nenhuma fala detectada (normal)')
        return
      }

      if (event.error === 'aborted') {
        console.log('ℹ️ Reconhecimento abortado (normal)')
        // Marcar que houve abort para prevenir reinício automático
        handle.lastError = 'aborted'
        handle.stopped = true
        setIsListening(false)
        isListeningRef.current = false
        // NÃO reiniciar automaticamente após abort - isso causa loop infinito
        console.log('ℹ️ Reconhecimento abortado - não reiniciando automaticamente')
        return
      }

      // Para erros críticos, logar e informar usuário
      console.error('❌ Erro crítico no reconhecimento de voz:', event.error)

      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }

      // Limpar timer de inatividade
      if (handle.inactivityTimer) {
        window.clearTimeout(handle.inactivityTimer)
        handle.inactivityTimer = undefined
      }

      // Limpar timer de duração máxima
      if ((handle as any).maxDurationTimer) {
        window.clearTimeout((handle as any).maxDurationTimer)
          ; (handle as any).maxDurationTimer = undefined
      }

      // Tentar enviar o que foi capturado antes do erro
      const text = handle.buffer.trim()
      if (text.length > 0) {
        flush()
      }

      // Parar sempre em caso de erro - não tentar reiniciar automaticamente
      handle.stopped = true
      setIsListening(false)
      isListeningRef.current = false
      recognitionRef.current = null

      // Informar usuário apenas para erros críticos
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.warn('⚠️ Permissão de microfone negada')
        alert('Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador e tente novamente.')
      } else if (event.error === 'audio-capture') {
        alert('Não foi possível acessar o microfone. Verifique se o dispositivo está conectado e tente novamente.')
      } else if (event.error === 'network') {
        console.warn('⚠️ Erro de rede no reconhecimento de voz')
        // Não mostrar alerta para erro de rede - pode ser temporário
      }
    }

    // Handler para quando o reconhecimento realmente começar
    recognition.onstart = () => {
      console.log('🎤 Reconhecimento de voz iniciado (onstart)')
      // Limpar timer de fallback se existir
      if ((handle as any).fallbackTimer) {
        clearTimeout((handle as any).fallbackTimer)
          ; (handle as any).fallbackTimer = undefined
      }
      // Sincronizar estado quando realmente começar
      if (recognitionRef.current === handle) {
        setIsListening(true)
        isListeningRef.current = true
        isStartingRef.current = false // Liberar lock
        // Marcar que o usuário ativou o microfone com sucesso
        hasUserEnabledMicRef.current = true
        console.log('✅ Estado atualizado via onstart - usuário ativou microfone')
      }
    }

    recognition.onend = () => {
      console.log('🛑 Evento onend disparado - microfone parou')

      // Enviar texto capturado se houver
      if (handle.buffer.trim().length > 0) {
        console.log('📤 Enviando texto capturado:', handle.buffer)
        if (handle.timer) {
          window.clearTimeout(handle.timer)
          handle.timer = undefined
        }
        flush()
      }

      // SEMPRE parar o microfone quando onend disparar
      // Controle 100% manual - usuário clica para ligar novamente
      console.log('✅ Microfone parou - controle manual: clique no botão para ligar novamente')
      setIsListening(false)
      isListeningRef.current = false
      recognitionRef.current = null
    }

    try {
      // NÃO parar reconhecimento anterior - deixar que o onend cuide do reinício
      // Isso evita abortar o microfone desnecessariamente

      recognition.start()
      // NÃO atualizar estado imediatamente - esperar confirmação de que realmente iniciou
      // O estado só será atualizado quando onstart disparar (linha 494-506)
      autoResumeRequestedRef.current = false
      console.log('🎤 Comando start() enviado ao reconhecimento - aguardando confirmação...')
      console.log('🔍 Configuração:', {
        lang: recognition.lang,
        continuous: recognition.continuous,
        interimResults: recognition.interimResults
      })

      // Fallback: se onstart não disparar em 1 segundo, verificar estado real
      const fallbackTimer = setTimeout(() => {
        if (recognitionRef.current === handle && !isListeningRef.current) {
          console.log('⚠️ onstart não disparou após 1s, verificando estado real do reconhecimento...')
          try {
            const state = recognition.state
            console.log('🔍 Estado real do reconhecimento:', state)
            if (state === 'listening' || state === 'starting') {
              // Só atualizar se realmente estiver funcionando
              setIsListening(true)
              isListeningRef.current = true
              isStartingRef.current = false // Liberar lock
              console.log('✅ Estado atualizado via fallback - reconhecimento confirmado como ativo')
            } else if (state === 'idle' || state === 'aborted') {
              // Reconhecimento não iniciou - tentar novamente se for avaliação ativa
              const hasActiveSimulation = hasActiveSimulationRef.current
              isStartingRef.current = false // Liberar lock mesmo se falhar

              if (hasActiveSimulation) {
                console.log('🔄 Avaliação/Simulação ativa - tentando reiniciar reconhecimento...')
                setTimeout(() => {
                  if (recognitionRef.current === handle && isOpen && !isStartingRef.current) {
                    try {
                      recognition.start()
                      console.log('🔄 Tentativa de reinício do reconhecimento')
                    } catch (e) {
                      console.error('❌ Erro ao tentar reiniciar:', e)
                    }
                  }
                }, 500)
              } else {
                console.error('❌ Reconhecimento NÃO iniciou! Estado:', state)
                setIsListening(false)
                isListeningRef.current = false
                recognitionRef.current = null
                // Não mostrar alerta - apenas logar
                console.warn('⚠️ Não foi possível iniciar o microfone. Estado:', state)
              }
            } else {
              // Outro estado - apenas logar
              console.warn('⚠️ Estado inesperado do reconhecimento:', state)
              isStartingRef.current = false // Liberar lock
            }
          } catch (e) {
            console.error('❌ Erro ao verificar estado do reconhecimento:', e)
            // Se não conseguir verificar, assumir que não funcionou
            setIsListening(false)
            isListeningRef.current = false
            isStartingRef.current = false // Liberar lock
            recognitionRef.current = null
            console.warn('⚠️ Erro ao verificar o estado do microfone')
          }
        } else {
          // Handle mudou ou já está ouvindo - liberar lock
          isStartingRef.current = false
        }
      }, 1000)

        // Armazenar timer no handle para limpar se necessário
        ; (handle as any).fallbackTimer = fallbackTimer
    } catch (error: any) {
      console.error('❌ Erro ao iniciar escuta:', error)
      isStartingRef.current = false // Liberar lock em caso de erro

      // Se o erro for "already started", apenas logar
      if (error.message && error.message.includes('already started')) {
        console.log('ℹ️ Reconhecimento já estava iniciado, continuando...')
        setIsListening(true)
        isListeningRef.current = true
        isStartingRef.current = false // Liberar lock
        return
      }
      setIsListening(false)
      isListeningRef.current = false
      recognitionRef.current = null
      autoResumeRequestedRef.current = false
      setShouldAutoResume(false)
    }
  }, [isOpen, isProcessing, isSpeaking, sendMessage, stopListening, setShouldAutoResume])

  // REMOVIDO: Não desligar microfone quando a IA fala
  // O microfone deve permanecer sempre ativo para capturar a resposta do usuário
  // O usuário pode interromper a IA se necessário

  // 🎤 LIGAR MICROFONE AUTOMATICAMENTE quando a IA terminar de falar
  // CRÍTICO: O microfone DEVE ligar sempre que a IA terminar de falar
  // Este useEffect é um BACKUP caso o evento noaImmediateListeningRequest não funcione
  useEffect(() => {
    // Detectar quando a IA termina de falar (mudança de isSpeaking: true -> false)
    const wasSpeaking = wasSpeakingRef.current
    const justFinishedSpeaking = wasSpeaking && !isSpeaking && !isProcessing
    const hasActiveSimulation = hasActiveSimulationRef.current

    if (justFinishedSpeaking) {
      console.log('🔊 [BACKUP] IA terminou de falar, preparando para ligar microfone automaticamente...', {
        wasSpeaking,
        isSpeaking,
        isProcessing,
        hasActiveSimulation
      })

      // Durante avaliações, usar delay menor e ser mais agressivo no reinício
      const delay = hasActiveSimulation ? 300 : 600

      // Aguardar um pequeno delay para garantir que a fala terminou completamente
      const autoStartTimer = setTimeout(() => {
        // SIMPLIFICADO: Apenas verificar se o chat está aberto
        if (!isOpen || isRecordingConsultation || showPatientSelector) {
          return
        }

        // Verificar se já está realmente ouvindo
        let recognitionActuallyActive = false
        if (recognitionRef.current && recognitionRef.current.recognition) {
          try {
            const currentState = recognitionRef.current.recognition.state
            recognitionActuallyActive = currentState === 'listening' || currentState === 'starting'
            if (recognitionActuallyActive) {
              return // Já está ouvindo
            }
          } catch (e) {
            // Ignorar erro
          }
        }

        // NÃO limpar estado - deixar que o onend cuide do reinício
        // Isso evita abortar o microfone desnecessariamente

        // Sempre tentar ligar se não está ativo
        if (!isStartingRef.current) {
          console.log('🎤✅ [BACKUP] Ligando microfone automaticamente após IA terminar de falar')
          startListening().catch(error => {
            console.error('❌ [BACKUP] Erro ao ligar microfone:', error)
            // Tentar novamente após um delay se falhar
            setTimeout(() => {
              if (!isStartingRef.current && isOpen) {
                startListening().catch(err => {
                  console.error('❌ [BACKUP] Erro ao tentar ligar microfone novamente:', err)
                })
              }
            }, 500)
          })
        }
      }, delay)

      return () => {
        clearTimeout(autoStartTimer)
      }
    }

    // Atualizar ref para rastrear mudanças (sempre atualizar)
    // Atualizar timestamp quando a IA termina de falar
    if (wasSpeakingRef.current && !isSpeaking) {
      lastSpeechEndTimeRef.current = Date.now()
      console.log('🔇 IA terminou de falar, registrando timestamp para evitar eco')
    }
    wasSpeakingRef.current = isSpeaking
  }, [isSpeaking, isProcessing, isOpen, isRecordingConsultation, showPatientSelector, isListening, startListening])

  // REMOVIDO: Lógica automática de reinício do microfone
  // Controle 100% manual - usuário clica no botão para ligar/desligar
  // Isso evita loops infinitos e problemas de reinício automático

  // REMOVIDO: Lógica de auto-resume

  // 🔍 VERIFICAÇÃO PERIÓDICA DO ESTADO DO RECONHECIMENTO (DESABILITADA PARA EVITAR LOOPS)
  // Este hook foi desabilitado porque estava causando loops infinitos de iniciar/parar microfone
  // O estado do microfone é gerenciado pelos eventos onstart/onend do SpeechRecognition API
  // useEffect(() => {
  //   if (!isListening) return
  //   // ... código desabilitado ...
  // }, [isListening])

  // 🎤 GERENCIAR MICROFONE quando o chat fechar
  useEffect(() => {
    if (!isOpen) {
      // Parar microfone quando fechar o chat (exceto durante simulações ativas)
      const hasActiveSimulation = hasActiveSimulationRef.current
      if (hasActiveSimulation) {
        console.log('🎭 [SIMULAÇÃO] Chat fechado mas simulação ativa - mantendo microfone')
        return
      }

      if (isListening || isListeningRef.current) {
        console.log('🛑 Parando microfone ao fechar chat')
        stopListening()
      }
      // Resetar flag quando o chat fecha
      hasUserEnabledMicRef.current = false
      console.log('🔄 Flag hasUserEnabledMic resetada (chat fechado)')
    }
    // NÃO iniciar automaticamente ao abrir - o usuário deve clicar no botão
    // Isso evita solicitações de permissão não solicitadas
  }, [isOpen, stopListening]) // Apenas quando isOpen muda

  // 🎤 LISTENER DE EVENTO - Ligar microfone quando solicitado
  // Usando closure para acessar valores atuais sem recriar listener
  const handleImmediateListeningRef = useRef<((event: Event) => void) | null>(null)

  useEffect(() => {
    // Criar função que sempre acessa os valores mais recentes
    handleImmediateListeningRef.current = (event: Event) => {
      console.log('🎤 Evento noaImmediateListeningRequest recebido')

      if (isRecordingConsultation || showPatientSelector) {
        console.log('⚠️ Não ligando microfone: gravando consulta ou mostrando seletor')
        return
      }

      const custom = event as CustomEvent<{ delay?: number }>
      const delay = custom.detail?.delay ?? 500

      const triggerListening = () => {
        // SIMPLIFICADO: Sempre tentar ligar o microfone se o chat estiver aberto
        // Removidas todas as verificações de bloqueio
        if (!isOpen) {
          console.log('⚠️ Chat não está aberto, não ligando microfone')
          return
        }

        // Verificar se já está realmente ouvindo
        let recognitionActuallyActive = false
        if (recognitionRef.current && recognitionRef.current.recognition) {
          try {
            const currentState = recognitionRef.current.recognition.state
            recognitionActuallyActive = currentState === 'listening' || currentState === 'starting'
            if (recognitionActuallyActive) {
              console.log('✅ Microfone já está ativo, não reiniciar')
              return
            }
          } catch (e) {
            // Ignorar erro e continuar
          }
        }

        // Limpar estado inconsistente se necessário
        if (recognitionRef.current && !recognitionActuallyActive) {
          try {
            recognitionRef.current.recognition?.stop()
          } catch (e) {
            // Ignorar
          }
          recognitionRef.current = null
          isListeningRef.current = false
          setIsListening(false)
        }

        console.log('🎤✅ Ligando microfone via evento noaImmediateListeningRequest')
        startListening().catch(error => {
          console.error('❌ Erro ao ligar microfone via evento:', error)
        })
      }

      // Limpar timeout anterior se existir
      if (immediateListenTimeoutRef.current) {
        window.clearTimeout(immediateListenTimeoutRef.current)
      }

      // Agendar ligar microfone após delay
      immediateListenTimeoutRef.current = window.setTimeout(() => {
        triggerListening()
        immediateListenTimeoutRef.current = null
      }, delay)
    }

    const handler = (event: Event) => {
      if (handleImmediateListeningRef.current) {
        handleImmediateListeningRef.current(event)
      }
    }

    window.addEventListener('noaImmediateListeningRequest', handler)

    return () => {
      window.removeEventListener('noaImmediateListeningRequest', handler)
      if (immediateListenTimeoutRef.current) {
        window.clearTimeout(immediateListenTimeoutRef.current)
        immediateListenTimeoutRef.current = null
      }
    }
  }, [isOpen, isProcessing, isSpeaking, isListening, isRecordingConsultation, showPatientSelector, startListening])

  // REMOVIDO: Auto-iniciar microfone e detecção de voz contínua
  // O microfone agora só funciona quando o usuário clica no botão manualmente

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return
    // NÃO parar microfone quando enviar mensagem - ele deve permanecer ligado
    sendMessage(inputValue)
    setInputValue('')
  }, [inputValue, sendMessage, isListening, stopListening])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const toggleListening = useCallback(async () => {
    const hasActiveSimulation = hasActiveSimulationRef.current
    console.log('🎤 Botão de microfone clicado. Estado atual:', {
      isListening,
      isListeningRef: isListeningRef.current,
      isProcessing,
      isSpeaking,
      hasActiveSimulation
    })

    // Se está processando ou gravando consulta, não fazer nada
    if (isProcessing || isRecordingConsultation) {
      console.log('⚠️ Não é possível usar microfone: processando ou gravando consulta')
      return
    }

    if (isListening || isListeningRef.current) {
      // Durante avaliações, não permitir parar manualmente
      // NÃO permitir parar o microfone manualmente quando o chat está aberto
      // O microfone deve permanecer sempre ligado
      if (isOpen) {
        console.log('⚠️ [CHAT ABERTO] Não é possível parar microfone manualmente - ele deve permanecer ligado')
        return
      }
      if (hasActiveSimulation) {
        console.log('⚠️ [AVALIAÇÃO ATIVA] Não é possível parar microfone manualmente durante avaliação')
        return
      }
      console.log('🛑 Parando microfone manualmente (chat fechado)')
      setShouldAutoResume(false)
      stopListening()
    } else {
      console.log('▶️ Iniciando microfone manualmente', hasActiveSimulation ? '[AVALIAÇÃO ATIVA]' : '')
      setShouldAutoResume(true)

      // Se a IA está falando, parar a fala primeiro
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        console.log('🔇 Parando fala da IA para iniciar microfone')
        window.speechSynthesis.cancel()
        window.dispatchEvent(new Event('noaStopSpeech'))
        // Aguardar um pouco para garantir que a fala parou
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Forçar parar qualquer reconhecimento anterior antes de iniciar novo
      if (recognitionRef.current) {
        try {
          recognitionRef.current.recognition?.stop()
          recognitionRef.current.stopped = true
        } catch (e) {
          console.warn('⚠️ Erro ao parar reconhecimento anterior:', e)
        }
        recognitionRef.current = null
      }

      // Resetar TODOS os estados que podem bloquear
      isListeningRef.current = false
      setIsListening(false)
      isStartingRef.current = false // Forçar liberação do lock

      // Limpar qualquer handle anterior que possa estar travado
      if (recognitionRef.current) {
        const handleToClean = recognitionRef.current as RecognitionHandle
        try {
          handleToClean.stopped = true
          if (handleToClean.recognition) {
            handleToClean.recognition.onresult = null
            handleToClean.recognition.onerror = null
            handleToClean.recognition.onend = null
            try {
              handleToClean.recognition.stop()
            } catch (e) {
              // Ignorar
            }
          }
        } catch (e) {
          console.warn('⚠️ Erro ao limpar handle anterior:', e)
        }
        recognitionRef.current = null
      }

      // Pequeno delay para garantir limpeza completa
      await new Promise(resolve => setTimeout(resolve, 300))

      // Iniciar microfone - SEMPRE tentar, mesmo se houver algum estado bloqueado
      try {
        await startListening(true) // Forçar início (ação manual do usuário)
        console.log('✅ Microfone iniciado com sucesso', hasActiveSimulation ? '[AVALIAÇÃO ATIVA]' : '')
      } catch (error) {
        console.error('❌ Erro ao iniciar microfone:', error)
        // Tentar novamente após um delay maior
        setTimeout(async () => {
          try {
            isStartingRef.current = false // Liberar lock novamente
            await startListening(true) // Forçar início novamente
            console.log('✅ Microfone iniciado na segunda tentativa')
          } catch (retryError) {
            console.error('❌ Erro na segunda tentativa:', retryError)
            alert('Não foi possível iniciar o microfone. Verifique as permissões e tente novamente.')
          }
        }, 1000)
      }
    }
  }, [isListening, startListening, stopListening, setShouldAutoResume, isProcessing, isRecordingConsultation, isSpeaking])

  // Carregar pacientes disponíveis
  const loadPatients = useCallback(async () => {
    if (!user) return

    try {
      const userType = normalizeUserType(user.type)
      if (userType !== 'profissional' && userType !== 'admin') return

      // Buscar pacientes do profissional
      // Primeiro buscar assessments, depois buscar dados dos pacientes
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .not('patient_id', 'is', null)

      if (error) {
        console.error('Erro ao carregar pacientes:', error)
        return
      }

      // Extrair IDs únicos de pacientes
      const patientIds = [...new Set(assessments?.map((a: any) => a.patient_id).filter(Boolean) || [])]

      if (patientIds.length === 0) {
        setAvailablePatients([])
        return
      }

      // Buscar dados dos pacientes
      const { data: patients, error: patientsError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', patientIds)

      if (patientsError) {
        console.error('Erro ao carregar dados dos pacientes:', patientsError)
        return
      }

      // Mapear pacientes
      setAvailablePatients(patients || [])
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }, [user])

  // Iniciar gravação de consulta
  const handleStartConsultationRecording = useCallback(async () => {
    if (!user) return

    const userType = normalizeUserType(user.type)
    if (userType !== 'profissional' && userType !== 'admin') {
      sendMessage('Apenas profissionais podem gravar consultas.', { preferVoice: false })
      return
    }

    // Se não houver paciente selecionado, mostrar seletor
    if (!selectedPatientId) {
      await loadPatients()
      setShowPatientSelector(true)
      sendMessage('Por favor, selecione o paciente para iniciar a gravação da consulta.', { preferVoice: false })
      return
    }

    // NÃO parar escuta normal - o microfone deve permanecer ativo
    // A gravação de consulta pode usar o mesmo microfone

    // Iniciar gravação de consulta
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      sendMessage('Reconhecimento de voz não suportado neste navegador.', { preferVoice: false })
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition: any = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true

    const transcriptBuffer: string[] = []

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const transcript = result[0].transcript.trim()
          transcriptBuffer.push(transcript)
          setConsultationTranscript(prev => [...prev, transcript])

          // Adicionar mensagem visual no chat
          sendMessage(`[Gravação] ${transcript}`, { preferVoice: false })
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro na gravação:', event.error)
      if (event.error === 'no-speech') {
        // Reiniciar se não houver fala
        try {
          recognition.start()
        } catch (e) {
          // Ignorar
        }
      }
    }

    recognition.onend = () => {
      if (isRecordingConsultation) {
        try {
          recognition.start()
        } catch (e) {
          // Ignorar
        }
      }
    }

    try {
      recognition.start()
      consultationRecognitionRef.current = recognition
      setIsRecordingConsultation(true)
      setConsultationStartTime(new Date())
      setConsultationTranscript([])
      sendMessage('🎙️ Gravação de consulta iniciada. Diga "Parar gravação" para finalizar.', { preferVoice: false })
    } catch (e) {
      console.error('Erro ao iniciar gravação:', e)
      sendMessage('Erro ao iniciar gravação. Tente novamente.', { preferVoice: false })
    }
  }, [user, selectedPatientId, isListening, stopListening, isRecordingConsultation, sendMessage, loadPatients])

  // Parar gravação e salvar consulta
  const handleStopConsultationRecording = useCallback(async () => {
    if (!isRecordingConsultation || !user || !selectedPatientId) return

    setIsSavingConsultation(true)

    // Parar reconhecimento de voz
    if (consultationRecognitionRef.current) {
      try {
        consultationRecognitionRef.current.stop()
        consultationRecognitionRef.current = null
      } catch (e) {
        // Ignorar
      }
    }

    const endTime = new Date()
    const duration = consultationStartTime
      ? Math.round((endTime.getTime() - consultationStartTime.getTime()) / 1000 / 60) // minutos
      : 0

    const fullTranscript = consultationTranscript.join(' ')

    try {
      // Salvar em clinical_assessments
      const { data: assessment, error: assessmentError } = await supabase
        .from('clinical_assessments')
        .insert({
          patient_id: selectedPatientId,
          doctor_id: user.id,
          assessment_type: 'CONSULTA',
          status: 'completed',
          data: {
            transcript: fullTranscript,
            duration_minutes: duration,
            start_time: consultationStartTime?.toISOString(),
            end_time: endTime.toISOString()
          },
          clinical_report: `Consulta gravada em ${consultationStartTime?.toLocaleString('pt-BR')}\n\nTranscrição:\n${fullTranscript}`,
          created_at: consultationStartTime?.toISOString() || new Date().toISOString(),
          updated_at: endTime.toISOString()
        })
        .select()
        .single()

      if (assessmentError) {
        throw assessmentError
      }

      // Salvar também em clinical_reports se a tabela existir
      try {
        await supabase
          .from('clinical_reports')
          .insert({
            patient_id: selectedPatientId,
            professional_id: user.id,
            assessment_id: assessment.id,
            patient_name: selectedPatientId || 'Paciente',
            generated_by: user.id,
            protocol: 'CONSULTA',
            report_type: 'consultation',
            content: {
              transcript: fullTranscript,
              duration_minutes: duration,
              date: consultationStartTime?.toISOString()
            },
            status: 'generated'
          } as any)
      } catch (reportError) {
        // Ignorar se a tabela não existir
        console.warn('Tabela clinical_reports não disponível:', reportError)
      }

      sendMessage(`✅ Consulta gravada e salva com sucesso! Duração: ${duration} minutos.`, { preferVoice: false })

      // Resetar estados
      setIsRecordingConsultation(false)
      setConsultationTranscript([])
      setConsultationStartTime(null)
      setSelectedPatientId(null)
    } catch (error: any) {
      console.error('Erro ao salvar consulta:', error)
      sendMessage(`❌ Erro ao salvar consulta: ${error.message || 'Erro desconhecido'}`, { preferVoice: false })
    } finally {
      setIsSavingConsultation(false)
    }
  }, [isRecordingConsultation, user, selectedPatientId, consultationStartTime, consultationTranscript, sendMessage])

  // REMOVIDO: Detecção de voz contínua e comando "Escute-se, Nôa!"
  // O microfone agora só funciona quando o usuário clica no botão manualmente

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Abrir modal de categorização
    setUploadedFile(file)
    setShowUploadModal(true)

    // Resetar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Processar upload com categorias selecionadas
  const processFileUpload = useCallback(async () => {
    if (!uploadedFile) {
      console.warn('⚠️ Nenhum arquivo selecionado para upload')
      return
    }

    console.log('📤 Iniciando upload do arquivo:', uploadedFile.name)
    console.log('📋 Categoria:', uploadCategory)
    console.log('🎯 Área:', uploadArea)
    console.log('👥 Tipo de usuário:', uploadUserType)

    setIsUploading(true)
    setUploadProgress(0)
    // NÃO fechar modal imediatamente - deixar aberto para mostrar progresso

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Adicionar mensagem inicial no chat
      sendMessage(`📤 Enviando documento "${uploadedFile.name}" para a biblioteca e base de conhecimento...`, { preferVoice: false })

      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase()
      const fileName = `${Date.now()}_${uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const bucketName = 'documents'

      // Upload para Supabase Storage
      console.log('📤 Fazendo upload para Supabase Storage...')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, uploadedFile)

      if (uploadError) {
        console.error('❌ Erro no upload para Storage:', uploadError)
        throw uploadError
      }

      console.log('✅ Arquivo enviado para Storage com sucesso:', uploadData)

      // Criar signed URL para o arquivo
      let finalUrl = ''
      try {
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(fileName, 2592000) // 30 dias

        if (!signedError && signedUrlData) {
          finalUrl = signedUrlData.signedUrl
        } else {
          finalUrl = publicUrl
        }
      } catch (urlError) {
        console.warn('⚠️ Erro ao criar URL:', urlError)
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)
        finalUrl = publicUrl
      }

      // Mapear categoria para formato do banco (incluindo todas as categorias do modal)
      const categoryMap: Record<string, string> = {
        'ai-avatar': 'ai-avatar', // Não salva no banco, apenas atualiza avatar
        'ai-documents': 'ai-documents',
        'student': 'multimedia',
        'professional': 'protocols',
        'reports': 'reports',
        'research': 'research',
        'protocols': 'protocols',
        'cases': 'cases',
        'multimedia': 'multimedia'
      }

      const dbCategory = categoryMap[uploadCategory] || 'research'

      // 🔥 EXTRAIR CONTEÚDO REAL DO ARQUIVO
      let extractedContent = ''
      try {
        console.log('📄 Iniciando extração de conteúdo do arquivo...')
        if (fileExt === 'pdf') {
          extractedContent = await extractTextFromPDF(uploadedFile)
        } else if (fileExt === 'docx' || fileExt === 'doc') {
          extractedContent = await extractTextFromDOCX(uploadedFile)
        } else if (fileExt === 'txt') {
          extractedContent = await uploadedFile.text()
        }

        if (extractedContent) {
          console.log(`✅ Conteúdo extraído: ${extractedContent.length} caracteres`)
          // Limitar tamanho para evitar problemas (máximo 500k caracteres)
          if (extractedContent.length > 500000) {
            extractedContent = extractedContent.substring(0, 500000) + '\n\n[... conteúdo truncado para otimização ...]'
          }
        } else {
          console.warn('⚠️ Nenhum conteúdo extraído do arquivo')
        }
      } catch (error) {
        console.error('❌ Erro ao extrair conteúdo:', error)
        extractedContent = '' // Continuar mesmo sem conteúdo
      }

      // Criar resumo inteligente do conteúdo
      let summary = `Documento enviado pelo chat da IA Residente em ${new Date().toLocaleDateString('pt-BR')} - Categoria: ${uploadCategory}, Área: ${uploadArea}`
      if (extractedContent) {
        // Usar primeiras 300 caracteres como resumo
        const preview = extractedContent.substring(0, 300).replace(/\n+/g, ' ').trim()
        summary = `${summary}\n\nResumo do conteúdo:\n${preview}${extractedContent.length > 300 ? '...' : ''}`
      }

      // Função auxiliar para calcular relevância dinâmica
      const calculateAIRelevance = (fileName: string, content: string): number => {
        const name = fileName.toLowerCase();
        const text = (content || '').toLowerCase();

        // Prioridade Máxima: Protocolos, Diretrizes e Manuais Oficiais
        if (name.includes('protocolo') || name.includes('diretriz') || name.includes('manual') ||
          text.includes('protocolo clínico') || text.includes('diretriz terapêutica')) {
          return 1.0;
        }

        // Prioridade Alta: Artigos Científicos, Estudos e Pesquisas
        if (name.includes('artigo') || name.includes('estudo') || name.includes('pesquisa') ||
          name.includes('paper') || text.includes('clinical trial') || text.includes('metanálise')) {
          return 0.85;
        }

        // Prioridade Média: Notas de Aula, Resumos, Materiais de Apoio
        if (name.includes('aula') || name.includes('resumo') || name.includes('slide') ||
          name.includes('apresentação')) {
          return 0.7;
        }

        // Padrão para outros documentos
        return 0.6;
      };

      // Salvar metadata no banco COM CONTEÚDO REAL
      const dynamicRelevance = calculateAIRelevance(uploadedFile.name, extractedContent);
      const documentMetadata = {
        title: uploadedFile.name,
        content: extractedContent, // 🔥 AGORA TEM CONTEÚDO REAL!
        file_type: fileExt || 'unknown',
        file_url: finalUrl,
        file_size: uploadedFile.size,
        author: user?.name || 'Usuário',
        category: dbCategory,
        target_audience: uploadUserType.length > 0 ? uploadUserType : ['professional', 'student'],
        tags: ['upload', 'chat-upload', uploadCategory, uploadArea],
        isLinkedToAI: true,
        aiRelevance: dynamicRelevance,
        summary: summary,
        keywords: [fileExt || 'document', uploadCategory, uploadArea, ...uploadUserType]
      }

      // Verificar se o usuário está autenticado
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.')
      }

      console.log('👤 Usuário autenticado para upload:', authUser.id)
      console.log('💾 Salvando metadata do documento no banco...')
      console.log('📄 Metadata:', JSON.stringify(documentMetadata, null, 2))

      const { data: documentData, error: docError } = await supabase
        .from('documents')
        .insert(documentMetadata)
        .select()
        .single()

      if (docError) {
        console.error('❌ Erro ao salvar documento no banco:', docError)
        console.error('❌ Detalhes do erro:', {
          message: docError.message,
          details: docError.details,
          hint: docError.hint,
          code: docError.code
        })

        // Se for erro 403, informar sobre permissões
        if (docError.code === '42501' || docError.message?.includes('permission denied') || docError.message?.includes('403')) {
          throw new Error('Erro de permissão (403). As políticas RLS da tabela documents precisam ser configuradas. Execute o script FIX_RLS_DOCUMENTS_TABLE.sql no Supabase SQL Editor.')
        }

        throw docError
      }

      console.log('✅ Documento salvo no banco com sucesso:', documentData)

      // Verificar se o documento foi realmente salvo
      if (!documentData || !documentData.id) {
        throw new Error('Documento não foi salvo corretamente no banco de dados')
      }

      // Vincular documento à IA automaticamente se for categoria IA ou pesquisa
      if (documentData?.id && (uploadCategory === 'ai-documents' || uploadCategory === 'research')) {
        try {
          await KnowledgeBaseIntegration.linkDocumentToAI(documentData.id, documentMetadata.aiRelevance || 0.8)
          console.log('✅ Documento vinculado à IA:', documentData.id)
        } catch (linkError) {
          console.warn('⚠️ Erro ao vincular documento à IA (não crítico):', linkError)
        }
      }

      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(100)

      // Verificar se o documento foi realmente salvo antes de confirmar
      await new Promise(resolve => setTimeout(resolve, 500)) // Aguardar 500ms para garantir que o banco foi atualizado

      // Verificar se o documento aparece na busca
      const verifyDoc = await supabase
        .from('documents')
        .select('id, title, file_url, created_at')
        .eq('id', documentData.id)
        .single()

      if (verifyDoc.error) {
        console.warn('⚠️ Documento não encontrado imediatamente após inserção:', verifyDoc.error)
      } else {
        console.log('✅ Documento verificado após inserção:', verifyDoc.data)
      }

      // Disparar evento para atualizar listas de documentos em outras páginas
      window.dispatchEvent(new CustomEvent('documentUploaded', {
        detail: { documentId: documentData.id, title: uploadedFile.name }
      }))

      // Mensagem de sucesso com detalhes
      const categoryNames: Record<string, string> = {
        'ai-documents': 'IA Residente',
        'protocols': 'Protocolos',
        'research': 'Pesquisa',
        'cases': 'Casos',
        'multimedia': 'Multimídia'
      }

      console.log('✅ Upload concluído com sucesso!')

      sendMessage(`✅ Documento "${uploadedFile.name}" enviado com sucesso!\n\n📚 Categoria: ${categoryNames[uploadCategory] || uploadCategory}\n🎯 Área: ${uploadArea}\n👥 Público: ${uploadUserType.join(', ')}\n\nO arquivo foi adicionado à biblioteca${uploadCategory === 'ai-documents' ? ' e está vinculado à base de conhecimento da Nôa Esperança' : ''}. Agora posso usar este documento em minhas respostas!\n\n💡 Dica: Recarregue a página da biblioteca para ver o documento na lista.`, { preferVoice: false })

      // Resetar estados primeiro
      setUploadedFile(null)
      setUploadCategory('ai-documents')
      setUploadArea('cannabis')
      setUploadUserType(['professional', 'student'])
      setIsUploading(false)
      setUploadProgress(0)

      // Resetar input de arquivo para permitir novo upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Fechar modal APÓS resetar todos os estados (com delay para mostrar sucesso)
      setTimeout(() => {
        setShowUploadModal(false)
        console.log('✅ Modal de upload fechado após sucesso')
      }, 1000) // Aumentado para 1 segundo para dar tempo de ver a mensagem de sucesso
    } catch (error: any) {
      console.error('❌ Erro no upload:', error)
      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(0)

      // Adicionar mensagem de erro no chat
      sendMessage(`❌ Erro ao fazer upload do documento "${uploadedFile?.name}": ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`, { preferVoice: false })

      // Resetar estados e fechar modal mesmo em caso de erro
      setIsUploading(false)
      setUploadedFile(null)
      setShowUploadModal(false) // Fechar modal mesmo em caso de erro

      // Resetar input de arquivo para permitir novo upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [uploadedFile, uploadCategory, uploadArea, uploadUserType, sendMessage, user])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // 🔥 FUNÇÃO PARA EXTRAIR CONTEÚDO REAL DE PDFs
  const extractTextFromPDF = useCallback(async (file: File): Promise<string> => {
    try {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return ''
      }

      console.log('📄 Extraindo texto do PDF usando PDF.js:', file.name)
      const arrayBuffer = await file.arrayBuffer()

      // Carregar documento
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: false
      })

      const pdf = await loadingTask.promise
      let fullText = ''

      // Extrair texto de todas as páginas (limitado a 50 para performance)
      const maxPages = Math.min(pdf.numPages, 50)

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()

          if (pageText) {
            fullText += `\n[Página ${pageNum}]\n${pageText}\n`
          }
        } catch (pageErr) {
          console.warn(`⚠️ Erro na página ${pageNum}:`, pageErr)
        }

        if (fullText.length > 100000) break
      }

      console.log(`✅ Extração concluída: ${fullText.length} caracteres de ${pdf.numPages} páginas`)
      return fullText.trim() || 'Documento PDF processado, mas nenhum texto legível foi extraído.'
    } catch (error) {
      console.error('❌ Erro crítico na extração do PDF:', error)
      return ''
    }
  }, [])

  // 🔥 FUNÇÃO PARA EXTRAIR CONTEÚDO DE DOCX (texto simples)
  const extractTextFromDOCX = useCallback(async (file: File): Promise<string> => {
    try {
      if (!file.name.toLowerCase().endsWith('.docx') && !file.name.toLowerCase().endsWith('.doc')) {
        return ''
      }

      console.log('📄 Tentando extrair texto do DOCX:', file.name)
      // Para DOCX, vamos tentar ler como texto primeiro
      // Em produção, pode usar mammoth.js ou similar
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string || ''
          resolve(text.substring(0, 50000)) // Limitar tamanho
        }
        reader.onerror = () => resolve('')
        reader.readAsText(file, 'utf-8')
      })
    } catch (error) {
      console.error('❌ Erro ao extrair texto do DOCX:', error)
      return ''
    }
  }, [])

  const positionClasses = useMemo(() => getPositionClasses(position), [position])

  return (
    <>
      {/* Viewer Inline de Documento (abrir no chat) */}
      {inlineDocOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 p-4 border-b border-slate-800">
              <div className="min-w-0">
                <div className="text-xs text-slate-400">Documento (inline)</div>
                <div className="text-lg font-semibold text-white truncate">
                  {inlineDoc?.title || (inlineDocLoading ? 'Carregando…' : 'Documento')}
                </div>
                {inlineDoc?.category && (
                  <div className="text-xs text-slate-400 mt-1">Categoria: {inlineDoc.category}</div>
                )}
              </div>
              <button
                onClick={() => {
                  setInlineDocOpen(false)
                  setInlineDoc(null)
                  setInlineDocError(null)
                }}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
              >
                Fechar
              </button>
            </div>

            <div className="p-4">
              {inlineDocLoading && (
                <div className="text-slate-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando documento…
                </div>
              )}

              {!inlineDocLoading && inlineDocError && (
                <div className="text-red-300 bg-red-950/30 border border-red-900 rounded-xl p-3 text-sm">
                  {inlineDocError}
                </div>
              )}

              {!inlineDocLoading && !inlineDocError && inlineDoc && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => sendMessage('Analise o documento que acabei de abrir no chat.', {
                        documentForAnalysis: {
                          id: inlineDoc.id,
                          title: inlineDoc.title ?? '',
                          summary: inlineDoc.summary ?? undefined,
                          content: inlineDoc.content ?? undefined
                        }
                      })}
                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                    >
                      Enviar para Nôa analisar
                    </button>
                    {inlineDoc.file_url && (
                      <button
                        onClick={() => window.open(inlineDoc.file_url as string, '_blank')}
                        className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold border border-slate-600"
                      >
                        Abrir arquivo
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/app/library', { state: { openDocumentId: inlineDoc.id } })}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700"
                    >
                      Abrir na Biblioteca
                    </button>
                  </div>

                  {inlineDoc.summary && (
                    <div className="text-slate-200 text-sm bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-3 whitespace-pre-wrap">
                      <div className="text-xs text-slate-400 mb-1">Resumo</div>
                      {sanitizeInlineText(inlineDoc.summary)}
                    </div>
                  )}

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 max-h-[40vh] overflow-y-auto">
                    <div className="text-xs text-slate-400 mb-2">Conteúdo</div>
                    <pre className="whitespace-pre-wrap break-words text-slate-100 text-sm leading-relaxed">
                      {sanitizeInlineText(inlineDoc.content || '') || 'Sem conteúdo textual disponível para este documento.'}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!hideButton && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={clsx('fixed z-50 w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white overflow-hidden border border-[#00C16A]/30 transition-transform duration-300 hover:scale-110', positionClasses)}
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3a3a 100%)' }}
          data-position={position}
        >
          <img
            src="/AvatarsEstatico.png"
            alt="Nôa"
            className="w-full h-full object-cover object-top opacity-90 hover:opacity-100 transition-opacity"
          />
        </button>
      )}

      {isOpen && (
        <div
          data-position={position}
          className={clsx(
            position === 'inline'
              ? clsx('relative w-full h-[100%] max-h-none flex flex-col border-none', variant === 'clean' ? 'bg-transparent' : 'bg-slate-900')
              : 'fixed z-[9999] bg-slate-900/95 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300',
            position !== 'inline' && (
              isExpanded
                ? 'left-0 sm:left-[80px] lg:left-[320px] right-0 sm:right-4 top-0 sm:top-4 bottom-0 sm:bottom-4' // Mobile: tela cheia
                : position === 'bottom-right'
                  ? 'bottom-0 sm:bottom-4 right-0 sm:right-4 w-full sm:w-[600px] h-full sm:h-[85vh] max-h-full sm:max-h-[calc(100vh-2rem)]'
                  : position === 'bottom-left'
                    ? 'bottom-0 sm:bottom-4 left-0 sm:left-4 w-full sm:w-[600px] h-full sm:h-[85vh] max-h-full sm:max-h-[calc(100vh-2rem)]'
                    : position === 'top-right'
                      ? 'top-0 sm:top-4 right-0 sm:right-4 w-full sm:w-[600px] h-full sm:h-[85vh] max-h-full sm:max-h-[calc(100vh-2rem)]'
                      : 'top-0 sm:top-4 left-0 sm:left-4 w-full sm:w-[600px] h-full sm:h-[85vh] max-h-full sm:max-h-[calc(100vh-2rem)]'
            )
          )}
          style={{
            // CRÍTICO: Em mobile, garantir que o container não corte elementos
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: position === 'inline' ? '100%' : undefined, // Altura 100% apenas se inline/relativo
            maxHeight: '100%',
            // Garantir que não "desça" indevidamente
            top: position !== 'inline' && !isExpanded && position.includes('top') ? '1rem' : undefined,
            bottom: position !== 'inline' && !isExpanded && position.includes('bottom') ? '1rem' : undefined,
          }}
        >
          {resolvedVariant !== 'clean' && (
            <div
              className="px-5 py-2 sm:py-3 flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3a3a 100%)' }}
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <NoaAnimatedAvatar size={isExpanded ? "lg" : "sm"} isListening={isListening} isSpeaking={isSpeaking} />
                <div>
                  <p className="text-xs sm:text-sm text-emerald-100">
                    Nôa Esperança • IA Residente
                  </p>
                  <p className="text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-none text-emerald-50/80">
                    {userName} • {userCode.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-full text-white/80 hover:bg-white/10 transition"
                  title={isExpanded ? "Minimizar" : "Expandir"}
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setIsExpanded(false)
                    closeChat()
                    setShouldAutoResume(false)
                    stopListening()
                    window.dispatchEvent(new Event('noaChatClosed'))
                  }}
                  className="p-2 rounded-full text-white/80 hover:bg-white/10 transition"
                  title="Fechar Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {resolvedVariant !== 'clean' && (
            <div className="border-b border-slate-800 bg-slate-900/80 px-3 sm:px-5 py-1 sm:py-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
              <span className="flex items-center gap-1 truncate"><Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Último fluxo:</span> {lastIntent ?? 'Exploração'}</span>
              <span className="flex items-center gap-1 text-slate-400 flex-shrink-0">{messages.length} interações</span>
              {isRecordingConsultation && (
                <span className="flex items-center gap-1 text-red-400 animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Gravando consulta...
                </span>
              )}
            </div>
          )}

          {/* Seletor de Paciente */}
          {showPatientSelector && !isRecordingConsultation && (
            <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-4">
              <p className="text-sm text-slate-300 mb-3">Selecione o paciente:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availablePatients.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum paciente encontrado. Você precisa ter pelo menos uma avaliação clínica com um paciente.</p>
                ) : (
                  availablePatients.map((patient: any) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatientId(patient.id)
                        setShowPatientSelector(false)
                        handleStartConsultationRecording()
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm flex items-center gap-2 transition"
                    >
                      <User className="w-4 h-4" />
                      <span>{patient.name || patient.email}</span>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setShowPatientSelector(false)}
                className="mt-3 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Controles de Gravação de Consulta (apenas para profissionais e NÃO no modo clean) */}
          {user && (normalizeUserType(user.type) === 'profissional' || normalizeUserType(user.type) === 'admin') && !showPatientSelector && resolvedVariant !== 'clean' && (
            <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-3">
              {!isRecordingConsultation ? (
                <button
                  onClick={handleStartConsultationRecording}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                >
                  <Mic className="w-4 h-4 text-white" />
                  Iniciar Gravação de Consulta
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Gravando consulta...</span>
                    <span className="text-red-400 animate-pulse">
                      {consultationStartTime && Math.floor((new Date().getTime() - consultationStartTime.getTime()) / 1000)}s
                    </span>
                  </div>
                  <button
                    onClick={handleStopConsultationRecording}
                    disabled={isSavingConsultation}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    {isSavingConsultation ? 'Salvando...' : 'Parar e Salvar Consulta'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-2 sm:px-5 py-2 sm:py-4 space-y-3 sm:space-y-4 overflow-x-hidden"
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              minHeight: 0, // Permitir que o flex funcione corretamente
              maxHeight: '100%' // Remover limite de altura que pode estar cortando
            }}
          >
            {/* Mensagem inicial da Nôa quando não há histórico */}
            {messages.length === 0 && (
              resolvedVariant === 'clean' ? (
                <div className="h-full flex flex-col items-center justify-center relative min-h-[50vh] animate-in fade-in duration-1000">
                  {/* ... Orbital Avatar Design ... */}
                  <div className="relative w-40 h-40 mb-8 transform transition-transform duration-[4000ms] hover:scale-105">
                    {/* Glows */}
                    <div className="absolute inset-[-20px] bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
                    <div className="absolute inset-[-40px] bg-cyan-500/5 rounded-full blur-2xl" />

                    {/* Avatar Circle */}
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/10 z-10 overflow-hidden">
                      <img
                        src="/AvatarsEstatico.png"
                        alt="Nôa Esperança"
                        className="w-full h-full object-cover object-top opacity-90"
                      />
                    </div>

                    {/* Orbitals */}
                    <div className="absolute inset-[-10px] rounded-full border border-emerald-500/20 border-t-emerald-500/60 border-l-transparent animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-[-20px] rounded-full border border-cyan-500/10 border-b-cyan-500/40 border-r-transparent animate-[spin_12s_linear_infinite_reverse]" />
                    <div className="absolute inset-[-30px] rounded-full border border-violet-500/5 border-t-violet-500/30 border-l-transparent animate-[spin_16s_linear_infinite]" />

                    {/* Floating Particles */}
                    <div className="absolute -top-4 left-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    <div className="absolute bottom-4 -right-2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgb(34,211,238)] animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>

                  <div className="text-center space-y-3 z-10">
                    <h2 className="text-2xl font-light text-white tracking-wide">Nôa Esperança</h2>
                    <p className="text-sm text-slate-400 font-light tracking-wider uppercase text-[10px]">IA Residente · Avaliação Clínica</p>

                    <div className="flex gap-2 mt-6 opacity-60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse delay-150"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse delay-300"></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm backdrop-blur-sm border bg-slate-800/90 text-slate-100 border-slate-700">
                    <p className="whitespace-pre-wrap leading-relaxed break-words">
                      Imagine ter um consultório figital com uma IA residente dedicada a você, seus colegas e seus pacientes.
                      {'\n\n'}
                      Eu sou a Nôa Esperança, IA da plataforma MedCannLab 3.0, desenvolvida com propósito humanitário,
                      treinada para respeitar sua forma de trabalhar e aprender apenas com os conceitos que você escolhe ensinar.
                      {'\n\n'}
                      Como posso te ajudar agora?
                      {'\n'}• Iniciar uma avaliação clínica IMRE triaxial{'\n'}• Estudar um caso com você{'\n'}• Revisar relatórios e prontuário
                    </p>
                    <span className="block text-[10px] mt-2 text-slate-400">
                      {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            )}

            {messages.map(message => {
              // Renderização Especial para Cards de Sistema (Ação)
              if (message.role === 'system' && message.metadata?.type === 'action_card') {
                const action = message.metadata.action as any
                return (
                  <div key={message.id} className="flex justify-start w-full my-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-full max-w-[85%] sm:max-w-[80%] bg-emerald-900/40 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-500/20 rounded-full flex-shrink-0">
                            <Activity className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-emerald-100 text-base sm:text-lg">Avaliação Concluída</h3>
                            <p className="text-emerald-200/80 text-sm leading-relaxed whitespace-pre-wrap">
                              {stripActionTokenForDisplay(message.content.replace('✅ **Avaliação Concluída com Sucesso!**\n\n', ''))}
                            </p>
                          </div>
                        </div>
                      </div>

                      {action && (
                        <div className="bg-emerald-950/30 p-3 sm:p-4 border-t border-emerald-500/20 flex justify-end">
                          <button
                            onClick={() => {
                              if (action.actionId === 'view_schedule' && onViewSchedule) {
                                onViewSchedule()
                                setIsOpen(false)
                                return
                              }

                              // Navegar para o dashboard com card "Avalie a conversa" (estrelas)
                              navigate(`/app/clinica/paciente/dashboard?section=analytics&rate_conversation=1`)
                              setIsOpen(false)
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
                          >
                            <Activity className="w-4 h-4" />
                            {action.label}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Core envia trigger_scheduling e professionalId em metadata (hook guarda em message.metadata.metadata)
              const coreMeta = (message.metadata as any)?.metadata ?? message.metadata
              const triggerScheduling = (message.metadata as any)?.trigger_scheduling === true || coreMeta?.trigger_scheduling === true
              const professionalIdFromMeta = (message.metadata as any)?.professionalId ?? coreMeta?.professionalId
              // Renderização do Widget de Agendamento
              if (
                (message.metadata as any)?.intent === 'APPOINTMENT_CREATE' ||
                (message.metadata as any)?.type === 'scheduling_prompt' ||
                triggerScheduling ||
                message.content.includes(TRIGGER_SCHEDULING_TOKEN)
              ) {
                return (
                  <div key={message.id} className="w-full mb-4">
                    {/* Renderizar a mensagem de texto da IA antes do widget */}
                    <div className="flex justify-start mb-2">
                      <div
                        className={clsx(
                          'max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-sm backdrop-blur-sm border group relative',
                          message.role === 'user'
                            ? 'bg-emerald-600/90 text-white border-emerald-400/50'
                            : 'bg-slate-800/90 text-slate-100 border-slate-700'
                        )}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed break-words text-sm sm:text-base">
                          {stripActionTokenForDisplay(message.content.replace(TRIGGER_SCHEDULING_TOKEN, ''))}
                        </p>
                        {/* DEBUG: Mostrar metadata da mensagem */}
                        {(message.metadata as any)?.intent && (
                          <div className="mt-1 pt-1 border-t border-white/10 text-[9px] opacity-50 font-mono hidden group-hover:block">
                            Intent: {(message.metadata as any).intent} | Prof: {professionalIdFromMeta}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Renderizar Widget UNIFICADO para todos */}
                    <div className="flex justify-start">
                      <div className="w-full max-w-sm">
                        <SchedulingWidget
                          patientId={user?.id || ''} // Se for profissional, pacienteId pode vir vazio ou do contexto
                          professionalId={professionalIdFromMeta || (normalizeUserType(user?.type) === 'profissional' || normalizeUserType(user?.type) === 'admin' ? user?.id : 'ricardo-valenca')}
                          onSuccess={(appointmentId) => {
                            sendMessage(`✅ Agendamento confirmado! ID: ${appointmentId}`, {
                              preferVoice: false,
                              type: 'action_card',
                              action: {
                                label: 'Ver Meus Agendamentos',
                                actionId: 'view_schedule'
                              }
                            })
                          }}
                          onCancel={() => {
                            // Opcional
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              }

              // Renderização Padrão: texto limpo (triggers NUNCA aparecem) + botões "Abrir [aba]" quando há app_commands de navegação
              const meta = message.metadata as Record<string, unknown> | undefined
              const appCommands = (meta?.metadata as Record<string, unknown> | undefined)?.app_commands as Array<{ kind?: string; command?: { type: string; target?: string; label?: string; fallbackRoute?: string } }> | undefined
              const navCommands = Array.isArray(appCommands)
                ? appCommands.filter(
                  (c) => c?.kind === 'noa_command' && c?.command && (c.command.type === 'navigate-section' || c.command.type === 'navigate-route')
                )
                : []

              return (
                <div key={message.id} className={clsx('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
                  <div
                    className={clsx(
                      'max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-sm backdrop-blur-sm border',
                      message.role === 'user'
                        ? 'bg-emerald-600/90 text-white border-emerald-400/50'
                        : 'bg-slate-800/90 text-slate-100 border-slate-700'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed break-words text-sm sm:text-base">
                      {stripActionTokenForDisplay((meta?.fullContent as string) || message.content)}
                    </p>
                    <span className="block text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 text-slate-400">{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {/* Botões "Abrir [aba]" quando a resposta trouxe navegação: direciona ao clicar se a navegação automática não ocorreu */}
                  {message.role === 'noa' && navCommands.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5 max-w-[85%] sm:max-w-[80%]">
                      {navCommands.map((entry, idx) => {
                        const cmd = entry?.command
                        if (!cmd) return null
                        const label = (typeof cmd.label === 'string' ? cmd.label : cmd.target) || 'Abrir'
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const detail = {
                                type: cmd.type,
                                target: cmd.target ?? '',
                                label: cmd.label,
                                fallbackRoute: cmd.fallbackRoute,
                                timestamp: new Date().toISOString()
                              }
                              window.dispatchEvent(new CustomEvent('noaCommand', { detail }))
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600"
                          >
                            Abrir: {label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {/* Card: total de documentos + blocos de 5 (admin/chat) */}
                  {message.role === 'noa' && (() => {
                    const total = (meta?.documents_total ?? (meta?.metadata as Record<string, unknown>)?.documents_total) as number | undefined
                    if (typeof total !== 'number' || total < 0) return null
                    const block = (meta?.documents_block_size ?? (meta?.metadata as Record<string, unknown>)?.documents_block_size) as number | undefined
                    const blockSize = typeof block === 'number' ? block : 5
                    return (
                      <div className="mt-2 max-w-[85%] sm:max-w-[80%] px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                        📚 <strong>{total}</strong> documentos na base. Blocos de {blockSize} — diga &quot;listar mais&quot; para os próximos.
                      </div>
                    )
                  })()}
                </div>
              )
            })}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-slate-800/80 text-slate-300 text-sm border border-slate-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Elaborando resposta clínica...
                </div>
              </div>
            )}
          </div>

          {/* CRÍTICO: Área de input SEMPRE VISÍVEL - especialmente em mobile */}
          <div
            className="border-t border-slate-800 bg-slate-900/95 px-2 sm:px-5 py-2 sm:py-3 space-y-1 sm:space-y-2 flex-shrink-0"
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 1000,
              minHeight: '70px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: resolvedVariant === 'clean' ? 'transparent' : 'rgb(15 23 42 / 0.95)',
              backdropFilter: resolvedVariant === 'clean' ? 'none' : 'blur(8px)',
            }}
          >
            {error && (
              <div className="text-xs text-amber-400 px-1">
                {error}
              </div>
            )}

            {/* Removido: Endpoints consultados - não deve aparecer para o usuário */}

            {/* Container principal - SEMPRE VISÍVEL - CRÍTICO para mobile */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 w-full"
              style={{
                minHeight: '60px',
                position: 'relative',
                zIndex: 101,
                display: 'flex',
                visibility: 'visible',
                opacity: 1
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Botões de ação - SEMPRE VISÍVEIS - CRÍTICO para mobile */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
                style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
              >
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className={clsx('p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition flex-shrink-0',
                    isUploading
                      ? 'bg-emerald-600 text-white border-emerald-400 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-emerald-200'
                  )}
                  title={isUploading ? 'Enviando documento...' : 'Enviar documento para biblioteca'}
                  style={{ display: 'block', visibility: 'visible' }}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 sm:w-4 sm:h-4" />
                  )}
                </button>

                {/* Botão do microfone - implementação simplificada */}
                <button
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    try {
                      if (isListening) {
                        stopListening()
                      } else {
                        // Verificar permissões primeiro
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                        stream.getTracks().forEach(track => track.stop()) // Parar imediatamente, só verificar permissão
                        startListening()
                      }
                    } catch (error) {
                      console.error('Erro ao acessar microfone:', error)
                      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.')
                    }
                  }}
                  disabled={isProcessing || isRecordingConsultation}
                  className={clsx(
                    'p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-300 flex-shrink-0',
                    isListening
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/50 hover:bg-emerald-500 cursor-pointer animate-pulse'
                      : isSpeaking
                        ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/50 cursor-pointer hover:bg-blue-500'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-emerald-400 hover:text-emerald-200 cursor-pointer',
                    (isProcessing || isRecordingConsultation) && 'opacity-50 cursor-not-allowed'
                  )}
                  title={
                    isProcessing || isRecordingConsultation
                      ? 'Aguarde...'
                      : isListening
                        ? '🎤 Ouvindo... Clique para parar'
                        : isSpeaking
                          ? 'IA está falando - Clique para ativar microfone'
                          : '🎤 Clique para ativar reconhecimento de voz'
                  }
                  aria-label={isListening ? 'Parar microfone' : 'Ativar microfone'}
                >
                  {isListening ? (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
                  ) : isSpeaking ? (
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
                  ) : (
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>

              {/* Input de texto - SEMPRE VISÍVEL - CRÍTICO para mobile */}
              <input
                type="text"
                value={inputValue}
                onChange={(event) => {
                  if (!isProcessing) {
                    setInputValue(event.target.value)
                    // Se o usuário começar a digitar, limpar o buffer do microfone para evitar conflitos
                    if (recognitionRef.current && event.target.value !== recognitionRef.current.buffer) {
                      recognitionRef.current.buffer = ''
                    }
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "🎤 Ouvindo... (ou digite aqui)" : "Digite sua mensagem aqui..."}
                disabled={isProcessing}
                autoFocus={false}
                autoComplete="off"
                spellCheck="true"
                className="flex-1 min-w-[100px] bg-slate-800 border-2 border-slate-600 text-white text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  fontSize: '16px',
                  display: 'block',
                  visibility: 'visible',
                  opacity: isProcessing ? 0.5 : 1,
                  minWidth: '120px',
                  width: '100%',
                  flex: '1 1 auto',
                  zIndex: 1000,
                  position: 'relative',
                  backgroundColor: 'rgb(30 41 59)',
                  color: 'white'
                }}
              />

              {/* Botão de enviar - SEMPRE VISÍVEL */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isProcessing && inputValue.trim()) {
                    handleSend()
                  }
                }}
                disabled={!inputValue.trim() || isProcessing}
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-500 text-white shadow-lg hover:from-emerald-500 hover:to-sky-400 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ display: 'block', visibility: 'visible' }}
                title={isProcessing ? 'Processando...' : 'Enviar mensagem'}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>

              {/* Botão de reset se travado (aparece imediatamente quando isProcessing está true) */}
              {isProcessing && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔄 Resetando estado de processamento manualmente')
                    // Forçar reset do estado imediatamente
                    if (window.confirm('A interface está travada. Deseja recarregar a página?')) {
                      window.location.reload()
                    }
                  }}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs flex-shrink-0 ml-2 animate-pulse"
                  title="Resetar se travado (clique para recarregar)"
                >
                  🔄 Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload com Categorias */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {isUploading ? '📤 Enviando Documento...' : '📚 Categorizar Documento'}
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadedFile(null)
                    // Resetar input de arquivo para permitir novo upload
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                    // Resetar estados
                    setUploadCategory('ai-documents')
                    setUploadArea('cannabis')
                    setUploadUserType(['professional', 'student'])
                  }}
                  disabled={isUploading}
                  className={clsx(
                    'text-slate-400 hover:text-white transition-colors',
                    isUploading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Arquivo Selecionado */}
              {uploadedFile && (
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-8 h-8 text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-slate-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seleção de Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  📚 Categoria
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'ai-documents', name: '🧠 IA Residente', desc: 'Treinar a Nôa Esperança' },
                    { id: 'protocols', name: '📖 Protocolos', desc: 'Diretrizes clínicas' },
                    { id: 'research', name: '🔬 Pesquisa', desc: 'Artigos científicos' },
                    { id: 'cases', name: '📊 Casos', desc: 'Casos clínicos' },
                    { id: 'multimedia', name: '🎥 Multimídia', desc: 'Vídeos e mídia' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setUploadCategory(cat.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${uploadCategory === cat.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                        }`}
                    >
                      <h3 className="font-semibold text-white text-sm mb-1">{cat.name}</h3>
                      <p className="text-xs text-slate-400">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Área */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  🎯 Área
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'cannabis', name: '🌿 Cannabis' },
                    { id: 'imre', name: '🧬 IMRE' },
                    { id: 'clinical', name: '🏥 Clínica' },
                    { id: 'research', name: '📈 Gestão' }
                  ].map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setUploadArea(area.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${uploadArea === area.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                        }`}
                    >
                      <span className="font-semibold text-white text-sm">{area.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Tipo de Usuário */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  👥 Tipo de Usuário
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'all', name: '🌐 Todos os Usuários' },
                    { id: 'student', name: '🎓 Alunos' },
                    { id: 'professional', name: '👨‍⚕️ Profissionais' },
                    { id: 'patient', name: '❤️ Pacientes' }
                  ].map((type) => {
                    const isSelected = uploadUserType.includes(type.id) || (type.id === 'all' && uploadUserType.length === 3)
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          if (type.id === 'all') {
                            setUploadUserType(['professional', 'student', 'patient'])
                          } else {
                            setUploadUserType(prev =>
                              prev.includes(type.id)
                                ? prev.filter(t => t !== type.id)
                                : [...prev, type.id]
                            )
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                          }`}
                      >
                        <span className="font-semibold text-white text-sm">{type.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Enviando...</span>
                    <span className="text-sm text-slate-300">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-sky-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadedFile(null)
                    // Resetar input de arquivo para permitir novo upload
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                    // Resetar estados
                    setUploadCategory('ai-documents')
                    setUploadArea('cannabis')
                    setUploadUserType(['professional', 'student'])
                  }}
                  disabled={isUploading}
                  className={clsx(
                    'flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors',
                    isUploading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    console.log('🖱️ Botão "Fazer Upload" clicado')
                    console.log('📄 Arquivo selecionado:', uploadedFile?.name)
                    console.log('📋 Categoria selecionada:', uploadCategory)
                    console.log('🎯 Área selecionada:', uploadArea)
                    console.log('👥 Tipos de usuário:', uploadUserType)
                    if (!uploadedFile) {
                      console.error('❌ Nenhum arquivo selecionado!')
                      alert('Por favor, selecione um arquivo primeiro.')
                      return
                    }
                    processFileUpload()
                  }}
                  disabled={!uploadedFile || isUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-sky-500 hover:from-emerald-500 hover:to-sky-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando... {uploadProgress > 0 && `${uploadProgress}%`}
                    </>
                  ) : (
                    '✅ Fazer Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NoaConversationalInterface


