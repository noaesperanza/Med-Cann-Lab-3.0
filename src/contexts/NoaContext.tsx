import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { NoaEsperancaCore, noaEsperancaConfig, NoaInteraction } from '../lib/noaEsperancaCore'
import { NoaResidentAI, residentAIConfig, AIResponse } from '../lib/noaResidentAI'
import { useAuth } from './AuthContext'

export interface NoaMessage {
  id: string
  type: 'user' | 'noa'
  content: string
  timestamp: Date
  isTyping?: boolean
  audioUrl?: string
  videoUrl?: string
  aiResponse?: AIResponse
  confidence?: number
  suggestions?: string[]
}

export interface NoaContextType {
  messages: NoaMessage[]
  isOpen: boolean
  isTyping: boolean
  isListening: boolean
  isSpeaking: boolean
  sendMessage: (content: string) => void
  toggleChat: () => void
  startListening: () => void
  stopListening: () => void
  clearMessages: () => void
  setTyping: (typing: boolean) => void
}

const NoaContext = createContext<NoaContextType | undefined>(undefined)

export const useNoa = () => {
  const context = useContext(NoaContext)
  if (context === undefined) {
    throw new Error('useNoa must be used within a NoaProvider')
  }
  return context
}

interface NoaProviderProps {
  children: ReactNode
}

export const NoaProvider: React.FC<NoaProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<NoaMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Acessar dados do usuário para individualização
  const { user } = useAuth()
  
  // Inicializar Nôa Esperança Core (apenas uma vez)
  const [noaCore] = useState(() => new NoaEsperancaCore(noaEsperancaConfig))
  
  // Inicializar IA Residente apenas quando houver usuário logado
  const residentAIRef = useRef<NoaResidentAI | null>(null)
  
  useEffect(() => {
    if (user && !residentAIRef.current) {
      residentAIRef.current = new NoaResidentAI()
    } else if (!user && residentAIRef.current) {
      // Limpar IA quando usuário fizer logout
      residentAIRef.current = null
    }
  }, [user])

  const sendMessage = async (content: string) => {
    // Verificar se há usuário logado e IA inicializada
    if (!user) {
      const errorMessage: NoaMessage = {
        id: Date.now().toString(),
        type: 'noa',
        content: 'Por favor, faça login para usar a IA residente.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    if (!residentAIRef.current) {
      const errorMessage: NoaMessage = {
        id: Date.now().toString(),
        type: 'noa',
        content: 'IA residente não inicializada. Aguarde um momento e tente novamente.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    const userMessage: NoaMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Processar com IA Residente incluindo email do usuário para individualização
      const aiResponse = await residentAIRef.current.processMessage(
        content, 
        user.id, 
        user.email
      )
      
      if (!aiResponse) {
        throw new Error('A IA não retornou uma resposta válida')
      }
      
      const noaMessage: NoaMessage = {
        id: (Date.now() + 1).toString(),
        type: 'noa',
        content: aiResponse.content || 'Desculpe, não consegui processar sua mensagem no momento.',
        timestamp: new Date(),
        aiResponse: aiResponse,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions
      }

      setMessages(prev => [...prev, noaMessage])
    } catch (error) {
      console.error('❌ Erro ao processar mensagem com Nôa:', error)
      
      const noaMessage: NoaMessage = {
        id: (Date.now() + 1).toString(),
        type: 'noa',
        content: 'Desculpe, não consegui processar sua mensagem no momento. Por favor, tente novamente.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, noaMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleChat = () => {
    setIsOpen(prev => !prev)
  }

  const startListening = () => {
    setIsListening(true)
    // Implementar reconhecimento de voz
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const clearMessages = () => {
    setMessages([])
  }

  const setTyping = (typing: boolean) => {
    setIsTyping(typing)
  }

  const value: NoaContextType = {
    messages,
    isOpen,
    isTyping,
    isListening,
    isSpeaking,
    sendMessage,
    toggleChat,
    startListening,
    stopListening,
    clearMessages,
    setTyping
  }

  return (
    <NoaContext.Provider value={value}>
      {children}
    </NoaContext.Provider>
  )
}