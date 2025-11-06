import React, { useState, useEffect } from 'react'
import { 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Star,
  DollarSign,
  BarChart3,
  PieChart,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Appointment {
  id: string
  patientName: string
  patientId: string
  specialty: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  rating?: number
  revenue?: number
}

interface Analytics {
  totalAppointments: number
  completionRate: number
  averageRating: number
  totalRevenue: number
  appointmentsBySpecialty: { specialty: string; count: number }[]
  occupancyByHour: { hour: string; percentage: number }[]
}

interface EduardoSchedulingProps {
  className?: string
}

const EduardoScheduling: React.FC<EduardoSchedulingProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'analytics'>('calendar')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Buscar agendamentos do profissional atual
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user.id)
        .order('appointment_date', { ascending: true })

      if (appointmentsError) {
        console.error('Erro ao carregar agendamentos:', appointmentsError)
        throw appointmentsError
      }

      // Buscar informações dos pacientes (se houver agendamentos)
      let patientsMap = new Map()
      if (appointmentsData && appointmentsData.length > 0) {
        const patientIds = [...new Set(appointmentsData.map((apt: any) => apt.patient_id))]
        const { data: patientsData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', patientIds)

        patientsMap = new Map((patientsData || []).map((p: any) => [p.id, p]))
      }

      // Transformar dados do Supabase para o formato esperado
      const formattedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => {
        const appointmentDate = new Date(apt.appointment_date)
        const patient = patientsMap.get(apt.patient_id)
        return {
          id: apt.id,
          patientName: patient?.name || 'Paciente',
          patientId: apt.patient_id,
          specialty: apt.type || 'Cannabis Medicinal',
          date: appointmentDate.toISOString().split('T')[0],
          time: appointmentDate.toTimeString().slice(0, 5),
          duration: apt.duration || 60,
          status: apt.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
          notes: apt.description || apt.notes,
          rating: apt.rating,
          revenue: apt.revenue
        }
      })

      setAppointments(formattedAppointments)

      // Calcular analytics a partir dos dados reais
      const totalAppointments = formattedAppointments.length
      const completedAppointments = formattedAppointments.filter(a => a.status === 'completed').length
      const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0
      
      const ratings = formattedAppointments.filter(a => a.rating).map(a => a.rating!)
      const averageRating = ratings.length > 0 
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0

      const totalRevenue = formattedAppointments
        .filter(a => a.revenue)
        .reduce((sum, a) => sum + (a.revenue || 0), 0)

      // Agrupar por especialidade
      const specialtyCounts: { [key: string]: number } = {}
      formattedAppointments.forEach(apt => {
        specialtyCounts[apt.specialty] = (specialtyCounts[apt.specialty] || 0) + 1
      })
      const appointmentsBySpecialty = Object.entries(specialtyCounts).map(([specialty, count]) => ({
        specialty,
        count
      }))

      // Calcular ocupação por horário (simplificado)
      const hourCounts: { [key: string]: number } = {}
      formattedAppointments.forEach(apt => {
        const hour = apt.time.split(':')[0]
        const hourKey = `${hour}:00-${parseInt(hour) + 1}:00`
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
      })
      const maxHourCount = Math.max(...Object.values(hourCounts), 1)
      const occupancyByHour = Object.entries(hourCounts).map(([hour, count]) => ({
        hour,
        percentage: Math.round((count / maxHourCount) * 100)
      }))

      setAnalytics({
        totalAppointments,
        completionRate,
        averageRating,
        totalRevenue,
        appointmentsBySpecialty,
        occupancyByHour
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = filterSpecialty === 'all' || appointment.specialty === filterSpecialty
    return matchesSearch && matchesSpecialty
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      case 'no-show': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      case 'no-show': return 'Não compareceu'
      default: return status
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Calendar className="w-6 h-6" />
              <span>Sistema de Agendamento</span>
            </h2>
            <p className="text-green-200">
              Gerencie consultas, visualize analytics e acompanhe performance
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nova Consulta</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          {[
            { key: 'calendar', label: 'Calendário', icon: <Calendar className="w-4 h-4" /> },
            { key: 'list', label: 'Lista', icon: <Users className="w-4 h-4" /> },
            { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-700 text-green-200 hover:bg-green-600'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Calendário de Consultas</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
                {day}
              </div>
            ))}
            {/* Aqui você implementaria o calendário real */}
            <div className="col-span-7 text-center text-slate-400 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p>Calendário em desenvolvimento</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar consultas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 text-white px-10 py-2 rounded-md border border-slate-600 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-green-500 focus:outline-none"
              >
                <option value="all">Todas as especialidades</option>
                <option value="Cannabis Medicinal">Cannabis Medicinal</option>
                <option value="Nefrologia">Nefrologia</option>
                <option value="Clínica Geral">Clínica Geral</option>
                <option value="Dor Crônica">Dor Crônica</option>
              </select>
            </div>
          </div>

          {/* Lista de Consultas */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Carregando agendamentos...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>Nenhum agendamento encontrado</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-white font-semibold">{appointment.patientName}</h4>
                        <p className="text-slate-400 text-sm">{appointment.specialty}</p>
                      </div>
                      <div className="text-slate-300 text-sm">
                        <p>{new Date(appointment.date).toLocaleDateString('pt-BR')}</p>
                        <p>{appointment.time} ({appointment.duration}min)</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-slate-400 text-sm mt-2">{appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-400 hover:text-green-300 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Total de Consultas</h3>
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{analytics.totalAppointments}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Taxa de Conclusão</h3>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{analytics.completionRate}%</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Avaliação Média</h3>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{analytics.averageRating}/5</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Receita Total</h3>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">R$ {analytics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultas por Especialidade */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Consultas por Especialidade</h3>
              <div className="space-y-3">
                {analytics.appointmentsBySpecialty.map((item) => (
                  <div key={item.specialty} className="flex items-center justify-between">
                    <span className="text-slate-300">{item.specialty}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...analytics.appointmentsBySpecialty.map(i => i.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ocupação por Horário */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Ocupação por Horário</h3>
              <div className="space-y-3">
                {analytics.occupancyByHour.map((item) => (
                  <div key={item.hour} className="flex items-center justify-between">
                    <span className="text-slate-300">{item.hour}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold">{item.percentage}%</span>
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

export default EduardoScheduling
