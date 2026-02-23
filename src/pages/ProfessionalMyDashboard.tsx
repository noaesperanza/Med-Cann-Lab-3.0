import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  User,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Activity,
  Stethoscope,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  BookOpen,
  MessageCircle,
  Pencil,
  Wallet,
  Gift,
  Zap,
  Award,
  Star,
  Search,
  X,
  ChevronDown,
  Terminal,
  GraduationCap,
  ArrowLeft
} from 'lucide-react'
import { backgroundGradient, accentGradient, secondaryGradient, secondarySurfaceStyle, cardStyle } from '../constants/designSystem'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useDashboardTriggers } from '../contexts/DashboardTriggersContext'
import IntegratedWorkstation from '../components/IntegratedWorkstation'
import EduardoScheduling from '../components/EduardoScheduling'
import ProfessionalChatSystem from '../components/ProfessionalChatSystem'
import Prescriptions from './Prescriptions'

const ProfessionalMyDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { openChat: openNoaChat, closeChat, isOpen: isNoaOpen } = useNoaPlatform()
  const { setDashboardTriggers } = useDashboardTriggers()
  const isEduardoDashboard = location.pathname.includes('dashboard-eduardo')
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalReports: 0,
    pendingReports: 0
  })
  const [chartData, setChartData] = useState<{
    consultationsByWeek: { label: string; value: number }[]
    patientEvaluationsTotal: number
    patientEvaluationsByWeek: { label: string; value: number }[]
  }>({
    consultationsByWeek: [],
    patientEvaluationsTotal: 0,
    patientEvaluationsByWeek: []
  })
  const [loading, setLoading] = useState(true)
  const [walletCredits, setWalletCredits] = useState(0)
  const [xp, setXp] = useState(0)
  const [ranking, setRanking] = useState<number | null>(null)
  const userAvatarUrl = (user as any)?.user_metadata?.avatar_url ?? (user as any)?.avatar_url ?? null

  // Analisar Paciente: lista de vinculados, seleção, scan e painel analítico
  const [linkedPatients, setLinkedPatients] = useState<{ id: string; name: string }[]>([])
  const [analysisSearch, setAnalysisSearch] = useState('')
  const [analysisDropdownOpen, setAnalysisDropdownOpen] = useState(false)
  const analysisDropdownRef = useRef<HTMLDivElement>(null)
  const [selectedPatientForAnalysis, setSelectedPatientForAnalysis] = useState<{ id: string; name: string } | null>(null)
  const [analysisScanning, setAnalysisScanning] = useState(false)
  const [analysisScanMessage, setAnalysisScanMessage] = useState('')
  const [analysisPanelOpen, setAnalysisPanelOpen] = useState(false)
  const [analysisData, setAnalysisData] = useState<{
    assessments: any[]
    pastAppointments: any[]
    upcomingAppointments: any[]
    prescriptions: any[]
    patientReports?: any[]
    patientAvatarUrl?: string | null
  } | null>(null)
  const [analysisPanelCollapsed, setAnalysisPanelCollapsed] = useState<Record<string, boolean>>({ evolution: false })
  const [scanningPatientAvatarUrl, setScanningPatientAvatarUrl] = useState<string | null>(null)

  // KPIs unificados (3 camadas — mesmo do Dr. Eduardo / dashboard unificado)
  const [kpisUnified, setKpisUnified] = useState({
    administrativos: { totalPacientes: 0, avaliacoesCompletas: 0, protocolosIMRE: 0, respondedoresTEZ: 0 },
    semanticos: { qualidadeEscuta: 0, engajamentoPaciente: 0, satisfacaoClinica: 0, aderenciaTratamento: 0 },
    clinicos: { wearablesAtivos: 0, monitoramento24h: 0, episodiosEpilepsia: 0, melhoraSintomas: 0 }
  })

  // Header triggers (cards por usabilidade do perfil profissional “Meu Dashboard”) + cérebro Nôa
  const myProTriggerOptions = [
    { id: 'meu-dashboard', label: 'Meu Dashboard', icon: BarChart3 },
    { id: 'atendimento', label: 'Atendimento', icon: Stethoscope },
    { id: 'prescricoes', label: 'Prescrições', icon: FileText },
    { id: 'terminal-clinico', label: 'Terminal Clínico', icon: Terminal },
    { id: 'chat-profissionais', label: 'Chat Profissionais', icon: MessageCircle }
  ]
  useEffect(() => {
    setDashboardTriggers({
      options: myProTriggerOptions.map(o => ({ id: o.id, label: o.label, icon: o.icon })),
      activeId: 'meu-dashboard',
      onChange: (id) => {
        if (id === 'meu-dashboard') return
        if (id === 'atendimento') navigate('/app/clinica/profissional/dashboard?section=atendimento')
        else if (id === 'prescricoes') navigate('/app/clinica/profissional/dashboard?section=prescricoes')
        else if (id === 'terminal-clinico') navigate('/app/clinica/profissional/dashboard?section=terminal-clinico')
        else if (id === 'chat-profissionais') navigate('/app/clinica/profissional/dashboard?section=chat-profissionais')
      },
      onBrainClick: () => { if (isNoaOpen) closeChat(); else openNoaChat() }
    })
    return () => setDashboardTriggers(null)
  }, [navigate, openNoaChat, closeChat, isNoaOpen, setDashboardTriggers])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
      loadKPIsUnified()
      loadUserProfileStats()
    }
  }, [user?.id])

  const loadUserProfileStats = async () => {
    if (!user?.id) return
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('points, level')
        .eq('user_id', user.id)
        .maybeSingle()
      if (profile) {
        setXp(profile.points ?? 0)
      }
      // Calcular ranking: posição do usuário entre todos
      const { data: allProfiles } = await supabase
        .from('user_profiles')
        .select('user_id, points')
        .order('points', { ascending: false })
      if (allProfiles) {
        const idx = allProfiles.findIndex((p: any) => p.user_id === user.id)
        setRanking(idx >= 0 ? idx + 1 : null)
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil de gamificação:', err)
    }
  }

  const loadKPIsUnified = async () => {
    try {
      const { data: assessments } = await supabase.from('clinical_assessments').select('patient_id, status, assessment_type, data').order('created_at', { ascending: false })
      const patientIds = [...new Set((assessments || []).map((a: any) => a.patient_id))]
      const totalPacientes = patientIds.length
      const avaliacoesCompletas = assessments?.filter(a => a.status === 'completed').length || 0
      const protocolosIMRE = assessments?.filter((a: any) => a.assessment_type === 'IMRE').length || 0
      const respondedoresTEZ = assessments?.filter((a: any) => a.data?.improvement === true).length || 0

      let qualidadeEscuta = 0, engajamentoPaciente = 0, satisfacaoClinica = 0, aderenciaTratamento = 0
      const { data: semanticKPIs } = await supabase.from('clinical_kpis').select('*').in('category', ['comportamental', 'cognitivo', 'social'])
      if (semanticKPIs?.length) {
        qualidadeEscuta = (semanticKPIs.find((k: any) => k.name?.toLowerCase().includes('qualidade') || k.name?.toLowerCase().includes('escuta')) as any)?.current_value ?? 0
        engajamentoPaciente = (semanticKPIs.find((k: any) => k.name?.toLowerCase().includes('engajamento')) as any)?.current_value ?? 0
        satisfacaoClinica = (semanticKPIs.find((k: any) => k.name?.toLowerCase().includes('satisfação') || k.name?.toLowerCase().includes('satisfacao')) as any)?.current_value ?? 0
        aderenciaTratamento = (semanticKPIs.find((k: any) => k.name?.toLowerCase().includes('aderência') || k.name?.toLowerCase().includes('aderencia')) as any)?.current_value ?? 0
      }

      const { data: wearableDevices } = await supabase.from('wearable_devices').select('id').eq('connection_status', 'connected')
      const wearablesAtivos = wearableDevices?.length ?? 0
      const { data: epilepsyEvents } = await supabase.from('epilepsy_events').select('id, severity').gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      const episodiosEpilepsia = epilepsyEvents?.length ?? 0
      const eventosLeves = epilepsyEvents?.filter((e: any) => e.severity === 'leve').length ?? 0
      const melhoraSintomas = episodiosEpilepsia > 0 ? Math.round((eventosLeves / episodiosEpilepsia) * 100) : 0

      setKpisUnified({
        administrativos: { totalPacientes, avaliacoesCompletas, protocolosIMRE, respondedoresTEZ },
        semanticos: {
          qualidadeEscuta: Math.round(qualidadeEscuta),
          engajamentoPaciente: Math.round(engajamentoPaciente),
          satisfacaoClinica: Math.round(satisfacaoClinica),
          aderenciaTratamento: Math.round(aderenciaTratamento)
        },
        clinicos: { wearablesAtivos, monitoramento24h: wearablesAtivos, episodiosEpilepsia, melhoraSintomas }
      })
    } catch (_) {
      // Tabelas opcionais; manter zeros
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (analysisDropdownRef.current && !analysisDropdownRef.current.contains(e.target as Node)) {
        setAnalysisDropdownOpen(false)
      }
    }
    if (analysisDropdownOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [analysisDropdownOpen])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Mesma lógica do Terminal de Atendimento (PatientsManagement): users → users_compatible → fallback por avaliações
      let patientsData: any[] = []
      let patientIds: string[] = []

      try {
        const { data: usersDataFromUsers, error: usersError } = await supabase
          .from('users')
          .select('id, name, status')
          .in('type', ['patient', 'paciente'])
          .order('name', { ascending: true })

        if (!usersError && usersDataFromUsers) {
          patientsData = (usersDataFromUsers as any[]).filter((u: any) => u.id !== user?.id)
        }
        if (patientsData.length === 0 && usersError) {
          const { data: compatData } = await supabase
            .from('users_compatible')
            .select('id, name, status')
            .in('type', ['patient', 'paciente'])
            .order('name', { ascending: true })
          if (compatData) patientsData = (compatData as any[]).filter((u: any) => u.id !== user?.id)
        }
        // Fallback: se ainda vazio, montar lista a partir de clinical_assessments (como no Terminal)
        if (patientsData.length === 0) {
          const { data: assessments } = await supabase
            .from('clinical_assessments')
            .select('patient_id, created_at, data')
            .order('created_at', { ascending: false })
          const seen = new Set<string>()
            ; (assessments || []).forEach((a: any) => {
              if (a.patient_id && a.patient_id !== user?.id && !seen.has(a.patient_id)) {
                seen.add(a.patient_id)
                patientsData.push({
                  id: a.patient_id,
                  name: (a.data && a.data.name) || 'Paciente',
                  status: null
                })
              }
            })
        }

        patientIds = patientsData.map((p: any) => p.id)
      } catch (err) {
        console.warn('Erro ao carregar pacientes (dashboard):', err)
      }

      setLinkedPatients(patientsData.map((p: any) => ({ id: p.id, name: p.name || 'Sem nome' })))

      // Buscar agendamentos
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, appointment_date, status')
        .eq('professional_id', user?.id)

      if (appointmentsError) console.error('Erro ao buscar agendamentos:', appointmentsError)

      // Buscar relatórios clínicos
      const { data: reportsData, error: reportsError } = await supabase
        .from('clinical_reports')
        .select('id, status, created_at')
        .eq('professional_id', user?.id)

      if (reportsError) console.error('Erro ao buscar relatórios:', reportsError)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayAppointments = appointmentsData?.filter(apt => {
        const aptDate = new Date(apt.appointment_date)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate.getTime() === today.getTime()
      }) || []

      setStats({
        totalPatients: patientsData?.length || 0,
        activePatients: patientsData?.filter(p => p.status === 'ativo' || p.status === 'active').length || 0,
        totalAppointments: appointmentsData?.length || 0,
        todayAppointments: todayAppointments.length,
        totalReports: reportsData?.length || 0,
        pendingReports: reportsData?.filter(r => r.status === 'pending' || r.status === 'pendente').length || 0
      })

      // Gráficos: consultas por semana (últimas 6) e avaliações dos pacientes vinculados
      const now = new Date()
      const weekLabels: string[] = []
      const consultationsByWeek: { label: string; value: number }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i * 7)
        const weekStart = new Date(d)
        weekStart.setHours(0, 0, 0, 0)
        const day = weekStart.getDate()
        const month = weekStart.toLocaleDateString('pt-BR', { month: 'short' })
        weekLabels.push(`${day} ${month}`)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        const count = appointmentsData?.filter(apt => {
          const t = new Date(apt.appointment_date).getTime()
          return t >= weekStart.getTime() && t <= weekEnd.getTime()
        }).length ?? 0
        consultationsByWeek.push({ label: `${day} ${month}`, value: count })
      }

      let patientEvaluationsTotal = 0
      let patientEvaluationsByWeek: { label: string; value: number }[] = consultationsByWeek.map(({ label }) => ({ label, value: 0 }))
      if (patientIds.length > 0) {
        try {
          const { data: ratingsData, error: ratingsError } = await supabase
            .from('conversation_ratings')
            .select('rating, created_at')
            .in('patient_id', patientIds)
          if (ratingsError && ratingsError.code !== 'PGRST116') {
            console.warn('conversation_ratings:', ratingsError.message)
          }
          const ratings = ratingsData || []
          patientEvaluationsTotal = ratings.length
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i * 7)
            const weekStart = new Date(d)
            weekStart.setHours(0, 0, 0, 0)
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekEnd.getDate() + 6)
            weekEnd.setHours(23, 59, 59, 999)
            const count = ratings.filter(r => {
              const t = new Date(r.created_at).getTime()
              return t >= weekStart.getTime() && t <= weekEnd.getTime()
            }).length
            patientEvaluationsByWeek[5 - i] = { label: weekLabels[5 - i] ?? weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), value: count }
          }
        } catch (_) {
          // Tabela conversation_ratings pode não existir ainda; manter zeros
        }
      }

      setChartData({
        consultationsByWeek,
        patientEvaluationsTotal,
        patientEvaluationsByWeek
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const ANALYSIS_SCAN_MESSAGES = [
    'Indexando histórico clínico…',
    'Buscando consultas anteriores…',
    'Verificando próximos agendamentos…',
    'Carregando avaliação clínica…',
    'Sincronizando prescrições…',
    'Analisando padrões longitudinais…'
  ]

  const runPatientAnalysis = async () => {
    if (!selectedPatientForAnalysis || !user?.id) return
    setScanningPatientAvatarUrl(null)
    try {
      const { data: userRow } = await supabase.from('users').select('avatar_url, user_metadata').eq('id', selectedPatientForAnalysis.id).maybeSingle()
      const url = (userRow as any)?.avatar_url ?? (userRow as any)?.user_metadata?.avatar_url ?? null
      if (url) setScanningPatientAvatarUrl(url)
    } catch (_) { }
    setAnalysisScanning(true)
    setAnalysisPanelOpen(false)
    setAnalysisData(null)
    let msgIndex = 0
    setAnalysisScanMessage(ANALYSIS_SCAN_MESSAGES[0])
    const messageInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % ANALYSIS_SCAN_MESSAGES.length
      setAnalysisScanMessage(ANALYSIS_SCAN_MESSAGES[msgIndex])
    }, 400)

    const patientId = selectedPatientForAnalysis.id
    const minScanTime = 1500

    const fetchData = async () => {
      const assessmentsPromise = supabase.from('clinical_assessments').select('id, created_at, data, status').eq('patient_id', patientId).eq('doctor_id', user?.id).order('created_at', { ascending: false }).limit(10)
      let appointmentsRes = await supabase.from('appointments').select('id, appointment_date, status, notes').eq('patient_id', patientId).eq('professional_id', user?.id).order('appointment_date', { ascending: true })
      if (appointmentsRes.error) {
        appointmentsRes = await supabase.from('appointments').select('id, appointment_date, status, notes').eq('patient_id', patientId).eq('doctor_id', user?.id).order('appointment_date', { ascending: true })
      }
      let prescriptionsRes: any = { data: [] }
      try {
        prescriptionsRes = await supabase.from('v_patient_prescriptions').select('*').eq('patient_id', patientId).limit(20).order('issued_at', { ascending: false })
      } catch (err) { console.warn('Pular prescricoes', err) }

      let reportsRes: any = { data: [] }
      try {
        reportsRes = await supabase.from('clinical_reports').select('id, created_at, status, content, report_type').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(15)
      } catch (err) { console.warn('Pular relatorios', err) }

      const assessmentsRes = await assessmentsPromise
      let patientAvatarUrl: string | null = null
      try {
        const { data: userRow } = await supabase.from('users').select('avatar_url, user_metadata').eq('id', patientId).maybeSingle()
        patientAvatarUrl = (userRow as any)?.avatar_url ?? (userRow as any)?.user_metadata?.avatar_url ?? null
      } catch (_) { }
      const now = new Date()
      const appointments = (appointmentsRes?.data || []) as any[]
      const pastAppointments = appointments.filter((a: any) => new Date(a.appointment_date) < now)
      const upcomingAppointments = appointments.filter((a: any) => new Date(a.appointment_date) >= now)
      return {
        assessments: assessmentsRes.data || [],
        pastAppointments: pastAppointments.slice(-5).reverse(),
        upcomingAppointments: upcomingAppointments.slice(0, 5),
        prescriptions: (prescriptionsRes as any).data || [],
        patientReports: (reportsRes as any).data || [],
        patientAvatarUrl: patientAvatarUrl || undefined
      }
    }

    const dataPromise = fetchData()
    const timerPromise = new Promise(r => setTimeout(r, minScanTime))
    const data = await Promise.all([dataPromise, timerPromise]).then(([d]) => d)
    clearInterval(messageInterval)
    setAnalysisData(data)
    setAnalysisScanning(false)
    setScanningPatientAvatarUrl(null)
    setAnalysisPanelOpen(true)
  }

  // Silhueta humanóide (estilo Analytics e Evolução do dashboard do paciente) com avatar/inicial na cabeça
  const HumanoidAvatar = ({ avatarUrl, initial, size = 'md' }: { avatarUrl?: string | null; initial: string; size?: 'xs' | 'sm' | 'md' }) => {
    const w = size === 'xs' ? 40 : size === 'sm' ? 80 : 120
    const h = size === 'xs' ? 64 : size === 'sm' ? 128 : 192
    return (
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: w, height: h }}>
        <svg viewBox="0 0 200 320" className="w-full h-full opacity-90" aria-hidden="true">
          <defs>
            <linearGradient id="humanoidFillPro" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0.12)" />
            </linearGradient>
            <clipPath id="humanoidHeadClipPro">
              <circle cx="100" cy="48" r="28" />
            </clipPath>
          </defs>
          <g clipPath="url(#humanoidHeadClipPro)">
            {avatarUrl ? (
              <image href={avatarUrl} x="72" y="20" width="56" height="56" preserveAspectRatio="xMidYMid slice" />
            ) : (
              <>
                <circle cx="100" cy="48" r="28" fill="rgba(15,23,42,0.9)" />
                <text x="100" y="55" textAnchor="middle" fill="rgba(16,185,129,0.95)" fontSize="28" fontWeight="bold" fontFamily="system-ui">{initial}</text>
              </>
            )}
          </g>
          <circle cx="100" cy="48" r="28" fill="none" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" />
          <path d="M60 100 C60 82 78 70 100 70 C122 70 140 82 140 100 L140 166 C140 184 126 198 110 202 L110 280 C110 294 100 306 100 306 C100 306 90 294 90 280 L90 202 C74 198 60 184 60 166 Z" fill="url(#humanoidFillPro)" stroke="rgba(16,185,129,0.2)" />
          <path d="M60 114 C42 126 34 146 34 166 C34 184 44 198 58 202 L72 176 L60 114 Z" fill="url(#humanoidFillPro)" stroke="rgba(16,185,129,0.15)" />
          <path d="M140 114 C158 126 166 146 166 166 C166 184 156 198 142 202 L128 176 L140 114 Z" fill="url(#humanoidFillPro)" stroke="rgba(16,185,129,0.15)" />
          <path d="M78 206 L78 300 C78 308 84 314 92 314 L92 314" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="10" strokeLinecap="round" />
          <path d="M122 206 L122 300 C122 308 116 314 108 314 L108 314" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  const analysisFilteredPatients = analysisSearch.trim()
    ? linkedPatients.filter(p => p.name.toLowerCase().includes(analysisSearch.trim().toLowerCase()))
    : linkedPatients

  const statCards = [
    {
      id: 'patients',
      label: 'Total de Pacientes',
      value: stats.totalPatients,
      icon: Users,
      gradient: 'from-blue-600 to-blue-500',
      description: `${stats.activePatients} ativos`,
      href: '/app/clinica/profissional/pacientes'
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      value: stats.totalAppointments,
      icon: Calendar,
      gradient: 'from-emerald-600 to-emerald-500',
      description: `${stats.todayAppointments} hoje`,
      href: '/app/clinica/profissional/dashboard?section=atendimento'
    },
    {
      id: 'reports',
      label: 'Relatórios Clínicos',
      value: stats.totalReports,
      icon: FileText,
      gradient: 'from-purple-600 to-purple-500',
      description: `${stats.pendingReports} pendentes`,
      href: '/app/clinica/profissional/relatorios'
    },
    {
      id: 'activity',
      label: 'Atividade',
      value: 'Alta',
      icon: Activity,
      gradient: 'from-orange-600 to-orange-500',
      description: 'Últimos 30 dias',
      href: '/app/clinica/profissional/dashboard?section=terminal-clinico'
    }
  ]

  // Renderização baseada em Query param (section)
  const query = new URLSearchParams(location.search)
  const section = query.get('section')

  // Helper: back button shared across section views
  const SectionHeader = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
    <header className="h-14 border-b border-slate-700/50 bg-slate-800/50 flex items-center px-4 gap-3 shrink-0">
      <button onClick={() => navigate('/app/clinica/profissional/dashboard')} className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <Icon className="w-5 h-5 text-emerald-400" />
      <h1 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h1>
    </header>
  )

  if (section === 'terminal-clinico') {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col">
        <SectionHeader title="Terminal Clínico Integrado" icon={Terminal} />
        <div className="flex-1 overflow-hidden">
          <IntegratedWorkstation initialTab="patients" />
        </div>
      </div>
    )
  }

  if (section === 'atendimento') {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col">
        <SectionHeader title="Agendamentos e Atendimento" icon={Calendar} />
        <div className="flex-1 overflow-auto p-4">
          <EduardoScheduling />
        </div>
      </div>
    )
  }

  if (section === 'prescricoes') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <SectionHeader title="Prescrições" icon={FileText} />
        <div className="flex-1 overflow-auto">
          <Prescriptions />
        </div>
      </div>
    )
  }

  if (section === 'chat-profissionais') {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex flex-col">
        <SectionHeader title="Chat Profissionais" icon={MessageCircle} />
        <div className="flex-1 overflow-hidden">
          <ProfessionalChatSystem />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ background: backgroundGradient }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header — compacto, pro: avatar + nome + XP + ranking + Editar perfil */}
        <div className="mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/app/profile"
              className="relative shrink-0 rounded-full overflow-hidden ring-1 ring-white/10 hover:ring-emerald-500/30 transition-all w-10 h-10"
              title="Editar perfil"
            >
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: accentGradient }}>
                  {(user?.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center">
                <Pencil className="w-2 h-2 text-slate-400" />
              </span>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-semibold text-white tracking-tight">Meu Dashboard</h1>
                <span className="text-slate-500">·</span>
                <span className="text-sm text-slate-400 truncate">{user?.name || 'Profissional'}</span>
                <Link to="/app/profile" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0">
                  <Pencil className="w-3 h-3" /> Editar perfil
                </Link>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px]">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="font-medium text-white tabular-nums">{xp}</span>
                <span className="text-slate-500">XP</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px]">
                <Award className="w-3 h-3 text-emerald-400" />
                <span className="font-medium text-white tabular-nums">{ranking ? `#${ranking}` : '—'}</span>
                <span className="text-slate-500">ranking</span>
              </span>
            </div>
          </div>
        </div>

        {/* Carteira + Analisar Paciente — lado a lado */}
        <div className="flex flex-wrap gap-4 mb-6 items-stretch">
          {/* Carteira */}
          <div className="shrink-0">
            <Link
              to="/app/profile#carteira"
              className="group block w-[200px] rounded-xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:border-amber-500/35 hover:from-amber-500/15 hover:to-amber-600/10 transition-all shadow-lg h-full"
            >
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Carteira</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-amber-400 tabular-nums">{walletCredits}</span>
                  <span className="text-[10px] text-slate-500">créditos</span>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-slate-300">Ranking <span className="font-semibold text-white">{ranking ? `#${ranking}` : '—'}</span></span>
                </div>
              </div>
            </Link>
          </div>

          {/* Analisar Paciente — card ao lado da Carteira */}
          <section className="flex-1 min-w-0 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 flex flex-col justify-center">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              Analisar Paciente
            </h2>
            <p className="text-xs text-slate-500 mb-3">Selecione um vinculado e clique em Analisar.</p>
            <div className="flex flex-col sm:flex-row gap-3 items-start flex-wrap">
              <div className="relative w-full sm:max-w-[220px]" ref={analysisDropdownRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={analysisSearch}
                  onChange={(e) => { setAnalysisSearch(e.target.value); setAnalysisDropdownOpen(true) }}
                  onFocus={() => setAnalysisDropdownOpen(true)}
                  placeholder="Buscar ou clique para ver vinculados"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                {analysisDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/10 bg-slate-900 shadow-xl z-10 max-h-48 overflow-y-auto">
                    {analysisFilteredPatients.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-slate-500">
                        {linkedPatients.length === 0
                          ? (user as any)?.type === 'admin'
                            ? 'Nenhum paciente cadastrado na base.'
                            : 'Nenhum paciente vinculado.'
                          : 'Nenhum nome encontrado.'}
                      </div>
                    ) : (
                      <>
                        <div className="px-3 py-1.5 border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500">
                          {analysisSearch.trim() ? 'Resultados' : 'Pacientes vinculados'}
                        </div>
                        {analysisFilteredPatients.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatientForAnalysis(p)
                              setAnalysisSearch(p.name)
                              setAnalysisDropdownOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-emerald-500/20 flex items-center gap-2"
                          >
                            <span className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-200 font-semibold text-xs">
                              {p.name.charAt(0).toUpperCase()}
                            </span>
                            {p.name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {selectedPatientForAnalysis && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold">
                    {selectedPatientForAnalysis.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm text-white font-medium">{selectedPatientForAnalysis.name}</span>
                </div>
                <button
                  type="button"
                  onClick={runPatientAnalysis}
                  disabled={analysisScanning}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white text-sm font-medium flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  {analysisScanning ? 'Analisando…' : 'Analisar'}
                </button>
              </>
            )}
          </section>
        </div>

        {/* Overlay Scanner verde (Matrix) — paciente “scaneado” no centro (avatar ou inicial) */}
        {analysisScanning && selectedPatientForAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-72 h-56 rounded-2xl border-2 border-emerald-500/50 overflow-hidden bg-slate-900/95 flex flex-col items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(16,185,129,0.12)_2px,rgba(16,185,129,0.12)_4px)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent animate-pulse" />
              <div className="absolute left-0 right-0 h-0.5 bg-emerald-400/90 shadow-[0_0_16px_rgba(52,211,153,0.7)] rounded-full animate-[scanLine_1.4s_ease-in-out_infinite]" style={{ top: '35%' }} />
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-3">
                  <HumanoidAvatar
                    avatarUrl={scanningPatientAvatarUrl}
                    initial={selectedPatientForAnalysis.name.charAt(0).toUpperCase()}
                    size="md"
                  />
                </div>
                <p className="text-emerald-300 text-sm font-semibold mb-1">Carregando contexto clínico</p>
                <p className="text-emerald-400 text-xs">{analysisScanMessage}</p>
              </div>
            </div>
            <style>{`
              @keyframes scanLine {
                0%, 100% { transform: translateY(-40px); opacity: 0.4; }
                50% { transform: translateY(40px); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Painel lateral analítico do paciente — avatar do paciente refletido no card */}
        {analysisPanelOpen && selectedPatientForAnalysis && analysisData && (
          <div className="fixed top-[8vh] bottom-0 right-0 w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl z-40 flex flex-col rounded-l-xl">
            <div className="py-2.5 px-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900 relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <HumanoidAvatar
                  avatarUrl={analysisData.patientAvatarUrl}
                  initial={selectedPatientForAnalysis.name.charAt(0).toUpperCase()}
                  size="xs"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold truncate text-sm">{selectedPatientForAnalysis.name}</h3>
                  <p className="text-[11px] text-slate-400">Contexto clínico</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setAnalysisPanelOpen(false); setSelectedPatientForAnalysis(null); setAnalysisData(null) }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
              {/* Avaliação clínica */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAnalysisPanelCollapsed(prev => ({ ...prev, assessment: !prev.assessment }))}
                  className="w-full px-3 py-2 flex items-center justify-between text-left"
                >
                  <span className="text-xs font-medium text-white flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    Avaliação clínica
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${analysisPanelCollapsed.assessment ? '' : 'rotate-180'}`} />
                </button>
                {!analysisPanelCollapsed.assessment && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {analysisData.assessments.length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhuma avaliação registrada.</p>
                    ) : (
                      <>
                        <p className="text-xs text-slate-400">Última: {new Date(analysisData.assessments[0].created_at).toLocaleDateString('pt-BR')}</p>
                        <Link
                          to={`/app/clinica/profissional/pacientes?patientId=${selectedPatientForAnalysis.id}`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Ver avaliação completa
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Consultas anteriores */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAnalysisPanelCollapsed(prev => ({ ...prev, past: !prev.past }))}
                  className="w-full px-3 py-2 flex items-center justify-between text-left"
                >
                  <span className="text-xs font-medium text-white flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Consultas anteriores
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${analysisPanelCollapsed.past ? '' : 'rotate-180'}`} />
                </button>
                {!analysisPanelCollapsed.past && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {analysisData.pastAppointments.length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhuma consulta anterior.</p>
                    ) : (
                      analysisData.pastAppointments.map((apt: any) => (
                        <div key={apt.id} className="text-xs text-slate-300">
                          {new Date(apt.appointment_date).toLocaleDateString('pt-BR')} — {apt.status || '—'}
                        </div>
                      ))
                    )}
                    <Link
                      to="/app/clinica/profissional/dashboard?section=atendimento"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Histórico completo
                    </Link>
                  </div>
                )}
              </div>
              {/* Próximas consultas */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAnalysisPanelCollapsed(prev => ({ ...prev, upcoming: !prev.upcoming }))}
                  className="w-full px-3 py-2 flex items-center justify-between text-left"
                >
                  <span className="text-xs font-medium text-white flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Próximas consultas
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${analysisPanelCollapsed.upcoming ? '' : 'rotate-180'}`} />
                </button>
                {!analysisPanelCollapsed.upcoming && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {analysisData.upcomingAppointments.length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhuma consulta agendada.</p>
                    ) : (
                      analysisData.upcomingAppointments.map((apt: any) => (
                        <div key={apt.id} className="text-xs text-slate-300">
                          {new Date(apt.appointment_date).toLocaleString('pt-BR')} — {apt.status || '—'}
                        </div>
                      ))
                    )}
                    <Link
                      to="/app/clinica/profissional/dashboard?section=atendimento"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Ver agenda
                    </Link>
                  </div>
                )}
              </div>
              {/* Prescrições */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAnalysisPanelCollapsed(prev => ({ ...prev, prescriptions: !prev.prescriptions }))}
                  className="w-full px-3 py-2 flex items-center justify-between text-left"
                >
                  <span className="text-xs font-medium text-white flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    Prescrições
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${analysisPanelCollapsed.prescriptions ? '' : 'rotate-180'}`} />
                </button>
                {!analysisPanelCollapsed.prescriptions && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {analysisData.prescriptions.length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhuma prescrição ativa.</p>
                    ) : (
                      analysisData.prescriptions.slice(0, 3).map((px: any) => (
                        <div key={px.id} className="text-xs text-slate-300">
                          {px.title || 'Prescrição'} — {px.status || '—'}
                        </div>
                      ))
                    )}
                    <Link
                      to="/app/clinica/profissional/dashboard?section=prescricoes"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Ver prescrições
                    </Link>
                  </div>
                )}
              </div>

              {/* Evolução e gráficos do paciente — quadro completo */}
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAnalysisPanelCollapsed(prev => ({ ...prev, evolution: !prev.evolution }))}
                  className="w-full px-3 py-2 flex items-center justify-between text-left"
                >
                  <span className="text-xs font-medium text-white flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    Evolução e gráficos
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${analysisPanelCollapsed.evolution ? '' : 'rotate-180'}`} />
                </button>
                {!analysisPanelCollapsed.evolution && (
                  <div className="px-3 pb-3 space-y-2.5">
                    <p className="text-[11px] text-slate-400">Indicadores e relatórios do paciente.</p>
                    {analysisData.patientReports && analysisData.patientReports.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(() => {
                            const last = analysisData.patientReports[0]
                            const scores = (last as any)?.content?.scores
                            const items = scores ? [
                              { label: 'Score clínico', value: scores.clinical_score ?? '—', color: 'text-emerald-400' },
                              { label: 'Qualidade de vida', value: scores.quality_of_life ?? '—', color: 'text-blue-400' },
                              { label: 'Adesão', value: scores.treatment_adherence ?? '—', color: 'text-amber-400' },
                              { label: 'Sintomas', value: scores.symptom_improvement ?? '—', color: 'text-rose-400' }
                            ] : []
                            return items.length ? items.map((item, i) => (
                              <div key={i} className="rounded border border-white/5 bg-white/[0.02] px-2 py-1.5">
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                                <p className={`text-sm font-bold tabular-nums ${item.color}`}>{typeof item.value === 'number' ? item.value + '%' : item.value}</p>
                              </div>
                            )) : null
                          })()}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Últimos relatórios</p>
                          {analysisData.patientReports.slice(0, 5).map((r: any) => (
                            <div key={r.id} className="flex items-center justify-between text-[11px] text-slate-300 py-0.5 border-b border-white/5 last:border-0">
                              <span>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                              <span className="text-slate-500">{r.report_type || r.status || '—'}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                          <span className="text-[11px] text-slate-400">{analysisData.patientReports.length} relatório(s)</span>
                          <Link
                            to={`/app/clinica/profissional/pacientes?patientId=${selectedPatientForAnalysis.id}`}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            Ver evolução completa
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-slate-500">Nenhum relatório com indicadores ainda.</p>
                        <Link
                          to={`/app/clinica/profissional/pacientes?patientId=${selectedPatientForAnalysis.id}`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          Abrir prontuário e evolução
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KPIs — linha compacta, clicáveis */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.id}
                to={card.href}
                className="rounded-lg px-4 py-3 border border-white/5 bg-white/[0.03] transition-all hover:bg-white/[0.08] hover:border-emerald-500/20 hover:scale-[1.02] cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${card.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="text-lg font-semibold text-white tabular-nums">{card.value}</p>
                    <p className="text-xs text-slate-400 truncate">{card.label}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{card.description}</p>
              </Link>
            )
          })}
        </div>

        {/* Gráficos estatísticos — consultas feitas + avaliações dos pacientes vinculados (gamificado) */}
        <section className="mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4 sm:p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Estatísticas e evolução
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultas feitas (últimas 6 semanas) */}
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Consultas feitas
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">últimas 6 semanas</span>
              </div>
              {loading ? (
                <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Carregando...</div>
              ) : (
                <div className="flex items-end justify-between gap-1 h-28">
                  {chartData.consultationsByWeek.map((item, idx) => {
                    const max = Math.max(1, ...chartData.consultationsByWeek.map((x) => x.value))
                    const height = max ? Math.round((item.value / max) * 100) : 0
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md min-h-[4px] transition-all duration-500 bg-gradient-to-t from-emerald-600 to-emerald-400"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${item.value} consulta(s)`}
                        />
                        <span className="text-[10px] text-slate-500 truncate w-full text-center">{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Avaliações feitas pelos pacientes vinculados */}
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  Avaliações dos meus pacientes
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">0–5 estrelas no app</span>
              </div>
              {loading ? (
                <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Carregando...</div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-amber-400 tabular-nums">{chartData.patientEvaluationsTotal}</span>
                    <span className="text-sm text-slate-400">avaliações completas</span>
                  </div>
                  <div className="flex items-end justify-between gap-1 h-20">
                    {chartData.patientEvaluationsByWeek.map((item, idx) => {
                      const max = Math.max(1, ...chartData.patientEvaluationsByWeek.map((x) => x.value))
                      const height = max ? Math.round((item.value / max) * 100) : 0
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                          <div
                            className="w-full rounded-t-md min-h-[4px] transition-all duration-500 bg-gradient-to-t from-amber-600 to-amber-400"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${item.value} avaliação(ões)`}
                          />
                          <span className="text-[9px] text-slate-500 truncate w-full text-center">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Dashboard unificado — Três Camadas de KPIs + Eixos (sem duplicar Ações Rápidas / Recursos) */}
        <section className="mt-8 pt-8 border-t border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">Três Camadas de KPIs</h2>
          <div className="space-y-5 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">Camada Administrativa</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total de Pacientes', value: kpisUnified.administrativos.totalPacientes, sub: 'Pacientes neurológicos' },
                  { label: 'Avaliações Completas', value: kpisUnified.administrativos.avaliacoesCompletas, sub: 'Protocolos IMRE' },
                  { label: 'Protocolos IMRE', value: kpisUnified.administrativos.protocolosIMRE, sub: 'Avaliações completas' },
                  { label: 'Respondedores TEZ', value: kpisUnified.administrativos.respondedoresTEZ, sub: 'Pacientes com melhora' }
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-4 text-white" style={secondarySurfaceStyle}>
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className="text-xl font-bold text-white">{item.value || '—'}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">Camada Semântica</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Qualidade da Escuta', value: kpisUnified.semanticos.qualidadeEscuta, sub: 'Análise semântica' },
                  { label: 'Engajamento', value: kpisUnified.semanticos.engajamentoPaciente, sub: 'Participação ativa' },
                  { label: 'Satisfação Clínica', value: kpisUnified.semanticos.satisfacaoClinica, sub: 'Avaliação do paciente' },
                  { label: 'Aderência ao Tratamento', value: kpisUnified.semanticos.aderenciaTratamento, sub: 'Compliance' }
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-4 text-white" style={secondarySurfaceStyle}>
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className="text-xl font-bold text-white">{item.value ? `${item.value}%` : '—'}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">Camada Clínica</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Wearables Ativos', value: kpisUnified.clinicos.wearablesAtivos, sub: 'Monitoramento 24h', suffix: '' },
                  { label: 'Monitoramento 24h', value: kpisUnified.clinicos.monitoramento24h, sub: 'Pacientes monitorados', suffix: '' },
                  { label: 'Episódios Epilepsia', value: kpisUnified.clinicos.episodiosEpilepsia, sub: 'Registrados', suffix: '' },
                  { label: 'Melhora de Sintomas', value: kpisUnified.clinicos.melhoraSintomas, sub: 'Pacientes melhorando', suffix: '%' }
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-4 text-white" style={secondarySurfaceStyle}>
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className="text-xl font-bold text-white">{item.value ? `${item.value}${item.suffix}` : '—'}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">Eixo Clínica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            <Link to="/app/clinica/profissional/pacientes" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Gestão de Pacientes</h3>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Prontuário eletrônico</p>
            </Link>
            <Link to="/app/clinica/profissional/dashboard?section=atendimento" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Agendamentos</h3>
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Agenda completa</p>
            </Link>
            <Link to="/app/ensino/profissional/arte-entrevista-clinica" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left border-2 border-emerald-500/30" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Arte da Entrevista Clínica</h3>
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Metodologia AEC</p>
            </Link>
            <Link to="/app/clinica/profissional/dashboard?section=atendimento" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">KPIs TEA</h3>
                <Brain className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Monitoramento neurológico</p>
            </Link>
            <Link to="/app/clinica/profissional/relatorios" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Relatórios Clínicos</h3>
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Relatórios da IA</p>
            </Link>
            <Link to="/app/clinica/profissional/dashboard?section=chat-profissionais" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Chat com Equipe</h3>
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Comunicação entre profissionais</p>
            </Link>
            <Link to="/app/clinica/profissional/dashboard?section=prescricoes" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Prescrições Integrativas</h3>
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">5 racionalidades</p>
            </Link>
            {isEduardoDashboard && (
              <button type="button" onClick={() => navigate('/app/clinica/profissional/dashboard?section=atendimento')} className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left bg-gradient-to-r from-blue-600 to-indigo-600 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Acesso Direto</span>
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-bold text-white">Dr. Ricardo Valença</h4>
                <p className="text-xs text-blue-100/90">Comunicação entre consultórios</p>
              </button>
            )}
            <Link to="/app/clinica/profissional/dashboard?section=terminal-clinico" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left bg-gradient-to-br from-cyan-600 to-emerald-600 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Gestão</span>
                <Terminal className="w-5 h-5 text-emerald-200" />
              </div>
              <h4 className="text-sm font-bold text-white">Terminal Clínico</h4>
              <p className="text-xs text-emerald-100/90">Governança, Relatórios, Conhecimento, Fórum e Paciente em foco</p>
            </Link>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">Eixo Ensino</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <Link to="/app/ensino/profissional/dashboard" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Gestão de Ensino</h3>
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Gerenciamento de cursos</p>
            </Link>
            <Link to="/app/ensino/profissional/pos-graduacao-cannabis" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left border-2 border-emerald-500/30" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Pós-graduação Cannabis Medicinal</h3>
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Coordenador: Dr. Eduardo Faveret</p>
            </Link>
            <Link to="/app/ensino/profissional/gestao-alunos" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Gestão de Alunos</h3>
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Gerenciamento de estudantes</p>
            </Link>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">Eixo Pesquisa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/app/pesquisa/profissional/dashboard" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-slate-500 uppercase">Resumo</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Resumo Administrativo</h3>
              <p className="text-xs text-slate-400 mt-1">Visão consolidada da plataforma</p>
            </Link>
            <Link to="/app/library?module=research" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-slate-500 uppercase">Documentos</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Conhecimento da IA Residente</h3>
              <p className="text-xs text-slate-400 mt-1">Protocolos e manuais</p>
            </Link>
            <Link to="/app/pesquisa/profissional/cidade-amiga-dos-rins" className="rounded-xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all text-left bg-gradient-to-r from-cyan-600 to-blue-600 border-2 border-cyan-400/50">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-white/90" />
                <span className="text-xs text-white/70 uppercase">Projeto</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Cidade Amiga dos Rins</h3>
              <p className="text-xs text-white/75 mt-1">Clínica, ensino e pesquisa</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProfessionalMyDashboard

