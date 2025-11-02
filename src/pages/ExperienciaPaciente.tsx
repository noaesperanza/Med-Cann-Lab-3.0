import React, { useState } from 'react'
import { 
  Heart, 
  FileText, 
  Award, 
  MessageCircle,
  BookOpen,
  Stethoscope,
  CheckCircle,
  Plus,
  Edit,
  BarChart3,
  Activity,
  Brain,
  Zap
} from 'lucide-react'

interface HealthEntry {
  id: string
  date: Date
  type: 'symptom' | 'medication' | 'mood' | 'activity' | 'appointment'
  title: string
  description: string
  severity?: number
  tags: string[]
  isMessageCircled: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  points: number
  unlockedAt: Date
  category: 'health' | 'engagement' | 'learning' | 'social'
}

interface HealthGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: Date
  isCompleted: boolean
  category: 'physical' | 'mental' | 'social' | 'learning'
}

const ExperienciaPaciente: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'diary', name: 'Diário Clínico', icon: <FileText className="w-4 h-4" /> },
    { id: 'goals', name: 'Metas de Saúde', icon: <Award className="w-4 h-4" /> },
    { id: 'achievements', name: 'Conquistas', icon: <Award className="w-4 h-4" /> },
    { id: 'community', name: 'Comunidade', icon: <MessageCircle className="w-4 h-4" /> }
  ]

  const healthStats = {
    totalEntries: 156,
    currentStreak: 12,
    longestStreak: 45,
    sharedEntries: 23,
    totalPoints: 3420,
    level: 8,
    nextLevelPoints: 500
  }

  const recentEntries: HealthEntry[] = [
    {
      id: '1',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'symptom',
      title: 'Dor de cabeça leve',
      description: 'Dor de cabeça leve no final da tarde, possivelmente relacionada ao estresse do trabalho.',
      severity: 3,
      tags: ['dor', 'cabeça', 'estresse'],
      isMessageCircled: false
    },
    {
      id: '2',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'medication',
      title: 'CBD 25mg',
      description: 'Tomou CBD 25mg às 14h. Efeito positivo na ansiedade, sem efeitos colaterais.',
      tags: ['CBD', 'ansiedade', 'medicamento'],
      isMessageCircled: true
    },
    {
      id: '3',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'mood',
      title: 'Dia produtivo',
      description: 'Senteu-se mais energizado e focado hoje. Conseguiu completar todas as tarefas planejadas.',
      severity: 8,
      tags: ['energia', 'foco', 'produtividade'],
      isMessageCircled: false
    },
    {
      id: '4',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'appointment',
      title: 'Consulta com Dr. Silva',
      description: 'Consulta de retorno. Discussão sobre ajuste da dosagem de CBD. Próxima consulta em 30 dias.',
      tags: ['consulta', 'CBD', 'dosagem'],
      isMessageCircled: true
    }
  ]

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Diário Consistente',
      description: 'Manteve o diário por 7 dias consecutivos',
      icon: <FileText className="w-6 h-6" />,
      points: 100,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'engagement'
    },
    {
      id: '2',
      title: 'Compartilhamento Ativo',
      description: 'Compartilhou 10 entradas com profissionais',
      icon: <MessageCircle className="w-6 h-6" />,
      points: 200,
      unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      category: 'social'
    },
    {
      id: '3',
      title: 'Aprendiz Contínuo',
      description: 'Completou 5 módulos educacionais',
      icon: <BookOpen className="w-6 h-6" />,
      points: 300,
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      category: 'learning'
    },
    {
      id: '4',
      title: 'Meta de Saúde Alcançada',
      description: 'Atingiu sua primeira meta de saúde',
      icon: <Award className="w-6 h-6" />,
      points: 250,
      unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      category: 'health'
    }
  ]

  const healthGoals: HealthGoal[] = [
    {
      id: '1',
      title: 'Redução da Ansiedade',
      description: 'Manter níveis de ansiedade abaixo de 5/10',
      target: 5,
      current: 6,
      unit: '/10',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      category: 'mental'
    },
    {
      id: '2',
      title: 'Exercícios Semanais',
      description: 'Fazer exercícios 3 vezes por semana',
      target: 3,
      current: 2,
      unit: 'vezes/semana',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      category: 'physical'
    },
    {
      id: '3',
      title: 'Sono Regular',
      description: 'Dormir 7-8 horas por noite',
      target: 7,
      current: 6,
      unit: 'horas/noite',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      category: 'physical'
    },
    {
      id: '4',
      title: 'Participação na Comunidade',
      description: 'Participar de 2 discussões por semana',
      target: 2,
      current: 1,
      unit: 'vezes/semana',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      category: 'social'
    }
  ]

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'symptom':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'medication':
        return <Stethoscope className="w-5 h-5 text-blue-500" />
      case 'mood':
        return <Brain className="w-5 h-5 text-yellow-500" />
      case 'activity':
        return <Activity className="w-5 h-5 text-green-500" />
      case 'appointment':
        return <FileText className="w-5 h-5 text-purple-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'symptom':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'medication':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'mood':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'activity':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'appointment':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      default:
        return 'bg-slate-100/30 dark:bg-slate-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health':
        return <Heart className="w-4 h-4" />
      case 'engagement':
        return <Zap className="w-4 h-4" />
      case 'learning':
        return <BookOpen className="w-4 h-4" />
      case 'social':
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Award className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w atrás`
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Minha Jornada de Saúde
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Acompanhe sua evolução, compartilhe experiências e conecte-se com a comunidade
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {healthStats.totalEntries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Entradas no Diário</div>
              </div>
              <div className="card p-6 text-center">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {healthStats.currentStreak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Dias Consecutivos</div>
              </div>
              <div className="card p-6 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {healthStats.totalPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Pontos Ganhos</div>
              </div>
              <div className="card p-6 text-center">
                <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {healthStats.sharedEntries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Entradas Compartilhadas</div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Entradas Recentes
                </h3>
                <button
                  onClick={() => console.log(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Entrada
                </button>
              </div>
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className={`p-4 border rounded-lg ${getEntryColor(entry.type)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getEntryIcon(entry.type)}
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {entry.title}
                        </h4>
                        {entry.isMessageCircled && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                            Compartilhado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(entry.date)}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {entry.description}
                    </p>
                    {entry.severity && (
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Severidade:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-full ${
                                level <= entry.severity!
                                  ? 'bg-red-500'
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.severity}/10
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diary Tab */}
        {activeTab === 'diary' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Diário Clínico Digital
              </h2>
              <button
                onClick={() => console.log(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Entrada
              </button>
            </div>

            <div className="card p-6">
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className={`p-4 border rounded-lg ${getEntryColor(entry.type)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getEntryIcon(entry.type)}
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {entry.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.date.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.isMessageCircled && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                            Compartilhado
                          </span>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {entry.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Metas de Saúde
              </h2>
              <button className="btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthGoals.map((goal) => (
                <div key={goal.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {goal.description}
                      </p>
                    </div>
                    {goal.isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span>Progresso</span>
                      <span>{goal.current}/{goal.target} {goal.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Prazo: {goal.deadline.toLocaleDateString('pt-BR')}</span>
                    <button className="text-primary-600 hover:text-primary-500">
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Conquistas Desbloqueadas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="card p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-yellow-600">
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(achievement.category)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {achievement.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            {achievement.points}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            pontos
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Comunidade e Compartilhamento
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Compartilhamentos Recentes
                </h3>
                <div className="space-y-4">
                  {recentEntries.filter(entry => entry.isMessageCircled).map((entry) => (
                    <div key={entry.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Compartilhado com Dr. Silva
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {entry.title} - {formatTimeAgo(entry.date)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Discussões Ativas
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Experiência com CBD para Ansiedade
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Compartilhe sua experiência com outros pacientes
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>12 comentários</span>
                      <span>5 curtidas</span>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Dicas para Manter o Diário
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Como manter a consistência no diário clínico
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>8 comentários</span>
                      <span>15 curtidas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExperienciaPaciente
