import React, { useState } from 'react'
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  Settings,
  Download,
  Share2,
  Bookmark,
  Clock,
  CheckCircle,
  Star,
  Users,
  MessageCircle,
  Brain,
  Target,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  Video,
  Headphones,
  Mic,
  Camera,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'

const StudyArea: React.FC = () => {
  const [currentModule, setCurrentModule] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('00:00')
  const [duration, setDuration] = useState('45:30')

  const modules = [
    {
      id: 1,
      title: 'Arte da Entrevista Clínica',
      description: 'Fundamentos da entrevista clínica aplicada à Cannabis Medicinal',
      duration: '40 horas',
      progress: 0,
      status: 'Pendente',
      type: 'video',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI1Q0Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BRUM8L3RleHQ+PC9zdmc+',
      instructor: 'Dr. Especialista',
      lessons: [
        { title: 'Introdução à Entrevista Clínica', duration: '15 min', completed: false },
        { title: 'Técnicas de Escuta Ativa', duration: '20 min', completed: false },
        { title: 'Construção de Rapport', duration: '25 min', completed: false },
        { title: 'Identificação de Sintomas', duration: '30 min', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Farmacologia da Cannabis',
      description: 'Estudo dos componentes ativos e mecanismos de ação',
      duration: '60 horas',
      progress: 0,
      status: 'Pendente',
      type: 'interactive',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMTBCOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GQVJNPC90ZXh0Pjwvc3ZnPg==',
      instructor: 'Dr. Farmacologista',
      lessons: [
        { title: 'CBD e THC: Diferenças', duration: '18 min', completed: false },
        { title: 'Terpenos e Flavonoides', duration: '22 min', completed: false },
        { title: 'Mecanismos de Ação', duration: '28 min', completed: false },
        { title: 'Interações Medicamentosas', duration: '35 min', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Aplicação Clínica',
      description: 'Casos clínicos e protocolos terapêuticos',
      duration: '80 horas',
      progress: 0,
      status: 'Pendente',
      type: 'case-study',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjU5RTBCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DTElOPC90ZXh0Pjwvc3ZnPg==',
      instructor: 'Dr. Clínico',
      lessons: [
        { title: 'Casos de Dor Crônica', duration: '25 min', completed: false },
        { title: 'Tratamento de Epilepsia', duration: '30 min', completed: false },
        { title: 'Ansiedade e Depressão', duration: '28 min', completed: false },
        { title: 'Protocolos Personalizados', duration: '40 min', completed: false }
      ]
    }
  ]

  const studyTools = [
    {
      name: 'Anotações Inteligentes',
      icon: <FileText className="w-6 h-6" />,
      description: 'IA que organiza suas anotações automaticamente',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Quiz Adaptativo',
      icon: <Brain className="w-6 h-6" />,
      description: 'Testes que se adaptam ao seu nível de conhecimento',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Simulador Clínico',
      icon: <Users className="w-6 h-6" />,
      description: 'Pratique entrevistas com pacientes virtuais',
      color: 'from-green-500 to-teal-500'
    },
    {
      name: 'Biblioteca Interativa',
      icon: <BookOpen className="w-6 h-6" />,
      description: 'Recursos digitais com busca por IA',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Progressão Gamificada',
      icon: <Award className="w-6 h-6" />,
      description: 'Sistema de conquistas e badges',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Colaboração em Tempo Real',
      icon: <MessageCircle className="w-6 h-6" />,
      description: 'Estude com colegas e especialistas',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Área de Estudos</h1>
              <p className="text-slate-400">Pós-Graduação em Cannabis Medicinal</p>
            </div>
          </div>
          
          {/* Study Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0h</div>
              <div className="text-sm text-slate-400">Estudado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-sm text-slate-400">Módulos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-sm text-slate-400">Conquistas</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Módulos do Curso</h3>
            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    currentModule === index ? 'bg-slate-700' : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                  onClick={() => setCurrentModule(index)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                      {module.type === 'video' && <Video className="w-6 h-6 text-white" />}
                      {module.type === 'interactive' && <Brain className="w-6 h-6 text-white" />}
                      {module.type === 'case-study' && <Users className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{module.title}</h4>
                      <p className="text-xs text-slate-400">{module.duration}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{module.progress}%</div>
                      <div className="w-16 bg-slate-600 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full"
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Video Player Section */}
            <div className="bg-slate-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{modules[currentModule]?.title}</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="bg-slate-900 rounded-lg overflow-hidden mb-4">
                <div className="aspect-video bg-slate-700 relative">
                  <img 
                    src={modules[currentModule]?.thumbnail} 
                    alt={modules[currentModule]?.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      onClick={togglePlayPause}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-white text-sm">{currentTime}</span>
                      <div className="flex-1 bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{duration}</span>
                    </div>
                  </div>
                </div>

                {/* Control Bar */}
                <div className="p-4 bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button onClick={togglePlayPause} className="text-white hover:text-green-400 transition-colors">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button onClick={toggleMute} className="text-white hover:text-green-400 transition-colors">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <div className="w-20 bg-slate-600 rounded-full h-1">
                          <div 
                            className="bg-white h-1 rounded-full"
                            style={{ width: `${volume}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Descrição</h4>
                  <p className="text-slate-400 text-sm">{modules[currentModule]?.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Instrutor</h4>
                  <p className="text-slate-400 text-sm">{modules[currentModule]?.instructor}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Duração</h4>
                  <p className="text-slate-400 text-sm">{modules[currentModule]?.duration}</p>
                </div>
              </div>
            </div>

            {/* Study Tools */}
            <div className="bg-slate-800 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">Ferramentas de Estudo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyTools.map((tool, index) => (
                  <div key={index} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-650 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.color}`}>
                        {tool.icon}
                      </div>
                      <h4 className="font-semibold text-white text-sm">{tool.name}</h4>
                    </div>
                    <p className="text-slate-400 text-xs">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons List */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Aulas do Módulo</h3>
              <div className="space-y-3">
                {modules[currentModule]?.lessons.map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-650 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{lesson.title}</h4>
                        <p className="text-slate-400 text-xs">{lesson.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyArea