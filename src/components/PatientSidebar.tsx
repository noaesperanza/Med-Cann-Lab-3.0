import React from 'react'
import {
  Calendar,
  MessageCircle,
  Heart,
  BookOpen,
  Shield,
  ArrowRight,
  Loader2,
  Stethoscope,
  Brain,
  Zap,
  Target,
  GraduationCap,
  FileText,
  User,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity
} from 'lucide-react'
import {
  backgroundGradient,
  surfaceStyle,
  accentGradient,
  secondaryGradient,
  goldenGradient
} from '../constants/designSystem'

interface PatientSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  user?: { name?: string | null; id?: string | null }
  activeCard: string | null
  onCardClick: (cardId: string) => void
  chatLoading?: boolean
  therapeuticPlan?: { progress: number } | null
  patientPrescriptionsLoading?: boolean
  totalPrescriptions?: number
  activePrescriptions?: Array<{ id: string; title: string; rationality?: string | null }>
  latestClinicalReport?: { status: string; generated_at?: string } | null
  onScheduleAppointment: () => void
  onOpenChat: () => void
  onOpenPlan: () => void
  onViewEducational: () => void
  onViewAnalytics?: () => void
  onViewAppointments?: () => void
  onShareReport?: () => void
  onStartAssessment?: () => void
  onViewProfile?: () => void
  onReportProblem?: () => void
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  user,
  activeCard,
  onCardClick,
  chatLoading = false,
  therapeuticPlan,
  patientPrescriptionsLoading = false,
  totalPrescriptions = 0,
  activePrescriptions = [],
  latestClinicalReport,
  onScheduleAppointment,
  onOpenChat,
  onOpenPlan,
  onViewEducational,
  onViewAnalytics,
  onViewAppointments,
  onShareReport,
  onStartAssessment,
  onViewProfile,
  onReportProblem
}) => {
  const getReportStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho'
      case 'completed':
        return 'Concluído'
      case 'reviewed':
        return 'Revisado'
      default:
        return 'Em andamento'
    }
  }

  const cards = [
    {
      id: 'agendar-consulta',
      title: 'Agendar Consulta',
      subtitle: '📅 Agendar Consulta',
      description: 'Agende sua consulta com profissionais especializados em cannabis medicinal e cuidado renal',
      icon: Calendar,
      onClick: () => {
        onCardClick('agendar-consulta')
        onScheduleAppointment()
      },
      accent: 'primary'
    },
    {
      id: 'chat-medico',
      title: 'Chat com Médico',
      subtitle: chatLoading ? '🔄 Abrindo chat...' : '💬 Chat com Médico',
      description: 'Comunicação direta com seu profissional de saúde. Tire dúvidas e receba orientações',
      icon: MessageCircle,
      onClick: () => {
        onCardClick('chat-medico')
        onOpenChat()
      },
      disabled: chatLoading,
      accent: 'primary'
    },
    {
      id: 'plano-terapeutico',
      title: 'Plano terapêutico',
      subtitle: 'Acompanhamento do plano',
      description: patientPrescriptionsLoading
        ? 'Carregando suas prescrições integrativas...'
        : totalPrescriptions > 0
          ? `Você possui ${activePrescriptions.length} prescrição(ões) ativa(s) entre ${totalPrescriptions} registrada(s).`
          : 'Nenhuma prescrição ativa no momento. Complete a avaliação clínica para receber um plano terapêutico personalizado.',
      icon: Heart,
      onClick: () => {
        onCardClick('plano-terapeutico')
        onOpenPlan()
      },
      progress: therapeuticPlan?.progress,
      accent: 'primary'
    },
    {
      id: 'conteudo-educacional',
      title: 'Conteúdo educativo',
      subtitle: 'Biblioteca personalizada',
      description: 'Acesse vídeos, guias e artigos selecionados pela equipe clínica para apoiar seu tratamento integrado.',
      icon: BookOpen,
      onClick: () => {
        onCardClick('conteudo-educacional')
        onViewEducational()
      },
      accent: 'sky',
      badges: [
        { icon: GraduationCap, label: 'Trilhas guiadas' },
        { icon: FileText, label: 'Protocolos clínicos' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Evolução',
      subtitle: 'Acompanhe seu progresso',
      description: 'Visualize sua evolução clínica, adesão ao tratamento e histórico de avaliações em gráficos detalhados.',
      icon: BarChart3,
      onClick: () => {
        onCardClick('analytics')
        if (onViewAnalytics) onViewAnalytics()
      },
      accent: 'emerald',
      badges: [
        { icon: Activity, label: 'Evolução' }
      ]
    },
    {
      id: 'relatorio-clinico',
      title: 'Relatório clínico',
      subtitle: latestClinicalReport ? 'Compartilhe com sua equipe' : 'Gerar relatório inicial',
      description: latestClinicalReport
        ? 'A IA residente gera seu relatório clínico com base na avaliação inicial. Compartilhe com o profissional quando estiver pronto.'
        : 'Comece sua jornada com a avaliação clínica inicial aplicada pela IA residente e gere o relatório base do eixo clínica.',
      icon: Shield,
      onClick: () => {
        onCardClick('relatorio-clinico')
        if (latestClinicalReport && onShareReport) {
          onShareReport()
        } else if (onStartAssessment) {
          onStartAssessment()
        }
      },
      accent: 'purple',
      status: latestClinicalReport ? getReportStatusLabel(latestClinicalReport.status) : null,
      date: latestClinicalReport?.generated_at
    }
  ]

  return (
    <div
      className="w-full flex flex-col h-full overflow-y-auto"
      style={{
        background: backgroundGradient,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0, 193, 106, 0.3) rgba(7, 22, 41, 0.5)'
      }}
    >
      {/* Logo e Nome MedCannLab - Alinhado com o header */}
      <div className={`flex items-center px-4 border-b ${isCollapsed ? 'justify-center px-2 py-4' : 'py-5'} min-h-[3.815rem] sm:min-h-[4.356rem] md:min-h-[4.905rem]`} style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
          <div
            className={`${isCollapsed ? 'w-[2.625rem] h-[2.625rem]' : 'w-[2.1rem] h-[2.1rem]'} rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0`}
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
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-base font-bold block truncate text-white">MedCannLab</span>
              <div className="text-xs text-[rgba(200,214,229,0.75)]">3.0</div>
            </div>
          )}
        </div>
      </div>

      {/* Header Compacto - Informações do Paciente */}
      <div className={`p-4 ${isCollapsed ? 'p-2' : ''} relative`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div
            className={`${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
            style={{ background: accentGradient, boxShadow: '0 8px 20px rgba(0,193,106,0.32)' }}
          >
            <span className="text-white font-bold text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'P'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 pr-8">
              <p className="font-semibold text-white text-sm truncate">{user?.name || 'Paciente'}</p>
              <p className="text-xs text-[rgba(200,214,229,0.75)]">Paciente</p>
            </div>
          )}
        </div>
      </div>

      {/* Navegação Compacta */}
      <div className={`flex-1 p-3 space-y-1 ${isCollapsed ? 'p-2' : ''}`}>
        {cards.map((card) => {
          const Icon = card.icon
          const isActive = activeCard === card.id

          return (
            <button
              key={card.id}
              onClick={card.onClick}
              disabled={card.disabled}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} rounded-lg text-left transition-all`}
              style={{
                ...(isActive ? {
                  background: accentGradient,
                  border: '1px solid rgba(0,193,106,0.35)',
                  boxShadow: '0 4px 12px rgba(0,193,106,0.25)'
                } : {
                  background: 'rgba(12, 34, 54, 0.6)',
                  border: '1px solid rgba(0,193,106,0.08)'
                }),
                ...(card.disabled ? { opacity: 0.6, cursor: 'not-allowed' } : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive && !card.disabled) {
                  e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !card.disabled) {
                  e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                }
              }}
              onTouchStart={(e) => {
                if (!isActive && !card.disabled) {
                  e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                }
              }}
              onTouchEnd={(e) => {
                if (!isActive && !card.disabled) {
                  setTimeout(() => {
                    e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
                    e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                  }, 150)
                }
              }}
              title={isCollapsed ? card.title : undefined}
            >
              <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-6 h-6'} flex-shrink-0 ${isActive ? 'text-white' : 'text-[#C8D6E5]'}`} />
              {!isCollapsed && (
                <>
                  <span className={`text-sm font-medium flex-1 ${isActive ? 'text-white' : 'text-[#C8D6E5]'}`}>
                    {card.title}
                  </span>
                  {card.progress !== undefined && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: 'rgba(0, 193, 106, 0.2)',
                        color: '#00F5A0'
                      }}
                    >
                      {card.progress}%
                    </span>
                  )}
                  {card.status && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: 'rgba(0, 193, 106, 0.2)',
                        color: '#00F5A0'
                      }}
                    >
                      {card.status}
                    </span>
                  )}
                  {chatLoading && card.id === 'chat-medico' && (
                    <Loader2 className="w-4 h-4 animate-spin text-[#C8D6E5] flex-shrink-0" />
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Animação Matrix leve - Abaixo do Suporte */}
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

      {/* Botão para colapsar/expandir - Posicionado abaixo do Suporte */}
      {onToggleCollapse && (
        <div className="p-3 border-t" style={{ borderColor: 'rgba(0,193,106,0.18)' }}>
          <button
            onClick={onToggleCollapse}
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
      )}
    </div>
  )
}

export default PatientSidebar
