import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Trash2, Heart, Brain, Zap, Stethoscope, X } from 'lucide-react'

interface AssessmentMessage {
  id: string
  isUser: boolean
  text: string
  timestamp: Date
  step?: number
  stepTitle?: string
}

interface ClinicalAssessmentChatProps {
  onClose: () => void
}

const ClinicalAssessmentChat: React.FC<ClinicalAssessmentChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<AssessmentMessage[]>([
    {
      id: '1',
      isUser: false,
      text: '🌬️ Bons ventos soprem! Vamos iniciar sua avaliação clínica usando o método IMRE Triaxial - Arte da Entrevista Clínica.\n\n**Primeira pergunta:** Por favor, apresente-se e diga em que posso ajudar hoje.',
      timestamp: new Date(),
      step: 1,
      stepTitle: 'Apresentação e Rapport'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps] = useState(8)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const steps = [
    { id: 1, title: 'Apresentação e Rapport', question: 'Por favor, apresente-se e diga em que posso ajudar hoje.' },
    { id: 2, title: 'Queixa Principal', question: 'Qual é a sua queixa principal? Descreva os sintomas que mais o incomodam.' },
    { id: 3, title: 'História da Doença Atual', question: 'Há quanto tempo você está sentindo esses sintomas? Como eles começaram e evoluíram?' },
    { id: 4, title: 'Medicamentos Atuais', question: 'Quais medicamentos você está tomando atualmente? Inclua dosagens e frequência.' },
    { id: 5, title: 'Alergias e Intolerâncias', question: 'Você tem alguma alergia conhecida a medicamentos ou outras substâncias?' },
    { id: 6, title: 'História Familiar', question: 'Há alguma doença na sua família que você gostaria de mencionar?' },
    { id: 7, title: 'Hábitos de Vida', question: 'Conte-me sobre seus hábitos: alimentação, exercícios, sono, trabalho.' },
    { id: 8, title: 'Fechamento Consensual', question: 'Há mais alguma coisa que você gostaria de me contar? Alguma dúvida ou preocupação?' }
  ]

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
    setIsAnalyzing(true)

    // Adicionar mensagem do usuário
    const userMessage: AssessmentMessage = {
      id: Date.now().toString(),
      isUser: true,
      text: message,
      timestamp: new Date(),
      step: currentStep,
      stepTitle: steps[currentStep - 1]?.title
    }

    setMessages(prev => [...prev, userMessage])

    // Simular processamento
    setTimeout(() => {
      if (currentStep < totalSteps) {
        // Avançar para próxima etapa
        const nextStep = currentStep + 1
        setCurrentStep(nextStep)
        
        const nextStepData = steps[nextStep - 1]
        const aiMessage: AssessmentMessage = {
          id: (Date.now() + 1).toString(),
          isUser: false,
          text: `✅ ${steps[currentStep - 1]?.title} registrado com sucesso!\n\n---\n\n**${nextStepData.title} (${nextStep}/${totalSteps})**\n\n${nextStepData.question}\n\nContinue com sua resposta...`,
          timestamp: new Date(),
          step: nextStep,
          stepTitle: nextStepData.title
        }
        
        setMessages(prev => [...prev, aiMessage])
      } else {
        // Finalizar avaliação
        const aiMessage: AssessmentMessage = {
          id: (Date.now() + 1).toString(),
          isUser: false,
          text: `✅ **Avaliação Clínica Concluída!**\n\nObrigada por compartilhar suas informações. Com base na metodologia IMRE Triaxial, coletamos dados importantes sobre:\n\n• Apresentação e rapport\n• Queixa principal\n• História da doença atual\n• Medicamentos e alergias\n• História familiar\n• Hábitos de vida\n• Fechamento consensual\n\n**Próximos passos:**\n- Análise dos dados coletados\n- Elaboração do relatório clínico\n- Recomendações personalizadas\n\nGostaria de fazer mais alguma pergunta ou iniciar uma nova avaliação?`,
          timestamp: new Date(),
          step: totalSteps,
          stepTitle: 'Avaliação Concluída'
        }
        
        setMessages(prev => [...prev, aiMessage])
      }
      
      setIsAnalyzing(false)
    }, 1500)
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Avaliação Clínica IMRE Triaxial</h3>
                <p className="text-sm text-slate-300">Metodologia AEC - Arte da Entrevista Clínica</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Fechar avaliação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Etapa {currentStep} de {totalSteps}</span>
              <span className="text-slate-300">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentStep <= totalSteps && (
              <p className="text-sm mt-2 text-slate-300">
                {steps[currentStep - 1]?.title}
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  
                  {/* Step Info */}
                  {message.step && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-xs opacity-70">
                        Etapa {message.step}: {message.stepTitle}
                      </p>
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
                    <span className="text-sm text-slate-300">Processando resposta...</span>
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
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua resposta..."
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
                <Stethoscope className="w-3 h-3" />
                <span>IMRE Triaxial</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="w-3 h-3" />
                <span>Metodologia AEC</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>Escuta Empática</span>
              </div>
            </div>
            <span>Etapa {currentStep}/{totalSteps}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicalAssessmentChat
