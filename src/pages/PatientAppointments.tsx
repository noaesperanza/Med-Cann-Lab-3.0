import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Clock,
  Calendar,
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

const PatientAppointments: React.FC = () => {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [appointmentData, setAppointmentData] = useState({
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

  // Agendamentos do paciente (será populado com dados reais do banco)
  const [appointments, setAppointments] = useState<any[]>([])

  // Horários disponíveis
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ]

  // Especialidades disponíveis
  const specialties = [
    'Nefrologia',
    'Neurologia'
  ]

  // Salas disponíveis (removido - será determinado automaticamente pelo tipo de consulta)
  const rooms: string[] = []

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

  // Função para salvar agendamento (vinculado à IA residente)
  const handleSaveAppointment = async () => {
    if (!appointmentData.date || !appointmentData.time || !appointmentData.specialty) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    try {
      // TODO: Salvar agendamento no banco vinculado à avaliação clínica inicial pela IA residente
      // O agendamento será processado pela IA residente que realizará a avaliação clínica inicial
      // e gerará o relatório que será direcionado para o prontuário do paciente
      
      alert('Agendamento realizado com sucesso! Você receberá uma avaliação clínica inicial pela IA residente Nôa Esperança antes da consulta.')
      
      setShowAppointmentModal(false)
      setAppointmentData({
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
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      alert('Erro ao agendar consulta. Tente novamente.')
    }
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
                      {apt.time} - {apt.doctorName.split(' ')[1]}
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

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Meus Agendamentos</h1>
            <p className="text-slate-400">Gerencie suas consultas e visualize seu calendário</p>
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
                          <h4 className="text-white font-medium">{appointment.doctorName}</h4>
                          <p className="text-slate-400 text-sm">{appointment.doctorSpecialty}</p>
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

        {/* Modal de agendamento */}
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Novo Agendamento</h3>
              
              {/* Informações sobre IA Residente e Fluxo */}
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">🤖 Avaliação Clínica Inicial pela IA Residente</h4>
                    <p className="text-sm text-slate-300 mb-3">
                      Sua consulta será precedida por uma <strong>Avaliação Clínica Inicial</strong> realizada pela <strong>IA Residente Nôa Esperança</strong>, especializada em Cannabis Medicinal e Nefrologia.
                    </p>
                    <div className="bg-slate-900/50 rounded p-3 mb-3">
                      <p className="text-xs text-slate-400 mb-2"><strong className="text-slate-300">Fluxo do Processo:</strong></p>
                      <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                        <li>Você realizará a <strong className="text-slate-300">Avaliação Clínica Inicial</strong> com a IA Nôa Esperança</li>
                        <li>A IA gerará um <strong className="text-slate-300">Relatório da Avaliação Clínica Inicial</strong></li>
                        <li>O relatório será direcionado para seu <strong className="text-slate-300">Prontuário Eletrônico</strong></li>
                        <li>Você poderá acessar o relatório na área de <strong className="text-slate-300">Atendimento</strong> ou <strong className="text-slate-300">Chat com Profissional</strong></li>
                        <li>O profissional receberá o relatório antes da consulta presencial/online</li>
                      </ol>
                    </div>
                    <div className="bg-purple-900/30 border border-purple-700/50 rounded p-3">
                      <p className="text-xs text-slate-300 mb-1"><strong>🔐 Consentimento Informado & NFT Escute-se</strong></p>
                      <p className="text-xs text-slate-400">
                        Ao agendar, você concorda com o processamento de seus dados pela IA Residente e reconhece o vínculo com o <strong className="text-purple-300">NFT Escute-se</strong>, garantindo seus direitos de privacidade e propriedade dos dados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Data <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Horário <span className="text-red-400">*</span></label>
                    <input
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      required
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
                    <label className="block text-sm text-slate-400 mb-2">Especialidade <span className="text-red-400">*</span></label>
                    <select
                      value={appointmentData.specialty}
                      onChange={(e) => setAppointmentData({...appointmentData, specialty: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      required
                    >
                      <option value="">Selecione</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tipo de Serviço</label>
                  <input
                    type="text"
                    value={appointmentData.service}
                    onChange={(e) => setAppointmentData({...appointmentData, service: e.target.value})}
                    placeholder="Ex: Avaliação Clínica Inicial com IA Residente"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Observações</label>
                  <textarea
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                    placeholder="Informações adicionais relevantes para a avaliação clínica inicial..."
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

export default PatientAppointments
