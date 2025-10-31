import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Send, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  MoreVertical,
  Smile,
  Paperclip,
  Lock,
  Globe,
  Star,
  Heart,
  Reply,
  Edit,
  Pin,
  Bell,
  Users,
  MessageSquare,
  UserPlus,
  Check,
  X,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  ArrowLeft,
  Shield,
  Key,
  Crown,
  Zap,
  Target,
  BarChart3,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'

const DebateRoom: React.FC = () => {
  const { debateId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [debate, setDebate] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [participants, setParticipants] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isModerator, setIsModerator] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Simular dados do debate
  useEffect(() => {
    const debateData = {
      id: debateId,
      title: 'CBD vs THC: Qual é mais eficaz para dor crônica?',
      author: 'Dr. João Silva',
      authorAvatar: 'JS',
      category: 'Cannabis Medicinal',
      description: 'Discussão sobre a eficácia comparativa entre CBD e THC no tratamento da dor crônica, baseada em evidências clínicas recentes.',
      tags: ['CBD', 'THC', 'Dor Crônica', 'Cannabis'],
      isPasswordProtected: false,
      password: '',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      maxParticipants: 50,
      currentParticipants: 24,
      views: 156,
      votes: { up: 15, down: 3 },
      isPinned: true,
      isHot: true
    }
    setDebate(debateData)
    setIsPasswordProtected(debateData.isPasswordProtected)
    setIsOnline(debateData.isActive)

    // Simular participantes
    const participantsData = [
      { id: 1, name: 'Dr. João Silva', avatar: 'JS', specialty: 'Psiquiatria', crm: '12345-SP', isOnline: true, isModerator: true, role: 'Criador' },
      { id: 2, name: 'Dra. Maria Santos', avatar: 'MS', specialty: 'Neurologia', crm: '67890-RJ', isOnline: true, isModerator: false, role: 'Participante' },
      { id: 3, name: 'Dr. Pedro Costa', avatar: 'PC', specialty: 'Pesquisa', crm: '11111-MG', isOnline: true, isModerator: false, role: 'Participante' },
      { id: 4, name: 'Dra. Ana Oliveira', avatar: 'AO', specialty: 'Cardiologia', crm: '22222-SP', isOnline: false, isModerator: false, role: 'Participante' },
      { id: 5, name: 'Dr. Carlos Lima', avatar: 'CL', specialty: 'Oncologia', crm: '33333-RJ', isOnline: true, isModerator: false, role: 'Participante' }
    ]
    setParticipants(participantsData)

    // Simular mensagens do debate
    const messagesData = [
      {
        id: 1,
        user: 'Dr. João Silva',
        userAvatar: 'JS',
        message: 'Bem-vindos ao debate! Vamos discutir a eficácia comparativa entre CBD e THC para dor crônica.',
        timestamp: '10:00',
        type: 'text',
        reactions: { heart: 8, thumbs: 5, reply: 3 },
        isPinned: true,
        isModerator: true,
        crm: '12345-SP',
        specialty: 'Psiquiatria'
      },
      {
        id: 2,
        user: 'Dra. Maria Santos',
        userAvatar: 'MS',
        message: 'Baseado na minha experiência clínica, o CBD tem mostrado resultados mais consistentes para dor neuropática.',
        timestamp: '10:05',
        type: 'text',
        reactions: { heart: 12, thumbs: 8, reply: 2 },
        isPinned: false,
        isModerator: false,
        crm: '67890-RJ',
        specialty: 'Neurologia'
      },
      {
        id: 3,
        user: 'Dr. Pedro Costa',
        userAvatar: 'PC',
        message: 'Concordo com a Dra. Maria. Estudos recentes mostram que CBD tem menos efeitos colaterais.',
        timestamp: '10:08',
        type: 'text',
        reactions: { heart: 6, thumbs: 4, reply: 1 },
        isPinned: false,
        isModerator: false,
        crm: '11111-MG',
        specialty: 'Pesquisa'
      }
    ]
    setMessages(messagesData)

    // Verificar se usuário é moderador
    setIsModerator(user?.email === 'passosmir4@gmail.com')
  }, [debateId, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: user?.name || 'Usuário',
        userAvatar: user?.name?.split(' ').map(n => n[0]).join('') || 'U',
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        reactions: { heart: 0, thumbs: 0, reply: 0 },
        isPinned: false,
        isModerator: isModerator,
        crm: user?.crm || '',
        specialty: user?.type === 'professional' ? 'Médico' : 'Paciente'
      }
      setMessages([...messages, newMessage])
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleJoinDebate = () => {
    if (isPasswordProtected && password !== debate?.password) {
      alert('Senha incorreta!')
      return
    }
    setShowPasswordModal(false)
    setIsOnline(true)
  }

  const handleLeaveDebate = () => {
    navigate('/chat')
  }

  const startRecording = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
    }, 3000)
  }

  const startVideoCall = () => {
    setIsVideoCall(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Criador': return 'bg-purple-500/20 text-purple-400'
      case 'Moderador': return 'bg-blue-500/20 text-blue-400'
      case 'Participante': return 'bg-slate-500/20 text-slate-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  if (!debate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando debate...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeaveDebate}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
                <span>🏛️ {debate.title}</span>
                {isOnline && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">ONLINE</span>
                  </div>
                )}
              </h1>
              <p className="text-slate-300 mt-1">{debate.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isPasswordProtected && (
              <div className="flex items-center space-x-2 text-slate-400">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Protegido</span>
              </div>
            )}
            <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-purple-400 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {debate.tags.map((tag: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-slate-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{debate.currentParticipants}/{debate.maxParticipants} participantes</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{debate.views} visualizações</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Iniciado há 2 horas</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{debate.votes.up} curtidas</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Participants Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                👥 Participantes ({participants.filter(p => p.isOnline).length})
              </h3>
              <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{participant.avatar}</span>
                      </div>
                      {participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{participant.name}</p>
                      <p className="text-slate-400 text-xs">{participant.specialty} • {participant.crm}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleColor(participant.role)}`}>
                        {participant.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {participant.isModerator && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                    {participant.isOnline ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Debate Controls */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              🎛️ Controles do Debate
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Mic className="w-4 h-4" />
                <span>Falar</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Video className="w-4 h-4" />
                <span>Vídeo</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
              {isModerator && (
                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  <Shield className="w-4 h-4" />
                  <span>Moderar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/80 rounded-lg border border-slate-700 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">💬 Debate Ativo</h3>
                  <p className="text-slate-400 text-sm">
                    {participants.filter(p => p.isOnline).length} participantes online
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
                  <button className="p-2 text-slate-400 hover:text-purple-400 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{msg.userAvatar}</span>
                    </div>
                    {msg.isModerator && (
                      <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium">{msg.user}</span>
                      <span className="text-slate-400 text-sm">{msg.crm}</span>
                      <span className="text-slate-500 text-sm">•</span>
                      <span className="text-slate-400 text-sm">{msg.specialty}</span>
                      <span className="text-slate-500 text-sm">•</span>
                      <span className="text-slate-400 text-sm">{msg.timestamp}</span>
                      {msg.isPinned && (
                        <Pin className="w-4 h-4 text-yellow-400" />
                      )}
                      {msg.isModerator && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          Moderador
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 mb-2">{msg.message}</p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{msg.reactions.heart}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-slate-400 hover:text-blue-400 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{msg.reactions.thumbs}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-slate-400 hover:text-green-400 transition-colors">
                        <Reply className="w-4 h-4" />
                        <span className="text-sm">{msg.reactions.reply}</span>
                      </button>
                      <button className="text-slate-400 hover:text-yellow-400 transition-colors">
                        <Pin className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Participar do debate..."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="p-2 text-slate-400 hover:text-yellow-400 transition-colors">
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
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Debate Protegido</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Este debate é protegido por senha. Digite a senha para participar.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleJoinDebate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DebateRoom
