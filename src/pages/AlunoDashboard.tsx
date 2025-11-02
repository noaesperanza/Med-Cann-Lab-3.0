import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  Brain, 
  MessageCircle, 
  Calendar,
  TrendingUp,
  Clock,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  Share2,
  Target,
  Award,
  BarChart3,
  Activity
} from 'lucide-react'
import { useNoa } from '../contexts/NoaContext'
import NoaAnimatedAvatar from '../components/NoaAnimatedAvatar'

const AlunoDashboard: React.FC = () => {
  const navigate = useNavigate()
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

  // Curso principal: Pós-Graduação em Cannabis Medicinal
  const mainCourse = {
    id: 1,
    title: 'Pós-Graduação em Cannabis Medicinal',
    description: 'Especialização completa em Cannabis Medicinal e Terapêutica com metodologia Arte da Entrevista Clínica',
    progress: 0,
    status: 'Pendente',
    instructor: 'A definir',
    duration: '360 horas',
    nextClass: null,
    color: 'from-green-500 to-teal-500',
    modules: [
      {
        id: 'aec',
        title: 'Arte da Entrevista Clínica',
        description: 'Fundamentos da entrevista clínica aplicada à Cannabis Medicinal',
        progress: 0,
        status: 'Pendente',
        duration: '40 horas',
        nextClass: null
      },
      {
        id: 'imre',
        title: 'Sistema IMRE Triaxial',
        description: 'Metodologia de avaliação clínica integrada',
        progress: 0,
        status: 'Pendente',
        duration: '20 horas',
        nextClass: null
      },
      {
        id: 'farmacologia',
        title: 'Farmacologia da Cannabis',
        description: 'Estudo dos componentes ativos e mecanismos de ação',
        progress: 0,
        status: 'Pendente',
        duration: '60 horas',
        nextClass: null
      },
      {
        id: 'clinica',
        title: 'Aplicação Clínica',
        description: 'Casos clínicos e protocolos terapêuticos',
        progress: 0,
        status: 'Pendente',
        duration: '80 horas',
        nextClass: null
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'text-blue-400'
      case 'Concluído': return 'text-green-400'
      case 'Pendente': return 'text-yellow-400'
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
              <h1 className="text-2xl font-bold text-white">Dashboard do Aluno</h1>
              <p className="text-slate-400">Área de Ensino - Pós-Graduação Cannabis Medicinal</p>
            </div>
          </div>
          
          {/* Student Profile */}
          <div className="flex items-center space-x-3 bg-slate-700 p-3 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">Aluno</p>
              <p className="text-sm text-slate-400">Pós-Graduação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <button 
                onClick={() => navigate('/library')}
                className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors w-full text-left"
              >
                <BookOpen className="w-5 h-5" />
                <span>Biblioteca</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Pós Graduação em Cannabis Medicinal Med Cann Lab</h2>
              <p className="text-white/90 mb-4">
                Continue sua jornada de aprendizado na Pós-Graduação em Cannabis Medicinal.
                Acesse seus módulos, acompanhe seu progresso e interaja com a Nôa Esperança.
              </p>
              <button 
                onClick={() => {
                  console.log('Botão clicado, navegando para /app/study-area')
                  navigate('/app/study-area')
                }}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Continuar Aprendizado
              </button>
            </div>

            {/* Video Player Section */}
            <div className="bg-slate-800 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Aulas em Vídeo</h3>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="aspect-video bg-slate-700 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/AGC3ZtGSPlY?si=V6fSuQYLxJRBvD-u&autoplay=0&rel=0&modestbranding=1"
                    title="Aulas de Cannabis Medicinal"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Pós-Graduação em Cannabis Medicinal</h4>
                  <p className="text-slate-400 text-sm mb-3">
                    Acesse nossa playlist completa de aulas sobre Cannabis Medicinal e Arte da Entrevista Clínica.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>📚 Playlist Completa</span>
                    <span>🎓 Certificação Inclusa</span>
                    <span>📱 Acesso Mobile</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Courses Section */}
              <div>
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Meu Curso Principal</h3>
                    <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-colors">
                      Ver Detalhes
                    </button>
                  </div>

                  {/* Curso Principal */}
                  <div className="bg-slate-700 rounded-lg p-6 mb-6 hover:bg-slate-650 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{mainCourse.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mainCourse.status)}`}>
                            {mainCourse.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{mainCourse.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                          <span>Instrutor: {mainCourse.instructor}</span>
                          <span>Duração: {mainCourse.duration}</span>
                          <span>Próxima aula: {mainCourse.nextClass}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                          <Play className="w-4 h-4" />
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
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">Progresso Geral</span>
                        <span className="text-white font-medium">{mainCourse.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(mainCourse.progress)}`}
                          style={{ width: `${mainCourse.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Módulos do Curso */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Módulos do Curso</h4>
                    {mainCourse.modules.map((module) => (
                      <div key={module.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-650 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h5 className="text-md font-semibold text-white">{module.title}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                                {module.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{module.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Duração: {module.duration}</span>
                              {module.nextClass && <span>Próxima aula: {module.nextClass}</span>}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400">Progresso</span>
                            <span className="text-white font-medium">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(module.progress)}`}
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Classes */}
                <div className="bg-slate-800 rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Próximas Aulas</h3>
                  
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-slate-400">Nenhuma aula agendada no momento</p>
                    <p className="text-sm text-slate-500 mt-2">As próximas aulas serão anunciadas em breve</p>
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
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Nôa Esperança</h3>
                    <p className="text-xs text-slate-400">Tutora Acadêmica</p>
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
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="text-sm">Olá! Sou a Nôa Esperança, sua tutora acadêmica.</p>
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
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
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
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AlunoDashboard
