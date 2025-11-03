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
  Activity,
  FlaskConical,
  Users,
  FileText
} from 'lucide-react'
import { useNoa } from '../contexts/NoaContext'
import NoaAnimatedAvatar from '../components/NoaAnimatedAvatar'

const EnsinoDashboard: React.FC = () => {
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

  // Navigation handlers
  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleContinueLearning = () => {
    // Navigate to the main course
    navigate('/curso-eduardo-faveret')
  }

  const handleOpenModule = (moduleId: number) => {
    setSelectedModule(moduleId)
  }

  const handleOpenLesson = (lessonId: number) => {
    setSelectedLesson(lessonId)
  }

  const handleJoinClass = (courseTitle: string) => {
    if (courseTitle.includes('Cannabis Medicinal') || courseTitle.includes('Pós-Graduação')) {
      navigate('/curso-eduardo-faveret')
    } else if (courseTitle.includes('Arte da Entrevista') || courseTitle.includes('Entrevista Clínica') || courseTitle.includes('AEC')) {
      navigate('/app/arte-entrevista-clinica')
    } else if (courseTitle.includes('IMRE')) {
      navigate('/app/arte-entrevista-clinica')
    } else {
      navigate('/curso-eduardo-faveret')
    }
  }

  const courseModules = [
    {
      id: 1,
      title: 'Introdução à Cannabis Medicinal',
      duration: '8h',
      description: 'Fundamentos históricos, legais e científicos da cannabis medicinal',
      lessons: 4,
      completed: 4,
      color: 'from-green-500 to-emerald-600',
      status: 'Concluído'
    },
    {
      id: 2,
      title: 'Farmacologia e Biologia da Cannabis',
      duration: '12h',
      description: 'Mecanismos de ação, receptores e sistemas endocanabinoides',
      lessons: 6,
      completed: 2,
      color: 'from-blue-500 to-cyan-500',
      status: 'Em Andamento'
    },
    {
      id: 3,
      title: 'Aspectos Legais e Éticos',
      duration: '6h',
      description: 'Regulamentação, prescrição e aspectos éticos do uso medicinal',
      lessons: 3,
      completed: 0,
      color: 'from-purple-500 to-pink-500',
      status: 'Pendente'
    },
    {
      id: 4,
      title: 'Aplicações Clínicas e Protocolos',
      duration: '15h',
      description: 'Indicações clínicas, protocolos de tratamento e monitoramento',
      lessons: 8,
      completed: 0,
      color: 'from-orange-500 to-red-500',
      status: 'Pendente'
    },
    {
      id: 5,
      title: 'Avaliação e Monitoramento de Pacientes',
      duration: '8h',
      description: 'Ferramentas de avaliação, acompanhamento e ajuste de protocolos',
      lessons: 4,
      completed: 0,
      color: 'from-teal-500 to-green-500',
      status: 'Pendente'
    },
    {
      id: 6,
      title: 'Estudos de Caso e Práticas Clínicas',
      duration: '10h',
      description: 'Análise de casos reais e simulações práticas',
      lessons: 5,
      completed: 0,
      color: 'from-indigo-500 to-purple-500',
      status: 'Pendente'
    },
    {
      id: 7,
      title: 'Pesquisa Científica e Produção de Artigos',
      duration: '6h',
      description: 'Metodologia de pesquisa e publicação científica',
      lessons: 3,
      completed: 0,
      color: 'from-pink-500 to-rose-500',
      status: 'Pendente'
    },
    {
      id: 8,
      title: 'Avaliação Final e Certificação',
      duration: '5h',
      description: 'Prova final e obtenção do certificado',
      lessons: 2,
      completed: 0,
      color: 'from-yellow-500 to-orange-500',
      status: 'Pendente'
    }
  ]

  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'text-blue-400'
      case 'Concluído': return 'text-green-400'
      case 'Pendente': return 'text-yellow-400'
      case 'Aguardando Inscrição': return 'text-purple-400'
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
                         <button 
               onClick={() => handleNavigate('/app/dashboard')}
               className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
             >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">🎓 Gestão de Ensino</h1>
              <p className="text-slate-400">Gerenciamento de cursos, alunos e materiais educacionais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Horizontal */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <nav className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => handleNavigate('/app/ensino/profissional/gestao-alunos')} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors">
            <Users className="w-5 h-5" />
            <span>👥 Gestão de Alunos</span>
          </button>
          <button onClick={() => handleNavigate('/app/ensino/profissional/preparacao-aulas')} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
            <span>📝 Ferramentas Pedagógicas</span>
          </button>
          <button onClick={() => handleNavigate('/app/library')} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
            <span>📚 Biblioteca Médica</span>
          </button>
          <button onClick={() => handleNavigate('/app/ensino-dashboard')} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <Calendar className="w-5 h-5" />
            <span>📅 Calendário do Curso</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cursos Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Curso Pós-Graduação Cannabis Medicinal */}
            <div 
              onClick={() => handleJoinClass('Pós-Graduação Cannabis Medicinal')}
              className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">🌿 Pós-Graduação Cannabis Medicinal</h3>
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/90 mb-4">
                Curso completo de cannabis medicinal com metodologia prática e casos clínicos reais. 
                Desenvolvido pelo Dr. Eduardo Faveret, especialista em medicina integrativa.
              </p>
              <div className="flex items-center space-x-4 text-sm text-white/80 mb-4">
                <span>Dr. Eduardo Faveret</span>
                <span>•</span>
                <span>360 horas</span>
                <span>•</span>
                <span>1247 alunos</span>
                <span>•</span>
                <span>⭐ 4.9</span>
              </div>
              <button className="w-full bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Acessar Curso
              </button>
            </div>

            {/* Curso Arte da Entrevista Clínica */}
            <div 
              onClick={() => handleJoinClass('Arte da Entrevista Clínica')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">🎭 Arte da Entrevista Clínica</h3>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/90 mb-4">
                Metodologia completa de entrevista clínica aplicada à Cannabis Medicinal. 
                Desenvolva habilidades de comunicação e avaliação clínica.
              </p>
              <div className="flex items-center space-x-4 text-sm text-white/80 mb-4">
                <span>Dr. Ricardo Valença</span>
                <span>•</span>
                <span>40 horas</span>
                <span>•</span>
                <span>⭐ 5.0</span>
              </div>
              <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Acessar Curso
              </button>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Informações sobre os Cursos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">🌿 Pós-Graduação Cannabis Medicinal</h4>
                <p className="text-slate-300 text-sm mb-2">
                  Programa completo de especialização em Cannabis Medicinal com metodologia prática 
                  e casos clínicos reais desenvolvidos pelo Dr. Eduardo Faveret.
                </p>
                <p className="text-slate-400 text-xs">Inclui: Certificação, casos práticos, comunidade de alunos</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">🎭 Arte da Entrevista Clínica</h4>
                <p className="text-slate-300 text-sm mb-2">
                  Metodologia desenvolvida pelo Dr. Ricardo Valença para entrevistas clínicas eficazes, 
                  com foco em comunicação empática e avaliação completa do paciente.
                </p>
                <p className="text-slate-400 text-xs">Inclui: Módulos práticos, casos clínicos, certificação</p>
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

export default EnsinoDashboard
