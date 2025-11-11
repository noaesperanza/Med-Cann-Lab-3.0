import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Loader2, MessageCircle, Send, Users } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { useChatSystem } from '../hooks/useChatSystem'
import { supabase } from '../lib/supabase'

interface ParticipantSummary {
  id: string
  name: string | null
  email: string | null
}

interface ChatParticipantProfile {
  user_id: string
  name: string | null
  email: string | null
}

const PatientDoctorChat: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const roomIdParam = new URLSearchParams(location.search).get('roomId')
  const origin = new URLSearchParams(location.search).get('origin')

  const isImpersonatingPatient = user?.type === 'admin' && origin === 'patient-dashboard'

  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(roomIdParam ?? undefined)
  const [participants, setParticipants] = useState<ParticipantSummary[]>([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [messageInput, setMessageInput] = useState('')

  const {
    inbox,
    inboxLoading,
    messages,
    messagesLoading,
    isOnline,
    sendMessage,
    markRoomAsRead
  } = useChatSystem(activeRoomId, { enabled: !isImpersonatingPatient })

  const patientRooms = useMemo(
    () => inbox.filter(room => room.type === 'patient'),
    [inbox]
  )

  useEffect(() => {
    if (!patientRooms.length) {
      setActiveRoomId(undefined)
      return
    }

    if (!activeRoomId || !patientRooms.some(room => room.id === activeRoomId)) {
      setActiveRoomId(patientRooms[0].id)
    }
  }, [patientRooms, activeRoomId])

  useEffect(() => {
    if (isImpersonatingPatient || !activeRoomId) {
      setParticipants([])
      return
    }

    const fetchParticipants = async () => {
      setParticipantsLoading(true)
      try {
        const { data: participantRows, error: participantError } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('room_id', activeRoomId)

        if (participantError || !participantRows?.length) {
          if (participantError) {
            console.warn('Não foi possível listar participantes do chat:', participantError)
          }
          setParticipants([])
          return
        }

        const userIds = participantRows
          .map(row => row.user_id)
          .filter((id): id is string => Boolean(id))

        if (userIds.length === 0) {
          setParticipants([])
          return
        }

        const { data: profileRows, error: profileError } = await supabase.rpc(
          'get_chat_user_profiles',
          { p_user_ids: userIds }
        )

        if (profileError || !profileRows) {
          if (profileError) {
            console.warn('Falha ao buscar perfis dos participantes:', profileError)
          }
          setParticipants([])
          return
        }

        const profiles = profileRows as ChatParticipantProfile[]

        setParticipants(
          profiles.map(profile => ({
            id: profile.user_id,
            name: profile.name ?? null,
            email: profile.email ?? null
          }))
        )
      } finally {
        setParticipantsLoading(false)
      }
    }

    fetchParticipants()
  }, [activeRoomId, isImpersonatingPatient])

  useEffect(() => {
    if (!isImpersonatingPatient && activeRoomId) {
      void markRoomAsRead(activeRoomId)
    }
  }, [activeRoomId, markRoomAsRead, isImpersonatingPatient])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-900 text-slate-200">
        <p>Faça login para acessar o chat clínico.</p>
      </div>
    )
  }

  if (isImpersonatingPatient) {
    return (
      <div className="min-h-[calc(100vh-6rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-10">
          <MessageCircle className="w-10 h-10 mx-auto text-primary-400" />
          <h1 className="text-2xl font-semibold text-white">Chat disponível somente para o paciente</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Para visualizar o histórico real desta conversa, acesse com a conta do paciente ou adicione-se como participante autorizado na sala correspondente em
            <code className="block mt-2 text-xs text-primary-300">chat_participants</code>.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </div>
    )
  }

  const otherParticipants = participants.filter(participant => participant.id !== user.id)

  const handleSelectRoom = async (roomId: string) => {
    setActiveRoomId(roomId)
    setMessageInput('')
    await markRoomAsRead(roomId)
  }

  const handleSubmitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeRoomId || !messageInput.trim()) return

    try {
      await sendMessage(activeRoomId, user.id, messageInput)
      setMessageInput('')
      await markRoomAsRead(activeRoomId)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <header className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-300 mb-2">Programa de Cuidado Renal</p>
              <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-primary-400" />
                Atendimento Integrado
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Converse com a equipe clínica responsável pelo seu acompanhamento em cannabis medicinal e saúde renal.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isOnline ? 'Conectado ao Realtime' : 'Offline'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                {patientRooms.length} canal(is)
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <aside className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-400" />
                Equipe clínica
              </h2>

              {inboxLoading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando canais...
                </div>
              ) : patientRooms.length === 0 ? (
                <div className="flex-1 text-sm text-slate-400">
                  Nenhum canal habilitado para o seu perfil ainda. Aguarde a equipe clínica.
                </div>
              ) : (
                <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  {patientRooms.map(room => {
                    const isActive = room.id === activeRoomId
                    const unreadBadge = room.unreadCount > 0 && !isActive

                    return (
                      <button
                        key={room.id}
                        onClick={() => handleSelectRoom(room.id)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                          isActive
                            ? 'border-primary-500/60 bg-primary-500/10 text-white'
                            : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-primary-500/40 hover:bg-primary-500/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{room.name || 'Canal Clínico'}</p>
                            <p className="text-xs text-slate-400">
                              {room.lastMessageAt
                                ? new Date(room.lastMessageAt).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Em aberto'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-2">
                            {unreadBadge && (
                              <span className="px-2 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-semibold">
                                {room.unreadCount}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </aside>

            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col min-h-[480px]">
              <div className="border-b border-slate-800 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {patientRooms.find(room => room.id === activeRoomId)?.name || 'Selecione um canal'}
                  </h2>
                  {!participantsLoading && otherParticipants.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {otherParticipants.map(participant => participant.name || participant.email || 'Profissional').join(' • ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {participantsLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {activeRoomId ? (
                  messagesLoading ? (
                    <div className="flex items-center justify-center text-sm text-slate-400 h-full">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando mensagens...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-sm text-slate-400 text-center mt-16">
                      Nenhuma conversa registrada ainda. Envie a primeira mensagem para iniciar o atendimento.
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isOwn = msg.senderId === user.id
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-lg rounded-2xl px-4 py-3 shadow transition-colors ${
                              isOwn
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-800 text-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="text-xs font-semibold">
                                {isOwn ? 'Você' : msg.senderName || 'Profissional'}
                              </span>
                              <span className="text-[10px] opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      )
                    })
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    Selecione um canal de atendimento para visualizar as mensagens.
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitMessage} className="border-t border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={event => setMessageInput(event.target.value)}
                    placeholder={activeRoomId ? 'Escreva sua mensagem...' : 'Selecione um canal para enviar mensagens'}
                    disabled={!activeRoomId}
                    className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={!activeRoomId || !messageInput.trim()}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDoctorChat
