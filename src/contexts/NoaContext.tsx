import React, { createContext, useContext, useState, ReactNode } from 'react'
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
  
  // Inicializar IA Residente (apenas uma vez para manter o estado)
  const [residentAI] = useState(() => new NoaResidentAI())
  
  console.log('🎯 NoaContext - residentAI instanciado:', residentAI)

  const sendMessage = async (content: string) => {
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
      console.log('🧠 Processando mensagem com IA Residente...', content)
      const aiResponse = await residentAI.processMessage(content, user?.id, user?.email)
      
      console.log('✅ Resposta da IA Residente:', aiResponse)
      
      const noaMessage: NoaMessage = {
        id: (Date.now() + 1).toString(),
        type: 'noa',
        content: aiResponse.content,
        timestamp: new Date(),
        aiResponse: aiResponse,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions
      }

      setMessages(prev => [...prev, noaMessage])
    } catch (error) {
      console.error('Erro ao processar mensagem com Nôa:', error)
      
      // Fallback para resposta simples
      const noaMessage: NoaMessage = {
        id: (Date.now() + 1).toString(),
        type: 'noa',
        content: `Olá! Sou a Nôa Esperança, sua assistente médica especializada em Cannabis Medicinal. Como posso ajudá-lo hoje?`,
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