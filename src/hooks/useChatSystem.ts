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
  const syncWithSupabase = useCallback(async (currentUserId?: string) => {
    if (!isOnline || !currentUserId) return

    try {
      // 1. Buscar mensagens não sincronizadas (isLocal = true)
      const localMessages = messages.filter(m => m.isLocal)
      
      // 2. Enviar para Supabase
      for (const msg of localMessages) {
        try {
          // Buscar ou criar chat_id baseado nos participantes
          const participants = [msg.senderId, msg.consultorioId].sort()
          const chatId = await generateChatIdUUID(participants[0], participants[1])
          
          const { error } = await supabase
            .from('chat_messages')
            .insert({
              chat_id: chatId,
              sender_id: msg.senderId,
              message: msg.content, // A tabela usa 'message', não 'content'
              message_type: msg.type || 'text',
              created_at: msg.timestamp.toISOString()
            })
          
          if (!error) {
            // Marcar como sincronizada removendo isLocal
            setMessages(prev => prev.map(m => 
              m.id === msg.id ? { ...m, isLocal: false } : m
            ))
          }
        } catch (err) {
          console.error('Erro ao sincronizar mensagem:', err)
        }
      }
      
      // 3. Buscar novas mensagens do Supabase
      const { data: newMessages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},chat_id.like.%${currentUserId}%`)
        .order('created_at', { ascending: true })
      
      if (!fetchError && newMessages) {
        // Buscar informações dos remetentes
        const senderIds = [...new Set(newMessages.map((m: any) => m.sender_id))]
        const { data: senders } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', senderIds)
        
        const sendersMap = new Map(senders?.map((s: any) => [s.id, s]) || [])
        
        const formattedMessages = newMessages.map((msg: any) => {
          const sender = sendersMap.get(msg.sender_id)
          return {
            id: msg.id,
            senderId: msg.sender_id,
            senderName: sender?.name || 'Usuário',
            senderEmail: sender?.email || '',
            content: msg.message || msg.content, // A tabela usa 'message'
            timestamp: new Date(msg.created_at),
            encrypted: false,
            read: msg.read_at !== null,
            consultorioId: msg.chat_id?.toString() || '',
            type: msg.message_type || 'text',
            fileUrl: msg.file_url,
            isLocal: false
          }
        })
        
        // Adicionar apenas mensagens novas
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const toAdd = formattedMessages.filter((m: any) => !existingIds.has(m.id))
          return [...prev, ...toAdd]
        })
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
    }
  }, [isOnline, messages])

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string, senderId: string, senderName: string, senderEmail: string, consultorioId: string) => {
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

    // Adicionar mensagem localmente imediatamente
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage]
      saveMessagesToLocal(updatedMessages)
      return updatedMessages
    })

    // Se estiver online, tentar salvar no Supabase imediatamente
    if (isOnline) {
      try {
        // Gerar chat_id UUID consistente baseado nos participantes
        const participants = [senderId, consultorioId].sort()
        const chatId = await generateChatIdUUID(participants[0], participants[1])
        
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            sender_id: senderId,
            message: content, // A tabela usa 'message', não 'content'
            message_type: 'text',
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (!error && data) {
          // Atualizar mensagem com ID do banco e marcar como sincronizada
          setMessages(prevMessages => prevMessages.map(m => 
            m.id === newMessage.id 
              ? { ...m, id: data.id, isLocal: false }
              : m
          ))
        } else {
          console.error('Erro ao salvar mensagem no Supabase:', error)
        }
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error)
      }
    }

    return newMessage
  }, [isOnline, saveMessagesToLocal])

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

  // Função auxiliar para gerar chat_id UUID consistente
  const generateChatIdUUID = async (user1Id: string, user2Id: string): Promise<string> => {
    // Ordenar IDs para garantir consistência
    const sortedIds = [user1Id, user2Id].sort()
    const chatIdString = `chat_${sortedIds.join('_')}`
    
    // Gerar UUID determinístico usando hash MD5
    // Nota: Em produção, usar função do Supabase se disponível
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(chatIdString))
    const hashArray = Array.from(new Uint8Array(hash))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Converter para formato UUID (usar primeiros 32 caracteres)
    const uuid = `${hashHex.substring(0, 8)}-${hashHex.substring(8, 12)}-${hashHex.substring(12, 16)}-${hashHex.substring(16, 20)}-${hashHex.substring(20, 32)}`
    
    return uuid
  }

  // Carregar dados iniciais e configurar Realtime
  useEffect(() => {
    loadLocalData()
    
    // Buscar consultórios do banco
    const loadConsultorios = async () => {
      try {
        const { data: professionals } = await supabase
          .from('users')
          .select('id, name, email, type, specialty, crm, cro')
          .in('type', ['profissional', 'professional'])
        
        if (professionals && professionals.length > 0) {
          const consultoriosFromDB = professionals.map((prof: any) => ({
            id: prof.id,
            name: `Consultório ${prof.name}`,
            doctor: prof.name,
            email: prof.email,
            specialty: prof.specialty || 'Cannabis Medicinal',
            crm: prof.crm || '',
            cro: prof.cro || '',
            status: 'online' as const,
            lastSeen: new Date(),
            type: 'professional' as const
          }))
          
          setConsultorios(prev => {
            const combined = [...defaultConsultorios, ...consultoriosFromDB]
            // Remover duplicatas
            const unique = combined.filter((c, index, self) => 
              index === self.findIndex((t) => t.id === c.id)
            )
            return unique
          })
        }
      } catch (error) {
        console.error('Erro ao carregar consultórios:', error)
      }
    }
    
    loadConsultorios()
    setIsLoading(false)
  }, [loadLocalData])

  // Configurar Supabase Realtime para mensagens
  useEffect(() => {
    if (!isOnline) return
    
    const channel = supabase
      .channel('chat_messages_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        const newMsg = payload.new as any
        // Adicionar nova mensagem se não existir
        setMessages(prev => {
          const exists = prev.some(m => m.id === newMsg.id)
          if (exists) return prev
          
          // Buscar informações do remetente
          supabase
            .from('users')
            .select('id, name, email')
            .eq('id', newMsg.sender_id)
            .single()
            .then(({ data: sender }) => {
              setMessages(prev => {
                const exists = prev.some(m => m.id === newMsg.id)
                if (exists) return prev
                
                return [...prev, {
                  id: newMsg.id,
                  senderId: newMsg.sender_id,
                  senderName: sender?.name || 'Usuário',
                  senderEmail: sender?.email || '',
                  content: newMsg.message || newMsg.content,
                  timestamp: new Date(newMsg.created_at),
                  encrypted: false,
                  read: newMsg.read_at !== null,
                  consultorioId: newMsg.chat_id?.toString() || '',
                  type: newMsg.message_type || 'text',
                  fileUrl: newMsg.file_url,
                  isLocal: false
                }]
              })
            })
          
          return prev
        })
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOnline])

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
