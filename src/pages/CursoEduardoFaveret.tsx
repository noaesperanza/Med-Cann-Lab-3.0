import React, { useState } from 'react'
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Star,
  Users,
  Award,
  FileText,
  Video,
  MessageCircle,
  User
} from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  duration: string
  lessonCount: number
  isCompleted: boolean
  progress: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'reading' | 'quiz' | 'assignment'
  duration: string
  isCompleted: boolean
  isLocked: boolean
  points: number
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date
  points: number
  isSubmitted: boolean
  grade?: number
  feedback?: string
}

const CursoEduardoFaveret: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [showAssignments, setShowAssignments] = useState(false)

  const courseInfo = {
    title: 'Curso Eduardo Faveret - Cannabis Medicinal',
    instructor: 'Dr. Eduardo Faveret',
    duration: '2 meses / 60 horas',
    students: 1247,
    rating: 4.9,
    level: 'Avançado',
    language: 'Português',
    certificate: true,
    price: 'R$ 1.999',
    originalPrice: 'R$ 2.999'
  }

  const modules: Module[] = [
    {
      id: '1',
      title: 'Introdução à Cannabis Medicinal',
      description: 'Fundamentos históricos, legais e científicos da cannabis medicinal',
      duration: '8h',
      lessonCount: 4,
      isCompleted: true,
      progress: 100,
      lessons: [
        {
          id: '1-1',
          title: 'História da Cannabis Medicinal',
          type: 'video',
          duration: '45min',
          isCompleted: true,
          isLocked: false,
          points: 50
        },
        {
          id: '1-2',
          title: 'Aspectos Legais e Regulamentação',
          type: 'video',
          duration: '60min',
          isCompleted: true,
          isLocked: false,
          points: 50
        },
        {
          id: '1-3',
          title: 'Farmacologia Básica dos Canabinoides',
          type: 'reading',
          duration: '30min',
          isCompleted: true,
          isLocked: false,
          points: 30
        },
        {
          id: '1-4',
          title: 'Quiz: Fundamentos',
          type: 'quiz',
          duration: '15min',
          isCompleted: true,
          isLocked: false,
          points: 40
        }
      ]
    },
    {
      id: '2',
      title: 'Farmacologia e Biologia da Cannabis',
      description: 'Mecanismos de ação, receptores e sistemas endocanabinoides',
      duration: '12h',
      lessonCount: 6,
      isCompleted: false,
      progress: 60,
      lessons: [
        {
          id: '2-1',
          title: 'Sistema Endocanabinoide',
          type: 'video',
          duration: '90min',
          isCompleted: true,
          isLocked: false,
          points: 75
        },
        {
          id: '2-2',
          title: 'Receptores CB1 e CB2',
          type: 'video',
          duration: '75min',
          isCompleted: true,
          isLocked: false,
          points: 75
        },
        {
          id: '2-3',
          title: 'CBD vs THC: Diferenças e Sinergias',
          type: 'video',
          duration: '60min',
          isCompleted: false,
          isLocked: false,
          points: 60
        },
        {
          id: '2-4',
          title: 'Outros Canabinoides Importantes',
          type: 'reading',
          duration: '45min',
          isCompleted: false,
          isLocked: false,
          points: 40
        },
        {
          id: '2-5',
          title: 'Interações Medicamentosas',
          type: 'video',
          duration: '50min',
          isCompleted: false,
          isLocked: false,
          points: 50
        },
        {
          id: '2-6',
          title: 'Quiz: Farmacologia',
          type: 'quiz',
          duration: '20min',
          isCompleted: false,
          isLocked: false,
          points: 50
        }
      ]
    },
    {
      id: '3',
      title: 'Aspectos Legais e Éticos',
      description: 'Regulamentação, prescrição e aspectos éticos do uso medicinal',
      duration: '6h',
      lessonCount: 3,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '3-1',
          title: 'Regulamentação no Brasil',
          type: 'video',
          duration: '60min',
          isCompleted: false,
          isLocked: true,
          points: 60
        },
        {
          id: '3-2',
          title: 'Processo de Prescrição',
          type: 'video',
          duration: '45min',
          isCompleted: false,
          isLocked: true,
          points: 45
        },
        {
          id: '3-3',
          title: 'Aspectos Éticos e Deontológicos',
          type: 'reading',
          duration: '30min',
          isCompleted: false,
          isLocked: true,
          points: 30
        }
      ]
    },
    {
      id: '4',
      title: 'Aplicações Clínicas e Protocolos',
      description: 'Indicações clínicas, protocolos de tratamento e monitoramento',
      duration: '15h',
      lessonCount: 8,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '4-1',
          title: 'Dor Crônica e Neuropática',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: true,
          points: 90
        },
        {
          id: '4-2',
          title: 'Epilepsia e Convulsões',
          type: 'video',
          duration: '75min',
          isCompleted: false,
          isLocked: true,
          points: 75
        },
        {
          id: '4-3',
          title: 'Ansiedade e Depressão',
          type: 'video',
          duration: '60min',
          isCompleted: false,
          isLocked: true,
          points: 60
        },
        {
          id: '4-4',
          title: 'Náusea e Vômitos',
          type: 'video',
          duration: '45min',
          isCompleted: false,
          isLocked: true,
          points: 45
        },
        {
          id: '4-5',
          title: 'Protocolos de Dosagem',
          type: 'reading',
          duration: '60min',
          isCompleted: false,
          isLocked: true,
          points: 60
        },
        {
          id: '4-6',
          title: 'Monitoramento de Pacientes',
          type: 'video',
          duration: '50min',
          isCompleted: false,
          isLocked: true,
          points: 50
        },
        {
          id: '4-7',
          title: 'Casos Clínicos Práticos',
          type: 'assignment',
          duration: '120min',
          isCompleted: false,
          isLocked: true,
          points: 100
        },
        {
          id: '4-8',
          title: 'Quiz: Aplicações Clínicas',
          type: 'quiz',
          duration: '30min',
          isCompleted: false,
          isLocked: true,
          points: 60
        }
      ]
    },
    {
      id: '5',
      title: 'Avaliação e Monitoramento de Pacientes',
      description: 'Ferramentas de avaliação, acompanhamento e ajuste de protocolos',
      duration: '8h',
      lessonCount: 4,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '5-1',
          title: 'Escalas de Avaliação',
          type: 'video',
          duration: '60min',
          isCompleted: false,
          isLocked: true,
          points: 60
        },
        {
          id: '5-2',
          title: 'Monitoramento de Efeitos Adversos',
          type: 'video',
          duration: '45min',
          isCompleted: false,
          isLocked: true,
          points: 45
        },
        {
          id: '5-3',
          title: 'Ajuste de Protocolos',
          type: 'video',
          duration: '50min',
          isCompleted: false,
          isLocked: true,
          points: 50
        },
        {
          id: '5-4',
          title: 'Relatórios e Documentação',
          type: 'reading',
          duration: '30min',
          isCompleted: false,
          isLocked: true,
          points: 30
        }
      ]
    },
    {
      id: '6',
      title: 'Estudos de Caso e Práticas Clínicas',
      description: 'Análise de casos reais e simulações práticas',
      duration: '10h',
      lessonCount: 5,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '6-1',
          title: 'Caso 1: Dor Crônica',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: true,
          points: 90
        },
        {
          id: '6-2',
          title: 'Caso 2: Epilepsia Refratária',
          type: 'video',
          duration: '75min',
          isCompleted: false,
          isLocked: true,
          points: 75
        },
        {
          id: '6-3',
          title: 'Caso 3: Ansiedade Generalizada',
          type: 'video',
          duration: '60min',
          isCompleted: false,
          isLocked: true,
          points: 60
        },
        {
          id: '6-4',
          title: 'Simulação de Consulta',
          type: 'assignment',
          duration: '120min',
          isCompleted: false,
          isLocked: true,
          points: 100
        },
        {
          id: '6-5',
          title: 'Discussão de Casos',
          type: 'video',
          duration: '45min',
          isCompleted: false,
          isLocked: true,
          points: 45
        }
      ]
    },
    {
      id: '7',
      title: 'Pesquisa Científica e Produção de Artigos',
      description: 'Metodologia de pesquisa e publicação científica',
      duration: '6h',
      lessonCount: 3,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '7-1',
          title: 'Metodologia de Pesquisa',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: true,
          points: 90
        },
        {
          id: '7-2',
          title: 'Análise de Dados',
          type: 'video',
          duration: '60min',
          isCompleted: false,
          isLocked: true,
          points: 60
        },
        {
          id: '7-3',
          title: 'Redação Científica',
          type: 'reading',
          duration: '45min',
          isCompleted: false,
          isLocked: true,
          points: 45
        }
      ]
    },
    {
      id: '8',
      title: 'Avaliação Final e Certificação',
      description: 'Prova final e obtenção do certificado',
      duration: '5h',
      lessonCount: 2,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '8-1',
          title: 'Prova Final',
          type: 'quiz',
          duration: '120min',
          isCompleted: false,
          isLocked: true,
          points: 200
        },
        {
          id: '8-2',
          title: 'Apresentação de Caso',
          type: 'assignment',
          duration: '180min',
          isCompleted: false,
          isLocked: true,
          points: 150
        }
      ]
    }
  ]

  const assignments: Assignment[] = [
    {
      id: '1',
      title: 'Análise de Caso Clínico - Dor Crônica',
      description: 'Analise o caso fornecido e desenvolva um protocolo de tratamento com cannabis',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      points: 100,
      isSubmitted: false
    },
    {
      id: '2',
      title: 'Revisão de Literatura - CBD e Ansiedade',
      description: 'Faça uma revisão sistemática sobre o uso de CBD para ansiedade',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      points: 150,
      isSubmitted: false
    },
    {
      id: '3',
      title: 'Protocolo de Prescrição',
      description: 'Desenvolva um protocolo completo de prescrição de cannabis medicinal',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      points: 200,
      isSubmitted: false
    }
  ]

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'reading':
        return <FileText className="w-4 h-4" />
      case 'quiz':
        return <Award className="w-4 h-4" />
      case 'assignment':
        return <Award className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getLessonColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-blue-600'
      case 'reading':
        return 'text-green-600'
      case 'quiz':
        return 'text-purple-600'
      case 'assignment':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const totalProgress = modules.reduce((acc, module) => acc + module.progress, 0) / modules.length

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="card p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-sm rounded-full">
                  {courseInfo.level}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-full">
                  Certificado
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {courseInfo.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Curso completo de cannabis medicinal com metodologia prática e casos clínicos reais. 
                Desenvolvido pelo Dr. Eduardo Faveret, especialista em medicina integrativa.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{courseInfo.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{courseInfo.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{courseInfo.students} alunos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{courseInfo.rating}</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Progresso do Curso
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>Progresso Geral</span>
                    <span>{Math.round(totalProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${totalProgress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Módulos Concluídos:</span>
                    <span>{modules.filter(m => m.isCompleted).length}/{modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pontos Ganhos:</span>
                    <span>1,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificado:</span>
                    <span className="text-green-600">Disponível</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modules List */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Módulos do Curso
                </h2>
                <button
                  onClick={() => setShowAssignments(!showAssignments)}
                  className="btn-secondary text-sm"
                >
                  {showAssignments ? 'Ver Módulos' : 'Ver Atividades'}
                </button>
              </div>

              {!showAssignments ? (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        activeModule === module.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {module.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {module.isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {module.duration}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {module.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{module.lessonCount} aulas</span>
                          <span>{module.lessons.filter(l => l.isCompleted).length} concluídas</span>
                        </div>
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Module Lessons */}
                      {activeModule === module.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  lesson.isCompleted
                                    ? 'bg-green-50 dark:bg-green-900/20'
                                    : lesson.isLocked
                                    ? 'bg-gray-50 dark:bg-gray-800 opacity-60'
                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={getLessonColor(lesson.type)}>
                                    {getLessonIcon(lesson.type)}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                      {lesson.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {lesson.duration} • {lesson.points} pontos
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {lesson.isCompleted && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                  {lesson.isLocked && (
                                    <span className="text-xs text-gray-400">Bloqueado</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Atividades e Atribuições
                  </h3>
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {assignment.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {assignment.points} pontos
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {assignment.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Prazo: {formatDate(assignment.dueDate)}</span>
                          <span className={assignment.isSubmitted ? 'text-green-600' : 'text-orange-600'}>
                            {assignment.isSubmitted ? 'Entregue' : 'Pendente'}
                          </span>
                        </div>
                        <button className="btn-primary text-sm">
                          {assignment.isSubmitted ? 'Ver Feedback' : 'Entregar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estatísticas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Tempo Estudado:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">24h 30min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Aulas Concluídas:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">12/48</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Pontos Ganhos:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Ranking:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">#45</span>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recursos
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-900 dark:text-white">Material Didático</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-900 dark:text-white">Aulas Gravadas</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-900 dark:text-white">Fórum de Discussão</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <Award className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-900 dark:text-white">Certificado</span>
                </button>
              </div>
            </div>

            {/* Instructor */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Instrutor
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {courseInfo.instructor}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Especialista em Medicina Integrativa
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Médico com mais de 15 anos de experiência em cannabis medicinal e medicina integrativa.
              </p>
              <button className="w-full btn-secondary text-sm">
                Ver Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CursoEduardoFaveret
