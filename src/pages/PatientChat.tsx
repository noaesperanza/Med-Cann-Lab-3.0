import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  ChevronDown,
  CheckCircle,
  BookOpen,
  Loader2,
  Phone,
  Video,
  Smile,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import JourneyManualModal from '../components/JourneyManualModal'

interface Message {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: string
  isDoctor: boolean
}

const PatientChat: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [showProfessionalSelect, setShowProfessionalSelect] = useState(false)
  const [showJourneyManual, setShowJourneyManual] = useState(false)
  const [linkedProfessionalIds, setLinkedProfessionalIds] = useState<Set<string>>(new Set())
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showAddProfModal, setShowAddProfModal] = useState(false)
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const noaAvatarSrc = `${import.meta.env.BASE_URL}noa-avatar.png`
  const brainSrc = `${import.meta.env.BASE_URL}brain.png`

  // ── Partículas orbitais neon ──
  const orbitalParticles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, idx) => {
      const angle = (idx / 24) * Math.PI * 2
      const radius = 58 + Math.random() * 28
      const size = Math.random() * 3 + 1.5
      const duration = Math.random() * 8 + 10
      const delay = Math.random() * 6
      const opacity = Math.random() * 0.5 + 0.3
      // Alternate neon colors
      const colors = [
        'rgba(16, 185, 129, VAR)', // emerald
        'rgba(52, 211, 153, VAR)', // emerald-light
        'rgba(6, 182, 212, VAR)',  // cyan
        'rgba(56, 189, 248, VAR)', // sky
        'rgba(139, 92, 246, VAR)', // violet
        'rgba(168, 85, 247, VAR)', // purple
      ]
      const color = colors[idx % colors.length].replace('VAR', String(opacity))
      const glowColor = colors[idx % colors.length].replace('VAR', String(opacity * 0.6))
      return { key: `orb-${idx}`, angle, radius, size, duration, delay, color, glowColor }
    })
  }, [])

  // ── Ambient dust particles ──
  const ambientParticles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, idx) => ({
      key: `amb-${idx}`,
      size: Math.random() * 2.5 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 6 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.15 + 0.1,
    }))
  }, [])

  // Carregar profissionais do banco
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, type')
          .in('type', ['profissional', 'admin'])

        if (!error && data) {
          setProfessionals(data)
          if (data.length > 0 && !selectedProfessional) {
            setSelectedProfessional(data[0].id)
          }
        }

        // Carregar profissionais vinculados (que têm sala com o usuário)
        if (user?.id) {
          const { data: rooms } = await supabase
            .from('chat_participants')
            .select('room_id')
            .eq('user_id', user.id)

          if (rooms && rooms.length > 0) {
            const roomIds = rooms.map(r => r.room_id)
            const { data: otherParticipants } = await supabase
              .from('chat_participants')
              .select('user_id, role')
              .in('room_id', roomIds)
              .in('role', ['professional', 'admin'])

            const linkedIds = new Set<string>()
            otherParticipants?.forEach(p => {
              if (p.user_id && p.user_id !== user.id) {
                linkedIds.add(p.user_id)
              }
            })
            setLinkedProfessionalIds(linkedIds)
            console.log('🔗 Profissionais vinculados:', linkedIds.size)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error)
      }
    }

    loadProfessionals()
  }, [user?.id])

  // Carregar mensagens quando profissional é selecionado
  useEffect(() => {
    if (selectedProfessional && user?.id) {
      loadMessages()

      // Configurar Realtime
      let channel: any = null
      getOrCreateChatRoom(user.id, selectedProfessional).then(chatId => {
        channel = supabase
          .channel(`chat_${chatId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${chatId}`
          }, (payload) => {
            loadMessages()
          })
          .subscribe()
      })

      return () => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      }
    }
  }, [selectedProfessional, user?.id])

  // Função para obter ou criar sala de chat
  const getOrCreateChatRoom = async (patientId: string, professionalId: string): Promise<string> => {
    try {
      const { data: roomId, error } = await supabase.rpc('create_chat_room_for_patient_uuid', {
        p_patient_id: patientId,
        p_professional_id: professionalId
      });

      if (error) {
        console.warn('Erro na RPC create_chat_room_for_patient_uuid, tentando fallback manual...', error);
        throw error;
      }

      if (roomId) return roomId;

      throw new Error('Não foi possível obter o ID da sala');
    } catch (err) {
      console.error('Erro ao obter/criar sala:', err);
      throw err;
    }
  }

  const loadMessages = async () => {
    if (!selectedProfessional || !user?.id) return

    try {
      const chatId = await getOrCreateChatRoom(user.id, selectedProfessional)

      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', chatId)
        .order('created_at', { ascending: true })

      if (!error && messagesData) {
        const professional = professionals.find(p => p.id === selectedProfessional)

        const formattedMessages = messagesData.map((msg: any) => {
          const isDoctor = msg.sender_id === selectedProfessional
          const senderName = isDoctor ? (professional?.name || 'Profissional') : 'Você'
          const senderAvatar = isDoctor ? (professional?.name?.[0] || 'P') : 'V'

          return {
            id: msg.id,
            user: senderName,
            avatar: senderAvatar,
            message: msg.message,
            timestamp: new Date(msg.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            isDoctor
          }
        })

        setMessages(formattedMessages)
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const currentProfessional = professionals.find(p => p.id === selectedProfessional)

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedProfessional || !user?.id) return

    try {
      const chatId = await getOrCreateChatRoom(user.id, selectedProfessional)

      const messagePayload = {
        room_id: chatId,
        sender_id: user.id,
        message: message.trim(),
        message_type: 'text',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(messagePayload)

      if (error) {
        throw error
      }

      setMessage('')
      loadMessages()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startRecording = () => {
    setIsRecording(!isRecording)
  }

  const startVideoCall = () => {
    setIsVideoCall(!isVideoCall)
  }

  // Scroll para o topo quando carrega a página
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selectedProfessional])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfessionalSelect && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfessionalSelect(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfessionalSelect])

  // ── CSS Keyframes for orbital animation ──
  const orbitalStyles = `
    @keyframes noaOrbit {
      0%   { transform: rotate(0deg)   translateX(var(--orbit-r)) rotate(0deg);   opacity: var(--orb-opacity); }
      50%  { transform: rotate(180deg) translateX(var(--orbit-r)) rotate(-180deg); opacity: calc(var(--orb-opacity) * 0.5); }
      100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); opacity: var(--orb-opacity); }
    }
    @keyframes noaPulse {
      0%, 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.15), 0 0 60px rgba(6, 182, 212, 0.08); }
      50%      { box-shadow: 0 0 50px rgba(16, 185, 129, 0.25), 0 0 90px rgba(6, 182, 212, 0.15); }
    }
    @keyframes noaFloat {
      0%, 100% { transform: translateY(0px); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes noaGlow {
      0%, 100% { opacity: 0.3; }
      50%      { opacity: 0.6; }
    }
  `

  const hasMessages = messages.length > 0

  return (
    <div className="h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col">
      {/* ── Injected keyframes ── */}
      <style>{orbitalStyles}</style>

      {/* ── Ambient background glows ── */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-violet-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* ── Ambient dust particles ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {ambientParticles.map(p => (
          <span
            key={p.key}
            className="patient-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-6 flex flex-col flex-1 h-full min-h-0">

        {/* ── Minimal Top Bar ── */}
        <div className="flex items-center justify-between py-4">
          <div className="relative" style={{ zIndex: 100 }}>
            <button
              onClick={() => setShowProfessionalSelect(!showProfessionalSelect)}
              className="flex items-center gap-3 hover:bg-slate-800/50 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-slate-700/50"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-400">{currentProfessional?.name?.[0] || 'P'}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-200">{currentProfessional?.name || 'Profissional'}</p>
                <p className="text-[10px] text-slate-500">Cannabis Medicinal</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Dropdown */}
            {showProfessionalSelect && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/30 custom-scrollbar"
                style={{ zIndex: 100 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  {(() => {
                    const isAdmin = user?.type === 'admin';
                    const linkedProfessionals = professionals.filter(p =>
                      isAdmin || linkedProfessionalIds.has(p.id)
                    );
                    const unlinkedProfessionals = professionals.filter(p =>
                      !isAdmin && !linkedProfessionalIds.has(p.id)
                    );

                    return (
                      <>
                        {linkedProfessionals.length > 0 && (
                          <>
                            <p className="text-[10px] text-emerald-400/80 font-semibold mb-2 px-2 uppercase tracking-wider">Minha Equipe</p>
                            {linkedProfessionals.map((professional) => (
                              <button
                                key={professional.id}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSelectedProfessional(professional.id)
                                  setShowProfessionalSelect(false)
                                }}
                                className="w-full p-2.5 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center gap-3"
                              >
                                <div className="w-8 h-8 flex-shrink-0 bg-emerald-500/15 border border-emerald-500/25 rounded-lg flex items-center justify-center">
                                  <span className="text-emerald-400 text-xs font-bold">{professional.name?.[0] || 'P'}</span>
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-white text-sm">{professional.name}</p>
                                  <p className="text-[10px] text-slate-500">Cannabis Medicinal</p>
                                </div>
                                {selectedProfessional === professional.id && (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                )}
                              </button>
                            ))}
                          </>
                        )}

                        {unlinkedProfessionals.length > 0 && (
                          <>
                            <div className="border-t border-slate-700/50 my-2" />
                            <p className="text-[10px] text-slate-500 font-semibold mb-2 px-2 uppercase tracking-wider">Adicionar Profissional</p>
                            {unlinkedProfessionals.map((professional) => (
                              <button
                                key={professional.id}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSelectedProfessional(professional.id)
                                  setShowProfessionalSelect(false)
                                }}
                                className="w-full p-2 rounded-lg hover:bg-slate-800/40 transition-colors flex items-center gap-3 opacity-60 hover:opacity-100"
                              >
                                <div className="w-8 h-8 flex-shrink-0 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
                                  <span className="text-slate-400 text-xs font-bold">{professional.name?.[0] || 'P'}</span>
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-slate-300 text-sm">{professional.name}</p>
                                  <p className="text-[10px] text-slate-500">Clique para adicionar</p>
                                </div>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Add</span>
                              </button>
                            ))}
                          </>
                        )}

                        {professionals.length === 0 && (
                          <p className="text-slate-500 text-sm text-center py-4">Nenhum profissional disponível</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowTeamModal(true)}
              className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider bg-slate-800/40 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-700/40 hover:border-emerald-500/20 rounded-lg transition-all"
            >
              Equipe
            </button>
            <button
              onClick={() => setShowJourneyManual(true)}
              className="p-2 text-slate-500 hover:text-emerald-400 transition-colors"
              title="Manual da Jornada"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Chat Messages Area ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {!hasMessages ? (
            /* ── Empty State: Nôa Avatar with orbital particles ── */
            <div className="h-full flex flex-col items-center justify-center relative">
              {/* Central avatar container */}
              <div className="relative" style={{ width: '180px', height: '180px', animation: 'noaFloat 6s ease-in-out infinite' }}>
                {/* Orbital particles */}
                {orbitalParticles.map(p => (
                  <div
                    key={p.key}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      marginLeft: `-${p.size / 2}px`,
                      marginTop: `-${p.size / 2}px`,
                      ['--orbit-r' as any]: `${p.radius}px`,
                      ['--orb-opacity' as any]: p.color.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '0.4',
                      animation: `noaOrbit ${p.duration}s linear infinite`,
                      animationDelay: `${p.delay}s`,
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: p.color,
                        boxShadow: `0 0 8px ${p.glowColor}, 0 0 16px ${p.glowColor}`,
                      }}
                    />
                  </div>
                ))}

                {/* Glow rings */}
                <div
                  className="absolute inset-[-15px] rounded-full border border-emerald-500/10"
                  style={{ animation: 'noaGlow 4s ease-in-out infinite' }}
                />
                <div
                  className="absolute inset-[-30px] rounded-full border border-cyan-500/[0.06]"
                  style={{ animation: 'noaGlow 5s ease-in-out infinite 1s' }}
                />
                <div
                  className="absolute inset-[-50px] rounded-full border border-violet-500/[0.04]"
                  style={{ animation: 'noaGlow 6s ease-in-out infinite 2s' }}
                />

                {/* Avatar circle */}
                <div
                  className="absolute inset-0 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/40 flex items-center justify-center overflow-hidden"
                  style={{ animation: 'noaPulse 4s ease-in-out infinite' }}
                >
                  {/* Brain watermark behind avatar */}
                  <img
                    src={brainSrc}
                    alt=""
                    aria-hidden="true"
                    className="patient-brain-watermark absolute w-[250px] max-w-none opacity-[0.15] pointer-events-none select-none"
                    draggable={false}
                    loading="eager"
                  />
                  {/* Nôa letter / avatar */}
                  <span className="relative z-10 text-5xl font-light bg-gradient-to-br from-emerald-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent select-none">
                    N
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="mt-8 text-center space-y-2">
                <h2 className="text-xl font-semibold text-white tracking-tight">Nôa Esperança</h2>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                  IA Residente · Avaliação Clínica<br />
                  <span className="text-slate-600 text-xs">Envie uma mensagem para iniciar</span>
                </p>
              </div>
            </div>
          ) : (
            /* ── Messages list ── */
            <div className="py-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isDoctor ? 'justify-start' : 'justify-end'} group`}>
                  {msg.isDoctor && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/40 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                      <span className="text-[10px] font-bold text-emerald-400">{msg.avatar}</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] xl:max-w-[60%] rounded-2xl px-4 py-3 transition-all ${msg.isDoctor
                    ? 'bg-slate-800/40 backdrop-blur-sm text-slate-100 border border-slate-700/30 rounded-bl-md'
                    : 'bg-gradient-to-br from-emerald-600/90 to-emerald-700/90 text-white rounded-br-md shadow-lg shadow-emerald-900/20'
                    }`}>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`text-[10px] font-semibold ${msg.isDoctor ? 'text-emerald-400/80' : 'text-emerald-100/80'}`}>
                        {msg.user}
                      </span>
                      <span className={`text-[9px] ${msg.isDoctor ? 'text-slate-500' : 'text-emerald-200/50'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Message Input ── */}
        <div className="pb-4 pt-2">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/30 rounded-2xl px-4 py-3 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3">
              <button className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem aqui..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
              />
              <button
                onClick={startRecording}
                className={`p-1.5 transition-colors ${isRecording
                  ? 'text-red-400 bg-red-500/10 rounded-lg'
                  : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl hover:from-emerald-400 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Journey Manual ── */}
      <JourneyManualModal isOpen={showJourneyManual} onClose={() => setShowJourneyManual(false)} />

      {/* ── Modal: Minha Equipe ── */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-md mx-4 shadow-2xl shadow-black/30">
            <div className="p-6 border-b border-slate-700/40">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Minha Equipe</h2>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Selecione os profissionais para conversar em grupo</p>
            </div>

            <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
              {professionals.filter(p => linkedProfessionalIds.has(p.id) || user?.type === 'admin').map(prof => (
                <button
                  key={prof.id}
                  onClick={() => {
                    const newSet = new Set(selectedTeamMembers);
                    if (newSet.has(prof.id)) {
                      newSet.delete(prof.id);
                    } else {
                      newSet.add(prof.id);
                    }
                    setSelectedTeamMembers(newSet);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedTeamMembers.has(prof.id)
                    ? 'bg-emerald-500/10 border-2 border-emerald-500/40 text-white'
                    : 'bg-slate-800/40 border-2 border-transparent hover:bg-slate-800/60 text-slate-300'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTeamMembers.has(prof.id) ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'
                    }`}>
                    <span className="text-white font-bold">{prof.name?.[0] || 'P'}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{prof.name}</p>
                    <p className="text-xs text-slate-500">Cannabis Medicinal</p>
                  </div>
                  {selectedTeamMembers.has(prof.id) && (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-700/40 flex gap-3">
              <button
                onClick={() => setShowTeamModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  console.log('👥 Equipe selecionada:', Array.from(selectedTeamMembers));
                  setShowTeamModal(false);
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 font-medium transition-colors"
                disabled={selectedTeamMembers.size === 0}
              >
                Iniciar Conversa ({selectedTeamMembers.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Profissional ── */}
      {showAddProfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-md mx-4 shadow-2xl shadow-black/30">
            <div className="p-6 border-b border-slate-700/40">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Adicionar Profissional</h2>
                <button
                  onClick={() => setShowAddProfModal(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Escolha um profissional para adicionar à sua equipe</p>
            </div>

            <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
              {professionals.filter(p => !linkedProfessionalIds.has(p.id) && user?.type !== 'admin').length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Todos os profissionais já estão na sua equipe!</p>
                </div>
              ) : (
                professionals.filter(p => !linkedProfessionalIds.has(p.id) || user?.type === 'admin').map(prof => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      setSelectedProfessional(prof.id);
                      setLinkedProfessionalIds(new Set([...linkedProfessionalIds, prof.id]));
                      setShowAddProfModal(false);
                    }}
                    className="w-full p-3 rounded-xl flex items-center gap-3 bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <span className="text-white font-bold">{prof.name?.[0] || 'P'}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{prof.name}</p>
                      <p className="text-xs text-slate-500">Cannabis Medicinal</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Add</span>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-700/40">
              <button
                onClick={() => setShowAddProfModal(false)}
                className="w-full px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientChat
