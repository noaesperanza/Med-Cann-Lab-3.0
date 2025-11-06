import React, { useState, useEffect } from 'react'
import { 
  Brain,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Users,
  Heart,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Share,
  Filter,
  Search,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface ClinicalKPI {
  id: string
  name: string
  description: string
  category: 'neurologico' | 'comportamental' | 'cognitivo' | 'social' | 'fisico'
  type: 'percentage' | 'count' | 'score' | 'frequency' | 'duration'
  target: number
  current: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  patientSpecific: boolean
  patientId?: string
  noaGenerated: boolean
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  thresholds: {
    critical: number
    warning: number
    good: number
    excellent: number
  }
}

interface PatientProfile {
  id: string
  name: string
  age: number
  diagnosis: string
  autismSpectrum: boolean
  neurologicalProfile: string[]
  consentDataSharing: boolean
  consentResearch: boolean
  customKPIs: ClinicalKPI[]
}

interface KPIClinicosPersonalizadosProps {
  className?: string
}

const KPIClinicosPersonalizados: React.FC<KPIClinicosPersonalizadosProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'criador' | 'pacientes' | 'configuracoes'>('dashboard')
  const [selectedCategory, setSelectedCategory] = useState<'neurologico' | 'comportamental' | 'cognitivo' | 'social' | 'fisico' | 'all'>('all')
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [globalKPIs, setGlobalKPIs] = useState<ClinicalKPI[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [showKPICreator, setShowKPICreator] = useState(false)
  const [newKPI, setNewKPI] = useState<Partial<ClinicalKPI>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Buscar perfis de pacientes
      const { data: patientProfilesData, error: profilesError } = await supabase
        .from('patient_profiles')
        .select(`
          *,
          patient:patient_id (
            id,
            name,
            email
          )
        `)

      if (profilesError) {
        console.error('Erro ao carregar perfis de pacientes:', profilesError)
        throw profilesError
      }

      // Buscar informações dos pacientes
      const patientIds = [...new Set((patientProfilesData || []).map((p: any) => p.patient_id))]
      let patientsMap = new Map()
      if (patientIds.length > 0) {
        const { data: patientsData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', patientIds)

        patientsMap = new Map((patientsData || []).map((p: any) => [p.id, p]))
      }

      // Transformar perfis de pacientes
      const formattedPatients: PatientProfile[] = (patientProfilesData || []).map((profile: any) => {
        const patient = patientsMap.get(profile.patient_id)
        return {
          id: profile.patient_id,
          name: patient?.name || 'Paciente',
          age: profile.age || 0,
          diagnosis: profile.diagnosis || '',
          autismSpectrum: profile.autism_spectrum || false,
          neurologicalProfile: profile.neurological_profile || [],
          consentDataSharing: profile.consent_data_sharing || false,
          consentResearch: profile.consent_research || false,
          customKPIs: [] // TODO: Buscar KPIs personalizados do paciente
        }
      })

      // Buscar KPIs globais
      const { data: kpisData, error: kpisError } = await supabase
        .from('clinical_kpis')
        .select('*')
        .eq('patient_specific', false)
        .order('last_updated', { ascending: false })

      if (kpisError) {
        console.error('Erro ao carregar KPIs:', kpisError)
        throw kpisError
      }

      // Transformar KPIs
      const formattedKPIs: ClinicalKPI[] = (kpisData || []).map((kpi: any) => ({
        id: kpi.id,
        name: kpi.name,
        description: kpi.description || '',
        category: kpi.category as 'neurologico' | 'comportamental' | 'cognitivo' | 'social' | 'fisico',
        type: kpi.kpi_type as 'percentage' | 'count' | 'score' | 'frequency' | 'duration',
        target: kpi.target_value || 0,
        current: kpi.current_value || 0,
        unit: kpi.unit || '',
        frequency: kpi.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly',
        patientSpecific: kpi.patient_specific || false,
        patientId: kpi.patient_id,
        noaGenerated: kpi.noa_generated || false,
        lastUpdated: kpi.last_updated || kpi.created_at,
        trend: kpi.trend as 'up' | 'down' | 'stable',
        trendValue: kpi.trend_value || 0,
        thresholds: kpi.thresholds || {
          critical: 0,
          warning: 0,
          good: 0,
          excellent: 0
        }
      }))

      setPatients(formattedPatients)
      setGlobalKPIs(formattedKPIs)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Dados mockados removidos - agora usando Supabase

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'neurologico': return 'bg-purple-500/20 text-purple-400'
      case 'comportamental': return 'bg-blue-500/20 text-blue-400'
      case 'cognitivo': return 'bg-green-500/20 text-green-400'
      case 'social': return 'bg-yellow-500/20 text-yellow-400'
      case 'fisico': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'neurologico': return <Brain className="w-4 h-4" />
      case 'comportamental': return <Activity className="w-4 h-4" />
      case 'cognitivo': return <Target className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      case 'fisico': return <Heart className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-400" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (current: number, thresholds: any) => {
    if (current <= thresholds.excellent) return 'text-green-400'
    if (current <= thresholds.good) return 'text-blue-400'
    if (current <= thresholds.warning) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusText = (current: number, thresholds: any) => {
    if (current <= thresholds.excellent) return 'Excelente'
    if (current <= thresholds.good) return 'Bom'
    if (current <= thresholds.warning) return 'Atenção'
    return 'Crítico'
  }

  const filteredKPIs = globalKPIs.filter(kpi => 
    selectedCategory === 'all' || kpi.category === selectedCategory
  )

  const handleCreateKPI = () => {
    if (newKPI.name && newKPI.target) {
      const kpi: ClinicalKPI = {
        id: Date.now().toString(),
        name: newKPI.name,
        description: newKPI.description || '',
        category: newKPI.category || 'neurologico',
        type: newKPI.type || 'percentage',
        target: newKPI.target,
        current: 0,
        unit: newKPI.unit || '%',
        frequency: newKPI.frequency || 'daily',
        patientSpecific: !!newKPI.patientId,
        patientId: newKPI.patientId,
        noaGenerated: false,
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        trendValue: 0,
        thresholds: {
          critical: newKPI.target * 1.5,
          warning: newKPI.target * 1.2,
          good: newKPI.target * 0.8,
          excellent: newKPI.target * 0.5
        }
      }
      
      setGlobalKPIs([...globalKPIs, kpi])
      setNewKPI({})
      setShowKPICreator(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>KPIs Clínicos Personalizados</span>
            </h2>
            <p className="text-indigo-200">
              Monitoramento Neurológico • Transtorno do Espectro Autista • Individualizado por Paciente
            </p>
          </div>
          <button 
            onClick={() => setShowKPICreator(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Criar KPI</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'criador', label: 'Criador de KPIs', icon: <Plus className="w-4 h-4" /> },
            { key: 'pacientes', label: 'Por Paciente', icon: <Users className="w-4 h-4" /> },
            { key: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-indigo-700 text-indigo-200 hover:bg-indigo-600'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'neurologico', label: 'Neurológico' },
            { key: 'comportamental', label: 'Comportamental' },
            { key: 'cognitivo', label: 'Cognitivo' },
            { key: 'social', label: 'Social' },
            { key: 'fisico', label: 'Físico' }
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as any)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedCategory === category.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Métricas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">KPIs Ativos</h3>
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-3xl font-bold text-white">{filteredKPIs.length}</p>
              <p className="text-green-400 text-sm">+2 este mês</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Pacientes Monitorados</h3>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{patients.length}</p>
              <p className="text-green-400 text-sm">100% TEA</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">KPIs da Nôa</h3>
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {filteredKPIs.filter(kpi => kpi.noaGenerated).length}
              </p>
              <p className="text-blue-400 text-sm">IA Gerados</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Consentimento Pesquisa</h3>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {patients.filter(p => p.consentResearch).length}
              </p>
              <p className="text-slate-400 text-sm">de {patients.length}</p>
            </div>
          </div>

          {/* Lista de KPIs */}
          <div className="space-y-4">
            {filteredKPIs.map((kpi) => (
              <div key={kpi.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(kpi.category)}`}>
                      {getCategoryIcon(kpi.category)}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{kpi.name}</h3>
                      <p className="text-slate-400 text-sm">{kpi.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(kpi.category)}`}>
                      {kpi.category}
                    </span>
                    {kpi.noaGenerated && (
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                        Nôa IA
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{kpi.current}</p>
                    <p className="text-slate-400 text-sm">Atual</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-400">{kpi.target}</p>
                    <p className="text-slate-400 text-sm">Meta</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getStatusColor(kpi.current, kpi.thresholds)}`}>
                      {getStatusText(kpi.current, kpi.thresholds)}
                    </p>
                    <p className="text-slate-400 text-sm">Status</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {getTrendIcon(kpi.trend)}
                      <span className={`text-lg font-bold ${
                        kpi.trend === 'up' ? 'text-green-400' : 
                        kpi.trend === 'down' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">Tendência</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-slate-400 text-sm">
                    <p>Frequência: {kpi.frequency} • Última atualização: {new Date(kpi.lastUpdated).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-400 hover:text-green-300 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-purple-400 hover:text-purple-300 transition-colors">
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'criador' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Criar Novo KPI Clínico</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Nome do KPI</label>
                <input
                  type="text"
                  value={newKPI.name || ''}
                  onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ex: Frequência de Crises Epilépticas"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Categoria</label>
                <select
                  value={newKPI.category || 'neurologico'}
                  onChange={(e) => setNewKPI({...newKPI, category: e.target.value as any})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="neurologico">Neurológico</option>
                  <option value="comportamental">Comportamental</option>
                  <option value="cognitivo">Cognitivo</option>
                  <option value="social">Social</option>
                  <option value="fisico">Físico</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Tipo</label>
                <select
                  value={newKPI.type || 'percentage'}
                  onChange={(e) => setNewKPI({...newKPI, type: e.target.value as any})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="count">Contagem</option>
                  <option value="score">Pontuação</option>
                  <option value="frequency">Frequência</option>
                  <option value="duration">Duração</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Meta</label>
                <input
                  type="number"
                  value={newKPI.target || ''}
                  onChange={(e) => setNewKPI({...newKPI, target: Number(e.target.value)})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="Valor da meta"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Unidade</label>
                <input
                  type="text"
                  value={newKPI.unit || ''}
                  onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ex: %, minutos, vezes/dia"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2">Frequência</label>
                <select
                  value={newKPI.frequency || 'daily'}
                  onChange={(e) => setNewKPI({...newKPI, frequency: e.target.value as any})}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-slate-300 text-sm mb-2">Descrição</label>
              <textarea
                value={newKPI.description || ''}
                onChange={(e) => setNewKPI({...newKPI, description: e.target.value})}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
                rows={3}
                placeholder="Descrição detalhada do KPI..."
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-slate-300 text-sm mb-2">Paciente Específico (Opcional)</label>
              <select
                value={newKPI.patientId || ''}
                onChange={(e) => setNewKPI({...newKPI, patientId: e.target.value})}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">KPI Global</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={handleCreateKPI}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Criar KPI</span>
              </button>
              <button
                onClick={() => {
                  setNewKPI({})
                  setShowKPICreator(false)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pacientes' && (
        <div className="space-y-4">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{patient.name}</h3>
                    <p className="text-slate-400 text-sm">{patient.age} anos • {patient.diagnosis}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {patient.autismSpectrum && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      TEA
                    </span>
                  )}
                  {patient.consentDataSharing && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      Compartilhamento OK
                    </span>
                  )}
                  {patient.consentResearch && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      Pesquisa OK
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-slate-300 text-sm mb-2">Perfil Neurológico:</p>
                <div className="flex flex-wrap gap-1">
                  {patient.neurologicalProfile.map((profile, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                      {profile}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-slate-400 text-sm">
                  <p>KPIs Personalizados: {patient.customKPIs.length}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-md transition-colors text-sm">
                    <Eye className="w-3 h-3" />
                    <span>Ver KPIs</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md transition-colors text-sm">
                    <Plus className="w-3 h-3" />
                    <span>Criar KPI</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'configuracoes' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Configurações de Monitoramento</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Integração com Nôa Esperança</h4>
                  <p className="text-slate-400 text-sm">Permitir que a IA sugira KPIs baseados nos dados do paciente</p>
                </div>
                <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Alertas Automáticos</h4>
                  <p className="text-slate-400 text-sm">Notificar quando KPIs atingem níveis críticos</p>
                </div>
                <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Compartilhamento de Dados</h4>
                  <p className="text-slate-400 text-sm">Permitir compartilhamento anônimo para pesquisa</p>
                </div>
                <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KPIClinicosPersonalizados
