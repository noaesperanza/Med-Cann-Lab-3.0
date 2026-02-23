import React, { useState, useRef, useEffect } from 'react'
import { useNoa } from '../contexts/NoaContext'
import { MessageCircle, X, Mic, MicOff, Volume2, VolumeX, Send } from 'lucide-react'

const NoaAvatar: React.FC = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Função para rolar para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Efeito para rolar automaticamente quando há novas mensagens ou quando está digitando
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      sendMessage(inputMessage)
      setInputMessage('')
      // Scroll será feito automaticamente pelo useEffect
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
    <>
      {/* Floating Avatar Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
        >
          <MessageCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            !
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-100/50 dark:bg-slate-800/80 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">N</span>
              </div>
              <div>
                <h3 className="font-semibold">Nôa Esperanza</h3>
                <p className="text-xs opacity-90">Assistente</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👋</span>
                </div>
                <p className="text-sm">Olá! Sou a Nôa, sua assistente em cannabis medicinal.</p>
                <p className="text-xs mt-1">Como posso ajudá-lo hoje?</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Referência para scroll automático */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-100/50 dark:bg-slate-800/80 text-gray-900 dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default NoaAvatar
