import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserView } from '../contexts/UserViewContext'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { normalizeUserType } from '../lib/userTypes'
import PatientManagementAdvanced from './PatientManagementAdvanced'
import ProfessionalChatSystem from '../components/ProfessionalChatSystem'
import VideoCall from '../components/VideoCall'
import IntegrativePrescriptions from '../components/IntegrativePrescriptions'
import ClinicalReports from '../components/ClinicalReports'
import { 
  Brain, 
  Users, 
  Calendar, 
  FileText, 
  MessageCircle, 
  BarChart3, 
  Activity, 
  Heart, 
  Stethoscope, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  Settings,
  LayoutDashboard,
  Video,
  Phone,
  Download,
  Upload,
  Bell,
  User,
  UserPlus,
  GraduationCap,
  Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getAllPatients, isAdmin } from '../lib/adminPermissions'

interface Patient {
  id: string
  name: string
  age: number
  cpf: string
  phone: string
  lastVisit: string
  status: string
  assessments?: any[]
  condition?: string
  priority?: 'high' | 'medium' | 'low'
}

interface Appointment {
  id: string
  patient_id: string | null
  professional_id: string | null
  title: string
  description: string | null
  appointment_date: string
  duration: number | null
  status: string | null
  type: string | null
  location: string | null
  is_remote: boolean | null
  meeting_url: string | null
}

interface EnrichedAppointment extends Appointment {
  patient?: {
    id: string
    name: string | null
    email: string | null
    phone?: string | null
    type?: string | null
  }
  formattedTime: string
  formattedDate: string
  isPast: boolean
}

type SectionId =
  | 'dashboard'
  | 'admin-usuarios'
  | 'admin-upload'
  | 'admin-renal'
  | 'atendimento'
  | 'pacientes'
  | 'agendamentos'
  | 'prescricoes'
  | 'relatorios-clinicos'
  | 'chat-pacientes'
  | 'chat-profissionais'
  | 'aulas'
  | 'biblioteca'
  | 'avaliacao'
  | 'newsletter'
  | 'ferramentas-pedagogicas'
  | 'financeiro'

type SectionOption = {
  id: SectionId
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const RicardoValencaDashboard: React.FC = () => {
  const { user } = useAuth()
  const { isAdminViewingAs, viewAsType, setViewAsType, getEffectiveUserType } = useUserView()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Detectar eixo atual da URL
  const getCurrentEixo = (): 'clinica' | 'ensino' | 'pesquisa' | null => {
    if (location.pathname.includes('/clinica/')) return 'clinica'
    if (location.pathname.includes('/ensino/')) return 'ensino'
    if (location.pathname.includes('/pesquisa/')) return 'pesquisa'
    return null
  }
  
  const currentEixo = getCurrentEixo()
  const effectiveType = getEffectiveUserType(user?.type)
  
  // Reagir a mudanças no viewAsType e eixo para renderizar conteúdo dinâmico
  useEffect(() => {
    if (!user || normalizeUserType(user.type) !== 'admin') return
    
    // Se admin está visualizando como outro tipo, redirecionar para o dashboard apropriado
    if (viewAsType && currentEixo) {
      console.log('🔄 Admin mudou tipo visual:', viewAsType, 'no eixo:', currentEixo)
      
      let targetRoute = ''
      
      if (viewAsType === 'paciente') {
        // Paciente só existe no eixo clínica
        targetRoute = '/app/clinica/paciente/dashboard'
      } else if (viewAsType === 'profissional') {
        // Profissional pode estar em qualquer eixo
        targetRoute = `/app/${currentEixo}/profissional/dashboard`
      } else if (viewAsType === 'aluno') {
        // Aluno pode estar em ensino ou pesquisa
        const alunoEixo = currentEixo === 'pesquisa' ? 'pesquisa' : 'ensino'
        targetRoute = `/app/${alunoEixo}/aluno/dashboard`
      }
      
      // Só navegar se a rota atual for diferente da rota alvo
      if (targetRoute && location.pathname !== targetRoute) {
        console.log('🎯 Redirecionando para:', targetRoute)
        navigate(targetRoute, { replace: false })
      }
    } else if (!viewAsType && currentEixo && location.pathname.includes('/ricardo-valenca-dashboard')) {
      // Se não há viewAsType e estamos no dashboard admin, garantir que está na rota correta
      console.log('✅ Sem viewAsType, mantendo dashboard admin')
    }
  }, [viewAsType, currentEixo, user, navigate, location.pathname])

  // Redirecionar pacientes reais para seu dashboard correto (mas não se admin está visualizando como outro tipo)
  useEffect(() => {
    // Não redirecionar se admin está visualizando como outro tipo
    if (isAdminViewingAs || !user || normalizeUserType(user.type) === 'admin') {
      return
    }
    
    const userType = normalizeUserType(user.type)
    if (userType === 'paciente') {
      console.log('🔄 Paciente detectado no dashboard profissional, redirecionando...')
      navigate('/app/clinica/paciente/dashboard', { replace: true })
    }
  }, [user?.type, navigate, isAdminViewingAs])
  const [patientSearch, setPatientSearch] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false)
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [showProfessionalModal, setShowProfessionalModal] = useState(false)

  const normalizedEffectiveType = normalizeUserType(effectiveType)
  const isProfessionalDashboard =
    normalizedEffectiveType === 'profissional' ||
    viewAsType === 'profissional' ||
    location.pathname.includes('/profissional/')

  const sectionNavOptions = useMemo<SectionOption[] | null>(() => {
    const clinicaOptions: SectionOption[] = [
      {
        id: 'atendimento',
        label: 'Atendimento',
        description: 'Fluxo completo de consultas e telemedicina',
        icon: Stethoscope
      },
      {
        id: 'agendamentos',
        label: 'Agenda',
        description: 'Gestão de sessões e follow-ups clínicos',
        icon: Calendar
      },
      {
        id: 'pacientes',
        label: 'Pacientes',
        description: 'Histórico, prioridades e anotações clínicas',
        icon: Users
      },
      {
        id: 'prescricoes',
        label: 'Prescrições',
        description: 'Protocolos terapêuticos e integrações',
        icon: FileText
      },
      {
        id: 'relatorios-clinicos',
        label: 'Relatórios',
        description: 'Documentos e insights gerados pela IA',
        icon: BarChart3
      },
      {
        id: 'chat-pacientes',
        label: 'Chat Pacientes',
        description: 'Acompanhamento contínuo com pacientes',
        icon: MessageCircle
      },
      {
        id: 'chat-profissionais',
        label: 'Equipe Clínica',
        description: 'Discussões entre profissionais da plataforma',
        icon: MessageCircle
      }
    ]

    const ensinoOptions: SectionOption[] = [
      {
        id: 'aulas',
        label: 'Aulas',
        description: 'Planejamento e acesso aos módulos formativos',
        icon: GraduationCap
      },
      {
        id: 'biblioteca',
        label: 'Biblioteca',
        description: 'Materiais acadêmicos e referências clínicas',
        icon: BookOpen
      },
      {
        id: 'avaliacao',
        label: 'Avaliações',
        description: 'Progresso dos alunos e instrumentos avaliativos',
        icon: CheckCircle
      },
      {
        id: 'newsletter',
        label: 'Notícias & Eventos',
        description: 'Atualizações da pós-graduação e comunidade',
        icon: Bell
      },
      {
        id: 'chat-profissionais',
        label: 'Mentoria',
        description: 'Comunicação com corpo docente e tutores',
        icon: MessageCircle
    },
    {
      id: 'ferramentas-pedagogicas',
      label: 'Ferramentas Pedagógicas',
      description: 'Recursos inteligentes para criação de aulas e slides',
      icon: FileText
      }
    ]

    const pesquisaOptions: SectionOption[] = [
      {
        id: 'avaliacao',
        label: 'Protocolos',
        description: 'Gestão de estudos e métricas de pesquisa',
        icon: Activity
      },
      {
        id: 'relatorios-clinicos',
        label: 'Analytics',
        description: 'Indicadores e resultados consolidados',
        icon: TrendingUp
      },
      {
        id: 'biblioteca',
        label: 'Base Científica',
        description: 'Publicações, datasets e referências',
        icon: Search
      },
      {
        id: 'newsletter',
        label: 'Insights',
        description: 'Atualizações científicas e relatórios da equipe',
        icon: Bell
      },
      {
        id: 'chat-profissionais',
        label: 'Colaboração',
        description: 'Sincronização com pesquisadores e parceiros',
        icon: MessageCircle
      }
    ]

    if (!isProfessionalDashboard && normalizedEffectiveType !== 'admin') {
      return null
    }

    if (normalizedEffectiveType === 'admin') {
      const eixoOptions =
        currentEixo === 'ensino'
          ? ensinoOptions
          : currentEixo === 'pesquisa'
          ? pesquisaOptions
          : clinicaOptions

      const eixoIds = new Set(eixoOptions.map(option => option.id))

      const adminOptions: SectionOption[] = [
        {
          id: 'dashboard',
          label: 'Resumo Administrativo',
          description: 'Visão consolidada da plataforma',
          icon: LayoutDashboard
        },
        {
          id: 'admin-usuarios',
          label: 'Usuários',
          description: 'Gestão de equipes e permissões',
          icon: Users
        },
        {
          id: 'admin-upload',
          label: 'Biblioteca Compartilhada',
          description: 'Uploads e organização de documentos',
          icon: Upload
        },
        {
          id: 'admin-renal',
          label: 'Função Renal',
          description: 'Monitoramento integrado de nefrologia',
          icon: Activity
        },
        ...eixoOptions.filter(option => !eixoIds.has(option.id) || !['dashboard'].includes(option.id))
      ]

      // Garantir que opções do eixo sejam incluídas após as administrativas
      eixoOptions.forEach(option => {
        if (!adminOptions.some(existing => existing.id === option.id)) {
          adminOptions.push(option)
        }
      })

      return adminOptions
    }

    if (currentEixo === 'ensino') {
      return ensinoOptions
    }

    if (currentEixo === 'pesquisa') {
      return pesquisaOptions
    }

    return clinicaOptions
  }, [currentEixo, isProfessionalDashboard, normalizedEffectiveType])

  const sectionParam = (searchParams.get('section') as SectionId | null) || null

  const goToSection = useCallback(
    (sectionId: SectionId) => {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('section', sectionId)
      setSearchParams(nextParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const resolvedSection: SectionId = useMemo(() => {
    const defaultByContext: Record<string, SectionId> = {
      admin: 'atendimento',
      clinica: 'atendimento',
      ensino: 'aulas',
      pesquisa: 'avaliacao'
    }

    const eixoKey =
      normalizedEffectiveType === 'admin' ? 'admin' : currentEixo || 'clinica'
    const preferredSection = defaultByContext[eixoKey]

    if (sectionNavOptions && sectionNavOptions.length > 0) {
      if (
        sectionParam &&
        sectionNavOptions.some(option => option.id === sectionParam)
      ) {
        return sectionParam
      }

      if (
        preferredSection &&
        sectionNavOptions.some(option => option.id === preferredSection)
      ) {
        return preferredSection
      }

      return sectionNavOptions[0].id
    }

    return preferredSection || 'atendimento'
  }, [sectionParam, sectionNavOptions, normalizedEffectiveType, currentEixo])

  useEffect(() => {
    if (!sectionNavOptions || sectionNavOptions.length === 0) return
    if (sectionParam === resolvedSection) return
    goToSection(resolvedSection)
  }, [resolvedSection, sectionNavOptions, sectionParam, goToSection])
  
  // KPIs Administrativos Personalizados
  const [kpis, setKpis] = useState({
    administrativos: {
      totalPacientes: 0,
      avaliacoesCompletas: 0,
      protocolosAEC: 0,
      protocolosIMRE: 0,
      respondedoresTEZ: 0,
      consultoriosAtivos: 0
    },
    semanticos: {
      qualidadeEscuta: 0,
      engajamentoPaciente: 0,
      satisfacaoClinica: 0,
      aderenciaTratamento: 0
    },
    clinicos: {
      wearablesAtivos: 0,
      monitoramento24h: 0,
      episodiosEpilepsia: 0,
      melhoraSintomas: 0
    }
  })

  // Debug para verificar seção ativa
  console.log('🎯 Seção ativa:', resolvedSection)

  // Carregar KPIs das 3 camadas da plataforma
  const loadKPIs = useCallback(async () => {
    try {
      const { data: assessments, error: assessmentsError } = await supabase
        .from('clinical_assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (assessmentsError) {
        console.error('❌ Erro ao buscar avaliações:', assessmentsError)
        return
      }

      const assessmentList = assessments || []

      const uniquePatientIds = new Set(
        assessmentList
          .map((assessment: any) => assessment.patient_id)
          .filter((id: string | null) => Boolean(id))
      )
      const totalPacientes = uniquePatientIds.size
      const avaliacoesCompletas = assessmentList.filter((assessment: any) => assessment.status === 'completed').length
      const protocolosAEC = assessmentList.filter((assessment: any) => assessment.assessment_type === 'AEC').length
      const protocolosIMRE = assessmentList.filter((assessment: any) => assessment.assessment_type === 'IMRE').length
      const respondedoresTEZ = assessmentList.filter((assessment: any) => assessment.data?.improvement === true).length
      const consultoriosAtivos = new Set(
        assessmentList
          .map((assessment: any) => assessment.doctor_id || assessment.data?.doctor_id)
          .filter((id: string | null) => Boolean(id))
      ).size

      const { data: semanticKPIs, error: semanticError } = await supabase
        .from('clinical_kpis')
        .select('name, current_value, category')
        .in('category', ['comportamental', 'cognitivo', 'social', 'neurologico'])

      if (semanticError) {
        console.warn('⚠️ Erro ao carregar KPIs semânticos:', semanticError)
      }

      let qualidadeEscuta = 0
      let engajamentoPaciente = 0
      let satisfacaoClinica = 0
      let aderenciaTratamento = 0

      if (semanticKPIs && semanticKPIs.length > 0) {
        const qualidadeKPI = semanticKPIs.find(kpi => kpi.name?.toLowerCase().includes('qualidade') || kpi.name?.toLowerCase().includes('escuta'))
        const engajamentoKPI = semanticKPIs.find(kpi => kpi.name?.toLowerCase().includes('engajamento'))
        const satisfacaoKPI = semanticKPIs.find(kpi => kpi.name?.toLowerCase().includes('satisfação') || kpi.name?.toLowerCase().includes('satisfacao'))
        const aderenciaKPI = semanticKPIs.find(kpi => kpi.name?.toLowerCase().includes('aderência') || kpi.name?.toLowerCase().includes('aderencia'))

        qualidadeEscuta = qualidadeKPI?.current_value ? Number(qualidadeKPI.current_value) : 0
        engajamentoPaciente = engajamentoKPI?.current_value ? Number(engajamentoKPI.current_value) : 0
        satisfacaoClinica = satisfacaoKPI?.current_value ? Number(satisfacaoKPI.current_value) : 0
        aderenciaTratamento = aderenciaKPI?.current_value ? Number(aderenciaKPI.current_value) : 0
      }

      const { data: wearableDevices, error: wearableError } = await supabase
        .from('wearable_devices')
        .select('id')
        .eq('connection_status', 'connected')

      if (wearableError) {
        console.warn('⚠️ Erro ao carregar dispositivos conectados:', wearableError)
      }

      const { data: epilepsyEvents, error: epilepsyError } = await supabase
        .from('epilepsy_events')
        .select('severity, timestamp')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (epilepsyError) {
        console.warn('⚠️ Erro ao carregar eventos de epilepsia:', epilepsyError)
      }

      const wearablesAtivos = wearableDevices?.length || 0
      const monitoramento24h = wearablesAtivos
      const episodiosEpilepsia = epilepsyEvents?.length || 0
      const eventosLeves = epilepsyEvents?.filter(evento => evento.severity === 'leve').length || 0
      const melhoraSintomas = episodiosEpilepsia > 0 ? Math.round((eventosLeves / episodiosEpilepsia) * 100) : 0

      setKpis({
        administrativos: {
          totalPacientes,
          avaliacoesCompletas,
          protocolosAEC,
          protocolosIMRE,
          respondedoresTEZ,
          consultoriosAtivos
        },
        semanticos: {
          qualidadeEscuta: Math.round(qualidadeEscuta),
          engajamentoPaciente: Math.round(engajamentoPaciente),
          satisfacaoClinica: Math.round(satisfacaoClinica),
          aderenciaTratamento: Math.round(aderenciaTratamento)
        },
        clinicos: {
          wearablesAtivos,
          monitoramento24h,
          episodiosEpilepsia,
          melhoraSintomas
        }
      })
    } catch (error) {
      console.error('❌ Erro ao carregar KPIs:', error)
    }
  }, [user?.id])

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true)

      if (user && isAdmin(user)) {
        console.log('✅ Admin carregando pacientes com permissões administrativas')
        const allPatients = await getAllPatients(user.id, user.type || 'admin')
        setPatients(allPatients)
        setLoading(false)
        return
      }

      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar pacientes:', error)
        return
      }

      const uniquePatients = new Map<string, Patient>()
      assessments?.forEach(assessment => {
        if (assessment.patient_id && !uniquePatients.has(assessment.patient_id)) {
          uniquePatients.set(assessment.patient_id, {
            id: assessment.patient_id,
            name: assessment.data?.name || 'Paciente',
            age: assessment.data?.age || 30,
            cpf: assessment.data?.cpf || '000.000.000-00',
            phone: assessment.data?.phone || '(00) 00000-0000',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: assessment.status === 'completed' ? 'Ativo' : 'Em tratamento',
            assessments: [assessment],
            condition: assessment.data?.complaintList?.[0] || 'Condição não especificada',
            priority: assessment.data?.improvement ? 'low' : 'high'
          })
        }
      })

      setPatients(Array.from(uniquePatients.values()))
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handlePatientSelect = useCallback((patientId: string) => {
    setSelectedPatient(patientId)
    setSelectedAppointmentId(null)
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      setClinicalNotes(`Notas clínicas para ${patient.name}:\n\n`)
    }
  }, [patients])

  const handleSaveNotes = async () => {
    if (!selectedPatient) return
    
    try {
      // Aqui você pode implementar a lógica para salvar as notas
      console.log('💾 Salvando notas clínicas:', clinicalNotes)
      // Implementar salvamento no banco de dados
    } catch (error) {
      console.error('❌ Erro ao salvar notas:', error)
    }
  }

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return

    try {
      setAppointmentsLoading(true)

      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 1)

      let query = supabase
        .from('appointments')
        .select('id, patient_id, professional_id, title, description, appointment_date, duration, status, type, location, is_remote, meeting_url')
        .gte('appointment_date', fromDate.toISOString())
        .order('appointment_date', { ascending: true })
        .limit(60)

      if (normalizedEffectiveType === 'profissional' && user.id) {
        query = query.eq('professional_id', user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Erro ao carregar agendamentos:', error)
        setAppointments([])
        return
      }

      const appointmentList: Appointment[] = data || []

      if (appointmentList.length === 0) {
        setAppointments([])
        return
      }

      const patientIds = Array.from(
        new Set(
          appointmentList
            .map(appointment => appointment.patient_id)
            .filter((id): id is string => Boolean(id))
        )
      )

      const patientsMap = new Map<string, { id: string; name: string | null; email: string | null; phone?: string | null; type?: string | null }>()

      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from('users_compatible')
          .select('id, name, email, phone, type')
          .in('id', patientIds)

        if (patientsError) {
          console.warn('⚠️ Erro ao carregar pacientes relacionados aos agendamentos:', patientsError)
        }

        patientsData?.forEach(patient => {
          if (patient?.id) {
            patientsMap.set(patient.id, {
              id: patient.id,
              name: patient.name || null,
              email: patient.email || null,
              phone: (patient as any).phone || null,
              type: patient.type || null
            })
          }
        })
      }

      const enrichedAppointments: EnrichedAppointment[] = appointmentList.map(appointment => {
        const appointmentDate = new Date(appointment.appointment_date)
        const patientInfo = appointment.patient_id ? patientsMap.get(appointment.patient_id) : undefined
        return {
          ...appointment,
          patient: patientInfo,
          formattedTime: new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }).format(appointmentDate),
          formattedDate: new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          }).format(appointmentDate),
          isPast: appointmentDate.getTime() < Date.now()
        }
      })

      setAppointments(enrichedAppointments)
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar agendamentos:', error)
      setAppointments([])
    } finally {
      setAppointmentsLoading(false)
    }
  }, [normalizedEffectiveType, user?.id])

  useEffect(() => {
    if (!user?.id) return
    loadPatients()
    loadKPIs()
    loadAppointments()
  }, [user?.id, loadPatients, loadKPIs, loadAppointments])

  const handleStartAppointment = useCallback(
    (appointment: EnrichedAppointment, opts?: { navigateToChat?: boolean }) => {
      if (appointment.patient_id) {
        handlePatientSelect(appointment.patient_id)
      } else {
        setSelectedPatient(null)
        setSelectedAppointmentId(appointment.id)
      }

      setSelectedAppointmentId(appointment.id)

      if (opts?.navigateToChat) {
        if (appointment.patient_id) {
          navigate(`/app/clinica/paciente/chat-profissional/${appointment.patient_id}`)
        } else {
          navigate('/app/clinica/paciente/chat-profissional')
        }
      }
    },
    [handlePatientSelect, navigate]
  )

  const renderDashboard = () => (
    <>
      {/* Navegação por Eixos */}
      <div className="space-y-4 md:space-y-6 lg:space-y-8 mb-4 md:mb-6 lg:mb-8">
        {/* 🔧 FUNCIONALIDADES ADMINISTRATIVAS - PRIMEIRO PARA ADMIN */}
        {normalizeUserType(user?.type) === 'admin' && (
          <div className="w-full overflow-x-hidden">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center break-words">
              <Settings className="w-5 h-5 md:w-6 md:h-6 mr-2 text-orange-400 flex-shrink-0" />
              <span>🔧 Funcionalidades Administrativas</span>
            </h2>
            <div className="mb-4 md:mb-6">
              <div className="rounded-2xl border border-[#00C16A]/20 bg-gradient-to-br from-[#0A192F] via-[#102C45] to-[#1F4B38] p-5 md:p-6 lg:p-7 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#00C16A] to-[#1a365d] shadow-lg">
                      <img
                        src="/brain.png"
                        alt="MedCann Lab"
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35)) brightness(1.2)' }}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-[#00C16A] mb-2">MedCann Lab</p>
                      <h3 className="text-xl md:text-2xl font-bold text-white">Integração Cannabis &amp; Nefrologia</h3>
                      <p className="text-xs md:text-sm text-[#C8D6E5] mt-2 max-w-3xl">
                        Pesquisa pioneira conectando ensino, clínica e pesquisa para mapear benefícios terapêuticos da cannabis medicinal,
                        avaliando impactos na função renal com apoio da metodologia AEC.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                    className="self-start lg:self-center bg-gradient-to-r from-[#00C16A] to-[#1a365d] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Explorar Projeto
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {[
                    {
                      title: 'Protocolos de prescrição AEC',
                      description: 'Fluxos clínicos padronizados pela metodologia de anamnese AEC',
                    },
                    {
                      title: 'Monitoramento de função renal',
                      description: 'KPIs nefrológicos integrados ao prontuário avaliados em tempo real',
                    },
                    {
                      title: 'Deep Learning em biomarcadores',
                      description: 'Modelos que correlacionam exames laboratoriais e evolução clínica',
                    },
                    {
                      title: 'Integração com dispositivos médicos',
                      description: 'Wearables e equipamentos enviando dados contínuos para o LabPec',
                    },
                  ].map((item) => (
                    <div key={item.title} className="bg-[#0F243C]/70 border border-[#00C16A]/10 rounded-lg p-4 flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-[#00C16A] mt-1" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-[#9FB3C6] leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6 w-full overflow-x-hidden">
              <button 
                onClick={() => goToSection('admin-usuarios')}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">👥 Usuários</h3>
                  <Users className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Gestão de usuários do sistema</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/courses')}
                className="bg-gradient-to-r from-green-500 to-teal-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🎓 Cursos</h3>
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Gestão de cursos e materiais</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/professional-financial')}
                className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">💰 Financeiro</h3>
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Controle financeiro e pagamentos</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/chat')}
                className="bg-gradient-to-r from-cyan-500 to-blue-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">💬 Chat Global + Moderação</h3>
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Moderação de chats e conversas</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/gamificacao')}
                className="bg-gradient-to-r from-yellow-500 to-orange-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🏆 Ranking & Programa de Pontos</h3>
                  <Activity className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Sistema de pontos e rankings</p>
              </button>
              
              <button 
                onClick={() => goToSection('admin-upload')}
                className="bg-gradient-to-r from-indigo-500 to-purple-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">📁 Upload</h3>
                  <Upload className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Upload de documentos e arquivos</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/knowledge-analytics')}
                className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">📊 Analytics</h3>
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Análise de dados e relatórios</p>
              </button>
              
              <button 
                onClick={() => goToSection('admin-renal')}
                className="bg-gradient-to-r from-red-500 to-pink-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🫀 Função Renal</h3>
                  <Activity className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Monitoramento de função renal</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/admin-settings')}
                className="bg-gradient-to-r from-slate-500 to-gray-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">⚙️ Sistema</h3>
                  <Settings className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Configurações do sistema</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/library')}
                className="bg-gradient-to-r from-teal-500 to-cyan-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">📚 Biblioteca</h3>
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Biblioteca médica e documentos</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/ai-documents')}
                className="bg-gradient-to-r from-violet-500 to-purple-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🤖 Chat IA Documentos</h3>
                  <Brain className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">IA para análise de documentos</p>
              </button>
            </div>

            {/* 🌍 CIDADE AMIGA DOS RINS - DR. RICARDO VALENÇA */}
            <div className="bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-xl p-6 border-2 border-blue-500/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">🌍 Cidade Amiga dos Rins</h2>
                    <p className="text-sm text-slate-300">Coordenador: Dr. Ricardo Valença - Interconexão com Pós-graduação Cannabis (Função Renal)</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Acessar Projeto
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">🔗 Interconexão</h3>
                  <p className="text-xs text-slate-300">Cidade Amiga dos Rins ↔ Pós-graduação Cannabis Medicinal (Função Renal)</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">🎯 Objetivo</h3>
                  <p className="text-xs text-slate-300">Pesquisa pioneira da cannabis medicinal aplicada à nefrologia</p>
                </div>
              </div>
            </div>

            {/* 🎭 ARTE DA ENTREVISTA CLÍNICA - DR. RICARDO VALENÇA */}
            <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-xl p-6 border-2 border-green-500/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">🎭 Arte da Entrevista Clínica</h2>
                    <p className="text-sm text-slate-300">Coordenador e Professor: Dr. Ricardo Valença - Espinha Dorsal da Plataforma - Interconexão com Pós-graduação Cannabis (Anamnese)</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/ensino/profissional/arte-entrevista-clinica')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Acessar AEC
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-green-400 mb-2">🔗 Interconexão</h3>
                  <p className="text-xs text-slate-300">Arte da Entrevista Clínica ↔ Pós-graduação Cannabis Medicinal (Anamnese)</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">🎯 Metodologia</h3>
                  <p className="text-xs text-slate-300">Metodologia AEC - Espinha Dorsal que conecta todos os eixos</p>
                </div>
              </div>
            </div>

            {/* 📊 TRÊS CAMADAS DE KPIs - VISUALIZAÇÃO SEPARADA */}
            <div className="space-y-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
                <span>📊 Três Camadas de KPIs</span>
              </h2>
              
              {/* Camada Administrativa */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  <span>📊 Camada Administrativa</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Total de Pacientes</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.totalPacientes}</p>
                    <p className="text-xs text-slate-400 mt-1">Pacientes no sistema</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Avaliações Completas</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.avaliacoesCompletas}</p>
                    <p className="text-xs text-slate-400 mt-1">Protocolos finalizados</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Protocolos AEC</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.protocolosAEC}</p>
                    <p className="text-xs text-slate-400 mt-1">Metodologia aplicada</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Consultórios Ativos</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.consultoriosAtivos}</p>
                    <p className="text-xs text-slate-400 mt-1">Rede integrada</p>
                  </div>
                </div>
              </div>

              {/* Camada Semântica */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-purple-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  <span>🧠 Camada Semântica</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Qualidade da Escuta</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.qualidadeEscuta}%</p>
                    <p className="text-xs text-slate-400 mt-1">Análise semântica</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Engajamento</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.engajamentoPaciente}%</p>
                    <p className="text-xs text-slate-400 mt-1">Participação ativa</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Satisfação Clínica</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.satisfacaoClinica}%</p>
                    <p className="text-xs text-slate-400 mt-1">Avaliação da experiência</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Aderência ao Tratamento</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.aderenciaTratamento}%</p>
                    <p className="text-xs text-slate-400 mt-1">Compliance</p>
                  </div>
                </div>
              </div>

              {/* Camada Clínica */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border-2 border-blue-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  <span>🏥 Camada Clínica</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Wearables Ativos</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.wearablesAtivos}</p>
                    <p className="text-xs text-slate-400 mt-1">Monitoramento 24h</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Monitoramento 24h</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.monitoramento24h}</p>
                    <p className="text-xs text-slate-400 mt-1">Pacientes monitorados</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Episódios Epilepsia</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.episodiosEpilepsia}</p>
                    <p className="text-xs text-slate-400 mt-1">Registrados hoje</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Melhora de Sintomas</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.melhoraSintomas}</p>
                    <p className="text-xs text-slate-400 mt-1">Pacientes melhorando</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6 lg:mb-8">
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-700">
                <p className="text-xs md:text-sm text-slate-400 mb-1">Sistema Online</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">99.9%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-700">
                <p className="text-xs md:text-sm text-slate-400 mb-1">Usuários Ativos</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">1,234</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-700">
                <p className="text-xs md:text-sm text-slate-400 mb-1">Avaliações Hoje</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">156</p>
              </div>
            </div>

            {/* 👥 PAINEL DE TIPOS DE USUÁRIOS */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-400" />
                <span>👥 Painel de Tipos de Usuários</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Card Paciente */}
                <button
                  onClick={() => {
                    // Se admin, definir tipo visual como paciente
                    if (normalizeUserType(user?.type) === 'admin') {
                      setViewAsType('paciente')
                    }
                    // Navegar para dashboard de paciente no eixo clínica
                    navigate('/app/clinica/paciente/dashboard')
                  }}
                  className={`bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${
                    effectiveType === 'paciente' ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">👤 Dashboard do Paciente</h3>
                    <User className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {effectiveType === 'paciente' && isAdminViewingAs && '👁️ Visualizando como '}
                    Acessar dashboard do paciente
                  </p>
                </button>

                {/* Card Profissional */}
                <button
                  onClick={() => {
                    const userTypeNormalized = normalizeUserType(user?.type)
                    if (userTypeNormalized === 'admin') {
                      // Se admin, mostrar modal para escolher consultório ou profissional genérico
                      setShowProfessionalModal(true)
                    } else {
                      // Se não admin, navegar diretamente para o dashboard profissional do eixo atual
                      const eixo = currentEixo || 'clinica'
                      navigate(`/app/${eixo}/profissional/dashboard`)
                    }
                  }}
                  className={`bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${
                    effectiveType === 'profissional' ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">👨‍⚕️ Dashboard do Profissional</h3>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {effectiveType === 'profissional' && isAdminViewingAs && '👁️ Visualizando como '}
                    {normalizeUserType(user?.type) === 'admin' 
                      ? 'Acessar dashboards de profissionais e consultórios'
                      : `Acessar dashboard profissional (${currentEixo || 'clínica'})`
                    }
                  </p>
                </button>

                {/* Card Aluno */}
                <button
                  onClick={() => {
                    // Se admin, definir tipo visual como aluno
                    if (normalizeUserType(user?.type) === 'admin') {
                      setViewAsType('aluno')
                    }
                    // Navegar para dashboard de aluno no eixo ensino ou pesquisa
                    const eixo = currentEixo === 'pesquisa' ? 'pesquisa' : 'ensino'
                    navigate(`/app/${eixo}/aluno/dashboard`)
                  }}
                  className={`bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${
                    effectiveType === 'aluno' ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">🎓 Dashboard do Aluno</h3>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {effectiveType === 'aluno' && isAdminViewingAs && '👁️ Visualizando como '}
                    Acessar dashboard do aluno (ensino/pesquisa)
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo do Dashboard - Apenas para Admin quando necessário */}
      {normalizeUserType(user?.type) === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Sidebar - Patient List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <div className="p-4 border-b border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 h-[calc(100vh-300px)] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-slate-400">Carregando pacientes...</div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">Nenhum paciente encontrado.</div>
                ) : (
                  <div className="space-y-3">
                    {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedPatient === patient.id
                            ? 'bg-blue-600 border-blue-400 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <h4 className="font-semibold text-lg">{patient.name}</h4>
                        <p className="text-sm opacity-75">Última visita: {patient.lastVisit}</p>
                        <p className="text-xs opacity-60 mt-1">Status: {patient.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {selectedPatient ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-4">Detalhes do Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div>
                  <p><span className="font-semibold text-white">Nome:</span> {patients.find(p => p.id === selectedPatient)?.name}</p>
                  <p><span className="font-semibold text-white">Idade:</span> {patients.find(p => p.id === selectedPatient)?.age}</p>
                  <p><span className="font-semibold text-white">CPF:</span> {patients.find(p => p.id === selectedPatient)?.cpf}</p>
                </div>
                <div>
                  <p><span className="font-semibold text-white">Telefone:</span> {patients.find(p => p.id === selectedPatient)?.phone}</p>
                  <p><span className="font-semibold text-white">Condição:</span> {patients.find(p => p.id === selectedPatient)?.condition}</p>
                  <p><span className="font-semibold text-white">Última Visita:</span> {patients.find(p => p.id === selectedPatient)?.lastVisit}</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-white mb-2">Notas Clínicas</h4>
                <textarea
                  className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adicione notas clínicas aqui..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                ></textarea>
                <button
                  onClick={handleSaveNotes}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                >
                  Salvar Notas
                </button>
              </div>
            </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center text-slate-400 border border-slate-700/50 h-full flex items-center justify-center">
                Selecione um paciente para ver os detalhes e notas clínicas.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )

  const renderKPIsAdmin = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">📊 KPIs Administrativos</h2>
        <p className="text-slate-300">Monitoramento das 3 camadas da plataforma MedCannLab 3.0</p>
      </div>

      {/* Camada Administrativa */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
          📊 Camada Administrativa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Total de Pacientes</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.totalPacientes}</p>
            <p className="text-xs text-slate-400">Pacientes no sistema</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Avaliações Completas</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.avaliacoesCompletas}</p>
            <p className="text-xs text-slate-400">Protocolos finalizados</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Protocolos AEC</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.protocolosAEC}</p>
            <p className="text-xs text-slate-400">Metodologia aplicada</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Consultórios Ativos</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.consultoriosAtivos}</p>
            <p className="text-xs text-slate-400">Rede integrada</p>
          </div>
        </div>
      </div>

      {/* Camada Semântica */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-purple-400" />
          🧠 Camada Semântica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Qualidade da Escuta</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.qualidadeEscuta}%</p>
            <p className="text-xs text-slate-400">Análise semântica</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Engajamento</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.engajamentoPaciente}%</p>
            <p className="text-xs text-slate-400">Participação ativa</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Satisfação Clínica</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.satisfacaoClinica}%</p>
            <p className="text-xs text-slate-400">Avaliação da experiência</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Aderência ao Tratamento</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.aderenciaTratamento}%</p>
            <p className="text-xs text-slate-400">Compliance</p>
          </div>
        </div>
      </div>

      {/* Camada Clínica */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-orange-400" />
          🏥 Camada Clínica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Wearables Ativos</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.wearablesAtivos}</p>
            <p className="text-xs text-slate-400">Monitoramento 24h</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Monitoramento 24h</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.monitoramento24h}</p>
            <p className="text-xs text-slate-400">Pacientes monitorados</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Episódios Epilepsia</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.episodiosEpilepsia}</p>
            <p className="text-xs text-slate-400">Registrados hoje</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Melhora de Sintomas</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.melhoraSintomas}</p>
            <p className="text-xs text-slate-400">Pacientes melhorando</p>
          </div>
        </div>
      </div>

      {/* Botão para voltar ao dashboard */}
      <div className="text-center">
        <button
          onClick={() => goToSection('dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          ← Voltar ao Dashboard
        </button>
      </div>
    </div>
  )

  const renderAgendamentos = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Calendar className="w-6 h-6" />
          <span>📅 Agendamentos</span>
        </h2>
        <p className="text-purple-200">
          Gerencie seus agendamentos e visualize sua agenda completa
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Hoje</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Esta Semana</p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Confirmados</p>
              <p className="text-2xl font-bold text-white">18</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-white">6</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Agenda de Hoje */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-purple-400" />
          Agenda de Hoje
        </h3>
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">09</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Maria Santos</h4>
                <p className="text-slate-400 text-sm">Consulta de retorno - Epilepsia</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">09:00</p>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Confirmado</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">14</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">João Silva</h4>
                <p className="text-slate-400 text-sm">Avaliação inicial - TEA</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">14:00</p>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Confirmado</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">16</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Ana Costa</h4>
                <p className="text-slate-400 text-sm">Consulta de emergência</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">16:30</p>
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Pendente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Novo Agendamento</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Ver Agenda Completa</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
            <Download className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Exportar Agenda</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderPacientes = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>👥 Meus Pacientes</span>
        </h2>
        <p className="text-green-200">
          Gerencie prontuários e acompanhe a evolução dos seus pacientes
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{patients.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Ativos</p>
              <p className="text-2xl font-bold text-white">{patients.filter(p => p.status === 'Ativo').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Em Tratamento</p>
              <p className="text-2xl font-bold text-white">{patients.filter(p => p.status === 'Em tratamento').length}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Novos</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Users className="w-6 h-6 mr-2 text-green-400" />
            Lista de Pacientes
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/app/patient-management-advanced')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Gestão Avançada
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4 inline mr-2" />
              Novo Paciente
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-400">Carregando pacientes...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Nenhum paciente encontrado.</div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer"
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg">{patient.name}</h4>
                      <p className="text-slate-400 text-sm">Idade: {patient.age} anos • {patient.condition}</p>
                      <p className="text-slate-500 text-xs">Última visita: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'Ativo' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {patient.status}
                    </span>
                    <p className="text-slate-400 text-sm mt-1">{patient.assessments?.length || 0} avaliações</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderAulas = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-800 to-yellow-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <GraduationCap className="w-6 h-6" />
          <span>🎓 Preparação de Aulas</span>
        </h2>
        <p className="text-yellow-200">
          Prepare e gerencie suas aulas e materiais educacionais
        </p>
      </div>

      {/* Cursos Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-yellow-400" />
            Pós-Graduação Cannabis Medicinal
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Módulo 1: Fundamentos</h4>
              <p className="text-slate-400 text-sm">Aula 1 - Introdução à Cannabis Medicinal</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 15/01/2024</span>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Módulo 2: Aplicações Clínicas</h4>
              <p className="text-slate-400 text-sm">Aula 3 - Epilepsia e TEA</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 22/01/2024</span>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-blue-400" />
            Arte da Entrevista Clínica (AEC)
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Fundamentos AEC</h4>
              <p className="text-slate-400 text-sm">Técnicas de escuta ativa</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 18/01/2024</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Protocolo IMRE</h4>
              <p className="text-slate-400 text-sm">Metodologia triaxial</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 25/01/2024</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Materiais e Recursos */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Materiais e Recursos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors">
            <Upload className="w-6 h-6 mx-auto mb-2 text-white" />
            <span className="font-semibold text-white">Upload de Materiais</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-white" />
            <span className="font-semibold text-white">Biblioteca</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-white" />
            <span className="font-semibold text-white">Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderFerramentasPedagogicas = () => {
    const heroStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 55%, #2d5a3d 100%)',
      border: '1px solid rgba(0,193,106,0.18)',
      boxShadow: '0 18px 42px rgba(2,12,27,0.45)'
    }

    const cardStyleLocal: React.CSSProperties = {
      background: 'rgba(7,22,41,0.88)',
      border: '1px solid rgba(0,193,106,0.12)',
      boxShadow: '0 16px 32px rgba(2,12,27,0.38)'
    }

    const tileStyle: React.CSSProperties = {
      background: 'rgba(12,34,54,0.75)',
      border: '1px solid rgba(0,193,106,0.12)',
      boxShadow: '0 10px 24px rgba(2,12,27,0.32)'
    }

    return (
      <div className="space-y-6">
        <div className="rounded-xl p-6" style={heroStyle}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center space-x-3">
            <FileText className="w-6 h-6 text-[#00F5A0]" />
            <span>Ferramentas Pedagógicas Integradas</span>
          </h2>
          <p className="text-slate-200/85 text-sm md:text-base max-w-3xl">
            Produza relatos de caso, crie e publique aulas, além de colaborar com a IA residente na preparação e análise de slides. Todo o fluxo pedagógico foi integrado ao painel profissional para centralizar curadoria, revisão e publicação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="rounded-xl p-6 space-y-4" style={cardStyleLocal}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)' }}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Casos Clínicos</h3>
                <p className="text-xs text-slate-300/80">2 dossiês disponíveis</p>
              </div>
            </div>
            <p className="text-sm text-slate-200/85">
              Acesse casos clínicos reais, extraia recortes relevantes e converta em aulas, relatos ou materiais avaliativos com apoio da IA residente.
            </p>
            <button
              onClick={() => navigate('/app/chat?context=casos-clinicos')}
              className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)' }}
            >
              Acessar Casos
            </button>
          </div>

          <div className="rounded-xl p-6 space-y-4" style={cardStyleLocal}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Minhas Aulas</h3>
                <p className="text-xs text-slate-300/80">Gestão centralizada</p>
              </div>
            </div>
            <p className="text-sm text-slate-200/85">
              Organize roteiros, módulos e materiais complementares. A IA residente oferece revisões, resumos e sugestões de aprimoramento para publicação.
            </p>
            <button
              onClick={() => navigate('/app/chat?context=minhas-aulas')}
              className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)' }}
            >
              Criar Nova Aula
            </button>
          </div>

          <div className="rounded-xl p-6 space-y-4" style={cardStyleLocal}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)' }}>
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Preparação de Slides</h3>
                <p className="text-xs text-slate-300/80">Criação assistida</p>
              </div>
            </div>
            <p className="text-sm text-slate-200/85">
              Envie apresentações em PowerPoint ou crie slides do zero com a IA. Receba ajustes, refinamentos visuais e adequações para publicação oficial.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => navigate('/app/chat?context=slides&action=visualizar')}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)', color: '#12273D' }}
              >
                Visualizar Slides
              </button>
              <button
                onClick={() => navigate('/app/chat?context=slides&action=criar')}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)' }}
              >
                Enviar PowerPoint
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 space-y-6" style={cardStyleLocal}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Visualize ou construa novos slides</h3>
              <p className="text-sm text-slate-200/80">
                Utilize o player integrado para apresentar materiais existentes e convoque a IA para construir sequências inéditas orientadas por protocolos clínicos ou pedagógicos.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => navigate('/app/chat?context=slides&action=player')}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)' }}
              >
                Abrir Player de Slides
              </button>
              <button
                onClick={() => navigate('/app/chat?context=slides&action=novo')}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)' }}
              >
                Criar Novo Slide
              </button>
            </div>
          </div>

          <div className="rounded-lg p-5" style={tileStyle}>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[#00F5A0]" />
              <span>Como a IA Residente Apoia cada etapa</span>
            </h4>
            <ul className="space-y-2 text-sm text-slate-200/85 list-disc list-inside">
              <li>Análise estruturada de apresentações enviadas e sugestão de melhorias narrativas e visuais.</li>
              <li>Produção de slides profissionais a partir de temas, casos clínicos ou roteiros definidos.</li>
              <li>Edição colaborativa com controles de versão e trilhas de feedback entre docentes.</li>
              <li>Preparação para publicação em trilhas educacionais, biblioteca e fóruns temáticos.</li>
              <li>Integração com casos clínicos, anexos avaliativos e materiais de pesquisa.</li>
              <li>Geração automática de quizzes, resumos executivos e materiais complementares.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderFinanceiro = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-800 to-orange-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6" />
          <span>💰 Gestão Financeira</span>
        </h2>
        <p className="text-orange-200">
          Controle financeiro completo da sua prática médica
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Receita do Mês</p>
              <p className="text-2xl font-bold text-white">R$ 45.890</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Despesas</p>
              <p className="text-2xl font-bold text-white">R$ 12.340</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Lucro Líquido</p>
              <p className="text-2xl font-bold text-white">R$ 33.550</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-white">142</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Transações Recentes</h3>
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Consulta - Maria Santos</h4>
                <p className="text-slate-400 text-sm">15/01/2024 - 14:30</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">+R$ 350,00</p>
              <span className="text-xs text-slate-500">Pago</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Avaliação - João Silva</h4>
                <p className="text-slate-400 text-sm">14/01/2024 - 09:00</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">+R$ 500,00</p>
              <span className="text-xs text-slate-500">Pago</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Equipamentos</h4>
                <p className="text-slate-400 text-sm">13/01/2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-red-400 font-semibold">-R$ 2.500,00</p>
              <span className="text-xs text-slate-500">Despesa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Financeiras */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Ações Financeiras</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Nova Receita</span>
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Registrar Despesa</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
            <BarChart3 className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Relatórios</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
            <Download className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Exportar</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderAtendimento = () => {
    type SummaryCard = {
      id: string
      label: string
      value: number
      description: string
      icon: React.ComponentType<{ className?: string }>
      gradient: string
      iconColor: string
    }

    const headerStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, rgba(10,25,47,0.96) 0%, rgba(26,54,93,0.92) 55%, rgba(45,90,61,0.9) 100%)',
      border: '1px solid rgba(0,193,106,0.18)',
      boxShadow: '0 18px 42px rgba(2,12,27,0.45)'
    }

    const surfaceStyle: React.CSSProperties = {
      background: 'rgba(7,22,41,0.85)',
      border: '1px solid rgba(0,193,106,0.1)',
      boxShadow: '0 12px 32px rgba(2,12,27,0.4)'
    }

    const cardStyle: React.CSSProperties = {
      background: 'rgba(15,36,60,0.78)',
      border: '1px solid rgba(0,193,106,0.12)'
    }

    const summaryCards: SummaryCard[] = [
      {
        id: 'in-progress',
        label: 'Em Atendimento',
        value: inProgressCount,
        description: 'Consultas confirmadas neste momento',
        icon: Activity,
        gradient: 'linear-gradient(135deg, rgba(255,107,107,0.28) 0%, rgba(249,115,22,0.22) 100%)',
        iconColor: '#FF896B'
      },
      {
        id: 'waiting',
        label: 'Aguardando',
        value: waitingCount,
        description: 'Pacientes na sala de espera para hoje',
        icon: Clock,
        gradient: 'linear-gradient(135deg, rgba(255,211,61,0.28) 0%, rgba(255,161,22,0.22) 100%)',
        iconColor: '#FFC44D'
      },
      {
        id: 'completed',
        label: 'Finalizados',
        value: completedCount,
        description: 'Consultas concluídas hoje',
        icon: CheckCircle,
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.28) 0%, rgba(34,197,94,0.2) 100%)',
        iconColor: '#34D399'
      },
      {
        id: 'next-24h',
        label: 'Próximas 24h',
        value: upcoming24hCount,
        description: 'Consultas programadas até amanhã',
        icon: Calendar,
        gradient: 'linear-gradient(135deg, rgba(59,130,246,0.28) 0%, rgba(14,165,233,0.22) 100%)',
        iconColor: '#60A5FA'
      }
    ]

    return (
      <div className="space-y-6">
        <div className="rounded-xl p-6" style={headerStyle}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-[#FFD33D]" />
                <span>Atendimento Clínico Integrado</span>
              </h2>
              <p className="text-[#C8D6E5] text-sm md:text-base max-w-2xl">
                Conecte-se com seus pacientes, acompanhe consultas em tempo real e acione a IA residente para gerar relatórios e notas durante o atendimento.
              </p>
            </div>
            <button
              onClick={() => goToSection('agendamentos')}
              className="bg-gradient-to-r from-[#00C16A] to-[#00F5A0] text-slate-900 px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Abrir Agenda Completa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map(card => {
            const SummaryIcon = card.icon
            return (
              <div key={card.id} className="rounded-xl p-4" style={{ ...surfaceStyle, background: card.gradient }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-[0.25em]">{card.label}</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      {appointmentsLoading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <span className="text-3xl font-bold text-white">{card.value}</span>
                      )}
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    <SummaryIcon className="w-5 h-5" style={{ color: card.iconColor }} />
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{card.description}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1.2fr] gap-6">
          <div className="rounded-xl p-6 space-y-5" style={surfaceStyle}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Próximos atendimentos</h3>
                <p className="text-sm text-slate-300">
                  {appointmentsLoading
                    ? 'Sincronizando com o Supabase...'
                    : `${upcomingAppointments.length} consulta(s) agendada(s)`}
                </p>
              </div>
              <button
                onClick={() => goToSection('agendamentos')}
                className="text-xs text-[#00F5A0] hover:text-white transition-colors"
              >
                Ver agenda completa →
              </button>
            </div>

            <div className="space-y-3">
              {appointmentsLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="rounded-xl p-4 animate-pulse"
                      style={cardStyle}
                    >
                      <div className="h-4 bg-slate-600/40 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-slate-600/30 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              )}

              {!appointmentsLoading && upcomingAppointments.length === 0 && (
                <div className="rounded-xl p-6 text-center" style={cardStyle}>
                  <p className="text-sm text-slate-300 mb-2">Nenhum atendimento futuro encontrado.</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Cadastre um novo horário na agenda para habilitar os indicadores de atendimento.
                  </p>
                  <button
                    onClick={() => goToSection('agendamentos')}
                    className="bg-gradient-to-r from-[#00C16A] to-[#00F5A0] text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Agendar paciente
                  </button>
                </div>
              )}

              {!appointmentsLoading && upcomingAppointments.map(appointment => {
                const badge = getStatusBadge(appointment.status)
                const isSelected = selectedAppointmentId === appointment.id
                return (
                  <div
                    key={appointment.id}
                    onClick={() => handleStartAppointment(appointment)}
                    className={`rounded-xl p-4 transition-all border ${
                      isSelected
                        ? 'border-[#00F5A0]/40 bg-emerald-500/10 shadow-lg'
                        : 'border-slate-600/40 hover:border-[#00F5A0]/30 bg-slate-800/70'
                    } cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold text-white">
                          {appointment.patient?.name || appointment.title}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {appointment.type ? appointment.type : 'Consulta clínica'} • {appointment.formattedDate}
                        </p>
                        {appointment.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-2 py-1 rounded-full ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-sm font-semibold text-white bg-white/10 px-3 py-1 rounded-lg">
                          {appointment.formattedTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-3">
                      <button
                        onClick={event => {
                          event.stopPropagation()
                          handleStartAppointment(appointment)
                        }}
                        className="text-xs text-slate-300 hover:text-white transition-colors"
                      >
                        Selecionar
                      </button>
                      <button
                        onClick={event => {
                          event.stopPropagation()
                          handleStartAppointment(appointment, { navigateToChat: true })
                        }}
                        className="bg-gradient-to-r from-[#00C16A] to-[#00F5A0] text-slate-900 px-3 py-2 rounded-lg text-xs font-semibold"
                      >
                        Iniciar atendimento
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl p-6 space-y-4" style={surfaceStyle}>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Detalhes do atendimento</h4>
                {selectedAppointment && (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-full ${getStatusBadge(selectedAppointment.status).className}`}
                  >
                    {getStatusBadge(selectedAppointment.status).label}
                  </span>
                )}
              </div>

              {selectedAppointment ? (
                <div className="space-y-4">
                  <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700/60">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Paciente</p>
                        <p className="text-sm font-semibold text-white">
                          {selectedAppointment.patient?.name || selectedAppointment.title || 'Paciente não identificado'}
                        </p>
                        {selectedAppointment.patient?.email && (
                          <p className="text-xs text-slate-400">
                            {selectedAppointment.patient.email}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Horário</p>
                        <p className="text-sm font-semibold text-white">{selectedAppointment.formattedTime}</p>
                        <p className="text-xs text-slate-400">{selectedAppointment.formattedDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/60">
                      <p className="uppercase tracking-[0.15em] text-white/50 mb-1">Tipo</p>
                      <p className="text-white font-semibold">{selectedAppointment.type || 'Consulta clínica'}</p>
                    </div>
                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/60">
                      <p className="uppercase tracking-[0.15em] text-white/50 mb-1">Duração</p>
                      <p className="text-white font-semibold">{selectedAppointment.duration ? `${selectedAppointment.duration} min` : '60 min'}</p>
                    </div>
                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/60">
                      <p className="uppercase tracking-[0.15em] text-white/50 mb-1">Formato</p>
                      <p className="text-white font-semibold">{selectedAppointment.is_remote ? 'Teleatendimento' : 'Presencial'}</p>
                    </div>
                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/60">
                      <p className="uppercase tracking-[0.15em] text-white/50 mb-1">Local / Link</p>
                      <p className="text-white font-semibold break-words">
                        {selectedAppointment.is_remote
                          ? selectedAppointment.meeting_url || 'Link não informado'
                          : selectedAppointment.location || 'Consultório MedCannLab'}
                      </p>
                    </div>
                  </div>

                  {selectedAppointment.description && (
                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/60">
                      <p className="uppercase tracking-[0.15em] text-white/50 mb-1">Observações</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedAppointment.description}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleStartAppointment(selectedAppointment, { navigateToChat: true })}
                      className="bg-gradient-to-r from-[#00C16A] to-[#00F5A0] text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Abrir chat clínico
                    </button>
                    {selectedAppointment.meeting_url && (
                      <button
                        onClick={() => window.open(selectedAppointment.meeting_url as string, '_blank', 'noopener,noreferrer')}
                        className="bg-slate-800 border border-slate-600 hover:border-[#00F5A0]/40 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Abrir link da consulta
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg p-6 text-center" style={cardStyle}>
                  <p className="text-sm text-slate-300 mb-2">Selecione um atendimento para ver detalhes.</p>
                  <p className="text-xs text-slate-500">
                    Ao iniciar uma consulta, a IA residente ficará disponível para registrar notas e gerar o relatório clínico.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl p-6 space-y-4" style={surfaceStyle}>
              <h4 className="text-lg font-semibold text-white">Ferramentas de atendimento</h4>
              <p className="text-xs text-slate-300">
                Ative recursos de telemedicina e prontuário. Selecione um paciente para habilitar as ações abaixo.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (selectedPatient) {
                      setCallType('video')
                      setIsVideoCallOpen(true)
                    } else {
                      alert('Selecione um atendimento para iniciar a videochamada.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${
                    selectedPatient
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  📹 Video Call
                </button>
                <button
                  onClick={() => {
                    if (selectedPatient) {
                      setCallType('audio')
                      setIsVideoCallOpen(true)
                    } else {
                      alert('Selecione um atendimento para iniciar a ligação.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${
                    selectedPatient
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  📞 Audio Call
                </button>
                <button
                  onClick={() => {
                    if (selectedPatient) {
                      navigate(`/app/clinica/paciente/chat-profissional/${selectedPatient}`)
                    } else {
                      alert('Selecione um atendimento para abrir o chat.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${
                    selectedPatient
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  💬 Chat Clínico
                </button>
                <button
                  onClick={() => {
                    if (selectedPatient) {
                      navigate(`/app/patients?patientId=${selectedPatient}`)
                    } else {
                      alert('Selecione um atendimento para acessar o prontuário.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${
                    selectedPatient
                      ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white hover:from-slate-500 hover:to-slate-400'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  📁 Prontuário
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAvaliacao = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-800 to-pink-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span>📝 Nova Avaliação</span>
        </h2>
        <p className="text-pink-200">
          Sistema de avaliação clínica com metodologia AEC e protocolo IMRE
        </p>
      </div>

      {/* Tipos de Avaliação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-400" />
            Protocolo IMRE
          </h3>
          <p className="text-slate-400 mb-4">
            Avaliação clínica inicial usando o método IMRE Triaxial
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
            Iniciar Avaliação IMRE
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-green-400" />
            Arte da Entrevista Clínica
          </h3>
          <p className="text-slate-400 mb-4">
            Avaliação usando a metodologia AEC do Dr. Eduardo Faveret
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
            Iniciar AEC
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-orange-400" />
            Consulta de Retorno
          </h3>
          <p className="text-slate-400 mb-4">
            Avaliação de acompanhamento e evolução do paciente
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
            Iniciar Retorno
          </button>
        </div>
      </div>

      {/* Avaliações Recentes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Avaliações Recentes</h3>
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Maria Santos - IMRE</h4>
                <p className="text-slate-400 text-sm">15/01/2024 - 09:00</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Concluída</span>
              <p className="text-slate-400 text-xs mt-1">Relatório gerado</p>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">João Silva - AEC</h4>
                <p className="text-slate-400 text-sm">14/01/2024 - 14:00</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Em andamento</span>
              <p className="text-slate-400 text-xs mt-1">Aguardando conclusão</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBiblioteca = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BookOpen className="w-6 h-6" />
          <span>📚 Biblioteca</span>
        </h2>
        <p className="text-teal-200">
          Biblioteca médica e recursos educacionais
        </p>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Artigos</p>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
            <BookOpen className="w-8 h-8 text-teal-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Protocolos</p>
              <p className="text-2xl font-bold text-white">23</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Vídeos</p>
              <p className="text-2xl font-bold text-white">89</p>
            </div>
            <Video className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Apresentações</p>
              <p className="text-2xl font-bold text-white">45</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Recursos Recentes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Recursos Recentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Protocolo IMRE - Versão 2.1</h4>
            <p className="text-slate-400 text-sm mb-3">Metodologia triaxial atualizada para avaliações clínicas</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 10/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">AEC - Guia Completo</h4>
            <p className="text-slate-400 text-sm mb-3">Arte da Entrevista Clínica - Dr. Eduardo Faveret</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 08/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Cannabis Medicinal - Evidências</h4>
            <p className="text-slate-400 text-sm mb-3">Revisão sistemática de evidências científicas</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 05/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Epilepsia e TEA - Protocolos</h4>
            <p className="text-slate-400 text-sm mb-3">Protocolos específicos para epilepsia e TEA</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 03/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ações da Biblioteca */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Ações da Biblioteca</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-lg transition-colors">
            <Upload className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Upload</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
            <Search className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Buscar</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
            <Download className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Download</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
            <Settings className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Organizar</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderNewsletter = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-800 to-cyan-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BookOpen className="w-6 h-6" />
          <span>📰 Newsletter Científico</span>
        </h2>
        <p className="text-cyan-200">
          Artigos e atualizações científicas sobre Cannabis Medicinal e metodologias clínicas
        </p>
      </div>

      {/* Artigos Recentes */}
      <div className="space-y-4">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h4 className="font-semibold text-white mb-2 text-lg">Cannabis Medicinal em Epilepsia Refratária</h4>
          <p className="text-slate-400 mb-2 text-sm">Novos estudos sobre eficácia do CBD em crianças com síndrome de Dravet mostram redução significativa de convulsões...</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Nature Medicine • Janeiro 2024</span>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Ler mais
            </button>
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h4 className="font-semibold text-white mb-2 text-lg">Protocolos IMRE em TEA</h4>
          <p className="text-slate-400 mb-2 text-sm">Implementação da metodologia IMRE para avaliação de pacientes com TEA demonstra melhorias na qualidade da entrevista clínica...</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Journal of Autism • Dezembro 2023</span>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Ler mais
            </button>
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h4 className="font-semibold text-white mb-2 text-lg">Arte da Entrevista Clínica - Metodologia AEC</h4>
          <p className="text-slate-400 mb-2 text-sm">Técnicas avançadas de escuta ativa e comunicação empática na prática clínica com Cannabis Medicinal...</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Medical Education Review • Novembro 2023</span>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Ler mais
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrescricoes = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span>💊 Prescrições Integrativas</span>
        </h2>
        <p className="text-emerald-200">
          Sistema de Prescrições Integrativas conforme Diretrizes CFM + Práticas Integrativas
        </p>
      </div>

      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Conforme Diretrizes CFM + Práticas Integrativas</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Assinatura Digital com Certificado ICP Brasil</li>
            <li>• Validação no Portal do ITI</li>
            <li>• Envio por Email e SMS com QR Code</li>
            <li>• Cinco racionalidades médicas integradas</li>
            <li>• Camadas clínicas de leitura dos dados primários</li>
            <li>• NFT e Blockchain para rastreabilidade</li>
          </ul>
        </div>
        <IntegrativePrescriptions />
      </div>
    </div>
  )

  const renderRelatoriosClinicos = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-800 to-amber-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6" />
          <span>📊 Relatórios Clínicos</span>
        </h2>
        <p className="text-amber-200">
          Visualize e gerencie relatórios clínicos gerados pela IA Residente Nôa Esperança
        </p>
      </div>
      <ClinicalReports />
    </div>
  )

  const renderChatProfissionais = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <MessageCircle className="w-6 h-6" />
          <span>Chat com Profissionais</span>
        </h2>
        <p className="text-indigo-200">
          Comunicação segura entre consultórios da plataforma MedCannLab
        </p>
      </div>
      <ProfessionalChatSystem />
    </div>
  )

  const renderChatPacientes = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>Chat com Pacientes</span>
        </h2>
        <p className="text-blue-200">
          Sistema de comunicação integrado ao prontuário médico - Todas as conversas são automaticamente arquivadas no prontuário do paciente
        </p>
      </div>

      {/* Lista de Pacientes para Chat */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-400" />
          Selecionar Paciente para Chat
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-slate-400">Carregando pacientes...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Nenhum paciente encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                  selectedPatient === patient.id
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{patient.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    patient.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {patient.status}
                  </span>
                </div>
                <p className="text-sm opacity-75">Idade: {patient.age} anos</p>
                <p className="text-sm opacity-75">Última visita: {patient.lastVisit}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-slate-600 px-2 py-1 rounded">
                    {patient.assessments?.length || 0} avaliações
                  </span>
                  <span className="text-xs bg-slate-600 px-2 py-1 rounded">
                    {patient.condition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      {selectedPatient && (
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-400" />
              Chat com {patients.find(p => p.id === selectedPatient)?.name}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsVideoCallOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                📹 Video Call
              </button>
              <button
                onClick={() => {
                  setCallType('audio')
                  setIsAudioCallOpen(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                📞 Audio Call
              </button>
            </div>
          </div>

          {/* Área de Chat */}
          <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto mb-4">
            <div className="space-y-4">
              {/* Mensagens simuladas */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Olá Dr. Ricardo, como está minha evolução?</p>
                  <p className="text-xs opacity-75 mt-1">10:30</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-700 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Olá! Sua evolução está muito boa. Os dados dos wearables mostram uma redução significativa nos episódios.</p>
                  <p className="text-xs opacity-75 mt-1">10:32</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Que ótimo! Posso continuar com a mesma medicação?</p>
                  <p className="text-xs opacity-75 mt-1">10:35</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-700 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Sim, mas vamos ajustar a dosagem baseado nos novos dados. Vou enviar uma prescrição atualizada.</p>
                  <p className="text-xs opacity-75 mt-1">10:37</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input de mensagem */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Enviar
            </button>
          </div>

          {/* Informações do Prontuário */}
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">📋 Prontuário Integrado</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Conversas arquivadas:</p>
                <p className="text-white font-medium">12 conversas</p>
              </div>
              <div>
                <p className="text-slate-400">Relatórios compartilhados:</p>
                <p className="text-white font-medium">{patients.find(p => p.id === selectedPatient)?.assessments?.length || 0} relatórios</p>
              </div>
              <div>
                <p className="text-slate-400">Última atualização:</p>
                <p className="text-white font-medium">Hoje, 10:37</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Funções de renderização para seções administrativas
  const renderAdminUsuarios = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-800 to-cyan-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>👥 Gestão de Usuários</span>
          </h2>
          <p className="text-slate-200">Gerencie todos os usuários do sistema, suas permissões e configurações</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300 text-center py-8">
            Área de desenvolvimento: Gestão completa de usuários será implementada aqui.
            <br />
            <span className="text-sm text-slate-400">Funcionalidades: Listagem, criação, edição, exclusão, permissões, tipos de usuário, etc.</span>
          </p>
        </div>
      </div>
    )
  }

  const renderAdminUpload = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-800 to-purple-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
            <Upload className="w-6 h-6" />
            <span>📁 Upload de Documentos</span>
          </h2>
          <p className="text-slate-200">Faça upload e gerencie documentos e arquivos do sistema</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300 text-center py-8">
            Área de desenvolvimento: Sistema de upload de documentos será implementado aqui.
            <br />
            <span className="text-sm text-slate-400">Funcionalidades: Upload, organização, categorização, busca, compartilhamento, etc.</span>
          </p>
        </div>
      </div>
    )
  }

  const renderAdminRenal = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-800 to-pink-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
            <Activity className="w-6 h-6" />
            <span>🫀 Monitoramento de Função Renal</span>
          </h2>
          <p className="text-slate-200">Monitore e analise dados de função renal dos pacientes</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300 text-center py-8">
            Área de desenvolvimento: Sistema de monitoramento de função renal será implementado aqui.
            <br />
            <span className="text-sm text-slate-400">Funcionalidades: Gráficos, relatórios, alertas, histórico, comparações, etc.</span>
          </p>
        </div>
      </div>
    )
  }

  const renderActiveSection = (section: SectionId) => {
    switch (section) {
      case 'dashboard':
        if (normalizedEffectiveType === 'admin') {
          return renderKPIsAdmin()
        }
        if (currentEixo === 'ensino') {
          return renderAulas()
        }
        if (currentEixo === 'pesquisa') {
          return renderAvaliacao()
        }
        return renderAtendimento()
      case 'admin-usuarios':
        return renderAdminUsuarios()
      case 'admin-upload':
        return renderAdminUpload()
      case 'admin-renal':
        return renderAdminRenal()
      case 'atendimento':
        return renderAtendimento()
      case 'pacientes':
        return renderPacientes()
      case 'agendamentos':
        return renderAgendamentos()
      case 'financeiro':
        return renderFinanceiro()
      case 'prescricoes':
        return renderPrescricoes()
      case 'relatorios-clinicos':
        return renderRelatoriosClinicos()
      case 'chat-pacientes':
        return renderChatPacientes()
      case 'chat-profissionais':
        return renderChatProfissionais()
      case 'aulas':
        return renderAulas()
      case 'biblioteca':
        return renderBiblioteca()
      case 'avaliacao':
        return renderAvaliacao()
      case 'newsletter':
        return renderNewsletter()
      case 'ferramentas-pedagogicas':
        return renderFerramentasPedagogicas()
      default:
        if (normalizedEffectiveType === 'admin') {
          return renderKPIsAdmin()
        }
        if (currentEixo === 'ensino') {
          return renderAulas()
        }
        if (currentEixo === 'pesquisa') {
          return renderAvaliacao()
        }
        return renderAtendimento()
    }
  }

  const statusToKey = useCallback((status?: string | null) => (status || '').toLowerCase(), [])

  const todaysAppointments = useMemo(() => {
    const today = new Date()
    return appointments.filter(appointment => {
      const apptDate = new Date(appointment.appointment_date)
      return (
        apptDate.getFullYear() === today.getFullYear() &&
        apptDate.getMonth() === today.getMonth() &&
        apptDate.getDate() === today.getDate()
      )
    })
  }, [appointments])

  const upcomingAppointments = useMemo(() => {
    const now = Date.now()
    return [...appointments]
      .filter(appointment => new Date(appointment.appointment_date).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
      )
      .slice(0, 4)
  }, [appointments])

  const upcoming24hCount = useMemo(() => {
    const limit = Date.now() + 24 * 60 * 60 * 1000
    return upcomingAppointments.filter(appointment => new Date(appointment.appointment_date).getTime() <= limit).length
  }, [upcomingAppointments])

  const waitingCount = useMemo(() => {
    return todaysAppointments.filter(appointment => statusToKey(appointment.status) === 'scheduled').length
  }, [todaysAppointments, statusToKey])

  const inProgressCount = useMemo(() => {
    return todaysAppointments.filter(appointment => {
      const status = statusToKey(appointment.status)
      return status === 'confirmed' || status === 'in_progress' || status === 'in-session'
    }).length
  }, [todaysAppointments, statusToKey])

  const completedCount = useMemo(() => {
    return todaysAppointments.filter(appointment => statusToKey(appointment.status) === 'completed').length
  }, [todaysAppointments, statusToKey])

  const getStatusBadge = useCallback(
    (status?: string | null): { label: string; className: string } => {
      const key = statusToKey(status)
      switch (key) {
        case 'confirmed':
          return {
            label: 'Confirmado',
            className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
          }
        case 'scheduled':
          return {
            label: 'Agendado',
            className: 'bg-blue-500/15 text-blue-300 border border-blue-400/30'
          }
        case 'completed':
          return {
            label: 'Concluído',
            className: 'bg-green-500/15 text-green-200 border border-green-400/30'
          }
        case 'cancelled':
          return {
            label: 'Cancelado',
            className: 'bg-red-500/15 text-red-200 border border-red-400/30'
          }
        case 'no_show':
          return {
            label: 'Não compareceu',
            className: 'bg-orange-500/15 text-orange-200 border border-orange-400/30'
          }
        default:
          return {
            label: 'Sem status',
            className: 'bg-slate-500/15 text-slate-300 border border-slate-400/20'
          }
      }
    },
    [statusToKey]
  )

  const selectedAppointment = useMemo(() => {
    if (!selectedAppointmentId) return null
    return appointments.find(appointment => appointment.id === selectedAppointmentId) || null
  }, [appointments, selectedAppointmentId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 w-full overflow-x-hidden">
        {renderActiveSection(resolvedSection)}

        {/* Modal de Seleção de Dashboard Profissional */}
        {showProfessionalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Stethoscope className="w-6 h-6 mr-2 text-blue-400" />
                    <span>👨‍⚕️ Dashboards de Profissionais e Consultórios</span>
                  </h2>
                  <button
                    onClick={() => setShowProfessionalModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                <p className="text-slate-400 mt-2">Selecione um dashboard profissional ou consultório para acessar</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Consultório Dr. Ricardo Valença */}
                  <button
                    onClick={() => {
                      // Não definir viewAsType para consultórios específicos
                      setViewAsType(null)
                      navigate('/app/ricardo-valenca-dashboard')
                      setShowProfessionalModal(false)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">🏥 Consultório Dr. Ricardo Valença</h3>
                      <Stethoscope className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-sm opacity-90 mb-2">Dashboard administrativo completo</p>
                    <p className="text-xs opacity-75">Gestão de pacientes, agendamentos, relatórios e ferramentas administrativas</p>
                  </button>

                  {/* Consultório Dr. Eduardo Faveret */}
                  <button
                    onClick={() => {
                      // Não definir viewAsType para consultórios específicos
                      setViewAsType(null)
                      navigate('/app/clinica/profissional/dashboard-eduardo')
                      setShowProfessionalModal(false)
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">🏥 Consultório Dr. Eduardo Faveret</h3>
                      <Stethoscope className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-sm opacity-90 mb-2">Dashboard profissional clínico</p>
                    <p className="text-xs opacity-75">Gestão de pacientes, agendamentos e relatórios clínicos</p>
                  </button>

                  {/* Dashboard Profissional Genérico */}
                  <button
                    onClick={() => {
                      // Definir tipo visual como profissional para usar em todos os eixos
                      setViewAsType('profissional')
                      const eixo = currentEixo || 'clinica'
                      navigate(`/app/${eixo}/profissional/dashboard`)
                      setShowProfessionalModal(false)
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">👨‍⚕️ Dashboard Profissional Genérico</h3>
                      <User className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-sm opacity-90 mb-2">Dashboard padrão para profissionais</p>
                    <p className="text-xs opacity-75">
                      Acesso às funcionalidades padrão do eixo {currentEixo || 'clínica'}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {resolvedSection === 'perfil' && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">👤 Meu Perfil</h2>
            <p className="text-slate-300">Gestão de perfil em desenvolvimento</p>
          </div>
        )}
      </div>

      {/* Video/Audio Call Component */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        patientId={selectedPatient || undefined}
        isAudioOnly={callType === 'audio'}
      />
    </div>
  )
}

export default RicardoValencaDashboard
