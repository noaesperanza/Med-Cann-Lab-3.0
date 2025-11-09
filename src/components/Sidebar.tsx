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
  Microscope,
  Bell,
  TrendingUp,
  Upload,
  LayoutDashboard,
  CheckCircle
} from 'lucide-react'
import { normalizeUserType, UserType } from '../lib/userTypes'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const getAxisFromPath = () => {
    if (location.pathname.includes('/clinica/')) return 'clinica'
    if (location.pathname.includes('/ensino/')) return 'ensino'
    if (location.pathname.includes('/pesquisa/')) return 'pesquisa'
    return null
  }
  const [expandedAxis, setExpandedAxis] = useState<string | null>(() => getAxisFromPath())
  const prevAxisRef = useRef<string | null>(expandedAxis)
  const normalizedType = userType ? normalizeUserType(userType) : 'paciente'

  // Notificar Layout quando sidebar colapsar/expandir
  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

  // Usar props do Layout quando disponíveis
  const mobileOpen = isMobile ? isOpen : isMobileOpen
  const setMobileOpen = isMobile ? onClose : setIsMobileOpen

  const getNavigationItems = () => {
    const adminItems = [
      // OUTROS
      { 
        name: '💬 Fórum Cann Matrix', 
        href: '/app/chat', 
        icon: MessageCircle,
        section: 'other'
      },
      { 
        name: '💰 Gestão Financeira', 
        href: '/app/professional-financial', 
        icon: BanknoteIcon,
        section: 'other'
      },
      { 
        name: '👤 Meu Perfil', 
        href: '/app/profile', 
        icon: User,
        section: 'profile'
      },
    ]

    const patientItems = [
      { name: 'Início', href: '/app/dashboard', icon: Home, section: 'main' },
      { name: '🤖 Chat NOA', href: '/app/patient-noa-chat', icon: Brain, section: 'quick' },
      { name: '📅 Agendamentos', href: '/app/patient-appointments', icon: Clock, section: 'quick' },
      { name: '💬 Chat com Meu Médico', href: '/app/patient-chat', icon: Users, section: 'quick' },
      { name: '👤 Meu Perfil', href: '/app/profile', icon: User, section: 'profile' },
    ]

    const professionalItems = [
      // OUTROS
      { 
        name: '💬 Fórum Cann Matrix', 
        href: '/app/chat', 
        icon: MessageCircle,
        section: 'other'
      },
      { 
        name: '💰 Gestão Financeira', 
        href: '/app/professional-financial', 
        icon: BanknoteIcon,
        section: 'other'
      },
      { 
        name: '👤 Meu Perfil', 
        href: '/app/profile', 
        icon: User,
        section: 'profile'
      },
    ]

    const studentItems = [
      { name: 'Dashboard', href: '/app/ensino/aluno/dashboard', icon: Home },
      { name: 'Redes Sociais', href: '/app/ensino/aluno/dashboard?section=redes-sociais', icon: Users },
      { name: 'Notícias', href: '/app/ensino/aluno/dashboard?section=noticias', icon: Bell },
      { name: 'Simulações', href: '/app/ensino/aluno/dashboard?section=simulacoes', icon: Activity },
      { name: 'Teste de Nivelamento', href: '/app/ensino/aluno/dashboard?section=teste', icon: CheckCircle },
      { name: 'Biblioteca', href: '/app/ensino/aluno/dashboard?section=biblioteca', icon: BookOpen },
      { name: 'Fórum Cann Matrix', href: '/app/ensino/aluno/dashboard?section=forum', icon: MessageCircle }
    ]

    let specificItems = []
    switch (normalizedType) {
      case 'paciente':
      case 'patient': // Compatibilidade
        specificItems = patientItems
        break
      case 'profissional':
      case 'professional': // Compatibilidade
        specificItems = professionalItems
        break
      case 'aluno':
      case 'student': // Compatibilidade
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
    { name: 'Biblioteca', href: '/app/library', icon: BookOpen, color: 'bg-green-500' },
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
  }

  const adminSections: AxisSection[] = [
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
      label: 'Base de Conhecimento',
      description: 'Protocolos, manuais e arquivos estratégicos',
      icon: BookOpen
    },
    {
      id: 'admin-renal',
      label: 'Função Renal',
      description: 'Monitoramento integrado de nefrologia',
      icon: Activity
    }
  ]

  const clinicaSections: AxisSection[] = [
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
      id: 'chat-profissionais',
      label: 'Equipe Clínica',
      description: 'Discussões entre profissionais da plataforma',
      icon: MessageCircle
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
      icon: BookOpen
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
      icon: Microscope,
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
          onClick={() => setMobileOpen?.()}
        />
      )}
      
      {/* Sidebar */}
      <div className={`bg-slate-800 text-white transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-80'
      } flex flex-col fixed left-0 top-0 z-50 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isMobile ? 'w-80' : ''}`} style={{ top: '0.1%', height: '99.9%' }}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/brain.png" 
                  alt="MedCannLab Logo" 
                  className="w-full h-full object-contain p-1"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) brightness(1.2) contrast(1.1)'
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-bold">MedCannLab</span>
                <div className="text-sm text-slate-400">3.0</div>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              const newState = !isCollapsed
              setIsCollapsed(newState)
            }}
            className="p-2 rounded-md hover:bg-slate-700 transition-colors duration-200"
          >
            {isCollapsed ? <span className="text-white">→</span> : <span className="text-white">←</span>}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {(() => {
          return normalizedType === 'profissional' || normalizedType === 'admin'
        })() ? (
          <>
            {/* Seletor de Eixos - No Topo */}
            <div className={`mb-6 pb-4 border-b border-slate-700 ${isCollapsed ? 'px-2' : ''}`}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
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

                  const combinedSections: AxisSection[] = []
                  if (normalizedType === 'admin') {
                    adminSections.forEach((section) => {
                      if (!combinedSections.some(existing => existing.id === section.id)) {
                        combinedSections.push(section)
                      }
                    })
                  }
                  axis.sections.forEach((section) => {
                    if (!combinedSections.some(existing => existing.id === section.id)) {
                      combinedSections.push(section)
                    }
                  })

                  return (
                    <div key={axis.key} className="space-y-1">
                      <Link
                        to={axis.path}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg transition-colors duration-200 ${
                          isAxisExpanded
                            ? axisActiveClasses[axis.key] || 'bg-sky-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        }`}
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
                            setMobileOpen?.()
                          }
                        }}
                        title={isCollapsed ? axis.label : ''}
                      >
                        <AxisIcon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm font-medium">{axis.label}</span>}
                      </Link>

                      {(expandedAxis === axis.key) && (
                        <div
                          className={`space-y-1 ${
                            isCollapsed ? 'ml-0 border-l border-slate-700 pl-2' : 'ml-9'
                          } transition-all`}
                        >
                          {combinedSections.map((section) => {
                            const SectionIcon = section.icon
                            const sectionIsActive = currentSection === section.id
                            const target = `${axis.path}?section=${section.id}`

                            return (
                              <Link
                                key={`${axis.key}-${section.id}`}
                                to={target}
                                className={`flex items-start ${
                                  isCollapsed ? 'justify-center px-2 py-2' : 'space-x-3 px-3 py-2'
                                } rounded-lg text-left transition-colors duration-200 ${
                                  sectionIsActive
                                    ? 'bg-sky-600/80 text-white border border-sky-500'
                                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                                }`}
                                onClick={() => isMobile && setMobileOpen?.()}
                                title={isCollapsed ? section.label : ''}
                              >
                                <SectionIcon className={`w-4 h-4 flex-shrink-0 ${sectionIsActive ? 'text-white' : 'text-slate-400'}`} />
                                {!isCollapsed && (
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{section.label}</span>
                                    <span className="text-xs text-slate-400 leading-tight">
                                      {section.description}
                                    </span>
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
            
            {/* Dashboard */}
            <div className="mb-2">
              {navigationItems
                .filter(item => (item as any).section === 'main')
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 mb-2 ${
                        isActive(item.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      onClick={() => isMobile && setMobileOpen?.()}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </Link>
                  )
                })}
            </div>


            {/* OUTROS */}
            {!isCollapsed && navigationItems.some(item => (item as any).section === 'other') && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                  Outros
                </h3>
              </div>
            )}
            <div className="space-y-1 mb-4">
              {navigationItems
                .filter(item => (item as any).section === 'other')
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      onClick={() => isMobile && setMobileOpen?.()}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </Link>
                  )
                })}
            </div>

            {/* Profile */}
            <div className="space-y-1 mt-4">
              {navigationItems
                .filter(item => (item as any).section === 'profile')
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      onClick={() => isMobile && setMobileOpen?.()}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                    </Link>
                  )
                })}
            </div>
          </>
        ) : (
          // Other user types (patient, student, admin) - default navigation
          <>
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  onClick={() => isMobile && setMobileOpen?.()}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>


      {/* System Stats */}
      {!isCollapsed && normalizedType === 'admin' && (
        <div className="p-4 border-t border-slate-700">
          <h3 className="text-base font-semibold text-slate-400 mb-4">Status do Sistema</h3>
          <div className="space-y-3">
            {systemStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{stat.label}</span>
                <span className={`font-medium ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Profile - Only for non-professional users */}
      {normalizedType !== 'profissional' && normalizedType !== 'admin' && (
        <div className="p-6 border-t border-slate-700">
          <Link
            to="/app/profile"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-sm font-medium text-white">Perfil</p>
                <p className="text-xs text-slate-400">Configurações</p>
              </div>
            )}
          </Link>
        </div>
      )}
      </div>
      
      {/* Mobile Toggle Button - apenas quando não controlado pelo Layout */}
      {!isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white p-2 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  )
}

export default Sidebar
