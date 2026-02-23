import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, MessageCircle, Menu, Send, Users, Video, Phone, X } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { useChatSystem } from '../hooks/useChatSystem'
import { supabase } from '../lib/supabase'
import VideoCall from '../components/VideoCall'
import { useVideoCallRequests } from '../hooks/useVideoCallRequests'
import { videoCallRequestService } from '../services/videoCallRequestService'
import VideoCallRequestNotification from '../components/VideoCallRequestNotification'
import { useToast } from '../contexts/ToastContext'
import ConfirmModal from '../components/ConfirmModal'

// Lista de emails dos admins autorizados
const ADMIN_EMAILS = [
  'phpg69@gmail.com',
  'rrvalenca@gmail.com',
  'eduardoscfaveret@gmail.com',
  'cbdrcpremium@gmail.com'
]

interface ParticipantSummary {
  id: string
  name: string | null
  email: string | null
}

const AdminChat: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const roomIdParam = new URLSearchParams(location.search).get('roomId')

  // Verificar se o usuário é admin autorizado
  const isAuthorizedAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())

  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(roomIdParam ?? undefined)
  const [participants, setParticipants] = useState<ParticipantSummary[]>([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [allAdmins, setAllAdmins] = useState<Array<{ id: string; name: string | null; email: string | null }>>([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  // Estados para videochamada
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [videoCallRoomId, setVideoCallRoomId] = useState<string | null>(null)
  const [videoCallInitiator, setVideoCallInitiator] = useState(false)
  
  // Estados para solicitação de videochamada
  const [pendingCallRequest, setPendingCallRequest] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  
  // Estados para modal de confirmação
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info' | 'success'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  })
  
  const toast = useToast()

  // Hook para gerenciar solicitações de videochamada (caller abre a chamada quando o outro aceita)
  const {
    pendingRequests,
    createRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest
  } = useVideoCallRequests({
    onRequestAccepted: (request) => {
      setVideoCallRoomId(request.request_id)
      setVideoCallInitiator(true)
      setCallType(request.call_type ?? 'video')
      setIsVideoCallOpen(true)
      setPendingCallRequest(null)
    }
  })

  // Polling: quando estamos aguardando resposta (requester), verificar se foi aceito (fallback do realtime)
  useEffect(() => {
    if (!pendingCallRequest || !user?.id) return
    const interval = setInterval(async () => {
      const req = await videoCallRequestService.getRequestById(pendingCallRequest)
      if (req?.status === 'accepted') {
        setVideoCallRoomId(req.request_id)
        setVideoCallInitiator(true)
        setCallType(req.call_type ?? 'video')
        setIsVideoCallOpen(true)
        setPendingCallRequest(null)
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [pendingCallRequest, user?.id])

  const {
    inbox,
    inboxLoading,
    messages,
    messagesLoading,
    isOnline,
    sendMessage,
    markRoomAsRead,
    reloadInbox
  } = useChatSystem(activeRoomId, { enabled: true })

  // Filtrar apenas salas de admin
  const adminRooms = useMemo(() => {
    return inbox.filter(room => {
      // Verificar se a sala tem apenas admins autorizados
      return room.type === 'admin' || room.name?.includes('Admin')
    })
  }, [inbox])

  // Carregar lista de admins autorizados
  useEffect(() => {
    const loadAdmins = async () => {
      if (!user) return
      
      setAdminsLoading(true)
      try {
        // Buscar admins pelos emails autorizados (independente do campo type)
        const { data: allAdminsData, error } = await supabase
          .from('users')
          .select('id, name, email')
          .in('email', ADMIN_EMAILS)

        if (error) {
          console.error('Erro ao carregar admins:', error)
          setAllAdmins([])
        } else {
          setAllAdmins(allAdminsData || [])
        }
      } catch (error) {
        console.error('Erro ao carregar admins:', error)
        setAllAdmins([])
      } finally {
        setAdminsLoading(false)
      }
    }

    loadAdmins()
  }, [user])

  // Carregar participantes da sala ativa
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!activeRoomId || !user) {
        setParticipants([])
        return
      }

      setParticipantsLoading(true)
      try {
        // Tentar RPC primeiro
        const { data: participantsData, error } = await supabase
          .rpc('get_chat_participants_for_room', { p_room_id: activeRoomId })

        if (error) {
          console.warn('Erro ao carregar participantes via RPC:', error)
          // Fallback: buscar diretamente
          const { data: directData, error: directError } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('room_id', activeRoomId)

          if (directError) {
            console.error('Erro ao buscar participantes diretamente:', directError)
            setParticipants([])
            return
          }

          if (directData && directData.length > 0) {
            const userIds = directData.map(p => p.user_id).filter(Boolean)
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, name, email')
              .in('id', userIds)

            if (usersError) {
              console.error('Erro ao buscar dados dos usuários:', usersError)
              setParticipants([])
              return
            }

            // Filtrar apenas admins autorizados
            const adminParticipants = (usersData || [])
              .filter(u => u.email && ADMIN_EMAILS.some(e => e.toLowerCase() === u.email?.toLowerCase()))
              .map(u => ({
                id: u.id,
                name: u.name,
                email: u.email
              }))

            console.log('✅ Participantes carregados (fallback):', adminParticipants.length)
            setParticipants(adminParticipants)
          } else {
            console.warn('Nenhum participante encontrado na sala:', activeRoomId)
            setParticipants([])
          }
        } else {
          // Se a RPC retornou dados, usar eles
          if (participantsData && participantsData.length > 0) {
            // RPC retorna { user_id, role } — precisamos buscar os nomes
            const rpcUserIds = participantsData.map((p: any) => p.user_id).filter(Boolean)
            console.log('✅ Participantes da RPC:', rpcUserIds.length)

            if (rpcUserIds.length > 0) {
              const { data: usersFromRpc, error: rpcUsersError } = await supabase
                .from('users')
                .select('id, name, email')
                .in('id', rpcUserIds)

              if (!rpcUsersError && usersFromRpc) {
                const mappedParticipants: ParticipantSummary[] = usersFromRpc.map(u => ({
                  id: u.id,
                  name: u.name ?? null,
                  email: u.email ?? null
                }))
                setParticipants(mappedParticipants)
              } else {
                setParticipants([])
              }
            } else {
              setParticipants([])
            }
          } else {
            // RPC retornou vazio (sem erro), tentar fallback direto
            console.warn('⚠️ RPC retornou 0 participantes. Tentando fallback direto...')
            const { data: directData, error: directError } = await supabase
              .from('chat_participants')
              .select('user_id')
              .eq('room_id', activeRoomId)

            if (directError) {
              console.error('Erro ao buscar participantes diretamente:', directError)
              setParticipants([])
              return
            }

            if (directData && directData.length > 0) {
              const userIds = directData.map(p => p.user_id).filter(Boolean)
              const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, name, email')
                .in('id', userIds)

              if (usersError) {
                console.error('Erro ao buscar dados dos usuários:', usersError)
                setParticipants([])
                return
              }

              // Filtrar apenas admins autorizados
              const adminParticipants = (usersData || [])
                .filter(u => u.email && ADMIN_EMAILS.some(e => e.toLowerCase() === u.email?.toLowerCase()))
                .map(u => ({
                  id: u.id,
                  name: u.name,
                  email: u.email
                }))

              if (adminParticipants.length > 0) {
                setParticipants(adminParticipants)
              } else {
                // Se ainda não encontrou, usar todos os usuários (pode ser que não estejam marcados como admin na tabela users)
                setParticipants((usersData || []).map(u => ({
                  id: u.id,
                  name: u.name,
                  email: u.email
                })))
              }
            } else {
              console.warn('⚠️ Nenhum participante encontrado na sala:', activeRoomId)
              setParticipants([])
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar participantes:', error)
        setParticipants([])
      } finally {
        setParticipantsLoading(false)
      }
    }

    fetchParticipants()
  }, [activeRoomId, user])

  // Marcar sala como lida
  useEffect(() => {
    if (activeRoomId) {
      void markRoomAsRead(activeRoomId)
    }
  }, [activeRoomId, markRoomAsRead])

  // Timer para mostrar tempo restante da solicitação pendente
  useEffect(() => {
    if (!pendingCallRequest) {
      setTimeRemaining(null)
      return
    }

    const request = pendingRequests.find(r => r.request_id === pendingCallRequest)
    
    if (!request || !request.expires_at) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const expires = new Date(request.expires_at).getTime()
      const remaining = Math.max(0, Math.floor((expires - now) / 1000))
      setTimeRemaining(remaining)
      
      if (remaining === 0) {
        setPendingCallRequest(null)
        setTimeRemaining(null)
      }
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [pendingCallRequest, pendingRequests])

  // Criar ou abrir sala com outro admin
  const handleOpenOrCreateRoom = async (adminId: string, adminName: string) => {
    if (!user) return

    try {
      // Verificar se já existe uma sala entre os dois admins
      const { data: existingRooms } = await supabase
        .from('chat_rooms')
        .select('id, name')
        .eq('type', 'admin')

      // Buscar participantes de cada sala para verificar se já existe sala entre os dois
      let existingRoomId: string | null = null
      
      if (existingRooms) {
        for (const room of existingRooms) {
          const { data: roomParticipants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('room_id', room.id)

          const participantIds = roomParticipants?.map(p => p.user_id) || []
          if (participantIds.includes(user.id) && participantIds.includes(adminId) && participantIds.length === 2) {
            existingRoomId = room.id
            break
          }
        }
      }

      if (existingRoomId) {
        setActiveRoomId(existingRoomId)
        navigate(`/app/admin-chat?roomId=${existingRoomId}`, { replace: true })
        return
      }

      // Criar nova sala
      const roomName = `Admin Chat: ${user.name || 'Você'} & ${adminName}`
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: roomName,
          type: 'admin',
          created_by: user.id
        })
        .select()
        .single()

      if (roomError || !newRoom) {
        console.error('Erro ao criar sala:', roomError)
        toast.error('Erro ao criar sala', 'Não foi possível criar a sala de chat. Tente novamente.')
        return
      }

      // Adicionar participantes
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { room_id: newRoom.id, user_id: user.id, role: 'admin' },
          { room_id: newRoom.id, user_id: adminId, role: 'admin' }
        ])

      if (participantsError) {
        console.error('Erro ao adicionar participantes:', participantsError)
        toast.error('Erro ao adicionar participantes', 'Não foi possível adicionar os participantes. Tente novamente.')
        return
      }

      setActiveRoomId(newRoom.id)
      navigate(`/app/admin-chat?roomId=${newRoom.id}`, { replace: true })
      await reloadInbox()
    } catch (error) {
      console.error('Erro ao criar/abrir sala:', error)
      toast.error('Erro ao criar sala', 'Não foi possível criar a sala de chat. Tente novamente.')
    }
  }

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!activeRoomId || !messageInput.trim() || !user) return

    try {
      await sendMessage(activeRoomId, user.id, messageInput.trim())
      setMessageInput('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem', 'Não foi possível enviar a mensagem. Tente novamente.')
    }
  }

  // Outros participantes (excluindo o usuário atual)
  const otherParticipants = useMemo(() => {
    return participants.filter(p => p.id !== user?.id)
  }, [participants, user?.id])

  // Admin selecionado para chamada - MELHORADO para garantir que sempre encontre
  const adminIdForCall = useMemo(() => {
    if (!activeRoomId || !user?.id) return null
    
    // Prioridade 1: Usar otherParticipants (já filtrado)
    if (otherParticipants.length > 0) {
      const recipientId = otherParticipants[0]?.id
      if (recipientId) {
        return recipientId
      }
    }
    
    // Prioridade 2: Buscar diretamente da lista de participantes (fallback)
    if (participants.length > 0) {
      const recipient = participants.find(p => p.id !== user.id)
      if (recipient) {
        return recipient.id
      }
    }
    
    // Prioridade 3: Buscar da lista de admins autorizados (último recurso)
    if (allAdmins.length > 0) {
      const recipient = allAdmins.find(admin => admin.id !== user.id)
      if (recipient) {
        return recipient.id
      }
    }
    
    // (Aviso removido: gerava ruído no console mesmo quando participantes carregavam em seguida)
    return null
  }, [otherParticipants, participants, activeRoomId, user?.id, allAdmins, participantsLoading])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-900 text-slate-200">
        <p>Faça login para acessar o chat.</p>
      </div>
    )
  }

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-900 text-slate-200">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Acesso Restrito</p>
          <p className="text-slate-400">Você não tem permissão para acessar este chat.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-slate-950 text-slate-100 flex">
      {/* Backdrop do drawer (só mobile, quando sidebar aberta com chat ativo) */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Fechar lista"
        className={`fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-200 ${
          activeRoomId && mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setMobileSidebarOpen(false)}
      />
      {/* Sidebar: Lista de Admins — no mobile vira drawer (escondido quando chat ativo) */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 w-[280px] max-w-[85vw] md:w-80 md:max-w-none flex flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-out ${
          activeRoomId && !mobileSidebarOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
      >
        <div className="p-3 md:p-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <h2 className="text-base md:text-lg font-semibold text-white flex items-center gap-2 truncate">
            <Users className="w-5 h-5 text-primary-400 shrink-0" />
            Equipe Admin
          </h2>
          {activeRoomId && (
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Fechar lista"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-2 md:p-3 border-b border-slate-800">
          <input
            type="text"
            placeholder="Buscar admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {adminsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : (
            allAdmins
              .filter(admin => {
                if (!searchQuery) return true
                const query = searchQuery.toLowerCase()
                return (
                  admin.name?.toLowerCase().includes(query) ||
                  admin.email?.toLowerCase().includes(query)
                )
              })
              .filter(admin => admin.id !== user.id)
              .map((admin) => {
                const room = adminRooms.find(r => {
                  const roomWithParticipants = r as typeof r & { participants?: { id: string }[] }
                  return roomWithParticipants.participants?.some((p) => p.id === admin.id) &&
                         roomWithParticipants.participants?.some((p) => p.id === user.id)
                })
                const isActive = activeRoomId === room?.id

                return (
                  <button
                    key={admin.id}
                    onClick={() => {
                      if (room) {
                        setActiveRoomId(room.id)
                        navigate(`/app/admin-chat?roomId=${room.id}`, { replace: true })
                        setMobileSidebarOpen(false)
                      } else {
                        handleOpenOrCreateRoom(admin.id, admin.name || admin.email || 'Admin')
                        setMobileSidebarOpen(false)
                      }
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{admin.name || admin.email?.split('@')[0]}</p>
                        <p className="text-xs opacity-75 truncate">{admin.email}</p>
                      </div>
                      {room && (
                        <span className="text-xs opacity-50">
                          {room.lastMessageAt
                            ? new Date(room.lastMessageAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit'
                              })
                            : 'Novo'
                          }
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
          )}
        </div>
      </div>

      {/* Área de Chat — no mobile ocupa toda a largura quando a lista está fechada */}
      <div className="flex-1 flex flex-col bg-slate-900 min-w-0 w-full">
        {!activeRoomId ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Selecione um admin para iniciar uma conversa</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header do Chat */}
            <div className="p-3 md:p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="md:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Abrir lista da equipe"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-white truncate">
                    {otherParticipants[0]?.name || otherParticipants[0]?.email || 'Chat Admin'}
                  </h3>
                  <p className="text-sm text-slate-400 truncate">
                    {otherParticipants[0]?.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activeRoomId && (
                    <>
                      <button
                        onClick={async () => {
                          // Tentar encontrar o destinatário de várias formas
                          let recipientId = adminIdForCall
                          
                          // Fallback: buscar da lista de participantes
                          if (!recipientId && participants.length > 0) {
                            const recipient = participants.find(p => p.id !== user?.id)
                            if (recipient) {
                              recipientId = recipient.id
                              console.log('📞 Usando fallback para destinatário:', recipient.name || recipient.email)
                            }
                          }
                          
                          if (!recipientId) {
                            toast.error('Erro', 'Não foi possível identificar o destinatário da chamada. Verifique se há um admin na conversa.')
                            console.error('❌ Não foi possível identificar destinatário:', { participants, adminIdForCall, user })
                            return
                          }
                          
                          const timeoutSeconds = 1800 // 30 minutos para admins
                          
                          try {
                            const request = await createRequest({
                              recipientId,
                              callType: 'video',
                              timeoutSeconds,
                              metadata: {
                                roomId: activeRoomId,
                                isAdminChat: true
                              }
                            })
                            
                            if (request) {
                              setPendingCallRequest(request.request_id)
                              setCallType('video')
                              toast.success('Solicitação enviada', 'A solicitação de videochamada foi enviada com sucesso!')
                              
                              // Verificar se a solicitação foi realmente criada após um pequeno delay
                              // Se houver erro na notificação, a solicitação ainda foi criada, então não cancelar
                              setTimeout(async () => {
                                // Verificar se a solicitação ainda está pendente
                                const { data: checkRequest } = await supabase
                                  .from('video_call_requests')
                                  .select('status')
                                  .eq('request_id', request.request_id)
                                  .single()
                                
                                if (checkRequest && checkRequest.status !== 'pending') {
                                  // Solicitação foi respondida ou cancelada
                                  setPendingCallRequest(null)
                                }
                              }, 2000)
                            } else {
                              toast.error('Erro', 'Não foi possível criar a solicitação de videochamada.')
                            }
                          } catch (error) {
                            console.error('Erro ao criar solicitação:', error)
                            toast.error('Erro', 'Não foi possível enviar a solicitação de videochamada.')
                            setPendingCallRequest(null)
                          }
                        }}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          participantsLoading 
                            ? "Aguardando carregamento dos participantes..." 
                            : !adminIdForCall 
                            ? "Selecione um admin para iniciar a chamada" 
                            : pendingCallRequest
                            ? "Aguardando resposta..."
                            : "Solicitar videochamada"
                        }
                        disabled={!!pendingCallRequest || participantsLoading}
                      >
                        <Video className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          // Tentar encontrar o destinatário de várias formas
                          let recipientId = adminIdForCall
                          
                          // Fallback: buscar da lista de participantes
                          if (!recipientId && participants.length > 0) {
                            const recipient = participants.find(p => p.id !== user?.id)
                            if (recipient) {
                              recipientId = recipient.id
                              console.log('📞 Usando fallback para destinatário:', recipient.name || recipient.email)
                            }
                          }
                          
                          if (!recipientId) {
                            toast.error('Erro', 'Não foi possível identificar o destinatário da chamada. Verifique se há um admin na conversa.')
                            console.error('❌ Não foi possível identificar destinatário:', { participants, adminIdForCall, user })
                            return
                          }
                          
                          const timeoutSeconds = 1800 // 30 minutos para admins
                          
                          try {
                            const request = await createRequest({
                              recipientId,
                              callType: 'audio',
                              timeoutSeconds,
                              metadata: {
                                roomId: activeRoomId,
                                isAdminChat: true
                              }
                            })
                            
                            if (request) {
                              setPendingCallRequest(request.request_id)
                              setCallType('audio')
                              toast.success('Solicitação enviada', 'A solicitação de chamada de áudio foi enviada com sucesso!')
                              
                              // Verificar se a solicitação foi realmente criada após um pequeno delay
                              setTimeout(async () => {
                                const { data: checkRequest } = await supabase
                                  .from('video_call_requests')
                                  .select('status')
                                  .eq('request_id', request.request_id)
                                  .single()
                                
                                if (checkRequest && checkRequest.status !== 'pending') {
                                  setPendingCallRequest(null)
                                }
                              }, 2000)
                            } else {
                              toast.error('Erro', 'Não foi possível criar a solicitação de chamada de áudio.')
                            }
                          } catch (error) {
                            console.error('Erro ao criar solicitação:', error)
                            toast.error('Erro', 'Não foi possível enviar a solicitação de chamada de áudio.')
                            setPendingCallRequest(null)
                          }
                        }}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          participantsLoading 
                            ? "Aguardando carregamento dos participantes..." 
                            : !adminIdForCall 
                            ? "Selecione um admin para iniciar a chamada" 
                            : pendingCallRequest
                            ? "Aguardando resposta..."
                            : "Solicitar chamada de áudio"
                        }
                        disabled={!!pendingCallRequest || participantsLoading}
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messagesLoading ? (
                <div className="flex items-center justify-center text-sm text-slate-400 h-full">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-slate-400 text-center mt-16">
                  Nenhuma mensagem ainda. Envie a primeira mensagem!
                </div>
              ) : (
                messages.map(msg => {
                  const isOwn = msg.senderId === user.id
                  // Formatar data de forma segura
                  let timeDisplay = 'Agora'
                  if (msg.createdAt) {
                    try {
                      const date = new Date(msg.createdAt)
                      if (!isNaN(date.getTime())) {
                        timeDisplay = date.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }
                    } catch (e) {
                      console.warn('Erro ao formatar data:', e, msg.createdAt)
                    }
                  }
                  
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-lg rounded-2xl px-4 py-3 shadow transition-colors ${
                          isOwn
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-800 text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{msg.message ?? ''}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-slate-400'}`}>
                          {timeDisplay}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notificações de solicitação de videochamada */}
      {pendingRequests.map(request => (
        <VideoCallRequestNotification
          key={request.id}
          request={request}
          onAccept={async (acceptedRequest) => {
            await acceptRequest(acceptedRequest.request_id)
            setVideoCallRoomId(acceptedRequest.request_id)
            setVideoCallInitiator(false)
            setCallType(acceptedRequest.call_type ?? 'video')
            if (pendingCallRequest === acceptedRequest.request_id) {
              setPendingCallRequest(null)
            }
            setIsVideoCallOpen(true)
          }}
          onReject={async (rejectedRequest) => {
            await rejectRequest(rejectedRequest.request_id)
            if (pendingCallRequest === rejectedRequest.request_id) {
              setPendingCallRequest(null)
              toast.warning('Solicitação recusada', 'A solicitação de videochamada foi recusada.')
            }
          }}
          onExpire={(expiredRequest) => {
            if (pendingCallRequest === expiredRequest.request_id) {
              setPendingCallRequest(null)
              toast.warning('Solicitação expirada', 'A solicitação de videochamada expirou.')
            }
          }}
        />
      ))}

      {/* Indicador de espera */}
      {pendingCallRequest && (
        <div className="fixed bottom-4 right-4 bg-blue-600/90 backdrop-blur-sm border border-blue-500/50 rounded-xl p-4 shadow-2xl max-w-sm z-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">⏳ Aguardando resposta</h4>
              <p className="text-xs text-blue-100 leading-relaxed mb-2">
                Sua solicitação foi enviada. Você será notificado quando o admin aceitar ou recusar.
              </p>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-blue-200/80">⏰ Tempo restante:</span>
                  <span className="text-xs font-mono font-semibold text-white">
                    {timeRemaining > 0 
                      ? `${Math.floor(timeRemaining / 60)}:${String(Math.floor(timeRemaining % 60)).padStart(2, '0')}`
                      : 'Expirado'
                    }
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (pendingCallRequest) {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Cancelar solicitação',
                    message: 'Tem certeza que deseja cancelar a solicitação de videochamada?',
                    type: 'warning',
                    onConfirm: async () => {
                      await cancelRequest(pendingCallRequest)
                      setPendingCallRequest(null)
                      setTimeRemaining(null)
                      toast.success('Solicitação cancelada', 'A solicitação foi cancelada com sucesso.')
                    }
                  })
                }
              }}
              className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              title="Cancelar solicitação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Componente de Videochamada */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => {
          setIsVideoCallOpen(false)
          setPendingCallRequest(null)
          setVideoCallRoomId(null)
        }}
        patientId={adminIdForCall ?? undefined}
        isAudioOnly={callType === 'audio'}
        signalingRoomId={videoCallRoomId ?? undefined}
        isInitiator={videoCallInitiator}
      />

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  )
}

export default AdminChat
