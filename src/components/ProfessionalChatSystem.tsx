import React, { useState, useEffect } from 'react'
import { Send, Users, Search, Lock, MessageCircle, Building2, Phone, Mail, Calendar, Video, Mic, FileText, User, GraduationCap, Heart, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChatSystem } from '../hooks/useChatSystem'

interface ProfessionalChatSystemProps {
  className?: string
}

const ProfessionalChatSystem: React.FC<ProfessionalChatSystemProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const {
    messages,
    consultorios,
    selectedConsultorio,
    setSelectedConsultorio,
    isOnline,
    isLoading,
    sendMessage,
    getMessagesForConsultorio,
    getUnreadCount,
    markAsRead
  } = useChatSystem()

  const [inputMessage, setInputMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatType, setChatType] = useState<'professional-professional' | 'professional-student' | 'professional-patient'>('professional-professional')
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [isAudioCallActive, setIsAudioCallActive] = useState(false)

  // Filtrar consultórios por tipo de chat
  const filteredConsultorios = consultorios.filter(consultorio => {
    switch (chatType) {
      case 'professional-professional':
        return consultorio.type === 'professional'
      case 'professional-student':
        return consultorio.type === 'student'
      case 'professional-patient':
        return consultorio.type === 'patient'
      default:
        return true
    }
  })

  // Filtrar consultórios por busca
  const searchedConsultorios = filteredConsultorios.filter(consultorio =>
    consultorio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultorio.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultorio.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (inputMessage.trim() && selectedConsultorio && user) {
      sendMessage(
        inputMessage.trim(),
        user.id || 'current-user',
        user.name || 'Usuário',
        user.email || '',
        selectedConsultorio.id
      )
      setInputMessage('')
      
      // Marcar mensagens como lidas
      markAsRead(selectedConsultorio.id, user.id || 'current-user')
      
      // Simular resposta automática se estiver offline
      if (!isOnline && selectedConsultorio.id === 'consultorio-eduardo') {
        setTimeout(() => {
          sendMessage(
            'Mensagem recebida! Responderei assim que estiver online.',
            selectedConsultorio.id,
            selectedConsultorio.doctor,
            selectedConsultorio.email,
            user.id || 'current-user'
          )
        }, 2000)
      }
    }
  }

  const handleVideoCall = () => {
    setIsVideoCallActive(true)
    // Aqui você pode implementar a lógica de chamada de vídeo
  }

  const handleAudioCall = () => {
    setIsAudioCallActive(true)
    // Aqui você pode implementar a lógica de chamada de áudio
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedConsultorio && user) {
      sendMessage(
        `Arquivo enviado: ${file.name}`,
        user.id || 'current-user',
        user.name || 'Usuário',
        user.email || '',
        selectedConsultorio.id
      )
    }
  }


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-slate-800/80 rounded-lg p-6 border border-slate-700 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando sistema de chat...</p>
        </div>
      </div>
    )
  }


  return (
    <div className={`bg-slate-800/80 rounded-lg border border-slate-700 ${className}`}>
      {/* Header com Status Online/Offline */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-400" />
              Chat Profissionais
            </h2>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isOnline 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          {/* Filtros de Tipo */}
          <div className="flex space-x-2">
            <button
              onClick={() => setChatType('professional-professional')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                chatType === 'professional-professional'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Profissionais
            </button>
            <button
              onClick={() => setChatType('professional-student')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                chatType === 'professional-student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Estudantes
            </button>
            <button
              onClick={() => setChatType('professional-patient')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                chatType === 'professional-patient'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Pacientes
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* Lista de Consultórios */}
        <div className="w-1/3 border-r border-slate-700">
          {/* Busca */}
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar consultórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto h-full">
            {searchedConsultorios.map((consultorio) => {
              const unreadCount = getUnreadCount(consultorio.id)
              const isSelected = selectedConsultorio?.id === consultorio.id
              
              return (
                <div
                  key={consultorio.id}
                  onClick={() => setSelectedConsultorio(consultorio)}
                  className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        consultorio.status === 'online' ? 'bg-green-400' : 
                        consultorio.status === 'busy' ? 'bg-orange-400' : 'bg-gray-400'
                      }`}></div>
                      <h3 className="font-semibold">{consultorio.doctor}</h3>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-75">{consultorio.name}</p>
                  <p className="text-xs opacity-60">{consultorio.specialty}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {consultorio.lastSeen ? formatTime(consultorio.lastSeen) : 'Nunca'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col">
          {selectedConsultorio ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedConsultorio.status === 'online' ? 'bg-green-400' : 
                      selectedConsultorio.status === 'busy' ? 'bg-orange-400' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedConsultorio.doctor}</h3>
                      <p className="text-sm text-slate-400">{selectedConsultorio.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleVideoCall}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAudioCall}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getMessagesForConsultorio(selectedConsultorio.id).map((message) => {
                  const isOwnMessage = message.senderId === (user?.id || 'current-user')
                  const isLocalMessage = message.isLocal
                  
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-700 text-white'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold">{message.senderName}</span>
                          {isLocalMessage && (
                            <span className="text-xs bg-orange-500 px-1 py-0.5 rounded">
                              Local
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-slate-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isOnline ? "Digite sua mensagem..." : "Modo offline - mensagem será enviada quando online"}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isOnline && !selectedConsultorio}
                  />
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                  </label>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || (!isOnline && !selectedConsultorio)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                
                {/* Status do Sistema */}
                <div className="mt-2 text-xs text-slate-400">
                  {isOnline ? (
                    <span className="flex items-center">
                      <Wifi className="w-3 h-3 mr-1" />
                      Conectado - Mensagens sincronizadas
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Modo offline - Mensagens salvas localmente
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Selecione um Consultório</h3>
                <p className="text-slate-400">
                  Escolha um consultório da lista para iniciar uma conversa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfessionalChatSystem