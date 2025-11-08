import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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
import {
  SCHEDULING_CONFIG,
  clampToSchedulingStartDate,
  generateAppointmentSlots,
  isSchedulingWorkingDay
} from '../lib/schedulingConfig'

const ProfessionalScheduling: React.FC = () => {
  const { user } = useAuth()
  const schedulingStartDate = useMemo(() => {
    const date = new Date(SCHEDULING_CONFIG.startDateISO)
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const [currentDate, setCurrentDate] = useState(() => clampToSchedulingStartDate(new Date()))
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
    type: 'online',
    specialty: '',
    service: 'Primeira consulta',
    room: '',
    notes: '',
    duration: 60,
    priority: 'normal'
  })

  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isCreatingPatient, setIsCreatingPatient] = useState(false)
  const [isSavingPatient, setIsSavingPatient] = useState(false)
  const [createPatientError, setCreatePatientError] = useState<string | null>(null)
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const findNextWorkingDate = (base: Date): Date => {
    const candidate = clampToSchedulingStartDate(new Date(base))
    candidate.setHours(0, 0, 0, 0)

    let guard = 0
    while (!isSchedulingWorkingDay(candidate)) {
      candidate.setDate(candidate.getDate() + 1)
      guard += 1
      if (guard > 21) break
    }

    return candidate
  }

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(findNextWorkingDate(currentDate))
    }
  }, [selectedDate, currentDate])

  // Carregar dados do Supabase
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      // Buscar agendamentos do profissional
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', user.id)
        .order('appointment_date', { ascending: true })

      if (appointmentsError) {
        console.error('Erro ao carregar agendamentos:', appointmentsError)
        return
      }

      // Buscar pacientes disponíveis (todos pacientes cadastrados)
      const { data: patientsData, error: patientsError } = await supabase
        .from('users')
        .select('id, name, email, phone')
        .eq('type', 'patient')
        .order('name', { ascending: true })

      if (patientsError) {
        console.error('Erro ao carregar pacientes:', patientsError)
      }

      // Transformar agendamentos
      const formattedAppointments = (appointmentsData || []).map((apt: any) => {
        const appointmentDate = new Date(apt.appointment_date)
        const patient = patientsData?.find((p: any) => p.id === apt.patient_id)
        return {
          id: apt.id,
          patientId: apt.patient_id,
          patientName: patient?.name || 'Paciente',
          date: appointmentDate.toISOString().split('T')[0],
          time: appointmentDate.toTimeString().slice(0, 5),
          type: apt.is_remote ? 'online' : 'presencial',
          specialty: apt.type || 'Cannabis Medicinal',
          service: apt.title || 'Consulta',
          room: apt.location || (apt.is_remote ? 'Plataforma digital' : 'Sala'),
          status: apt.status,
          duration: apt.duration || 60,
          priority: 'normal',
          notes: apt.description || apt.notes,
          rating: apt.rating,
          patientComment: apt.comment,
          createdAt: new Date(apt.created_at).toISOString().split('T')[0]
        }
      })

      setAppointments(formattedAppointments)
      setPatients(patientsData || [])

      // Calcular analytics
      const totalAppointments = formattedAppointments.length
      const completedAppointments = formattedAppointments.filter(a => a.status === 'completed').length
      const cancelledAppointments = formattedAppointments.filter(a => a.status === 'cancelled').length
      const ratings = formattedAppointments.filter(a => a.rating).map(a => a.rating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0

      // Buscar transações para calcular receita
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

      setAnalyticsData({
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRevenue,
        monthlyStats: [], // TODO: Calcular estatísticas mensais
        specialtyStats: [], // TODO: Calcular estatísticas por especialidade
        timeSlotStats: [] // TODO: Calcular estatísticas por horário
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  // Horários disponíveis
  const timeSlots = useMemo(
    () =>
      generateAppointmentSlots(
        SCHEDULING_CONFIG.startTime,
        SCHEDULING_CONFIG.endTime,
        SCHEDULING_CONFIG.appointmentDurationMinutes,
        SCHEDULING_CONFIG.bufferMinutes
      ),
    []
  )

  // Especialidades
  const specialties = [
    'Neurologia',
    'Nefrologia',
    'Homeopatia'
  ]

  const specialtyConsultorioMap: Record<string, string[]> = {
    Neurologia: ['Consultório Escola Eduardo Faveret'],
    Nefrologia: ['Consultório Escola Ricardo Valença'],
    Homeopatia: ['Consultório Escola Ricardo Valença']
  }

  // Salas disponíveis (consultórios)
  const rooms = useMemo(() => {
    if (!appointmentData.specialty || !specialtyConsultorioMap[appointmentData.specialty]) {
      return [
        'Consultório Escola Ricardo Valença',
        'Consultório Escola Eduardo Faveret'
      ]
    }
    return specialtyConsultorioMap[appointmentData.specialty]
  }, [appointmentData.specialty])

  useEffect(() => {
    if (rooms.length > 0 && !rooms.includes(appointmentData.room)) {
      setAppointmentData(prev => ({
        ...prev,
        room: rooms[0]
      }))
    }
  }, [rooms])

  const resetNewPatientForm = () => {
    setNewPatientData({
      name: '',
      email: '',
      phone: ''
    })
    setCreatePatientError(null)
    setIsSavingPatient(false)
  }

  const handleCreatePatient = async () => {
    if (isSavingPatient) return

    const name = newPatientData.name.trim()
    const email = newPatientData.email.trim().toLowerCase()
    const phone = newPatientData.phone.trim()

    if (!name || !email) {
      setCreatePatientError('Informe pelo menos nome e email do paciente.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setCreatePatientError('Informe um email válido.')
      return
    }

    try {
      setIsSavingPatient(true)
      setCreatePatientError(null)

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existing) {
        setCreatePatientError('Já existe um paciente cadastrado com este email.')
        setIsSavingPatient(false)
        return
      }

      const patientId = crypto.randomUUID()
      const now = new Date().toISOString()

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: patientId,
          name,
          email,
          phone: phone || null,
          type: 'patient',
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setPatients(prev => [...prev, newUser])
      setAppointmentData(prev => ({
        ...prev,
        patientId: newUser.id,
        patientName: newUser.name
      }))
      setIsCreatingPatient(false)
      resetNewPatientForm()
    } catch (error: any) {
      console.error('Erro ao criar paciente:', error)
      setCreatePatientError(error?.message || 'Não foi possível criar o paciente. Tente novamente.')
    } finally {
      setIsSavingPatient(false)
    }
  }

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
       prevMonth.setHours(0, 0, 0, 0)
       const fullDate = new Date(year, month - 1, prevMonth.getDate() - i)
       fullDate.setHours(0, 0, 0, 0)
      days.push({
        date: fullDate.getDate(),
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: [],
        isDisabled: true
      })
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)
      const isToday = date.toDateString() === new Date().toDateString()
      const dayAppointments = appointments.filter(apt => 
        apt.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      )
      const isBeforeStart = date < schedulingStartDate
      const isWorking = isSchedulingWorkingDay(date)
      
      days.push({
        date: day,
        fullDate: date,
        isCurrentMonth: true,
        isToday,
        appointments: dayAppointments,
        isDisabled: isBeforeStart || !isWorking
      })
    }

    // Dias do próximo mês
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const fullDate = new Date(year, month + 1, day)
      fullDate.setHours(0, 0, 0, 0)
      days.push({
        date: fullDate.getDate(),
        fullDate,
        isCurrentMonth: false,
        isToday: false,
        appointments: [],
        isDisabled: true
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
      newDate.setDate(1)
      newDate.setHours(0, 0, 0, 0)
      if (newDate < schedulingStartDate) {
        return new Date(schedulingStartDate)
      }
      return newDate
    })
  }

  // Função para selecionar data
  const handleDateSelect = (day: any) => {
    if (day.isCurrentMonth && !day.isDisabled) {
      setSelectedDate(new Date(day.fullDate))
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
  const handleSaveAppointment = async () => {
    if (
      !appointmentData.patientId ||
      !appointmentData.date ||
      !appointmentData.time ||
      !appointmentData.specialty ||
      !appointmentData.service ||
      !appointmentData.room ||
      !user
    ) {
      alert('Preencha todos os campos obrigatórios antes de salvar o agendamento.')
      return
    }

    try {
      // 1. Verificar disponibilidade do horário
      const appointmentDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`)
      
      // Verificar conflitos
      const { data: conflicting } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', user.id)
        .eq('appointment_date', appointmentDateTime.toISOString())
        .in('status', ['scheduled', 'confirmed'])
        .maybeSingle()
      
      if (conflicting) {
        alert('Este horário já está ocupado. Por favor, escolha outro horário.')
        return
      }
      
      // 2. Salvar no Supabase
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointmentData.patientId,
          professional_id: user.id,
          appointment_date: appointmentDateTime.toISOString(),
          appointment_time: appointmentData.time,
          appointment_type: appointmentData.service,
          specialty: appointmentData.specialty || 'Neurologia',
          status: 'scheduled',
          type: 'consultation',
          is_remote: true,
          duration: appointmentData.duration || 60,
          description: appointmentData.notes || '',
          location: appointmentData.room || 'Consultório Escola Ricardo Valença',
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      // 3. Recarregar dados
      await loadData()
      
      // 4. Fechar modal e limpar formulário
      setShowAppointmentModal(false)
      setAppointmentData({
        patientId: '',
        patientName: '',
        date: '',
        time: '',
        type: 'online',
        specialty: '',
        service: 'Primeira consulta',
        room: rooms[0] || '',
        notes: '',
        duration: 60,
        priority: 'normal'
      })
      
      alert('Agendamento criado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error)
      alert(`Erro ao criar agendamento: ${error.message || 'Tente novamente.'}`)
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
                day.isDisabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''
              } ${
                selectedDate &&
                day.isCurrentMonth &&
                selectedDate.toDateString() === day.fullDate.toDateString()
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
                        const selectedId = e.target.value
                        const patient = patients.find((p: any) => String(p.id) === selectedId)
                        setAppointmentData({
                          ...appointmentData,
                          patientId: selectedId,
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
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCreatePatientError(null)
                          setIsCreatingPatient(prev => {
                            if (prev) {
                              resetNewPatientForm()
                              return false
                            }
                            return true
                          })
                        }}
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {isCreatingPatient ? 'Cancelar novo paciente' : '➕ Cadastrar novo paciente'}
                      </button>
                    </div>
                    {isCreatingPatient && (
                      <div className="mt-3 space-y-3 bg-slate-900/60 border border-slate-700/60 rounded-lg p-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Nome completo</label>
                          <input
                            type="text"
                            value={newPatientData.name}
                            onChange={(e) => setNewPatientData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="Ex: Maria da Silva"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Email</label>
                          <input
                            type="email"
                            value={newPatientData.email}
                            onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="paciente@exemplo.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Telefone</label>
                          <input
                            type="tel"
                            value={newPatientData.phone}
                            onChange={(e) => setNewPatientData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        {createPatientError && (
                          <p className="text-xs text-red-400">{createPatientError}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCreatePatient}
                            disabled={isSavingPatient}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSavingPatient ? 'Salvando...' : 'Salvar paciente'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingPatient(false)
                              resetNewPatientForm()
                            }}
                            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>
                    )}
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
                    <input
                      type="text"
                      value="Online"
                      readOnly
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white uppercase tracking-wide"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Especialidade</label>
                    <select
                      value={appointmentData.specialty}
                      onChange={(e) => setAppointmentData({ ...appointmentData, specialty: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      required
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
                  <select
                    value={appointmentData.service}
                    onChange={(e) => setAppointmentData({ ...appointmentData, service: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    required
                  >
                    <option value="Primeira consulta">Primeira consulta</option>
                    <option value="Retorno">Retorno</option>
                  </select>
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
