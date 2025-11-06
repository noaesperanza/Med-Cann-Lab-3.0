import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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

  // Carregar dados do debate do Supabase
  useEffect(() => {
    loadDebateData()
  }, [debateId, user])

  const loadDebateData = async () => {
    if (!debateId) return

    try {
      // Buscar post do fórum (debate)
      const { data: forumPost, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', debateId)
        .single()

      if (postError) {
        console.error('Erro ao buscar debate:', postError)
        return
      }

      if (forumPost) {
        // Buscar dados do autor
        const { data: authorData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', forumPost.author_id)
          .single()

        const debateData = {
          id: forumPost.id,
          title: forumPost.title,
          author: authorData?.name || 'Autor',
          authorAvatar: authorData?.name?.split(' ').map((n: string) => n[0]).join('') || 'A',
          category: forumPost.category || 'Geral',
          description: forumPost.content,
          tags: forumPost.tags || [],
          isPasswordProtected: forumPost.is_password_protected || false,
          password: forumPost.password || '',
          isActive: forumPost.is_active,
          createdAt: forumPost.created_at,
          maxParticipants: forumPost.max_participants || 50,
          currentParticipants: forumPost.current_participants || 0,
          views: forumPost.views || 0,
          votes: { up: forumPost.votes_up || 0, down: forumPost.votes_down || 0 },
          isPinned: forumPost.is_pinned || false,
          isHot: forumPost.is_hot || false
        }

        setDebate(debateData)
        setIsPasswordProtected(debateData.isPasswordProtected)
        setIsOnline(debateData.isActive)

        // Verificar se usuário é moderador (autor do post)
        setIsModerator(user?.id === forumPost.author_id)

        // Carregar mensagens do chat relacionadas a este debate
        await loadMessages(debateId)

        // Carregar participantes
        await loadParticipants(debateId, forumPost.author_id)
      }
    } catch (error) {
      console.error('Erro ao carregar debate:', error)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const { data: chatMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(id, name, email, type)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Erro ao buscar mensagens:', messagesError)
        return
      }

      if (chatMessages) {
        const formattedMessages = chatMessages.map((msg: any) => {
          const sender = msg.sender || {}
          return {
            id: msg.id,
            user: sender.name || 'Usuário',
            userAvatar: sender.name?.split(' ').map((n: string) => n[0]).join('') || 'U',
            message: msg.message,
            timestamp: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            type: msg.message_type || 'text',
            reactions: { heart: 0, thumbs: 0, reply: 0 }, // Reações podem ser adicionadas depois
            isPinned: false,
            isModerator: false, // Será atualizado quando debate for carregado
            crm: '',
            specialty: sender.type === 'professional' ? 'Médico' : 'Paciente'
          }
        })

        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const loadParticipants = async (chatId: string, authorId?: string) => {
    try {
      // Buscar participantes através das mensagens enviadas
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('chat_id', chatId)

      if (messagesError) {
        console.error('Erro ao buscar participantes:', messagesError)
        return
      }

      const uniqueSenderIds = [...new Set(messages?.map((m: any) => m.sender_id) || [])]

      // Adicionar autor se não estiver na lista
      if (authorId && !uniqueSenderIds.includes(authorId)) {
        uniqueSenderIds.push(authorId)
      }

      if (uniqueSenderIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, type')
          .in('id', uniqueSenderIds)

        if (!usersError && usersData) {
          const participantsList = usersData.map((u: any) => ({
            id: u.id,
            name: u.name || 'Usuário',
            avatar: u.name?.split(' ').map((n: string) => n[0]).join('') || 'U',
            specialty: u.type === 'professional' ? 'Médico' : 'Paciente',
            crm: '',
            isOnline: true, // Pode ser melhorado com sistema de presença
            isModerator: u.id === authorId,
            role: u.id === authorId ? 'Criador' : 'Participante'
          }))

          setParticipants(participantsList)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar participantes:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !debateId || !user) return

    try {
      // Salvar mensagem no Supabase
      const { data: newMessage, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: debateId,
          sender_id: user.id,
          message: message.trim(),
          message_type: 'text'
        })
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(id, name, email, type)
        `)
        .single()

      if (messageError) {
        console.error('Erro ao enviar mensagem:', messageError)
        alert('Erro ao enviar mensagem. Tente novamente.')
        return
      }

      if (newMessage) {
        const sender = newMessage.sender || {}
        const formattedMessage = {
          id: newMessage.id,
          user: sender.name || 'Usuário',
          userAvatar: sender.name?.split(' ').map((n: string) => n[0]).join('') || 'U',
          message: newMessage.message,
          timestamp: new Date(newMessage.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: newMessage.message_type || 'text',
          reactions: { heart: 0, thumbs: 0, reply: 0 },
          isPinned: false,
          isModerator: sender.id === debate?.author_id,
          crm: '',
          specialty: sender.type === 'professional' ? 'Médico' : 'Paciente'
        }

        setMessages([...messages, formattedMessage])
        setMessage('')

        // Atualizar contador de participantes
        if (debate) {
          const { error: updateError } = await supabase
            .from('forum_posts')
            .update({ current_participants: participants.length + 1 })
            .eq('id', debateId)

          if (updateError) {
            console.error('Erro ao atualizar participantes:', updateError)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
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
