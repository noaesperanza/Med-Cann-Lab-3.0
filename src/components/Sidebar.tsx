import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  Stethoscope,
  Users,
  BarChart3,
  User,
  FileText,
  Brain,
  Clock,
  Award,
  Menu,
  Heart,
  MessageCircle,
  Calendar,
  Settings,
  Activity,
  UserPlus,
  GraduationCap,
  Search,
  Bell,
  TrendingUp,
  Upload,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Terminal as TerminalIcon,
  LogOut,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { normalizeUserType, UserType } from '../lib/userTypes'
import {
  backgroundGradient,
  accentGradient
} from '../constants/designSystem'

// Use BanknoteIcon as an alias for financial operations
const BanknoteIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
    <circle cx="12" cy="12" r="2"></circle>
    <path d="M6 12h.01M18 12h.01"></path>
  </svg>
)

interface SidebarProps {
  userType?: UserType | 'patient' | 'professional' | 'student' | 'admin' | 'unconfirmed' // Aceita ambos para compatibilidade
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
  onCollapseChange?: (isCollapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  userType = 'paciente',
  isMobile = false,
  isOpen = false,
  onClose,
  onCollapseChange
}) => {
  const { logout } = useAuth()
  const { confirm } = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    const shouldLogout = await confirm(
      'Tem certeza que deseja sair do sistema?',
      {
        title: 'Encerrar Sessão',
        type: 'danger',
        confirmText: 'Sair Agora',
        cancelText: 'Permanecer'
      }
    )

    if (shouldLogout) {
      logout()
    }
  }
  const location = useLocation()
  const getAxisFromPath = () => {
    if (location.pathname.includes('/clinica/')) return 'clinica'
    if (location.pathname.includes('/ensino/')) return 'ensino'
    if (location.pathname.includes('/pesquisa/')) return 'pesquisa'
    return null
  }
  const [expandedAxis, setExpandedAxis] = useState<string | null>(() => getAxisFromPath())
  const prevAxisRef = useRef<string | null>(expandedAxis)
  const normalizedType = (() => {
    const type = userType ? normalizeUserType(userType) : 'paciente'
    // Se for admin, mas estiver navegando em rotas de profissional (ou dashboards legados), mostrar sidebar de profissional
    if (type === 'admin' && (
      location.pathname.includes('/profissional/') ||
      location.pathname.includes('professional') ||
      location.pathname.includes('ricardo-valenca-dashboard') ||
      location.pathname.includes('eduardo-faveret-dashboard')
    )) {
      return 'profissional'
    }
    return type
  })()

  // Notificar Layout quando sidebar colapsar/expandir
  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

  // Usar props do Layout quando disponíveis
  const mobileOpen = isMobile ? isOpen : isMobileOpen
  const handleMobileToggle = () => {
    if (isMobile && onClose) {
      onClose()
    } else if (!isMobile) {
      setIsMobileOpen(!isMobileOpen)
    }
  }

  const getNavigationItems = () => {
    const adminItems = [
      {
        name: 'Terminal Administrativo',
        href: '/app/admin',
        icon: TerminalIcon,
        section: 'other',
        color: 'bg-indigo-600'
      },
      {
        name: 'Terminal de Atendimento',
        href: '/app/clinica/profissional/dashboard?section=terminal-clinico',
        icon: Stethoscope,
        section: 'other',
        color: 'bg-emerald-600'
      },
      {
        name: 'Base de Conhecimento',
        href: '/app/library',
        icon: BookOpen,
        section: 'other'
      },
      {
        name: 'Cockpit de Risco',
        href: '/app/admin?tab=risco',
        icon: Shield,
        section: 'other',
        color: 'bg-red-600'
      },
      {
        name: 'Chat Admin',
        href: '/app/admin-chat',
        icon: MessageCircle,
        section: 'other',
        color: 'bg-purple-600'
      },
      {
        name: 'Fórum Cann Matrix',
        href: '/app/chat',
        icon: MessageCircle,
        section: 'other'
      },
      {
        name: 'Gestão Financeira',
        href: '/app/patient-financial',
        icon: BanknoteIcon,
        section: 'other'
      },
    ]

    const patientItems = [
      // UX: Analytics é entrada primária; “Dashboard” (resumo antigo) fica acessível apenas por link secundário.
      { name: 'Analytics e Evolução', href: '/app/clinica/paciente/dashboard?section=analytics', icon: TrendingUp, section: 'main' },
      { name: 'Acompanhamento do Plano', href: '/app/clinica/paciente/dashboard?section=plano', icon: Activity, section: 'main' },
      { name: 'Biblioteca Personalizada', href: '/app/clinica/paciente/dashboard?section=conteudo', icon: BookOpen, section: 'main' },
      { name: 'Chat NOA', href: '/app/clinica/paciente/chat-noa', icon: Brain, section: 'quick' },
      { name: 'Agendamentos', href: '/app/clinica/paciente/agendamentos', icon: Clock, section: 'quick' },
      { name: 'Chat com Meu Médico', href: '/app/clinica/paciente/chat-profissional', icon: Users, section: 'quick' },
      { name: 'Gestão Financeira', href: '/app/patient-financial', icon: BanknoteIcon, section: 'main' },
    ]

    const professionalItems = [
      // MAIN
      {
        name: 'Meu Dashboard',
        href: '/app/professional-my-dashboard',
        icon: Home,
        section: 'main'
      },
      // OUTROS
      {
        name: 'Fórum Cann Matrix',
        href: '/app/chat',
        icon: MessageCircle,
        section: 'other'
      },
      {
        name: 'Gestão Financeira',
        href: '/app/professional-financial',
        icon: BanknoteIcon,
        section: 'other'
      },
      {
        name: 'Certificados Digitais',
        href: '/app/clinica/profissional/certificados',
        icon: Shield,
        section: 'other'
      },
    ]

    const studentItems = [
      { name: 'Meu Perfil', href: '/app/ensino/aluno/dashboard?section=perfil', icon: User },
      { name: 'Dashboard', href: '/app/ensino/aluno/dashboard?section=dashboard', icon: Home },
      { name: 'Redes Sociais', href: '/app/ensino/aluno/dashboard?section=redes-sociais', icon: Users },
      { name: 'Notícias', href: '/app/ensino/aluno/dashboard?section=noticias', icon: Bell },
      { name: 'Simulações', href: '/app/ensino/aluno/dashboard?section=simulacoes', icon: Activity },
      { name: 'Teste de Nivelamento', href: '/app/ensino/aluno/dashboard?section=teste', icon: CheckCircle },
      { name: 'Biblioteca', href: '/app/ensino/aluno/dashboard?section=biblioteca', icon: BookOpen },
      { name: 'Fórum Cann Matrix', href: '/app/chat', icon: MessageCircle }
    ]

    let specificItems = []
    switch (normalizedType) {
      case 'paciente':
        specificItems = patientItems
        break
      case 'profissional':
        specificItems = professionalItems
        break
      case 'aluno':
        specificItems = studentItems
        break
      case 'admin':
        specificItems = adminItems
        break
      default:
        specificItems = patientItems
    }

    return specificItems
  }

  useEffect(() => {
    const axisFromPath = getAxisFromPath()
    if (axisFromPath && axisFromPath !== prevAxisRef.current) {
      setExpandedAxis(axisFromPath)
    }
    prevAxisRef.current = axisFromPath
  }, [location.pathname])

  const quickActions = [
    { name: 'Arte da Entrevista', href: '/app/arte-entrevista-clinica', icon: Heart, color: 'bg-pink-500' },
    { name: 'Chat Nôa', href: '/app/chat', icon: Brain, color: 'bg-purple-500' },
    { name: 'Chat Nôa Esperança', href: '/app/chat-noa-esperanca', icon: MessageCircle, color: 'bg-purple-600' },
    { name: 'Dashboard Paciente', href: '/app/patient-dashboard', icon: BarChart3, color: 'bg-indigo-500' },
    { name: 'Conhecimento IA', href: '/app/library', icon: BookOpen, color: 'bg-green-500' },
    { name: 'Relatórios', href: '/app/reports', icon: FileText, color: 'bg-orange-500' },
  ]

  const systemStats = [
    { label: 'Sistema Online', value: '99.9%', color: 'text-green-500' },
    { label: 'Usuários Ativos', value: '1,234', color: 'text-blue-500' },
    { label: 'Avaliações Hoje', value: '156', color: 'text-purple-500' },
  ]

  const navigationItems = getNavigationItems()
  const currentSection =
    (location.search ? new URLSearchParams(location.search).get('section') : null) || ''

  type AxisSection = {
    id: string
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    href?: string
  }

  const adminSections: AxisSection[] = [
    {
      id: 'dashboard',
      label: 'Resumo Administrativo',
      description: 'Visão consolidada da plataforma',
      icon: Home,
      href: '/app/admin'
    },
    {
      id: 'admin-upload',
      label: 'Conhecimento IA Residente',
      description: 'Protocolos, manuais e arquivos estratégicos',
      icon: BookOpen,
      href: '/app/library'
    },
    {
      id: 'atendimento',
      label: 'Terminal de Atendimento',
      description: 'Estação de trabalho clínica integrada',
      icon: Stethoscope,
      href: '/app/clinica/profissional/dashboard?section=terminal-clinico'
    }
  ]

  const clinicaSections: AxisSection[] = [
    {
      id: 'atendimento',
      label: 'Terminal de Atendimento',
      description: 'Prontuário, Paciente em foco, Chat, Prescrições, Agendamentos, Governança e mais',
      icon: Stethoscope,
      href: '/app/clinica/profissional/dashboard?section=terminal-clinico'
    }
  ]

  const ensinoSections: AxisSection[] = [
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
    }
  ]

  const pesquisaSections: AxisSection[] = [
    {
      id: 'terminal',
      label: 'Terminal de Pesquisa',
      description: 'Estação de trabalho integrada',
      icon: TerminalIcon,
      href: '/app/pesquisa/profissional/dashboard'
    }
  ]

  const getAxisPath = (axisKey: string) => {
    if (normalizedType === 'aluno') {
      switch (axisKey) {
        case 'ensino':
          return '/app/ensino/aluno/dashboard'
        case 'clinica':
          return '/app/clinica/profissional/dashboard'
        case 'pesquisa':
          return '/app/pesquisa/profissional/dashboard'
        default:
          return '/app'
      }
    }
    return axisKey === 'clinica'
      ? '/app/clinica/profissional/dashboard'
      : axisKey === 'ensino'
        ? '/app/ensino/profissional/dashboard'
        : '/app/pesquisa/profissional/dashboard'
  }

  const axisConfigs = [
    {
      key: 'clinica',
      label: '🏥 Clínica',
      path: getAxisPath('clinica'),
      icon: Stethoscope,
      sections: clinicaSections
    },
    {
      key: 'ensino',
      label: '🎓 Ensino',
      path: getAxisPath('ensino'),
      icon: GraduationCap,
      sections: ensinoSections
    },
    {
      key: 'pesquisa',
      label: '🔬 Pesquisa',
      path: getAxisPath('pesquisa'),
      icon: Search,
      sections: pesquisaSections
    }
  ]

  const isActive = (target: string) => {
    if (!target) return false
    const [pathname, search] = target.split('?')
    if (search) {
      if (location.pathname !== pathname) return false
      const currentParams = new URLSearchParams(location.search)
      const targetParams = new URLSearchParams(search)
      if (targetParams.has('section')) {
        return currentParams.get('section') === targetParams.get('section')
      }
      return currentParams.toString() === targetParams.toString()
    }
    if (location.pathname === pathname) {
      if (!location.search) return true
      // Se o link não possui query, considerar ativo também quando section=dashboard
      const currentParams = new URLSearchParams(location.search)
      return currentParams.get('section') === null || currentParams.get('section') === 'dashboard'
    }
    return false
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleMobileToggle}
        />
      )}

      {/* Sidebar - Estilo do PatientSidebar - RESPONSIVO MOBILE */}
      <div className={`text-white transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 overflow-x-hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`} style={{
          background: backgroundGradient,
          top: '0.1%',
          height: '99.9%',
          // Mobile: 256px (reduzido), Desktop: 288px expandido, 112px colapsado
          width: isCollapsed ? '112px' : 'min(256px, 80vw)',  // Mobile: max 80% viewport
          maxWidth: isCollapsed ? '112px' : 'min(288px, 80vw)'
        }}>
        {/* Header - Estilo do PatientSidebar */}
        <div className={`flex items-center px-4 border-b ${isCollapsed ? 'justify-center px-2 py-4' : 'py-5'} min-h-[3.815rem] sm:min-h-[4.356rem] md:min-h-[4.905rem]`} style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} w-full`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div
                  className="w-[2.1rem] h-[2.1rem] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3a3a 100%)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 193, 106, 0.2)'
                  }}
                >
                  <img
                    src="/brain.png"
                    alt="MedCannLab Logo"
                    className="w-full h-full object-contain p-1"
                    style={{
                      filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 6px rgba(0, 193, 106, 0.6))'
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-base font-bold block truncate text-white">MedCannLab</span>
                  <div className="text-xs text-[rgba(200,214,229,0.75)]">3.0</div>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-full flex justify-center">
                <div
                  className="w-[2.625rem] h-[2.625rem] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3a3a 100%)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 193, 106, 0.2)'
                  }}
                >
                  <img
                    src="/brain.png"
                    alt="MedCannLab Logo"
                    className="w-full h-full object-contain p-1"
                    style={{
                      filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 6px rgba(0, 193, 106, 0.6))'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sino de notificações movido para o Header (ao lado do BR/idioma) */}

        {/* Navigation - Estilo do PatientSidebar */}
        <nav
          className={`flex-1 overflow-y-auto p-3 space-y-1 ${isCollapsed ? 'p-2' : ''}`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 193, 106, 0.3) rgba(7, 22, 41, 0.5)'
          }}
        >
          {(() => {
            return normalizedType === 'profissional' || normalizedType === 'admin'
          })() ? (
            <>
              {/* Meu Dashboard - Profissionais e Admin (Dr. Ricardo, Eduardo, etc.) — primeiro trigger do sidebar */}
              {(normalizedType === 'profissional' || normalizedType === 'admin') && navigationItems.some(item => (item as any).section === 'main') && (
                <div className="mb-6 pb-4 border-b" style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
                  {!isCollapsed && (
                    <h3 className="text-xs font-semibold text-[rgba(200,214,229,0.75)] uppercase tracking-wider mb-3 px-3">
                      Dashboard
                    </h3>
                  )}
                  {navigationItems
                    .filter(item => (item as any).section === 'main')
                    .map((item) => {
                      const Icon = item.icon
                      const itemIsActive = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} rounded-lg transition-all mb-1`}
                          style={{
                            ...(itemIsActive ? {
                              background: accentGradient,
                              border: '1px solid rgba(0,193,106,0.35)',
                              boxShadow: '0 4px 12px rgba(0,193,106,0.25)'
                            } : {
                              background: 'rgba(12, 34, 54, 0.6)',
                              border: '1px solid rgba(0,193,106,0.08)'
                            })
                          }}
                          onMouseEnter={(e) => {
                            if (!itemIsActive) {
                              e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!itemIsActive) {
                              e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                            }
                          }}
                          onTouchStart={(e) => {
                            if (!itemIsActive) {
                              e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                            }
                          }}
                          onTouchEnd={(e) => {
                            if (!itemIsActive) {
                              setTimeout(() => {
                                e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                              }, 150)
                            }
                          }}
                          onClick={() => isMobile && handleMobileToggle()}
                        >
                          <Icon className={`w-6 h-6 flex-shrink-0 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`} />
                          {!isCollapsed && <span className={`text-sm font-medium flex-1 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`}>{item.name}</span>}
                        </Link>
                      )
                    })}
                </div>
              )}

              {/* Seletor de Eixos - No Topo - Estilo do PatientSidebar */}
              {normalizedType !== 'admin' && (
                <div className={`mb-6 pb-4 border-b ${isCollapsed ? 'px-2' : ''}`} style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
                  {!isCollapsed && (
                    <h3 className="text-xs font-semibold text-[rgba(200,214,229,0.75)] uppercase tracking-wider mb-3 px-3">
                      Selecionar Eixo
                    </h3>
                  )}
                  <div className="space-y-2">
                    {axisConfigs.map((axis) => {
                      const AxisIcon = axis.icon
                      const isAxisActive = location.pathname.includes(`/${axis.key}/`)
                      const isAxisExpanded = expandedAxis === axis.key
                      const axisActiveClasses: Record<string, string> = {
                        clinica: 'bg-blue-600 text-white',
                        ensino: 'bg-green-600 text-white',
                        pesquisa: 'bg-purple-600 text-white'
                      }

                      // Seções combinadas para este eixo (admin nunca entra aqui, é tratado acima)
                      const combinedSections: AxisSection[] = []
                      axis.sections.forEach((section) => {
                        if (!combinedSections.some(existing => existing.id === section.id)) {
                          combinedSections.push(section)
                        }
                      })

                      return (
                        <div key={axis.key} className="space-y-1">
                          <Link
                            to={axis.path}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} rounded-lg transition-all`}
                            style={{
                              ...(isAxisExpanded ? {
                                background: accentGradient,
                                border: '1px solid rgba(0,193,106,0.35)',
                                boxShadow: '0 4px 12px rgba(0,193,106,0.25)'
                              } : {
                                background: 'rgba(12, 34, 54, 0.6)',
                                border: '1px solid rgba(0,193,106,0.08)'
                              })
                            }}
                            onMouseEnter={(e) => {
                              if (!isAxisExpanded) {
                                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isAxisExpanded) {
                                e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                              }
                            }}
                            onTouchStart={(e) => {
                              if (!isAxisExpanded) {
                                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                              }
                            }}
                            onTouchEnd={(e) => {
                              if (!isAxisExpanded) {
                                setTimeout(() => {
                                  e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                                }, 150)
                              }
                            }}
                            onClick={(event) => {
                              if (expandedAxis === axis.key) {
                                setExpandedAxis(null)
                                if (isAxisActive) {
                                  event.preventDefault()
                                }
                              } else {
                                setExpandedAxis(axis.key)
                              }
                              if (isMobile) {
                                handleMobileToggle()
                              }
                            }}
                            title={isCollapsed ? axis.label : ''}
                          >
                            <AxisIcon className={`w-5 h-5 flex-shrink-0 ${isAxisExpanded ? 'text-white' : 'text-[#C8D6E5]'}`} />
                            {!isCollapsed && <span className={`text-sm font-medium flex-1 ${isAxisExpanded ? 'text-white' : 'text-[#C8D6E5]'}`}>{axis.label}</span>}
                          </Link>

                          {(expandedAxis === axis.key) && (
                            <div
                              className={`space-y-1 ${isCollapsed ? 'ml-0 border-l pl-2' : 'ml-9'
                                } transition-all`}
                              style={{ borderColor: 'rgba(0,193,106,0.18)' }}
                            >
                              {combinedSections.map((section) => {
                                const SectionIcon = section.icon
                                const target = section.href || `${axis.path}?section=${section.id}`
                                const sectionIsActive = section.href
                                  ? location.pathname === section.href
                                  : currentSection === section.id

                                return (
                                  <Link
                                    key={`${axis.key}-${section.id}`}
                                    to={target}
                                    className={`flex items-start ${isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-left transition-all`}
                                    style={{
                                      ...(sectionIsActive ? {
                                        background: accentGradient,
                                        border: '1px solid rgba(0,193,106,0.35)',
                                        boxShadow: '0 4px 12px rgba(0,193,106,0.25)'
                                      } : {
                                        background: 'rgba(12, 34, 54, 0.6)',
                                        border: '1px solid rgba(0,193,106,0.08)'
                                      })
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!sectionIsActive) {
                                        e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                                        e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!sectionIsActive) {
                                        e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                                        e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                                      }
                                    }}
                                    onTouchStart={(e) => {
                                      if (!sectionIsActive) {
                                        e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                                        e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                                      }
                                    }}
                                    onTouchEnd={(e) => {
                                      if (!sectionIsActive) {
                                        setTimeout(() => {
                                          e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                                          e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                                        }, 150)
                                      }
                                    }}
                                    onClick={() => isMobile && handleMobileToggle()}
                                    title={isCollapsed ? section.label : ''}
                                  >
                                    <SectionIcon className={`w-5 h-5 flex-shrink-0 ${sectionIsActive ? 'text-white' : 'text-[#C8D6E5]'}`} />
                                    {!isCollapsed && (
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className={`text-sm font-medium truncate ${sectionIsActive ? 'text-white' : 'text-[#C8D6E5]'}`}>{section.label}</span>
                                      </div>
                                    )}
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}


              {/* OUTROS - Estilo do PatientSidebar */}
              {!isCollapsed && navigationItems.some(item => (item as any).section === 'other') && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-[rgba(200,214,229,0.75)] uppercase tracking-wider mb-2 px-3">
                    Outros
                  </h3>
                </div>
              )}
              <div className="space-y-1 mb-4">
                {navigationItems
                  .filter(item => (item as any).section === 'other')
                  .map((item) => {
                    const Icon = item.icon
                    const itemIsActive = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} rounded-lg transition-all`}
                        style={{
                          ...(itemIsActive ? {
                            background: accentGradient,
                            border: '1px solid rgba(0,193,106,0.35)',
                            boxShadow: '0 4px 12px rgba(0,193,106,0.25)'
                          } : {
                            background: 'rgba(12, 34, 54, 0.6)',
                            border: '1px solid rgba(0,193,106,0.08)'
                          })
                        }}
                        onMouseEnter={(e) => {
                          if (!itemIsActive) {
                            e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                            e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!itemIsActive) {
                            e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                            e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                          }
                        }}
                        onTouchStart={(e) => {
                          if (!itemIsActive) {
                            e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                            e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (!itemIsActive) {
                            setTimeout(() => {
                              e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                            }, 150)
                          }
                        }}
                        onClick={() => isMobile && handleMobileToggle()}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`} />
                        {!isCollapsed && <span className={`text-sm font-medium flex-1 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`}>{item.name}</span>}
                      </Link>
                    )
                  })}
              </div>

              {/* Profile - Estilo do PatientSidebar - Apenas para não-profissionais */}
              {normalizedType !== 'profissional' && (
                <div className="space-y-1 mt-4">
                  {navigationItems
                    .filter(item => (item as any).section === 'profile')
                    .map((item) => {
                      const Icon = item.icon
                      const itemIsActive = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} rounded-lg transition-all`}
                          style={{
                            ...(itemIsActive ? {
                              background: accentGradient,
                              border: '1px solid rgba(0,193,106,0.35)',
                              boxShadow: '0 4px 12px rgba(0,193,106,0.25)'
                            } : {
                              background: 'rgba(12, 34, 54, 0.6)',
                              border: '1px solid rgba(0,193,106,0.08)'
                            })
                          }}
                          onMouseEnter={(e) => {
                            if (!itemIsActive) {
                              e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!itemIsActive) {
                              e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                            }
                          }}
                          onTouchStart={(e) => {
                            if (!itemIsActive) {
                              e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                            }
                          }}
                          onTouchEnd={(e) => {
                            if (!itemIsActive) {
                              setTimeout(() => {
                                e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                              }, 150)
                            }
                          }}
                          onClick={() => isMobile && handleMobileToggle()}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`} />
                          {!isCollapsed && <span className={`text-sm font-medium flex-1 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`}>{item.name}</span>}
                        </Link>
                      )
                    })}
                </div>
              )}
            </>
          ) : (
            // Other user types (patient, student, admin) - default navigation - Estilo do PatientSidebar
            <>
              {navigationItems.map((item) => {
                const Icon = item.icon
                const itemIsActive = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} rounded-lg transition-all`}
                    style={{
                      ...(itemIsActive ? {
                        background: accentGradient,
                        border: '1px solid rgba(0,193,106,0.35)',
                        boxShadow: '0 4px 12px rgba(0,193,106,0.25)'
                      } : {
                        background: 'rgba(12, 34, 54, 0.6)',
                        border: '1px solid rgba(0,193,106,0.08)'
                      })
                    }}
                    onMouseEnter={(e) => {
                      if (!itemIsActive) {
                        e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!itemIsActive) {
                        e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                        e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                      }
                    }}
                    onTouchStart={(e) => {
                      if (!itemIsActive) {
                        e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (!itemIsActive) {
                        setTimeout(() => {
                          e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                          e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                        }, 150)
                      }
                    }}
                    onClick={() => isMobile && handleMobileToggle()}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`} />
                    {!isCollapsed && <span className={`text-sm font-medium flex-1 ${itemIsActive ? 'text-white' : 'text-[#C8D6E5]'}`}>{item.name}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </nav>


        {/* System Stats - Estilo do PatientSidebar (Compacto) */}
        {!isCollapsed && normalizedType === 'admin' && (
          <div className="px-2 py-1 border-t" style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
            <h3 className="text-[9px] font-semibold text-[rgba(200,214,229,0.6)] mb-1 uppercase tracking-wider">Status</h3>
            <div className="space-y-0.5">
              {systemStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center text-[10px]">
                  <span className="text-[rgba(200,214,229,0.65)] truncate pr-1">{stat.label}</span>
                  <span className={`font-medium ${stat.color} flex-shrink-0 text-[10px]`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* User Profile - Only for non-professional users - Estilo do PatientSidebar */}
        {normalizedType !== 'profissional' && normalizedType !== 'admin' && (
          <div className="p-3 border-t" style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
            <Link
              to="/app/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
              style={{
                background: 'rgba(12, 34, 54, 0.6)',
                border: '1px solid rgba(0,193,106,0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                }, 150)
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: accentGradient, boxShadow: '0 8px 20px rgba(0,193,106,0.32)' }}>
                <User className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">Perfil</p>
                  <p className="text-xs text-[rgba(200,214,229,0.75)] truncate">Configurações</p>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Animação Matrix leve - Abaixo do Suporte - Estilo do PatientSidebar */}
        {!isCollapsed && (
          <div
            className="relative overflow-hidden"
            style={{
              height: '50px',
              marginTop: '-1%',
              marginBottom: '0.5rem',
              pointerEvents: 'none',
              opacity: 0.15
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`matrix-sidebar-${i}`}
                style={{
                  position: 'absolute',
                  left: `${(i * 12.5) % 100}%`,
                  top: '-20px',
                  animation: `matrixFallSidebar ${5 + (i % 2)}s linear infinite`,
                  animationDelay: `${i * 0.25}s`,
                  color: '#00F5A0',
                  fontFamily: 'monospace',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(0, 245, 160, 0.7), 0 0 12px rgba(0, 245, 160, 0.5)',
                  whiteSpace: 'nowrap',
                  letterSpacing: '2px',
                  zIndex: 0
                }}
              >
                MedCannLab
              </div>
            ))}
            <style>{`
            @keyframes matrixFallSidebar {
              0% {
                transform: translateY(-40px);
                opacity: 0;
              }
              10% {
                opacity: 0.3;
              }
              50% {
                opacity: 0.3;
              }
              90% {
                opacity: 0.3;
              }
              100% {
                transform: translateY(80px);
                opacity: 0;
              }
            }
          `}</style>
          </div>
        )}

        {/* Botão Sair - Acima do Reduzir */}
        <div className="px-3 pb-2">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all group`}
            style={{
              background: 'rgba(239, 68, 68, 0.1)', // Red tint background
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'
            }}
            title={isCollapsed ? 'Sair do Sistema' : ''}
          >
            <LogOut className="w-5 h-5 text-red-400 flex-shrink-0 group-hover:text-red-300" />
            {!isCollapsed && <span className="text-sm font-medium text-red-400 group-hover:text-red-300 flex-1 text-left">Sair</span>}
          </button>
        </div>

        {/* Botão para colapsar/expandir - Estilo do PatientSidebar */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
          <button
            onClick={() => {
              const newState = !isCollapsed
              setIsCollapsed(newState)
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all`}
            style={{
              background: 'rgba(12, 34, 54, 0.6)',
              border: '1px solid rgba(0,193,106,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
              e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
            }}
            title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-[#00F5A0] flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 text-[#C8D6E5] flex-shrink-0" />
                <span className="text-sm font-medium text-[#C8D6E5] flex-1">Reduzir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button - Estilo do PatientSidebar */}
      {!isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden text-white p-2 rounded-md transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          style={{
            background: 'rgba(12, 34, 54, 0.6)',
            border: '1px solid rgba(0,193,106,0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
            e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
          }}
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
    </>
  )
}

export default Sidebar
