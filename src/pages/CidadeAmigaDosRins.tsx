import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  Gift,
  Award,
  Target,
  BarChart3,
  FileText,
  BookOpen,
  Globe,
  MessageCircle,
  FlaskConical,
  Sparkles,
  Zap,
  Download,
  Share2,
  Eye,
  Star,
  Activity,
  Bell,
  AlertCircle,
  ClipboardList,
  MessageSquarePlus,
  Layers
} from 'lucide-react'

interface ImplementationPhase {
  id: string
  title: string
  status: string
  duration: string
  progress: number
  description: string
}

// Componente para status do sistema financeiro
const SistemaFinanceiroStatus: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      // Buscar métodos de pagamento configurados (se houver tabela específica)
      // Por enquanto, vamos usar métodos padrão
      setPaymentMethods([
        'Cartões de crédito e débito',
        'Pix instantâneo',
        'Boleto bancário',
        'Escute-se Points',
        'Parcelamento em até 12x'
      ])

      // Buscar receita total (se houver transações)
      if (user) {
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('status', 'completed')

        if (transactionsData) {
          const revenue = transactionsData
            .filter(t => t.type === 'consultation' || t.type === 'course')
            .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
          setTotalRevenue(revenue)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-slate-300 text-sm mb-4">
        Carregando informações financeiras...
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-4">
      <div>
        <h5 className="text-sm font-semibold text-green-300 mb-2">Pagamentos Integrados</h5>
        <p className="text-xs text-slate-300 mb-3">Sistema completo de pagamentos com múltiplas opções</p>
        <ul className="space-y-2 text-xs text-slate-400">
          {paymentMethods.map((method, index) => (
            <li key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>{method}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="text-sm font-semibold text-green-300 mb-2">Gestão Financeira</h5>
        <p className="text-xs text-slate-300 mb-3">Controle completo das finanças da plataforma</p>
        {totalRevenue > 0 && (
          <p className="text-xs text-green-400 mb-2">
            Receita total: R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </p>
        )}
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Dashboard financeiro em tempo real</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Relatórios de receita</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Controle de assinaturas</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Gestão de reembolsos</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Análise de métricas financeiras</span>
          </li>
        </ul>
        <button
          onClick={() => navigate('/app/professional-financial')}
          className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          Acessar Dashboard Financeiro
        </button>
      </div>
    </div>
  )
}

// Componente para status de agendamento
const AgendamentoStatus: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointmentsCount, setAppointmentsCount] = useState(0)
  const [availableDoctors, setAvailableDoctors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppointmentData()
  }, [])

  const loadAppointmentData = async () => {
    try {
      // Buscar profissionais disponíveis (Dr. Ricardo Valença)
      const { data: doctorsData } = await supabase
        .from('users')
        .select('id, name, email')
        .or('email.eq.rrvalenca@gmail.com,email.eq.consultoriodosvalenca@gmail.com')
        .eq('type', 'professional')

      if (doctorsData && doctorsData.length > 0) {
        setAvailableDoctors(doctorsData.map(d => d.name || d.email))
        
        // Contar agendamentos futuros
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .in('doctor_id', doctorsData.map(d => d.id))
          .gte('appointment_date', new Date().toISOString())

        setAppointmentsCount(count || 0)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de agendamento:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-slate-300 text-sm mb-4">
        Carregando informações de agendamento...
      </div>
    )
  }

  return (
    <>
      <p className="text-slate-300 text-sm mb-4">
        {availableDoctors.length > 0 
          ? `Ativo com agenda${availableDoctors.length > 1 ? 's' : ''} disponível${availableDoctors.length > 1 ? 'eis' : ''}: ${availableDoctors.join(', ')}`
          : 'Sistema de agendamento ativo'
        }
        {appointmentsCount > 0 && (
          <span className="block mt-2 text-xs text-slate-400">
            {appointmentsCount} agendamento{appointmentsCount > 1 ? 's' : ''} futuro{appointmentsCount > 1 ? 's' : ''}
          </span>
        )}
      </p>
      <button 
        onClick={() => navigate('/app/clinica/paciente/agendamentos')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
      >
        Agendar Consulta
      </button>
    </>
  )
}

const INTEGRATED_PROTOCOL_TOPIC = 'Protocolos Clínicos Integrados - Integração Cannabis & Nefrologia'

const CidadeAmigaDosRins: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activePillar, setActivePillar] = useState<string>('introducao')
  const [protocolTab, setProtocolTab] = useState<'ativos' | 'novos'>('ativos')
  const [loading, setLoading] = useState(true)
  const [implementationPhases, setImplementationPhases] = useState<ImplementationPhase[]>([])
  const [stats, setStats] = useState({
    cities: 0,
    professionals: 0,
    patients: 0,
    riskFactors: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Buscar dados de implementação (se houver tabela específica)
      // Por enquanto, como não há dados reais, vamos usar valores zerados
      // mas deixar a estrutura pronta para quando houver dados

      // Fases de implementação - valores zerados já que não há dados reais
      const phases: ImplementationPhase[] = [
        {
          id: 'validacao',
          title: 'Validação Clínica',
          status: 'Em andamento',
          duration: '12 meses',
          progress: 0, // Zerado porque não há dados reais
          description: 'Desenvolvimento e validação da IA para análise preditiva'
        },
        {
          id: 'piloto',
          title: 'Piloto Regional',
          status: 'Iniciando',
          duration: '6 meses',
          progress: 0,
          description: 'Implementação em cidades piloto selecionadas'
        },
        {
          id: 'expansao',
          title: 'Expansão',
          status: 'Planejado',
          duration: '18 meses',
          progress: 0,
          description: 'Escalabilidade regional e publicações científicas'
        },
        {
          id: 'nacional',
          title: 'Nacional',
          status: 'Futuro',
          duration: '24 meses',
          progress: 0,
          description: 'Modelo replicável para todo o Brasil'
        }
      ]

      setImplementationPhases(phases)

      // Estatísticas - valores zerados já que não há dados reais
      setStats({
        cities: 0,
        professionals: 0,
        patients: 0,
        riskFactors: 0
      })

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const pillars = [
    { id: 'introducao', label: 'Introdução', icon: Sparkles },
    { id: 'fundamentacao', label: 'Fundamentação Clínica', icon: Heart },
    { id: 'inovacao', label: 'Inovação Tecnológica', icon: Zap },
    { id: 'seguranca', label: 'Segurança e Governança', icon: CheckCircle },
    { id: 'integracao', label: 'Integrações em Pesquisa', icon: FlaskConical },
    { id: 'impacto', label: 'Impacto em Saúde Pública', icon: Globe }
  ]

  const activeProtocols = useMemo(
    () => [
      {
        id: 'cidade-amiga',
        title: 'Cidade Amiga dos Rins • Onboarding Comunitário',
        status: 'Ativo',
        axes: ['Clínica', 'Pesquisa', 'Ensino'],
        summary:
          'Fluxo comunitário que conecta avaliação IMRE renal, estratificação de risco KDIGO e planos terapêuticos individualizados supervisionados pela pós-graduação.',
        highlights: [
          'Triagem renal guiada pela IA residente e fichas IMRE adaptadas.',
          'Integração com os módulos da pós-graduação e supervisão docente.',
          'Planos terapêuticos individualizados com monitoramento contínuo.'
        ],
        knowledgeRoute: '/app/pesquisa/profissional/cidade-amiga-dos-rins',
        forumTopic: INTEGRATED_PROTOCOL_TOPIC,
        iaPrompt:
          'Nôa, aplicar o protocolo Cidade Amiga dos Rins para uma triagem comunitária e gerar o plano terapêutico correspondente.'
      },
      {
        id: 'avaliacao-cannabis',
        title: 'Avaliação Clínica Inicial IMRE • Cannabis Medicinal',
        status: 'Ativo',
        axes: ['Clínica', 'Ensino'],
        summary:
          'Roteiro completo conduzido pela IA Residente para investigação IMRE com foco em cannabis medicinal, alimentando a base educacional e planos terapêuticos.',
        highlights: [
          'Roteiro estruturado com abertura exponencial, desenvolvimento e fechamento consensual.',
          'Geração automática do relatório clínico e NFT após validação do paciente.',
          'Base de conhecimento alinhada às diretrizes MedCannLab para cannabis medicinal.'
        ],
        knowledgeRoute: '/app/clinica/paciente/avaliacao-clinica',
        forumTopic: INTEGRATED_PROTOCOL_TOPIC,
        iaPrompt:
          'Nôa, iniciar a avaliação clínica inicial IMRE focada em cannabis medicinal e preparar o relatório para revisão.'
      },
      {
        id: 'drcteza',
        title: 'Estratificação DRC + TEZ Integrada',
        status: 'Beta Controlado',
        axes: ['Clínica', 'Pesquisa'],
        summary:
          'Ferramenta de estratificação que cruza estágios de Doença Renal Crônica e o espectro TEZ, suportando decisões clínicas e estudos observacionais.',
        highlights: [
          'Classificação automática de DRC (estágios 1-5) com parâmetros laboratoriais.',
          'Mapa de suporte TEZ para comorbidades neuropsiquiátricas associadas.',
          'Exportação de insights para protocolos de pesquisa e preceptoria.'
        ],
        knowledgeRoute: '/app/library?collection=protocolos&protocol=drcteza',
        iaPrompt:
          'Nôa, gerar a estratificação combinada DRC + TEZ para o paciente atual com base nos dados clínicos.'
      }
    ],
    []
  )

  const upcomingProtocols = useMemo(
    () => [
      {
        id: 'renal-medcannlab',
        title: 'Protocolo MedCannLab de Saúde Renal com Cannabis Medicinal',
        stage: 'Consulta Pública',
        owner: 'MedCannLab Research Hub',
        axes: ['Clínica', 'Pesquisa', 'Ensino'],
        description:
          'Evolução do Cidade Amiga dos Rins com foco em terapias canabinoides. Inclui avaliação IMRE renal, bibliografia selecionada, processos de diagnóstico DRC e TEZ, além de roteiro de plano terapêutico individualizado.',
        milestones: [
          { label: 'Revisão bibliográfica colaborativa', due: 'Novembro/2025' },
          { label: 'Oficina com preceptores e consultores', due: 'Dezembro/2025' },
          { label: 'Publicação da versão 1.0 no diretório de protocolos', due: 'Janeiro/2026' }
        ],
        knowledgeDraft: '/app/library?draft=protocolo-renal-medcannlab',
        forumTopic: INTEGRATED_PROTOCOL_TOPIC,
        iaPrompt:
          'Nôa, registrar minha contribuição no protocolo de saúde renal com cannabis medicinal do MedCannLab e listar os pontos em aberto.'
      },
      {
        id: 'onboarding-profissionais',
        title: 'Onboarding de Profissionais para Cannabis Medicinal',
        stage: 'Em elaboração',
        owner: 'Comissão Clínica • Pós-graduação Cannabis',
        axes: ['Ensino', 'Clínica'],
        description:
          'Adaptação da estrutura Cidade Amiga dos Rins para credenciar novos profissionais na plataforma, com trilhas de estudo, supervisão clínica e protocolos de segurança.',
        milestones: [
          { label: 'Mapeamento de competências e pré-requisitos', due: 'Dezembro/2025' },
          { label: 'Integração com avaliações IMRE e chat clínico', due: 'Fevereiro/2026' }
        ],
        knowledgeDraft: '/app/library?draft=onboarding-cannabis-profissionais',
        forumTopic: INTEGRATED_PROTOCOL_TOPIC,
        iaPrompt:
          'Nôa, anotar minha sugestão para o protocolo de onboarding de profissionais em cannabis medicinal e direcionar para revisão do conselho clínico.'
      }
    ],
    []
  )

  const handleViewProtocol = (route: string) => {
    if (!route) return
    navigate(route)
  }

  const handleParticipateForum = (topic: string) => {
    const params = new URLSearchParams({ tab: 'forum' })
    if (topic) {
      params.set('topic', topic)
    }
    navigate(`/app/chat?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-900 border-b border-blue-500/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              onClick={() => navigate('/app/pesquisa/profissional/dashboard')}
              className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="h-6 w-px bg-blue-400/50" />
            <div>
              <h1 className="text-2xl font-bold text-white">Primeira Aplicação Social da AEC</h1>
              <p className="text-blue-200">Cidade Amiga dos Rins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Protocolos Clínicos Integrados */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-300" />
                Protocolos Clínicos Integrados
              </h2>
              <p className="text-slate-300 text-sm md:text-base max-w-3xl">
                Conectamos os eixos clínica, ensino e pesquisa por meio de protocolos que geram avaliações IMRE, relatórios da IA residente e planos
                terapêuticos individualizados. Explore os protocolos ativos e acompanhe os que estão em construção colaborativa.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setProtocolTab('ativos')}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  protocolTab === 'ativos' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Protocolos ativos
              </button>
              <button
                onClick={() => setProtocolTab('novos')}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  protocolTab === 'novos' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Novos protocolos
              </button>
            </div>
          </div>

          {protocolTab === 'ativos' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeProtocols.map(protocol => (
                <article
                  key={protocol.id}
                  className="rounded-xl border border-blue-500/20 bg-slate-900/60 p-5 flex flex-col gap-4 shadow-md hover:border-blue-400/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-white">{protocol.title}</h3>
                      <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-200">
                        {protocol.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {protocol.axes.map(axis => (
                        <span
                          key={`${protocol.id}-${axis}`}
                          className="px-2 py-1 text-[11px] font-semibold rounded-full border border-slate-700 bg-slate-800/80 text-slate-300"
                        >
                          {axis}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{protocol.summary}</p>
                  </div>

                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {protocol.highlights.map((item, index) => (
                      <li key={`${protocol.id}-feature-${index}`} className="flex items-start gap-2">
                        <Layers className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <button
                      onClick={() => handleViewProtocol(protocol.knowledgeRoute)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Visualizar protocolo
                    </button>
                    {protocol.forumTopic && (
                      <button
                        onClick={() => handleParticipateForum(protocol.forumTopic)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-100 border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                        Contribuir no fórum
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingProtocols.map(protocol => (
                <article
                  key={protocol.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 shadow-md hover:border-blue-400/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-purple-500/20 border border-purple-400/40 text-purple-200">
                          {protocol.stage}
                        </span>
                        <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                          {protocol.owner}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{protocol.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {protocol.axes.map(axis => (
                          <span
                            key={`${protocol.id}-axis-${axis}`}
                            className="px-2 py-1 text-[11px] font-semibold rounded-full border border-slate-700 bg-slate-800/80 text-slate-300"
                          >
                            {axis}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{protocol.description}</p>
                    </div>
                    <div className="min-w-[220px] bg-slate-800/70 border border-slate-700 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-300" />
                        Próximas entregas
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {protocol.milestones.map((milestone, index) => (
                          <li key={`${protocol.id}-milestone-${index}`} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-300/70" />
                            <span>{milestone.label}</span>
                            <span className="ml-auto text-slate-500">{milestone.due}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewProtocol(protocol.knowledgeDraft)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Abrir documento base
                    </button>
                    <button
                      onClick={() => handleParticipateForum(protocol.forumTopic)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-100 border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      Participar da construção no fórum
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-8 mb-8 border border-blue-500/20">
          <div className="flex items-start space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-4">Cidade Amiga dos Rins</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                Programa pioneiro de saúde comunitária que integra tecnologia avançada e cuidado humanizado para identificação 
                de fatores de risco para doença renal crônica e onboarding de profissionais através da metodologia Arte da Entrevista Clínica.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.cities}</div>
              <div className="text-sm text-blue-200">Cidades Participantes</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">{stats.professionals}</div>
              <div className="text-sm text-blue-200">Profissionais Treinados</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">{stats.patients}</div>
              <div className="text-sm text-blue-200">Pacientes Avaliados</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">{stats.riskFactors}%</div>
              <div className="text-sm text-blue-200">Fatores de Risco Identificados</div>
            </div>
          </div>
        </div>

        {/* Pilares do Programa */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6">Pilares do Programa</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activePillar === pillar.id
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-center">{pillar.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Introdução */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">Introdução</h3>
          </div>
          
          <div className="bg-blue-900/20 rounded-lg p-6 mb-6 border border-blue-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">Componente Principal</h4>
            <p className="text-blue-100 leading-relaxed">
              35 anos de nefrologia aplicados ao desenvolvimento de cidades sustentáveis para a saúde renal. 
              A metodologia AEC integrada com Inteligência Artificial permite uma abordagem preventiva inovadora 
              para identificação precoce de fatores de risco para doença renal crônica em populações urbanas.
            </p>
          </div>

          {/* Cronograma de Implementação */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-white mb-6">Cronograma de Implementação</h4>
            {loading ? (
              <div className="text-center py-8 text-blue-200">Carregando cronograma...</div>
            ) : implementationPhases.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <p>Nenhum dado de implementação disponível no momento.</p>
                <p className="text-sm text-blue-300 mt-2">Os dados serão atualizados conforme o projeto avança.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {implementationPhases.map((phase) => {
                  const getStatusColor = (status: string) => {
                    if (status.includes('andamento')) return 'text-blue-300'
                    if (status.includes('Iniciando')) return 'text-yellow-300'
                    if (status.includes('Planejado')) return 'text-purple-300'
                    return 'text-slate-400'
                  }

                  const getProgressColor = (progress: number) => {
                    if (progress >= 50) return 'bg-blue-500'
                    if (progress >= 25) return 'bg-yellow-500'
                    if (progress > 0) return 'bg-purple-500'
                    return 'bg-slate-500'
                  }

                  const getBadgeColor = (progress: number) => {
                    if (progress >= 50) return 'bg-blue-600'
                    if (progress >= 25) return 'bg-yellow-600'
                    if (progress > 0) return 'bg-purple-600'
                    return 'bg-slate-600'
                  }

                  return (
                    <div key={phase.id} className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-lg font-semibold text-white">{phase.title}</h5>
                          <p className={`text-sm ${getStatusColor(phase.status)}`}>{phase.status} • {phase.duration}</p>
                        </div>
                        <span className={`px-3 py-1 ${getBadgeColor(phase.progress)} text-white rounded-full text-xs font-semibold`}>
                          {phase.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(phase.progress)}`}
                          style={{ width: `${phase.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-blue-200">{phase.description}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sistemas Ativos */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Sistemas Ativos</h3>
          </div>
          
          <p className="text-slate-300 mb-6">
            Sistema Financeiro & Agendamento - Plataforma completa para gestão financeira e agendamento de consultas, 
            integrando múltiplas formas de pagamento e agenda inteligente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Sistema Financeiro */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Sistema Financeiro</h4>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">Ativo</span>
              </div>
              
              <SistemaFinanceiroStatus />
            </div>

            {/* Sistema Agendamento */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Sistema Agendamento</h4>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">Ativo</span>
              </div>
              <AgendamentoStatus />
            </div>
          </div>

          {/* Programa Amores */}
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-6 border border-purple-500/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Programa Amores</h4>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">Em desenvolvimento</span>
            </div>
            <p className="text-purple-100 text-sm mb-4">
              Sistema de pontos e benefícios para fidelização
            </p>
            <ul className="space-y-2 text-xs text-purple-200">
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Pontos por atividades na plataforma</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Cashback em consultas</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Benefícios exclusivos</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Troca por serviços</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Programa de indicação</span>
              </li>
            </ul>
          </div>

          {/* Métodos de Pagamento */}
          <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
            <h4 className="text-lg font-semibold text-white mb-4">Métodos de Pagamento Disponíveis</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-xs text-slate-300">Cartão de Crédito</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <Zap className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-xs text-slate-300">Pix</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <FileText className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-xs text-slate-300">Boleto</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-xs text-slate-300">Escute-se Points</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                <div className="text-xs text-slate-300">Outros</div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Testar Sistema de Pagamento
            </button>
          </div>
        </div>

        {/* Sistema de Captação de Recursos */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Sistema de Captação de Recursos</h3>
          </div>

          <div className="bg-green-900/20 rounded-lg p-6 mb-6 border border-green-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">Modelos de Negócio Sustentável</h4>
            <p className="text-green-100 text-sm leading-relaxed mb-4">
              Estratégias de desenvolvimento sustentável alinhadas com os princípios de equidade, inovação e mobilização 
              de organizações públicas e privadas, baseadas em evidências científicas do artigo "After COP26 — Putting 
              Health and Equity at the Center of the Climate Movement".
            </p>
          </div>

          {/* Modelos de Monetização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-6 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Plataforma de Assinaturas Educacional</h4>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">Ativo</span>
              </div>
              <div className="space-y-3 mb-4">
                <p className="text-sm text-slate-300">Investimento: R$ 50.000 - R$ 200.000</p>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-slate-400">Progresso de Implementação: 85%</p>
                <p className="text-sm text-green-200">Conteúdo exclusivo sobre saúde sustentável e práticas ecológicas</p>
                <div className="bg-slate-800 rounded p-3">
                  <p className="text-xs font-semibold text-white mb-2">Benefícios Principais:</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• Receita contínua</li>
                    <li>• Disseminação de conhecimento</li>
                    <li>• Educação continuada</li>
                  </ul>
                </div>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Investir neste Modelo
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Consultoria em Sustentabilidade para Saúde</h5>
                  <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">Em desenvolvimento</span>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Marketplace Produtos Sustentáveis</h5>
                  <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs">Planejado</span>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Licenciamento de IA para Saúde Sustentável</h5>
                  <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">Em desenvolvimento</span>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Parcerias Público-Privadas</h5>
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">Ativo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-white mb-6">Assinaturas Sopro Saúde Renal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Renal Individual */}
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 border border-blue-500/20">
                <h5 className="text-xl font-semibold text-white mb-2">Renal Individual</h5>
                <div className="text-3xl font-bold text-blue-400 mb-4">R$ 100/mês</div>
                <p className="text-blue-100 text-sm mb-4">Cuidado renal personalizado para você</p>
                <ul className="space-y-3 mb-6 text-sm text-blue-200">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Acesso direto ao WhatsApp do Dr. Ricardo</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Escuta personalizada para você</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Desconto de 50% nas consultas mensais ou bimensais</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>24h diárias de acesso à Nôa Esperanza</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Monitoramento renal individualizado</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Avaliação de risco para DRC com Nôa Esperanza</span>
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Assinar Renal Individual
                </button>
              </div>

              {/* Renal Família */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border-2 border-purple-500/40 relative">
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Mais Popular
                </div>
                <h5 className="text-xl font-semibold text-white mb-2">Renal Família</h5>
                <div className="text-3xl font-bold text-purple-400 mb-4">R$ 200/mês</div>
                <p className="text-purple-100 text-sm mb-4">Proteção renal para toda a família</p>
                <ul className="space-y-3 mb-6 text-sm text-purple-200">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Contato contínuo com Dr. Ricardo</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Escuta personalizada para toda a família</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Acesso direto ao WhatsApp</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Desconto de 50% nas consultas para toda família</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>24h diárias de acesso à Nôa Esperanza</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Programa de benefícios Amores</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Plano de monitoramento familiar</span>
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Assinar Renal Família
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Implementação das Atividades */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Implementação das Atividades Alinhadas com Sustentabilidade</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Programas Educacionais */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Programas Educacionais</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Treinamento em práticas sustentáveis e equidade na saúde
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Workshops presenciais</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Seminários online</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Cursos especializados</span>
                </li>
              </ul>
            </div>

            {/* Plataforma Interação Comunitária */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Plataforma Interação Comunitária</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Discussão e troca sobre saúde e sustentabilidade
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Fóruns de discussão</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Sessões Q&A</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Grupos temáticos</span>
                </li>
              </ul>
            </div>

            {/* Pesquisa Colaborativa */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <FlaskConical className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Pesquisa Colaborativa</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Colaboração entre instituições de pesquisa e ONGs
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Conferências</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Grupos de trabalho</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Publicações conjuntas</span>
                </li>
              </ul>
            </div>

            {/* Ferramentas Monitoramento */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Ferramentas Monitoramento</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Ferramentas digitais para práticas sustentáveis
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Aplicativos móveis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Sistemas software</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Dashboards</span>
                </li>
              </ul>
            </div>

            {/* Saúde Comunitária */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Saúde Comunitária</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Programas com foco em equidade e sustentabilidade
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Organizações locais</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Serviços acessíveis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Iniciativas populares</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/40 to-blue-900/40 rounded-xl p-8 border border-blue-500/20">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Parcerias Institucionais</h3>
            <p className="text-blue-200 text-lg mb-6">
              Modelo de negócio sustentável baseado nos princípios do artigo "After COP26", 
              promovendo saúde, equidade e sustentabilidade através de parcerias estratégicas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-lg font-bold transition-colors">
              Investir na Plataforma
            </button>
            <button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-4 rounded-lg font-bold transition-colors">
              Aderir a um Plano
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold transition-colors">
              Agendar Apresentação
            </button>
          </div>
          <div className="mt-6 text-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors">
              Agendar Consulta • Avaliação Clínica Inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CidadeAmigaDosRins

