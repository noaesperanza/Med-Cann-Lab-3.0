import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Users, 
  FileText, 
  TrendingUp, 
  Brain, 
  Database,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react'

interface KPIData {
  id: string
  title: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  category: 'clinico' | 'semantico' | 'administrativo'
  description: string
  timestamp: string
}

interface KPIDashboardProps {
  userType: string
  userName: string
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({ userType, userName }) => {
  const [selectedLayer, setSelectedLayer] = useState<'clinico' | 'semantico' | 'administrativo'>('clinico')
  const [kpiData, setKpiData] = useState<KPIData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Dados mockados para demonstração
  const mockKPIData: KPIData[] = [
    // KPIs Clínicos
    {
      id: '1',
      title: 'Pacientes Ativos',
      value: 47,
      change: 12,
      trend: 'up',
      category: 'clinico',
      description: 'Pacientes em acompanhamento ativo',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Avaliações IMRE Completas',
      value: 23,
      change: 8,
      trend: 'up',
      category: 'clinico',
      description: 'Protocolos IMRE finalizados este mês',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Taxa de Adesão ao Tratamento',
      value: 89,
      change: 3,
      trend: 'up',
      category: 'clinico',
      description: 'Percentual de adesão ao protocolo terapêutico',
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Melhora na Qualidade de Vida',
      value: 76,
      change: 5,
      trend: 'up',
      category: 'clinico',
      description: 'Pacientes com melhora significativa',
      timestamp: new Date().toISOString()
    },
    // KPIs Semânticos
    {
      id: '5',
      title: 'Análises de Sentimento',
      value: 94,
      change: 2,
      trend: 'up',
      category: 'semantico',
      description: 'Precisão na análise de sentimentos dos pacientes',
      timestamp: new Date().toISOString()
    },
    {
      id: '6',
      title: 'Extração de Sintomas',
      value: 87,
      change: 4,
      trend: 'up',
      category: 'semantico',
      description: 'Eficácia na identificação de sintomas',
      timestamp: new Date().toISOString()
    },
    {
      id: '7',
      title: 'Classificação de Casos',
      value: 91,
      change: 1,
      trend: 'stable',
      category: 'semantico',
      description: 'Precisão na classificação de casos clínicos',
      timestamp: new Date().toISOString()
    },
    {
      id: '8',
      title: 'Processamento de Linguagem Natural',
      value: 88,
      change: 3,
      trend: 'up',
      category: 'semantico',
      description: 'Eficácia do NLP em relatórios clínicos',
      timestamp: new Date().toISOString()
    },
    // KPIs Administrativos
    {
      id: '9',
      title: 'Eficiência Operacional',
      value: 82,
      change: 6,
      trend: 'up',
      category: 'administrativo',
      description: 'Tempo médio de processamento de consultas',
      timestamp: new Date().toISOString()
    },
    {
      id: '10',
      title: 'Satisfação do Paciente',
      value: 93,
      change: 2,
      trend: 'up',
      category: 'administrativo',
      description: 'Índice de satisfação geral dos pacientes',
      timestamp: new Date().toISOString()
    },
    {
      id: '11',
      title: 'Utilização de Recursos',
      value: 78,
      change: 4,
      trend: 'up',
      category: 'administrativo',
      description: 'Otimização do uso de recursos da plataforma',
      timestamp: new Date().toISOString()
    },
    {
      id: '12',
      title: 'Tempo de Resposta',
      value: 95,
      change: 1,
      trend: 'stable',
      category: 'administrativo',
      description: 'Tempo médio de resposta do sistema',
      timestamp: new Date().toISOString()
    }
  ]

  useEffect(() => {
    loadKPIData()
    const interval = setInterval(loadKPIData, 30000) // Atualizar a cada 30 segundos
    return () => clearInterval(interval)
  }, [selectedLayer])

  const loadKPIData = async () => {
    setIsRefreshing(true)
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      const filteredData = mockKPIData.filter(kpi => kpi.category === selectedLayer)
      setKpiData(filteredData)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'clinico': return <Activity className="w-5 h-5" />
      case 'semantico': return <Brain className="w-5 h-5" />
      case 'administrativo': return <BarChart3 className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'clinico': return 'bg-green-600 hover:bg-green-700'
      case 'semantico': return 'bg-purple-600 hover:bg-purple-700'
      case 'administrativo': return 'bg-blue-600 hover:bg-blue-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />
    }
  }

  const playNotificationSound = () => {
    if (soundEnabled) {
      // Criar um som ambiente suave
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const handleLayerChange = (layer: 'clinico' | 'semantico' | 'administrativo') => {
    setSelectedLayer(layer)
    playNotificationSound()
  }

  return (
    <div className="space-y-6">
      {/* Header com seletores de camadas */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              🏥 Cidade Amiga dos Rins - Cannabis Medicinal
            </h1>
            <p className="text-slate-300">
              Painel de KPIs em Tempo Real • Dr. {userName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 border border-slate-600 rounded-md hover:bg-slate-700 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={loadKPIData}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 border border-slate-600 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Seletores das três camadas de KPIs */}
        <div className="flex space-x-4">
          {[
            { key: 'clinico', label: 'Clínicos', icon: <Activity className="w-4 h-4" /> },
            { key: 'semantico', label: 'Semânticos', icon: <Brain className="w-4 h-4" /> },
            { key: 'administrativo', label: 'Administrativos', icon: <BarChart3 className="w-4 h-4" /> }
          ].map((layer) => (
            <button
              key={layer.key}
              onClick={() => handleLayerChange(layer.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                selectedLayer === layer.key 
                  ? getLayerColor(layer.key) 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {layer.icon}
              <span>{layer.label}</span>
            </button>
          ))}
        </div>

        {lastUpdate && (
          <p className="text-slate-400 text-sm mt-2">
            Última atualização: {lastUpdate}
          </p>
        )}
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <div key={kpi.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-medium">
                {kpi.title}
              </h3>
              {getTrendIcon(kpi.trend)}
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">
                  {kpi.value}%
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  kpi.trend === 'up' ? 'bg-green-500/20 text-green-400' : 
                  kpi.trend === 'down' ? 'bg-red-500/20 text-red-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                {kpi.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Discussão em Tempo Real */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Discussão em Tempo Real</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-300 text-sm">
              💬 <strong>Dr. Maria Silva:</strong> "Os KPIs clínicos estão mostrando uma melhora significativa na adesão ao tratamento. Vale a pena discutir estratégias para manter essa tendência."
            </p>
            <p className="text-slate-400 text-xs mt-1">há 2 minutos</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-slate-300 text-sm">
              🤖 <strong>Nôa Esperança:</strong> "Analisando os dados semânticos, identifiquei padrões interessantes na evolução dos sintomas. Posso gerar um relatório detalhado?"
            </p>
            <p className="text-slate-400 text-xs mt-1">há 5 minutos</p>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Compartilhe suas observações..."
              className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-green-500 focus:outline-none"
            />
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KPIDashboard