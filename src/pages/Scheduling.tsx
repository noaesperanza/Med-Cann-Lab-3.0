import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
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
  Settings,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { bookAppointment } from '../lib/scheduling'
import {
  SCHEDULING_CONFIG,
  clampToSchedulingStartDate,
  generateAppointmentSlots,
  getSchedulingStartDate,
  isSchedulingWorkingDay
} from '../lib/schedulingConfig'

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
  const { user } = useAuth()
  const toast = useToast()
  const initialDate = useMemo(() => {
    const startDate = getSchedulingStartDate()
    startDate.setHours(0, 0, 0, 0)
    return startDate
  }, [])

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set())
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Carregar profissionais do banco de dados
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        // Buscar profissionais (tipo 'profissional' ou 'admin')
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email, name, type')
          .in('type', ['profissional', 'admin'])
          .eq('email', 'rrvalenca@gmail.com')
          .limit(1)

        const { data: users2, error: users2Error } = await supabase
          .from('users')
          .select('id, email, name, type')
          .in('type', ['profissional', 'admin'])
          .eq('email', 'eduardo.faveret@medcannlab.com')
          .limit(1)

        const professionalsList: Professional[] = []

        if (users && users.length > 0) {
          professionalsList.push({
            id: users[0].id,
            name: users[0].name || 'Dr. Ricardo Valença',
            specialty: 'Coordenador Científico',
            workingDays: ['Terça', 'Quarta', 'Quinta'],
            workingHours: { start: '08:00', end: '20:30' },
            avatar: '👨‍⚕️'
          })
        } else {
          // Fallback se não encontrar no banco
          professionalsList.push({
            id: 'ricardo-valenca',
            name: 'Dr. Ricardo Valença',
            specialty: 'Coordenador Científico',
            workingDays: ['Terça', 'Quarta', 'Quinta'],
            workingHours: { start: '08:00', end: '20:30' },
            avatar: '👨‍⚕️'
          })
        }

        if (users2 && users2.length > 0) {
          professionalsList.push({
            id: users2[0].id,
            name: users2[0].name || 'Dr. Eduardo Faveret',
            specialty: 'Diretor Médico',
            workingDays: ['Segunda', 'Quarta'],
            workingHours: { start: '10:00', end: '18:00' },
            avatar: '👨‍⚕️'
          })
        } else {
          // Fallback se não encontrar no banco
          professionalsList.push({
            id: 'eduardo-faveret',
            name: 'Dr. Eduardo Faveret',
            specialty: 'Diretor Médico',
            workingDays: ['Segunda', 'Quarta'],
            workingHours: { start: '10:00', end: '18:00' },
            avatar: '👨‍⚕️'
          })
        }

        setProfessionals(professionalsList)
      } catch (err) {
        console.error('Erro ao carregar profissionais:', err)
        // Fallback para profissionais hardcoded
        setProfessionals([])
        setError('Não foi possível carregar a lista de profissionais. Tente novamente mais tarde.')
      }
    }

    loadProfessionals()
  }, [])

  // Carregar horários ocupados quando profissional e data são selecionados
  useEffect(() => {
    const loadOccupiedSlots = async () => {
      if (!selectedProfessional || !selectedDate) {
        setOccupiedSlots(new Set())
        return
      }

      try {
        setLoadingSlots(true)
        const professional = professionals.find(p => p.id === selectedProfessional)
        if (!professional) return

        // Buscar ID real do profissional (se for UUID)
        let professionalId = selectedProfessional
        if (!selectedProfessional.includes('-') || selectedProfessional.length < 30) {
          // É um ID hardcoded, buscar o real
          const { data: profData } = await supabase
            .from('users')
            .select('id')
            .eq('email', selectedProfessional === 'ricardo-valenca' ? 'rrvalenca@gmail.com' : 'eduardo.faveret@medcannlab.com')
            .maybeSingle()

          if (profData?.id) {
            professionalId = profData.id
          }
        }

        // Calcular início e fim do dia selecionado
        const dayStart = new Date(selectedDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(selectedDate)
        dayEnd.setHours(23, 59, 59, 999)

        // Buscar agendamentos do profissional no dia selecionado
        const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select('appointment_date, duration')
          .eq('professional_id', professionalId)
          .gte('appointment_date', dayStart.toISOString())
          .lte('appointment_date', dayEnd.toISOString())
          .in('status', ['scheduled', 'confirmed'])

        if (apptError) {
          console.error('Erro ao buscar agendamentos:', apptError)
          setLoadingSlots(false)
          return
        }

        // Criar conjunto de horários ocupados
        const occupied = new Set<string>()
        if (appointments) {
          appointments.forEach(appt => {
            const apptDate = new Date(appt.appointment_date)
            const hours = apptDate.getHours().toString().padStart(2, '0')
            const minutes = apptDate.getMinutes().toString().padStart(2, '0')
            occupied.add(`${hours}:${minutes}`)
          })
        }

        setOccupiedSlots(occupied)
      } catch (err) {
        console.error('Erro ao carregar horários ocupados:', err)
      } finally {
        setLoadingSlots(false)
      }
    }

    loadOccupiedSlots()
  }, [selectedProfessional, selectedDate, professionals])

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
  const getNextWorkingDay = (professionalId: string, baseDate?: Date): Date => {
    const date = clampToSchedulingStartDate(baseDate ? new Date(baseDate) : new Date())
    date.setHours(0, 0, 0, 0)
    const professional = professionals.find(p => p.id === professionalId)

    let guard = 0
    while (professional && !professional.workingDays.includes(getDayName(date))) {
      date.setDate(date.getDate() + 1)
      guard += 1
      if (guard > 14) break
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
    firstDay.setHours(0, 0, 0, 0)
    const lastDay = new Date(year, month + 1, 0)
    lastDay.setHours(0, 0, 0, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    const schedulingStart = new Date(SCHEDULING_CONFIG.startDateISO)
    schedulingStart.setHours(0, 0, 0, 0)

    // Dias do mês anterior
    const prevMonth = new Date(year, month, 0)
    prevMonth.setHours(0, 0, 0, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dateValue = new Date(year, month - 1, prevMonth.getDate() - i)
      dateValue.setHours(0, 0, 0, 0)
      days.push({
        date: dateValue,
        isCurrentMonth: false,
        isDisabled: dateValue < schedulingStart
      } as const)
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const dateValue = new Date(year, month, i)
      dateValue.setHours(0, 0, 0, 0)
      days.push({
        date: dateValue,
        isCurrentMonth: true,
        isDisabled: dateValue < schedulingStart
      })
    }

    // Dias do mês seguinte
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const dateValue = new Date(year, month + 1, i)
      dateValue.setHours(0, 0, 0, 0)
      days.push({
        date: dateValue,
        isCurrentMonth: false,
        isDisabled: dateValue < schedulingStart
      })
    }

    return days
  }

  const handlePreviousMonth = () => {
    const previous = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    previous.setHours(0, 0, 0, 0)
    if (previous < new Date(SCHEDULING_CONFIG.startDateISO)) {
      setSelectedDate(new Date(SCHEDULING_CONFIG.startDateISO))
      return
    }
    setSelectedDate(previous)
  }

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
  }

  const handleBookAppointment = async () => {
    if (!selectedProfessional || !selectedTime) {
      setError('Selecione um profissional e um horário.')
      return
    }

    if (!user) {
      setError('Você precisa estar logado para agendar uma consulta.')
      return
    }

    // Verificar se o horário está ocupado
    if (occupiedSlots.has(selectedTime)) {
      setError('Este horário já está ocupado. Por favor, selecione outro.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const professional = professionals.find(p => p.id === selectedProfessional)
      if (!professional) {
        setError('Profissional não encontrado.')
        setLoading(false)
        return
      }

      // Buscar ID real do profissional
      let professionalId = selectedProfessional
      if (!selectedProfessional.includes('-') || selectedProfessional.length < 30) {
        // É um ID hardcoded, buscar o real
        const emailToSearch = selectedProfessional === 'ricardo-valenca' ? 'rrvalenca@gmail.com' : 'eduardo.faveret@medcannlab.com'
        console.log('🔍 Buscando profissional com email:', emailToSearch)

        const { data: profData, error: profError } = await supabase
          .from('users')
          .select('id, email, name')
          .eq('email', emailToSearch)
          .maybeSingle()

        if (profError) {
          console.error('❌ Erro ao buscar profissional:', profError)
          setError(`Erro ao buscar profissional: ${profError.message}. Tente novamente.`)
          setLoading(false)
          return
        }

        if (profData?.id) {
          professionalId = profData.id
          console.log('✅ Profissional encontrado:', profData.name, 'ID:', professionalId)
        } else {
          console.warn('⚠️ Profissional não encontrado no banco. Tentando usar ID do auth...')
          // Tentar buscar pelo auth.users através de uma query alternativa
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData?.session?.user) {
            // Se o usuário logado for o próprio profissional, usar seu ID
            if (sessionData.session.user.email === emailToSearch) {
              professionalId = sessionData.session.user.id
              console.log('✅ Usando ID do usuário logado:', professionalId)
            } else {
              setError('Profissional não encontrado. Por favor, entre em contato com o suporte.')
              setLoading(false)
              return
            }
          } else {
            setError('Não foi possível identificar o profissional. Por favor, faça login novamente.')
            setLoading(false)
            return
          }
        }
      }

      // Verificar novamente se o horário está disponível (double-check)
      const appointmentDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const dayStart = new Date(selectedDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDate)
      dayEnd.setHours(23, 59, 59, 999)

      console.log('🔍 Verificando conflitos para:', {
        professionalId,
        date: appointmentDateTime.toISOString(),
        dayStart: dayStart.toISOString(),
        dayEnd: dayEnd.toISOString()
      })

      // Buscar agendamentos no intervalo de tempo (considerando duração de 60 minutos)
      const appointmentStart = new Date(appointmentDateTime)
      const appointmentEnd = new Date(appointmentDateTime)
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + 60)

      const { data: conflictingAppts, error: conflictError } = await supabase
        .from('appointments')
        .select('id, appointment_date, status')
        .eq('professional_id', professionalId)
        .gte('appointment_date', dayStart.toISOString())
        .lte('appointment_date', dayEnd.toISOString())
        .in('status', ['scheduled', 'confirmed'])

      if (conflictError) {
        console.error('❌ Erro ao verificar conflitos:', conflictError)
        // Não bloquear por erro de verificação, mas avisar
        console.warn('⚠️ Continuando mesmo com erro na verificação de conflitos')
      }

      // Verificar se há conflito de horário (sobreposição)
      if (conflictingAppts && conflictingAppts.length > 0) {
        const hasConflict = conflictingAppts.some(appt => {
          const apptDate = new Date(appt.appointment_date)
          const apptEnd = new Date(apptDate)
          apptEnd.setMinutes(apptEnd.getMinutes() + 60) // Duração padrão

          // Verificar sobreposição
          return (appointmentDateTime >= apptDate && appointmentDateTime < apptEnd) ||
            (appointmentEnd > apptDate && appointmentEnd <= apptEnd) ||
            (appointmentDateTime <= apptDate && appointmentEnd >= apptEnd)
        })

        if (hasConflict) {
          setError('Este horário já foi reservado. Por favor, selecione outro.')
          setLoading(false)
          return
        }
      }

      // Criar agendamento via RPC (V3 Atomic)
      console.log('📅 Criando agendamento via RPC V3:', {
        patient_id: user.id,
        professional_id: professionalId,
        appointment_date: appointmentDateTime.toISOString(),
        duration: 60,
      })

      const appointmentId = await bookAppointment(
        user.id,
        professionalId,
        appointmentDateTime.toISOString(),
        'consultation',
        'Consulta Médica'
      )

      console.log('✅ Consulta agendada com sucesso ID:', appointmentId)

      // Atualizar lista de horários ocupados
      setOccupiedSlots(prev => new Set([...prev, selectedTime]))

      // Mostrar mensagem de sucesso e redirecionar
      toast.success('Consulta agendada!', `${professional.name} • ${selectedDate.toLocaleDateString('pt-BR')} às ${selectedTime}`)

      // Redirecionar para página de agendamentos do paciente
      navigate('/app/clinica/paciente/agendamentos')

    } catch (error: any) {
      console.error('Erro ao agendar consulta:', error)
      setError(`Erro ao agendar: ${error.message || 'Tente novamente.'}`)
    } finally {
      setLoading(false)
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
        {/* Área de Erro Global */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start space-x-3 animate-in slide-in-from-top">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-1">Erro ao Agendar</h4>
              <p className="text-sm text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
              aria-label="Fechar erro"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

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
                  const isDisabled =
                    day.isDisabled ||
                    day.date < new Date(SCHEDULING_CONFIG.startDateISO) ||
                    (selectedProfessional ? !isWorkingDay(selectedProfessional, day.date) : false)

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isDisabled) return
                        setSelectedDate(day.date)
                      }}
                      disabled={isDisabled}
                      className={`
                        aspect-square rounded-lg transition-all
                        ${!day.isCurrentMonth ? 'opacity-30' : ''}
                        ${isSelected ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' : 'bg-slate-700/50 hover:bg-slate-700 text-white'}
                        ${isDisabled ? 'cursor-not-allowed opacity-30 hover:bg-slate-700/50' : ''}
                        ${isToday && !isSelected ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      <div className="text-sm font-semibold">{day.date.getDate()}</div>
                      {selectedProfessional && !isDisabled && isWorkingDay(selectedProfessional, day.date) && (
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Horários Disponíveis - {getDayName(selectedDate)}
                  </h3>
                  {loadingSlots && (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  )}
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-3">
                  {(() => {
                    const professional = professionals.find(p => p.id === selectedProfessional)
                    if (!professional) return []

                    return generateAppointmentSlots(
                      professional.workingHours.start,
                      professional.workingHours.end,
                      SCHEDULING_CONFIG.appointmentDurationMinutes,
                      SCHEDULING_CONFIG.bufferMinutes
                    )
                  })().map((time) => {
                    const professional = professionals.find(p => p.id === selectedProfessional)
                    const isWorkingDay = professional?.workingDays.includes(getDayName(selectedDate))
                    const isPastStartDate = selectedDate >= clampToSchedulingStartDate(new Date(selectedDate))
                    const isOccupied = occupiedSlots.has(time)

                    if (!isWorkingDay || !isPastStartDate) return null

                    return (
                      <button
                        key={time}
                        onClick={() => {
                          if (!isOccupied) {
                            setSelectedTime(time)
                            setError(null)
                          }
                        }}
                        disabled={isOccupied}
                        className={`
                          p-3 rounded-lg border-2 transition-all relative
                          ${isOccupied
                            ? 'bg-slate-800/30 border-slate-700 text-slate-500 cursor-not-allowed'
                            : selectedTime === time
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-400 text-white'
                              : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 text-white'
                          }
                        `}
                        title={isOccupied ? 'Horário ocupado' : `Agendar para ${time}`}
                      >
                        {isOccupied && (
                          <XCircle className="w-4 h-4 absolute top-1 right-1 text-slate-500" />
                        )}
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
                      setSelectedTime(null)
                      setSelectedDate(getNextWorkingDay(professional.id, selectedDate))
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
                  disabled={!selectedProfessional || !selectedTime || loading || occupiedSlots.has(selectedTime || '')}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Agendando...</span>
                    </>
                  ) : (
                    <span>Confirmar Agendamento</span>
                  )}
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
