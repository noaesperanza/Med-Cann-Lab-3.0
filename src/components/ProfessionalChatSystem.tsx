import React, { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Search, Send, Video, Phone, FileText, Activity, X, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ChatRoomSummary, useChatSystem } from '../hooks/useChatSystem'

interface ProfessionalChatSystemProps {
  className?: string
  interlocutor?: string
  selectedPatientId?: string | null
}

type RoomFilter = 'all' | 'professional' | 'student' | 'patient'

const formatDateTime = (isoDate?: string | null) => {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (isoDate: string) => {
  const date = new Date(isoDate)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ProfessionalChatSystem: React.FC<ProfessionalChatSystemProps> = ({ className = '', interlocutor, selectedPatientId }) => {
  const { user } = useAuth()
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [filter, setFilter] = useState<RoomFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [inputMessage, setInputMessage] = useState('')

  const {
    inbox,
    inboxLoading,
    messages,
    messagesLoading,
    isOnline,
    sendMessage,
    markRoomAsRead
  } = useChatSystem(activeRoomId ?? undefined)

  useEffect(() => {
    if (activeRoomId) return

    // Prioridade 1: ID do Paciente (vinda do Workstation)
    if (selectedPatientId && inbox.length > 0) {
      // Tenta encontrar sala onde o ID do paciente está nos participantes (metadata ou nome)
      // Como não temos participants exposto, vamos pelo NOME (que geralmente é o nome do paciente)
      // ou se o room.id for igual ao patientId (caso raro, mas possível em sistemas 1:1)

      // TODO: Melhorar useChatSystem para expor metadados de participantes
      // Por enquanto, tentamos matching flexível
      const targetRoom = inbox.find(room =>
        // Verifica se o ID do paciente é parte do ID da sala (convenção)
        room.id === selectedPatientId ||
        // Verifica se o nome da sala contem o ID (im improvável) ou Nome
        (room.name && selectedPatientId && room.name.includes(selectedPatientId)) // Isso é frágil se selectedPatientId for UUID
      )

      // Estratégia de Fallback: Se selectedPatientId for um NOME (prop passada errada), tenta pelo nome
      // Se selectedPatientId for UUID, precisamos de uma query mais robusta no futuro.

      if (targetRoom) {
        setActiveRoomId(targetRoom.id)
        return
      }
    }

    // Prioridade 2: Interlocutor (Nome)
    if (interlocutor && inbox.length > 0) {
      // Tentar encontrar sala com o interlocutor
      const targetRoom = inbox.find(room =>
        room.name?.toLowerCase().includes(interlocutor.toLowerCase())
      )
      if (targetRoom) {
        setActiveRoomId(targetRoom.id)
      } else if (inbox.length > 0) {
        // Fallback: primeira sala
        setActiveRoomId(inbox[0].id)
      }
    } else if (!activeRoomId && inbox.length > 0) {
      setActiveRoomId(inbox[0].id)
    }
  }, [activeRoomId, inbox, interlocutor, selectedPatientId])

  const filteredRooms = useMemo(() => {
    const byFilter = inbox.filter(room => {
      if (filter === 'all') return true
      if (filter === 'professional') return room.type === 'professional' || room.type === 'direct' || room.type === 'admin'
      return room.type === filter
    })

    if (!searchTerm.trim()) {
      return byFilter
    }

    const term = searchTerm.toLowerCase()
    return byFilter.filter(room => (room.name ?? '').toLowerCase().includes(term))
  }, [filter, inbox, searchTerm])

  const activeRoom = activeRoomId
    ? inbox.find(room => room.id === activeRoomId) ?? null
    : null

  const handleSelectRoom = (room: ChatRoomSummary) => {
    setActiveRoomId(room.id)
    void markRoomAsRead(room.id)
  }

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!activeRoomId || !user?.id || !inputMessage.trim()) return

    await sendMessage(activeRoomId, user.id, inputMessage)
    setInputMessage('')
    await markRoomAsRead(activeRoomId)
  }

  return (
    <div className={`bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col h-full ${className}`}>
      {/* Optimized Centered Header - Compact Version */}
      <div className="flex flex-col items-center text-center space-y-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full">
          {/* Filters Container - More Compact */}
          <div className="flex items-center p-0.5 bg-slate-900/50 rounded-full border border-slate-700 backdrop-blur-md overflow-x-auto no-scrollbar max-w-full">
            {(['all', 'professional', 'student', 'patient'] as RoomFilter[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setFilter(tabKey)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${filter === tabKey
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
              >
                {tabKey === 'all' ? 'Todos' : tabKey === 'professional' ? 'Profissionais' : tabKey === 'student' ? 'Estudantes' : 'Pacientes'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              // TODO: Implementar modal de seleção de profissional para novo chat
              alert('Funcionalidade de pesquisar profissionais para iniciar novo chat em desenvolvimento.')
            }}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-3 h-3" />
            Novo Chat
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 border-r border-slate-700 flex flex-col min-w-[200px]">
          <div className="p-3 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar salas..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {inboxLoading && (
              <div className="p-4 text-sm text-slate-400">Carregando salas...</div>
            )}

            {!inboxLoading && filteredRooms.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 font-medium">Nenhuma sala encontrada</p>
                <p className="text-xs text-slate-500 mt-1">Tente mudar o filtro ou iniciar um novo chat.</p>
              </div>
            )}

            {filteredRooms.map(room => {
              const isActive = room.id === activeRoomId

              return (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full text-left p-3 border-b border-slate-700 transition-all ${isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : room.unreadCount > 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-l-emerald-500 pl-2'
                      : 'hover:bg-slate-700 text-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-base truncate">{room.name ?? 'Sala sem nome'}</span>
                    {room.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-slate-950">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    Última atividade: {formatDateTime(room.lastMessageAt)}
                  </p>
                  <p className="text-xs uppercase font-black tracking-widest opacity-40 mt-1">
                    {room.type ?? 'sem classificação'}
                  </p>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          {activeRoom ? (
            <>
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{activeRoom.name}</h3>
                  <p className="text-sm text-slate-400 capitalize">
                    {activeRoom.type ?? 'sem classificação'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                {/* Background Doodle Pattern */}
                {/* Background Brand Watermark */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage: `url("/brain.png")`,
                    backgroundSize: '300px',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'grayscale(100%)'
                  }}
                />

                {messagesLoading && (
                  <div className="text-sm text-slate-400 relative z-10 text-center py-4">Carregando mensagens...</div>
                )}

                {!messagesLoading && messages.length === 0 && (
                  <div className="text-sm text-slate-400 relative z-10 text-center py-10 opacity-60">
                    <p className="mb-2">Nenhuma mensagem registrada nesta sala.</p>
                    <p className="text-xs">Inicie uma conversa profissional e segura.</p>
                  </div>
                )}

                {messages.map(message => {
                  const isOwn = message.senderId === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative z-10`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isOwn
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                          }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <span className="font-semibold text-xs">{message.senderName}</span>
                          <span className="text-[10px] opacity-75">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p>{message.message}</p>
                        {message.fileUrl && (
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-xs underline"
                          >
                            <FileText className="w-3 h-3" />
                            Abrir arquivo
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <footer className="p-4 border-t border-slate-700">
                <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={event => setInputMessage(event.target.value)}
                    placeholder={
                      isOnline
                        ? 'Digite sua mensagem...'
                        : 'Modo offline – mensagens serão enviadas quando reconectar'
                    }
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || !isOnline}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                </form>
                <p className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <Activity className="w-3 h-3" />
                      Conectado ao Supabase Realtime
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" />
                      Offline – mensagens serão sincronizadas quando a conexão voltar
                    </>
                  )}
                </p>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-slate-300 space-y-3">
                <MessageCircle className="w-16 h-16 text-slate-500 mx-auto" />
                <h3 className="text-xl font-semibold text-white">Selecione uma sala</h3>
                <p className="text-sm text-slate-400">
                  Escolha uma sala de chat na coluna à esquerda para visualizar as mensagens.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ProfessionalChatSystem