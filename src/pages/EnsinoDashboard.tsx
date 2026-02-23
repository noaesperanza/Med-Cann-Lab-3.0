import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Heart,
  Brain,
  MessageCircle,
  Calendar,
  TrendingUp,
  Clock,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  Share2,
  Target,
  Award,
  BarChart3,
  Activity,
  Users,
  FileText,
  X,
  Send
} from 'lucide-react'
import { useNoa } from '../contexts/NoaContext'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useDashboardTriggers } from '../contexts/DashboardTriggersContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import NoaAnimatedAvatar from '../components/NoaAnimatedAvatar'
import AlunoDashboard from './AlunoDashboard'
import {
  backgroundGradient,
  surfaceStyle,
  secondarySurfaceStyle,
  cardStyle,
  accentGradient,
  secondaryGradient,
  goldenGradient
} from '../constants/designSystem'

type EnsinoSection = 'dashboard' | 'aulas' | 'biblioteca' | 'avaliacao' | 'newsletter' | 'mentoria'

// Função para validar se a data é válida para o mentor
const isValidDateForMentor = (dateString: string, mentorId: string): boolean => {
  const date = new Date(dateString)
  const dayOfWeek = date.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  if (mentorId === 'ricardo') {
    // Dr. Ricardo Valença: Terça (2), Quarta (3), Quinta (4)
    return dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4
  } else if (mentorId === 'eduardo') {
    // Dr. Eduardo Faveret: Terça (2)
    return dayOfWeek === 2
  }

  return true // Para outros mentores (ex: IA Nôa)
}

// Função para obter horários disponíveis do mentor
const getAvailableTimes = (mentorId: string): string[] => {
  if (mentorId === 'ricardo') {
    // Dr. Ricardo Valença: 14h às 20h
    const times: string[] = []
    for (let hour = 14; hour < 20; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`)
      times.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return times
  } else if (mentorId === 'eduardo') {
    // Dr. Eduardo Faveret: 19h às 21h
    return ['19:00', '19:30', '20:00', '20:30']
  }

  return [] // Para outros mentores
}

const EnsinoDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isOpen, toggleChat, messages, isTyping, isListening, isSpeaking, sendMessage } = useNoa()
  const { openChat: openNoaChat, closeChat, isOpen: isNoaOpen } = useNoaPlatform()
  const { setDashboardTriggers } = useDashboardTriggers()
  const [inputMessage, setInputMessage] = useState('')
  const { user } = useAuth()

  // Estados para solicitação de mentoria
  const [selectedMentor, setSelectedMentor] = useState<typeof mentorshipPrograms[0] | null>(null)
  const [mentorshipDate, setMentorshipDate] = useState<string>('')
  const [mentorshipTime, setMentorshipTime] = useState<string>('')
  const [mentorshipMessage, setMentorshipMessage] = useState<string>('')
  const [isSubmittingMentorship, setIsSubmittingMentorship] = useState(false)

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Navigation handlers
  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleContinueLearning = () => {
    // Navigate to the main course
    navigate('/app/ensino/profissional/pos-graduacao-cannabis')
  }

  const handleOpenModule = (moduleId: number) => {
    setSelectedModule(moduleId)
  }

  const handleOpenLesson = (lessonId: number) => {
    setSelectedLesson(lessonId)
  }

  const handleJoinClass = (courseTitle: string) => {
    if (courseTitle.includes('Cannabis Medicinal') || courseTitle.includes('Pós-Graduação')) {
      navigate('/app/ensino/profissional/pos-graduacao-cannabis')
    } else if (courseTitle.includes('Arte da Entrevista') || courseTitle.includes('Entrevista Clínica') || courseTitle.includes('AEC')) {
      navigate('/app/arte-entrevista-clinica')
    } else if (courseTitle.includes('IMRE')) {
      navigate('/app/arte-entrevista-clinica')
    } else {
      navigate('/app/ensino/profissional/pos-graduacao-cannabis')
    }
  }

  const courseModules = [
    {
      id: 1,
      title: 'Introdução à Cannabis Medicinal',
      duration: '8h',
      description: 'Fundamentos históricos, legais e científicos da cannabis medicinal',
      lessons: 4,
      completed: 4,
      color: 'from-green-500 to-emerald-600',
      status: 'Concluído'
    },
    {
      id: 2,
      title: 'Farmacologia e Biologia da Cannabis',
      duration: '12h',
      description: 'Mecanismos de ação, receptores e sistemas endocanabinoides',
      lessons: 6,
      completed: 2,
      color: 'from-emerald-500 to-green-600',
      status: 'Em Andamento'
    },
    {
      id: 3,
      title: 'Aspectos Legais e Éticos',
      duration: '6h',
      description: 'Regulamentação, prescrição e aspectos éticos do uso medicinal',
      lessons: 3,
      completed: 0,
      color: 'from-green-600 to-emerald-700',
      status: 'Pendente'
    },
    {
      id: 4,
      title: 'Aplicações Clínicas e Protocolos',
      duration: '15h',
      description: 'Indicações clínicas, protocolos de tratamento e monitoramento',
      lessons: 8,
      completed: 0,
      color: 'from-teal-600 to-green-700',
      status: 'Pendente'
    },
    {
      id: 5,
      title: 'Avaliação e Monitoramento de Pacientes',
      duration: '8h',
      description: 'Ferramentas de avaliação, acompanhamento e ajuste de protocolos',
      lessons: 4,
      completed: 0,
      color: 'from-teal-500 to-green-500',
      status: 'Pendente'
    },
    {
      id: 6,
      title: 'Estudos de Caso e Práticas Clínicas',
      duration: '10h',
      description: 'Análise de casos reais e simulações práticas',
      lessons: 5,
      completed: 0,
      color: 'from-emerald-600 to-teal-700',
      status: 'Pendente'
    },
    {
      id: 7,
      title: 'Pesquisa Científica e Produção de Artigos',
      duration: '6h',
      description: 'Metodologia de pesquisa e publicação científica',
      lessons: 3,
      completed: 0,
      color: 'from-green-700 to-emerald-800',
      status: 'Pendente'
    },
    {
      id: 8,
      title: 'Avaliação Final e Certificação',
      duration: '5h',
      description: 'Prova final e obtenção do certificado',
      lessons: 2,
      completed: 0,
      color: 'from-teal-500 to-green-600',
      status: 'Pendente'
    }
  ]

  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<EnsinoSection>('dashboard')

  const sectionParamMap = useMemo<Record<string, EnsinoSection>>(() => ({
    aulas: 'aulas',
    biblioteca: 'biblioteca',
    avaliacao: 'avaliacao',
    newsletter: 'newsletter',
    'chat-profissionais': 'mentoria'
  }), [])

  useEffect(() => {
    const sectionParam = searchParams.get('section')
    if (sectionParam && sectionParamMap[sectionParam]) {
      const normalized = sectionParamMap[sectionParam]
      if (normalized !== activeSection) {
        setActiveSection(normalized)
      }
      return
    }

    if (!sectionParam && activeSection !== 'dashboard' && location.pathname.includes('/app/ensino')) {
      setActiveSection('dashboard')
    }
  }, [searchParams, sectionParamMap, activeSection, location.pathname])

  const updateSectionParam = (section: EnsinoSection) => {
    const newParams = new URLSearchParams(searchParams)
    if (section === 'dashboard') {
      newParams.delete('section')
    } else {
      const paramValue = section === 'mentoria' ? 'chat-profissionais' : section
      newParams.set('section', paramValue)
    }
    setSearchParams(newParams, { replace: true })
  }

  const handleSectionChange = (section: EnsinoSection) => {
    setActiveSection(section)
    updateSectionParam(section)
  }

  const handleSectionChangeRef = useRef(handleSectionChange)
  handleSectionChangeRef.current = handleSectionChange

  // Header triggers (cards por usabilidade do perfil ensino) + cérebro Nôa (ref evita loop de setState)
  const ensinoTriggerOptions: { id: EnsinoSection; label: string; icon: typeof GraduationCap }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
    { id: 'aulas', label: 'Aulas', icon: BookOpen },
    { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
    { id: 'avaliacao', label: 'Avaliação', icon: Award },
    { id: 'newsletter', label: 'Newsletter', icon: MessageCircle },
    { id: 'mentoria', label: 'Mentoria', icon: Users }
  ]
  useEffect(() => {
    setDashboardTriggers({
      options: ensinoTriggerOptions.map(o => ({ id: o.id, label: o.label, icon: o.icon })),
      activeId: activeSection,
      onChange: (id) => handleSectionChangeRef.current(id as EnsinoSection),
      onBrainClick: () => { if (isNoaOpen) closeChat(); else openNoaChat() }
    })
    return () => setDashboardTriggers(null)
  }, [activeSection, openNoaChat, closeChat, isNoaOpen, setDashboardTriggers])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'text-emerald-400'
      case 'Concluído': return 'text-green-400'
      case 'Pendente': return 'text-teal-400'
      case 'Aguardando Inscrição': return 'text-green-300'
      default: return 'text-slate-400'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-emerald-500'
    return 'bg-teal-500'
  }

  const libraryCollections = [
    {
      id: 'manual-cannabis',
      title: 'Manual Clínico de Cannabis Medicinal',
      description: 'Protocolos clínicos, interações medicamentosas e diretrizes de prescrição.',
      format: 'PDF • 86 páginas',
      highlight: 'Atualizado em outubro/2025',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'biblioteca-aec',
      title: 'Coleção Arte da Entrevista Clínica',
      description: 'Casos clínicos, roteiros de simulação e guias de supervisão formativa.',
      format: 'Toolkit • 12 roteiros',
      highlight: 'Inclui vídeos comentados',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'referencias-nefro',
      title: 'Referências em Nefrologia Integrativa',
      description: 'Estudos, biomarcadores e guidelines combinando nefrologia e cannabis.',
      format: 'Base científica • 48 artigos',
      highlight: 'Curadoria Dr. Ricardo Valença',
      color: 'from-green-600 to-emerald-700'
    }
  ]

  const evaluationInstruments = [
    {
      id: 'aec-rubric',
      title: 'Rubrica AEC 360º',
      description: 'Avaliação triaxial da entrevista clínica com critérios de comunicação e decisão.',
      status: 'Disponível',
      participants: 128,
      borderColor: 'rgba(16, 185, 129, 0.45)'
    },
    {
      id: 'case-evaluation',
      title: 'Avaliação de Casos Clínicos',
      description: 'Instrumento para feedback estruturado em estudos de caso e role-playing.',
      status: 'Em andamento',
      participants: 94,
      borderColor: 'rgba(59, 130, 246, 0.45)'
    },
    {
      id: 'portfolio',
      title: 'Portfolio Reflexivo',
      description: 'Registro longitudinal de competências clínicas com acompanhamento de mentores.',
      status: 'Aberto',
      participants: 76,
      borderColor: 'rgba(168, 85, 247, 0.45)'
    }
  ]

  const mentorshipPrograms = [
    {
      id: 'ricardo',
      mentor: 'Dr. Ricardo Valença',
      role: 'Coordenação Arte da Entrevista Clínica',
      availability: 'Terça a Quinta-feira • 14h às 20h',
      channel: 'Zoom • Sala LabPEC',
      focus: 'Supervisão de entrevistas e projetos integradores'
    },
    {
      id: 'eduardo',
      mentor: 'Dr. Eduardo Faveret',
      role: 'Direção Acadêmica Cannabis & Nefrologia',
      availability: 'Terças • 19h às 21h',
      channel: 'Teams • Sala MedCannLab',
      focus: 'Protocolos clínicos, farmacologia e monitoramento renal'
    },
    {
      id: 'noa',
      mentor: 'IA Nôa Esperança',
      role: 'Tutoria avançada com IA',
      availability: 'Disponível 24h',
      channel: 'Chat integrado na plataforma',
      focus: 'Revisão de conteúdo, quizzes adaptativos e feedback imediato'
    }
  ]


  const newsletterUpdates = [
    {
      id: 'evento-sep',
      title: 'Seminário Internacional de Cannabis & Nefrologia',
      date: '20 de setembro de 2025',
      category: 'Evento',
      description: 'Encontro com participação de 12 especialistas internacionais, estudos de caso e demonstração da metodologia AEC aplicada à nefrologia.'
    },
    {
      id: 'bootcamp',
      title: 'Bootcamp LabPEC – Role Playing Clínico',
      date: 'Início em 05 de outubro de 2025',
      category: 'Mentoria',
      description: 'Ciclo intensivo de simulações com feedback estrutural do corpo docente e análise automática da IA Nôa Esperança.'
    },
    {
      id: 'publicacao',
      title: 'Publicação destacada na Revista Brasileira de Nefrologia',
      date: 'Setembro de 2025',
      category: 'Pesquisa',
      description: 'Artigo sobre impacto da cannabis medicinal em pacientes com nefropatia diabética produzido pelo MedCannLab.'
    }
  ]

  // highlightGradient específico desta página (não existe no designSystem)
  const highlightGradient = 'linear-gradient(135deg, rgba(0,193,106,0.22) 0%, rgba(16,49,91,0.38) 55%, rgba(7,22,41,0.82) 100%)'

  const navButtonBase = 'flex items-center space-x-1 md:space-x-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 transition-all text-xs md:text-sm rounded-lg font-medium'

  const getNavButtonStyle = (section?: EnsinoSection) => {
    const isActive = section ? activeSection === section : false
    return {
      className: `${navButtonBase} ${isActive ? 'text-white shadow-lg' : 'text-[#C8D6E5] hover:text-white'}`,
      style: isActive
        ? { background: accentGradient, border: '1px solid rgba(0,193,106,0.35)' }
        : { background: 'rgba(12,34,54,0.55)', border: '1px solid rgba(0,193,106,0.08)' }
    }
  }

  const navStyles = {
    dashboard: getNavButtonStyle('dashboard'),
    aulas: getNavButtonStyle('aulas'),
    default: getNavButtonStyle()
  }

  // Handler para solicitar mentoria
  const handleRequestMentorship = (program: typeof mentorshipPrograms[0]) => {
    if (program.id === 'noa') {
      // Para IA Nôa Esperança, abrir chat diretamente
      toggleChat()
    } else {
      // Para mentores humanos, abrir modal de agendamento
      setSelectedMentor(program)
      setMentorshipDate('')
      setMentorshipTime('')
      setMentorshipMessage('')
    }
  }

  // Handler para enviar solicitação de mentoria
  const handleSubmitMentorship = async () => {
    if (!selectedMentor || !mentorshipDate || !mentorshipTime || !user) return

    setIsSubmittingMentorship(true)
    try {
      // Criar agendamento no Supabase
      const { data: appointment, error } = await (supabase as any)
        .from('appointments')
        .insert({
          title: 'Solicitação de Mentoria',
          doctor_id: selectedMentor.id === 'ricardo' ? 'ricardo-valenca' : 'eduardo-faveret',
          date: mentorshipDate,
          time: mentorshipTime,
          type: 'mentorship',
          status: 'pending',
          notes: mentorshipMessage || `Solicitação de mentoria com ${selectedMentor.mentor}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Criar notificação
      await (supabase as any)
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'mentorship_request',
          title: 'Solicitação de Mentoria Enviada',
          message: `Sua solicitação de mentoria com ${selectedMentor.mentor} foi enviada com sucesso.`,
          data: { appointment_id: appointment.id },
          created_at: new Date().toISOString()
        })

      alert('Solicitação de mentoria enviada com sucesso!')
      setSelectedMentor(null)
      setMentorshipDate('')
      setMentorshipTime('')
      setMentorshipMessage('')
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error)
      alert(`Erro ao enviar solicitação: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setIsSubmittingMentorship(false)
    }
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: backgroundGradient }}
      data-page="ensino-dashboard"
    >
      {/* Header */}
      <div
        className="p-3 md:p-4 lg:p-6"
        style={{ background: 'linear-gradient(135deg, rgba(10,25,47,0.96) 0%, rgba(26,54,93,0.92) 55%, rgba(45,90,61,0.9) 100%)', borderBottom: '1px solid rgba(0,193,106,0.18)' }}
      >
        <div className="flex items-center justify-between stack-tablet">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1 stack-mobile">
            <button
              onClick={() => handleNavigate('/app/dashboard')}
              className="flex items-center space-x-1 md:space-x-2 text-slate-300 hover:text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline text-sm md:text-base">Voltar</span>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">🎓 Gestão de Ensino</h1>
              <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Gerenciamento de cursos, alunos e materiais educacionais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Horizontal */}
      <div
        className="p-2 md:p-3 lg:p-4"
        style={{ background: 'rgba(12, 31, 54, 0.85)', borderBottom: '1px solid rgba(19, 68, 86, 0.6)' }}
      >
        <nav className="flex flex-wrap gap-1 md:gap-2 justify-center">
          <button
            onClick={() => {
              handleSectionChange('dashboard')
              handleNavigate('/app/ensino/aluno/dashboard')
            }}
            className={navStyles.dashboard.className}
            style={navStyles.dashboard.style}
          >
            <GraduationCap className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">🎓 Dashboard do Aluno</span>
          </button>
          <button
            onClick={() => handleSectionChange('aulas')}
            className={navStyles.aulas.className}
            style={navStyles.aulas.style}
          >
            <GraduationCap className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">📚 Cursos</span>
          </button>
          <button
            onClick={() => handleNavigate('/app/ensino/profissional/gestao-alunos')}
            className={navStyles.default.className}
            style={navStyles.default.style}
          >
            <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">👥 Gestão de Alunos</span>
          </button>
          <button
            onClick={() => handleNavigate('/app/ensino/profissional/preparacao-aulas')}
            className={navStyles.default.className}
            style={navStyles.default.style}
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">📝 Ferramentas</span>
          </button>
          <button
            onClick={() => handleNavigate('/app/library')}
            className={navStyles.default.className}
            style={navStyles.default.style}
          >
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">📚 Biblioteca</span>
          </button>
          <button
            onClick={() => handleNavigate('/app/ensino/profissional/dashboard')}
            className={navStyles.default.className}
            style={navStyles.default.style}
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">📅 Calendário</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-2 md:p-4 lg:p-6 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Dashboard do Aluno */}
          {activeSection === 'dashboard' && (
            <div className="mb-4 md:mb-6 lg:mb-8 w-full overflow-x-hidden">
              <AlunoDashboard />
            </div>
          )}

          {/* Cursos Disponíveis */}
          {activeSection === 'aulas' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 lg:mb-8 w-full overflow-x-hidden">
                {/* Curso Pós-Graduação Cannabis Medicinal */}
                <div
                  onClick={() => handleJoinClass('Pós-Graduação Cannabis Medicinal')}
                  className="rounded-2xl border border-[#00C16A]/20 bg-gradient-to-br from-[#0A192F] via-[#102C45] to-[#1F4B38] p-4 md:p-5 lg:p-6 shadow-xl cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all overflow-hidden w-full max-w-full"
                >
                  <div className="flex items-center justify-between mb-3 md:mb-4 gap-2 stack-mobile">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white break-words flex-1 min-w-0">🌿 Pós-Graduação Cannabis Medicinal</h3>
                    <GraduationCap className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-emerald-400 flex-shrink-0" />
                  </div>
                  <p className="text-slate-300 mb-4 break-words">
                    Curso completo de cannabis medicinal com metodologia prática e casos clínicos reais.
                    Desenvolvido pelo Dr. Eduardo Faveret, especialista em medicina integrativa.
                  </p>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-slate-400 mb-4">
                    <span className="whitespace-nowrap">Dr. Eduardo Faveret</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">360 horas</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">1247 alunos</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">⭐ 4.9</span>
                  </div>
                  <button
                    className="w-full text-white px-6 py-3 rounded-lg font-semibold transition-transform transform hover:scale-[1.02]"
                    style={{ background: accentGradient }}
                  >
                    Acessar Curso
                  </button>
                </div>

                {/* Curso Arte da Entrevista Clínica */}
                <div
                  onClick={() => handleJoinClass('Arte da Entrevista Clínica')}
                  className="rounded-2xl border border-[#00C16A]/20 bg-gradient-to-br from-[#0A192F] via-[#102C45] to-[#1F4B38] p-4 md:p-5 lg:p-6 shadow-xl cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all overflow-hidden w-full max-w-full"
                >
                  <div className="flex items-center justify-between mb-3 md:mb-4 gap-2 stack-mobile">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white break-words flex-1 min-w-0">🎭 Arte da Entrevista Clínica</h3>
                    <Heart className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  </div>
                  <p className="text-slate-300 mb-4 break-words">
                    Metodologia completa de entrevista clínica aplicada à Cannabis Medicinal.
                    Desenvolva habilidades de comunicação e avaliação clínica.
                  </p>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-slate-400 mb-4">
                    <span className="whitespace-nowrap">Dr. Ricardo Valença</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">40 horas</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">⭐ 5.0</span>
                  </div>
                  <button
                    className="w-full text-white px-6 py-3 rounded-lg font-semibold transition-transform transform hover:scale-[1.02]"
                    style={{ background: accentGradient }}
                  >
                    Acessar Curso
                  </button>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="rounded-xl p-4 md:p-6 overflow-hidden w-full max-w-full" style={secondarySurfaceStyle}>
                <h3 className="text-xl font-semibold text-white mb-4 break-words">Informações sobre os Cursos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-x-hidden">
                  <div className="rounded-lg p-4 overflow-hidden w-full max-w-full" style={cardStyle}>
                    <h4 className="font-semibold text-white mb-2 break-words">🌿 Pós-Graduação Cannabis Medicinal</h4>
                    <p className="text-slate-200 text-sm mb-2 break-words">
                      Programa completo de especialização em Cannabis Medicinal com metodologia prática
                      e casos clínicos reais desenvolvidos pelo Dr. Eduardo Faveret.
                    </p>
                    <p className="text-slate-300 text-xs break-words">Inclui: Certificação, casos práticos, comunidade de alunos</p>
                  </div>
                  <div className="rounded-lg p-4 overflow-hidden w-full max-w-full" style={cardStyle}>
                    <h4 className="font-semibold text-white mb-2 break-words">🎭 Arte da Entrevista Clínica</h4>
                    <p className="text-slate-200 text-sm mb-2 break-words">
                      Metodologia desenvolvida pelo Dr. Ricardo Valença para entrevistas clínicas eficazes,
                      com foco em comunicação empática e avaliação completa do paciente.
                    </p>
                    <p className="text-slate-300 text-xs break-words">Inclui: Módulos práticos, casos clínicos, certificação</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Biblioteca */}
          {activeSection === 'biblioteca' && (
            <div className="space-y-6">
              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold text-white">Biblioteca Acadêmica</h3>
                    <p className="text-sm md:text-base text-slate-300 max-w-3xl">
                      Curadoria de conteúdos clínicos, guias metodológicos e bases científicas integradas aos eixos de ensino, clínica e pesquisa.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/app/library')}
                    className="px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)' }}
                  >
                    Acessar Biblioteca Completa
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {libraryCollections.map(collection => (
                  <div key={collection.id} className="rounded-xl p-4 md:p-5 text-white shadow-lg" style={{ background: `linear-gradient(145deg, rgba(7,22,41,0.92) 10%, rgba(7,22,41,0.65) 50%, rgba(7,22,41,0.92) 100%)`, border: '1px solid rgba(0,193,106,0.12)' }}>
                    <div className={`w-12 h-12 rounded-lg mb-4 bg-gradient-to-r ${collection.color} flex items-center justify-center text-white text-xl font-bold`}>📘</div>
                    <h4 className="text-lg font-semibold mb-2">{collection.title}</h4>
                    <p className="text-slate-300 text-sm mb-3">{collection.description}</p>
                    <div className="text-xs text-slate-300 mb-2">{collection.format}</div>
                    <div className="text-xs text-[#FFD33D]">{collection.highlight}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <h4 className="text-lg font-semibold text-white mb-4">Ferramentas em Destaque</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg p-4" style={cardStyle}>
                    <h5 className="font-semibold text-white mb-2">LabPEC Playlists</h5>
                    <p className="text-sm text-slate-300">Sequências de vídeos comentados das simulações clínicas com indicadores da IA.</p>
                  </div>
                  <div className="rounded-lg p-4" style={cardStyle}>
                    <h5 className="font-semibold text-white mb-2">Repositório de Protocolos</h5>
                    <p className="text-sm text-slate-300">Protocolos clínicos, formulários e listas de verificação prontos para uso em aulas e clínicas.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Avaliações */}
          {activeSection === 'avaliacao' && (
            <div className="space-y-6">
              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Instrumentos de Avaliação</h3>
                <p className="text-sm md:text-base text-slate-300">Ferramentas para acompanhamento do progresso acadêmico, avaliações formativas e certificações.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluationInstruments.map(tool => (
                  <div
                    key={tool.id}
                    className="rounded-xl p-4"
                    style={{ ...cardStyle, border: `1px solid ${tool.borderColor}` }}
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">{tool.title}</h4>
                    <p className="text-sm text-slate-300 mb-4">{tool.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-300 stack-mobile">
                      <span>Status: <strong className="text-white">{tool.status}</strong></span>
                      <span>{tool.participants} participantes</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <h4 className="text-lg font-semibold text-white mb-3">Fluxo Acadêmico AEC</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {['Diagnóstico Formativo', 'Simulação Supervisionada', 'Feedback Longitudinal', 'Certificação Final'].map((step, index) => (
                    <div key={step} className="rounded-lg p-4 flex flex-col space-y-2" style={cardStyle}>
                      <div className="text-[#FFD33D] font-semibold">Etapa {index + 1}</div>
                      <div className="text-white font-semibold">{step}</div>
                      <p className="text-xs text-slate-300">
                        {index === 0 && 'Autoavaliação e planos de desenvolvimento individual com apoio da IA.'}
                        {index === 1 && 'Role-playing no LabPEC com roteiros temáticos e observadores especializados.'}
                        {index === 2 && 'Métricas da IA combinadas ao feedback qualitativo dos mentores.'}
                        {index === 3 && 'Prova prática e apresentação de caso integrador para banca docente.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Newsletter & Eventos */}
          {activeSection === 'newsletter' && (
            <div className="space-y-6">
              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Notícias & Eventos</h3>
                <p className="text-sm md:text-base text-slate-300">Acompanhe os eventos da pós-graduação, novidades dos eixos integrados e pesquisas em destaque.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {newsletterUpdates.map(update => (
                  <div key={update.id} className="rounded-xl p-4" style={cardStyle}>
                    <div className="flex items-center justify-between mb-2 text-xs text-slate-300 stack-mobile">
                      <span className="uppercase tracking-wide text-[#FFD33D]">{update.category}</span>
                      <span>{update.date}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{update.title}</h4>
                    <p className="text-sm text-slate-300">{update.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Próxima Imersão AEC</h4>
                    <p className="text-sm text-slate-300">Inscrições abertas para a imersão intensiva de novembro com foco em entrevistas clínicas complexas.</p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{ background: 'linear-gradient(135deg, #FFD33D 0%, #FFAA00 100%)', color: '#0A192F' }}
                  >
                    Reservar Vaga
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mentoria */}
          {activeSection === 'mentoria' && (
            <div className="space-y-6">
              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Mentoria e Tutoria</h3>
                <p className="text-sm md:text-base text-slate-300">Conecte-se com o corpo docente, agende supervisões e acompanhe as agendas do LabPEC.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mentorshipPrograms.map(program => (
                  <div key={program.id} className="rounded-2xl border border-[#00C16A]/20 bg-gradient-to-br from-[#0A192F] via-[#102C45] to-[#1F4B38] p-5 shadow-xl">
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-white mb-1">{program.mentor}</h4>
                      <p className="text-sm text-emerald-400">{program.role}</p>
                    </div>
                    <div className="space-y-2 text-sm text-slate-300 mb-4">
                      <p><strong className="text-white">Disponibilidade:</strong> {program.availability}</p>
                      <p><strong className="text-white">Canal:</strong> {program.channel}</p>
                      <p><strong className="text-white">Foco:</strong> {program.focus}</p>
                    </div>
                    <button
                      onClick={() => handleRequestMentorship(program)}
                      className="mt-4 w-full px-4 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-xl"
                      style={{ background: accentGradient }}
                    >
                      Solicitar Mentoria
                    </button>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4 md:p-6" style={surfaceStyle}>
                <h4 className="text-lg font-semibold text-white mb-3">LabPEC – Agenda Semanal</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { day: 'Terça', focus: 'Entrevistas AEC – Nefrologia', time: '14h às 20h' },
                    { day: 'Quarta', focus: 'Casos Integrados Cannabis & AEC', time: '14h às 20h' },
                    { day: 'Quinta', focus: 'Supervisão de Projetos Integradores', time: '14h às 20h' },
                    { day: 'Sábado', focus: 'Workshop presencial (quinzenal)', time: '09h às 13h' }
                  ].map(slot => (
                    <div key={slot.day} className="rounded-lg p-3" style={cardStyle}>
                      <div className="text-[#FFD33D] text-sm font-semibold">{slot.day}</div>
                      <div className="text-white font-semibold">{slot.focus}</div>
                      <div className="text-xs text-slate-300">{slot.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {
        isOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 md:p-4">
            <div
              className="rounded-xl w-full max-w-md h-[90vh] max-h-[600px] flex flex-col overflow-hidden"
              style={{ background: 'rgba(7,22,41,0.95)', border: '1px solid rgba(0,193,106,0.12)', boxShadow: '0 20px 48px rgba(2,12,27,0.55)' }}
            >
              {/* Chat Header */}
              <div className="p-4" style={{ borderBottom: '1px solid rgba(0,193,106,0.12)' }}>
                <div className="flex items-center justify-between stack-mobile">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accentGradient }}>
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Nôa Esperança</h3>
                      <p className="text-xs text-slate-400">Tutora Acadêmica</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleChat}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-300 py-8">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3" style={{ color: '#00F5A0' }} />
                    <p className="text-sm">Olá! Sou a Nôa Esperança, sua tutora acadêmica.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${message.type === 'user'
                          ? 'text-white'
                          : 'text-slate-100'
                          }`}
                        style={
                          message.type === 'user'
                            ? { background: accentGradient }
                            : { background: 'rgba(12,34,54,0.72)', border: '1px solid rgba(0,193,106,0.08)' }
                        }
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(12,34,54,0.72)', border: '1px solid rgba(0,193,106,0.08)' }}>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4" style={{ borderTop: '1px solid rgba(0,193,106,0.12)' }}>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-3 py-2 rounded-lg text-white placeholder-slate-400 focus:outline-none"
                    style={{ background: 'rgba(12,34,54,0.78)', border: '1px solid rgba(0,193,106,0.18)' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: accentGradient }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal de Solicitação de Mentoria */}
      {
        selectedMentor && selectedMentor.id !== 'noa' && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div>
                  <h2 className="text-2xl font-bold text-white">Solicitar Mentoria</h2>
                  <p className="text-sm text-slate-400 mt-1">{selectedMentor.mentor}</p>
                </div>
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data da Mentoria
                  </label>
                  <input
                    type="date"
                    value={mentorshipDate}
                    onChange={(e) => {
                      const date = e.target.value
                      if (!date || isValidDateForMentor(date, selectedMentor.id)) {
                        setMentorshipDate(date)
                      } else {
                        const validDays = selectedMentor.id === 'ricardo'
                          ? ['Terça', 'Quarta', 'Quinta']
                          : ['Terça']
                        alert(`Este mentor está disponível apenas nas ${validDays.join('s e ')}s. Por favor, selecione uma data válida.`)
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Disponível: {selectedMentor.availability}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Horário
                  </label>
                  <select
                    value={mentorshipTime}
                    onChange={(e) => setMentorshipTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione um horário</option>
                    {getAvailableTimes(selectedMentor.id).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={mentorshipMessage}
                    onChange={(e) => setMentorshipMessage(e.target.value)}
                    placeholder="Descreva o que você gostaria de discutir na mentoria..."
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    <strong>Canal:</strong> {selectedMentor.channel}
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    <strong>Foco:</strong> {selectedMentor.focus}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitMentorship}
                  disabled={isSubmittingMentorship || !mentorshipDate || !mentorshipTime}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmittingMentorship ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Solicitação
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default EnsinoDashboard
