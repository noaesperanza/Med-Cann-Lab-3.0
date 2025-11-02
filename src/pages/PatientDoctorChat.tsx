import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
  ChevronDown
} from 'lucide-react'

const PatientDoctorChat: React.FC = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
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
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || '1')
  const [showPatientSelect, setShowPatientSelect] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'patient' | 'student' | 'professional'>('patient')
  const [showUserTypeSelect, setShowUserTypeSelect] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Array vazio para receber dados reais do banco de dados
  const patients: Record<number, any> = {}
  
  // Obter dados do paciente baseado no ID - usando dados vazios temporariamente
  const currentPatient = null
  const patient = currentPatient

  // Array de pacientes para o seletor
  const patientsList: any[] = []

  // Dados de Alunos
  const students = {
    1: {
      id: 1,
      name: 'Ana Costa',
      course: 'Pós-Graduação Cannabis Medicinal',
      progress: 75,
      avatar: 'AC',
      specialty: 'Estudante de Medicina'
    },
    2: {
      id: 2,
      name: 'Carlos Lima',
      course: 'Arte da Entrevista Clínica',
      progress: 90,
      avatar: 'CL',
      specialty: 'Residente em Clínica Geral'
    }
  }

  // Dados de Profissionais
  const professionals = {
    1: {
      id: 1,
      name: 'Dr. Ricardo Silva',
      crm: '12345-SP',
      specialty: 'Nefrologia',
      avatar: 'RS'
    },
    2: {
      id: 2,
      name: 'Dra. Fernanda Oliveira',
      crm: '67890-RJ',
      specialty: 'Psiquiatria',
      avatar: 'FO'
    }
  }

  const studentsList = Object.values(students)
  const professionalsList = Object.values(professionals)

  // Obter lista atual baseada no tipo de usuário selecionado
  const getCurrentUserList = () => {
    switch (selectedUserType) {
      case 'patient':
        return patientsList.map(p => ({ ...p, type: 'patient' as const }))
      case 'student':
        return studentsList.map(s => ({ ...s, type: 'student' as const }))
      case 'professional':
        return professionalsList.map(p => ({ ...p, type: 'professional' as const }))
      default:
        return patientsList.map(p => ({ ...p, type: 'patient' as const }))
    }
  }

  const currentUserList = getCurrentUserList()

  // Obter usuário selecionado atualmente
  const getCurrentSelectedUser = () => {
    return currentUserList.find(u => u.id.toString() === selectedPatientId) || currentUserList[0]
  }

  const currentSelectedUser = getCurrentSelectedUser()

  // Mensagens do chat - será populado com dados reais do banco
  const getMessagesForPatient = (patientId: number) => {
    const patientMessages: Record<number, any[]> = {}
    return patientMessages[patientId] || []
  }

  const [messages, setMessages] = useState(getMessagesForPatient(parseInt(patientId || '1')))

  const [attachments, setAttachments] = useState<any[]>([])

  // Atualizar selectedPatientId quando patientId da URL mudar
  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId)
    }
  }, [patientId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Atualizar mensagens quando o paciente selecionado mudar
  useEffect(() => {
    setMessages(getMessagesForPatient(parseInt(selectedPatientId)))
  }, [selectedPatientId])

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

  // Função para salvar mensagem no histórico do paciente (integração com IA e prontuário)
  const saveMessageToPatientRecord = async (message: any, currentSelectedUser: any) => {
    if (selectedUserType === 'patient') {
      console.log('📝 Salvando mensagem no prontuário do paciente:', {
        patientId: currentSelectedUser.id,
        patientName: currentSelectedUser.name,
        message: message.message,
        sender: message.senderName,
        timestamp: message.timestamp,
        metadata: {
          chatType: 'professional-patient',
          savedToRecord: true,
          forIATraining: true,
          integrationWithClinicalAssessment: true
        }
      })
      
      // TODO: Implementar integração real com banco de dados
      // - Salvar no histórico do paciente
      // - Adicionar à anamnese
      // - Atualizar prontuário médico
      // - Enviar para treinamento da IA residente do paciente
    }
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: user?.type === 'professional' ? 'doctor' : 'patient',
        senderName: user?.name || 'Usuário',
        senderAvatar: user?.name?.split(' ').map(n => n[0]).join('') || 'U',
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isRead: false,
        reactions: { heart: 0, thumbs: 0 },
        attachments: []
      }
      setMessages([...messages, newMessage])
      
      // Salvar mensagem no prontuário do paciente (se for paciente)
      saveMessageToPatientRecord(newMessage, currentSelectedUser)
      
      setMessage('')
      
      // Simular resposta do outro participante
      setTimeout(() => {
        const responseMessage = {
          id: messages.length + 2,
          sender: user?.type === 'professional' ? 'patient' : 'doctor',
          senderName: user?.type === 'professional' ? 'Maria Silva' : 'Dr. Passos Mir',
          senderAvatar: user?.type === 'professional' ? 'MS' : 'PM',
          message: user?.type === 'professional' ? 'Entendi, obrigada pela orientação!' : 'Perfeito! Continue assim.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          isRead: false,
          reactions: { heart: 0, thumbs: 0 },
          attachments: []
        }
        setMessages(prev => [...prev, responseMessage])
      }, 2000)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/patients')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Seletor de Tipo de Usuário */}
            <div className="relative">
              <button
                onClick={() => setShowUserTypeSelect(!showUserTypeSelect)}
                className="bg-slate-700/50 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <span className="text-white font-semibold">
                  {selectedUserType === 'patient' ? '👥 Pacientes' : selectedUserType === 'student' ? '🎓 Alunos' : '🩺 Profissionais'}
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
                    <button
                      onClick={() => {
                        setSelectedUserType('professional')
                        setShowUserTypeSelect(false)
                        setShowPatientSelect(false)
                      }}
                      className="w-full p-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-3"
                    >
                      <span className="text-2xl">🩺</span>
                      <span className="font-semibold text-white">Profissionais</span>
                      {selectedUserType === 'professional' && (
                        <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Seletor de Usuário Específico */}
            <div className="relative">
              <button
                onClick={() => setShowPatientSelect(!showPatientSelect)}
                className="flex items-center space-x-3 bg-slate-700/50 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{(currentSelectedUser as any).avatar || 'U'}</span>
                </div>
                <div className="text-left">
                  <h1 className="text-lg font-bold text-white">{currentSelectedUser.name}</h1>
                  <p className="text-slate-300 text-sm">
                    {selectedUserType === 'patient' 
                      ? `${(currentSelectedUser as any).diagnosis} • ${(currentSelectedUser as any).age} anos`
                      : selectedUserType === 'student'
                      ? (currentSelectedUser as any).course
                      : (currentSelectedUser as any).specialty}
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </button>

              {/* Dropdown */}
              {showPatientSelect && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  <div className="p-2">
                    {currentUserList.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedPatientId(u.id.toString())
                          setShowPatientSelect(false)
                        }}
                        className="w-full p-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{(u as any).avatar}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-sm text-slate-400">
                            {selectedUserType === 'patient' ? (u as any).diagnosis : 
                             selectedUserType === 'student' ? (u as any).course : 
                             (u as any).specialty}
                          </p>
                        </div>
                        {selectedPatientId === u.id.toString() && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowPatientInfo(!showPatientInfo)}
              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-green-400 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-purple-400 transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-yellow-400 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Principal */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/80 rounded-lg border border-slate-700 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">💬 Chat Exclusivo</h3>
                  <p className="text-slate-400 text-sm">
                    {user?.type === 'professional' ? 'Conversando com Maria Silva' : 'Conversando com Dr. Passos Mir'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 transition-colors ${
                      isMuted ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-green-400'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === (user?.type === 'professional' ? 'doctor' : 'patient') ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex space-x-3 max-w-[70%] ${msg.sender === (user?.type === 'professional' ? 'doctor' : 'patient') ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{msg.senderAvatar}</span>
                    </div>
                    <div className={`${msg.sender === (user?.type === 'professional' ? 'doctor' : 'patient') ? 'bg-blue-600' : 'bg-slate-700'} rounded-lg p-3`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">{msg.senderName}</span>
                        <span className="text-slate-300 text-xs">{msg.timestamp}</span>
                        {msg.isRead && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-white mb-2">{msg.message}</p>
                      {msg.attachments.length > 0 && (
                        <div className="space-y-2">
                          {msg.attachments.map((attachment: any) => (
                            <div key={attachment.id} className={`p-2 bg-slate-600/50 rounded ${attachment.type === 'audio' ? 'space-y-2' : 'flex items-center space-x-2'}`}>
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
              ))}
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
                      input.onchange = (e) => handleFileUpload(e)
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
                      input.onchange = (e) => handleFileUpload(e)
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Informações do Paciente */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">👤 Informações do Paciente</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Nome Completo</p>
                <p className="text-white font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Idade</p>
                <p className="text-white font-medium">{patient.age} anos</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Diagnóstico</p>
                <p className="text-white font-medium">{patient.diagnosis}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {patient.status}
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Última Consulta</p>
                <p className="text-white font-medium">{patient.lastVisit}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Próxima Consulta</p>
                <p className="text-white font-medium">{patient.nextVisit}</p>
              </div>
            </div>
          </div>

          {/* Arquivos Compartilhados */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">📎 Arquivos Compartilhados</h3>
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className={`p-2 rounded ${getFileColor(attachment.type)}`}>
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{attachment.name}</p>
                    <p className="text-slate-400 text-xs">{attachment.size} • {attachment.uploadedAt}</p>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDoctorChat
