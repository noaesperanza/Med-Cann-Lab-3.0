import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PatientHealthHistory from '../components/PatientHealthHistory'
import ChatAIResident from '../components/ChatAIResident'
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile, 
  Image, 
  FileText, 
  Download, 
  Share2, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  ThumbsUp,
  Reply,
  Pin,
  Star,
  Archive,
  Trash2,
  Edit,
  Copy,
  Flag,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  Calendar,
  MapPin,
  Mail,
  Phone as PhoneIcon,
  ChevronDown,
  Loader2
} from 'lucide-react'

interface ChatUser {
  id: string
  name: string
  email: string
  type: 'patient' | 'professional' | 'student' | 'admin'
  avatar?: string
  specialty?: string
  diagnosis?: string
  age?: number
}

interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  content: string
  type: string
  attachments?: any[]
  is_read: boolean
  created_at: string
}

const AUTHORIZED_PROFESSIONAL_EMAILS = ['rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com']

const PatientDoctorChat: React.FC = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const origin = new URLSearchParams(location.search).get('origin')
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientInfo, setShowPatientInfo] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || '')
  const [showPatientSelect, setShowPatientSelect] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'patient' | 'student' | 'professional'>('patient')
  const [showUserTypeSelect, setShowUserTypeSelect] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isPatientView = user?.type === 'patient' || origin === 'patient-dashboard'
  
  // Estados para dados reais do banco
  const [patientsList, setPatientsList] = useState<ChatUser[]>([])
  const [professionalsList, setProfessionalsList] = useState<ChatUser[]>([])
  const [studentsList, setStudentsList] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null)
  const [chatId, setChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Buscar usuários do banco de dados
  useEffect(() => {
    if (!user?.id) return

    const fetchUsers = async () => {
      try {
        setLoading(true)

        if (isPatientView) {
          const { data, error } = await supabase
            .from('users_compatible')
            .select('id, name, email, type')
            .in('email', AUTHORIZED_PROFESSIONAL_EMAILS)

          if (error) {
            console.error('Erro ao buscar profissionais autorizados:', error)
          }

          const normalizedProfessionals = (data || []).map((p) => ({
            ...p,
            avatar: p.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'P'
          }))

          setProfessionalsList(normalizedProfessionals)

          if (normalizedProfessionals.length > 0) {
            const alreadySelected = normalizedProfessionals.find((pro) => pro.id === selectedPatientId)
            const defaultProfessional = alreadySelected || normalizedProfessionals[0]
            if (!alreadySelected) {
              setSelectedPatientId(defaultProfessional.id)
            }
            setCurrentChatUser(defaultProfessional)
          } else {
            setCurrentChatUser(null)
          }
        } else {
          if (user.type === 'professional' || user.type === 'admin') {
            const { data: patients, error: patientsError } = await supabase
              .from('users')
              .select('id, name, email, type')
              .eq('type', 'patient')
              .order('name')

            if (!patientsError && patients) {
              setPatientsList(patients.map((p) => ({
                ...p,
                avatar: p.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'P'
              })))
            }
          }

          const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, name, email, type')
            .eq('type', 'student')
            .order('name')

          if (!studentsError && students) {
            setStudentsList(students.map((s) => ({
              ...s,
              avatar: s.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'S'
            })))
          }

          const { data: professionals, error: professionalsError } = await supabase
            .from('users')
            .select('id, name, email, type')
            .eq('type', 'professional')
            .order('name')

          if (!professionalsError && professionals) {
            setProfessionalsList(professionals.map((p) => ({
              ...p,
              avatar: p.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'P'
            })))
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user?.id, user?.type, isPatientView])

  // Atualizar selectedPatientId quando patientId da URL mudar
  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId)
    }
  }, [patientId])

  // Buscar ou criar chat privado
  useEffect(() => {
    if (!user?.id || !selectedPatientId) {
      console.log('⏸️ Aguardando usuário ou seleção de paciente. user?.id:', user?.id, 'selectedPatientId:', selectedPatientId)
      return
    }

    // Resetar chatId quando o profissional mudar (para pacientes)
    if (isPatientView) {
      setChatId(null)
      setMessages([])
    }

    const setupChat = async () => {
      try {
        console.log('🔧 Configurando chat...')
        const doctorId = isPatientView ? selectedPatientId : user.id
        const patientIdForChat = isPatientView ? (user?.id || '') : selectedPatientId

        console.log('👤 IDs do chat:', { doctorId, patientIdForChat, userType: user.type, selectedPatientId })

        // Buscar chat existente
        let { data: existingChats, error: chatError } = await supabase
          .from('private_chats')
          .select('id, doctor_id, patient_id')
          .or(`and(doctor_id.eq.${doctorId},patient_id.eq.${patientIdForChat}),and(doctor_id.eq.${patientIdForChat},patient_id.eq.${doctorId})`)

        let existingChat = existingChats && existingChats.length > 0 ? existingChats[0] : null

        if (chatError && chatError.code !== 'PGRST116') {
          console.error('Erro ao buscar chat:', chatError)
        }

        let currentChatId = existingChat?.id

        // Criar chat se não existir
        if (!currentChatId) {
          const { data: newChat, error: createError } = await supabase
            .from('private_chats')
            .insert({
              doctor_id: doctorId,
              patient_id: patientIdForChat,
              is_active: true
            })
            .select()
            .single()

          if (createError) {
            console.error('Erro ao criar chat:', createError)
            return
          }

          currentChatId = newChat?.id
        }

        setChatId(currentChatId || null)
        console.log('💬 Chat ID definido:', currentChatId)

        // Buscar mensagens do chat
        if (currentChatId) {
          const { data: chatMessages, error: messagesError } = await supabase
            .from('private_messages')
            .select('*')
            .eq('chat_id', currentChatId)
            .order('created_at', { ascending: true })

          if (!messagesError && chatMessages) {
            // Buscar informações dos remetentes
            const messagesWithSenders = await Promise.all(
              chatMessages.map(async (msg) => {
                const { data: sender } = await supabase
                  .from('users')
                  .select('name')
                  .eq('id', msg.sender_id)
                  .single()

                return {
                  id: msg.id,
                  sender_id: msg.sender_id,
                  sender_name: sender?.name || 'Usuário',
                  content: msg.content,
                  type: msg.type || 'text',
                  attachments: msg.attachments || [],
                  is_read: msg.is_read,
                  created_at: msg.created_at
                }
              })
            )

            setMessages(messagesWithSenders)

            // Marcar mensagens como lidas
            await supabase
              .from('private_messages')
              .update({ is_read: true })
              .eq('chat_id', currentChatId)
              .neq('sender_id', user.id)
          }
        }

        // Buscar informações do usuário atual do chat
        const { data: chatUser } = await supabase
          .from('users')
          .select('id, name, email, type')
          .eq('id', selectedPatientId)
          .single()

        if (chatUser) {
          setCurrentChatUser({
            ...chatUser,
            avatar: chatUser.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'
          })
        }

        // Configurar real-time subscription
        if (currentChatId) {
          const channel = supabase
            .channel(`private_chat_${currentChatId}`)
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'private_messages',
              filter: `chat_id=eq.${currentChatId}`
            }, (payload) => {
              const newMessage = payload.new as any
              
              // Buscar nome do remetente
              supabase
                .from('users')
                .select('name')
                .eq('id', newMessage.sender_id)
                .single()
                .then(({ data: sender }) => {
                  setMessages(prev => [...prev, {
                    id: newMessage.id,
                    sender_id: newMessage.sender_id,
                    sender_name: sender?.name || 'Usuário',
                    content: newMessage.content,
                    type: newMessage.type || 'text',
                    attachments: newMessage.attachments || [],
                    is_read: newMessage.is_read,
                    created_at: newMessage.created_at
                  }])

                  // Marcar como lida se não for minha mensagem
                  if (newMessage.sender_id !== user.id) {
                    supabase
                      .from('private_messages')
                      .update({ is_read: true })
                      .eq('id', newMessage.id)
                  }
                })
            })
            .subscribe()

          return () => {
            supabase.removeChannel(channel)
          }
        }
      } catch (error) {
        console.error('Erro ao configurar chat:', error)
      }
    }

    setupChat()
  }, [user?.id, selectedPatientId])

  // Obter lista atual baseada no tipo de usuário selecionado
  const getCurrentUserList = (): ChatUser[] => {
    if (isPatientView) {
      return professionalsList
    }
    
    switch (selectedUserType) {
      case 'patient':
        return patientsList
      case 'student':
        return studentsList
      case 'professional':
        return professionalsList
      default:
        return patientsList
    }
  }

  const currentUserList = getCurrentUserList()
  const currentSelectedUser = currentUserList.find(u => u.id === selectedPatientId) || currentUserList[0]

  const [attachments, setAttachments] = useState<any[]>([])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPatientSelect(false)
        setShowUserTypeSelect(false)
      }
    }

    if (showPatientSelect || showUserTypeSelect) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPatientSelect, showUserTypeSelect])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Salvar mensagem no histórico clínico do paciente
  const saveMessageToClinicalHistory = async (content: string, senderId: string, recipientId: string) => {
    try {
      const patientId = user?.type === 'patient' ? user.id : recipientId
      const doctorId = user?.type === 'professional' || user?.type === 'admin' ? user.id : recipientId

      // Criar contexto da conversa para a IA
      const conversationContext = messages
        .slice(-10) // Últimas 10 mensagens
        .map(msg => `${msg.sender_id === patientId ? 'Paciente' : 'Profissional'}: ${msg.content}`)
        .join('\n')

      // Salvar em patient_interactions se a tabela existir, senão em clinical_assessments
      const { error: interactionError } = await supabase
        .from('patient_interactions')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          interaction_type: 'CHAT',
          content: content,
          metadata: {
            sender_id: senderId,
            chat_id: chatId,
            timestamp: new Date().toISOString(),
            conversation_context: conversationContext,
            ai_processed: true // Marcar que a IA processou esta mensagem
          }
        })

      if (interactionError && interactionError.code !== '42P01') {
        // Se a tabela não existir, tentar salvar em clinical_assessments
        const { error: assessmentError } = await supabase
          .from('clinical_assessments')
          .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            assessment_type: 'CHAT',
            status: 'completed',
            data: {
              message: content,
              sender_id: senderId,
              chat_id: chatId,
              timestamp: new Date().toISOString(),
              conversation_context: conversationContext,
              ai_processed: true
            },
            clinical_report: `Mensagem de chat: ${content}`
          })

        if (assessmentError) {
          console.error('Erro ao salvar no histórico clínico:', assessmentError)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar mensagem no histórico clínico:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPatientSelect) {
        setShowPatientSelect(false)
      }
      if (showUserTypeSelect) {
        setShowUserTypeSelect(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPatientSelect, showUserTypeSelect])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || !user?.id || sending) return

    setSending(true)
    const messageContent = message.trim()
    setMessage('')

    try {
      // Salvar mensagem no Supabase
      const { data: newMessage, error: messageError } = await supabase
        .from('private_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: messageContent,
          type: 'text',
          attachments: [],
          is_read: false
        })
        .select()
        .single()

      if (messageError) {
        console.error('Erro ao enviar mensagem:', messageError)
        setMessage(messageContent) // Restaurar mensagem se falhar
        return
      }

      // Adicionar mensagem localmente (será atualizada pelo real-time)
      const messageWithSender: ChatMessage = {
        id: newMessage.id,
        sender_id: user.id,
        sender_name: user.name || 'Usuário',
        content: messageContent,
        type: 'text',
        attachments: [],
        is_read: false,
        created_at: newMessage.created_at
      }

      setMessages(prev => [...prev, messageWithSender])
      
      // Salvar mensagem no histórico clínico do paciente
      await saveMessageToClinicalHistory(messageContent, user.id, selectedPatientId || currentChatUser?.id || '')
      
      scrollToBottom()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMessage(messageContent) // Restaurar mensagem se falhar
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Simular upload de arquivo
      const file = files[0]
      const newAttachment = {
        id: attachments.length + 1,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedBy: user?.name || 'Usuário',
        uploadedAt: new Date().toLocaleDateString('pt-BR'),
        url: '#'
      }
      setAttachments([...attachments, newAttachment])
      
      // Adicionar mensagem sobre o arquivo
      const fileMessage = {
        id: messages.length + 1,
        sender: user?.type === 'professional' ? 'doctor' : 'patient',
        senderName: user?.name || 'Usuário',
        senderAvatar: user?.name?.split(' ').map(n => n[0]).join('') || 'U',
        message: `📎 Arquivo enviado: ${file.name}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'file',
        isRead: false,
        reactions: { heart: 0, thumbs: 0 },
        attachments: [newAttachment] as any[]
      }
      setMessages([...messages, fileMessage] as any)
    }
  }

  const handleAudioUpload = async () => {
    try {
      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      // Iniciar gravação
      setIsRecording(true)
      mediaRecorder.start()

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Criar anexo de áudio
        const newAttachment = {
          id: attachments.length + 1,
          name: `audio_${new Date().getTime()}.wav`,
          type: 'audio',
          size: `${(audioBlob.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedBy: user?.name || 'Usuário',
          uploadedAt: new Date().toLocaleDateString('pt-BR'),
          url: audioUrl
        }
        
        setAttachments([...attachments, newAttachment])
        
        // Adicionar mensagem de áudio
        const audioMessage = {
          id: messages.length + 1,
          sender: user?.type === 'professional' ? 'doctor' : 'patient',
          senderName: user?.name || 'Usuário',
          senderAvatar: user?.name?.split(' ').map(n => n[0]).join('') || 'U',
          message: '🎤 Mensagem de voz',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: 'audio',
          isRead: false,
          reactions: { heart: 0, thumbs: 0 },
          attachments: [newAttachment] as any[]
        }
        
        setMessages([...messages, audioMessage] as any)
        
        // Parar todos os tracks
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
      }

      // Parar gravação após 60 segundos ou quando o usuário clicar novamente
      setTimeout(() => {
        if (isRecording) {
          mediaRecorder.stop()
        }
      }, 60000)
      
    } catch (error) {
      console.error('Erro ao gravar áudio:', error)
      alert('Não foi possível acessar o microfone. Verifique as permissões.')
      setIsRecording(false)
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
    }, 3000)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />
      case 'image': return <Image className="w-4 h-4" />
      case 'audio': return <Mic className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-400'
      case 'image': return 'text-blue-400'
      case 'audio': return 'text-purple-400'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={() => {
                if (origin === 'patient-dashboard') {
                  navigate('/app/patient-dashboard')
                } else {
                  navigate(-1)
                }
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {/* Status Online no Header */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">Online</span>
            </div>
            
            {/* Seletor de Tipo de Usuário - apenas para profissionais */}
            {(user?.type === 'professional' || user?.type === 'admin') && (
              <div className="relative">
                <button
                  onClick={() => setShowUserTypeSelect(!showUserTypeSelect)}
                  className="bg-slate-700/50 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
                >
                  <span className="text-white font-semibold">
                    {selectedUserType === 'patient' ? '👥 Pacientes' : '🎓 Alunos'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Tipo de Usuário */}
                {showUserTypeSelect && (
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setSelectedUserType('patient')
                          setShowUserTypeSelect(false)
                          setShowPatientSelect(false)
                        }}
                        className="w-full p-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-2xl">👥</span>
                        <span className="font-semibold text-white">Pacientes</span>
                        {selectedUserType === 'patient' && (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserType('student')
                          setShowUserTypeSelect(false)
                          setShowPatientSelect(false)
                        }}
                        className="w-full p-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-2xl">🎓</span>
                        <span className="font-semibold text-white">Alunos</span>
                        {selectedUserType === 'student' && (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Informações do profissional selecionado para pacientes */}
            {isPatientView && currentChatUser && (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 rounded-lg shadow-lg">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <span className="text-white font-bold text-xs">{currentChatUser.avatar || 'P'}</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-semibold text-white truncate">{currentChatUser.name}</h1>
                  <p className="text-xs text-white/80 truncate">
                    {currentChatUser.email === 'eduardoscfaveret@gmail.com'
                      ? 'Dr. Eduardo Faveret • Profissional'
                      : currentChatUser.email === 'rrvalenca@gmail.com'
                        ? 'Dr. Ricardo Valença • Administrador'
                        : 'Profissional de referência'}
                  </p>
                </div>
              </div>
            )}

            {/* Seletor de Usuário Específico - Para Profissionais */}
            {user?.type !== 'patient' && currentUserList.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowPatientSelect(!showPatientSelect)}
                  className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{currentChatUser?.avatar || currentSelectedUser?.avatar || 'U'}</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-lg font-bold text-white">{currentChatUser?.name || currentSelectedUser?.name || 'Selecione um usuário'}</h1>
                    <p className="text-slate-300 text-sm">
                      {currentChatUser?.email || currentSelectedUser?.email || 'Carregando...'}
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </button>

                {/* Dropdown */}
                {showPatientSelect && currentUserList.length > 0 && (
                  <div className="absolute left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {currentUserList.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedPatientId(u.id)
                            setShowPatientSelect(false)
                          }}
                          className="w-full p-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{u.avatar || 'U'}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-sm text-slate-400">{u.email}</p>
                          </div>
                          {selectedPatientId === u.id && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat Principal */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/80 rounded-lg border border-slate-700 h-[calc(100vh-200px)] flex flex-col">
            {/* Chat Header Compacto */}
            <div className="p-3 border-b border-slate-700 bg-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {currentChatUser ? `Conversando com ${currentChatUser.name}` : 'Selecione um profissional'}
                    </h3>
                    <p className="text-xs text-slate-400">Chat seguro e confidencial</p>
                  </div>
                </div>
              </div>
            </div>

            {/* IA Residente - Componente de Presença */}
            {chatId && currentChatUser && (
              <div className="px-4 pt-4">
                <ChatAIResident
                  chatId={chatId}
                  patientId={user?.type === 'patient' ? user.id : currentChatUser.id}
                  doctorId={user?.type === 'patient' ? currentChatUser.id : user?.id || ''}
                  messages={messages}
                  onAISuggestion={(suggestion) => {
                    // Opcional: mostrar sugestão da IA
                    console.log('💡 Sugestão da IA:', suggestion)
                  }}
                />
              </div>
            )}
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Nenhuma mensagem ainda. Inicie a conversa!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === user?.id
                  const senderAvatar = msg.sender_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'
                  return (
                    <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex space-x-3 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{senderAvatar}</span>
                        </div>
                        <div className={`${isOwnMessage ? 'bg-blue-600' : 'bg-slate-700'} rounded-lg p-3`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-white font-medium text-sm">{msg.sender_name}</span>
                            <span className="text-slate-300 text-xs">{formatTime(msg.created_at)}</span>
                            {msg.is_read && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <p className="text-white mb-2">{msg.content}</p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-2">
                              {msg.attachments.map((attachment: any, idx: number) => (
                                <div key={idx} className={`p-2 bg-slate-600/50 rounded ${attachment.type === 'audio' ? 'space-y-2' : 'flex items-center space-x-2'}`}>
                                  {attachment.type === 'audio' ? (
                                    <>
                                      <div className="flex items-center space-x-2">
                                        {getFileIcon(attachment.type)}
                                        <span className="text-white text-sm">{attachment.name}</span>
                                        <span className="text-slate-400 text-xs">{attachment.size}</span>
                                      </div>
                                      <audio controls className="w-full">
                                        <source src={attachment.url} type="audio/wav" />
                                        Seu navegador não suporta o elemento de áudio.
                                      </audio>
                                    </>
                                  ) : (
                                    <>
                                      {getFileIcon(attachment.type)}
                                      <span className="text-white text-sm">{attachment.name}</span>
                                      <span className="text-slate-400 text-xs">{attachment.size}</span>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <button className="text-slate-400 hover:text-red-400 transition-colors">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="text-slate-400 hover:text-blue-400 transition-colors">
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button className="text-slate-400 hover:text-green-400 transition-colors">
                              <Reply className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700">
              {/* File Upload Menu */}
              {showFileUpload && (
                <div className="mb-3 p-3 bg-slate-700 rounded-lg flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>)
                      input.click()
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-sm">Imagem</span>
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.pdf,.doc,.docx,.txt'
                      input.onchange = (e) => handleFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>)
                      input.click()
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Documento</span>
                  </button>
                  <button
                    onClick={() => handleAudioUpload()}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                    <span className="text-sm">Áudio</span>
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-slate-400 hover:text-yellow-400 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={isRecording ? () => setIsRecording(false) : startRecording}
                  className={`p-2 transition-colors ${
                    isRecording 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !chatId}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Histórico de Saúde do Paciente */}
        {user?.type === 'patient' && (
          <div className="lg:col-span-1">
            <PatientHealthHistory patientId={user.id} />
          </div>
        )}

        {/* Sidebar - Informações do Usuário - Para Profissionais */}
        {user?.type !== 'patient' && currentChatUser && (
          <div className="lg:col-span-1">
            <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
              <h3 className="text-base font-semibold text-white mb-3">👤 Informações</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-xs">Nome</p>
                  <p className="text-white font-medium text-sm">{currentChatUser.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Email</p>
                  <p className="text-white font-medium text-sm">{currentChatUser.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Informações sobre o Chat */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6 text-blue-400" />
                  <span>Informações sobre o Chat</span>
                </h2>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Sigilo e LGPD */}
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span>Sigilo Médico e LGPD</span>
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Todas as conversas são criptografadas e protegidas por sigilo médico profissional</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Conformidade total com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Seus dados são armazenados de forma segura e apenas profissionais autorizados têm acesso</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento</span>
                    </li>
                  </ul>
                </div>

                {/* Funcionamento do Chat */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span>Como Funciona o Chat</span>
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>Escolha um profissional da plataforma (Dr. Ricardo Valença ou Dr. Eduardo Faveret)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>Envie mensagens de texto, documentos, imagens ou áudios</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>Todas as mensagens são salvas automaticamente no seu histórico clínico</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>As conversas são utilizadas pela IA Residente para personalizar seu atendimento</span>
                    </li>
                  </ul>
                </div>

                {/* Envio de Documentos */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    <span>Envio de Documentos</span>
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span>Você pode enviar exames, laudos, receitas e outros documentos médicos</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span>Formatos aceitos: PDF, imagens (JPG, PNG), documentos (DOC, DOCX)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span>Os documentos são automaticamente integrados ao seu prontuário</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span>A IA Residente analisa os documentos para contextualizar seu atendimento</span>
                    </li>
                  </ul>
                </div>

                {/* Integração com IA Residente */}
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-700/30">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span>Integração com IA Residente</span>
                  </h3>
                  <p className="text-slate-300 text-sm mb-3">
                    Todas as conversas e documentos enviados via chat são automaticamente integrados ao seu histórico clínico 
                    e utilizados pela IA Residente dedicada a você. Isso permite:
                  </p>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Personalização do atendimento baseada no seu histórico completo</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Contexto completo para avaliações clínicas mais precisas</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Continuidade do cuidado entre consultas</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Ambiente repleto de informações clínicas sobre você</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientDoctorChat
