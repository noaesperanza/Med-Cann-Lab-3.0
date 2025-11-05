import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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
  LineChart,
  Brain
} from 'lucide-react'

const PatientAppointments: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [carePlan, setCarePlan] = useState<any>(null)

  // Carregar agendamentos e plano de cuidado
  useEffect(() => {
    if (user?.id) {
      loadAppointments()
      loadCarePlan()
    }
  }, [user?.id])

  const loadAppointments = async () => {
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user!.id)
        .order('appointment_date', { ascending: true })

      if (!error && appointmentsData) {
        const formattedAppointments = appointmentsData.map((apt: any) => ({
          id: apt.id,
          date: apt.appointment_date,
          time: apt.appointment_time || '09:00',
          professional: apt.professional_name || 'Dr. Ricardo Valença',
          type: apt.appointment_type || 'Consulta',
          service: apt.service_type || '',
          status: apt.status || 'scheduled',
          doctorName: apt.professional_name || 'Dr. Ricardo Valença',
          doctorSpecialty: apt.specialty || 'Nefrologia',
          room: apt.room || 'Virtual',
          notes: apt.notes || '',
          priority: apt.priority || 'normal'
        }))

        setAppointments(formattedAppointments)
        
        // Filtrar próximas consultas (apenas agendadas e futuras)
        const now = new Date()
        const upcoming = formattedAppointments.filter(apt => {
          const aptDate = new Date(`${apt.date}T${apt.time}`)
          return apt.status === 'scheduled' && aptDate >= now
        }).slice(0, 3) // Próximas 3 consultas
        
        setUpcomingAppointments(upcoming)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }

  const loadCarePlan = async () => {
    try {
      // Buscar plano de cuidado do paciente (pode estar em clinical_assessments ou outra tabela)
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('patient_id', user!.id)
        .eq('assessment_type', 'INITIAL')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && assessments) {
        setCarePlan({
          id: assessments.id,
          progress: assessments.data?.progress || 0,
          nextReview: assessments.data?.nextReview || null,
          medications: assessments.data?.medications || []
        })
      }
    } catch (error) {
      console.error('Erro ao carregar plano de cuidado:', error)
    }
  }

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
    if (!appointmentData.date || !appointmentData.time || !appointmentData.specialty || !appointmentData.service) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    try {
      // TODO: Salvar agendamento no banco vinculado à avaliação clínica inicial pela IA residente
      // O agendamento será processado pela IA residente que realizará a avaliação clínica inicial
      // e gerará o relatório que será direcionado para o prontuário do paciente
      
      // Salvar agendamento no Supabase
      const { data: sessionData } = await supabase.auth.getSession()
      const patientId = sessionData?.session?.user?.id
      
      if (patientId) {
        const { error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            appointment_date: appointmentData.date,
            appointment_time: appointmentData.time,
            appointment_type: appointmentData.service || 'Consulta',
            status: 'scheduled',
            notes: appointmentData.notes,
            specialty: appointmentData.specialty,
            type: appointmentData.type
          })

        if (appointmentError) {
          console.error('Erro ao salvar agendamento:', appointmentError)
        }
      }
      
      // Fechar modal
      setShowAppointmentModal(false)
      
      // Redirecionar para a IA residente para avaliação clínica inicial
      navigate('/app/chat-noa-esperanca', {
        state: {
          startAssessment: true,
          appointmentData: {
            date: appointmentData.date,
            time: appointmentData.time,
            specialty: appointmentData.specialty,
            service: appointmentData.service,
            type: appointmentData.type
          }
        }
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
      <div className="bg-slate-800 rounded-xl p-4 md:p-6">
        {/* Header do calendário - mais compacto */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Dias da semana - mais compacto */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayNames.map(day => (
            <div key={day} className="p-1.5 text-center text-xs font-medium text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do calendário - menor e mais compacto */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateSelect(day)}
              className={`p-1.5 h-14 md:h-16 border border-slate-700 rounded-md cursor-pointer transition-all hover:scale-105 ${
                day.isCurrentMonth
                  ? 'hover:bg-slate-700/50'
                  : 'text-slate-500 opacity-50'
              } ${
                day.isToday
                  ? 'bg-primary-600/20 border-primary-500 ring-1 ring-primary-500'
                  : ''
              } ${
                selectedDate && day.isCurrentMonth && 
                selectedDate.getDate() === day.date
                  ? 'bg-primary-600 border-primary-500 ring-2 ring-primary-400'
                  : ''
              }`}
            >
              <div className="text-xs md:text-sm font-medium mb-0.5">
                {day.date}
              </div>
              {day.appointments.length > 0 && (
                <div className="space-y-0.5">
                  {day.appointments.slice(0, 1).map(apt => (
                    <div
                      key={apt.id}
                      className={`text-[10px] px-0.5 py-0.5 rounded truncate ${
                        apt.priority === 'high'
                          ? 'bg-red-500/30 text-red-300'
                          : apt.priority === 'normal'
                          ? 'bg-blue-500/30 text-blue-300'
                          : 'bg-green-500/30 text-green-300'
                      }`}
                      title={`${apt.time} - ${apt.doctorName}`}
                    >
                      {apt.time}
                    </div>
                  ))}
                  {day.appointments.length > 1 && (
                    <div className="text-[10px] text-slate-400 font-medium">
                      +{day.appointments.length - 1}
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
      <div className="bg-slate-800 rounded-xl p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-3">
          Horários Disponíveis - {selectedDate.toLocaleDateString('pt-BR')}
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {timeSlots.map(time => {
            const isBooked = bookedTimes.includes(time)
            return (
              <button
                key={time}
                onClick={() => !isBooked && handleTimeSelect(time)}
                disabled={isBooked}
                className={`p-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  isBooked
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-slate-700 hover:bg-primary-600 hover:scale-105 text-slate-300 hover:text-white active:scale-95'
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Header - mais compacto */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Meus Agendamentos</h1>
            <p className="text-sm md:text-base text-slate-400">Gerencie suas consultas e visualize seu calendário integrado ao seu plano de cuidado</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-colors text-sm flex items-center ${
                viewMode === 'calendar'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Calendário
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors text-sm flex items-center ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Lista
            </button>
          </div>
        </div>

        {/* Jornada do Paciente - Explicação do Fluxo */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-3">🎯 Sua Jornada de Cuidado</h3>
              <p className="text-slate-300 mb-4 text-sm">
                Para garantir o melhor atendimento, seguimos uma jornada estruturada que começa com sua avaliação clínica inicial.
              </p>
              
              {/* Fluxo em Passos */}
              <div className="space-y-4 mb-4">
                {/* Passo 1: Avaliação Clínica */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">🧠 Avaliação Clínica Inicial</h4>
                      <p className="text-slate-300 text-sm mb-2">
                        Realize uma avaliação clínica completa com a IA Residente Nôa Esperança usando o protocolo IMRE.
                        Esta avaliação é <strong className="text-white">privada e confidencial</strong> - apenas você pode ver o conteúdo completo do relatório.
                      </p>
                      <button
                        onClick={() => navigate('/app/chat-noa-esperanca')}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      >
                        <Brain className="w-4 h-4" />
                        <span>Iniciar Avaliação Clínica</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Passo 2: Relatório */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">📋 Relatório Gerado</h4>
                      <p className="text-slate-300 text-sm mb-2">
                        Após a avaliação, a IA gera um relatório clínico completo que fica disponível no seu histórico de saúde.
                        <strong className="text-white"> Você controla o compartilhamento</strong> - o médico não recebe automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passo 3: Compartilhamento */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">🔐 Compartilhamento Seguro</h4>
                      <p className="text-slate-300 text-sm mb-2">
                        Quando você agendar uma consulta, você pode <strong className="text-white">opcionalmente compartilhar</strong> o relatório com o profissional.
                        O médico saberá que um relatório existe, mas só verá o conteúdo se você compartilhar explicitamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passo 4: Consulta */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">📅 Agendar Consulta</h4>
                      <p className="text-slate-300 text-sm">
                        Após a avaliação, agende sua consulta com os profissionais da plataforma.
                        Todas as suas consultas ficam integradas ao seu plano de cuidado personalizado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs">
                  <strong className="text-blue-200">🔒 Segurança de Dados:</strong> Todos os seus dados são protegidos por sigilo médico e LGPD. 
                  Você tem controle total sobre o compartilhamento do seu relatório de avaliação clínica.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Próximas Consultas - Integrado ao Plano de Cuidado */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">📅 Próximas Consultas</h3>
              {carePlan && (
                <p className="text-sm text-slate-400 mt-1">
                  Relacionadas ao seu plano de cuidado • Progresso: {carePlan.progress || 0}%
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAppointmentModal(true)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar nova consulta</span>
            </button>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{apt.professional}</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                      </p>
                      <p className="text-slate-500 text-xs">{apt.service || apt.type}</p>
                    </div>
                    {carePlan && carePlan.nextReview && new Date(carePlan.nextReview) <= new Date(`${apt.date}T${apt.time}`) && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
                        <p className="text-green-400 text-xs font-medium">Revisão do Plano</p>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ml-4 ${
                    apt.status === 'scheduled' ? 'bg-green-500/20 text-green-400' :
                    apt.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {apt.status === 'scheduled' ? 'Agendada' :
                     apt.status === 'completed' ? 'Concluída' : 'Cancelada'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 mb-2">Nenhuma consulta agendada</p>
              <p className="text-slate-500 text-sm mb-4">
                Suas consultas estarão integradas ao seu plano de cuidado personalizado
              </p>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar sua primeira consulta</span>
              </button>
            </div>
          )}
        </div>

        {/* Informações do Plano de Cuidado */}
        {carePlan && (
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-semibold">Plano de Cuidado Personalizado</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-xs mb-1">Progresso do Tratamento</p>
                <p className="text-white font-bold text-lg">{carePlan.progress || 0}%</p>
              </div>
              {carePlan.nextReview && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Próxima Revisão</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(carePlan.nextReview).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {carePlan.medications && carePlan.medications.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Medicações Ativas</p>
                  <p className="text-white font-bold text-lg">{carePlan.medications.length}</p>
                </div>
              )}
            </div>
          </div>
        )}

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
                  <label className="block text-sm text-slate-400 mb-2">Tipo de Serviço <span className="text-red-400">*</span></label>
                  <select
                    value={appointmentData.service}
                    onChange={(e) => setAppointmentData({...appointmentData, service: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    required
                  >
                    <option value="">Selecione o tipo de serviço</option>
                    <option value="avaliacao-clinica-inicial-noa">Avaliação clínica inicial com Nôa Esperança</option>
                    <option value="consulta-primeira-vez">Consulta de primeira vez</option>
                    <option value="consulta-retorno">Consulta de retorno</option>
                    <option value="pareceres-clinicas-hospitais">Pareceres em clínicas e hospitais</option>
                    <option value="consultas-domiciliares">Consultas domiciliares</option>
                  </select>
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
