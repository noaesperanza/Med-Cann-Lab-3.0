import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { UserType } from '../lib/userTypes'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'

// Declaração do tipo para BroadcastChannel
declare global {
  interface Window {
    offlineChannel?: BroadcastChannel
  }
}
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
  Flag
} from 'lucide-react'

type CommunityPanelId = 'news' | 'partnerships' | 'sponsors' | 'supporters'

type CommunityPanelConfig = {
  title: string
  icon: React.ElementType
  iconColor: string
  content: React.ReactNode
}

const COMMUNITY_PANEL_TABS: { id: CommunityPanelId; label: string }[] = [
  { id: 'news', label: 'Notícias' },
  { id: 'partnerships', label: 'Parcerias' },
  { id: 'sponsors', label: 'Patrocinadores' },
  { id: 'supporters', label: 'Apoiadores' }
]

type ChannelPermissionConfig = {
  id: string
  name: string
  type: 'public' | 'private'
  description: string
  members: number
  unread: number
  messageCount?: number // Contagem total de mensagens
  allowedRoles: UserType[]
  postRoles: UserType[]
}

type ChannelWithAccess = ChannelPermissionConfig & {
  canView: boolean
  canPost: boolean
  isReadOnly: boolean
}

type DebateConfig = {
  id: number | string // Pode ser número (hardcoded) ou UUID (banco)
  title: string
  author: string
  authorAvatar: string
  category: string
  participants: number
  views: number
  replies: number
  votes: { up: number; down: number }
  tags: string[]
  lastActivity: string
  isPinned: boolean
  isHot: boolean
  isActive: boolean
  isPasswordProtected: boolean
  description: string
  allowedRoles: UserType[]
  postRoles: UserType[]
}

const BASE_CHANNELS: ChannelPermissionConfig[] = [
  {
    id: 'general',
    name: 'Geral',
    type: 'public',
    members: 0,
    unread: 0,
    description: 'Discussões gerais sobre medicina',
    allowedRoles: ['admin', 'profissional', 'aluno', 'paciente'],
    postRoles: ['admin', 'profissional', 'aluno', 'paciente']
  },
  {
    id: 'cannabis',
    name: 'Cannabis Medicinal',
    type: 'public',
    members: 0,
    unread: 0,
    description: 'Especialistas em cannabis medicinal',
    allowedRoles: ['admin', 'profissional', 'aluno'],
    postRoles: ['admin', 'profissional', 'aluno']
  },
  {
    id: 'clinical',
    name: 'Casos Clínicos',
    type: 'public',
    members: 0,
    unread: 0,
    description: 'Discussão de casos complexos',
    allowedRoles: ['admin', 'profissional', 'aluno'],
    postRoles: ['admin', 'profissional']
  },
  {
    id: 'research',
    name: 'Pesquisa',
    type: 'public',
    members: 0,
    unread: 0,
    description: 'Pesquisas e estudos recentes',
    allowedRoles: ['admin', 'profissional', 'aluno'],
    postRoles: ['admin', 'profissional', 'aluno']
  },
  {
    id: 'support',
    name: 'Suporte',
    type: 'private',
    members: 0,
    unread: 0,
    description: 'Suporte técnico e ajuda',
    allowedRoles: ['admin', 'profissional', 'aluno', 'paciente'],
    postRoles: ['admin', 'profissional', 'paciente']
  }
]

// BASE_DEBATES removido - agora carregado do banco via loadDebates()
// Debates ficam vazios até serem carregados de forum_posts
const BASE_DEBATES: DebateConfig[] = []

const ChatGlobal: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { sendInitialMessage } = useNoaPlatform()
  const [activeTab, setActiveTab] = useState<'chat' | 'forum' | 'friends'>('chat')
  const [activeChannel, setActiveChannel] = useState('general')
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showModeration, setShowModeration] = useState(false)
  const [moderatorRequests, setModeratorRequests] = useState<any[]>([])
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null)
  const [showModeratorRequest, setShowModeratorRequest] = useState(false)
  const [requestReason, setRequestReason] = useState('')
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [preselectedForumTopic, setPreselectedForumTopic] = useState<string | null>(
    'Protocolos Clínicos Integrados - Integração Cannabis & Nefrologia'
  )
  const promptHandledRef = useRef(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [showCommunityColumn, setShowCommunityColumn] = useState(true)
  const [activeCommunityPanel, setActiveCommunityPanel] = useState<CommunityPanelId>('news')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    description: '',
    category: 'Geral',
    tags: [] as string[],
    isPasswordProtected: false,
    password: '',
    allowedRoles: [] as UserType[],
    postRoles: [] as UserType[]
  })
  const [newTag, setNewTag] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)

  const headerGradient = 'linear-gradient(135deg, #0A192F 0%, #1a365d 55%, #2d5a3d 100%)'
  const accentGradient = 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)'
  const secondaryGradient = 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)'
  const bannerGradient = 'linear-gradient(135deg, rgba(0,193,106,0.18) 0%, rgba(16,49,91,0.35) 50%, rgba(7,22,41,0.82) 100%)'
  const bannerSurface: React.CSSProperties = {
    background: 'rgba(7,22,41,0.88)',
    border: '1px solid rgba(0,193,106,0.12)',
    boxShadow: '0 18px 42px rgba(2,12,27,0.45)'
  }

  const [channels, setChannels] = useState<ChannelPermissionConfig[]>(() =>
    BASE_CHANNELS.map(channel => ({ ...channel }))
  )
  const userType: UserType = user?.type ?? 'paciente'

  const gridColumnsClass = useMemo(() => {
    if (showModeration && isAdmin) {
      return 'grid-cols-1 lg:grid-cols-3'
    }
    return showCommunityColumn ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'
  }, [showModeration, isAdmin, showCommunityColumn])

  const communityPanelConfig = useMemo<CommunityPanelConfig>(() => {
    switch (activeCommunityPanel) {
      case 'partnerships':
        return {
          title: '🤝 Parcerias',
          icon: Users,
          iconColor: 'text-green-400',
          content: (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
                <h4 className="text-white font-medium text-sm mb-1">Associação Brasileira de Cannabis Medicinal</h4>
                <p className="text-slate-400 text-xs">Parceria estratégica para desenvolvimento de protocolos clínicos</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
                <h4 className="text-white font-medium text-sm mb-1">Sociedade Brasileira de Neurologia</h4>
                <p className="text-slate-400 text-xs">Colaboração em pesquisas sobre epilepsia e TEA</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-white font-medium text-sm mb-1">Instituto de Pesquisa em Cannabis</h4>
                <p className="text-slate-400 text-xs">Programa conjunto de estudos clínicos</p>
              </div>
            </div>
          )
        }
      case 'sponsors':
        return {
          title: '⭐ Patrocinadores',
          icon: Award,
          iconColor: 'text-yellow-400',
          content: (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                <div className="flex items-center space-x-3 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Patrocinador Platinum</h4>
                    <p className="text-slate-400 text-xs">Apoio ao desenvolvimento da plataforma</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-center space-x-3 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Patrocinador Gold</h4>
                    <p className="text-slate-400 text-xs">Suporte à pesquisa e desenvolvimento</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      case 'supporters':
        return {
          title: '❤️ Apoiadores',
          icon: Heart,
          iconColor: 'text-red-400',
          content: (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg p-4 border border-red-500/30">
                <h4 className="text-white font-medium text-sm mb-1">Fundação de Apoio à Pesquisa</h4>
                <p className="text-slate-400 text-xs">Apoio institucional</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-white font-medium text-sm mb-1">Associação de Pacientes</h4>
                <p className="text-slate-400 text-xs">Comunidade de apoio</p>
              </div>
              <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg p-4 border border-teal-500/30">
                <h4 className="text-white font-medium text-sm mb-1">Instituto de Tecnologia em Saúde</h4>
                <p className="text-slate-400 text-xs">Suporte tecnológico</p>
              </div>
            </div>
          )
        }
      case 'news':
      default:
        return {
          title: '📰 Notícias',
          icon: BookOpen,
          iconColor: 'text-primary-400',
          content: (
            <div className="space-y-3">
              <article className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                <h4 className="text-white font-medium text-sm mb-1">Novo protocolo de Cannabis Medicinal aprovado pela ANVISA</h4>
                <p className="text-slate-400 text-xs mb-1">A ANVISA aprovou um novo protocolo para uso de cannabis medicinal em pacientes com epilepsia refratária...</p>
                <span className="text-slate-500 text-xs">15/01/2025</span>
              </article>
              <article className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                <h4 className="text-white font-medium text-sm mb-1">Pesquisa mostra eficácia do CBD em casos de TEA</h4>
                <p className="text-slate-400 text-xs mb-1">Estudo publicado na Nature Medicine mostra resultados promissores...</p>
                <span className="text-slate-500 text-xs">12/01/2025</span>
              </article>
              <article className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                <h4 className="text-white font-medium text-sm mb-1">Curso de Pós-graduação em Cannabis Medicinal - Novas Turmas</h4>
                <p className="text-slate-400 text-xs mb-1">Inscrições abertas para a próxima turma do curso de especialização...</p>
                <span className="text-slate-500 text-xs">10/01/2025</span>
              </article>
            </div>
          )
        }
    }
  }, [activeCommunityPanel])
  const PanelIcon = communityPanelConfig.icon

  const channelsWithAccess: ChannelWithAccess[] = useMemo(() => {
    return channels.map(channel => {
      const canView = channel.allowedRoles.includes(userType)
      const canPost = canView && channel.postRoles.includes(userType)
      return {
        ...channel,
        canView,
        canPost,
        isReadOnly: canView && !canPost
      }
    })
  }, [channels, userType])

  const accessibleChannels = useMemo(
    () => channelsWithAccess.filter(channel => channel.canView),
    [channelsWithAccess]
  )

  const activeChannelData = useMemo(
    () => channelsWithAccess.find(channel => channel.id === activeChannel),
    [channelsWithAccess, activeChannel]
  )

  useEffect(() => {
    if (!accessibleChannels.length) {
      return
    }
    const isActiveAccessible = accessibleChannels.some(channel => channel.id === activeChannel)
    if (!isActiveAccessible) {
      setActiveChannel(accessibleChannels[0].id)
    }
  }, [accessibleChannels, activeChannel])

  const [debates, setDebates] = useState<DebateConfig[]>([])
  const [loadingDebates, setLoadingDebates] = useState(true)

  // Carregar debates do banco de dados
  useEffect(() => {
    loadDebates()
  }, [userType])

  const loadDebates = async () => {
    try {
      setLoadingDebates(true)

      // Buscar debates do banco
      const { data: forumPosts, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Erro ao carregar debates do banco, usando fallback:', error)
        // Fallback para debates hardcoded
        const filtered = BASE_DEBATES.filter(debate => debate.allowedRoles.includes(userType))
        setDebates(filtered)
        return
      }

      if (forumPosts && forumPosts.length > 0) {
        // Converter posts do banco para formato DebateConfig
        const debatesFromDb = forumPosts
          .filter(post => {
            if (!post.allowed_roles || post.allowed_roles.length === 0) return true
            return post.allowed_roles.includes(userType)
          })
          .map(post => ({
            id: post.id,
            title: post.title,
            author: (post as any).author_name,
            authorAvatar: (post as any).author_avatar || (post as any).author_name?.split(' ').map((n: string) => n[0]).join('') || 'A',
            category: post.category || '',
            participants: (post as any).participants_count || 0,
            views: (post as any).views_count || 0,
            replies: post.replies_count || 0,
            votes: { up: post.votes_up || 0, down: post.votes_down || 0 },
            tags: post.tags || [],
            lastActivity: (post as any).last_activity ? formatTimeAgo(new Date((post as any).last_activity)) : 'Agora',
            isPinned: post.is_pinned || false,
            isHot: post.is_hot || false,
            isActive: post.is_active || false,
            isPasswordProtected: post.is_password_protected || false,
            description: post.description || post.content,
            allowedRoles: post.allowed_roles || [],
            postRoles: post.post_roles || []
          }))

        setDebates(debatesFromDb as any)
      } else {
        // Se não houver posts no banco, usar fallback
        const filtered = BASE_DEBATES.filter(debate => debate.allowedRoles.includes(userType))
        setDebates(filtered)
      }
    } catch (error) {
      console.error('Erro ao carregar debates:', error)
      // Fallback para debates hardcoded
      const filtered = BASE_DEBATES.filter(debate => debate.allowedRoles.includes(userType))
      setDebates(filtered)
    } finally {
      setLoadingDebates(false)
    }
  }

  // Função auxiliar para formatar tempo relativo
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const debatesForUser = useMemo(() => {
    return debates
  }, [debates])

  const filteredDebates = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return debatesForUser
    return debatesForUser.filter(debate =>
      debate.title.toLowerCase().includes(term) ||
      debate.tags.some(tag => tag.toLowerCase().includes(term)) ||
      debate.category.toLowerCase().includes(term)
    )
  }, [debatesForUser, searchTerm])

  // Verificar se é admin
  useEffect(() => {
    if (user?.type === 'admin') {
      setIsAdmin(true)
    }
  }, [user])

  // Carregar dados dos canais - SIMPLIFICADO para evitar erros de coluna
  // Como a coluna 'channel' não existe em chat_messages, desabilitamos essa métrica estatística temporariamente
  // para parar de spammar o console.
  const loadChannelsData = async () => {
    // Implementação futura: buscar room_id para cada canal e contar mensagens
  }

  // Carregar usuários online (CORRIGIDO - Busca em duas etapas segura)
  const loadOnlineUsers = async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

      // 1. Buscar IDs de quem mandou mensagem recentemente
      // CORREÇÃO: Usar 'sender_id' em vez de 'user_id', pois é o nome correto na tabela chat_messages
      const { data: messagesData, error: msgError } = await supabase
        .from('chat_messages')
        .select('sender_id, created_at')
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false })

      if (msgError) throw msgError

      if (!messagesData || messagesData.length === 0) {
        setOnlineUsers([])
        return
      }

      // Extrair IDs únicos usando a coluna correta 'sender_id'
      const activeUserIds = [...new Set(messagesData.map(m => m.sender_id))]

      // 2. Buscar detalhes desses usuários na tabela users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, type')
        .in('id', activeUserIds.filter((id): id is string => id !== null))
        .eq('type', 'profissional') // Filtra apenas profissionais

      if (usersError) throw usersError

      const formattedUsers = (usersData || []).map(u => ({
        id: u.id,
        name: u.name || u.email?.split('@')[0] || 'Profissional',
        avatar: u.name?.substring(0, 1).toUpperCase() || 'P',
        crm: '',
        specialty: 'Medicina Canabinoide',
        status: 'online'
      }))

      // Adicionar usuário atual se estiver ativo (admin, profissional, etc.) e não estiver na lista
      if (user && !formattedUsers.find(u => u.id === user.id)) {
        formattedUsers.unshift({
          id: user.id,
          name: user.name || 'Usuário',
          avatar: user.name?.substring(0, 1).toUpperCase() || 'U',
          crm: '',
          specialty: user.type === 'admin' ? 'Admin' : '',
          status: 'online'
        })
      }

      setOnlineUsers(formattedUsers)
    } catch (error) {
      // Silently fail to offline mode to avoid console noise
      loadOnlineUsersOffline()
    }
  }


  // Carregar mensagens do canal ativo
  useEffect(() => {
    console.log('🔄 useEffect executando - carregando dados do chat - activeChannel:', activeChannel)

    // Tentar carregar do banco primeiro, com fallback para modo offline
    const loadData = async () => {
      try {
        // Tentar carregar do banco (room_id mapeado pelo nome do canal)
        await loadMessages()
        // Se funcionar, configurar realtime do banco
        setupRealtimeSubscription()
        loadChannelsData()
        loadOnlineUsers()
      } catch (error) {
        console.warn('Usando modo offline:', error)
        loadMessagesOffline()
        setupOfflineRealtime()
        loadChannelsDataOffline()
        loadOnlineUsersOffline()
      }
    }

    loadData()
  }, [activeChannel]) // Mantém apenas activeChannel como dependência

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'forum' || tabParam === 'friends' || tabParam === 'chat') {
      setActiveTab(tabParam)
    }

    const topicParam = params.get('topic')
    if (topicParam) {
      setPreselectedForumTopic(topicParam)
    } else {
      setPreselectedForumTopic('Protocolos Clínicos Integrados - Integração Cannabis & Nefrologia')
    }

    const promptParam = params.get('prompt')
    if (promptParam && !promptHandledRef.current) {
      sendInitialMessage?.(promptParam)
      promptHandledRef.current = true
      params.delete('prompt')
      const newSearch = params.toString()
      navigate(
        {
          pathname: location.pathname,
          search: newSearch ? `?${newSearch}` : ''
        },
        { replace: true }
      )
    } else if (!promptParam) {
      promptHandledRef.current = false
    }
  }, [location.pathname, location.search, navigate, sendInitialMessage])

  // Configurar tempo real para mensagens
  const setupRealtimeSubscription = () => {
    // Limpar subscription anterior
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
    }

    // Configurar nova subscription
    const subscription = supabase
      .channel(`chat_messages_${activeChannel}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel=eq.${activeChannel}`
      }, (payload) => {
        console.log('📨 Nova mensagem recebida:', payload.new)
        // Adicionar nova mensagem à lista
        setMessages(prev => [...prev, payload.new])
        // Scroll para baixo
        scrollToBottom()
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel=eq.${activeChannel}`
      }, (payload) => {
        console.log('🗑️ Mensagem removida:', payload.old)
        // Remover mensagem da lista
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
      })
      .subscribe()

    setRealtimeSubscription(subscription)
  }

  // Carregar usuários online
  useEffect(() => {
    console.log('🔄 Carregando usuários online - executando uma vez')
    loadOnlineUsers()
  }, []) // Array vazio garante que executa apenas uma vez

  // Carregar solicitações de moderador (apenas para admins)
  useEffect(() => {
    if (isAdmin) {
      loadModeratorRequests()
    }
  }, [isAdmin])

  // Limpeza da subscription ao desmontar
  useEffect(() => {
    return () => {
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription)
      }
    }
  }, [realtimeSubscription])

  // Limpeza automática de mensagens antigas (24 horas)
  useEffect(() => {
    const cleanupOldMessages = async () => {
      try {
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

        // Deletar mensagens antigas
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .lt('created_at', twentyFourHoursAgo.toISOString())

        if (error) {
          console.error('Erro ao limpar mensagens antigas:', error)
        } else {
          console.log('🧹 Mensagens antigas removidas automaticamente')
        }
      } catch (error) {
        console.error('Erro na limpeza automática:', error)
      }
    }

    // Executar limpeza a cada hora
    const cleanupInterval = setInterval(cleanupOldMessages, 60 * 60 * 1000)

    // Executar limpeza imediatamente
    cleanupOldMessages()

    return () => clearInterval(cleanupInterval)
  }, [])

  const loadMessages = async () => {
    try {
      // Buscar ou criar uma room para o canal ativo
      const channelName = activeChannel || 'general'

      // Primeiro, tentar encontrar uma room existente com este nome
      let { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('name', `Chat: ${channelName}`)
        .maybeSingle()

      // Se não existe, criar a room
      if (!existingRoom && user) {
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            name: `Chat: ${channelName}`,
            type: 'professional',
            created_by: user.id
          })
          .select('id')
          .single()

        if (!createError && newRoom) {
          existingRoom = newRoom
        }
      }

      if (!existingRoom) {
        console.warn('Não foi possível obter room, usando modo offline')
        loadMessagesOffline()
        return
      }

      // Carregar mensagens da room das últimas 24 horas
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', existingRoom.id)
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) {
        console.error('Erro ao carregar mensagens:', error)
        loadMessagesOffline()
        return
      }

      setMessages(data || [])
      scrollToBottom()
    } catch (error) {
      console.error('Erro ao carregar mensagens (fallback offline):', error)
      loadMessagesOffline()
    }
  }

  // Chat offline - carregar mensagens do localStorage
  const loadMessagesOffline = () => {
    console.log('🔄 Carregando mensagens offline do canal:', activeChannel)
    try {
      const storedMessages = localStorage.getItem(`chat_messages_${activeChannel}`)
      const messages = storedMessages ? JSON.parse(storedMessages) : []

      console.log('📨 Mensagens offline encontradas:', messages.length)
      console.log('📨 Dados das mensagens:', messages)

      setMessages(messages)
      scrollToBottom()
    } catch (error) {
      console.error('Erro ao carregar mensagens offline:', error)
      setMessages([])
    }
  }

  // Chat offline - salvar mensagem no localStorage
  const saveMessageOffline = (message: any) => {
    try {
      const storedMessages = localStorage.getItem(`chat_messages_${activeChannel}`)
      const messages = storedMessages ? JSON.parse(storedMessages) : []

      const newMessage = {
        ...message,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }

      messages.push(newMessage)
      localStorage.setItem(`chat_messages_${activeChannel}`, JSON.stringify(messages))

      console.log('💾 Mensagem salva offline:', newMessage)
      return newMessage
    } catch (error) {
      console.error('Erro ao salvar mensagem offline:', error)
      return null
    }
  }

  // Chat offline - tempo real com BroadcastChannel
  const setupOfflineRealtime = () => {
    console.log('🔄 Configurando tempo real offline')

    // Evitar re-criação se já existe
    if (window.offlineChannel) {
      return
    }

    // Criar novo canal
    window.offlineChannel = new BroadcastChannel('medcannlab-chat')

    window.offlineChannel.onmessage = (event) => {
      if (event.data.type === 'new_message' && event.data.channel === activeChannel) {
        console.log('📨 Nova mensagem recebida via BroadcastChannel:', event.data.message)
        setMessages(prev => [...prev, event.data.message])
        scrollToBottom()
      }
    }
  }

  // Chat offline - carregar dados dos canais
  const loadChannelsDataOffline = () => {
    console.log('🔄 Carregando dados dos canais offline')
    try {
      const channelsData = channels.map(channel => {
        const storedMessages = localStorage.getItem(`chat_messages_${channel.id}`)
        const messages = storedMessages ? JSON.parse(storedMessages) : []

        return {
          ...channel,
          members: messages.length > 0 ? new Set(messages.map((m: any) => m.user_id)).size : 0,
          unread: 0, // Simplificado para offline
          messageCount: messages.length || 0 // Contagem de mensagens offline
        }
      })

      setChannels(channelsData)
    } catch (error) {
      console.error('Erro ao carregar dados dos canais offline:', error)
    }
  }

  // Chat offline - carregar usuários online
  const loadOnlineUsersOffline = () => {
    console.log('🔄 Carregando usuários online offline')
    try {
      const onlineUsers = [
        {
          id: user?.id || 'current-user',
          name: user?.name || 'Usuário Atual',
          avatar: 'U',
          crm: user?.crm || '',
          specialty: '',
          status: 'online'
        }
      ]

      setOnlineUsers(onlineUsers)
    } catch (error) {
      console.error('Erro ao carregar usuários online offline:', error)
    }
  }

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  }, [])


  const loadModeratorRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('moderator_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar solicitações:', error)
        return
      }

      setModeratorRequests(data || [])
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !user || isSending) return

    if (!activeChannelData?.canPost) {
      alert('Seu perfil possui acesso somente leitura neste canal. Solicite mediação de um profissional para participar.')
      return
    }

    setIsSending(true)
    const messageContent = message.trim()
    setMessage('') // Limpar campo imediatamente para melhor UX

    try {
      // Buscar ou criar a room do canal ativo
      const channelName = activeChannel || 'general'
      let roomId: string | null = null

      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('name', `Chat: ${channelName}`)
        .maybeSingle()

      if (existingRoom) {
        roomId = existingRoom.id
      } else {
        const { data: newRoom } = await supabase
          .from('chat_rooms')
          .insert({ name: `Chat: ${channelName}`, type: 'professional', created_by: user.id })
          .select('id')
          .single()
        if (newRoom) roomId = newRoom.id
      }

      // Mensagem offline para fallback
      const offlineData = {
        user_id: user.id,
        user_name: user.name || 'Usuário',
        user_avatar: user.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U',
        message: messageContent,
        channel: activeChannel,
        crm: user.crm || '',
        specialty: '',
        type: 'text',
        reactions: { heart: 0, thumbs: 0, reply: 0 },
        is_pinned: false,
        is_online: true
      }

      if (roomId) {
        try {
          // Salvar no banco com as colunas corretas da tabela chat_messages
          const { data, error } = await supabase
            .from('chat_messages')
            .insert([{
              room_id: roomId,
              sender_id: user.id,
              message: messageContent,
              message_type: 'text'
            }])
            .select()
            .single()

          if (error) throw error

          if (data) {
            console.log('✅ Mensagem salva no banco!')
            // Enriquecer o objeto para exibição local
            const enriched = { ...data, user_name: user.name, user_avatar: offlineData.user_avatar }
            setMessages(prev => [...prev, enriched])
            await loadOnlineUsers()
            scrollToBottom()
            return
          }
        } catch (dbError) {
          console.warn('Erro ao salvar no banco, usando modo offline:', dbError)
        }
      }

      // Fallback: salvar offline
      const savedMessage = saveMessageOffline(offlineData)

      if (savedMessage) {
        console.log('✅ Mensagem salva offline!')
        // Adicionar mensagem à lista atual
        setMessages(prev => [...prev, savedMessage])

        // Enviar via BroadcastChannel para outras abas
        if (window.offlineChannel) {
          window.offlineChannel.postMessage({
            type: 'new_message',
            channel: activeChannel,
            message: savedMessage
          })
        }

        // Atualizar dados dos canais
        loadChannelsDataOffline()
        loadOnlineUsersOffline()

        scrollToBottom()
      } else {
        console.error('❌ Erro ao salvar mensagem offline')
        setMessage(messageContent) // Restaurar mensagem se falhou
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMessage(messageContent) // Restaurar mensagem se falhou
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAddFriend = (userId: number) => {
    console.log('Adicionando amigo:', userId)
  }

  const handleAcceptFriend = (requestId: number) => {
    console.log('Aceitando solicitação:', requestId)
  }

  const handleRejectFriend = (requestId: number) => {
    console.log('Rejeitando solicitação:', requestId)
  }

  // Funções de moderação para admins
  const handleDeleteMessage = async (messageId: number) => {
    if (!isAdmin) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        console.error('Erro ao deletar mensagem:', error)
        return
      }

      loadMessages()
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error)
    }
  }

  const handlePinMessage = async (messageId: number) => {
    if (!isAdmin) return

    try {
      const { error } = await (supabase as any)
        .from('chat_messages')
        .update({ is_pinned: true })
        .eq('id', messageId)

      if (error) {
        console.error('Erro ao fixar mensagem:', error)
        return
      }

      loadMessages()
    } catch (error) {
      console.error('Erro ao fixar mensagem:', error)
    }
  }

  const handleMuteUser = async (userId: string) => {
    if (!isAdmin) return

    try {
      const { error } = await supabase
        .from('user_mutes')
        .insert({
          muted_user_id: userId,
          muted_by: user?.id,
          reason: 'Comportamento inadequado',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })

      if (error) {
        console.error('Erro ao silenciar usuário:', error)
        return
      }

      console.log('Usuário silenciado por 24 horas')
    } catch (error) {
      console.error('Erro ao silenciar usuário:', error)
    }
  }

  // Função para solicitar moderador
  const handleRequestModerator = async () => {
    if (!user || !requestReason.trim()) return

    try {
      const { error } = await supabase
        .from('moderator_requests')
        .insert({
          requester_id: user.id,
          requester_name: user.name || 'Usuário',
          channel: activeChannel,
          reason: requestReason.trim(),
          status: 'pending',
          priority: 'normal'
        })

      if (error) {
        console.error('Erro ao solicitar moderador:', error)
        return
      }

      setRequestReason('')
      setShowModeratorRequest(false)
      alert('Solicitação enviada! Um moderador será notificado.')
    } catch (error) {
      console.error('Erro ao solicitar moderador:', error)
    }
  }

  // Função para responder à solicitação (apenas admins)
  const handleRespondToRequest = async (requestId: number, action: 'accept' | 'decline') => {
    if (!isAdmin) return

    try {
      const { error } = await supabase
        .from('moderator_requests')
        .update({
          status: action === 'accept' ? 'accepted' : 'declined',
          responded_by: user?.id,
          responded_at: new Date().toISOString()
        })
        .eq('id', String(requestId))

      if (error) {
        console.error('Erro ao responder solicitação:', error)
        return
      }

      loadModeratorRequests()
    } catch (error) {
      console.error('Erro ao responder solicitação:', error)
    }
  }

  const handleOpenDebate = (debateId: number | string) => {
    // Se for UUID (string), usar diretamente; se for número (hardcoded), converter
    const id = typeof debateId === 'string' ? debateId : debateId.toString()
    navigate(`/app/debate/${id}`)
  }

  const handleCreatePost = async () => {
    if (!user?.id || !newPost.title.trim() || !newPost.content.trim()) {
      alert('Por favor, preencha título e conteúdo da discussão.')
      return
    }

    try {
      setIsCreatingPost(true)

      // Gerar slug do título
      const slug = newPost.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      // Definir permissões padrão baseado no tipo de usuário
      const defaultAllowedRoles: UserType[] = userType === 'admin'
        ? ['admin', 'profissional', 'aluno']
        : userType === 'profissional'
          ? ['admin', 'profissional', 'aluno']
          : ['admin', 'profissional']

      const defaultPostRoles: UserType[] = userType === 'admin'
        ? ['admin', 'profissional']
        : ['admin', 'profissional']

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          description: newPost.description || newPost.content.substring(0, 200),
          author_id: user.id,
          author_name: user.name || 'Usuário',
          author_avatar: user.name?.split(' ').map(n => n[0]).join('') || 'U',
          category: newPost.category,
          tags: newPost.tags,
          is_password_protected: newPost.isPasswordProtected,
          password_hash: newPost.isPasswordProtected && newPost.password ? newPost.password : null,
          allowed_roles: newPost.allowedRoles.length > 0 ? newPost.allowedRoles : defaultAllowedRoles,
          post_roles: newPost.postRoles.length > 0 ? newPost.postRoles : defaultPostRoles,
          slug: slug
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar postagem:', error)
        alert('Erro ao criar discussão. Tente novamente.')
        return
      }

      // Limpar formulário e fechar modal
      setNewPost({
        title: '',
        content: '',
        description: '',
        category: 'Geral',
        tags: [],
        isPasswordProtected: false,
        password: '',
        allowedRoles: [],
        postRoles: []
      })
      setNewTag('')
      setShowNewPostModal(false)

      // Recarregar debates
      await loadDebates()

      alert('Discussão criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar postagem:', error)
      alert('Erro ao criar discussão. Tente novamente.')
    } finally {
      setIsCreatingPost(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !newPost.tags.includes(newTag.trim())) {
      setNewPost(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setNewPost(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
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

  const getVoteColor = (votes: { up: number, down: number }) => {
    const total = votes.up + votes.down
    if (total === 0) return 'text-slate-400'
    const ratio = votes.up / total
    if (ratio > 0.7) return 'text-green-400'
    if (ratio > 0.4) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-3 md:space-y-4 px-2 md:px-4">
      {/* Uma única barra: título + abas + ações admin */}
      <div className="rounded-lg px-3 py-2 md:px-4 md:py-2.5 overflow-hidden flex flex-wrap items-center gap-2 md:gap-4" style={{ background: headerGradient, border: '1px solid rgba(0,193,106,0.18)' }}>
        <h1 className="text-base md:text-lg font-bold text-white shrink-0">Fórum Cann Matrix</h1>
        <nav className="flex items-center gap-1 p-1 rounded-lg flex-1 min-w-0" style={{ background: 'rgba(7,22,41,0.6)', border: '1px solid rgba(0,193,106,0.1)' }}>
          <button
            onClick={() => setActiveTab('chat')}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 md:px-3 rounded-md text-sm font-medium transition-colors"
            style={activeTab === 'chat' ? { background: accentGradient, color: '#fff' } : { color: '#C8D6E5' }}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 md:px-3 rounded-md text-sm font-medium transition-colors"
            style={activeTab === 'forum' ? { background: accentGradient, color: '#fff' } : { color: '#C8D6E5' }}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Fórum</span>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 px-2 md:px-3 rounded-md text-sm font-medium transition-colors relative"
            style={activeTab === 'friends' ? { background: accentGradient, color: '#fff' } : { color: '#C8D6E5' }}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline truncate">Amigos</span>
            {friendRequests.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] px-1 rounded-full min-w-[14px] text-center">
                {friendRequests.length}
              </span>
            )}
          </button>
        </nav>
        {isAdmin && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowModeration(!showModeration)}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors ${showModeration ? 'bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              title={showModeration ? 'Ocultar Moderação' : 'Painel de Moderação'}
            >
              <Flag className="w-3 h-3" />
              <span className="hidden lg:inline">{showModeration ? 'Ocultar' : 'Moderação'}</span>
            </button>
            <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md flex items-center gap-1 text-xs">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Admin</span>
            </div>
            {moderatorRequests.length > 0 && (
              <div className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                <Flag className="w-3 h-3" />
                <span>{moderatorRequests.length}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-white/70 text-xs px-1 -mt-1">
        Comunidade para debates sobre cannabis medicinal, protocolos clínicos e pesquisa aplicada.
      </p>

      {/* Banner de Orientações — compacto */}
      <div
        className="rounded-lg px-3 py-2 mb-3 overflow-hidden"
        style={{ background: bannerGradient, border: '1px solid rgba(0,193,106,0.16)' }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2" style={bannerSurface}>
          <span className="text-sm font-medium text-white">Participação responsável:</span>
          <span className="text-xs text-slate-200/85">
            Objetivo, evidências e canal certo.
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-slate-200/90 bg-slate-900/50 border border-slate-700/50">
            <Check className="w-2.5 h-2.5 text-[#00F5A0]" /> Etiqueta clínica
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-slate-200/90 bg-slate-900/50 border border-slate-700/50">
            <Check className="w-2.5 h-2.5 text-[#00F5A0]" /> Evidências primeiro
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-slate-200/90 bg-slate-900/50 border border-slate-700/50">
            <Check className="w-2.5 h-2.5 text-[#00F5A0]" /> Respeito às permissões
          </span>
          <div className="flex gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => setShowGuidelines(prev => !prev)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors border border-slate-700/60 ${showGuidelines ? 'bg-slate-800/80 text-white' : 'bg-slate-900/40 text-slate-200 hover:text-white'}`}
              aria-expanded={showGuidelines}
            >
              {showGuidelines ? 'Ocultar' : 'Orientações'}
            </button>
            <button
              type="button"
              onClick={() => setShowCommunityColumn(prev => !prev)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors border border-slate-700/60 ${showCommunityColumn ? 'bg-slate-900/40 text-slate-200 hover:text-white' : 'bg-primary-600 text-white'}`}
              aria-pressed={showCommunityColumn}
            >
              {showCommunityColumn ? 'Ocultar painel' : 'Painel lateral'}
            </button>
          </div>
        </div>

          {showGuidelines && (
            <div className="grid gap-4 md:grid-cols-2 mt-3 pt-3 border-t border-slate-700/50">
              <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00F5A0]" />
                  Como participar
                </h4>
                <ul className="space-y-2 text-sm text-slate-200/85">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[#00F5A0]" />
                    <span>Escolha o canal que melhor corresponde ao tema antes de iniciar um debate.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[#00F5A0]" />
                    <span>Compartilhe referências, casos documentados e experiências clínicas verificáveis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[#00F5A0]" />
                    <span>Use linguagem colaborativa e reporte desvios do código de conduta aos moderadores.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[#00F5A0]" />
                    <span>Mencione especialistas quando precisar de revisão ou validação clínica.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FFD33D]" />
                  Limitações por perfil
                </h4>
                <div className="space-y-2 text-sm text-slate-200/85">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-0.5 text-[#4FE0C1]" />
                    <p><strong className="text-white">Profissional:</strong> acesso completo; pode iniciar debates clínicos e mentorias.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 mt-0.5 text-[#FFD33D]" />
                    <p><strong className="text-white">Admin:</strong> curadoria da comunidade, permissões avançadas e métricas.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 mt-0.5 text-[#86E3CE]" />
                    <p><strong className="text-white">Aluno:</strong> interações mediadas por docentes em debates clínicos avançados.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 mt-0.5 text-[#FF8E72]" />
                    <p><strong className="text-white">Paciente:</strong> participação orientada em canais de suporte com mediação profissional.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className={`grid gap-4 md:gap-6 lg:gap-10 ${gridColumnsClass}`}>
          {/* Sidebar - Channels */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-slate-800/80 rounded-lg p-3 md:p-4 lg:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-white">
                  📋 Canais
                </h3>
                <button className="p-2 text-slate-400 hover:text-primary-400 transition-colors">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {channelsWithAccess.map((channel) => {
                  const isActive = activeChannel === channel.id
                  const baseClasses = isActive && channel.canView
                    ? 'bg-primary-600 text-white'
                    : channel.canView
                      ? 'hover:bg-slate-700/50 text-slate-300'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'

                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        if (!channel.canView) {
                          alert('Seu perfil não possui acesso direto a este canal. Procure o canal recomendado para o seu tipo de usuário.')
                          return
                        }
                        setActiveChannel(channel.id)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${baseClasses}`}
                      disabled={!channel.canView}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${channel.canView ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                        <div className="text-left">
                          <p className="font-medium">{channel.name}</p>
                          <p className="text-xs opacity-75">{channel.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {channel.isReadOnly && channel.canView && (
                          <span className="text-[10px] uppercase tracking-wide bg-slate-600/70 text-slate-200 px-2 py-0.5 rounded-full">
                            Somente leitura
                          </span>
                        )}
                        {!channel.canView && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                        <span className="text-xs bg-slate-600 px-2 py-1 rounded" title={`${channel.messageCount || 0} mensagens, ${channel.members || 0} membros`}>
                          {(channel as any).messageCount !== undefined ? (channel as any).messageCount : channel.members || 0}
                        </span>
                        {channel.unread > 0 && channel.canView && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {channel.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Online Users */}
            <div className="bg-slate-800/80 rounded-lg p-3 md:p-4 lg:p-6 border border-slate-700 mt-4 md:mt-6">
              <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">
                👥 Online ({onlineUsers.filter(u => u.status === 'online').length})
              </h3>
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{user.avatar}</span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-slate-800`}></div>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-slate-400 text-xs">{user.specialty} • {user.crm}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!user.isFriend && (
                        <button
                          onClick={() => handleAddFriend(user.id)}
                          className="p-1 text-primary-400 hover:text-primary-300 hover:bg-primary-500/20 rounded transition-colors"
                          title="Adicionar amigo"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors" title="Iniciar conversa">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${showModeration && isAdmin ? 'lg:col-span-2' : 'lg:col-span-2'} order-1 lg:order-2`}>
            <div className="bg-slate-800/80 rounded-lg border border-slate-700 h-[400px] md:h-[500px] lg:h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-slate-700 bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-white truncate">
                      {activeChannelData?.name || 'Canal indisponível'}
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm">
                      {activeChannelData?.members || 0} membros
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                    {!isAdmin && (
                      <button
                        onClick={() => setShowModeratorRequest(true)}
                        className="p-1.5 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                        title="Solicitar Moderador"
                      >
                        <Flag className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                    <button className="p-1.5 md:p-2 text-slate-400 hover:text-primary-400 transition-colors hidden md:block">
                      <Video className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-1.5 md:p-2 text-slate-400 hover:text-green-400 transition-colors hidden md:block">
                      <Phone className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-1.5 md:p-2 text-slate-400 hover:text-purple-400 transition-colors">
                      <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4"
              >
                {/* Indicador de tempo real */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Chat em tempo real ativo</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    💬 Conversas expiram em 24 horas para manter o chat limpo e focado
                  </p>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className="flex space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{msg.user_avatar}</span>
                      </div>
                      {msg.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium">{msg.user_name}</span>
                        <span className="text-slate-400 text-sm">{msg.crm}</span>
                        <span className="text-slate-500 text-sm">•</span>
                        <span className="text-slate-400 text-sm">{msg.specialty}</span>
                        <span className="text-slate-500 text-sm">•</span>
                        <span className="text-slate-400 text-sm">{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-slate-200 mb-2">{msg.content}</p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{msg.reactions?.heart || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-slate-400 hover:text-primary-400 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{msg.reactions?.thumbs || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-slate-400 hover:text-green-400 transition-colors">
                          <Reply className="w-4 h-4" />
                          <span className="text-sm">{msg.reactions?.reply || 0}</span>
                        </button>
                        <button className="text-slate-400 hover:text-primary-400 transition-colors">
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-2 md:p-4 border-t border-slate-700">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <button className="p-1.5 md:p-2 text-slate-400 hover:text-primary-400 transition-colors hidden sm:block">
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="w-full px-2 md:px-4 py-2 md:py-3 text-sm md:text-base bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={!activeChannelData?.canPost}
                    />
                  </div>
                  <button className="p-1.5 md:p-2 text-slate-400 hover:text-yellow-400 transition-colors hidden sm:block">
                    <Smile className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={isRecording ? () => setIsRecording(false) : startRecording}
                    className={`p-1.5 md:p-2 transition-colors ${isRecording
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-slate-400 hover:text-red-400'
                      }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !activeChannelData?.canPost}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-2 md:px-4 py-2 md:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                {activeChannelData?.isReadOnly && (
                  <p className="mt-2 text-[11px] md:text-xs text-slate-400">
                    Este canal é moderado. Perfis <strong>{userType}</strong> participam em modo leitura; envolva um profissional para abrir novas interações.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Painel lateral modular */}
          {!showModeration && showCommunityColumn && (
            <div className="lg:col-span-1 order-3 hidden lg:block">
              <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PanelIcon className={`w-5 h-5 ${communityPanelConfig.iconColor}`} />
                    <h3 className="text-lg font-semibold text-white">{communityPanelConfig.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCommunityColumn(false)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {COMMUNITY_PANEL_TABS.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCommunityPanel(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-700/60 ${activeCommunityPanel === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-900/40 text-slate-300 hover:text-white'
                        }`}
                      aria-pressed={activeCommunityPanel === tab.id}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {communityPanelConfig.content}
                </div>
              </div>
            </div>
          )}

          {/* Painel de Moderação Integrado (apenas para admins e Eduardo Faveret) */}
          {showModeration && (isAdmin || user?.email?.includes('faveret')) && (
            <div className="lg:col-span-1">
              <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 h-[600px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">🛡️ Moderação</h3>

                {/* Solicitações Pendentes */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">
                    📨 Solicitações ({moderatorRequests.length})
                  </h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {moderatorRequests.map((request) => (
                      <div key={request.id} className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{request.requester_name}</div>
                            <div className="text-slate-400 text-xs mb-2">{request.reason}</div>
                            <div className="text-slate-500 text-xs">{request.channel}</div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleRespondToRequest(request.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(request.id, 'decline')}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                            >
                              ✗
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {moderatorRequests.length === 0 && (
                      <p className="text-slate-400 text-xs text-center py-2">Nenhuma solicitação</p>
                    )}
                  </div>
                </div>

                {/* Estatísticas Rápidas */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">📊 Estatísticas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Usuários Online</span>
                      <span className="text-green-400 font-bold">{onlineUsers.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Mensagens Hoje</span>
                      <span className="text-primary-400 font-bold">{messages.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Canal Ativo</span>
                      <span className="text-purple-400 font-bold">{activeChannel}</span>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">⚡ Ações Rápidas</h4>
                  <div className="space-y-2">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded text-xs">
                      📊 Ver Analytics
                    </button>
                    <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-xs">
                      🚨 Reportes
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-xs">
                      👥 Usuários
                    </button>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs">
                      📈 Estatísticas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Forum Tab */}
      {activeTab === 'forum' && (
        <div className="space-y-8">
          {/* Forum Header */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">🏛️ Fórum Profissional</h2>
              <p className="text-slate-300">
                Espaço colaborativo para acompanhar o desenvolvimento do protocolo integrado Med Cann Lab.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar debates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={() => setShowNewPostModal(true)}
                className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Discussão</span>
              </button>
              <button className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:bg-slate-600 transition-colors flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </button>
            </div>
          </div>

          {preselectedForumTopic && (
            <div className="bg-slate-800/80 border border-blue-500/30 rounded-lg p-5 space-y-3">
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-[0.32em]">Tema central</p>
                <h3
                  onClick={() => {
                    setSearchTerm(preselectedForumTopic)
                    // Scroll para as discussões
                    setTimeout(() => {
                      const debatesSection = document.querySelector('.lg\\:col-span-2')
                      if (debatesSection) {
                        debatesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  }}
                  className="text-lg font-semibold text-white cursor-pointer hover:text-blue-300 transition-colors"
                  title="Clique para ver as discussões deste tema"
                >
                  {preselectedForumTopic}
                </h3>
                <p className="text-sm text-slate-300 mt-2">
                  Estamos estruturando o protocolo clínico integrado do Med Cann Lab para unir cannabis medicinal e nefrologia.
                  Compartilhe dados clínicos, experiências assistidas por IA e sugestões metodológicas para fortalecer o documento.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSearchTerm(preselectedForumTopic)
                    // Scroll para as discussões
                    setTimeout(() => {
                      const debatesSection = document.querySelector('.lg\\:col-span-2')
                      if (debatesSection) {
                        debatesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Buscar discussões relacionadas
                </button>
                <button
                  onClick={() => navigate('/app/pesquisa/profissional/forum-casos')}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-100 border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  Ver Fórum de Casos Clínicos
                </button>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    // Recarregar discussões
                    window.location.reload()
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-100 border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  Atualizar quadro do fórum
                </button>
              </div>
            </div>
          )}

          {/* Grid Layout: Debates + Coluna de Notícias */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Debates List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredDebates.length > 0 ? (
                filteredDebates.map((debate) => {
                  const canPostInDebate = debate.postRoles.includes(userType)
                  return (
                    <div key={debate.id} className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 hover:bg-slate-800/90 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleOpenDebate(debate.id)}
                          title="Clique para ver as discussões deste debate"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white hover:text-blue-300 transition-colors">{debate.title}</h3>
                            {debate.isPinned && <Pin className="w-5 h-5 text-yellow-400" />}
                            {debate.isHot && <TrendingUp className="w-5 h-5 text-red-400" />}
                            {debate.isActive && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-sm font-medium">ONLINE</span>
                              </div>
                            )}
                            {debate.isPasswordProtected && (
                              <div className="flex items-center space-x-1">
                                <Lock className="w-4 h-4 text-primary-400" />
                                <span className="text-primary-400 text-sm">Protegido</span>
                              </div>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm mb-3 hover:text-slate-200 transition-colors">{debate.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {debate.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <div className="flex items-center space-x-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{debate.authorAvatar}</span>
                              </div>
                              <span>{debate.author}</span>
                            </div>
                            <span>•</span>
                            <span>{debate.category}</span>
                            <span>•</span>
                            <span>{debate.participants} participantes</span>
                            <span>•</span>
                            <span>{debate.views} visualizações</span>
                            <span>•</span>
                            <span>{debate.lastActivity}</span>
                            {!canPostInDebate && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500 italic">Somente leitura para o seu perfil</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className={`flex items-center space-x-1 ${getVoteColor(debate.votes)}`}>
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm font-medium">{debate.votes.up}</span>
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-sm font-medium">{debate.votes.down}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenDebate(debate.id)}
                              disabled={!canPostInDebate}
                              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${canPostInDebate
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-slate-700 text-slate-300 cursor-not-allowed'
                                }`}
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>{canPostInDebate ? 'Participar' : 'Somente leitura'}</span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-primary-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-green-400 transition-colors">
                              <Reply className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-purple-400 transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                              <Flag className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 text-slate-300 text-sm">
                  {debatesForUser.length === 0
                    ? 'O seu perfil participa do fórum por meio de canais mediados. Converse com a coordenação para ser convidado a debates especializados.'
                    : 'Nenhum debate encontrado para a sua busca. Ajuste os filtros ou tente outra palavra-chave.'}
                </div>
              )}
            </div>

            {/* Coluna de Notícias, Parcerias, Patrocinadores e Apoiadores */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Notícias */}
                <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary-400" />
                    📰 Notícias
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors cursor-pointer">
                      <h4 className="text-white font-medium text-sm mb-2">Novo protocolo de Cannabis Medicinal aprovado pela ANVISA</h4>
                      <p className="text-slate-400 text-xs mb-2">A ANVISA aprovou um novo protocolo para uso de cannabis medicinal em pacientes com epilepsia refratária...</p>
                      <span className="text-slate-500 text-xs">15/01/2025</span>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors cursor-pointer">
                      <h4 className="text-white font-medium text-sm mb-2">Pesquisa mostra eficácia do CBD em casos de TEA</h4>
                      <p className="text-slate-400 text-xs mb-2">Estudo publicado na Nature Medicine mostra resultados promissores...</p>
                      <span className="text-slate-500 text-xs">12/01/2025</span>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors cursor-pointer">
                      <h4 className="text-white font-medium text-sm mb-2">Curso de Pós-graduação em Cannabis Medicinal - Novas Turmas</h4>
                      <p className="text-slate-400 text-xs mb-2">Inscrições abertas para a próxima turma do curso de especialização...</p>
                      <span className="text-slate-500 text-xs">10/01/2025</span>
                    </div>
                  </div>
                </div>

                {/* Parcerias */}
                <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-400" />
                    🤝 Parcerias
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
                      <h4 className="text-white font-medium text-sm mb-2">Associação Brasileira de Cannabis Medicinal</h4>
                      <p className="text-slate-400 text-xs">Parceria estratégica para desenvolvimento de protocolos clínicos</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
                      <h4 className="text-white font-medium text-sm mb-2">Sociedade Brasileira de Neurologia</h4>
                      <p className="text-slate-400 text-xs">Colaboração em pesquisas sobre epilepsia e TEA</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-white font-medium text-sm mb-2">Instituto de Pesquisa em Cannabis</h4>
                      <p className="text-slate-400 text-xs">Programa conjunto de estudos clínicos</p>
                    </div>
                  </div>
                </div>

                {/* Patrocinadores */}
                <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-400" />
                    ⭐ Patrocinadores
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">P1</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">Patrocinador Platinum</h4>
                          <p className="text-slate-400 text-xs">Apoio ao desenvolvimento da plataforma</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg p-4 border border-blue-500/30">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">P2</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">Patrocinador Gold</h4>
                          <p className="text-slate-400 text-xs">Suporte à pesquisa e desenvolvimento</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apoiadores */}
                <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-400" />
                    ❤️ Apoiadores
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg p-4 border border-red-500/30">
                      <h4 className="text-white font-medium text-sm mb-1">Fundação de Apoio à Pesquisa</h4>
                      <p className="text-slate-400 text-xs">Apoio institucional</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-white font-medium text-sm mb-1">Associação de Pacientes</h4>
                      <p className="text-slate-400 text-xs">Comunidade de apoio</p>
                    </div>
                    <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg p-4 border border-teal-500/30">
                      <h4 className="text-white font-medium text-sm mb-1">Instituto de Tecnologia em Saúde</h4>
                      <p className="text-slate-400 text-xs">Suporte tecnológico</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Discussão */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Nova Discussão</h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Título da Discussão *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: CBD vs THC: Qual é mais eficaz para dor crônica?"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição da discussão..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Conteúdo da Discussão *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Descreva detalhadamente o tema da discussão..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Categoria
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Geral">Geral</option>
                  <option value="Cannabis Medicinal">Cannabis Medicinal</option>
                  <option value="Protocolos">Protocolos</option>
                  <option value="Farmacologia">Farmacologia</option>
                  <option value="Casos Clínicos">Casos Clínicos</option>
                  <option value="Pesquisa">Pesquisa</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Digite uma tag e pressione Enter"
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Proteção por senha */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="password-protected"
                  checked={newPost.isPasswordProtected}
                  onChange={(e) => setNewPost(prev => ({ ...prev, isPasswordProtected: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 bg-slate-700 border-slate-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="password-protected" className="text-sm text-slate-200">
                  Proteger discussão com senha
                </label>
              </div>

              {newPost.isPasswordProtected && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={newPost.password}
                    onChange={(e) => setNewPost(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite a senha"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewPostModal(false)
                  setNewPost({
                    title: '',
                    content: '',
                    description: '',
                    category: 'Geral',
                    tags: [],
                    isPasswordProtected: false,
                    password: '',
                    allowedRoles: [],
                    postRoles: []
                  })
                }}
                className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isCreatingPost || !newPost.title.trim() || !newPost.content.trim()}
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingPost ? 'Criando...' : 'Criar Discussão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Friend Requests */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                📨 Solicitações de Amizade ({friendRequests.length})
              </h3>
              <button
                onClick={() => setShowFriendRequests(!showFriendRequests)}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                {showFriendRequests ? 'Ocultar' : 'Ver Todas'}
              </button>
            </div>

            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div key={request.id} className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{request.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{request.name}</h4>
                      <p className="text-slate-400 text-sm">{request.specialty} • {request.crm}</p>
                      <p className="text-slate-300 text-sm mt-1">{request.message}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptFriend(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aceitar</span>
                    </button>
                    <button
                      onClick={() => handleRejectFriend(request.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Recusar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Friends */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-6">
              👥 Meus Amigos ({onlineUsers.filter(u => u.isFriend).length})
            </h3>

            <div className="space-y-3">
              {onlineUsers.filter(u => u.isFriend).map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{friend.avatar}</span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(friend.status)} rounded-full border-2 border-slate-800`}></div>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{friend.name}</p>
                      <p className="text-slate-400 text-xs">{friend.specialty} • {friend.crm}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors" title="Conversar">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-primary-400 hover:text-primary-300 hover:bg-primary-500/20 rounded transition-colors" title="Videochamada">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded transition-colors" title="Mais opções">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Solicitar Moderador */}
      {showModeratorRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-4 md:p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">🚨 Solicitar Moderador</h3>
            <p className="text-slate-300 mb-4">
              Descreva brevemente o motivo da solicitação. Um moderador será notificado e entrará no chat.
            </p>
            <textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="Ex: Discussão acalorada, usuário inadequado, dúvida técnica complexa..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleRequestModerator}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Enviar Solicitação
              </button>
              <button
                onClick={() => {
                  setShowModeratorRequest(false)
                  setRequestReason('')
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Painel de Moderação (apenas para admins e Eduardo Faveret) */}
      {showModeration && (isAdmin || user?.email?.includes('faveret')) && (
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-6">🛡️ Painel de Moderação</h3>

          {/* Solicitações Pendentes */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              📨 Solicitações de Moderador ({moderatorRequests.length})
            </h4>
            <div className="space-y-4">
              {moderatorRequests.map((request) => (
                <div key={request.id} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-white font-medium">{request.requester_name}</span>
                        <span className="text-slate-400 text-sm">•</span>
                        <span className="text-slate-400 text-sm">Canal: {request.channel}</span>
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{request.reason}</p>
                      <p className="text-slate-400 text-xs">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRespondToRequest(request.id, 'accept')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleRespondToRequest(request.id, 'decline')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {moderatorRequests.length === 0 && (
                <p className="text-slate-400 text-center py-4">Nenhuma solicitação pendente</p>
              )}
            </div>
          </div>

          {/* Estatísticas de Moderação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {moderatorRequests.length}
              </div>
              <div className="text-slate-300 text-sm">Solicitações Pendentes</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {onlineUsers.filter(u => u.is_admin).length}
              </div>
              <div className="text-slate-300 text-sm">Moderadores Online</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary-400 mb-1">
                {onlineUsers.length}
              </div>
              <div className="text-slate-300 text-sm">Usuários Online</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatGlobal