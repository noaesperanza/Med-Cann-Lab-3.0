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
  ChevronDown
} from 'lucide-react'
import { PROFESSIONALS_ARRAY } from '../constants/professionals'

const PatientChat: React.FC = () => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState('ricardo-valenca')
  const [showProfessionalSelect, setShowProfessionalSelect] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentProfessional = PROFESSIONALS_ARRAY.find(p => p.id === selectedProfessional) || PROFESSIONALS_ARRAY[0]

  const getMessagesForProfessional = (professionalId: string) => {
    const professional = PROFESSIONALS_ARRAY.find(p => p.id === professionalId)
    return [
      {
        id: 1,
        user: professional?.name || 'Profissional',
        avatar: professional?.avatar || 'P',
        message: 'Olá! Como você está se sentindo hoje?',
        timestamp: '10:30',
        isDoctor: true,
        reactions: { heart: 0, thumbs: 0 }
      },
      {
        id: 2,
        user: 'Você',
        avatar: 'V',
        message: 'Olá! Estou me sentindo melhor, mas ainda tenho algumas dores.',
        timestamp: '10:32',
        isDoctor: false,
        reactions: { heart: 0, thumbs: 0 }
      },
      {
        id: 3,
        user: professional?.name || 'Profissional',
        avatar: professional?.avatar || 'P',
        message: 'Entendo. Vamos agendar uma consulta para avaliar melhor. Que tal amanhã às 14h?',
        timestamp: '10:35',
        isDoctor: true,
        reactions: { heart: 0, thumbs: 0 }
      }
    ]
  }

  const messages = getMessagesForProfessional(selectedProfessional)

  const handleSendMessage = () => {
    if (message.trim()) {
      // Lógica para enviar mensagem
      setMessage('')
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
      if (showProfessionalSelect) {
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
                <span className="text-white font-bold">{currentProfessional?.avatar}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-white">{currentProfessional?.name}</p>
                  {currentProfessional?.online && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-slate-400">{currentProfessional?.specialty}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </button>

            {/* Dropdown */}
            {showProfessionalSelect && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                <div className="p-2">
                  {PROFESSIONALS_ARRAY.map((professional) => (
                    <button
                      key={professional.id}
                      onClick={() => {
                        setSelectedProfessional(professional.id)
                        setShowProfessionalSelect(false)
                      }}
                      className="w-full p-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{professional.avatar}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-white">{professional.name}</p>
                          {professional.online && (
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{professional.specialty}</p>
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
                  <span className="text-sm font-medium text-white">{currentProfessional?.avatar}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{currentProfessional?.name}</h2>
                  <p className="text-slate-300 text-sm">{currentProfessional?.specialty}</p>
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

        {/* Informações Importantes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 rounded-lg p-6 text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">Horário de Atendimento</h3>
            <p className="text-slate-300 text-sm">Seg-Sex: 8h às 18h</p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">Emergência</h3>
            <p className="text-slate-300 text-sm">Use o chat de emergência</p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">Próxima Consulta</h3>
            <p className="text-slate-300 text-sm">15/01/2024 - 14:00</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientChat
