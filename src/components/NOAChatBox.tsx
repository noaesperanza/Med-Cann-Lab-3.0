import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Trash2, Heart, Brain, Zap } from 'lucide-react'
import { useNOAChat } from '../hooks/useNOAChat'

const NOAChatBox: React.FC = () => {
  const { messages, isAnalyzing, isInitialized, sendMessage, clearChat } = useNOAChat()
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isAnalyzing) return

    const message = inputMessage.trim()
    setInputMessage('')
    await sendMessage(message)
  }

  const getAnalysisTags = (analysis: any) => {
    if (!analysis) return null

    const tags = []
    
    if (analysis.biomedical_terms?.length > 0) {
      tags.push({ icon: '🧬', label: 'Biomédico', color: 'bg-blue-500/20 text-blue-400' })
    }
    
    if (analysis.emotions === 'POSITIVE') {
      tags.push({ icon: '😊', label: 'Positivo', color: 'bg-green-500/20 text-green-400' })
    } else if (analysis.emotions === 'NEGATIVE') {
      tags.push({ icon: '😔', label: 'Preocupado', color: 'bg-red-500/20 text-red-400' })
    }
    
    if (analysis.topics?.includes('cannabis')) {
      tags.push({ icon: '🌿', label: 'Cannabis', color: 'bg-emerald-500/20 text-emerald-400' })
    }

    return tags
  }

  if (!isInitialized) {
    return (
      <div className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-slate-300">Inicializando NOA Esperanza...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">NOA Esperanza</h3>
              <p className="text-sm text-slate-300">Assistente Médica Inteligente</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Limpar conversa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700/50 text-slate-200'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                
                {/* Analysis Tags */}
                {message.analysis && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getAnalysisTags(message.analysis)?.map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${tag.color}`}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Analyzing Indicator */}
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-700/50 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-sm text-slate-300">NOA está analisando...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Fale comigo sobre sua saúde ou bem-estar..."
              disabled={isAnalyzing}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isAnalyzing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAnalyzing}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>IA Local</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Análise Semântica</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>Empática</span>
            </div>
          </div>
          <span>{messages.length} mensagens</span>
        </div>
      </div>
    </div>
  )
}

export default NOAChatBox
