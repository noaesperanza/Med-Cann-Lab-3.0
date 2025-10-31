import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Heart, 
  Activity, 
  Star, 
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

const PatientKPIs: React.FC = () => {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const kpis = [
    {
      id: 1,
      title: 'Score Clínico',
      value: '85/100',
      change: '+5',
      changeType: 'positive',
      trend: 'up',
      description: 'Desde última avaliação',
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 2,
      title: 'Adesão ao Tratamento',
      value: '92%',
      change: '+3%',
      changeType: 'positive',
      trend: 'up',
      description: 'Excelente adesão',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 3,
      title: 'Melhoria dos Sintomas',
      value: '78%',
      change: '+12%',
      changeType: 'positive',
      trend: 'up',
      description: 'Desde início do tratamento',
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 4,
      title: 'Qualidade de Vida',
      value: '88/100',
      change: '+12',
      changeType: 'positive',
      trend: 'up',
      description: 'Este mês',
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      id: 5,
      title: 'Frequência de Consultas',
      value: '95%',
      change: '-2%',
      changeType: 'negative',
      trend: 'down',
      description: 'Últimos 3 meses',
      icon: Calendar,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 6,
      title: 'Satisfação com Tratamento',
      value: '4.8/5',
      change: '+0.2',
      changeType: 'positive',
      trend: 'up',
      description: 'Avaliação média',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    }
  ]

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : TrendingDown
  }

  const getTrendColor = (changeType: string) => {
    return changeType === 'positive' ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/app/patient-dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Meus KPIs</h1>
              <p className="text-slate-400">Programa de Cuidado Renal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Ano</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <a href="/app/patient-dashboard" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Agenda</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 text-white">
                <TrendingUp className="w-5 h-5" />
                <span>Meus KPIs</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="w-5 h-5">❤️</span>
                <span>Avaliação Clínica</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="w-5 h-5">💬</span>
                <span>Chat com Nôa</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="w-5 h-5">📄</span>
                <span>Relatórios</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {kpis.map((kpi) => {
                const Icon = kpi.icon
                const TrendIcon = getTrendIcon(kpi.trend)
                return (
                  <div key={kpi.id} className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                        <Icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendIcon className={`w-4 h-4 ${getTrendColor(kpi.changeType)}`} />
                        <span className={`text-sm font-medium ${getTrendColor(kpi.changeType)}`}>
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-1">{kpi.title}</h3>
                    <div className="text-3xl font-bold text-white mb-2">{kpi.value}</div>
                    <p className="text-sm text-slate-400">{kpi.description}</p>
                  </div>
                )
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Score Evolution Chart */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Evolução do Score Clínico</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-400">Gráfico de evolução do score</p>
                  </div>
                </div>
              </div>

              {/* Adherence Chart */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Adesão ao Tratamento</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <PieChart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-400">Gráfico de adesão</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Métricas Detalhadas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">95%</div>
                  <div className="text-sm text-slate-400">Consultas Realizadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">8.5</div>
                  <div className="text-sm text-slate-400">Média de Horas de Sono</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">2.1L</div>
                  <div className="text-sm text-slate-400">Ingestão de Água/Dia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">4.2</div>
                  <div className="text-sm text-slate-400">Exercícios/Semana</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-800 rounded-xl p-6 mt-8">
              <h3 className="text-xl font-semibold text-white mb-6">Recomendações da Nôa Esperança</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium">Excelente adesão ao tratamento!</p>
                    <p className="text-sm text-slate-300">Continue mantendo a regularidade nas consultas e medicações.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">Melhoria significativa nos sintomas</p>
                    <p className="text-sm text-slate-300">Os indicadores mostram progresso positivo no tratamento.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-medium">Atenção à hidratação</p>
                    <p className="text-sm text-slate-300">Considere aumentar a ingestão de água para 2.5L por dia.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientKPIs
