import React, { useState, useEffect } from 'react'
import { useNoa } from '../contexts/NoaContext'
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Heart,
  Brain,
  Users,
  Zap as SparklesIcon,
  Bot
} from 'lucide-react'
import ClinicalAssessmentChat from './ClinicalAssessmentChat'

interface NoaEsperancaAvatarProps {
  className?: string
}

const NoaEsperancaAvatar: React.FC<NoaEsperancaAvatarProps> = ({ className = '' }) => {
  const { 
    messages,
    isOpen,
    isTyping,
    isListening,
    isSpeaking,
    sendMessage,
    toggleChat,
    startListening,
    stopListening,
    clearMessages
  } = useNoa()
  
  const [inputMessage, setInputMessage] = useState('')
  const [showPersonality, setShowPersonality] = useState(false)
  const [showAssessmentChat, setShowAssessmentChat] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      await sendMessage(inputMessage)
      setInputMessage('')
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Avatar Principal */}
      <div className="relative">
        {/* Botão do Avatar */}
        <button
          onClick={toggleChat}
          className={`
            w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
            shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300
            flex items-center justify-center text-white relative overflow-hidden
            ${isSpeaking ? 'animate-pulse' : ''}
            ${isTyping ? 'animate-bounce' : ''}
          `}
        >
          <Bot className="w-8 h-8" />
          
          {/* Indicador de atividade */}
          {isTyping && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
          )}
          
          {isSpeaking && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse" />
          )}
        </button>

        {/* Nome do Avatar */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
          Nôa Esperança
        </div>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header do Chat */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Nôa Esperança</h3>
                  <p className="text-sm opacity-90">
                    IA Residente - Cannabis Medicinal
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPersonality(!showPersonality)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <SparklesIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Personalidade da Nôa */}
            {showPersonality && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg">
                <div className="text-xs mb-2 font-medium">IA Residente - Capacidades:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Análise Emocional</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Brain className="w-3 h-3" />
                    <span>Diagnóstico IA</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Suporte Médico</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SparklesIcon className="w-3 h-3" />
                    <span>Memória Persistente</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                <p className="text-sm">Olá! Sou a Nôa Esperança.</p>
                <p className="text-xs text-gray-400 mt-1">
                  IA Residente especializada em Cannabis Medicinal
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center justify-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Análise Emocional</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Brain className="w-3 h-3" />
                    <span>Diagnóstico IA</span>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-xs">
                    <div
                      className={`
                        px-4 py-2 rounded-lg text-sm
                        ${message.type === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      {message.content}
                    </div>
                    
                    {/* Mostrar informações da IA Residente */}
                    {message.type === 'noa' && message.aiResponse && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>Confiança: {Math.round((message.confidence || 0) * 100)}%</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full" title="Análise Emocional" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full" title="Diagnóstico IA" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full" title="Memória Persistente" />
                          </div>
                        </div>
                        
                        {/* Sugestões da IA */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <div className="font-medium text-blue-700 mb-1">Sugestões:</div>
                            {message.suggestions.map((suggestion, index) => (
                              <div key={index} className="text-blue-600">• {suggestion}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </form>
            
            {/* Ações adicionais */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <button
                onClick={clearMessages}
                className="hover:text-gray-700 transition-colors"
              >
                Limpar conversa
              </button>
              
              <div className="flex items-center space-x-2">
                <span>IA Residente</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" title="Análise Emocional" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full" title="Diagnóstico IA" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full" title="Memória Persistente" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat de Avaliação Clínica */}
      {showAssessmentChat && (
        <ClinicalAssessmentChat onClose={() => setShowAssessmentChat(false)} />
      )}
    </div>
  )
}

export default NoaEsperancaAvatar
