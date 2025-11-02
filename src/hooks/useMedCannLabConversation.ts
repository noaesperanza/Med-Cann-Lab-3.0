import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { NoaResidentAI, type AIResponse } from '../lib/noaResidentAI'
import { ConversationalIntent } from '../lib/medcannlab/types'

const sanitizeForSpeech = (text: string): string => {
  return text
    .replace(/\r?\n+/g, ' ')
    .replace(/[•●▪︎▪]/g, ' item ')
    .replace(/Nôa/gi, 'Noa')
    .replace(/Med\s*Cann\s*Lab/gi, 'Med Can Lab')
    .replace(/LGPD/gi, 'L G P D')
    .replace(/%/g, ' por cento ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'noa'
  content: string
  timestamp: Date
  intent?: ConversationalIntent
  metadata?: Record<string, unknown>
}

interface SendMessageOptions {
  preferVoice?: boolean
}

const createConversationId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const mapResponseToIntent = (response: AIResponse): ConversationalIntent => {
  const metadataIntent = typeof response.metadata?.intent === 'string'
    ? response.metadata.intent
    : undefined

  if (metadataIntent && ['CHECK_STATUS','GET_TRAINING_CONTEXT','MANAGE_SIMULATION','ACCESS_LIBRARY','IMRE_ANALYSIS','SMALL_TALK','FOLLOW_UP','HELP','UNKNOWN'].includes(metadataIntent)) {
    return metadataIntent as ConversationalIntent
  }

  if (response.type === 'assessment') return 'IMRE_ANALYSIS'
  if (response.type === 'error') return 'UNKNOWN'

  return 'FOLLOW_UP'
}

const ensureDate = (value: Date | string | undefined) => {
  if (!value) return new Date()
  return value instanceof Date ? value : new Date(value)
}

interface SpeechQueueState {
  messageId: string
  fullContent: string
  sanitized: string
  displayIndex: number
  cancelled: boolean
  timer?: number
}

export const useMedCannLabConversation = () => {
  const { user } = useAuth()
  const residentRef = useRef<NoaResidentAI | null>(null)
  const conversationIdRef = useRef<string>(createConversationId())
  const [messages, setMessages] = useState<ConversationMessage[]>([{
    id: 'welcome',
    role: 'noa',
    content: 'Olá! Sou a Nôa Esperança. Posso monitorar a plataforma, acessar a biblioteca clínica, abrir simulações e conduzir análises IMRE completas. Como posso te ajudar agora?',
    timestamp: new Date(),
    intent: 'HELP'
  }])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastIntent, setLastIntent] = useState<ConversationalIntent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedEndpoints, setUsedEndpoints] = useState<string[]>([])
  if (!residentRef.current) {
    residentRef.current = new NoaResidentAI()
  }

  const conversationId = useMemo(() => conversationIdRef.current, [])
  const lastSpokenMessageRef = useRef<string | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const speechEnabledRef = useRef(true)
  const speechQueueRef = useRef<SpeechQueueState | null>(null)
  const [voicesReady, setVoicesReady] = useState(false)

  const updateMessageContent = useCallback((messageId: string, content: string) => {
    setMessages(prev => {
      let changed = false
      const next = prev.map(message => {
        if (message.id === messageId) {
          if (message.content === content) {
            return message
          }
          changed = true
          return { ...message, content }
        }
        return message
      })
      return changed ? next : prev
    })
  }, [setMessages])

  const stopSpeech = useCallback(() => {
    const queue = speechQueueRef.current
    if (queue) {
      queue.cancelled = true
      if (queue.timer) {
        window.clearTimeout(queue.timer)
        queue.timer = undefined
      }
      updateMessageContent(queue.messageId, queue.fullContent)
      speechQueueRef.current = null
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [updateMessageContent])

  useEffect(() => {
    const handleSoundToggle = (event: Event) => {
      const custom = event as CustomEvent<{ enabled?: boolean }>
      if (typeof custom.detail?.enabled === 'boolean') {
        speechEnabledRef.current = custom.detail.enabled
        if (!custom.detail.enabled) {
          stopSpeech()
        }
      }
    }

    window.addEventListener('noaSoundToggled', handleSoundToggle as EventListener)
    return () => window.removeEventListener('noaSoundToggled', handleSoundToggle as EventListener)
  }, [stopSpeech])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    const populateVoices = () => {
      const available = window.speechSynthesis.getVoices()
      if (available && available.length > 0) {
        voicesRef.current = available
        setVoicesReady(true)
      }
    }

    populateVoices()
    window.speechSynthesis.onvoiceschanged = populateVoices

    return () => {
      if (window.speechSynthesis.onvoiceschanged === populateVoices) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  useEffect(() => {
    const handleChatClosed = () => stopSpeech()
    window.addEventListener('noaChatClosed', handleChatClosed)
    const handleExternalStop = () => stopSpeech()
    window.addEventListener('noaStopSpeech', handleExternalStop)
    return () => {
      window.removeEventListener('noaChatClosed', handleChatClosed)
      window.removeEventListener('noaStopSpeech', handleExternalStop)
    }
  }, [stopSpeech])

  useEffect(() => {
    if (messages.length === 0) {
      return
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'noa') {
      return
    }

    const fullContent = (lastMessage.metadata as Record<string, any> | undefined)?.fullContent ?? lastMessage.content

    if (!fullContent) {
      return
    }

    if (!voicesReady && voicesRef.current.length === 0) {
      speechQueueRef.current = null
      lastSpokenMessageRef.current = null
      updateMessageContent(lastMessage.id, fullContent)
      setIsSpeaking(false)
      return
    }

    if (lastSpokenMessageRef.current === lastMessage.id) {
      const activeQueue = speechQueueRef.current
      if (!activeQueue || activeQueue.messageId !== lastMessage.id || activeQueue.cancelled) {
        updateMessageContent(lastMessage.id, fullContent)
        speechQueueRef.current = null
      }
      return
    }

    lastSpokenMessageRef.current = lastMessage.id

    if (!speechEnabledRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      speechQueueRef.current = null
      updateMessageContent(lastMessage.id, fullContent)
      setIsSpeaking(false)
      return
    }

    if (!window.speechSynthesis) {
      updateMessageContent(lastMessage.id, fullContent)
      speechQueueRef.current = null
      setIsSpeaking(false)
      return
    }

    const sanitized = sanitizeForSpeech(fullContent)
    const queue: SpeechQueueState = {
      messageId: lastMessage.id,
      fullContent,
      sanitized,
      displayIndex: 0,
      cancelled: false
    }

    speechQueueRef.current = queue

    const revealStep = () => {
      const current = speechQueueRef.current
      if (!current || current.cancelled || current.messageId !== lastMessage.id) {
        return
      }

      const chunkSize = Math.max(12, Math.round(current.fullContent.length / 60))
      current.displayIndex = Math.min(current.fullContent.length, current.displayIndex + chunkSize)
      updateMessageContent(current.messageId, current.fullContent.slice(0, current.displayIndex))

      if (current.displayIndex < current.fullContent.length) {
        current.timer = window.setTimeout(() => {
          revealStep()
        }, 55)
      } else {
        current.timer = undefined
      }
    }

    revealStep()

    const utterance = new SpeechSynthesisUtterance(sanitized.length > 0 ? sanitized : fullContent)
    utterance.lang = 'pt-BR'
    utterance.rate = 0.94
    utterance.pitch = 0.78
    utterance.volume = 0.93

    const voices = voicesRef.current
    if (voices && voices.length > 0) {
      const preferred = voices.filter(voice => voice.lang && voice.lang.toLowerCase() === 'pt-br')
      const victoria = preferred.find(voice => /vit[oó]ria/i.test(voice.name))
      const fallback = preferred.find(voice => /bia|camila|carol|helo[ií]sa|brasil|female|feminina/i.test(voice.name))
      const selectedVoice = victoria || fallback || preferred[0] || voices[0]
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      const current = speechQueueRef.current
      if (current && current.messageId === lastMessage.id) {
        if (!current.timer) {
          speechQueueRef.current = null
          updateMessageContent(current.messageId, current.fullContent)
          setIsSpeaking(false)
        } else {
          current.cancelled = false
          const finalize = () => {
            const state = speechQueueRef.current
            if (state && state.messageId === lastMessage.id) {
              if (state.timer) {
                window.clearTimeout(state.timer)
                state.timer = undefined
              }
              updateMessageContent(state.messageId, state.fullContent)
              speechQueueRef.current = null
            }
            setIsSpeaking(false)
          }
          current.timer = window.setTimeout(finalize, 80)
        }
      } else {
        setIsSpeaking(false)
      }
    }

    utterance.onerror = () => {
      console.warn('[useMedCannLabConversation] Erro ao sintetizar fala.')
      const current = speechQueueRef.current
      if (current && current.messageId === lastMessage.id) {
        if (current.timer) {
          window.clearTimeout(current.timer)
          current.timer = undefined
        }
        updateMessageContent(current.messageId, current.fullContent)
        speechQueueRef.current = null
      }
      setIsSpeaking(false)
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.resume?.()
    window.speechSynthesis.speak(utterance)

    return () => {
      const current = speechQueueRef.current
      if (current && current.messageId === lastMessage.id) {
        current.cancelled = true
        if (current.timer) {
          window.clearTimeout(current.timer)
          current.timer = undefined
        }
      }
    }
  }, [messages, voicesReady, updateMessageContent])

  const sendMessage = useCallback(async (text: string, options: SendMessageOptions = {}) => {
    const trimmed = text.trim()
    if (!trimmed || isProcessing) return

    setIsProcessing(true)
    setError(null)
    stopSpeech()

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await residentRef.current!.processMessage(trimmed, user?.id, user?.email)

      const intent = mapResponseToIntent(response)
      const assistantMessage: ConversationMessage = {
        id: `noa-${Date.now()}`,
        role: 'noa',
        content: '',
        timestamp: ensureDate(response.timestamp),
        intent,
        metadata: {
          confidence: response.confidence,
          reasoning: response.reasoning,
          metadata: response.metadata,
          fullContent: response.content,
          fromVoice: options.preferVoice ?? false,
          usedEndpoints: ['resident-ai']
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setLastIntent(intent)
      setUsedEndpoints(prev => [...prev, 'resident-ai'])

      if (response.type === 'error') {
        setError(response.content)
      }
    } catch (err) {
      console.error('[useMedCannLabConversation] Erro ao processar mensagem:', err)
      setError('Enfrentei um obstáculo ao falar com a IA residente. Podemos tentar novamente em instantes.')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, user?.email, user?.id, stopSpeech])

  const triggerQuickCommand = useCallback((command: string) => {
    sendMessage(command)
  }, [sendMessage])

  const resetConversation = useCallback(() => {
    residentRef.current = new NoaResidentAI()
    conversationIdRef.current = createConversationId()
    setMessages([{
      id: 'welcome',
      role: 'noa',
      content: 'Conversa reiniciada. Vamos retomar? Posso monitorar o status do sistema ou abrir um novo protocolo clínico.',
      timestamp: new Date(),
      intent: 'HELP'
    }])
    setLastIntent(null)
    setUsedEndpoints([])
    setError(null)
  }, [])

  return {
    conversationId,
    messages,
    isProcessing,
    lastIntent,
    error,
    usedEndpoints,
    isSpeaking,
    sendMessage,
    triggerQuickCommand,
    resetConversation
  }
}

