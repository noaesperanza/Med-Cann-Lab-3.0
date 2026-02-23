import React, { useState, useEffect } from 'react'
import { 
  Brain,
  Activity,
  Heart,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  FileText,
  Video,
  Download,
  Share,
  Plus,
  Edit,
  Eye,
  Filter,
  Search,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface EpilepsyEvent {
  id: string
  patientId: string
  patientName: string
  timestamp: string
  type: 'convulsao' | 'ausencia' | 'mioclonica' | 'tonico-clonica' | 'focal'
  duration: number
  severity: 'leve' | 'moderada' | 'severa'
  triggers: string[]
  medications: string[]
  notes: string
  wearableData?: {
    heartRate: number
    oxygenSaturation: number
    movement: number
    temperature: number
  }
}

interface PatientNeurologicalProfile {
  id: string
  name: string
  age: number
  diagnosis: string
  epilepsyType: string
  medications: string[]
  seizureFrequency: number
  lastSeizure: string
  tezStatus: 'candidato' | 'em_tratamento' | 'respondedor' | 'nao_respondedor'
  wearableConnected: boolean
  monitoringDevices: string[]
}

interface NeurologiaPediatricaProps {
  className?: string
}

const NeurologiaPediatrica: React.FC<NeurologiaPediatricaProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pacientes' | 'eventos' | 'monitoramento' | 'analytics'>('pacientes')
  const [patients, setPatients] = useState<PatientNeurologicalProfile[]>([])
  const [events, setEvents] = useState<EpilepsyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Buscar eventos de epilepsia do Supabase
      const { data: eventsData, error: eventsError } = await supabase
        .from('epilepsy_events')
        .select('*')
        .order('timestamp', { ascending: false })

      if (eventsError) {
        console.error('Erro ao carregar eventos:', eventsError)
        throw eventsError
      }

      // Buscar pacientes únicos dos eventos
      const patientIds = [...new Set((eventsData || []).map((e: any) => e.patient_id))]
      
      // Buscar informações dos pacientes
      let patientsMap = new Map()
      if (patientIds.length > 0) {
        const { data: patientsData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', patientIds)

        patientsMap = new Map((patientsData || []).map((p: any) => [p.id, p]))
      }

      // Buscar dispositivos wearables para verificar conexão
      const { data: devicesData } = await supabase
        .from('wearable_devices')
        .select('patient_id, device_type, brand, model')

      // Agrupar dispositivos por paciente
      const devicesPorPaciente: { [key: string]: string[] } = {}
      devicesData?.forEach((device: any) => {
        if (!devicesPorPaciente[device.patient_id]) {
          devicesPorPaciente[device.patient_id] = []
        }
        devicesPorPaciente[device.patient_id].push(`${device.brand} ${device.model}`)
      })

      // Transformar eventos para o formato esperado
      const formattedEvents: EpilepsyEvent[] = (eventsData || []).map((event: any) => {
        const patient = patientsMap.get(event.patient_id)
        return {
          id: event.id,
          patientId: event.patient_id,
          patientName: patient?.name || 'Paciente',
          timestamp: event.timestamp,
          type: event.event_type as 'convulsao' | 'ausencia' | 'mioclonica' | 'tonico-clonica' | 'focal',
          duration: event.duration || 0,
          severity: event.severity as 'leve' | 'moderada' | 'severa',
          triggers: event.triggers || [],
          medications: event.medications || [],
          notes: event.notes || '',
          wearableData: event.wearable_data || undefined
        }
      })

      // Criar perfis de pacientes a partir dos eventos
      const patientsMapFromEvents: { [key: string]: PatientNeurologicalProfile } = {}
      
      formattedEvents.forEach(event => {
        if (!patientsMapFromEvents[event.patientId]) {
          const patient = patientsMap.get(event.patientId)
          const lastEvent = formattedEvents
            .filter(e => e.patientId === event.patientId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
          
          patientsMapFromEvents[event.patientId] = {
            id: event.patientId,
            name: event.patientName,
            age: 0, // TODO: Adicionar campo age no users
            diagnosis: 'Epilepsia', // TODO: Adicionar campo diagnosis
            epilepsyType: lastEvent?.type || 'Não especificado',
            medications: lastEvent?.medications || [],
            seizureFrequency: formattedEvents.filter(e => e.patientId === event.patientId).length,
            lastSeizure: lastEvent?.timestamp.split('T')[0] || '',
            tezStatus: 'em_tratamento' as 'candidato' | 'em_tratamento' | 'respondedor' | 'nao_respondedor',
            wearableConnected: devicesPorPaciente[event.patientId]?.length > 0 || false,
            monitoringDevices: devicesPorPaciente[event.patientId] || []
          }
        }
      })

      setPatients(Object.values(patientsMapFromEvents))
      setEvents(formattedEvents)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEpilepsyTypeColor = (type: string) => {
    switch (type) {
      case 'convulsao': return 'bg-red-500/20 text-red-400'
      case 'ausencia': return 'bg-yellow-500/20 text-yellow-400'
      case 'mioclonica': return 'bg-blue-500/20 text-blue-400'
      case 'tonico-clonica': return 'bg-purple-500/20 text-purple-400'
      case 'focal': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'leve': return 'bg-green-500/20 text-green-400'
      case 'moderada': return 'bg-yellow-500/20 text-yellow-400'
      case 'severa': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTEZStatusColor = (status: string) => {
    switch (status) {
      case 'candidato': return 'bg-blue-500/20 text-blue-400'
      case 'em_tratamento': return 'bg-yellow-500/20 text-yellow-400'
      case 'respondedor': return 'bg-green-500/20 text-green-400'
      case 'nao_respondedor': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTEZStatusText = (status: string) => {
    switch (status) {
      case 'candidato': return 'Candidato TEZ'
      case 'em_tratamento': return 'Em Tratamento TEZ'
      case 'respondedor': return 'Respondedor TEZ'
      case 'nao_respondedor': return 'Não Respondedor TEZ'
      default: return status
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.epilepsyType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || event.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>Neurologia Pediátrica</span>
            </h2>
            <p className="text-purple-200">
              Especialização em Epilepsia e Cannabis Medicinal - Dr. Eduardo Faveret
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
            <Plus className="w-4 h-4" />
            <span>Novo Paciente</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          {[
            { key: 'pacientes', label: 'Pacientes', icon: <Brain className="w-4 h-4" /> },
            { key: 'eventos', label: 'Eventos Epilepticos', icon: <Zap className="w-4 h-4" /> },
            { key: 'monitoramento', label: 'Monitoramento', icon: <Activity className="w-4 h-4" /> },
            { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
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
      {activeTab === 'pacientes' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 text-white px-10 py-2 rounded-md border border-slate-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Pacientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{patient.name}</h3>
                      <p className="text-slate-400 text-sm">{patient.age} anos</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getTEZStatusColor(patient.tezStatus)}`}>
                    {getTEZStatusText(patient.tezStatus)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-slate-300 text-sm">
                    <strong>Diagnóstico:</strong> {patient.diagnosis}
                  </p>
                  <p className="text-slate-300 text-sm">
                    <strong>Tipo:</strong> {patient.epilepsyType}
                  </p>
                  <p className="text-slate-300 text-sm">
                    <strong>Frequência:</strong> {patient.seizureFrequency} crises/mês
                  </p>
                  <p className="text-slate-300 text-sm">
                    <strong>Última crise:</strong> {new Date(patient.lastSeizure).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">Medicações:</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.medications.map((med, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {patient.wearableConnected ? (
                      <div className="flex items-center space-x-1 text-green-400">
                        <Activity className="w-3 h-3" />
                        <span className="text-xs">Conectado</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">Desconectado</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-green-400 hover:text-green-300 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'eventos' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 text-white px-10 py-2 rounded-md border border-slate-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Todos os tipos</option>
                <option value="convulsao">Convulsão</option>
                <option value="ausencia">Ausência</option>
                <option value="mioclonica">Mioclônica</option>
                <option value="tonico-clonica">Tônico-Clônica</option>
                <option value="focal">Focal</option>
              </select>
            </div>
          </div>

          {/* Lista de Eventos */}
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-700">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{event.patientName}</h4>
                      <p className="text-slate-400 text-sm">
                        {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getEpilepsyTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-slate-400 text-sm">Duração</p>
                    <p className="text-white font-semibold">{event.duration}s</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Gatilhos</p>
                    <div className="flex flex-wrap gap-1">
                      {event.triggers.map((trigger, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Medicações</p>
                    <div className="flex flex-wrap gap-1">
                      {event.medications.map((med, index) => (
                        <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {event.wearableData && (
                  <div className="bg-slate-700 rounded-lg p-3 mb-3">
                    <p className="text-slate-400 text-sm mb-2">Dados do Wearable:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center">
                        <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
                        <p className="text-white font-semibold">{event.wearableData.heartRate} bpm</p>
                        <p className="text-slate-400 text-xs">Frequência Cardíaca</p>
                      </div>
                      <div className="text-center">
                        <Activity className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <p className="text-white font-semibold">{event.wearableData.oxygenSaturation}%</p>
                        <p className="text-slate-400 text-xs">Saturação O2</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                        <p className="text-white font-semibold">{event.wearableData.movement}</p>
                        <p className="text-slate-400 text-xs">Movimento</p>
                      </div>
                      <div className="text-center">
                        <Clock className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                        <p className="text-white font-semibold">{event.wearableData.temperature}°C</p>
                        <p className="text-slate-400 text-xs">Temperatura</p>
                      </div>
                    </div>
                  </div>
                )}

                {event.notes && (
                  <p className="text-slate-300 text-sm">{event.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'monitoramento' && (
        <div className="space-y-6">
          {/* Status dos Dispositivos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Dispositivos Conectados</h3>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {patients.filter(p => p.wearableConnected).length}
              </p>
              <p className="text-slate-400 text-sm">de {patients.length} pacientes</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Monitoramento Ativo</h3>
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-slate-400 text-sm">Tempo real</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Alertas Hoje</h3>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-slate-400 text-sm">Eventos detectados</p>
            </div>
          </div>

          {/* Lista de Dispositivos */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Dispositivos Wearables</h3>
            <div className="space-y-3">
              {patients.filter(p => p.wearableConnected).map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{patient.name}</p>
                      <p className="text-slate-400 text-sm">Conectado</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {patient.monitoringDevices.map((device, index) => (
                      <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {device}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Total de Pacientes</h3>
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{patients.length}</p>
              <p className="text-green-400 text-sm">+2 este mês</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Eventos Este Mês</h3>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{events.length}</p>
              <p className="text-red-400 text-sm">-15% vs mês anterior</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Respondedores TEZ</h3>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {patients.filter(p => p.tezStatus === 'respondedor').length}
              </p>
              <p className="text-green-400 text-sm">67% dos pacientes</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Monitoramento</h3>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.round((patients.filter(p => p.wearableConnected).length / patients.length) * 100)}%
              </p>
              <p className="text-slate-400 text-sm">Cobertura</p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Tipos de Epilepsia</h3>
              <div className="space-y-3">
                {Array.from(new Set(patients.map(p => p.epilepsyType))).map((type) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-slate-300">{type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(patients.filter(p => p.epilepsyType === type).length / patients.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold">
                        {patients.filter(p => p.epilepsyType === type).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Status TEZ</h3>
              <div className="space-y-3">
                {['candidato', 'em_tratamento', 'respondedor', 'nao_respondedor'].map((status) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-slate-300">{getTEZStatusText(status)}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(patients.filter(p => p.tezStatus === status).length / patients.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold">
                        {patients.filter(p => p.tezStatus === status).length}
                      </span>
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

export default NeurologiaPediatrica
