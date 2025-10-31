import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Heart, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  MessageCircle, 
  Calendar,
  Clock,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Eye,
  Target,
  Award,
  Brain,
  FlaskConical,
  FileText,
  Users
} from 'lucide-react'
import { useNoa } from '../contexts/NoaContext'
import NoaAnimatedAvatar from '../components/NoaAnimatedAvatar'

const PesquisaDashboard: React.FC = () => {
  const { isOpen, toggleChat, messages, isTyping, isListening, isSpeaking, sendMessage } = useNoa()
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const researchData = [
    {
      id: 1,
      title: 'Eficácia do CBD na Insuficiência Renal',
      description: 'Estudo longitudinal sobre os efeitos do CBD em pacientes com IRC',
      status: 'Em Andamento',
      progress: 65,
      participants: 24,
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Qualidade de Vida e Cannabis Medicinal',
      description: 'Avaliação do impacto na qualidade de vida de pacientes em tratamento',
      status: 'Análise',
      progress: 85,
      participants: 48,
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 3,
      title: 'Arte da Entrevista Clínica - Validação',
      description: 'Validação da metodologia AEC em diferentes contextos clínicos',
      status: 'Concluído',
      progress: 100,
      participants: 120,
      startDate: '2023-09-01',
      endDate: '2024-08-31',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'text-blue-400'
      case 'Análise': return 'text-yellow-400'
      case 'Concluído': return 'text-green-400'
      case 'Pendente': return 'text-slate-400'
      default: return 'text-slate-400'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">🔬 Dashboard Pesquisa</h1>
              <p className="text-slate-400">Área de Pesquisa - Estudos e Análises Clínicas</p>
            </div>
          </div>
          
          {/* Patient Profile */}
          <div className="flex items-center space-x-3 bg-slate-700 p-3 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">❤️ Paciente</p>
              <p className="text-sm text-slate-400">Participante de Pesquisa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 text-white">
                <BarChart3 className="w-5 h-5" />
                <span>🔬 Dashboard Pesquisa</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <Users className="w-5 h-5" />
                <span>👥 Meus Pacientes</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
                <span>📊 Avaliações</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>💬 Fórum de Conselheiros em IA na Saúde</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
                <span>📈 Relatórios</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-500 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo à Área de Pesquisa!</h2>
              <p className="text-white/90 mb-4">
                Acompanhe seus estudos e pesquisas clínicas. Sua participação é fundamental para o avanço
                da Cannabis Medicinal e da Arte da Entrevista Clínica.
              </p>
              <button className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Ver Meus Estudos
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-500/10 rounded-lg">
                    <FlaskConical className="w-6 h-6 text-pink-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">3</h3>
                <p className="text-sm text-slate-400">Estudos Ativos</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">83%</h3>
                <p className="text-sm text-slate-400">Progresso Médio</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">192</h3>
                <p className="text-sm text-slate-400">Participantes</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Award className="w-6 h-6 text-purple-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">1</h3>
                <p className="text-sm text-slate-400">Publicações</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Research Studies */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">🔬 Meus Estudos</h3>
                    <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors">
                      Ver Todos
                    </button>
                  </div>

                  <div className="space-y-6">
                    {researchData.map((study) => (
                      <div key={study.id} className="bg-slate-700 rounded-lg p-6 hover:bg-slate-650 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-white">{study.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                                {study.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{study.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                              <span>Participantes: {study.participants}</span>
                              <span>Início: {study.startDate}</span>
                              <span>Fim: {study.endDate}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400">Progresso</span>
                            <span className="text-white font-medium">{study.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(study.progress)}`}
                              style={{ width: `${study.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Publications */}
                <div className="bg-slate-800 rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-semibold text-white mb-6">📚 Publicações Recentes</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Validação da Arte da Entrevista Clínica</p>
                          <p className="text-sm text-slate-400">Publicado em: Revista Brasileira de Cannabis Medicinal</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Section */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800 rounded-xl p-6 h-full">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Nôa Esperança</h3>
                    <p className="text-sm text-slate-400">IA Residente • Suporte em Pesquisa</p>
                  </div>

                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <NoaAnimatedAvatar
                      isSpeaking={isSpeaking}
                      isListening={isListening}
                      size="md"
                      showStatus={true}
                    />
                  </div>

                  {/* Welcome Message */}
                  <div className="bg-slate-700 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-300 mb-2">
                      🔬 Olá! Sou a Nôa Esperança, sua assistente de pesquisa especializada.
                    </p>
                    <p className="text-xs text-slate-400 mb-2">Posso ajudar com:</p>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Análise de dados de pesquisa</li>
                      <li>• Metodologia científica</li>
                      <li>• Interpretação de resultados</li>
                    </ul>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3 mb-6">
                    <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors">
                      Analisar Dados de Pesquisa
                    </button>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors">
                      Metodologia Científica
                    </button>
                  </div>

                  {/* Chat Input */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    
                    <p className="text-xs text-slate-500 text-center">
                      Nôa utiliza AEC para suporte em pesquisa • LGPD Compliant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl w-96 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Nôa Esperança</h3>
                    <p className="text-xs text-slate-400">Suporte em Pesquisa</p>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-pink-400" />
                  <p className="text-sm">Olá! Sou a Nôa Esperança, sua assistente de pesquisa.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PesquisaDashboard
