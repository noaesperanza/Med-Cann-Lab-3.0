import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useUserView } from '../contexts/UserViewContext'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { normalizeUserType } from '../lib/userTypes'
import PatientManagementAdvanced from './PatientManagementAdvanced'
import ProfessionalChatSystem from '../components/ProfessionalChatSystem'
import VideoCall from '../components/VideoCall'
import ClinicalReports from '../components/ClinicalReports'
import IntegrativePrescriptions from '../components/IntegrativePrescriptions'
import RenalFunctionModule from '../components/RenalFunctionModule'
import IntegratedWorkstation from '../components/IntegratedWorkstation'
// DashboardFooter removido por redundância com a navegação customizada abaixo
import { DecisionFeedbackLoop } from '../components/ClinicalGovernance/DecisionFeedbackLoop'
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
  FileText as Layout,
  Video,
  Phone,
  Download,
  Upload,
  Database,
  FileText as Clipboard,
  Bell,
  User,
  UserPlus,
  GraduationCap,
  ArrowRight,
  X,
  Share2,
  Loader2
} from 'lucide-react'
import { CreatePatientModal } from '../components/CreatePatientModal'
import { supabase } from '../lib/supabase'
import { getAllPatients, isAdmin } from '../lib/adminPermissions'
import { KnowledgeBaseIntegration, KnowledgeDocument, KnowledgeStats } from '../services/knowledgeBaseIntegration'
import {
  backgroundGradient,
  surfaceStyle,
  secondarySurfaceStyle,
  cardStyle,
  accentGradient,
  secondaryGradient,
  goldenGradient
} from '../constants/designSystem'

interface Patient {
  id: string
  name: string
  email: string | null
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

interface VoicePrescriptionPreview {
  id: string
  title: string
  summary: string | null
  rationality: string | null
  status: string
  issuedAt: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
  professionalName: string | null
  templateName: string | null
  patientName: string | null
}

const VOICE_RATIONALITY_LABELS: Record<string, string> = {
  biomedical: 'Biomédica',
  traditional_chinese: 'Medicina Tradicional Chinesa',
  ayurvedic: 'Ayurvédica',
  homeopathic: 'Homeopática',
  integrative: 'Integrativa'
}

type SectionId =
  | 'dashboard'
  | 'admin-usuarios'
  | 'admin-upload'
  | 'admin-renal'
  | 'atendimento'
  | 'pacientes'
  | 'prescricoes'
  | 'agendamentos'
  | 'relatorios-clinicos'
  | 'chat-profissionais'
  | 'chat-clinico'
  | 'aulas'
  | 'biblioteca'
  | 'avaliacao'
  | 'newsletter'
  | 'ferramentas-pedagogicas'
  | 'financeiro'
  | 'terminal-clinico'
  | 'novo-paciente'
  | 'prescricao-rapida'

import { LucideIcon } from 'lucide-react'

type SectionOption = {
  id: SectionId
  label: string
  description: string
  icon: LucideIcon
}

interface NoaCommandDetail {
  type: 'navigate-section' | 'navigate-route' | 'show-prescription' | 'filter-patients'
  target: string
  label?: string
  fallbackRoute?: string
  payload?: Record<string, any>
  rawMessage?: string
  source?: 'voice' | 'text'
  timestamp?: string
}

const RicardoValencaDashboard: React.FC = () => {
  const [showCreatePatientModal, setShowCreatePatientModal] = useState(false)
  /* -------------------------------------------------------------------------- */
  /* NOA PLATFORM INTEGRATION                                                   */
  /* -------------------------------------------------------------------------- */
  const {
    openChat: openNoaChat,
    closeChat,
    isOpen: isNoaOpen,
    hideGlobalChat,
    showGlobalChat
  } = useNoaPlatform()

  // Gerenciar visibilidade do chat global
  useEffect(() => {
    // Esconder o chat global (botão flutuante) quando entrar neste dashboard
    hideGlobalChat()

    // Restaurar quando sair (cleanup) - CRÍTICO para outras páginas
    return () => {
      showGlobalChat()
    }
  }, [hideGlobalChat, showGlobalChat])

  /* -------------------------------------------------------------------------- */
  /* ESTADO E CONTEXTO                                                          */
  /* -------------------------------------------------------------------------- */
  const { user, logout } = useAuth()
  const toast = useToast()
  const { isAdminViewingAs, viewAsType, setViewAsType, getEffectiveUserType } = useUserView()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const landingGradient = 'linear-gradient(135deg, #0A192F 0%, #1a365d 55%, #2d5a3d 100%)'
  const landingSurface = 'rgba(7, 22, 41, 0.88)'
  const landingBorder = '1px solid rgba(0, 193, 106, 0.18)'
  const landingShadow = '0 18px 42px rgba(2, 12, 27, 0.45)'
  const landingAccentGradient = 'linear-gradient(135deg, #00C16A 0%, #1a365d 100%)'

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

      // Não redirecionar se o admin já está num dashboard profissional (acesso ao terminal clínico / Dr. Ricardo / Dr. Eduardo)
      const isOnProfessionalDashboard =
        location.pathname.includes('/clinica/profissional/dashboard') ||
        location.pathname.includes('dashboard-eduardo') ||
        location.pathname.includes('ricardo-valenca-dashboard') ||
        location.pathname.includes('eduardo-faveret-dashboard')

      if (viewAsType === 'paciente' && isOnProfessionalDashboard) {
        // Deixar admin ver o dashboard clínico mesmo com "visualizar como paciente"
        return
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
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [doctorDashboardStats, setDoctorDashboardStats] = useState({
    totalToday: 0,
    confirmedToday: 0,
    waitingRoomToday: 0,
    completedToday: 0,
    next24h: 0,
    upcoming: 0,
    unreadMessages: 0
  })
  const [doctorDashboardLoading, setDoctorDashboardLoading] = useState(false)
  const [doctorDashboardError, setDoctorDashboardError] = useState<string | null>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false)
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [showProfessionalModal, setShowProfessionalModal] = useState(false)
  const [showVoicePrescriptionModal, setShowVoicePrescriptionModal] = useState(false)
  const [voicePrescriptionLoading, setVoicePrescriptionLoading] = useState(false)
  const [voicePrescriptionError, setVoicePrescriptionError] = useState<string | null>(null)
  const [voicePrescriptionPreview, setVoicePrescriptionPreview] = useState<VoicePrescriptionPreview | null>(null)

  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([])
  const [knowledgeFilteredDocuments, setKnowledgeFilteredDocuments] = useState<KnowledgeDocument[]>([])
  const [knowledgeCategories, setKnowledgeCategories] = useState<string[]>([])
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null)
  const [knowledgeCategory, setKnowledgeCategory] = useState<string>('all')
  const [knowledgeSearch, setKnowledgeSearch] = useState('')
  const [knowledgeDebouncedSearch, setKnowledgeDebouncedSearch] = useState('')
  const [knowledgeLoading, setKnowledgeLoading] = useState(false)
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null)
  const [knowledgeShowStats, setKnowledgeShowStats] = useState(false)
  const [knowledgeSelectedDocument, setKnowledgeSelectedDocument] = useState<KnowledgeDocument | null>(null)
  const [knowledgeDocumentContent, setKnowledgeDocumentContent] = useState<string | null>(null)
  const [knowledgeDocumentLoading, setKnowledgeDocumentLoading] = useState(false)
  const [knowledgeViewerMode, setKnowledgeViewerMode] = useState<'preview' | 'raw'>('preview')

  const normalizedEffectiveType = normalizeUserType(effectiveType)
  const [localSectionOverride, setLocalSectionOverride] = useState<SectionId | null>(null)
  const selectedPatientData = useMemo(
    () => patients.find(patient => patient.id === selectedPatient) ?? null,
    [patients, selectedPatient]
  )
  const isProfessionalDashboard =
    normalizedEffectiveType === 'profissional' ||
    viewAsType === 'profissional' ||
    location.pathname.includes('/profissional/')

  const sectionNavOptions = useMemo<SectionOption[] | null>(() => {
    const isAdminDashboardRoute =
      normalizedEffectiveType === 'admin' &&
      location.pathname.includes('ricardo-valenca-dashboard')

    const clinicaOptions: SectionOption[] = [
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
      {
        id: 'atendimento',
        label: 'Terminal de Atendimento',
        description: 'Fluxo integrado de consultas, chat e prescrições',
        icon: Stethoscope
      },
      {
        id: 'terminal-clinico',
        label: 'Terminal Clínico',
        description: 'Governança, Relatórios, Conhecimento, Fórum e Paciente em foco',
        icon: Activity
      },
      {
        id: 'pacientes',
        label: 'Gestão de Pacientes',
        description: 'Base de dados e prontuários eletrônicos',
        icon: Users
      },
      {
        id: 'agendamentos',
        label: 'Agenda Clínica',
        description: 'Controle de consultas e horários',
        icon: Calendar
      },
      {
        id: 'prescricao-rapida',
        label: 'Prescrever',
        description: 'Nova prescrição rápida',
        icon: FileText
      },
      {
        id: 'novo-paciente',
        label: 'Novo Paciente',
        description: 'Cadastrar novo paciente',
        icon: UserPlus
      },
      {
        id: 'chat-profissionais',
        label: 'Equipe',
        description: 'Comunicação interna',
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

    if (normalizedEffectiveType === 'admin' && isAdminDashboardRoute) {
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
          icon: Layout
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

      const uniqueAdminOptions = adminOptions.filter(
        (option, index, array) => array.findIndex(candidate => candidate.id === option.id) === index
      )

      return uniqueAdminOptions
    }

    if (currentEixo === 'ensino') {
      return ensinoOptions
    }

    if (currentEixo === 'pesquisa') {
      return pesquisaOptions
    }

    return clinicaOptions
  }, [currentEixo, isProfessionalDashboard, normalizedEffectiveType, location.pathname])

  const sectionParam = (searchParams.get('section') as SectionId | null) || null

  const goToSection = useCallback(
    (sectionId: SectionId) => {
      if (localSectionOverride === sectionId && sectionParam === sectionId) {
        return
      }
      setLocalSectionOverride(sectionId)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('section', sectionId)
      setSearchParams(nextParams, { replace: true })
    },
    [localSectionOverride, sectionParam, searchParams, setSearchParams]
  )

  const loadVoicePrescriptionPreview = useCallback(async () => {
    setVoicePrescriptionLoading(true)
    setVoicePrescriptionError(null)
    try {
      let query = supabase
        .from('patient_prescriptions')
        .select(
          `
          *,
          template:integrative_prescription_templates (id, name, rationality, summary),
          professional:users_compatible (id, name)
        `
        )
        .order('issued_at', { ascending: false })
        .limit(1)

      if (selectedPatient) {
        query = query.eq('patient_id', selectedPatient)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        setVoicePrescriptionPreview(null)
        setVoicePrescriptionError(
          selectedPatient
            ? 'Ainda não há prescrições registradas para o paciente selecionado.'
            : 'Nenhuma prescrição registrada recentemente.'
        )
        return
      }

      const entry = data[0] as any
      setVoicePrescriptionPreview({
        id: entry.id,
        title: entry.title ?? entry.template?.name ?? 'Prescrição integrativa',
        summary: entry.summary ?? entry.template?.summary ?? null,
        rationality: entry.rationality ?? entry.template?.rationality ?? null,
        status: entry.status ?? 'active',
        issuedAt: entry.issued_at,
        dosage: entry.dosage ?? null,
        frequency: entry.frequency ?? null,
        duration: entry.duration ?? null,
        instructions: entry.instructions ?? null,
        professionalName: entry.professional?.name ?? null,
        templateName: entry.template?.name ?? null,
        patientName: selectedPatientData?.name ?? null
      })
    } catch (error) {
      console.error('❌ Erro ao recuperar prescrição solicitada por voz:', error)
      setVoicePrescriptionPreview(null)
      setVoicePrescriptionError('Erro ao carregar a prescrição solicitada. Tente novamente.')
    } finally {
      setVoicePrescriptionLoading(false)
    }
  }, [selectedPatient, selectedPatientData?.name])

  const handleVoiceShowPrescription = useCallback(() => {
    setShowVoicePrescriptionModal(true)
    void loadVoicePrescriptionPreview()
  }, [loadVoicePrescriptionPreview])

  const handleCloseVoicePrescriptionModal = useCallback(() => {
    setShowVoicePrescriptionModal(false)
    setVoicePrescriptionError(null)
  }, [])

  useEffect(() => {
    const handleNoaCommand = (event: Event) => {
      const custom = event as CustomEvent<NoaCommandDetail>
      const detail = custom.detail
      if (!detail) return

      if (detail.type === 'navigate-section') {
        const targetSection = detail.target as SectionId
        if (sectionNavOptions?.some(option => option.id === targetSection)) {
          goToSection(targetSection)
          return
        }
        if (detail.fallbackRoute) {
          navigate(detail.fallbackRoute)
        }
        return
      }

      if (detail.type === 'filter-patients') {
        goToSection('pacientes')
        const filterValue =
          (detail.payload?.clinic as string | undefined)?.trim() ||
          (detail.payload?.filter as string | undefined)?.trim() ||
          detail.target
        if (filterValue) {
          setPatientSearch(filterValue)
        }
        if (detail.payload?.filter === 'active' && filterValue?.toLowerCase() !== 'ativo') {
          setPatientSearch('ativo')
        }
        return
      }

      if (detail.type === 'show-prescription') {
        goToSection('prescricoes')
        handleVoiceShowPrescription()
        return
      }

      if (detail.type === 'navigate-route' && typeof detail.target === 'string') {
        navigate(detail.target)
      }
    }

    window.addEventListener('noaCommand', handleNoaCommand as EventListener)
    return () => window.removeEventListener('noaCommand', handleNoaCommand as EventListener)
  }, [goToSection, navigate, sectionNavOptions, handleVoiceShowPrescription, setPatientSearch])

  const baseSection: SectionId = useMemo(() => {
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

  const resolvedSection: SectionId = useMemo(
    () => localSectionOverride ?? baseSection,
    [localSectionOverride, baseSection]
  )
  useEffect(() => {
    if (!sectionParam) return
    setLocalSectionOverride(prev => (prev === sectionParam ? prev : sectionParam))
  }, [sectionParam])


  // activeId is already set inside setDashboardTriggers above; no separate effect needed

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

  // Carregar KPIs das 3 camadas da plataforma
  const loadKPIs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('v_kpi_basic')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) {
        console.warn('⚠️ Erro ao carregar KPIs básicos:', error)
      }

      setKpis({
        administrativos: {
          totalPacientes: (data as any)?.total_reports ?? 0,
          avaliacoesCompletas: (data as any)?.total_assessments ?? 0,
          protocolosAEC: 0,
          protocolosIMRE: 0,
          respondedoresTEZ: 0,
          consultoriosAtivos: (data as any)?.total_appointments ?? 0
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
    } catch (error) {
      console.error('❌ Erro ao carregar KPIs:', error)
    }
  }, [])

  const loadDoctorDashboardStats = useCallback(async () => {
    try {
      setDoctorDashboardLoading(true)
      setDoctorDashboardError(null)

      const { data, error } = await supabase
        .from('v_doctor_dashboard_kpis')
        .select('*')
        .maybeSingle()

      if (error) {
        console.warn('⚠️ Erro ao carregar KPIs de atendimento:', error)
        setDoctorDashboardError('Não foi possível carregar os indicadores clínicos.')
        return
      }

      setDoctorDashboardStats({
        totalToday: data?.total_today ?? 0,
        confirmedToday: data?.confirmed_today ?? 0,
        waitingRoomToday: data?.waiting_room_today ?? 0,
        completedToday: data?.completed_today ?? 0,
        next24h: data?.next_24h ?? 0,
        upcoming: data?.upcoming ?? 0,
        unreadMessages: data?.unread_messages ?? 0
      })
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar KPIs de atendimento:', error)
      setDoctorDashboardError('Não foi possível carregar os indicadores clínicos.')
    } finally {
      setDoctorDashboardLoading(false)
    }
  }, [])

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true)

      if (user && isAdmin(user)) {
        console.log('✅ Admin carregando pacientes com permissões administrativas')
        const allPatients = await getAllPatients(user)
        setPatients(allPatients as Patient[])
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
            name: (assessment.data as any)?.name || 'Paciente',
            email: (assessment.data as any)?.email || null,
            age: (assessment.data as any)?.age || 30,
            cpf: (assessment.data as any)?.cpf || '000.000.000-00',
            phone: (assessment.data as any)?.phone || '(00) 00000-0000',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: assessment.status === 'completed' ? 'Ativo' : 'Em tratamento',
            assessments: [assessment],
            condition: (assessment.data as any)?.complaintList?.[0] || 'Condição não especificada',
            priority: (assessment.data as any)?.improvement ? 'low' : 'high'
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
      setAppointmentsError(null)

      const { data: upcomingData, error: upcomingError } = await supabase
        .from('v_next_appointments')
        .select('id, appt_at, patient_id, professional_id, status_norm')
        .order('appt_at', { ascending: true })
        .limit(60)

      if (upcomingError) {
        console.error('❌ Erro ao carregar agendamentos a partir da view:', upcomingError)
        setAppointments([])
        setAppointmentsError('Não foi possível carregar os agendamentos no momento.')
        return
      }

      let upcomingRows =
        upcomingData?.filter(row => Boolean(row?.appt_at)) ?? []

      if (normalizedEffectiveType === 'profissional' && user.id) {
        upcomingRows = upcomingRows.filter(row => row.professional_id === user.id)
      }

      if (upcomingRows.length === 0) {
        setAppointments([])
        return
      }

      const appointmentIds = upcomingRows
        .map(row => row.id)
        .filter((id): id is string => Boolean(id))

      const appointmentDetailsMap = new Map<
        string,
        {
          title: string | null
          description: string | null
          appointment_date: string | null
          duration: number | null
          status: string | null
          type: string | null
          location: string | null
          is_remote: boolean | null
          meeting_url: string | null
        }
      >()

      if (appointmentIds.length > 0) {
        const { data: appointmentDetails, error: appointmentDetailsError } = await supabase
          .from('appointments')
          .select(
            'id, title, description, appointment_date, duration, status, type, location, is_remote, meeting_url'
          )
          .in('id', appointmentIds)

        if (appointmentDetailsError) {
          console.warn('⚠️ Erro ao carregar detalhes dos agendamentos:', appointmentDetailsError)
        }

        appointmentDetails?.forEach(detail => {
          if (detail?.id) {
            appointmentDetailsMap.set(detail.id, {
              title: detail.title ?? null,
              description: detail.description ?? null,
              appointment_date: detail.appointment_date ?? null,
              duration: detail.duration ?? null,
              status: detail.status ?? null,
              type: detail.type ?? null,
              location: detail.location ?? null,
              is_remote: detail.is_remote ?? null,
              meeting_url: detail.meeting_url ?? null
            })
          }
        })
      }

      const patientIds = Array.from(
        new Set(
          upcomingRows
            .map(row => row.patient_id)
            .filter((id): id is string => Boolean(id))
        )
      )

      const patientsMap = new Map<
        string,
        { id: string; name: string | null; email: string | null; phone?: string | null; type?: string | null }
      >()

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

      const enrichedAppointments: EnrichedAppointment[] = upcomingRows.map(row => {
        const details = row.id ? appointmentDetailsMap.get(row.id) : undefined
        const isoDate = details?.appointment_date ?? row.appt_at ?? null
        const appointmentDate = isoDate ? new Date(isoDate) : new Date()
        const patientInfo = row.patient_id ? patientsMap.get(row.patient_id) : undefined

        return {
          id: row.id,
          patient_id: row.patient_id ?? null,
          professional_id: row.professional_id ?? null,
          title: details?.title ?? '',
          description: details?.description ?? null,
          appointment_date: isoDate ?? new Date().toISOString(),
          duration: details?.duration ?? null,
          status: details?.status ?? row.status_norm ?? null,
          type: details?.type ?? null,
          location: details?.location ?? null,
          is_remote: details?.is_remote ?? null,
          meeting_url: details?.meeting_url ?? null,
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
      setAppointmentsError(null)
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error)
      setAppointments([])
      setAppointmentsError('Não foi possível carregar os agendamentos no momento.')
    } finally {
      setAppointmentsLoading(false)
    }
  }, [normalizedEffectiveType, user?.id])

  useEffect(() => {
    if (!user?.id) return
    loadPatients()
    loadKPIs()
    loadDoctorDashboardStats()
    loadAppointments()
  }, [user?.id, loadPatients, loadKPIs, loadDoctorDashboardStats, loadAppointments])

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

  const handleCreateAppointment = useCallback(() => {
    navigate('/app/clinica/profissional/dashboard?section=atendimento')
  }, [navigate])

  const handleOpenPatientManagement = useCallback(() => {
    navigate('/app/clinica/profissional/pacientes', {
      state: {
        from: location.pathname,
        selectedPatientId: selectedPatient
      }
    })
  }, [location.pathname, navigate, selectedPatient])

  const handleCreatePatient = useCallback(() => {
    navigate('/app/new-patient')
  }, [navigate])

  const handleOpenPatientAgenda = useCallback(
    (patientId: string) => {
      navigate(`/app/clinica/profissional/dashboard?section=atendimento&patientId=${patientId}`)
    },
    [navigate]
  )

  const handleOpenPatientRecord = useCallback(
    (patientId: string) => {
      navigate(`/app/clinica/profissional/pacientes?patientId=${patientId}`)
    },
    [navigate]
  )

  const handleOpenPatientChat = useCallback(
    (patientId?: string | null) => {
      const targetId = patientId ?? selectedPatient
      if (targetId) {
        navigate(`/app/clinica/paciente/chat-profissional/${targetId}`)
      } else {
        navigate('/app/clinica/paciente/chat-profissional')
      }
    },
    [navigate, selectedPatient]
  )

  const handleOpenPatientHistory = useCallback(
    (patientId?: string | null) => {
      const targetId = patientId ?? selectedPatient
      if (targetId) {
        navigate(`/app/clinica/profissional/pacientes?patientId=${targetId}`)
      } else {
        navigate('/app/clinica/profissional/pacientes')
      }
    },
    [navigate, selectedPatient]
  )

  const handleOpenAgenda = useCallback(() => {
    navigate('/app/clinica/profissional/dashboard?section=atendimento')
  }, [navigate])

  const handleExportAgenda = useCallback(() => {
    if (appointments.length === 0) {
      console.info('📅 Nenhum agendamento disponível para exportação no momento.')
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    try {
      const headers = ['Data', 'Hora', 'Paciente', 'Título', 'Status', 'Tipo', 'Modalidade']
      const rows = appointments.map(appointment => {
        const date = new Date(appointment.appointment_date)
        const dateStr = new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date)
        const timeStr = new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
        const statusKey = (appointment.status || '').toLowerCase()
        return [
          dateStr,
          timeStr,
          appointment.patient?.name ?? 'Paciente',
          appointment.title ?? '',
          statusKey || 'sem-status',
          appointment.type ?? '',
          appointment.is_remote ? 'Teleatendimento' : 'Presencial'
        ]
      })

      const csvContent = [headers, ...rows]
        .map(row =>
          row
            .map(value => {
              const safeValue = `${value ?? ''}`.replace(/"/g, '""')
              return `"${safeValue}"`
            })
            .join(';')
        )
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `agenda-medcannlab-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('❌ Erro ao exportar agenda:', error)
    }
  }, [appointments])

  const renderDashboard = () => (
    <>
      {/* 🧬 CCOS v2.0: Decision Feedback Loop (Calibration Queue) */}
      <DecisionFeedbackLoop />

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
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-lg" style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3a3a 100%)',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(0, 193, 106, 0.2)'
                    }}>
                      <img
                        src="/brain.png"
                        alt="MedCann Lab"
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                        style={{ filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 6px rgba(0, 193, 106, 0.6))' }}
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
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">👥 Usuários</h3>
                  <Users className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Gestão de usuários do sistema</p>
              </button>

              <button
                onClick={() => navigate('/app/courses')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">🎓 Cursos</h3>
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Gestão de cursos e materiais</p>
              </button>

              <button
                onClick={() => navigate('/app/professional-financial')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">💰 Financeiro</h3>
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Controle financeiro e pagamentos</p>
              </button>

              <button
                onClick={() => navigate('/app/chat')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">💬 Chat Global + Moderação</h3>
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Moderação de chats e conversas</p>
              </button>

              <button
                onClick={() => navigate('/app/gamificacao')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">🏆 Ranking & Programa de Pontos</h3>
                  <Activity className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Sistema de pontos e rankings</p>
              </button>

              <button
                onClick={() => goToSection('admin-upload')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">📁 Upload</h3>
                  <Upload className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Upload de documentos e arquivos</p>
              </button>

              <button
                onClick={() => navigate('/app/knowledge-analytics')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">📊 Analytics</h3>
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Análise de dados e relatórios</p>
              </button>

              <button
                onClick={() => goToSection('admin-renal')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">🫀 Função Renal</h3>
                  <Activity className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Monitoramento de função renal</p>
              </button>

              <button
                onClick={() => navigate('/app/admin-settings')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">⚙️ Sistema</h3>
                  <Settings className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Configurações do sistema</p>
              </button>

              <button
                onClick={() => goToSection('terminal-clinico')}
                className="rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
                style={cardStyle}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium text-white break-words flex-1 min-w-0">💻 Terminal Clínico</h3>
                  <Activity className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-[#4FE0C1]" />
                </div>
                <p className="text-xs text-[rgba(200,214,229,0.75)] mt-1 break-words">Governança, Relatórios, Conhecimento, Fórum e Paciente em foco</p>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00c16a] to-[#00a85a] rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">🌍 Cidade Amiga dos Rins</h2>
                    <p className="text-sm text-slate-300">Coordenador: Dr. Ricardo Valença - Interconexão com Pós-graduação Cannabis (Função Renal)</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                  className="bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
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
                  className={`bg-gradient-to-r from-[#00c16a] to-[#00a85a] rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${effectiveType === 'paciente' ? 'ring-4 ring-yellow-400' : ''
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
                  className={`bg-gradient-to-r from-[#00c16a] to-[#00a85a] rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${effectiveType === 'profissional' ? 'ring-4 ring-yellow-400' : ''
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
              <div className="p-4 border-b border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setShowCreatePatientModal(true)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors tooltip-trigger"
                    title="Adicionar Novo Paciente"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
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
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedPatient === patient.id
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


      <div className="bg-gradient-to-br from-emerald-900/30 via-slate-900/60 to-slate-950/80 border border-emerald-500/20 rounded-2xl shadow-lg shadow-emerald-900/30 overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80 mb-1">
                Nôa Esperança IA • Conhecimento da IA Residente
              </p>
              <h3 className="text-xl md:text-2xl font-semibold text-white">Biblioteca Compartilhada</h3>
              <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl">
                Últimos materiais integrados à plataforma para suportar decisões clínicas e educacionais.
              </p>
            </div>
          </div>
          <button
            onClick={() => goToSection('admin-upload')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/10 transition-colors text-sm font-semibold"
          >
            Abrir base completa
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="border-t border-emerald-500/10 bg-slate-950/40">
          {knowledgeLoading ? (
            <div className="flex items-center gap-2 text-emerald-200 px-6 py-5">
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando documentos...
            </div>
          ) : knowledgeError ? (
            <div className="px-6 py-5 text-sm text-emerald-200/80">{knowledgeError}</div>
          ) : knowledgeDocuments.length === 0 ? (
            <div className="px-6 py-5 text-sm text-emerald-200/80">
              Nenhum documento disponível. Carregue materiais na Biblioteca Compartilhada.
            </div>
          ) : (
            <div className="divide-y divide-emerald-500/10">
              {knowledgeDocuments.slice(0, 3).map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleOpenKnowledgeDocument(doc)}
                  className="w-full text-left px-6 py-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between hover:bg-emerald-500/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {doc.title ?? doc.summary ?? 'Documento sem título'}
                    </p>
                    <p className="text-xs text-emerald-100/70 mt-1 line-clamp-2">{doc.summary || 'Sem descrição'}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-emerald-200/60 uppercase tracking-[0.2em]">
                      <span>{doc.category ?? 'Sem categoria'}</span>
                      {doc.updated_at && (
                        <span className="text-emerald-200/40">
                          Atualizado {formatKnowledgeRelativeTime(doc.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-200/80 text-xs font-semibold uppercase tracking-[0.2em]">
                    Visualizar
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botão para voltar ao dashboard */}
      {resolvedSection !== 'dashboard' && (
        <div className="text-center">
          <button
            onClick={() => goToSection('dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      )}
    </div>
  )

  const renderAgendamentos = () => {
    const todayCount = totalTodayCount

    const startOfWeek = new Date()
    startOfWeek.setHours(0, 0, 0, 0)
    const weekday = startOfWeek.getDay()
    const diff = weekday === 0 ? -6 : 1 - weekday
    startOfWeek.setDate(startOfWeek.getDate() + diff)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const weeklyCount = appointments.filter(appointment => {
      const apptDate = new Date(appointment.appointment_date)
      return apptDate >= startOfWeek && apptDate < endOfWeek
    }).length

    const confirmedCount = appointments.filter(appointment => {
      const status = (appointment.status || '').toLowerCase()
      return status === 'confirmed' || status === 'confirmado'
    }).length

    const pendingCount = appointments.filter(appointment => {
      const status = (appointment.status || '').toLowerCase()
      return (
        status === 'pending' ||
        status === 'pendente' ||
        status === 'scheduled' ||
        status === 'agendado'
      )
    }).length

    const agendaStats = [
      {
        id: 'today',
        label: 'Hoje',
        caption: 'Consultas programadas para hoje',
        value: todayCount,
        icon: Calendar,
        iconBg: 'rgba(0, 193, 106, 0.18)',
        iconClass: 'text-emerald-300'
      },
      {
        id: 'week',
        label: 'Esta Semana',
        caption: 'Total de atendimentos desta semana',
        value: weeklyCount,
        icon: Clock,
        iconBg: 'rgba(26, 54, 93, 0.28)',
        iconClass: 'text-sky-300'
      },
      {
        id: 'confirmed',
        label: 'Confirmados',
        caption: 'Atendimentos confirmados',
        value: confirmedCount,
        icon: CheckCircle,
        iconBg: 'rgba(0, 193, 106, 0.22)',
        iconClass: 'text-emerald-400'
      },
      {
        id: 'pending',
        label: 'Pendentes',
        caption: 'Aguardando confirmação',
        value: pendingCount,
        icon: AlertCircle,
        iconBg: 'rgba(255, 180, 0, 0.18)',
        iconClass: 'text-amber-300'
      }
    ]

    const todaysSorted = [...todaysAppointments].sort(
      (a, b) =>
        new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    )

    // Usar design system padronizado
    const appointmentCardStyle: React.CSSProperties = secondarySurfaceStyle

    const quickActions = [
      {
        id: 'new',
        label: 'Novo Agendamento',
        description: 'Registre uma nova consulta ou teleatendimento',
        icon: Plus,
        onClick: handleCreateAppointment,
        gradient: 'linear-gradient(135deg, rgba(0,193,106,0.32) 0%, rgba(26,54,93,0.85) 100%)'
      },
      {
        id: 'full-agenda',
        label: 'Ver Agenda Completa',
        description: 'Abra a visão detalhada dos próximos dias',
        icon: Calendar,
        onClick: handleOpenAgenda,
        gradient: 'linear-gradient(135deg, rgba(59,130,246,0.28) 0%, rgba(26,54,93,0.9) 100%)'
      },
      {
        id: 'student-dashboard',
        label: 'Dashboard do Aluno',
        description: 'Acesse o ambiente acadêmico integrado',
        icon: GraduationCap,
        onClick: () => {
          if (normalizeUserType(user?.type) === 'admin') {
            setViewAsType('aluno')
          }
          const eixo = currentEixo === 'pesquisa' ? 'pesquisa' : 'ensino'
          navigate(`/app/${eixo}/aluno/dashboard`)
        },
        gradient: 'rgba(10,31,54,0.78)'
      },
      {
        id: 'export',
        label: 'Exportar Agenda',
        description: 'Baixe a agenda em CSV para compartilhar com a equipe',
        icon: Download,
        onClick: handleExportAgenda,
        gradient: 'linear-gradient(135deg, rgba(13,148,136,0.32) 0%, rgba(26,54,93,0.9) 100%)'
      }
    ]

    return (
      <div className="space-y-6 lg:space-y-8">
        <div
          className="rounded-2xl p-6 lg:p-8 border border-[#00C16A]/25 shadow-2xl space-y-6"
          style={{ background: landingGradient }}
        >
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-300" />
              <span>📅 Agendamentos em tempo real</span>
            </h2>
            <p className="text-sm lg:text-base text-slate-200/90 max-w-3xl">
              Sincronizado com o Supabase: acompanhe atendimentos confirmados, pendentes e
              teleatendimentos integrados à IA residente.
            </p>
            <p className="text-xs lg:text-sm text-slate-300">
              {appointmentsLoading
                ? 'Sincronizando com o sistema de agendamentos...'
                : todayCount > 0
                  ? `Você tem ${todayCount} atendimento${todayCount > 1 ? 's' : ''} programado${todayCount > 1 ? 's' : ''} para hoje.`
                  : appointmentsError
                    ? 'Não foi possível carregar os agendamentos no momento.'
                    : 'Nenhum atendimento agendado para hoje.'}
            </p>
            {!appointmentsLoading && appointmentsError && (
              <p className="text-xs text-red-300">{appointmentsError}</p>
            )}
            <div className="inline-flex items-center gap-2 text-xs text-emerald-200/80">
              <Loader2
                className={`w-3 h-3 ${appointmentsLoading ? 'animate-spin' : 'opacity-60'}`}
              />
              {appointmentsLoading ? 'Atualizando agenda...' : 'Agenda conectada'}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 lg:p-8 space-y-4" style={surfaceStyle}>
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-300" />
                  Atendimento Integrado
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Escolha um paciente para iniciar o chat clínico. Todas as interações ficam
                  registradas no histórico do paciente e do profissional.
                </p>
              </div>

              <div className="space-y-3">
                <select
                  className="w-full px-3 py-2 bg-slate-800 border border-emerald-500/20 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={selectedPatient || ''}
                  onChange={event => {
                    const patientId = event.target.value || null
                    setSelectedPatient(patientId)
                  }}
                >
                  <option value="">Selecionar paciente...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPatientChat()}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                  >
                    Abrir Chat Clínico
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenPatientHistory()}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    Ver Histórico
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 lg:p-8 space-y-4" style={surfaceStyle}>
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-300" />
                  Chat com Pacientes
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Sistema integrado ao prontuário médico. Todas as conversas ficam arquivadas
                  automaticamente e alimentam os indicadores clínicos.
                </p>
              </div>

              <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-300" />
                    Selecionar Paciente para Chat
                  </h4>
                  <button
                    type="button"
                    onClick={() => navigate('/app/clinica/profissional/pacientes')}
                    className="text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
                  >
                    Gestão avançada
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    Carregando pacientes...
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    Nenhum paciente encontrado.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {patients.map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedPatient === patient.id
                          ? 'bg-emerald-600/40 border-emerald-300 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-sm">{patient.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">
                              Última visita: {patient.lastVisit || 'Sem registro'}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wide ${patient.status === 'Ativo'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-amber-500/20 text-amber-200'
                              }`}
                          >
                            {patient.status || 'Sem status'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-slate-700/80 border border-slate-600/60">
                            {patient.assessments?.length || 0} avaliações
                          </span>
                          {patient.condition && (
                            <span className="px-2 py-0.5 rounded bg-slate-700/80 border border-slate-600/60">
                              {patient.condition}
                            </span>
                          )}
                          {patient.priority && (
                            <span className="px-2 py-0.5 rounded bg-slate-700/80 border border-slate-600/60 capitalize">
                              Prioridade {patient.priority}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={event => {
                              event.stopPropagation()
                              setSelectedPatient(patient.id)
                              handleOpenPatientChat(patient.id)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 transition-colors"
                          >
                            Abrir chat
                          </button>
                          <button
                            type="button"
                            onClick={event => {
                              event.stopPropagation()
                              handleOpenPatientRecord(patient.id)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-700/80 text-slate-200 hover:bg-slate-600 transition-colors"
                          >
                            Ver prontuário
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {agendaStats.map(stat => {
            const StatIcon = stat.icon
            return (
              <div
                key={stat.id}
                className="rounded-2xl p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-emerald-500/10"
                style={surfaceStyle}
              >
                <div className="flex items-center justify-between stack-mobile">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      {stat.label}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      {appointmentsLoading ? (
                        <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
                      ) : (
                        <span className="text-3xl font-bold text-white">{stat.value}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-2">{stat.caption}</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: stat.iconBg }}
                  >
                    <StatIcon className={`w-6 h-6 ${stat.iconClass}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl p-6 lg:p-8 space-y-6" style={surfaceStyle}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl lg:text-2xl font-semibold text-white flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-300" />
                <span>Agenda de Hoje</span>
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                {appointmentsLoading
                  ? 'Aguardando sincronização...'
                  : todayCount > 0
                    ? `Você tem ${todayCount} atendimento${todayCount > 1 ? 's' : ''} programado${todayCount > 1 ? 's' : ''} para hoje.`
                    : 'Nenhum atendimento agendado para hoje.'}
              </p>
              {!appointmentsLoading && appointmentsError && (
                <p className="text-xs text-red-300 mt-2">
                  {appointmentsError}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Agenda conectada
              </span>
            </div>
          </div>

          {appointmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`agenda-skeleton-${index}`}
                  className="rounded-2xl p-4 animate-pulse"
                  style={appointmentCardStyle}
                >
                  <div className="h-4 bg-slate-600/40 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-600/30 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : todaysSorted.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed border-emerald-300/40 p-6 text-center bg-emerald-500/5"
            >
              <p className="text-sm text-slate-200 mb-4">
                Nenhum agendamento para hoje. Que tal registrar um novo atendimento?
              </p>
              <button
                onClick={handleCreateAppointment}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: landingAccentGradient }}
              >
                Criar novo agendamento
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {todaysSorted.map(appointment => {
                const statusBadge = getStatusBadge(appointment.status)
                const appointmentTime = new Intl.DateTimeFormat('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(appointment.appointment_date))

                return (
                  <div
                    key={appointment.id}
                    className="rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={appointmentCardStyle}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                        style={{ background: 'rgba(0, 193, 106, 0.22)' }}
                      >
                        {appointmentTime}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-white font-semibold text-base lg:text-lg">
                          {appointment.patient?.name ?? appointment.title ?? 'Paciente não identificado'}
                        </h4>
                        {appointment.title && (
                          <p className="text-sm text-slate-300">{appointment.title}</p>
                        )}
                        {appointment.description && (
                          <p className="text-xs text-slate-400">
                            {appointment.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-slate-400 mt-2">
                          <span>{appointment.is_remote ? 'Teleatendimento' : 'Atendimento presencial'}</span>
                          {appointment.type && <span>• {appointment.type}</span>}
                          {appointment.patient?.email && <span>• {appointment.patient.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-3 min-w-[160px]">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.15em] ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStartAppointment(appointment)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                          style={{ background: landingAccentGradient }}
                        >
                          Iniciar
                        </button>
                        <button
                          onClick={() => handleStartAppointment(appointment, { navigateToChat: true })}
                          className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 border border-slate-600/60 hover:border-emerald-300/60 transition-transform hover:-translate-y-0.5"
                        >
                          Abrir Chat
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6 lg:p-8" style={surfaceStyle}>
          <h3 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map(action => {
              const ActionIcon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="rounded-2xl p-4 text-left transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  style={{ background: action.gradient }}
                >
                  <ActionIcon className="w-6 h-6 text-white mb-3" />
                  <span className="block text-white font-semibold text-base">{action.label}</span>
                  <span className="block text-sm text-slate-100/80 mt-1">{action.description}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderPrescricoes = () => (
    <div className="space-y-6">
      {/* Header removido - conteúdo direto */}

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 w-full xl:w-[320px] flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-300" />
                Paciente
              </h3>
              <p className="text-xs text-slate-500 mt-1">Selecione para vincular prescrições</p>
            </div>
            <button
              onClick={handleOpenPatientManagement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-200 rounded-lg border border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/10 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Prontuário
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-sm text-slate-400">Carregando pacientes...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400">
              Nenhum paciente encontrado. Cadastre um paciente para emitir prescrições.
            </div>
          ) : (
            <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1 custom-scrollbar">
              {patients.map(patient => {
                const isActive = patient.id === selectedPatient
                const assessmentCount = patient.assessments?.length || 0
                const statusLabel = (() => {
                  const raw = (patient.status ?? '').toLowerCase()
                  switch (raw) {
                    case 'completed':
                      return 'Concluído'
                    case 'ativo':
                    case 'active':
                      return 'Ativo'
                    case 'pending':
                      return 'Pendente'
                    case 'suspended':
                      return 'Suspenso'
                    default:
                      return patient.status ?? 'Em acompanhamento'
                  }
                })()
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatient(patient.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${isActive
                      ? 'border-primary-500/50 bg-primary-500/10 text-white ring-1 ring-primary-500/20'
                      : 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-primary-500/30 hover:bg-primary-500/5'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-semibold truncate">{patient.name}</p>
                        <p className="text-xs text-slate-400 leading-relaxed break-words">
                          {patient.condition ?? 'Plano em avaliação'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span className="truncate">
                            {(patient as any).specialty ?? 'Não especificado'}
                          </span>
                          <span className="text-slate-700">•</span>
                          <span>
                            {assessmentCount} {assessmentCount === 1 ? 'avaliação' : 'avaliações'}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${statusLabel === 'Ativo' || statusLabel === 'Concluído'
                          ? 'bg-primary-500/15 text-primary-200 border border-primary-400/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <IntegrativePrescriptions
            patientId={selectedPatientData?.id ?? null}
            patientName={selectedPatientData?.name ?? null}
            className="overflow-visible"
          />
        </div>
      </div>
    </div>
  )

  const renderPacientes = () => (
    <div className="space-y-6">
      <div style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.15) 0%, rgba(10,40,35,0.95) 100%)', border: '1px solid rgba(0,193,106,0.25)' }} className="rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Users className="w-6 h-6" style={{ color: '#00F5A0' }} />
          <span>👥 Meus Pacientes</span>
        </h2>
        <p style={{ color: 'rgba(200,214,229,0.75)' }}>
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
              onClick={handleOpenPatientManagement}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Gestão Avançada
            </button>
            <button
              onClick={handleCreatePatient}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.status === 'Ativo'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                        }`}>
                        {patient.status}
                      </span>
                      <p className="text-slate-400 text-sm mt-1">{patient.assessments?.length || 0} avaliações</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={event => {
                          event.stopPropagation()
                          handleOpenPatientAgenda(patient.id)
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                      >
                        Ver Agenda
                      </button>
                      <button
                        type="button"
                        onClick={event => {
                          event.stopPropagation()
                          setSelectedPatient(patient.id)
                          handleOpenPatientChat(patient.id)
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-slate-600 hover:bg-slate-500 transition-colors"
                      >
                        Chat Clínico
                      </button>
                      <button
                        type="button"
                        onClick={event => {
                          event.stopPropagation()
                          setSelectedPatient(patient.id)
                          handleOpenPatientHistory(patient.id)
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
                      >
                        Prontuário
                      </button>
                    </div>
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
      <div style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.15) 0%, rgba(10,40,35,0.95) 100%)', border: '1px solid rgba(0,193,106,0.25)' }} className="rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <GraduationCap className="w-6 h-6" style={{ color: '#00F5A0' }} />
          <span>🎓 Preparação de Aulas</span>
        </h2>
        <p style={{ color: 'rgba(200,214,229,0.75)' }}>
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
    // Usar design system padronizado
    const heroStyle: React.CSSProperties = surfaceStyle
    const cardStyleLocal: React.CSSProperties = surfaceStyle
    const tileStyle: React.CSSProperties = secondarySurfaceStyle

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
      <div style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.15) 0%, rgba(10,40,35,0.95) 100%)', border: '1px solid rgba(0,193,106,0.25)' }} className="rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6" style={{ color: '#00F5A0' }} />
          <span>💰 Gestão Financeira</span>
        </h2>
        <p style={{ color: 'rgba(200,214,229,0.75)' }}>
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

  const renderPesquisaDashboard = () => {
    const researchSummaryCards = [
      {
        id: 'studies',
        label: 'Estudos Ativos',
        value: kpis.administrativos.protocolosIMRE || 0,
        description: 'Protocolos de pesquisa em andamento',
        icon: Activity,
        gradient: 'linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(251,191,36,0.2) 100%)',
        iconClass: 'text-amber-300'
      },
      {
        id: 'datasets',
        label: 'Bases Processadas',
        value: kpis.administrativos.protocolosAEC || 0,
        description: 'Datasets integrados à plataforma',
        icon: Database,
        gradient: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(129,140,248,0.22) 100%)',
        iconClass: 'text-indigo-300'
      },
      {
        id: 'insights',
        label: 'Insights Publicados',
        value: kpis.administrativos.respondedoresTEZ || 0,
        description: 'Relatórios e briefings emitidos',
        icon: BarChart3,
        gradient: 'linear-gradient(135deg, rgba(56,189,248,0.26) 0%, rgba(14,165,233,0.22) 100%)',
        iconClass: 'text-sky-300'
      },
      {
        id: 'teams',
        label: 'Equipes Envolvidas',
        value: kpis.administrativos.consultoriosAtivos || 0,
        description: 'Times multidisciplinares ativos',
        icon: Users,
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.26) 0%, rgba(5,150,105,0.22) 100%)',
        iconClass: 'text-emerald-300'
      }
    ]

    const researchActions = [
      {
        id: 'admin-dashboard',
        title: 'Resumo Administrativo',
        caption: 'Visão consolidada da plataforma',
        icon: Layout,
        action: () => goToSection('dashboard')
      },
      {
        id: 'admin-users',
        title: 'Usuários',
        caption: 'Gestão de equipes e permissões',
        icon: Users,
        action: () => goToSection('admin-usuarios')
      },
      {
        id: 'knowledge-base',
        title: 'Conhecimento da IA Residente',
        caption: 'Protocolos, manuais e arquivos estratégicos',
        icon: BookOpen,
        action: () => goToSection('admin-upload')
      },
      {
        id: 'renal-monitoring',
        title: 'Função Renal',
        caption: 'Monitoramento integrado de nefrologia',
        icon: Activity,
        action: () => goToSection('admin-renal')
      },
      {
        id: 'protocols',
        title: 'Protocolos',
        caption: 'Gestão de estudos e métricas',
        icon: Clipboard,
        action: () => goToSection('avaliacao')
      },
      {
        id: 'analytics',
        title: 'Analytics',
        caption: 'Indicadores e resultados consolidados',
        icon: TrendingUp,
        action: () => goToSection('relatorios-clinicos')
      },
      {
        id: 'base-cientifica',
        title: 'Base Científica',
        caption: 'Publicações, datasets e referências',
        icon: Search,
        action: () => goToSection('biblioteca')
      },
      {
        id: 'insights',
        title: 'Insights',
        caption: 'Atualizações e relatórios da equipe',
        icon: Bell,
        action: () => goToSection('newsletter')
      },
      {
        id: 'collaboration',
        title: 'Colaboração',
        caption: 'Sincronização com pesquisadores e parceiros',
        icon: MessageCircle,
        action: () => goToSection('chat-profissionais')
      }
    ]

    // Usar design system padronizado (surfaceStyle já importado)

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {researchSummaryCards.map(card => {
            const SummaryIcon = card.icon
            return (
              <div key={card.id} className="rounded-xl p-5 border border-slate-700/40 backdrop-blur-md" style={{ background: card.gradient }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/70">{card.label}</p>
                    <p className="text-3xl font-semibold text-white mt-2">{card.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/20">
                    <SummaryIcon className={`w-5 h-5 ${card.iconClass}`} />
                  </div>
                </div>
                <p className="text-xs text-white/80">{card.description}</p>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl border border-slate-700/40 p-6" style={surfaceStyle}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-blue-300 mb-2">MedCannLab Pesquisa</p>
              <h2 className="text-2xl font-bold text-white">Centro Integrado de Pesquisa Clínica &amp; Translacional</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl">
                Organize protocolos, monitore indicadores e conecte equipes multidisciplinares em tempo real. Controle total
                da jornada de pesquisa com apoio da IA residente Nôa Esperanza.
              </p>
            </div>
            <button
              onClick={() => goToSection('avaliacao')}
              className="self-start lg:self-center bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white px-5 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              Criar Protocolo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {researchActions.map(action => {
              const ActionIcon = action.icon
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.action}
                  className="group text-left rounded-xl border border-slate-700/60 bg-slate-900/60 hover:border-blue-400/40 hover:bg-slate-900/80 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/15 text-blue-200 group-hover:text-blue-100">
                      <ActionIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 group-hover:text-white truncate">{action.title}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{action.caption}</p>
                    </div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderAtendimento = () => {
    type SummaryCard = {
      id: string
      label: string
      value: number
      description: string
      icon: React.ComponentType<{ className?: string }>
      gradient: string
      iconClass: string
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
      background: 'rgba(15,36,60,1)',
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
        iconClass: 'text-rose-300'
      },
      {
        id: 'waiting',
        label: 'Aguardando',
        value: waitingCount,
        description: 'Pacientes na sala de espera para hoje',
        icon: Clock,
        gradient: 'linear-gradient(135deg, rgba(255,211,61,0.28) 0%, rgba(255,161,22,0.22) 100%)',
        iconClass: 'text-amber-300'
      },
      {
        id: 'completed',
        label: 'Finalizados',
        value: completedCount,
        description: 'Consultas concluídas hoje',
        icon: CheckCircle,
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.28) 0%, rgba(34,197,94,0.2) 100%)',
        iconClass: 'text-emerald-300'
      },
      {
        id: 'next-24h',
        label: 'Próximas 24h',
        value: upcoming24hCount,
        description: 'Consultas programadas até amanhã',
        icon: Calendar,
        gradient: 'linear-gradient(135deg, rgba(59,130,246,0.28) 0%, rgba(14,165,233,0.22) 100%)',
        iconClass: 'text-sky-300'
      },
      {
        id: 'unread-messages',
        label: 'Mensagens',
        value: unreadMessages,
        description: 'Mensagens clínicas não lidas',
        icon: MessageCircle,
        gradient: 'linear-gradient(135deg, rgba(168,85,247,0.28) 0%, rgba(59,130,246,0.22) 100%)',
        iconClass: 'text-purple-300'
      }
    ]

    const summarySection = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map(card => {
            const SummaryIcon = card.icon
            return (
              <div key={card.id} className="rounded-xl p-4" style={{ ...surfaceStyle, background: card.gradient }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-[0.25em]">{card.label}</p>
                    <div className="flex items-baseline space-x-2 mt-1">
                      {doctorDashboardLoading ? (
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
                    <SummaryIcon className={`w-5 h-5 ${card.iconClass}`} />
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{card.description}</p>
              </div>
            )
          })}
        </div>
        {doctorDashboardError && !doctorDashboardLoading && (
          <p className="text-sm text-rose-300">{doctorDashboardError}</p>
        )}
      </>
    )

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1.2fr] gap-6">
          <div className="rounded-xl p-6 space-y-5" style={{ ...surfaceStyle, background: 'transparent', border: 'none', boxShadow: 'none' }}>
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
                    className={`rounded-xl p-4 transition-all border ${isSelected
                      ? 'border-[#00F5A0]/40 bg-emerald-500/10 shadow-lg'
                      : 'border-slate-600/40 hover:border-[#00F5A0]/30 bg-slate-800'
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
            <div className="rounded-xl p-6 space-y-4" style={{ ...surfaceStyle, background: 'transparent', border: 'none', boxShadow: 'none' }}>
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

            <div className="rounded-xl p-6 space-y-4" style={{ ...surfaceStyle, background: 'transparent', border: 'none', boxShadow: 'none' }}>
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
                      toast.info('Selecione um atendimento para iniciar a videochamada.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${selectedPatient
                    ? 'bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white hover:from-blue-600 hover:to-cyan-600'
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
                      toast.info('Selecione um atendimento para iniciar a ligação.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${selectedPatient
                    ? 'bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white hover:from-purple-600 hover:to-pink-600'
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
                      toast.info('Selecione um atendimento para abrir o chat.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${selectedPatient
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
                      toast.info('Selecione um atendimento para acessar o prontuário.')
                    }
                  }}
                  className={`rounded-lg p-3 text-sm font-semibold transition-colors ${selectedPatient
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
      <div style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.15) 0%, rgba(10,40,35,0.95) 100%)', border: '1px solid rgba(0,193,106,0.25)' }} className="rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <FileText className="w-6 h-6" style={{ color: '#00F5A0' }} />
          <span>📝 Nova Avaliação</span>
        </h2>
        <p style={{ color: 'rgba(200,214,229,0.75)' }}>
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
      <div style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.15) 0%, rgba(10,40,35,0.95) 100%)', border: '1px solid rgba(0,193,106,0.25)' }} className="rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BookOpen className="w-6 h-6" style={{ color: '#00F5A0' }} />
          <span>📚 Biblioteca</span>
        </h2>
        <p style={{ color: 'rgba(200,214,229,0.75)' }}>
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
      <div style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.15) 0%, rgba(10,40,35,0.95) 100%)', border: '1px solid rgba(0,193,106,0.25)' }} className="rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BookOpen className="w-6 h-6" style={{ color: '#00F5A0' }} />
          <span>📰 Newsletter Científico</span>
        </h2>
        <p style={{ color: 'rgba(200,214,229,0.75)' }}>
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

  const renderRelatoriosClinicos = () => (
    <div className="space-y-6">
      <ClinicalReports />
    </div>
  )

  const renderChatProfissionais = () => (
    <div className="space-y-6">
      <ProfessionalChatSystem />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de Convite */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-400" />
              Convidar Pacientes
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Envie este link para seus pacientes se conectarem diretamente ao seu perfil.
              Ao clicarem, uma sala de chat segura será criada automaticamente.
            </p>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-4">
              <p className="text-xs text-slate-500 mb-1">Link de Convite Pessoal</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-950 p-2 rounded text-primary-300 text-xs break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/invite?doctor_id=${user?.id}` : '...'}
                </code>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/invite?doctor_id=${user?.id}`
                    navigator.clipboard.writeText(link)
                    toast.success('Link copiado para a área de transferência!')
                  }}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                  title="Copiar Link"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartilhar via WhatsApp
              </button>
              <button
                onClick={() => {
                  const link = `${window.location.origin}/invite?doctor_id=${user?.id}`
                  window.open(link, '_blank')
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Testar Link
              </button>
            </div>
          </div>

          {/* Card de Gestão (Placeholder melhorado) */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Lista de Usuários
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Gerencie permissões, resets de senha e cadastro manual de usuários.
            </p>
            <div className="flex items-center justify-center p-8 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
              <p className="text-slate-500 text-sm text-center">
                Funcionalidade de gestão completa em desenvolvimento.<br />
                Use o painel do Supabase para alterações críticas.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAdminUpload = (): React.ReactNode => {
    const totalDocs = knowledgeStats?.totalDocuments ?? knowledgeDocuments.length
    const aiLinkedDocs = knowledgeStats?.aiLinkedDocuments ?? knowledgeDocuments.filter(doc => doc.isLinkedToAI).length
    const averageRelevanceValue = knowledgeStats?.averageRelevance ?? (
      knowledgeDocuments.length
        ? knowledgeDocuments.reduce((sum, doc) => sum + (doc.aiRelevance || 0), 0) / knowledgeDocuments.length
        : 0
    )
    const averageRelevance = Number.isFinite(averageRelevanceValue) ? averageRelevanceValue : 0

    const latestTimestamp = knowledgeDocuments.reduce<string | null>((latest, doc) => {
      if (!doc.updated_at) return latest
      if (!latest) return doc.updated_at
      return new Date(doc.updated_at).getTime() > new Date(latest).getTime() ? doc.updated_at : latest
    }, null)
    const latestUpdateLabel = formatKnowledgeRelativeTime(latestTimestamp)

    const documentsToDisplay = knowledgeFilteredDocuments.slice(0, 6)
    const isSearching = knowledgeDebouncedSearch.trim().length > 0
    const showLoader = knowledgeLoading && (isSearching || !knowledgeDocuments.length)

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 rounded-2xl p-6 border border-emerald-700/30 shadow-lg shadow-emerald-900/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm text-emerald-200/80">Nôa Esperança IA • Educação • Pesquisa</p>
                <h2 className="text-2xl font-bold text-white">Conhecimento da IA Residente</h2>
              </div>
            </div>
            <button
              onClick={handleKnowledgeStatsToggle}
              className="px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              {knowledgeShowStats ? 'Ocultar Estatísticas' : 'Ver Estatísticas'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-400/20">
              <p className="text-xs text-emerald-200/80 uppercase tracking-widest">Vinculados à IA Residente</p>
              <p className="text-3xl font-bold text-white mt-2">{aiLinkedDocs}</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-400/20">
              <p className="text-xs text-emerald-200/80 uppercase tracking-widest">Relevância Média IA</p>
              <p className="text-3xl font-bold text-white mt-2">{averageRelevance.toFixed(2)}</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-400/20">
              <p className="text-xs text-emerald-200/80 uppercase tracking-widest">Último Treinamento</p>
              <p className="text-lg font-semibold text-white mt-2">{latestUpdateLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6 text-sm text-emerald-200/80">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">Treinamento da IA Residente</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">Recursos educacionais</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">Referências científicas</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">Protocolos clínicos</span>
          </div>
        </div>

        {knowledgeShowStats && knowledgeStats && (
          <div className="bg-slate-900/70 rounded-2xl p-6 border border-emerald-500/20 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#00F5A0]">{knowledgeStats.totalDocuments}</p>
                <p className="text-sm text-slate-300">Total de Documentos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#4FE0C1]">{knowledgeStats.aiLinkedDocuments}</p>
                <p className="text-sm text-slate-300">Documentos vinculados à IA</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#4FE0C1]">{knowledgeStats.averageRelevance.toFixed(2)}</p>
                <p className="text-sm text-slate-300">Relevância Média</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#FFD33D]">{knowledgeStats.topCategories.length}</p>
                <p className="text-sm text-slate-300">Categorias ativas</p>
              </div>
            </div>

            {knowledgeStats.topCategories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-300" />
                  Top categorias
                </h3>
                <div className="flex flex-wrap gap-2">
                  {knowledgeStats.topCategories.map(category => (
                    <span
                      key={category.category}
                      className="px-3 py-1 rounded-full bg-slate-800 border border-emerald-500/20 text-sm text-slate-200"
                    >
                      {category.category} • {category.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {knowledgeStats.topAuthors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-300" />
                  Principais autores
                </h3>
                <div className="flex flex-wrap gap-2">
                  {knowledgeStats.topAuthors.map(author => (
                    <span
                      key={author.author}
                      className="px-3 py-1 rounded-full bg-slate-800 border border-emerald-500/20 text-sm text-slate-200"
                    >
                      {author.author} • {author.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-700/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={knowledgeSearch}
                  onChange={event => setKnowledgeSearch(event.target.value)}
                  placeholder="Buscar documentos por título, conteúdo, autor..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/70 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">⌘K</span>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={handleKnowledgeCategories}
                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm font-medium hover:bg-slate-750 transition-colors"
              >
                Gerenciar Categorias
              </button>
              <button
                onClick={handleKnowledgeUpload}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                Fazer Upload
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-300">Categoria:</span>
            <button
              onClick={() => setKnowledgeCategory('all')}
              className={`px-3 py-1 rounded-full border text-sm font-medium ${knowledgeCategory === 'all'
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-750'
                }`}
            >
              Todos ({totalDocs})
            </button>
            {knowledgeCategoryOptions.map(category => {
              const count = knowledgeDocuments.filter(doc => doc.category === category).length
              return (
                <button
                  key={category}
                  onClick={() => setKnowledgeCategory(category)}
                  className={`px-3 py-1 rounded-full border text-sm font-medium ${knowledgeCategory === category
                    ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-750'
                    }`}
                >
                  {category} ({count})
                </button>
              )
            })}
          </div>

          <div className="mt-6">
            {showLoader ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Carregando documentos...
              </div>
            ) : knowledgeError ? (
              <div className="text-center py-10 text-slate-400">{knowledgeError}</div>
            ) : documentsToDisplay.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                Nenhum documento disponível no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {documentsToDisplay.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => openKnowledgeDocument(doc)}
                    className="p-4 rounded-xl border border-slate-700/70 bg-slate-950/60 hover:border-emerald-500/30 transition-colors text-left"
                  >
                    <p className="text-xs text-emerald-200/70 uppercase tracking-widest flex items-center gap-2">
                      <span>{doc.category || 'Sem categoria'}</span>
                      {doc.isLinkedToAI && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full">IA</span>}
                    </p>
                    <h4 className="text-lg font-semibold text-white mt-2">{doc.title}</h4>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-3">{doc.summary || 'Resumo indisponível no momento.'}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                      <span>{formatKnowledgeRelativeTime(doc.updated_at)}</span>
                      <span>IA Score {(doc.aiRelevance ?? 0).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderAdminRenal = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        <RenalFunctionModule patientId={selectedPatient || undefined} />
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
          return renderPesquisaDashboard()
        }
        return renderAtendimento()
      case 'admin-usuarios':
        return renderAdminUsuarios()
      case 'admin-upload':
        return renderAdminUpload()
      case 'admin-renal':
        return <IntegratedWorkstation initialTab="renal" defaultPatientId={selectedPatient || undefined} />
      case 'atendimento':
        return <IntegratedWorkstation defaultPatientId={selectedPatient || undefined} />
      case 'pacientes':
        return <IntegratedWorkstation initialTab="patients" defaultPatientId={selectedPatient || undefined} />
      case 'chat-clinico':
        return <IntegratedWorkstation initialTab="chat" defaultPatientId={selectedPatient || undefined} />
      case 'prescricoes':
        return <IntegratedWorkstation initialTab="prescriptions" defaultPatientId={selectedPatient || undefined} />
      case 'agendamentos':
        return <IntegratedWorkstation initialTab="scheduling" defaultPatientId={selectedPatient || undefined} />
      case 'financeiro':
        return renderFinanceiro()
      case 'relatorios-clinicos':
        return renderRelatoriosClinicos()
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
      case 'terminal-clinico':
        return <IntegratedWorkstation initialTab="patient-focus" defaultPatientId={selectedPatient || undefined} />
      default:
        if (normalizedEffectiveType === 'admin') {
          return renderKPIsAdmin()
        }
        if (currentEixo === 'ensino') {
          return renderAulas()
        }
        if (currentEixo === 'pesquisa') {
          return renderPesquisaDashboard()
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

  const upcomingAppointments = useMemo(() => appointments.slice(0, 4), [appointments])

  const {
    totalToday: totalTodayCount,
    confirmedToday,
    waitingRoomToday,
    completedToday,
    next24h,
    unreadMessages
  } = doctorDashboardStats

  const inProgressCount = confirmedToday
  const waitingCount = waitingRoomToday
  const completedCount = completedToday
  const upcoming24hCount = next24h

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

  const knowledgeCategoryOptions = useMemo(() => {
    return [...knowledgeCategories]
      .filter(category => Boolean(category))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [knowledgeCategories])

  const formatKnowledgeRelativeTime = useCallback((timestamp?: string | null) => {
    if (!timestamp) return 'Sem registros'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'Sem registros'

    const diffMs = Date.now() - date.getTime()
    if (diffMs < 0) return 'Recém atualizado'

    const minutes = Math.round(diffMs / 60000)
    if (minutes < 60) {
      if (minutes <= 1) return 'Atualizado há 1 minuto'
      return `Atualizado há ${minutes} minutos`
    }

    const hours = Math.round(diffMs / 3600000)
    if (hours < 24) {
      if (hours === 1) return 'Atualizado há 1 hora'
      return `Atualizado há ${hours} horas`
    }

    const days = Math.round(diffMs / 86400000)
    if (days < 30) {
      if (days === 1) return 'Atualizado há 1 dia'
      return `Atualizado há ${days} dias`
    }

    const months = Math.round(days / 30)
    if (months < 12) {
      if (months === 1) return 'Atualizado há 1 mês'
      return `Atualizado há ${months} meses`
    }

    const years = Math.round(days / 365)
    if (years <= 1) return 'Atualizado há 1 ano'
    return `Atualizado há ${years} anos`
  }, [])

  const downloadKnowledgeDocumentContent = useCallback(async (doc: KnowledgeDocument) => {
    if (!doc || !(doc as any).file_url) {
      return null
    }

    try {
      const targetUrl = (doc as any).file_url as string
      const response = await fetch(targetUrl)
      const contentType = response.headers.get('content-type') || ''

      if (!response.ok) {
        throw new Error(`Falha ao baixar o documento: ${response.status}`)
      }

      if (contentType.includes('text') || targetUrl.endsWith('.md') || targetUrl.endsWith('.txt')) {
        return await response.text()
      }

      if (contentType.includes('application/json')) {
        const json = await response.json()
        return JSON.stringify(json, null, 2)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      return objectUrl
    } catch (error) {
      console.warn('⚠️ Erro ao baixar conteúdo do documento:', error)
      return null
    }
  }, [])

  const openKnowledgeDocument = useCallback(async (doc: KnowledgeDocument) => {
    if (!doc) return

    setKnowledgeSelectedDocument(doc)
    setKnowledgeViewerMode('preview')

    if (!(doc as any).file_url) {
      setKnowledgeDocumentContent(null)
      return
    }

    setKnowledgeDocumentLoading(true)
    const content = await downloadKnowledgeDocumentContent(doc)
    setKnowledgeDocumentContent(content)
    setKnowledgeDocumentLoading(false)
  }, [downloadKnowledgeDocumentContent])

  const closeKnowledgeDocument = useCallback(() => {
    setKnowledgeSelectedDocument(null)
    setKnowledgeDocumentContent(null)
    setKnowledgeViewerMode('preview')
  }, [])

  const loadKnowledgeBase = useCallback(async () => {
    if (normalizedEffectiveType !== 'admin') return

    setKnowledgeLoading(true)
    try {
      const [stats, docs] = await Promise.all([
        KnowledgeBaseIntegration.getKnowledgeStats(),
        KnowledgeBaseIntegration.getAllDocuments()
      ])

      const normalizedDocs = (docs || [])
        .map((doc: any) => ({
          ...doc,
          category: doc.category ?? doc.categoria ?? 'Sem categoria',
          aiRelevance: doc.aiRelevance ?? doc.ai_relevance ?? 0,
          isLinkedToAI: doc.isLinkedToAI ?? doc.is_linked_to_ai ?? false,
          file_url: doc.file_url ?? doc.fileUrl ?? doc.url ?? undefined,
          summary: doc.summary ?? doc.resumo ?? '',
          updated_at: doc.updated_at ?? doc.updatedAt ?? doc.created_at,
          created_at: doc.created_at ?? doc.createdAt ?? new Date().toISOString(),
          author: doc.author ?? doc.autor ?? 'Equipe MedCannLab'
        }))
        .sort((a, b) => {
          const aDateValue = new Date(a.updated_at ?? a.created_at ?? '').getTime()
          const bDateValue = new Date(b.updated_at ?? b.created_at ?? '').getTime()
          const safeADate = Number.isFinite(aDateValue) ? aDateValue : 0
          const safeBDate = Number.isFinite(bDateValue) ? bDateValue : 0
          return safeBDate - safeADate
        })

      const sanitizedStats = stats
        ? {
          ...stats,
          averageRelevance: Number.isFinite(stats.averageRelevance) ? stats.averageRelevance : 0
        }
        : null

      setKnowledgeStats(sanitizedStats)
      setKnowledgeDocuments(normalizedDocs)
      setKnowledgeFilteredDocuments(normalizedDocs)
      const categories = Array.from(new Set(normalizedDocs.map(doc => doc.category).filter(Boolean)))
      setKnowledgeCategories(categories)
      setKnowledgeError(null)
    } catch (error) {
      console.error('❌ Erro ao carregar base de conhecimento:', error)
      setKnowledgeDocuments([])
      setKnowledgeCategories([])
      setKnowledgeStats(null)
      setKnowledgeError('Erro ao carregar a base de conhecimento.')
    } finally {
      setKnowledgeLoading(false)
    }
  }, [normalizedEffectiveType])

  const handleKnowledgeStatsToggle = useCallback(() => {
    setKnowledgeShowStats(prev => !prev)
  }, [])

  const handleKnowledgeCategories = useCallback(() => {
    navigate('/app/library', { state: { source: 'admin-base', focus: 'categories' } })
  }, [navigate])

  const handleKnowledgeUpload = useCallback(() => {
    navigate('/app/library', { state: { source: 'admin-base', action: 'upload' } })
  }, [navigate])

  const handleOpenKnowledgeDocument = useCallback(async (doc: KnowledgeDocument) => {
    try {
      await KnowledgeBaseIntegration.registerDocumentUsage(doc.id, 'admin-dashboard-open', user?.id)
    } catch (error) {
      console.warn('⚠️ Erro ao registrar uso do documento:', error)
    }

    const fileUrl = (doc as any).file_url ?? doc.file_url
    if (!fileUrl) {
      console.warn('⚠️ Documento sem URL disponível para download.', doc.id)
      return
    }

    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }, [user?.id])

  useEffect(() => {
    if (normalizedEffectiveType === 'admin') {
      loadKnowledgeBase()
    }
  }, [normalizedEffectiveType, loadKnowledgeBase])

  useEffect(() => {
    const handler = setTimeout(() => {
      setKnowledgeDebouncedSearch(knowledgeSearch)
    }, 300)

    return () => clearTimeout(handler)
  }, [knowledgeSearch])

  useEffect(() => {
    if (knowledgeCategory !== 'all' && !knowledgeCategoryOptions.includes(knowledgeCategory)) {
      setKnowledgeCategory('all')
    }
  }, [knowledgeCategoryOptions, knowledgeCategory])

  useEffect(() => {
    if (normalizedEffectiveType !== 'admin') {
      return
    }

    let isActive = true

    const applyKnowledgeFilters = async () => {
      const trimmedSearch = knowledgeDebouncedSearch.trim()

      if (trimmedSearch.length > 0) {
        setKnowledgeLoading(true)
        try {
          const docs = await KnowledgeBaseIntegration.semanticSearch(trimmedSearch, {
            category: knowledgeCategory === 'all' ? undefined : knowledgeCategory,
            limit: 12
          })

          const normalizedResults = (docs || [])
            .map((doc: any) => ({
              ...doc,
              category: doc.category ?? doc.categoria ?? 'Sem categoria',
              aiRelevance: doc.aiRelevance ?? doc.ai_relevance ?? 0,
              isLinkedToAI: doc.isLinkedToAI ?? doc.is_linked_to_ai ?? false,
              file_url: doc.file_url ?? doc.fileUrl ?? doc.url ?? undefined,
              summary: doc.summary ?? doc.resumo ?? '',
              updated_at: doc.updated_at ?? doc.updatedAt ?? doc.created_at,
              created_at: doc.created_at ?? doc.createdAt ?? new Date().toISOString(),
              author: doc.author ?? doc.autor ?? 'Equipe MedCannLab'
            }))
            .sort((a, b) => {
              const aDateValue = new Date(a.updated_at ?? a.created_at ?? '').getTime()
              const bDateValue = new Date(b.updated_at ?? b.created_at ?? '').getTime()
              const safeADate = Number.isFinite(aDateValue) ? aDateValue : 0
              const safeBDate = Number.isFinite(bDateValue) ? bDateValue : 0
              return safeBDate - safeADate
            })

          if (isActive) {
            setKnowledgeFilteredDocuments(normalizedResults)
            setKnowledgeError(normalizedResults.length ? null : 'Nenhum documento encontrado para a busca atual.')
          }
        } catch (error) {
          console.error('❌ Erro ao pesquisar base de conhecimento:', error)
          if (isActive) {
            setKnowledgeFilteredDocuments([])
            setKnowledgeError('Erro ao pesquisar a base de conhecimento.')
          }
        } finally {
          if (isActive) {
            setKnowledgeLoading(false)
          }
        }
        return
      }

      if (!knowledgeDocuments.length) {
        if (isActive) {
          setKnowledgeFilteredDocuments([])
        }
        return
      }

      const docs = knowledgeDocuments.filter(doc => knowledgeCategory === 'all' || doc.category === knowledgeCategory)
      if (isActive) {
        setKnowledgeFilteredDocuments(docs)
        setKnowledgeError(docs.length ? null : 'Nenhum documento disponível nesta categoria.')
      }
    }

    applyKnowledgeFilters()

    return () => {
      isActive = false
    }
  }, [knowledgeDebouncedSearch, knowledgeCategory, knowledgeDocuments, normalizedEffectiveType])

  return (
    <div
      className="min-h-screen overflow-x-hidden w-full relative"
      style={{ background: backgroundGradient }}
      data-page="ricardo-valenca-dashboard"
    >


      <div className="w-full max-w-full mx-auto px-0 md:px-2 lg:px-2 py-0 md:py-2 lg:py-2 overflow-x-hidden pb-32">
        {/* Barra de Contexto do Paciente - Navegação Integrada */}
        {selectedPatient && selectedPatientData && (
          <div className="mb-2 bg-gradient-to-r from-slate-800/90 to-slate-900/90 rounded-xl border border-emerald-500/30 p-4 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Info do Paciente */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedPatientData.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-xs text-emerald-300/70 uppercase tracking-wider">Paciente Selecionado</p>
                  <p className="text-white font-semibold text-lg">{selectedPatientData.name || 'Paciente'}</p>
                  <p className="text-slate-400 text-xs">{selectedPatientData.email || ''}</p>
                </div>
              </div>

              {/* Abas de Navegação Rápida */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => goToSection('atendimento')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${resolvedSection === 'atendimento'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                    }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Atendimento
                </button>
                <button
                  onClick={() => goToSection('prescricoes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${resolvedSection === 'prescricoes'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  Prescrições
                </button>
                <button
                  onClick={() => goToSection('admin-renal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${resolvedSection === 'admin-renal'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                    }`}
                >
                  <Activity className="w-4 h-4" />
                  Função Renal
                </button>
                <button
                  onClick={() => goToSection('agendamentos')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${resolvedSection === 'agendamentos'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                    }`}
                >
                  <Calendar className="w-4 h-4" />
                  Agenda
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all"
                  title="Limpar seleção"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {renderActiveSection(resolvedSection)}

        {resolvedSection === 'chat-profissionais' && (
          <div id="chat-section" className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              Comunicação Clínica Integrada
            </h2>
            <div className="h-[600px]">
              <ProfessionalChatSystem className="h-full" interlocutor="Eduardo" />
            </div>
          </div>
        )}

        {/* Triggers e cérebro movidos para o header (Desktop: barra no cabeçalho; Mobile: sanduíche + cérebro) */}

        {/* Modal de Seleção de Dashboard Profissional */}
        {
          showProfessionalModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
          )
        }

        {
          showVoicePrescriptionModal && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
              <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl p-6 relative">
                <button
                  type="button"
                  onClick={handleCloseVoicePrescriptionModal}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                  aria-label="Fechar visualização da prescrição"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="mb-5 pr-10">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-400">Comando de Voz • Prescrição</p>
                  <h3 className="text-2xl font-bold text-white mt-2">Última prescrição emitida</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    {voicePrescriptionPreview?.patientName || selectedPatientData?.name || 'Paciente selecionado no painel'}
                  </p>
                </div>

                {voicePrescriptionLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    <p className="text-slate-400 text-sm">Buscando a prescrição solicitada...</p>
                  </div>
                ) : voicePrescriptionError ? (
                  <div className="py-10 text-center">
                    <p className="text-slate-300">{voicePrescriptionError}</p>
                  </div>
                ) : voicePrescriptionPreview ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs uppercase tracking-[0.3em] bg-emerald-500/10 text-emerald-200 border border-emerald-500/30">
                        {voicePrescriptionPreview.status === 'active'
                          ? 'Ativa'
                          : voicePrescriptionPreview.status === 'completed'
                            ? 'Concluída'
                            : voicePrescriptionPreview.status === 'suspended'
                              ? 'Suspensa'
                              : voicePrescriptionPreview.status ?? 'Rascunho'}
                      </span>
                      {voicePrescriptionPreview.rationality && (
                        <span className="text-sm text-slate-300">
                          {VOICE_RATIONALITY_LABELS[voicePrescriptionPreview.rationality] ??
                            voicePrescriptionPreview.rationality}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        Emitida em{' '}
                        {new Date(voicePrescriptionPreview.issuedAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-white">{voicePrescriptionPreview.title}</h4>
                      {voicePrescriptionPreview.summary && (
                        <p className="text-sm text-slate-300 mt-2">{voicePrescriptionPreview.summary}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Dosagem</p>
                        <p className="text-white">
                          {voicePrescriptionPreview.dosage ?? 'Definida com a equipe clínica'}
                        </p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Frequência</p>
                        <p className="text-white">
                          {voicePrescriptionPreview.frequency ?? 'Frequência personalizada'}
                        </p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Duração</p>
                        <p className="text-white">
                          {voicePrescriptionPreview.duration ?? 'Definida no plano terapêutico'}
                        </p>
                      </div>
                      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Profissional</p>
                        <p className="text-white">
                          {voicePrescriptionPreview.professionalName ?? 'Equipe MedCannLab'}
                        </p>
                      </div>
                    </div>

                    {voicePrescriptionPreview.instructions && (
                      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Instruções</p>
                        <p className="text-slate-200 whitespace-pre-wrap">{voicePrescriptionPreview.instructions}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                      <span>
                        Modelo:{' '}
                        <span className="text-slate-200">
                          {voicePrescriptionPreview.templateName ?? 'Personalizado pela equipe'}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors"
                        onClick={() => {
                          handleCloseVoicePrescriptionModal()
                          goToSection('prescricoes')
                        }}
                      >
                        <FileText className="w-4 h-4" />
                        Abrir painel de prescrições
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-slate-300">Nenhuma prescrição encontrada.</p>
                  </div>
                )}
              </div>
            </div>
          )
        }

        {
          (resolvedSection as any) === 'perfil' && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">👤 Meu Perfil</h2>
              <p className="text-slate-300 mb-6">Acesse a página de perfil para gerenciar suas informações</p>
              <button
                onClick={() => navigate('/app/profile')}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Ir para Perfil</span>
              </button>
            </div>
          )
        }
      </div >

      {/* Video/Audio Call Component */}
      < VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        patientId={selectedPatient || undefined}
        isAudioOnly={callType === 'audio'}
      />

      {
        knowledgeSelectedDocument && (
          <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div>
                  <p className="text-xs text-emerald-200/70 uppercase tracking-widest flex items-center gap-2">
                    <span>{knowledgeSelectedDocument.category || 'Sem categoria'}</span>
                    {knowledgeSelectedDocument.isLinkedToAI && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full">IA</span>
                    )}
                  </p>
                  <h3 className="text-xl font-semibold text-white mt-1">{knowledgeSelectedDocument.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatKnowledgeRelativeTime(knowledgeSelectedDocument.updated_at)} • IA Score {(knowledgeSelectedDocument.aiRelevance ?? 0).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={closeKnowledgeDocument}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              {(knowledgeSelectedDocument as any).file_url && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/70">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setKnowledgeViewerMode('preview')}
                      className={`px-3 py-1 rounded-lg text-sm ${knowledgeViewerMode === 'preview' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-750'}`}
                    >
                      Visualização
                    </button>
                    <button
                      onClick={() => setKnowledgeViewerMode('raw')}
                      className={`px-3 py-1 rounded-lg text-sm ${knowledgeViewerMode === 'raw' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-750'}`}
                    >
                      Texto bruto
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const fileUrl = (knowledgeSelectedDocument as any).file_url
                        if (fileUrl) {
                          const link = document.createElement('a')
                          link.href = fileUrl
                          link.download = knowledgeSelectedDocument.title || 'documento'
                          link.rel = 'noopener noreferrer'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }
                      }}
                      className="px-3 py-1 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-750"
                    >
                      Baixar
                    </button>
                    <button
                      onClick={() => {
                        const fileUrl = (knowledgeSelectedDocument as any).file_url
                        if (fileUrl) {
                          window.open(fileUrl, '_blank', 'noopener,noreferrer')
                        }
                      }}
                      className="px-3 py-1 rounded-lg text-sm bg-emerald-500 text-white hover:bg-emerald-400"
                    >
                      Abrir em nova aba
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-6 bg-slate-950/80">
                {knowledgeDocumentLoading ? (
                  <div className="flex items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando conteúdo...
                  </div>
                ) : knowledgeDocumentContent ? (
                  knowledgeViewerMode === 'preview' ? (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{knowledgeDocumentContent}</pre>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-xs bg-slate-900/90 p-4 rounded-lg border border-slate-800 overflow-x-auto">
                      {knowledgeDocumentContent}
                    </pre>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                    <FileText className="w-8 h-8 opacity-20" />
                    <p>Conteúdo não disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      <CreatePatientModal
        isOpen={showCreatePatientModal}
        onClose={() => setShowCreatePatientModal(false)}
        onSuccess={() => {
          loadPatients()
          toast.success('Paciente adicionado com sucesso!')
        }}
      />
    </div >
  )
}

export default RicardoValencaDashboard
