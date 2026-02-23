import React, { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
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
  MessageCircle, // Added
  X, // Added
  Loader2,
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
  Brain,
  Stethoscope,
  ArrowRight
} from 'lucide-react'
import {
  SCHEDULING_CONFIG,
  clampToSchedulingStartDate,
  generateAppointmentSlots,
  isSchedulingWorkingDay
} from '../lib/schedulingConfig'
import { getAvailableSlots, bookAppointment } from '../lib/scheduling'


import JourneyManualModal from '../components/JourneyManualModal'
import AssessmentRequiredModal from '../components/AssessmentRequiredModal'

type ProfessionalCard = {
  id: string
  name: string
  role: string
  specialty: string
  rating: string
  excerpt: string
  accentClasses: string
  buttonClasses: string
  // MVP profile fields (podem virar dados reais depois)
  bio?: string
  tags?: string[]
  languages?: string[]
  consultPriceBRL?: number
  experienceYears?: number
  consultCountApprox?: number
}

// Fallback estático — usado quando a busca ao Supabase falha ou retorna vazio
const FALLBACK_PROFESSIONALS: ProfessionalCard[] = [
  {
    id: 'eduardo-faveret',
    name: 'Dr. Eduardo Faveret',
    role: 'Neurologista Pediátrico',
    specialty: 'Neurologia',
    rating: '4.9',
    excerpt: 'Especialista em Epilepsia e Cannabis Medicinal. Atendimento personalizado com metodologia AEC.',
    accentClasses: 'bg-emerald-500/20 text-emerald-300',
    buttonClasses: 'bg-emerald-500 hover:bg-emerald-400',
    bio: 'Atendimento focado em neurologia clínica, com abordagem estruturada e acompanhamento contínuo.',
    tags: ['Epilepsia', 'Sono', 'Ansiedade', 'Acompanhamento'],
    languages: ['Português'],
    consultPriceBRL: 350,
    experienceYears: 12,
    consultCountApprox: 120,
  },
  {
    id: 'ricardo-valenca',
    name: 'Dr. Ricardo Valença',
    role: 'Administrador • Especialista',
    specialty: 'Nefrologia',
    rating: '5.0',
    excerpt: 'Coordenador científico. Especialista em Arte da Entrevista Clínica e metodologia IMRE.',
    accentClasses: 'bg-primary-500/20 text-primary-300',
    buttonClasses: 'bg-primary-500 hover:bg-primary-400',
    bio: 'Coordenação científica e consulta clínica com método IMRE, focado em segurança e rastreabilidade.',
    tags: ['Nefrologia', 'Dor', 'Inflamação', 'IMRE'],
    languages: ['Português'],
    consultPriceBRL: 350,
    experienceYears: 18,
    consultCountApprox: 240,
  }
]

// Cores cíclicas para profissionais dinâmicos (além dos 2 fixos)
const ACCENT_PALETTE = [
  { accentClasses: 'bg-cyan-500/20 text-cyan-300', buttonClasses: 'bg-cyan-500 hover:bg-cyan-400' },
  { accentClasses: 'bg-violet-500/20 text-violet-300', buttonClasses: 'bg-violet-500 hover:bg-violet-400' },
  { accentClasses: 'bg-rose-500/20 text-rose-300', buttonClasses: 'bg-rose-500 hover:bg-rose-400' },
  { accentClasses: 'bg-amber-500/20 text-amber-300', buttonClasses: 'bg-amber-500 hover:bg-amber-400' },
  { accentClasses: 'bg-teal-500/20 text-teal-300', buttonClasses: 'bg-teal-500 hover:bg-teal-400' },
]

const PatientAppointments: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [showJourneyManual, setShowJourneyManual] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const schedulingStartDate = useMemo(() => {
    const date = new Date(SCHEDULING_CONFIG.startDateISO)
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  const [currentDate, setCurrentDate] = useState(() => clampToSchedulingStartDate(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<{ name: string, specialty: string } | null>(null)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('2135f0c0-eb5a-43b1-bc00-5f8dfea13561')
  const [professionalQuery, setProfessionalQuery] = useState('')
  const [professionalSpecialtyFilter, setProfessionalSpecialtyFilter] = useState<string>('ALL')
  const [profileProfessional, setProfileProfessional] = useState<ProfessionalCard | null>(null)
  const [showHeaderActions, setShowHeaderActions] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [appointmentData, setAppointmentData] = useState({
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

  const [appointments, setAppointments] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [carePlan, setCarePlan] = useState<any>(null)

  // V1.1 Enterprise: Real Slots State
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Reschedule Logic
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleTargetApt, setRescheduleTargetApt] = useState<any>(null)
  const [rescheduleSuggestions, setRescheduleSuggestions] = useState<any[]>([]) // { date: Date, slots: string[] }
  const [isLoadingReschedule, setIsLoadingReschedule] = useState(false)

  // Cancel Logic
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelTargetApt, setCancelTargetApt] = useState<any>(null)
  const [isLoadingCancel, setIsLoadingCancel] = useState(false)


  // ═══════════════════════════════════════════════════════════════
  // PROFISSIONAIS DINÂMICOS — Busca do Supabase com fallback
  // Plano de Ação Item #2 — Auditoria Master 360°
  // ═══════════════════════════════════════════════════════════════
  const [AVAILABLE_PROFESSIONALS, setAvailableProfessionals] = useState<ProfessionalCard[]>(FALLBACK_PROFESSIONALS)

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        // Buscar profissionais ativos do banco (tabela pública profiles)
        // Selecionar apenas colunas garantidas para evitar erro 400 se specialties/bio não existirem
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, type, slug')
          .in('type', ['profissional', 'professional', 'admin'])
          .order('name', { ascending: true })

        if (error || !data || data.length === 0) {
          console.log('ℹ️ Usando profissionais fallback (banco não retornou dados)')
          return // mantém FALLBACK_PROFESSIONALS
        }

        // Mapear dados do banco para ProfessionalCard
        const mapped: ProfessionalCard[] = data.map((prof: any, index: number) => {
          // Verificar se é um dos profissionais conhecidos (para manter dados ricos)
          const isRicardo = prof.email?.includes('ricardo') || prof.name?.toLowerCase().includes('ricardo')
          const isEduardo = prof.email?.includes('eduardo') || prof.name?.toLowerCase().includes('eduardo')

          // Usar dados ricos do fallback se for profissional conhecido
          if (isRicardo) {
            const fallback = FALLBACK_PROFESSIONALS.find(f => f.id === 'ricardo-valenca')
            if (fallback) return { ...fallback, id: prof.id }
          }
          if (isEduardo) {
            const fallback = FALLBACK_PROFESSIONALS.find(f => f.id === 'eduardo-faveret')
            if (fallback) return { ...fallback, id: prof.id }
          }

          // Para novos profissionais: gerar card dinâmico
          const palette = ACCENT_PALETTE[index % ACCENT_PALETTE.length]
          return {
            id: prof.id,
            name: prof.name || 'Profissional',
            role: prof.specialty || 'Especialista',
            specialty: prof.specialty || 'Clínica Geral',
            rating: '4.8',
            excerpt: prof.bio || 'Profissional disponível para consultas na plataforma MedCannLab.',
            accentClasses: palette.accentClasses,
            buttonClasses: palette.buttonClasses,
            bio: prof.bio || '',
            tags: prof.specialty ? [prof.specialty] : ['Consulta'],
            languages: ['Português'],
            consultPriceBRL: 300,
            experienceYears: 5,
            consultCountApprox: 50,
          }
        })

        setAvailableProfessionals(mapped)
        console.log(`✅ ${mapped.length} profissionais carregados do banco`)
      } catch (err) {
        console.error('Erro ao carregar profissionais:', err)
        // mantém FALLBACK_PROFESSIONALS
      }
    }

    loadProfessionals()
  }, [])

  // Deep-link: abrir modal de novo agendamento ao entrar na rota (ex.: vindo do Analytics)
  useEffect(() => {
    const state = (location.state || {}) as any
    if (!state?.openNew) return

    // Garantir modo calendário e abrir modal
    setViewMode('calendar')
    setShowAppointmentModal(true)

    // Limpar o state para não reabrir ao voltar/refresh
    try {
      navigate(location.pathname + location.search, { replace: true, state: {} })
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Effect to fetch slots when Date or selected professional changes
  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true)
        try {
          // Usa o profissional selecionado pelo paciente (ou Dr. Ricardo como padrão real)
          const profId = selectedProfessionalId || '2135f0c0-eb5a-43b1-bc00-5f8dfea13561'
          const start = new Date(selectedDate)
          const end = new Date(selectedDate)
          end.setHours(23, 59, 59)

          const slots = await getAvailableSlots(profId, start, end)

          // Extract HH:MM from ISO strings
          const timeStrings = slots.map(s => {
            const date = new Date(s)
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          })

          setAvailableSlots(timeStrings)
        } catch (err) {
          console.error(err)
          setAvailableSlots([])
        } finally {
          setIsLoadingSlots(false)
        }
      }
      fetchSlots()
    }
  }, [selectedDate, selectedProfessionalId])

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
        const formattedAppointments = appointmentsData.map((apt: any) => {
          const rawDate = apt.appointment_date || ''
          const aptDt = new Date(rawDate)

          // FORÇAR DATA LOCAL (Corrigir timezone offset)
          // Se for '2026-05-14T10:00:00', usar componentes locais para garantir dia 14
          const year = aptDt.getFullYear()
          const month = String(aptDt.getMonth() + 1).padStart(2, '0')
          const day = String(aptDt.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}` // YYYY-MM-DD Local

          const timeStr = apt.appointment_time
            || aptDt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

          return {
            id: apt.id,
            date: dateStr,
            time: timeStr,
            _dt: aptDt,
            professional: apt.professional_name || apt.title?.replace('Consulta ', '') || 'Dr. Ricardo Valença',
            type: apt.appointment_type || apt.type || 'Consulta',
            service: apt.service_type || '',
            status: apt.status || 'scheduled',
            doctorName: apt.professional_name || 'Dr. Ricardo Valença',
            doctorSpecialty: apt.specialty || 'Nefrologia',
            professionalId: apt.professional_id || '2135f0c0-eb5a-43b1-bc00-5f8dfea13561', // ID real de fallback
            room: apt.room || 'Virtual',
            notes: apt.notes || '',
            priority: apt.priority || 'normal'
          }
        })

        setAppointments(formattedAppointments)

        // Filtrar próximas consultas
        const now = new Date()
        // zera hora para comparacao de dia
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = formattedAppointments.filter(apt => {
          // Checar se data futura
          const aptDay = new Date(apt._dt)
          aptDay.setHours(0, 0, 0, 0)
          return (apt.status === 'scheduled' || apt.status === 'confirmed') && aptDay >= today
        }).sort((a, b) => a._dt.getTime() - b._dt.getTime())

        setUpcomingAppointments(upcoming.slice(0, 3))

        // AUTO-NAVIGATE: Se houver consulta futura e não estiver no mês atual, mover calendário
        if (upcoming.length > 0) {
          const nextAptDate = upcoming[0]._dt
          const currentMonth = new Date().getMonth()
          const aptMonth = nextAptDate.getMonth()

          // Só muda se for mês diferente para evitar pulos estranhos se já estiver vendo
          if (aptMonth !== currentMonth) {
            const newFocus = new Date(nextAptDate)
            newFocus.setDate(1) // Primeiro dia do mês da consulta
            setCurrentDate(newFocus)
            // Removido auto-select do dia para não confundir o usuário sobre "hoje"
            // setSelectedDate(new Date(upcoming[0]._dt))
          }
        }
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
          progress: (assessments.data as any)?.progress || 0,
          nextReview: (assessments.data as any)?.nextReview || null,
          medications: (assessments.data as any)?.medications || []
        })
      }
    } catch (error) {
      console.error('Erro ao carregar plano de cuidado:', error)
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

  // Especialidades disponíveis
  const specialties = [
    'Neurologia',
    'Nefrologia',
    'Homeopatia'
  ]

  const availableSpecialties = useMemo(() => {
    const unique = Array.from(new Set(AVAILABLE_PROFESSIONALS.map(p => p.specialty))).filter(Boolean)
    return unique.sort((a, b) => a.localeCompare(b))
  }, [])

  const filteredProfessionals = useMemo(() => {
    const q = (professionalQuery || '').trim().toLowerCase()
    return AVAILABLE_PROFESSIONALS.filter(p => {
      const okSpecialty = professionalSpecialtyFilter === 'ALL' ? true : p.specialty === professionalSpecialtyFilter
      if (!okSpecialty) return false
      if (!q) return true
      const hay = `${p.name} ${p.role} ${p.specialty} ${(p.tags || []).join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [professionalQuery, professionalSpecialtyFilter])

  const specialtyConsultorioMap: Record<string, string[]> = {
    Neurologia: ['Consultório Escola Eduardo Faveret'],
    Nefrologia: ['Consultório Escola Ricardo Valença'],
    Homeopatia: ['Consultório Escola Ricardo Valença']
  }

  const specialtyProfessionalEmailMap: Record<string, string> = {
    Neurologia: 'eduardo.faveret@medcannlab.com',
    Nefrologia: 'ricardo.valenca@medcannlab.com',
    Homeopatia: 'ricardo.valenca@medcannlab.com'
  }

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

      // Match Robusto Local
      const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayAppointments = appointments.filter(apt => apt.date === dayString)

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

  const openNewAppointment = () => {
    setShowHeaderActions(false)
    setShowAppointmentModal(true)
  }

  const openJourneyManual = () => {
    setShowHeaderActions(false)
    setShowJourneyManual(true)
  }

  const startClinicalAssessment = () => {
    setShowHeaderActions(false)
    navigate('/app/chat-noa-esperanca')
  }

  // Função para salvar agendamento (vinculado à IA residente)
  const handleSaveAppointment = async () => {
    if (!appointmentData.date || !appointmentData.time || !appointmentData.specialty || !appointmentData.service || !appointmentData.room || !user?.id) {
      toast.warning('Campos obrigatórios', 'Preencha todos os campos obrigatórios antes de agendar.')
      return
    }

    try {
      // 1. Usar o profissional selecionado pelo paciente (estado já populado)
      // IDs reais: Ricardo=2135f0c0, Eduardo=f4a62265
      const REAL_PROF_IDS: Record<string, string> = {
        'Neurologia': 'f4a62265-8982-44db-8282-78129c4d014a',  // Dr. Eduardo Faveret
        'Nefrologia': '2135f0c0-eb5a-43b1-bc00-5f8dfea13561',  // Dr. Ricardo Valença
        'Homeopatia': '2135f0c0-eb5a-43b1-bc00-5f8dfea13561',  // Dr. Ricardo Valença
      }
      // Prioridade: profissional selecionado no card > mapeado pela especialidade > Dr. Ricardo como fallback seguro
      const professionalId = selectedProfessionalId
        || REAL_PROF_IDS[appointmentData.specialty]
        || '2135f0c0-eb5a-43b1-bc00-5f8dfea13561'

      // 2. CHAMADA RPC TRANSACIONAL (V1.1 Enterprise)
      const appointmentDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`)

      const appointmentId = await bookAppointment(
        user.id,
        professionalId,
        appointmentDateTime.toISOString(),
        'consultation',
        appointmentData.notes
      )

      // 3. Sucesso! Recarregar e Navegar
      await loadAppointments()
      setShowAppointmentModal(false)

      navigate('/app/chat-noa-esperanca', {
        state: {
          startAssessment: true,
          appointmentId: appointmentId,
          appointmentData: { ...appointmentData }
        }
      })

    } catch (error: any) {
      console.error('Erro ao agendar consulta (RPC):', error)
      toast.error('Erro ao agendar', error.message || 'Tente novamente.')
    }
  }

  // Função para cancelar agendamento (Trigger Modal)
  const handleCancelAppointment = (appointment: any) => { // Alterado para receber objeto
    setCancelTargetApt(appointment)
    setShowCancelModal(true)
  }

  // Confirmação Real do Cancelamento
  const handleConfirmCancellation = async () => {
    if (!cancelTargetApt) return

    try {
      setIsLoadingCancel(true)
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', cancelTargetApt.id)

      if (error) throw error

      toast.success('Consulta cancelada com sucesso.')
      setShowCancelModal(false)
      loadAppointments() // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao cancelar:', err)
      toast.error('Erro ao cancelar consulta', err.message)
    } finally {
      setIsLoadingCancel(false)
    }
  }

  const handleOpenChat = (professionalId?: string) => {
    // Navegar para o chat, passando o ID do profissional se disponível
    navigate('/app/clinica/paciente/chat-profissional', {
      state: { targetProfessionalId: professionalId }
    })
  }

  // --- Reschedule Smart Flow ---
  const handleClickReschedule = async (apt: any) => {
    setRescheduleTargetApt(apt)
    setShowRescheduleModal(true)
    setRescheduleSuggestions([])
    setIsLoadingReschedule(true)

    try {
      // Buscar slots para os próximos 14 dias
      const profId = apt.professionalId || selectedProfessionalId
      const start = new Date()
      start.setDate(start.getDate() + 1) // Começar amanhã
      const end = new Date()
      end.setDate(end.getDate() + 14) // 2 semanas

      const slots = await getAvailableSlots(profId, start, end)

      // Agrupar por dia
      const grouped: Record<string, string[]> = {}
      slots.forEach(iso => {
        const d = new Date(iso)
        const dateKey = d.toISOString().split('T')[0]
        const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        if (!grouped[dateKey]) grouped[dateKey] = []
        grouped[dateKey].push(time)
      })

      // Converter para array ordenado
      const suggestions = Object.keys(grouped).sort().map(dateKey => {
        const d = new Date(dateKey + 'T12:00:00') // Safe parsing
        return {
          dateObj: d,
          dateStr: dateKey,
          displayDate: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' }),
          slots: grouped[dateKey]
        }
      })

      setRescheduleSuggestions(suggestions)
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
      toast.error('Erro ao buscar horários.')
    } finally {
      setIsLoadingReschedule(false)
    }
  }

  const handleConfirmReschedule = async (dateStr: string, time: string) => {
    if (!rescheduleTargetApt || !user?.id) return

    try {
      setIsLoadingReschedule(true)

      // 1. Cancelar anterior
      const { error: cancelError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', notes: `Reagendado para ${dateStr} ${time}` })
        .eq('id', rescheduleTargetApt.id)

      if (cancelError) throw cancelError

      // 2. Agendar novo
      const appointmentDateTime = new Date(`${dateStr}T${time}`)
      await bookAppointment(
        user.id,
        rescheduleTargetApt.professionalId,
        appointmentDateTime.toISOString(),
        'consultation',
        `Reagendamento: ${rescheduleTargetApt.notes || ''}`
      )

      toast.success('Reagendamento realizado!')
      setShowRescheduleModal(false)
      loadAppointments()
    } catch (err: any) {
      console.error('Erro ao reagendar:', err)
      toast.error('Erro ao reagendar', err.message)
    } finally {
      setIsLoadingReschedule(false)
    }
  }
  // -----------------------------

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
              onClick={() => {
                const now = new Date()
                setCurrentDate(now)
                handleDateSelect({ fullDate: now, isCurrentMonth: true })
              }}
              className="px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors mr-2"
            >
              Hoje
            </button>
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
          {days.map((day, index) => {
            const hasAppointment = day.appointments.length > 0
            return (
              <div
                key={index}
                onClick={() => handleDateSelect(day)}
                className={`relative p-1.5 h-14 md:h-16 border border-slate-700 rounded-md cursor-pointer transition-all hover:scale-105 ${day.isCurrentMonth
                  ? 'hover:bg-slate-700/50'
                  : 'text-slate-500 opacity-50'
                  } ${day.isToday
                    ? 'bg-slate-800/80 border-primary-500 ring-1 ring-primary-500'
                    : ''
                  } ${day.isDisabled ? 'opacity-40 cursor-not-allowed hover:scale-100 hover:bg-transparent' : ''
                  } ${selectedDate &&
                    day.isCurrentMonth &&
                    selectedDate.toDateString() === day.fullDate.toDateString()
                    ? 'bg-primary-600/20 border-primary-500 ring-2 ring-primary-400'
                    : ''
                  } ${hasAppointment ? 'bg-indigo-900/20 border-indigo-500/50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`text-xs md:text-sm font-medium mb-0.5 ${hasAppointment ? 'text-indigo-200' : ''}`}>
                    {day.date}
                  </div>
                  {/* Indicador de Status Visual (Bolinha pulsante) se tiver consulta */}
                  {hasAppointment && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                {hasAppointment && (
                  <div className="space-y-0.5 mt-1">
                    {day.appointments.slice(0, 1).map(apt => (
                      <div
                        key={apt.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate font-medium ${apt.priority === 'high'
                          ? 'bg-red-500/80 text-white'
                          : 'bg-emerald-600/90 text-white shadow-sm'
                          }`}
                        title={`${apt.time} - ${apt.doctorName}`}
                      >
                        {apt.time}
                      </div>
                    ))}
                    {day.appointments.length > 1 && (
                      <div className="text-[9px] text-center text-slate-400 font-medium">
                        +{day.appointments.length - 1}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Função para renderizar horários disponíveis (V1.1 Dynamic)
  const renderTimeSlots = () => {
    if (!selectedDate) return null

    if (isLoadingSlots) {
      return (
        <div className="bg-slate-800 rounded-xl p-6 text-center text-slate-400">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Verificando disponibilidade...
        </div>
      )
    }

    // Se não houver slots reais retornados da RPC
    if (availableSlots.length === 0) {
      return (
        <div className="bg-slate-800 rounded-xl p-6 text-center text-slate-400">
          <p>Nenhum horário disponível para esta data.</p>
        </div>
      )
    }

    return (
      <div className="bg-slate-800 rounded-xl p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-3">
          Horários Disponíveis - {selectedDate.toLocaleDateString('pt-BR')}
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {availableSlots.map(time => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className="p-2 rounded-lg text-xs md:text-sm font-medium transition-all bg-slate-700 hover:bg-primary-600 hover:scale-105 text-slate-300 hover:text-white active:scale-95"
            >
              {time}
            </button>
          ))}
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
          <div className="flex items-center gap-2">
            {/* Toggle Calendário/Lista (unificado) */}
            <div className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/60 p-1">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-md transition-colors text-sm inline-flex items-center gap-1.5 ${viewMode === 'calendar'
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
              >
                <Calendar className="w-4 h-4" />
                Calendário
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition-colors text-sm inline-flex items-center gap-1.5 ${viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
              >
                <FileText className="w-4 h-4" />
                Lista
              </button>
            </div>

            {/* Ações (unifica: novo agendamento + manual + iniciar avaliação) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHeaderActions(v => !v)}
                className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                aria-expanded={showHeaderActions}
                aria-haspopup="menu"
              >
                Ações
                <ChevronDown className={`w-4 h-4 transition-transform ${showHeaderActions ? 'rotate-180' : ''}`} />
              </button>

              {showHeaderActions && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowHeaderActions(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 z-50 w-64 rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden"
                    role="menu"
                  >
                    <button
                      type="button"
                      onClick={openNewAppointment}
                      className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-3"
                      role="menuitem"
                    >
                      <span className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-blue-300" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">Novo agendamento</p>
                        <p className="text-xs text-slate-400 truncate">Abrir formulário de consulta</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={openJourneyManual}
                      className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-3"
                      role="menuitem"
                    >
                      <span className="w-9 h-9 rounded-lg bg-slate-700/60 border border-slate-700 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-200" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">Manual da jornada</p>
                        <p className="text-xs text-slate-400 truncate">Entenda o fluxo de cuidado</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={startClinicalAssessment}
                      className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-3"
                      role="menuitem"
                    >
                      <span className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-emerald-200" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">Iniciar avaliação clínica</p>
                        <p className="text-xs text-slate-400 truncate">Começar protocolo com a Nôa</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Jornada do Paciente - Simplificado */}
        {/* Removido: faixa "Jornada do Paciente" (redução de espaço). Manual e ações ficam em "Ações". */}

        <JourneyManualModal
          isOpen={showJourneyManual}
          onClose={() => setShowJourneyManual(false)}
        />

        <AssessmentRequiredModal
          isOpen={showAssessmentModal}
          onClose={() => setShowAssessmentModal(false)}
          professionalName={selectedProfessional?.name}
          onStartAssessment={() => {
            navigate('/app/patient-noa-chat', {
              state: {
                startAssessment: true,
                targetProfessional: selectedProfessional
              }
            })
          }}
        />

        {/* Modal Inteligente de Reagendamento */}
        {showRescheduleModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-md sm:rounded-2xl rounded-t-2xl border-t sm:border border-slate-700/50 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[600px] animate-in slide-in-from-bottom-5 duration-300">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Reagendar
                  </h3>
                  <p className="text-xs text-slate-400">Selecione o novo horário</p>
                </div>
                <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
                {/* Current Appointment Card */}
                <div className="p-5 pb-2">
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Clock className="w-16 h-16 text-blue-400" />
                    </div>
                    <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">Agendamento Atual</p>
                    <p className="text-white font-semibold text-lg">{rescheduleTargetApt?.professional}</p>
                    <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(rescheduleTargetApt?.date).toLocaleDateString('pt-BR')}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <Clock className="w-4 h-4" />
                      <span>{rescheduleTargetApt?.time}</span>
                    </div>
                    <p className="text-xs text-red-400 mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Será cancelado automaticamente
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <h4 className="text-sm font-medium text-slate-300 mb-3 mt-2 flex items-center gap-2">
                    <span>Próximas Disponibilidades</span>
                    <div className="h-px bg-slate-800 flex-1"></div>
                  </h4>

                  {isLoadingReschedule ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                      <p className="text-sm">Buscando melhores horários...</p>
                    </div>
                  ) : rescheduleSuggestions.length === 0 ? (
                    <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 mx-1">
                      <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Sem horários próximos.</p>
                      <button onClick={() => { setShowRescheduleModal(false); setShowAppointmentModal(true); }} className="text-blue-400 text-sm mt-2 hover:underline font-medium">
                        Ver calendário completo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {rescheduleSuggestions.map((group: any) => (
                        <div key={group.dateStr} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="sticky top-0 bg-slate-900/95 backdrop-blur py-2 z-10 mb-2 border-b border-slate-800/50">
                            <h4 className="text-sm font-semibold text-slate-200 capitalize">
                              {group.displayDate}
                            </h4>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                            {group.slots.map((time: string) => (
                              <button
                                key={`${group.dateStr}-${time}`}
                                onClick={() => {
                                  if (window.confirm(`Confirmar reagendamento para ${group.displayDate} às ${time}?`)) {
                                    handleConfirmReschedule(group.dateStr, time)
                                  }
                                }}
                                className="group relative flex items-center justify-center py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium transition-all duration-200 hover:bg-blue-600 hover:border-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95"
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Inteligente de Cancelamento */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-md sm:rounded-2xl rounded-t-2xl border-t sm:border border-red-500/30 shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300">

              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-red-950/20 rounded-t-2xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Cancelar Consulta
                  </h3>
                  <p className="text-xs text-red-400">Esta ação não pode ser desfeita</p>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                  <p className="text-sm text-slate-400 mb-1">Você está cancelando a consulta:</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{cancelTargetApt?.professional}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(cancelTargetApt?.date).toLocaleDateString('pt-BR')} às {cancelTargetApt?.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                  <p className="text-xs text-red-300 leading-relaxed">
                    ⚠️ <strong>Atenção:</strong> Ao cancelar, este horário ficará disponível imediatamente para outros pacientes. Se decidir voltar atrás, o horário pode não estar mais livre.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                  >
                    Manter Consulta
                  </button>
                  <button
                    onClick={handleConfirmCancellation}
                    disabled={isLoadingCancel}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoadingCancel ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      'Confirmar Cancelamento'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layout principal (modo calendário): calendário à esquerda, cards à direita */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
            {/* Coluna do calendário: fica visível no desktop sem “sumir” abaixo dos cards */}
            <div className="space-y-6 lg:sticky lg:top-6">
              {renderCalendar()}
              {selectedDate && renderTimeSlots()}
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Profissionais Disponíveis - Unificado */}
              <div className="bg-slate-800 rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 md:mb-5">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-primary-300" />
                      Agendar com Especialista
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Escolha um especialista para iniciar seu acompanhamento ou agende sua consulta.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAppointmentModal(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Agendamento
                  </button>
                </div>

                {/* Busca e filtros (MVP) */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="professional-search">Buscar médicos e parceiros</label>
                    <input
                      id="professional-search"
                      value={professionalQuery}
                      onChange={(e) => setProfessionalQuery(e.target.value)}
                      placeholder="Buscar médico/parceiro (nome, especialidade, tag)…"
                      className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                    />
                  </div>
                  <div className="md:w-[240px]">
                    <label className="sr-only" htmlFor="specialty-filter">Filtrar por especialidade</label>
                    <select
                      id="specialty-filter"
                      value={professionalSpecialtyFilter}
                      onChange={(e) => setProfessionalSpecialtyFilter(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                    >
                      <option value="ALL">Todas especialidades</option>
                      {availableSpecialties.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProfessionals.map(professional => (
                    <div
                      key={professional.id}
                      className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 flex flex-col justify-between gap-4 transition-colors hover:border-primary-500/40"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-slate-800/60 ${professional.accentClasses} shrink-0`}>
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-white text-base md:text-lg font-semibold">{professional.name}</h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                              {professional.rating}
                            </span>
                            <button
                              type="button"
                              onClick={() => setProfileProfessional(professional)}
                              className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-200 hover:text-white hover:border-primary-500/50 transition-colors"
                              title="Ver perfil"
                            >
                              Ver perfil
                            </button>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{professional.role}</p>
                          <p className="text-sm text-slate-300 mt-2 line-clamp-2">{professional.excerpt}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setProfileProfessional(professional)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-100 bg-slate-700/60 hover:bg-slate-700 transition-colors"
                        >
                          Ver perfil
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Mapear ID real do profissional selecionado
                            const REAL_PROF_IDS: Record<string, string> = {
                              'rrvalenca@gmail.com': '2135f0c0-eb5a-43b1-bc00-5f8dfea13561',
                              'eduardoscfaveret@gmail.com': 'f4a62265-8982-44db-8282-78129c4d014a',
                            }
                            const SPECIALTY_PROF_IDS: Record<string, string> = {
                              'Neurologia': 'f4a62265-8982-44db-8282-78129c4d014a',
                              'Nefrologia': '2135f0c0-eb5a-43b1-bc00-5f8dfea13561',
                              'Homeopatia': '2135f0c0-eb5a-43b1-bc00-5f8dfea13561',
                            }
                            // Resolver ID: usar UUID direto se disponível, senão mapear por especialidade
                            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                            const resolvedProfId = uuidRegex.test(professional.id)
                              ? professional.id
                              : SPECIALTY_PROF_IDS[professional.specialty] || '2135f0c0-eb5a-43b1-bc00-5f8dfea13561'
                            setSelectedProfessionalId(resolvedProfId)

                            // Verificar se usuário tem avaliação
                            if (!carePlan?.id) {
                              setSelectedProfessional({ name: professional.name, specialty: professional.specialty })
                              setShowAssessmentModal(true)
                            } else {
                              setAppointmentData(prev => ({ ...prev, specialty: professional.specialty }))
                              setShowAppointmentModal(true)
                            }
                          }}
                          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${professional.buttonClasses}`}
                        >
                          Agendar
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProfessionals.length === 0 && (
                  <div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-900/30 px-4 py-4 text-sm text-slate-300">
                    Nenhum profissional encontrado para os filtros atuais.
                  </div>
                )}
              </div>

              {/* Card Próximas Consultas - Integrado ao Plano de Cuidado */}
              <div className="bg-slate-800 rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4 gap-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-white">📅 Próximas Consultas</h3>
                    {carePlan && (
                      <p className="text-sm text-slate-400 mt-1">
                        Relacionadas ao seu plano de cuidado • Progresso: {carePlan.progress || 0}%
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAppointmentModal(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agendar nova</span>
                  </button>
                </div>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt) => (
                      <div key={apt.id} className="bg-slate-700 rounded-lg p-3.5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3.5 flex-1">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold">{apt.professional}</p>
                              <p className="text-slate-400 text-sm">
                                {new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}
                              </p>
                              <p className="text-slate-500 text-xs">{apt.service || apt.type}</p>
                            </div>
                            {carePlan && carePlan.nextReview && new Date(carePlan.nextReview) <= new Date(`${apt.date}T${apt.time}`) && (
                              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-2.5 py-1.5 hidden sm:block">
                                <p className="text-green-400 text-xs font-medium">Revisão do Plano</p>
                              </div>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs ml-4 ${apt.status === 'scheduled' ? 'bg-green-500/20 text-green-400' :
                            apt.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                            {apt.status === 'scheduled' ? 'Agendada' :
                              apt.status === 'completed' ? 'Concluída' : 'Cancelada'}
                          </span>
                        </div>

                        {/* Ações / Botões */}
                        {apt.status === 'scheduled' && (
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-600/50">
                            <button
                              onClick={() => handleOpenChat((apt as any).professionalId)}
                              className="text-xs px-3 py-1.5 rounded hover:bg-slate-600 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Mensagem
                            </button>
                            {/* Reagendar -> Cancelar + Nova (simples por enquanto) */}
                            <button
                              onClick={() => handleClickReschedule(apt)}
                              className="text-xs px-3 py-1.5 rounded hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                            >
                              Reagendar
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(apt)} // Pass entire object
                              className="text-xs px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/30 px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-200 text-sm font-semibold truncate">Nenhuma consulta agendada</p>
                        <p className="text-slate-500 text-xs truncate">Agende para integrar ao seu plano de cuidado.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAppointmentModal(true)}
                      className="inline-flex items-center gap-1.5 text-blue-300 hover:text-blue-200 text-sm font-semibold shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Agendar
                    </button>
                  </div>
                )}
              </div>

              {/* Informações do Plano de Cuidado */}
              {carePlan && (
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-4">
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
            </div>
          </div>
        )}

        {/* Modal: Perfil do profissional/parceiro (MVP) */}
        {profileProfessional && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-800/60 ${profileProfessional.accentClasses} shrink-0`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white text-lg md:text-xl font-bold truncate">{profileProfessional.name}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                        {profileProfessional.rating}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
                        {profileProfessional.specialty}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{profileProfessional.role}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileProfessional(null)}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-semibold"
                >
                  Fechar
                </button>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {profileProfessional.bio || profileProfessional.excerpt}
                  </p>
                </div>

                {(profileProfessional.tags && profileProfessional.tags.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {profileProfessional.tags.slice(0, 8).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-700 bg-slate-800/60 text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
                    <p className="text-xs text-slate-400">Consultas na plataforma</p>
                    <p className="text-white font-bold text-lg">{profileProfessional.consultCountApprox ?? '—'}</p>
                    <p className="text-[11px] text-slate-500">MVP (aprox.)</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
                    <p className="text-xs text-slate-400">Experiência</p>
                    <p className="text-white font-bold text-lg">{profileProfessional.experienceYears ? `${profileProfessional.experienceYears} anos` : '—'}</p>
                    <p className="text-[11px] text-slate-500">Informado pelo profissional</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
                    <p className="text-xs text-slate-400">Valor</p>
                    <p className="text-white font-bold text-lg">{profileProfessional.consultPriceBRL ? `R$ ${profileProfessional.consultPriceBRL.toFixed(0)}` : '—'}</p>
                    <p className="text-[11px] text-slate-500">Consulta particular</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const professional = profileProfessional
                      setProfileProfessional(null)
                      if (!carePlan?.id) {
                        setSelectedProfessional({ name: professional.name, specialty: professional.specialty })
                        setShowAssessmentModal(true)
                        return
                      }
                      setAppointmentData(prev => ({ ...prev, specialty: professional.specialty }))
                      setShowAppointmentModal(true)
                    }}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${profileProfessional.buttonClasses}`}
                  >
                    Agendar com {profileProfessional.name.split(' ')[0]}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileProfessional(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
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

              {/* Link para Manual da Jornada */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-300">
                    Consulte o <strong className="text-emerald-400">Manual da Jornada</strong> para entender o fluxo de avaliação.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJourneyManual(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                >
                  Abrir Manual
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Data <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Horário <span className="text-red-400">*</span></label>
                    <input
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      required
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
                    <label className="block text-sm text-slate-400 mb-2">Especialidade <span className="text-red-400">*</span></label>
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
                    <label className="block text-sm text-slate-400 mb-2">Consultório <span className="text-red-400">*</span></label>
                    <select
                      value={appointmentData.room}
                      onChange={(e) => setAppointmentData({ ...appointmentData, room: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      required
                    >
                      {rooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tipo de Serviço <span className="text-red-400">*</span></label>
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
                    onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
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
