import { useCallback, useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { NoaResidentAI, type AIResponse } from '../lib/noaResidentAI'
import { ConversationalIntent } from '../lib/medcannlab/types'

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
  const [lastIntent, setLastIntent] = useState<ConversationalIntent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usedEndpoints, setUsedEndpoints] = useState<string[]>([])

  if (!residentRef.current) {
    residentRef.current = new NoaResidentAI()
  }

  const conversationId = useMemo(() => conversationIdRef.current, [])

  const sendMessage = useCallback(async (text: string, options: SendMessageOptions = {}) => {
    const trimmed = text.trim()
    if (!trimmed || isProcessing) return

    setIsProcessing(true)
    setError(null)

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
        content: response.content,
        timestamp: ensureDate(response.timestamp),
        intent,
        metadata: {
          confidence: response.confidence,
          reasoning: response.reasoning,
          metadata: response.metadata,
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
  }, [isProcessing, user?.email, user?.id])

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
    sendMessage,
    triggerQuickCommand,
    resetConversation
  }
}

