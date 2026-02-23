import React, { useState, useEffect } from 'react'
import { 
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  Brain,
  Heart,
  GraduationCap,
  Microscope,
  Eye,
  Settings,
  Download,
  Filter,
  Search,
  Plus,
  Edit
} from 'lucide-react'

interface EixoPerformance {
  eixo: string
  usuarios: number
  atividades: number
  satisfacao: number
  crescimento: number
  status: 'excelente' | 'bom' | 'regular' | 'precisa_melhorar'
}

interface TipoUsuarioPerformance {
  tipo: string
  total: number
  ativos: number
  novos: number
  engajamento: number
  satisfacao: number
}

interface CoordenacaoMedicaProps {
  className?: string
}

const CoordenacaoMedica: React.FC<CoordenacaoMedicaProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'eixos' | 'usuarios' | 'analytics'>('eixos')
  const [eixoPerformance, setEixoPerformance] = useState<EixoPerformance[]>([])
  const [usuarioPerformance, setUsuarioPerformance] = useState<TipoUsuarioPerformance[]>([])
  const [loading, setLoading] = useState(true)

  // Dados mockados para coordenação médica
  const mockEixoPerformance: EixoPerformance[] = [
    {
      eixo: 'Clínica',
      usuarios: 89,
      atividades: 156,
      satisfacao: 94,
      crescimento: 12,
      status: 'excelente'
    },
    {
      eixo: 'Ensino',
      usuarios: 45,
      atividades: 78,
      satisfacao: 98,
      crescimento: 8,
      status: 'excelente'
    },
    {
      eixo: 'Pesquisa',
      usuarios: 23,
      atividades: 34,
      satisfacao: 87,
      crescimento: 15,
      status: 'bom'
    }
  ]

  const mockUsuarioPerformance: TipoUsuarioPerformance[] = [
    {
      tipo: 'Profissionais',
      total: 67,
      ativos: 45,
      novos: 8,
      engajamento: 92,
      satisfacao: 96
    },
    {
      tipo: 'Pacientes',
      total: 234,
      ativos: 189,
      novos: 23,
      engajamento: 78,
      satisfacao: 89
    },
    {
      tipo: 'Alunos',
      total: 45,
      ativos: 38,
      novos: 12,
      engajamento: 95,
      satisfacao: 98
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEixoPerformance(mockEixoPerformance)
      setUsuarioPerformance(mockUsuarioPerformance)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelente': return 'bg-green-500/20 text-green-400'
      case 'bom': return 'bg-blue-500/20 text-blue-400'
      case 'regular': return 'bg-yellow-500/20 text-yellow-400'
      case 'precisa_melhorar': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excelente': return 'Excelente'
      case 'bom': return 'Bom'
      case 'regular': return 'Regular'
      case 'precisa_melhorar': return 'Precisa Melhorar'
      default: return status
    }
  }

  const getEixoIcon = (eixo: string) => {
    switch (eixo) {
      case 'Clínica': return <Heart className="w-5 h-5" />
      case 'Ensino': return <GraduationCap className="w-5 h-5" />
      case 'Pesquisa': return <Microscope className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getEixoColor = (eixo: string) => {
    switch (eixo) {
      case 'Clínica': return 'text-red-400'
      case 'Ensino': return 'text-blue-400'
      case 'Pesquisa': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span>Coordenação Médica</span>
            </h2>
            <p className="text-purple-200">
              Acompanhe o desempenho de cada eixo e tipo de usuário
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
            <Download className="w-4 h-4" />
            <span>Relatório</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          {[
            { key: 'eixos', label: 'Eixos', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'usuarios', label: 'Usuários', icon: <Users className="w-4 h-4" /> },
            { key: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'eixos' && (
        <div className="space-y-4">
          {eixoPerformance.map((eixo) => (
            <div key={eixo.eixo} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getEixoColor(eixo.eixo)} bg-slate-700`}>
                    {getEixoIcon(eixo.eixo)}
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">{eixo.eixo}</h3>
                    <p className="text-slate-400 text-sm">Eixo {eixo.eixo}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(eixo.status)}`}>
                  {getStatusText(eixo.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{eixo.usuarios}</p>
                  <p className="text-slate-400 text-sm">Usuários</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{eixo.atividades}</p>
                  <p className="text-slate-400 text-sm">Atividades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{eixo.satisfacao}%</p>
                  <p className="text-slate-400 text-sm">Satisfação</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">+{eixo.crescimento}%</p>
                  <p className="text-slate-400 text-sm">Crescimento</p>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors text-sm">
                  <Eye className="w-3 h-3" />
                  <span>Detalhes</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md transition-colors text-sm">
                  <Edit className="w-3 h-3" />
                  <span>Configurar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          {usuarioPerformance.map((usuario) => (
            <div key={usuario.tipo} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-700">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">{usuario.tipo}</h3>
                    <p className="text-slate-400 text-sm">Tipo de usuário</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{usuario.total}</p>
                  <p className="text-slate-400 text-sm">Total</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-400">{usuario.ativos}</p>
                  <p className="text-slate-400 text-sm">Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-400">{usuario.novos}</p>
                  <p className="text-slate-400 text-sm">Novos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-400">{usuario.engajamento}%</p>
                  <p className="text-slate-400 text-sm">Engajamento</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-400">{usuario.satisfacao}%</p>
                  <p className="text-slate-400 text-sm">Satisfação</p>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors text-sm">
                  <Eye className="w-3 h-3" />
                  <span>Ver Usuários</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md transition-colors text-sm">
                  <Plus className="w-3 h-3" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Métricas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Total de Usuários</h3>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">346</p>
              <p className="text-green-400 text-sm">+12% este mês</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Atividades Totais</h3>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">268</p>
              <p className="text-green-400 text-sm">+8% este mês</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Satisfação Geral</h3>
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">93%</p>
              <p className="text-green-400 text-sm">+2% este mês</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Crescimento</h3>
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">+15%</p>
              <p className="text-green-400 text-sm">vs mês anterior</p>
            </div>
          </div>

          {/* Gráficos de Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Performance por Eixo</h3>
              <div className="space-y-3">
                {eixoPerformance.map((eixo) => (
                  <div key={eixo.eixo} className="flex items-center justify-between">
                    <span className="text-slate-300">{eixo.eixo}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${eixo.satisfacao}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold">{eixo.satisfacao}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Engajamento por Tipo</h3>
              <div className="space-y-3">
                {usuarioPerformance.map((usuario) => (
                  <div key={usuario.tipo} className="flex items-center justify-between">
                    <span className="text-slate-300">{usuario.tipo}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${usuario.engajamento}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold">{usuario.engajamento}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoordenacaoMedica
