import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Users,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface WorkingHours {
  day: string
  startHour: string
  endHour: string
  slots: string[]
}

interface Professional {
  id: string
  name: string
  specialty: string
  workingDays: string[]
  workingHours: { start: string, end: string }
  avatar: string
}

const Scheduling: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Dados dos profissionais
  const professionals: Professional[] = [
    {
      id: 'ricardo-valenca',
      name: 'Dr. Ricardo Valença',
      specialty: 'Coordenador Científico',
      workingDays: ['Terça', 'Quinta'],
      workingHours: { start: '14:00', end: '22:00' },
      avatar: '👨‍⚕️'
    },
    {
      id: 'eduardo-faveret',
      name: 'Dr. Eduardo Faveret',
      specialty: 'Diretor Médico',
      workingDays: ['Segunda', 'Quarta', 'Sexta'],
      workingHours: { start: '14:00', end: '22:00' },
      avatar: '👨‍⚕️'
    }
  ]

  // Gerar horários disponíveis
  const generateTimeSlots = (startHour: string, endHour: string): string[] => {
    const slots: string[] = []
    const [startH, startM] = startHour.split(':').map(Number)
    const [endH, endM] = endHour.split(':').map(Number)
    
    let currentHour = startH
    let currentMinute = startM
    
    while (currentHour < endH || (currentHour === endH && currentMinute < endM)) {
      slots.push(
        `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      )
      currentMinute += 30
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour += 1
      }
    }
    
    return slots
  }

  // Obter nome do dia da semana em português
  const getDayName = (date: Date): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    return days[date.getDay()]
  }

  // Verificar se a data é um dia de trabalho
  const isWorkingDay = (professionalId: string, date: Date): boolean => {
    const dayName = getDayName(date)
    const professional = professionals.find(p => p.id === professionalId)
    return professional?.workingDays.includes(dayName) || false
  }

  // Obter próximo dia de trabalho
  const getNextWorkingDay = (professionalId: string): Date => {
    const date = new Date()
    const professional = professionals.find(p => p.id === professionalId)
    
    while (!professional?.workingDays.includes(getDayName(date))) {
      date.setDate(date.getDate() + 1)
    }
    
    return date
  }

  // Dias da semana abreviados
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  // Gerar calendário do mês
  const getCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Dias do mês anterior
    const prevMonth = new Date(year, month, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      })
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Dias do mês seguinte
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
  }

  const handleBookAppointment = async () => {
    if (selectedProfessional && selectedTime) {
      try {
        // Buscar ID do profissional no auth.users
        const { data: userData } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', selectedProfessional === 'ricardo-valenca' ? 'ricardo.valenca@medcannlab.com' : 'eduardo.faveret@medcannlab.com')
          .single()

        const professionalId = userData?.id || 'test-doctor-001'
        
        // Buscar ID do paciente logado (ou usar ID fixo para teste)
        const { data: sessionData } = await supabase.auth.getSession()
        const patientId = sessionData?.session?.user?.id || 'paulo-goncalves-001'

        // Criar data/hora completa
        const appointmentDateTime = new Date(selectedDate)
        const [hours, minutes] = selectedTime.split(':')
        appointmentDateTime.setHours(parseInt(hours), parseInt(minutes))

        // Salvar agendamento no banco
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            patient_id: patientId,
            professional_id: professionalId,
            title: 'Consulta Médica',
            appointment_date: appointmentDateTime.toISOString(),
            duration: 60,
            status: 'scheduled',
            type: 'consultation',
            is_remote: true,
            meeting_url: `https://meet.google.com/xxxx-xxxx-xxxx`
          })
          .select()

        if (error) {
          console.error('Erro ao agendar consulta:', error)
          alert('Erro ao agendar consulta. Tente novamente.')
          return
        }

        console.log('✅ Consulta agendada com sucesso:', data)
        
        // Mostrar mensagem de sucesso
        alert(`Consulta agendada com ${professionals.find(p => p.id === selectedProfessional)?.name} no dia ${selectedDate.toLocaleDateString('pt-BR')} às ${selectedTime}`)
        
        // Redirecionar para dashboard
        navigate('/app/professional-dashboard')
      } catch (error) {
        console.error('Erro ao agendar consulta:', error)
        alert('Erro ao agendar consulta. Tente novamente.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Agendamento de Consultas</h1>
                <p className="text-slate-400">Consulte nossos profissionais e agende sua consulta online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendário */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              {/* Navegação do Calendário */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h2 className="text-xl font-bold text-white">
                  {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do Calendário */}
              <div className="grid grid-cols-7 gap-2">
                {getCalendarDays().map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const isSelected = day.date.toDateString() === selectedDate.toDateString()
                  const dayName = getDayName(day.date)

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        aspect-square rounded-lg transition-all
                        ${!day.isCurrentMonth ? 'opacity-30' : ''}
                        ${isSelected ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' : 'bg-slate-700/50 hover:bg-slate-700 text-white'}
                        ${isToday && !isSelected ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      <div className="text-sm font-semibold">{day.date.getDate()}</div>
                      {selectedProfessional && isWorkingDay(selectedProfessional, day.date) && (
                        <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Horários Disponíveis */}
            {selectedProfessional && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mt-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Horários Disponíveis - {getDayName(selectedDate)}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {generateTimeSlots('14:00', '22:00').map((time) => {
                    const professional = professionals.find(p => p.id === selectedProfessional)
                    const isWorkingDay = professional?.workingDays.includes(getDayName(selectedDate))
                    
                    if (!isWorkingDay) return null

                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          ${selectedTime === time
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-400 text-white'
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 text-white'
                          }
                        `}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-sm font-semibold">{time}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seleção de Profissional */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Selecione o Profissional</h3>
              <div className="space-y-3">
                {professionals.map((professional) => (
                  <button
                    key={professional.id}
                    onClick={() => {
                      setSelectedProfessional(professional.id)
                      setSelectedDate(getNextWorkingDay(professional.id))
                    }}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${selectedProfessional === professional.id
                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{professional.avatar}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{professional.name}</h4>
                        <p className="text-sm text-slate-400">{professional.specialty}</p>
                        <div className="flex items-center mt-2 space-x-2 text-xs text-slate-400">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{professional.workingDays.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{professional.workingHours.start} - {professional.workingHours.end}</span>
                        </div>
                      </div>
                      {selectedProfessional === professional.id && (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resumo do Agendamento */}
            {(selectedProfessional || selectedTime) && (
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-white mb-4">Resumo do Agendamento</h3>
                <div className="space-y-3">
                  {selectedProfessional && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Profissional:</span>
                      <span className="font-semibold text-white">
                        {professionals.find(p => p.id === selectedProfessional)?.name}
                      </span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Data:</span>
                      <span className="font-semibold text-white">
                        {selectedDate.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Horário:</span>
                      <span className="font-semibold text-white">{selectedTime}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-600">
                    <span className="text-slate-400">Modalidade:</span>
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-green-400">Online</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookAppointment}
                  disabled={!selectedProfessional || !selectedTime}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Agendamento
                </button>
              </div>
            )}

            {/* Informações */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h4 className="font-semibold text-white mb-3">ℹ️ Informações Importantes</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  <span>Consultas online realizadas pela plataforma</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  <span>Link de acesso enviado por email e SMS</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                  <span>Cancelamento até 24h antes sem taxa</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Scheduling
