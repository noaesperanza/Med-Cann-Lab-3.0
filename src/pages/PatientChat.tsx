import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [showProfessionalSelect, setShowProfessionalSelect] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Carregar profissionais do banco
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, type, specialty')
          .in('type', ['profissional', 'professional'])
        
        if (!error && data) {
          setProfessionals(data)
          if (data.length > 0 && !selectedProfessional) {
            setSelectedProfessional(data[0].id)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error)
      }
    }
    
    loadProfessionals()
  }, [])

  // Carregar mensagens quando profissional é selecionado
  useEffect(() => {
    if (selectedProfessional && user?.id) {
      loadMessages()
      
      // Configurar Realtime
      let channel: any = null
      generateChatIdUUID(user.id, selectedProfessional).then(chatId => {
        channel = supabase
          .channel(`chat_${user.id}_${selectedProfessional}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_id=eq.${chatId}`
          }, (payload) => {
            loadMessages() // Recarregar mensagens quando nova mensagem chegar
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

  // Função auxiliar para gerar chat_id UUID
  const generateChatIdUUID = async (user1Id: string, user2Id: string): Promise<string> => {
    const sortedIds = [user1Id, user2Id].sort()
    const chatIdString = `chat_${sortedIds.join('_')}`
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(chatIdString))
    const hashArray = Array.from(new Uint8Array(hash))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    const uuid = `${hashHex.substring(0, 8)}-${hashHex.substring(8, 12)}-${hashHex.substring(12, 16)}-${hashHex.substring(16, 20)}-${hashHex.substring(20, 32)}`
    return uuid
  }

  const loadMessages = async () => {
    if (!selectedProfessional || !user?.id) return
    
    try {
      const chatId = await generateChatIdUUID(user.id, selectedProfessional)
      
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*, sender:users!chat_messages_sender_id_fkey(id, name, email)')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (!error && messagesData) {
        const formattedMessages = messagesData.map((msg: any) => {
          const sender = msg.sender || {}
          const isDoctor = msg.sender_id === selectedProfessional
          
          return {
            id: msg.id,
            user: isDoctor ? sender.name || 'Profissional' : 'Você',
            avatar: isDoctor ? (sender.name?.[0] || 'P') : 'V',
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
      const chatId = await generateChatIdUUID(user.id, selectedProfessional)
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          message: message.trim(),
          message_type: 'text',
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      setMessage('')
      loadMessages() // Recarregar mensagens
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

  // Scroll para o topo quando muda o profissional
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

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">
            Chat com Profissional
          </h1>
          <p className="text-slate-300 text-lg mb-4">
            Converse diretamente com seu profissional de saúde
          </p>
          
          {/* Professional Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProfessionalSelect(!showProfessionalSelect)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-6 py-3 flex items-center space-x-3 hover:bg-slate-700 transition-colors mx-auto"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{currentProfessional?.name?.[0] || 'P'}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-white">{currentProfessional?.name || 'Profissional'}</p>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <p className="text-sm text-slate-400">{currentProfessional?.specialty || 'Cannabis Medicinal'}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </button>

            {/* Dropdown */}
            {showProfessionalSelect && (
              <div 
                ref={dropdownRef}
                className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  {professionals.map((professional) => (
                    <button
                      key={professional.id}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedProfessional(professional.id)
                        setShowProfessionalSelect(false)
                      }}
                      className="w-full p-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{professional.name?.[0] || 'P'}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-white">{professional.name}</p>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                        <p className="text-sm text-slate-400">{professional.specialty || 'Cannabis Medicinal'}</p>
                      </div>
                      {selectedProfessional === professional.id && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status de Espera */}
        <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-orange-200 font-medium">Tempo de Resposta: 1 hora</p>
              <p className="text-orange-300 text-sm">
                Se não obtiver resposta em 1 hora, aguarde o próximo horário disponível.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-slate-800/80 rounded-lg shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{currentProfessional?.name?.[0] || 'P'}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{currentProfessional?.name || 'Profissional'}</h2>
                  <p className="text-slate-300 text-sm">{currentProfessional?.specialty || 'Cannabis Medicinal'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={startVideoCall}
                  className="p-2 text-slate-400 hover:text-blue-500 transition-colors duration-200"
                >
                  {isVideoCall ? <Video className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                <button className="p-2 text-slate-400 hover:text-green-500 transition-colors duration-200">
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start space-x-3 ${msg.isDoctor ? 'justify-start' : 'justify-end'}`}>
                {msg.isDoctor && (
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-white">{msg.avatar}</span>
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.isDoctor 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-primary-600 text-white'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">{msg.user}</span>
                    <span className="text-xs opacity-70">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
                {!msg.isDoctor && (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-white">{msg.avatar}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-slate-700/50 px-6 py-4 border-t border-slate-600">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors duration-200">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-700 text-white placeholder-slate-400"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-yellow-500 transition-colors duration-200">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={startRecording}
                className={`p-2 transition-colors duration-200 ${
                  isRecording 
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/20' 
                    : 'text-slate-400 hover:text-red-500'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Banner de Avaliação Clínica Inicial com IA Nôa Esperança */}
        <div className="mt-8">
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-2">🤖 Avaliação Clínica Inicial pela IA Residente</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Sua consulta será precedida por uma <strong>Avaliação Clínica Inicial</strong> realizada pela <strong>IA Residente Nôa Esperança</strong>, especializada em Cannabis Medicinal e Nefrologia.
                </p>
                <div className="bg-slate-900/50 rounded p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2"><strong className="text-slate-300">Fluxo do Processo:</strong></p>
                  <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Você realizará a <strong className="text-slate-300">Avaliação Clínica Inicial</strong> com a IA Nôa Esperança</li>
                    <li>A IA gerará um <strong className="text-slate-300">Relatório da Avaliação Clínica Inicial</strong></li>
                    <li>O relatório será direcionado para seu <strong className="text-slate-300">Prontuário Eletrônico</strong></li>
                    <li>Você poderá acessar o relatório na área de <strong className="text-slate-300">Atendimento</strong> ou <strong className="text-slate-300">Chat com Profissional</strong></li>
                    <li>O profissional receberá o relatório antes da consulta presencial/online</li>
                  </ol>
                </div>
                <div className="bg-purple-900/30 border border-purple-700/50 rounded p-3">
                  <p className="text-xs text-slate-300 mb-1"><strong>🔐 Consentimento Informado & NFT Escute-se</strong></p>
                  <p className="text-xs text-slate-400">
                    Ao agendar, você concorda com o processamento de seus dados pela IA Residente e reconhece o vínculo com o <strong className="text-purple-300">NFT Escute-se</strong>, garantindo seus direitos de privacidade e propriedade dos dados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientChat
