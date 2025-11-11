import React, { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Search, Send, Video, Phone, FileText, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ChatRoomSummary, useChatSystem } from '../hooks/useChatSystem'

interface ProfessionalChatSystemProps {
  className?: string
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

const ProfessionalChatSystem: React.FC<ProfessionalChatSystemProps> = ({ className = '' }) => {
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
    if (!activeRoomId && inbox.length > 0) {
      setActiveRoomId(inbox[0].id)
    }
  }, [activeRoomId, inbox])

  const filteredRooms = useMemo(() => {
    const byFilter = inbox.filter(room => filter === 'all' || room.type === filter)

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
    <div className={`bg-slate-800/80 rounded-lg border border-slate-700 ${className}`}>
      <header className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            Chat Profissionais
          </h2>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('professional')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'professional'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Profissionais
          </button>
          <button
            onClick={() => setFilter('student')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'student'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Estudantes
          </button>
          <button
            onClick={() => setFilter('patient')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === 'patient'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Pacientes
          </button>
        </div>
      </header>

      <div className="flex h-[440px]">
        <aside className="w-1/3 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
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
              <div className="p-4 text-sm text-slate-400">
                Nenhuma sala encontrada para o filtro atual.
              </div>
            )}

            {filteredRooms.map(room => {
              const isActive = room.id === activeRoomId

              return (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`w-full text-left p-4 border-b border-slate-700 transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{room.name ?? 'Sala sem nome'}</span>
                    {room.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    Última atividade: {formatDateTime(room.lastMessageAt)}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide opacity-60 mt-2">
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

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading && (
                  <div className="text-sm text-slate-400">Carregando mensagens...</div>
                )}

                {!messagesLoading && messages.length === 0 && (
                  <div className="text-sm text-slate-400">
                    Nenhuma mensagem registrada nesta sala. Inicie uma conversa.
                  </div>
                )}

                {messages.map(message => {
                  const isOwn = message.senderId === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                          isOwn ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
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
                      <Wifi className="w-3 h-3" />
                      Conectado ao Supabase Realtime
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
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