import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  Plus,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle,
  Heart,
  ThumbsUp,
  MessageSquare,
  FileText,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Bell,
  Award,
  Target,
  Zap,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react'

const ProfessionalScheduling: React.FC = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'analytics'>('calendar')
  const [appointmentData, setAppointmentData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    time: '',
    type: 'presencial',
    specialty: '',
    service: '',
    room: '',
    notes: '',
    duration: 60,
    priority: 'normal'
  })

  // Mock dados de pacientes
  const patients = [
    { id: 1, name: 'Maria Silva', email: 'maria.silva@email.com', phone: '(11) 99999-9999' },
    { id: 2, name: 'João Santos', email: 'joao.santos@email.com', phone: '(11) 88888-8888' },
    { id: 3, name: 'Ana Costa', email: 'ana.costa@email.com', phone: '(11) 77777-7777' },
    { id: 4, name: 'Carlos Lima', email: 'carlos.lima@email.com', phone: '(11) 66666-6666' }
  ]

  // Mock dados de agendamentos
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientId: 1,
      patientName: 'Maria Silva',
      date: '2024-02-15',
      time: '14:00',
      type: 'presencial',
      specialty: 'Cardiologia',
      service: 'Consulta de retorno',
      room: 'Sala 201',
      status: 'agendado',
      duration: 60,
      priority: 'normal',
      notes: 'Trazer exames de sangue',
      rating: 5,
      patientComment: 'Excelente atendimento!',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      patientId: 2,
      patientName: 'João Santos',
      date: '2024-02-16',
      time: '10:00',
      type: 'online',
      specialty: 'Endocrinologia',
      service: 'Consulta online',
      room: 'Plataforma digital',
      status: 'agendado',
      duration: 45,
      priority: 'high',
      notes: 'Consulta por videochamada',
      rating: 4,
      patientComment: 'Muito bom, esclareceu minhas dúvidas.',
      createdAt: '2024-01-16'
    },
    {
      id: 3,
      patientId: 3,
      patientName: 'Ana Costa',
      date: '2024-02-17',
      time: '09:00',
      type: 'presencial',
      specialty: 'Clínica Geral',
      service: 'Primeira consulta',
      room: 'Sala 101',
      status: 'agendado',
      duration: 90,
      priority: 'normal',
      notes: 'Avaliação completa',
      rating: null,
      patientComment: null,
      createdAt: '2024-01-17'
    }
  ])

  // Mock dados de analytics
  const analyticsData = {
    totalAppointments: 156,
    completedAppointments: 142,
    cancelledAppointments: 8,
    averageRating: 4.7,
    totalRevenue: 12500,
    monthlyStats: [
      { month: 'Jan', appointments: 45, revenue: 3500, rating: 4.6 },
      { month: 'Fev', appointments: 52, revenue: 4200, rating: 4.8 },
      { month: 'Mar', appointments: 48, revenue: 3800, rating: 4.7 },
      { month: 'Abr', appointments: 41, revenue: 3200, rating: 4.5 }
    ],
    specialtyStats: [
      { specialty: 'Cardiologia', appointments: 45, revenue: 4500 },
      { specialty: 'Endocrinologia', appointments: 38, revenue: 3800 },
      { specialty: 'Clínica Geral', appointments: 35, revenue: 2800 },
      { specialty: 'Neurologia', appointments: 28, revenue: 3500 }
    ],
    timeSlotStats: [
      { time: '08:00-09:00', appointments: 12, utilization: 80 },
      { time: '09:00-10:00', appointments: 18, utilization: 90 },
      { time: '10:00-11:00', appointments: 15, utilization: 75 },
      { time: '14:00-15:00', appointments: 20, utilization: 100 },
      { time: '15:00-16:00', appointments: 16, utilization: 80 }
    ]
  }

  // Horários disponíveis
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ]

  // Especialidades
  const specialties = [
    'Cardiologia', 'Endocrinologia', 'Neurologia', 'Clínica Geral',
    'Psiquiatria', 'Dermatologia', 'Oftalmologia', 'Ortopedia'
  ]

  // Salas disponíveis
  const rooms = [
    'Sala 101', 'Sala 102', 'Sala 201', 'Sala 202', 'Sala 301', 'Sala 302',
    'Plataforma digital', 'Telemedicina'
  ]

  // Função para gerar dias do mês
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Dias do mês anterior
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, 0)
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
        appointments: []
      })
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === new Date().toDateString()
      const dayAppointments = appointments.filter(apt => 
        apt.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      )
      
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday,
        appointments: dayAppointments
      })
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        appointments: []
      })
    }

    return days
  }

  // Função para navegar entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Função para selecionar data
  const handleDateSelect = (day: any) => {
    if (day.isCurrentMonth) {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date))
      setSelectedTime(null)
    }
  }

  // Função para selecionar horário
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setAppointmentData(prev => ({
      ...prev,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      time
    }))
    setShowAppointmentModal(true)
  }

  // Função para salvar agendamento
  const handleSaveAppointment = () => {
    const newAppointment = {
      id: appointments.length + 1,
      patientId: parseInt(appointmentData.patientId),
      patientName: appointmentData.patientName,
      date: appointmentData.date,
      time: appointmentData.time,
      type: appointmentData.type,
      specialty: appointmentData.specialty,
      service: appointmentData.service,
      room: appointmentData.room,
      status: 'agendado',
      duration: appointmentData.duration,
      priority: appointmentData.priority,
      notes: appointmentData.notes,
      rating: null,
      patientComment: null,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setAppointments([...appointments, newAppointment])
    setShowAppointmentModal(false)
    setAppointmentData({
      patientId: '',
      patientName: '',
      date: '',
      time: '',
      type: 'presencial',
      specialty: '',
      service: '',
      room: '',
      notes: '',
      duration: 60,
      priority: 'normal'
    })
  }

  // Função para renderizar calendário
  const renderCalendar = () => {
    const days = generateCalendarDays()
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="bg-slate-800 rounded-xl p-6">
        {/* Header do calendário */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateSelect(day)}
              className={`p-2 h-20 border border-slate-700 rounded-lg cursor-pointer transition-colors ${
                day.isCurrentMonth
                  ? 'hover:bg-slate-700'
                  : 'text-slate-500'
              } ${
                day.isToday
                  ? 'bg-primary-600/20 border-primary-500'
                  : ''
              } ${
                selectedDate && day.isCurrentMonth && 
                selectedDate.getDate() === day.date
                  ? 'bg-primary-600 border-primary-500'
                  : ''
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {day.date}
              </div>
              {day.appointments.length > 0 && (
                <div className="space-y-1">
                  {day.appointments.slice(0, 2).map(apt => (
                    <div
                      key={apt.id}
                      className={`text-xs px-1 py-0.5 rounded ${
                        apt.priority === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : apt.priority === 'normal'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {apt.time} - {apt.patientName.split(' ')[0]}
                    </div>
                  ))}
                  {day.appointments.length > 2 && (
                    <div className="text-xs text-slate-400">
                      +{day.appointments.length - 2} mais
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Função para renderizar horários disponíveis
  const renderTimeSlots = () => {
    if (!selectedDate) return null

    const selectedDateStr = selectedDate.toISOString().split('T')[0]
    const dayAppointments = appointments.filter(apt => apt.date === selectedDateStr)
    const bookedTimes = dayAppointments.map(apt => apt.time)

    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Horários Disponíveis - {selectedDate.toLocaleDateString('pt-BR')}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {timeSlots.map(time => {
            const isBooked = bookedTimes.includes(time)
            return (
              <button
                key={time}
                onClick={() => !isBooked && handleTimeSelect(time)}
                disabled={isBooked}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  isBooked
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-primary-600 text-slate-300 hover:text-white'
                }`}
              >
                {time}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Função para renderizar analytics
  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total de Consultas</p>
              <p className="text-2xl font-bold text-white">{analyticsData.totalAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-white">
                {Math.round((analyticsData.completedAppointments / analyticsData.totalAppointments) * 100)}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avaliação Média</p>
              <p className="text-2xl font-bold text-white">{analyticsData.averageRating}/5</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-white">R$ {analyticsData.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de especialidades */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Consultas por Especialidade</h3>
          <div className="space-y-3">
            {analyticsData.specialtyStats.map(specialty => (
              <div key={specialty.specialty} className="flex items-center justify-between">
                <span className="text-slate-300">{specialty.specialty}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(specialty.appointments / 50) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium">{specialty.appointments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de horários */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ocupação por Horário</h3>
          <div className="space-y-3">
            {analyticsData.timeSlotStats.map(slot => (
              <div key={slot.time} className="flex items-center justify-between">
                <span className="text-slate-300">{slot.time}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${slot.utilization}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium">{slot.utilization}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Sistema de Agendamento</h1>
            <p className="text-slate-400">Gerencie consultas, visualize analytics e acompanhe performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendário
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Conteúdo baseado na visualização */}
        {viewMode === 'calendar' && (
          <div className="space-y-6">
            {renderCalendar()}
            {selectedDate && renderTimeSlots()}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Próximas Consultas</h3>
            <div className="space-y-4">
              {appointments.map(appointment => (
                <div key={appointment.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{appointment.patientName}</h4>
                          <p className="text-slate-400 text-sm">{appointment.specialty}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Data</p>
                          <p className="text-white">{appointment.date}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Horário</p>
                          <p className="text-white">{appointment.time}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Tipo</p>
                          <p className="text-white capitalize">{appointment.type}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Sala</p>
                          <p className="text-white">{appointment.room}</p>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-2">
                          <p className="text-slate-400 text-sm">Observações</p>
                          <p className="text-slate-300 text-sm">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-yellow-400">{appointment.rating}</span>
                        </div>
                      )}
                      <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'analytics' && renderAnalytics()}

        {/* Modal de agendamento */}
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Novo Agendamento</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Paciente</label>
                    <select
                      value={appointmentData.patientId}
                      onChange={(e) => {
                        const patient = patients.find(p => p.id === parseInt(e.target.value))
                        setAppointmentData({
                          ...appointmentData,
                          patientId: e.target.value,
                          patientName: patient?.name || ''
                        })
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Selecione um paciente</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>{patient.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Data</label>
                    <input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Horário</label>
                    <input
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Tipo</label>
                    <select
                      value={appointmentData.type}
                      onChange={(e) => setAppointmentData({...appointmentData, type: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="presencial">Presencial</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Especialidade</label>
                    <select
                      value={appointmentData.specialty}
                      onChange={(e) => setAppointmentData({...appointmentData, specialty: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Selecione</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Sala</label>
                    <select
                      value={appointmentData.room}
                      onChange={(e) => setAppointmentData({...appointmentData, room: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Selecione</option>
                      {rooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Serviço</label>
                  <input
                    type="text"
                    value={appointmentData.service}
                    onChange={(e) => setAppointmentData({...appointmentData, service: e.target.value})}
                    placeholder="Ex: Consulta de retorno"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Observações</label>
                  <textarea
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                    placeholder="Observações adicionais..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white h-20"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAppointment}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfessionalScheduling
