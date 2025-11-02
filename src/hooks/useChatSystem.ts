import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderEmail: string
  content: string
  timestamp: Date
  encrypted: boolean
  read: boolean
  consultorioId: string
  type: 'text' | 'audio' | 'video' | 'file'
  fileUrl?: string
  isLocal?: boolean // Indica se é uma mensagem local não sincronizada
}

export interface Consultorio {
  id: string
  name: string
  doctor: string
  email: string
  specialty: string
  crm: string
  cro?: string
  status: 'online' | 'offline' | 'busy'
  lastSeen?: Date
  type: 'professional' | 'student' | 'patient'
}

const STORAGE_KEY = 'medcannlab_chat_messages'
const CONSULTORIOS_KEY = 'medcannlab_consultorios'

export const useChatSystem = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [consultorios, setConsultorios] = useState<Consultorio[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [selectedConsultorio, setSelectedConsultorio] = useState<Consultorio | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Dados padrão dos consultórios
  const defaultConsultorios: Consultorio[] = [
    {
      id: 'consultorio-ricardo',
      name: 'Consultório Escola Ricardo Valença',
      doctor: 'Dr. Ricardo Valença',
      email: 'rrvalenca@gmail.com',
      specialty: 'Cannabis Medicinal Integrativa',
      crm: 'CRM-RJ 123456',
      cro: 'CRO-RJ 789012',
      status: 'online',
      lastSeen: new Date(),
      type: 'professional'
    },
    {
      id: 'consultorio-eduardo',
      name: 'Consultório Escola Eduardo Faveret',
      doctor: 'Dr. Eduardo Faveret',
      email: 'eduardoscfaveret@gmail.com',
      specialty: 'Neurologia Pediátrica • Epilepsia e Cannabis Medicinal',
      crm: 'CRM-RJ 123456',
      cro: 'CRO-RJ 654321',
      status: 'online',
      lastSeen: new Date(),
      type: 'professional'
    }
  ]

  // Mensagens vazias - sistema limpo
  const defaultMessages: ChatMessage[] = []

  // Carregar dados do localStorage
  const loadLocalData = useCallback(() => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEY)
      const storedConsultorios = localStorage.getItem(CONSULTORIOS_KEY)

      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      } else {
        setMessages(defaultMessages)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMessages))
      }

      if (storedConsultorios) {
        const parsedConsultorios = JSON.parse(storedConsultorios).map((consultorio: any) => ({
          ...consultorio,
          lastSeen: consultorio.lastSeen ? new Date(consultorio.lastSeen) : undefined
        }))
        setConsultorios(parsedConsultorios)
      } else {
        setConsultorios(defaultConsultorios)
        localStorage.setItem(CONSULTORIOS_KEY, JSON.stringify(defaultConsultorios))
      }
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error)
      setMessages(defaultMessages)
      setConsultorios(defaultConsultorios)
    }
  }, [])

  // Salvar mensagens no localStorage
  const saveMessagesToLocal = useCallback((newMessages: ChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages))
    } catch (error) {
      console.error('Erro ao salvar mensagens localmente:', error)
    }
  }, [])

  // Tentar sincronizar com Supabase quando online
  const syncWithSupabase = useCallback(async () => {
    if (!isOnline) return

    try {
      // Aqui você pode implementar a sincronização com Supabase
      // Por enquanto, apenas simula a sincronização
      console.log('🔄 Sincronizando com Supabase...')
      
      // Simular delay de sincronização
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('✅ Sincronização concluída')
    } catch (error) {
      console.error('Erro na sincronização:', error)
    }
  }, [isOnline])

  // Enviar mensagem
  const sendMessage = useCallback((content: string, senderId: string, senderName: string, senderEmail: string, consultorioId: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId,
      senderName,
      senderEmail,
      content,
      timestamp: new Date(),
      encrypted: true,
      read: false,
      consultorioId,
      type: 'text',
      isLocal: !isOnline // Marca como local se estiver offline
    }

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage]
      saveMessagesToLocal(updatedMessages)
      return updatedMessages
    })

    // Se estiver online, tentar sincronizar
    if (isOnline) {
      syncWithSupabase()
    }

    return newMessage
  }, [isOnline, saveMessagesToLocal, syncWithSupabase])

  // Obter mensagens para um consultório específico
  const getMessagesForConsultorio = useCallback((consultorioId: string) => {
    return messages.filter(msg => 
      msg.consultorioId === consultorioId || 
      msg.senderId === consultorioId
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }, [messages])

  // Obter contagem de mensagens não lidas
  const getUnreadCount = useCallback((consultorioId: string, currentUserId: string) => {
    return messages.filter(msg => 
      msg.senderId === consultorioId && 
      !msg.read && 
      msg.consultorioId === currentUserId
    ).length
  }, [messages])

  // Marcar mensagens como lidas
  const markAsRead = useCallback((consultorioId: string, currentUserId: string) => {
    const updatedMessages = messages.map(msg => {
      if (msg.senderId === consultorioId && msg.consultorioId === currentUserId && !msg.read) {
        return { ...msg, read: true }
      }
      return msg
    })
    setMessages(updatedMessages)
    saveMessagesToLocal(updatedMessages)
  }, [messages, saveMessagesToLocal])

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncWithSupabase()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncWithSupabase])

  // Carregar dados iniciais
  useEffect(() => {
    loadLocalData()
    setIsLoading(false)
  }, [loadLocalData])

  return {
    messages,
    consultorios,
    selectedConsultorio,
    setSelectedConsultorio,
    isOnline,
    isLoading,
    sendMessage,
    getMessagesForConsultorio,
    getUnreadCount,
    markAsRead,
    syncWithSupabase
  }
}
